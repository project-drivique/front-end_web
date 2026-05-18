import { useState } from 'react'
import { authService } from '../../../services/authService'

export function useRegistro() {
  const [cargando, setCargando] = useState(false)
  const [exito,    setExito]    = useState(false)
  const [error,    setError]    = useState('')

  const registrar = async (datos) => {
    setCargando(true)
    setError('')
    try {
      await authService.registro(datos)
      setExito(true)
    } catch (err) {
      const msg = err?.response?.data?.mensaje
        || err?.response?.data?.message
        || 'No se pudo completar el registro. Intente nuevamente.'
      setError(msg)
    } finally {
      setCargando(false)
    }
  }

  return { registrar, cargando, exito, error }
}