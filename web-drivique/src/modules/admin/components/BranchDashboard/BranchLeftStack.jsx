import { FaChartBar, FaCalendarCheck, FaReceipt, FaClipboardList, FaClock, FaCheckCircle, FaCar, FaCheckDouble, FaTimesCircle } from 'react-icons/fa'
import OperationalHourlyBarChart from '../OperationalHourlyBarChart'
import { formatDateLabel, TODAY_STR, getVehicleImage, getReservationStatusInfo } from '../branchDashboardHelpers'

export default function BranchLeftStack({ activeTab, currentList, deliveriesForRange, endDateStr, getSectionTitle, handleOpenDrawer, hourlyData, navigate, reservationsRoute, setActiveTab, startDateStr, t }) {
  return (
    <div className="branch-left-stack">
              {/* TARJETA DEDICADA: GRÁFICO RECHARTS DE BARRAS POR HORA */}
              <article className="branch-card branch-chart-card">
                <div className="branch-card-header-row">
                  <div className="branch-card-title-group">
                    <div>
                      <h3 className="branch-card-title">
                        <FaChartBar className="branch-card-title-icon" aria-hidden="true" />{t('dashboard.charts.workload', 'Carga Operativa por Franja Horaria')}</h3>
                      <span className="branch-hourly-chart-sub">
                        {getSectionTitle(startDateStr, endDateStr)}
                      </span>
                    </div>
                  </div>
                </div>
  
                {/* GRÁFICO NATIVO DE BARRAS DE CARGA OPERATIVA */}
                <div className="branch-recharts-container">
                  <OperationalHourlyBarChart hourlyData={hourlyData} />
                </div>
              </article>
  
              {/* TARJETA DEDICADA: TABLA DE PROGRAMACIÓN DE RESERVAS */}
              <article className="branch-card branch-table-card">
                <div className="branch-card-header-row">
                  <div className="branch-card-title-group">
                    <h3 className="branch-card-title">
                      <FaCalendarCheck className="branch-card-title-icon" aria-hidden="true" />
                      {activeTab === 'entregas' ? t('dashboard.charts.deliveriesList', 'Listado de Entregas') : t('dashboard.charts.returnsList', 'Listado de Devoluciones')}
                    </h3>
                  </div>
  
                  {/* PESTAÑAS PÍLDORA (ENTREGAS / DEVOLUCIONES) */}
                  <div className="branch-schedule-pill-tabs" role="tablist">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'entregas'}
                      className={`branch-schedule-pill-tab ${
                        activeTab === 'entregas' ? 'branch-schedule-pill-tab--active' : ''
                      }`}
                      onClick={() => setActiveTab('entregas')}
                    >
                      {t('common.deliveries', 'Entregas')}
                    </button>
  
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'devoluciones'}
                      className={`branch-schedule-pill-tab ${
                        activeTab === 'devoluciones' ? 'branch-schedule-pill-tab--active' : ''
                      }`}
                      onClick={() => setActiveTab('devoluciones')}
                    >
                      {t('common.returns', 'Devoluciones')}
                    </button>
                  </div>
                </div>
  
                {/* RESUMEN VEHÍCULOS */}
                <div className="branch-schedule-summary-bar">
                  <span>{t('dashboard.charts.totalVehicles', 'Total de vehículos')}: {deliveriesForRange.length || currentList.length}</span>
                </div>
  
                {currentList.length === 0 ? (
                  <div className="branch-empty-row">
                    <span>
                      {activeTab === 'entregas'
                        ? t('dashboard.schedule.noDeliveries', 'No hay entregas programadas para el rango de fechas seleccionado en el calendario.')
                        : t('dashboard.schedule.noReturns', 'No hay devoluciones programadas para el rango de fechas seleccionado en el calendario.')}
                    </span>
                  </div>
                ) : (
                  <div className="branch-table-responsive">
                    <table className="branch-schedule-table">
                      <thead>
                        <tr>
                          <th scope="col" style={{ width: '50px', textAlign: 'center' }}>{t('dashboard.schedule.table.id', 'ID')}</th>
                          <th scope="col">{t('dashboard.schedule.table.reservationCode', 'CÓDIGO RESERVA')}</th>
                          <th scope="col">{t('dashboard.schedule.table.client', 'NOMBRE COMPLETO')}</th>
                          <th scope="col">{t('dashboard.schedule.table.image', 'IMAGEN')}</th>
                          <th scope="col">{t('dashboard.schedule.table.vehicle', 'NOMBRE VEHÍCULO')}</th>
                          <th scope="col">{t('dashboard.schedule.table.plate', 'PLACA')}</th>
                          <th scope="col">{t('dashboard.schedule.table.date', 'FECHA')}</th>
                          <th scope="col">{t('dashboard.schedule.table.time', 'HORA')}</th>
                          <th scope="col">{t('dashboard.schedule.table.status', 'ESTADO')}</th>
                          <th scope="col" className="branch-th-actions">{t('dashboard.schedule.table.actions', 'ACCIONES')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentList.map((item, idx) => {
                          const itemUniqueId = item.id || `item-${idx}`
                          const itemSeqId = idx + 1
                          const resCodigo = item.codigo || item.id || `RES-88${20 + idx}`
                          const cliente = item.clienteNombre || ''
                          const vehiculo = item.vehiculoNombre || ''
                          const placa = item.vehiculoPlaca || ''
                          
                          const displayDate = formatDateLabel(item.fecha || TODAY_STR)
                          const displayTime = item.hora || ''
  
                          return (
                            <tr key={itemUniqueId} className="branch-table-row">
                              {/* ID */}
                              <td className="branch-td-id" style={{ textAlign: 'center', fontWeight: '400', color: '#64748b' }}>
                                <span>{itemSeqId}</span>
                              </td>
  
                              {/* CÓDIGO RESERVA */}
                              <td className="branch-td-code" style={{ fontWeight: '400', color: '#334155' }}>
                                <span style={{ fontWeight: '400', color: '#334155', fontStyle: 'normal', display: 'inline' }}>
                                  {resCodigo}
                                </span>
                              </td>
  
                              {/* NOMBRE COMPLETO */}
                              <td className="branch-td-client">
                                <span className="branch-table-client-name">{cliente}</span>
                              </td>
  
                              {/* IMAGEN */}
                              <td className="branch-td-image">
                                <img
                                  src={getVehicleImage(item)}
                                  alt={vehiculo}
                                  className="branch-table-vehicle-thumb"
                                />
                              </td>
  
                              {/* VEHÍCULO */}
                              <td className="branch-td-vehicle">
                                <span className="branch-table-vehicle-name">{vehiculo}</span>
                              </td>
  
                              {/* PLACA */}
                              <td className="branch-td-plate">
                                <span className="branch-table-vehicle-plate">{placa}</span>
                              </td>
  
                              {/* FECHA */}
                              <td className="branch-td-date">
                                <span className="branch-table-date">{displayDate}</span>
                              </td>
  
                              {/* HORA */}
                              <td className="branch-td-time">
                                <span className="branch-table-time">{displayTime}</span>
                              </td>
  
                              {/* ESTADO VISIBLE */}
                              <td className="branch-td-status">
                                {(() => {
                                  const stInfo = getReservationStatusInfo(item.estado, t)
                                  const StatusIcon = stInfo.IconComp
                                  return (
                                    <span className={`branch-status-badge ${stInfo.badgeClass}`}>
                                      <StatusIcon className="branch-badge-icon" aria-hidden="true" />
                                      {stInfo.visibleState}
                                    </span>
                                  )
                                })()}
                              </td>
  
                              {/* ACCIONES - BOTÓN VER */}
                              <td className="branch-td-actions">
                                <div className="branch-row-actions-group">
                                  <button
                                    type="button"
                                    style={{ padding: '6px 14px', fontSize: '13px', background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center', transition: 'all 0.18s ease' }}
                                    title={t('dashboard.schedule.table.viewDetails', 'Ver reserva completa')}
                                    aria-label={t('dashboard.schedule.table.viewDetails', 'Ver reserva completa')}
                                    onClick={(e) => handleOpenDrawer(item, e)}
                                    onMouseOver={e => { e.currentTarget.style.background='#ffedd5'; e.currentTarget.style.borderColor='#fdba74'; }}
                                    onMouseOut={e => { e.currentTarget.style.background='#fff7ed'; e.currentTarget.style.borderColor='#fed7aa'; }}
                                  >
                                    <FaReceipt /> {t('dashboard.schedule.table.viewBtn', 'Ver')}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
  
                {/* Pie de tarjeta con enlace a Reservas (sin icono) */}
                <div className="branch-schedule-footer">
                  <button
                    type="button"
                    className="branch-link-btn"
                    onClick={() => navigate(reservationsRoute)}
                  >
                    <span>{t('dashboard.schedule.viewAllReservations', 'Ver todas las reservas')}</span>
                  </button>
                </div>
              </article>
  
              {/* TARJETA: GUÍA EXPLICATIVA DE ESTADOS DE LA RESERVA CON COLORES TEMÁTICOS */}
              <article className="branch-card branch-status-guide-card">
                <div className="branch-card-header-row">
                  <div className="branch-card-title-group">
                    <div>
                      <h3 className="branch-card-title">
                        <FaClipboardList className="branch-card-title-icon" aria-hidden="true" />
                        {t('dashboard.statesGuide.title', 'Estados de la Reserva')}
                      </h3>
                      <span className="branch-status-guide-sub">{t('dashboard.statesGuide.subtitle', 'Guía explicativa de estados operativos y su equivalencia interna')}</span>
                    </div>
                  </div>
                </div>
  
                <div className="branch-status-guide-grid">
                  {/* 1. PENDIENTE */}
                  <div className="branch-status-card-item branch-status-card-item--amber">
                    <div className="branch-status-card-header">
                      <span className="branch-status-badge branch-status-badge--amber">
                        <FaClock className="branch-badge-icon" aria-hidden="true" />
                        {t('dashboard.status.pending', 'Pendiente')}
                      </span>
                    </div>
                    <p className="branch-status-card-text">
                      {t('dashboard.statesGuide.descPending1', 'Agrupa los estados internos')} <code className="branch-inline-code">PENDIENTE</code>, <code className="branch-inline-code">PENDIENTE_EFECTIVO</code> {t('common.and', 'y')} <code className="branch-inline-code">PENDIENTE_VALIDACION</code>. {t('dashboard.statesGuide.descPending2', 'La reserva está creada a la espera de pago en mostrador o validación de documentos.')}
                    </p>
                  </div>
  
                  {/* 2. CONFIRMADA */}
                  <div className="branch-status-card-item branch-status-card-item--green">
                    <div className="branch-status-card-header">
                      <span className="branch-status-badge branch-status-badge--green">
                        <FaCheckCircle className="branch-badge-icon" aria-hidden="true" />
                        {t('dashboard.status.confirmed', 'Confirmada')}
                      </span>
                    </div>
                    <p className="branch-status-card-text">
                      {t('dashboard.statesGuide.descConfirmed1', 'Corresponde al estado interno')} <code className="branch-inline-code">CONFIRMADA</code>. {t('dashboard.statesGuide.descConfirmed2', 'Pago y documentos validados 100%. Vehículo alistado y listo para entrega.')}
                    </p>
                  </div>
  
                  {/* 3. EN CURSO */}
                  <div className="branch-status-card-item branch-status-card-item--blue">
                    <div className="branch-status-card-header">
                      <span className="branch-status-badge branch-status-badge--blue">
                        <FaCar className="branch-badge-icon" aria-hidden="true" />
                        {t('dashboard.status.active', 'En curso')}
                      </span>
                    </div>
                    <p className="branch-status-card-text">
                      {t('dashboard.statesGuide.descActive1', 'Corresponde al estado interno')} <code className="branch-inline-code">ACTIVA</code>. {t('dashboard.statesGuide.descActive2', 'Vehículo entregado al cliente en sucursal y contrato de alquiler en ejecución.')}
                    </p>
                  </div>
  
                  {/* 4. FINALIZADA */}
                  <div className="branch-status-card-item branch-status-card-item--teal">
                    <div className="branch-status-card-header">
                      <span className="branch-status-badge branch-status-badge--teal">
                        <FaCheckDouble className="branch-badge-icon" aria-hidden="true" />
                        {t('dashboard.status.completed', 'Finalizada')}
                      </span>
                    </div>
                    <p className="branch-status-card-text">
                      {t('dashboard.statesGuide.descCompleted1', 'Corresponde al estado interno')} <code className="branch-inline-code">COMPLETADA</code>. {t('dashboard.statesGuide.descCompleted2', 'Vehículo recibido en sucursal, inspeccionado y contrato cerrado.')}
                    </p>
                  </div>
  
                  {/* 5. CANCELADA */}
                  <div className="branch-status-card-item branch-status-card-item--gray" style={{ gridColumn: 'span 2' }}>
                    <div className="branch-status-card-header">
                      <span className="branch-status-badge branch-status-badge--gray">
                        <FaTimesCircle className="branch-badge-icon" aria-hidden="true" />
                        {t('dashboard.status.cancelled', 'Cancelada')}
                      </span>
                    </div>
                    <p className="branch-status-card-text">
                      {t('dashboard.statesGuide.descCancelled1', 'Agrupa los estados internos')} <code className="branch-inline-code">CANCELADA</code> {t('common.and', 'y')} <code className="branch-inline-code">CANCELADA_POR_TIEMPO</code>. {t('dashboard.statesGuide.descCancelled2', 'Indica que la reserva fue anulada por solicitud del cliente o expirada automáticamente por tiempo límite.')}
                    </p>
                  </div>
                </div>
              </article>
            </div>
  )
}
