import { FaLayerGroup, FaCheckCircle, FaTimesCircle, FaLock } from 'react-icons/fa'

export default function AuditKpiGrid({ handleResetFilters, resultFilter, setResultFilter, setTypeFilter, stats, t, typeFilter }) {
  return (
    <section className="audit-kpi-grid">
            <div
              className={`audit-kpi-card ${resultFilter === 'all' && typeFilter === 'all' ? 'audit-kpi-card--active' : ''}`}
              onClick={handleResetFilters}
              title={t('admin.audit_module.totalEventsSub', 'Trazabilidad auditada')}
            >
              <div className="audit-kpi-card__head">
                <span className="audit-kpi-card__label">{t('admin.audit_module.totalEvents', 'Total Eventos')}</span>
                <span className="audit-kpi-card__icon audit-kpi-card__icon--brand">
                  <FaLayerGroup size={13} />
                </span>
              </div>
              <p className="audit-kpi-card__value">{stats.total}</p>
              <span className="audit-kpi-card__sub">{t('admin.audit_module.totalEventsSub', 'Trazabilidad auditada')}</span>
            </div>
  
            <div
              className={`audit-kpi-card ${resultFilter === 'EXITO' ? 'audit-kpi-card--active' : ''}`}
              onClick={() => setResultFilter(resultFilter === 'EXITO' ? 'all' : 'EXITO')}
              title={t('admin.audit_module.successfulEventsSub', 'Operaciones válidas')}
            >
              <div className="audit-kpi-card__head">
                <span className="audit-kpi-card__label">{t('admin.audit_module.successfulEvents', 'Exitosos')}</span>
                <span className="audit-kpi-card__icon audit-kpi-card__icon--green">
                  <FaCheckCircle size={13} />
                </span>
              </div>
              <p className="audit-kpi-card__value">{stats.exitosos}</p>
              <span className="audit-kpi-card__sub">{t('admin.audit_module.successfulEventsSub', 'Operaciones válidas')}</span>
            </div>
  
            <div
              className={`audit-kpi-card ${resultFilter === 'FALLO' ? 'audit-kpi-card--active' : ''}`}
              onClick={() => setResultFilter(resultFilter === 'FALLO' ? 'all' : 'FALLO')}
              title={t('admin.audit_module.failedEventsSub', 'Intentos fallidos / denegados')}
            >
              <div className="audit-kpi-card__head">
                <span className="audit-kpi-card__label">{t('admin.audit_module.failedEvents', 'Fallos / Alertas')}</span>
                <span className="audit-kpi-card__icon audit-kpi-card__icon--red">
                  <FaTimesCircle size={13} />
                </span>
              </div>
              <p className="audit-kpi-card__value">{stats.fallidos}</p>
              <span className="audit-kpi-card__sub">{t('admin.audit_module.failedEventsSub', 'Intentos fallidos / denegados')}</span>
            </div>
  
            <div
              className={`audit-kpi-card ${typeFilter === 'AUTENTICACION' ? 'audit-kpi-card--active' : ''}`}
              onClick={() => setTypeFilter(typeFilter === 'AUTENTICACION' ? 'all' : 'AUTENTICACION')}
              title={t('admin.audit_module.securityEventsSub', 'Sesiones y OTP')}
            >
              <div className="audit-kpi-card__head">
                <span className="audit-kpi-card__label">{t('admin.audit_module.securityEvents', 'Accesos & 2FA')}</span>
                <span className="audit-kpi-card__icon audit-kpi-card__icon--brand">
                  <FaLock size={13} />
                </span>
              </div>
              <p className="audit-kpi-card__value">{stats.seguridad}</p>
              <span className="audit-kpi-card__sub">{t('admin.audit_module.securityEventsSub', 'Sesiones y OTP')}</span>
            </div>
          </section>
  )
}
