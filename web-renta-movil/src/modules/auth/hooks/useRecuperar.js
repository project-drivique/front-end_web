import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { authService } from '../../../services/authService'

export function useRecuperar() {
  const { t } = useTranslation()
  const [correo,   setCorreo]   = useState('')
  const [cargando, setCargando] = useState(false)
  const [enviado,  setEnviado]  = useState(false)
  const [error,    setError]    = useState('')

  const validarCorreo = (valor) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!valor)             return t('recuperar.errors.emailRequired')
    if (!regex.test(valor)) return t('recuperar.errors.emailInvalid')
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validarCorreo(correo)
    if (err) { setError(err); return }

    setCargando(true)
    setError('')

    try {
      await authService.solicitarRecuperacion(correo)
      // Siempre mostramos éxito — nunca revelamos si el correo existe o no
      setEnviado(true)
    } catch {
      // Por seguridad mostramos el mismo mensaje de éxito aunque falle
      // para no revelar si el correo está registrado o no
      setEnviado(true)
    } finally {
      setCargando(false)
    }
  }

  return { correo, setCorreo, cargando, enviado, error, handleSubmit }
}