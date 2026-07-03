import { useTranslation } from 'react-i18next'
import { FaCalendarAlt, FaCreditCard, FaFileAlt, FaCheck } from 'react-icons/fa'
import logo from '@/assets/logo.png'

const BADGES = [
  { key: 'catalogo.myReservations', icon: FaCalendarAlt },
  { key: 'pagos.title',             icon: FaCreditCard  },
  { key: 'contratos.title',         icon: FaFileAlt     },
]

export default function PanelIzquierdo() {
  const { t } = useTranslation()
  const checks = [t('panel.check1'), t('panel.check2'), t('panel.check3')]
  return (
    <div
      style={{
        display: 'none', width: '48%', flexDirection: 'column',
        background: 'linear-gradient(160deg,#060e2e 0%,#0c1f5c 50%,#1e3a8a 100%)',
        position: 'relative', overflow: 'hidden',
      }}
      className="lg-panel-left"
    >
      <style>{`@media(min-width:1024px){.lg-panel-left{display:flex !important}}`}</style>

      {/* Orbes decorativos */}
      {[
        { top: '-120px', left: '-120px', w: 480, h: 480, border: '1px solid rgba(255,255,255,0.05)', bg: 'rgba(255,255,255,0.02)' },
        { top: '33%', right: '-100px', w: 320, h: 320, bg: 'rgba(96,165,250,0.08)' },
        { bottom: '-100px', left: '25%', w: 380, h: 380, bg: 'rgba(99,102,241,0.08)' },
        { bottom: '33%', right: '40px', w: 160, h: 160, border: '1px solid rgba(255,255,255,0.05)', bg: 'rgba(255,255,255,0.03)' },
      ].map((orbe, i) => (
        <div key={i} style={{ position: 'absolute', ...orbe, width: orbe.w, height: orbe.h, borderRadius: '50%' }} />
      ))}

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px', textAlign: 'center', gap: '32px' }}>
        <div style={{ textAlign: 'center' }}>
          <img src={logo} alt="Drivique" style={{ height: '160px', display: 'block', margin: '0 auto 8px', filter: 'brightness(0) invert(1)' }} />
        </div>

        <div>
          <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 900, margin: '0 0 10px', lineHeight: 1.2 }}>{t('panel.welcome')}</h2>
          <p style={{ color: 'rgba(191,219,254,0.75)', fontSize: 15, lineHeight: 1.7, maxWidth: 260, margin: '0 auto' }}>
            {t('panel.subtitle')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, width: '100%', maxWidth: 280 }}>
          {BADGES.map(({ key, icon: Icono }) => (
            <div key={key} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 8px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icono />
              </div>
              <p style={{ color: '#fff', fontSize: 12, fontWeight: 700, margin: 0 }}>{t(key)}</p>
            </div>
          ))}
        </div>

        <div style={{ width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {checks.map(item => (
            <p key={item} style={{ color: 'rgba(147,197,253,0.75)', fontSize: 14, margin: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaCheck /> {item}
            </p>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '16px 56px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
        <p style={{ color: 'rgba(147,197,253,0.35)', fontSize: 12, margin: 0 }}>{t('panel.copyright')}</p>
      </div>
    </div>
  )
}