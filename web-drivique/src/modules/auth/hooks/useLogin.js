import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '../../../services/authService'
import { useAuthStore } from '../../../store/authStore'
import { getRoleHome } from '../utils/accessControl'

const MAX_INTENTOS = 3

export function useLogin() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const storeLogin = useAuthStore((s) => s.login)
  const iniciar2FA = useAuthStore((s) => s.iniciar2FA)
  const iniciarVerificacionCorreo = useAuthStore((s) => s.iniciarVerificacionCorreo)

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mostrarPass, setMostrarPass] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [intentos, setIntentos] = useState(0)
  const [bloqueadoHasta, setBloqueadoHasta] = useState(0)
  const [errores, setErrores] = useState({ correo: '', contrasena: '', general: '', titulo: '' })
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
    setErrores({ correo: '', contrasena: '', general: '', titulo: '' })

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
        roles: datos.roles || [],
        telefono: datos.telefono,
        cedula: datos.cedula,
        fechaNacimiento: datos.fechaNacimiento,
        activo: datos.activo,
        permisos: datos.permisos,
        sucursalId: datos.sucursalId,
        sucursalAsignada: datos.sucursalAsignada,
        sucursal: datos.sucursal,
      })

      setExito(t('login.successRedirecting'))

      setTimeout(() => {
        const redirect = searchParams.get('redirect')
        const isManagement = datos.rol === 'encargado_sucursal' ||
          datos.rol === 'administrador' ||
          datos.rol === 'admin' ||
          datos.rol === 'branch_manager' ||
          (Array.isArray(datos.roles) && (datos.roles.includes('BRANCH_ADMIN') || datos.roles.includes('SUPER_ADMIN') || datos.roles.includes('ADMIN')))

        const destino = isManagement
          ? (redirect?.startsWith('/admin') || redirect?.startsWith('/encargado') ? redirect : getRoleHome(datos.rol))
          : (redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : getRoleHome(datos.rol))
        navigate(destino, { replace: true })
      }, 1000)
    } catch (error) {
      const status = error?.response?.status
      const data = error?.response?.data || {}
      // El servidor entrega un código estable por cada caso: el mensaje se arma aquí, en el idioma de la persona
      const code = data.errors?.[0]?.code || ''
      const meta = data.meta || {}

      if (!error?.response) {
        setErrores((prev) => ({ ...prev, general: t('login.errors.network') }))
        return
      }

      if (code === 'ACCOUNT_NOT_FOUND' || status === 404) {
        setErrores((prev) => ({
          ...prev,
          correo: t('login.errors.accountNotFound'),
          // Además del aviso bajo el campo, un modal claro
          titulo: t('login.errors.accountNotFoundTitle'),
          general: t('login.errors.accountNotFound'),
        }))
        return
      }

      if (code === 'INVALID_PASSWORD') {
        setIntentos((n) => n + 1)
        const mensaje = meta.remainingAttempts !== undefined
          ? t('login.errors.wrongPassword', { remaining: meta.remainingAttempts })
          : t('login.errors.wrongPasswordSimple')
        setErrores((prev) => ({ ...prev, contrasena: mensaje, titulo: t('login.errors.wrongPasswordTitle'), general: mensaje }))
        return
      }

      if (code === 'ACCOUNT_LOCKED' || status === 423 || status === 429) {
        const minutes = Number(meta.lockedMinutes) || 30
        setBloqueadoHasta(Date.now() + minutes * 60 * 1000)
        setErrores((prev) => ({ ...prev, general: t('login.errors.temporaryLock', { minutes }) }))
        return
      }

      if (code === 'ACCOUNT_DISABLED') {
        setErrores((prev) => ({ ...prev, general: t('login.errors.accountDisabled') }))
        return
      }

      if (status === 403 || status === 401) {
        if (code === 'EMAIL_NOT_VERIFIED' || data.errorCode === 'USER_NOT_VERIFIED' || data.detail?.includes('verifi') || data.message?.includes('verifi') || data.message === 'User is not verified') {
          iniciarVerificacionCorreo(correo, { contrasena })
          authService.enviarCodigoVerificacion(correo).catch(console.error)
          navigate('/verificar-correo')
          return
        }
        setErrores((prev) => ({ ...prev, general: t('login.errors.accessDenied') }))
        return
      }

      setErrores((prev) => ({
        ...prev,
        general: status >= 500 ? t('login.errors.serviceUnavailable') : t('login.errors.generic'),
      }))
    } finally {
      setCargando(false)
    }
  }

  // Al volver a escribir la contraseña desaparece el aviso de contraseña incorrecta
  const cambiarContrasena = (valor) => {
    setContrasena(valor)
    if (errores.contrasena) setErrores((prev) => ({ ...prev, contrasena: '' }))
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
    setContrasena: cambiarContrasena,
    setMostrarPass,
    handleCorreoChange,
    handleSubmit,
    MAX_INTENTOS,
  }
}
