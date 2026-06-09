import { Link, useNavigate } from 'react-router-dom'
import { useLogin } from '../hooks/useLogin'
import { useRegistroSocial } from '../hooks/useRegistroSocial'
import { useLanding } from '../../landing/LandingContext'
import logo from "@/assets/logo/logo.png"
import { FaCalendarAlt, FaCreditCard, FaFileAlt, FaCheck } from 'react-icons/fa'

const COLOR_MARCA = '#1e3a8a'
const COLOR_MARCA_HOVER = '#2563eb'

const coloresLogin = (esModoOscuro) => ({
  pageBg: esModoOscuro ? '#0b1220' : '#f8fafc',
  cardBg: esModoOscuro ? '#111827' : '#ffffff',
  cardBorder: esModoOscuro ? '#1f2937' : '#f1f5f9',
  cardShadow: esModoOscuro ? '0 12px 40px rgba(0,0,0,0.35)' : '0 8px 40px rgba(0,0,0,0.08)',
  title: esModoOscuro ? '#f8fafc' : '#0f172a',
  text: esModoOscuro ? '#cbd5e1' : '#64748b',
  label: esModoOscuro ? '#e5e7eb' : '#374151',
  inputBg: esModoOscuro ? '#0f172a' : '#ffffff',
  inputText: esModoOscuro ? '#f8fafc' : '#1e293b',
  inputBorder: esModoOscuro ? '#334155' : '#e2e8f0',
  inputBorderHover: esModoOscuro ? '#60a5fa' : COLOR_MARCA,
  inputPlaceholder: esModoOscuro ? '#94a3b8' : '#94a3b8',
  inputErrorBg: esModoOscuro ? 'rgba(127,29,29,0.22)' : '#fef2f2',
  inputErrorBorder: esModoOscuro ? '#f87171' : '#f87171',
  helperError: esModoOscuro ? '#fca5a5' : '#ef4444',
  backLink: esModoOscuro ? '#94a3b8' : '#64748b',
  backLinkHover: esModoOscuro ? '#93c5fd' : COLOR_MARCA,
  eyeIcon: esModoOscuro ? '#94a3b8' : '#94a3b8',
  forgot: esModoOscuro ? '#93c5fd' : COLOR_MARCA,
  socialBg: esModoOscuro ? '#0f172a' : '#ffffff',
  socialBorder: esModoOscuro ? '#334155' : '#e2e8f0',
  socialHoverBg: esModoOscuro ? '#172033' : '#f8fafc',
  socialHoverBorder: esModoOscuro ? '#475569' : '#cbd5e1',
  socialText: esModoOscuro ? '#e5e7eb' : '#1e293b',
  footerText: esModoOscuro ? '#94a3b8' : '#64748b',
  registerLink: esModoOscuro ? '#93c5fd' : COLOR_MARCA,
  successBg: esModoOscuro ? 'rgba(20,83,45,0.30)' : '#f0fdf4',
  successBorder: esModoOscuro ? '#166534' : '#bbf7d0',
  successText: esModoOscuro ? '#86efac' : '#15803d',
  successIcon: esModoOscuro ? '#4ade80' : '#16a34a',
  errorBg: esModoOscuro ? 'rgba(127,29,29,0.25)' : '#fef2f2',
  errorBorder: esModoOscuro ? '#7f1d1d' : '#fecaca',
  errorText: esModoOscuro ? '#fca5a5' : '#dc2626',
  errorIcon: esModoOscuro ? '#f87171' : '#dc2626',
  warnBg: esModoOscuro ? 'rgba(120,53,15,0.28)' : '#fffbeb',
  warnBorder: esModoOscuro ? '#92400e' : '#fde68a',
  warnText: esModoOscuro ? '#fcd34d' : '#92400e',
  warnIcon: esModoOscuro ? '#f59e0b' : '#d97706',
})

function SpinnerBtn({ esModoOscuro = false }) {
  return (
    <span
      style={{
        width: '16px',
        height: '16px',
        border: `2px solid ${esModoOscuro ? 'rgba(255,255,255,0.18)' : '#e2e8f0'}`,
        borderTopColor: esModoOscuro ? '#cbd5e1' : '#64748b',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        display: 'inline-block',
        flexShrink: 0
      }}
    />
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'
  const c = coloresLogin(esModoOscuro)

  const {
    correo, contrasena, mostrarPass, cargando,
    intentos, bloqueado, errores, exito,
    setContrasena, setMostrarPass,
    handleCorreoChange, handleSubmit,
    MAX_INTENTOS,
  } = useLogin()

  const {
    cargandoGoogle, cargandoFacebook, errorSocial,
    proveedorExito, iniciarGoogle, iniciarFacebook,
  } = useRegistroSocial({
    onExito: () => {
      navigate('/catalogo')
    },
  })

  const exitoFinal = !!proveedorExito

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: c.pageBg }}>
      <div
        style={{
          display: 'none',
          width: '48%',
          flexDirection: 'column',
          background: 'linear-gradient(160deg,#060e2e 0%,#0c1f5c 50%,#1e3a8a 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="lg-panel-left"
      >
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
            {[
              { label: 'Reservas', icon: FaCalendarAlt },
              { label: 'Pagos', icon: FaCreditCard },
              { label: 'Contratos', icon: FaFileAlt }
            ].map(({ label, icon: Icono }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px 8px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icono />
                </div>
                <p style={{ color: '#fff', fontSize: '12px', fontWeight: 700, margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>

          <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'Reserva en minutos',
              'Paga con Nequi o PSE',
              'Contrato digital inmediato'
            ].map(t => (
              <p key={t} style={{ color: 'rgba(147,197,253,0.75)', fontSize: '14px', margin: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCheck />
                {t}
              </p>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '16px 56px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <p style={{ color: 'rgba(147,197,253,0.35)', fontSize: '12px', margin: 0 }}>RentaMóvil © 2026</p>
        </div>
      </div>

      <div style={{ flex: 1, background: c.pageBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ marginBottom: '32px' }} className="logo-mobile">
          <style>{`@media(min-width:1024px){.logo-mobile{display:none}}`}</style>
          <img
            src={logo}
            alt="RentaMovil"
            style={{
              height: '48px',
              display: 'block',
              margin: '0 auto',
              ...(esModoOscuro ? { filter: 'brightness(0) invert(1)' } : {})
            }}
          />
        </div>

        <div style={{ width: '100%', maxWidth: '400px', marginBottom: '12px' }}>
          <Link
            to="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: c.backLink, textDecoration: 'none', fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.color = c.backLinkHover}
            onMouseLeave={e => e.currentTarget.style.color = c.backLink}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </Link>
        </div>

        <div style={{ width: '100%', maxWidth: '400px', background: c.cardBg, borderRadius: '24px', boxShadow: c.cardShadow, border: `1px solid ${c.cardBorder}`, padding: '40px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: c.title, margin: '0 0 6px' }}>Iniciar sesión</h1>
            <p style={{ color: c.text, fontSize: '14px', margin: 0 }}>Ingresa tus credenciales para continuar</p>
          </div>

          {exito && (
            <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: c.successBg, border: `1px solid ${c.successBorder}`, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <svg style={{ width: '18px', height: '18px', color: c.successIcon, flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p style={{ color: c.successText, fontSize: '14px', fontWeight: 500, margin: 0 }}>{exito}</p>
            </div>
          )}

          {exitoFinal && (
            <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: c.successBg, border: `1px solid ${c.successBorder}`, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <svg style={{ width: '18px', height: '18px', color: c.successIcon, flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p style={{ color: c.successText, fontSize: '14px', fontWeight: 500, margin: 0 }}>
                Sesión iniciada con {proveedorExito === 'google' ? 'Google' : 'Facebook'}. Redirigiendo…
              </p>
            </div>
          )}

          {errorSocial && !exitoFinal && (
            <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: c.errorBg, border: `1px solid ${c.errorBorder}`, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <svg style={{ width: '18px', height: '18px', color: c.errorIcon, flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p style={{ color: c.errorText, fontSize: '14px', margin: 0 }}>{errorSocial}</p>
            </div>
          )}

          {errores.general && (
            <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: c.errorBg, border: `1px solid ${c.errorBorder}`, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <svg style={{ width: '18px', height: '18px', color: c.errorIcon, flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p style={{ color: c.errorText, fontSize: '14px', margin: 0 }}>{errores.general}</p>
            </div>
          )}

          {intentos > 0 && !bloqueado && (
            <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: c.warnBg, border: `1px solid ${c.warnBorder}`, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <svg style={{ width: '18px', height: '18px', color: c.warnIcon, flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p style={{ color: c.warnText, fontSize: '14px', margin: 0 }}>Intento {intentos} de {MAX_INTENTOS}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: c.label, marginBottom: '8px' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={correo}
                onChange={(e) => handleCorreoChange(e.target.value)}
                disabled={bloqueado || cargando}
                placeholder="ejemplo@correo.com"
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: errores.correo ? `1.5px solid ${c.inputErrorBorder}` : `1.5px solid ${c.inputBorder}`,
                  background: errores.correo ? c.inputErrorBg : c.inputBg,
                  fontSize: '14px',
                  color: c.inputText,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 150ms, background 150ms',
                }}
                onFocus={e => e.target.style.borderColor = c.inputBorderHover}
                onBlur={e => e.target.style.borderColor = errores.correo ? c.inputErrorBorder : c.inputBorder}
              />
              {errores.correo && <p style={{ color: c.helperError, fontSize: '12px', marginTop: '6px' }}>{errores.correo}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: c.label, marginBottom: '8px' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarPass ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  disabled={bloqueado || cargando}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 16px',
                    borderRadius: '12px',
                    border: errores.contrasena ? `1.5px solid ${c.inputErrorBorder}` : `1.5px solid ${c.inputBorder}`,
                    background: errores.contrasena ? c.inputErrorBg : c.inputBg,
                    fontSize: '14px',
                    color: c.inputText,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 150ms, background 150ms',
                  }}
                  onFocus={e => e.target.style.borderColor = c.inputBorderHover}
                  onBlur={e => e.target.style.borderColor = errores.contrasena ? c.inputErrorBorder : c.inputBorder}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPass(!mostrarPass)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: c.eyeIcon,
                    padding: 0,
                    display: 'flex'
                  }}
                >
                  {mostrarPass
                    ? <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    : <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  }
                </button>
              </div>
              {errores.contrasena && <p style={{ color: c.helperError, fontSize: '12px', marginTop: '6px' }}>{errores.contrasena}</p>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/recuperar" style={{ fontSize: '13px', color: c.forgot, fontWeight: 700, textDecoration: 'none' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={bloqueado || cargando || exitoFinal}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(90deg,#1e3a8a,#2563eb)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: cargando || bloqueado || exitoFinal ? 'not-allowed' : 'pointer',
                opacity: bloqueado || cargando || exitoFinal ? 0.55 : 1,
                boxShadow: '0 4px 16px rgba(30,58,138,0.25)',
                transition: 'opacity 150ms',
              }}
            >
              {cargando ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Verificando...
                </span>
              ) : 'Iniciar sesión'}
            </button>

            <button
              type="button"
              onClick={iniciarGoogle}
              disabled={bloqueado || cargandoGoogle || cargandoFacebook || exitoFinal}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: `1.5px solid ${c.socialBorder}`,
                background: c.socialBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: (bloqueado || cargandoGoogle || cargandoFacebook || exitoFinal) ? 'not-allowed' : 'pointer',
                transition: 'all 150ms',
                color: c.socialText,
                opacity: (bloqueado || cargandoGoogle || cargandoFacebook || exitoFinal) ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (!bloqueado && !exitoFinal) { e.currentTarget.style.borderColor = c.socialHoverBorder; e.currentTarget.style.background = c.socialHoverBg } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = c.socialBorder; e.currentTarget.style.background = c.socialBg }}
            >
              {cargandoGoogle ? <SpinnerBtn esModoOscuro={esModoOscuro} /> : (
                <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                  <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.09-6.09C34.46 3.09 29.53 1 24 1 14.82 1 7.07 6.48 3.64 14.18l7.09 5.51C12.4 13.67 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.15 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h12.44c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.59C43.16 37.13 46.15 31.29 46.15 24.5z"/>
                  <path fill="#FBBC05" d="M10.73 28.31A14.6 14.6 0 019.5 24c0-1.49.26-2.93.73-4.31L3.14 14.18A22.94 22.94 0 001 24c0 3.57.85 6.95 2.36 9.95l7.37-5.64z"/>
                  <path fill="#34A853" d="M24 47c5.53 0 10.17-1.83 13.56-4.97l-7.19-5.59c-1.84 1.24-4.2 1.97-6.37 1.97-6.26 0-11.6-4.17-13.27-9.78l-7.37 5.64C7.07 41.52 14.82 47 24 47z"/>
                </svg>
              )}
              {cargandoGoogle ? 'Conectando con Google…' : 'Continuar con Google'}
            </button>

            <button
              type="button"
              onClick={iniciarFacebook}
              disabled={bloqueado || cargandoGoogle || cargandoFacebook || exitoFinal}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: `1.5px solid ${c.socialBorder}`,
                background: c.socialBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: (bloqueado || cargandoGoogle || cargandoFacebook || exitoFinal) ? 'not-allowed' : 'pointer',
                transition: 'all 150ms',
                color: c.socialText,
                opacity: (bloqueado || cargandoGoogle || cargandoFacebook || exitoFinal) ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (!bloqueado && !exitoFinal) { e.currentTarget.style.borderColor = c.socialHoverBorder; e.currentTarget.style.background = c.socialHoverBg } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = c.socialBorder; e.currentTarget.style.background = c.socialBg }}
            >
              {cargandoFacebook ? <SpinnerBtn esModoOscuro={esModoOscuro} /> : (
                <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                  <path fill="#1877F2" d="M48 24C48 10.745 37.255 0 24 0S0 10.745 0 24c0 11.979 8.776 21.908 20.25 23.708V30.938h-6.094V24h6.094v-5.288c0-6.014 3.583-9.337 9.065-9.337 2.625 0 5.372.469 5.372.469v5.906h-3.026c-2.981 0-3.911 1.85-3.911 3.75V24h6.656l-1.064 6.938H27.75v16.77C39.224 45.908 48 35.979 48 24z"/>
                  <path fill="#fff" d="M33.342 30.938 34.406 24H27.75v-4.5c0-1.899.93-3.75 3.911-3.75h3.026V9.844s-2.747-.469-5.372-.469c-5.482 0-9.065 3.323-9.065 9.337V24h-6.094v6.938h6.094v16.77a24.18 24.18 0 007.5 0V30.938h5.592z"/>
                </svg>
              )}
              {cargandoFacebook ? 'Conectando con Facebook…' : 'Continuar con Facebook'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: c.footerText, marginTop: '24px', marginBottom: 0 }}>
            ¿No tienes cuenta?{' '}
            <Link to="/registro" style={{ color: c.registerLink, fontWeight: 700, textDecoration: 'none' }}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: ${c.inputPlaceholder}; opacity: 1; }
      `}</style>
    </div>
  )
}