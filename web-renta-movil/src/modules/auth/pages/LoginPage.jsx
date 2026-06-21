// src/modules/auth/pages/LoginPage.jsx
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLogin } from '../hooks/useLogin'
import { useRegistroSocial } from '../hooks/useRegistroSocial'
import { useLanding } from '../../landing/LandingContext'
import logo from '@/assets/logo.png'
import { showAlert } from '@/utils/swalConfig'

import { coloresLogin, loginTokens } from '../styles/loginStyles'
import SpinnerBtn from '../components/SpinnerBtn'
import PanelIzquierdo from '../components/PanelIzquierdo'

// ─── Íconos SVG locales ────────────────────────────────────────────────────────
const IconoOjoAbierto = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const IconoOjoCerrado = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
)

// ─── SVGs de proveedores sociales ─────────────────────────────────────────────
const IconoGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.09-6.09C34.46 3.09 29.53 1 24 1 14.82 1 7.07 6.48 3.64 14.18l7.09 5.51C12.4 13.67 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.15 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h12.44c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.59C43.16 37.13 46.15 31.29 46.15 24.5z"/>
    <path fill="#FBBC05" d="M10.73 28.31A14.6 14.6 0 019.5 24c0-1.49.26-2.93.73-4.31L3.14 14.18A22.94 22.94 0 001 24c0 3.57.85 6.95 2.36 9.95l7.37-5.64z"/>
    <path fill="#34A853" d="M24 47c5.53 0 10.17-1.83 13.56-4.97l-7.19-5.59c-1.84 1.24-4.2 1.97-6.37 1.97-6.26 0-11.6-4.17-13.27-9.78l-7.37 5.64C7.07 41.52 14.82 47 24 47z"/>
  </svg>
)

const IconoFacebook = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    <path fill="#1877F2" d="M48 24C48 10.745 37.255 0 24 0S0 10.745 0 24c0 11.979 8.776 21.908 20.25 23.708V30.938h-6.094V24h6.094v-5.288c0-6.014 3.583-9.337 9.065-9.337 2.625 0 5.372.469 5.372.469v5.906h-3.026c-2.981 0-3.911 1.85-3.911 3.75V24h6.656l-1.064 6.938H27.75v16.77C39.224 45.908 48 35.979 48 24z"/>
    <path fill="#fff" d="M33.342 30.938 34.406 24H27.75v-4.5c0-1.899.93-3.75 3.911-3.75h3.026V9.844s-2.747-.469-5.372-.469c-5.482 0-9.065 3.323-9.065 9.337V24h-6.094v6.938h6.094v16.77a24.18 24.18 0 007.5 0V30.938h5.592z"/>
  </svg>
)

// ─── Componente principal ──────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'
  const c = coloresLogin(esModoOscuro)
  const tok = loginTokens

  const BOTONES_SOCIALES = [
    { id: 'google',   label: t('login.googleBtn'),   labelCargando: t('login.connectingGoogle'),   Icono: IconoGoogle },
    { id: 'facebook', label: t('login.facebookBtn'), labelCargando: t('login.connectingFacebook'), Icono: IconoFacebook },
  ]

  const {
    correo, contrasena, mostrarPass, cargando,
    bloqueado, errores, exito,
    setContrasena, setMostrarPass,
    handleCorreoChange, handleSubmit,
  } = useLogin()

  const showLoginAlert = ({ icon, title, text, confirmButtonText = 'Aceptar' }) =>
    showAlert({ icon, title, text, confirmButtonText })

  const {
    cargandoGoogle, cargandoFacebook, errorSocial,
    proveedorExito, iniciarGoogle, iniciarFacebook,
  } = useRegistroSocial({ onExito: (_, data) => {
    const rol = data?.usuario?.rol
    navigate(rol === 'administrador' ? '/admin' : '/home')
  } })

  const exitoFinal = !!proveedorExito

  useEffect(() => {
    if (errorSocial) {
      showLoginAlert({ icon: 'error', title: t('login.socialError'), text: errorSocial })
    }
  }, [errorSocial, t])

  useEffect(() => {
    if (errores.general) {
      showLoginAlert({
        icon: bloqueado ? 'error' : 'warning',
        title: bloqueado ? t('login.blocked') : t('login.loginError'),
        text: errores.general,
      })
    }
  }, [errores.general, bloqueado, t])

  useEffect(() => {
    if (exito) {
      showLoginAlert({ icon: 'success', title: t('login.welcome'), text: exito })
    }
  }, [exito, t])

  // Mapa acción → handler (JSON-driven para BOTONES_SOCIALES)
  const accionesSocial = { google: iniciarGoogle, facebook: iniciarFacebook }
  const cargandoSocial = { google: cargandoGoogle, facebook: cargandoFacebook }

  // Estilo base de input
  const estiloInput = (conError) => ({
    width: '100%',
    padding: '12px 16px',
    borderRadius: tok.borderRadius.input,
    border: conError ? `1.5px solid ${c.inputErrorBorder}` : `1.5px solid ${c.inputBorder}`,
    background: conError ? c.inputErrorBg : c.inputBg,
    fontSize: tok.fontSize.input,
    color: c.inputText,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 150ms, background 150ms',
  })

  const estiloBotonSocial = (deshabilitado) => ({
    width: '100%',
    padding: '12px 16px',
    borderRadius: tok.borderRadius.input,
    border: `1.5px solid ${c.socialBorder}`,
    background: c.socialBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    fontWeight: 600,
    fontSize: tok.fontSize.label,
    cursor: deshabilitado ? 'not-allowed' : 'pointer',
    transition: 'all 150ms',
    color: c.socialText,
    opacity: deshabilitado ? 0.6 : 1,
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: c.pageBg }}>
      <PanelIzquierdo />

      {/* ── Panel derecho (formulario) ── */}
      <div style={{ flex: 1, background: c.pageBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>

        {/* Logo mobile */}
        <div style={{ marginBottom: 32 }} className="logo-mobile">
          <style>{`@media(min-width:1024px){.logo-mobile{display:none}}`}</style>
          <img src={logo} alt="Drivique" style={{ height: 48, display: 'block', margin: '0 auto' }} />
        </div>

        {/* Botón volver */}
        <div style={{ width: '100%', maxWidth: 400, marginBottom: 12 }}>
          <Link
            to="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: tok.fontSize.label, color: c.backLink, textDecoration: 'none', fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.color = c.backLinkHover}
            onMouseLeave={e => e.currentTarget.style.color = c.backLink}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('common.backToHome')}
          </Link>
        </div>

        {/* Card */}
        <div style={{ width: '100%', maxWidth: 400, background: c.cardBg, borderRadius: tok.borderRadius.card, boxShadow: c.cardShadow, border: `1px solid ${c.cardBorder}`, padding: 40 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: tok.fontSize.title, fontWeight: 900, color: c.title, margin: '0 0 6px' }}>{t('login.title')}</h1>
            <p style={{ color: c.text, fontSize: tok.fontSize.body, margin: 0 }}>{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Campo correo */}
            <div>
              <label style={{ display: 'block', fontSize: tok.fontSize.label, fontWeight: 700, color: c.label, marginBottom: 8 }}>
                {t('login.email')}
              </label>
              <input
                type="email"
                value={correo}
                onChange={e => handleCorreoChange(e.target.value)}
                disabled={bloqueado || cargando}
                placeholder={t('login.emailPlaceholder')}
                autoComplete="email"
                style={estiloInput(!!errores.correo)}
                onFocus={e => e.target.style.borderColor = c.inputBorderHover}
                onBlur={e => e.target.style.borderColor = errores.correo ? c.inputErrorBorder : c.inputBorder}
              />
              {errores.correo && <p style={{ color: c.helperError, fontSize: tok.fontSize.helper, marginTop: 6 }}>{errores.correo}</p>}
            </div>

            {/* Campo contraseña */}
            <div>
              <label style={{ display: 'block', fontSize: tok.fontSize.label, fontWeight: 700, color: c.label, marginBottom: 8 }}>
                {t('login.password')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarPass ? 'text' : 'password'}
                  value={contrasena}
                  onChange={e => setContrasena(e.target.value)}
                  disabled={bloqueado || cargando}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ ...estiloInput(!!errores.contrasena), padding: '12px 48px 12px 16px' }}
                  onFocus={e => e.target.style.borderColor = c.inputBorderHover}
                  onBlur={e => e.target.style.borderColor = errores.contrasena ? c.inputErrorBorder : c.inputBorder}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPass(!mostrarPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: c.eyeIcon, padding: 0, display: 'flex' }}
                >
                  {mostrarPass ? <IconoOjoCerrado /> : <IconoOjoAbierto />}
                </button>
              </div>
              {errores.contrasena && <p style={{ color: c.helperError, fontSize: tok.fontSize.helper, marginTop: 6 }}>{errores.contrasena}</p>}
            </div>

            {/* Olvidé contraseña */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/recuperar" style={{ fontSize: tok.fontSize.label, color: c.forgot, fontWeight: 700, textDecoration: 'none' }}>
                {t('login.forgotPassword')}
              </Link>
            </div>

            {/* Botón submit */}
            <button
              type="submit"
              disabled={bloqueado || cargando || exitoFinal}
              style={{
                width: '100%', padding: 14, borderRadius: tok.borderRadius.input,
                background: 'linear-gradient(90deg,#1e3a8a,#2563eb)',
                color: '#fff', fontWeight: 700, fontSize: tok.fontSize.body,
                border: 'none', cursor: (cargando || bloqueado || exitoFinal) ? 'not-allowed' : 'pointer',
                opacity: (bloqueado || cargando || exitoFinal) ? 0.55 : 1,
                boxShadow: tok.shadow.btn, transition: 'opacity 150ms',
              }}
            >
              {cargando
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    {t('login.verifying')}
                  </span>
                : t('login.submit')
              }
            </button>

            {/* ── Botones sociales (JSON-driven) ── */}
            {BOTONES_SOCIALES.map(({ id, label, labelCargando, Icono }) => {
              const estaCargando = cargandoSocial[id]
              const deshabilitado = bloqueado || cargandoGoogle || cargandoFacebook || exitoFinal
              return (
                <button
                  key={id}
                  type="button"
                  onClick={accionesSocial[id]}
                  disabled={deshabilitado}
                  style={estiloBotonSocial(deshabilitado)}
                  onMouseEnter={e => { if (!deshabilitado) { e.currentTarget.style.borderColor = c.socialHoverBorder; e.currentTarget.style.background = c.socialHoverBg } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = c.socialBorder; e.currentTarget.style.background = c.socialBg }}
                >
                  {estaCargando ? <SpinnerBtn esModoOscuro={esModoOscuro} /> : <Icono />}
                  {estaCargando ? labelCargando : label}
                </button>
              )
            })}
          </form>

          <p style={{ textAlign: 'center', fontSize: tok.fontSize.body, color: c.footerText, marginTop: 24, marginBottom: 0 }}>
            {t('login.noAccount')}{' '}
            <Link to="/registro" style={{ color: c.registerLink, fontWeight: 700, textDecoration: 'none' }}>
              {t('login.registerLink')}
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