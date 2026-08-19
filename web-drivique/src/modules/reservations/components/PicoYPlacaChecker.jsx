import { FaCar, FaExternalLinkAlt } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

export default function PicoYPlacaChecker({ c }) {
  const { t } = useTranslation()

  const bg = c?.cardBg || '#fff'
  const border = c?.cardBorder || '#e2e8f0'
  const titleColor = c?.titleColor || '#1e3a8a'
  const textColor = c?.textSecondary || '#64748b'
  const accent = c?.accentText || '#2563eb'

  return (
    <div style={{
      background: bg,
      padding: 20,
      borderRadius: 16,
      border: `1px solid ${border}`,
      display: 'flex',
      flexDirection: 'column',
      flex: 1
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <FaCar color={accent} size={14} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>
              {t('vehiculo.checkPicoYPlacaTitle', 'Consultar Pico y Placa')}
            </h3>
          </div>
          <p style={{ fontSize: 13, color: textColor, margin: 0, lineHeight: 1.6 }}>
            {t('vehiculo.checkPicoYPlacaDesc', '¿No estás seguro de si este vehículo tiene restricción de movilidad hoy? Consulta la información oficial a nivel nacional para planificar tu ruta y evitar multas o contratiempos durante tu reserva. Recuerda que las restricciones pueden variar según la ciudad y el día de la semana, por lo que es vital estar informado antes de viajar.')}
          </p>
        </div>

        <a
          href="https://www.pyphoy.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'transparent',
            color: accent,
            textDecoration: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            border: `1px solid ${accent}`,
            fontWeight: 700,
            fontSize: 13,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            cursor: 'pointer',
            alignSelf: 'center'
          }}
        >
          {t('vehiculo.goToOfficialSite', 'Ir a la página')} <FaExternalLinkAlt size={11} />
        </a>
      </div>
    </div>
  )
}

