import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLogin } from '../hooks/useLogin'
import { useSocialRegistration } from '../hooks/useSocialRegistration'
import { useLanding } from '../../landing/LandingContext'
import { FaExclamationTriangle, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa'
import { coloresLogin, loginTokens } from '../styles/loginStyles'
import SpinnerButton from '../components/SpinnerButton'
import AlertModal from '../../catalog/components/AlertModal'
import AuthHeaderControls from '../components/AuthHeaderControls'
import { getRoleHome } from '../utils/accessControl'
import { useBrand } from '@/contexts/BrandContext'
import logocatalog from '@/assets/logocatalog.png'

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
  const { brand } = useBrand()
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

  const [modalConfig, setModalConfig] = useState(null)

  const {
    cargandoGoogle, cargandoFacebook, errorSocial,
    proveedorExito, iniciarGoogle, iniciarFacebook,
  } = useSocialRegistration({ onExito: (_, data) => {
    const rol = data?.usuario?.rol
    navigate(getRoleHome(rol))
  } })

  const exitoFinal = !!proveedorExito

  useEffect(() => {
    if (errorSocial) {
      setModalConfig({ type: 'error', title: t('login.socialError'), text: errorSocial })
    }
  }, [errorSocial, t])

  useEffect(() => {
    if (errores.general) {
      setModalConfig({
        type: bloqueado ? 'error' : 'warning',
        title: bloqueado ? t('login.blocked') : t('login.loginError'),
        text: errores.general,
      })
    }
  }, [errores.general, bloqueado, t])

  useEffect(() => {
    if (exito) {
      setModalConfig({ type: 'success', title: t('login.welcome'), text: exito })
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
    <div style={{
      minHeight: '112vh',
      display: 'flex',
      background: esModoOscuro
        ? 'radial-gradient(circle at 18% 18%, rgba(var(--brand-primary-rgb),0.30), transparent 32%), radial-gradient(circle at 84% 22%, rgba(var(--brand-accent-rgb),0.18), transparent 30%), radial-gradient(circle at 8% 84%, rgba(var(--brand-secondary-rgb),0.20), transparent 34%), linear-gradient(135deg,#020617 0%,#0f172a 48%,#111827 100%)'
        : 'radial-gradient(circle at 86% 25%, rgba(190,207,239,0.72), transparent 30%), radial-gradient(circle at 5% 86%, rgba(198,216,247,0.62), transparent 34%), radial-gradient(circle at 14% 18%, rgba(var(--brand-primary-rgb),0.12), transparent 28%), linear-gradient(135deg,#eef6ff 0%,#f8fbff 44%,#ffffff 100%)',
      zoom: 0.9,
      position: 'relative',
      overflow: 'hidden',
    }} className="auth-responsive-layout login-clean-layout">
      <style>{`
        .auth-responsive-layout {
          flex-direction: column !important;
        }
        @media(min-width:1024px) {
          .auth-responsive-layout {
            flex-direction: column !important;
          }
        }
        .login-clean-layout::before,
        .login-clean-layout::after {
          content: '';
          position: absolute;
          border-radius: 999px;
          pointer-events: none;
        }
        .login-clean-layout::before {
          width: 520px;
          height: 520px;
          left: -210px;
          bottom: -230px;
          background: radial-gradient(circle, rgba(var(--brand-primary-rgb), ${esModoOscuro ? '0.30' : '0.16'}), transparent 68%);
          filter: blur(4px);
        }
        .login-clean-layout::after {
          width: 430px;
          height: 430px;
          right: -145px;
          top: 92px;
          background: radial-gradient(circle, rgba(var(--brand-secondary-rgb), ${esModoOscuro ? '0.30' : '0.18'}), transparent 68%);
          filter: blur(2px);
          box-shadow: none;
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '34px 24px' }} className="auth-contenedor">

        <div className="auth-back-floating">
          <AuthHeaderControls backTo="/" backLabelKey="common.backToHome" backLabelFallback="Volver al inicio" />
        </div>

        {/* Card */}
        <div style={{
          width: '100%',
          maxWidth: 860,
          display: 'grid',
          gridTemplateColumns: 'minmax(250px, 0.9fr) minmax(360px, 1fr)',
          background: esModoOscuro ? 'rgba(14,23,42,0.88)' : 'rgba(255,255,255,0.90)',
          backdropFilter: 'blur(18px)',
          borderRadius: 30,
          boxShadow: esModoOscuro ? '0 28px 80px rgba(0,0,0,0.46)' : '0 28px 80px rgba(var(--brand-secondary-rgb),0.13)',
          border: `1px solid ${esModoOscuro ? 'rgba(148,163,184,0.20)' : 'rgba(var(--brand-primary-rgb),0.12)'}`,
          padding: 14,
          overflow: 'hidden',
        }} className="auth-card auth-split-card">
          <div style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '24px 0 0 24px',
            padding: '34px 28px',
            textAlign: 'center',
            minHeight: 470,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: esModoOscuro
              ? 'linear-gradient(145deg, rgba(255,255,255,0.12), rgba(var(--brand-primary-rgb),0.20) 42%, rgba(var(--brand-secondary-rgb),0.18))'
              : 'linear-gradient(145deg, rgba(255,255,255,0.52) 0%, rgba(var(--brand-primary-rgb),0.20) 42%, rgba(var(--brand-secondary-rgb),0.30) 100%)',
            backdropFilter: 'blur(24px) saturate(1.25)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.25)',
            border: `1px solid ${esModoOscuro ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.62)'}`,
            boxShadow: esModoOscuro
              ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 18px 45px rgba(0,0,0,0.18)'
              : 'inset 0 1px 0 rgba(255,255,255,0.70), 0 18px 45px rgba(var(--brand-secondary-rgb),0.10)',
            color: '#fff',
          }} className="auth-split-brand">
            <div style={{ position: 'absolute', width: 210, height: 210, borderRadius: '50%', right: -88, top: -92, background: 'rgba(255,255,255,0.16)' }} />
            <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', left: -64, bottom: -70, background: 'rgba(255,255,255,0.12)' }} />
            <img
              className="auth-brand-logo"
              src={brand.logoDataUrl || logocatalog}
              alt={brand.name}
              style={{ position: 'relative', zIndex: 1, width: 176, height: 176, objectFit: 'contain', margin: '0 auto 4px', display: 'block', filter: 'drop-shadow(0 18px 34px rgba(0,0,0,0.24))' }}
            />
            <p style={{
              position: 'relative',
              zIndex: 1,
              margin: '-10px 0 4px',
              fontFamily: 'Outfit, Inter, system-ui, sans-serif',
              fontSize: 21,
              fontWeight: 900,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)',
              textShadow: esModoOscuro
                ? '0 8px 22px rgba(0,0,0,0.24)'
                : '0 8px 22px rgba(var(--brand-secondary-rgb),0.18)',
            }}>
              {brand.name}
            </p>
            <p style={{
              position: 'relative',
              zIndex: 1,
              margin: '0 auto',
              maxWidth: 260,
              color: esModoOscuro ? 'rgba(255,255,255,0.86)' : 'rgba(var(--brand-secondary-rgb),0.82)',
              fontSize: 14.5,
              fontWeight: 600,
              lineHeight: 1.55,
            }}>
              {t('panel.subtitle')}
            </p>
          </div>

          <div style={{ padding: '34px 34px 30px' }} className="auth-split-form">
          <div style={{ marginBottom: 22, textAlign: 'center' }}>
            <h1 style={{
              fontFamily: 'Outfit, Inter, system-ui, sans-serif',
              fontSize: '1.55rem',
              fontWeight: 900,
              color: c.title,
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
              lineHeight: 1.25
            }}>
              {t('login.title')}
            </h1>
            <p style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              color: esModoOscuro ? '#94a3b8' : '#64748b',
              fontSize: '13.5px',
              fontWeight: 500,
              margin: 0,
              lineHeight: 1.5
            }}>
              {t('login.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Campo correo */}
            <div>
              <label style={{ display: 'block', fontFamily: 'Outfit, Inter, system-ui, sans-serif', fontSize: tok.fontSize.label, fontWeight: 800, color: c.label, marginBottom: 8 }}>
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
              <label style={{ display: 'block', fontFamily: 'Outfit, Inter, system-ui, sans-serif', fontSize: tok.fontSize.label, fontWeight: 800, color: c.label, marginBottom: 8 }}>
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
                  disabled={bloqueado || cargando}
                  aria-label={t('login.togglePassword')}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: c.eyeIcon,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                  }}
                >
                  {mostrarPass ? <FaEyeSlash size={17} /> : <FaEye size={17} />}
                </button>
              </div>
              {errores.contrasena && <p style={{ color: c.helperError, fontSize: tok.fontSize.helper, marginTop: 6 }}>{errores.contrasena}</p>}
            </div>

            {/* Olvidé contraseña */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/recuperar" style={{ fontFamily: 'Outfit, Inter, system-ui, sans-serif', fontSize: tok.fontSize.label, color: c.forgot, fontWeight: 800, textDecoration: 'none' }}>
                {t('login.forgotPassword')}
              </Link>
            </div>

            {/* Botón submit */}
            <button
              type="submit"
              disabled={bloqueado || cargando || exitoFinal}
              style={{
                width: '100%', padding: 14, borderRadius: tok.borderRadius.input,
                background: 'linear-gradient(90deg,var(--brand-secondary),var(--brand-primary))',
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
                  {estaCargando ? <SpinnerButton esModoOscuro={esModoOscuro} /> : <Icono />}
                  {estaCargando ? labelCargando : label}
                </button>
              )
            })}
          </form>

          <p style={{ textAlign: 'center', fontSize: tok.fontSize.body, color: c.footerText, marginTop: 24, marginBottom: 0 }}>
            {t('login.noAccount')}{' '}
            <Link to="/registro" style={{ fontFamily: 'Outfit, Inter, system-ui, sans-serif', color: c.registerLink, fontWeight: 800, textDecoration: 'none' }}>
              {t('login.registerLink')}
            </Link>
          </p>
          </div>
        </div>
      </div>

      {modalConfig && (
        <AlertModal
          icon={
            modalConfig.type === 'success' ? <FaCheckCircle size={22} color="var(--brand-text)" /> :
            <FaExclamationTriangle size={22} color={esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)'} />
          }
          titulo={modalConfig.title}
          mensaje={modalConfig.text}
          primaryText={t('common.accept', 'Aceptar')}
          onPrimary={() => setModalConfig(null)}
          onCerrar={() => setModalConfig(null)}
          showCloseButton
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: ${c.inputPlaceholder}; opacity: 1; }
        @media (max-width: 860px) {
          .auth-back-floating {
            top: 18px !important;
            left: 18px !important;
          }
          .auth-split-card {
            max-width: 430px !important;
            grid-template-columns: 1fr !important;
          }
          .auth-split-brand {
            min-height: 210px !important;
            border-radius: 24px 24px 0 0 !important;
            padding: 26px 22px !important;
          }
          .auth-brand-logo {
            width: 128px !important;
            height: 128px !important;
          }
          .auth-split-form {
            padding: 28px 24px 26px !important;
          }
        }
        .auth-back-floating {
          position: absolute;
          top: 28px;
          left: 34px;
          z-index: 4;
          width: auto;
        }
        .auth-back-floating > div {
          margin-bottom: 0 !important;
        }
      `}</style>
    </div>
  )
}
