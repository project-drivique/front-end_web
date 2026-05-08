import { useState } from 'react'
import { authService } from '../../../services/authService'

/**
 * Patrón Template Method — custom hook.
 * Encapsula toda la lógica del formulario de registro:
 * validación, llamada a la API y manejo de estados.
 */
export function useRegistro() {
  const [cargando, setCargando] = useState(false)
  const [error,    setError]    = useState('')
  const [exito,    setExito]    = useState(false)

  const registrar = async (datos) => {
    setCargando(true)
    setError('')
    try {
      await authService.registro(datos)
      setExito(true)
    } catch (err) {
      // RF1.8 — correo duplicado u otros errores del backend
      setError(err.response?.data?.mensaje || 'Error al crear la cuenta. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return { registrar, cargando, error, exito }
}