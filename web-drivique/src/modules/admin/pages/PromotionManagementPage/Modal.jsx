import { FaTag, FaCar } from 'react-icons/fa'

export default function Modal({ backdropStyle, categorias, closeBtnStyle, closeModal, error, form, modal, modalHeadStyle, save, setForm, t, vehiculos, vehiculosFiltrados }) {
  return (
    <div className="cities-modal-backdrop" style={backdropStyle} onMouseDown={e => e.target === e.currentTarget && closeModal()}>
            <section className="cities-modal" style={{ maxWidth: 640, width: '100%', background: 'var(--city-card)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={modalHeadStyle}>
                <div>
                  <p style={{ color: 'var(--city-muted)', margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    {t('admin.promotions.modal.eyebrow', 'GESTIÓN DE CAMPAÑA')}
                  </p>
                  <h2 style={{ color: 'var(--city-text)', margin: 0, fontSize: 18, fontWeight: 800 }}>
                    {t(modal.promotion ? 'admin.promotions.modal.editTitle' : 'admin.promotions.modal.createTitle', modal.promotion ? t('hc2.editar_oferta', 'Editar Oferta') : t('hc2.crear_nueva_oferta', 'Crear Nueva Oferta'))}
                  </h2>
                </div>
                <button type="button" onClick={closeModal} style={closeBtnStyle}>&times;</button>
              </div>
  
              <div style={{ padding: '20px 24px', maxHeight: '78vh', overflowY: 'auto' }}>
                <form id="promo-form" onSubmit={save} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  
                  {/* Clasificación */}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, margin: 0 }}>
                      Tipo de Oferta / Clasificación *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, tipoOferta: 'cupon' })}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 12,
                          border: `2px solid ${form.tipoOferta === 'cupon' ? 'var(--brand-primary, #2563eb)' : 'var(--city-border, #cbd5e1)'}`,
                          background: form.tipoOferta === 'cupon' ? 'var(--brand-soft-light, #eff6ff)' : 'var(--city-card, #ffffff)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          transition: 'all 0.2s',
                        }}
                      >
                        <span style={{ fontSize: 16, marginTop: 2, color: 'var(--brand-primary, #2563eb)' }}><FaTag /></span>
                        <div>
                          <strong style={{ display: 'block', fontSize: 13, color: form.tipoOferta === 'cupon' ? 'var(--brand-primary, #2563eb)' : 'var(--city-text, #0f172a)' }}>
                            Cupón de Descuento
                          </strong>
                          <small style={{ color: 'var(--city-muted, #64748b)', fontSize: 11, lineHeight: 1.3, display: 'block', marginTop: 2 }}>
                            Código de canje aplicable en el checkout de reserva.
                          </small>
                        </div>
                      </button>
  
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, tipoOferta: 'promocion' })}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 12,
                          border: `2px solid ${form.tipoOferta === 'promocion' ? 'var(--brand-primary, #2563eb)' : 'var(--city-border, #cbd5e1)'}`,
                          background: form.tipoOferta === 'promocion' ? 'var(--brand-soft-light, #eff6ff)' : 'var(--city-card, #ffffff)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          transition: 'all 0.2s',
                        }}
                      >
                        <span style={{ fontSize: 16, marginTop: 2, color: 'var(--brand-primary, #2563eb)' }}><FaCar /></span>
                        <div>
                          <strong style={{ display: 'block', fontSize: 13, color: form.tipoOferta === 'promocion' ? 'var(--brand-primary, #2563eb)' : 'var(--city-text, #0f172a)' }}>
                            Promoción de Catálogo
                          </strong>
                          <small style={{ color: 'var(--city-muted, #64748b)', fontSize: 11, lineHeight: 1.3, display: 'block', marginTop: 2 }}>
                            Oferta con precio rebajado en vehículos destacados.
                          </small>
                        </div>
                      </button>
                    </div>
                  </div>
  
                  {/* Código */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      Código Promocional *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.codigo}
                      maxLength={24}
                      onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                      placeholder="EJ: SUV20, BONO50K"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    />
                  </div>
  
                  {/* Nombre */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      Nombre de la Oferta *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      placeholder="Ej: Especial Verano 2026"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    />
                  </div>
  
                  {/* Tipo de Descuento */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      Tipo de Descuento *
                    </label>
                    <select
                      value={form.tipoDescuento}
                      onChange={(e) => setForm({ ...form, tipoDescuento: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    >
                      <option value="porcentaje">{t('hc4.porcentaje', 'Porcentaje (%)')}</option>
                      <option value="fijo">{t('hc4.monto_fijo_cop', 'Monto Fijo ($ COP)')}</option>
                    </select>
                  </div>
  
                  {/* Valor Descuento */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      Valor del Descuento *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={form.tipoDescuento === 'porcentaje' ? 100 : undefined}
                      value={form.valorDescuento}
                      onChange={(e) => setForm({ ...form, valorDescuento: e.target.value })}
                      placeholder={form.tipoDescuento === 'porcentaje' ? 'Ej: 20' : 'Ej: 50000'}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    />
                  </div>
  
                  {/* Categoría */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      Categoría de Vehículo
                    </label>
                    <select
                      value={form.categoriaVehiculo}
                      onChange={(e) => {
                        const cat = e.target.value
                        setForm({ ...form, categoriaVehiculo: cat, vehiculoId: '', vehiculoNombre: '' })
                      }}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    >
                      {['Todos', ...categorias.map((c) => c.name)].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
  
                  {/* Vehículo específico */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      Vehículo Específico (Opcional)
                    </label>
                    <select
                      value={form.vehiculoId || ''}
                      onChange={(e) => {
                        const vId = e.target.value
                        const selectedVeh = vehiculos.find((v) => String(v.id) === String(vId))
                        setForm({
                          ...form,
                          vehiculoId: vId || '',
                          vehiculoNombre: selectedVeh ? selectedVeh.nombre : '',
                          categoriaVehiculo: selectedVeh ? selectedVeh.categoria : form.categoriaVehiculo,
                        })
                      }}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    >
                      <option value="">{t('hc.cualquier_vehiculo', 'Cualquier vehículo')}</option>
                      {vehiculosFiltrados.map((v) => (
                        <option key={v.id} value={v.id}>{v.nombre} ({v.categoria})</option>
                      ))}
                    </select>
                  </div>
  
                  {/* Fecha Inicio */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      Fecha Inicio *
                    </label>
                    <input
                      type="date"
                      required
                      value={form.fechaInicio}
                      onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    />
                  </div>
  
                  {/* Fecha Fin */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      Fecha Fin *
                    </label>
                    <input
                      type="date"
                      required
                      value={form.fechaFin}
                      onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    />
                  </div>
  
                  {/* Reserva Mínima */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      Reserva Mínima ($ COP)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.reservaMinima}
                      onChange={(e) => setForm({ ...form, reservaMinima: e.target.value })}
                      placeholder={t('hc.0_para_sin_minimo', '0 para sin mínimo')}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    />
                  </div>
  
                  {/* Audiencia */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      Audiencia / Destinatarios
                    </label>
                    <select
                      value={form.audiencia}
                      onChange={(e) => setForm({ ...form, audiencia: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    >
                      <option value="todos">{t('hc.todos_los_usuarios', 'Todos los usuarios')}</option>
                      <option value="nuevos">{t('hc4.nuevos_usuarios', 'Nuevos usuarios')}</option>
                      <option value="frecuentes">{t('hc4.clientes_frecuentes', 'Clientes frecuentes')}</option>
                    </select>
                  </div>
  
                  {/* Checkbox Destacada */}
                  <div style={{ gridColumn: '1 / -1', padding: '12px 14px', background: form.destacada ? 'var(--brand-soft-light, #eff6ff)' : 'var(--city-bg, #f8fafc)', border: `1.5px solid ${form.destacada ? 'var(--brand-border-light, #bfdbfe)' : 'var(--city-border, #cbd5e1)'}`, borderRadius: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={form.destacada}
                        onChange={(e) => setForm({ ...form, destacada: e.target.checked })}
                        style={{ width: 17, height: 17, accentColor: 'var(--brand-primary, #2563eb)' }}
                      />
                      <strong style={{ fontSize: 13, color: form.destacada ? 'var(--brand-primary, #2563eb)' : 'var(--city-text, #0f172a)' }}>
                        Marcar como Oferta Destacada en Catálogo
                      </strong>
                    </label>
                  </div>
  
                  {/* Checkbox Activa */}
                  <div style={{ gridColumn: '1 / -1', padding: '12px 14px', background: form.activa ? '#ecfdf5' : 'var(--city-bg, #f8fafc)', border: `1.5px solid ${form.activa ? '#a7f3d0' : 'var(--city-border, #cbd5e1)'}`, borderRadius: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={form.activa}
                        onChange={(e) => setForm({ ...form, activa: e.target.checked })}
                        style={{ width: 17, height: 17, accentColor: '#10b981' }}
                      />
                      <strong style={{ fontSize: 13, color: form.activa ? '#047857' : 'var(--city-text, #0f172a)' }}>
                        Publicar oferta como Activa inmediatamente
                      </strong>
                    </label>
                  </div>
  
                  {/* Condiciones */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      Términos y Condiciones Especificos *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={form.condiciones}
                      onChange={(e) => setForm({ ...form, condiciones: e.target.value })}
                      placeholder={t('hc.escribe_los_terminos_y_condiciones_de_', 'Escribe los términos y condiciones de la oferta...')}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none', resize: 'vertical' }}
                    />
                  </div>
  
                  {error && <p style={{ gridColumn: '1 / -1', color: '#dc2626', fontSize: 13, margin: 0 }}>{error}</p>}
                </form>
              </div>
  
              <div style={{ padding: '14px 24px', borderTop: '1px solid var(--city-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ padding: '8px 18px', borderRadius: 9999, background: 'transparent', color: 'var(--city-muted)', border: '1.5px solid var(--city-border)', cursor: 'pointer', fontWeight: 700 }}
                >
                  {t('admin.promotions.modal.cancelBtn', 'Cancelar')}
                </button>
                <button
                  type="submit"
                  form="promo-form"
                  style={{ padding: '8px 22px', borderRadius: 9999, background: 'var(--brand-primary, #2563eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800, boxShadow: '0 4px 12px rgba(var(--brand-primary-rgb), 0.3)' }}
                >
                  {t('admin.promotions.modal.saveBtn', 'Guardar Oferta')}
                </button>
              </div>
            </section>
          </div>
  )
}
