import { useTranslation } from 'react-i18next'
import { useVerifyEmail } from '../hooks/useVerifyEmail'
import logo from '@/assets/logo.png'

const formatearTiempo = (segundos) => {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const IconoSobre = () => (
  <svg width="42" height="42" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
)

const IconoCheck = () => (
  <svg width="42" height="42" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)

export default function VerificarCorreoPage() {
  const { t } = useTranslation()
  const {
    correo, codigoEnviado, enviando, handleEnviarCodigo,
    codigo, cargando, error, exito, expirado,
    segundosReenvio, segundosExpiracion, reenviando,
    inputsRef, LARGO_CODIGO,
    handleCambioDigito, handleKeyDown,
    handlePaste, handleSubmit,
    handleReenviar, handleCancelar,
  } = useVerifyEmail()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <img src={logo} alt="Drivique" style={{ height: '60px', display: 'inline-block' }} />
        </div>

        <div style={{ background: 'rgba(255,255,255,0.98)', borderRadius: '28px', border: '1px solid #dbeafe', boxShadow: '0 20px 50px rgba(37, 99, 235, 0.12)', padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(37,99,235,0.04) 0%, rgba(255,255,255,0) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #1d4ed8, #2563eb, #60a5fa)' }} />

          {exito ? (
            /* ── Pantalla 3: éxito ── */
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '22px', background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 24px rgba(34, 197, 94, 0.16)', border: '1px solid #86efac' }}>
                <svg width="40" height="40" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
                {t('verificarCorreo.successTitle')}
              </h1>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                {t('verificarCorreo.successSubtitle')}
              </p>
            </div>

          ) : !codigoEnviado ? (
            /* ── Pantalla 1: confirmar antes de enviar ── */
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '22px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 24px rgba(37,99,235,0.16)', border: '1px solid #bfdbfe' }}>
                <svg width="40" height="40" fill="none" stroke="#1d4ed8" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>

              <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0f172a', margin: '0 0 12px' }}>
                {t('verificarCorreo.sendTitle')}
              </h1>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.65, margin: '0 0 20px' }}>
                {t('verificarCorreo.sendSubtitle')}<br />
                <span style={{ fontWeight: 700, color: '#1e293b' }}>{correo}</span>
              </p>

              {error && (
                <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <svg style={{ width: '18px', height: '18px', color: '#dc2626', flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
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
                  background: 'linear-gradient(90deg,#1d4ed8,#2563eb 60%,#3b82f6)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '14px',
                  border: '1px solid #60a5fa',
                  cursor: enviando ? 'not-allowed' : 'pointer',
                  opacity: enviando ? 0.6 : 1,
                  boxShadow: '0 14px 28px rgba(37, 99, 235, 0.24)',
                  transition: 'transform 150ms ease, box-shadow 150ms ease',
                  marginBottom: '16px',
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

              <button
                type="button"
                onClick={handleCancelar}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '13px', fontWeight: 600, padding: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#64748b' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8' }}
              >
                {t('verificarCorreo.backToRegistro')}
              </button>
            </div>

          ) : (
            /* ── Pantalla 2: ingresar el código ── */
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '22px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 10px 24px rgba(37,99,235,0.16)', border: '1px solid #bfdbfe' }}>
                  <svg width="40" height="40" fill="none" stroke="#1d4ed8" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
                  {t('verificarCorreo.title')}
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>
                  {t('verificarCorreo.subtitle')}<br />
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{correo}</span>
                </p>
              </div>

              {error && (
                <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <svg style={{ width: '18px', height: '18px', color: '#dc2626', flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${LARGO_CODIGO}, minmax(0, 1fr))`, gap: '10px', marginBottom: '18px', padding: '10px', borderRadius: '18px', background: '#f8fbff', border: '1px solid #dbeafe' }} onPaste={handlePaste}>
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
                        color: '#0f172a',
                        borderRadius: '12px',
                        border: error ? '2px solid #f87171' : codigo[i] ? '2px solid #2563eb' : '2px solid #bfdbfe',
                        background: error ? '#fef2f2' : codigo[i] ? '#f8fbff' : '#ffffff',
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
                        e.target.style.background = '#f8fbff'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = error ? '#f87171' : codigo[i] ? '#2563eb' : '#bfdbfe'
                        e.target.style.boxShadow = codigo[i] ? '0 0 0 4px rgba(37, 99, 235, 0.14)' : '0 2px 8px rgba(15, 23, 42, 0.04)'
                        e.target.style.background = error ? '#fef2f2' : codigo[i] ? '#f8fbff' : '#ffffff'
                      }}
                    />
                  ))}
                </div>

                <p style={{ textAlign: 'center', fontSize: '13px', color: expirado ? '#ef4444' : '#94a3b8', fontWeight: expirado ? 700 : 500, margin: '0 0 16px' }}>
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
                    background: 'linear-gradient(90deg,#1d4ed8,#2563eb 60%,#3b82f6)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '14px',
                    border: '1px solid #60a5fa',
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

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={handleCancelar}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '13px', fontWeight: 600, padding: 0 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#64748b' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8' }}
                >
                  {t('verificarCorreo.backToRegistro')}
                </button>

                {segundosReenvio > 0 ? (
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
