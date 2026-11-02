import { FaIdCard, FaCheckCircle, FaTimesCircle, FaShieldAlt } from 'react-icons/fa'

export default function CashKpiBar({ conteoAprobados, conteoPendientes, conteoRechazados, t, verifications }) {
  return (
    <div className="cash-kpi-bar doc-kpi-bar">
              {/* KPI 1: Pendientes */}
              <div className="cash-kpi-item-light" style={{ background: 'var(--city-card, #ffffff)', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="cash-kpi-header-light" style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', fontWeight: 700, marginBottom: 8 }}>
                  <FaIdCard />
                  <span>{t('admin.documents.kpis.pending', 'Pendientes por Validar')}</span>
                </div>
                <strong className="cash-kpi-val-light" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--city-text, #0f172a)', display: 'block', marginBottom: 8 }}>
                  {conteoPendientes}
                </strong>
                <div className="cash-kpi-progress-bg" style={{ width: '100%', height: 4, background: 'var(--city-border, #f1f5f9)', borderRadius: 2, marginBottom: 8 }}>
                  <div className="cash-kpi-progress-fill" style={{ width: '100%', height: '100%', background: '#f59e0b', borderRadius: 2 }}></div>
                </div>
                <span className="cash-kpi-subtitle-light" style={{ fontSize: '11.5px', color: 'var(--city-muted, #64748b)' }}>{t('admin.documents.kpis.pendingSub', 'En espera de revisión')}</span>
              </div>
  
              {/* KPI 2: Aprobados por Sucursal */}
              <div className="cash-kpi-item-light" style={{ background: 'var(--city-card, #ffffff)', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="cash-kpi-header-light" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', fontWeight: 700, marginBottom: 8 }}>
                  <FaCheckCircle />
                  <span>{t('admin.documents.kpis.approved', 'Aprobados por Sucursal')}</span>
                </div>
                <strong className="cash-kpi-val-light" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--city-text, #0f172a)', display: 'block', marginBottom: 8 }}>
                  {conteoAprobados}
                </strong>
                <div className="cash-kpi-progress-bg" style={{ width: '100%', height: 4, background: 'var(--city-border, #f1f5f9)', borderRadius: 2, marginBottom: 8 }}>
                  <div className="cash-kpi-progress-fill" style={{ width: '100%', height: '100%', background: '#10b981', borderRadius: 2 }}></div>
                </div>
                <span className="cash-kpi-subtitle-light" style={{ fontSize: '11.5px', color: 'var(--city-muted, #64748b)' }}>{t('admin.documents.kpis.approvedSub', 'Verificados por el encargado')}</span>
              </div>
  
              {/* KPI 3: Rechazados por Sucursal */}
              <div className="cash-kpi-item-light" style={{ background: 'var(--city-card, #ffffff)', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="cash-kpi-header-light" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', fontWeight: 700, marginBottom: 8 }}>
                  <FaTimesCircle />
                  <span>{t('admin.documents.kpis.rejected', 'Rechazados por Sucursal')}</span>
                </div>
                <strong className="cash-kpi-val-light" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--city-text, #0f172a)', display: 'block', marginBottom: 8 }}>
                  {conteoRechazados}
                </strong>
                <div className="cash-kpi-progress-bg" style={{ width: '100%', height: 4, background: 'var(--city-border, #f1f5f9)', borderRadius: 2, marginBottom: 8 }}>
                  <div className="cash-kpi-progress-fill" style={{ width: '100%', height: '100%', background: '#ef4444', borderRadius: 2 }}></div>
                </div>
                <span className="cash-kpi-subtitle-light" style={{ fontSize: '11.5px', color: 'var(--city-muted, #64748b)' }}>{t('admin.documents.kpis.rejectedSub', 'Requieren corrección del cliente')}</span>
              </div>
  
              {/* KPI 4: Total Expedientes */}
              <div className="cash-kpi-item-light" style={{ background: 'var(--city-card, #ffffff)', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="cash-kpi-header-light" style={{ color: 'var(--brand-primary, #3b82f6)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', fontWeight: 700, marginBottom: 8 }}>
                  <FaShieldAlt />
                  <span>{t('admin.documents.kpis.total', 'Total Expedientes')}</span>
                </div>
                <strong className="cash-kpi-val-light" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--city-text, #0f172a)', display: 'block', marginBottom: 8 }}>
                  {verifications.length}
                </strong>
                <div className="cash-kpi-progress-bg" style={{ width: '100%', height: 4, background: 'var(--city-border, #f1f5f9)', borderRadius: 2, marginBottom: 8 }}>
                  <div className="cash-kpi-progress-fill" style={{ width: '100%', height: '100%', background: 'var(--brand-primary, #3b82f6)', borderRadius: 2 }}></div>
                </div>
                <span className="cash-kpi-subtitle-light" style={{ fontSize: '11.5px', color: 'var(--city-muted, #64748b)' }}>{t('admin.documents.kpis.totalSub', 'Registros en sucursal')}</span>
              </div>
            </div>
  )
}
