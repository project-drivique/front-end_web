import { createPortal } from 'react-dom'
import { FaTimes } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'

const TEMA_LIGHT = {
  overlayBg: 'rgba(15, 23, 42, 0.6)',
  cardBg: 'var(--bg-tarjeta)',
  cardBorder: 'var(--borde)',
  textPrimary: 'var(--texto-primary)',
  textSecondary: 'var(--texto-second)',
  accent: 'var(--texto-acento)',
  accentBgSoft: 'var(--bg-item)',
  accentGradient: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
}

const TEMA_DARK = {
  ...TEMA_LIGHT
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
    maxWidth: '280px',
    borderRadius: '16px',
    padding: '20px 16px 16px',
    textAlign: 'center',
    boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
    boxSizing: 'border-box',
    transition: 'all 200ms ease',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
  },
  titulo: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 800,
    lineHeight: '1.3',
  },
  mensaje: {
    margin: '6px 0 16px',
    fontSize: '12.5px',
    lineHeight: '1.45',
  },
  botonesRow: {
    display: 'flex',
    gap: '8px',
  },
  botonBase: {
    height: '38px',
    borderRadius: '10px',
    fontSize: '12.5px',
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
  const landing = useLanding()
  const temaGuardado = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('rm_tema') : null
  const esModoOscuro = (landing?.tema || temaGuardado) === 'oscuro'

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
