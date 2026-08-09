import { createPortal } from 'react-dom'
import { FaTimes } from 'react-icons/fa'

// ─────────────────────────────────────────────────────────────────────────
// Componente BASE reutilizable para TODAS las alertas/modales de confirmación
// del catálogo. El tamaño de la tarjeta (340px), el padding, el ícono y los
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

  const contenido = (
    <div
      onClick={onCerrar}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: t.overlayBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '300px',   // antes decía '340px'
          background: t.cardBg,
          borderRadius: '20px',
          border: `1px solid ${t.cardBorder}`,
          boxShadow: '0 20px 50px rgba(0,0,0,0.30)',
          padding: '28px 24px 24px',
          textAlign: 'center',
        }}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: t.textSecondary,
              padding: '4px',
            }}
          >
            <FaTimes size={15} />
          </button>
        )}

        {icon && (
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: t.accentBgSoft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            {icon}
          </div>
        )}

        <p style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: t.textPrimary }}>
          {titulo}
        </p>
        <p style={{ margin: '8px 0 22px', fontSize: '13.5px', color: t.textSecondary, lineHeight: '20px' }}>
          {mensaje}
        </p>

        {secondaryText ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onSecondary || onCerrar}
              style={{
                flex: 1,
                height: '46px',
                borderRadius: '12px',
                background: 'transparent',
                border: `1.5px solid ${t.accent}`,
                color: t.accent,
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {secondaryText}
            </button>
            <button
              type="button"
              onClick={onPrimary}
              style={{
                flex: 1,
                height: '46px',
                borderRadius: '12px',
                background: t.accentGradient,
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(30,58,138,0.25)',
              }}
            >
              {primaryText}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onPrimary || onCerrar}
            style={{
              width: '100%',
              height: '46px',
              borderRadius: '12px',
              background: t.accentGradient,
              color: '#fff',
              fontWeight: 800,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(30,58,138,0.25)',
            }}
          >
            {primaryText}
          </button>
        )}
      </div>
    </div>
  )

  return usePortal ? createPortal(contenido, document.body) : contenido
}