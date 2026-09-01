import { useTranslation } from 'react-i18next'
import { FaShieldAlt, FaClock, FaCalendarDay, FaHashtag } from 'react-icons/fa'

export default function PicoYPlacaCard({ placa = '', c }) {
  const { t } = useTranslation()

  // Extraer el último dígito numérico de la placa
  const digitoMatch = placa.match(/\d(?=[^\d]*$)/)
  const ultimoDigito = digitoMatch ? digitoMatch[0] : (placa ? placa.slice(-1) : 'N/A')
  const digitoNum = parseInt(ultimoDigito, 10)

  // Determinar el día de restricción según el último dígito
  let diaClave = 'lunes'
  if (!isNaN(digitoNum)) {
    if (digitoNum === 1 || digitoNum === 2) diaClave = 'lunes'
    else if (digitoNum === 3 || digitoNum === 4) diaClave = 'martes'
    else if (digitoNum === 5 || digitoNum === 6) diaClave = 'miercoles'
    else if (digitoNum === 7 || digitoNum === 8) diaClave = 'jueves'
    else if (digitoNum === 9 || digitoNum === 0) diaClave = 'viernes'
  }

  const diaNombre = t(`vehiculo.picoYPlaca.dias.${diaClave}`, diaClave)

  return (
    <div
      className="pico-y-placa-card"
      style={{
        background: c?.subCardBg || 'var(--bg-tarjeta)',
        border: `1px solid ${c?.subCardBorder || 'var(--borde)'}`,
        borderRadius: 14,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'all 200ms ease',
      }}
    >
      {/* Encabezado de la tarjeta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${c?.subCardBorder || 'var(--borde)'}`, paddingBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: c?.accentBgSoft || 'rgba(var(--brand-secondary-rgb),0.1)',
              color: c?.accentText || 'var(--brand-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            <FaShieldAlt />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: c?.textPrimary || 'inherit' }}>
              {t('vehiculo.picoYPlaca.titulo', 'Pico y Placa')}
            </h4>
            <span style={{ fontSize: 12, color: c?.textSecondary || '#64748b' }}>
              {t('vehiculo.picoYPlaca.subtitulo', 'Información de circulación vial')}
            </span>
          </div>
        </div>

        {/* Badge de Placa */}
        <div
          style={{
            background: 'var(--bg-page)',
            border: `1.5px solid ${c?.accentText || 'var(--brand-secondary)'}`,
            borderRadius: 8,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 800,
            color: c?.textPrimary || 'inherit',
            letterSpacing: '0.05em',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          }}
        >
          {placa || 'N/A'}
        </div>
      </div>

      {/* Detalles de la restricción */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
        {/* Último dígito */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-page)', padding: '10px 12px', borderRadius: 8, border: `1px solid ${c?.subCardBorder || 'var(--borde)'}` }}>
          <FaHashtag style={{ color: c?.accentText || 'var(--brand-secondary)', fontSize: 14 }} />
          <div>
            <span style={{ display: 'block', fontSize: 11, color: c?.textSecondary || '#64748b', fontWeight: 600 }}>
              {t('vehiculo.picoYPlaca.ultimoDigito', 'Último dígito')}
            </span>
            <strong style={{ fontSize: 14, color: c?.textPrimary || 'inherit' }}>{ultimoDigito}</strong>
          </div>
        </div>

        {/* Día restringido */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-page)', padding: '10px 12px', borderRadius: 8, border: `1px solid ${c?.subCardBorder || 'var(--borde)'}` }}>
          <FaCalendarDay style={{ color: c?.accentText || 'var(--brand-secondary)', fontSize: 14 }} />
          <div>
            <span style={{ display: 'block', fontSize: 11, color: c?.textSecondary || '#64748b', fontWeight: 600 }}>
              {t('vehiculo.picoYPlaca.diaRestriccion', 'Día restringido')}
            </span>
            <strong style={{ fontSize: 13, color: c?.textPrimary || 'inherit' }}>{diaNombre}</strong>
          </div>
        </div>

        {/* Horarios */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-page)', padding: '10px 12px', borderRadius: 8, border: `1px solid ${c?.subCardBorder || 'var(--borde)'}`, gridColumn: 'span 2' }}>
          <FaClock style={{ color: c?.accentText || 'var(--brand-secondary)', fontSize: 14 }} />
          <div>
            <span style={{ display: 'block', fontSize: 11, color: c?.textSecondary || '#64748b', fontWeight: 600 }}>
              {t('vehiculo.picoYPlaca.horarioRestriccion', 'Horario habitual')}
            </span>
            <strong style={{ fontSize: 12, color: c?.textPrimary || 'inherit' }}>
              {t('vehiculo.picoYPlaca.horarioDetalle', '6:00 AM - 9:00 PM')}
            </strong>
          </div>
        </div>
      </div>

      {/* Nota aclaratoria */}
      <p style={{ margin: 0, fontSize: 11.5, color: c?.textSecondary || '#64748b', fontStyle: 'italic', lineHeight: 1.4 }}>
        ℹ️ {t('vehiculo.picoYPlaca.notaInformativa', 'Consulte las regulaciones locales vigentes de la ciudad de tránsito.')}
      </p>
    </div>
  )
}
