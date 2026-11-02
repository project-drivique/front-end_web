import { FaSearch, FaBuilding, FaFileExcel, FaFilePdf, FaPrint, FaIdCard } from 'react-icons/fa'
import { exportExcel, exportPdf, printTable } from '../../../../utils/listExportUtils'

export default function CitiesCard({ exportData, filtered, getReservaStatusBadge, getSafeDocUrl, getStatusBadge, getUploadDateTime, handleOpenReview, reservationMap, search, setSearch, setZoomPdf, sucursalAsignada, t }) {
  return (
    <section className="cities-card attached-to-tabs">
              {/* Toolbar con Buscador, Filtros y Botones de Exportación */}
              <div className="cities-toolbar doc-toolbar-wrapper">
                {/* Buscador general en vivo */}
                <label className="cities-search" style={{ flex: '1 1 250px', margin: 0 }}>
                  <FaSearch />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('admin.documents.searchPlaceholder', 'Buscar por código, cliente, cédula, licencia...')}
                  />
                </label>
  
                {/* Indicador de Sucursal Asignada */}
                <div className="doc-branch-badge">
                  <FaBuilding style={{ color: 'var(--city-muted, #64748b)' }} />
                  <span>{sucursalAsignada}</span>
                </div>
  
                {/* Botones de Exportación con píldoras */}
                <div className="export-pills-group" style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="export-pill export-pill--excel"
                    onClick={() => exportExcel(exportData)}
                    title={t('admin.exportExcel', 'Excel')}
                  >
                    <FaFileExcel aria-hidden="true" /> {t('admin.exportExcel', 'Excel')}
                  </button>
                  <button
                    type="button"
                    className="export-pill export-pill--pdf"
                    onClick={() => exportPdf(exportData)}
                    title={t('admin.exportPdf', 'PDF')}
                  >
                    <FaFilePdf aria-hidden="true" /> {t('admin.exportPdf', 'PDF')}
                  </button>
                  <button
                    type="button"
                    className="export-pill export-pill--print"
                    onClick={() => printTable(exportData)}
                    title={t('admin.incidents.print', 'Imprimir')}
                  >
                    <FaPrint aria-hidden="true" /> {t('admin.incidents.print', 'Imprimir')}
                  </button>
                </div>
              </div>
  
              {/* Contador de Resultados */}
              <div className="cities-summary" style={{ margin: '8px 0 12px' }}>
                <span>{filtered.length}</span>{' '}
                {t('admin.documents.foundCount', 'EXPEDIENTES EN EL LISTADO').toUpperCase()}
              </div>
  
              {/* Contenido: Tabla para Desktop + Cards para Móvil */}
              {filtered.length === 0 ? (
                <div className="cities-empty">
                  <FaIdCard style={{ fontSize: 44, color: '#94a3b8', marginBottom: 12 }} />
                  <h2>{t('admin.documents.emptyTitle', 'No se encontraron expedientes de documentación')}</h2>
                  <p>{t('admin.documents.emptyDesc', 'No hay registros que coincidan con la pestaña o los términos de búsqueda seleccionados.')}</p>
                </div>
              ) : (
                <>
                  {/* 1. Vista de Tabla Completa para Escritorio & Tablets */}
                  <div className="cities-table-wrap doc-desktop-table" style={{ overflowX: 'auto' }}>
                    <table className="incidents-table-v2" style={{ whiteSpace: 'nowrap', width: 'max-content', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}>{t('admin.documents.table.id', 'ID')}</th>
                          <th>{t('admin.documents.table.reservationCode', 'CÓDIGO RESERVA')}</th>
                          <th>{t('admin.documents.table.clientName', 'NOMBRE CLIENTE')}</th>
                          <th>{t('admin.documents.table.documentNumber', 'NÚMERO DE DOCUMENTO')}</th>
                          <th>{t('admin.documents.table.identityDoc', 'DOCUMENTO DE IDENTIDAD')}</th>
                          <th>{t('admin.documents.table.licenseNumber', 'NÚMERO DE CONDUCCIÓN')}</th>
                          <th>{t('admin.documents.table.driverLicense', 'LICENCIA DE CONDUCCIÓN')}</th>
                          <th>{t('admin.documents.table.vehicleName', 'NOMBRE VEHÍCULO')}</th>
                          <th style={{ textAlign: 'center' }}>{t('admin.documents.table.reservationStatus', 'ESTADO DE RESERVA')}</th>
                          <th>{t('admin.documents.table.uploadDate', 'FECHA SUBIDA')}</th>
                          <th>{t('admin.documents.table.uploadTime', 'HORA SUBIDA')}</th>
                          <th style={{ textAlign: 'center' }}>{t('admin.documents.table.status', 'ESTADO')}</th>
                          <th style={{ textAlign: 'center' }}>{t('admin.documents.table.actions', 'ACCIONES')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((item, index) => {
                          const docIdFile = item.documentoIdentidadPdf || `Cedula-${item.documentoIdentidad}.pdf`
                          const licFile = item.licenciaConduccionPdf || `Licencia-${item.documentoIdentidad}.pdf`
                          const docIdUrl = getSafeDocUrl(item.fotoCedulaFrente || item.pdfCedulaUrl || item.frontUrl)
                          const licUrl = getSafeDocUrl(item.fotoLicenciaFrente || item.pdfLicenciaUrl || item.frontUrl)
                          const { fecha, hora } = getUploadDateTime(item.fechaSubida)
                          const resState = reservationMap[item.reservaCodigo] || item.reservaEstado || 'confirmada'
  
                          return (
                            <tr key={item.id}>
                              <td style={{ fontWeight: 600, color: 'var(--city-text, #0f172a)', width: '40px' }}>{index + 1}</td>
                              <td style={{ fontWeight: 700, color: 'var(--city-text, #0f172a)' }}>{item.reservaCodigo}</td>
                              <td style={{ color: 'var(--city-text, #0f172a)', fontWeight: 600 }}>{item.clienteNombre}</td>
                              <td style={{ color: 'var(--city-text, #334155)' }}>{item.documentoIdentidad}</td>
                              
                              {/* Columna Documento de Identidad (Link PDF con ícono rojo) */}
                              <td>
                                <div
                                  className="doc-table-pdf-link"
                                  onClick={() => setZoomPdf({
                                    url: docIdUrl,
                                    title: `${t('admin.documents.table.identityDoc', 'Documento de Identidad')} - ${item.clienteNombre}`
                                  })}
                                  title={t('admin.documents.table.openDocTooltip', 'Clic para abrir documento')}
                                >
                                  <FaFilePdf />
                                  <span>{docIdFile}</span>
                                </div>
                              </td>
  
                              {/* Columna Número de Conducción (Texto limpio, sin fondo gris) */}
                              <td style={{ color: 'var(--city-text, #334155)', fontWeight: 600 }}>
                                {item.numeroLicencia}
                              </td>
  
                              {/* Columna Licencia de Conducción (Link PDF con ícono rojo) */}
                              <td>
                                <div
                                  className="doc-table-pdf-link"
                                  onClick={() => setZoomPdf({
                                    url: licUrl,
                                    title: `${t('admin.documents.table.driverLicense', 'Licencia de Conducción')} - ${item.clienteNombre}`
                                  })}
                                  title={t('admin.documents.table.openDocTooltip', 'Clic para abrir documento')}
                                >
                                  <FaFilePdf />
                                  <span>{licFile}</span>
                                </div>
                              </td>
  
                              {/* Columna Nombre Vehículo */}
                              <td style={{ color: 'var(--city-text, #0f172a)', fontWeight: 600 }}>
                                {item.vehiculoNombre || item.vehiculo || t('hc2.vehiculo_reservado', 'Vehículo Reservado')}
                              </td>
  
                              {/* Columna Estado de Reserva (Actualizado en tiempo real) */}
                              <td style={{ textAlign: 'center' }}>
                                {getReservaStatusBadge(resState)}
                              </td>
  
                              {/* Columna Fecha Subida */}
                              <td style={{ color: 'var(--city-muted, #64748b)' }}>{fecha}</td>
  
                              {/* Columna Hora Subida */}
                              <td style={{ color: 'var(--city-muted, #64748b)' }}>{hora}</td>
  
                              {/* Columna Estado de Validación */}
                              <td style={{ textAlign: 'center' }}>
                                {getStatusBadge(item.estado)}
                              </td>
  
                              {/* Columna Acciones */}
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  disabled={item.estado === 'aprobado'}
                                  onClick={() => {
                                    if (item.estado !== 'aprobado') {
                                      handleOpenReview(item)
                                    }
                                  }}
                                  style={{
                                    padding: '7px 22px',
                                    borderRadius: '9999px',
                                    background: item.estado === 'aprobado' ? '#94a3b8' : 'var(--brand-primary)',
                                    color: 'var(--city-card, #ffffff)',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontSize: '12.5px',
                                    cursor: item.estado === 'aprobado' ? 'not-allowed' : 'pointer',
                                    opacity: item.estado === 'aprobado' ? 0.6 : 1,
                                    boxShadow: item.estado === 'aprobado' ? 'none' : '0 2px 5px rgba(var(--brand-primary-rgb), 0.25)',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap',
                                  }}
                                  onMouseOver={(e) => {
                                    if (item.estado !== 'aprobado') {
                                      e.currentTarget.style.background = 'var(--brand-primary, #1d4ed8)'
                                    }
                                  }}
                                  onMouseOut={(e) => {
                                    if (item.estado !== 'aprobado') {
                                      e.currentTarget.style.background = 'var(--brand-primary)'
                                    }
                                  }}
                                  title={item.estado === 'aprobado' ? t('admin.documents.alreadyApproved', 'Documentos ya aprobados') : t('admin.documents.table.validateBtn', 'Validar')}
                                >
                                  {t('admin.documents.table.validateBtn', 'Validar')}
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
  
                  {/* 2. Vista de Tarjetas Adaptativas para Pantallas Móviles */}
                  <div className="doc-mobile-cards">
                    {filtered.map((item, index) => {
                      const docIdFile = item.documentoIdentidadPdf || `Cedula-${item.documentoIdentidad}.pdf`
                      const licFile = item.licenciaConduccionPdf || `Licencia-${item.documentoIdentidad}.pdf`
                      const docIdUrl = getSafeDocUrl(item.fotoCedulaFrente || item.pdfCedulaUrl || item.frontUrl)
                      const licUrl = getSafeDocUrl(item.fotoLicenciaFrente || item.pdfLicenciaUrl || item.frontUrl)
                      const { fecha, hora } = getUploadDateTime(item.fechaSubida)
                      const resState = reservationMap[item.reservaCodigo] || item.reservaEstado || 'confirmada'
  
                      return (
                        <div key={item.id} className="doc-mobile-card">
                          <div className="doc-mobile-card-header">
                            <div className="doc-mobile-card-title">
                              <span style={{ fontWeight: 800, color: 'var(--brand-primary, #2563eb)', fontSize: 13 }}>#{index + 1}</span>
                              <span style={{ fontWeight: 800, color: 'var(--city-text, #0f172a)', fontSize: 14 }}>{item.reservaCodigo}</span>
                            </div>
                            {getStatusBadge(item.estado)}
                          </div>
  
                          <div className="doc-mobile-card-body">
                            <div className="doc-mobile-data-item doc-mobile-data-item--full">
                              <span className="doc-mobile-data-label">{t('admin.documents.table.clientName', 'Nombre Cliente')}</span>
                              <span className="doc-mobile-data-value" style={{ fontSize: 14 }}>{item.clienteNombre}</span>
                            </div>
  
                            <div className="doc-mobile-data-item">
                              <span className="doc-mobile-data-label">{t('admin.documents.table.documentNumber', 'Nº Documento')}</span>
                              <span className="doc-mobile-data-value">{item.documentoIdentidad}</span>
                            </div>
  
                            <div className="doc-mobile-data-item">
                              <span className="doc-mobile-data-label">{t('admin.documents.table.licenseNumber', 'Número de Conducción')}</span>
                              <span className="doc-mobile-data-value" style={{ fontWeight: 600 }}>
                                {item.numeroLicencia}
                              </span>
                            </div>
  
                            <div className="doc-mobile-data-item doc-mobile-data-item--full">
                              <span className="doc-mobile-data-label">{t('admin.documents.table.vehicleName', 'Nombre Vehículo')}</span>
                              <span className="doc-mobile-data-value">{item.vehiculoNombre || item.vehiculo || t('hc2.vehiculo_reservado', 'Vehículo Reservado')}</span>
                            </div>
  
                            <div className="doc-mobile-data-item">
                              <span className="doc-mobile-data-label">{t('admin.documents.table.reservationStatus', 'Estado de Reserva')}</span>
                              <div style={{ marginTop: 2 }}>{getReservaStatusBadge(resState)}</div>
                            </div>
  
                            <div className="doc-mobile-data-item">
                              <span className="doc-mobile-data-label">{t('admin.documents.table.uploadDate', 'Fecha / Hora Subida')}</span>
                              <span className="doc-mobile-data-value" style={{ color: 'var(--city-muted, #64748b)', fontSize: 12 }}>
                                {fecha} ⬢ {hora}
                              </span>
                            </div>
                          </div>
  
                          {/* Documentos subidos links móviles */}
                          <div className="doc-mobile-card-docs">
                            <div
                              className="doc-table-pdf-link"
                              onClick={() => setZoomPdf({
                                url: docIdUrl,
                                title: `${t('admin.documents.table.identityDoc', 'Documento de Identidad')} - ${item.clienteNombre}`
                              })}
                            >
                              <FaFilePdf />
                              <span>{t('admin.documents.modal.idDocCard', 'Cédula')}: {docIdFile}</span>
                            </div>
  
                            <div
                              className="doc-table-pdf-link"
                              onClick={() => setZoomPdf({
                                url: licUrl,
                                title: `${t('admin.documents.table.driverLicense', 'Licencia de Conducción')} - ${item.clienteNombre}`
                              })}
                            >
                              <FaFilePdf />
                              <span>{t('admin.documents.modal.licenseCard', 'Licencia')}: {licFile}</span>
                            </div>
                          </div>
  
                          <div className="doc-mobile-card-actions">
                            <button
                              type="button"
                              disabled={item.estado === 'aprobado'}
                              onClick={() => {
                                if (item.estado !== 'aprobado') {
                                  handleOpenReview(item)
                                }
                              }}
                              style={{
                                width: '100%',
                                padding: '9px 18px',
                                borderRadius: '12px',
                                background: item.estado === 'aprobado' ? '#94a3b8' : 'var(--brand-primary)',
                                color: 'var(--city-card, #ffffff)',
                                border: 'none',
                                fontWeight: 800,
                                fontSize: '13px',
                                cursor: item.estado === 'aprobado' ? 'not-allowed' : 'pointer',
                                opacity: item.estado === 'aprobado' ? 0.6 : 1,
                                boxShadow: item.estado === 'aprobado' ? 'none' : '0 2px 5px rgba(var(--brand-primary-rgb), 0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                              }}
                              title={item.estado === 'aprobado' ? t('admin.documents.alreadyApproved', 'Documentos ya aprobados') : t('admin.documents.table.validateBtn', 'Validar')}
                            >
                              {t('admin.documents.table.validateBtn', 'Validar')}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </section>
  )
}
