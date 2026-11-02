import { FaSearch, FaBuilding, FaFileExcel, FaFilePdf, FaPrint } from 'react-icons/fa'
import { exportExcel, exportPdf, printTable } from '../../../../utils/listExportUtils'

export default function CitiesToolbar({ discountTypeFilter, exportData, search, setDiscountTypeFilter, setSearch, t, user }) {
  return (
    <div className="cities-toolbar doc-toolbar-wrapper">
                <label className="cities-search" style={{ flex: '1 1 250px', margin: 0 }}>
                  <FaSearch />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('admin.promotions.searchPlaceholder', 'Buscar por código, nombre, vehículo o condición...')}
                  />
                </label>
  
                <select
                  value={discountTypeFilter}
                  onChange={(e) => setDiscountTypeFilter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--city-border, #cbd5e1)', fontSize: 13, background: 'var(--city-bg, #f8fafc)', color: 'var(--city-text, #0f172a)', outline: 'none' }}
                >
                  <option value="all">{t('hc.todos_los_descuentos', 'Todos los descuentos')}</option>
                  <option value="porcentaje">{t('hc4.porcentaje', 'Porcentaje (%)')}</option>
                  <option value="fijo">{t('hc4.monto_fijo', 'Monto Fijo ($)')}</option>
                </select>
  
                <div className="doc-branch-badge">
                  <FaBuilding style={{ color: 'var(--city-muted, #64748b)' }} />
                  <span>{user?.sucursalAsignada || user?.sucursalId || user?.sucursal || t('hc2.todas_las_sucursales', 'Todas las sucursales')}</span>
                </div>
  
                <div className="export-pills-group" style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="export-pill export-pill--excel"
                    onClick={() => exportExcel({ title: t('hc4.promociones_drivique', 'Promociones - Drivique'), headers: ['ID', 'TIPO', t('hc2.codigo', 'CÓDIGO'), 'NOMBRE', 'AUDIENCIA', 'DESCUENTO', t('hc2.res_minima', 'RES MÍNIMA'), 'ALCANCE', 'INICIO', 'FIN', 'CONDICIONES', 'DESTACADA', 'ESTADO'], rows: exportData })}
                    title="Excel"
                  >
                    <FaFileExcel aria-hidden="true" /> Excel
                  </button>
                  <button
                    type="button"
                    className="export-pill export-pill--pdf"
                    onClick={() => exportPdf({ title: t('hc4.promociones_drivique', 'Promociones - Drivique'), headers: ['ID', 'TIPO', t('hc2.codigo', 'CÓDIGO'), 'NOMBRE', 'AUDIENCIA', 'DESCUENTO', t('hc2.res_minima', 'RES MÍNIMA'), 'ALCANCE', 'INICIO', 'FIN', 'CONDICIONES', 'DESTACADA', 'ESTADO'], rows: exportData })}
                    title="PDF"
                  >
                    <FaFilePdf aria-hidden="true" /> PDF
                  </button>
                  <button
                    type="button"
                    className="export-pill export-pill--print"
                    onClick={() => printTable({ title: t('hc4.promociones_drivique', 'Promociones - Drivique'), headers: ['ID', 'TIPO', t('hc2.codigo', 'CÓDIGO'), 'NOMBRE', 'AUDIENCIA', 'DESCUENTO', t('hc2.res_minima', 'RES MÍNIMA'), 'ALCANCE', 'INICIO', 'FIN', 'CONDICIONES', 'DESTACADA', 'ESTADO'], rows: exportData })}
                    title={t('hc4.imprimir', 'Imprimir')}
                  >
                    <FaPrint aria-hidden="true" /> Imprimir
                  </button>
                </div>
              </div>
  )
}
