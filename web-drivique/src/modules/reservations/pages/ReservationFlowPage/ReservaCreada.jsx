import logo from '@/assets/logo.png'
import { formatCurrency } from '@/utils/currencyUtils'

export default function ReservaCreada({ brand, c, moneda, navigate, reservaCreada, sucursalPago, t, vehiculo }) {
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
                  borderRadius: 24,
                  maxWidth: 400,
                  width: '100%',
                  padding: '30px 24px 24px',
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
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 12,
                    marginBottom: 16
                  }}>
                    <img
                      src={brand.logoDataUrl || logo}
                      alt={brand.name || 'Drivique'}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
  
                  {/* Titulo */}
                  <h2 style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: c.textPrimary || '#0f172a',
                    margin: '0 0 8px',
                    letterSpacing: '-0.01em'
                  }}>
                    {t('vehiculo.cashPaymentTitle', { defaultValue: 'Pago en sucursal' })}
                  </h2>
  
                  {/* Subtitulo */}
                  <p style={{
                    fontSize: 12.5,
                    color: c.textSecondary || '#64748b',
                    lineHeight: 1.5,
                    margin: '0 0 18px',
                    padding: '0 4px'
                  }}>
                    {t('vehiculo.cashReservationRegisteredDesc', {
                      defaultValue: `Tu reserva quedó registrada. Para confirmarla, realiza el pago en efectivo en el punto autorizado ${sucursalPago}.`,
                      sucursal: sucursalPago
                    })}
                  </p>
  
                  {/* Tarjeta de Resumen */}
                  <div style={{
                    width: '100%',
                    background: c.isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                    border: `1px solid ${c.cardBorder || '#e2e8f0'}`,
                    borderRadius: 14,
                    padding: '14px 16px',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginBottom: 14,
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                      <span style={{ color: c.textPrimary || '#1e293b', fontWeight: 700 }}>Referencia:</span>
                      <span style={{
                        fontWeight: 400,
                        color: c.textPrimary || '#0f172a',
                        fontSize: 12.5,
                        letterSpacing: '0.02em'
                      }}>
                        {reservaCreada.referencia}
                      </span>
                    </div>
  
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                      <span style={{ color: c.textPrimary || '#1e293b', fontWeight: 700 }}>{t('hc.sucursal', 'Sucursal:')}</span>
                      <span style={{ fontWeight: 400, color: c.textPrimary || '#0f172a' }}>
                        {sucursalPago}
                      </span>
                    </div>
  
                    <div style={{ height: 1, background: c.cardBorder || '#e2e8f0', margin: '12px 0' }} />
  
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        color: c.textSecondary || '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        TOTAL A PAGAR:
                      </span>
                      <span style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: 'var(--brand-primary, #1D4ED8)'
                      }}>
                        {formatCurrency(reservaCreada.total, moneda)}
                      </span>
                    </div>
                  </div>
  
                  {/* Tarjeta de Advertencia Plazo */}
                  <div style={{
                    width: '100%',
                    background: '#FEFCE8',
                    border: '1.5px solid #FDE047',
                    borderRadius: 14,
                    padding: '12px 16px',
                    textAlign: 'left',
                    marginBottom: 18,
                    boxSizing: 'border-box'
                  }}>
                    <p style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#854D0E',
                      margin: '0 0 4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      PLAZO PARA PAGAR
                    </p>
                    <p style={{
                      fontSize: 11.5,
                      color: '#713F12',
                      margin: 0,
                      lineHeight: 1.45,
                      fontWeight: 400
                    }}>
                      Tienes aproximadamente {reservaCreada?.horasLimitePago || 8} horas desde ahora para acercarte a la sucursal y realizar el pago. Si no realizas el pago dentro de este plazo, la reserva se cancelará automáticamente.
                    </p>
                  </div>
  
                  {/* Botones de Accion */}
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          if (vehiculo?.id) {
                            sessionStorage.removeItem(`drivique_reservation_state_${vehiculo.id}`)
                          }
                        } catch (err) {
                          console.error(err)
                        }
                        navigate('/reservas')
                      }}
                      style={{
                        width: '100%',
                        height: 46,
                        borderRadius: 12,
                        background: 'var(--brand-primary, #1D4ED8)',
                        color: 'var(--brand-on-primary, #ffffff)',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: 'pointer',
                        boxShadow: '0 6px 16px var(--brand-shadow, rgba(var(--brand-primary-rgb), 0.25))',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      Ir a Mis Reservas
                    </button>
  
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          if (vehiculo?.id) {
                            sessionStorage.removeItem(`drivique_reservation_state_${vehiculo.id}`)
                          }
                        } catch (err) {
                          console.error(err)
                        }
                        navigate('/home')
                      }}
                      style={{
                        width: '100%',
                        height: 44,
                        borderRadius: 12,
                        background: c.cardBg || '#ffffff',
                        color: c.textPrimary || '#0f172a',
                        border: `1.5px solid ${c.cardBorder || '#e2e8f0'}`,
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      Volver al Inicio
                    </button>
                  </div>
                </div>
              </div>
  )
}
