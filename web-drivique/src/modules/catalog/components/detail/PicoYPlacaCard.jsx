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
        padding: '22px 28px',
        borderRadius: 20,
        border: `1px solid ${border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        flexWrap: 'wrap',
        marginBottom: 24,
      }}
    >
      <div style={{ flex: '1 1 300px', minWidth: 260 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <FaCar color={c?.accentText || "var(--brand-primary, #1e3a8a)"} size={15} />
          <h3 style={{ fontSize: 14, fontWeight: 800, color: titleColor, margin: 0 }}>
            {t('vehiculo.picoYPlaca.cardTitle', 'Consultar Pico y Placa')}
          </h3>
        </div>
        <p style={{ fontSize: 12.5, color: textSecondary, margin: 0, lineHeight: 1.55 }}>
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
          gap: 8,
          padding: '11px 22px',
          borderRadius: 12,
          border: '1.5px solid var(--brand-primary, #2563eb)',
          background: 'transparent',
          color: 'var(--brand-primary, #2563eb)',
          fontSize: 13.5,
          fontWeight: 700,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
      >
        <span>{t('vehiculo.picoYPlaca.irAPagina', 'Ir a la página')}</span>
        <FaExternalLinkAlt size={13} />
      </button>
    </div>
  )
}
