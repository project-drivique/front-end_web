import logo from '@/assets/logo.png'
import { FaEyeSlash, FaEye, FaWhatsapp, FaChevronDown } from 'react-icons/fa'

export default function EsDomicilio({ brand, ciudadPago, domicilioConductor, domicilioDevolucion, domicilioEstado, domicilioPin, domicilioRetiro, domicilioTelefonoConductor, esDomicilioDevolucion, esDomicilioRetiro, formatHoraAmPm, reserva, reservaOriginal, revelarPin, setRevelarPin, setVerMasDomicilio, t, verMasDomicilio }) {
  return (
    <div className="modal-wompi-card" style={{ marginTop: '16px', textAlign: 'left' }}>
              <div className="modal-wompi-subcard" style={{ padding: '22px 20px 20px', alignItems: 'center' }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--borde, #e2e8f0)', textAlign: 'center' }}>
                  <h3 className="modal-wompi-titulo" style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--texto-primary)' }}>
                    {t('reservas.homeCardTitle', 'Domicilio')}
                  </h3>
                  <p className="modal-wompi-desc" style={{ fontSize: '12px', margin: '3px 0 0', textAlign: 'center', color: 'var(--texto-second)' }}>
                    {t('reservas.homeCardSubtitle', 'Código de seguridad para validación al momento de la entrega.')}
                  </p>
                </div>
  
                {/* 1. LOGO ANTES DEL CÓDIGO (logo.png) */}
                <div className="modal-cash-logo-badge" style={{ marginBottom: '14px', width: '80px', height: '80px', padding: '12px' }}>
                  <img
                    src={brand?.logoDataUrl || logo}
                    alt={brand?.name || 'Drivique'}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
  
                {/* 2. CÓDIGO NEQUI (SIN TIEMPO DE VENCIMIENTO) + OJO DE MOSTRAR/OCULTAR */}
                <div className="modal-wompi-total-box" style={{ width: '100%', padding: '16px 18px', marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="nequi-pin-boxes">
                      {/* El código de entrega tiene 6 caracteres: se muestran todos, igual que en el correo del conductor */}
                      {String(domicilioPin || '------').split('').map((char, i) => (
                        <div key={i} className="nequi-pin-box">
                          {revelarPin ? char : '•'}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setRevelarPin(v => !v)}
                      style={{ border: 'none', background: 'transparent', color: 'var(--texto-second, #64748b)', cursor: 'pointer', padding: '6px', fontSize: '20px', display: 'grid', placeItems: 'center' }}
                      title={revelarPin ? t('hc2.ocultar_codigo', 'Ocultar Código') : t('hc2.ver_codigo', 'Ver Código')}
                    >
                      {revelarPin ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
  
                  <span style={{ fontSize: '11.5px', color: 'var(--texto-second)', textAlign: 'center', fontWeight: 500 }}>
                    {t('reservas.homeCardHint', 'Confírmale este código al conductor encargado de entregar el vehículo.')}
                  </span>
                </div>
  
                {/* 3. INFORMACIÓN COMPLETA UNIFICADA EN UNA SOLA TARJETA BLANCA CON DESPLEGABLE */}
                <div style={{
                  width: '100%',
                  background: 'var(--bg-tarjeta, #ffffff)',
                  borderRadius: '14px',
                  border: '1px solid var(--borde, #e2e8f0)',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '16px',
                  textAlign: 'left'
                }}>
                  {/* Ciudad */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--texto-second, #64748b)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      {t('reservas.homeCity', 'Ciudad')}:
                    </span>
                    <strong style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--texto-primary)' }}>
                      {ciudadPago}
                    </strong>
                  </div>
  
                  <div style={{ borderTop: '1px solid var(--borde, #f1f5f9)' }} />
  
                  {/* Estado del Domicilio (Ubicado antes de Conductor Asignado) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--texto-second, #64748b)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      {t('reservas.homeStatus', 'Estado del domicilio')}:
                    </span>
                    <strong style={{
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: (domicilioEstado === 'ENTREGADO' || domicilioEstado === 'RECOGIDO')
                        ? '#047857'
                        : (domicilioEstado === 'EN_CAMINO' ? 'var(--brand-primary-hover)' : '#b45309')
                    }}>
                      {domicilioEstado === 'EN_PREPARACION' && t('reservas.homeStatusPreparing', 'En proceso')}
                      {domicilioEstado === 'EN_CAMINO' && t('reservas.homeStatusOnTheWay', 'Agente en camino')}
                      {domicilioEstado === 'ENTREGADO' && t('reservas.homeStatusDelivered', 'Entregado')}
                      {domicilioEstado === 'RECOGIDO' && t('reservas.homeStatusPickedUp', 'Recogido')}
                    </strong>
                  </div>
  
                  <div style={{ borderTop: '1px solid var(--borde, #f1f5f9)' }} />
  
                  {/* Conductor Asignado */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--texto-second, #64748b)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      {t('reservas.homeDriver', 'Conductor asignado')}:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '13.5px', fontWeight: 700, color: domicilioConductor ? 'var(--texto-primary)' : '#b45309' }}>
                        {domicilioConductor ? domicilioConductor : t('reservas.homeStatusPreparing', 'En proceso')}
                      </strong>
  
                      {domicilioTelefonoConductor && (
                        <a
                          href={`https://wa.me/${domicilioTelefonoConductor.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-reporte"
                          style={{ background: '#25d366', color: '#fff', border: 'none', textDecoration: 'none', padding: '6px 12px', fontSize: '11.5px', borderRadius: '8px', fontWeight: 800 }}
                        >
                          <FaWhatsapp size={13} /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
  
                  {/* Detalles completos desplegables (Información de Entrega y Recogida) */}
                  {verMasDomicilio && (
                    <>
                      <div style={{ borderTop: '1px solid var(--borde, #f1f5f9)' }} />
  
                      {/* Entrega a Domicilio */}
                      {esDomicilioRetiro && (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--texto-second, #64748b)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                              {t('reservas.homeDeliveryInfo', 'Información de entrega')}:
                            </span>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', color: 'var(--texto-second)' }}>{t('hc.direccion_exacta', 'Dirección Exacta:')}</span>
                              <strong style={{ fontSize: '13px', color: 'var(--texto-primary)' }}>{domicilioRetiro || t('reservas.homeToArrange', 'A convenir')}</strong>
                            </div>
                            {(reserva.domicilioBarrio || reservaOriginal?.domicilioBarrio) && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: 'var(--texto-second)' }}>{t('reservas.homeNeighborhood', 'Barrio')}:</span>
                                <strong style={{ fontSize: '12.5px', color: 'var(--texto-primary)' }}>{reserva.domicilioBarrio || reservaOriginal?.domicilioBarrio}</strong>
                              </div>
                            )}
                            {(reserva.domicilioReferencias || reservaOriginal?.domicilioReferencias) && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: 'var(--texto-second)' }}>{t('reservas.homeReferences', 'Indicaciones / Ref.')}</span>
                                <strong style={{ fontSize: '12px', color: 'var(--texto-primary)' }}>{reserva.domicilioReferencias || reservaOriginal?.domicilioReferencias}</strong>
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', paddingTop: '4px', borderTop: '1px dashed var(--borde, #cbd5e1)' }}>
                              <span style={{ fontSize: '12px', color: 'var(--texto-second)' }}>{t('hc.hora_de_entrega_retiro', 'Hora de Entrega (Retiro):')}</span>
                              <strong style={{ fontSize: '13px', color: 'var(--texto-primary, #0f172a)' }}>{formatHoraAmPm(reserva.horaInicio) || 'N/A'}</strong>
                            </div>
                          </div>
                          {esDomicilioDevolucion && <div style={{ borderTop: '1px solid var(--borde, #f1f5f9)' }} />}
                        </>
                      )}
  
                      {/* Recogida a Domicilio */}
                      {esDomicilioDevolucion && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--texto-second, #64748b)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                            {t('reservas.homePickupInfo', 'Información de recogida')}:
                          </span>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: 'var(--texto-second)' }}>{t('hc.direccion_exacta', 'Dirección Exacta:')}</span>
                            <strong style={{ fontSize: '13px', color: 'var(--texto-primary)' }}>{domicilioDevolucion || domicilioRetiro || t('reservas.homeToArrange', 'A convenir')}</strong>
                          </div>
                          {(reserva.domicilioDevolucionBarrio || reservaOriginal?.domicilioDevolucionBarrio || reserva.domicilioBarrio) && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', color: 'var(--texto-second)' }}>{t('reservas.homeNeighborhood', 'Barrio')}:</span>
                              <strong style={{ fontSize: '12.5px', color: 'var(--texto-primary)' }}>{reserva.domicilioDevolucionBarrio || reservaOriginal?.domicilioDevolucionBarrio || reserva.domicilioBarrio}</strong>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', paddingTop: '4px', borderTop: '1px dashed var(--borde, #cbd5e1)' }}>
                            <span style={{ fontSize: '12px', color: 'var(--texto-second)' }}>{t('hc.hora_de_recogida_devolucion', 'Hora de Recogida (Devolución):')}</span>
                            <strong style={{ fontSize: '13px', color: 'var(--texto-primary, #0f172a)' }}>{formatHoraAmPm(reserva.horaFin) || 'N/A'}</strong>
                          </div>
                        </div>
                      )}
                    </>
                  )}
  
                  {/* Botón Ver más / Ocultar detalles */}
                  <div style={{ borderTop: '1px solid var(--borde, #f1f5f9)', paddingTop: '6px', marginTop: '2px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setVerMasDomicilio(v => !v)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--brand-primary, #2563eb)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px'
                      }}
                    >
                      <span>{verMasDomicilio ? t('reservas.homeLessDetails', 'Ocultar detalles') : t('hc2.ver_mas_detalles', 'Ver más detalles')}</span>
                      <FaChevronDown style={{ transform: verMasDomicilio ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
  )
}
