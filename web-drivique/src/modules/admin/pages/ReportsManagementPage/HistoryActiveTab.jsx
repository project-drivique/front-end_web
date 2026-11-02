import { FaHistory, FaFilePdf, FaFileExcel, FaFileWord, FaSearch, FaTrash, FaDownload, FaPrint, FaEye } from 'react-icons/fa'
import { REPORT_CATEGORIES, REPORT_FORMATS } from '../../../../services/reportManagementService'

function translateFilterLabel(label, t) {
  if (!label) return ''
  const key = FILTER_LABEL_MAP[label]
  return key ? t(`admin.reports.filterLabels.${key}`, label) : label
}
const FILTER_LABEL_MAP = {
  'Período': 'period',
  'Sucursal': 'branch',
  'Estado': 'status',
  'Gravedad': 'severity',
  'Rol': 'role',
  'Búsqueda': 'search',
  'Moneda': 'currency',
}
function translateFilterValue(val) {
  if (typeof val !== 'string') return val
  return val.replace(/\s+al\s+/g, ' → ')
}

export default function HistoryActiveTab({ filteredHistory, handleClearAllHistory, handleDeleteFromHistory, handleDownloadFromHistory, handlePrintFromHistory, history, historyCategory, historyDateFilter, historyFormat, historySearch, historyStats, i18n, openHistoryReport, setHistoryCategory, setHistoryDateFilter, setHistoryFormat, setHistorySearch, t }) {
  return (
    <div>
              {/* STATS DEL HISTORIAL */}
              <div className="history-kpis-bar">
                <div className="history-kpi-card">
                  <div className="history-kpi-icon total">
                    <FaHistory />
                  </div>
                  <div className="history-kpi-details">
                    <span>{t('admin.reports.statTotal', 'Total Generados')}</span>
                    <strong>{historyStats.total}</strong>
                  </div>
                </div>
  
                <div className="history-kpi-card">
                  <div className="history-kpi-icon pdf">
                    <FaFilePdf />
                  </div>
                  <div className="history-kpi-details">
                    <span>{t('admin.reports.statPdf', 'Reportes PDF')}</span>
                    <strong>{historyStats.pdfCount}</strong>
                  </div>
                </div>
  
                <div className="history-kpi-card">
                  <div className="history-kpi-icon excel">
                    <FaFileExcel />
                  </div>
                  <div className="history-kpi-details">
                    <span>{t('admin.reports.statExcel', 'Reportes Excel')}</span>
                    <strong>{historyStats.excelCount}</strong>
                  </div>
                </div>
  
                <div className="history-kpi-card">
                  <div className="history-kpi-icon word">
                    <FaFileWord />
                  </div>
                  <div className="history-kpi-details">
                    <span>{t('admin.reports.statWord', 'Reportes Word')}</span>
                    <strong>{historyStats.wordCount}</strong>
                  </div>
                </div>
              </div>
  
              {/* BARRA DE BÚSQUEDA Y FILTROS */}
              <div className="history-control-toolbar">
                <div className="history-search-box">
                  <FaSearch />
                  <input
                    type="text"
                    className="history-search-input-field"
                    placeholder={t('admin.reports.searchHistoryPlaceholder', 'Buscar en el historial por código, título, usuario o filtro...')}
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                  />
                </div>
  
                <div className="history-select-group">
                  <select
                    value={historyCategory}
                    onChange={(e) => setHistoryCategory(e.target.value)}
                  >
                    <option value="all">{t('admin.reports.allCategories', 'Todas las categorías')}</option>
                    <option value={REPORT_CATEGORIES.GENERAL}>{t('admin.reports.catGeneral', 'Generales')}</option>
                    <option value={REPORT_CATEGORIES.SPECIFIC}>{t('admin.reports.catSpecific', 'Específicos')}</option>
                  </select>
  
                  <select
                    value={historyFormat}
                    onChange={(e) => setHistoryFormat(e.target.value)}
                  >
                    <option value="all">{t('admin.reports.allFormats', 'Todos los formatos')}</option>
                    <option value={REPORT_FORMATS.WORD}>Word (.doc)</option>
                    <option value={REPORT_FORMATS.PDF}>PDF (.pdf)</option>
                    <option value={REPORT_FORMATS.EXCEL}>Excel (.xls)</option>
                  </select>
  
                  <select
                    value={historyDateFilter}
                    onChange={(e) => setHistoryDateFilter(e.target.value)}
                  >
                    <option value="all">{t('admin.reports.allDates', 'Cualquier fecha')}</option>
                    <option value="today">{t('admin.reports.today', 'Hoy')}</option>
                    <option value="week">{t('admin.reports.lastWeek', 'Últimos 7 días')}</option>
                    <option value="month">{t('admin.reports.thisMonth', 'Este mes')}</option>
                  </select>
  
                  {history.length > 0 && (
                    <button
                      type="button"
                      className="btn-print-hero"
                      style={{ height: 44, color: '#e11d48', borderColor: '#fecdd3' }}
                      onClick={handleClearAllHistory}
                    >
                      <FaTrash /> {t('admin.reports.clearHistoryBtn', 'Vaciar')}
                    </button>
                  )}
                </div>
              </div>
  
              {/* TABLA DEL HISTORIAL (ESCRITORIO & TABLET) */}
              <div className="history-desktop-table-container">
                <div className="builder-section-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="table-frame-responsive" style={{ maxHeight: 600, border: 'none' }}>
                    <table className="reports-data-table">
                      <thead>
                        <tr>
                          <th>{t('admin.reports.thCode', 'Código / ID')}</th>
                          <th>{t('admin.reports.thTitle', 'Título del Reporte')}</th>
                          <th>{t('admin.reports.thCategory', 'Categoría')}</th>
                          <th>{t('admin.reports.thFormat', 'Formato')}</th>
                          <th>{t('admin.reports.thGeneratedBy', 'Generado Por')}</th>
                          <th>{t('admin.reports.thDate', 'Fecha y Hora')}</th>
                          <th>{t('admin.reports.thRecords', 'Total Registros')}</th>
                          <th>{t('admin.reports.thFileSize', 'Tamaño Estimado')}</th>
                          <th style={{ textAlign: 'center' }}>{t('admin.reports.thActions', 'Acciones')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistory.length === 0 ? (
                          <tr>
                            <td colSpan={9}>
                              <div className="reports-empty-state">
                                <FaHistory />
                                <h3>{t('admin.reports.emptyHistoryTitle', 'No se encontraron reportes')}</h3>
                                <p>{t('admin.reports.emptyHistorySubtitle', 'Aún no has generado reportes que coincidan con los filtros de búsqueda.')}</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredHistory.map((report) => (
                            <tr key={report.id}>
                              <td>
                                <strong style={{ color: 'var(--adm-text, #0f172a)', fontWeight: 700 }}>
                                  {report.codigo}
                                </strong>
                              </td>
                              <td>
                                <span style={{ fontSize: 13.5, color: 'var(--adm-text, #0f172a)' }}>
                                  {t(`admin.reports.types.${report.tipoId}_title`, report.titulo)}
                                </span>
                                {report.filtersSummary && report.filtersSummary.length > 0 && (
                                  <div style={{ fontSize: 11, color: 'var(--adm-muted)', marginTop: 3 }}>
                                    {report.filtersSummary
                                      .map((f) => `${translateFilterLabel(f.label, t)}: ${translateFilterValue(f.value)}`)
                                      .join(' ⬢ ')}
                                  </div>
                                )}
                              </td>
                              <td>
                                <span className={`category-pill-tag ${report.tipoCategoria}`}>
                                  {report.tipoCategoria === REPORT_CATEGORIES.GENERAL
                                    ? t('admin.reports.catGeneralTag', 'General')
                                    : t('admin.reports.catSpecificTag', 'Específico')}
                                </span>
                              </td>
                              <td>
                                <span className={`format-pill-tag ${report.formato}`}>
                                  {report.formato === REPORT_FORMATS.WORD && <FaFileWord />}
                                  {report.formato === REPORT_FORMATS.PDF && <FaFilePdf />}
                                  {report.formato === REPORT_FORMATS.EXCEL && <FaFileExcel />}
                                  {report.formato}
                                </span>
                              </td>
                              <td>
                                <div style={{ fontSize: 13, color: 'var(--adm-text, #0f172a)' }}>
                                  {report.generadoPorRol === 'admin' || report.generadoPorNombre === 'Administrador'
                                    ? t('admin.reports.roleAdminSingle', 'Administrador')
                                    : report.generadoPorRol === 'encargado_sucursal' ||
                                      report.generadoPorRol === 'encargado' ||
                                      report.generadoPorNombre === 'Encargado de Sucursal'
                                    ? t('admin.reports.roleManagerSingle', 'Encargado de Sucursal')
                                    : report.generadoPorNombre}
                                </div>
                                <small style={{ color: 'var(--adm-muted)' }}>{report.generadoPorCorreo}</small>
                              </td>
                              <td>
                                <div>{new Date(report.fechaGeneracion).toLocaleDateString(i18n.language || undefined)}</div>
                                <small style={{ color: 'var(--adm-muted)' }}>
                                  {new Date(report.fechaGeneracion).toLocaleTimeString(i18n.language || undefined, {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </small>
                              </td>
                              <td>
                                <span style={{ fontWeight: 600, color: 'var(--adm-text, #0f172a)' }}>
                                  {report.totalRegistros} {t('admin.reports.records', 'reg.')}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: 12, color: 'var(--adm-muted)' }}>
                                  {report.tamanoEstimado}
                                </span>
                              </td>
                              <td>
                                <div className="history-table-row-actions">
                                  <button
                                    type="button"
                                    className="btn-history-action download"
                                    title={t('admin.reports.downloadAgain', 'Descargar de nuevo sin regenerar')}
                                    onClick={() => handleDownloadFromHistory(report.id)}
                                  >
                                    <FaDownload />
                                  </button>
  
                                  <button
                                    type="button"
                                    className="btn-history-action print"
                                    title={t('admin.reports.printReport', 'Imprimir reporte')}
                                    onClick={() => handlePrintFromHistory(report)}
                                  >
                                    <FaPrint />
                                  </button>
  
                                  <button
                                    type="button"
                                    className="btn-history-action details"
                                    title={t('admin.reports.viewDetails', 'Ver detalle y snapshot')}
                                    onClick={() => openHistoryReport(report)}
                                  >
                                    <FaEye />
                                  </button>
  
                                  <button
                                    type="button"
                                    className="btn-history-action delete"
                                    title={t('admin.reports.deleteReport', 'Eliminar del historial')}
                                    onClick={() => handleDeleteFromHistory(report)}
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
  
              {/* VISTA MÓVIL EN TARJETAS (SOLO PANTALLAS PEQUEÑAS) */}
              <div className="history-mobile-cards-container">
                {filteredHistory.length === 0 ? (
                  <div className="reports-empty-state">
                    <FaHistory />
                    <h3>{t('admin.reports.emptyHistoryTitle', 'No se encontraron reportes')}</h3>
                    <p>{t('admin.reports.emptyHistorySubtitle', 'Aún no has generado reportes que coincidan con los filtros de búsqueda.')}</p>
                  </div>
                ) : (
                  filteredHistory.map((report) => (
                    <div key={report.id} className="history-mobile-card">
                      <div className="hm-card-header">
                        <span className="hm-code-badge">{report.codigo}</span>
                        <span className={`format-pill-tag ${report.formato}`}>
                          {report.formato === REPORT_FORMATS.WORD && <FaFileWord />}
                          {report.formato === REPORT_FORMATS.PDF && <FaFilePdf />}
                          {report.formato === REPORT_FORMATS.EXCEL && <FaFileExcel />}
                          {report.formato}
                        </span>
                      </div>
  
                      <div className="hm-card-title-row">
                        <h4>{t(`admin.reports.types.${report.tipoId}_title`, report.titulo)}</h4>
                        <span className={`category-pill-tag ${report.tipoCategoria}`}>
                          {report.tipoCategoria === REPORT_CATEGORIES.GENERAL
                            ? t('admin.reports.catGeneralTag', 'General')
                            : t('admin.reports.catSpecificTag', 'Específico')}
                        </span>
                      </div>
  
                      {report.filtersSummary && report.filtersSummary.length > 0 && (
                        <div className="hm-card-filters">
                          {report.filtersSummary.map((f, i) => (
                            <span key={i} className="hm-filter-pill">
                              <strong>{translateFilterLabel(f.label, t)}:</strong> {translateFilterValue(f.value)}
                            </span>
                          ))}
                        </div>
                      )}
  
                      <div className="hm-card-meta-grid">
                        <div className="hm-meta-item">
                          <small>{t('admin.reports.thGeneratedBy', 'Generado por')}</small>
                          <span>
                            {report.generadoPorRol === 'admin' || report.generadoPorNombre === 'Administrador'
                              ? t('admin.reports.roleAdminSingle', 'Administrador')
                              : report.generadoPorRol === 'encargado_sucursal' ||
                                report.generadoPorRol === 'encargado' ||
                                report.generadoPorNombre === 'Encargado de Sucursal'
                              ? t('admin.reports.roleManagerSingle', 'Encargado de Sucursal')
                              : report.generadoPorNombre}
                          </span>
                        </div>
                        <div className="hm-meta-item">
                          <small>{t('admin.reports.thDate', 'Fecha y Hora')}</small>
                          <span>
                            {new Date(report.fechaGeneracion).toLocaleDateString(i18n.language || undefined)}{' '}
                            {new Date(report.fechaGeneracion).toLocaleTimeString(i18n.language || undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="hm-meta-item">
                          <small>{t('admin.reports.thRows', 'Registros / Tamaño')}</small>
                          <span>
                            <strong>{report.totalRegistros} {t('admin.reports.records', 'reg.')}</strong> ({report.tamanoEstimado})
                          </span>
                        </div>
                      </div>
  
                      <div className="hm-card-actions">
                        <button
                          type="button"
                          className="hm-btn-action download"
                          onClick={() => handleDownloadFromHistory(report.id)}
                        >
                          <FaDownload /> <span>{t('admin.reports.downloadAgain', 'Descargar')}</span>
                        </button>
                        <button
                          type="button"
                          className="hm-btn-action print"
                          title={t('admin.reports.printReport', 'Imprimir reporte')}
                          onClick={() => handlePrintFromHistory(report)}
                        >
                          <FaPrint />
                        </button>
                        <button
                          type="button"
                          className="hm-btn-action details"
                          title={t('admin.reports.viewDetails', 'Ver detalle')}
                          onClick={() => openHistoryReport(report)}
                        >
                          <FaEye />
                        </button>
                        <button
                          type="button"
                          className="hm-btn-action delete"
                          title={t('admin.reports.deleteReport', 'Eliminar')}
                          onClick={() => handleDeleteFromHistory(report)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
  )
}
