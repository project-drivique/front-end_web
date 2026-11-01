import { useTranslation } from 'react-i18next'
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaCreditCard, FaPencilAlt, FaEye, FaHourglassHalf, FaExclamationTriangle } from 'react-icons/fa'
import { useState, useEffect, useMemo } from 'react'
import ReservationCalendar from './ReservationCalendar'
import DomicilioModal from './DomicilioModal'
import AlertModal from '../../catalog/components/AlertModal'
import { SUCURSALES, CIUDADES } from '../../catalog/constants'
import {
  generarHoras,
  formatHoraAmPm,
  calcularDuracionYAnticipada,
  ComputoReservaBanner,
  OneDayReservationModal,
} from './UnifiedReservationHelpers'

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
  const [showOneDayModal, setShowOneDayModal] = useState(false)
  const [conflictAlert, setConflictAlert] = useState(null)

  const metodoPago = reserva?.metodoPago
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

  const carBranch = vehiculo?.sucursal
  const branchObj = SUCURSALES.find(s => s.nombre === carBranch)
  const cityObj   = branchObj ? CIUDADES.find(city => city.nombre === branchObj.ciudad) : null

  const opcionesEntrega = carBranch ? [{ value: carBranch, label: t('vehiculo.pickupAtBranch', { sucursal: carBranch }) }] : []
  if (reserva?.metodoPago !== 'efectivo') {
    opcionesEntrega.push({ value: 'domicilio', label: t('vehiculo.deliveryHome', 'A domicilio') })
    if (cityObj?.tieneAeropuerto) opcionesEntrega.push({ value: 'aeropuerto', label: t('vehiculo.deliveryAirport', 'Aeropuerto') })
    if (cityObj?.tieneTerminal)   opcionesEntrega.push({ value: 'terminal',   label: t('vehiculo.deliveryTerminal', 'Entrega en terminal') })
  }

  const opcionesDevolucion = carBranch ? [{ value: carBranch, label: t('vehiculo.returnAtBranch', { sucursal: carBranch }) }] : []
  if (reserva?.metodoPago !== 'efectivo') {
    opcionesDevolucion.push({ value: 'domicilio', label: t('vehiculo.returnHome', 'A domicilio') })
    if (cityObj?.tieneAeropuerto) opcionesDevolucion.push({ value: 'aeropuerto', label: t('vehiculo.returnAirport', 'Aeropuerto') })
    if (cityObj?.tieneTerminal)   opcionesDevolucion.push({ value: 'terminal',   label: t('vehiculo.pickupTerminal', 'Recoger en terminal') })
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
  
  const horasRetiro = useMemo(() => {
    return generarHoras(reserva?.sucursalRetiro, null, null, reserva?.fechaInicio)
  }, [reserva?.sucursalRetiro, reserva?.fechaInicio])

  const horasDevolucion = useMemo(() => {
    const fInicioStr = reserva?.fechaInicio ? String(reserva.fechaInicio).split('T')[0] : ''
    const fFinStr = reserva?.fechaFin ? String(reserva.fechaFin).split('T')[0] : ''
    const esMismoDia = Boolean(fInicioStr && fFinStr && fInicioStr === fFinStr)

    const minH = esMismoDia ? (reserva?.horaInicio || null) : null
    const maxH = !esMismoDia ? (reserva?.horaInicio || null) : null

    return generarHoras(reserva?.sucursalDevolucion, minH, maxH, reserva?.fechaFin)
  }, [reserva])

  useEffect(() => {
    if (reserva?.fechaInicio && horasRetiro?.length > 0) {
      if (!reserva?.horaInicio || !horasRetiro.includes(reserva.horaInicio)) {
        const defaultHora = horasRetiro.includes('10:00') ? '10:00' : horasRetiro[0]
        onCambio('horaInicio', defaultHora)
      }
    } else if (reserva?.fechaInicio && horasRetiro?.length === 0 && reserva?.horaInicio) {
      onCambio('horaInicio', '')
    }
  }, [reserva?.fechaInicio, horasRetiro]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (reserva?.fechaFin && horasDevolucion?.length > 0) {
      if (!reserva?.horaFin || !horasDevolucion.includes(reserva.horaFin)) {
        const defaultFin = horasDevolucion.includes(reserva?.horaInicio)
          ? reserva.horaInicio
          : horasDevolucion[horasDevolucion.length - 1] || horasDevolucion[0]
        onCambio('horaFin', defaultFin)
      }
    } else if (reserva?.fechaFin && horasDevolucion?.length === 0 && reserva?.horaFin) {
      onCambio('horaFin', '')
    }
  }, [reserva?.fechaFin, reserva?.horaInicio, horasDevolucion]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLugarChange = (campo, valor) => {
    const otherValor = campo === 'sucursalRetiro' ? reserva?.sucursalDevolucion : reserva?.sucursalRetiro
    const hasConflict = valor === 'domicilio' && otherValor === 'domicilio'

    if (hasConflict) {
      const prevValue = campo === 'sucursalRetiro' ? (reserva?.sucursalRetiro || '') : (reserva?.sucursalDevolucion || '')
      setConflictAlert({
        campo,
        valor,
        prevValue,
        openDomicilio: !hasDomicilioData,
      })
      return
    }

    onCambio(campo, valor)
    if (valor === 'domicilio' && !hasDomicilioData) {
      setIsModalReadOnly(false)
      setIsModalOpen(true)
    }
  }

  const { diasReserva, devolucionAnticipadaText } = calcularDuracionYAnticipada(reserva, t)

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
          <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent' }}>
            <input
              type="text"
              readOnly
              value={branchObj?.ciudad ? `${carBranch || reserva?.sucursalPagoEfectivo} · ${branchObj.ciudad}` : (carBranch || reserva?.sucursalPagoEfectivo || '')}
              style={{ ...selectStyle, cursor: 'default', background: 'transparent', outline: 'none', border: 'none', padding: 0 }}
            />
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
                  setIsModalReadOnly(reserva?.sucursalRetiro === 'domicilio')
                  setIsModalOpen(true)
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
              if (fechaInicio && fechaInicio === fechaFin) {
                setShowOneDayModal(true)
              }
            }}
          />
        </div>

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

        <ComputoReservaBanner
          reserva={reserva}
          diasReserva={diasReserva}
          textPrimary={textPrimary}
          textSecond={textSecond}
          t={t}
        />

        {/* SECCIÓN: HORAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: titleColor }}>
              <FaClock color={accent} size={14} /> {t('vehiculo.selectPickupTime', 'Selecciona Hora de Retiro')}
            </span>
            <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent' }}>
              <select
                value={reserva?.horaInicio || ''}
                onChange={e => {
                  const val = e.target.value
                  onCambio('horaInicio', val)
                  if (val && !reserva?.horaFin) {
                    onCambio('horaFin', val)
                  }
                }}
                style={selectStyle}
              >
                <option value="">{t('vehiculo.selectTime', 'Seleccionar')}</option>
                {horasRetiro.map(h => <option key={h} value={h}>{formatHoraAmPm(h)}</option>)}
              </select>
            </div>
          </div>

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
                {horasDevolucion.map(h => <option key={h} value={h}>{formatHoraAmPm(h)}</option>)}
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

      {conflictAlert && (
        <AlertModal
          icon={<FaExclamationTriangle size={18} color="var(--texto-acento)" />}
          titulo={t('vehiculo.conflictLocationTitle', 'El lugar de retiro y devolución deben ser el mismo')}
          mensaje={t('vehiculo.conflictLocationDesc', 'Al seleccionar domicilio en ambos campos, el retiro y la devolución se realizarán en la misma dirección.')}
          secondaryText={t('common.cancel', 'Cancelar')}
          onSecondary={() => {
            onCambio(conflictAlert.campo, conflictAlert.prevValue)
            setConflictAlert(null)
          }}
          primaryText={t('common.accept', 'Aceptar')}
          onPrimary={() => {
            const { campo, valor, openDomicilio } = conflictAlert
            onCambio(campo, valor)
            setConflictAlert(null)
            if (openDomicilio) {
              setIsModalReadOnly(false)
              setIsModalOpen(true)
            }
          }}
          onCerrar={() => {
            onCambio(conflictAlert.campo, conflictAlert.prevValue)
            setConflictAlert(null)
          }}
          maxWidth={320}
        />
      )}

      <OneDayReservationModal
        show={showOneDayModal}
        onClose={() => setShowOneDayModal(false)}
        c={c}
        textPrimary={textPrimary}
        textSecond={textSecond}
        t={t}
      />
    </div>
  )
}
