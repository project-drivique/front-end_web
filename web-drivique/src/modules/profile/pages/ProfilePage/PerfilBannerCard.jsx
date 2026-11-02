import { FaUser, FaEdit } from 'react-icons/fa'

function iniciales(nombre = '', apellido = '', correo = '') {
  const n = (nombre || '').trim()[0] ?? ''
  const a = (apellido || '').trim()[0] ?? ''
  if (n || a) return (n + a).toUpperCase()
  if (correo) return (correo || '').trim()[0].toUpperCase()
  return 'U'
}

export default function PerfilBannerCard({ esModoOscuro, esPerfilIncompleto, habilitarEdicion, modoEdicion, t, tieneNombre, usuario }) {
  return (
    <div
              className="perfil-banner-card"
              style={{
                background: esModoOscuro
                  ? 'linear-gradient(135deg, var(--brand-secondary) 0%, var(--brand-secondary) 100%)'
                  : 'linear-gradient(135deg, var(--brand-secondary) 0%, var(--brand-primary) 100%)',
                borderRadius: '16px',
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '24px',
                boxShadow: esModoOscuro ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(var(--brand-secondary-rgb), 0.25)',
              }}
            >
              {/* Formas Geométricas Decorativas de Fondo (Círculos Traslúcidos Elegantes) */}
              <div
                style={{
                  position: 'absolute',
                  right: '-60px',
                  top: '-80px',
                  width: '360px',
                  height: '360px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.07)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: '90px',
                  top: '-120px',
                  width: '260px',
                  height: '260px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  pointerEvents: 'none',
                }}
              />
  
              {/* Avatar en Círculo Blanco / Cristal */}
              <div
                className="perfil-banner-avatar"
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#ffffff',
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                {iniciales(usuario.nombre, usuario.apellido, usuario.correo)}
              </div>
              
              {/* Info de Nombre, Correo y Rol */}
              <div style={{ zIndex: 1 }}>
                {tieneNombre ? (
                  <>
                    <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '0 0 3px', letterSpacing: '-0.01em' }}>
                      {`${usuario.nombre || ''} ${usuario.apellido || ''}`.trim()}
                    </h1>
                    <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', margin: '0 0 8px', fontWeight: 500 }}>
                      {usuario.correo}
                    </p>
                  </>
                ) : (
                  <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
                    {usuario.correo}
                  </h1>
                )}
                <span
                  className="perfil-banner-user-tag"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 12px',
                    borderRadius: '20px',
                    textTransform: 'capitalize',
                  }}
                >
                  <FaUser style={{ fontSize: '9px' }} />
                  {t('perfil.roles.' + (usuario.rol || 'usuario').toLowerCase(), 'Usuario')}
                </span>
              </div>
  
              <div style={{ flex: 1 }} />
  
              {!modoEdicion && (
                <button
                  type="button"
                  className="btn-editar-perfil-banner"
                  onClick={habilitarEdicion}
                  style={{
                    padding: '11px 24px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    color: 'var(--brand-secondary, #1e3a8a)',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 150ms ease',
                    zIndex: 1,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)'
                  }}
                >
                  <FaEdit style={{ fontSize: '13px', color: 'inherit' }} />
                  <span>
                    {esPerfilIncompleto
                      ? t('perfil.completeProfileBtn', 'Completar perfil')
                      : t('perfil.editProfileBtn', 'Editar perfil')}
                  </span>
                </button>
              )}
            </div>
  )
}
