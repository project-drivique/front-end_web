import { useTranslation } from 'react-i18next'
import { FaSearch } from 'react-icons/fa'

export default function EstadoVacio({ c, onLimpiar, titulo, mensaje, textoBoton }) {
  const { t } = useTranslation()
  const tituloFinal = titulo ?? t('catalogo.noResults')
  const mensajeFinal = mensaje ?? t('catalogo.noResultsSubtitle')
  const textoBtnFinal = textoBoton ?? t('catalogo.clearFilters')

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '60px 24px',
        background: c.panelBg,
        borderRadius: '20px',
        border: `1px solid ${c.panelBorder}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          background: c.accentBgSoft || '#eff6ff',
        }}
      >
        <FaSearch size={22} color={c.accentText} />
      </div>
      <h3 style={{ fontSize: '15px', fontWeight: 800, color: c.textPrimary, margin: '0 0 4px', lineHeight: '1.3' }}>
        {tituloFinal}
      </h3>
      <p style={{ fontSize: '12px', color: c.textSecondary, margin: '0 0 16px', lineHeight: '1.4', maxWidth: '260px' }}>
        {mensajeFinal}
      </p>
      <button
        type="button"
        onClick={onLimpiar}
        style={{
          height: '36px',
          padding: '0 20px',
          borderRadius: '9999px',
          background: c.accentGradient || 'linear-gradient(90deg,#1e3a8a,#2563eb)',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '12px',
          border: 'none',
          boxShadow: '0 4px 14px rgba(30,58,138,0.25)',
          cursor: 'pointer',
        }}
      >
        {textoBtnFinal}
      </button>
    </div>
  )
}
