import { useTranslation } from 'react-i18next'
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaCreditCard, FaPencilAlt, FaCheckCircle, FaEye, FaHourglassHalf } from 'react-icons/fa'
import { useState } from 'react'
import ReservationCalendar from './ReservationCalendar'
import DomicilioModal from './DomicilioModal'
import { SUCURSALES, CIUDADES } from '../../catalog/constants'

const HORAS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0')
  return [`${h}:00`, `${h}:30`]
}).flat()

export default function UnifiedReservationConfigCard({ vehiculo, reserva, onCambio, c }) {
  const { t } = useTranslation()

  const bg         = c?.cardBg     || '#fff'
  const border     = c?.cardBorder || '#e2e8f0'
  const titleColor = c?.titleColor || '#1e3a8a'
  const textSecond = c?.textSecondary || 'var(--texto-second)'
  const textPrimary = c?.textPrimary || 'var(--texto-primary)'
  const accent     = c?.accentText || '#2563eb'
  const isDark     = c?.isDark || false

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalReadOnly, setIsModalReadOnly] = useState(false)

  // Payment Options
  const metodoPago = reserva?.metodoPago
  const paymentOptions = [
    {
      value: 'wompi',
      titulo: 'Pago virtual con Wompi',
      desc: 'Habilita entregas a domicilio, aeropuerto o terminal.',
    },
    {
      value: 'efectivo',
      titulo: 'Pago en efectivo',
      desc: 'Obligatorio retirar y pagar directamente en sucursal.',
    },
  ]

  // Location Options
  const carBranch = vehiculo?.sucursal
  const branchObj = SUCURSALES.find(s => s.nombre === carBranch)
  const cityObj   = branchObj ? CIUDADES.find(city => city.nombre === branchObj.ciudad) : null

  const opcionesEntrega = carBranch ? [{ value: carBranch, label: t('vehiculo.pickupAtBranch', { sucursal: carBranch }) }] : []
  if (reserva?.metodoPago !== 'efectivo') {
    opcionesEntrega.push({ value: 'domicilio', label: t('vehiculo.deliveryHome', 'A domicilio') })
    if (cityObj?.tieneAeropuerto) opcionesEntrega.push({ value: 'aeropuerto', label: t('vehiculo.deliveryAirport', 'Aeropuerto') })
    if (cityObj?.tieneTerminal)   opcionesEntrega.push({ value: 'terminal',   label: t('vehiculo.deliveryTerminal', 'Terminal') })
  }

  const opcionesDevolucion = carBranch ? [{ value: carBranch, label: t('vehiculo.returnAtBranch', { sucursal: carBranch }) }] : []
  if (reserva?.metodoPago !== 'efectivo') {
    opcionesDevolucion.push({ value: 'domicilio', label: t('vehiculo.returnHome', 'A domicilio') })
    if (cityObj?.tieneAeropuerto) opcionesDevolucion.push({ value: 'aeropuerto', label: t('vehiculo.returnAirport', 'Aeropuerto') })
    if (cityObj?.tieneTerminal)   opcionesDevolucion.push({ value: 'terminal',   label: t('vehiculo.returnTerminal', 'Terminal') })
  }

  const selectStyle = {
    width: '100%',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: 14,
    fontWeight: 500,
    color: textPrimary,
    cursor: 'pointer',
    appearance: 'auto',
    padding: 0,
    marginTop: 4
  }

  const hasDomicilioData = reserva?.domicilioBarrio && reserva?.domicilioDireccion

  const handleLugarChange = (campo, valor) => {
    onCambio(campo, valor)
    if (valor === 'domicilio' && !hasDomicilioData) {
      setIsModalReadOnly(false)
      setIsModalOpen(true)
    }
  }

  let durationText = ''
  if (reserva?.fechaInicio && reserva?.fechaFin) {
    if (reserva?.horaInicio && reserva?.horaFin) {
      const start = new Date(`${reserva.fechaInicio}T${reserva.horaInicio}:00`)
      const end = new Date(`${reserva.fechaFin}T${reserva.horaFin}:00`)
      const diffMs = end - start
      if (diffMs > 0) {
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
        const dias = Math.floor(diffHrs / 24)
        const horas = diffHrs % 24
        
        const parts = []
        if (dias > 0) parts.push(`${dias} ${dias === 1 ? 'día' : 'días'}`)
        if (horas > 0) parts.push(`${horas} ${horas === 1 ? 'hora' : 'horas'}`)
        durationText = parts.join(' - ') || '0 horas'
      }
    } else {
      const start = new Date(reserva.fechaInicio)
      const end = new Date(reserva.fechaFin)
      const diffMs = end - start
      if (diffMs >= 0) {
        const dias = Math.max(1, Math.ceil(diffMs / 86400000))
        durationText = `${dias} ${dias === 1 ? 'día' : 'días'}`
      }
    }
  }

  return (
    <div style={{ background: bg, padding: 20, borderRadius: 16, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* SECCIÓN: MÉTODO DE PAGO */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaCreditCard color={accent} size={14} />
          <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>
            {t('vehiculo.paymentMethodTitle', 'Selecciona el método de pago')}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paymentOptions.map(({ value, titulo, desc }) => {
            const activo = metodoPago === value
            return (
              <label
                key={value}
                onClick={(e) => {
                  if (activo) {
                    e.preventDefault();
                    onCambio('metodoPago', value);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: 12,
                  border: `1px solid ${activo ? accent : border}`,
                  background: activo ? (isDark ? 'rgba(37,99,235,0.12)' : '#eff6ff') : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: activo ? accent : textPrimary, margin: 0 }}>
                    {titulo}
                  </p>
                  <p style={{ fontSize: 11, color: activo ? accent : textSecond, opacity: 0.8, margin: 0, fontWeight: 600 }}>
                    {desc}
                  </p>
                </div>
                <input
                  type="radio"
                  name="metodoPagoUnified"
                  value={value}
                  checked={activo}
                  onChange={() => onCambio('metodoPago', value)}
                  style={{ accentColor: accent, width: 20, height: 20, cursor: 'pointer', flexShrink: 0 }}
                />
              </label>
            )
          })}
        </div>
      </div>

      {/* SECCIÓN: LUGAR Y HORA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Lugar Retiro */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: titleColor }}>
              <FaMapMarkerAlt color={accent} size={14} /> Seleccionar lugar de retiro
            </span>
            <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent' }}>
              <select
                value={reserva?.sucursalRetiro || ''}
                onChange={e => handleLugarChange('sucursalRetiro', e.target.value)}
                style={selectStyle}
              >
                <option value="">{t('vehiculo.selectLocation', 'Seleccionar')}</option>
                {opcionesEntrega.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            {reserva?.sucursalRetiro === 'domicilio' && (
              <div 
                onClick={() => {
                  setIsModalReadOnly(false)
                  setIsModalOpen(true)
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 11, color: accent, fontWeight: 700, cursor: 'pointer', padding: '4px 8px', background: 'rgba(37,99,235,0.1)', borderRadius: 6, width: 'fit-content' }}
              >
                <FaPencilAlt size={10} />
                {hasDomicilioData
                  ? 'Editar'
                  : t('vehiculo.fillAddressBtn', 'Ingresar dirección')}
              </div>
            )}
          </div>
          
          {/* Lugar Devolución */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: titleColor }}>
              <FaMapMarkerAlt color={accent} size={14} /> Seleccionar lugar de devolución
            </span>
            <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent' }}>
              <select
                value={reserva?.sucursalDevolucion || ''}
                onChange={e => handleLugarChange('sucursalDevolucion', e.target.value)}
                style={selectStyle}
              >
                <option value="">{t('vehiculo.selectLocation', 'Seleccionar')}</option>
                {opcionesDevolucion.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            {reserva?.sucursalDevolucion === 'domicilio' && (
              <div 
                onClick={() => {
                  if (reserva?.sucursalRetiro === 'domicilio') {
                    setIsModalReadOnly(true)
                    setIsModalOpen(true)
                  } else {
                    setIsModalReadOnly(false)
                    setIsModalOpen(true)
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 11, color: accent, fontWeight: 700, cursor: 'pointer', padding: '4px 8px', background: 'rgba(37,99,235,0.1)', borderRadius: 6, width: 'fit-content' }}
              >
                {reserva?.sucursalRetiro === 'domicilio' ? <FaEye size={12} /> : <FaPencilAlt size={10} />}
                {hasDomicilioData
                  ? (reserva?.sucursalRetiro === 'domicilio' ? 'Ver' : 'Editar')
                  : t('vehiculo.fillAddressBtn', 'Ingresar dirección')}
              </div>
            )}
          </div>

          {/* Hora Retiro */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: titleColor }}>
              <FaClock color={accent} size={14} /> Selecciona Hora de Retiro
            </span>
            <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent' }}>
              <select
                value={reserva?.horaInicio || ''}
                onChange={e => onCambio('horaInicio', e.target.value)}
                style={selectStyle}
              >
                <option value="">{t('vehiculo.selectTime', 'Seleccionar')}</option>
                {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          {/* Hora Devolución */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: titleColor }}>
              <FaClock color={accent} size={14} /> Selecciona Hora de Devolución
            </span>
            <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent' }}>
              <select
                value={reserva?.horaFin || ''}
                onChange={e => onCambio('horaFin', e.target.value)}
                style={selectStyle}
              >
                <option value="">{t('vehiculo.selectTime', 'Seleccionar')}</option>
                {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN: CALENDARIO */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaCalendarAlt color={titleColor} size={14} />
          <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>
            {t('vehiculo.dateRangeSectionTitle', 'Calendario de disponibilidad')}
          </h3>
        </div>
        
        <div style={{ padding: '24px', borderRadius: 16, border: `1px solid ${border}`, background: 'transparent' }}>
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

        {/* Tarjetas de fechas seleccionadas en la parte inferior */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: titleColor }}>
              <FaCalendarAlt color={titleColor} size={14} /> {t('vehiculo.pickupDateTitle', 'Fecha de retiro')}
            </span>
            <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: textPrimary, display: 'block' }}>
                {reserva.fechaInicio || t('vehiculo.selectAction', 'Seleccionar')}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: titleColor }}>
              <FaCalendarAlt color={titleColor} size={14} /> {t('vehiculo.returnDateTitle', 'Fecha de devolución')}
            </span>
            <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: textPrimary, display: 'block' }}>
                {reserva.fechaFin || t('vehiculo.selectAction', 'Seleccionar')}
              </span>
            </div>
          </div>
        </div>

        {durationText && (
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: 'rgba(37,99,235,0.05)', border: `1px solid rgba(37,99,235,0.15)` }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: textSecond }}>
              <FaHourglassHalf color={textSecond} size={14} /> Duración del alquiler:
            </span>
            <span style={{ fontSize: 14, fontWeight: 800, color: titleColor }}>
              {durationText}
            </span>
          </div>
        )}
      </div>

      <DomicilioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reserva={reserva}
        onCambio={onCambio}
        c={c}
        isReadOnly={isModalReadOnly}
      />
    </div>
  )
}
