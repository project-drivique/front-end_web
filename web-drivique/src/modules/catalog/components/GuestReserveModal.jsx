import { FaCarSide } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AlertModal from './AlertModal'

// Bloquea "Reservar ahora" a invitados. Solo define contenido — el tamaño y
// estilos viven en AlertModal.jsx.
export default function GuestReserveModal({ c, visible, onCerrar }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (!visible) return null

  return (
    <AlertModal
      theme={{
        cardBg: c?.heroCardBg || c?.cardBg || 'var(--bg-tarjeta, #ffffff)',
        cardBorder: c?.heroCardBorder || c?.cardBorder || 'var(--borde, #e2e8f0)',
        textPrimary: c?.textPrimary || 'var(--texto-primary, #0f172a)',
        textSecondary: c?.textSecondary || 'var(--texto-second, #64748b)',
        accent: c?.accentText || 'var(--brand-text)',
        accentBgSoft: c?.accentBgSoft || 'var(--brand-soft)',
        accentGradient: c?.accentGradient || 'var(--brand-gradient)',
      }}
      icon={<FaCarSide size={22} color={c?.accentText || 'var(--brand-primary)'} />}
      titulo={t('catalogo.guestReserveModal.titulo', '¿Deseas reservar este vehículo?')}
      mensaje={t('catalogo.guestReserveModal.mensaje', 'Inicia sesión o regístrate para continuar con tu reserva y acceder a todos los beneficios.')}
      secondaryText={t('common.cancel', 'Cancelar')}
      onSecondary={onCerrar}
      primaryText={t('catalogo.guestReserveModal.iniciarSesion', 'Iniciar sesión')}
      onPrimary={() => { onCerrar(); navigate('/login') }}
      onCerrar={onCerrar}
    />
  )
}