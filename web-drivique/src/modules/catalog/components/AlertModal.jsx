import { createPortal } from 'react-dom'
import { FaTimes } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'

const TEMA_LIGHT = {
  overlayBg: 'rgba(15,23,42,0.60)',
  cardBg: '#ffffff',
  cardBorder: '#e5ebf5',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  accent: '#1e3a8a',
  accentBgSoft: '#eff6ff',
  accentGradient: 'linear-gradient(135deg,#1e3a8a,#2563eb)',
}

const TEMA_DARK = {
  overlayBg: 'rgba(0,0,0,0.75)',
  cardBg: '#111827',
  cardBorder: '#334155',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  accent: '#93c5fd',
  accentBgSoft: 'rgba(30,58,138,0.35)',
  accentGradient: 'linear-gradient(135deg,#1e3a8a,#2563eb)',
}

const ESTILOS = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '320px',
    borderRadius: '20px',
    padding: '24px 20px 20px',
    textAlign: 'center',
    boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
    boxSizing: 'border-box',
    transition: 'all 200ms ease',
  },
  closeButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px',
  },
  titulo: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 800,
    lineHeight: '1.3',
  },
  mensaje: {
    margin: '8px 0 20px',
    fontSize: '13px',
    lineHeight: '1.5',
  },
  botonesRow: {
    display: 'flex',
    gap: '10px',
  },
  botonBase: {
    height: '42px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 180ms ease',
  },
}

export default function AlertModal({
  theme = {},
  icon,
  titulo,
  mensaje,
  primaryText,
  onPrimary,
  secondaryText,
  onSecondary,
  onCerrar = () => {},
  showCloseButton = false,
  usePortal = true,
}) {
  let esModoOscuro = false
  try {
    const landing = useLanding()
    if (landing && landing.tema) {
      esModoOscuro = landing.tema === 'oscuro'
    } else {
      esModoOscuro = document.documentElement.classList.contains('dark')
    }
  } catch (e) {
    esModoOscuro = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  }

  const baseTheme = esModoOscuro ? TEMA_DARK : TEMA_LIGHT
  const t = { ...baseTheme, ...theme }

  const botonSecundario = {
    ...ESTILOS.botonBase,
    flex: 1,
    background: 'transparent',
    border: `1.5px solid ${t.accent}`,
    color: t.accent,
    fontWeight: 700,
  }

  const botonPrimario = {
    ...ESTILOS.botonBase,
    flex: secondaryText ? 1 : undefined,
    width: secondaryText ? undefined : '100%',
    background: t.accentGradient,
    color: '#ffffff',
    fontWeight: secondaryText ? 700 : 800,
    border: 'none',
    boxShadow: '0 4px 14px rgba(30,58,138,0.25)',
  }

  const contenido = (
    <div
      onClick={onCerrar}
      style={{ ...ESTILOS.overlay, background: t.overlayBg }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...ESTILOS.card,
          background: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
        }}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            style={{ ...ESTILOS.closeButton, color: t.textSecondary }}
          >
            <FaTimes size={13} />
          </button>
        )}

        {icon && (
          <div style={{ ...ESTILOS.iconWrapper, background: t.accentBgSoft }}>
            {icon}
          </div>
        )}

        <p style={{ ...ESTILOS.titulo, color: t.textPrimary }}>
          {titulo}
        </p>
        <p style={{ ...ESTILOS.mensaje, color: t.textSecondary }}>
          {mensaje}
        </p>

        {secondaryText ? (
          <div style={ESTILOS.botonesRow}>
            <button type="button" onClick={onSecondary || onCerrar} style={botonSecundario}>
              {secondaryText}
            </button>
            <button type="button" onClick={onPrimary} style={botonPrimario}>
              {primaryText}
            </button>
          </div>
        ) : (
          <button type="button" onClick={onPrimary || onCerrar} style={botonPrimario}>
            {primaryText}
          </button>
        )}
      </div>
    </div>
  )

  return usePortal ? createPortal(contenido, document.body) : contenido
}