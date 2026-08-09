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
        cardBg: c.heroCardBg,
        cardBorder: c.heroCardBorder,
        textPrimary: c.textPrimary,
        textSecondary: c.textSecondary,
        accent: c.accentText,
        accentBgSoft: c.accentBgSoft,
        accentGradient: c.accentGradient,
      }}
      icon={<FaCarSide size={22} color={c.accentText} />}
      titulo={t('catalogo.guestReserveModal.titulo')}
      mensaje={t('catalogo.guestReserveModal.mensaje')}
      secondaryText={t('common.cancel')}
      onSecondary={onCerrar}
      primaryText={t('catalogo.guestReserveModal.iniciarSesion')}
      onPrimary={() => { onCerrar(); navigate('/login') }}
      onCerrar={onCerrar}
    />
  )
}