import { useTranslation } from 'react-i18next'
import { useVerificar2FA } from '../hooks/useVerificar2FA'
import logo from '@/assets/logo.png'

export default function Verificar2FAPage() {
  const { t } = useTranslation()
  const {
    codigo, cargando, error, exito,
    segundos, reenviando,
    inputsRef, LARGO_CODIGO,
    handleCambioDigito, handleKeyDown,
    handlePaste, handleSubmit,
    handleReenviar, handleCancelar,
  } = useVerificar2FA()

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* ── Panel izquierdo ── */}
      <div style={{
        display: 'none', width: '48%', flexDirection: 'column',
        background: 'linear-gradient(160deg,#060e2e 0%,#0c1f5c 50%,#1e3a8a 100%)',
        position: 'relative', overflow: 'hidden',
      }} className="lg-panel-left">
        <style>{`@media(min-width:1024px){.lg-panel-left{display:flex !important}}`}</style>

        <div style={{ position: 'absolute', top: '-120px', left: '-120px', width: '480px', height: '480px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }} />
        <div style={{ position: 'absolute', top: '33%', right: '-100px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(96,165,250,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '25%', width: '380px', height: '380px', borderRadius: '50%', background: 'rgba(99,102,241,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '33%', right: '40px', width: '160px', height: '160px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }} />

        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px', textAlign: 'center', gap: '32px' }}>
          <img src={logo} alt="Drivique" style={{ height: '60px', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.3)) brightness(0) invert(1)' }} />
          <div>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 900, margin: '0 0 10px', lineHeight: 1.2 }}>
              Verificación en dos pasos
            </h2>
            <p style={{ color: 'rgba(191,219,254,0.75)', fontSize: '15px', lineHeight: 1.7, maxWidth: '260px', margin: '0 auto' }}>
              Tu cuenta está protegida con una capa extra de seguridad.
            </p>
          </div>
          <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              '✓  Código válido por 10 minutos',
              '✓  Revisa tu correo o app autenticadora',
              '✓  Nunca compartás tu código',
            ].map(item => (
              <p key={item} style={{ color: 'rgba(147,197,253,0.65)', fontSize: '14px', margin: 0, textAlign: 'left' }}>{item}</p>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '16px 56px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <p style={{ color: 'rgba(147,197,253,0.35)', fontSize: '12px', margin: 0 }}>Drivique © 2026</p>
        </div>
      </div>

      {/* ── Panel derecho ── */}
      <div style={{ flex: 1, background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>

        {/* Logo mobile */}
        <div style={{ marginBottom: '32px' }} className="logo-mobile">
          <style>{`@media(min-width:1024px){.logo-mobile{display:none}}`}</style>
          <img src={logo} alt="Drivique" style={{ height: '48px', display: 'block', margin: '0 auto' }} />
        </div>

        {/* Volver */}
        {!exito && (
          <div style={{ width: '100%', maxWidth: '400px', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={handleCancelar}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = '#1e3a8a'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {t('verificar2fa.backToLogin')}
            </button>
          </div>
        )}

        <div style={{ width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '24px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', padding: '40px' }}>

          {/* ── Éxito ── */}
          {exito ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="36" height="36" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
                {t('verificar2fa.successTitle')}
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                {t('common.loading')}
              </p>
            </div>

          ) : (
            <>
              {/* Icono escudo */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#eff6ff', border: '2px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="32" height="32" fill="none" stroke="#1d4ed8" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
                  {t('verificar2fa.title')}
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                  {t('verificar2fa.subtitle')}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <svg style={{ width: '18px', height: '18px', color: '#dc2626', flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>

                {/* ── Inputs del código ── */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '28px' }} onPaste={handlePaste}>
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
                      disabled={cargando}
                      style={{
                        width: '48px', height: '56px', textAlign: 'center',
                        fontSize: '1.5rem', fontWeight: 700, color: '#0f172a',
                        borderRadius: '12px', border: error ? '2px solid #f87171' : codigo[i] ? '2px solid #1e3a8a' : '2px solid #e2e8f0',
                        background: error ? '#fef2f2' : codigo[i] ? '#eff6ff' : '#f8fafc',
                        outline: 'none', transition: 'all 150ms',
                        caretColor: 'transparent',
                      }}
                      onFocus={e => { if (!error) e.target.style.borderColor = '#1e3a8a'; e.target.style.background = '#eff6ff' }}
                      onBlur={e => { e.target.style.borderColor = error ? '#f87171' : codigo[i] ? '#1e3a8a' : '#e2e8f0'; e.target.style.background = error ? '#fef2f2' : codigo[i] ? '#eff6ff' : '#f8fafc' }}
                    />
                  ))}
                </div>

                {/* Botón verificar */}
                <button
                  type="submit"
                  disabled={cargando || codigo.length < LARGO_CODIGO}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px',
                    background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', color: '#fff',
                    fontWeight: 700, fontSize: '14px', border: 'none',
                    cursor: (cargando || codigo.length < LARGO_CODIGO) ? 'not-allowed' : 'pointer',
                    opacity: (cargando || codigo.length < LARGO_CODIGO) ? 0.55 : 1,
                    boxShadow: '0 4px 16px rgba(30,58,138,0.25)', transition: 'opacity 150ms',
                    marginBottom: '20px',
                  }}>
                  {cargando
                    ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                        {t('verificar2fa.verifying')}
                      </span>
                    : t('verificar2fa.submit')
                  }
                </button>

                {/* Reenviar código */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 6px' }}>
                    {t('verificar2fa.codeLabel')}
                  </p>
                  {segundos > 0 ? (
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                      Reenviar en <strong style={{ color: '#475569' }}>{segundos}s</strong>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleReenviar}
                      disabled={reenviando}
                      style={{ background: 'none', border: 'none', cursor: reenviando ? 'not-allowed' : 'pointer', color: '#1e3a8a', fontSize: '13px', fontWeight: 700, padding: 0, opacity: reenviando ? 0.6 : 1 }}
                    >
                      {reenviando ? t('verificar2fa.resending') : t('verificar2fa.resend')}
                    </button>
                  )}
                </div>

              </form>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}