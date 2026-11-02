import { FaUserTie, FaIdCard, FaCar, FaCheckCircle } from 'react-icons/fa'

export default function ModalConductor({ backdropStyle, closeBtnStyle, editingConductor, handleCrearConductor, nuevoConductor, setEditingConductor, setModalConductor, setNuevoConductor }) {
  return (
    <div className="cities-modal-backdrop" style={backdropStyle} onMouseDown={e => e.target === e.currentTarget && (setModalConductor(false), setEditingConductor(null))}>
              <section className="cities-modal" style={{ maxWidth: 660, width: '100%', background: 'var(--city-card, #ffffff)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 45px rgba(15,23,42,0.25)', border: '1px solid var(--city-border, #e2e8f0)' }}>
                
                {/* ENCABEZADO MODAL ELEGANTE */}
                <div style={{ padding: '20px 26px', borderBottom: '1px solid var(--city-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--city-bg, #f8fafc)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 20, boxShadow: '0 4px 10px rgba(37,99,235,0.3)' }}>
                      <FaUserTie />
                    </div>
                    <div>
                      <span style={{ color: 'var(--brand-primary, #2563eb)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {editingConductor ? 'GESTIÓN DE PERSONAL OPERATIVO' : 'REGISTRO DE PERSONAL OPERATIVO'}
                      </span>
                      <h2 style={{ color: 'var(--city-text, #0f172a)', margin: '2px 0 0', fontSize: 19, fontWeight: 800 }}>
                        {editingConductor ? 'Editar Conductor' : 'Crear Nuevo Conductor'}
                      </h2>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setModalConductor(false); setEditingConductor(null); }} style={closeBtnStyle} title="Cerrar">&times;</button>
                </div>
  
                {/* CUERPO DEL MODAL CON SECCIONES AGRUPADAS */}
                <div style={{ padding: '22px 26px', maxHeight: '74vh', overflowY: 'auto' }}>
                  <form id="conductor-form" onSubmit={handleCrearConductor} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    
                    {/* SECCIÓN 1: DATOS PERSONALES Y CONTACTO */}
                    <div style={{ background: 'var(--city-bg, #f8fafc)', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: 14, padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, borderBottom: '1px solid var(--city-border, #e2e8f0)', paddingBottom: 8 }}>
                        <span style={{ fontSize: 14, color: 'var(--brand-primary, #2563eb)', display: 'flex', alignItems: 'center' }}><FaIdCard /></span>
                        <strong style={{ fontSize: 13, color: 'var(--city-text, #0f172a)', fontWeight: 700 }}>1. Identificación y Contacto</strong>
                      </div>
  
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {/* Nombre Completo */}
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                            Nombre Completo del Conductor *
                          </label>
                          <input
                            type="text"
                            required
                            value={nuevoConductor.nombre}
                            onChange={e => setNuevoConductor({ ...nuevoConductor, nombre: e.target.value })}
                            placeholder="Ej: Carlos Eduardo Ramírez"
                            style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
  
                        {/* Correo Electrónico */}
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                            Correo Electrónico (Notificaciones PIN) *
                          </label>
                          <input
                            type="email"
                            required
                            value={nuevoConductor.email}
                            onChange={e => setNuevoConductor({ ...nuevoConductor, email: e.target.value })}
                            placeholder="conductor@drivique.com"
                            style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
  
                        {/* Teléfono / WhatsApp */}
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                            Teléfono / WhatsApp *
                          </label>
                          <input
                            type="text"
                            required
                            value={nuevoConductor.telefono}
                            onChange={e => setNuevoConductor({ ...nuevoConductor, telefono: e.target.value })}
                            placeholder="+57 310 000 0000"
                            style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
  
                        {/* Tipo Documento */}
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                            Tipo de Documento *
                          </label>
                          <select
                            value={nuevoConductor.tipoDoc}
                            onChange={e => setNuevoConductor({ ...nuevoConductor, tipoDoc: e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                          >
                            <option value="CC">Cédula de Ciudadanía (CC)</option>
                            <option value="CE">Cédula de Extranjería (CE)</option>
                            <option value="PAS">Pasaporte (PAS)</option>
                          </select>
                        </div>
  
                        {/* Número Documento */}
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                            Número de Documento *
                          </label>
                          <input
                            type="text"
                            required
                            value={nuevoConductor.numDoc}
                            onChange={e => setNuevoConductor({ ...nuevoConductor, numDoc: e.target.value })}
                            placeholder="1018432910"
                            style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    </div>
  
                    {/* SECCIÓN 2: LICENCIA DE CONDUCCIÓN Y MEDIO DE DESPLAZAMIENTO */}
                    <div style={{ background: 'var(--city-bg, #f8fafc)', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: 14, padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, borderBottom: '1px solid var(--city-border, #e2e8f0)', paddingBottom: 8 }}>
                        <span style={{ fontSize: 14, color: 'var(--brand-primary, #2563eb)', display: 'flex', alignItems: 'center' }}><FaCar /></span>
                        <strong style={{ fontSize: 13, color: 'var(--city-text, #0f172a)', fontWeight: 700 }}>2. Habilitación de Conducción</strong>
                      </div>
  
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {/* Número de Licencia */}
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                            Número de Licencia de Conducción *
                          </label>
                          <input
                            type="text"
                            required
                            value={nuevoConductor.licencia}
                            onChange={e => setNuevoConductor({ ...nuevoConductor, licencia: e.target.value })}
                            placeholder="C1-84920412"
                            style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
  
                        {/* Vencimiento Licencia */}
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                            Vencimiento de Licencia *
                          </label>
                          <input
                            type="date"
                            required
                            value={nuevoConductor.vencimientoLic}
                            onChange={e => setNuevoConductor({ ...nuevoConductor, vencimientoLic: e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
  
                        {/* Categoría de Licencia */}
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                            Categoría de Licencia * <span style={{ fontWeight: 400, color: 'var(--brand-primary, #2563eb)' }}>(Automóviles y Camionetas de alquiler)</span>
                          </label>
                          <select
                            value={nuevoConductor.categoriaLic}
                            onChange={e => setNuevoConductor({ ...nuevoConductor, categoriaLic: e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                          >
                            <option value="B1">B1 · Automóviles, Camperos y Camionetas (Particular - Estándar)</option>
                            <option value="C1">C1 · Automóviles, Camperos y Camionetas (Público / Comercial)</option>
                          </select>
                        </div>
  
                        {/* Nota operativa de flota */}
                        <div style={{
                          gridColumn: '1 / -1',
                          padding: '10px 14px',
                          borderRadius: 10,
                          background: 'rgba(37, 99, 235, 0.06)',
                          border: '1px solid rgba(37, 99, 235, 0.18)',
                          fontSize: 12,
                          color: 'var(--brand-primary, #1e40af)',
                          lineHeight: 1.45,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                        }}>
                          <FaCar style={{ flexShrink: 0, marginTop: 2, fontSize: 13, color: 'var(--brand-primary, #2563eb)' }} />
                          <span>
                            <strong>Operativa de Flota:</strong> El conductor se presenta en la sucursal para recibir las llaves del vehículo de la reserva y conducirlo hasta el domicilio del cliente.
                          </span>
                        </div>
                      </div>
                    </div>
  
                    {/* SECCIÓN 3: DISPONIBILIDAD OPERATIVA (SIN ESTADO 'EN RUTA' AL CREAR) */}
                    {editingConductor ? (
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                          Disponibilidad del Conductor *
                        </label>
                        <select
                          value={nuevoConductor.estado}
                          onChange={e => setNuevoConductor({ ...nuevoConductor, estado: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                        >
                          <option value="disponible">🟢 Disponible (Activo para asignación)</option>
                          <option value="inactivo">⚪ Inactivo (Fuera de turno / Descanso)</option>
                        </select>
                      </div>
                    ) : (
                      <div style={{ padding: '12px 14px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18, color: '#16a34a' }}>●</span>
                        <div>
                          <strong style={{ fontSize: 12.5, color: '#15803d', display: 'block' }}>Estado Inicial: Disponible</strong>
                          <span style={{ fontSize: 11, color: '#166534' }}>El nuevo conductor quedará registrado como disponible en sucursal para ser asignado a órdenes de entrega.</span>
                        </div>
                      </div>
                    )}
  
                  </form>
                </div>
  
                {/* PIE DEL MODAL CON BOTONES PULIDOS */}
                <div style={{ padding: '16px 26px', borderTop: '1px solid var(--city-border, #e2e8f0)', display: 'flex', justifyContent: 'flex-end', gap: 12, background: 'var(--city-bg, #f8fafc)' }}>
                  <button
                    type="button"
                    onClick={() => { setModalConductor(false); setEditingConductor(null); }}
                    style={{ padding: '9px 20px', borderRadius: 10, background: 'transparent', color: 'var(--city-text, #475569)', border: '1.5px solid var(--city-border, #cbd5e1)', cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    form="conductor-form"
                    style={{ padding: '9px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)', transition: 'all 0.2s' }}
                  >
                    <FaCheckCircle style={{ fontSize: 13 }} />
                    {editingConductor ? 'Guardar Cambios' : 'Registrar Conductor'}
                  </button>
                </div>
              </section>
            </div>
  )
}
