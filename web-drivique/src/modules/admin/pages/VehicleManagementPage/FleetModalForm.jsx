import { FaCheck } from 'react-icons/fa'

export default function FleetModalForm({ activeCategoriesForForm, branches, close, error, esEncargado, fleetLookups, form, modal, save, setForm, t }) {
  return (
    <form onSubmit={save} className="fleet-modal-form">
                      <div className="fleet-modal-body" style={{ padding: '24px 32px', background: 'var(--bg-tarjeta, #ffffff)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                          
                          {/* IMAGEN */}
                          <div style={{ gridColumn: '1 / -1', marginBottom: '8px' }}>
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
                              <div key={idx} style={{ marginBottom: 12 }}>
                                <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>
                                  {idx === 0
                                    ? t('hc.url_de_la_imagen_principal', 'URL de la imagen principal')
                                    : t('hc6.url_de_la_imagen_n', { defaultValue: 'URL de la imagen {{n}} (opcional)', n: idx + 1 })}
                                </label>
                                <input
                                  type="url"
                                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }}
                                  placeholder="https://..."
                                  value={form.imagenes?.[idx] || ""}
                                  onChange={(e) => {
                                    const next = [...(form.imagenes || [])];
                                    while (next.length <= idx) next.push("");
                                    next[idx] = e.target.value;
                                    setForm({ ...form, imagenes: next });
                                  }}
                                />
                              </div>
                            ))}
                            {(form.imagenes || []).some(Boolean) && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                {(form.imagenes || []).slice(0, 8).map((url, idx) => url ? (
                                  <img key={idx} src={url} alt={'Vista previa ' + (idx + 1)} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 10 }} />
                                ) : null)}
                              </div>
                            )}
                          </div>
  
                          {/* INPUTS ESTILO REFERENCIA */}
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t('hc4.marca', 'Marca *')}</label>
                            <select disabled={Boolean(modal.vehicle)} required style={{ ...{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }, cursor: 'pointer' }} value={form.marca || ""} onChange={(e) => setForm({ ...form, marca: e.target.value })}>
                              <option value="" disabled>{t("admin.vehiclesManagement.modal.select", "Seleccionar")}</option>
                              {fleetLookups.brands.map((b) => <option key={b} value={b}>{b}</option>)}
                            </select>
                          </div>
  
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t('hc4.modelo', 'Modelo *')}</label>
                            <input disabled={Boolean(modal.vehicle)} required style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.modelo || ""} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
                          </div>
  
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>VIN (17 caracteres) *</label>
                            <input disabled={Boolean(modal.vehicle)} required minLength={17} maxLength={17} style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.vin || ""} onChange={(e) => setForm({ ...form, vin: e.target.value.toUpperCase() })} />
                          </div>
  
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t('hc4.kilometraje', 'Kilometraje *')}</label>
                            <input type="number" min="0" required style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.kilometraje ?? 0} onChange={(e) => setForm({ ...form, kilometraje: e.target.value })} />
                          </div>
  
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.plate", "Placa *")}</label>
                            <input style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })} placeholder={t("admin.vehiclesManagement.modal.placeholderPlate", "Ej: ABC-123")} required />
                          </div>
  
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.category", "Categoría *")}</label>
                            <select style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none', cursor: 'pointer' }} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} required disabled={!activeCategoriesForForm.length}>
                              <option value="" disabled>{t("admin.vehiclesManagement.modal.select", "Seleccionar")}</option>
                              {activeCategoriesForForm.map((catName) => <option key={catName} value={catName}>{catName}</option>)}
                            </select>
                          </div>
  
                          {!esEncargado ? (
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.branch", "Sucursal Asignada *")}</label>
                              <select style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none', cursor: 'pointer' }} value={form.sucursal} onChange={(e) => setForm({ ...form, sucursal: e.target.value, categoria: "" })} required>
                                <option value="" disabled>{t("admin.vehiclesManagement.modal.select", "Seleccionar")}</option>
                                {branches.map((b) => <option key={b.id} value={b.nombre}>{b.nombre}</option>)}
                              </select>
                            </div>
                          ) : (
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.year", "Año *")}</label>
                              <input type="number" min="1990" max="2030" style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.ano} onChange={(e) => setForm({ ...form, ano: e.target.value })} placeholder={t("admin.vehiclesManagement.modal.placeholderYear", "Ej: 2024")} required />
                            </div>
                          )}
  
                          {/* If esEncargado is false, Año gets pushed to next spot to keep grid aligned */}
                          {!esEncargado && (
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.year", "Año *")}</label>
                              <input type="number" min="1990" max="2030" style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.ano} onChange={(e) => setForm({ ...form, ano: e.target.value })} placeholder={t("admin.vehiclesManagement.modal.placeholderYear", "Ej: 2024")} required />
                            </div>
                          )}
  
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.color", "Color *")}</label>
                            <input style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder={t("admin.vehiclesManagement.modal.placeholderColor", "Ej: Blanco")} required />
                          </div>
  
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.transmission", "Transmisión *")}</label>
                            <select style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none', cursor: 'pointer' }} value={form.transmision} onChange={(e) => setForm({ ...form, transmision: e.target.value })} required>
                              <option value="" disabled>{t("admin.vehiclesManagement.modal.select", "Seleccionar")}</option>
                              {fleetLookups.transmissions.map((name) => <option key={name} value={name}>{name}</option>)}
                            </select>
                          </div>
  
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.fuel", "Combustible *")}</label>
                            <select style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none', cursor: 'pointer' }} value={form.combustible} onChange={(e) => setForm({ ...form, combustible: e.target.value })} required>
                              <option value="" disabled>{t("admin.vehiclesManagement.modal.select", "Seleccionar")}</option>
                              {fleetLookups.fuels.map((name) => <option key={name} value={name}>{name}</option>)}
                            </select>
                          </div>
  
                          
  
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.restriction", "Pico y Placa *")}</label>
                            <select style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none', cursor: 'pointer' }} value={form.aplicaPicoYPlaca || ""} onChange={(e) => setForm({ ...form, aplicaPicoYPlaca: e.target.value })}>
                              <option value="" disabled>{t("admin.vehiclesManagement.modal.select", "Seleccionar")}</option>
                              <option value="Si">{t("admin.vehiclesManagement.restriction.yes", "Sí aplica")}</option>
                              <option value="No">{t("admin.vehiclesManagement.restriction.no", "No aplica")}</option>
                            </select>
                          </div>
  
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.dailyRate", "Tarifa Diaria ($) *")}</label>
                            <input type="number" min="0" style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.precioLimitado} onChange={(e) => setForm({ ...form, precioLimitado: e.target.value })} placeholder="Ej: 150000" required />
                          </div>
  
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.state", "Estado del Vehículo *")}</label>
                            <select
                              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none', cursor: 'pointer' }}
                              value={form.estadoEfectivo || "disponible"}
                              onChange={(e) => setForm({ ...form, estadoEfectivo: e.target.value })}
                              required
                            >
                              <option value="disponible">{t("admin.vehiclesManagement.states.disponible", "Disponible")}</option>
                              <option value="reservado">{t("admin.vehiclesManagement.states.reservado", "Reservado")}</option>
                              <option value="mantenimiento">{t("admin.vehiclesManagement.states.en mantenimiento", "En Mantenimiento")}</option>
                            </select>
                          </div>
  
                        </div>
  
                        {error && (
                          <div style={{ marginTop: 24, padding: '12px', background: '#fef2f2', color: '#991b1b', borderRadius: '6px', fontSize: '13px' }}>
                            <p style={{ margin: 0 }}>{error}</p>
                          </div>
                        )}
                      </div>
  
                      <div className="fleet-modal-footer" style={{ borderTop: '1px solid var(--borde, #e2e8f0)', padding: '16px 24px', background: 'var(--bg-seccion1, #f8fafc)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        {modal.readOnly ? (
                          <button className="cities-primary" type="button" onClick={close}>
                            {t("common.close", "Cerrar Detalle")}
                          </button>
                        ) : (
                          <>
                            <button type="button" onClick={close} style={{ border: '1px solid var(--borde, #cbd5e1)', background: 'var(--bg-tarjeta, #ffffff)', borderRadius: '6px', padding: '8px 16px', color: 'var(--texto-primary, #475569)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-seccion1, #f1f5f9)'; e.currentTarget.style.borderColor = 'var(--texto-second, #94a3b8)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-tarjeta, #ffffff)'; e.currentTarget.style.borderColor = 'var(--borde, #cbd5e1)'; }}>
                              {t("common.cancel", "Cancelar")}
                            </button>
                            <button className="cities-primary" type="submit">
                              <FaCheck style={{ marginRight: 6 }} />
                              {t("admin.vehiclesManagement.modal.save", "Guardar vehículo")}
                            </button>
                          </>
                        )}
                      </div>
                    </form>
  )
}
