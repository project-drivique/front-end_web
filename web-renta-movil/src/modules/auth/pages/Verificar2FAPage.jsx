import { useTranslation } from 'react-i18next'
import { useVerificar2FA } from '../hooks/useVerificar2FA'
import logo from '@/assets/logo.png'

export default function Verificar2FAPage() {
  const { t } = useTranslation()
  const {
    codigo, cargando, error,
    segundos, reenviando,
    inputsRef, LARGO_CODIGO,
    handleCambioDigito, handleKeyDown,
    handlePaste, handleSubmit,
    handleReenviar, handleCancelar,
  } = useVerificar2FA()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'radial-gradient(circle at top left, #dbeafe 0%, #eff6ff 28%, #f8fbff 100%)', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '1120px', minHeight: '700px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 30px 90px rgba(15, 23, 42, 0.16)', border: '1px solid rgba(148, 163, 184, 0.22)', display: 'flex', background: '#ffffff' }}>
        <div style={{ flex: '0 0 46%', background: 'linear-gradient(140deg, #071b4d 0%, #123a93 55%, #2563eb 100%)', padding: '44px 40px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }} className="lg-panel-left">
          <style>{`@media(min-width:1024px){.lg-panel-left{display:flex !important}}`}</style>

          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(96,165,250,0.16), transparent 32%)' }} />
          <div style={{ position: 'absolute', top: '-90px', left: '-90px', width: '280px', height: '280px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)' }} />
          <div style={{ position: 'absolute', bottom: '-80px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <img src={logo} alt="Drivique" style={{ height: '94px', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.24)) brightness(0) invert(1)' }} />
          </div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '340px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.14)', color: '#dbeafe', fontSize: '13px', fontWeight: 700, marginBottom: '16px', border: '1px solid rgba(255,255,255,0.18)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z" />
              </svg>
              Seguridad reforzada
            </div>
            <h2 style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 900, margin: '0 0 12px', lineHeight: 1.1 }}>
              {t('verificar2fa.panelTitle')}
            </h2>
            <p style={{ color: 'rgba(219, 234, 254, 0.82)', fontSize: '15px', lineHeight: 1.75, margin: 0 }}>
              {t('verificar2fa.panelSubtitle')}
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '340px' }}>
            {[t('verificar2fa.panelCheck1'), t('verificar2fa.panelCheck2'), t('verificar2fa.panelCheck3')].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(219, 234, 254, 0.9)', fontSize: '14px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 0 6px rgba(96, 165, 250, 0.16)', flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', background: 'linear-gradient(145deg, #ffffff 0%, #f8fbff 100%)' }} className="auth-contenedor">
          <div style={{ width: '100%', maxWidth: '440px' }}>
            <div style={{ marginBottom: '18px' }} className="logo-mobile">
              <style>{`@media(min-width:1024px){.logo-mobile{display:none}}`}</style>
              <img src={logo} alt="Drivique" style={{ height: '72px', display: 'block', margin: '0 auto' }} />
            </div>

            <button
              type="button"
              onClick={handleCancelar}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#2563eb', fontWeight: 700, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '999px', cursor: 'pointer', padding: '8px 12px', marginBottom: '16px', boxShadow: '0 8px 18px rgba(37, 99, 235, 0.12)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.borderColor = '#60a5fa' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe' }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {t('verificar2fa.backToLogin')}
            </button>

            <div style={{ background: 'rgba(255,255,255,0.96)', borderRadius: '28px', boxShadow: '0 22px 60px rgba(37, 99, 235, 0.14)', border: '1px solid #e6f0ff', padding: '32px', position: 'relative', overflow: 'hidden' }} className="auth-card">
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(37,99,235,0.05) 0%, rgba(255,255,255,0) 100%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #1d4ed8, #2563eb, #60a5fa)' }} />

              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ width: '76px', height: '76px', borderRadius: '22px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8), 0 12px 28px rgba(37,99,235,0.16)', border: '1px solid #bfdbfe' }}>
                  <svg width="34" height="34" fill="none" stroke="#1d4ed8" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z" />
                  </svg>
                </div>
                <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
                  {t('verificar2fa.title')}
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>
                  {t('verificar2fa.subtitle')}
                </p>
              </div>

              {error && (
                <div style={{ position: 'relative', zIndex: 1, marginBottom: '20px', padding: '13px 14px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <svg style={{ width: '18px', height: '18px', color: '#dc2626', flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p style={{ color: '#dc2626', fontSize: '14px', margin: 0, lineHeight: 1.45 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: `repeat(${LARGO_CODIGO}, minmax(0, 1fr))`, gap: '10px', marginBottom: '22px', padding: '10px', borderRadius: '18px', background: '#f8fbff', border: '1px solid #dbeafe' }} onPaste={handlePaste}>
                  {Array.from({ length: LARGO_CODIGO }).map((_, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputsRef.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={codigo[i] || ''}
                      onChange={(e) => handleCambioDigito(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      disabled={cargando}
                      style={{
                        width: '100%',
                        height: '60px',
                        textAlign: 'center',
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        borderRadius: '14px',
                        border: error ? '2px solid #f87171' : codigo[i] ? '2px solid #2563eb' : '2px solid #bfdbfe',
                        background: error ? '#fef2f2' : codigo[i] ? '#f8fbff' : '#ffffff',
                        outline: 'none',
                        transition: 'all 180ms ease',
                        boxShadow: codigo[i] ? '0 0 0 4px rgba(37, 99, 235, 0.14)' : '0 2px 8px rgba(15, 23, 42, 0.04)',
                        caretColor: 'transparent',
                      }}
                      onFocus={(e) => {
                        if (!error) {
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

                <button
                  type="submit"
                  disabled={cargando || codigo.length < LARGO_CODIGO}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: 'linear-gradient(90deg,#1d4ed8,#2563eb 60%,#3b82f6)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '14px',
                    border: '1px solid #60a5fa',
                    cursor: cargando || codigo.length < LARGO_CODIGO ? 'not-allowed' : 'pointer',
                    opacity: cargando || codigo.length < LARGO_CODIGO ? 0.6 : 1,
                    boxShadow: '0 14px 28px rgba(37, 99, 235, 0.24)',
                    transition: 'transform 150ms ease, box-shadow 150ms ease',
                    marginBottom: '20px',
                  }}
                  onMouseEnter={(e) => {
                    if (!cargando && codigo.length >= LARGO_CODIGO) {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 16px 32px rgba(37, 99, 235, 0.28)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 14px 28px rgba(37, 99, 235, 0.24)'
                  }}
                >
                  {cargando ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      {t('verificar2fa.verifying')}
                    </span>
                  ) : t('verificar2fa.submit')}
                </button>

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px' }}>
                    {t('verificar2fa.codeLabel')}
                  </p>
                  {segundos > 0 ? (
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                      {t('verificar2fa.resendCountdown', { seconds: segundos })}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleReenviar}
                      disabled={reenviando}
                      style={{ background: 'none', border: 'none', cursor: reenviando ? 'not-allowed' : 'pointer', color: '#1e3a8a', fontSize: '13px', fontWeight: 700, padding: 0, opacity: reenviando ? 0.65 : 1 }}
                    >
                      {reenviando ? t('verificar2fa.resending') : t('verificar2fa.resend')}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}