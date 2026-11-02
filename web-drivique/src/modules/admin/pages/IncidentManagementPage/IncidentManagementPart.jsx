import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

export default function IncidentManagementPart({ isAtendiendo, isRechazado, isRecibido, isResuelto, t }) {
  return (
    <div style={{ margin: '18px 0 14px', padding: '16px 20px', background: 'var(--city-bg, #f8fafc)', borderRadius: 14, border: '1px solid var(--city-border, #cbd5e1)' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--city-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 14 }}>
                      PROCESO DE VALIDACIÓN Y RESOLUCIÓN DEL REPORTE
                    </span>
                    
                    <div className="incident-stepper">
                      <div className="incident-stepper-line">
                        <div
                          className="incident-stepper-progress"
                          style={{
                            width: isRechazado ? '100%' : isResuelto ? '100%' : isAtendiendo ? '50%' : '10%',
                            background: isRechazado ? '#ef4444' : '#10b981'
                          }}
                        />
                      </div>
  
                      {/* Paso 1: Reportado */}
                      <div className={`incident-step ${isRecibido ? 'is-active' : 'is-completed'}`}>
                        <div className="incident-step-circle">
                          {isRecibido ? '1' : <FaCheckCircle size={14} />}
                        </div>
                        <span className="incident-step-label">{t('hc4.1_reportado', '1. Reportado')}</span>
                        <span className="incident-step-desc">{t('hc.registrado_por_cliente', 'Registrado por cliente')}</span>
                      </div>
  
                      {/* Paso 2: En Validación */}
                      <div className={`incident-step ${isAtendiendo ? 'is-active' : (isResuelto || isRechazado ? 'is-completed' : '')}`}>
                        <div className="incident-step-circle">
                          {isResuelto || isRechazado ? <FaCheckCircle size={14} /> : '2'}
                        </div>
                        <span className="incident-step-label">{t('hc.2_en_validacion', '2. En Validación')}</span>
                        <span className="incident-step-desc">{t('hc.inspeccion_de_sede', 'Inspección de sede')}</span>
                      </div>
  
                      {/* Paso 3: En Reparación / Solución */}
                      <div className={`incident-step ${isAtendiendo ? 'is-active' : (isResuelto ? 'is-completed' : '')}`}>
                        <div className="incident-step-circle">
                          {isResuelto ? <FaCheckCircle size={14} /> : '3'}
                        </div>
                        <span className="incident-step-label">{t('hc.3_en_solucion', '3. En Solución')}</span>
                        <span className="incident-step-desc">{t('hc.atencion_tecnica', 'Atención técnica')}</span>
                      </div>
  
                      {/* Paso 4: Resuelto o Rechazado */}
                      <div className={`incident-step ${isRechazado ? 'is-rejected' : isResuelto ? 'is-completed' : ''}`}>
                        <div className="incident-step-circle">
                          {isRechazado ? <FaTimesCircle size={14} /> : isResuelto ? <FaCheckCircle size={14} /> : '4'}
                        </div>
                        <span className="incident-step-label">{isRechazado ? t('hc5.step4_rejected', '4. Rechazado') : t('hc5.step4_resolved', '4. Resuelto')}</span>
                        <span className="incident-step-desc">{isRechazado ? t('hc5.step4_desc_rejected', 'Reporte desestimado') : t('hc5.step4_desc_done', 'Caso finalizado')}</span>
                      </div>
                    </div>
                  </div>
  )
}
