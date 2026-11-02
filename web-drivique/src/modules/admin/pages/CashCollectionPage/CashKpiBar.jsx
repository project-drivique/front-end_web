import { FaMoneyBillWave, FaCashRegister, FaCheckCircle } from 'react-icons/fa'
import { formatCurrency } from '../../../../utils/currencyUtils'

export default function CashKpiBar({ cobradasHoy, moneda, pendientesEfectivo, t, tasaUSD, totalRecaudadoHoy }) {
  return (
    <div className="cash-kpi-bar">
              {/* Tarjeta 1 */}
              <div className="cash-kpi-item-light">
                <div className="cash-kpi-header-light" style={{ color: '#f59e0b' }}>
                  <FaMoneyBillWave />
                  <span>{t('admin.cash.kpi.pendingCash', 'Pendientes (Efectivo)')}</span>
                </div>
                <strong className="cash-kpi-val-light">{pendientesEfectivo.length}</strong>
                <div className="cash-kpi-progress-bg">
                  <div className="cash-kpi-progress-fill" style={{ width: '100%', background: '#f59e0b' }}></div>
                </div>
                <span className="cash-kpi-subtitle-light">{t('admin.cash.kpi.pendingReservations', 'Reservas por cobrar')}</span>
              </div>
  
              {/* Tarjeta 2 */}
              <div className="cash-kpi-item-light">
                <div className="cash-kpi-header-light" style={{ color: '#10b981' }}>
                  <FaCashRegister />
                  <span>{t('admin.cash.kpi.collectedToday', 'Recaudado Hoy (Caja)')}</span>
                </div>
                <strong className="cash-kpi-val-light">{formatCurrency(totalRecaudadoHoy, moneda, tasaUSD)}</strong>
                <div className="cash-kpi-progress-bg">
                  <div className="cash-kpi-progress-fill" style={{ width: '100%', background: '#10b981' }}></div>
                </div>
                <span className="cash-kpi-subtitle-light">{t('admin.cash.kpi.confirmedIncome', 'Ingresos confirmados')}</span>
              </div>
  
              {/* Tarjeta 3 */}
              <div className="cash-kpi-item-light">
                <div className="cash-kpi-header-light" style={{ color: 'var(--brand-primary, #3b82f6)' }}>
                  <FaCheckCircle />
                  <span>{t('admin.cash.kpi.paymentsToday', 'Cobros Realizados Hoy')}</span>
                </div>
                <strong className="cash-kpi-val-light">{cobradasHoy.length}</strong>
                <div className="cash-kpi-progress-bg">
                  <div className="cash-kpi-progress-fill" style={{ width: '100%', background: 'var(--brand-primary, #3b82f6)' }}></div>
                </div>
                <span className="cash-kpi-subtitle-light">{t('admin.cash.kpi.receiptsIssued', 'Comprobantes emitidos')}</span>
              </div>
            </div>
  )
}
