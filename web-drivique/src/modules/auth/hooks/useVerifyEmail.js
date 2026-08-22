import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, DURACION_CODIGO_VERIFICACION_MS } from '../../../services/authService'
import { useAuthStore } from '../../../store/authStore'
import { getRoleHome } from '../utils/accessControl'
import { showAlert } from '../../../utils/swalConfig'

const LARGO_CODIGO = 6
const TIEMPO_REENVIO = 60 // segundos
const SEGUNDOS_EXPIRACION_INICIAL = Math.floor(DURACION_CODIGO_VERIFICACION_MS / 1000)

export function useVerifyEmail() {
  const navigate = useNavigate()
  const verificacionCorreo = useAuthStore((s) => s.verificacionCorreo)
  const storeLogin = useAuthStore((s) => s.login)
  const cancelarVerificacionCorreo = useAuthStore((s) => s.cancelarVerificacionCorreo)

  const [codigoEnviado, setCodigoEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [segundosReenvio, setSegundosReenvio] = useState(TIEMPO_REENVIO)
  const [segundosExpiracion, setSegundosExpiracion] = useState(SEGUNDOS_EXPIRACION_INICIAL)
  const [reenviando, setReenviando] = useState(false)
  const inputsRef = useRef([])

  // El código se considera expirado cuando el contador local llega a cero;
  // se deriva del contador en vez de guardarse como estado aparte.
  const expirado = segundosExpiracion <= 0

  useEffect(() => {
    if (!verificacionCorreo) return
  }, [verificacionCorreo])

  // Countdown para poder reenviar el código
  useEffect(() => {
    if (!codigoEnviado || segundosReenvio <= 0) return
    const t = setInterval(() => setSegundosReenvio(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [codigoEnviado, segundosReenvio])

  // Countdown real de expiración del código
  useEffect(() => {
    if (!codigoEnviado || expirado) return
    const t = setInterval(() => setSegundosExpiracion(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [codigoEnviado, expirado])

  // Foco automático al primer input
  useEffect(() => {
    if (codigoEnviado) inputsRef.current[0]?.focus()
  }, [codigoEnviado])

  const handleEnviarCodigo = async () => {
    if (!verificacionCorreo) return
    setEnviando(true)
    setError('')
    try {
      await authService.enviarCodigoVerificacion(verificacionCorreo.correo)
      setSegundosReenvio(TIEMPO_REENVIO)
      setSegundosExpiracion(SEGUNDOS_EXPIRACION_INICIAL)
      setCodigoEnviado(true)
    } catch {
      setError('No se pudo enviar el código. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  const handleCambioDigito = (index, valor) => {
    const soloDigito = valor.replace(/\D/g, '').slice(-1)
    const nuevosCodigos = codigo.split('')
    nuevosCodigos[index] = soloDigito
    const nuevoCodigo = nuevosCodigos.join('').padEnd(LARGO_CODIGO, '').slice(0, LARGO_CODIGO)
    setCodigo(nuevoCodigo.trimEnd())
    setError('')

    if (soloDigito && index < LARGO_CODIGO - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pegado = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LARGO_CODIGO)
    setCodigo(pegado)
    setError('')
    const ultimoIndex = Math.min(pegado.length, LARGO_CODIGO - 1)
    inputsRef.current[ultimoIndex]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (expirado) {
      setError('El código expiró. Solicita uno nuevo.')
      return
    }
    if (codigo.length < LARGO_CODIGO) {
      setError('Ingresa los 6 dígitos del código.')
      return
    }

    setCargando(true)
    setError('')

    try {
      if (verificacionCorreo?.correo) {
        await authService.verificarCodigoRegistro(verificacionCorreo.correo, codigo)
      }

      const token = verificacionCorreo?.datosAcceso?.token || 'mock_token_' + Date.now()
      const usuario = {
        correo: verificacionCorreo?.correo || '',
        nombre: verificacionCorreo?.datosAcceso?.nombre || '',
        apellido: verificacionCorreo?.datosAcceso?.apellido || '',
        rol: verificacionCorreo?.datosAcceso?.rol || 'usuario',
        telefono: verificacionCorreo?.datosAcceso?.telefono || '',
        cedula: verificacionCorreo?.datosAcceso?.cedula || '',
        fechaNacimiento: verificacionCorreo?.datosAcceso?.fechaNacimiento || '',
        emailVerificado: true,
      }

      storeLogin(token, usuario)

      setExito(true)

      showAlert({
        icon: 'success',
        title: '¡Verificación exitosa!',
        text: 'Tu correo ha sido verificado correctamente.',
        timer: 1500,
        showConfirmButton: false,
      })

      const destino = getRoleHome(verificacionCorreo?.datosAcceso?.rol)
      navigate(destino, { replace: true })
    } catch (err) {
      const status = err?.response?.status
      if (status === 410) {
        setSegundosExpiracion(0)
        setError(err?.response?.data?.mensaje || 'El código ha expirado. Solicita uno nuevo.')
      } else if (status === 400) {
        setError(err?.response?.data?.mensaje || 'Código incorrecto. Verifica e intenta de nuevo.')
      } else {
        setError('Error al verificar. Intenta de nuevo.')
      }
      setCodigo('')
      inputsRef.current[0]?.focus()
    } finally {
      setCargando(false)
    }
  }

  const handleReenviar = async () => {
    if (segundosReenvio > 0 || !verificacionCorreo) return
    setReenviando(true)
    setError('')
    try {
      await authService.enviarCodigoVerificacion(verificacionCorreo.correo)
      setSegundosReenvio(TIEMPO_REENVIO)
      setSegundosExpiracion(SEGUNDOS_EXPIRACION_INICIAL)
      setCodigo('')
      inputsRef.current[0]?.focus()
    } catch {
      setError('No se pudo reenviar el código. Intenta de nuevo.')
    } finally {
      setReenviando(false)
    }
  }

  const handleCancelar = () => {
    cancelarVerificacionCorreo()
    navigate('/catalogo', { replace: true })
  }

  return {
    correo: verificacionCorreo?.correo || '',
    codigoEnviado, enviando, handleEnviarCodigo,
    codigo, cargando, error, exito, expirado,
    segundosReenvio, segundosExpiracion,
    reenviando,
    inputsRef, LARGO_CODIGO,
    handleCambioDigito, handleKeyDown,
    handlePaste, handleSubmit,
    handleReenviar, handleCancelar,
  }
}
