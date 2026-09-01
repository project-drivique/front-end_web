import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLanding } from '../modules/landing/LandingContext'
import translations, { IDIOMAS } from '../modules/landing/translations'

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

const coloresTema = () => ({
  acentoTexto: 'var(--brand-text)',
  acentoFondoSuave: 'var(--brand-soft)',
})

export default function MenuConfiguracion({ modoMovilForce = false, buttonStyle = {} }) {
  const { tema, toggleTema, idioma, setIdioma, moneda, setMoneda } = useLanding()
  const [abierto, setAbierto] = useState(false)
  const [esMovil, setEsMovil] = useState(false)
  const contenedorRef = useRef(null)

  const tx = translations[idioma] || translations.es
  const esModoOscuro = tema === 'oscuro'
  const c = coloresTema(esModoOscuro)

  useEffect(() => {
    const checkMovil = () => {
      setEsMovil(window.innerWidth <= 768)
    }
    checkMovil()
    window.addEventListener('resize', checkMovil)
    return () => window.removeEventListener('resize', checkMovil)
  }, [])

  const usaMovil = modoMovilForce || esMovil

  useEffect(() => {
    if (usaMovil) return undefined
    const cerrarAlClickAfuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', cerrarAlClickAfuera)
    return () => document.removeEventListener('mousedown', cerrarAlClickAfuera)
  }, [usaMovil])

  useEffect(() => {
    if (!usaMovil || !abierto) return undefined
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previo }
  }, [usaMovil, abierto])

  const contenidoPanel = (
    <>
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
              type="button"
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
              type="button"
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
              type="button"
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
      type="button"
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
        transition: 'all 150ms ease',
        flexShrink: 0,
        ...buttonStyle,
      }}
    >
      <IconoEngranaje />
    </button>
  )

  if (usaMovil) {
    return (
      <>
        {botonEngranaje}
        {abierto && createPortal(
          <div
            onClick={() => setAbierto(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
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
                  type="button"
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
    <div ref={contenedorRef} style={{ position: 'relative', display: 'inline-flex' }}>
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
            zIndex: 9999,
          }}
        >
          {contenidoPanel}
        </div>
      )}
    </div>
  )
}
