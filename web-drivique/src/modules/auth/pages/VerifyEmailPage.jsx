import { useTranslation } from 'react-i18next'
import { FaEnvelope, FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa'
import { useVerifyEmail } from '../hooks/useVerifyEmail'
import { useLanding } from '@/modules/landing/LandingContext'

const formatearTiempo = (segundos) => {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VerificarCorreoPage() {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'

  const {
    correo, codigoEnviado, enviando, handleEnviarCodigo,
    codigo, cargando, error, exito, expirado,
    segundosReenvio, segundosExpiracion, reenviando,
    inputsRef, LARGO_CODIGO,
    handleCambioDigito, handleKeyDown,
    handlePaste, handleSubmit,
    handleReenviar, handleCancelar,
  } = useVerifyEmail()

  const c = {
    pageBg: esModoOscuro ? '#0f172a' : 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)',
    cardBg: esModoOscuro ? '#0e172a' : 'rgba(255, 255, 255, 0.98)',
    cardBorder: esModoOscuro ? '#1e293b' : '#dbe5f3',
    cardShadow: esModoOscuro ? '0 20px 50px rgba(0, 0, 0, 0.5)' : '0 20px 50px rgba(37, 99, 235, 0.12)',
    titleColor: esModoOscuro ? '#ffffff' : '#0f172a',
    subtitleColor: esModoOscuro ? '#94a3b8' : '#64748b',
    correoColor: esModoOscuro ? '#60a5fa' : '#1e3a8a',
    iconBadgeBg: esModoOscuro ? 'rgba(96, 165, 250, 0.12)' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    iconBadgeBorder: esModoOscuro ? 'rgba(96, 165, 250, 0.25)' : '#bfdbfe',
    iconColor: esModoOscuro ? '#60a5fa' : '#1d4ed8',
    buttonBg: esModoOscuro ? 'linear-gradient(90deg, #1e3a8a, #2563eb)' : 'linear-gradient(90deg, #1d4ed8, #2563eb 60%, #3b82f6)',
    buttonBorder: esModoOscuro ? '#3b82f6' : '#60a5fa',
    inputBg: esModoOscuro ? '#172136' : '#ffffff',
    inputBorder: esModoOscuro ? '#23314d' : '#bfdbfe',
    inputText: esModoOscuro ? '#ffffff' : '#0f172a',
    errorBg: esModoOscuro ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
    errorBorder: esModoOscuro ? 'rgba(239, 68, 68, 0.25)' : '#fecaca',
    errorText: esModoOscuro ? '#f87171' : '#dc2626',
    cancelText: esModoOscuro ? '#60a5fa' : '#1e3a8a',
    cancelHover: esModoOscuro ? '#93c5fd' : '#2563eb',
  }

  return (
    <div style={{
      minHeight: '112vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: c.pageBg,
      zoom: 0.9,
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      transition: 'all 300ms ease'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{
          background: c.cardBg,
          borderRadius: '28px',
          border: `1px solid ${c.cardBorder}`,
          boxShadow: c.cardShadow,
          padding: '36px 32px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 300ms ease'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #1d4ed8, #2563eb, #60a5fa)' }} />

          {exito ? (
            /* ── Pantalla 3: éxito ── */
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '22px',
                background: esModoOscuro ? 'rgba(34, 197, 94, 0.15)' : 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: esModoOscuro ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid #86efac'
              }}>
                <FaCheckCircle size={40} color={esModoOscuro ? '#4ade80' : '#16a34a'} />
              </div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: c.titleColor, margin: '0 0 8px' }}>
                {t('verificarCorreo.successTitle')}
              </h1>
              <p style={{ color: c.subtitleColor, fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                {t('verificarCorreo.successSubtitle')}
              </p>
            </div>

          ) : !codigoEnviado ? (
            /* ── Pantalla 1: confirmar antes de enviar ── */
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '22px',
                background: c.iconBadgeBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: `1px solid ${c.iconBadgeBorder}`,
                boxShadow: esModoOscuro ? 'none' : '0 10px 24px rgba(37,99,235,0.16)'
              }}>
                <FaEnvelope size={38} color={c.iconColor} />
              </div>

              <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: c.titleColor, margin: '0 0 12px' }}>
                {t('verificarCorreo.sendTitle')}
              </h1>
              <p style={{ color: c.subtitleColor, fontSize: '14px', lineHeight: 1.65, margin: '0 0 20px' }}>
                {t('verificarCorreo.sendSubtitle')}<br />
                <span style={{ fontWeight: 700, color: c.correoColor }}>{correo}</span>
              </p>

              {error && (
                <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '12px', background: c.errorBg, border: `1px solid ${c.errorBorder}`, display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <FaExclamationTriangle size={18} color={c.errorText} style={{ flexShrink: 0 }} />
                  <p style={{ color: c.errorText, fontSize: '14px', margin: 0, textAlign: 'left' }}>{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleEnviarCodigo}
                disabled={enviando}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: c.buttonBg,
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '14px',
                  border: `1px solid ${c.buttonBorder}`,
                  cursor: enviando ? 'not-allowed' : 'pointer',
                  opacity: enviando ? 0.6 : 1,
                  boxShadow: '0 14px 28px rgba(37, 99, 235, 0.24)',
                  transition: 'transform 150ms ease, box-shadow 150ms ease',
                  marginBottom: '20px',
                }}
                onMouseEnter={(e) => {
                  if (!enviando) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 16px 32px rgba(37, 99, 235, 0.28)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 14px 28px rgba(37, 99, 235, 0.24)'
                }}
              >
                {enviando ? t('verificarCorreo.sending') : t('verificarCorreo.sendButton')}
              </button>

            </div>

          ) : (
            /* ── Pantalla 2: ingresar el código ── */
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '22px',
                  background: c.iconBadgeBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: `1px solid ${c.iconBadgeBorder}`,
                  boxShadow: esModoOscuro ? 'none' : '0 10px 24px rgba(37,99,235,0.16)'
                }}>
                  <FaEnvelope size={38} color={c.iconColor} />
                </div>
                <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: c.titleColor, margin: '0 0 8px' }}>
                  {t('verificarCorreo.title')}
                </h1>
                <p style={{ color: c.subtitleColor, fontSize: '14px', lineHeight: 1.65, margin: 0 }}>
                  {t('verificarCorreo.subtitle')}<br />
                  <span style={{ fontWeight: 700, color: c.correoColor }}>{correo}</span>
                </p>
              </div>

              {error && (
                <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '12px', background: c.errorBg, border: `1px solid ${c.errorBorder}`, display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <FaExclamationTriangle size={18} color={c.errorText} style={{ flexShrink: 0 }} />
                  <p style={{ color: c.errorText, fontSize: '14px', margin: 0, textAlign: 'left' }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${LARGO_CODIGO}, minmax(0, 1fr))`,
                  gap: '10px',
                  marginBottom: '18px',
                  padding: '10px',
                  borderRadius: '18px',
                  background: esModoOscuro ? 'rgba(255,255,255,0.03)' : '#f8fbff',
                  border: `1px solid ${c.cardBorder}`
                }} onPaste={handlePaste}>
                  {Array.from({ length: LARGO_CODIGO }).map((_, i) => (
                    <input
                      key={i}
                      ref={el => inputsRef.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={codigo[i] || ''}
                      onChange={e => handleCambioDigito(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      disabled={cargando || expirado}
                      style={{
                        width: '100%',
                        height: '56px',
                        textAlign: 'center',
                        fontSize: '1.3rem',
                        fontWeight: 800,
                        color: c.inputText,
                        borderRadius: '12px',
                        border: error ? `2px solid ${c.errorText}` : codigo[i] ? '2px solid #2563eb' : c.inputBorder,
                        background: c.inputBg,
                        outline: 'none',
                        transition: 'all 180ms ease',
                        boxShadow: codigo[i] ? '0 0 0 4px rgba(37, 99, 235, 0.14)' : '0 2px 8px rgba(15, 23, 42, 0.04)',
                        caretColor: 'transparent',
                        opacity: expirado ? 0.5 : 1,
                      }}
                      onFocus={(e) => {
                        if (!error && !expirado) {
                          e.target.style.borderColor = '#2563eb'
                          e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.14)'
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = error ? c.errorText : codigo[i] ? '#2563eb' : c.inputBorder
                        e.target.style.boxShadow = codigo[i] ? '0 0 0 4px rgba(37, 99, 235, 0.14)' : '0 2px 8px rgba(15, 23, 42, 0.04)'
                      }}
                    />
                  ))}
                </div>

                <p style={{ textAlign: 'center', fontSize: '13px', color: expirado ? '#ef4444' : c.subtitleColor, fontWeight: expirado ? 700 : 500, margin: '0 0 16px' }}>
                  {expirado
                    ? t('verificarCorreo.expired')
                    : t('verificarCorreo.expiresIn', { time: formatearTiempo(segundosExpiracion) })}
                </p>

                <button
                  type="submit"
                  disabled={cargando || expirado || codigo.length < LARGO_CODIGO}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: c.buttonBg,
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '14px',
                    border: `1px solid ${c.buttonBorder}`,
                    cursor: (cargando || expirado || codigo.length < LARGO_CODIGO) ? 'not-allowed' : 'pointer',
                    opacity: (cargando || expirado || codigo.length < LARGO_CODIGO) ? 0.6 : 1,
                    boxShadow: '0 14px 28px rgba(37, 99, 235, 0.24)',
                    transition: 'transform 150ms ease, box-shadow 150ms ease',
                    marginBottom: '16px',
                  }}
                  onMouseEnter={(e) => {
                    if (!cargando && !expirado && codigo.length >= LARGO_CODIGO) {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 16px 32px rgba(37, 99, 235, 0.28)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 14px 28px rgba(37, 99, 235, 0.24)'
                  }}
                >
                  {cargando ? t('verificarCorreo.verifying') : t('verificarCorreo.submit')}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: esModoOscuro ? '1px solid #1e293b' : '1px solid #e2e8f0', paddingTop: '16px' }}>
                {segundosReenvio > 0 ? (
                  <span style={{ fontSize: '13px', fontWeight: 600, color: c.subtitleColor }}>
                    {t('verificarCorreo.resendCountdown', { seconds: segundosReenvio })}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleReenviar}
                    disabled={reenviando}
                    style={{ background: 'none', border: 'none', cursor: reenviando ? 'not-allowed' : 'pointer', color: '#2563eb', fontSize: '13px', fontWeight: 700, padding: 0, opacity: reenviando ? 0.65 : 1 }}
                  >
                    {reenviando ? t('verificarCorreo.resending') : t('verificarCorreo.resend')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
