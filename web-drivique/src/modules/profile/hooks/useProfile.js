import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../../store/authStore'
import { userService } from '../../../services/userService'

export function usePerfil() {
  const { t } = useTranslation()
  const { usuario, actualizarUsuario } = useAuthStore()
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
    nacionalidad: usuario?.nacionalidad || '',
    tipoDocumento: usuario?.tipoDocumento || '',
  })

  const [errores, setErrores] = useState({})
  const [correoAnterior, setCorreoAnterior] = useState(usuario?.correo || '')

  const esPerfilIncompleto = !(
    usuario?.nombre?.trim() &&
    usuario?.apellido?.trim() &&
    usuario?.cedula?.trim() &&
    usuario?.telefono?.trim()
  )

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
      e.nombre = t('perfil.errors.nameRequired', 'El nombre completo es obligatorio')
    } else if (formData.nombre.trim().length < 2) {
      e.nombre = t('perfil.errors.nameTooShort', 'El nombre debe tener al menos 2 caracteres')
    }

    if (!formData.apellido.trim()) {
      e.apellido = t('perfil.errors.lastnameRequired', 'Los apellidos completos son obligatorios')
    } else if (formData.apellido.trim().length < 2) {
      e.apellido = t('perfil.errors.lastnameTooShort', 'El apellido debe tener al menos 2 caracteres')
    }

    if (!formData.cedula.trim()) {
      e.cedula = t('perfil.errors.docRequired', 'El número de documento es obligatorio')
    } else if (!/^\d{6,12}$/.test(formData.cedula.trim())) {
      e.cedula = t('perfil.errors.docInvalid', 'El documento debe contener entre 6 y 12 números')
    }

    if (!formData.tipoDocumento) {
      e.tipoDocumento = t('perfil.errors.docTypeRequired', 'Selecciona el tipo de documento')
    }

    if (!formData.nacionalidad) {
      e.nacionalidad = t('perfil.errors.nationalityRequired', 'Selecciona tu nacionalidad')
    }

    if (!formData.telefono.trim()) {
      e.telefono = t('perfil.errors.phoneRequired', 'El número de teléfono es obligatorio')
    } else if (!/^\d{7,15}$/.test(formData.telefono.replace(/\D/g, ''))) {
      e.telefono = t('perfil.errors.phoneInvalid', 'El teléfono debe tener entre 7 y 15 dígitos')
    }

    if (!formData.fechaNacimiento) {
      e.fechaNacimiento = t('perfil.errors.birthDateRequired', 'La fecha de nacimiento es obligatoria')
    } else {
      const hoy = new Date()
      const nac = new Date(formData.fechaNacimiento)
      let edad = hoy.getFullYear() - nac.getFullYear()
      const m = hoy.getMonth() - nac.getMonth()
      if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
        edad--
      }
      if (edad < 18) {
        e.fechaNacimiento = t('perfil.errors.under18', 'Debes ser mayor de 18 años')
      }
    }

    const correoNuevo = formData.correo.toLowerCase()
    if (correoNuevo !== correoAnterior.toLowerCase()) {
      const rxCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!rxCorreo.test(correoNuevo)) {
        e.correo = t('perfil.errors.emailInvalid', 'Formato de correo inválido')
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
        || t('perfil.errors.currentPasswordWrong')
      setErrorVerificacion(msg)
    } finally {
      setCargandoVerificacion(false)
    }
  }

  const _guardarCambios = async () => {
    setCargando(true)
    setError('')
    try {
      const correoNuevo = formData.correo.toLowerCase()
      const datosActualizados = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        telefono: formData.telefono.trim(),
        cedula: formData.cedula.trim(),
        nacionalidad: formData.nacionalidad,
        tipoDocumento: formData.tipoDocumento,
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
        || t('perfil.errors.updateFailed')
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
          setErrores({ correo: t('perfil.errors.emailTaken') })
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
      nacionalidad: usuario?.nacionalidad || '',
      tipoDocumento: usuario?.tipoDocumento || '',
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
    esPerfilIncompleto,
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
