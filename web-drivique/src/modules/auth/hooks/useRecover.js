import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../../services/authService'
import { useAuthStore } from '../../../store/authStore'

export function useRecover() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const iniciarRecuperacionCorreo = useAuthStore((s) => s.iniciarRecuperacionCorreo)
  
  const [correo,   setCorreo]   = useState('')
  const [cargando, setCargando] = useState(false)
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
      iniciarRecuperacionCorreo(correo)
      navigate('/verificar-recuperacion')
    } catch (errorApi) {
      const msg = errorApi?.response?.data?.mensaje || 'Error al solicitar recuperación.'
      setError(msg)
    } finally {
      setCargando(false)
    }
  }

  return { correo, setCorreo, cargando, error, handleSubmit }
}