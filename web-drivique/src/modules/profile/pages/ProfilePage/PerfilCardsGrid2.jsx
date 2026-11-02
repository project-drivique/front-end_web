import ChangePassword from '../../components/ChangePassword'
import { FaBell, FaSlidersH, FaSignOutAlt, FaTrashAlt } from 'react-icons/fa'

export default function PerfilCardsGrid2({ c, esModoOscuro, handleCerrarSesion, setModalEliminarAbierto, setModalPreferenciasAbierto, t }) {
  return (
    <div className="perfil-cards-grid" style={{ marginTop: '24px' }}>
              
              {/* Tarjeta 4: Seguridad y Contraseña */}
              <ChangePassword c={c} esModoOscuro={esModoOscuro} />
  
              {/* Tarjeta 5: Preferencias de Entrega y Canales (HU-INT-17) */}
              <div
                style={{
                  background: c.innerCardBg,
                  borderRadius: '14px',
                  border: `1px solid ${c.innerCardBorder}`,
                  boxShadow: c.innerCardShadow,
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  flex: 1,
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ paddingBottom: '12px', borderBottom: `1px solid ${esModoOscuro ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)'}` }}>
                    <h2 style={{ fontSize: '15px', fontWeight: 700, color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', margin: 0, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaBell style={{ fontSize: '14px', color: 'var(--brand-primary, #2563eb)' }} />
                      {t('perfil.deliveryPreferences', 'Preferencias de Entrega')}
                    </h2>
                  </div>
  
                  <p style={{ fontSize: '13px', color: c.textMuted, margin: '14px 0 0', lineHeight: '1.45' }}>
                    {t('perfil.deliveryPreferencesHint', 'Administra tus canales de notificación (Correo, SMS, Push móvil, Web) y consentimiento comercial.')}
                  </p>
                </div>
  
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <button
                    type="button"
                    onClick={() => setModalPreferenciasAbierto(true)}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '10px',
                      background: 'var(--brand-gradient, var(--brand-primary, #2563eb))',
                      border: 'none',
                      color: 'var(--brand-on-primary, #ffffff)',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 150ms ease',
                      boxShadow: '0 4px 12px rgba(var(--brand-primary-rgb), 0.2)',
                    }}
                  >
                    <FaSlidersH style={{ fontSize: '12px' }} /> {t('perfil.configPreferencesBtn', 'Configurar canales')}
                  </button>
                </div>
              </div>
  
              {/* Tarjeta 5: Cerrar Sesión */}
              <div
                style={{
                  background: c.innerCardBg,
                  borderRadius: '14px',
                  border: `1px solid ${c.innerCardBorder}`,
                  boxShadow: c.innerCardShadow,
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  flex: 1,
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ paddingBottom: '12px', borderBottom: `1px solid ${esModoOscuro ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)'}` }}>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', margin: 0, letterSpacing: '-0.01em' }}>
                    {t('catalogo.logout', 'Cerrar Sesión')}
                  </h2>
                </div>
  
                <p style={{ fontSize: '13px', color: c.textMuted, margin: 0, lineHeight: '1.45' }}>
                  {t('perfil.logoutHint', 'Finaliza tu sesión activa actual en este dispositivo de forma segura.')}
                </p>
  
                <button
                  onClick={handleCerrarSesion}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: `1.5px solid ${esModoOscuro ? '#475569' : '#cbd5e1'}`,
                    color: c.title,
                    fontWeight: 600,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = esModoOscuro ? 'rgba(255,255,255,0.05)' : '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <FaSignOutAlt style={{ fontSize: '13px', color: c.textMuted }} /> {t('catalogo.logout', 'Cerrar sesión')}
                </button>
              </div>
  
              {/* Tarjeta 6: Eliminar Cuenta */}
              <div
                style={{
                  background: c.innerCardBg,
                  borderRadius: '14px',
                  border: `1px solid ${c.innerCardBorder}`,
                  boxShadow: c.innerCardShadow,
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  flex: 1,
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ paddingBottom: '12px', borderBottom: `1px solid ${esModoOscuro ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)'}` }}>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', margin: 0, letterSpacing: '-0.01em' }}>
                    {t('perfil.deleteAccountTitle', 'Eliminar Cuenta')}
                  </h2>
                </div>
  
                <p style={{ fontSize: '13px', color: c.textMuted, margin: 0, lineHeight: '1.45' }}>
                  {t('perfil.deleteAccountHint', 'Elimina permanentemente tu cuenta y todos tus datos guardados.')}
                </p>
  
                <button
                  onClick={() => setModalEliminarAbierto(true)}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '10px',
                    background: esModoOscuro ? 'rgba(239, 68, 68, 0.1)' : '#fff5f5',
                    border: `1.5px solid ${esModoOscuro ? 'rgba(239, 68, 68, 0.35)' : '#fecaca'}`,
                    color: esModoOscuro ? '#f87171' : '#dc2626',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = esModoOscuro ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'
                    e.currentTarget.style.borderColor = '#ef4444'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = esModoOscuro ? 'rgba(239, 68, 68, 0.1)' : '#fff5f5'
                    e.currentTarget.style.borderColor = esModoOscuro ? 'rgba(239, 68, 68, 0.35)' : '#fecaca'
                  }}
                >
                  <FaTrashAlt style={{ fontSize: '13px', color: esModoOscuro ? '#f87171' : '#dc2626' }} />
                  {t('perfil.deleteAccountBtn', 'Eliminar cuenta')}
                </button>
              </div>
            </div>
  )
}
