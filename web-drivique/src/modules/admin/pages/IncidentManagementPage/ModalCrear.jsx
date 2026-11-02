import { FaClock, FaPlus, FaUser } from 'react-icons/fa'

export default function ModalCrear({ archivosCrear, errorModal, formCrear, handleCrearIncidencia, handleEliminarEvidenciaCrear, handleEvidenciasElegidas, inputEvidenciasRef, setFormCrear, setModalCrear, t, user, vehiculos }) {
  return (
    <div
              className="cities-modal-backdrop"
              onMouseDown={(e) => e.target === e.currentTarget && setModalCrear(false)}
            >
              <section className="cities-modal" style={{ maxWidth: 700, padding: '24px 32px' }}>
                <div className="cities-modal__head" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 16 }}>
                  <h2 style={{ fontSize: 20, color: 'var(--city-text, #1e3a8a)', margin: 0 }}>
                    {t('admin.incidents.createTitle', 'Formulario de Incidencia')}
                  </h2>
                  <button type="button" onClick={() => setModalCrear(false)} style={{ background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--city-muted, #64748b)' }}>
                    &times;
                  </button>
                </div>
  
                <form onSubmit={handleCrearIncidencia} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  
                  {/* Vehículo / Reserva asociada (Opcional) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{t('admin.incidents.selectVehicle', 'Vehículo / Reserva asociada')} <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: 12 }}>({t('common.optional', 'Opcional')})</span></span>
                      <select
                        value={formCrear.vehiculoId}
                        onChange={(e) => {
                          const vId = e.target.value
                          const veh = vehiculos.find((v) => String(v.id) === String(vId))
                          setFormCrear({
                            ...formCrear,
                            vehiculoId: vId,
                            placa: veh?.placa || '',
                          })
                        }}
                        style={{ background: 'var(--city-bg, #f8fafc)', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 8, fontSize: 14, color: 'var(--city-text, #334155)' }}
                      >
                        <option value="">{t('admin.incidents.chooseVehicleOptional', 'Sin vehículo / General...')}</option>
                        {vehiculos.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.nombre} {v.placa ? `— Placa: ${v.placa}` : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'flex-end' }}>
                      <input 
                        type="text" 
                        readOnly 
                        value={vehiculos.find(v => String(v.id) === String(formCrear.vehiculoId))?.placa || formCrear.placa || ''}
                        placeholder={t('admin.incidents.vehiclePlatePlaceholder', 'Placa del vehículo (si aplica)')}
                        style={{
                          background: 'var(--city-bg, #f8fafc)',
                          border: '1px solid #e2e8f0',
                          padding: '12px',
                          borderRadius: 8,
                          fontSize: 14,
                          color: 'var(--city-text, #0f172a)',
                          fontFamily: 'monospace, sans-serif',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase'
                        }}
                      />
                    </label>
                  </div>
  
                  {/* Tipo de Incidencia */}
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 12 }}>{t('admin.incidents.incidentType', 'Tipo de Incidencia')} <span style={{ color: '#ef4444' }}>*</span></span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                      {[
                        { id: 'choque', label: t('admin.incidents.types.crash', 'Choque') },
                        { id: 'averia_mecanica', label: t('admin.incidents.types.mechanicalBreakdown', 'Avería Mecánica') },
                        { id: 'pinchazo', label: t('admin.incidents.types.flatTire', 'Pinchazo') },
                        { id: 'bateria_descargada', label: t('admin.incidents.types.deadBattery', 'Batería Descargada') },
                        { id: 'falla_electrica', label: t('admin.incidents.types.electricalFailure', 'Falla Eléctrica') },
                        { id: 'robo', label: t('admin.incidents.types.theft', 'Robo') },
                        { id: 'asistencia_general', label: t('admin.incidents.types.generalAssistance', 'Asistencia General') },
                        { id: 'otro_problema', label: t('admin.incidents.types.other', 'Otro') },
                      ].map(tipo => (
                        <button
                          key={tipo.id}
                          type="button"
                          onClick={() => {
                             let time = t('admin.incidents.time.twoToFourHours', '2 a 4 horas');
                             if (tipo.id === 'falla_electrica' || tipo.id === 'bateria_descargada') time = t('admin.incidents.time.oneToTwoHours', '1 a 2 horas');
                             if (tipo.id === 'asistencia_general') time = t('admin.incidents.time.oneHour', '1 hora');
                             if (tipo.id === 'otro_problema') time = t('admin.incidents.time.toBeDefined', 'Por definir');
                             setFormCrear({ ...formCrear, tipoIncidenciaId: tipo.id, tipoIncidenciaNombre: tipo.label, tiempoEstimado: time })
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 10,
                            background: formCrear.tipoIncidenciaId === tipo.id ? 'var(--brand-primary)' : 'var(--city-bg, #f8fafc)',
                            color: formCrear.tipoIncidenciaId === tipo.id ? 'var(--city-card, #ffffff)' : 'var(--city-text, #0f172a)',
                            border: formCrear.tipoIncidenciaId === tipo.id ? '1px solid var(--brand-primary)' : '1px solid #e2e8f0',
                            cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', justifyContent: 'center'
                          }}
                        >
                          {tipo.label}
                        </button>
                      ))}
                    </div>
                  </div>
  
                  {/* Notice Tiempo */}
                  <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <FaClock style={{ color: '#b45309', fontSize: 20, marginTop: 2 }} />
                    <div>
                      <span style={{ display: 'block', fontSize: 12, color: '#b45309', fontWeight: 600 }}>{t('admin.incidents.estimatedTime', 'Tiempo estimado de atención técnica:')}</span>
                      <strong style={{ color: '#92400e', fontSize: 14 }}>{formCrear.tiempoEstimado}</strong>
                    </div>
                  </div>
  
                  {/* Descripcion */}
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{t('admin.incidents.problemDescription', 'Descripción del problema')} <span style={{ color: '#ef4444' }}>*</span></span>
                    <textarea
                      required
                      rows={4}
                      placeholder={t('admin.incidents.describeSymptoms', 'Describe los síntomas...')}
                      value={formCrear.descripcion}
                      onChange={(e) => setFormCrear({ ...formCrear, descripcion: e.target.value })}
                      style={{ background: 'var(--city-bg, #f8fafc)', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 8, fontSize: 14, resize: 'none', color: 'var(--city-text, #334155)' }}
                    />
                  </label>
  
                  {/* Evidencias */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{t('admin.incidents.evidencesOptional', 'Evidencias (Imágenes / Videos opcionales)')}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{t('admin.incidents.maxPhotos', 'Máx 3 fotos')} ({archivosCrear.length}/3)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      {archivosCrear.length < 3 && (
                        <button
                          type="button"
                          onClick={() => inputEvidenciasRef.current?.click()}
                          style={{
                            width: 80,
                            height: 80,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                            background: 'var(--city-bg, #f8fafc)',
                            border: '1.5px dashed var(--brand-primary)',
                            borderRadius: 12,
                            color: 'var(--brand-primary, #3b82f6)',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                            flexShrink: 0
                          }}
                        >
                          <FaPlus style={{ fontSize: 16 }} /> {t('admin.incidents.attachment', 'Adjunto')}
                        </button>
                      )}
                      <input ref={inputEvidenciasRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4" multiple hidden onChange={handleEvidenciasElegidas} />
  
                      {/* Vista previa de las fotos subidas */}
                      {archivosCrear.map((archivo, idx) => {
                        const previewUrl = URL.createObjectURL(archivo)
                        const isVideo = archivo.type?.startsWith('video/')
                        return (
                          <div
                            key={`${archivo.name}-${idx}`}
                            style={{
                              position: 'relative',
                              width: 80,
                              height: 80,
                              borderRadius: 12,
                              overflow: 'hidden',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                              background: '#0f172a',
                              flexShrink: 0
                            }}
                          >
                            {isVideo ? (
                              <video
                                src={previewUrl}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <img
                                src={previewUrl}
                                alt={`Evidencia ${idx + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => handleEliminarEvidenciaCrear(idx)}
                              style={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: 'rgba(0,0,0,0.7)',
                                color: '#ffffff',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: 13,
                                lineHeight: 1
                              }}
                              title={t('common.delete', 'Eliminar')}
                            >
                              ×
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
  
                  <hr style={{ borderColor: 'var(--city-bg, #f1f5f9)', margin: '4px 0', borderTop: 'none' }} />
  
                  {/* Datos de contacto */}
                  <div>
                    <h3 style={{ fontSize: 16, color: 'var(--city-text, #1e3a8a)', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 4px 0' }}>
                      <FaUser style={{ color: 'var(--city-text, #1e3a8a)' }} /> {t('admin.incidents.contactDataTitle', 'Datos de contacto para seguimiento')}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--city-muted, #64748b)', marginBottom: 16 }}>
                      {t('admin.incidents.contactDataSubtitle', 'Precargados automáticamente desde tu perfil registrado (puedes editarlos si lo requieres).')}
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{t('admin.incidents.fullName', 'Nombre completo')} <span style={{ color: '#ef4444' }}>*</span></span>
                        <input type="text" readOnly value={user?.nombre || 'Administrador Interno'} style={{ background: 'var(--city-bg, #f8fafc)', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 8, fontSize: 14, color: 'var(--city-text, #334155)' }} />
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{t('admin.incidents.phone', 'Teléfono')} <span style={{ color: '#ef4444' }}>*</span></span>
                          <input type="text" readOnly value={user?.telefono || '3100000000'} style={{ background: 'var(--city-bg, #f8fafc)', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 8, fontSize: 14, color: 'var(--city-text, #334155)' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{t('admin.incidents.email', 'Correo electrónico')} <span style={{ color: '#ef4444' }}>*</span></span>
                          <input type="email" readOnly value={user?.correo || 'admin@drivique.com'} style={{ background: 'var(--city-bg, #f8fafc)', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 8, fontSize: 14, color: 'var(--city-text, #334155)' }} />
                        </label>
                      </div>
                    </div>
                  </div>
  
                  {errorModal && <p className="cities-error">{errorModal}</p>}
  
                  <button 
                    type="submit" 
                    className="cities-primary incident-modal-btn-create"
                    style={{ 
                      background: '#16a34a', 
                      color: '#fff', 
                      padding: '12px 24px', 
                      borderRadius: '9999px', 
                      fontSize: '14px', 
                      fontWeight: 800, 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      border: 'none', 
                      cursor: 'pointer', 
                      marginTop: 8,
                      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#15803d' }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#16a34a' }}
                  >
                    {t('admin.incidents.createBtn', 'Enviar Reporte de Incidencia')}
                  </button>
                </form>
              </section>
            </div>
  )
}
