// src/modules/auth/components/PanelIzquierdo.jsx
import { FaCalendarAlt, FaCreditCard, FaFileAlt, FaCheck } from 'react-icons/fa'

const BADGES = [
  { label: 'Reservas', icon: FaCalendarAlt },
  { label: 'Pagos',    icon: FaCreditCard  },
  { label: 'Contratos',icon: FaFileAlt     },
]

const CHECKS = ['Reserva en minutos', 'Paga con Nequi o PSE', 'Contrato digital inmediato']

export default function PanelIzquierdo() {
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
          <svg viewBox="0 0 240 100" width="130" height="54" fill="white" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto 8px' }}>
            {/* Carrocería sedán */}
            <path d="M15,78 L15,64 Q17,54 28,46 L58,26 Q70,18 96,17 L152,17 Q174,17 188,30 L208,52 Q216,62 217,70 L217,78 Z" />
            {/* Parabrisas + ventana trasera */}
            <path d="M76,46 L88,19 L150,19 L164,46 Z" fill="rgba(6,14,46,0.72)" />
            {/* Pilar B */}
            <rect x="120" y="19" width="3" height="27" fill="rgba(6,14,46,0.72)" />
            {/* Faro delantero */}
            <ellipse cx="210" cy="62" rx="5" ry="7" fill="rgba(6,14,46,0.5)" />
            {/* Llanta delantera */}
            <path d="M175,78 m-20,0 a20,20 0 1,0 40,0 a20,20 0 1,0 -40,0 Z M175,78 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0 Z" fillRule="evenodd" />
            {/* Llanta trasera */}
            <path d="M57,78 m-20,0 a20,20 0 1,0 40,0 a20,20 0 1,0 -40,0 Z M57,78 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0 Z" fillRule="evenodd" />
            {/* Línea de suelo */}
            <rect x="12" y="96" width="210" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
          </svg>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem', letterSpacing: 2 }}>Drivique</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem', marginTop: 2, letterSpacing: 0.5 }}>Alquila fácil, conduce libre</div>
        </div>

        <div>
          <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 900, margin: '0 0 10px', lineHeight: 1.2 }}>Bienvenido de vuelta</h2>
          <p style={{ color: 'rgba(191,219,254,0.75)', fontSize: 15, lineHeight: 1.7, maxWidth: 260, margin: '0 auto' }}>
            Gestiona tus reservas, pagos y contratos desde un solo lugar.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, width: '100%', maxWidth: 280 }}>
          {BADGES.map(({ label, icon: Icono }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 8px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icono />
              </div>
              <p style={{ color: '#fff', fontSize: 12, fontWeight: 700, margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>

        <div style={{ width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CHECKS.map(t => (
            <p key={t} style={{ color: 'rgba(147,197,253,0.75)', fontSize: 14, margin: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaCheck /> {t}
            </p>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '16px 56px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
        <p style={{ color: 'rgba(147,197,253,0.35)', fontSize: 12, margin: 0 }}>Drivique © 2026</p>
      </div>
    </div>
  )
}