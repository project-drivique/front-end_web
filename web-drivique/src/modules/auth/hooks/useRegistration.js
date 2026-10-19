import { useState } from 'react'
import { authService } from '../../../services/authService'
import i18n from '@/i18n'

export function useRegistration() {
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
      const msg = err?.response?.data?.detail
        || err?.response?.data?.mensaje
        || err?.response?.data?.message
        || (err?.response?.status === 409
            ? i18n.t('hc2.el_correo_ya_se_encuentra_registrado_i', 'El correo ya se encuentra registrado. Inicia sesión o recupera tu contraseña.')
            : (err?.message || i18n.t('hc2.no_se_pudo_completar_el_registro_inten', 'No se pudo completar el registro. Intente nuevamente.')))
      setError(msg)
      return null
    } finally {
      setCargando(false)
    }
  }

  return { registrar, cargando, exito, error }
}