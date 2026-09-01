import { useTranslation } from 'react-i18next'
import { FaCalendarAlt } from 'react-icons/fa'
import ReservationCalendar from './ReservationCalendar'

export default function DateStep({ vehiculo, reserva, onCambio, c }) {
  const { t } = useTranslation()

  const bg         = c?.cardBg     || '#fff'
  const border     = c?.cardBorder || '#e2e8f0'
  const titleColor = c?.titleColor || 'var(--brand-secondary)'
  const accent     = c?.accentText || 'var(--brand-primary)'
  const textSecond = c?.textSecondary || 'var(--texto-second)'
  const textPrimary = c?.textPrimary || 'var(--texto-primary)'

  return (
    <div style={{ background: bg, padding: 20, borderRadius: 16, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* Encabezado de la Tarjeta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FaCalendarAlt color={accent} size={14} />
        <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>
          {t('vehiculo.dateRangeSectionTitle', 'Calendario de disponibilidad')}
        </h3>
      </div>

      {/* Calendario de Disponibilidad */}
      <div style={{ padding: '16px', borderRadius: 12, border: `1px solid ${border}`, background: '#f8fafc' }}>
        <ReservationCalendar
          vehiculoId={vehiculo.id}
          fechaInicio={reserva.fechaInicio}
          fechaFin={reserva.fechaFin}
          onCambiarFechas={({ fechaInicio, fechaFin }) => {
            onCambio('fechaInicio', fechaInicio)
            onCambio('fechaFin', fechaFin)
          }}
        />
      </div>

      {/* Fechas Seleccionadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 16px', borderRadius: 12, border: `1px solid ${border}`, background: '#f8fafc' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: textSecond, textTransform: 'uppercase' }}>
            <FaCalendarAlt size={10} color="#94a3b8" /> {t('vehiculo.pickupDateTitle', 'FECHA DE RETIRO')}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: textPrimary, marginTop: 2 }}>
            {reserva.fechaInicio || t('vehiculo.selectAction', 'Seleccionar')}
          </span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 16px', borderRadius: 12, border: `1px solid ${border}`, background: '#f8fafc' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: textSecond, textTransform: 'uppercase' }}>
            <FaCalendarAlt size={10} color="#94a3b8" /> {t('vehiculo.returnDateTitle', 'FECHA DE DEVOLUCIÓN')}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: textPrimary, marginTop: 2 }}>
            {reserva.fechaFin || t('vehiculo.selectAction', 'Seleccionar')}
          </span>
        </div>
      </div>

    </div>
  )
}