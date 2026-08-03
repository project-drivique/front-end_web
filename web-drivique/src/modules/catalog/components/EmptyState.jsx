import { useTranslation } from 'react-i18next'

export default function EstadoVacio({ c, onLimpiar, titulo, mensaje, textoBoton }) {
  const { t } = useTranslation()
  const tituloFinal = titulo ?? t('catalogo.noResults')
  const mensajeFinal = mensaje ?? t('catalogo.noResultsSubtitle')
  const textoBtnFinal = textoBoton ?? t('catalogo.clearFilters')

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '80px 24px',
        background: c.panelBg,
        borderRadius: '20px',
        border: `1px solid ${c.panelBorder}`,
      }}
    >
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: c.textPrimary, margin: '0 0 8px' }}>
        {tituloFinal}
      </h3>
      <p style={{ fontSize: '14px', color: c.textSecondary, margin: '0 0 20px' }}>
        {mensajeFinal}
      </p>
      <button
        type="button"
        onClick={onLimpiar}
        style={{
          padding: '10px 24px',
          borderRadius: '9999px',
          background: c.accentText,
          color: '#fff',
          border: 'none',
          fontWeight: 700,
        }}
      >
        {textoBtnFinal}
      </button>
    </div>
  )
}
