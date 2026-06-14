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
      const respuesta = await authService.registro(datos)
      setExito(true)
      return respuesta
    } catch (err) {
      const msg = err?.response?.data?.mensaje
        || err?.response?.data?.message
        || err?.message
        || 'No se pudo completar el registro. Intente nuevamente.'
      setError(msg)
      return null
    } finally {
      setCargando(false)
    }
  }

  return { registrar, cargando, exito, error }
}