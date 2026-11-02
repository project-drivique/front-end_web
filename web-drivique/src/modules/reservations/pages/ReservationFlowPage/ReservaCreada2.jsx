import logo from '@/assets/logo.png'
import { FaCreditCard, FaArrowRight } from 'react-icons/fa'

export default function ReservaCreada2({ brand, c, errorPago, handlePagarConWompi, navigate, redirigiendoPago, reservaCreada, t, vehiculo }) {
  return (
    <div style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(5px)',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16
              }}>
                <div style={{
                  background: c.cardBg || '#ffffff',
                  borderRadius: 28,
                  maxWidth: 400,
                  width: '100%',
                  padding: '32px 24px',
                  textAlign: 'center',
                  boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
                  border: `1px solid ${c.cardBorder || '#e2e8f0'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxSizing: 'border-box'
                }}>
                  {/* Logo Badge Circular */}
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 12,
                    marginBottom: 20
                  }}>
                    <img
                      src={brand.logoDataUrl || logo}
                      alt={brand.name || 'Drivique'}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
  
                  {/* Titulo */}
                  <h2 style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: c.textPrimary || '#0f172a',
                    margin: '0 0 12px',
                    letterSpacing: '-0.02em'
                  }}>
                    {reservaCreada.estado === 'PENDING_SCHEDULE'
                      ? t('hc2.reserva_registrada_fuera_de_horario', 'Reserva Registrada Fuera de Horario')
                      : t('vehiculo.reservationRegisteredTitle', 'Reserva Registrada')}
                  </h2>
  
                  {/* Subtitulo */}
                  <p style={{
                    fontSize: 13.5,
                    color: c.textSecondary || '#64748b',
                    lineHeight: 1.55,
                    margin: '0 0 28px',
                    padding: '0 8px',
                    fontWeight: 500
                  }}>
                    {(['PENDING_DOCUMENT_REVIEW', 'PENDIENTE_VALIDACION'].includes(reservaCreada?.estado) || reservaCreada?.status === 'PENDING_DOCUMENT_REVIEW')
                      ? t('hc6.docs_en_revision_texto', 'Tu reserva quedó guardada. La sucursal está revisando tus documentos: podrás pagar cuando los aprueben y te avisaremos por notificación.')
                      : reservaCreada.estado === 'PENDING_SCHEDULE'
                      ? t('hc2.tu_reserva_quedo_guardada_en_espera_de', 'Tu reserva quedó guardada en espera de la apertura de la sucursal. Te notificaremos al iniciar la jornada. Redirigiendo de una a Mis Reservas...')
                      : t('hc2.tu_reserva_quedo_guardada_como_pendien', 'Tu reserva quedó guardada como pendiente. Para confirmarla, completa el pago digital seguro con Wompi (Pruebas) y firma tu contrato para asegurar tu vehículo.')}
                  </p>
  
                  {/* Botones de Accion */}
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {reservaCreada.estado !== 'PENDING_SCHEDULE' && !(['PENDING_DOCUMENT_REVIEW', 'PENDIENTE_VALIDACION'].includes(reservaCreada?.estado) || reservaCreada?.status === 'PENDING_DOCUMENT_REVIEW') ? (
                      <>
                        <button
                          type="button"
                          onClick={handlePagarConWompi}
                          disabled={redirigiendoPago}
                          style={{
                            width: '100%',
                            height: 50,
                            borderRadius: 16,
                            background: redirigiendoPago ? '#94a3b8' : 'var(--brand-primary, #2563eb)',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: 15,
                            cursor: redirigiendoPago ? 'default' : 'pointer',
                            boxShadow: '0 6px 20px rgba(var(--brand-primary-rgb), 0.3)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10
                          }}
                        >
                          <FaCreditCard size={18} />
                          <span>{redirigiendoPago ? t('vehiculo.redirecting', 'Redirigiendo…') : t('hc2.pagar_con_wompi', 'Pagar con Wompi')}</span>
                        </button>
  
                        <button
                          type="button"
                          onClick={() => {
                            sessionStorage.removeItem(`drivique_reservation_state_${vehiculo.id}`)
                            navigate('/reservas')
                          }}
                          style={{
                            width: '100%',
                            height: 48,
                            borderRadius: 16,
                            background: c.cardBg || '#ffffff',
                            color: c.textPrimary || '#334155',
                            border: `1.5px solid ${c.cardBorder || '#e2e8f0'}`,
                            fontWeight: 700,
                            fontSize: 14.5,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          Pagar más tarde
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            sessionStorage.removeItem(`drivique_reservation_state_${vehiculo.id}`)
                            navigate('/reservas')
                          }}
                          style={{
                            width: '100%',
                            height: 50,
                            borderRadius: 16,
                            background: 'var(--brand-primary, #2563eb)',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: 15,
                            cursor: 'pointer',
                            boxShadow: '0 6px 20px rgba(var(--brand-primary-rgb), 0.3)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                          }}
                        >
                          <span>{reservaCreada.estado === 'PENDING_SCHEDULE' ? t('hc2.ir_a_mis_reservas_ahora', 'Ir a Mis Reservas ahora') : t('hc2.ir_a_mis_reservas', 'Ir a Mis Reservas')}</span>
                          <FaArrowRight size={14} />
                        </button>
  
                        <button
                          type="button"
                          onClick={() => {
                            sessionStorage.removeItem(`drivique_reservation_state_${vehiculo.id}`)
                            navigate('/home')
                          }}
                          style={{
                            width: '100%',
                            height: 48,
                            borderRadius: 16,
                            background: c.cardBg || '#ffffff',
                            color: c.textPrimary || '#334155',
                            border: `1.5px solid ${c.cardBorder || '#e2e8f0'}`,
                            fontWeight: 700,
                            fontSize: 14.5,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          Volver al Inicio
                        </button>
                      </>
                    )}
                  </div>
                  {errorPago && (
                    <p style={{ color: '#dc2626', fontSize: 13, fontWeight: 700, marginTop: 14 }}>
                      {errorPago}
                    </p>
                  )}
                </div>
              </div>
  )
}
