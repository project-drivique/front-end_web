import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { FaArrowLeft } from 'react-icons/fa'
import FiltrosCatalogo from './FiltrosCatalogo'

export default function ModalBusquedaMovil({ abierto, onCerrar, c, limpiar = () => {}, invitado = false, handleBuscar = () => {}, onBuscarInvitado = () => {}, busquedaForm = {}, ...resto }) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!abierto) return
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previo }
  }, [abierto])

  if (!abierto) return null

  const busquedaCompleta = Boolean(
    busquedaForm.ciudad && busquedaForm.sucursal && busquedaForm.fechaInicio && busquedaForm.fechaFin &&
    busquedaForm.fechaFin > busquedaForm.fechaInicio
  )

  const buscarYCerrar = () => {
    if (invitado) onBuscarInvitado()
    else handleBuscar()
    if (busquedaCompleta) onCerrar()
  }

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
          maxHeight: '92vh',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              style={{
                width: '30px',
                height: '30px',
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
              <FaArrowLeft size={13} />
            </button>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: c.textPrimary, margin: 0 }}>
              {t('catalogo.consultAvailability')}
            </h2>
          </div>
          <button
            type="button"
            onClick={limpiar}
            style={{ fontSize: '12px', color: c.accentText, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {t('catalogo.clearFilters')}
          </button>
        </div>

        <div style={{ padding: '18px 20px', overflowY: 'auto', flex: 1 }}>
          <FiltrosCatalogo
            c={c}
            limpiar={limpiar}
            invitado={invitado}
            busquedaForm={busquedaForm}
            handleBuscar={buscarYCerrar}
            onBuscarInvitado={buscarYCerrar}
            enModal
            showHero
            soloBusqueda
            {...resto}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}
