import { FaCalendarAlt, FaArrowRight, FaBuilding } from 'react-icons/fa'

export default function BuilderSectionCard2({ currentTypeConfig, datePreset, esEncargado, filterBranch, filterEndDate, filterSearch, filterSeverity, filterStartDate, filterState, handleDatePreset, setDatePreset, setFilterBranch, setFilterEndDate, setFilterSearch, setFilterSeverity, setFilterStartDate, setFilterState, sucursales, t }) {
  return (
    <div className="builder-section-card">
                <div className="builder-section-header">
                  <div className="builder-step-indicator">
                    <div className="step-circle-badge">2</div>
                    <div>
                      <h3 className="step-title-text">{t('admin.reports.step2Title', 'Parámetros y Filtros de Búsqueda')}</h3>
                      <p className="step-subtitle-text">{t('admin.reports.step2Subtitle', 'Ajusta el período, sucursal y criterios para filtrar los datos a incluir')}</p>
                    </div>
                  </div>
                </div>
  
                <div className="filters-grid-container">
                  {/* Rango de Fechas Elegante y Moderno */}
                  {currentTypeConfig.filtrosSoportados.includes('rangoFechas') && (
                    <div className="date-filter-full-width">
                      <div className="date-filter-header-row">
                        <div className="date-filter-title-info">
                          <div className="date-icon-box">
                            <FaCalendarAlt />
                          </div>
                          <div>
                            <h4>{t('admin.reports.dateRangeLabel', 'Período del Reporte')}</h4>
                            <p>{t('admin.reports.dateRangeDesc', 'Filtra por períodos predefinidos o ingresa un rango personalizado')}</p>
                          </div>
                        </div>
  
                        <div className="date-presets-segmented-bar">
                          <button
                            type="button"
                            className={`date-preset-pill ${datePreset === 'all' ? 'active' : ''}`}
                            onClick={() => handleDatePreset('all')}
                          >
                            {t('admin.reports.presetAll', 'Todo')}
                          </button>
                          <button
                            type="button"
                            className={`date-preset-pill ${datePreset === 'today' ? 'active' : ''}`}
                            onClick={() => handleDatePreset('today')}
                          >
                            {t('admin.reports.presetToday', 'Hoy')}
                          </button>
                          <button
                            type="button"
                            className={`date-preset-pill ${datePreset === 'week' ? 'active' : ''}`}
                            onClick={() => handleDatePreset('week')}
                          >
                            {t('admin.reports.presetWeek', '7 Días')}
                          </button>
                          <button
                            type="button"
                            className={`date-preset-pill ${datePreset === 'month' ? 'active' : ''}`}
                            onClick={() => handleDatePreset('month')}
                          >
                            {t('admin.reports.presetMonth', 'Este Mes')}
                          </button>
                          <button
                            type="button"
                            className={`date-preset-pill ${datePreset === 'year' ? 'active' : ''}`}
                            onClick={() => handleDatePreset('year')}
                          >
                            {t('admin.reports.presetYear', 'Este Año')}
                          </button>
                        </div>
                      </div>
  
                      <div className="date-range-picker-row">
                        <div className="date-picker-card">
                          <label className="date-picker-label">
                            <FaCalendarAlt />
                            <span>{t('admin.reports.startDateLabel', 'Fecha Desde')}</span>
                          </label>
                          <input
                            type="date"
                            className="date-styled-input"
                            value={filterStartDate}
                            onChange={(e) => {
                              setDatePreset('custom')
                              setFilterStartDate(e.target.value)
                            }}
                          />
                        </div>
  
                        <div className="date-range-divider">
                          <FaArrowRight />
                        </div>
  
                        <div className="date-picker-card">
                          <label className="date-picker-label">
                            <FaCalendarAlt />
                            <span>{t('admin.reports.endDateLabel', 'Fecha Hasta')}</span>
                          </label>
                          <input
                            type="date"
                            className="date-styled-input"
                            value={filterEndDate}
                            onChange={(e) => {
                              setDatePreset('custom')
                              setFilterEndDate(e.target.value)
                            }}
                          />
                        </div>
  
                        <div className="date-range-summary-badge">
                          <span className="badge-dot" />
                          <span>
                            {filterStartDate || filterEndDate
                              ? `${filterStartDate || 'Inicio'} → ${filterEndDate || 'Hoy'}`
                              : t('admin.reports.allHistory', 'Todo el histórico')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
  
                  {/* Sucursal */}
                  {currentTypeConfig.filtrosSoportados.includes('sucursal') && !esEncargado && (
                    <div className="filter-input-card">
                      <label>
                        <FaBuilding style={{ color: 'var(--adm-muted, #64748b)' }} />
                        {t('admin.reports.branchLabel', 'Sucursal')}
                      </label>
                      <select
                        value={filterBranch}
                        onChange={(e) => setFilterBranch(e.target.value)}
                      >
                        <option value="all">{t('admin.reports.allBranches', 'Todas las Sucursales')}</option>
                        {sucursales.map((s) => (
                          <option key={s.id || s.nombre} value={s.nombre}>
                            {s.nombre} ({s.ciudad || 'Colombia'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
  
                  {/* Estado dinámico */}
                  {(currentTypeConfig.filtrosSoportados.includes('estadoReserva') ||
                    currentTypeConfig.filtrosSoportados.includes('estadoContrato') ||
                    currentTypeConfig.filtrosSoportados.includes('estadoVehiculo') ||
                    currentTypeConfig.filtrosSoportados.includes('estadoIncidencia') ||
                    currentTypeConfig.filtrosSoportados.includes('estadoPromo')) && (
                    <div className="filter-input-card">
                      <label>{t('admin.reports.stateLabel', 'Estado Operativo')}</label>
                      <select
                        value={filterState}
                        onChange={(e) => setFilterState(e.target.value)}
                      >
                        <option value="all">{t('admin.reports.allStates', 'Todos los Estados')}</option>
                        {currentTypeConfig.id === 'reservations' && (
                          <>
                            <option value="confirmada">{t('admin.reports.stateConfirmed', 'Confirmada')}</option>
                            <option value="activa">{t('admin.reports.stateActive', 'En Curso / Activa')}</option>
                            <option value="completada">{t('admin.reports.stateCompleted', 'Completada / Finalizada')}</option>
                            <option value="cancelada">{t('admin.reports.stateCancelled', 'Cancelada')}</option>
                          </>
                        )}
                        {currentTypeConfig.id === 'vehicles' && (
                          <>
                            <option value="disponible">{t('admin.reports.stateAvailable', 'Disponible')}</option>
                            <option value="ocupado">{t('admin.reports.stateOccupied', 'En Alquiler / Mantenimiento')}</option>
                          </>
                        )}
                        {currentTypeConfig.id === 'contracts' && (
                          <>
                            <option value="firmado">{t('admin.reports.stateSigned', 'Firmado / Activo')}</option>
                            <option value="completado">{t('admin.reports.stateCompleted', 'Finalizado')}</option>
                            <option value="cancelado">{t('admin.reports.stateCancelled', 'Cancelado')}</option>
                          </>
                        )}
                        {currentTypeConfig.id === 'incidents' && (
                          <>
                            <option value="pendiente">{t('admin.reports.statePending', 'Pendiente')}</option>
                            <option value="en_revision">{t('admin.reports.stateInReview', 'En Revisión')}</option>
                            <option value="resuelto">{t('admin.reports.stateResolved', 'Resuelto')}</option>
                          </>
                        )}
                        {currentTypeConfig.id === 'promotions' && (
                          <>
                            <option value="activa">{t('admin.reports.statePromoActive', 'Activa')}</option>
                            <option value="inactiva">{t('admin.reports.statePromoInactive', 'Inactiva')}</option>
                          </>
                        )}
                      </select>
                    </div>
                  )}
  
                  {/* Gravedad (Incidencias) */}
                  {currentTypeConfig.filtrosSoportados.includes('gravedad') && (
                    <div className="filter-input-card">
                      <label>{t('admin.reports.severityLabel', 'Nivel de Gravedad')}</label>
                      <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                      >
                        <option value="all">{t('admin.reports.allSeverities', 'Todas las Gravedades')}</option>
                        <option value="alta">{t('admin.reports.severityHigh', 'Alta / Crítica')}</option>
                        <option value="media">{t('admin.reports.severityMedium', 'Media / Moderada')}</option>
                        <option value="baja">{t('admin.reports.severityLow', 'Baja / Leve')}</option>
                      </select>
                    </div>
                  )}
  
                  {/* Rol de usuario */}
                  {currentTypeConfig.filtrosSoportados.includes('rol') && (
                    <div className="filter-input-card">
                      <label>{t('admin.reports.roleLabel', 'Rol de Usuario')}</label>
                      <select
                        value={filterState}
                        onChange={(e) => setFilterState(e.target.value)}
                      >
                        <option value="all">{t('admin.reports.allRoles', 'Todos los Roles')}</option>
                        <option value="usuario">{t('admin.reports.roleCustomer', 'Clientes / Usuarios')}</option>
                        <option value="administrador">{t('admin.reports.roleAdmin', 'Administradores')}</option>
                        <option value="encargado_sucursal">{t('admin.reports.roleManager', 'Encargados de Sucursal')}</option>
                      </select>
                    </div>
                  )}
  
                  {/* Búsqueda por texto */}
                  {currentTypeConfig.filtrosSoportados.includes('search') && (
                    <div className="filter-input-card">
                      <label>{t('admin.reports.textSearchLabel', 'Búsqueda por Texto')}</label>
                      <input
                        type="text"
                        placeholder={t('admin.reports.searchPlaceholder', 'Buscar cliente, placa, código...')}
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
  )
}
