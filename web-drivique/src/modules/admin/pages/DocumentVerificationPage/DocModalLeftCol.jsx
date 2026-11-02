import { FaEye } from 'react-icons/fa'

export default function DocModalLeftCol({ activeSection, countIdentidad, countLicencia, countReserva, getSafeDocUrl, identidadBlobUrl, licenciaBlobUrl, modalItem, renderDocPreview, setActiveSection, t }) {
  return (
    <div className="doc-modal-left-col">
                    {/* Botones Pequeños de Navegación entre Secciones */}
                    <div className="doc-section-nav-buttons">
                      <button
                        type="button"
                        className={`doc-nav-btn ${activeSection === 'identidad' ? 'is-active' : ''}`}
                        onClick={() => setActiveSection('identidad')}
                      >
                        <span>{t('hc4.identidad', 'Identidad')}</span>
                        <span className="doc-nav-btn-badge">
                          {countIdentidad}/9 {countIdentidad === 9 ? '✔' : ''}
                        </span>
                      </button>
  
                      <button
                        type="button"
                        className={`doc-nav-btn ${activeSection === 'licencia' ? 'is-active' : ''}`}
                        onClick={() => setActiveSection('licencia')}
                      >
                        <span>{t('hc4.licencia', 'Licencia')}</span>
                        <span className="doc-nav-btn-badge">
                          {countLicencia}/13 {countLicencia === 13 ? '✔' : ''}
                        </span>
                      </button>
  
                      <button
                        type="button"
                        className={`doc-nav-btn ${activeSection === 'reserva' ? 'is-active' : ''}`}
                        onClick={() => setActiveSection('reserva')}
                      >
                        <span>{t('hc4.reserva', 'Reserva')}</span>
                        <span className="doc-nav-btn-badge">
                          {countReserva}/5 {countReserva === 5 ? '✔' : ''}
                        </span>
                      </button>
                    </div>
  
                    {/* VISTA PREVIA SEGÚN SECCIÓN ACTIVA */}
                    {activeSection === 'identidad' && (
                      <div className="doc-left-preview-box">
                        <div className="doc-sheet-card">
                          {renderDocPreview(
                            modalItem.pdfCedulaUrl || modalItem.fotoCedulaFrente,
                            t('hc3.doc_page_id', { defaultValue: 'Documento de Identidad' })
                          )}
                        </div>
                        <div className="doc-page-switch-buttons">
                          {(modalItem.pdfCedulaUrl || modalItem.fotoCedulaFrente) && (
                            <a
                              href={identidadBlobUrl || getSafeDocUrl(modalItem.pdfCedulaUrl || modalItem.fotoCedulaFrente)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="doc-page-btn is-active"
                              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                              title={t('hc.abrir_pdf_en_pestana_nueva', 'Abrir PDF en pestaña nueva')}
                            >
                              <FaEye /> {t('hc.abrir_pdf', 'Abrir PDF')}
                            </a>
                          )}
                        </div>
                        <p className="doc-page-info-text">
                          PDF · {modalItem.documentoIdentidadPdf || `Cedula-${modalItem.documentoIdentidad}.pdf`}
                        </p>
                      </div>
                    )}
  
                    {activeSection === 'licencia' && (
                      <div className="doc-left-preview-box">
                        <div className="doc-sheet-card">
                          {renderDocPreview(
                            modalItem.pdfLicenciaUrl || modalItem.fotoLicenciaFrente,
                            t('hc3.doc_page_license', { defaultValue: 'Licencia de Conducción' })
                          )}
                        </div>
                        <div className="doc-page-switch-buttons">
                          {(modalItem.pdfLicenciaUrl || modalItem.fotoLicenciaFrente) && (
                            <a
                              href={licenciaBlobUrl || getSafeDocUrl(modalItem.pdfLicenciaUrl || modalItem.fotoLicenciaFrente)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="doc-page-btn is-active"
                              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                              title={t('hc.abrir_pdf_en_pestana_nueva', 'Abrir PDF en pestaña nueva')}
                            >
                              <FaEye /> {t('hc.abrir_pdf', 'Abrir PDF')}
                            </a>
                          )}
                        </div>
                        <p className="doc-page-info-text">
                          PDF · {modalItem.licenciaConduccionPdf || `Licencia-${modalItem.documentoIdentidad}.pdf`}
                        </p>
                      </div>
                    )}
  
                    {activeSection === 'reserva' && (
                      <div className="doc-left-reserva-comparison">
                        <h4 className="doc-reserva-card-title">{t('hc.datos_de_la_reserva_para_comparar', 'Datos de la Reserva para Comparar')}</h4>
                        <div className="doc-reserva-card-body">
                          <div className="doc-reserva-row">
                            <span className="label">{t('hc.cliente_titular', 'Cliente / Titular:')}</span>
                            <span className="value">{modalItem.clienteNombre}</span>
                          </div>
                          <div className="doc-reserva-row">
                            <span className="label">{t('hc.numero_de_documento', 'Número de Documento:')}</span>
                            <span className="value">{modalItem.documentoIdentidad}</span>
                          </div>
                          <div className="doc-reserva-row">
                            <span className="label">{t('hc.licencia_categoria', 'Licencia / Categoría:')}</span>
                            <span className="value">{modalItem.numeroLicencia} ({modalItem.categoriaLicencia || 'B1'})</span>
                          </div>
                          <div className="doc-reserva-row">
                            <span className="label">{t('hc.vehiculo_reservado', 'Vehículo Reservado:')}</span>
                            <span className="value">{modalItem.vehiculoNombre || modalItem.vehiculo || t('hc2.vehiculo_reservado', 'Vehículo Reservado')}</span>
                          </div>
                          <div className="doc-reserva-row">
                            <span className="label">{t('hc2.fecha_inicio_alquiler', 'Fecha Inicio Alquiler:')}</span>
                            <span className="value">{modalItem.fechaInicio || '10 Oct 2026'}</span>
                          </div>
                          <div className="doc-reserva-row">
                            <span className="label">{t('hc2.fecha_fin_alquiler', 'Fecha Fin Alquiler:')}</span>
                            <span className="value">{modalItem.fechaFin || '15 Oct 2026'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
  )
}
