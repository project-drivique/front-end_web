export default function ReservationsPaymentBody({ paginatedReservations, setModalDetalle, setZoomImage, t }) {
  return (
    <tbody>
                        {paginatedReservations.map((r, idx) => {
                          const cod = r.codigo || r.referencia || `RES-${r.id}`
                          const rawMetodo = String(
                            r.reservaDetalles?.metodoPago ||
                            r.pasarela ||
                            r.metodoPagoConfirmado ||
                            r.metodoPago ||
                            ''
                          ).toLowerCase()
  
                          const esPagoEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal')
                          const textoMedioPago = esPagoEfectivo ? t('admin.reservationsManagement.cashPayment', 'Pago en efectivo') : t('admin.reservationsManagement.wompiPayment', 'Pago virtual con Wompi')
  
                          const branchRetiro = r.sucursal || 'Alquiler Neiva - Centro'
                          let lugarRetiroText = t('admin.reservationsManagement.pickupBranch', 'Recoger en Sucursal ({{branch}})', { branch: branchRetiro })
                          if (!esPagoEfectivo) {
                            if (r.sucursalRetiro === 'domicilio') lugarRetiroText = t('admin.reservationsManagement.pickupHome', 'Entrega a Domicilio')
                            else if (r.sucursalRetiro === 'aeropuerto') lugarRetiroText = t('admin.reservationsManagement.pickupAirport', 'Entrega en Aeropuerto')
                            else if (r.sucursalRetiro === 'terminal') lugarRetiroText = t('admin.reservationsManagement.pickupTerminal', 'Entrega en Terminal')
                          }
  
                          const branchDevolucion = r.sucursal || 'Alquiler Neiva - Centro'
                          let lugarDevolucionText = t('admin.reservationsManagement.dropoffBranch', 'Devolver en Sucursal ({{branch}})', { branch: branchDevolucion })
                          if (!esPagoEfectivo) {
                            if (r.sucursalDevolucion === 'domicilio') lugarDevolucionText = t('admin.reservationsManagement.dropoffHome', 'Devolución a Domicilio')
                            else if (r.sucursalDevolucion === 'aeropuerto') lugarDevolucionText = t('admin.reservationsManagement.dropoffAirport', 'Devolución en Aeropuerto')
                            else if (r.sucursalDevolucion === 'terminal') lugarDevolucionText = t('admin.reservationsManagement.dropoffTerminal', 'Devolución en Terminal')
                          }
  
  
                          const fInicioRaw = r.fechaInicio || ''
                          const fFinRaw = r.fechaFin || ''
                          const fechaRetiroVal = fInicioRaw.split('T')[0] || new Date().toISOString().slice(0, 10)
                          const fechaDevolucionVal = fFinRaw.split('T')[0] || new Date(new Date().getTime() + 86400000 * 3).toISOString().slice(0, 10)
  
                          const horaRetiroVal = r.horaInicio ? r.horaInicio : (fInicioRaw.includes('T') ? fInicioRaw.split('T')[1].slice(0, 5) : '9:00 a. m.')
                          const horaDevolucionVal = r.horaFin ? r.horaFin : (fFinRaw.includes('T') ? fFinRaw.split('T')[1].slice(0, 5) : '8:30 a. m.')
  
                          const duracionText = r.reservaDetalles?.duracionDias ? t('admin.reservationsManagement.durationDays', '{{count}} días', { count: r.reservaDetalles.duracionDias }) : t('admin.reservationsManagement.durationDays', '{{count}} días', { count: 4 })
                          const devAnticipadaText = r.reservaDetalles?.devolucionAnticipada || (r.devolucionAnticipada ? '3 días, 23 h 30 min' : t('admin.reservationsManagement.noEarlyReturn', 'No registra'))
  
                          return (
                            <tr key={r.id || cod}>
                              <td>{idx + 1}</td>
                              <td>
                                <code role="button" tabIndex={0} title={t('hc.ver_detalle_de_la_reserva_y_novedades', 'Ver detalle de la reserva y novedades')} style={{ cursor: "pointer", textDecoration: "underline dotted" }} onClick={() => setModalDetalle(r)} onKeyDown={(e) => e.key === "Enter" && setModalDetalle(r)}>{cod}</code>
                              </td>
                              <td>
                                {r.vehiculoImagen ? (
                                  <img
                                    src={r.vehiculoImagen}
                                    alt={r.vehiculoNombre || 'Auto'}
                                    title={t('hc.haz_clic_para_ver_foto_completa', 'Haz clic para ver foto completa')}
                                    onClick={() => setZoomImage({ url: r.vehiculoImagen, title: t('hc3.zoom_title', { defaultValue: '{{nombre}} ({{placa}})', nombre: r.vehiculoNombre || t('hc3.vehicle_word', 'Vehículo'), placa: r.vehiculoPlaca || t('hc3.plate_word', 'Placa') }) })}
                                    style={{
                                      width: 48,
                                      height: 34,
                                      borderRadius: 8,
                                      objectFit: 'cover',
                                      border: '1px solid var(--borde, #cbd5e1)',
                                      display: 'block',
                                      cursor: 'pointer',
                                    }}
                                  />
                                ) : (
                                  <span style={{ fontSize: 12, color: 'var(--texto-terciary, #94a3b8)' }}>—</span>
                                )}
                              </td>
                              <td style={{ fontWeight: 700, color: 'var(--texto-primary, #0f172a)' }}>
                                {r.vehiculoNombre || 'Renault Sandero 2023'}
                              </td>
                              <td>
                                <code>{r.vehiculoPlaca || 'KLS-849'}</code>
                              </td>
                              <td style={{ fontWeight: 600, color: esPagoEfectivo ? '#b45309' : '#047857' }}>
                                {textoMedioPago}
                              </td>
                              <td>{lugarRetiroText}</td>
                              <td>{lugarDevolucionText}</td>
                              <td style={{ fontWeight: 600 }}>{fechaRetiroVal}</td>
                              <td style={{ fontWeight: 600 }}>{fechaDevolucionVal}</td>
                              <td>{horaRetiroVal}</td>
                              <td>{horaDevolucionVal}</td>
                              <td>{duracionText}</td>
                              <td style={{ fontSize: 12, color: r.devolucionAnticipada ? 'var(--brand-primary)' : '#94a3b8' }}>
                                {devAnticipadaText}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
  )
}
