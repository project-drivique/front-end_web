import { useTranslation } from 'react-i18next'
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaCreditCard, FaPencilAlt } from 'react-icons/fa'
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
    fontWeight: 700,
    color: textPrimary,
    cursor: 'pointer',
    appearance: 'auto',
    padding: 0,
    marginTop: 4
  }

  const handleLugarChange = (campo, valor) => {
    onCambio(campo, valor)
    if (valor === 'domicilio') {
      // Always open modal when domicilio is selected so user can fill/edit
      setIsModalOpen(true)
    }
  }

  const hasDomicilioData = reserva?.domicilioBarrio && reserva?.domicilioDireccion

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
                onClick={() => onCambio('metodoPago', value)}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaMapMarkerAlt color={accent} size={14} />
          <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>
            {t('vehiculo.locationPickerTitle', 'Selecciona lugar y hora de entrega/devolución')}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Lugar Retiro */}
          <div style={{ padding: '14px 18px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: textSecond, textTransform: 'uppercase' }}>
              <FaMapMarkerAlt size={10} color="#94a3b8" /> LUGAR DE RETIRO
            </span>
            <select
              value={reserva?.sucursalRetiro || ''}
              onChange={e => handleLugarChange('sucursalRetiro', e.target.value)}
              style={selectStyle}
            >
              <option value="">{t('vehiculo.selectLocation', 'Seleccionar...')}</option>
              {opcionesEntrega.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            {reserva?.sucursalRetiro === 'domicilio' && (
              <div 
                onClick={() => setIsModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11, color: accent, fontWeight: 700, cursor: 'pointer', padding: '4px 8px', background: 'rgba(37,99,235,0.1)', borderRadius: 6, width: 'fit-content' }}
              >
                <FaPencilAlt size={10} />
                {hasDomicilioData
                  ? `${reserva.domicilioBarrio}, ${reserva.domicilioDireccion.substring(0,15)}...`
                  : t('vehiculo.fillAddressBtn', 'Ingresar dirección')}
              </div>
            )}
          </div>
          
          {/* Lugar Devolución */}
          <div style={{ padding: '14px 18px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: textSecond, textTransform: 'uppercase' }}>
              <FaMapMarkerAlt size={10} color="#94a3b8" /> LUGAR DE DEVOLUCIÓN
            </span>
            <select
              value={reserva?.sucursalDevolucion || ''}
              onChange={e => handleLugarChange('sucursalDevolucion', e.target.value)}
              style={selectStyle}
            >
              <option value="">{t('vehiculo.selectLocation', 'Seleccionar...')}</option>
              {opcionesDevolucion.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            {reserva?.sucursalDevolucion === 'domicilio' && (
              <div 
                onClick={() => setIsModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11, color: accent, fontWeight: 700, cursor: 'pointer', padding: '4px 8px', background: 'rgba(37,99,235,0.1)', borderRadius: 6, width: 'fit-content' }}
              >
                <FaPencilAlt size={10} />
                {hasDomicilioData
                  ? `Editar dirección — ${reserva.domicilioBarrio}`
                  : t('vehiculo.fillAddressBtn', 'Ingresar dirección')}
              </div>
            )}
          </div>

          {/* Hora Retiro */}
          <div style={{ padding: '14px 18px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: textSecond, textTransform: 'uppercase' }}>
              <FaClock size={10} color="#94a3b8" /> HORA DE RETIRO
            </span>
            <select
              value={reserva?.horaInicio || ''}
              onChange={e => onCambio('horaInicio', e.target.value)}
              style={selectStyle}
            >
              <option value="">{t('vehiculo.selectTime', 'Seleccionar...')}</option>
              {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          {/* Hora Devolución */}
          <div style={{ padding: '14px 18px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: textSecond, textTransform: 'uppercase' }}>
              <FaClock size={10} color="#94a3b8" /> HORA DE DEVOLUCIÓN
            </span>
            <select
              value={reserva?.horaFin || ''}
              onChange={e => onCambio('horaFin', e.target.value)}
              style={selectStyle}
            >
              <option value="">{t('vehiculo.selectTime', 'Seleccionar...')}</option>
              {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* SECCIÓN: CALENDARIO */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaCalendarAlt color={accent} size={14} />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 16px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: textSecond, textTransform: 'uppercase' }}>
              <FaCalendarAlt size={10} color="#94a3b8" /> {t('vehiculo.pickupDateTitle', 'FECHA DE RETIRO')}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: textPrimary, marginTop: 2 }}>
              {reserva.fechaInicio || t('vehiculo.selectAction', 'Seleccionar...')}
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 16px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: textSecond, textTransform: 'uppercase' }}>
              <FaCalendarAlt size={10} color="#94a3b8" /> {t('vehiculo.returnDateTitle', 'FECHA DE DEVOLUCIÓN')}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: textPrimary, marginTop: 2 }}>
              {reserva.fechaFin || t('vehiculo.selectAction', 'Seleccionar...')}
            </span>
          </div>
        </div>
      </div>

      <DomicilioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reserva={reserva}
        onCambio={onCambio}
        c={c}
      />
    </div>
  )
}
