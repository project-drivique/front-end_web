import { FaSearch, FaFileExcel, FaFilePdf, FaPrint, FaCashRegister, FaReceipt, FaDownload } from 'react-icons/fa'
import { exportExcel, exportPdf, printTable } from '../../../../utils/listExportUtils'
import { formatCurrency } from '../../../../utils/currencyUtils'

export default function CitiesCard({ cobradasHoy, dateFrom, dateTo, esCobradoEnSucursal, exportData, filterTab, handleDescargarComprobante, handleImprimirComprobante, handleSearchRef, isBranchManager, listFiltrada, listaSucursales, moneda, openModalCobro, pendientesEfectivo, searchRefValue, selectedBranch, setComprobanteDigital, setDateFrom, setDateTo, setFilterTab, setSearch, setSearchRefValue, setSelectedBranch, t, tasaUSD }) {
  return (
    <section className="cities-card">
              <div className="cash-toolbar-container">
                {/* FILA 1: Buscador, Filtro Estado y Selector Sucursal */}
                <div className="cash-toolbar-row1" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
  
                  {/* Input referencia */}
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--city-card, #fff)', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: '8px', padding: '0 8px', height: '36px', minWidth: '160px' }}>
                    <input
                      type="text"
                      placeholder={t('admin.cash.filterRefPlaceholder', 'Ref. (Ej. RES-179...)')}
                      value={searchRefValue}
                      onChange={(e) => {
                        const val = e.target.value
                        setSearchRefValue(val)
                        setSearch(val)
                      }}
                      style={{ padding: '0 8px', border: 'none', background: 'transparent', color: 'var(--city-text, #0f172a)', fontSize: '13px', outline: 'none', width: '155px', height: '100%' }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchRef()}
                    />
                  </div>
  
                  {/* Botones Filtrar y Limpiar */}
                  <button
                    type="button"
                    onClick={handleSearchRef}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0 12px', height: '36px', background: '#f59e0b', borderRadius: '8px', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    <FaSearch /> {t('admin.cash.filterBtn', 'Filtrar')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSearchRefValue(''); setSearch(''); }}
                    style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: '36px', background: 'var(--city-card, #fff)', borderRadius: '8px', border: '1.5px solid #f59e0b', color: '#f59e0b', fontWeight: 600, cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    {t('admin.cash.clearBtn', 'Limpiar')}
                  </button>
  
                  {/* Dropdown estado */}
                  <select
                    value={filterTab}
                    onChange={(e) => setFilterTab(e.target.value)}
                    style={{ height: '36px', padding: '0 10px', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: '8px', fontSize: '13px', background: 'var(--city-card, #fff)', color: 'var(--city-text, #374151)', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <option value="todas">{t('admin.cash.allPayments', 'Todos los pagos')}</option>
                    <option value="pendientes">{t('admin.cash.pendingCashOption', 'Pendientes Efectivo ({{count}})', { count: pendientesEfectivo.length })}</option>
                    <option value="cobradas">{t('admin.cash.collectedOption', 'Cobradas Caja ({{count}})', { count: cobradasHoy.length })}</option>
                    <option value="digitales">{t('admin.cash.digitalGateway', 'Pasarela Digital')}</option>
                  </select>
  
                  {/* Dropdown Sucursal */}
                  {!isBranchManager && (
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      style={{ height: '36px', padding: '0 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', background: '#fff', color: '#374151', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <option value="todas">{t('admin.cash.allBranches', 'Todas las sucursales')}</option>
                      {listaSucursales.map((suc) => (
                        <option key={suc} value={suc}>{suc}</option>
                      ))}
                    </select>
                  )}
  
                  {/* Fechas DESDE / HASTA - inline sin label apilado */}
                  <input
                    type="date"
                    placeholder={t('admin.cash.dateFrom', 'Desde')}
                    title={t('hc4.desde', 'Desde')}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    style={{ height: '36px', padding: '0 8px', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: '8px', fontSize: '13px', background: 'var(--city-card, #fff)', color: 'var(--city-text, #374151)', width: '140px', flexShrink: 0 }}
                  />
                  <input
                    type="date"
                    placeholder={t('admin.cash.dateTo', 'Hasta')}
                    title={t('hc4.hasta', 'Hasta')}
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    style={{ height: '36px', padding: '0 8px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', background: '#fff', color: '#374151', width: '140px', flexShrink: 0 }}
                  />
  
                  {/* Botones exportación */}
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="cash-exp-btn excel"
                      onClick={() => exportExcel(exportData)}
                      title={t('admin.cash.exportExcel', 'Excel')}
                    >
                      <FaFileExcel /> {t('admin.cash.exportExcel', 'Excel')}
                    </button>
                    <button
                      type="button"
                      className="cash-exp-btn pdf"
                      onClick={() => exportPdf(exportData)}
                      title={t('admin.cash.exportPdf', 'PDF')}
                    >
                      <FaFilePdf /> {t('admin.cash.exportPdf', 'PDF')}
                    </button>
                    <button
                      type="button"
                      className="cash-exp-btn print"
                      onClick={() => printTable(exportData)}
                      title={t('admin.reservationsManagement.print', 'Imprimir')}
                    >
                      <FaPrint /> {t('admin.reservationsManagement.print', 'Imprimir')}
                    </button>
                  </div>
                </div>
              </div>
  
              {/* Resumen de Resultados */}
              <div className="cities-summary">
                <strong>{listFiltrada.length}</strong> {t('admin.cash.reservationsFound', 'reservas encontradas')}
              </div>
  
              {/* Tabla Simplificada para Cobro en Sucursal */}
              {listFiltrada.length === 0 ? (
                <div className="cities-empty">
                  <FaCashRegister style={{ fontSize: 32, color: '#94a3b8' }} />
                  <h2>{t('admin.cash.emptyTitle', 'No se encontraron reservas')}</h2>
                  <p>{t('admin.cash.emptyDesc', 'No hay registros coincidentes con los criterios de búsqueda o filtro seleccionados.')}</p>
                </div>
              ) : (
                <div className="cities-table-wrap">
                  <table className="branches-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>{t('admin.cash.table.code', 'CÓDIGO RESERVA')}</th>
                        <th>{t('admin.cash.table.fullName', 'NOMBRE COMPLETO')}</th>
                        <th>{t('admin.cash.table.phone', 'TELÉFONO')}</th>
                        <th>{t('admin.cash.table.paymentMethod', 'MEDIO DE PAGO')}</th>
                        <th>{t('admin.cash.table.totalAmount', 'MONTO TOTAL')}</th>
                        <th>{t('admin.cash.table.paymentStatus', 'ESTADO PAGO')}</th>
                        <th>{t('admin.cash.table.receipt', 'COMPROBANTE DE PAGO')}</th>
                        <th>{t('admin.cash.table.downloadReceipt', 'DESCARGAR COMPROBANTE')}</th>
                        <th>{t('admin.cash.table.printReceipt', 'IMPRIMIR COMPROBANTE')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listFiltrada.map((r, index) => {
                        const sequentialId = index + 1
                        const dbId = r.id || 'N/A'
                        const cod = r.codigo || r.referencia || dbId
                        const total = Number(r.totalCOP || r.total || 0)
                        
                        const rawMetodo = String(r.metodoPago || r.reservaDetalles?.metodoPago || r.pasarela || r.metodoPagoConfirmado || 'Wompi').toLowerCase()
                        const esEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal') || String(r.estado).toLowerCase().includes('efectivo')
                        const esPagadaEnEfectivo = esEfectivo && esCobradoEnSucursal(r)
                        const esPagadaDigital = !esEfectivo && (r.pagoEstado === 'aprobado' || r.estadoPago === 'aprobado' || r.estado === 'confirmada' || r.estado === 'en_curso' || r.estado === 'finalizada')
                        
                        const pagoConfirmado = esPagadaEnEfectivo || esPagadaDigital
                        
                        // Lógica de prefijo de país para el teléfono
                        let tel = String(r.clienteTelefono || t('hc2.sin_telefono', 'Sin teléfono')).trim()
                        if (tel !== 'Sin teléfono' && !tel.startsWith('+')) {
                          tel = `+57 ${tel}`
                        }
  
                        // Formatear Medio de Pago
                        let medioDisplay = esEfectivo ? t('admin.cash.paymentMethodBranch', 'Pago en Sucursal') : 'Wompi (Tarjeta)'
                        if (!esEfectivo) {
                          if (rawMetodo.includes('nequi')) medioDisplay = 'Wompi (Nequi)'
                          else if (rawMetodo.includes('pse')) medioDisplay = 'Wompi (PSE)'
                          else if (rawMetodo.includes('daviplata')) medioDisplay = 'Wompi (DaviPlata)'
                          else if (rawMetodo.includes('bancolombia')) medioDisplay = 'Wompi (Bancolombia)'
                          else if (rawMetodo !== 'wompi' && rawMetodo !== 'wompi (digital)') {
                            // Capitalizar primera letra si viene algo específico de Wompi
                            const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)
                            medioDisplay = `Wompi (${capitalize(rawMetodo)})`
                          }
                        }
  
                        const finalName = r.clienteNombre || t('hc2.sin_nombre', 'Sin Nombre')
  
                        return (
                          <tr
                            key={dbId + cod}
                            style={{ cursor: 'default' }}
                          >
                            <td>
                              <span style={{ fontSize: 13, color: 'var(--city-muted, #475569)' }}>{sequentialId}</span>
                            </td>
                            <td>
                              <span style={{ color: 'var(--city-text, #0f172a)', fontSize: 13 }}>
                                {cod}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: 13, color: 'var(--city-text, #0f172a)' }}>
                                {finalName}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: 13, color: 'var(--city-muted, #475569)' }}>
                                {tel}
                              </span>
                            </td>
                            
                            <td>
                              <span style={{ fontSize: 13, color: 'var(--city-text, #0f172a)' }}>
                                {medioDisplay}
                              </span>
                            </td>
  
                            <td>
                              <span style={{ color: 'var(--city-text, #0f172a)', fontSize: 13 }}>
                                {formatCurrency(total, moneda, tasaUSD)}
                              </span>
                            </td>
  
                            {/* ESTADO PAGO */}
                            <td>
                              {!pagoConfirmado && esEfectivo ? (
                                <button
                                  type="button"
                                  style={{ width: '120px', height: '32px', fontSize: '13px', background: '#f59e0b', border: 'none', color: '#fff', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}
                                  onClick={(e) => { e.stopPropagation(); openModalCobro(r) }}
                                >
                                  {t('admin.cash.actions.chargeBox', 'Cobrar en Caja')}
                                </button>
                              ) : pagoConfirmado ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '120px',
                                    height: '32px',
                                    borderRadius: '6px',
                                    backgroundColor: '#dcfce7',
                                    color: '#15803d',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    boxSizing: 'border-box'
                                  }}
                                >
                                  {t('admin.cash.status.approved', 'Aprobado')}
                                </span>
                              ) : (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '120px',
                                    height: '32px',
                                    borderRadius: '6px',
                                    backgroundColor: '#fef9c3',
                                    color: '#a16207',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    boxSizing: 'border-box'
                                  }}
                                >
                                  {t('admin.cash.status.pending', 'Pendiente')}
                                </span>
                              )}
                            </td>
  
                            {/* COMPROBANTE DE PAGO */}
                            <td>
                              {pagoConfirmado ? (
                                <button
                                  type="button"
                                  style={{ width: '80px', padding: '6px 10px', fontSize: '13px', background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', borderRadius: '6px', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: '500', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (esPagadaEnEfectivo) { openModalCobro(r) } else { setComprobanteDigital(r) }
                                  }}
                                >
                                  <FaReceipt /> {t('admin.cash.actions.view', 'Ver')}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  style={{ width: '80px', padding: '6px 10px', fontSize: '13px', background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', borderRadius: '6px', opacity: 0.4, cursor: 'not-allowed', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: '500', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                                >
                                  <FaReceipt /> {t('admin.cash.actions.view', 'Ver')}
                                </button>
                              )}
                            </td>
  
                            {/* DESCARGAR - descarga como PNG idéntico a la pantalla */}
                            <td>
                              <button
                                type="button"
                                className="cash-btn-primary"
                                disabled={!pagoConfirmado}
                                style={{ width: '100px', padding: '6px 10px', fontSize: '13px', background: pagoConfirmado ? '#faf5ff' : '#e5e7eb', borderColor: pagoConfirmado ? '#e9d5ff' : '#e5e7eb', color: pagoConfirmado ? '#9333ea' : '#9ca3af', whiteSpace: 'nowrap', textAlign: 'center', cursor: pagoConfirmado ? 'pointer' : 'not-allowed', fontWeight: '500', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (!pagoConfirmado) return
                                  handleDescargarComprobante(r)
                                }}
                              >
                                <FaDownload /> {t('admin.cash.actions.download', 'Descargar')}
                              </button>
                            </td>
  
                            {/* IMPRIMIR */}
                            <td>
                              <button
                                type="button"
                                className="cash-btn-primary"
                                disabled={!pagoConfirmado}
                                style={{ width: '90px', padding: '6px 10px', fontSize: '13px', background: pagoConfirmado ? 'var(--city-soft, #eff6ff)' : '#e5e7eb', borderColor: pagoConfirmado ? 'var(--brand-border)' : '#e5e7eb', color: pagoConfirmado ? 'var(--brand-primary)' : '#9ca3af', whiteSpace: 'nowrap', textAlign: 'center', cursor: pagoConfirmado ? 'pointer' : 'not-allowed', fontWeight: '500', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (!pagoConfirmado) return
                                  handleImprimirComprobante(r)
                                }}
                              >
                                <FaPrint /> Imprimir
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
  )
}
