import { useTranslation } from 'react-i18next'
import { FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa'
import { useVerify2FA } from '../hooks/useVerify2FA'
import { useLanding } from '@/modules/landing/LandingContext'
import logo from '@/assets/logocatalog.png'

export default function Verificar2FAPage() {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'

  const {
    codigo, cargando, error,
    segundos, reenviando,
    inputsRef, LARGO_CODIGO,
    handleCambioDigito, handleKeyDown,
    handlePaste, handleSubmit,
    handleReenviar, handleCancelar,
  } = useVerify2FA()

  const c = {
    pageBg: esModoOscuro ? '#0f172a' : 'radial-gradient(circle at top left, #dbeafe 0%, #eff6ff 28%, #f8fbff 100%)',
    containerBg: esModoOscuro ? '#0e172a' : '#ffffff',
    containerBorder: esModoOscuro ? '#1e293b' : 'rgba(148, 163, 184, 0.22)',
    containerShadow: esModoOscuro ? '0 30px 90px rgba(0, 0, 0, 0.6)' : '0 30px 90px rgba(15, 23, 42, 0.16)',
    panelLeftBg: esModoOscuro ? 'linear-gradient(160deg, #070d1e 0%, #0f172a 55%, #1e293b 100%)' : 'linear-gradient(140deg, #071b4d 0%, #123a93 55%, #2563eb 100%)',
    panelRightBg: esModoOscuro ? '#0e172a' : 'linear-gradient(145deg, #ffffff 0%, #f8fbff 100%)',
    cardBg: esModoOscuro ? '#172136' : 'rgba(255,255,255,0.96)',
    cardBorder: esModoOscuro ? '#23314d' : '#e6f0ff',
    cardShadow: esModoOscuro ? '0 22px 60px rgba(0,0,0,0.5)' : '0 22px 60px rgba(37, 99, 235, 0.14)',
    textPrimary: esModoOscuro ? '#ffffff' : '#0f172a',
    textSecondary: esModoOscuro ? '#94a3b8' : '#64748b',
    iconBadgeBg: esModoOscuro ? 'rgba(96, 165, 250, 0.12)' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    iconBadgeBorder: esModoOscuro ? 'rgba(96, 165, 250, 0.25)' : '#bfdbfe',
    iconColor: esModoOscuro ? '#60a5fa' : '#1d4ed8',
    inputBg: esModoOscuro ? '#0f172a' : '#ffffff',
    inputBorder: esModoOscuro ? '#23314d' : '#dbeafe',
    buttonBg: esModoOscuro ? 'linear-gradient(90deg, #1e3a8a, #2563eb)' : 'linear-gradient(90deg, #1d4ed8, #2563eb 60%, #3b82f6)',
    buttonBorder: esModoOscuro ? '#3b82f6' : '#60a5fa',
    errorBg: esModoOscuro ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
    errorBorder: esModoOscuro ? 'rgba(239, 68, 68, 0.25)' : '#fecaca',
    errorText: esModoOscuro ? '#f87171' : '#dc2626',
    cancelBg: esModoOscuro ? '#172136' : '#eff6ff',
    cancelBorder: esModoOscuro ? '#23314d' : '#bfdbfe',
    cancelText: esModoOscuro ? '#60a5fa' : '#2563eb',
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
      <div style={{
        width: '100%',
        maxWidth: '1120px',
        minHeight: '680px',
        borderRadius: '32px',
        overflow: 'hidden',
        boxShadow: c.containerShadow,
        border: `1px solid ${c.containerBorder}`,
        display: 'flex',
        background: c.containerBg,
        transition: 'all 300ms ease'
      }}>
        {/* Panel izquierdo en desktop */}
        <div style={{
          flex: '0 0 46%',
          background: c.panelLeftBg,
          padding: '44px 40px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden'
        }} className="lg-panel-left">
          <style>{`@media(min-width:1024px){.lg-panel-left{display:flex !important}}`}</style>

          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(96,165,250,0.16), transparent 32%)' }} />
          <div style={{ position: 'absolute', top: '-90px', left: '-90px', width: '280px', height: '280px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)' }} />
          <div style={{ position: 'absolute', bottom: '-80px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={logo} alt="Drivique" style={{ height: '40px', width: 'auto', display: 'block', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))' }} />
            <span style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontSize: '18px', letterSpacing: '0.14em', color: '#93c5fd', textTransform: 'uppercase' }}>
              DRIVIQUE
            </span>
          </div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '340px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.14)', color: '#dbeafe', fontSize: '13px', fontWeight: 700, marginBottom: '16px', border: '1px solid rgba(255,255,255,0.18)' }}>
              <FaShieldAlt size={14} color="#60a5fa" />
              <span>{t('verificar2fa.panelTitle')}</span>
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
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(219, 234, 254, 0.9)', fontSize: '14px', fontWeight: 600 }}>
                <FaCheckCircle size={14} color="#60a5fa" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho del formulario */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', background: c.panelRightBg }} className="auth-contenedor">
          <div style={{ width: '100%', maxWidth: '440px' }}>
            
            <button
              type="button"
              onClick={handleCancelar}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: c.cancelText,
                fontWeight: 700,
                background: c.cancelBg,
                border: `1px solid ${c.cancelBorder}`,
                borderRadius: '999px',
                cursor: 'pointer',
                padding: '8px 14px',
                marginBottom: '20px',
                boxShadow: esModoOscuro ? 'none' : '0 8px 18px rgba(37, 99, 235, 0.12)',
                transition: 'all 150ms ease'
              }}
            >
              <FaArrowLeft size={12} />
              {t('verificar2fa.backToLogin')}
            </button>

            <div style={{
              background: c.cardBg,
              borderRadius: '28px',
              boxShadow: c.cardShadow,
              border: `1px solid ${c.cardBorder}`,
              padding: '36px 32px',
              position: 'relative',
              overflow: 'hidden'
            }} className="auth-card">
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #1d4ed8, #2563eb, #60a5fa)' }} />

              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '22px',
                  background: c.iconBadgeBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: `1px solid ${c.iconBadgeBorder}`,
                  boxShadow: esModoOscuro ? 'none' : '0 12px 28px rgba(37,99,235,0.16)'
                }}>
                  <FaShieldAlt size={36} color={c.iconColor} />
                </div>
                <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: esModoOscuro ? '#ffffff' : '#1e3a8a', margin: '0 0 8px' }}>
                  {t('verificar2fa.title')}
                </h1>
                <p style={{ color: c.textSecondary, fontSize: '14px', lineHeight: 1.65, margin: 0 }}>
                  {t('verificar2fa.subtitle')}
                </p>
              </div>

              {error && (
                <div style={{ position: 'relative', zIndex: 1, marginBottom: '20px', padding: '13px 14px', borderRadius: '12px', background: c.errorBg, border: `1px solid ${c.errorBorder}`, display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <FaExclamationTriangle size={18} color={c.errorText} style={{ flexShrink: 0 }} />
                  <p style={{ color: c.errorText, fontSize: '14px', margin: 0, lineHeight: 1.45, textAlign: 'left' }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${LARGO_CODIGO}, minmax(0, 1fr))`,
                  gap: '10px',
                  marginBottom: '22px',
                  padding: '10px',
                  borderRadius: '18px',
                  background: esModoOscuro ? '#0f172a' : '#f8fbff',
                  border: `1px solid ${c.inputBorder}`
                }} onPaste={handlePaste}>
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
                        color: c.textPrimary,
                        borderRadius: '12px',
                        border: error ? `2px solid ${c.errorText}` : codigo[i] ? '2px solid #2563eb' : c.inputBorder,
                        background: c.inputBg,
                        outline: 'none',
                        transition: 'all 180ms ease',
                        boxShadow: codigo[i] ? '0 0 0 4px rgba(37, 99, 235, 0.14)' : 'none',
                      }}
                      onFocus={(e) => {
                        if (!error) {
                          e.target.style.borderColor = '#2563eb'
                          e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.14)'
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = error ? c.errorText : codigo[i] ? '#2563eb' : c.inputBorder
                        e.target.style.boxShadow = codigo[i] ? '0 0 0 4px rgba(37, 99, 235, 0.14)' : 'none'
                      }}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={cargando || codigo.length < LARGO_CODIGO}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: c.buttonBg,
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '14px',
                    border: `1px solid ${c.buttonBorder}`,
                    cursor: (cargando || codigo.length < LARGO_CODIGO) ? 'not-allowed' : 'pointer',
                    opacity: (cargando || codigo.length < LARGO_CODIGO) ? 0.6 : 1,
                    boxShadow: '0 14px 28px rgba(37, 99, 235, 0.24)',
                    transition: 'transform 150ms ease, box-shadow 150ms ease',
                    marginBottom: '16px',
                  }}
                >
                  {cargando ? t('verificar2fa.verifying') : t('verificar2fa.submit')}
                </button>

                <div style={{ textAlign: 'center' }}>
                  {segundos > 0 ? (
                    <span style={{ fontSize: '13px', fontWeight: 600, color: c.textSecondary }}>
                      {t('verificar2fa.resendCountdown', { seconds })}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleReenviar}
                      disabled={reenviando}
                      style={{ background: 'none', border: 'none', cursor: reenviando ? 'not-allowed' : 'pointer', color: '#2563eb', fontSize: '13px', fontWeight: 700, padding: 0, opacity: reenviando ? 0.65 : 1 }}
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
    </div>
  )
}