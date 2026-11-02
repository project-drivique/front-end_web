import { FaLock, FaEyeSlash, FaEye, FaCheckCircle, FaKey } from 'react-icons/fa'

export default function CitiesTableWrap({ assigningPointId, conductores, filtrados, getBadge, handleDirectSelectConductor, hoy, revealedPins, setModalVerificar, setRevealedPins, t }) {
  return (
    <div className="cities-table-wrap doc-desktop-table" style={{ overflowX: 'auto' }}>
                        <table className="incidents-table-v2" style={{ whiteSpace: 'nowrap', width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={{ width: '35px' }}>{t('admin.delivery.table.id', 'ID')}</th>
                              <th>{t('admin.delivery.table.reservationCode', 'CÓDIGO RESERVA')}</th>
                              <th style={{ textAlign: 'center' }}>{t('admin.delivery.table.deliveryCode', 'CÓDIGO DOMICILIO (PIN)')}</th>
                              <th>{t('admin.delivery.table.clientName', 'NOMBRE CLIENTE')}</th>
                              <th>{t('admin.delivery.table.vehicleName', 'VEHÍCULO')}</th>
                              <th>{t('admin.delivery.table.serviceType', 'TIPO SERVICIO')}</th>
                              <th>DIRECCIÓN RECOGIDA</th>
                              <th>FECHA RECOGIDA</th>
                              <th>HORA RECOGIDA</th>
                              <th>DIRECCIÓN DEVOLUCIÓN</th>
                              <th>FECHA DEVOLUCIÓN</th>
                              <th>HORA DEVOLUCIÓN</th>
                              <th>{t('admin.delivery.table.driver', 'CONDUCTOR ASIGNADO')}</th>
                              <th style={{ textAlign: 'center' }}>{t('admin.delivery.table.status', 'ESTADO')}</th>
                              <th style={{ textAlign: 'center' }}>{t('admin.delivery.table.actions', 'ACCIONES')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtrados.map((r, i) => (
                              <tr key={r.rowId || r.id}>
                                <td style={{ fontWeight: 400, color: 'var(--city-text, #0f172a)', width: '35px' }}>{i + 1}</td>
                                <td style={{ fontWeight: 500, color: 'var(--city-text, #0f172a)' }}>{r.codigo}</td>
                                <td style={{ textAlign: 'center' }}>
                                  {(() => {
                                    const esFuturo = r.fechaEvento && r.fechaEvento > hoy
                                    if (esFuturo) {
                                      return (
                                        <span
                                          title={`PIN protegido por seguridad hasta el día de la entrega (${r.fechaEvento})`}
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            fontFamily: "'Courier New', Courier, monospace",
                                            fontWeight: 700,
                                            fontSize: 12.5,
                                            color: '#64748b',
                                            background: '#f8fafc',
                                            padding: '4px 10px',
                                            borderRadius: 8,
                                            border: '1px solid #e2e8f0',
                                          }}
                                        >
                                          <FaLock style={{ fontSize: 10, color: '#94a3b8' }} />
                                          ••••••
                                        </span>
                                      )
                                    }
                                    const isRevealed = Boolean(revealedPins[r.rowId || r.id])
                                    return (
                                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{
                                          fontFamily: "'Courier New', Courier, monospace",
                                          fontWeight: 800,
                                          fontSize: 14,
                                          letterSpacing: '2.5px',
                                          color: 'var(--brand-primary, #1e3a8a)',
                                          background: 'var(--brand-soft-light, #eff6ff)',
                                          padding: '4px 10px',
                                          borderRadius: 8,
                                          border: '1.5px dashed var(--brand-border-light, #cbd5e1)',
                                          display: 'inline-block',
                                        }}>
                                          {isRevealed ? r.domicilioCodigo : '••••••'}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => setRevealedPins(prev => ({ ...prev, [r.rowId || r.id]: !prev[r.rowId || r.id] }))}
                                          title={isRevealed ? 'Ocultar PIN' : 'Revelar PIN de entrega'}
                                          style={{
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            color: 'var(--brand-primary, #2563eb)',
                                            padding: '4px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            fontSize: 13,
                                          }}
                                        >
                                          {isRevealed ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                      </div>
                                    )
                                  })()}
                                </td>
                                <td style={{ fontWeight: 400, color: 'var(--city-text, #0f172a)' }}>{r.clienteNombre}</td>
                                <td style={{ fontWeight: 400, color: 'var(--city-text, #0f172a)' }}>{r.vehiculoNombre || r.vehiculo?.nombre || '-'}</td>
                                <td style={{ fontWeight: 400, color: 'var(--city-text, #334155)' }}>
                                  {r.tipoServicio}
                                </td>
                                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', color: r.direccionRecogida === 'No aplica' ? 'var(--city-muted, #94a3b8)' : 'var(--city-text, #334155)', fontWeight: 400 }} title={r.direccionRecogida}>
                                  {r.direccionRecogida}
                                </td>
                                <td style={{ color: r.fechaRecogida === 'No aplica' ? 'var(--city-muted, #94a3b8)' : 'var(--city-text, #334155)', fontWeight: 400 }}>
                                  {r.fechaRecogida}
                                </td>
                                <td style={{ color: r.horaRecogida === 'No aplica' ? 'var(--city-muted, #94a3b8)' : 'var(--city-text, #334155)', fontWeight: 400 }}>
                                  {r.horaRecogida}
                                </td>
                                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', color: r.direccionDevolucion === 'No aplica' ? 'var(--city-muted, #94a3b8)' : 'var(--city-text, #334155)', fontWeight: 400 }} title={r.direccionDevolucion}>
                                  {r.direccionDevolucion}
                                </td>
                                <td style={{ color: r.fechaDevolucion === 'No aplica' ? 'var(--city-muted, #94a3b8)' : 'var(--city-text, #334155)', fontWeight: 400 }}>
                                  {r.fechaDevolucion}
                                </td>
                                <td style={{ color: r.horaDevolucion === 'No aplica' ? 'var(--city-muted, #94a3b8)' : 'var(--city-text, #334155)', fontWeight: 400 }}>
                                  {r.horaDevolucion}
                                </td>
                                <td style={{ fontWeight: 400 }}>
                                  {r.estado === 'cancelada' ? (
                                    <span style={{ fontSize: 12, color: '#ef4444', fontStyle: 'italic', fontWeight: 500 }}>
                                      {r.estadoCodigo === 'CANCELLED_BY_TIMEOUT' ? 'Cancelada automáticamente' : 'Reserva cancelada'}
                                    </span>
                                  ) : r.estado === 'finalizada' ? (
                                    <span style={{ fontSize: 12, color: '#16a34a', fontStyle: 'italic', fontWeight: 500 }}>
                                      {r.domicilioConductor ? `${r.domicilioConductor} (Finalizado)` : 'Servicio finalizado'}
                                    </span>
                                  ) : (
                                    <select
                                      disabled={assigningPointId === (r.rowId || r.id) || r.estadoDomicilio === 'COMPLETADO'}
                                      value={r.domicilioConductor || ''}
                                      onChange={(e) => handleDirectSelectConductor(r, e.target.value)}
                                      style={{
                                        padding: '6px 10px',
                                        borderRadius: 8,
                                        border: '1.5px solid var(--city-border, #cbd5e1)',
                                        background: 'var(--city-bg, #f8fafc)',
                                        color: r.domicilioConductor ? 'var(--city-text, #0f172a)' : 'var(--city-muted, #64748b)',
                                        fontSize: 12.5,
                                        fontWeight: 400,
                                        outline: 'none',
                                        cursor: assigningPointId === (r.rowId || r.id) ? 'wait' : 'pointer',
                                        opacity: assigningPointId === (r.rowId || r.id) ? 0.6 : 1,
                                        maxWidth: 200
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
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 400 }}>
                                  {getBadge(r.estadoDomicilio, r.estado, r.fechaEvento)}
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 400 }}>
                                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                                    {r.estado === 'cancelada' && (
                                      <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, background: '#fef2f2', padding: '3px 8px', borderRadius: 6, border: '1px solid #fecaca' }}>
                                        Cancelada
                                      </span>
                                    )}
                                    {r.estado === 'finalizada' && (
                                      <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        <FaCheckCircle /> Finalizada
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
                                                padding: '6px 14px',
                                                borderRadius: '9999px',
                                                background: '#f1f5f9',
                                                color: '#64748b',
                                                border: '1px solid #cbd5e1',
                                                fontWeight: 600,
                                                fontSize: '11.5px',
                                                cursor: 'not-allowed',
                                                whiteSpace: 'nowrap',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                opacity: 0.85,
                                              }}
                                            >
                                              <FaLock style={{ fontSize: 10, color: '#94a3b8' }} />
                                              <span>Habilita el {r.fechaEvento}</span>
                                            </button>
                                          )
                                        }
                                        return (
                                          <button
                                            type="button"
                                            onClick={() => setModalVerificar(r)}
                                            style={{
                                              padding: '6px 16px',
                                              borderRadius: '9999px',
                                              background: '#16a34a',
                                              color: 'var(--city-card, #ffffff)',
                                              border: 'none',
                                              fontWeight: 700,
                                              fontSize: '12px',
                                              cursor: 'pointer',
                                              boxShadow: '0 2px 5px rgba(22, 163, 74, 0.25)',
                                              transition: 'all 0.2s',
                                              whiteSpace: 'nowrap',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: 6,
                                            }}
                                          >
                                            <FaKey style={{ fontSize: 11 }} />
                                            {t('admin.delivery.verifyBtn', 'Verificar PIN')}
                                          </button>
                                        )
                                      })()
                                    )}
                                    {r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'COMPLETADO' && (
                                      <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        <FaCheckCircle />
                                        {t('admin.delivery.completedLabel', 'Entregado')}
                                      </span>
                                    )}
                                    {r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'PENDIENTE' && (
                                      <span style={{ fontSize: 12, color: '#d97706', fontWeight: 400 }}>
                                        {t('admin.delivery.status.pendiente', 'Pendiente')}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
  )
}
