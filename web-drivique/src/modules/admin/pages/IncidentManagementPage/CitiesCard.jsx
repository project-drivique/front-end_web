import { FaSearch, FaBuilding, FaPlus, FaFileExcel, FaFilePdf, FaPrint, FaExclamationTriangle, FaFileImage, FaVideo, FaShieldAlt, FaPaperPlane, FaTrash, FaEye } from 'react-icons/fa'

export default function CitiesCard({ branchFilter, esEncargado, exportData, filtrados, getStatusBadge, getVehiculoImagen, handleExportExcel, handleExportPdf, handlePrint, openDetalleModal, openResponderModal, search, setBranchFilter, setErrorModal, setModalCrear, setModalEliminar, setSearch, setStateFilter, setZoomMedia, stateFilter, sucursalEncargado, sucursales, t, translateDescription }) {
  return (
    <section className="cities-card attached-to-tabs">
              {/* Toolbar con Buscador, Filtros, Botón Crear y Exportación */}
              <div className="cities-toolbar">
                <label className="cities-search">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder={t('admin.incidents.searchPlaceholder', 'Buscar por código, vehículo, placa o cliente...')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
  
                {/* Filtro Estado */}
                <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
                  <option value="all">{t('admin.incidents.allStatuses', 'Todos los estados')}</option>
                  <option value="recibido">{t('admin.incidents.status.received', 'Recibido')}</option>
                  <option value="atendiendo">{t('admin.incidents.status.attending', 'Atendiendo')}</option>
                  <option value="resuelto">{t('admin.incidents.status.resolved', 'Resuelto')}</option>
                  <option value="rechazado">{t('admin.incidents.status.rejected', 'Rechazado')}</option>
                </select>
  
                {/* Filtro Sucursal (Bloqueado para Encargado o Selector para Admin) */}
                {!esEncargado ? (
                  <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
                    <option value="all">{t('admin.incidents.allBranches', 'Todas las sucursales')}</option>
                    {sucursales.map((s) => (
                      <option key={s.id} value={s.nombre}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--city-border, #e2e8f0)', background: 'var(--city-bg, #f8fafc)', fontSize: '13px', color: 'var(--city-text, #334155)', fontWeight: 600 }}>
                    <FaBuilding style={{ color: 'var(--city-muted, #64748b)' }} />
                    <span>{sucursalEncargado || t('common.unassigned', 'Sin asignar')}</span>
                  </div>
                )}
  
                {/* Botón Nuevo Reporte (Solo Encargado) */}
                {esEncargado && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorModal('')
                      setModalCrear(true)
                    }}
                    style={{
                      padding: '8px 20px',
                      background: 'var(--brand-primary)',
                      color: 'var(--city-card, #ffffff)',
                      borderRadius: '9999px',
                      fontWeight: '800',
                      fontSize: '13px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(var(--brand-primary-rgb), 0.25)',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'var(--brand-primary, #1d4ed8)' }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'var(--brand-primary)' }}
                  >
                    <FaPlus /> {t('admin.incidents.newReport', 'Nuevo Reporte de Incidencia')}
                  </button>
                )}
  
                {/* Botones de Exportación */}
                <div className="export-pills-group" style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="export-pill export-pill--excel"
                    onClick={() => handleExportExcel(exportData)}
                    title={t('admin.exportExcel', 'Excel')}
                  >
                    <FaFileExcel aria-hidden="true" /> {t('admin.exportExcel', 'Excel')}
                  </button>
                  <button
                    type="button"
                    className="export-pill export-pill--pdf"
                    onClick={() => handleExportPdf(exportData)}
                    title={t('admin.exportPdf', 'PDF')}
                  >
                    <FaFilePdf aria-hidden="true" /> {t('admin.exportPdf', 'PDF')}
                  </button>
                  <button
                    type="button"
                    className="export-pill export-pill--print"
                    onClick={() => handlePrint(exportData)}
                    title={t('admin.incidents.print', 'Imprimir')}
                  >
                    <FaPrint aria-hidden="true" /> {t('admin.incidents.print', 'Imprimir')}
                  </button>
                </div>
              </div>
  
              {/* Contador de Resultados */}
              <div className="cities-summary" style={{ margin: '8px 0 12px' }}>
                <span>{filtrados.length}</span>{' '}
                {t('admin.incidents.registered', 'INCIDENCIAS REGISTRADAS').toUpperCase()}
              </div>
  
              {/* Tabla Estilizada de Incidencias */}
              {filtrados.length === 0 ? (
                <div className="cities-empty">
                  <FaExclamationTriangle />
                  <h2>{t('admin.incidents.emptyTitle', 'No se encontraron reportes de incidencias')}</h2>
                  <p>{t('admin.incidents.emptySubtitle', 'Intenta ajustar los criterios de búsqueda o los filtros seleccionados.')}</p>
                </div>
              ) : (
                <div className="cities-table-wrap" style={{ overflowX: 'auto' }}>
                  <table className="incidents-table-v2" style={{ whiteSpace: 'nowrap', width: 'max-content', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>#</th>
                        <th>{t('admin.incidents.table.reservationCode', 'CÓDIGO RESERVA')}</th>
                        <th>{t('admin.incidents.table.fullName', 'NOMBRE COMPLETO')}</th>
                        <th>{t('admin.incidents.table.vehicleName', 'NOMBRE VEHÍCULO')}</th>
                        <th>{t('admin.incidents.table.image', 'IMAGEN')}</th>
                        <th>{t('admin.incidents.table.plate', 'PLACA')}</th>
                        <th>{t('hc.sede_sucursal', 'SEDE / SUCURSAL')}</th>
                        <th>{t('admin.incidents.table.incidentType', 'TIPO DE INCIDENTE')}</th>
                        <th>{t('admin.incidents.table.problemDesc', 'DESCRIPCIÓN PROBLEMA')}</th>
                        <th>{t('admin.incidents.table.reportDate', 'FECHA DE REPORTE')}</th>
                        <th>{t('admin.incidents.table.reportTime', 'HORA DE REPORTE')}</th>
                        <th>{t('admin.incidents.table.evidence1', 'EVIDENCIA FOTO 1')}</th>
                        <th>{t('admin.incidents.table.evidence2', 'EVIDENCIA FOTO 2')}</th>
                        <th>{t('admin.incidents.table.evidence3', 'EVIDENCIA FOTO 3')}</th>
                        <th>{t('admin.incidents.table.evidenceVideo', 'EVIDENCIA VIDEO')}</th>
                        <th>{t('admin.incidents.table.phone', 'TELÉFONO')}</th>
                        <th>{t('admin.incidents.table.email', 'CORREO')}</th>
                        <th style={{ textAlign: 'center' }}>{t('admin.incidents.table.incidentStatus', 'ESTADO DE INCIDENTE')}</th>
                        <th style={{ textAlign: 'center' }}>{t('admin.incidents.table.actions', 'ACCIONES')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtrados.map((r, index) => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600, color: 'var(--city-text)', width: '40px' }}>{index + 1}</td>
                          <td style={{ fontWeight: 700, color: 'var(--brand-primary, #2563eb)' }}>
                            <span style={{ background: 'var(--brand-soft)', border: '1px solid var(--brand-border)', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }}>
                              {r.codigoReserva || r.reservaCodigo || `RES-${r.id.split('-')[1] || 'S/R'}`}
                            </span>
                          </td>
                          <td style={{ color: 'var(--city-text, #0f172a)', fontWeight: 600 }}>{r.contactoNombre}</td>
                          <td style={{ color: 'var(--city-text)' }}>{r.vehiculo}</td>
                          <td>
                            <img src={getVehiculoImagen(r) || undefined} alt={r.vehiculo} style={{ width: 44, height: 28, borderRadius: 6, objectFit: 'cover', border: '1px solid #cbd5e1' }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/a2cb0b378c25efdb1e116246f84149744c2f4081.jpg' }} />
                          </td>
                          <td style={{ color: 'var(--city-muted, #64748b)', fontWeight: 700 }}>{r.placa}</td>
                          <td style={{ color: 'var(--city-text, #334155)', fontWeight: 600 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <FaBuilding size={11} style={{ color: '#64748b' }} /> {r.sucursal}
                            </span>
                          </td>
                          
                          <td style={{ color: 'var(--city-text, #334155)', fontWeight: 500 }}>{t(`admin.incidents.types.${r.tipoIncidenciaId || 'averia_mecanica'}`, r.tipoIncidenciaNombre || t('hc2.averia_mecanica', 'Avería Mecánica'))}</td>
                          <td style={{ color: 'var(--city-muted, #64748b)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{translateDescription(r.descripcion)}</td>
                          <td style={{ color: 'var(--city-text, #0f172a)' }}>{new Date(r.fechaIso || r.fechaRegistro || new Date().getTime()).toLocaleDateString()}</td>
                          <td style={{ color: 'var(--city-text, #0f172a)' }}>{new Date(r.fechaIso || r.fechaRegistro || new Date().getTime()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                          
                          <td>
                            {r.evidenciaFoto1 ? (
                              <div
                                className="doc-table-pdf-link"
                                onClick={() => r.evidenciaFoto1Url && setZoomMedia({ url: r.evidenciaFoto1Url, title: `Evidencia Foto 1 — ${r.codigoReserva || r.codigo}`, isVideo: false })}
                                title={t('hc.abrir_foto_de_evidencia_1', 'Abrir foto de evidencia 1')}
                              >
                                <FaFileImage style={{ color: 'var(--brand-text)', fontSize: 13 }} />
                                <span>{r.evidenciaFoto1}</span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--city-muted, #94a3b8)', fontSize: 12.5 }}>—</span>
                            )}
                          </td>
                          <td>
                            {r.evidenciaFoto2 ? (
                              <div
                                className="doc-table-pdf-link"
                                onClick={() => r.evidenciaFoto2Url && setZoomMedia({ url: r.evidenciaFoto2Url, title: `Evidencia Foto 2 — ${r.codigoReserva || r.codigo}`, isVideo: false })}
                                title={t('hc.abrir_foto_de_evidencia_2', 'Abrir foto de evidencia 2')}
                              >
                                <FaFileImage style={{ color: 'var(--brand-text)', fontSize: 13 }} />
                                <span>{r.evidenciaFoto2}</span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--city-muted, #94a3b8)', fontSize: 12.5 }}>—</span>
                            )}
                          </td>
                          <td>
                            {r.evidenciaFoto3 ? (
                              <div
                                className="doc-table-pdf-link"
                                onClick={() => r.evidenciaFoto3Url && setZoomMedia({ url: r.evidenciaFoto3Url, title: `Evidencia Foto 3 — ${r.codigoReserva || r.codigo}`, isVideo: false })}
                                title={t('hc.abrir_foto_de_evidencia_3', 'Abrir foto de evidencia 3')}
                              >
                                <FaFileImage style={{ color: 'var(--brand-text)', fontSize: 13 }} />
                                <span>{r.evidenciaFoto3}</span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--city-muted, #94a3b8)', fontSize: 12.5 }}>—</span>
                            )}
                          </td>
                          <td>
                            {r.evidenciaVideo ? (
                              <div
                                className="doc-table-pdf-link"
                                onClick={() => r.evidenciaVideoUrl && setZoomMedia({ url: r.evidenciaVideoUrl, title: `Evidencia Video — ${r.codigoReserva || r.codigo}`, isVideo: true })}
                                title={t('hc.reproducir_video_de_evidencia', 'Reproducir video de evidencia')}
                              >
                                <FaVideo style={{ color: 'var(--brand-text)', fontSize: 13 }} />
                                <span>{r.evidenciaVideo}</span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--city-muted, #94a3b8)', fontSize: 12.5, fontStyle: 'italic' }}>
                                Sin video
                              </span>
                            )}
                          </td>
  
                          <td style={{ color: 'var(--city-muted, #475569)' }}>{r.contactoTelefono || '—'}</td>
                          <td style={{ color: 'var(--city-muted, #64748b)' }}>{r.contactoEmail}</td>
                          
                          <td style={{ textAlign: 'center' }}>
                            {getStatusBadge(r.estado)}
                          </td>
                          
                          <td style={{ textAlign: 'center' }}>
                            <div className="incident-row-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              {esEncargado ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openDetalleModal(r)}
                                    style={{
                                      padding: '6px 14px',
                                      borderRadius: '9999px',
                                      background: 'var(--brand-primary)',
                                      color: '#ffffff',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontWeight: 800,
                                      fontSize: '12px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      boxShadow: '0 2px 5px rgba(var(--brand-primary-rgb), 0.25)',
                                      transition: 'all 0.2s',
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = 'var(--brand-primary-hover)' }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'var(--brand-primary)' }}
                                  >
                                    <FaShieldAlt size={12} /> Validar Reporte
                                  </button>
                                  <button
                                    type="button"
                                    className="incident-btn-reply"
                                    onClick={() => openResponderModal(r)}
                                  >
                                    <FaPaperPlane size={11} style={{ marginRight: 4 }} />
                                    {t('admin.incidents.replyBtn', 'Responder')}
                                  </button>
                                  {r.origen !== 'cliente' && r.estado === 'recibido' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setErrorModal('')
                                        setModalEliminar(r)
                                      }}
                                      style={{ padding: '6px 8px', fontSize: '12px', background: 'transparent', color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                      title={t('hc.eliminar_reporte_interno', 'Eliminar reporte interno')}
                                    >
                                      <FaTrash size={12} />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openDetalleModal(r)}
                                  style={{
                                    padding: '6px 14px',
                                    borderRadius: '9999px',
                                    background: 'var(--brand-soft-light, #eff6ff)',
                                    color: 'var(--brand-primary, #2563eb)',
                                    border: '1px solid var(--brand-border-light, #bfdbfe)',
                                    cursor: 'pointer',
                                    fontWeight: 800,
                                    fontSize: '12px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseOver={(e) => { e.currentTarget.style.background = 'var(--brand-soft-strong)' }}
                                  onMouseOut={(e) => { e.currentTarget.style.background = 'var(--brand-soft-light, #eff6ff)' }}
                                >
                                  <FaEye size={13} /> Ver Detalle y Evidencias
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
  )
}
