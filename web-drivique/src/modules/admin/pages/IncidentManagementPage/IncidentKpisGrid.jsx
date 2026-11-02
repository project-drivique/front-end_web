import { FaClipboardList, FaClock, FaWrench, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

export default function IncidentKpisGrid({ metrics, setStateFilter, stateFilter, t }) {
  return (
    <div className="incident-kpis-grid">
              <div 
                className={`incident-kpi-card ${stateFilter === 'all' ? 'is-active' : ''}`}
                onClick={() => setStateFilter('all')}
                style={{ cursor: 'pointer' }}
                title={t('hc.ver_todos_los_reportes', 'Ver todos los reportes')}
              >
                <div className="incident-kpi-icon incident-kpi-icon--total">
                  <FaClipboardList />
                </div>
                <div className="incident-kpi-content">
                  <span className="incident-kpi-label">{t('hc2.total_reportes', 'TOTAL REPORTES')}</span>
                  <span className="incident-kpi-value">{metrics.total}</span>
                </div>
              </div>
  
              <div 
                className={`incident-kpi-card ${stateFilter === 'recibido' ? 'is-active' : ''}`}
                onClick={() => setStateFilter(stateFilter === 'recibido' ? 'all' : 'recibido')}
                style={{ cursor: 'pointer' }}
                title={t('hc.filtrar_por_reportes_pendientes_de_val', 'Filtrar por reportes pendientes de validación')}
              >
                <div className="incident-kpi-icon incident-kpi-icon--recibido">
                  <FaClock />
                </div>
                <div className="incident-kpi-content">
                  <span className="incident-kpi-label">{t('hc.por_validar', 'POR VALIDAR')}</span>
                  <span className="incident-kpi-value">{metrics.recibido}</span>
                </div>
                {metrics.recibido > 0 && <span className="incident-kpi-badge incident-kpi-badge--alert">{t('hc4.pendiente', 'Pendiente')}</span>}
              </div>
  
              <div 
                className={`incident-kpi-card ${stateFilter === 'atendiendo' ? 'is-active' : ''}`}
                onClick={() => setStateFilter(stateFilter === 'atendiendo' ? 'all' : 'atendiendo')}
                style={{ cursor: 'pointer' }}
                title={t('hc.filtrar_por_reportes_en_validacion_o_t', 'Filtrar por reportes en validación o taller')}
              >
                <div className="incident-kpi-icon incident-kpi-icon--atendiendo">
                  <FaWrench />
                </div>
                <div className="incident-kpi-content">
                  <span className="incident-kpi-label">{t('hc.en_atencion_taller', 'EN ATENCIÓN / TALLER')}</span>
                  <span className="incident-kpi-value">{metrics.atendiendo}</span>
                </div>
              </div>
  
              <div 
                className={`incident-kpi-card ${stateFilter === 'resuelto' ? 'is-active' : ''}`}
                onClick={() => setStateFilter(stateFilter === 'resuelto' ? 'all' : 'resuelto')}
                style={{ cursor: 'pointer' }}
                title={t('hc.filtrar_por_reportes_validados_y_resue', 'Filtrar por reportes validados y resueltos')}
              >
                <div className="incident-kpi-icon incident-kpi-icon--resuelto">
                  <FaCheckCircle />
                </div>
                <div className="incident-kpi-content">
                  <span className="incident-kpi-label">{t('hc.validados_y_resueltos', 'VALIDADOS Y RESUELTOS')}</span>
                  <span className="incident-kpi-value">{metrics.resuelto}</span>
                </div>
              </div>
  
              <div 
                className={`incident-kpi-card ${stateFilter === 'rechazado' ? 'is-active' : ''}`}
                onClick={() => setStateFilter(stateFilter === 'rechazado' ? 'all' : 'rechazado')}
                style={{ cursor: 'pointer' }}
                title={t('hc.filtrar_por_reportes_desestimados_o_ce', 'Filtrar por reportes desestimados o cerrados')}
              >
                <div className="incident-kpi-icon incident-kpi-icon--rechazado">
                  <FaTimesCircle />
                </div>
                <div className="incident-kpi-content">
                  <span className="incident-kpi-label">DESESTIMADOS</span>
                  <span className="incident-kpi-value">{metrics.rechazado}</span>
                </div>
              </div>
            </div>
  )
}
