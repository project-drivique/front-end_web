import { FaUser, FaBuilding, FaDesktop, FaEye } from 'react-icons/fa'

export default function AuditCardsView({ filteredLogs, renderResultBadge, setSelectedLogModal, t }) {
  return (
    <div className="audit-cards-view">
                {filteredLogs.map((log) => {
                  const d = new Date(log.fecha)
                  return (
                    <div key={log.id} className="audit-mobile-card" onClick={() => setSelectedLogModal(log)}>
                      <div className="audit-mobile-card__top">
                        <span className="audit-module-pill">{log.tipo}</span>
                        {renderResultBadge(log.resultado)}
                        <span className="audit-mobile-time">
                          {d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })} - {d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
  
                      <div className="audit-mobile-card__actor">
                        <FaUser className="audit-icon-brand" size={11} />
                        <strong>{log.actor}</strong>
                        <span className="audit-actor-email">({log.correo})</span>
                      </div>
  
                      <p className="audit-mobile-action">{log.accion}</p>
  
                      <div className="audit-mobile-card__foot">
                        <div className="audit-mobile-meta">
                          <span><FaBuilding size={10} /> {log.sucursal}</span>
                          <span><FaDesktop size={10} /> {log.ip}</span>
                        </div>
                        <button type="button" className="audit-mobile-btn-view" title={t('hc.ver_detalle', 'Ver detalle')}>
                          <FaEye size={11} /> {t('admin.audit_module.table.detail', 'Detalle')}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
  )
}
