import { Link } from 'react-router-dom'
import { useLogin } from '../hooks/useLogin'
import logo from "@/assets/logo/logo.png"

export default function LoginPage() {
  const {
    correo, contrasena, mostrarPass, cargando,
    intentos, bloqueado, errores, exito,
    setContrasena, setMostrarPass,
    handleCorreoChange, handleSubmit,
    MAX_INTENTOS,
  } = useLogin()

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
            <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 900, margin: '0 0 10px', lineHeight: 1.2 }}>Bienvenido de vuelta</h2>
            <p style={{ color: 'rgba(191,219,254,0.75)', fontSize: '15px', lineHeight: 1.7, maxWidth: '260px', margin: '0 auto' }}>
              Gestiona tus reservas, pagos y contratos desde un solo lugar.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', width: '100%', maxWidth: '280px' }}>
            {[{ label: 'Reservas', icon: '🗓️' }, { label: 'Pagos', icon: '💳' }, { label: 'Contratos', icon: '📄' }].map(({ label, icon }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px 8px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
                <p style={{ color: '#fff', fontSize: '12px', fontWeight: 700, margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>

          <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['✓  Reserva en minutos', '✓  Paga con Nequi o PSE', '✓  Contrato digital inmediato'].map(t => (
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

        <div style={{ marginBottom: '32px' }} className="logo-mobile">
          <style>{`@media(min-width:1024px){.logo-mobile{display:none}}`}</style>
          <img src={logo} alt="RentaMovil" style={{ height: '48px', display: 'block', margin: '0 auto' }} />
        </div>

        <div style={{ width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '24px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', padding: '40px' }}>

          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>Iniciar sesión</h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Ingresa tus credenciales para continuar</p>
          </div>

          {exito && (
            <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <svg style={{ width: '18px', height: '18px', color: '#16a34a', flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p style={{ color: '#15803d', fontSize: '14px', fontWeight: 500, margin: 0 }}>{exito}</p>
            </div>
          )}

          {errores.general && (
            <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <svg style={{ width: '18px', height: '18px', color: '#dc2626', flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{errores.general}</p>
            </div>
          )}

          {intentos > 0 && !bloqueado && (
            <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <svg style={{ width: '18px', height: '18px', color: '#d97706', flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p style={{ color: '#92400e', fontSize: '14px', margin: 0 }}>Intento {intentos} de {MAX_INTENTOS}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Correo electrónico</label>
              <input
                type="email" value={correo}
                onChange={(e) => handleCorreoChange(e.target.value)}
                disabled={bloqueado || cargando}
                placeholder="ejemplo@correo.com"
                autoComplete="email"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  border: errores.correo ? '1.5px solid #f87171' : '1.5px solid #e2e8f0',
                  background: errores.correo ? '#fef2f2' : '#fff',
                  fontSize: '14px', color: '#1e293b', outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 150ms',
                }}
                onFocus={e => e.target.style.borderColor = '#1e3a8a'}
                onBlur={e => e.target.style.borderColor = errores.correo ? '#f87171' : '#e2e8f0'}
              />
              {errores.correo && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{errores.correo}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarPass ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  disabled={bloqueado || cargando}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '12px 48px 12px 16px', borderRadius: '12px',
                    border: errores.contrasena ? '1.5px solid #f87171' : '1.5px solid #e2e8f0',
                    background: errores.contrasena ? '#fef2f2' : '#fff',
                    fontSize: '14px', color: '#1e293b', outline: 'none',
                    boxSizing: 'border-box', transition: 'border-color 150ms',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1e3a8a'}
                  onBlur={e => e.target.style.borderColor = errores.contrasena ? '#f87171' : '#e2e8f0'}
                />
                <button type="button" onClick={() => setMostrarPass(!mostrarPass)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
                  {mostrarPass
                    ? <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    : <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  }
                </button>
              </div>
              {errores.contrasena && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{errores.contrasena}</p>}
            </div>

            {/* ✅ ÚNICO CAMBIO: /forgot-password → /recuperar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/recuperar" style={{ fontSize: '13px', color: '#1e3a8a', fontWeight: 700, textDecoration: 'none' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" disabled={bloqueado || cargando}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', color: '#fff',
                fontWeight: 700, fontSize: '14px', border: 'none', cursor: cargando || bloqueado ? 'not-allowed' : 'pointer',
                opacity: bloqueado || cargando ? 0.55 : 1,
                boxShadow: '0 4px 16px rgba(30,58,138,0.25)', transition: 'opacity 150ms',
              }}>
              {cargando
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    Verificando...
                  </span>
                : 'Iniciar sesión'
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '24px' }}>
            ¿No tienes cuenta?{' '}
            <Link to="/registro" style={{ color: '#1e3a8a', fontWeight: 700, textDecoration: 'none' }}>Regístrate aquí</Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}