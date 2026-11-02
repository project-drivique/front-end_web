import { FaEye, FaExternalLinkAlt } from 'react-icons/fa'
import DocumentPreviewer from '../../../../components/DocumentPreviewer'

export default function ZoomPdf({ getSafeDocUrl, setZoomPdf, t, zoomPdf }) {
  return (
    <div
              className="doc-zoom-backdrop"
              onClick={() => setZoomPdf(null)}
            >
              <div
                className={`doc-zoom-modal ${
                  zoomPdf.url?.toLowerCase().includes('.pdf')
                    ? 'doc-zoom-modal--iframe'
                    : ''
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="doc-zoom-header">
                  <div className="doc-zoom-title-box">
                    <h3 className="doc-zoom-title">{zoomPdf.title}</h3>
                    <span className="doc-zoom-subtitle">
                      <FaEye style={{ color: 'var(--brand-text)' }} />
                      {t('admin.documents.modal.previewTitle', 'Vista previa del documento')}
                    </span>
                  </div>
                  <div className="doc-zoom-actions">
                    {zoomPdf.url && (
                      <a
                        href={getSafeDocUrl(zoomPdf.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-zoom-btn-action"
                        title={t('admin.documents.openNewTab', 'Abrir original')}
                      >
                        <FaExternalLinkAlt style={{ fontSize: 11 }} />
                        <span>{t('admin.documents.openNewTab', 'Abrir original')}</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setZoomPdf(null)}
                      className="doc-modal-close"
                      title={t('admin.documents.modal.closeBtn', 'Cerrar')}
                    >
                      &times;
                    </button>
                  </div>
                </div>
  
                <div className="doc-zoom-preview-box">
                  <DocumentPreviewer
                    url={zoomPdf.url}
                    title={zoomPdf.title}
                    isZoomed={true}
                    fallbackSubtitle={zoomPdf.title}
                  />
                </div>
              </div>
            </div>
  )
}
