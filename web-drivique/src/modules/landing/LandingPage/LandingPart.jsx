import { Link } from 'react-router-dom'
import { CAT_MAP } from '../translations'
import { formatCurrency } from '@/utils/currencyUtils'
import { FaChevronLeft, FaChevronRight, FaArrowRight, FaCarSide } from 'react-icons/fa'

const IconoFlecha = () => <FaArrowRight size={16} aria-hidden="true" />
const IconoAuto = ({ color = 'currentColor' }) => <FaCarSide style={{ width: 28, height: 28, color }} aria-hidden="true" />

export default function LandingPart({ autoActivo, autoDestacado, autos, brand, c, idioma, moneda, seleccionarAuto, setCarruselPausado, totalVehiculos, tx }) {
  return (
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
                {[[`${totalVehiculos || autos.length || 0}+`, tx.hero.stat1], ['24/7', tx.hero.stat2], ['100%', tx.hero.stat3]].map(([num, etiqueta]) => (
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
  )
}
