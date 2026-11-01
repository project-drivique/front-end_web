import { FaCommentDots, FaExternalLinkAlt, FaPaperPlane } from 'react-icons/fa'

const backdropStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  background: 'rgba(15,23,42,0.65)',
  padding: 16,
}
const modalHeadStyle = {
  padding: '20px 24px',
  borderBottom: '1px solid var(--city-border)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}
const closeBtnStyle = {
  background: 'transparent',
  border: 'none',
  fontSize: 24,
  cursor: 'pointer',
  color: 'var(--city-muted)',
  lineHeight: 1,
  padding: 0,
}

export function BranchReviewsMobileCards({ filtered, handleOpenResponder, t }) {
  return (
    <div className="doc-mobile-cards">
      {filtered.map((item, i) => {
        const tieneRespuesta = Boolean(item.respuestaEncargado)
        return (
          <div key={item.id} className="doc-mobile-card">
            <div className="doc-mobile-card-header">
              <div className="doc-mobile-card-title">
                <span style={{ fontWeight: 400, color: 'var(--brand-primary, #2563eb)', fontSize: 13 }}>
                  ID {i + 1}
                </span>
                <span style={{ fontWeight: 500, color: 'var(--city-text, #0f172a)', fontSize: 14 }}>
                  {item.reservaCodigo || `RES-${item.id}`}
                </span>
              </div>
              <span className={`doc-status-badge ${tieneRespuesta ? 'aprobado' : 'pendiente'}`}>
                {tieneRespuesta
                  ? t('admin.reviews.status.published', 'Respondida')
                  : t('admin.reviews.status.pending', 'Pendiente')}
              </span>
            </div>

            <div className="doc-mobile-card-body">
              <div className="doc-mobile-data-item doc-mobile-data-item--full">
                <span className="doc-mobile-data-label">{t('admin.reviews.table.clientName', 'CLIENTE')}</span>
                <span className="doc-mobile-data-value" style={{ fontSize: 14, fontWeight: 500 }}>
                  {item.clienteNombre}
                </span>
              </div>

              <div className="doc-mobile-data-item doc-mobile-data-item--full">
                <span className="doc-mobile-data-label">{t('admin.reviews.table.vehicle', 'VEHÍCULO')}</span>
                <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>
                  {item.vehiculo}
                </span>
              </div>

              <div className="doc-mobile-data-item">
                <span className="doc-mobile-data-label">{t('admin.reviews.table.rating', 'CALIFICACIÓN')}</span>
                <span className="doc-mobile-data-value" style={{ color: '#f59e0b', fontWeight: 700 }}>
                  {item.calificacion}.0 ★
                </span>
              </div>

              <div className="doc-mobile-data-item">
                <span className="doc-mobile-data-label">{t('admin.reviews.table.date', 'FECHA')}</span>
                <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>
                  {item.fecha || '-'}
                </span>
              </div>

              <div className="doc-mobile-data-item doc-mobile-data-item--full">
                <span className="doc-mobile-data-label">{t('admin.reviews.table.comment', 'COMENTARIO')}</span>
                <span
                  className="doc-mobile-data-value"
                  style={{ fontStyle: 'italic', color: 'var(--city-text, #334155)', fontWeight: 400 }}
                >
                  "{item.comentario}"
                </span>
              </div>

              {tieneRespuesta && (
                <div className="doc-mobile-data-item doc-mobile-data-item--full">
                  <span className="doc-mobile-data-label">
                    {t('admin.reviews.table.reply', 'RESPUESTA SUCURSAL')}
                  </span>
                  <span className="doc-mobile-data-value" style={{ color: '#166534', fontWeight: 500 }}>
                    {item.respuestaEncargado}
                  </span>
                </div>
              )}
            </div>

            <div className="doc-mobile-card-actions">
              <button
                type="button"
                onClick={() => handleOpenResponder(item)}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '12px',
                  background: tieneRespuesta ? 'var(--brand-soft-light, #eff6ff)' : 'var(--brand-primary)',
                  color: tieneRespuesta ? 'var(--brand-primary, #2563eb)' : '#ffffff',
                  border: tieneRespuesta ? '1px solid var(--brand-border-light, #bfdbfe)' : 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <FaCommentDots />{' '}
                {tieneRespuesta
                  ? t('admin.reviews.editReplyBtn', 'Editar Respuesta')
                  : t('admin.reviews.replyBtn', 'Responder')}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function BranchReviewsModals({
  modalReview,
  setModalReview,
  respuestaTexto,
  setRespuestaTexto,
  handleEnviarRespuesta,
  zoomMedia,
  setZoomMedia,
  t,
}) {
  return (
    <>
      {modalReview && (
        <div
          className="cities-modal-backdrop"
          style={backdropStyle}
          onMouseDown={(e) => e.target === e.currentTarget && setModalReview(null)}
        >
          <section
            className="cities-modal"
            style={{
              maxWidth: 520,
              width: '100%',
              background: 'var(--city-card)',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <div style={modalHeadStyle}>
              <div>
                <p
                  style={{
                    color: 'var(--city-muted)',
                    margin: 0,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 4,
                  }}
                >
                  {t('admin.reviews.modal.eyebrow', 'RESPUESTA OFICIAL DE SUCURSAL')}
                </p>
                <h2 style={{ color: 'var(--city-text)', margin: 0, fontSize: 18, fontWeight: 800 }}>
                  {t('admin.reviews.modal.replyTo', 'Responder a {{name}}', { name: modalReview.clienteNombre })}
                </h2>
              </div>
              <button type="button" onClick={() => setModalReview(null)} style={closeBtnStyle}>
                &times;
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: 13, color: 'var(--city-muted, #64748b)', marginBottom: 14, lineHeight: 1.5 }}>
                {t(
                  'admin.reviews.modal.description',
                  'Tu respuesta será visible públicamente para los clientes que consulten las opiniones de la sede.'
                )}
              </p>

              <div
                style={{
                  padding: 14,
                  background: 'var(--city-bg, #f8fafc)',
                  borderRadius: 10,
                  border: '1.5px solid var(--city-border, #cbd5e1)',
                  marginBottom: 16,
                }}
              >
                <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--city-muted, #64748b)', fontWeight: 600 }}>
                  {t('admin.reviews.modal.clientComment', 'Comentario del cliente:')}
                </p>
                <p style={{ margin: 0, fontSize: 13.5, color: 'var(--city-text, #0f172a)', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{modalReview.comentario}"
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: 'var(--city-text, #0f172a)',
                    marginBottom: 6,
                  }}
                >
                  {t('admin.reviews.modal.officialResponseLabel', 'Respuesta Oficial de Sucursal *')}
                </label>
                <textarea
                  rows={4}
                  required
                  value={respuestaTexto}
                  onChange={(e) => setRespuestaTexto(e.target.value)}
                  placeholder={t('admin.reviews.modal.placeholder', 'Escribe la respuesta oficial de la sucursal...')}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1.5px solid var(--city-border, #cbd5e1)',
                    background: 'var(--city-bg, #f8fafc)',
                    color: 'var(--city-text, #0f172a)',
                    fontSize: 13,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid var(--city-border)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setModalReview(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 9999,
                  background: 'transparent',
                  color: 'var(--city-muted)',
                  border: '1.5px solid var(--city-border)',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {t('admin.reviews.modal.cancelBtn', 'Cancelar')}
              </button>
              <button
                type="button"
                onClick={handleEnviarRespuesta}
                style={{
                  padding: '9px 24px',
                  borderRadius: 9999,
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                }}
              >
                <FaPaperPlane size={12} /> {t('admin.reviews.modal.publishSubmit', 'Publicar Respuesta')}
              </button>
            </div>
          </section>
        </div>
      )}

      {zoomMedia && (
        <div
          className="cities-modal-backdrop"
          style={backdropStyle}
          onMouseDown={(e) => e.target === e.currentTarget && setZoomMedia(null)}
        >
          <section
            className="cities-modal"
            style={{
              maxWidth: 720,
              width: '100%',
              background: '#0f172a',
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid #334155',
              color: '#ffffff',
            }}
          >
            <div
              style={{
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #1e293b',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#38bdf8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('hc.evidencia_de_foto_adjuntada', 'EVIDENCIA DE FOTO ADJUNTADA')}
                </span>
                <h3 style={{ margin: 0, fontSize: 16, color: '#ffffff', fontWeight: 700 }}>{zoomMedia.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setZoomMedia(null)}
                style={{ background: 'transparent', border: 'none', fontSize: 24, color: '#94a3b8', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            <div
              style={{
                padding: 24,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#020617',
                minHeight: 320,
              }}
            >
              <img
                src={zoomMedia.url}
                alt={zoomMedia.title}
                style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 12, objectFit: 'contain' }}
              />
            </div>
            <div
              style={{
                padding: '14px 24px',
                background: '#0f172a',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #1e293b',
              }}
            >
              <a
                href={zoomMedia.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#38bdf8',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <FaExternalLinkAlt size={11} /> Abrir imagen original
              </a>
              <button
                type="button"
                onClick={() => setZoomMedia(null)}
                style={{
                  padding: '6px 18px',
                  borderRadius: 9999,
                  background: '#334155',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
