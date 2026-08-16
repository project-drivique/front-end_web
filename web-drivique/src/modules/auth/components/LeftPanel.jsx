import { useTranslation } from 'react-i18next'
import { FaCalendarAlt, FaCreditCard, FaFileAlt, FaCheck } from 'react-icons/fa'
import { useLanding } from '@/modules/landing/LandingContext'
import logo from '@/assets/logocatalog.png'

const BADGES = [
  { key: 'catalogo.myReservations', icon: FaCalendarAlt },
  { key: 'pagos.title',             icon: FaCreditCard  },
  { key: 'contratos.title',         icon: FaFileAlt     },
]

export default function PanelIzquierdo() {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'
  const checks = [t('panel.check1'), t('panel.check2'), t('panel.check3')]

  const bgPanel = esModoOscuro
    ? 'linear-gradient(160deg, #070d1e 0%, #0f172a 55%, #1e293b 100%)'
    : 'linear-gradient(160deg, #060e2e 0%, #0c1f5c 50%, #1e3a8a 100%)'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: bgPanel,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 300ms ease',
        boxSizing: 'border-box',
        flexShrink: 0
      }}
      className="auth-panel-left"
    >
      <style>{`
        .auth-panel-left {
          width: 100%;
          border-bottom: ${esModoOscuro ? '1px solid #1e293b' : '1px solid rgba(255,255,255,0.12)'};
        }
        @media(min-width:1024px) {
          .auth-panel-left {
            width: 42% !important;
            border-bottom: none !important;
            border-right: ${esModoOscuro ? '1px solid #1e293b' : '1px solid rgba(255,255,255,0.12)'} !important;
          }
        }
      `}</style>

      {/* Orbes decorativos */}
      <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }} />
      <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '340px', height: '340px', borderRadius: '50%', background: 'rgba(99,102,241,0.08)' }} />

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 36px', textAlign: 'center', gap: '24px' }}>
        
        {/* Logo & Brand Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <img src={logo} alt="Drivique" style={{ height: '48px', width: 'auto', display: 'block', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))' }} />
          <span style={{
            fontFamily: 'Outfit, Inter, sans-serif',
            fontWeight: 900,
            fontSize: '18px',
            letterSpacing: '0.14em',
            color: '#93c5fd',
            textTransform: 'uppercase',
            textShadow: '0 2px 10px rgba(147,197,253,0.35)'
          }}>
            DRIVIQUE
          </span>
        </div>

        {/* Tarjeta Glassmórfica con la información original del Login */}
        <div style={{
          background: esModoOscuro ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: esModoOscuro ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '24px',
          padding: '32px 28px',
          boxShadow: esModoOscuro ? '0 20px 50px rgba(0, 0, 0, 0.4)' : '0 20px 50px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '22px',
          width: '100%',
          maxWidth: '360px',
          boxSizing: 'border-box',
          transition: 'all 300ms ease'
        }}>
          <div>
            <p style={{ color: esModoOscuro ? '#94a3b8' : 'rgba(191,219,254,0.85)', fontSize: 13.5, lineHeight: 1.6, maxWidth: 280, margin: '0 auto', fontWeight: 500 }}>
              {t('panel.subtitle')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, width: '100%' }}>
            {BADGES.map(({ key, icon: Icono }) => (
              <div key={key} style={{
                background: esModoOscuro ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '12px 6px',
                border: esModoOscuro ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 18, marginBottom: 6, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icono />
                </div>
                <p style={{ color: '#ffffff', fontSize: 11, fontWeight: 700, margin: 0 }}>{t(key)}</p>
              </div>
            ))}
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, paddingTop: '16px', borderTop: esModoOscuro ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.1)' }}>
            {checks.map(item => (
              <p key={item} style={{ color: '#ffffff', fontSize: 13, fontWeight: 600, margin: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                <FaCheck color="#93c5fd" size={13} /> {item}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '12px 36px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
        <p style={{ color: 'rgba(147,197,253,0.35)', fontSize: 11, margin: 0 }}>{t('panel.copyright')}</p>
      </div>
    </div>
  )
}