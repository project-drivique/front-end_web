import { FaClipboardList, FaArrowRight } from 'react-icons/fa'
import { formatCurrency } from '@/utils/currencyUtils'

export default function ResumenMovilBarTrigger({ moneda, reserva, setModalResumenMovil, t, totalReserva, vehiculo }) {
  return (
    <div className="resumen-movil-bar-trigger">
              <button
                type="button"
                className="btn-resumen-movil-toggle"
                onClick={() => setModalResumenMovil(true)}
              >
                <div className="resumen-movil-toggle-left">
                  <div className="resumen-movil-icon-wrapper">
                    <FaClipboardList size={16} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <span className="resumen-movil-toggle-title">
                      {t('reservas.viewSummary', 'Resumen de reserva')}
                    </span>
                    <span className="resumen-movil-toggle-sub">
                      {vehiculo.nombre} {reserva.fechaInicio ? `· ${reserva.fechaInicio} ${t('common.to', 'al')} ${reserva.fechaFin || ''}` : ''}
                    </span>
                  </div>
                </div>
                <div className="resumen-movil-toggle-right">
                  <strong className="resumen-movil-toggle-price">
                    {formatCurrency(totalReserva, moneda)}
                  </strong>
                  <span className="resumen-movil-toggle-badge">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {t('reservas.openSummary', 'Ver resumen')} <FaArrowRight size={8} />
                    </span>
                  </span>
                </div>
              </button>
            </div>
  )
}
