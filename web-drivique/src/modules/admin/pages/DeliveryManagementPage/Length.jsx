import { FaEdit, FaTrashAlt } from 'react-icons/fa'

export default function Length({ conductoresFiltrados, getConductorBadge, handleEditarConductor, handleEliminarConductor, t }) {
  return (
    <div className="cities-table-wrap doc-desktop-table" style={{ overflowX: 'auto' }}>
                      <table className="incidents-table-v2" style={{ whiteSpace: 'nowrap', width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '35px' }}>{t('admin.delivery.table.id', 'ID')}</th>
                            <th>{t('admin.delivery.drivers.name', 'NOMBRE CONDUCTOR')}</th>
                            <th>{t('admin.delivery.drivers.email', 'CORREO ELECTRÓNICO')}</th>
                            <th>{t('admin.delivery.drivers.docType', 'TIPO DOC')}</th>
                            <th>{t('admin.delivery.drivers.docNum', 'NÚMERO DOC')}</th>
                            <th>{t('admin.delivery.drivers.licenseNum', 'NÚMERO LICENCIA')}</th>
                            <th>{t('admin.delivery.drivers.licenseCat', 'CATEGORÍA LICENCIA')}</th>
                            <th>{t('admin.delivery.drivers.licenseExp', 'VENCIMIENTO LICENCIA')}</th>
                            <th>{t('admin.delivery.drivers.phone', 'TELÉFONO')}</th>
                            <th style={{ textAlign: 'center' }}>{t('admin.delivery.table.status', 'ESTADO')}</th>
                            <th style={{ textAlign: 'center' }}>{t('admin.delivery.table.actions', 'ACCIONES')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {conductoresFiltrados.map((c, i) => (
                            <tr key={c.id}>
                              <td style={{ fontWeight: 400, color: 'var(--city-text, #0f172a)', width: '35px' }}>{i + 1}</td>
                              <td style={{ fontWeight: 500, color: 'var(--city-text, #0f172a)' }}>{c.nombre}</td>
                              <td style={{ fontWeight: 400, color: 'var(--city-muted, #64748b)' }}>{c.email || t('admin.delivery.noEmail', 'Sin correo')}</td>
                              <td style={{ fontWeight: 400, color: 'var(--city-text, #334155)' }}>{c.tipoDoc || 'CC'}</td>
                              <td style={{ fontWeight: 400, color: 'var(--city-text, #334155)' }}>{c.numDoc || '-'}</td>
                              <td style={{ fontWeight: 500, color: 'var(--brand-primary, #2563eb)' }}>{c.licencia || '-'}</td>
                              <td style={{ fontWeight: 400, color: 'var(--city-text, #334155)' }}>{c.categoriaLic || '-'}</td>
                              <td style={{ fontWeight: 400, color: 'var(--city-muted, #64748b)' }}>{c.vencimientoLic || '-'}</td>
                              <td style={{ fontWeight: 400, color: 'var(--city-text, #334155)' }}>{c.telefono || '-'}</td>
                              <td style={{ textAlign: 'center', fontWeight: 400 }}>
                                {getConductorBadge(c.estado)}
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 400 }}>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleEditarConductor(c)}
                                    title={t('admin.delivery.drivers.editBtn', 'Editar')}
                                    style={{
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      background: 'var(--brand-soft-light, #eff6ff)',
                                      color: 'var(--brand-primary, #2563eb)',
                                      border: '1px solid var(--brand-border-light, #bfdbfe)',
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      fontSize: 12,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4
                                    }}
                                  >
                                    <FaEdit /> {t('admin.delivery.drivers.editBtn', 'Editar')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleEliminarConductor(c.id)}
                                    title={t('admin.delivery.drivers.deleteBtn', 'Eliminar')}
                                    style={{
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      background: '#fef2f2',
                                      color: '#dc2626',
                                      border: '1px solid #fecaca',
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      fontSize: 12,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4
                                    }}
                                  >
                                    <FaTrashAlt /> {t('admin.delivery.drivers.deleteBtn', 'Eliminar')}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
  )
}
