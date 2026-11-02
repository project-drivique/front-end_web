import { FaLock, FaEyeSlash, FaEye, FaTimesCircle, FaCheckCircle, FaKey } from 'react-icons/fa'

export default function DocMobileCards({ assigningPointId, conductores, filtrados, getBadge, handleDirectSelectConductor, hoy, revealedPins, setModalVerificar, setRevealedPins, t }) {
  return (
    <div className="doc-mobile-cards">
                        {filtrados.map((r, i) => (
                          <div key={r.rowId || r.id} className="doc-mobile-card">
                            <div className="doc-mobile-card-header">
                              <div className="doc-mobile-card-title">
                                <span style={{ fontWeight: 400, color: 'var(--brand-primary, #2563eb)', fontSize: 13 }}>ID {i + 1}</span>
                                <span style={{ fontWeight: 500, color: 'var(--city-text, #0f172a)', fontSize: 14 }}>{r.codigo}</span>
                              </div>
                              {getBadge(r.estadoDomicilio, r.estado, r.fechaEvento)}
                            </div>
  
                            <div className="doc-mobile-card-body">
                              <div className="doc-mobile-data-item doc-mobile-data-item--full">
                                <span className="doc-mobile-data-label">{t('admin.delivery.table.clientName', 'Nombre Cliente')}</span>
                                <span className="doc-mobile-data-value" style={{ fontSize: 14, fontWeight: 400 }}>{r.clienteNombre}</span>
                              </div>
  
                              <div className="doc-mobile-data-item doc-mobile-data-item--full">
                                <span className="doc-mobile-data-label">{t('admin.delivery.table.deliveryCode', 'Código Domicilio (PIN)')}</span>
                                <span className="doc-mobile-data-value">
                                  {(() => {
                                    const esFuturo = r.fechaEvento && r.fechaEvento > hoy
                                    if (esFuturo) {
                                      return (
                                        <span
                                          title={`PIN protegido hasta el día de la entrega (${r.fechaEvento})`}
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            fontFamily: "'Courier New', Courier, monospace",
                                            fontWeight: 700,
                                            fontSize: 13,
                                            color: '#64748b',
                                            background: '#f8fafc',
                                            padding: '4px 10px',
                                            borderRadius: 8,
                                            border: '1px solid #e2e8f0',
                                          }}
                                        >
                                          <FaLock style={{ fontSize: 11, color: '#94a3b8' }} />
                                          •••••• (Protegido hasta {r.fechaEvento})
                                        </span>
                                      )
                                    }
                                    const isRevealed = Boolean(revealedPins[r.rowId || r.id])
                                    return (
                                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{
                                          fontFamily: "'Courier New', Courier, monospace",
                                          fontWeight: 800,
                                          fontSize: 14,
                                          letterSpacing: '2.5px',
                                          color: 'var(--brand-primary, #1e3a8a)',
                                          background: 'var(--brand-soft-light, #eff6ff)',
                                          padding: '3px 10px',
                                          borderRadius: 8,
                                          border: '1.5px dashed var(--brand-border-light, #cbd5e1)',
                                        }}>
                                          {isRevealed ? r.domicilioCodigo : '••••••'}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => setRevealedPins(prev => ({ ...prev, [r.rowId || r.id]: !prev[r.rowId || r.id] }))}
                                          style={{
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            color: 'var(--brand-primary, #2563eb)',
                                            padding: '4px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            fontSize: 15,
                                          }}
                                        >
                                          {isRevealed ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                      </div>
                                    )
                                  })()}
                                </span>
                              </div>
  
                              <div className="doc-mobile-data-item doc-mobile-data-item--full">
                                <span className="doc-mobile-data-label">{t('admin.delivery.table.vehicleName', 'Vehículo')}</span>
                                <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>{r.vehiculoNombre || r.vehiculo?.nombre || '-'}</span>
                              </div>
  
                              <div className="doc-mobile-data-item">
                                <span className="doc-mobile-data-label">{t('admin.delivery.table.serviceType', 'Tipo Servicio')}</span>
                                <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>{r.tipoServicio}</span>
                              </div>
  
                              <div className="doc-mobile-data-item doc-mobile-data-item--full">
                                <span className="doc-mobile-data-label">Recogida</span>
                                <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>
                                  {r.direccionRecogida} {r.direccionRecogida !== 'No aplica' ? `(${r.fechaRecogida} - ${r.horaRecogida})` : ''}
                                </span>
                              </div>
  
                              <div className="doc-mobile-data-item doc-mobile-data-item--full">
                                <span className="doc-mobile-data-label">Devolución</span>
                                <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>
                                  {r.direccionDevolucion} {r.direccionDevolucion !== 'No aplica' ? `(${r.fechaDevolucion} - ${r.horaDevolucion})` : ''}
                                </span>
                              </div>
  
                              <div className="doc-mobile-data-item doc-mobile-data-item--full">
                                <span className="doc-mobile-data-label">{t('admin.delivery.table.driver', 'Conductor Asignado')}</span>
                                {r.estado === 'cancelada' ? (
                                  <div style={{ fontSize: 13, color: '#ef4444', fontStyle: 'italic', fontWeight: 500, marginTop: 4 }}>
                                    {r.estadoCodigo === 'CANCELLED_BY_TIMEOUT' ? 'Cancelada automáticamente (Tiempo expirado)' : 'Reserva cancelada'}
                                  </div>
                                ) : r.estado === 'finalizada' ? (
                                  <div style={{ fontSize: 13, color: '#16a34a', fontStyle: 'italic', fontWeight: 500, marginTop: 4 }}>
                                    {r.domicilioConductor ? `${r.domicilioConductor} (Finalizado)` : 'Servicio finalizado'}
                                  </div>
                                ) : (
                                  <select
                                    disabled={assigningPointId === (r.rowId || r.id) || r.estadoDomicilio === 'COMPLETADO'}
                                    value={r.domicilioConductor || ''}
                                    onChange={(e) => handleDirectSelectConductor(r, e.target.value)}
                                    style={{
                                      width: '100%',
                                      padding: '8px 10px',
                                      borderRadius: 8,
                                      border: '1.5px solid var(--city-border, #cbd5e1)',
                                      background: 'var(--city-bg, #f8fafc)',
                                      color: r.domicilioConductor ? 'var(--city-text, #0f172a)' : 'var(--city-muted, #64748b)',
                                      fontSize: 13,
                                      fontWeight: 400,
                                      outline: 'none',
                                      marginTop: 4,
                                      cursor: assigningPointId === (r.rowId || r.id) ? 'wait' : 'pointer',
                                      opacity: assigningPointId === (r.rowId || r.id) ? 0.6 : 1
                                    }}
                                  >
                                    <option value="">
                                      {assigningPointId === (r.rowId || r.id)
                                        ? '⏳ Asignando...'
                                        : t('admin.delivery.modal.selectDriverPlaceholder', '-- Seleccionar Conductor --')}
                                    </option>
                                    {conductores.map(c => (
                                      <option key={c.id} value={c.nombre}>
                                        {c.nombre}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            </div>
  
                            <div className="doc-mobile-card-actions">
                              {r.estado === 'cancelada' && (
                                <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600, background: '#fef2f2', padding: '6px 12px', borderRadius: 8, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%' }}>
                                  <FaTimesCircle /> Reserva Cancelada
                                </span>
                              )}
                              {r.estado === 'finalizada' && (
                                <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%' }}>
                                  <FaCheckCircle /> Servicio Finalizado
                                </span>
                              )}
                              {r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'ASIGNADO' && (
                                (() => {
                                  const esFuturo = r.fechaEvento && r.fechaEvento > hoy
                                  if (esFuturo) {
                                    return (
                                      <button
                                        type="button"
                                        disabled
                                        title={`Disponible el día de la entrega (${r.fechaEvento})`}
                                        style={{
                                          width: '100%',
                                          padding: '9px 18px',
                                          borderRadius: '12px',
                                          background: '#f1f5f9',
                                          color: '#64748b',
                                          border: '1px solid #cbd5e1',
                                          fontWeight: 600,
                                          fontSize: '12px',
                                          cursor: 'not-allowed',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          gap: 8,
                                          opacity: 0.85,
                                        }}
                                      >
                                        <FaLock style={{ fontSize: 11, color: '#94a3b8' }} />
                                        <span>Verificación bloqueada hasta el {r.fechaEvento}</span>
                                      </button>
                                    )
                                  }
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => setModalVerificar(r)}
                                      style={{
                                        width: '100%',
                                        padding: '9px 18px',
                                        borderRadius: '12px',
                                        background: '#16a34a',
                                        color: 'var(--city-card, #ffffff)',
                                        border: 'none',
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                      }}
                                    >
                                      <FaKey style={{ fontSize: 12 }} />
                                      {t('admin.delivery.verifyBtn', 'Verificar PIN')}
                                    </button>
                                  )
                                })()
                              )}
                              {r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'COMPLETADO' && (
                                <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <FaCheckCircle />
                                  {t('admin.delivery.completedLabel', 'Servicio Entregado')}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
  )
}
