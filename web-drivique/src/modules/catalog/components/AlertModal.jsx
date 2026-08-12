import { createPortal } from 'react-dom'
import { FaTimes } from 'react-icons/fa'

// ─────────────────────────────────────────────────────────────────────────
// Componente BASE reutilizable para TODAS las alertas/modales de confirmación
// del catálogo. El tamaño de la tarjeta (260px), el padding, el ícono y los
// botones se definen UNA sola vez aquí. Los demás modales (AlertaModal,
// GuestFavoriteModal, GuestReserveModal, ChooseDatesModal, etc.) son solo
// wrappers que le pasan texto/ícono/acciones — así nunca vuelven a
// desincronizarse en tamaño.
// ─────────────────────────────────────────────────────────────────────────

const TEMA_DEFECTO = {
  overlayBg: 'rgba(15,23,42,0.55)',
  cardBg: '#ffffff',
  cardBorder: '#e5ebf5',
  textPrimary: '#111a3a',
  textSecondary: '#64748b',
  accent: '#1e3a8a',
  accentBgSoft: '#eff6ff',
  accentGradient: 'linear-gradient(90deg,#1e3a8a,#2563eb)',
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
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '260px',
    borderRadius: '18px',
    padding: '22px 18px 18px',
    textAlign: 'center',
    boxShadow: '0 16px 40px rgba(0,0,0,0.28)',
  },
  closeButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  iconWrapper: {
    width: '44px',
    height: '44px',
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
  },
  mensaje: {
    margin: '6px 0 18px',
    fontSize: '12.5px',
    lineHeight: '18px',
  },
  botonesRow: {
    display: 'flex',
    gap: '10px',
  },
  botonBase: {
    height: '40px',
    borderRadius: '10px',
    fontSize: '13px',
    cursor: 'pointer',
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
  const t = { ...TEMA_DEFECTO, ...theme }

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