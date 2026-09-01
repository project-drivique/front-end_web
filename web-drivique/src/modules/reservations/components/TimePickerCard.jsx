import { useTranslation } from 'react-i18next'
import { FaClock } from 'react-icons/fa'

const HORAS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0')
  return [`${h}:00`, `${h}:30`]
}).flat()

export default function TimePickerCard({ reserva, onCambio, c }) {
  const { t } = useTranslation()

  const bg          = c?.cardBg      || '#fff'
  const border      = c?.cardBorder  || '#e2e8f0'
  const titleColor  = c?.titleColor  || 'var(--brand-secondary)'
  const textPrimary = c?.textPrimary || 'var(--texto-primary)'
  const textSecond  = c?.textSecondary || 'var(--texto-second)'
  const accent      = c?.accentText  || 'var(--brand-primary)'

  const selectStyle = {
    width: '100%',
    border: `1px solid ${border}`,
    borderRadius: 10,
    padding: '9px 12px',
    fontSize: 13,
    fontWeight: 700,
    color: textPrimary,
    background: bg,
    outline: 'none',
    cursor: 'pointer',
    appearance: 'auto',
  }

  return (
    <div style={{ background: bg, padding: 20, borderRadius: 16, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FaClock color={accent} size={14} />
        <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>
          {t('vehiculo.timePickerTitle', 'Selecciona hora de entrega y devolución')}
        </h3>
      </div>

      {/* Hora de recogida */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: 12, color: textSecond, margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FaClock size={11} color="#94a3b8" />
          {t('vehiculo.pickupTimeLabel', 'Hora de recogida')}
        </p>
        <select
          value={reserva?.horaInicio || ''}
          onChange={e => onCambio('horaInicio', e.target.value)}
          style={selectStyle}
        >
          <option value="">{t('vehiculo.selectTime', 'Seleccionar hora')}</option>
          {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>

      {/* Hora de devolución */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: 12, color: textSecond, margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FaClock size={11} color="#94a3b8" />
          {t('vehiculo.returnTimeLabel', 'Hora de devolución')}
        </p>
        <select
          value={reserva?.horaFin || ''}
          onChange={e => onCambio('horaFin', e.target.value)}
          style={selectStyle}
        >
          <option value="">{t('vehiculo.selectTime', 'Seleccionar hora')}</option>
          {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>
    </div>
  )
}
