import { FaCar, FaCalendarAlt, FaClock, FaRegCalendarCheck, FaMapMarkerAlt, FaCreditCard, FaShieldAlt, FaScroll, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa'
import { formatCurrency } from '@/utils/currencyUtils'

const fechaBonita = (fecha, idioma) => {
  if (!fecha) return '—'
  try {
    const str = String(fecha).trim()
    const d = str.includes('T') ? new Date(str) : new Date(`${str}T00:00:00Z`)
    if (isNaN(d.getTime())) return str
    return new Intl.DateTimeFormat(idioma || 'es', {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
    }).format(d).replace('.', '')
  } catch {
    return String(fecha || '—')
  }
}
const formatFechaHora = (fecha, idioma) => {
  if (!fecha) return ''
  try {
    const d = new Date(fecha)
    if (isNaN(d.getTime())) return String(fecha)
    return new Intl.DateTimeFormat(idioma || 'es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(d).replace(/\./g, '')
  } catch {
    return String(fecha)
  }
}

export default function ModalReservaInfoCard({ estado, formatHoraAmPm, i18n, imagenAuto, lugarDevolucion, lugarRetiro, medioPagoTexto, moneda, nombreAuto, proteccion, reserva, t, totalCalculado }) {
  return (
    <div className="modal-reserva-info-card">
            {/* 1. Tarjeta de galería / Imagen del carro */}
            {imagenAuto && (
              <div className="modal-reserva-img-box">
                <img
                  src={imagenAuto}
                  alt={nombreAuto}
                  className="modal-reserva-img"
                />
              </div>
            )}
  
            {/* 2. Tarjeta de datos de la reserva (2 columnas) */}
            <div className="modal-reserva-datos-grid">
              {/* Fila 1: Vehículo / Fecha de retiro */}
              <div className="modal-reserva-dato-celda">
                <div className="modal-dato-icon">
                  <FaCar />
                </div>
                <div className="modal-dato-texto">
                  <span className="modal-dato-label">{t('reservas.vehicle', { defaultValue: 'Vehículo' })}</span>
                  <strong className="modal-dato-val">{nombreAuto}</strong>
                </div>
              </div>
  
              <div className="modal-reserva-dato-celda">
                <div className="modal-dato-icon">
                  <FaCalendarAlt />
                </div>
                <div className="modal-dato-texto">
                  <span className="modal-dato-label">{t('reservas.pickupDate', { defaultValue: 'Fecha de retiro' })}</span>
                  <strong className="modal-dato-val">{fechaBonita(reserva.fechaInicio, i18n.resolvedLanguage)}</strong>
                </div>
              </div>
  
              <div className="modal-reserva-dato-celda">
                <div className="modal-dato-icon">
                  <FaClock />
                </div>
                <div className="modal-dato-texto">
                  <span className="modal-dato-label">{t('reservas.pickupTime', { defaultValue: 'Hora de retiro' })}</span>
                  <strong className="modal-dato-val">{formatHoraAmPm(reserva.horaInicio) || 'N/A'}</strong>
                </div>
              </div>
  
              {/* Fila 2: Fecha de devolución / Hora de devolución */}
              <div className="modal-reserva-dato-celda">
                <div className="modal-dato-icon">
                  <FaRegCalendarCheck />
                </div>
                <div className="modal-dato-texto">
                  <span className="modal-dato-label">{t('reservas.returnDate', { defaultValue: 'Fecha de devolución' })}</span>
                  <strong className="modal-dato-val">{fechaBonita(reserva.fechaFin, i18n.resolvedLanguage)}</strong>
                </div>
              </div>
  
              <div className="modal-reserva-dato-celda">
                <div className="modal-dato-icon">
                  <FaClock />
                </div>
                <div className="modal-dato-texto">
                  <span className="modal-dato-label">{t('reservas.returnTime', { defaultValue: 'Hora de devolución' })}</span>
                  <strong className="modal-dato-val">{formatHoraAmPm(reserva.horaFin) || 'N/A'}</strong>
                </div>
              </div>
  
              <div className="modal-reserva-dato-celda">
                <div className="modal-dato-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="modal-dato-texto">
                  <span className="modal-dato-label">{t('reservas.pickupLocation', { defaultValue: 'Lugar de retiro' })}</span>
                  <strong className="modal-dato-val" title={lugarRetiro}>{lugarRetiro}</strong>
                </div>
              </div>
  
              {/* Fila 3: Lugar de devolución / Medio de pago */}
              <div className="modal-reserva-dato-celda">
                <div className="modal-dato-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="modal-dato-texto">
                  <span className="modal-dato-label">{t('reservas.returnLocation', { defaultValue: 'Lugar de devolución' })}</span>
                  <strong className="modal-dato-val" title={lugarDevolucion}>{lugarDevolucion}</strong>
                </div>
              </div>
  
              <div className="modal-reserva-dato-celda">
                <div className="modal-dato-icon">
                  <FaCreditCard />
                </div>
                <div className="modal-dato-texto">
                  <span className="modal-dato-label">{t('reservas.paymentMethod', { defaultValue: 'Medio de pago' })}</span>
                  <strong className="modal-dato-val" title={medioPagoTexto}>{medioPagoTexto}</strong>
                </div>
              </div>
  
              {/* Fila 4: Protección / Referencia */}
              <div className="modal-reserva-dato-celda">
                <div className="modal-dato-icon">
                  <FaShieldAlt />
                </div>
                <div className="modal-dato-texto">
                  <span className="modal-dato-label">{t('reservas.protection', { defaultValue: 'Protección' })}</span>
                  <strong className="modal-dato-val">{proteccion}</strong>
                </div>
              </div>
  
              <div className="modal-reserva-dato-celda">
                <div className="modal-dato-icon">
                  <FaScroll />
                </div>
                <div className="modal-dato-texto">
                  <span className="modal-dato-label">{t('reservas.reference', { defaultValue: 'Referencia' })}</span>
                  <strong className="modal-dato-val referencia-val" title={reserva.codigo || reserva.referencia || reserva.id}>{reserva.codigo || reserva.referencia || reserva.id}</strong>
                </div>
              </div>
  
              {reserva.createdAt && (
                <div className="modal-reserva-dato-celda">
                  <div className="modal-dato-icon">
                    <FaClock />
                  </div>
                  <div className="modal-dato-texto">
                    <span className="modal-dato-label">{t('reservas.createdDate', { defaultValue: 'Fecha de solicitud' })}</span>
                    <strong className="modal-dato-val">{formatFechaHora(reserva.createdAt, i18n.resolvedLanguage)}</strong>
                  </div>
                </div>
              )}
  
              {/* Fila 5: Total / Estado */}
              <div className="modal-reserva-dato-celda">
                <div className="modal-dato-icon brand-tint">
                  <FaMoneyBillWave />
                </div>
                <div className="modal-dato-texto">
                  <span className="modal-dato-label">{t('reservas.total', { defaultValue: 'Total' })}</span>
                  <strong className="modal-dato-val">{formatCurrency(totalCalculado, moneda)}</strong>
                </div>
              </div>
  
              <div className="modal-reserva-dato-celda">
                <div className="modal-dato-icon brand-tint">
                  <FaCheckCircle />
                </div>
                <div className="modal-dato-texto">
                  <span className="modal-dato-label">{t('reservas.status', { defaultValue: 'Estado' })}</span>
                  <strong className="modal-dato-val status-val">{estado.texto}</strong>
                </div>
              </div>
            </div>
          </div>
  )
}
