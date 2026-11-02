import { FaFileImage, FaVideo } from 'react-icons/fa'

const NO_PREVIEW = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="#f1f5f9"/><text x="50%" y="50%" fill="#64748b" font-family="sans-serif" font-size="16" text-anchor="middle">Sin vista previa</text></svg>')

export default function IncidentManagementPart2({ modalDetalle, setZoomMedia, t }) {
  return (
    <div style={{ margin: '14px 0', padding: '16px 18px', background: 'var(--city-bg, #f8fafc)', borderRadius: 14, border: '1px solid var(--city-border, #cbd5e1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--city-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        EVIDENCIAS ADJUNTADAS POR EL CLIENTE ({modalDetalle.evidenciasCount || [modalDetalle.evidenciaFoto1, modalDetalle.evidenciaFoto2, modalDetalle.evidenciaFoto3, modalDetalle.evidenciaVideo].filter(Boolean).length || 0})
                      </span>
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                        Haz clic en cualquier archivo para inspeccionar a alta resolución
                      </span>
                    </div>
  
                    {(modalDetalle.evidenciaFoto1 || modalDetalle.evidenciaFoto2 || modalDetalle.evidenciaFoto3 || modalDetalle.evidenciaVideo) ? (
                      <div className="incident-gallery-grid">
                        {modalDetalle.evidenciaFoto1 && (
                          <div
                            className="incident-gallery-card"
                            onClick={() => setZoomMedia({ url: modalDetalle.evidenciaFoto1Url, title: `Evidencia Foto 1: ${modalDetalle.evidenciaFoto1}`, isVideo: false })}
                          >
                            <img
                              src={modalDetalle.evidenciaFoto1Url || NO_PREVIEW}
                              alt={t('hc4.evidencia_1', 'Evidencia 1')}
                              className="incident-gallery-preview"
                            />
                            <div className="incident-gallery-meta">
                              <span className="incident-gallery-title">{modalDetalle.evidenciaFoto1}</span>
                              <span className="incident-gallery-btn"><FaFileImage size={11} /> {t('hc4.ampliar_foto', 'Ampliar Foto')}</span>
                            </div>
                          </div>
                        )}
  
                        {modalDetalle.evidenciaFoto2 && (
                          <div
                            className="incident-gallery-card"
                            onClick={() => setZoomMedia({ url: modalDetalle.evidenciaFoto2Url, title: `Evidencia Foto 2: ${modalDetalle.evidenciaFoto2}`, isVideo: false })}
                          >
                            <img
                              src={modalDetalle.evidenciaFoto2Url || NO_PREVIEW}
                              alt={t('hc4.evidencia_2', 'Evidencia 2')}
                              className="incident-gallery-preview"
                            />
                            <div className="incident-gallery-meta">
                              <span className="incident-gallery-title">{modalDetalle.evidenciaFoto2}</span>
                              <span className="incident-gallery-btn"><FaFileImage size={11} /> {t('hc4.ampliar_foto', 'Ampliar Foto')}</span>
                            </div>
                          </div>
                        )}
  
                        {modalDetalle.evidenciaFoto3 && (
                          <div
                            className="incident-gallery-card"
                            onClick={() => setZoomMedia({ url: modalDetalle.evidenciaFoto3Url, title: `Evidencia Foto 3: ${modalDetalle.evidenciaFoto3}`, isVideo: false })}
                          >
                            <img
                              src={modalDetalle.evidenciaFoto3Url || NO_PREVIEW}
                              alt={t('hc4.evidencia_3', 'Evidencia 3')}
                              className="incident-gallery-preview"
                            />
                            <div className="incident-gallery-meta">
                              <span className="incident-gallery-title">{modalDetalle.evidenciaFoto3}</span>
                              <span className="incident-gallery-btn"><FaFileImage size={11} /> {t('hc4.ampliar_foto', 'Ampliar Foto')}</span>
                            </div>
                          </div>
                        )}
  
                        {modalDetalle.evidenciaVideo && (
                          <div
                            className="incident-gallery-card"
                            onClick={() => setZoomMedia({ url: modalDetalle.evidenciaVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', title: `Video: ${modalDetalle.evidenciaVideo}`, isVideo: true })}
                          >
                            <div className="incident-gallery-preview" style={{ background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                                <FaVideo />
                              </div>
                            </div>
                            <div className="incident-gallery-meta">
                              <span className="incident-gallery-title">{modalDetalle.evidenciaVideo}</span>
                              <span className="incident-gallery-btn" style={{ color: '#8b5cf6' }}><FaVideo size={11} /> {t('hc4.reproducir_video', 'Reproducir Video')}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--city-muted, #64748b)', fontStyle: 'italic' }}>
                        El cliente no adjuntó archivos multimedia al registrar este reporte; la atención se fundamenta en la declaración técnica del siniestro.
                      </p>
                    )}
                  </div>
  )
}
