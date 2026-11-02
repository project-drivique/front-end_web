import { FaCar, FaTag, FaInfoCircle, FaStar, FaRegStar, FaToggleOn, FaToggleOff, FaEdit, FaTrash, FaEye } from 'react-icons/fa'
import { formatCurrency } from '../../../../utils/currencyUtils'

export default function CitiesTableWrap({ esEncargado, filtered, handleDelete, labelDiscount, labelTarget, moneda, openEdit, setConditionsModal, t, tasaUSD, toggleActive, toggleFeatured }) {
  return (
    <div className="cities-table-wrap doc-desktop-table" style={{ overflowX: 'auto' }}>
                    <table className="incidents-table-v2" style={{ whiteSpace: 'nowrap', width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '35px' }}>{t('admin.promotions.table.id', 'ID')}</th>
                          <th>{t('admin.promotions.table.offerType', 'TIPO OFERTA')}</th>
                          <th>{t('admin.promotions.table.code', 'CÓDIGO')}</th>
                          <th>{t('admin.promotions.table.name', 'NOMBRE OFERTA')}</th>
                          <th>{t('admin.promotions.table.audience', 'AUDIENCIA')}</th>
                          <th>{t('admin.promotions.table.discount', 'DESCUENTO')}</th>
                          <th>{t('admin.promotions.table.minimum', 'RESERVA MÍNIMA')}</th>
                          <th>{t('admin.promotions.table.scope', 'ALCANCE / VEHÍCULO')}</th>
                          <th>{t('admin.promotions.table.start', 'FECHA INICIO')}</th>
                          <th>{t('admin.promotions.table.end', 'FECHA FIN')}</th>
                          <th>{t('admin.promotions.table.conditions', 'CONDICIONES')}</th>
                          <th style={{ textAlign: 'center' }}>{t('admin.promotions.table.featured', 'DESTACADA')}</th>
                          <th style={{ textAlign: 'center' }}>{t('admin.promotions.table.status', 'ESTADO')}</th>
                          <th style={{ textAlign: 'center' }}>{t('admin.promotions.table.actions', 'ACCIONES')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((item, i) => (
                          <tr key={item.id}>
                            {/* 1. ID */}
                            <td style={{ fontWeight: 400, color: 'var(--city-text, #0f172a)', width: '35px' }}>{i + 1}</td>
  
                            {/* 2. TIPO OFERTA */}
                            <td style={{ fontWeight: 400 }}>
                              <span className={`offer-type-badge ${item.tipoOferta || 'cupon'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
                                {item.tipoOferta === 'promocion' ? <FaCar size={11} /> : <FaTag size={10} />}
                                {item.tipoOferta === 'promocion' ? t('admin.promotions.offerTypes.promocion', 'Promoción') : t('admin.promotions.offerTypes.cupon', 'Cupón')}
                              </span>
                            </td>
  
                            {/* 3. CÓDIGO */}
                            <td style={{ fontWeight: 600, color: 'var(--brand-primary, #2563eb)' }}>
                              {item.codigo}
                            </td>
  
                            {/* 4. NOMBRE OFERTA */}
                            <td style={{ fontWeight: 400, color: 'var(--city-text, #0f172a)' }}>
                              {item.nombre}
                            </td>
  
                            {/* 5. AUDIENCIA */}
                            <td style={{ fontWeight: 400, color: 'var(--city-text, #334155)' }}>
                              {item.audiencia === 'nuevos'
                                ? t('admin.promotions.audiences.nuevos', 'Nuevos usuarios')
                                : item.audiencia === 'frecuentes'
                                ? t('admin.promotions.audiences.frecuentes', 'Clientes frecuentes')
                                : t('admin.promotions.audiences.todos', 'Todos los usuarios')}
                            </td>
  
                            {/* 6. DESCUENTO */}
                            <td style={{ fontWeight: 600, color: '#16a34a' }}>
                              {labelDiscount(item)}
                            </td>
  
                            {/* 7. RESERVA MÍNIMA */}
                            <td style={{ fontWeight: 400, color: 'var(--city-text, #334155)' }}>
                              {item.reservaMinima > 0
                                ? formatCurrency(item.reservaMinima, moneda, tasaUSD)
                                : t('admin.promotions.noMin', 'Sin mínimo')}
                            </td>
  
                            {/* 8. ALCANCE / VEHÍCULO */}
                            <td style={{ fontWeight: 400, color: 'var(--city-text, #334155)' }}>
                              {labelTarget(item)}
                            </td>
  
                            {/* 9. FECHA INICIO */}
                            <td style={{ fontWeight: 400, color: 'var(--city-muted, #64748b)' }}>
                              {item.fechaInicio || '-'}
                            </td>
  
                            {/* 10. FECHA FIN */}
                            <td style={{ fontWeight: 400, color: 'var(--city-muted, #64748b)' }}>
                              {item.fechaFin || '-'}
                            </td>
  
                            {/* 11. CONDICIONES */}
                            <td style={{ fontWeight: 400 }}>
                              {item.condiciones ? (
                                <button
                                  type="button"
                                  onClick={() => setConditionsModal(item)}
                                  className="promotion-conditions-btn"
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    background: 'var(--brand-soft-light, #eff6ff)',
                                    color: 'var(--brand-primary, #2563eb)',
                                    border: '1px solid var(--brand-border-light, #bfdbfe)',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: 11.5,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}
                                >
                                  <FaInfoCircle size={11} /> {t('admin.promotions.viewDetailBtn', 'Ver detalle')}
                                </button>
                              ) : (
                                <span style={{ color: 'var(--city-muted, #64748b)', fontSize: 12 }}>
                                  {t('admin.promotions.noCond', 'Sin condiciones')}
                                </span>
                              )}
                            </td>
  
                            {/* 12. DESTACADA */}
                            <td style={{ textAlign: 'center', fontWeight: 400 }}>
                              {esEncargado ? (
                                <button
                                  type="button"
                                  onClick={() => toggleFeatured(item)}
                                  title={item.destacada ? 'Quitar de destacadas' : t('hc2.marcar_como_destacada', 'Marcar como destacada')}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    color: item.destacada ? '#f59e0b' : '#94a3b8',
                                    fontWeight: 600,
                                    fontSize: 12
                                  }}
                                >
                                  {item.destacada ? <FaStar color="#f59e0b" size={14} /> : <FaRegStar color="#94a3b8" size={14} />}
                                  <span>{item.destacada ? t('admin.promotions.featuredBadge.yes', 'Destacada') : t('admin.promotions.featuredBadge.no', 'Normal')}</span>
                                </button>
                              ) : (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    color: item.destacada ? '#f59e0b' : '#94a3b8',
                                    fontWeight: 600,
                                    fontSize: 12
                                  }}
                                >
                                  {item.destacada ? <FaStar color="#f59e0b" size={14} /> : <FaRegStar color="#94a3b8" size={14} />}
                                  <span>{item.destacada ? t('admin.promotions.featuredBadge.yes', 'Destacada') : t('admin.promotions.featuredBadge.no', 'Normal')}</span>
                                </span>
                              )}
                            </td>
  
                            {/* 13. ESTADO */}
                            <td style={{ textAlign: 'center', fontWeight: 400 }}>
                              <span className={`doc-status-badge ${item.activa ? 'aprobado' : 'rechazada'}`}>
                                {item.activa ? t('admin.promotions.status.active', 'Activa') : t('admin.promotions.status.inactive', 'Inactiva')}
                              </span>
                            </td>
  
                            {/* 14. ACCIONES */}
                            <td style={{ textAlign: 'center', fontWeight: 400 }}>
                              {esEncargado ? (
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => toggleActive(item)}
                                    title={item.activa ? 'Desactivar' : 'Activar'}
                                    style={{
                                      padding: '5px 10px',
                                      borderRadius: '8px',
                                      background: item.activa ? '#ecfdf5' : '#f1f5f9',
                                      color: item.activa ? '#047857' : '#64748b',
                                      border: `1px solid ${item.activa ? '#a7f3d0' : '#cbd5e1'}`,
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      fontSize: 12,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4
                                    }}
                                  >
                                    {item.activa ? <FaToggleOn size={14} /> : <FaToggleOff size={14} />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openEdit(item)}
                                    title={t('hc4.editar', 'Editar')}
                                    style={{
                                      padding: '5px 10px',
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
                                    <FaEdit />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(item)}
                                    title={t('hc4.eliminar', 'Eliminar')}
                                    style={{
                                      padding: '5px 10px',
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
                                    <FaTrash />
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => setConditionsModal(item)}
                                    title={t('hc.ver_detalle_131', 'Ver Detalle')}
                                    style={{
                                      padding: '5px 12px',
                                      borderRadius: '8px',
                                      background: 'var(--brand-soft-light, #eff6ff)',
                                      color: 'var(--brand-primary, #2563eb)',
                                      border: '1px solid var(--brand-border-light, #bfdbfe)',
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      fontSize: 12,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6
                                    }}
                                  >
                                    <FaEye size={12} /> Ver Detalle
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
  )
}
