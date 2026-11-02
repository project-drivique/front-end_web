import { FaCreditCard } from 'react-icons/fa'
import { formatCurrency } from '@/utils/currencyUtils'

export default function EsPendienteWompi({ handlePagarWompi, moneda, pagandoWompi, reserva, t, totalCalculado, wompiCardRef }) {
  return (
    <div className="modal-wompi-card" ref={wompiCardRef}>
              <div className="modal-wompi-subcard">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FaCreditCard style={{ fontSize: '22px', color: 'var(--brand-primary, #1d4ed8)' }} />
                  <h3 className="modal-wompi-titulo" style={{ margin: 0 }}>
                    {t('reservas.pendingDigitalPayment', { defaultValue: 'Pago Digital Pendiente' })}
                  </h3>
                </div>
                <p className="modal-wompi-desc">
                  {t('reservas.digitalPendingDesc', {
                    defaultValue: 'Tus documentos fueron aprobados. Tu reserva está lista para pago. Completa el pago seguro en Wompi o confirma el pago para habilitar tu contrato de alquiler.'
                  })}
                </p>
  
                {/* Caja de Total a pagar */}
                <div className="modal-wompi-total-box">
                  <span className="modal-wompi-total-label">
                    {t('reservas.totalToPay', { defaultValue: 'TOTAL A PAGAR:' })}
                  </span>
                  <strong className="modal-wompi-total-val">
                    {formatCurrency(totalCalculado, moneda)}
                  </strong>
                </div>
  
                {/* Botón de Pago en Wompi */}
                <button
                  type="button"
                  id="btn-pagar-wompi"
                  onClick={handlePagarWompi}
                  disabled={pagandoWompi}
                  className="modal-wompi-btn"
                >
                  <FaCreditCard size={16} />
                  <span>{pagandoWompi ? t('reservas.redirectingToWompi', { defaultValue: 'Redirigiendo a Wompi…' }) : t('reservas.payWithWompi', { defaultValue: 'Pagar con Wompi' })}</span>
                </button>
  
                {/* Plazo para pagar en Wompi */}
                <div className="modal-cash-deadline-box" style={{ marginTop: '16px', width: '100%' }}>
                  <p className="modal-cash-deadline-title">
                    {t('reservas.paymentDeadline', { defaultValue: 'PLAZO PARA PAGAR' })}
                  </p>
                  <p className="modal-cash-deadline-text">
                    {t('reservas.wompiDeadlineNotice', {
                      horas: reserva.horasLimitePago || 8,
                      defaultValue: 'Tienes aproximadamente {{horas}} horas desde ahora para realizar el pago seguro en línea. Si no realizas el pago dentro de este plazo, la reserva se cancelará automáticamente.'
                    })}
                  </p>
                </div>
  
              </div>
            </div>
  )
}
