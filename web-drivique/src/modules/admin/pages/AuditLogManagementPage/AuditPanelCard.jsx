import { FaFilter, FaFileExcel, FaFilePdf, FaPrint, FaSearch, FaTimes, FaSlidersH, FaCalendarAlt, FaRedo } from 'react-icons/fa'

export default function AuditPanelCard({ TIPOS_EVENTO, branchFilter, branches, endDate, esEncargado, filteredLogs, handleExportExcel, handleExportPdf, handlePrint, handleResetFilters, mobileFiltersOpen, resultFilter, roleFilter, search, setBranchFilter, setEndDate, setMobileFiltersOpen, setResultFilter, setRoleFilter, setSearch, setStartDate, setTypeFilter, startDate, t, typeFilter }) {
  return (
    <section className="audit-panel-card">
            <div className="audit-panel-head">
              <div className="audit-panel-head-title">
                <FaFilter size={13} className="audit-icon-brand" />
                <span>{t('admin.audit_module.filtersTitle', 'Filtros y Controles')}</span>
                <span className="audit-count-badge">{filteredLogs.length}</span>
              </div>
  
              <div className="audit-actions-group">
                <button
                  type="button"
                  className="audit-btn-action audit-btn-action--excel"
                  onClick={handleExportExcel}
                  title={t('hc4.exportar_a_microsoft_excel', 'Exportar a Microsoft Excel')}
                >
                  <FaFileExcel size={12} /> {t('admin.audit_module.exportExcel', 'Excel')}
                </button>
  
                <button
                  type="button"
                  className="audit-btn-action audit-btn-action--pdf"
                  onClick={handleExportPdf}
                  title={t('hc4.exportar_a_pdf', 'Exportar a PDF')}
                >
                  <FaFilePdf size={12} /> {t('admin.audit_module.exportPdf', 'PDF')}
                </button>
  
                <button
                  type="button"
                  className="audit-btn-action audit-btn-action--print"
                  onClick={handlePrint}
                  title={t('hc4.imprimir_listado', 'Imprimir listado')}
                >
                  <FaPrint size={12} /> {t('admin.audit_module.print', 'Imprimir')}
                </button>
              </div>
            </div>
  
            {/* FILA PRINCIPAL */}
            <div className="audit-filter-row audit-filter-row--primary">
              <div className="audit-field-search">
                <div className="audit-search-input-wrap">
                  <FaSearch className="audit-search-input-icon" />
                  <input
                    type="text"
                    placeholder={t('admin.audit_module.searchPlaceholder', 'Buscar por usuario, correo, IP, acción o ID...')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="audit-input audit-input--search"
                  />
                  {search && (
                    <button
                      type="button"
                      className="audit-search-clear-btn"
                      onClick={() => setSearch('')}
                    >
                      <FaTimes size={10} />
                    </button>
                  )}
                </div>
              </div>
  
              <div className="audit-field-select">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="audit-select"
                >
                  {TIPOS_EVENTO.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
  
              <div className="audit-field-select">
                <select
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value)}
                  className="audit-select"
                >
                  <option value="all">{t('admin.audit_module.allResults', 'Todos los resultados')}</option>
                  <option value="EXITO">{t('admin.audit_module.results.success', 'Éxito')}</option>
                  <option value="FALLO">{t('admin.audit_module.results.failure', 'Fallo')}</option>
                  <option value="DENEGADO">{t('admin.audit_module.results.denied', 'Denegado')}</option>
                  <option value="ADVERTENCIA">{t('admin.audit_module.results.warning', 'Advertencia')}</option>
                </select>
              </div>
  
              <button
                type="button"
                className="audit-btn-toggle-filters"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              >
                <FaSlidersH size={11} /> {mobileFiltersOpen ? t('admin.audit_module.lessFilters', 'Menos filtros') : t('admin.audit_module.moreFilters', 'Más filtros')}
              </button>
            </div>
  
            {/* FILA SECUNDARIA */}
            <div className={`audit-filter-row audit-filter-row--secondary ${mobileFiltersOpen ? 'audit-filter-row--open' : ''}`}>
              <div className="audit-field-select">
                <label className="audit-input-label">{t('admin.audit_module.actorRole', 'Rol del Actor')}</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="audit-select"
                >
                  <option value="all">{t('admin.audit_module.allRoles', 'Todos los roles')}</option>
                  <option value="administrador">{t('admin.audit_module.roles.admin', 'Administrador')}</option>
                  <option value="encargado">{t('admin.audit_module.roles.manager', 'Encargado de Sucursal')}</option>
                  <option value="usuario">{t('admin.audit_module.roles.user', 'Usuario / Cliente')}</option>
                  <option value="visitante">{t('admin.audit_module.roles.guest', 'Visitante')}</option>
                </select>
              </div>
  
              {!esEncargado && (
                <div className="audit-field-select">
                  <label className="audit-input-label">{t('admin.audit_module.branchLabel', 'Sucursal')}</label>
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="audit-select"
                  >
                    <option value="all">{t('admin.audit_module.allBranches', 'Todas las sucursales')}</option>
                    <option value="Global / Sistema">{t('admin.audit_module.globalSystem', 'Global / Sistema')}</option>
                    {branches.map((b) => (
                      <option key={b.id || b.nombre} value={b.nombre}>
                        {b.nombre} ({b.ciudad})
                      </option>
                    ))}
                  </select>
                </div>
              )}
  
              <div className="audit-field-date">
                <label className="audit-input-label">
                  <FaCalendarAlt size={10} /> {t('admin.audit_module.dateFrom', 'Desde')}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="audit-input audit-input--date"
                />
              </div>
  
              <div className="audit-field-date">
                <label className="audit-input-label">
                  <FaCalendarAlt size={10} /> {t('admin.audit_module.dateTo', 'Hasta')}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="audit-input audit-input--date"
                />
              </div>
  
              <div className="audit-field-btn">
                <button
                  type="button"
                  className="audit-btn-reset"
                  onClick={handleResetFilters}
                  title={t('hc.restablecer_todos_los_filtros', 'Restablecer todos los filtros')}
                >
                  <FaRedo size={11} /> {t('admin.audit_module.resetFilters', 'Limpiar')}
                </button>
              </div>
            </div>
          </section>
  )
}
