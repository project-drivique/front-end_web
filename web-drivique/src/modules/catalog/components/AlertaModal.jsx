import { FaSearch } from 'react-icons/fa'
import AlertModal from './AlertModal'

// Alerta genérica de "sin resultados" (texto libre, fechas sin disponibilidad,
// filtros del sidebar sin coincidencias). Solo define contenido — el tamaño
// y estilos viven en AlertModal.jsx.
export default function AlertaModal({ c, titulo, mensaje, textoBoton, onCerrar }) {
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
      icon={<FaSearch size={22} color={c.accentText} />}
      titulo={titulo}
      mensaje={mensaje}
      primaryText={textoBoton}
      onPrimary={onCerrar}
      onCerrar={onCerrar}
      showCloseButton
    />
  )
}