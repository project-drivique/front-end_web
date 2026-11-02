import logo from '@/assets/logo.png'
import { formatCurrency } from '@/utils/currencyUtils'

export default function EsPendienteEfectivo({ brand, ciudadPago, direccionPago, moneda, reserva, sucursalPago, t, totalCalculado }) {
  return (
    <div className="modal-cash-card">
              {/* SUBTARJETA QUE CONTIENE TODO EL CONTENIDO DESDE EL LOGO HASTA EL PLAZO */}
              <div className="modal-cash-subcard">
                {/* Logo Badge Circular */}
                <div className="modal-cash-logo-badge">
                  <img
                    src={brand?.logoDataUrl || logo}
                    alt={brand?.name || 'Drivique'}
                  />
                </div>
  
                {/* Titulo */}
                <h3 className="modal-cash-titulo">
                  {t('vehiculo.cashPaymentTitle', { defaultValue: 'Pago en sucursal' })}
                </h3>
  
                {/* Subtitulo */}
                <p className="modal-cash-desc">
                  {t('vehiculo.cashReservationRegisteredDesc', {
                    defaultValue: `Tu reserva quedó registrada. Para confirmarla, realiza el pago en efectivo en el punto autorizado ${sucursalPago}.`,
                    sucursal: sucursalPago
                  })}
                </p>
  
                {/* Tarjeta de Resumen con datos */}
                <div className="modal-cash-summary">
                  <div className="modal-cash-row">
                    <span className="modal-cash-row-label">{t('reservas.reference', { defaultValue: 'Referencia' }).replace(/:$/, '')}:</span>
                    <strong className="modal-cash-ref-val">{reserva.id}</strong>
                  </div>
                  <div className="modal-cash-row">
                    <span className="modal-cash-row-label">{t('reservas.branch', { defaultValue: 'Sucursal' }).replace(/:$/, '')}:</span>
                    <strong className="modal-cash-row-val">{sucursalPago}</strong>
                  </div>
                  <div className="modal-cash-row">
                    <span className="modal-cash-row-label">{t('reservas.city', { defaultValue: 'Ciudad' }).replace(/:$/, '')}:</span>
                    <strong className="modal-cash-row-val">{ciudadPago}</strong>
                  </div>
                  <div className="modal-cash-row">
                    <span className="modal-cash-row-label">{t('reservas.address', { defaultValue: 'Dirección' }).replace(/:$/, '')}:</span>
                    <strong className="modal-cash-row-val">{direccionPago}</strong>
                  </div>
                  <div className="modal-cash-divider" />
                  <div className="modal-cash-row total">
                    <span className="modal-cash-total-label">{t('reservas.totalToPay', { defaultValue: 'TOTAL A PAGAR:' })}</span>
                    <strong className="modal-cash-total-val">{formatCurrency(totalCalculado, moneda)}</strong>
                  </div>
                </div>
  
                {/* Plazo para pagar */}
                <div className="modal-cash-deadline-box">
                  <p className="modal-cash-deadline-title">
                    {t('reservas.paymentDeadline', { defaultValue: 'PLAZO PARA PAGAR' })}
                  </p>
                  <p className="modal-cash-deadline-text">
                    {t('reservas.cashDeadlineNotice', {
                      horas: reserva.horasLimitePago || 8,
                      defaultValue: `Tienes aproximadamente ${reserva.horasLimitePago || 8} horas desde ahora para acercarte a la sucursal y realizar el pago. Si no realizas el pago dentro de este plazo, la reserva se cancelará automáticamente.`
                    })}
                  </p>
                </div>
              </div>
            </div>
  )
}
