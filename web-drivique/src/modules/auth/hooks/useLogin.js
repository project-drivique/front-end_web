import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '../../../services/authService'
import { useAuthStore } from '../../../store/authStore'
import { getRoleHome } from '../utils/accessControl'

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
  const [bloqueadoHasta, setBloqueadoHasta] = useState(0)
  const [errores, setErrores] = useState({ correo: '', contrasena: '', general: '' })
  const [exito, setExito] = useState('')
  const bloqueado = Boolean(bloqueadoHasta)

  useEffect(() => {
    if (!bloqueadoHasta) return undefined
    const timeout = setTimeout(() => {
      setBloqueadoHasta(0)
      setIntentos(0)
      setErrores((prev) => ({ ...prev, general: '' }))
    }, Math.max(0, bloqueadoHasta - Date.now()))
    return () => clearTimeout(timeout)
  }, [bloqueadoHasta])

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
      const datos = await authService.login({ correo, contrasena })

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
        activo: datos.activo,
        permisos: datos.permisos,
        sucursalId: datos.sucursalId,
      })

      setExito(t('login.successRedirecting'))

      setTimeout(() => {
        navigate(getRoleHome(datos.rol))
      }, 1000)
    } catch (error) {
      const status = error?.response?.status
      const data = error?.response?.data || {}

      if (status === 403) {
        setErrores((prev) => ({ ...prev, general: t('login.errors.accessDenied') }))
        return
      }

      const nuevosIntentos = intentos + 1
      setIntentos(nuevosIntentos)

      if (status === 429) {
        setBloqueadoHasta(data.bloqueadoHasta || Date.now() + 5 * 60 * 1000)
        setErrores((prev) => ({
          ...prev,
          general: t('login.errors.temporaryLock', { minutes: 5 }),
        }))
      } else {
        setErrores((prev) => ({
          ...prev,
          general: t('login.errors.invalidCredentials', { remaining: data.restantes ?? Math.max(0, MAX_INTENTOS - nuevosIntentos) }),
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
