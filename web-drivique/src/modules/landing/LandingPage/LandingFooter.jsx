import { Link } from 'react-router-dom'
import logocatalog from '@/assets/logocatalog.png'
import { FaArrowRight, FaWhatsapp, FaEnvelope, FaQuestionCircle } from 'react-icons/fa'
import { CANALES_ATENCION } from '@/modules/support/data/supportCatalog'

export default function LandingFooter({ abrirPreguntas, accionFooter, brand, c, footerUi, tx }) {
  return (
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
  )
}
