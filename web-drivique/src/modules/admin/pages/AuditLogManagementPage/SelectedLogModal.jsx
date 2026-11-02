import { FaShieldAlt, FaTimes, FaCheck, FaCopy, FaLock } from 'react-icons/fa'

export default function SelectedLogModal({ copiedId, copiedJson, handleCopyJson, handleCopyLogId, renderResultBadge, selectedLogModal, setSelectedLogModal, t, tasaUSD }) {
  return (
    <div
              className="audit-modal-backdrop"
              onClick={() => setSelectedLogModal(null)}
            >
              <div
                className="audit-modal-card"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="audit-modal-head">
                  <div className="audit-modal-head-title">
                    <span className="audit-modal-eyebrow">
                      <FaShieldAlt size={11} /> {t('admin.audit_module.modal.eyebrow', 'REGISTRO FORENSE DE AUDITORÍA')}
                    </span>
                    <h2>{selectedLogModal.id}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedLogModal(null)}
                    className="audit-modal-close"
                  >
                    <FaTimes size={13} />
                  </button>
                </div>
  
                <div className="audit-modal-body">
                  {/* Barra superior de acciones */}
                  <div className="audit-modal-status-bar">
                    <div className="audit-modal-result-badge">
                      {renderResultBadge(selectedLogModal.resultado)}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="audit-btn-modal-copy"
                        onClick={() => handleCopyLogId(selectedLogModal.id)}
                      >
                        {copiedId ? <FaCheck size={10} color="#16a34a" /> : <FaCopy size={10} />}
                        {copiedId ? t('admin.audit_module.modal.copied', 'Copiado') : t('admin.audit_module.modal.copyId', 'Copiar ID')}
                      </button>
                      {selectedLogModal.detalles && (
                        <button
                          type="button"
                          className="audit-btn-modal-copy"
                          onClick={() => handleCopyJson(selectedLogModal)}
                        >
                          {copiedJson ? <FaCheck size={10} color="#16a34a" /> : <FaCopy size={10} />}
                          {copiedJson ? t('admin.audit_module.modal.copied', 'Copiado') : t('admin.audit_module.modal.copyJson', 'Copiar JSON')}
                        </button>
                      )}
                    </div>
                  </div>
  
                  {/* Grid de Metadatos */}
                  <div className="audit-modal-meta-grid">
                    <div className="audit-modal-meta-item">
                      <span className="audit-modal-meta-label">{t('admin.audit_module.modal.dateTime', 'Fecha y Hora')}</span>
                      <strong>{new Date(selectedLogModal.fecha).toLocaleString('es-CO')}</strong>
                    </div>
  
                    <div className="audit-modal-meta-item">
                      <span className="audit-modal-meta-label">{t('admin.audit_module.modal.moduleType', 'Módulo / Tipo')}</span>
                      <strong>{selectedLogModal.modulo}</strong>
                      <small>{selectedLogModal.tipo}</small>
                    </div>
  
                    <div className="audit-modal-meta-item">
                      <span className="audit-modal-meta-label">{t('admin.audit_module.modal.actorUser', 'Actor / Usuario')}</span>
                      <strong>{selectedLogModal.actor}</strong>
                      <small>{selectedLogModal.correo} ({selectedLogModal.rol})</small>
                    </div>
  
                    <div className="audit-modal-meta-item">
                      <span className="audit-modal-meta-label">{t('admin.audit_module.modal.branch', 'Sucursal')}</span>
                      <strong>{selectedLogModal.sucursal}</strong>
                    </div>
  
                    <div className="audit-modal-meta-item">
                      <span className="audit-modal-meta-label">{t('admin.audit_module.modal.ipAddress', 'Dirección IP')}</span>
                      <strong style={{ fontFamily: 'monospace' }}>{selectedLogModal.ip}</strong>
                    </div>
  
                    <div className="audit-modal-meta-item">
                      <span className="audit-modal-meta-label">{t('admin.audit_module.modal.device', 'Dispositivo')}</span>
                      <strong style={{ fontSize: 11.5 }}>{selectedLogModal.dispositivo || 'N/A'}</strong>
                    </div>
                  </div>
  
                  {/* Acción Registrada */}
                  <div className="audit-modal-section">
                    <span className="audit-modal-meta-label">{t('admin.audit_module.modal.action', 'Acción Registrada')}</span>
                    <div className="audit-modal-box">
                      <p>{selectedLogModal.accion}</p>
                    </div>
                  </div>
  
                  {/* Motivo */}
                  {selectedLogModal.motivo && (
                    <div className="audit-modal-section">
                      <span className="audit-modal-meta-label">{t('admin.audit_module.modal.reason', 'Motivo o Causa')}</span>
                      <div className="audit-modal-box">
                        <p>{selectedLogModal.motivo}</p>
                      </div>
                    </div>
                  )}
  
                  {/* Conversión de Moneda si el evento contiene montos */}
                  {selectedLogModal.detalles &&
                    (selectedLogModal.detalles.total ||
                      selectedLogModal.detalles.precioNuevo ||
                      selectedLogModal.detalles.precio ||
                      selectedLogModal.detalles.precioAnterior) && (
                      <div className="audit-modal-section">
                        <span className="audit-modal-meta-label">
                          {t('admin.audit_module.modal.currencyConversion', 'Conversión Monetaria (COP ⇄ USD)')}
                        </span>
                        <div className="audit-modal-currency-card">
                          <div className="audit-currency-box audit-currency-box--cop">
                            <span className="audit-currency-label">{t('admin.audit_module.modal.copLabel', 'Pesos Colombianos')}</span>
                            <strong>
                              $
                              {Number(
                                selectedLogModal.detalles.total ||
                                  selectedLogModal.detalles.precioNuevo ||
                                  selectedLogModal.detalles.precio ||
                                  0
                              ).toLocaleString('es-CO')}{' '}
                              COP
                            </strong>
                          </div>
                          <span className="audit-currency-transfer-icon">⇄</span>
                          <div className="audit-currency-box audit-currency-box--usd">
                            <span className="audit-currency-label">{t('admin.audit_module.modal.usdLabel', 'Dólares Americanos')}</span>
                            <strong>
                              ≈ $
                              {Math.round(
                                Number(
                                  selectedLogModal.detalles.total ||
                                    selectedLogModal.detalles.precioNuevo ||
                                    selectedLogModal.detalles.precio ||
                                    0
                                ) / (tasaUSD || 4000)
                              ).toLocaleString('en-US')}{' '}
                              USD
                            </strong>
                          </div>
                        </div>
                        <small className="audit-currency-rate-sub">
                          {t('admin.audit_module.modal.rateApplied', { rate: (tasaUSD || 4000).toLocaleString('es-CO'), defaultValue: `Tasa de cambio calculada: 1 USD ≈ ${(tasaUSD || 4000).toLocaleString('es-CO')} COP` })}
                        </small>
                      </div>
                    )}
  
                  {/* Detalles JSON */}
                  {selectedLogModal.detalles && (
                    <div className="audit-modal-section">
                      <span className="audit-modal-meta-label">{t('admin.audit_module.modal.jsonMetadata', 'Metadatos del Evento (JSON)')}</span>
                      <pre className="audit-modal-json-pre">
                        {JSON.stringify(selectedLogModal.detalles, null, 2)}
                      </pre>
                    </div>
                  )}
  
                  {/* Sello de seguridad */}
                  <div className="audit-modal-watermark">
                    <FaLock size={13} className="audit-modal-watermark-icon" />
                    <span>
                      {t('admin.audit_module.modal.watermark', 'Este registro de auditoría es inmutable y no puede ser alterado ni eliminado según las normativas de trazabilidad de la plataforma.')}
                    </span>
                  </div>
                </div>
  
                <div className="audit-modal-foot">
                  <button
                    type="button"
                    className="audit-modal-btn-close"
                    onClick={() => setSelectedLogModal(null)}
                  >
                    {t('admin.audit_module.modal.close', 'Cerrar')}
                  </button>
                </div>
              </div>
            </div>
  )
}
