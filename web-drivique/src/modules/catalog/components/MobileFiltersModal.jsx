import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { FaTimes, FaSlidersH } from 'react-icons/fa'
import CatalogFilters from './CatalogFilters'

export default function ModalFiltrosMovil({ abierto, onCerrar, c, resultado = [], cargando = false, limpiar = () => {}, ...resto }) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!abierto) return
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previo }
  }, [abierto])

  if (!abierto) return null

  return createPortal(
    <div
      className="modal-filtros-overlay"
      onClick={onCerrar}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(15,23,42,0.55)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        className="modal-filtros-panel"
        onClick={e => e.stopPropagation()}
        style={{
          background: c.panelBg,
          width: '100%',
          maxWidth: '560px',
          maxHeight: '88vh',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.30)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${c.panelBorder}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: c.accentText }}><FaSlidersH size={16} /></span>
            <h2 style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '0.02em', color: c.textPrimary, margin: 0 }}>
              {t('catalogo.filters')}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={limpiar}
              style={{ fontSize: '12px', color: c.accentText, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {t('catalogo.clearFilters')}
            </button>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: c.chipBg,
                color: c.textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <FaTimes size={13} />
            </button>
          </div>
        </div>

        <div style={{ padding: '18px 20px', overflowY: 'auto', flex: 1 }}>
          <CatalogFilters c={c} resultado={resultado} cargando={cargando} limpiar={limpiar} enModal showHero={false} {...resto} />
        </div>

        <div style={{ padding: '14px 20px', borderTop: `1px solid ${c.panelBorder}`, flexShrink: 0 }}>
          <button
            type="button"
            onClick={onCerrar}
            style={{
              width: '100%',
              padding: '13px 20px',
              borderRadius: '12px',
              background: c.accentGradient,
              color: '#fff',
              fontWeight: 800,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(var(--brand-secondary-rgb),0.25)',
            }}
          >
            {!cargando ? `${t('catalogo.viewResults')} (${resultado.length})` : t('catalogo.viewResults')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
