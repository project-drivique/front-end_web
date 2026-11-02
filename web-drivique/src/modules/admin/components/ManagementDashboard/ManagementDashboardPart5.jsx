import { FaSearch, FaCalendarCheck } from 'react-icons/fa'

export default function ManagementDashboardPart5({ activeTab, c, cashRoute, dateDeliveriesList, dateReturnsList, filteredList, isDark, navigate, reservationsRoute, searchTerm, setActiveTab, setSearchTerm, setZoomImage, t }) {
  return (
    <section style={{ background: c.card, padding: 22, borderRadius: 16, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 14 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: c.text }}>
                  Programación Operativa de Sucursal
                </h2>
                <span style={{ fontSize: 12, color: c.textMuted }}>
                  Atención presencial de entregas y devoluciones de la sede
                </span>
              </div>
  
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
  
                {/* Buscador en Vivo */}
                <div style={{ position: 'relative', minWidth: 200 }}>
                  <FaSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: c.textMuted, fontSize: 12 }} />
                  <input
                    type="text"
                    placeholder={t('hc.buscar_cliente_auto_o_placa', 'Buscar cliente, auto o placa...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px 7px 30px',
                      borderRadius: 8,
                      border: `1px solid ${c.searchInputBorder}`,
                      background: c.searchInputBg,
                      fontSize: 12,
                      color: c.text,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
  
                {/* Botones de Pestaña */}
                <div style={{ display: 'flex', background: c.tabContainerBg, padding: 3, borderRadius: 8 }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('entregas')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: 12,
                      border: 'none',
                      background: activeTab === 'entregas' ? c.tabActiveBg : 'transparent',
                      color: activeTab === 'entregas' ? c.tabActiveText : c.tabInactiveText,
                      boxShadow: activeTab === 'entregas' ? (isDark ? '0 1px 4px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.08)') : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Entregas ({dateDeliveriesList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('devoluciones')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: 12,
                      border: 'none',
                      background: activeTab === 'devoluciones' ? c.tabActiveBg : 'transparent',
                      color: activeTab === 'devoluciones' ? c.tabActiveText : c.tabInactiveText,
                      boxShadow: activeTab === 'devoluciones' ? (isDark ? '0 1px 4px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.08)') : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Devoluciones ({dateReturnsList.length})
                  </button>
                </div>
              </div>
            </div>
  
            {filteredList.length === 0 ? (
              <div style={{ padding: '44px 20px', textAlign: 'center', background: c.emptyBoxBg, borderRadius: 12, border: `1px dashed ${c.emptyBoxBorder}` }}>
                <FaCalendarCheck style={{ fontSize: 32, color: c.textMuted, marginBottom: 10 }} />
                <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: c.text }}>
                  No hay {activeTab === 'entregas' ? 'entregas' : 'devoluciones'} registradas
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: c.textMuted }}>
                  {searchTerm ? t('hc2.no_se_encontraron_resultados_para_tu_b', 'No se encontraron resultados para tu búsqueda.') : t('hc2.no_existen_actividades_pendientes_en_e', 'No existen actividades pendientes en esta sección.')}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: 12, border: `1px solid ${c.tableBorder}`, boxShadow: c.cardShadow }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 980 }}>
                  <thead>
                    <tr style={{ background: c.tableTheadBg, borderBottom: `2px solid ${c.tableBorder}` }}>
                      <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', width: 50 }}>ID</th>
                      <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('hc.codigo_reserva', 'CÓDIGO RESERVA')}</th>
                      <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>IMAGEN</th>
                      <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('hc.nombre_vehiculo', 'NOMBRE VEHÍCULO')}</th>
                      <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>PLACA</th>
                      <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('hc2.nombre_completo', 'NOMBRE COMPLETO')}</th>
                      <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>FECHA</th>
                      <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>HORA</th>
                      <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('hc.medio_de_pago', 'MEDIO DE PAGO')}</th>
                      <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ESTADO</th>
                      <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>{t('hc.accion', 'ACCIÓN')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((r, index) => {
                      const rawCod = r.codigo || r.referencia || `RES-${r.id}`
                      const rawMetodo = String(r.reservaDetalles?.metodoPago || r.pasarela || r.metodoPago || '').toLowerCase()
                      const esEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal')
                      const textoMedio = esEfectivo ? t('hc2.sucursal_efectivo', 'Sucursal (Efectivo)') : 'Wompi (Tarjeta)'
                      const estaPagado = r.pagoEstado === 'aprobado' || Boolean(r.metodoPagoConfirmado) || r.estado === 'confirmada' || r.estado === 'en_curso' || r.estado === 'finalizada'
                      
                      const fechaRaw = activeTab === 'entregas'
                        ? (r.reservaDetalles?.fechaInicio || r.fechaInicio || '')
                        : (r.reservaDetalles?.fechaFin || r.fechaFin || '')
                      
                      const fechaSolo = fechaRaw ? fechaRaw.slice(0, 10) : 'N/A'
                      // La hora que el servidor ya entregó en hora local; la fecha sola no la trae
                      const horaSolo = (activeTab === 'entregas' ? r.horaInicio : r.horaFin) || (fechaRaw && fechaRaw.length > 10 ? fechaRaw.slice(11, 16) : '—')
                      const clienteNombre = r.clienteNombre || r.datosForm?.nombres || t('hc2.cliente_drivique', 'Cliente Drivique')
  
                      return (
                        <tr
                          key={r.id || rawCod || index}
                          style={{
                            borderBottom: `1px solid ${c.tableRowBorder}`,
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = c.tableRowHover)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          {/* ID */}
                          <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 400, color: c.textMuted, textAlign: 'center', whiteSpace: 'nowrap' }}>
                            {index + 1}
                          </td>
  
                          {/* CÓDIGO */}
                          <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: c.text, whiteSpace: 'nowrap' }}>
                            {rawCod}
                          </td>
  
                          {/* FOTO */}
                          <td style={{ padding: '12px 14px' }}>
                            {r.vehiculoImagen ? (
                              <img
                                src={r.vehiculoImagen}
                                alt={r.vehiculoNombre || 'Auto'}
                                title={t('hc.haz_clic_para_ver_foto_completa', 'Haz clic para ver foto completa')}
                                onClick={() => setZoomImage({ url: r.vehiculoImagen, title: t('hc3.zoom_title', { defaultValue: '{{nombre}} ({{placa}})', nombre: r.vehiculoNombre || t('hc3.vehicle_word', 'Vehículo'), placa: r.vehiculoPlaca || t('hc3.plate_word', 'Placa') }) })}
                                style={{
                                  width: 44,
                                  height: 30,
                                  borderRadius: 6,
                                  objectFit: 'cover',
                                  border: `1px solid ${c.cardBorder}`,
                                  display: 'block',
                                  cursor: 'zoom-in',
                                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.15)'
                                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.25)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)'
                                  e.currentTarget.style.boxShadow = 'none'
                                }}
                              />
                            ) : (
                              <span style={{ fontSize: 12, color: c.textMuted }}>—</span>
                            )}
                          </td>
  
                          {/* VEHÍCULO */}
                          <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: c.text, whiteSpace: 'nowrap' }}>
                            {r.vehiculoNombre || 'Mazda CX-5'}
                          </td>
  
                          {/* PLACA */}
                          <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 500, color: c.text, whiteSpace: 'nowrap' }}>
                            {r.vehiculoPlaca || 'KLS-849'}
                          </td>
  
                          {/* NOMBRE COMPLETO */}
                          <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 400, color: c.textSecondary, whiteSpace: 'nowrap' }}>
                            {clienteNombre}
                          </td>
  
                          {/* FECHA */}
                          <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 400, color: c.textSecondary, whiteSpace: 'nowrap' }}>
                            {fechaSolo}
                          </td>
  
                          {/* HORA */}
                          <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 400, color: c.textSecondary, whiteSpace: 'nowrap' }}>
                            {horaSolo}
                          </td>
  
                          {/* MEDIO DE PAGO */}
                          <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 400, color: c.textSecondary, whiteSpace: 'nowrap' }}>
                            {textoMedio}
                          </td>
  
                          {/* ESTADO */}
                          <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              padding: '3px 10px',
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              background: estaPagado ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5') : (isDark ? 'rgba(245, 158, 11, 0.2)' : '#fffbe1'),
                              color: estaPagado ? (isDark ? '#34d399' : '#047857') : (isDark ? '#fbbf24' : '#b45309'),
                              border: `1px solid ${estaPagado ? (isDark ? '#059669' : '#a7f3d0') : (isDark ? '#d97706' : '#fde68a')}`,
                            }}>
                              {estaPagado ? t('hc5.received', 'Recibido') : t('hc5.not_received', 'No Recibido')}
                            </span>
                          </td>
  
                          {/* ACCIÓN */}
                          <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            {!estaPagado && esEfectivo ? (
                              <button
                                type="button"
                                onClick={() => navigate(`${cashRoute}?ref=${encodeURIComponent(rawCod)}`)}
                                style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(4,120,87,0.25)', transition: 'transform 0.15s ease' }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                              >
                                Cobrar en Caja
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => navigate(reservationsRoute)}
                                style={{ background: 'var(--brand-gradient, linear-gradient(135deg, var(--brand-primary-hover) 0%, var(--brand-primary) 100%))', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(var(--brand-primary-rgb),0.25)', transition: 'transform 0.15s ease' }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                              >
                                Ver Reserva
                              </button>
                            )}
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
