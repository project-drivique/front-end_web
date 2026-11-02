// src/modules/landing/LandingPage.jsx
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

import { useTranslation } from 'react-i18next'
import { FaArrowRight, FaEnvelope, FaFileContract, FaQuestionCircle, FaShieldAlt, FaTimes, FaWhatsapp } from 'react-icons/fa'

import { useBrand } from '@/contexts/BrandContext'
import { useLanding } from './LandingContext'
import translations, { LANDING_UI } from './translations'
import { catalogService } from '../../services/catalogService'

import { CANALES_ATENCION, FAQS_INITIAL } from '@/modules/support/data/supportCatalog'
import './LandingPage.css'
import LandingFooter from './LandingPage/LandingFooter'
import LandingRequirementsSection from './LandingPage/LandingRequirementsSection'
import LandingAppSection from './LandingPage/LandingAppSection'
import LandingFeaturesSection from './LandingPage/LandingFeaturesSection'
import LandingPart from './LandingPage/LandingPart'
import LandingNav from './LandingPage/LandingNav'

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

export default function LandingPage() {
  const { t } = useTranslation()
  const { tema, idioma, moneda } = useLanding()
  const { brand } = useBrand()
  const tx = translations[idioma] ?? translations.es
  const footerUi = LANDING_UI[idioma] ?? LANDING_UI.es
  const esModoOscuro = tema === 'oscuro'
  const c = coloresTema(esModoOscuro, brand.colors)

  const [autos, setAutos] = useState([])
  const [totalVehiculos, setTotalVehiculos] = useState(0)
  const [autoActivo, setAutoActivo] = useState(0)
  const [carruselPausado, setCarruselPausado] = useState(false)
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
  const [footerDialog, setFooterDialog] = useState(null)

  useEffect(() => {
    catalogService.getVehiculosDestacados().then(data => setAutos(data)).catch(() => {})
    catalogService.getVehiculos().then(data => setTotalVehiculos(Array.isArray(data) ? data.length : 0)).catch(() => {})
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
      <LandingNav brand={brand} c={c} estiloEnlaceNav={estiloEnlaceNav} menuMovilAbierto={menuMovilAbierto} setMenuMovilAbierto={setMenuMovilAbierto} t={t} tx={tx} />

      <LandingPart autoActivo={autoActivo} autoDestacado={autoDestacado} autos={autos} brand={brand} c={c} idioma={idioma} moneda={moneda} seleccionarAuto={seleccionarAuto} setCarruselPausado={setCarruselPausado} totalVehiculos={totalVehiculos} tx={tx} />

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

      <LandingFeaturesSection tx={tx} />

      <LandingAppSection autoDestacado={autoDestacado} brand={brand} moneda={moneda} tx={tx} />

      <LandingRequirementsSection tx={tx} />

      <LandingFooter abrirPreguntas={abrirPreguntas} accionFooter={accionFooter} brand={brand} c={c} footerUi={footerUi} tx={tx} />

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
