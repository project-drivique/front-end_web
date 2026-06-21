// src/modules/landing/LandingPage.jsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import logo from '@/assets/logo.png'
import { useLanding } from './LandingContext'
import traducciones, { IDIOMAS } from './traducciones'
import { catalogoService } from '../../services/catalogoService'
import { formatCurrency } from '@/utils/monedaUtils'

const COLOR_MARCA = '#1e3a8a'
const COLOR_MARCA_HOVER = '#162d6e'

const coloresTema = (esModoOscuro) => ({
  acentoTexto: esModoOscuro ? '#93c5fd' : COLOR_MARCA,
  acentoFondoSuave: esModoOscuro ? 'rgba(30,58,138,0.22)' : '#eff6ff',
  acentoBorde: esModoOscuro ? 'rgba(147,197,253,0.28)' : '#bfdbfe',
  acentoFondoIcono: esModoOscuro ? 'linear-gradient(135deg,#1e293b,#0f172a)' : 'linear-gradient(135deg,#dbeafe,#bfdbfe)',
  exitoFondo: esModoOscuro ? 'rgba(16,185,129,0.16)' : '#ecfdf5',
  exitoTexto: esModoOscuro ? '#6ee7b7' : '#059669',
  botonSecundarioBorde: esModoOscuro ? '#475569' : '#cbd5e1',
  botonSecundarioHoverTexto: esModoOscuro ? '#93c5fd' : COLOR_MARCA,
  botonSecundarioHoverBorde: esModoOscuro ? '#93c5fd' : COLOR_MARCA,
  cardHoverFeature: esModoOscuro ? '#1e293b' : 'rgba(239,246,255,0.65)',
  cardHoverFeatureBorder: esModoOscuro ? 'rgba(147,197,253,0.30)' : '#bfdbfe',
  numeroPaso: esModoOscuro ? 'rgba(147,197,253,0.18)' : 'rgba(30,58,138,0.15)',
  loginBorder: esModoOscuro ? 'rgba(148,163,184,0.35)' : 'rgba(30,58,138,0.25)',
  loginText: esModoOscuro ? '#e2e8f0' : COLOR_MARCA,
  loginHoverBg: esModoOscuro ? 'rgba(148,163,184,0.08)' : 'rgba(30,58,138,0.05)',
  statColor: esModoOscuro ? '#93c5fd' : COLOR_MARCA,
  sectionLabel: esModoOscuro ? '#93c5fd' : COLOR_MARCA,
  footerText: '#94a3b8',
  footerMuted: '#475569',
  footerBottom: '#334155',
  socialBorder: '#1e293b',
})

/* ─────────── Iconos SVG ─────────── */
const IconoAuto = ({ color = 'currentColor' }) => (
  <svg style={{ width: 28, height: 28, color }} fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
  </svg>
)

const IconoEngranaje = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const IconoCheck = ({ color = 'currentColor' }) => (
  <svg width="14" height="14" fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)

const IconoFlecha = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)

const ICONOS_FEATURES = [
  <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
  <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
  <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
  <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-3 3h3" /></svg>,
  <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
]

function MenuConfiguracion({ tx }) {
  const { tema, toggleTema, idioma, setIdioma, moneda, setMoneda } = useLanding()
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef(null)
  const esModoOscuro = tema === 'oscuro'
  const c = coloresTema(esModoOscuro)

  useEffect(() => {
    const cerrarAlClickAfuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', cerrarAlClickAfuera)
    return () => document.removeEventListener('mousedown', cerrarAlClickAfuera)
  }, [])

  return (
    <div ref={contenedorRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setAbierto(a => !a)}
        title={tx.nav.config}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '2px solid var(--borde)',
          background: abierto ? 'var(--bg-item-hover)' : 'transparent',
          color: 'var(--texto-nav)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 150ms, color 150ms',
        }}
      >
        <IconoEngranaje />
      </button>

      {abierto && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            background: 'var(--bg-tarjeta)',
            border: '1px solid var(--borde)',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            padding: 16,
            minWidth: 228,
            zIndex: 200,
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--texto-second)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
            {tx.nav.tema}
          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { valor: 'claro', etiqueta: tx.nav.claro },
              { valor: 'oscuro', etiqueta: tx.nav.oscuro },
            ].map(({ valor, etiqueta }) => {
              const activo = tema === valor
              return (
                <button
                  key={valor}
                  onClick={() => { if (tema !== valor) toggleTema() }}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    transition: 'all 150ms',
                    border: activo ? `2px solid ${c.acentoTexto}` : '2px solid var(--borde)',
                    background: activo ? c.acentoFondoSuave : 'transparent',
                    color: activo ? c.acentoTexto : 'var(--texto-second)',
                  }}
                >
                  {etiqueta}
                </button>
              )
            })}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--texto-second)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
            Moneda
          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { valor: 'COP', etiqueta: 'COP ($)' },
              { valor: 'USD', etiqueta: 'USD ($)' },
            ].map(({ valor, etiqueta }) => {
              const activo = moneda === valor
              return (
                <button
                  key={valor}
                  onClick={() => { if (moneda !== valor) setMoneda(valor) }}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    transition: 'all 150ms',
                    border: activo ? `2px solid ${c.acentoTexto}` : '2px solid var(--borde)',
                    background: activo ? c.acentoFondoSuave : 'transparent',
                    color: activo ? c.acentoTexto : 'var(--texto-second)',
                  }}
                >
                  {etiqueta}
                </button>
              )
            })}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--texto-second)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
            {tx.nav.idioma}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Object.entries(IDIOMAS).map(([codigo, { label, flag }]) => {
              const activo = idioma === codigo
              return (
                <button
                  key={codigo}
                  onClick={() => { setIdioma(codigo); setAbierto(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    border: activo ? `2px solid ${c.acentoTexto}` : '2px solid transparent',
                    background: activo ? c.acentoFondoSuave : 'transparent',
                    color: activo ? c.acentoTexto : 'var(--texto-primary)',
                    fontWeight: activo ? 700 : 400,
                    fontSize: 13,
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 150ms',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{flag}</span>
                  {label}
                  {activo && (
                    <span style={{ marginLeft: 'auto', color: c.acentoTexto }}>
                      <IconoCheck color={c.acentoTexto} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  const { tema, idioma, moneda } = useLanding()
  const tx = traducciones[idioma] ?? traducciones.es
  const esModoOscuro = tema === 'oscuro'
  const c = coloresTema(esModoOscuro)

  const [autos, setAutos] = useState([])

  useEffect(() => {
    catalogoService.getVehiculosDestacados().then(data => setAutos(data)).catch(() => {})
  }, [])

  const estiloEnlaceNav = {
    fontSize: 13,
    color: 'var(--texto-nav)',
    fontWeight: 600,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'color 150ms',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--bg-nav)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--borde)', boxShadow: 'var(--sombra-nav)', height: 68,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px', height: '100%', display: 'flex', alignItems: 'center', gap: 32 }}>
          <img src={logo} alt="Drivique" style={{ height: 40, flexShrink: 0 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 32, flex: 1, justifyContent: 'center' }}>
            <Link
              to="/catalogo"
              style={estiloEnlaceNav}
              onMouseEnter={e => e.currentTarget.style.color = c.acentoTexto}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--texto-nav)'}
            >
              {tx.nav.vehiculos}
            </Link>

            <Link
              to="/sucursales"
              style={estiloEnlaceNav}
              onMouseEnter={e => e.currentTarget.style.color = c.acentoTexto}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--texto-nav)'}
            >
              {tx.nav.sucursales}
            </Link>

            {[
              [tx.nav.servicios, '#como-funciona'],
              [tx.nav.tarifas, '#tarifas'],
              [tx.nav.soporte, '#soporte'],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                style={estiloEnlaceNav}
                onMouseEnter={e => e.currentTarget.style.color = c.acentoTexto}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--texto-nav)'}
              >
                {label}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <MenuConfiguracion tx={tx} />

            <Link
              to="/login"
              style={{
                padding: '8px 20px',
                borderRadius: 9999,
                border: `2px solid ${c.loginBorder}`,
                color: c.loginText,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                background: 'transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.background = c.loginHoverBg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {tx.nav.login}
            </Link>

            <Link
              to="/registro"
              style={{
                padding: '8px 20px',
                borderRadius: 9999,
                background: COLOR_MARCA,
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(30,58,138,0.25)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = COLOR_MARCA_HOVER}
              onMouseLeave={e => e.currentTarget.style.background = COLOR_MARCA}
            >
              {tx.nav.registro}
            </Link>
          </div>
        </div>
      </nav>

      <section style={{
        position: 'relative',
        paddingTop: 68,
        minHeight: '100vh',
        background: 'var(--hero-fondo)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'var(--hero-orb1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 350, height: 350, borderRadius: '50%', background: 'var(--hero-orb2)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', width: '100%', maxWidth: 1280, margin: '0 auto', padding: '80px 48px', display: 'flex', alignItems: 'center', gap: 64, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px', minWidth: 300 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: c.acentoFondoSuave,
              border: `1px solid ${c.acentoBorde}`,
              color: c.acentoTexto,
              fontSize: 12,
              fontWeight: 700,
              padding: '6px 16px',
              borderRadius: 9999,
              marginBottom: 24,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.acentoTexto }} />
              {tx.hero.badge}
            </span>

            <h1 style={{ fontSize: 'clamp(2.2rem,4vw,3.5rem)', fontWeight: 900, color: 'var(--texto-primary)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 20 }}>
              {tx.hero.h1a}<br />
              <span style={{ background: 'linear-gradient(90deg,#1e3a8a,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {tx.hero.h1b}
              </span>
            </h1>

            <p style={{ color: 'var(--texto-second)', fontSize: 17, lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>
              {tx.hero.sub}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 40 }}>
              <Link
                to="/registro"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 28px',
                  borderRadius: 9999,
                  background: COLOR_MARCA,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(30,58,138,0.30)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = COLOR_MARCA_HOVER}
                onMouseLeave={e => e.currentTarget.style.background = COLOR_MARCA}
              >
                {tx.hero.cta1} <IconoFlecha />
              </Link>

              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '14px 28px',
                  borderRadius: 9999,
                  border: `2px solid ${c.botonSecundarioBorde}`,
                  color: 'var(--texto-primary)',
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = c.botonSecundarioHoverBorde
                  e.currentTarget.style.color = c.botonSecundarioHoverTexto
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = c.botonSecundarioBorde
                  e.currentTarget.style.color = 'var(--texto-primary)'
                }}
              >
                {tx.hero.cta2}
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 40 }}>
              {[['50+', tx.hero.stat1], ['24/7', tx.hero.stat2], ['100%', tx.hero.stat3]].map(([num, etiqueta]) => (
                <div key={etiqueta}>
                  <p style={{ fontSize: 28, fontWeight: 900, color: c.statColor, margin: 0 }}>{num}</p>
                  <p style={{ fontSize: 13, color: 'var(--texto-second)', fontWeight: 600, marginTop: 4 }}>{etiqueta}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: '1 1 340px', maxWidth: 420 }}>
            <div style={{ background: 'var(--bg-tarjeta)', borderRadius: 24, boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde)', padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--texto-second)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                  {tx.hero.cardTitle}
                </p>

                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: c.exitoTexto,
                  background: c.exitoFondo,
                  padding: '4px 10px',
                  borderRadius: 9999,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                  {tx.hero.cardOnline}
                </span>
              </div>

              {autos.map(auto => (
                <div
                  key={auto.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 14, borderRadius: 16, background: 'var(--bg-item)', marginBottom: 10, cursor: 'pointer', transition: 'background 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-item-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-item)'}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: c.acentoFondoIcono,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: c.acentoTexto,
                  }}>
                    <IconoAuto color={c.acentoTexto} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--texto-primary)', margin: 0 }}>{auto.categoria}</p>
                    <p style={{ fontSize: 12, color: 'var(--texto-second)', margin: '2px 0 0' }}>{auto.nombre}</p>
                  </div>

                  <span style={{ fontSize: 15, fontWeight: 900, color: c.acentoTexto, whiteSpace: 'nowrap' }}>
                    {formatCurrency(auto.precio, moneda)}/día
                  </span>
                </div>
              ))}

              <Link
                to="/catalogo"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 16,
                  background: 'linear-gradient(90deg,#1e3a8a,#2563eb)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(30,58,138,0.25)',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {tx.hero.verFlota} <IconoFlecha />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" style={{ padding: '80px 0', background: 'var(--bg-seccion1)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ color: c.sectionLabel, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
              {tx.como.label}
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--texto-primary)', margin: '0 0 12px', lineHeight: 1.2 }}>{tx.como.titulo}</h2>
            <p style={{ color: 'var(--texto-second)', fontSize: 15, margin: 0 }}>{tx.como.sub}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24 }}>
            {tx.como.pasos.map((paso) => (
              <div key={paso.num} style={{ background: 'var(--bg-tarjeta)', borderRadius: 20, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid var(--borde)' }}>
                <p style={{ fontSize: '3rem', fontWeight: 900, color: c.numeroPaso, margin: '0 0 12px', lineHeight: 1 }}>{paso.num}</p>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--texto-primary)', margin: '0 0 8px' }}>{paso.titulo}</h3>
                <p style={{ fontSize: 14, color: 'var(--texto-second)', lineHeight: 1.6, margin: 0 }}>{paso.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="servicios" style={{ padding: '80px 0', background: 'var(--bg-seccion2)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ color: c.sectionLabel, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
              {tx.features.label}
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--texto-primary)', margin: '0 0 12px', lineHeight: 1.2 }}>{tx.features.titulo}</h2>
            <p style={{ color: 'var(--texto-second)', fontSize: 15, margin: 0 }}>{tx.features.sub}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
            {tx.features.items.map((item, i) => (
              <div
                key={i}
                style={{ padding: 28, borderRadius: 20, border: '1px solid var(--borde)', cursor: 'default', transition: 'all 200ms', background: 'var(--bg-seccion2)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = c.cardHoverFeatureBorder
                  e.currentTarget.style.background = c.cardHoverFeature
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--borde)'
                  e.currentTarget.style.background = 'var(--bg-seccion2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 16 }}>
                  {ICONOS_FEATURES[i]}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--texto-primary)', margin: '0 0 8px' }}>{item.titulo}</h3>
                <p style={{ fontSize: 14, color: 'var(--texto-second)', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 48px', background: 'linear-gradient(135deg,#0f1a3d,#1e3a8a,#2563eb)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0 0 16px' }}>{tx.cta.titulo}</h2>
          <p style={{ color: '#93c5fd', fontSize: 16, margin: '0 0 32px' }}>{tx.cta.sub}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link
              to="/registro"
              style={{
                padding: '14px 32px',
                borderRadius: 9999,
                background: '#fff',
                color: COLOR_MARCA,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.20)',
                transition: 'transform 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {tx.cta.btn1}
            </Link>

            <Link
              to="/login"
              style={{
                padding: '14px 32px',
                borderRadius: 9999,
                border: '2px solid rgba(255,255,255,0.4)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                transition: 'background 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {tx.cta.btn2}
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ background: '#0f172a', color: 'var(--texto-second)', padding: '56px 48px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 48, flexWrap: 'wrap', marginBottom: 40 }}>
            <div style={{ maxWidth: 280 }}>
              <img src={logo} alt="Drivique" style={{ height: 40, marginBottom: 16, filter: 'brightness(0) invert(1)', opacity: 0.85 }} />
              <p style={{ fontSize: 14, lineHeight: 1.7, color: c.footerMuted, margin: 0 }}>{tx.footer.desc}</p>
            </div>

            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              {tx.footer.cols.map(col => (
                <div key={col.title}>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: '0 0 16px' }}>{col.title}</p>
                  {col.links.map(enlace => (
                    <p
                      key={enlace}
                      style={{ fontSize: 13, margin: '0 0 10px', cursor: 'pointer', color: c.footerText, transition: 'color 150ms' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = c.footerText}
                    >
                      {enlace}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${c.socialBorder}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ fontSize: 12, color: c.footerBottom, margin: 0 }}>{tx.footer.copy}</p>

            <div style={{ display: 'flex', gap: 10 }}>
              {['F', 'I', 'W'].map((inicial, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: `1px solid ${c.socialBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: c.footerMuted,
                    textDecoration: 'none',
                    fontSize: 11,
                    fontWeight: 700,
                    transition: 'all 150ms'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#475569' }}
                  onMouseLeave={e => { e.currentTarget.style.color = c.footerMuted; e.currentTarget.style.borderColor = c.socialBorder }}
                >
                  {inicial}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}