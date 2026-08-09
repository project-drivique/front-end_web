import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FaRegCalendarAlt } from 'react-icons/fa'
import { COLOR_MARCA } from '../constants'
import AlertModal from './AlertModal'

// Pide iniciar sesión para elegir fechas/lugar. Solo define contenido — el
// tamaño y estilos viven en AlertModal.jsx.
export default function ChooseDatesModal({ visible, onCerrar }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (!visible) return null

  return (
    <AlertModal
      theme={{
        cardBg: '#FFFFFF',
        cardBorder: '#e5ebf5',
        textPrimary: '#0f172a',
        textSecondary: '#64748b',
        accent: COLOR_MARCA,
        accentBgSoft: '#EFF6FF',
        accentGradient: `linear-gradient(90deg,${COLOR_MARCA},#2563eb)`,
      }}
      icon={<FaRegCalendarAlt size={22} color={COLOR_MARCA} />}
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