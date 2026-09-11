import { useTranslation } from 'react-i18next'
import { useLanding } from '@/modules/landing/LandingContext'
import logo from '@/assets/logocatalog.png'
import { useBrand } from '@/contexts/BrandContext'

export default function PanelIzquierdo({ isModal = false }) {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'
  const { brand } = useBrand()

  const bgPanel = esModoOscuro
    ? 'linear-gradient(160deg, color-mix(in srgb,var(--brand-secondary) 48%,#070b12) 0%, color-mix(in srgb,var(--brand-secondary) 66%,#0f172a) 55%, color-mix(in srgb,var(--brand-primary) 52%,#111827) 100%)'
    : 'linear-gradient(160deg, color-mix(in srgb,var(--brand-secondary) 72%,#080b12) 0%, var(--brand-secondary) 52%, color-mix(in srgb,var(--brand-primary) 78%,#111827) 100%)'

  return (
    <div
      style={{
        display: isModal ? 'flex' : undefined,
        flexDirection: 'column',
        background: bgPanel,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 300ms ease',
        boxSizing: 'border-box',
        flexShrink: 0,
        borderRadius: isModal ? '24px' : undefined,
      }}
      className={isModal ? 'auth-panel-modal' : 'auth-panel-left'}
    >
      {!isModal && (
        <style>{`
          .auth-panel-left {
            display: none;
          }
          @media(min-width:1024px) {
            .auth-panel-left {
              display: flex !important;
              width: 46% !important;
              border-bottom: none !important;
              border-right: ${esModoOscuro ? '1px solid #1e293b' : '1px solid rgba(255,255,255,0.12)'} !important;
            }
          }
        `}</style>
      )}

      {/* Orbes decorativos */}
      <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }} />
      <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '340px', height: '340px', borderRadius: '50%', background: 'rgba(var(--brand-accent-rgb),0.12)' }} />

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '54px 44px', textAlign: 'center', gap: '28px' }}>
        
        {/* Logo & Brand Header */}
        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          width: '100%',
          maxWidth: 460,
        }}>
          <div style={{
            width: 168,
            height: 132,
            display: 'grid',
            placeItems: 'center',
          }}>
            <img src={brand.logoDataUrl || logo} alt={brand.name} style={{ height: '122px', width: '122px', objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 12px 26px rgba(0,0,0,0.30))' }} />
          </div>
          <span style={{
            fontFamily: 'Outfit, Inter, sans-serif',
            fontWeight: 900,
            fontSize: '30px',
            letterSpacing: '0.14em',
            color: 'var(--brand-text-dark)',
            textTransform: 'uppercase',
            textShadow: '0 2px 10px rgba(var(--brand-accent-rgb),0.35)'
          }}>
            {brand.name.toUpperCase()}
          </span>
          <p style={{
            color: esModoOscuro ? '#cbd5e1' : 'rgba(255,255,255,0.84)',
            fontSize: 19,
            lineHeight: 1.65,
            maxWidth: 390,
            margin: '4px auto 0',
            fontWeight: 600,
          }}>
            {t('panel.subtitle')}
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '12px 36px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11, margin: 0 }}>{t('panel.copyright')}</p>
      </div>
    </div>
  )
}
