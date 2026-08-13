import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, DURACION_CODIGO_VERIFICACION_MS } from '../../../services/authService'
import { useAuthStore } from '../../../store/authStore'

const LARGO_CODIGO = 6
const TIEMPO_REENVIO = 60 // segundos
const SEGUNDOS_EXPIRACION_INICIAL = Math.floor(DURACION_CODIGO_VERIFICACION_MS / 1000)

export function useVerifyRecover() {
  const navigate = useNavigate()
  const recuperacionCorreo = useAuthStore((s) => s.recuperacionCorreo)
  const cancelarRecuperacionCorreo = useAuthStore((s) => s.cancelarRecuperacionCorreo)

  const [codigo, setCodigo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [segundosReenvio, setSegundosReenvio] = useState(TIEMPO_REENVIO)
  const [segundosExpiracion, setSegundosExpiracion] = useState(SEGUNDOS_EXPIRACION_INICIAL)
  const [reenviando, setReenviando] = useState(false)
  const inputsRef = useRef([])

  const expirado = segundosExpiracion <= 0

  useEffect(() => {
    if (!recuperacionCorreo) return
  }, [recuperacionCorreo])

  useEffect(() => {
    if (segundosReenvio <= 0) return
    const t = setInterval(() => setSegundosReenvio(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [segundosReenvio])

  useEffect(() => {
    if (expirado) return
    const t = setInterval(() => setSegundosExpiracion(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [expirado])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  const handleCambioDigito = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return
    setError('')
    const nuevo = codigo.split('')
    nuevo[index] = value.slice(-1)
    const str = nuevo.join('')
    setCodigo(str)
    if (value && index < LARGO_CODIGO - 1) inputsRef.current[index + 1]?.focus()
    if (str.length === LARGO_CODIGO) autoSubmit(str)
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LARGO_CODIGO)
    if (!p) return
    setCodigo(p)
    setError('')
    if (p.length === LARGO_CODIGO) autoSubmit(p)
    else inputsRef.current[p.length]?.focus()
  }

  const autoSubmit = async (codigoCompleto) => {
    if (!recuperacionCorreo || expirado) return
    setCargando(true)
    setError('')
    try {
      const resp = await authService.verificarCodigoRecuperacion(recuperacionCorreo, codigoCompleto)
      navigate(`/nueva-contrasena?token=${resp.token}`)
    } catch (err) {
      setError(err?.response?.data?.mensaje || 'Código inválido.')
    } finally {
      setCargando(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (codigo.length === LARGO_CODIGO) autoSubmit(codigo)
  }

  const handleReenviar = async () => {
    if (!recuperacionCorreo) return
    setReenviando(true)
    setError('')
    try {
      await authService.solicitarRecuperacion(recuperacionCorreo)
      setSegundosReenvio(TIEMPO_REENVIO)
      setSegundosExpiracion(SEGUNDOS_EXPIRACION_INICIAL)
      setCodigo('')
    } catch (err) {
      setError(err?.response?.data?.mensaje || 'Error al reenviar.')
    } finally {
      setReenviando(false)
    }
  }

  const handleCancelar = () => {
    cancelarRecuperacionCorreo()
    navigate('/login')
  }

  return {
    correo: recuperacionCorreo,
    codigo, cargando, error, expirado,
    segundosReenvio, segundosExpiracion, reenviando,
    inputsRef, LARGO_CODIGO,
    handleCambioDigito, handleKeyDown,
    handlePaste, handleSubmit,
    handleReenviar, handleCancelar,
  }
}
