import { Link } from 'react-router-dom'
import { useRecuperar } from '../hooks/useRecuperar'
import logo from '@/assets/logo/logo.png'

export default function RecuperarContrasenaPage() {
  const { correo, setCorreo, cargando, enviado, error, handleSubmit } = useRecuperar()

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
          <img src={logo} alt="RentaMovil" style={{ height: '60px', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.3)) brightness(0) invert(1)' }} />

          <div>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 900, margin: '0 0 10px', lineHeight: 1.2 }}>
              ¿Olvidaste tu contraseña?
            </h2>
            <p style={{ color: 'rgba(191,219,254,0.75)', fontSize: '15px', lineHeight: 1.7, maxWidth: '260px', margin: '0 auto' }}>
              Te enviaremos un enlace seguro para restablecer tu acceso.
            </p>
          </div>

          <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              '✓  Enlace válido por 30 minutos',
              '✓  Revisa tu bandeja de entrada',
              '✓  Sin perder tus datos ni reservas',
            ].map(t => (
              <p key={t} style={{ color: 'rgba(147,197,253,0.65)', fontSize: '14px', margin: 0, textAlign: 'left' }}>{t}</p>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '16px 56px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <p style={{ color: 'rgba(147,197,253,0.35)', fontSize: '12px', margin: 0 }}>RentaMóvil © 2026 · Ficha 3145555 — SENA CIES</p>
        </div>
      </div>

      {/* ── Panel derecho ── */}
      <div style={{ flex: 1, background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>

        {/* Logo mobile */}
        <div style={{ marginBottom: '32px' }} className="logo-mobile">
          <style>{`@media(min-width:1024px){.logo-mobile{display:none}}`}</style>
          <img src={logo} alt="RentaMovil" style={{ height: '48px', display: 'block', margin: '0 auto' }} />
        </div>

        <div style={{ width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '24px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', padding: '40px' }}>

          {!enviado ? (
            <>
              <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
                  Recuperar contraseña
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                  Ingresa tu correo y te enviaremos un enlace de recuperación
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

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    disabled={cargando}
                    placeholder="ejemplo@correo.com"
                    autoComplete="email"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '12px',
                      border: error ? '1.5px solid #f87171' : '1.5px solid #e2e8f0',
                      background: error ? '#fef2f2' : '#fff',
                      fontSize: '14px', color: '#1e293b', outline: 'none',
                      boxSizing: 'border-box', transition: 'border-color 150ms',
                    }}
                    onFocus={e => e.target.style.borderColor = '#1e3a8a'}
                    onBlur={e => e.target.style.borderColor = error ? '#f87171' : '#e2e8f0'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px',
                    background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', color: '#fff',
                    fontWeight: 700, fontSize: '14px', border: 'none',
                    cursor: cargando ? 'not-allowed' : 'pointer',
                    opacity: cargando ? 0.55 : 1,
                    boxShadow: '0 4px 16px rgba(30,58,138,0.25)', transition: 'opacity 150ms',
                  }}>
                  {cargando
                    ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                        Enviando...
                      </span>
                    : 'Enviar enlace de recuperación'
                  }
                </button>
              </form>
            </>
          ) : (
            /* ── Estado: correo enviado ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>📧</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
                Revisa tu correo
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 4px' }}>
                Enviamos un enlace de recuperación a
              </p>
              <p style={{ color: '#1e3a8a', fontSize: '14px', fontWeight: 700, margin: '0 0 16px' }}>
                {correo}
              </p>
              <div style={{ padding: '14px 16px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: '8px' }}>
                <p style={{ color: '#1e40af', fontSize: '13px', margin: 0 }}>
                  El enlace es válido por <strong>30 minutos</strong>. Si no lo ves, revisa tu bandeja de spam.
                </p>
              </div>
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '24px' }}>
            <Link to="/login" style={{ color: '#1e3a8a', fontWeight: 700, textDecoration: 'none' }}>
              ← Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}