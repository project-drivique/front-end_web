import { FaTimes, FaPrint, FaDownload } from 'react-icons/fa'

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
function translateKpi(kpiLabel, t) {
  if (!kpiLabel) return ''
  const key = KPI_KEY_MAP[kpiLabel]
  return key ? t(`admin.reports.kpis.${key}`, kpiLabel) : kpiLabel
}
const KPI_KEY_MAP = {
  'Total Reservas': 'total_reservations',
  'Ingresos Estimados': 'estimated_revenue',
  'Tasa Ocupación Flota': 'fleet_occupancy_rate',
  'Tasa Ocupación': 'fleet_occupancy_rate',
  'Incidencias Activas': 'active_incidents',
  'Total Vehículos': 'total_vehicles',
  'Disponibles': 'available_vehicles',
  'Vehículos Disponibles': 'available_vehicles',
  'En Alquiler': 'rented_vehicles',
  'En Taller / Mant.': 'maintenance_vehicles',
  'En Taller': 'maintenance_units',
  'Ocupados / Taller': 'rented_or_workshop',
  'Total Incidencias': 'total_incidents',
  'Costo Acumulado': 'cumulative_cost',
  'Costo Estimado Daños': 'cumulative_cost',
  'Costo Estimado Total': 'cumulative_cost',
  'Total Contratos': 'total_contracts',
  'Monto Facturado': 'billed_amount',
  'Monto Consolidado': 'billed_amount',
  'Valor Acumulado': 'billed_amount',
  'Total Usuarios': 'total_users',
  'Usuarios Verificados': 'verified_users',
  'Promociones Activas': 'active_promotions',
  'Ingresos Totales': 'total_revenue',
  'Total Recaudado': 'total_revenue',
  'Ticket Promedio': 'average_ticket',
  'Promedio Reserva': 'average_ticket',
  'Mejor Sucursal': 'best_branch',
}
function translateHeader(headerStr, t) {
  if (!headerStr) return ''
  const key = HEADER_KEY_MAP[headerStr]
  return key ? t(`admin.reports.headers.${key}`, headerStr) : headerStr
}
const HEADER_KEY_MAP = {
  'Métrica / Indicador': 'metric_indicator',
  'Valor Actual': 'current_value',
  'Participación / Estado': 'share_status',
  'Observaciones': 'observations',
  'Sucursal / Concepto': 'branch_concept',
  'Reservas Facturadas': 'billed_reservations',
  'Ingresos Netos': 'net_revenue',
  'Ingresos Netos COP': 'net_revenue',
  'Ingresos Netos USD': 'net_revenue',
  'Ticket Promedio': 'average_ticket',
  'Participación %': 'share_percent',
  'Categoría / Tipo': 'category_type',
  'Total Unidades': 'total_units',
  'En Alquiler': 'rented_units',
  'Disponibles': 'available_units',
  'En Taller': 'maintenance_units',
  'Tasa Ocupación': 'occupancy_rate',
  'Gravedad / Categoría': 'severity_category',
  'Casos Reportados': 'reported_cases',
  'Resueltos': 'resolved_cases',
  'En Revisión': 'under_review_cases',
  'Costo Estimado COP': 'estimated_cost_cop',
  'Costo Estimado USD': 'estimated_cost',
  'Código': 'code',
  'Código Reserva': 'reservation',
  'Cód. Reserva': 'reservation',
  'Cliente': 'client',
  'Vehículo': 'vehicle',
  'Nombre Vehículo': 'vehicle',
  'Sucursal': 'branch',
  'Fecha Inicio': 'start_date',
  'Fecha Fin': 'end_date',
  'Estado': 'status',
  'Total': 'total',
  'Total COP': 'total',
  'Total USD': 'total',
  'Placa': 'plate',
  'Marca / Modelo': 'brand_model',
  'Categoría': 'category',
  'Transmisión': 'transmission',
  'Combustible': 'fuel',
  'Tarifa / Día': 'daily_rate',
  'Tarifa/Día': 'daily_rate',
  'No. Contrato': 'contract_number',
  'Código Contrato': 'contract_number',
  'Reserva': 'reservation',
  'Documento': 'document',
  'Vigencia': 'validity',
  'Monto': 'amount',
  'Monto Total': 'amount',
  'Fecha': 'date',
  'Tipo / Título': 'type_title',
  'Gravedad': 'severity',
  'Costo Estimado': 'estimated_cost',
  'Nombre Completo': 'full_name',
  'Correo Electrónico': 'email',
  'Teléfono': 'phone',
  'Rol': 'role',
  'Registro': 'registration',
  'Código Cupón': 'coupon_code',
  'Título': 'title',
  'Descuento': 'discount',
  'Válido Desde': 'valid_from',
  'Válido Hasta': 'valid_until',
  'Usos Máx.': 'max_uses',
}

export default function ModalReport({ handleDownloadFromHistory, handlePrintFromHistory, i18n, modalReport, setModalReport, t }) {
  return (
    <div className="modal-overlay-backdrop" onClick={() => setModalReport(null)}>
              <div className="modal-dialog-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-dialog-header">
                  <div>
                    <h3 style={{ margin: 0 }}>
                      {t(`admin.reports.types.${modalReport.tipoId}_title`, modalReport.titulo)}
                    </h3>
                    <small style={{ color: 'var(--adm-muted, #64748b)', fontWeight: 600 }}>
                      {modalReport.codigo} ⬢ {modalReport.formato}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn-history-action"
                    onClick={() => setModalReport(null)}
                  >
                    <FaTimes />
                  </button>
                </div>
  
                <div className="modal-dialog-body">
                  {/* Metadatos */}
                  <div className="modal-metadata-grid">
                    <div>
                      <span className="meta-label">
                        {t('admin.reports.generationDate', 'Fecha Generación')}
                      </span>
                      <strong className="meta-value">
                        {new Date(modalReport.fechaGeneracion).toLocaleString(i18n.language || undefined)}
                      </strong>
                    </div>
                    <div>
                      <span className="meta-label">
                        {t('admin.reports.generatedBy', 'Generado Por')}
                      </span>
                      <strong className="meta-value">
                        {modalReport.generadoPorRol === 'admin' || modalReport.generadoPorNombre === 'Administrador'
                          ? t('admin.reports.roleAdminSingle', 'Administrador')
                          : modalReport.generadoPorRol === 'encargado_sucursal' ||
                            modalReport.generadoPorRol === 'encargado' ||
                            modalReport.generadoPorNombre === 'Encargado de Sucursal'
                          ? t('admin.reports.roleManagerSingle', 'Encargado de Sucursal')
                          : modalReport.generadoPorNombre}
                      </strong>
                    </div>
                    <div>
                      <span className="meta-label">
                        {t('admin.reports.totalRecords', 'Total Registros')}
                      </span>
                      <strong className="meta-value">
                        {modalReport.totalRegistros} {t('admin.reports.records', 'registros')} ({modalReport.tamanoEstimado})
                      </strong>
                    </div>
                    <div>
                      <span className="meta-label">
                        {t('admin.reports.savedFormat', 'Formato Guardado')}
                      </span>
                      <strong className="meta-value">{modalReport.formato}</strong>
                    </div>
                  </div>
  
                  {/* Filtros aplicados */}
                  {modalReport.filtersSummary && modalReport.filtersSummary.length > 0 && (
                    <div>
                      <h4 style={{ margin: '0 0 10px', fontSize: 13, textTransform: 'uppercase', color: 'var(--adm-muted)', fontWeight: 800 }}>
                        {t('admin.reports.appliedFilters', 'Filtros Aplicados')}
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {modalReport.filtersSummary.map((f, i) => (
                          <span key={i} style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', padding: '5px 12px', borderRadius: 8, fontSize: 12 }}>
                            <strong>{translateFilterLabel(f.label, t)}:</strong> {translateFilterValue(f.value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
  
                  {/* Snapshot KPIs */}
                  {modalReport.snapshot?.kpis && modalReport.snapshot.kpis.length > 0 && (
                    <div className="preview-summary-pills">
                      {modalReport.snapshot.kpis.map((kpi, i) => (
                        <div key={i} className="preview-stat-box">
                          <span className="stat-label">{translateKpi(kpi.label, t)}</span>
                          <span className="stat-number">{kpi.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
  
                  {/* Tabla de Datos Snapshot */}
                  {modalReport.snapshot?.rows && modalReport.snapshot.rows.length > 0 && (
                    <div className="table-frame-responsive">
                      <table className="reports-data-table">
                        <thead>
                          <tr>
                            {modalReport.snapshot.headers.map((h, i) => (
                              <th key={i}>{translateHeader(h, t)}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {modalReport.snapshot.rows.slice(0, 15).map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
  
                <div className="modal-dialog-footer">
                  <button
                    type="button"
                    className="btn-print-hero"
                    onClick={() => handlePrintFromHistory(modalReport)}
                  >
                    <FaPrint /> {t('admin.reports.printReport', 'Imprimir')}
                  </button>
  
                  <button
                    type="button"
                    className="btn-generate-hero"
                    onClick={() => handleDownloadFromHistory(modalReport.id)}
                  >
                    <FaDownload /> {t('admin.reports.downloadAgain', 'Descargar')} ({modalReport.formato})
                  </button>
                </div>
              </div>
            </div>
  )
}
