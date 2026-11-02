import { FaDollarSign, FaEllipsisV, FaCalendarCheck, FaUndo, FaCar } from 'react-icons/fa'

export default function BranchKpiGrid({ activeKpiMenu, dashboardData, fleet, formatCOP, handleExportKpiExcel, handleExportKpiPdf, handleOpenKpiDetail, handlePrintKpi, handleToggleKpiMenu, t }) {
  return (
    <section className="branch-kpi-grid">
            {/* Tarjeta 1: Ingresos del mes */}
            <article className="branch-kpi-card">
              <div className="branch-kpi-card-header">
                <div className="branch-kpi-title-with-icon">
                  <span className="branch-kpi-title">
                    <FaDollarSign className="branch-kpi-inline-icon" aria-hidden="true" />
                    {t('dashboard.kpi.monthlyRevenue', 'Ingresos del mes')}
                  </span>
                </div>
  
                <div className="branch-kpi-menu-wrapper">
                  <button
                    type="button"
                    className="branch-kpi-menu-btn"
                    title={t('hc.opciones_de_metrica', 'Opciones de métrica')}
                    aria-label={t('hc.opciones_de_metrica', 'Opciones de métrica')}
                    onClick={(e) => handleToggleKpiMenu('kpi-1', e)}
                  >
                    <FaEllipsisV aria-hidden="true" />
                  </button>
                  {activeKpiMenu === 'kpi-1' && (
                    <div className="branch-kpi-dropdown-menu" role="menu">
                      <button
                        type="button"
                        className="branch-kpi-dropdown-item"
                        onClick={() => handleExportKpiExcel('ingresos')}
                      >
                        {t('common.exportExcel', 'Exportar a Excel')}
                      </button>
                      <button
                        type="button"
                        className="branch-kpi-dropdown-item"
                        onClick={() => handleExportKpiPdf('ingresos')}
                      >
                        {t('common.exportPdf', 'Exportar a PDF')}
                      </button>
                      <button
                        type="button"
                        className="branch-kpi-dropdown-item"
                        onClick={() => handlePrintKpi('ingresos')}
                      >
                        {t('common.print', 'Imprimir')}
                      </button>
                      <button
                        type="button"
                        className="branch-kpi-dropdown-item"
                        onClick={() => handleOpenKpiDetail('ingresos')}
                      >
                        {t('common.viewDetails', 'Ver detalle')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
  
              <div className="branch-kpi-card-body">
                <div className="branch-kpi-value-row">
                  <strong className="branch-kpi-value">
                    {formatCOP(dashboardData.monthlyRevenue || 0)}
                  </strong>
                </div>
  
                <div className="branch-kpi-progress-track">
                  <div
                    className="branch-kpi-progress-bar branch-kpi-progress-bar--brand"
                    style={{ width: `${dashboardData.previousMonthRevenue > 0 ? Math.min(100, Math.round((dashboardData.monthlyRevenue / dashboardData.previousMonthRevenue) * 100)) : (dashboardData.monthlyRevenue > 0 ? 100 : 0)}%` }}
                  />
                </div>
              </div>
  
              <div className="branch-kpi-card-footer">
                <span className="branch-kpi-trend-text">
                  {dashboardData.monthlyRevenueChange === null || dashboardData.monthlyRevenueChange === undefined
                    ? t('dashboard.kpi.noPreviousMonth', 'Sin ingresos el mes anterior para comparar')
                    : `${dashboardData.monthlyRevenueChange > 0 ? '+' : ''}${String(dashboardData.monthlyRevenueChange).replace('.', ',')}% ${t('dashboard.kpi.vsLastMonth', 'vs. mes anterior')}`}
                </span>
              </div>
            </article>
  
            {/* Tarjeta 2: Entregas de hoy */}
            <article className="branch-kpi-card">
              <div className="branch-kpi-card-header">
                <div className="branch-kpi-title-with-icon">
                  <span className="branch-kpi-title">
                    <FaCalendarCheck className="branch-kpi-inline-icon" aria-hidden="true" />
                    {t('dashboard.kpi.todayDeliveries', 'Entregas de hoy')}
                  </span>
                </div>
  
                <div className="branch-kpi-menu-wrapper">
                  <button
                    type="button"
                    className="branch-kpi-menu-btn"
                    title={t('hc.opciones_de_metrica', 'Opciones de métrica')}
                    aria-label={t('hc.opciones_de_metrica', 'Opciones de métrica')}
                    onClick={(e) => handleToggleKpiMenu('kpi-2', e)}
                  >
                    <FaEllipsisV aria-hidden="true" />
                  </button>
                  {activeKpiMenu === 'kpi-2' && (
                    <div className="branch-kpi-dropdown-menu" role="menu">
                      <button
                        type="button"
                        className="branch-kpi-dropdown-item"
                        onClick={() => handleExportKpiExcel('entregas')}
                      >{t('common.exportExcel', 'Exportar a Excel')}</button>
                      <button
                        type="button"
                        className="branch-kpi-dropdown-item"
                        onClick={() => handleExportKpiPdf('entregas')}
                      >{t('common.exportPdf', 'Exportar a PDF')}</button>
                      <button
                        type="button"
                        className="branch-kpi-dropdown-item"
                        onClick={() => handlePrintKpi('entregas')}
                      >{t('common.print', 'Imprimir')}</button>
                      <button
                        type="button"
                        className="branch-kpi-dropdown-item"
                        onClick={() => handleOpenKpiDetail('entregas')}
                      >{t('common.viewDetails', 'Ver detalle')}</button>
                    </div>
                  )}
                </div>
              </div>
  
              <div className="branch-kpi-card-body">
                <div className="branch-kpi-value-row">
                  <strong className="branch-kpi-value">
                    {dashboardData.todayDeliveriesCount ?? 3}
                  </strong>
                  <span className="branch-kpi-unit">{t("dashboard.kpi.scheduled", "programadas")}</span>
                </div>
  
                <div className="branch-kpi-progress-track">
                  <div
                    className="branch-kpi-progress-bar branch-kpi-progress-bar--brand"
                    style={{
                      width: `${Math.round(
                        ((dashboardData.todayDeliveriesCompleted || 0) /
                          (dashboardData.todayDeliveriesCount || 1)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
  
              <div className="branch-kpi-card-footer">
                <span className="branch-kpi-trend-text">
                  {dashboardData.todayDeliveriesCompleted} {t("dashboard.kpi.completed", "completadas")} · {dashboardData.todayDeliveriesPending} {t("dashboard.kpi.pending", "pendientes")}
                </span>
              </div>
            </article>
  
            {/* Tarjeta 3: Devoluciones de hoy */}
            <article className="branch-kpi-card">
              <div className="branch-kpi-card-header">
                <div className="branch-kpi-title-with-icon">
                  <span className="branch-kpi-title">
                    <FaUndo className="branch-kpi-inline-icon" aria-hidden="true" />
                    {t('dashboard.kpi.todayReturns', 'Devoluciones de hoy')}
                  </span>
                </div>
  
                <div className="branch-kpi-menu-wrapper">
                  <button
                    type="button"
                    className="branch-kpi-menu-btn"
                    title={t('hc.opciones_de_metrica', 'Opciones de métrica')}
                    aria-label={t('hc.opciones_de_metrica', 'Opciones de métrica')}
                    onClick={(e) => handleToggleKpiMenu('kpi-3', e)}
                  >
                    <FaEllipsisV aria-hidden="true" />
                  </button>
                  {activeKpiMenu === 'kpi-3' && (
                    <div className="branch-kpi-dropdown-menu" role="menu">
                      <button
                        type="button"
                        className="branch-kpi-dropdown-item"
                        onClick={() => handleExportKpiExcel('devoluciones')}
                      >{t('common.exportExcel', 'Exportar a Excel')}</button>
                      <button
                        type="button"
                        className="branch-kpi-dropdown-item"
                        onClick={() => handleExportKpiPdf('devoluciones')}
                      >{t('common.exportPdf', 'Exportar a PDF')}</button>
                      <button
                        type="button"
                        className="branch-kpi-dropdown-item"
                        onClick={() => handlePrintKpi('devoluciones')}
                      >{t('common.print', 'Imprimir')}</button>
                      <button
                        type="button"
                        className="branch-kpi-dropdown-item"
                        onClick={() => handleOpenKpiDetail('devoluciones')}
                      >{t('common.viewDetails', 'Ver detalle')}</button>
                    </div>
                  )}
                </div>
              </div>
  
              <div className="branch-kpi-card-body">
                <div className="branch-kpi-value-row">
                  <strong className="branch-kpi-value">
                    {dashboardData.todayReturnsCount ?? 2}
                  </strong>
                  <span className="branch-kpi-unit">{t("dashboard.kpi.scheduled", "programadas")}</span>
                </div>
  
                <div className="branch-kpi-progress-track">
                  <div
                    className="branch-kpi-progress-bar branch-kpi-progress-bar--brand"
                    style={{
                      width: `${Math.round(
                        ((dashboardData.todayReturnsReceived || 0) /
                          (dashboardData.todayReturnsCount || 1)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
  
              <div className="branch-kpi-card-footer">
                <span className="branch-kpi-trend-text">
                  {dashboardData.todayReturnsPending} {t("dashboard.kpi.pending", "pendientes")} · {dashboardData.todayReturnsReceived} {t("dashboard.kpi.received", "recibidas")}
                </span>
              </div>
            </article>
  
            {/* Tarjeta 4: Ocupación */}
            <article className="branch-kpi-card">
              <div className="branch-kpi-card-header">
                <div className="branch-kpi-title-with-icon">
                  <span className="branch-kpi-title">
                    <FaCar className="branch-kpi-inline-icon" aria-hidden="true" />
                    {t('dashboard.kpi.fleetOccupancy', 'Ocupación de flota')}
                  </span>
                </div>
  
                <div className="branch-kpi-menu-wrapper">
                  <button
                    type="button"
                    className="branch-kpi-menu-btn"
                    title={t('hc.opciones_de_metrica', 'Opciones de métrica')}
                    aria-label={t('hc.opciones_de_metrica', 'Opciones de métrica')}
                    onClick={(e) => handleToggleKpiMenu('kpi-4', e)}
                  >
                    <FaEllipsisV aria-hidden="true" />
                  </button>
                  {activeKpiMenu === 'kpi-4' && (
                    <div className="branch-kpi-dropdown-menu" role="menu">
                      <button
                        type="button"
                        className="branch-kpi-dropdown-item"
                        onClick={() => handleExportKpiExcel('ocupacion')}
                      >{t('common.exportExcel', 'Exportar a Excel')}</button>
                      <button
                        type="button"
                        className="branch-kpi-dropdown-item"
                        onClick={() => handleExportKpiPdf('ocupacion')}
                      >{t('common.exportPdf', 'Exportar a PDF')}</button>
                      <button
                        type="button"
                        className="branch-kpi-dropdown-item"
                        onClick={() => handlePrintKpi('ocupacion')}
                      >{t('common.print', 'Imprimir')}</button>
                      <button
                        type="button"
                        className="branch-kpi-dropdown-item"
                        onClick={() => handleOpenKpiDetail('ocupacion')}
                      >{t('common.viewDetails', 'Ver detalle')}</button>
                    </div>
                  )}
                </div>
              </div>
  
              <div className="branch-kpi-card-body">
                <div className="branch-kpi-value-row">
                  <strong className="branch-kpi-value">
                    {fleet.occupancyRate}%
                  </strong>
                  <span className="branch-kpi-unit">{t("dashboard.kpi.rented", "en alquiler")}</span>
                </div>
  
                <div className="branch-kpi-progress-track">
                  <div
                    className="branch-kpi-progress-bar branch-kpi-progress-bar--brand"
                    style={{ width: `${fleet.occupancyRate}%` }}
                  />
                </div>
              </div>
  
              <div className="branch-kpi-card-footer">
                <span className="branch-kpi-trend-text">
                  {fleet.rentedVehicles} {t('dashboard.kpi.of', 'de')} {fleet.totalVehicles} {t('dashboard.kpi.vehiclesInUse', 'vehículos en uso')}
                </span>
              </div>
            </article>
          </section>
  )
}
