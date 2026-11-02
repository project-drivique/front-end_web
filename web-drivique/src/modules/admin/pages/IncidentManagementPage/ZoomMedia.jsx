import { FaEye, FaExternalLinkAlt } from 'react-icons/fa'

export default function ZoomMedia({ setZoomMedia, t, zoomMedia }) {
  return (
    <div
              className="doc-zoom-backdrop"
              onClick={() => setZoomMedia(null)}
            >
              <div
                className="doc-zoom-modal"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: zoomMedia.isVideo ? 720 : 640 }}
              >
                <div className="doc-zoom-header">
                  <div className="doc-zoom-title-box">
                    <h3 className="doc-zoom-title">{zoomMedia.title}</h3>
                    <span className="doc-zoom-subtitle">
                      <FaEye style={{ color: 'var(--brand-text)' }} />
                      {zoomMedia.isVideo ? t('hc5.evidence_video_player', 'Reproductor de evidencia en video') : t('hc2.vista_previa_de_evidencia_fotografica', 'Vista previa de evidencia fotográfica')}
                    </span>
                  </div>
                  <div className="doc-zoom-actions">
                    {zoomMedia.url && (
                      <a
                        href={zoomMedia.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-zoom-btn-action"
                        title={t('hc2.abrir_original', 'Abrir original')}
                      >
                        <FaExternalLinkAlt style={{ fontSize: 11 }} />
                        <span>{t('hc2.abrir_original', 'Abrir original')}</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setZoomMedia(null)}
                      className="doc-modal-close"
                      title={t('hc4.cerrar', 'Cerrar')}
                    >
                      &times;
                    </button>
                  </div>
                </div>
  
                <div className="doc-zoom-preview-box" style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
                  {zoomMedia.isVideo ? (
                    <video
                      src={zoomMedia.url}
                      controls
                      autoPlay
                      style={{ width: '100%', maxHeight: '65vh', borderRadius: 12, outline: 'none' }}
                    />
                  ) : (
                    <img
                      src={zoomMedia.url}
                      alt={zoomMedia.title}
                      className="doc-zoom-img"
                      style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: 12, objectFit: 'contain' }}
                    />
                  )}
                </div>
              </div>
            </div>
  )
}
