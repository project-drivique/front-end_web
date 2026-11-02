import { FaSearch, FaBuilding, FaFileExcel, FaFilePdf, FaPrint } from 'react-icons/fa'

export default function ReservationsToolbar({ branchFilter, dateFrom, dateTo, esEncargado, handleExportExcel, handleExportPdf, handlePrint, search, setBranchFilter, setDateFrom, setDateTo, setSearch, setStatusFilter, statusFilter, sucursalEncargado, sucursalesVisibles, t }) {
  return (
    <div className="reservations-toolbar-flex" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: 16 }}>
              {/* Buscador general en vivo */}
              <label className="cities-search" style={{ flex: '1 1 250px', margin: 0 }}>
                <FaSearch />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('admin.reservationsManagement.searchPlaceholder', 'Buscar por código, cliente, vehículo, placa...')}
                />
              </label>
  
              {/* Filtro de Estado */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ flex: '0 0 auto', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--city-border)', background: 'var(--city-bg)' }}
              >
                <option value="all">{t('admin.reservationsManagement.allStatuses', 'Todos los estados')}</option>
                <option value="confirmada">{t('admin.statusConfirmada', 'Confirmada')}</option>
                <option value="en_curso">{t('admin.statusEnCurso', 'En curso')}</option>
                <option value="finalizada">{t('admin.statusFinalizada', 'Finalizada')}</option>
                <option value="cancelada">{t('admin.statusCancelada', 'Cancelada')}</option>
              </select>
  
              {/* Filtro de Sucursal */}
              {esEncargado ? (
                <div className="reservations-assigned-branch" style={{ flex: '0 0 auto', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--city-border)', background: 'var(--bg-seccion1, #f8fafc)', display: 'flex', alignItems: 'center' }}>
                  <FaBuilding style={{ marginRight: 8, color: 'var(--texto-second, #64748b)' }} />
                  <span style={{ fontWeight: 600, color: 'var(--texto-primary, #0f172a)' }}>{sucursalEncargado || t('admin.reservationsManagement.noAssignedBranch')}</span>
                </div>
              ) : (
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  style={{ flex: '0 0 auto', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--city-border)', background: 'var(--city-bg)' }}
                >
                  <option value="all">{t('admin.reservationsManagement.allBranches', 'Todas las sucursales')}</option>
                  {sucursalesVisibles.map((s) => (
                    <option key={s.id} value={s.nombre}>{s.nombre}</option>
                  ))}
                </select>
              )}
  
              {/* Filtros de Fecha (ahora integrados en el grid) */}
              <div className="reservations-date-inputs" style={{ display: 'flex', gap: '8px', flex: '0 0 auto' }}>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} title={t('admin.reservationsManagement.dateFrom')} style={{ padding: '8px 12px', border: '1.5px solid var(--city-border)', borderRadius: '12px', background: 'var(--city-card)' }} />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} title={t('admin.reservationsManagement.dateTo')} style={{ padding: '8px 12px', border: '1.5px solid var(--city-border)', borderRadius: '12px', background: 'var(--city-card)' }} />
              </div>
  
              {/* Botones de Exportación Independientes por Flujo */}
              <div className="export-pills-group" style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <button type="button" className="export-pill export-pill--excel" onClick={handleExportExcel} title={t("admin.vehiclesManagement.export.excelTitle", "Exportar tabla actual a Excel")}>
                  <FaFileExcel aria-hidden="true" /> {t("admin.vehiclesManagement.export.excel", "Excel")}
                </button>
                <button type="button" className="export-pill export-pill--pdf" onClick={handleExportPdf} title={t("admin.vehiclesManagement.export.pdfTitle", "Exportar tabla actual a PDF")}>
                  <FaFilePdf aria-hidden="true" /> {t("admin.vehiclesManagement.export.pdf", "PDF")}
                </button>
                <button type="button" className="export-pill export-pill--print" onClick={handlePrint} title={t("admin.vehiclesManagement.export.printTitle", "Imprimir tabla actual")}>
                  <FaPrint aria-hidden="true" /> {t("admin.vehiclesManagement.export.print", "Imprimir")}
                </button>
              </div>
            </div>
  )
}
