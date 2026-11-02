export default function ModalCancelar({ c, navigate, onCancelar, setModalCancelar, t }) {
  return (
    <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16
            }}
            onClick={() => setModalCancelar(false)}
          >
            <div
              style={{
                background: c?.cardBg || '#ffffff',
                borderRadius: 20,
                maxWidth: 360,
                width: '100%',
                padding: '28px 24px 22px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                border: `1px solid ${c?.isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Warning Icon Badge */}
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: c?.isDark ? 'rgba(var(--brand-primary-rgb), 0.15)' : 'var(--brand-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={c?.isDark ? 'var(--brand-accent)' : 'var(--brand-primary-hover)'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2.4" />
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="3" />
                </svg>
              </div>
  
              {/* Title */}
              <h3 style={{
                margin: '0 0 8px',
                fontSize: 17,
                fontWeight: 800,
                color: c?.textPrimary || '#0f172a',
                letterSpacing: '-0.01em'
              }}>
                {t('vehiculo.cancelModalTitle', '¿Cancelar proceso de reserva?')}
              </h3>
  
              {/* Description */}
              <p style={{
                margin: '0 0 22px',
                fontSize: 12.5,
                color: c?.textSecondary || '#64748b',
                lineHeight: 1.45,
                maxWidth: 290
              }}>
                {t('vehiculo.cancelModalDesc', 'Se descartarán los datos ingresados en este proceso y regresarás al catálogo de vehículos.')}
              </p>
  
              {/* Buttons Row */}
              <div style={{
                display: 'flex',
                gap: 10,
                width: '100%'
              }}>
                <button
                  type="button"
                  onClick={() => setModalCancelar(false)}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 10,
                    border: `2px solid ${c?.isDark ? 'var(--brand-accent)' : 'var(--brand-primary-hover)'}`,
                    background: 'transparent',
                    color: c?.isDark ? 'var(--brand-border)' : 'var(--brand-primary-hover)',
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = c?.isDark ? 'rgba(var(--brand-accent-rgb), 0.1)' : 'var(--brand-soft)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {t('vehiculo.cancelModalNo', 'No, continuar')}
                </button>
  
                <button
                  type="button"
                  onClick={() => {
                    setModalCancelar(false);
                    if (onCancelar) {
                      onCancelar();
                    } else {
                      navigate('/catalogo');
                    }
                  }}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 10,
                    border: 'none',
                    background: c?.isDark ? 'var(--brand-primary)' : 'var(--brand-primary-hover)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-primary-active)'}
                  onMouseLeave={e => e.currentTarget.style.background = c?.isDark ? 'var(--brand-primary)' : 'var(--brand-primary-hover)'}
                >
                  {t('vehiculo.cancelModalYes', 'Sí, cancelar reserva')}
                </button>
              </div>
            </div>
          </div>
  )
}
