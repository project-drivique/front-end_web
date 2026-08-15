import { FaExclamationTriangle } from 'react-icons/fa'
import AlertModal from './AlertModal'

export default function IncompleteSearchModal({ c, titulo, mensaje, textoBoton, onCerrar }) {
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
      icon={<FaExclamationTriangle size={22} color={c.accentText} />}
      titulo={titulo}
      mensaje={mensaje}
      primaryText={textoBoton}
      onPrimary={onCerrar}
      onCerrar={onCerrar}
    />
  )
}
