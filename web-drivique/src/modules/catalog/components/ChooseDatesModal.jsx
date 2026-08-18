import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FaRegCalendarAlt } from 'react-icons/fa'
import { COLOR_MARCA } from '../constants'
import AlertModal from './AlertModal'
import { useLanding } from '../../landing/LandingContext'

// Pide iniciar sesión para elegir fechas/lugar. Solo define contenido — el
// tamaño y estilos viven en AlertModal.jsx.
export default function ChooseDatesModal({ c, visible, onCerrar }) {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'
  const navigate = useNavigate()

  if (!visible) return null

  const themeColors = c ? {
    cardBg: c.heroCardBg,
    cardBorder: c.heroCardBorder,
    textPrimary: c.textPrimary,
    textSecondary: c.textSecondary,
    accent: c.accentText,
    accentBgSoft: c.accentBgSoft,
    accentGradient: c.accentGradient,
  } : {
    cardBg: esModoOscuro ? '#111827' : '#FFFFFF',
    cardBorder: esModoOscuro ? '#334155' : '#e5ebf5',
    textPrimary: esModoOscuro ? '#f8fafc' : '#0f172a',
    textSecondary: esModoOscuro ? '#94a3b8' : '#64748b',
    accent: esModoOscuro ? '#93c5fd' : COLOR_MARCA,
    accentBgSoft: esModoOscuro ? 'rgba(37,99,235,0.18)' : '#EFF6FF',
    accentGradient: `linear-gradient(90deg,${COLOR_MARCA},#2563eb)`,
  }

  return (
    <AlertModal
      theme={themeColors}
      icon={<FaRegCalendarAlt size={22} color={themeColors.accent} />}
      titulo={t('catalogo.chooseDatesModal.titulo')}
      mensaje={t('catalogo.chooseDatesModal.mensaje')}
      secondaryText={t('catalogo.chooseDatesModal.cancelar')}
      onSecondary={onCerrar}
      primaryText={t('catalogo.chooseDatesModal.iniciarSesion')}
      onPrimary={() => { onCerrar(); navigate('/login') }}
      onCerrar={onCerrar}
    />
  )
}