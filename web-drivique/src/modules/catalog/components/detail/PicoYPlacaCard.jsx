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
        padding: 'clamp(14px, 2vw, 22px)',
        borderRadius: 16,
        border: `1px solid ${border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'clamp(12px, 2vw, 20px)',
        flexWrap: 'wrap',
        marginBottom: 16,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ flex: '1 1 260px', minWidth: 220 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <FaCar color={c?.accentText || "var(--brand-primary, #1e3a8a)"} size={14} />
          <h3 style={{ fontSize: 13.5, fontWeight: 800, color: titleColor, margin: 0 }}>
            {t('vehiculo.picoYPlaca.cardTitle', 'Consultar Pico y Placa')}
          </h3>
        </div>
        <p style={{ fontSize: 12, color: textSecondary, margin: 0, lineHeight: 1.5 }}>
          {t(
            'vehiculo.picoYPlaca.cardDesc',
            '¿No estás seguro de si este vehículo tiene restricción de movilidad hoy? Consulta la información oficial a nivel nacional para planificar tu ruta y evitar multas o contratiempos durante tu reserva. Recuerda que las restricciones pueden variar según la ciudad y el día de la semana, por lo que es vital estar informado antes de viajar.'
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={handleIrAPagina}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '10px 18px',
          borderRadius: 12,
          border: '1.5px solid var(--brand-primary, #2563eb)',
          background: 'transparent',
          color: 'var(--brand-primary, #2563eb)',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
      >
        <span>{t('vehiculo.picoYPlaca.irAPagina', 'Ir a la página')}</span>
        <FaExternalLinkAlt size={12} />
      </button>
    </div>
  )
}
