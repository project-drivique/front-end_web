import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

export default function ModalVerificacionContrasena({
  onVerificar,
  onCancelar,
  cargando,
  error,
  c,
}) {
  const { t } = useTranslation()
  const [contrasena, setContrasena] = useState('')
  const [mostrarPass, setMostrarPass] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (contrasena.trim()) {
      onVerificar(contrasena)
    }
  }

  const IconoOjoAbierto = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )

  const IconoOjoCerrado = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: c.modalBg,
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
        border: `1px solid ${c.modalDivider}`,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg,#0f1a3d,#1e3a8a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, margin: 0 }}>
            {t('perfil.verifyEmailTitle')}
          </h2>
          <button
            onClick={onCancelar}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FaTimes />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <p style={{ color: c.text, fontSize: '13px', marginBottom: '16px', margin: 0 }}>
            {t('perfil.verifyEmailSubtitle')}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: c.text,
                marginBottom: '6px',
              }}>
                {t('login.password')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarPass ? 'text' : 'password'}
                  value={contrasena}
                  onChange={e => setContrasena(e.target.value)}
                  disabled={cargando}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    borderRadius: '8px',
                    border: `1.5px solid ${error ? c.inputErrorBorder : c.inputBorder}`,
                    background: error ? c.inputErrorBg : c.inputBg,
                    fontSize: '13px',
                    color: c.inputText,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 150ms',
                  }}
                  onFocus={e => e.target.style.borderColor = c.inputBorderHover}
                  onBlur={e => e.target.style.borderColor = error ? c.inputErrorBorder : c.inputBorder}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPass(!mostrarPass)}
                  disabled={cargando}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: cargando ? 'not-allowed' : 'pointer',
                    color: c.inputText,
                    padding: 0,
                    display: 'flex',
                    opacity: cargando ? 0.5 : 1,
                  }}
                >
                  {mostrarPass ? <IconoOjoCerrado /> : <IconoOjoAbierto />}
                </button>
              </div>
              {error && (
                <p style={{ color: c.errorInline, fontSize: '12px', margin: '6px 0 0' }}>
                  {error}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={onCancelar}
                disabled={cargando}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  background: c.secondaryBtnBg,
                  border: `1.5px solid ${c.secondaryBtnBorder}`,
                  color: c.secondaryBtnText,
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: cargando ? 'not-allowed' : 'pointer',
                  opacity: cargando ? 0.6 : 1,
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={!contrasena.trim() || cargando}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg,#1e3a8a,#2563eb)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: (!contrasena.trim() || cargando) ? 'not-allowed' : 'pointer',
                  opacity: (!contrasena.trim() || cargando) ? 0.6 : 1,
                }}
              >
                {cargando ? t('login.verifying') : t('common.verify')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
