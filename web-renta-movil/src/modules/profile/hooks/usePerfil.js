import { useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { userService } from '../../../services/userService'

export function usePerfil() {
  const { usuario, token, actualizarUsuario } = useAuthStore()
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')
  const [modoEdicion, setModoEdicion] = useState(false)
  const [requiereVerificacion, setRequiereVerificacion] = useState(false)
  const [errorVerificacion, setErrorVerificacion] = useState('')
  const [cargandoVerificacion, setCargandoVerificacion] = useState(false)

  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    apellido: usuario?.apellido || '',
    telefono: usuario?.telefono || '',
    correo: usuario?.correo || '',
    cedula: usuario?.cedula || '',
    fechaNacimiento: usuario?.fechaNacimiento || '',
  })

  const [errores, setErrores] = useState({})
  const [correoAnterior, setCorreoAnterior] = useState(usuario?.correo || '')

  const actualizarCampo = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) {
      setErrores(prev => {
        const nuevos = { ...prev }
        delete nuevos[campo]
        return nuevos
      })
    }
  }

  const validarFormulario = () => {
    const e = {}

    if (!formData.nombre.trim()) {
      e.nombre = 'El nombre es obligatorio'
    } else if (formData.nombre.trim().length > 100) {
      e.nombre = 'El nombre no puede exceder 100 caracteres'
    }

    if (!formData.apellido.trim()) {
      e.apellido = 'El apellido es obligatorio'
    } else if (formData.apellido.trim().length > 100) {
      e.apellido = 'El apellido no puede exceder 100 caracteres'
    }

    if (formData.telefono && !/^\d{7,15}$/.test(formData.telefono.replace(/\D/g, ''))) {
      e.telefono = 'El teléfono debe tener entre 7 y 15 dígitos'
    }

    const correoNuevo = formData.correo.toLowerCase()
    if (correoNuevo !== correoAnterior.toLowerCase()) {
      const rxCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!rxCorreo.test(correoNuevo)) {
        e.correo = 'Formato de correo inválido'
      }
    }

    return e
  }

  const handleVerificarContrasena = async (contrasena) => {
    setCargandoVerificacion(true)
    setErrorVerificacion('')
    try {
      await userService.verificarContrasena(contrasena)
      setRequiereVerificacion(false)
      await _guardarCambios(true)
    } catch (err) {
      const msg = err?.response?.data?.mensaje
        || err?.response?.data?.message
        || err?.message
        || 'Contraseña incorrecta'
      setErrorVerificacion(msg)
    } finally {
      setCargandoVerificacion(false)
    }
  }

  const _guardarCambios = async (correoYaVerificado = false) => {
    setCargando(true)
    setError('')
    try {
      const correoNuevo = formData.correo.toLowerCase()
      const datosActualizados = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        telefono: formData.telefono.trim(),
        fechaNacimiento: formData.fechaNacimiento,
        ...(correoNuevo !== correoAnterior.toLowerCase() && { correo: correoNuevo }),
      }

      await userService.actualizarPerfil(datosActualizados)
      actualizarUsuario(datosActualizados)
      setCorreoAnterior(correoNuevo)
      setExito(true)
      setModoEdicion(false)
      setRequiereVerificacion(false)

      setTimeout(() => setExito(false), 3000)
    } catch (err) {
      const msg = err?.response?.data?.mensaje
        || err?.response?.data?.message
        || err?.message
        || 'No se pudo actualizar el perfil'
      setError(msg)
    } finally {
      setCargando(false)
    }
  }

  const handleGuardar = async () => {
    const validacionErrores = validarFormulario()
    if (Object.keys(validacionErrores).length > 0) {
      setErrores(validacionErrores)
      return
    }

    const correoNuevo = formData.correo.toLowerCase()

    if (correoNuevo !== correoAnterior.toLowerCase()) {
      try {
        await userService.verificarCorreoDisponible(correoNuevo)
      } catch (err) {
        if (err?.response?.status === 409) {
          setErrores({ correo: 'Este correo ya está registrado' })
          return
        }
      }

      setRequiereVerificacion(true)
      return
    }

    await _guardarCambios()
  }

  const handleCancelar = () => {
    setFormData({
      nombre: usuario?.nombre || '',
      apellido: usuario?.apellido || '',
      telefono: usuario?.telefono || '',
      correo: usuario?.correo || '',
      cedula: usuario?.cedula || '',
      fechaNacimiento: usuario?.fechaNacimiento || '',
    })
    setErrores({})
    setError('')
    setModoEdicion(false)
    setRequiereVerificacion(false)
    setErrorVerificacion('')
  }

  const habilitarEdicion = () => {
    setModoEdicion(true)
  }

  return {
    formData,
    errores,
    cargando,
    exito,
    error,
    modoEdicion,
    requiereVerificacion,
    errorVerificacion,
    cargandoVerificacion,
    actualizarCampo,
    handleGuardar,
    handleCancelar,
    habilitarEdicion,
    handleVerificarContrasena,
  }
}
