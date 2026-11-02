import { FaBuilding, FaEye } from 'react-icons/fa'

export default function AuditTableCard({ filteredLogs, renderResultBadge, setSelectedLogModal, t }) {
  return (
    <div className="audit-table-card audit-desktop-view">
                <div className="audit-table-container">
                  <table className="audit-data-table">
                    <thead>
                      <tr>
                        <th>{t('admin.audit_module.table.id', 'ID Registro')}</th>
                        <th>{t('admin.audit_module.table.dateTime', 'Fecha y Hora')}</th>
                        <th>{t('admin.audit_module.table.type', 'Tipo Evento')}</th>
                        <th>{t('admin.audit_module.table.module', 'Módulo')}</th>
                        <th>{t('admin.audit_module.table.actorUser', 'Actor / Usuario')}</th>
                        <th>{t('admin.audit_module.table.role', 'Rol')}</th>
                        <th>{t('admin.audit_module.table.branch', 'Sucursal')}</th>
                        <th>{t('admin.audit_module.table.ip', 'Dirección IP')}</th>
                        <th>{t('admin.audit_module.table.action', 'Acción Realizada')}</th>
                        <th>{t('admin.audit_module.table.result', 'Resultado')}</th>
                        <th style={{ textAlign: 'center' }}>{t('admin.audit_module.table.actions', 'Acciones')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => {
                        const d = new Date(log.fecha)
                        return (
                          <tr key={log.id} className="audit-table-row">
                            {/* ID Registro */}
                            <td className="audit-td-id">
                              <span className="audit-id-badge">{log.id}</span>
                            </td>
  
                            {/* Fecha y Hora */}
                            <td className="audit-td-timestamp">
                              <span className="audit-td-date">
                                {d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </span>
                              <span className="audit-td-time">
                                {d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            </td>
  
                            {/* Tipo Evento */}
                            <td className="audit-td-type">
                              <span className="audit-type-pill">{log.tipo}</span>
                            </td>
  
                            {/* Módulo */}
                            <td className="audit-td-module">
                              <span className="audit-module-name">{log.modulo}</span>
                            </td>
  
                            {/* Actor / Usuario */}
                            <td className="audit-td-actor">
                              <div className="audit-actor-block">
                                <span className="audit-actor-name">{log.actor}</span>
                                <span className="audit-actor-email">{log.correo}</span>
                              </div>
                            </td>
  
                            {/* Rol */}
                            <td className="audit-td-role">
                              <span className="audit-role-badge">{log.rol}</span>
                            </td>
  
                            {/* Sucursal */}
                            <td className="audit-td-branch">
                              <div className="audit-branch-tag">
                                <FaBuilding size={11} className="audit-branch-icon" />
                                <span>{log.sucursal}</span>
                              </div>
                            </td>
  
                            {/* Dirección IP */}
                            <td className="audit-td-ip">
                              <span className="audit-ip-code">{log.ip}</span>
                            </td>
  
                            {/* Acción Realizada */}
                            <td className="audit-td-action">
                              <p className="audit-action-text">{log.accion}</p>
                              {log.motivo && (
                                <span className="audit-reason-text">
                                  {t('admin.audit_module.table.note', 'Nota:')} {log.motivo}
                                </span>
                              )}
                            </td>
  
                            {/* Resultado */}
                            <td className="audit-td-result">
                              {renderResultBadge(log.resultado)}
                            </td>
  
                            {/* Acciones */}
                            <td className="audit-td-detail" style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="audit-btn-detail"
                                onClick={() => setSelectedLogModal(log)}
                                title={t('admin.audit_module.table.detail', 'Ver detalle')}
                              >
                                <FaEye size={12} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
  )
}
