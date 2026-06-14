import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../../services/authService'
import { useAuthStore } from '../../../store/authStore'

const LARGO_CODIGO  = 6
const TIEMPO_REENVIO = 60 // segundos

export function useVerificar2FA() {
  const navigate     = useNavigate()
  const sesion2FA    = useAuthStore((s) => s.sesion2FA)
  const storeLogin   = useAuthStore((s) => s.login)
  const cancelar2FA  = useAuthStore((s) => s.cancelar2FA)

  const [codigo,    setCodigo]   = useState('')
  const [cargando,  setCargando] = useState(false)
  const [error,     setError]    = useState('')
  const [exito,     setExito]    = useState(false)
  const [segundos,  setSegundos] = useState(TIEMPO_REENVIO)
  const [reenviando, setReenviando] = useState(false)
  const inputsRef = useRef([])

  // Si no hay sesión 2FA activa redirige al login
  useEffect(() => {
    if (!sesion2FA) navigate('/login', { replace: true })
  }, [sesion2FA, navigate])

  // Countdown para reenvío del código
  useEffect(() => {
    if (segundos <= 0) return
    const t = setInterval(() => setSegundos(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [segundos])

  // Foco automático al primer input al montar
  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  // Maneja el cambio en cada casilla del código
  const handleCambioDigito = (index, valor) => {
    const soloDigito = valor.replace(/\D/g, '').slice(-1)
    const nuevosCodigos = codigo.split('')
    nuevosCodigos[index] = soloDigito
    const nuevoCodigo = nuevosCodigos.join('').padEnd(LARGO_CODIGO, '').slice(0, LARGO_CODIGO)
    setCodigo(nuevoCodigo.trimEnd())
    setError('')

    // Avanza al siguiente input automáticamente
    if (soloDigito && index < LARGO_CODIGO - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  // Manejo del backspace para retroceder entre inputs
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  // Permite pegar el código completo
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
    if (codigo.length < LARGO_CODIGO) {
      setError('Ingresa los 6 dígitos del código.')
      return
    }

    setCargando(true)
    setError('')

    try {
      const datos = await authService.verificar2FA(sesion2FA, codigo)
      storeLogin(datos.token, datos.usuario)
      setExito(true)
      setTimeout(() => {
        navigate(datos.usuario.rol === 'administrador' ? '/admin' : '/catalogo')
      }, 1500)
    } catch (err) {
      const msg = err?.response?.data?.mensaje || ''
      if (msg.toLowerCase().includes('expir')) {
        setError('El código ha expirado. Solicita uno nuevo.')
      } else if (msg.toLowerCase().includes('inválido') || msg.toLowerCase().includes('incorrecto')) {
        setError('Código incorrecto. Verifica e intenta de nuevo.')
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
    if (segundos > 0) return
    setReenviando(true)
    setError('')
    try {
      await authService.reenviarCodigo2FA(sesion2FA)
      setSegundos(TIEMPO_REENVIO)
      setCodigo('')
      inputsRef.current[0]?.focus()
    } catch {
      setError('No se pudo reenviar el código. Intenta de nuevo.')
    } finally {
      setReenviando(false)
    }
  }

  const handleCancelar = () => {
    cancelar2FA()
    navigate('/login', { replace: true })
  }

  return {
    codigo, cargando, error, exito,
    segundos, reenviando,
    inputsRef, LARGO_CODIGO,
    handleCambioDigito, handleKeyDown,
    handlePaste, handleSubmit,
    handleReenviar, handleCancelar,
  }
}