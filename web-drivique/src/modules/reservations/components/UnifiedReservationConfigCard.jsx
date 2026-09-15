import { useTranslation } from 'react-i18next'
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaCreditCard, FaPencilAlt, FaEye, FaHourglassHalf, FaInfoCircle } from 'react-icons/fa'
import { useState } from 'react'
import ReservationCalendar from './ReservationCalendar'
import DomicilioModal from './DomicilioModal'
import { SUCURSALES, CIUDADES } from '../../catalog/constants'
import { branchManagementService } from '../../../services/branchManagementService'

function getHorarioSucursal(nombreSucursal) {
  if (!nombreSucursal) return { apertura: '08:00', cierre: '18:00' }
  const nombreLower = nombreSucursal.toLowerCase()
  if (nombreLower.includes('aeropuerto') || nombreLower.includes('terminal') || nombreLower.includes('el dorado')) {
    return { apertura: '00:00', cierre: '23:30' }
  }
  if (nombreLower.includes('domicilio') || nombreLower.includes('hotel') || nombreLower.includes('airbnb')) {
    return { apertura: '07:00', cierre: '19:00' }
  }
  return { apertura: '08:00', cierre: '18:00' }
}

function generarHoras(lugar, minHora, maxHora) {
  const { apertura, cierre } = getHorarioSucursal(lugar)
  const [hInicio, mInicio] = apertura.split(':').map(Number)
  const [hFin, mFin] = cierre.split(':').map(Number)
  
  let minMins = -1;
  if (minHora) {
    const [mh, mm] = minHora.split(':').map(Number)
    minMins = mh * 60 + mm
  }

  let maxMins = Infinity;
  if (maxHora) {
    const [mh, mm] = maxHora.split(':').map(Number)
    maxMins = mh * 60 + mm
  }

  const horas = []
  for (let h = hInicio; h <= hFin; h++) {
    for (const m of [0, 30]) {
      if (h === hInicio && m < mInicio) continue
      if (h === hFin && m > mFin) continue
      
      const totalMins = h * 60 + m
      if (totalMins <= minMins) continue
      if (totalMins > maxMins) continue
      
      horas.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return horas
}

function formatHoraAmPm(hora24) {
  if (!hora24) return ''
  const [h, m] = hora24.split(':').map(Number)
  const ampm = h >= 12 ? 'p. m.' : 'a. m.'
  let hour12 = h % 12
  if (hour12 === 0) hour12 = 12
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function UnifiedReservationConfigCard({ vehiculo, reserva, onCambio, c }) {
  const { t } = useTranslation()

  const bg         = c?.cardBg     || '#fff'
  const border     = c?.cardBorder || '#e2e8f0'
  const titleColor = c?.titleColor || 'var(--brand-secondary)'
  const textSecond = c?.textSecondary || 'var(--texto-second)'
  const textPrimary = c?.textPrimary || 'var(--texto-primary)'
  const accent     = c?.accentText || 'var(--brand-primary)'
  const isDark     = c?.isDark || false

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalReadOnly, setIsModalReadOnly] = useState(false)

  // Payment Options
  const metodoPago = reserva?.metodoPago
  const cashBranches = branchManagementService.getCashAuthorized()
  const paymentOptions = [
    {
      value: 'wompi',
      titulo: t('vehiculo.wompiPayment', 'Pago virtual con Wompi'),
      desc: t('vehiculo.wompiDesc', 'Habilita entregas a domicilio, aeropuerto o terminal.'),
    },
    {
      value: 'efectivo',
      titulo: t('vehiculo.cashPayment', 'Pago en efectivo'),
      desc: t('vehiculo.cashDesc', 'Obligatorio retirar y pagar directamente en sucursal.'),
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
  const horasRetiro = generarHoras(reserva?.sucursalRetiro)
  const horasDevolucion = generarHoras(reserva?.sucursalDevolucion, null, reserva?.horaInicio)

  const handleLugarChange = (campo, valor) => {
    onCambio(campo, valor)
    if (valor === 'domicilio' && !hasDomicilioData) {
      setIsModalReadOnly(false)
      setIsModalOpen(true)
    }
  }

  let diasReserva = 0
  let devolucionAnticipadaText = ''

  if (reserva?.fechaInicio && reserva?.fechaFin) {
    const startDate = new Date(`${reserva.fechaInicio}T00:00:00`)
    const endDate = new Date(`${reserva.fechaFin}T00:00:00`)
    const diffTime = endDate - startDate
    diasReserva = Math.max(1, Math.round(diffTime / 86400000))
    if (reserva.fechaInicio === reserva.fechaFin) diasReserva = 1

    if (reserva?.horaInicio && reserva?.horaFin) {
      const start = new Date(`${reserva.fechaInicio}T${reserva.horaInicio}:00`)
      const end = new Date(`${reserva.fechaFin}T${reserva.horaFin}:00`)
      const diffMs = end - start
      
      if (diffMs > 0) {
        const totalMinutes = Math.floor(diffMs / 60000)
        const totalHours = Math.floor(totalMinutes / 60)
        const days = Math.floor(totalHours / 24)
        const hours = totalHours % 24
        const mins = totalMinutes % 60

        if (diffMs < diasReserva * 86400000) {
          const parts = []
          if (days > 0) parts.push(`${days} ${days === 1 ? t('vehiculo.day', 'día') : t('vehiculo.days', 'días')}`)
          if (hours > 0) parts.push(`${hours} h`)
          if (mins > 0) parts.push(`${mins} min`)
          devolucionAnticipadaText = parts.join(', ')
        }
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
            {t('vehiculo.paymentMethodTitle', 'Seleccionar método de pago preferido')}
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
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: 12,
                  border: `1px solid ${activo ? accent : border}`,
                  background: activo ? (isDark ? 'rgba(var(--brand-primary-rgb),0.12)' : 'var(--brand-soft-light)') : 'transparent',
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
                  onChange={() => {
                    onCambio('metodoPago', value)
                    if (value === 'efectivo' && carBranch) {
                      onCambio('sucursalRetiro', carBranch)
                      onCambio('sucursalDevolucion', carBranch)
                    }
                  }}
                  style={{ accentColor: accent, width: 20, height: 20, cursor: 'pointer', flexShrink: 0 }}
                />
              </label>
            )
          })}
        </div>
      </div>

      {metodoPago === 'efectivo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: titleColor }}>
            <FaMapMarkerAlt color={accent} size={14} /> {t('vehiculo.cashPaymentBranchLabel', 'Punto autorizado para pago en efectivo')}
          </span>
          <div style={{
            padding: '12px 16px',
            borderRadius: 12,
            border: `1px solid ${border}`,
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            fontSize: 14,
            fontWeight: 500,
            color: textPrimary,
          }}>
            <span>{vehiculo?.sucursal ? `${vehiculo.sucursal}${branchObj?.ciudad ? ` · ${branchObj.ciudad}` : ''}` : ''}</span>
          </div>
        </div>
      )}

      {/* SECCIÓN: LUGAR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Lugar Retiro */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: titleColor }}>
              <FaMapMarkerAlt color={accent} size={14} /> {t('vehiculo.selectPickupLoc', 'Seleccionar lugar de retiro')}
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
                style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 11, color: accent, fontWeight: 700, cursor: 'pointer', padding: '4px 8px', background: 'rgba(var(--brand-primary-rgb),0.1)', borderRadius: 6, width: 'fit-content' }}
              >
                <FaPencilAlt size={10} />
                {hasDomicilioData
                  ? t('vehiculo.edit', 'Editar')
                  : t('vehiculo.fillAddressBtn', 'Ingresar dirección')}
              </div>
            )}
          </div>
          
          {/* Lugar Devolución */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: titleColor }}>
              <FaMapMarkerAlt color={accent} size={14} /> {t('vehiculo.selectReturnLoc', 'Seleccionar lugar de devolución')}
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
                style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 11, color: accent, fontWeight: 700, cursor: 'pointer', padding: '4px 8px', background: 'rgba(var(--brand-primary-rgb),0.1)', borderRadius: 6, width: 'fit-content' }}
              >
                {reserva?.sucursalRetiro === 'domicilio' ? <FaEye size={12} /> : <FaPencilAlt size={10} />}
                {hasDomicilioData
                  ? (reserva?.sucursalRetiro === 'domicilio' ? t('vehiculo.view', 'Ver') : t('vehiculo.edit', 'Editar'))
                  : t('vehiculo.fillAddressBtn', 'Ingresar dirección')}
              </div>
            )}
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
            c={c}
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

        {/* INFO ALERT: HORA MÁXIMA */}
        {reserva?.horaInicio && diasReserva > 0 && (
          <div style={{ marginTop: 8, padding: 12, borderRadius: 12, backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', gap: 12 }}>
            <div style={{ color: '#3b82f6', marginTop: 2 }}>
              <FaInfoCircle size={16} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>
                {t('vehiculo.maxReturnTime', 'Hora máxima de devolución:')} {formatHoraAmPm(reserva.horaInicio)}
              </span>
              <span style={{ fontSize: 12, color: textSecond, lineHeight: 1.4 }}>
                {t('vehiculo.maxReturnTimeDesc', `Para cumplir con los ${diasReserva} ${diasReserva === 1 ? 'día' : 'días'} de tu reserva (retiro a las ${formatHoraAmPm(reserva.horaInicio)}), la hora límite de entrega es a las ${formatHoraAmPm(reserva.horaInicio)}. Si seleccionas una hora anterior, se calculará devolución anticipada.`)}
              </span>
            </div>
          </div>
        )}

        {/* SECCIÓN: HORAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {/* Hora Retiro */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: titleColor }}>
              <FaClock color={accent} size={14} /> {t('vehiculo.selectPickupTime', 'Selecciona Hora de Retiro')}
            </span>
            <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent' }}>
              <select
                value={reserva?.horaInicio || ''}
                onChange={e => onCambio('horaInicio', e.target.value)}
                style={selectStyle}
              >
                <option value="">{t('vehiculo.selectTime', 'Seleccionar')}</option>
                {horasRetiro.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          {/* Hora Devolución */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: titleColor }}>
              <FaClock color={accent} size={14} /> {t('vehiculo.selectReturnTime', 'Selecciona Hora de Devolución')}
            </span>
            <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent' }}>
              <select
                value={reserva?.horaFin || ''}
                onChange={e => onCambio('horaFin', e.target.value)}
                style={selectStyle}
              >
                <option value="">{t('vehiculo.selectTime', 'Seleccionar')}</option>
                {horasDevolucion.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </div>

        {diasReserva > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: 'rgba(var(--brand-primary-rgb),0.05)', border: `1px solid rgba(var(--brand-primary-rgb),0.15)` }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: textSecond }}>
                <FaHourglassHalf color={textSecond} size={14} /> {t('vehiculo.rentalDuration', 'Duración del alquiler')}
              </span>
              <span style={{ fontSize: 14, fontWeight: 800, color: titleColor }}>
                {diasReserva} {diasReserva === 1 ? t('vehiculo.day', 'día') : t('vehiculo.days', 'días')}
              </span>
            </div>
            
            {devolucionAnticipadaText && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: 'rgba(var(--brand-primary-rgb),0.05)', border: `1px solid rgba(var(--brand-primary-rgb),0.15)` }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: textSecond }}>
                  <FaClock color={textSecond} size={14} /> {t('vehiculo.earlyReturn', 'Devolución anticipada')}
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: titleColor }}>
                  {devolucionAnticipadaText}
                </span>
              </div>
            )}
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
