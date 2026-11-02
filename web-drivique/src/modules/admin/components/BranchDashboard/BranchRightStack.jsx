import { FaCalendarAlt, FaBell, FaCar } from 'react-icons/fa'
import OperationalDateRangeCalendar from '../OperationalDateRangeCalendar'
import { parseISOToDate } from '../branchDashboardHelpers'
import { vehicleManagementService } from '../../../../services/vehicleManagementService'
import { reservationManagementService } from '../../../../services/reservationManagementService'

export default function BranchRightStack({ attentionNeeded, documentsRoute, endDateStr, incidentsRoute, navigate, setEndDateObj, setStartDateObj, startDateStr, t, vehiclesRoute }) {
  return (
    <div className="branch-right-stack">
              {/* TARJETA 1: CALENDARIO VISIBLE TODO EL TIEMPO (INLINE DATEPICKER) */}
              <article className="branch-card branch-calendar-card">
                <div className="branch-card-header-row">
                  <div className="branch-card-title-group">
                    <div>
                      <h3 className="branch-card-title">
                        <FaCalendarAlt className="branch-card-title-icon" aria-hidden="true" />{t('dashboard.charts.calendar', 'Calendario Operativo')}</h3>
                      <span className="branch-calendar-card-sub">{t('dashboard.charts.selectDateRange', 'Selecciona un rango de fechas')}</span>
                    </div>
                  </div>
                </div>
  
                {/* CONTENEDOR DEL CALENDARIO INLINE SIEMPRE VISIBLE */}
                <div className="branch-inline-datepicker-wrapper">
                  <OperationalDateRangeCalendar
                    startDateStr={startDateStr}
                    endDateStr={endDateStr}
                    onSelectRange={(start, end) => {
                      setStartDateObj(parseISOToDate(start))
                      setEndDateObj(parseISOToDate(end))
                    }}
                  />
                </div>
              </article>
  
              {/* TARJETA 2: REQUIERE TU ATENCIÓN */}
              <article className="branch-card branch-attention-card">
                <div className="branch-card-header-row">
                  <div className="branch-card-title-group">
                    <h3 className="branch-card-title">
                      <FaBell className="branch-card-title-icon" aria-hidden="true" />
                      {t('dashboard.attention.title', 'Requiere tu atención')}
                    </h3>
                  </div>
                </div>
  
                <div className="branch-attention-list">
                  <button
                    type="button"
                    className="branch-attention-row"
                    onClick={() => navigate(documentsRoute)}
                  >
                    <div className="branch-attention-left">
                      <span className="branch-dot branch-dot--amber" />
                      <span className="branch-attention-text">
                        {attentionNeeded.pendingDocuments} {t('dashboard.attention.docsToValidate', 'documentos por validar')}
                      </span>
                    </div>
                    <span className="branch-attention-arrow">&gt;</span>
                  </button>
  
                  <button
                    type="button"
                    className="branch-attention-row"
                    onClick={() => navigate(incidentsRoute)}
                  >
                    <div className="branch-attention-left">
                      <span className="branch-dot branch-dot--red" />
                      <span className="branch-attention-text">
                        {attentionNeeded.openIncidents} {t('dashboard.attention.openIncidents', 'incidencia abierta')}
                      </span>
                    </div>
                    <span className="branch-attention-arrow">&gt;</span>
                  </button>
  
                  <button
                    type="button"
                    className="branch-attention-row"
                    onClick={() => navigate(vehiclesRoute)}
                  >
                    <div className="branch-attention-left">
                      <span className="branch-dot branch-dot--blue" />
                      <span className="branch-attention-text">
                        {attentionNeeded.expiringVehicleDocs} {t('dashboard.attention.expiringDocs', 'documento de vehículo por vencer')}
                      </span>
                    </div>
                    <span className="branch-attention-arrow">&gt;</span>
                  </button>
                </div>
              </article>
  
              {/* TARJETA 3: ESTADO DE LA FLOTA (datos reales de la sucursal) */}
              {(() => {
                const vehiculos = vehicleManagementService.list()
                const reservas = reservationManagementService.list()
                const enCurso = new Set(reservas.filter((r) => r.estado === 'en_curso').map((r) => String(r.vehiculoId)))
                const conReserva = new Set(reservas.filter((r) => r.estado === 'confirmada' || r.estado === 'creada').map((r) => String(r.vehiculoId)))
                const clasificar = (v) => {
                  if (v.estadoFlota === 'mantenimiento') return 'amber'
                  if (enCurso.has(String(v.id))) return 'blue'
                  if (conReserva.has(String(v.id))) return 'cyan'
                  return 'green'
                }
                const total = vehiculos.length
                const conteo = { green: 0, blue: 0, cyan: 0, amber: 0 }
                vehiculos.forEach((v) => { conteo[clasificar(v)] += 1 })
                const pct = (n) => (total ? Math.round((n / total) * 100) : 0)
                const etiqueta = {
                  green: t('dashboard.fleet.available', 'Disponible'),
                  blue: t('dashboard.fleet.occupied', 'Ocupado'),
                  cyan: t('dashboard.fleet.reserved', 'Reservado'),
                  amber: t('dashboard.fleet.maintenance', 'En mantenimiento'),
                }
                const tarjetas = [
                  { color: 'green', titulo: t('dashboard.fleet.available', 'Disponibles'), desc: t('dashboard.fleet.readyForDelivery', 'Listos para entrega') },
                  { color: 'blue', titulo: t('dashboard.fleet.occupied', 'Ocupados'), desc: t('dashboard.fleet.activeContract', 'En contrato activo') },
                  { color: 'cyan', titulo: t('dashboard.fleet.reserved', 'Reservados'), desc: t('dashboard.fleet.forDeliveryToday', 'Con reserva próxima') },
                  { color: 'amber', titulo: t('dashboard.fleet.maintenance', 'En mantenimiento'), desc: t('dashboard.fleet.technicalReview', 'Revisión técnica') },
                ]
                return (
                  <article className="branch-card branch-fleet-card">
                    <div className="branch-card-header-row">
                      <div className="branch-card-title-group">
                        <h3 className="branch-card-title">
                          <FaCar className="branch-card-title-icon" aria-hidden="true" />
                          {t('dashboard.fleet.title', 'Estado de la flota')}
                        </h3>
                      </div>
                      <span className="branch-fleet-total-pill">{total} {t('dashboard.fleet.vehiclesInBranch', 'vehículos en sucursal')}</span>
                    </div>
  
                    <div className="branch-fleet-stats-grid">
                      {tarjetas.map((card) => (
                        <div key={card.color} className={`branch-fleet-stat-box branch-fleet-stat-box--${card.color}`}>
                          <div className="branch-fleet-stat-head">
                            <span className={`branch-dot branch-dot--${card.color}`} />
                            <span className="branch-fleet-stat-lbl">{card.titulo}</span>
                          </div>
                          <div className="branch-fleet-stat-num">
                            {conteo[card.color]} <small>({pct(conteo[card.color])}%)</small>
                          </div>
                          <span className="branch-fleet-stat-desc">{card.desc}</span>
                        </div>
                      ))}
                    </div>
  
                    <div className="branch-fleet-bar-wrapper">
                      <div className="branch-fleet-bar-labels">
                        <span>{t('dashboard.fleet.distAvailability', 'Distribución de disponibilidad')}</span>
                        <strong>{pct(total - conteo.amber)}% {t('dashboard.fleet.operative', 'operativa')}</strong>
                      </div>
                      <div className="branch-fleet-multi-bar">
                        {tarjetas.map((card) => (
                          <div key={card.color} className={`branch-fleet-bar-seg branch-fleet-bar-seg--${card.color}`}
                            style={{ width: `${pct(conteo[card.color])}%` }} title={`${card.titulo}: ${pct(conteo[card.color])}%`} />
                        ))}
                      </div>
                    </div>
  
                    <div className="branch-fleet-units-list">
                      <span className="branch-fleet-units-title">{t('dashboard.fleet.branchUnits', 'Unidades de la sucursal')}</span>
                      {vehiculos.map((v) => {
                        const color = clasificar(v)
                        return (
                          <div key={v.id} className="branch-fleet-unit-item">
                            <div className="branch-fleet-unit-meta">
                              <span className="branch-fleet-unit-name">{v.nombre}</span>
                              <span className="branch-fleet-unit-plate">{v.placa} · {v.categoria}</span>
                            </div>
                            <span className={`branch-status-badge branch-status-badge--${color}`}>{etiqueta[color]}</span>
                          </div>
                        )
                      })}
                    </div>
  
                    <div className="branch-fleet-footer">
                      <button type="button" className="branch-link-btn" onClick={() => navigate(vehiclesRoute)}>
                        <span>{t('dashboard.fleet.viewFleet', 'Ver flota')} &gt;</span>
                      </button>
                    </div>
                  </article>
                )
              })()}
            </div>
  )
}
