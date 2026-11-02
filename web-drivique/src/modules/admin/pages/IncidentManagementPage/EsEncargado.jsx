import { FaWrench, FaCheckCircle, FaTimesCircle, FaPaperPlane } from 'react-icons/fa'

export default function EsEncargado({ handleQuickStatusChange, isAtendiendo, isRechazado, isRecibido, isResuelto, modalDetalle, openResponderModal, setModalDetalle, setValidationChecklist, sucursalEncargado, t, validationChecklist }) {
  return (
    <div className="incident-validation-box">
                      <div className="incident-validation-title">
                        <FaWrench style={{ color: 'var(--brand-text)' }} />
                        <span>Panel de Validación Operativa y Peritaje (Sede {sucursalEncargado || modalDetalle.sucursal})</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-text)', marginLeft: 'auto', background: 'var(--brand-soft)', padding: '3px 10px', borderRadius: '9999px', border: '1px solid var(--brand-border)' }}>
                          Acción Operativa Requerida
                        </span>
                      </div>
  
                      {/* Checklist Técnico de Sede */}
                      <div className="incident-checklist">
                        <span style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                          CHECKLIST DE VALIDACIÓN TÉCNICA (PERITAJE OPERATIVO)
                        </span>
                        <label className="incident-checklist-item">
                          <input
                            type="checkbox"
                            checked={validationChecklist.evidenciasCoinciden}
                            onChange={(e) => setValidationChecklist(c => ({ ...c, evidenciasCoinciden: e.target.checked }))}
                          />
                          <span>{t('hc.evidencias_fotograficas_y_audiovisuale', 'Evidencias fotográficas y audiovisuales corresponden al siniestro declarado por el cliente.')}</span>
                        </label>
                        <label className="incident-checklist-item">
                          <input
                            type="checkbox"
                            checked={validationChecklist.polizaVigente}
                            onChange={(e) => setValidationChecklist(c => ({ ...c, polizaVigente: e.target.checked }))}
                          />
                          <span>{t('hc.poliza_de_seguro_y_contrato_de_alquile', 'Póliza de seguro y contrato de alquiler vigentes para esta reserva.')}</span>
                        </label>
                        <label className="incident-checklist-item">
                          <input
                            type="checkbox"
                            checked={validationChecklist.placaKilometrajeVerificado}
                            onChange={(e) => setValidationChecklist(c => ({ ...c, placaKilometrajeVerificado: e.target.checked }))}
                          />
                          <span>Placa ({modalDetalle.placa}) y kilometraje verificados con la entrega inicial del vehículo.</span>
                        </label>
                        <label className="incident-checklist-item">
                          <input
                            type="checkbox"
                            checked={validationChecklist.responsabilidadDictaminada}
                            onChange={(e) => setValidationChecklist(c => ({ ...c, responsabilidadDictaminada: e.target.checked }))}
                          />
                          <span>{t('hc.dictamen_tecnico_aplica_deducible_o_as', 'Dictamen técnico: ¿Aplica deducible o asistencia en ruta sin costo adicional para el cliente?')}</span>
                        </label>
                      </div>
  
                      {isRecibido && (
                        <div>
                          <p style={{ fontSize: 13, color: '#475569', margin: '0 0 10px' }}>
                            Reporte nuevo recibido. Revisa las evidencias fotográficas abajo e inicia la validación técnica con el taller o asistencia.
                          </p>
                          <div className="incident-validation-actions">
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(modalDetalle.id, 'atendiendo')}
                              style={{ padding: '9px 18px', borderRadius: '9999px', background: 'var(--brand-primary)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 6px rgba(var(--brand-primary-rgb), 0.25)' }}
                            >
                              <FaCheckCircle /> Iniciar Validación Técnica y Taller
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(modalDetalle.id, 'rechazado')}
                              style={{ padding: '9px 18px', borderRadius: '9999px', background: '#fee2e2', color: '#dc2626', border: '1.5px solid #fecaca', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                              <FaTimesCircle /> Desestimar / Rechazar Reporte
                            </button>
                            <button
                              type="button"
                              onClick={() => { setModalDetalle(null); openResponderModal(modalDetalle); }}
                              style={{ padding: '9px 18px', borderRadius: '9999px', background: 'var(--brand-soft)', color: 'var(--brand-text)', border: '1.5px solid var(--brand-border)', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}
                            >
                              <FaPaperPlane /> Responder y Notificar al Cliente
                            </button>
                          </div>
                        </div>
                      )}
  
                      {isAtendiendo && (
                        <div>
                          <p style={{ fontSize: 13, color: '#0369a1', margin: '0 0 10px', fontWeight: 600 }}>
                            Reporte en validación técnica y solución activa. Al concluir la reparación, peritaje o asistencia, dictamínalo como resuelto.
                          </p>
                          <div className="incident-validation-actions">
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(modalDetalle.id, 'resuelto')}
                              style={{ padding: '9px 18px', borderRadius: '9999px', background: '#16a34a', color: '#fff', border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)' }}
                            >
                              <FaCheckCircle /> Validar y Marcar como Resuelto
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(modalDetalle.id, 'rechazado')}
                              style={{ padding: '9px 18px', borderRadius: '9999px', background: '#fee2e2', color: '#dc2626', border: '1.5px solid #fecaca', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                              <FaTimesCircle /> Rechazar / Cerrar
                            </button>
                            <button
                              type="button"
                              onClick={() => { setModalDetalle(null); openResponderModal(modalDetalle); }}
                              style={{ padding: '9px 18px', borderRadius: '9999px', background: 'var(--brand-soft)', color: 'var(--brand-text)', border: '1.5px solid var(--brand-border)', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}
                            >
                              <FaPaperPlane /> Enviar Novedad al Cliente
                            </button>
                          </div>
                        </div>
                      )}
  
                      {isResuelto && (
                        <div>
                          <div style={{ background: '#dcfce7', border: '1.5px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', color: '#15803d', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FaCheckCircle size={16} />
                            <span>{t('hc.incidente_validado_reparado_y_cerrado_', 'Incidente validado, reparado y cerrado satisfactoriamente por la sucursal.')}</span>
                          </div>
                          <div className="incident-validation-actions">
                            <button
                              type="button"
                              onClick={() => { setModalDetalle(null); openResponderModal(modalDetalle); }}
                              style={{ padding: '8px 18px', borderRadius: '9999px', background: '#f8fafc', color: '#166534', border: '1.5px solid #bbf7d0', fontWeight: 800, fontSize: 12.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                              <FaPaperPlane /> Enviar Mensaje Adicional al Cliente
                            </button>
                          </div>
                        </div>
                      )}
  
                      {isRechazado && (
                        <div style={{ background: '#fee2e2', border: '1.5px solid #fecaca', borderRadius: 10, padding: '12px 16px', color: '#991b1b', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FaTimesCircle size={16} />
                          <span>{t('hc.este_reporte_fue_desestimado_o_cerrado', 'Este reporte fue desestimado o cerrado por la sucursal tras peritaje técnico.')}</span>
                        </div>
                      )}
                    </div>
  )
}
