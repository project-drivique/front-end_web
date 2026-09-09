import { useTranslation } from 'react-i18next'
import { FaCar, FaExternalLinkAlt } from 'react-icons/fa'

export default function PicoYPlacaCard({ c }) {
  const { t } = useTranslation()

  const bg = c?.cardBg || '#ffffff'
  const border = c?.cardBorder || '#e2e8f0'
  const titleColor = c?.titleColor || 'var(--brand-secondary, #0f172a)'
  const textSecondary = c?.textSecondary || '#64748b'

  const handleIrAPagina = () => {
    window.open('https://www.movilidadbogota.gov.co/web/pico_y_placa', '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      style={{
        background: bg,
        padding: 'clamp(14px, 2vw, 20px)',
        borderRadius: 16,
        border: `1px solid ${border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0 }}>
        <FaCar color={c?.accentText || "var(--brand-primary, #1e3a8a)"} size={13} />
        <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>
          {t('vehiculo.picoYPlaca.cardTitle', 'Consultar Pico y Placa')}
        </h3>
      </div>

      <p style={{ fontSize: 13, color: textSecondary, margin: '2px 0 4px', lineHeight: 1.5 }}>
        {t(
          'vehiculo.picoYPlaca.cardDesc',
          'Consulta la restricción de movilidad oficial para planificar tu ruta y evitar contratiempos durante tu viaje.'
        )}
      </p>

      <button
        type="button"
        onClick={handleIrAPagina}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontSize: 13,
          fontWeight: 700,
          color: c?.accentText || 'var(--brand-secondary)',
          background: 'transparent',
          border: `1px solid ${c?.accentText || 'var(--brand-secondary)'}`,
          borderRadius: 8,
          padding: '10px 16px',
          cursor: 'pointer',
          marginTop: 4,
          transition: 'all 0.2s ease',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <FaExternalLinkAlt size={12} />
        <span>{t('vehiculo.picoYPlaca.irAPagina', 'Ir a la página')}</span>
      </button>
    </div>
  )
}

