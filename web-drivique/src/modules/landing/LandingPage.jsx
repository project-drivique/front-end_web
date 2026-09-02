// src/modules/landing/LandingPage.jsx
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaArrowRight,
  FaBars,
  FaCarSide,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaCreditCard,
  FaEnvelope,
  FaFileContract,
  FaFileSignature,
  FaFileUpload,
  FaIdCard,
  FaKey,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaQuestionCircle,
  FaCog,
  FaShieldAlt,
  FaStar,
  FaMoon,
  FaSun,
  FaTag,
  FaTimes,
  FaWhatsapp,
} from 'react-icons/fa'
import logocatalog from '@/assets/logocatalog.png'
import { useBrand } from '@/contexts/BrandContext'
import { useLanding } from './LandingContext'
import translations, { IDIOMAS, CAT_MAP, LANDING_UI } from './translations'
import { catalogService } from '../../services/catalogService'
import { formatCurrency } from '@/utils/currencyUtils'
import { CANALES_ATENCION, FAQS_INITIAL } from '@/modules/support/data/support.dummy'
import './LandingPage.css'

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

/* ─────────── Iconos de interfaz ─────────── */
const IconoAuto = ({ color = 'currentColor' }) => <FaCarSide style={{ width: 28, height: 28, color }} aria-hidden="true" />

const IconoEngranaje = () => <FaCog size={18} aria-hidden="true" />

const IconoCheck = ({ color = 'currentColor' }) => <FaCheck size={14} color={color} aria-hidden="true" />

const IconoCoche = () => <FaCarSide size={18} aria-hidden="true" />

const IconoPin = () => <FaMapMarkerAlt size={18} aria-hidden="true" />

const IconoLlave = () => <FaKey size={18} aria-hidden="true" />

const IconoEtiqueta = () => <FaTag size={18} aria-hidden="true" />

const IconoFlecha = () => <FaArrowRight size={16} aria-hidden="true" />

const ICONOS_FEATURES = [
  FaCarSide,
  FaCreditCard,
  FaFileContract,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaStar,
]

function MenuConfiguracion({ tx, modoMovil = false }) {
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
                  aria-label="Cerrar"
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

export default function LandingPage() {
  const { t } = useTranslation()
  const { tema, idioma, moneda } = useLanding()
  const { brand } = useBrand()
  const tx = translations[idioma] ?? translations.es
  const footerUi = LANDING_UI[idioma] ?? LANDING_UI.es
  const esModoOscuro = tema === 'oscuro'
  const c = coloresTema(esModoOscuro, brand.colors)

  const [autos, setAutos] = useState([])
  const [autoActivo, setAutoActivo] = useState(0)
  const [carruselPausado, setCarruselPausado] = useState(false)
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
  const [footerDialog, setFooterDialog] = useState(null)

  useEffect(() => {
    catalogService.getVehiculosDestacados().then(data => setAutos(data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (autos.length < 2 || carruselPausado || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const intervalo = window.setInterval(() => {
      setAutoActivo(actual => (actual + 1) % autos.length)
    }, 5500)
    return () => window.clearInterval(intervalo)
  }, [autos.length, carruselPausado])

  const seleccionarAuto = (indice) => setAutoActivo((indice + autos.length) % autos.length)
  const autoDestacado = autos[autoActivo]
  const clausulasLegales = t('registro.modal.clausulas', { returnObjects: true })
  const clausulas = Array.isArray(clausulasLegales) ? clausulasLegales : []

  const abrirDocumentoLegal = (tipo) => {
    const privacidad = clausulas.filter((item) => item.num === '2')
    const seguridad = clausulas.filter((item) => item.num === '4')
    const documentos = {
      terms: { title: t('registro.modal.title'), icon: FaFileContract, items: clausulas },
      privacy: { title: footerUi.privacyTitle, icon: FaShieldAlt, items: privacidad },
      law: { title: footerUi.lawTitle, icon: FaFileContract, items: privacidad },
      security: { title: footerUi.securityTitle, icon: FaShieldAlt, items: seguridad },
    }
    setFooterDialog(documentos[tipo])
  }

  const abrirPreguntas = () => setFooterDialog({
    title: footerUi.faqTitle,
    icon: FaQuestionCircle,
    items: FAQS_INITIAL.map((faq) => ({
      titulo: t(faq.preguntaKey, faq.preguntaFallback),
      texto: t(faq.respuestaKey, faq.respuestaFallback),
    })),
  })

  const abrirContacto = () => setFooterDialog({
    title: footerUi.contactTitle,
    icon: FaEnvelope,
    channels: CANALES_ATENCION,
  })

  useEffect(() => {
    if (!footerDialog) return undefined
    const overflowAnterior = document.body.style.overflow
    const cerrarConEscape = (event) => {
      if (event.key === 'Escape') setFooterDialog(null)
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', cerrarConEscape)
    return () => {
      document.body.style.overflow = overflowAnterior
      document.removeEventListener('keydown', cerrarConEscape)
    }
  }, [footerDialog])

  const accionFooter = (columna, indice) => {
    if (columna === 0) {
      const rutas = ['/catalogo', '/login', '/catalogo', '/login']
      return { tipo: 'ruta', destino: rutas[indice] }
    }
    if (columna === 1) {
      if (indice === 0) return { tipo: 'boton', accion: abrirPreguntas }
      if (indice === 1) return { tipo: 'boton', accion: abrirContacto }
      if (indice === 2) return { tipo: 'externo', destino: 'mailto:soporte@drivique.com?subject=Queja%20o%20sugerencia' }
      return { tipo: 'externo', destino: CANALES_ATENCION.find(canal => canal.id === 'whatsapp')?.link }
    }
    const documentos = ['terms', 'privacy', 'law', 'security']
    return { tipo: 'boton', accion: () => abrirDocumentoLegal(documentos[indice]) }
  }

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
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column', overflowX: 'hidden', zoom: 0.9 }}>
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="catalogo-logo-link" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, flexShrink: 0 }}>
            <img src={brand.logoDataUrl || logocatalog} alt={brand.name} className="catalogo-logo" style={{ height: '22px', width: 'auto', display: 'block', objectFit: 'contain' }} />
            <span className="catalogo-logo-title" style={{ fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1, color: 'var(--brand-secondary)' }}>{brand.name}</span>
          </Link>

          <div className="landing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32, flex: 1, justifyContent: 'center' }}>
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
              [tx.nav.servicios, '#servicios'],
              [tx.nav.tarifas, '#tarifas'],
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
            aria-label="Abrir menú"
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
              { href: '#servicios', label: tx.nav.servicios, icono: <IconoLlave /> },
              { href: '#tarifas', label: tx.nav.tarifas, icono: <IconoEtiqueta /> },
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

      <section style={{
        position: 'relative',
        paddingTop: 74,
        minHeight: '100vh',
        background: 'var(--hero-fondo)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'var(--hero-orb1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 350, height: 350, borderRadius: '50%', background: 'var(--hero-orb2)', pointerEvents: 'none' }} />

        <div className="landing-hero-inner" style={{ position: 'relative', width: '100%', maxWidth: 1480, margin: '0 auto', padding: '72px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 48, flexWrap: 'wrap' }}>
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
              <span style={{ background: 'linear-gradient(90deg,var(--brand-secondary),var(--brand-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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
                  background: brand.colors.primary,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(var(--brand-secondary-rgb),0.30)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = brand.colors.secondary}
                onMouseLeave={e => e.currentTarget.style.background = brand.colors.primary}
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

            <div className="landing-hero-stats" style={{ display: 'flex', gap: 40 }}>
              {[['50+', tx.hero.stat1], ['24/7', tx.hero.stat2], ['100%', tx.hero.stat3]].map(([num, etiqueta]) => (
                <div key={etiqueta}>
                  <p style={{ fontSize: 28, fontWeight: 900, color: c.statColor, margin: 0 }}>{num}</p>
                  <p style={{ fontSize: 13, color: 'var(--texto-second)', fontWeight: 600, marginTop: 4 }}>{etiqueta}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            id="tarifas"
            className="landing-fleet-showcase"
            onMouseEnter={() => setCarruselPausado(true)}
            onMouseLeave={() => setCarruselPausado(false)}
            onFocusCapture={() => setCarruselPausado(true)}
            onBlurCapture={() => setCarruselPausado(false)}
          >
            <div className="landing-fleet-card" aria-live="polite">
              {autoDestacado ? (
                <>
                  <div className="landing-fleet-card__header">
                    <span>{tx.hero.cardTitle}</span>
                    <span className="landing-fleet-card__live"><i /> {tx.hero.cardOnline}</span>
                  </div>

                  <div className="landing-fleet-card__stage">
                    <Link to={`/catalogo/${autoDestacado.id}`} className="landing-fleet-card__media" aria-label={autoDestacado.nombre}>
                      {autoDestacado.imagenes?.[0] ? (
                        <img src={autoDestacado.imagenes[0]} alt={autoDestacado.nombre} loading="eager" />
                      ) : (
                        <span className="landing-fleet-card__fallback"><IconoAuto color={c.acentoTexto} /></span>
                      )}
                    </Link>

                    <div className="landing-fleet-card__content">
                      <div className="landing-fleet-card__heading">
                        <span className="landing-fleet-card__category">{CAT_MAP[autoDestacado.categoria]?.[idioma] || autoDestacado.categoria}</span>
                        <h2>{autoDestacado.nombre}</h2>
                        <p>{autoDestacado.transmision} · {autoDestacado.combustible} · {autoDestacado.pasajeros} {tx.hero.passengers}</p>
                      </div>
                      <div className="landing-fleet-card__price">
                        <strong>{formatCurrency(autoDestacado.precio, moneda)}</strong>
                        <span>{tx.hero.perDay || '/día'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="landing-fleet-card__controls">
                    <button type="button" onClick={() => seleccionarAuto(autoActivo - 1)} aria-label={tx.hero.previousVehicle}><FaChevronLeft aria-hidden="true" /></button>
                    <div className="landing-fleet-card__rail" role="tablist" aria-label={tx.hero.cardTitle}>
                      {autos.slice(0, 4).map((auto, indice) => (
                        <button key={auto.id} type="button" role="tab" aria-selected={indice === autoActivo} className={indice === autoActivo ? 'is-active' : ''} onClick={() => seleccionarAuto(indice)}>
                          {auto.imagenes?.[0] ? <img src={auto.imagenes[0]} alt="" /> : <IconoAuto color={c.acentoTexto} />}
                          <span>{CAT_MAP[auto.categoria]?.[idioma] || auto.categoria}</span>
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => seleccionarAuto(autoActivo + 1)} aria-label={tx.hero.nextVehicle}><FaChevronRight aria-hidden="true" /></button>
                  </div>

                  <Link to="/catalogo" className="landing-fleet-card__cta">{tx.hero.verFlota} <IconoFlecha /></Link>
                </>
              ) : (
                <div className="landing-fleet-card__loading" aria-label={tx.hero.cardTitle}><span /><span /><span /></div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="landing-steps-section landing-section">
        <div className="landing-steps-section__inner">
          <div className="landing-steps-heading">
            <span>{tx.como.label}</span>
            <h2>{tx.como.titulo}</h2>
            <p>{tx.como.sub}</p>
          </div>

          <div className="landing-steps-grid">
            {tx.como.pasos.map((paso) => (
              <div key={paso.num} className="landing-step-card">
                <p className="landing-step-card__number">{paso.num}</p>
                <h3>{paso.titulo}</h3>
                <p>{paso.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="servicios" className="landing-features-section landing-section">
        <div className="landing-features-section__inner">
          <div className="landing-features-heading">
            <span>{tx.features.label}</span>
            <h2>{tx.features.titulo}</h2>
            <p>{tx.features.sub}</p>
          </div>

          <div className="landing-features-grid">
            {tx.features.items.map((item, i) => {
              const FeatureIcon = ICONOS_FEATURES[i] ?? FaCheck
              return (
              <div
                key={i}
                className={i === 2 ? 'landing-feature-card landing-feature-card--highlight' : 'landing-feature-card'}
              >
                <div className="landing-feature-card__icon">
                  <FeatureIcon size={24} aria-hidden="true" />
                </div>
                <h3>{item.titulo}</h3>
                <p>{item.desc}</p>
              </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="landing-app-section landing-section">
        <div className="landing-app-section__inner">
          <div className="landing-phone" aria-hidden="true">
            <div className="landing-phone__screen">
              <div className="landing-phone__status">
                <span>9:30</span>
                <span>100%</span>
              </div>
              <div className="landing-phone__brand">
                <img src={brand.logoDataUrl || logocatalog} alt="" />
                <strong>{brand.name}</strong>
              </div>
              <div className="landing-phone__card">
                <span>{tx.app.previewTitle}</span>
                <h3>{autoDestacado?.nombre || 'Drivique'}</h3>
                <p>{autoDestacado ? formatCurrency(autoDestacado.precio, moneda) : formatCurrency(0, moneda)}{tx.hero.perDay}</p>
              </div>
              <div className="landing-phone__list">
                {tx.app.items.map((item, index) => {
                  const ItemIcon = [FaCarSide, FaCreditCard, FaFileContract][index] ?? FaCheck
                  return (
                    <div key={item}>
                      <ItemIcon />
                      <span>{item}</span>
                      <FaCheck />
                    </div>
                  )
                })}
              </div>
              <div className="landing-phone__pill">{tx.app.status}</div>
            </div>
          </div>

          <div className="landing-app-copy">
            <span>{tx.app.label}</span>
            <h2>{tx.app.titulo}</h2>
            <p>{tx.app.sub}</p>
            <div className="landing-app-actions">
              <Link to="/login" className="landing-app-primary">
                <FaMobileAlt aria-hidden="true" />
                {tx.app.cta}
              </Link>
              <Link to="/catalogo" className="landing-app-secondary">
                {tx.hero.verFlota}
                <FaArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-requirements-section landing-section">
        <div className="landing-requirements-section__inner">
          <div className="landing-requirements-copy">
            <span>{tx.requirements.label}</span>
            <h2>{tx.requirements.titulo}</h2>
            <p>{tx.requirements.sub}</p>
            <Link to="/registro" className="landing-requirements-cta">
              {tx.requirements.cta}
              <IconoFlecha />
            </Link>
          </div>

          <div className="landing-requirements-grid">
            {tx.requirements.items.map((item, index) => {
              const RequirementIcon = [FaIdCard, FaFileUpload, FaCreditCard, FaFileSignature][index] ?? FaCheck
              return (
                <article key={item.titulo} className="landing-requirement-card">
                  <span className="landing-requirement-card__step">{String(index + 1).padStart(2, '0')}</span>
                  <div className="landing-requirement-card__icon">
                    <RequirementIcon aria-hidden="true" />
                  </div>
                  <h3>{item.titulo}</h3>
                  <p>{item.desc}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <footer className="landing-footer" style={{ background: '#0f172a', color: 'var(--texto-second)', padding: '56px 48px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="landing-footer-top" style={{ display: 'flex', justifyContent: 'space-between', gap: 48, flexWrap: 'wrap', marginBottom: 40 }}>
            <div style={{ maxWidth: 280 }}>
              <Link to="/" className="catalogo-logo-link" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, marginBottom: 16 }}>
                <img src={brand.logoDataUrl || logocatalog} alt={brand.name} style={{ height: '22px', width: 'auto', display: 'block', objectFit: 'contain', filter: brand.logoDataUrl ? 'none' : 'brightness(0) invert(1)', opacity: 0.9 }} />
                <span className="catalogo-logo-title" style={{ fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ffffff' }}>{brand.name}</span>
              </Link>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: c.footerMuted, margin: 0 }}>{tx.footer.desc}</p>
            </div>

            <div className="landing-footer-cols" style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              {tx.footer.cols.map((col, columna) => (
                <div key={col.title}>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: '0 0 16px' }}>{col.title}</p>
                  {col.links.map((enlace, indice) => {
                    const accion = accionFooter(columna, indice)
                    const textoEnlace = columna === 2 && indice === 3 ? footerUi.securityLink : enlace
                    if (accion.tipo === 'ruta') return (
                      <Link key={enlace} to={accion.destino} className="landing-footer-link">{textoEnlace}<FaArrowRight /></Link>
                    )
                    if (accion.tipo === 'externo') return (
                      <a key={enlace} href={accion.destino} className="landing-footer-link" target={accion.destino?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{textoEnlace}<FaArrowRight /></a>
                    )
                    return <button key={enlace} type="button" className="landing-footer-link" onClick={accion.accion}>{textoEnlace}<FaArrowRight /></button>
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="landing-footer-bottom" style={{ borderTop: `1px solid ${c.socialBorder}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ fontSize: 12, color: c.footerBottom, margin: 0 }}>{tx.footer.copy}</p>

            <div className="landing-footer-socials">
              <a href={CANALES_ATENCION.find(canal => canal.id === 'whatsapp')?.link} target="_blank" rel="noreferrer" aria-label="WhatsApp"><FaWhatsapp /></a>
              <a href="mailto:soporte@drivique.com" aria-label={footerUi.contactTitle}><FaEnvelope /></a>
              <button type="button" onClick={abrirPreguntas} aria-label={footerUi.faqTitle}><FaQuestionCircle /></button>
            </div>
          </div>
        </div>
      </footer>

      {footerDialog && createPortal((() => {
        const DialogIcon = footerDialog.icon
        return (
          <div className="landing-info-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFooterDialog(null) }}>
            <section className="landing-info-modal__card" role="dialog" aria-modal="true" aria-labelledby="landing-info-title">
              <header className="landing-info-modal__header">
                <span className="landing-info-modal__icon">{DialogIcon && <DialogIcon />}</span>
                <h2 id="landing-info-title">{footerDialog.title}</h2>
                <button type="button" onClick={() => setFooterDialog(null)} aria-label={footerUi.closeDetails}><FaTimes /></button>
              </header>
              <div className="landing-info-modal__content">
                {footerDialog.items?.map((item, index) => (
                  <article className="landing-info-modal__item" key={`${item.num || index}-${item.titulo}`}>
                    <h3>{item.num ? `${item.num}. ` : ''}{item.titulo}</h3>
                    <p>{item.texto}</p>
                  </article>
                ))}
                {footerDialog.channels?.map((canal) => (
                  <a className="landing-info-modal__channel" key={canal.id} href={canal.link} target={canal.link.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    {canal.tipo === 'whatsapp' ? <FaWhatsapp /> : <FaEnvelope />}
                    <span><strong>{t(canal.tituloKey, canal.tituloFallback)}</strong><small>{t(canal.subtituloKey, canal.subtituloFallback)}</small></span>
                    <FaArrowRight />
                  </a>
                ))}
              </div>
            </section>
          </div>
        )
      })(), document.body)}
    </div>
  )
}
