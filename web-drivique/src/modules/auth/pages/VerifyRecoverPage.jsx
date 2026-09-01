import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaShieldAlt, FaExclamationTriangle, FaArrowLeft, FaClock } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useVerifyRecover } from '../hooks/useVerifyRecover'
import AlertModal from '../../catalog/components/AlertModal'

const formatearTiempo = (segundos) => {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VerifyRecoverPage() {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'
  const {
    correo, codigo, cargando, error, expirado,
    segundosReenvio, segundosExpiracion, reenviando,
    inputsRef, LARGO_CODIGO,
    handleCambioDigito, handleKeyDown,
    handlePaste, handleSubmit,
    handleReenviar, handleCancelar,
  } = useVerifyRecover()
  
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (error) setShowModal(true)
  }, [error])

  const c = {
    pageBg: esModoOscuro ? '#0f172a' : 'radial-gradient(circle at top left, var(--brand-soft-strong-light) 0%, var(--brand-soft-light) 28%, #f8fbff 100%)',
    cardBg: esModoOscuro ? '#0e172a' : '#ffffff',
    cardBorder: esModoOscuro ? '#1e293b' : '#dbe5f3',
    cardShadow: esModoOscuro ? '0 24px 60px rgba(0,0,0,0.5)' : '0 10px 30px rgba(var(--brand-secondary-rgb),0.08)',
    textPrimary: esModoOscuro ? '#ffffff' : '#0f172a',
    textSecondary: esModoOscuro ? '#94a3b8' : '#64748b',
    inputBg: esModoOscuro ? '#172136' : '#ffffff',
    inputBorder: esModoOscuro ? '#23314d' : '#dbe5f3',
    accentText: esModoOscuro ? 'var(--brand-accent)' : 'var(--brand-secondary)',
    buttonBg: esModoOscuro ? 'linear-gradient(90deg, var(--brand-secondary), var(--brand-primary))' : 'linear-gradient(135deg, var(--brand-secondary) 0%, var(--brand-primary) 100%)',
  }

  return (
    <div style={{
      minHeight: '100vh',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: c.pageBg,
      color: c.textPrimary,
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      zoom: 0.9,
      position: 'relative',
      overflowX: 'hidden',
      transition: 'all 300ms ease'
    }}>
      
      <div style={{ width: '100%', maxWidth: '480px', zIndex: 1, position: 'relative' }}>
        
        <div style={{
          background: c.cardBg,
          borderRadius: '28px',
          border: `1px solid ${c.cardBorder}`,
          boxShadow: c.cardShadow,
          padding: '42px 36px',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
          transition: 'all 300ms ease'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, var(--brand-primary-hover), var(--brand-primary), var(--brand-accent))' }} />

          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '22px',
            background: esModoOscuro ? 'rgba(var(--brand-accent-rgb), 0.12)' : 'linear-gradient(135deg, var(--brand-soft-light) 0%, var(--brand-soft-strong-light) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: esModoOscuro ? '1px solid rgba(var(--brand-accent-rgb), 0.25)' : '1px solid var(--brand-border-light)'
          }}>
            <FaShieldAlt size={36} color={esModoOscuro ? 'var(--brand-accent)' : 'var(--brand-primary-hover)'} />
          </div>

          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <h1 style={{
              fontFamily: 'Outfit, Inter, system-ui, sans-serif',
              fontSize: '1.55rem',
              fontWeight: 900,
              color: c.textPrimary,
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
              lineHeight: 1.25
            }}>
              {t('verificarRecuperacion.title', 'Verificar código')}
            </h1>
            <p style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              color: c.textSecondary,
              fontSize: '13.5px',
              fontWeight: 500,
              margin: 0,
              lineHeight: 1.5
            }}>
              {t('verificarRecuperacion.subtitle', 'Ingresa el código de 6 dígitos que enviamos a')}<br />
              <span style={{ fontWeight: 800, color: c.accentText }}>{correo || 'tu correo'}</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px' }} onPaste={handlePaste}>
              {Array.from({ length: LARGO_CODIGO }).map((_, i) => (
                <input
                  key={i}
                  ref={el => inputsRef.current[i] = el}
                  type="text"
                  maxLength={1}
                  value={codigo[i] || ''}
                  onChange={e => handleCambioDigito(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  disabled={cargando || expirado}
                  style={{
                    width: '48px',
                    height: '56px',
                    textAlign: 'center',
                    fontSize: '22px',
                    fontWeight: 800,
                    color: c.textPrimary,
                    borderRadius: '14px',
                    border: `1.5px solid ${codigo[i] ? c.accentText : c.inputBorder}`,
                    background: c.inputBg,
                    outline: 'none',
                    transition: 'all 180ms ease',
                    boxShadow: codigo[i] ? '0 0 0 2px rgba(var(--brand-primary-rgb),0.15)' : 'none'
                  }}
                />
              ))}
            </div>

            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{
                padding: '8px 16px',
                background: expirado ? (esModoOscuro ? 'rgba(239,68,68,0.2)' : '#fef2f2') : (esModoOscuro ? 'rgba(var(--brand-primary-rgb),0.2)' : 'var(--brand-soft-light)'),
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: `1px solid ${expirado ? '#ef4444' : c.accentText}`
              }}>
                <FaClock size={14} color={expirado ? '#ef4444' : c.accentText} />
                <span style={{ color: expirado ? '#ef4444' : c.accentText, fontSize: '13px', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                  {formatearTiempo(segundosExpiracion)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando || codigo.length < LARGO_CODIGO || expirado}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '14px',
                background: c.buttonBg,
                color: '#ffffff',
                fontSize: '14.5px',
                fontWeight: 800,
                border: 'none',
                cursor: (cargando || codigo.length < LARGO_CODIGO || expirado) ? 'not-allowed' : 'pointer',
                transition: 'all 180ms ease',
                opacity: (cargando || codigo.length < LARGO_CODIGO || expirado) ? 0.6 : 1,
                marginBottom: '16px',
                boxShadow: '0 6px 18px rgba(var(--brand-primary-rgb),0.25)'
              }}
            >
              {cargando ? t('verificarRecuperacion.verifying', 'Verificando...') : t('verificarRecuperacion.submit', 'Verificar código')}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                onClick={handleReenviar}
                disabled={reenviando || segundosReenvio > 0}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  background: c.inputBg,
                  border: `1.5px solid ${c.inputBorder}`,
                  color: (reenviando || segundosReenvio > 0) ? c.textSecondary : c.accentText,
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: (reenviando || segundosReenvio > 0) ? 'not-allowed' : 'pointer',
                  transition: 'all 180ms ease'
                }}
              >
                {reenviando ? t('verificarRecuperacion.resending', 'Reenviando...') :
                 segundosReenvio > 0 ? t('verificarRecuperacion.resendIn', { seconds: segundosReenvio }) :
                 t('verificarRecuperacion.resendCode', 'Reenviar código')}
              </button>

              <button
                type="button"
                onClick={handleCancelar}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'transparent',
                  border: 'none',
                  color: c.textSecondary,
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 180ms ease'
                }}
              >
                <FaArrowLeft size={12} />
                {t('verificarRecuperacion.cancel', 'Cancelar')}
              </button>
            </div>
          </form>

        </div>
      </div>

      {showModal && (
        <AlertModal
          icon={<FaExclamationTriangle size={22} color={esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)'} />}
          titulo={t('common.error', 'Error')}
          mensaje={error}
          primaryText={t('common.accept', 'Aceptar')}
          onPrimary={() => setShowModal(false)}
          onCerrar={() => setShowModal(false)}
          showCloseButton
        />
      )}
    </div>
  )
}
