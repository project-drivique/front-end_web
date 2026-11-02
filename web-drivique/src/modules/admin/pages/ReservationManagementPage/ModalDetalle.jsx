import { FaCar, FaShieldAlt, FaUser, FaMoneyBillWave, FaHistory } from 'react-icons/fa'
import { formatCurrency } from '../../../../utils/currencyUtils'
import InspectionNovelties from '../../components/InspectionNovelties'

export default function ModalDetalle({ cashRoute, modalDetalle, moneda, navigate, setModalDetalle, t, tasaUSD }) {
  return (
    <div
            className="cities-modal-backdrop"
            onMouseDown={(e) => e.target === e.currentTarget && setModalDetalle(null)}
          >
            <section className="cities-modal reserva-detail-modal" role="dialog">
              <div className="cities-modal__head">
                <div>
                  <p className="cities-eyebrow">{t('admin.reservationsManagement.subtitle', 'GESTIÓN DE SUCURSAL')}</p>
                  <h2>{modalDetalle.codigo}</h2>
                </div>
                <button type="button" onClick={() => setModalDetalle(null)}>
                  á—
                </button>
              </div>
  
              {/* â”€â”€ ESTRUCTURA DE LOS 3 PASOS DEL FLUJO DE RESERVA â”€â”€ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* PASO 1: SELECCIÓN DE VEHÍCULO, FECHAS Y SUCURSALES */}
                <div className="reserva-detail-card-box" style={{ borderLeft: '4px solid var(--brand-primary, #2563eb)' }}>
                  <h4 style={{ color: 'var(--brand-primary, #2563eb)', margin: '0 0 12px', fontSize: 14 }}>
                    <FaCar /> PASO 1: Selección de Vehículo, Fechas y Sucursal
                  </h4>
                  
                  {modalDetalle.vehiculoImagen && (
                    <div style={{ marginBottom: 12 }}>
                      <img
                        src={modalDetalle.vehiculoImagen}
                        alt={modalDetalle.vehiculoNombre}
                        style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--city-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                      />
                    </div>
                  )}
  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="reserva-detail-field">
                      <small>{t('admin.reservationsManagement.detailModal.associatedVehicle', 'Vehículo Asociado:')}</small>
                      <strong>{modalDetalle.vehiculoNombre}</strong>
                    </div>
                    <div className="reserva-detail-field">
                      <small>{t('admin.reservationsManagement.detailModal.plate', 'Placa del Auto:')}</small>
                      <span style={{ display: 'inline-block', background: 'var(--city-bg, #f1f5f9)', border: '1px solid var(--borde, #cbd5e1)', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                        {modalDetalle.vehiculoPlaca || 'KLS-849'}
                      </span>
                    </div>
                    <div className="reserva-detail-field">
                      <small>{t('admin.reservationsManagement.detailModal.pickupBranch', 'Sucursal de Retiro:')}</small>
                      <strong>{modalDetalle.sucursal || 'Bogotá - Calle 100'}</strong>
                    </div>
                    <div className="reserva-detail-field">
                      <small>{t('admin.reservationsManagement.detailModal.dropoffBranch', 'Sucursal de Devolución:')}</small>
                      <strong>{modalDetalle.reservaDetalles?.sucursalDevolucion || modalDetalle.sucursal || 'Bogotá - Calle 100'}</strong>
                    </div>
                    <div className="reserva-detail-field">
                      <small>{t('admin.reservationsManagement.detailModal.pickupDateTime', 'Fecha y Hora de Retiro:')}</small>
                      <strong style={{ color: '#047857' }}>{modalDetalle.fechaInicio?.replace('T', ' ')}</strong>
                    </div>
                    <div className="reserva-detail-field">
                      <small>{t('admin.reservationsManagement.detailModal.dropoffDateTime', 'Fecha y Hora de Devolución:')}</small>
                      <strong style={{ color: 'var(--brand-text)' }}>{modalDetalle.fechaFin?.replace('T', ' ')}</strong>
                    </div>
                  </div>
                </div>
  
                {/* PASO 2: SEGUROS, KILOMETRAJE Y SERVICIOS ADICIONALES */}
                <div className="reserva-detail-card-box" style={{ borderLeft: '4px solid #059669' }}>
                  <h4 style={{ color: '#059669', margin: '0 0 12px', fontSize: 14 }}>
                    <FaShieldAlt /> PASO 2: Cobertura, Kilometraje y Adicionales
                  </h4>
  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="reserva-detail-field">
                      <small>{t('admin.reservationsManagement.detailModal.insuranceCoverage', 'Cobertura de Seguro:')}</small>
                      <strong>{modalDetalle.reservaDetalles?.cobertura?.nombre || modalDetalle.cobertura || t('hc2.proteccion_estandar_cdw', 'Protección Estándar CDW')}</strong>
                    </div>
  
                    <div className="reserva-detail-field">
                      <small>{t('admin.reservationsManagement.detailModal.mileageType', 'Tipo de Kilometraje:')}</small>
                      <strong>{modalDetalle.reservaDetalles?.kilometraje || modalDetalle.kilometraje || 'Ilimitado'}</strong>
                    </div>
  
                    <div className="reserva-detail-field" style={{ gridColumn: 'span 2' }}>
                      <small>{t('admin.reservationsManagement.detailModal.additionalServices', 'Servicios Adicionales Contratados:')}</small>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                        {(modalDetalle.reservaDetalles?.serviciosAdicionales?.length > 0) ? (
                          modalDetalle.reservaDetalles.serviciosAdicionales.map((s, idx) => (
                            <span key={idx} style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
                              {typeof s === 'string' ? s : s.nombre}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--city-muted, #94a3b8)', fontSize: 12, italic: 'true' }}>
                            No aplicó servicios adicionales
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
  
                {/* PASO 3: DATOS DEL CLIENTE, TÉRMINOS, CUPONES Y PAGO */}
                <div className="reserva-detail-card-box" style={{ borderLeft: '4px solid var(--brand-primary, #2563eb)' }}>
                  <h4 style={{ color: 'var(--brand-primary, #2563eb)', margin: '0 0 12px', fontSize: 14 }}>
                    <FaUser /> PASO 3: Cliente, Términos, Cupones y Gestión de Pago
                  </h4>
  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div className="reserva-detail-field">
                      <small>{t('admin.reservationsManagement.detailModal.clientName', 'Nombre del Cliente / Titular:')}</small>
                      <strong>{modalDetalle.clienteNombre}</strong>
                    </div>
                    <div className="reserva-detail-field">
                      <small>{t('admin.reservationsManagement.detailModal.documentId', 'Cédula / Documento Identidad:')}</small>
                      <strong>{modalDetalle.clienteDocumento || ''}</strong>
                    </div>
                    <div className="reserva-detail-field">
                      <small>{t('admin.reservationsManagement.detailModal.email', 'Correo Electrónico:')}</small>
                      <strong>{modalDetalle.clienteCorreo}</strong>
                    </div>
                    <div className="reserva-detail-field">
                      <small>{t('admin.reservationsManagement.detailModal.phone', 'Teléfono de Contacto:')}</small>
                      <strong>{modalDetalle.clienteTelefono}</strong>
                    </div>
                    <div className="reserva-detail-field">
                      <small>{t('admin.reservationsManagement.detailModal.terms', 'Términos y Condiciones:')}</small>
                      <span style={{ color: '#047857', fontWeight: 700, fontSize: 12 }}>
                        âœ“ Aceptados por el cliente
                      </span>
                    </div>
                    <div className="reserva-detail-field">
                      <small>{t('admin.reservationsManagement.detailModal.discountCoupon', 'Cupón de Descuento:')}</small>
                      <strong>
                        {modalDetalle.cuponCodigo || modalDetalle.reservaDetalles?.cuponAplicado
                          ? t('hc3.coupon_applied', { defaultValue: 'Aplicó ({{codigo}})', codigo: modalDetalle.cuponCodigo || 'DRIVIQUE2026' })
                          : t('hc2.no_aplico', 'No aplicó')}
                      </strong>
                    </div>
                  </div>
  
                  {/* Bloque Financiero y Pago por ID Único */}
                  <div style={{ background: 'var(--city-soft, var(--bg-seccion1, #f8fafc))', padding: 14, borderRadius: 12, border: '1px solid var(--adm-border, var(--borde, #cbd5e1))', marginTop: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                      <div>
                        <small style={{ color: 'var(--city-muted)', fontSize: 11 }}>{t('admin.reservationsManagement.detailModal.uniqueId', 'ID Único de Reserva:')}</small>
                        <strong style={{ display: 'block', fontSize: 14, color: 'var(--brand-primary, #2563eb)' }}>{modalDetalle.codigo}</strong>
                      </div>
                      <div>
                        <small style={{ color: 'var(--city-muted)', fontSize: 11 }}>{t('admin.reservationsManagement.detailModal.totalAmount', 'Monto Total Reserva:')}</small>
                        <strong style={{ display: 'block', fontSize: 15, color: 'var(--city-text)' }}>{formatCurrency(modalDetalle.totalCOP, moneda, tasaUSD)}</strong>
                      </div>
                      <div>
                        <small style={{ color: 'var(--city-muted)', fontSize: 11 }}>{t('admin.reservationsManagement.detailModal.paymentMethod', 'Medio de Pago:')}</small>
                        <strong style={{ display: 'block', fontSize: 12 }}>
                          {modalDetalle.reservaDetalles?.metodoPago?.includes('efectivo') ? t('hc2.pago_presencial_en_sucursal', 'Pago Presencial en Sucursal') : 'Wompi - Pasarela Digital'}
                        </strong>
                      </div>
                      <div>
                        <small style={{ color: 'var(--city-muted)', fontSize: 11 }}>{t('admin.reservationsManagement.detailModal.paymentStatus', 'Estado del Pago:')}</small>
                        <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: modalDetalle.pagoEstado === 'aprobado' || modalDetalle.metodoPagoConfirmado ? '#ecfdf5' : '#fffbe1', color: modalDetalle.pagoEstado === 'aprobado' || modalDetalle.metodoPagoConfirmado ? '#047857' : '#b45309' }}>
                          {modalDetalle.pagoEstado === 'aprobado' || modalDetalle.metodoPagoConfirmado ? t('hc2.pago_recibido', 'Pago Recibido') : t('hc5.not_received', 'No Recibido')}
                        </span>
                      </div>
                    </div>
  
                    {/* Botón Condicional de Confirmación de Cobro en Caja */}
                    {(!modalDetalle.metodoPagoConfirmado && modalDetalle.pagoEstado !== 'aprobado' && modalDetalle.reservaDetalles?.metodoPago?.includes('efectivo')) && (
                      <button
                        type="button"
                        className="cities-primary"
                        onClick={() => {
                          setModalDetalle(null)
                          navigate(`${cashRoute}?ref=${encodeURIComponent(modalDetalle.codigo)}`)
                        }}
                        style={{ width: '100%', marginTop: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', background: '#047857', borderRadius: 10, color: 'var(--bg-tarjeta, #ffffff)', fontWeight: 800, fontSize: 12, border: 'none', cursor: 'pointer' }}
                      >
                        <FaMoneyBillWave /> Confirmar Cobro en Caja (Sucursal)
                      </button>
                    )}
                  </div>
                </div>
              </div>
  
              <InspectionNovelties reserva={modalDetalle} formatMoney={(value) => formatCurrency(value, moneda || 'COP', tasaUSD)} />
  
              {/* Gestión de Logística a Domicilio (Encargado de Sucursal) */}
              {(modalDetalle.sucursalRetiro === 'domicilio' || modalDetalle.sucursalDevolucion === 'domicilio' || modalDetalle.domicilioDireccion) && (
                <div className="reserva-detail-card-box" style={{ background: 'var(--city-bg-sub, var(--bg-seccion1, #f8fafc))', border: '1.5px solid var(--brand-border-light, var(--borde, #cbd5e1))' }}>
                  <h4 style={{ color: 'var(--brand-primary, #2563eb)' }}>
                    Gestión de Logística a Domicilio (Sucursal)
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    {modalDetalle.domicilioDireccion && (
                      <div className="reserva-detail-field">
                        <small>{t('hc.direccion_de_entrega_retiro', 'Dirección de Entrega (Retiro):')}</small>
                        <strong>{modalDetalle.domicilioDireccion}</strong>
                        {modalDetalle.domicilioBarrio && <small style={{ color: 'var(--city-muted)' }}>Barrio: {modalDetalle.domicilioBarrio}</small>}
                        {modalDetalle.domicilioReferencias && <small style={{ color: 'var(--city-muted)' }}>Ref: {modalDetalle.domicilioReferencias}</small>}
                      </div>
                    )}
                    {modalDetalle.domicilioDevolucionDireccion && (
                      <div className="reserva-detail-field">
                        <small>{t('hc.direccion_de_recogida_devolucion', 'Dirección de Recogida (Devolución):')}</small>
                        <strong>{modalDetalle.domicilioDevolucionDireccion}</strong>
                      </div>
                    )}
                    {(modalDetalle.domicilioPuntos || []).map((p) => (
                      <div key={p.id} className="reserva-detail-field">
                        <small>{p.tipo === 'PICKUP' ? t('hc2.conductor_de_la_entrega', 'Conductor de la entrega:') : t('hc2.conductor_de_la_devolucion', 'Conductor de la devolución:')}</small>
                        <strong>
                          {p.conductor
                            ? `${p.conductor}${p.conductorTelefono ? ` · ${p.conductorTelefono}` : ''}`
                            : t('hc2.sin_conductor_asignado', 'Sin conductor asignado')}
                        </strong>
                        <small style={{ color: 'var(--city-muted)' }}>
                          {t('hc5.status_label', 'Estado')}: {p.estado === 'COMPLETED' ? t('hc5.completed_m', 'Completado') : p.estado === 'ASSIGNED' ? t('hc5.assigned_m', 'Asignado') : t('hc5.pending_m', 'Pendiente')}
                        </small>
                      </div>
                    ))}
                    <small style={{ color: 'var(--city-muted)' }}>
                      El conductor se asigna y la entrega se confirma con el PIN del cliente en el módulo de Domicilios.
                    </small>
                  </div>
                </div>
              )}
  
              {/* Historial de Transiciones / Auditoría */}
              <div className="reserva-timeline-wrap">
                <h4 style={{ margin: '0 0 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FaHistory style={{ color: 'var(--brand-text)' }} /> {t('admin.reservationsManagement.detailModal.historyTitle')}
                </h4>
                <div style={{ maxHeight: 160, overflowY: 'auto' }}>
                  {(modalDetalle.historialAcciones || []).map((h, idx) => (
                    <div key={idx} className="reserva-timeline-item">
                      <div className="reserva-timeline-dot-wrap">
                        <div className="reserva-timeline-dot" />
                        {idx < modalDetalle.historialAcciones.length - 1 && (
                          <div className="reserva-timeline-line" />
                        )}
                      </div>
                      <div className="reserva-timeline-content">
                        <p>{h.accion}</p>
                        <small>
                          {h.usuario} ⬢ {new Date(h.fecha).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
  
              <div className="cities-modal__actions" style={{ marginTop: 20 }}>
                <button type="button" onClick={() => setModalDetalle(null)}>
                  {t('admin.reservationsManagement.detailModal.close')}
                </button>
              </div>
            </section>
          </div>
  )
}
