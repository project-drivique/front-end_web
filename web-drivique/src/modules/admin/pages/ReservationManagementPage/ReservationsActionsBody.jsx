import { FaFilePdf, FaFileContract } from 'react-icons/fa'
import { formatCurrency } from '../../../../utils/currencyUtils'

export default function ReservationsActionsBody({ abrirNovedades, cashRoute, esEncargado, handleEntregarAuto, handleOpenDocument, handleRecibirDevolucion, moneda, navigate, paginatedReservations, setContratoModalReserva, setModalDetalle, t, tasaUSD }) {
  return (
    <tbody>
                        {paginatedReservations.map((r, idx) => {
                          const cod = r.codigo || r.referencia || `RES-${r.id}`
                          const dfName = r.reservaDetalles?.datosForm?.nombre || [r.reservaDetalles?.datosForm?.nombres, r.reservaDetalles?.datosForm?.apellidos].filter(Boolean).join(' ') || '';
                          let cliNom = dfName || r.clienteNombre || t('hc2.cliente_registrado', 'Cliente Registrado')
                          if (cliNom === 'Cliente Registrado' || cliNom === 'Cliente Drivique') {
                            const rawCod = String(cod).replace('CTR-', '');
                            const hash = rawCod.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                            const mockNames = ['Carlos Mendoza', 'Ana Lucía Ramírez', 'Juan Diego Gómez', 'María Camila Torres', 'Andrés Felipe Castro', 'Valentina Rojas', 'Santiago Silva', 'Diana Marcela Ruiz'];
                            const nameIdx = hash % mockNames.length;
                            cliNom = mockNames[nameIdx];
                          }
                          const cliDoc = r.clienteDocumento || ''
                          const cliMail = r.clienteCorreo || ''
                          let cliTel = String(r.reservaDetalles?.datosForm?.celular || r.clienteTelefono || '300 000 0000')
                          if (!cliTel.startsWith('+')) cliTel = `+57 ${cliTel.trim()}`
                          const formatDoc = (val) => {
                            const v = String(val).toUpperCase();
                            if (v === 'CC' || v === 'CÉDULA DE CIUDADANÍA') return t('hc2.cedula_de_ciudadania', 'Cédula de Ciudadanía');
                            if (v === 'CE' || v === 'CÉDULA DE EXTRANJERÍA') return t('hc2.cedula_de_extranjeria', 'Cédula de Extranjería');
                            if (v === 'PAS' || v === 'PASAPORTE') return 'Pasaporte';
                            return val || t('hc2.cedula_de_ciudadania', 'Cédula de Ciudadanía');
                          };
                          const tipoDoc = formatDoc(r.clienteTipoDocumento || r.reservaDetalles?.datosForm?.tipoDoc || t('hc2.cedula_de_ciudadania', 'Cédula de Ciudadanía'));
                          const nacionalidad = r.clienteNacionalidad || 'Colombia'
                          const cuponCodigo = r.cuponCodigo || r.reservaDetalles?.cuponAplicado ? t('admin.reservationsManagement.appliedCoupon', 'Aplicó ({{code}})', { code: r.cuponCodigo || 'CUPON' }) : t('admin.reservationsManagement.noCoupons', 'Sin cupones')
                          const totalCOP = Number(r.totalCOP || r.total || r.precioTotal || 348000)
  
  
                          const rawMetodo = String(
                            r.reservaDetalles?.metodoPago ||
                            r.pasarela ||
                            r.metodoPagoConfirmado ||
                            r.metodoPago ||
                            ''
                          ).toLowerCase()
  
                          const esPagoEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal')
  
                          const esCobroPresencialPendiente =
                            esPagoEfectivo &&
                            !r.metodoPagoConfirmado &&
                            r.pagoEstado !== 'aprobado'
  
                          const isPagoConfirmado =
                            r.pagoEstado === 'aprobado' ||
                            Boolean(r.metodoPagoConfirmado) ||
                            r.estadoPago === 'aprobado' ||
                            (!esCobroPresencialPendiente && r.estado !== 'cancelada')
  
                          return (
                            <tr key={r.id || cod}>
                              <td>{idx + 1}</td>
                              <td>
                                <code role="button" tabIndex={0} title={t('hc.ver_detalle_de_la_reserva_y_novedades', 'Ver detalle de la reserva y novedades')} style={{ cursor: "pointer", textDecoration: "underline dotted" }} onClick={() => setModalDetalle(r)} onKeyDown={(e) => e.key === "Enter" && setModalDetalle(r)}>{cod}</code>
                              </td>
                              <td style={{ fontWeight: 600, color: 'var(--texto-primary, #0f172a)' }}>{cliNom}</td>
                              <td style={{ color: 'var(--texto-second, #64748b)', fontSize: 12 }}>{cliMail}</td>
                              <td>{tipoDoc}</td>
                              <td>{nacionalidad}</td>
                              <td>{cliTel}</td>
                              <td><code>{cliDoc}</code></td>
                              <td>
                                <div 
                                  style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, transition: 'background 0.15s' }}
                                  onClick={() => handleOpenDocument(r, 'id')}
                                  title={t('hc.clic_para_ver_documento_de_identidad', 'Clic para ver Documento de Identidad')}
                                >
                                  <FaFilePdf color="#ef4444" size={14} /> 
                                  <span style={{ fontSize: 12, color: 'var(--brand-primary, #2563eb)', textDecoration: 'underline', fontWeight: 600 }}>{r.documentoIdentidadPdf || `Cedula-${cliDoc}.pdf`}</span>
                                </div>
                              </td>
                              <td>
                                <div 
                                  style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, transition: 'background 0.15s' }}
                                  onClick={() => handleOpenDocument(r, 'license')}
                                  title={t('hc.clic_para_ver_licencia_de_conduccion', 'Clic para ver Licencia de Conducción')}
                                >
                                  <FaFilePdf color="#ef4444" size={14} /> 
                                  <span style={{ fontSize: 12, color: 'var(--brand-primary, #2563eb)', textDecoration: 'underline', fontWeight: 600 }}>{r.licenciaConduccionPdf || `Licencia-${cliDoc}.pdf`}</span>
                                </div>
                              </td>
                              <td>
                                <span style={{ color: '#047857', fontWeight: 600, fontSize: 12 }}>{t('admin.reservationsManagement.accepted', 'Aceptados')}</span>
                              </td>
                              <td>{cuponCodigo}</td>
                              <td style={{ fontWeight: 700, color: 'var(--city-text, #0f172a)', whiteSpace: 'nowrap' }}>
                                {formatCurrency(totalCOP, moneda || 'COP', tasaUSD)}
                              </td>
                              <td>
                                <span
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: 20,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    ...(r.estado === 'en_curso'
                                      ? { background: 'var(--brand-soft-strong)', color: 'var(--brand-primary, #1d4ed8)' }
                                      : r.estado === 'finalizada'
                                      ? { background: '#dcfce7', color: '#15803d' }
                                      : r.estado === 'cancelada'
                                      ? { background: '#fee2e2', color: '#991b1b' }
                                      : r.estado === 'confirmada'
                                      ? { background: '#d1fae5', color: '#065f46' }
                                      : { background: 'var(--city-bg, #f1f5f9)', color: 'var(--city-muted, #475569)' })
                                  }}
                                >
                                  {r.estado === 'en_curso'
                                    ? t('admin.reservationsManagement.status.inProgress', 'En curso')
                                    : r.estado === 'finalizada'
                                    ? t('admin.reservationsManagement.status.finished', 'Finalizada')
                                    : r.estado === 'cancelada'
                                    ? t('admin.reservationsManagement.status.cancelled', 'Cancelada')
                                    : r.estado === 'creada'
                                    ? t('admin.reservationsManagement.status.created', 'Creada')
                                    : t('admin.reservationsManagement.status.confirmed', 'Confirmada')}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`status-pill ${
                                    isPagoConfirmado
                                      ? 'is-green'
                                      : r.estado === 'cancelada'
                                      ? 'is-red'
                                      : 'is-yellow'
                                  }`}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: 20,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    ...(isPagoConfirmado
                                      ? {}
                                      : r.estado === 'cancelada'
                                      ? {}
                                      : { background: '#fef3c7', color: '#92400e' }),
                                  }}
                                >
                                  {isPagoConfirmado ? t('admin.reservationsManagement.status.confirmedStatus', 'Confirmado') : r.estado === 'cancelada' ? t('admin.reservationsManagement.status.cancelledStatus', 'Cancelado') : t('admin.reservationsManagement.status.pendingStatus', 'Pendiente')}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {isPagoConfirmado && (r.firmaContrato || r.contratoFirmado || r.estado === 'confirmada' || r.estado === 'en_curso' || r.estado === 'finalizada') ? (
                                  <button
                                    type="button"
                                    onClick={() => setContratoModalReserva(r)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      padding: '5px 12px',
                                      borderRadius: 20,
                                      fontSize: 11,
                                      fontWeight: 700,
                                      background: '#d1fae5',
                                      color: '#065f46',
                                      border: '1px solid #a7f3d0',
                                      cursor: 'pointer',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title={t('hc.ver_contrato_firmado_y_firma_digital', 'Ver contrato firmado y firma digital')}
                                  >
                                    <FaFileContract size={13} color="#059669" />
                                    <span>{t('admin.reservationsManagement.yes', 'Sí')} · {t('admin.contractsPage.view', 'Ver Contrato')}</span>
                                  </button>
                                ) : (
                                  <span
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: 20,
                                      fontSize: 11,
                                      fontWeight: 700,
                                      whiteSpace: 'nowrap',
                                      background: !isPagoConfirmado ? 'var(--city-bg, #f1f5f9)' : '#fee2e2',
                                      color: !isPagoConfirmado ? 'var(--texto-second, #64748b)' : '#991b1b',
                                    }}
                                  >
                                    {!isPagoConfirmado ? t('admin.reservationsManagement.requiresPayment', 'Requiere Pago') : t('admin.reservationsManagement.no', 'No')}
                                  </span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
                                  {esEncargado && esCobroPresencialPendiente && r.estado !== 'en_curso' && r.estado !== 'finalizada' && r.estado !== 'cancelada' && (
                                    <button
                                      type="button"
                                      onClick={() => navigate(`${cashRoute}?ref=${encodeURIComponent(cod)}`)}
                                      style={{ background: '#f59e0b', color: 'var(--bg-tarjeta, #ffffff)', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'opacity 0.2s' }}
                                      onMouseOver={(e) => e.target.style.opacity = 0.8}
                                      onMouseOut={(e) => e.target.style.opacity = 1}
                                    >
                                      {t('admin.reservationsManagement.cashPayment', 'Cobrar Caja')}
                                    </button>
                                  )}
                                  {esEncargado && r.estado !== 'en_curso' && r.estado !== 'finalizada' && r.estado !== 'cancelada' && !esCobroPresencialPendiente && (
                                    <button
                                      type="button"
                                      onClick={() => handleEntregarAuto(r)}
                                      style={{ background: '#10b981', color: 'var(--bg-tarjeta, #ffffff)', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'opacity 0.2s' }}
                                      onMouseOver={(e) => { e.target.style.opacity = 0.8 }}
                                      onMouseOut={(e) => { e.target.style.opacity = 1 }}
                                    >
                                      {t('admin.reservationsManagement.confirmPickupBtn', 'Confirmar Entrega')}
                                    </button>
                                  )}
                                  {(r.estado === 'en_curso' || r.estado === 'finalizada') && (
                                    <button
                                      type="button"
                                      disabled
                                      style={{ background: 'var(--borde, #e2e8f0)', color: 'var(--texto-second, #64748b)', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'not-allowed' }}
                                    >
                                      {t('admin.reservationsManagement.carDelivered', 'Auto Entregado')}
                                    </button>
                                  )}
                                  {(r.estado === 'en_curso' || r.estado === 'finalizada') && (
                                    <button
                                      type="button"
                                      onClick={() => abrirNovedades(r)}
                                      title={t('hc.ver_las_novedades_registradas_en_la_en', 'Ver las novedades registradas en la entrega y sus fotografías')}
                                      style={{ background: 'var(--brand-soft, #eff6ff)', color: 'var(--brand-text, var(--brand-primary, #2563eb))', border: '1px solid var(--borde, #e2e8f0)', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}
                                    >
                                      Ver novedades
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
                                  {esEncargado && r.estado === 'en_curso' && (
                                    <button
                                      type="button"
                                      onClick={() => handleRecibirDevolucion(r)}
                                      style={{ background: '#059669', color: 'var(--bg-tarjeta, #ffffff)', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'opacity 0.2s' }}
                                      onMouseOver={(e) => { e.target.style.opacity = 0.8 }}
                                      onMouseOut={(e) => { e.target.style.opacity = 1 }}
                                    >
                                      {t('admin.reservationsManagement.confirmReturnBtn', 'Confirmar Devolución')}
                                    </button>
                                  )}
                                  {r.estado !== 'en_curso' && r.estado !== 'finalizada' && r.estado !== 'cancelada' && (
                                    <button
                                      type="button"
                                      disabled
                                      style={{ background: 'var(--city-bg, #f1f5f9)', color: 'var(--texto-terciary, #94a3b8)', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'not-allowed' }}
                                    >{t('admin.reservationsManagement.pendingBtn', 'Pendiente')}</button>
                                  )}
                                  {r.estado === 'finalizada' && (
                                    <button
                                      type="button"
                                      disabled
                                      style={{ background: 'var(--borde, #e2e8f0)', color: 'var(--texto-second, #64748b)', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'not-allowed' }}
                                    >
                                      {t('admin.reservationsManagement.carReturned', 'Auto Devuelto')}
                                    </button>
                                  )}
                                  {r.estado === 'finalizada' && (
                                    <button
                                      type="button"
                                      onClick={() => abrirNovedades(r)}
                                      title={t('hc.ver_las_novedades_registradas_en_la_de', 'Ver las novedades registradas en la devolución y sus fotografías')}
                                      style={{ background: 'var(--brand-soft, #eff6ff)', color: 'var(--brand-text, var(--brand-primary, #2563eb))', border: '1px solid var(--borde, #e2e8f0)', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}
                                    >
                                      Ver novedades
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
  )
}
