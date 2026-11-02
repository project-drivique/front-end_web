import { FaTimes, FaPrint, FaDownload } from 'react-icons/fa'

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

export default function ShowPreviewModal({ currentTypeConfig, handleGenerateReport, handlePrintCurrentReport, isGenerating, livePreviewData, previewError, selectedFormat, setShowPreviewModal, t }) {
  return (
    <div className="modal-overlay-backdrop" onClick={() => setShowPreviewModal(false)}>
              <div className="modal-dialog-box" style={{ maxWidth: 960 }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-dialog-header">
                  <div>
                    <h3 style={{ margin: 0 }}>{t(`admin.reports.types.${currentTypeConfig.id}_title`, livePreviewData.reportTitle)}</h3>
                    <small style={{ color: 'var(--adm-muted, #64748b)', fontWeight: 600 }}>
                      {t('admin.reports.previewModalSubtitle', {
                        count: livePreviewData.totalRegistros,
                        format: selectedFormat,
                        defaultValue: `${livePreviewData.totalRegistros} registros encontrados ⬢ Formato seleccionado: ${selectedFormat}`,
                      })}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn-history-action"
                    onClick={() => setShowPreviewModal(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
  
                <div className="modal-dialog-body">
                  {/* KPIS DE RESUMEN */}
                  {previewError && (
                    <div role="alert" style={{ margin: '12px 0', padding: '10px 14px', borderRadius: 10, background: '#fef2f2', color: '#b91c1c', fontWeight: 600 }}>
                      {previewError}
                    </div>
                  )}
                  {livePreviewData.kpis && livePreviewData.kpis.length > 0 && (
                    <div className="preview-summary-pills">
                      {livePreviewData.kpis.map((kpi, idx) => (
                        <div key={idx} className="preview-stat-box">
                          <span className="stat-label">{translateKpi(kpi.label, t)}</span>
                          <span className="stat-number">{kpi.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
  
                  {/* TABLA DE VISTA PREVIA */}
                  <div className="table-frame-responsive" style={{ maxHeight: 420 }}>
                    <table className="reports-data-table">
                      <thead>
                        <tr>
                          {livePreviewData.headers.map((h, i) => (
                            <th key={i}>{translateHeader(h, t)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {livePreviewData.rows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={livePreviewData.headers.length}
                              style={{ textAlign: 'center', padding: '40px', color: 'var(--adm-muted)' }}
                            >
                              {t('admin.reports.noDataMatch', 'No hay datos que coincidan con los filtros seleccionados.')}
                            </td>
                          </tr>
                        ) : (
                          livePreviewData.rows.slice(0, 25).map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx}>{cell}</td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
  
                  {livePreviewData.rows.length > 25 && (
                    <div style={{ fontSize: 12, color: 'var(--adm-muted)', textAlign: 'right' }}>
                      <em>
                        {t('admin.reports.previewLimitNote', {
                          count: 25,
                          total: livePreviewData.totalRegistros,
                          defaultValue: `Mostrando las primeras 25 filas de ${livePreviewData.totalRegistros} en esta vista previa. El archivo exportado contendrá la totalidad de los datos.`,
                        })}
                      </em>
                    </div>
                  )}
                </div>
  
                <div className="modal-dialog-footer">
                  <button
                    type="button"
                    className="btn-print-hero"
                    onClick={handlePrintCurrentReport}
                  >
                    <FaPrint /> {t('admin.reports.printCurrentBtn', 'Imprimir')}
                  </button>
  
                  <button
                    type="button"
                    className="btn-generate-hero"
                    onClick={() => {
                      setShowPreviewModal(false)
                      handleGenerateReport()
                    }}
                    disabled={isGenerating}
                  >
                    <FaDownload /> {t('admin.reports.generateBtn', 'Generar y Descargar')} ({selectedFormat})
                  </button>
                </div>
              </div>
            </div>
  )
}
