import { FaTimesCircle, FaCheckCircle } from 'react-icons/fa'

export default function ModalDocumentos({ handleVerificarDocumentos, modalDocumentos, observacionDoc, setModalDocumentos, setObservacionDoc, t }) {
  return (
    <div
              className="cities-modal-backdrop"
              onMouseDown={(e) => e.target === e.currentTarget && setModalDocumentos(null)}
            >
              <section className="cities-modal user-doc-modal">
                <div className="cities-modal__head">
                  <div>
                    <p className="cities-eyebrow">{t('admin.usersPage.identityVerify')}</p>
                    <h2>{t('admin.usersPage.docsOf', { nombre: modalDocumentos.nombre })}</h2>
                  </div>
                  <button type="button" onClick={() => setModalDocumentos(null)}>
                    á—
                  </button>
                </div>
  
                <div className="user-doc-grid">
                  <div className="user-doc-card">
                    <strong>{t('admin.usersPage.idOrPassport')}</strong>
                    {modalDocumentos.documentoCedula ? (
                      <img src={modalDocumentos.documentoCedula} alt={t('hc.cedula', 'Cédula')} className="user-doc-preview" />
                    ) : (
                      <div className="user-doc-placeholder">{t('admin.usersPage.noIdAttached')}</div>
                    )}
                  </div>
  
                  <div className="user-doc-card">
                    <strong>{t('admin.usersPage.driverLicense')}</strong>
                    {modalDocumentos.documentoLicencia ? (
                      <img src={modalDocumentos.documentoLicencia} alt={t('hc4.licencia', 'Licencia')} className="user-doc-preview" />
                    ) : (
                      <div className="user-doc-placeholder">{t('admin.usersPage.noLicenseAttached')}</div>
                    )}
                  </div>
                </div>
  
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--city-muted)' }}>
                  Observaciones o motivo de rechazo:
                  <input
                    type="text"
                    placeholder={t('hc4.ej_licencia_vigente_aprobada_foto_borr', 'Ej: Licencia vigente aprobada / Foto borrosa...')}
                    value={observacionDoc}
                    onChange={(e) => setObservacionDoc(e.target.value)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--city-border)',
                      marginTop: 6,
                    }}
                  />
                </label>
  
                <div className="cities-modal__actions" style={{ marginTop: 24 }}>
                  <button
                    type="button"
                    className="cities-danger"
                    onClick={() => handleVerificarDocumentos('rechazado')}
                  >
                    <FaTimesCircle /> Rechazar Documentos
                  </button>
                  <button
                    type="button"
                    className="cities-primary"
                    onClick={() => handleVerificarDocumentos('aprobado')}
                  >
                    <FaCheckCircle /> Aprobar Documentos
                  </button>
                </div>
              </section>
            </div>
  )
}
