import { FaEye } from 'react-icons/fa'

export default function DocMobileCards({ esEncargado, filtered, labelDiscount, labelTarget, openEdit, setConditionsModal, t, toggleActive }) {
  return (
    <div className="doc-mobile-cards">
                    {filtered.map((item, i) => (
                      <div key={item.id} className="doc-mobile-card">
                        <div className="doc-mobile-card-header">
                          <div className="doc-mobile-card-title">
                            <span style={{ fontWeight: 400, color: 'var(--brand-primary, #2563eb)', fontSize: 13 }}>ID {i + 1}</span>
                            <span style={{ fontWeight: 500, color: 'var(--city-text, #0f172a)', fontSize: 14 }}>{item.codigo}</span>
                          </div>
                          <span className={`doc-status-badge ${item.activa ? 'aprobado' : 'rechazada'}`}>
                            {item.activa ? t('admin.promotions.status.active', 'Activa') : t('admin.promotions.status.inactive', 'Inactiva')}
                          </span>
                        </div>
  
                        <div className="doc-mobile-card-body">
                          <div className="doc-mobile-data-item doc-mobile-data-item--full">
                            <span className="doc-mobile-data-label">{t('admin.promotions.table.name', 'NOMBRE OFERTA')}</span>
                            <span className="doc-mobile-data-value" style={{ fontSize: 14, fontWeight: 500 }}>{item.nombre}</span>
                          </div>
  
                          <div className="doc-mobile-data-item">
                            <span className="doc-mobile-data-label">{t('admin.promotions.table.offerType', 'TIPO OFERTA')}</span>
                            <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>{item.tipoOferta === 'promocion' ? t('hc2.promocion', 'Promoción') : t('hc2.cupon', 'Cupón')}</span>
                          </div>
  
                          <div className="doc-mobile-data-item">
                            <span className="doc-mobile-data-label">{t('admin.promotions.table.discount', 'DESCUENTO')}</span>
                            <span className="doc-mobile-data-value" style={{ color: '#16a34a', fontWeight: 600 }}>{labelDiscount(item)}</span>
                          </div>
  
                          <div className="doc-mobile-data-item">
                            <span className="doc-mobile-data-label">{t('admin.promotions.table.start', 'FECHA INICIO')}</span>
                            <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>{item.fechaInicio || '-'}</span>
                          </div>
  
                          <div className="doc-mobile-data-item">
                            <span className="doc-mobile-data-label">{t('admin.promotions.table.end', 'FECHA FIN')}</span>
                            <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>{item.fechaFin || '-'}</span>
                          </div>
  
                          <div className="doc-mobile-data-item doc-mobile-data-item--full">
                            <span className="doc-mobile-data-label">{t('admin.promotions.table.scope', 'ALCANCE / VEHÍCULO')}</span>
                            <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>{labelTarget(item)}</span>
                          </div>
                        </div>
  
                        <div className="doc-mobile-card-actions" style={{ display: 'flex', gap: 8 }}>
                          {esEncargado ? (
                            <>
                              <button
                                type="button"
                                onClick={() => toggleActive(item)}
                                style={{
                                  flex: 1,
                                  padding: '8px',
                                  borderRadius: '8px',
                                  background: item.activa ? '#ecfdf5' : '#f1f5f9',
                                  color: item.activa ? '#047857' : '#64748b',
                                  border: 'none',
                                  fontWeight: 600,
                                  fontSize: 12
                                }}
                              >
                                {item.activa ? 'Desactivar' : 'Activar'}
                              </button>
                              <button
                                type="button"
                                onClick={() => openEdit(item)}
                                style={{
                                  flex: 1,
                                  padding: '8px',
                                  borderRadius: '8px',
                                  background: 'var(--brand-soft-light, #eff6ff)',
                                  color: 'var(--brand-primary, #2563eb)',
                                  border: 'none',
                                  fontWeight: 600,
                                  fontSize: 12
                                }}
                              >
                                Editar
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConditionsModal(item)}
                              style={{
                                flex: 1,
                                padding: '8px',
                                borderRadius: '8px',
                                background: 'var(--brand-soft-light, #eff6ff)',
                                color: 'var(--brand-primary, #2563eb)',
                                border: '1px solid var(--brand-border-light, #bfdbfe)',
                                fontWeight: 600,
                                fontSize: 12,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6
                              }}
                            >
                              <FaEye size={12} /> Ver Detalle
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
  )
}
