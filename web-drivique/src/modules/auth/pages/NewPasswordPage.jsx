import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNewPassword } from '../hooks/useNewPassword'
import RecoveryStepper from '../components/RecoveryStepper'
import AlertModal from '../../catalog/components/AlertModal'
import { FaExclamationTriangle } from 'react-icons/fa'

const IconoExito = () => (
  <svg width="42" height="42" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)

const IconoError = () => (
  <svg width="36" height="36" fill="none" stroke="#dc2626" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
)

function EyeIcon({ visible }) {
  return visible
    ? <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
    : <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
}

export default function NuevaContrasenaPage() {
  const { t } = useTranslation()
  const {
    contrasena, confirmar, mostrarPass, mostrarConf,
    cargando, error, tokenInvalido, exito,
    setContrasena, setConfirmar,
    setMostrarPass, setMostrarConf,
    fortaleza, esValida,
    handleSubmit,
  } = useNewPassword()
  
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (error) setShowModal(true)
  }, [error])

  return (
    <div style={{ minHeight: '112vh', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '24px', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', zoom: 0.9, position: 'relative', overflow: 'hidden' }}>
      
      {/* ── Background Animado ── */}
      <style>{`
        @keyframes float1 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(100px, 50px) scale(1.1); } }
        @keyframes float2 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(-100px, -50px) scale(1.15); } }
        @keyframes iconFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .input-premium:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important; background: #fff !important; }
        .btn-premium:hover { box-shadow: 0 12px 24px rgba(37,99,235,0.35) !important; transform: translateY(-2px) !important; }
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 24px 48px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.5) inset; }
      `}</style>
      <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(60px)', animation: 'float1 12s ease-in-out infinite alternate', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-15%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(147,197,253,0.2) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(60px)', animation: 'float2 16s ease-in-out infinite alternate', zIndex: 0 }} />


      <div style={{ width: '100%', maxWidth: '500px', zIndex: 1, position: 'relative' }}>
        
        <RecoveryStepper currentStep={exito ? 4 : 3} />

        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(37,99,235,0.12)', boxShadow: '0 4px 24px rgba(30,58,138,0.07)', padding: '48px 40px', position: 'relative', overflow: 'hidden', textAlign: 'left' }}>

          {/* ── Token inválido o expirado ── */}
          {tokenInvalido && (
            <div style={{ textAlign: 'center', animation: 'popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <div style={{ width: '88px', height: '88px', borderRadius: '24px', background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 12px 24px rgba(239,68,68,0.15)', border: '1px solid #fecaca', animation: 'iconFloat 4s ease-in-out infinite' }}>
                <IconoError />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                {t('nuevaContrasena.invalidToken')}
              </h2>
              <p style={{ color: '#475569', fontSize: '14px', margin: '0 0 36px', lineHeight: 1.6 }}>
                {t('nuevaContrasena.invalidTokenText')}
              </p>
              <Link
                to="/recuperar"
                className="btn-premium"
                style={{
                  display: 'block', width: '100%', padding: '16px', borderRadius: '14px',
                  background: 'linear-gradient(90deg, #1e3a8a, #2563eb)', color: '#fff',
                  fontWeight: 800, fontSize: '15px', textDecoration: 'none', textAlign: 'center',
                  boxShadow: '0 6px 20px rgba(30,58,138,0.2)', transition: 'all 200ms'
                }}
              >
                {t('nuevaContrasena.requestNew')}
              </Link>
            </div>
          )}

          {/* ── Pantalla de Éxito ── */}
          {!tokenInvalido && exito && (
            <div style={{ textAlign: 'center', animation: 'popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <div style={{ width: '88px', height: '88px', borderRadius: '24px', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', color: '#16a34a', boxShadow: '0 12px 24px rgba(22,163,74,0.15)', border: '1px solid #bbf7d0', animation: 'iconFloat 4s ease-in-out infinite' }}>
                <IconoExito />
              </div>
              <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                {t('nuevaContrasena.successTitle')}
              </h1>
              <p style={{ color: '#475569', fontSize: '14px', margin: '0 0 28px', lineHeight: 1.6 }}>
                {t('nuevaContrasena.successSubtitle')}
              </p>
              <div style={{ background: 'rgba(240, 253, 244, 0.7)', border: '1px solid rgba(187, 247, 208, 0.5)', borderRadius: '14px', padding: '16px', color: '#15803d', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '36px' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {t('nuevaContrasena.successLoginText')}
              </div>
              <Link
                to="/login"
                className="btn-premium"
                style={{
                  display: 'block', width: '100%', padding: '16px', borderRadius: '14px',
                  background: 'linear-gradient(90deg, #1e3a8a, #2563eb)', color: '#fff',
                  fontWeight: 800, fontSize: '15px', textDecoration: 'none', textAlign: 'center',
                  boxShadow: '0 6px 20px rgba(30,58,138,0.2)', transition: 'all 200ms'
                }}
              >
                {t('nuevaContrasena.goLogin')}
              </Link>
            </div>
          )}

          {/* ── Formulario ── */}
          {!tokenInvalido && !exito && (
            <div style={{ animation: 'popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <div style={{ marginBottom: '32px', textAlign: 'left' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                  {t('nuevaContrasena.formTitle')}
                </h1>
                <p style={{ color: '#475569', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                  {t('nuevaContrasena.formSubtitle')}
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
                    {t('nuevaContrasena.password')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={mostrarPass ? 'text' : 'password'}
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      disabled={cargando}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="input-premium"
                      style={{
                        width: '100%', padding: '16px 48px 16px 20px', borderRadius: '14px',
                        border: '1.5px solid rgba(203,213,225,0.6)', background: 'rgba(255,255,255,0.6)',
                        fontSize: '15px', color: '#0f172a', outline: 'none',
                        boxSizing: 'border-box', transition: 'all 200ms',
                      }}
                    />
                    <button type="button" onClick={() => setMostrarPass(!mostrarPass)}
                      style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, display: 'flex', transition: 'color 200ms' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
                      onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                    >
                      <EyeIcon visible={mostrarPass} />
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
                    {t('nuevaContrasena.confirmPassword')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={mostrarConf ? 'text' : 'password'}
                      value={confirmar}
                      onChange={(e) => setConfirmar(e.target.value)}
                      disabled={cargando}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="input-premium"
                      style={{
                        width: '100%', padding: '16px 48px 16px 20px', borderRadius: '14px',
                        border: confirmar && confirmar !== contrasena ? '1.5px solid #fca5a5' : '1.5px solid rgba(203,213,225,0.6)',
                        background: confirmar && confirmar !== contrasena ? 'rgba(254,242,242,0.8)' : 'rgba(255,255,255,0.6)',
                        fontSize: '15px', color: '#0f172a', outline: 'none',
                        boxSizing: 'border-box', transition: 'all 200ms',
                      }}
                    />
                    <button type="button" onClick={() => setMostrarConf(!mostrarConf)}
                      style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, display: 'flex', transition: 'color 200ms' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
                      onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                    >
                      <EyeIcon visible={mostrarConf} />
                    </button>
                  </div>
                </div>

                {/* ── Nuevo Checklist Glassmórfico ── */}
                <div style={{ background: 'rgba(240, 253, 244, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(187, 247, 208, 0.5)', borderRadius: '14px', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {fortaleza.map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 300ms', transform: r.cumple ? 'translateX(4px)' : 'translateX(0)' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: r.cumple ? '#22c55e' : 'rgba(203,213,225,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 300ms', boxShadow: r.cumple ? '0 0 10px rgba(34,197,94,0.3)' : 'none' }}>
                        <svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24" style={{ opacity: r.cumple ? 1 : 0, transition: 'opacity 300ms', transform: r.cumple ? 'scale(1)' : 'scale(0.5)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: r.cumple ? '#15803d' : '#64748b', transition: 'color 300ms' }}>
                        {t(r.key) || r.label}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={cargando || !esValida}
                  className="btn-premium"
                  style={{
                    width: '100%', padding: '16px', borderRadius: '14px',
                    background: 'linear-gradient(90deg, #1e3a8a, #2563eb)', color: '#fff',
                    fontWeight: 800, fontSize: '15px', border: 'none',
                    cursor: (cargando || !esValida) ? 'not-allowed' : 'pointer',
                    opacity: (cargando || !esValida) ? 0.6 : 1, transition: 'all 200ms',
                    marginTop: '8px', boxShadow: '0 6px 20px rgba(30,58,138,0.2)'
                  }}
                >
                  {cargando ? t('nuevaContrasena.submitting') : t('nuevaContrasena.submitBtn')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <AlertModal
          icon={<FaExclamationTriangle size={22} color="#1e3a8a" />}
          titulo="Error"
          mensaje={error}
          primaryText="OK"
          onPrimary={() => setShowModal(false)}
          onCerrar={() => setShowModal(false)}
          showCloseButton
        />
      )}
    </div>
  )
}
