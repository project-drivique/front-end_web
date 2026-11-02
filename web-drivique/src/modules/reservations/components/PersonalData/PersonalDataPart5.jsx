import { formatCurrency } from '@/utils/currencyUtils'

export default function PersonalDataPart5({ c, handleConfirmarConCaptcha, moneda, procesando, setModalCancelar, t, total }) {
  return (
    <div style={{
          background: 'var(--brand-gradient)',
          borderRadius: 24,
          padding: '24px 28px',
          boxShadow: 'var(--brand-shadow)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
          color: '#ffffff'
        }}>
          {/* Left Column: Total to pay info */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            flex: '1 1 240px'
          }}>
            <span style={{
              fontSize: 12,
              fontWeight: 800,
              color: 'rgba(255, 255, 255, 0.9)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: '0 0 4px'
            }}>
              {t('vehiculo.totalToPay', 'TOTAL A PAGAR')}
            </span>
  
            <span style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              margin: '0 0 4px',
              letterSpacing: '-0.02em'
            }}>
              {formatCurrency(total, moneda)}
            </span>
  
            
          </div>
  
          {/* Right Column: Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            flex: '0 0 auto',
            width: '100%',
            maxWidth: 220
          }}>
            <button
              type="button"
              onClick={procesando ? undefined : handleConfirmarConCaptcha}
              disabled={procesando}
              style={{
                width: '100%',
                height: 44,
                background: '#ffffff',
                color: c?.accentText || 'var(--brand-secondary)',
                border: 'none',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 14,
                cursor: procesando ? 'not-allowed' : 'pointer',
                opacity: procesando ? 0.75 : 1,
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 16px',
                boxSizing: 'border-box'
              }}
              onMouseEnter={e => { if (!procesando) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { if (!procesando) e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {procesando ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{t('vehiculo.processingReserve', 'Confirmando reserva...')}</span>
                </span>
              ) : (
                t('vehiculo.confirmReserve', 'Confirmar reserva')
              )}
            </button>
  
            <button
              type="button"
              onClick={() => setModalCancelar(true)}
              style={{
                width: '100%',
                height: 44,
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 16px',
                boxSizing: 'border-box'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
            >
              {t('vehiculo.cancelReserve', 'Cancelar reserva')}
            </button>
          </div>
        </div>
  )
}
