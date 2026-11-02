import { FaSearch, FaBuilding, FaFileExcel, FaFilePdf, FaPrint } from 'react-icons/fa'
import { exportExcel, exportPdf, printTable } from '@/utils/listExportUtils'

export default function CitiesToolbar({ activeTab, exportData, search, setSearch, t, user }) {
  return (
    <div className="cities-toolbar doc-toolbar-wrapper">
                <label className="cities-search" style={{ flex: '1 1 250px', margin: 0 }}>
                  <FaSearch />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={
                      activeTab === 'conductores'
                        ? t('admin.delivery.searchDriverPlaceholder', 'Buscar conductor por nombre, documento, licencia o teléfono...')
                        : t('admin.delivery.searchPlaceholder', 'Buscar por código, vehículo, placa o cliente...')
                    }
                  />
                </label>
  
                <div className="doc-branch-badge">
                  <FaBuilding style={{ color: 'var(--city-muted, #64748b)' }} />
                  <span>{user?.sucursalAsignada || user?.sucursalId || user?.sucursal || t('hc2.todas_las_sucursales', 'Todas las sucursales')}</span>
                </div>
  
                <div className="export-pills-group" style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="export-pill export-pill--excel"
                    onClick={() => exportExcel(exportData)}
                    title={t('admin.exportExcel', 'Excel')}
                  >
                    <FaFileExcel aria-hidden="true" /> {t('admin.exportExcel', 'Excel')}
                  </button>
                  <button
                    type="button"
                    className="export-pill export-pill--pdf"
                    onClick={() => exportPdf(exportData)}
                    title={t('admin.exportPdf', 'PDF')}
                  >
                    <FaFilePdf aria-hidden="true" /> {t('admin.exportPdf', 'PDF')}
                  </button>
                  <button
                    type="button"
                    className="export-pill export-pill--print"
                    onClick={() => printTable(exportData)}
                    title={t('admin.incidents.print', 'Imprimir')}
                  >
                    <FaPrint aria-hidden="true" /> {t('admin.incidents.print', 'Imprimir')}
                  </button>
                </div>
              </div>
  )
}
