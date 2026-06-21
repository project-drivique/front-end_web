import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '../../../services/authService'
import { adminService } from '../../../services/adminService'
import { useAuthStore } from '../../../store/authStore'

const MAX_INTENTOS = 3

export function useLogin() {
  const { t } = useTranslation()
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
    if (!valor) return t('login.errors.emailRequired')
    if (!regex.test(valor)) return t('login.errors.emailInvalid')
    return ''
  }

  const validarFormulario = () => {
    const nuevos = {
      correo: validarCorreo(correo),
      contrasena: !contrasena ? t('login.errors.passwordRequired') : '',
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
        general: t('login.errors.accountLocked'),
      }))
      return
    }

    if (!validarFormulario()) return

    setCargando(true)
    setErrores({ correo: '', contrasena: '', general: '' })

    try {
      const servicio = correo.trim().toLowerCase() === 'admin@drivique.com' ? adminService.login : authService.login
      const datos = await servicio({ correo, contrasena })

      if (datos.requiere2FA) {
        iniciar2FA(datos.sesionTemporal)
        navigate('/verificar-2fa')
        return
      }

      storeLogin(datos.token, {
        correo: datos.correo || correo,
        nombre: datos.nombre,
        apellido: datos.apellido,
        rol: datos.rol,
        telefono: datos.telefono,
        cedula: datos.cedula,
        fechaNacimiento: datos.fechaNacimiento,
      })

      setExito(t('login.successRedirecting'))

      setTimeout(() => {
        navigate(datos.rol === 'administrador' ? '/admin' : '/home')
      }, 1000)
    } catch {
      const nuevosIntentos = intentos + 1
      setIntentos(nuevosIntentos)

      if (nuevosIntentos >= MAX_INTENTOS) {
        setBloqueado(true)
        setErrores((prev) => ({
          ...prev,
          general: t('login.errors.maxAttemptsReached', { max: MAX_INTENTOS }),
        }))
      } else {
        setErrores((prev) => ({
          ...prev,
          general: t('login.errors.invalidCredentials', { remaining: MAX_INTENTOS - nuevosIntentos }),
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