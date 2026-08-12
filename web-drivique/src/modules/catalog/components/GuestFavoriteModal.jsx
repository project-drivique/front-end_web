import { FaRegHeart } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AlertModal from './AlertModal'

// Bloquea "Favoritos" a invitados. Solo define contenido — el tamaño y
// estilos viven en AlertModal.jsx.
export default function GuestFavoriteModal({ c, visible, onCerrar }) {
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
      icon={<FaRegHeart size={22} color={c.accentText} />}
      titulo={t('catalogo.guestFavoriteModal.titulo')}
      mensaje={t('catalogo.guestFavoriteModal.mensaje')}
      secondaryText={t('common.cancel')}
      onSecondary={onCerrar}
      primaryText={t('catalogo.guestFavoriteModal.iniciarSesion')}
      onPrimary={() => { onCerrar(); navigate('/login') }}
      onCerrar={onCerrar}
    />
  )
}