import { FaDollarSign, FaChartLine, FaCalendarCheck, FaCheckCircle } from 'react-icons/fa'
import { formatCurrency } from '../../../../utils/currencyUtils'

export default function ManagementDashboardPart3({ c, isBranchManager, moneda, occupancy, rentedVehicles, summary, t, tasaUSD, totalVehicles }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
            {/* KPI 1: Ingresos del Mes */}
            <div style={{ background: c.card, padding: 18, borderRadius: 14, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <FaDollarSign style={{ fontSize: 13, color: 'var(--brand-primary, #2563eb)' }} aria-hidden="true" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.textMuted }}>{t('hc.ingresos_del_mes', 'Ingresos del Mes')}</span>
                </div>
              </div>
              <strong style={{ fontSize: 22, fontWeight: 800, color: c.text, display: 'block' }}>
                {formatCurrency(summary.monthlyRevenue || 0, moneda, tasaUSD)}
              </strong>
              <span style={{ fontSize: 11, color: c.textMuted, marginTop: 4, display: 'block' }}>{isBranchManager ? t('hc2.facturacion_acumulada_en_la_sucursal', 'Facturación acumulada en la sucursal') : t('hc2.facturacion_acumulada_de_todas_las_suc', 'Facturación acumulada de todas las sucursales')}</span>
            </div>
  
            {/* KPI 2: Tasa de Ocupación */}
            <div style={{ background: c.card, padding: 18, borderRadius: 14, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <FaChartLine style={{ fontSize: 13, color: 'var(--brand-primary, #2563eb)' }} aria-hidden="true" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.textMuted }}>{t('hc.tasa_de_ocupacion', 'Tasa de Ocupación')}</span>
                </div>
              </div>
              <strong style={{ fontSize: 22, fontWeight: 800, color: c.text, display: 'block' }}>
                {occupancy}%
              </strong>
              <span style={{ fontSize: 11, color: c.textMuted, marginTop: 4, display: 'block' }}>{rentedVehicles} de {totalVehicles} vehículo{totalVehicles === 1 ? '' : 's'} alquilado{rentedVehicles === 1 ? '' : 's'}</span>
            </div>
  
            {/* KPI 3: Entregas de Hoy */}
            <div style={{ background: c.card, padding: 18, borderRadius: 14, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <FaCalendarCheck style={{ fontSize: 13, color: '#10b981' }} aria-hidden="true" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.textMuted }}>{t('hc.entregas_de_hoy', 'Entregas de Hoy')}</span>
                </div>
              </div>
              <strong style={{ fontSize: 22, fontWeight: 800, color: c.text, display: 'block' }}>
                {summary.todayDeliveries} recogidas
              </strong>
              <span style={{ fontSize: 11, color: c.textMuted, marginTop: 4, display: 'block' }}>{t('hc.clientes_en_mostrador', 'Clientes en mostrador')}</span>
            </div>
  
            {/* KPI 4: Devoluciones de Hoy */}
            <div style={{ background: c.card, padding: 18, borderRadius: 14, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <FaCheckCircle style={{ fontSize: 13, color: '#f59e0b' }} aria-hidden="true" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.textMuted }}>{t('hc.devoluciones_de_hoy', 'Devoluciones de Hoy')}</span>
                </div>
              </div>
              <strong style={{ fontSize: 22, fontWeight: 800, color: c.text, display: 'block' }}>
                {summary.todayReturns} retornos
              </strong>
              <span style={{ fontSize: 11, color: c.textMuted, marginTop: 4, display: 'block' }}>{isBranchManager ? t('hc2.vehiculos_retornando_a_la_sucursal', 'Vehículos retornando a la sucursal') : t('hc2.vehiculos_retornando_a_las_sucursales', 'Vehículos retornando a las sucursales')}</span>
            </div>
          </div>
  )
}
