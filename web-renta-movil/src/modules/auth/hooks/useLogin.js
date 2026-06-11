import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../../services/authService'
import { useAuthStore } from '../../../store/authStore'

const MAX_INTENTOS = 3

export function useLogin() {
  const navigate = useNavigate()
  const storeLogin = useAuthStore((s) => s.login)
  const iniciar2FA = useAuthStore((s) => s.iniciar2FA)

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mostrarPass, setMostrarPass] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [intentos, setIntentos] = useState(0)
  const [bloqueado, setBloqueado] = useState(false)
  const [errores, setErrores] = useState({ correo: '', contrasena: '', general: '' })
  const [exito, setExito] = useState('')

  const validarCorreo = (valor) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!valor) return 'El correo es obligatorio'
    if (!regex.test(valor)) return 'Formato de correo inválido'
    return ''
  }

  const validarFormulario = () => {
    const nuevos = {
      correo: validarCorreo(correo),
      contrasena: !contrasena ? 'La contraseña es obligatoria' : '',
      general: '',
    }

    setErrores(nuevos)
    return !nuevos.correo && !nuevos.contrasena
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setExito('')

    if (bloqueado) {
      setErrores((prev) => ({
        ...prev,
        general: 'Cuenta bloqueada. Usa ¿Olvidaste tu contraseña?',
      }))
      return
    }

    if (!validarFormulario()) return

    setCargando(true)
    setErrores({ correo: '', contrasena: '', general: '' })

    try {
      const datos = await authService.login({
        correo,
        contrasena,
      })

      if (datos.requiere2FA) {
        iniciar2FA(datos.sesionTemporal)
        navigate('/verificar-2fa')
        return
      }

      storeLogin(datos.token, {
        correo,
        nombre: datos.nombre,
        rol: datos.rol,
      })

      setExito('¡Acceso exitoso! Redirigiendo...')

      setTimeout(() => {
        navigate(datos.rol === 'administrador' ? '/admin' : '/home')
      }, 1000)
    } catch (error) {
      const nuevosIntentos = intentos + 1
      setIntentos(nuevosIntentos)

      if (nuevosIntentos >= MAX_INTENTOS) {
        setBloqueado(true)
        setErrores((prev) => ({
          ...prev,
          general: `Cuenta bloqueada tras ${MAX_INTENTOS} intentos fallidos.`,
        }))
      } else {
        setErrores((prev) => ({
          ...prev,
          general: `Credenciales incorrectas. Intentos restantes: ${MAX_INTENTOS - nuevosIntentos}`,
        }))
      }
    } finally {
      setCargando(false)
    }
  }

  const handleCorreoChange = (valor) => {
    setCorreo(valor)
    if (errores.correo) {
      setErrores((prev) => ({ ...prev, correo: validarCorreo(valor) }))
    }
  }

  return {
    correo,
    contrasena,
    mostrarPass,
    cargando,
    intentos,
    bloqueado,
    errores,
    exito,
    setContrasena,
    setMostrarPass,
    handleCorreoChange,
    handleSubmit,
    MAX_INTENTOS,
  }
}