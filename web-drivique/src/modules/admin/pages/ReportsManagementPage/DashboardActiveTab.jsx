import { FaMoneyBillWave, FaArrowUp, FaClipboardList, FaCar, FaStar, FaCreditCard, FaBuilding, FaFileExcel, FaFilePdf, FaPrint } from 'react-icons/fa'
import { formatCurrency } from '../../../../utils/currencyUtils'

export default function DashboardActiveTab({ dashboard, handleDownloadDirect, handlePrintReport, t }) {
  return (
    <div className="reports-dashboard-view">
              {/* 4 TARJETAS KPI EJECUTIVAS (datos del servidor) */}
              <div className="cash-kpi-bar">
                <div className="cash-kpi-item-light">
                  <div className="cash-kpi-header-light" style={{ color: '#10b981' }}>
                    <FaMoneyBillWave />
                    <span>{t('admin.reports.kpi.totalRevenue', 'INGRESOS TOTALES NETOS')}</span>
                  </div>
                  <strong className="cash-kpi-val-light">{formatCurrency(dashboard.ingresos, 'COP')} COP</strong>
                  <div className="cash-kpi-progress-bg">
                    <div className="cash-kpi-progress-fill" style={{ width: `${Math.min(100, Math.max(0, dashboard.variacionMes ?? 0))}%`, background: '#10b981' }}></div>
                  </div>
                  <span className="cash-kpi-subtitle-light" style={{ color: dashboard.variacionMes >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                    {dashboard.variacionMes === null
                      ? t('admin.reports.kpi.noPreviousMonth', 'Sin ingresos el mes anterior para comparar')
                      : <><FaArrowUp style={{ fontSize: 11 }} /> {dashboard.variacionMes > 0 ? '+' : ''}{dashboard.variacionMes}% {t('admin.reports.kpi.vsLastMonth', 'vs mes anterior')}</>}
                  </span>
                </div>
  
                <div className="cash-kpi-item-light">
                  <div className="cash-kpi-header-light" style={{ color: 'var(--brand-text)' }}>
                    <FaClipboardList />
                    <span>{t('admin.reports.kpi.totalReservations', 'RESERVAS FACTURADAS')}</span>
                  </div>
                  <strong className="cash-kpi-val-light">{dashboard.reservasFacturadas} {t('admin.reports.kpi.reservationsUnit', 'reservas')}</strong>
                  <div className="cash-kpi-progress-bg">
                    <div className="cash-kpi-progress-fill" style={{ width: `${dashboard.tasaCompletadas}%`, background: 'var(--brand-primary)' }}></div>
                  </div>
                  <span className="cash-kpi-subtitle-light">{dashboard.tasaCompletadas}% {t('admin.reports.kpi.completedRateShort', 'completadas')}</span>
                </div>
  
                <div className="cash-kpi-item-light">
                  <div className="cash-kpi-header-light" style={{ color: '#f59e0b' }}>
                    <FaCar />
                    <span>{t('admin.reports.kpi.fleetOccupancy', 'TASA OCUPACIÓN FLOTA')}</span>
                  </div>
                  <strong className="cash-kpi-val-light">{dashboard.ocupacion}%</strong>
                  <div className="cash-kpi-progress-bg">
                    <div className="cash-kpi-progress-fill" style={{ width: `${dashboard.ocupacion}%`, background: '#f59e0b' }}></div>
                  </div>
                  <span className="cash-kpi-subtitle-light">{dashboard.flota.alquilados} {t('admin.reports.kpi.of', 'de')} {dashboard.flota.total} {t('admin.reports.kpi.vehiclesRented', 'vehículos alquilados')}</span>
                </div>
  
                <div className="cash-kpi-item-light">
                  <div className="cash-kpi-header-light" style={{ color: '#8b5cf6' }}>
                    <FaStar />
                    <span>{t('admin.reports.kpi.avgRating', 'CALIFICACIÓN PROMEDIO')}</span>
                  </div>
                  <strong className="cash-kpi-val-light">{dashboard.totalResenas > 0 ? `${dashboard.calificacion.toFixed(1)} / 5.0 ★` : '—'}</strong>
                  <div className="cash-kpi-progress-bg">
                    <div className="cash-kpi-progress-fill" style={{ width: `${(dashboard.calificacion / 5) * 100}%`, background: '#8b5cf6' }}></div>
                  </div>
                  <span className="cash-kpi-subtitle-light">
                    {dashboard.totalResenas > 0
                      ? `${t('admin.reports.kpi.basedOn', 'Basado en')} ${dashboard.totalResenas} ${t('admin.reports.kpi.reviews', 'valoraciones de sedes')}`
                      : t('admin.reports.kpi.noReviews', 'Aún no hay valoraciones')}
                  </span>
                </div>
              </div>
  
              {/* GRÁFICAS */}
              <div className="reports-charts-grid">
                {/* Gráfica 1: Facturación mensual */}
                <div className="reports-chart-card">
                  <div className="reports-chart-header">
                    <h3 className="reports-chart-title">
                      <FaMoneyBillWave style={{ color: '#10b981' }} />
                      {t('admin.reports.chart.revenueTitle', 'Facturación Mensual Acumulada')}
                    </h3>
                    <span className="reports-chart-badge">{dashboard.anio}</span>
                  </div>
                  <div className="reports-bars-container">
                    {dashboard.meses.map((bar, idx) => (
                      <div key={bar.label} className="reports-bar-item" title={`${bar.label}: ${formatCurrency(bar.valor, 'COP')}`}>
                        <div className="reports-bar-fill-wrap">
                          <div
                            className="reports-bar-fill"
                            style={{ height: `${bar.altura}%`, background: idx === dashboard.meses.length - 1 ? 'var(--brand-primary)' : 'var(--brand-primary)' }}
                          />
                        </div>
                        <span className="reports-bar-label">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
  
                {/* Gráfica 2: Estado de la flota */}
                <div className="reports-chart-card">
                  <div className="reports-chart-header">
                    <h3 className="reports-chart-title">
                      <FaCar style={{ color: 'var(--brand-text)' }} />
                      {t('admin.reports.chart.fleetTitle', 'Estado Actual de la Flota')}
                    </h3>
                    <span className="reports-chart-badge">{dashboard.flota.total} {t('admin.reports.chart.vehicles', 'Vehículos')}</span>
                  </div>
                  <div className="reports-donut-wrap">
                    <svg width="140" height="140" viewBox="0 0 42 42" className="reports-donut-svg">
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#e2e8f0" strokeWidth="5" />
                      {dashboard.segmentosFlota.map((seg) => (
                        <circle key={seg.clave} cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={seg.color} strokeWidth="5"
                          strokeDasharray={`${seg.pct} ${100 - seg.pct}`} strokeDashoffset={seg.offset} />
                      ))}
                    </svg>
                    <div className="reports-donut-legend">
                      <div className="reports-legend-item">
                        <div className="reports-legend-dot" style={{ background: 'var(--brand-primary)' }} />
                        <span>{t('admin.reports.chart.rentedLabel', 'En Alquiler')} ({dashboard.flota.alquilados} · {dashboard.flota.pctAlquilados}%)</span>
                      </div>
                      <div className="reports-legend-item">
                        <div className="reports-legend-dot" style={{ background: '#10b981' }} />
                        <span>{t('admin.reports.chart.availableLabel', 'Disponibles')} ({dashboard.flota.disponibles} · {dashboard.flota.pctDisponibles}%)</span>
                      </div>
                      <div className="reports-legend-item">
                        <div className="reports-legend-dot" style={{ background: '#f59e0b' }} />
                        <span>{t('admin.reports.chart.maintenanceLabel', 'En Taller')} ({dashboard.flota.mantenimiento} · {dashboard.flota.pctMantenimiento}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
  
                {/* Gráfica 3: Métodos de pago */}
                <div className="reports-chart-card">
                  <div className="reports-chart-header">
                    <h3 className="reports-chart-title">
                      <FaCreditCard style={{ color: '#8b5cf6' }} />
                      {t('admin.reports.chart.paymentsTitle', 'Métodos de Pago Preferidos')}
                    </h3>
                    <span className="reports-chart-badge">{dashboard.pagos.total} {t('admin.reports.chart.transactions', 'transacciones')}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                        <span>{t('hc.wompi_tarjetas_de_credito_pse', '💳 Wompi / Tarjetas de Crédito / PSE')}</span>
                        <span style={{ color: 'var(--brand-text)' }}>{dashboard.pagos.pctWompi}%</span>
                      </div>
                      <div className="cash-kpi-progress-bg">
                        <div className="cash-kpi-progress-fill" style={{ width: `${dashboard.pagos.pctWompi}%`, background: 'var(--brand-primary)' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                        <span>{t('hc.pago_en_caja_efectivo_en_sucursal', '💵 Pago en Caja (Efectivo en Sucursal)')}</span>
                        <span style={{ color: '#10b981' }}>{dashboard.pagos.pctEfectivo}%</span>
                      </div>
                      <div className="cash-kpi-progress-bg">
                        <div className="cash-kpi-progress-fill" style={{ width: `${dashboard.pagos.pctEfectivo}%`, background: '#10b981' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* TABLA DE DESEMPEÑO POR SUCURSAL */}
              <section className="cities-card">
                <div className="cash-toolbar-container">
                  <div className="cash-toolbar-row1" style={{ width: '100%', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FaBuilding style={{ color: 'var(--brand-text)', fontSize: 18 }} />
                      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>
                        {t('admin.reports.performanceTableTitle', 'Desempeño Operativo y Financiero por Sucursal')}
                      </h3>
                    </div>
                    <div className="cash-export-pills" style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="cash-btn-pill-export cash-btn-excel" onClick={() => handleDownloadDirect('excel')}>
                        <FaFileExcel /> <span>Excel</span>
                      </button>
                      <button type="button" className="cash-btn-pill-export cash-btn-pdf" onClick={() => handleDownloadDirect('pdf')}>
                        <FaFilePdf /> <span>PDF</span>
                      </button>
                      <button type="button" className="cash-btn-pill-export cash-btn-print" onClick={handlePrintReport}>
                        <FaPrint /> <span>{t('hc4.imprimir', 'Imprimir')}</span>
                      </button>
                    </div>
                  </div>
                </div>
  
                <div className="cities-table-wrap" style={{ overflowX: 'auto' }}>
                  <table className="incidents-table-v2" style={{ whiteSpace: 'nowrap', width: 'max-content', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>#</th>
                        <th>{t('admin.reports.table.branch', 'SUCURSAL / SEDE')}</th>
                        <th>{t('admin.reports.table.city', 'CIUDAD')}</th>
                        <th>{t('admin.reports.table.topVehicle', 'VEHÍCULO MÁS DEMANDADO')}</th>
                        <th>{t('admin.reports.table.reservationsCount', 'RESERVAS REALIZADAS')}</th>
                        <th>{t('admin.reports.table.rentedDays', 'DÍAS ALQUILADOS')}</th>
                        <th>{t('admin.reports.table.netRevenue', 'INGRESOS NETOS (COP)')}</th>
                        <th>{t('admin.reports.table.occupancyRate', 'TASA OCUPACIÓN (%)')}</th>
                        <th>{t('admin.reports.table.incidentsCount', 'INCIDENCIAS REPORTADAS')}</th>
                        <th>{t('admin.reports.table.rating', 'CALIFICACIÓN PROMEDIO')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.sucursales.length === 0 && (
                        <tr><td colSpan={10} style={{ textAlign: 'center', color: '#64748b', padding: 20 }}>{t('admin.reports.table.empty', 'No hay sucursales para mostrar.')}</td></tr>
                      )}
                      {dashboard.sucursales.map((row, idx) => (
                        <tr key={row.id}>
                          <td style={{ fontWeight: 600, color: 'var(--adm-text)' }}>{idx + 1}</td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>{row.sucursal}</td>
                          <td style={{ color: '#475569' }}>{row.ciudad}</td>
                          <td style={{ color: 'var(--brand-text)', fontWeight: 600 }}>{row.vehiculoTop || '—'}</td>
                          <td style={{ fontWeight: 600 }}>{row.reservas}</td>
                          <td style={{ color: '#64748b' }}>{row.dias} {t('admin.reports.table.days', 'días')}</td>
                          <td style={{ fontWeight: 800, color: '#10b981' }}>{formatCurrency(row.ingresos, 'COP')}</td>
                          <td>
                            <span style={{ padding: '3px 10px', borderRadius: 999, background: 'var(--brand-soft-strong)', color: 'var(--brand-text)', fontWeight: 700, fontSize: 12 }}>
                              {row.ocupacion}%
                            </span>
                          </td>
                          <td style={{ color: row.incidencias > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                            {row.incidencias} {t('admin.reports.table.cases', 'casos')}
                          </td>
                          <td style={{ color: '#8b5cf6', fontWeight: 800 }}>{row.totalResenas > 0 ? row.calificacion.toFixed(1) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
  )
}
