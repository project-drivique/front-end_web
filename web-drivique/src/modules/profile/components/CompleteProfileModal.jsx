import { FaTimes, FaSave } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import CompleteProfileFormSections from './CompleteProfileFormSections'

export default function CompleteProfileModal({
  abierto,
  onCerrar,
  formData,
  errores,
  cargando,
  actualizarCampo,
  handleGuardar,
  c,
  esModoOscuro,
  esPerfilIncompleto,
}) {
  const { t } = useTranslation()

  if (!abierto) return null

  const inputStyle = (hasError) => ({
    width: '100%',
    height: '42px',
    padding: '0 14px',
    borderRadius: '10px',
    border: `1.5px solid ${hasError ? c.inputErrorBorder : c.inputBorder}`,
    background: hasError ? c.inputErrorBg : c.inputBg,
    fontSize: '13.5px',
    color: c.inputText,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 150ms ease',
  })

  const selectStyle = (hasError) => ({
    width: '100%',
    height: '42px',
    padding: '0 36px 0 14px',
    borderRadius: '10px',
    border: `1.5px solid ${hasError ? c.inputErrorBorder : c.inputBorder}`,
    background: hasError ? c.inputErrorBg : c.inputBg,
    fontSize: '13.5px',
    color: c.inputText,
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
  })

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11.5px',
    fontWeight: 600,
    color: c.labelText,
    marginBottom: '5px',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(6px)',
        padding: '20px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          background: c.modalBg,
          borderRadius: '20px',
          border: `1px solid ${c.cardBorder}`,
          boxShadow: esModoOscuro ? '0 20px 50px rgba(0,0,0,0.6)' : '0 20px 50px rgba(var(--brand-secondary-rgb),0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          animation: 'fadeInUp 250ms ease-out',
        }}
      >
        {/* Header del Modal */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${c.modalDivider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: esModoOscuro ? '#1e293b' : '#f8fafc',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', margin: 0 }}>
              {esPerfilIncompleto ? t('perfil.completeProfileTitle', 'Completar Perfil') : t('perfil.editProfileTitle', 'Editar Perfil')}
            </h2>
            <p style={{ fontSize: '12.5px', color: c.textMuted, margin: '3px 0 0' }}>
              {t('perfil.modalSubtitle', 'Actualiza tus datos personales, información de contacto y documento de identidad.')}
            </p>
          </div>
          <button
            onClick={onCerrar}
            disabled={cargando}
            style={{
              background: 'transparent',
              border: 'none',
              color: c.textMuted,
              fontSize: '18px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = c.title}
            onMouseLeave={e => e.currentTarget.style.color = c.textMuted}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body del Modal (Grid de 3 Secciones) */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <CompleteProfileFormSections
            formData={formData}
            errores={errores}
            actualizarCampo={actualizarCampo}
            c={c}
            esModoOscuro={esModoOscuro}
            inputStyle={inputStyle}
            selectStyle={selectStyle}
            labelStyle={labelStyle}
          />
        </div>

        {/* Footer del Modal */}
        <div
          className="modal-responsive-footer"
          style={{
            padding: '16px 24px',
            borderTop: `1px solid ${c.modalDivider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            background: esModoOscuro ? '#1e293b' : '#f8fafc',
          }}
        >
          <button
            onClick={onCerrar}
            disabled={cargando}
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              background: c.btnSecBg,
              border: `1.5px solid ${c.btnSecBorder}`,
              color: c.btnSecText,
              fontWeight: 600,
              fontSize: '13.5px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              opacity: cargando ? 0.5 : 1,
            }}
          >
            {t('perfil.cancel', 'Cancelar')}
          </button>
          <button
            onClick={handleGuardar}
            disabled={cargando}
            style={{
              padding: '10px 26px',
              borderRadius: '10px',
              background: c.btnPrimary || 'var(--brand-secondary)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: cargando ? 0.7 : 1,
            }}
          >
            {cargando ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }}
                />
                {t('perfil.saving', 'Guardando...')}
              </>
            ) : (
              <>
                <FaSave style={{ fontSize: '12px' }} />
                {t('perfil.save', 'Guardar cambios')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
