import { Link } from 'react-router-dom'
import logocatalog from '@/assets/logocatalog.png'
import { FaTimes, FaBars, FaQuestionCircle, FaMobileAlt, FaIdCard, FaSun, FaMoon, FaCheck, FaCog, FaCarSide, FaMapMarkerAlt, FaKey } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import { useLanding } from '../LandingContext'
import { useBrand } from '@/contexts/BrandContext'
import { useState, useRef, useEffect } from 'react'
import { LANDING_UI, IDIOMAS } from '../translations'
import { createPortal } from 'react-dom'

function MenuConfiguracion({ tx, modoMovil = false }) {
  const { t } = useTranslation()
  const { tema, toggleTema, idioma, setIdioma, moneda, setMoneda } = useLanding()
  const { brand } = useBrand()
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef(null)
  const esModoOscuro = tema === 'oscuro'
  const c = coloresTema(esModoOscuro, brand.colors)

  useEffect(() => {
    if (modoMovil) return undefined
    const cerrarAlClickAfuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', cerrarAlClickAfuera)
    return () => document.removeEventListener('mousedown', cerrarAlClickAfuera)
  }, [modoMovil])

  useEffect(() => {
    if (!modoMovil || !abierto) return undefined
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previo }
  }, [modoMovil, abierto])

  const contenidoPanel = (
    <>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--texto-second)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
        {tx.nav.tema}
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { valor: 'claro', etiqueta: LANDING_UI[idioma]?.light ?? LANDING_UI.es.light, Icono: FaSun },
          { valor: 'oscuro', etiqueta: LANDING_UI[idioma]?.dark ?? LANDING_UI.es.dark, Icono: FaMoon },
        ].map(({ valor, etiqueta, Icono }) => {
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
              <Icono size={13} aria-hidden="true" style={{ marginRight: 6, verticalAlign: '-2px' }} />
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
    </>
  )

  const botonEngranaje = (
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
        flexShrink: 0,
      }}
    >
      <IconoEngranaje />
    </button>
  )

  if (modoMovil) {
    return (
      <>
        {botonEngranaje}
        {abierto && createPortal(
          <div
            onClick={() => setAbierto(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 400,
              background: 'rgba(15,23,42,0.55)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 480,
                maxHeight: '85vh',
                overflowY: 'auto',
                background: 'var(--bg-tarjeta)',
                borderRadius: '20px 20px 0 0',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.24)',
                padding: '18px 20px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--texto-primary)' }}>{tx.nav.config}</span>
                <button
                  onClick={() => setAbierto(false)}
                  aria-label={t('hc4.cerrar', 'Cerrar')}
                  style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--bg-item)', color: 'var(--texto-second)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
              {contenidoPanel}
            </div>
          </div>,
          document.body
        )}
      </>
    )
  }

  return (
    <div ref={contenedorRef} style={{ position: 'relative' }}>
      {botonEngranaje}

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
          {contenidoPanel}
        </div>
      )}
    </div>
  )
}
const coloresTema = (esModoOscuro, brandColors) => ({
  acentoTexto: esModoOscuro ? brandColors.accent : brandColors.secondary,
  acentoFondoSuave: esModoOscuro ? 'rgba(var(--brand-secondary-rgb),0.22)' : 'var(--brand-soft-light)',
  acentoBorde: esModoOscuro ? 'rgba(147,197,253,0.28)' : 'var(--brand-border-light)',
  acentoFondoIcono: esModoOscuro ? 'linear-gradient(135deg,#1e293b,#0f172a)' : 'linear-gradient(135deg,var(--brand-soft-strong-light),var(--brand-border-light))',
  exitoFondo: esModoOscuro ? 'rgba(16,185,129,0.16)' : '#ecfdf5',
  exitoTexto: esModoOscuro ? '#6ee7b7' : '#059669',
  botonSecundarioBorde: esModoOscuro ? '#475569' : '#cbd5e1',
  botonSecundarioHoverTexto: esModoOscuro ? brandColors.accent : brandColors.secondary,
  botonSecundarioHoverBorde: esModoOscuro ? brandColors.accent : brandColors.secondary,
  cardHoverFeature: esModoOscuro ? '#1e293b' : 'rgba(239,246,255,0.65)',
  cardHoverFeatureBorder: esModoOscuro ? 'rgba(147,197,253,0.30)' : 'var(--brand-border-light)',
  numeroPaso: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-primary)',
  loginBorder: esModoOscuro ? 'rgba(148,163,184,0.35)' : 'rgba(var(--brand-secondary-rgb),0.25)',
  loginText: esModoOscuro ? '#e2e8f0' : brandColors.secondary,
  loginHoverBg: esModoOscuro ? 'rgba(148,163,184,0.08)' : 'rgba(var(--brand-secondary-rgb),0.05)',
  statColor: esModoOscuro ? brandColors.accent : brandColors.secondary,
  sectionLabel: esModoOscuro ? brandColors.accent : brandColors.secondary,
  footerText: '#94a3b8',
  footerMuted: '#475569',
  footerBottom: '#334155',
  socialBorder: '#1e293b',
})
const IconoCheck = ({ color = 'currentColor' }) => <FaCheck size={14} color={color} aria-hidden="true" />
const IconoEngranaje = () => <FaCog size={18} aria-hidden="true" />
const IconoCoche = () => <FaCarSide size={18} aria-hidden="true" />
const IconoPin = () => <FaMapMarkerAlt size={18} aria-hidden="true" />
const IconoLlave = () => <FaKey size={18} aria-hidden="true" />

export default function LandingNav({ brand, c, estiloEnlaceNav, menuMovilAbierto, setMenuMovilAbierto, t, tx }) {
  return (
    <nav className="landing-nav">
          <div className="landing-nav-inner">
            <Link to="/" className="catalogo-logo-link" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, flexShrink: 0 }}>
              <img src={brand.logoDataUrl || logocatalog} alt={brand.name} className="catalogo-logo" style={{ height: '22px', width: 'auto', display: 'block', objectFit: 'contain' }} />
              <span className="catalogo-logo-title" style={{ fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1, color: 'var(--brand-secondary)' }}>{brand.name}</span>
            </Link>
  
            <div className="landing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 22, flex: 1, justifyContent: 'center' }}>
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
                [tx.nav.proceso, '#como-funciona'],
                [tx.nav.servicios, '#servicios'],
                [tx.nav.app, '#app'],
                [tx.nav.requisitos, '#requisitos'],
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
  
            <div className="landing-nav-auth" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
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
                  background: brand.colors.primary,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(var(--brand-secondary-rgb),0.25)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = brand.colors.secondary}
                onMouseLeave={e => e.currentTarget.style.background = brand.colors.primary}
              >
                {tx.nav.registro}
              </Link>
            </div>
  
            {/* Botón hamburguesa: solo visible en tablet/celular (ver responsive.css) */}
            <button
              className="landing-nav-toggle"
              onClick={() => setMenuMovilAbierto(v => !v)}
              aria-label={t('hc.abrir_menu', 'Abrir menú')}
              style={{
                display: 'none',
                marginLeft: 'auto',
                width: 40,
                height: 40,
                borderRadius: 10,
                border: '2px solid var(--borde)',
                background: 'transparent',
                color: 'var(--texto-nav)',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {menuMovilAbierto ? <FaTimes size={22} aria-hidden="true" /> : <FaBars size={22} aria-hidden="true" />}
            </button>
          </div>
  
          {/* Menú móvil desplegable */}
          {menuMovilAbierto && (
            <div
              className="landing-nav-mobile-menu"
              style={{
                display: 'none',
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                flexDirection: 'column',
                gap: 4,
                background: 'var(--bg-nav)',
                backdropFilter: 'blur(12px)',
                borderTop: '1px solid var(--borde)',
                boxShadow: 'var(--sombra-nav)',
                padding: '12px 20px 20px',
                maxHeight: 'calc(100vh - 74px)',
                overflowY: 'auto',
              }}
            >
              {[
                { to: '/catalogo', label: tx.nav.vehiculos, icono: <IconoCoche /> },
                { to: '/sucursales', label: tx.nav.sucursales, icono: <IconoPin /> },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuMovilAbierto(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 10px', borderRadius: 12, textDecoration: 'none', color: 'var(--texto-nav)', fontWeight: 600, fontSize: 15, transition: 'background 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-item-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.acentoFondoSuave, color: c.acentoTexto }}>
                    {item.icono}
                  </span>
                  {item.label}
                </Link>
              ))}
  
              {[
                { href: '#como-funciona', label: tx.nav.proceso, icono: <FaQuestionCircle /> },
                { href: '#servicios', label: tx.nav.servicios, icono: <IconoLlave /> },
                { href: '#app', label: tx.nav.app, icono: <FaMobileAlt /> },
                { href: '#requisitos', label: tx.nav.requisitos, icono: <FaIdCard /> },
              ].map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuMovilAbierto(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 10px', borderRadius: 12, textDecoration: 'none', color: 'var(--texto-nav)', fontWeight: 600, fontSize: 15, transition: 'background 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-item-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.acentoFondoSuave, color: c.acentoTexto }}>
                    {item.icono}
                  </span>
                  {item.label}
                </a>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, paddingTop: 14, borderTop: '1px solid var(--borde)', flexWrap: 'wrap' }}>
                <MenuConfiguracion tx={tx} modoMovil />
                <Link to="/login" onClick={() => setMenuMovilAbierto(false)} style={{ padding: '8px 20px', borderRadius: 9999, border: `2px solid ${c.loginBorder}`, color: c.loginText, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>{tx.nav.login}</Link>
                <Link to="/registro" onClick={() => setMenuMovilAbierto(false)} style={{ padding: '8px 20px', borderRadius: 9999, background: brand.colors.primary, color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>{tx.nav.registro}</Link>
              </div>
            </div>
          )}
        </nav>
  )
}
