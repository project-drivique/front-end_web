import AuthHeaderControls from '../../components/AuthHeaderControls'
import logo from '@/assets/logocatalog.png'
import { FaCheck } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const fieldWrap = { display: 'flex', flexDirection: 'column', gap: '5px' }
const labelStyle = (c) => ({ fontSize: '13px', fontWeight: 700, color: c.labelColor })
const inputStyle = (hasError, c) => ({
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: `1.5px solid ${hasError ? c.inputErrorBorder : c.inputBorder}`,
  background: hasError ? c.inputErrorBg : c.inputBg,
  fontSize: '13px',
  color: c.inputText,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 150ms, background 150ms, color 150ms',
})
const errorStyle = (c) => ({ color: c.errorInline, fontSize: '12px', margin: '4px 0 0' })
function PassInput({ id, value, onChange, ver, setVer, hasError, placeholder, c }) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type={ver ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder || ''}
        style={{ ...inputStyle(hasError, c), paddingRight: '44px' }}
      />
      <button
        type="button"
        onClick={() => setVer(v => !v)}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: c.textFaint,
          padding: 0,
          display: 'flex'
        }}
      >
        {ver
          ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
          : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        }
      </button>
    </div>
  )
}
function ChecklistPassword({ password, c }) {
  const { t } = useTranslation()
  if (!password) return null

  const reglas = [
    { id: 'len', label: t('registro.checklist.min12'),     ok: password.length >= 12 },
    { id: 'may', label: t('registro.checklist.uppercase'), ok: /[A-Z]/.test(password) },
    { id: 'min', label: t('registro.checklist.lowercase'), ok: /[a-z]/.test(password) },
    { id: 'num', label: t('registro.checklist.number'),    ok: /\d/.test(password) },
    { id: 'esp', label: t('registro.checklist.symbol'),    ok: /[^a-zA-Z\d\s]/.test(password) },
  ]

  const cumplidas = reglas.filter(r => r.ok).length
  const colores = ['#e2e8f0', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']
  const coloresDark = ['#334155', '#f87171', '#fb923c', '#facc15', '#a3e635', '#4ade80']
  const textos = ['', t('registro.checklist.veryWeak'), t('registro.checklist.weak'), t('registro.checklist.regular'), t('registro.checklist.good'), t('registro.checklist.strong')]
  const color = c.pageBg === '#0f172a' ? coloresDark[cumplidas] : colores[cumplidas]

  return (
    <div style={{ marginTop: '6px', background: c.checklistBg, border: `1px solid ${c.checklistBorder}`, borderRadius: '10px', padding: '12px 14px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ height: '4px', flex: 1, borderRadius: '9999px', background: i <= cumplidas ? color : c.checklistTrack, transition: 'all 300ms' }} />
        ))}
      </div>

      {cumplidas > 0 && <p style={{ fontSize: '11px', fontWeight: 700, color, margin: '0 0 8px' }}>{textos[cumplidas]}</p>}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {reglas.map(r => (
          <li key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px' }}>
            <span style={{
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: r.ok ? c.checklistOkDotBg : c.checklistNeutralDotBg,
              fontSize: '9px',
              fontWeight: 700,
              color: r.ok ? c.checklistOkDotColor : c.checklistNeutralDotColor
            }}>
              {r.ok ? <FaCheck /> : '·'}
            </span>
            <span style={{ color: r.ok ? c.checklistOkText : c.checklistOffText, fontWeight: r.ok ? 600 : 400 }}>{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
function BotonesSocial({ onGoogle, onFacebook, cargandoGoogle, cargandoFacebook, deshabilitado, c }) {
  const { t } = useTranslation()
  const bloqueado = deshabilitado || cargandoGoogle || cargandoFacebook
  const baseBtn = {
    flex: 1,
    padding: '11px 8px',
    borderRadius: '12px',
    border: `1.5px solid ${c.socialBtnBorder}`,
    background: c.socialBtnBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 150ms',
    color: c.socialBtnText,
  }

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button
        type="button"
        onClick={onGoogle}
        disabled={bloqueado}
        style={{ ...baseBtn, opacity: bloqueado ? 0.6 : 1 }}
        onMouseEnter={e => { if (!bloqueado) { e.currentTarget.style.borderColor = c.socialBtnHoverBorder; e.currentTarget.style.background = c.socialBtnHoverBg } }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = c.socialBtnBorder; e.currentTarget.style.background = c.socialBtnBg }}
      >
        {cargandoGoogle ? <SpinnerBtn c={c} /> : (
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.09-6.09C34.46 3.09 29.53 1 24 1 14.82 1 7.07 6.48 3.64 14.18l7.09 5.51C12.4 13.67 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.15 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h12.44c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.59C43.16 37.13 46.15 31.29 46.15 24.5z"/>
            <path fill="#FBBC05" d="M10.73 28.31A14.6 14.6 0 019.5 24c0-1.49.26-2.93.73-4.31L3.14 14.18A22.94 22.94 0 001 24c0 3.57.85 6.95 2.36 9.95l7.37-5.64z"/>
            <path fill="#34A853" d="M24 47c5.53 0 10.17-1.83 13.56-4.97l-7.19-5.59c-1.84 1.24-4.2 1.97-6.37 1.97-6.26 0-11.6-4.17-13.27-9.78l-7.37 5.64C7.07 41.52 14.82 47 24 47z"/>
          </svg>
        )}
        {cargandoGoogle ? t('registro.connecting') : t('registro.google')}
      </button>

      <button
        type="button"
        onClick={onFacebook}
        disabled={bloqueado}
        style={{ ...baseBtn, opacity: bloqueado ? 0.6 : 1 }}
        onMouseEnter={e => { if (!bloqueado) { e.currentTarget.style.borderColor = c.socialBtnHoverBorder; e.currentTarget.style.background = c.socialBtnHoverBg } }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = c.socialBtnBorder; e.currentTarget.style.background = c.socialBtnBg }}
      >
        {cargandoFacebook ? <SpinnerBtn c={c} /> : (
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#1877F2" d="M48 24C48 10.745 37.255 0 24 0S0 10.745 0 24c0 11.979 8.776 21.908 20.25 23.708V30.938h-6.094V24h6.094v-5.288c0-6.014 3.583-9.337 9.065-9.337 2.625 0 5.372.469 5.372.469v5.906h-3.026c-2.981 0-3.911 1.85-3.911 3.75V24h6.656l-1.064 6.938H27.75v16.77C39.224 45.908 48 35.979 48 24z"/>
            <path fill="#fff" d="M33.342 30.938 34.406 24H27.75v-4.5c0-1.899.93-3.75 3.911-3.75h3.026V9.844s-2.747-.469-5.372-.469c-5.482 0-9.065 3.323-9.065 9.337V24h-6.094v6.938h6.094v16.77a24.18 24.18 0 007.5 0V30.938h5.592z"/>
          </svg>
        )}
        {cargandoFacebook ? t('registro.connecting') : t('registro.facebook')}
      </button>
    </div>
  )
}
function SpinnerBtn({ c }) {
  return <span style={{ width: '16px', height: '16px', border: `2px solid ${c.inputBorder}`, borderTopColor: c.textMuted, borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
}

export default function AuthResponsiveLayout({ brand, c, cargando, cargandoFacebook, cargandoGoogle, confirmar, correo, error, errorSocial, errores, esModoOscuro, exitoFinal, exitoRef, handleSubmit, iniciarFacebook, iniciarGoogle, password, proveedorExito, setConfirmar, setCorreo, setErrores, setModalAbierto, setPassword, setTerminos, setVerConfirmar, setVerPass, t, terminos, terminosLeidos, verConfirmar, verPass }) {
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
        }} className="auth-responsive-layout register-clean-layout">
          <style>{`
            .auth-responsive-layout {
              flex-direction: column !important;
            }
            @media(min-width:1024px) {
              .auth-responsive-layout {
                flex-direction: column !important;
              }
            }
            .register-clean-layout::before,
            .register-clean-layout::after {
              content: '';
              position: absolute;
              border-radius: 999px;
              pointer-events: none;
            }
            .register-clean-layout::before {
              width: 540px;
              height: 540px;
              left: -220px;
              bottom: -245px;
              background: radial-gradient(circle, rgba(var(--brand-primary-rgb), ${esModoOscuro ? '0.30' : '0.16'}), transparent 68%);
              filter: blur(4px);
            }
            .register-clean-layout::after {
              width: 440px;
              height: 440px;
              right: -150px;
              top: 100px;
              background: radial-gradient(circle, rgba(var(--brand-secondary-rgb), ${esModoOscuro ? '0.30' : '0.18'}), transparent 68%);
              filter: blur(2px);
              box-shadow: none;
            }
          `}</style>
  
          <div style={{ position: 'relative', zIndex: 1, flex: 1, width: '100%', overflowY: 'auto', height: '100%' }}>
            <div className="auth-contenedor" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
              <div className="auth-back-floating">
                <AuthHeaderControls backTo="/" backLabelKey="common.backToHome" backLabelFallback="Volver al inicio" />
              </div>
  
              <div style={{
                width: '100%',
                maxWidth: 860,
                display: 'grid',
                gridTemplateColumns: 'minmax(250px, 0.9fr) minmax(360px, 1fr)',
                transform: 'translateY(46px)',
                background: esModoOscuro ? 'rgba(14,23,42,0.88)' : 'rgba(255,255,255,0.90)',
                backdropFilter: 'blur(18px)',
                borderRadius: '28px',
                boxShadow: esModoOscuro ? '0 28px 80px rgba(0,0,0,0.46)' : '0 28px 80px rgba(var(--brand-secondary-rgb),0.13)',
                border: `1px solid ${esModoOscuro ? 'rgba(148,163,184,0.20)' : 'rgba(var(--brand-primary-rgb),0.12)'}`,
                padding: 14,
                overflow: 'hidden'
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
                    src={brand.logoDataUrl || logo}
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
                    maxWidth: 270,
                    color: esModoOscuro ? 'rgba(255,255,255,0.86)' : 'rgba(var(--brand-secondary-rgb),0.82)',
                    fontSize: 14.5,
                    fontWeight: 600,
                    lineHeight: 1.55,
                  }}>
                    {t('registro.leftPanel.subtitle')}
                  </p>
                </div>
  
                <div style={{ padding: '34px 34px 30px' }} className="auth-split-form">
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <h1 style={{
                    fontFamily: 'Outfit, Inter, system-ui, sans-serif',
                    fontSize: '1.55rem',
                    fontWeight: 900,
                    color: c.title,
                    margin: '0 0 6px',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.25
                  }}>
                    {t('registro.title')}
                  </h1>
                  <p style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '13.5px',
                    color: esModoOscuro ? '#94a3b8' : '#64748b',
                    fontWeight: 500,
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {t('registro.subtitle')}
                  </p>
                </div>
  
                {exitoFinal && (
                  <div ref={exitoRef} style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: c.successBg, border: `1px solid ${c.successBorder}`, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <svg style={{ width: '20px', height: '20px', color: c.successText, flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p style={{ color: c.successTitle, fontSize: '14px', fontWeight: 700, margin: '0 0 2px' }}>{t('registro.successTitle')}</p>
                      <p style={{ color: c.successText, fontSize: '13px', margin: 0 }}>
                        {proveedorExito
                          ? t('hc3.account_linked', { defaultValue: 'Cuenta vinculada con {{proveedor}} correctamente. Será redirigido en unos segundos.', proveedor: proveedorExito === 'google' ? 'Google' : 'Facebook' })
                          : t('registro.checkEmail')
                        }
                      </p>
                    </div>
                  </div>
                )}
  
                {(error || errorSocial) && !exitoFinal && (
                  <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: c.errorBg, border: `1px solid ${c.errorBorder}`, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <svg style={{ width: '20px', height: '20px', color: c.errorText, flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p style={{ color: c.errorTitle, fontSize: '14px', fontWeight: 700, margin: '0 0 2px' }}>{t('registro.failTitle')}</p>
                      <p style={{ color: c.errorText, fontSize: '13px', margin: 0 }}>{error || errorSocial}</p>
                    </div>
                  </div>
                )}
  
                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
                  <div style={fieldWrap}>
                    <label htmlFor="correo" style={labelStyle(c)}>{t('registro.email')} <span style={{ color: c.accent }}>*</span></label>
                    <input
                      id="correo"
                      type="email"
                      value={correo}
                      onChange={e => { setCorreo(e.target.value); setErrores(p => ({ ...p, correo: '' })) }}
                      placeholder={t('registro.emailPlaceholder')}
                      style={inputStyle(!!errores.correo, c)}
                    />
                    {errores.correo && <p style={errorStyle(c)}>{errores.correo}</p>}
                  </div>
  
                  <div style={fieldWrap}>
                    <label htmlFor="password" style={labelStyle(c)}>{t('registro.password')} <span style={{ color: c.accent }}>*</span></label>
                    <PassInput
                      id="password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setErrores(p => ({ ...p, password: '' })) }}
                      ver={verPass}
                      setVer={setVerPass}
                      hasError={!!errores.password}
                      placeholder={t('registro.passwordPlaceholder')}
                      c={c}
                    />
                    {errores.password && <p style={errorStyle(c)}>{errores.password}</p>}
                    <ChecklistPassword password={password} c={c} />
                  </div>
  
                  <div style={fieldWrap}>
                    <label htmlFor="confirmar" style={labelStyle(c)}>{t('registro.confirmPassword')} <span style={{ color: c.accent }}>*</span></label>
                    <PassInput
                      id="confirmar"
                      value={confirmar}
                      onChange={e => { setConfirmar(e.target.value); setErrores(p => ({ ...p, confirmar: '' })) }}
                      ver={verConfirmar}
                      setVer={setVerConfirmar}
                      hasError={!!errores.confirmar}
                      placeholder={t('registro.confirmPlaceholder')}
                      c={c}
                    />
                    {errores.confirmar && <p style={errorStyle(c)}>{errores.confirmar}</p>}
                  </div>
  
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="terminos"
                      checked={terminos}
                      onChange={e => {
                        if (!terminosLeidos) {
                          setModalAbierto(true)
                          return
                        }
                        setTerminos(e.target.checked)
                        setErrores(p => ({ ...p, terminos: '' }))
                      }}
                      style={{ width: '15px', height: '15px', marginTop: '3px', cursor: 'pointer', accentColor: c.checkboxAccent, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <label htmlFor="terminos" style={{ fontSize: '13px', color: c.termsText, lineHeight: 1.6, cursor: 'pointer', display: 'block' }}>
                        {t('registro.termsPrefix')}{' '}
                        <span
                          onClick={e => { e.preventDefault(); setModalAbierto(true) }}
                          style={{ color: c.accent, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          {t('registro.termsLink')}
                        </span>
                        {' '}{t('registro.termsSuffix')}{' '}
                        <span
                          onClick={e => { e.preventDefault(); setModalAbierto(true) }}
                          style={{ fontWeight: 700, color: c.accent, textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          {t('registro.termsLaw')}
                        </span>.
                      </label>
                      {errores.terminos && <p style={errorStyle(c)}>{errores.terminos}</p>}
                    </div>
                  </div>
  
                  <button
                    type="submit"
                    disabled={cargando || exitoFinal}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      background: exitoFinal ? 'linear-gradient(90deg,#15803d,#16a34a)' : 'linear-gradient(90deg,var(--brand-secondary),var(--brand-primary))',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '14px',
                      border: 'none',
                      cursor: (cargando || exitoFinal) ? 'not-allowed' : 'pointer',
                      opacity: (cargando || exitoFinal) ? 0.8 : 1,
                      boxShadow: '0 4px 16px rgba(var(--brand-secondary-rgb),0.25)',
                      transition: 'all 300ms',
                    }}
                  >
                    {cargando
                      ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                          <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                          {t('registro.processing')}
                        </span>
                      : exitoFinal ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <FaCheck />
                          {t('registro.completed')}
                        </span>
                      ) : t('registro.submit')
                    }
                  </button>
  
                  <BotonesSocial
                    onGoogle={iniciarGoogle}
                    onFacebook={iniciarFacebook}
                    cargandoGoogle={cargandoGoogle}
                    cargandoFacebook={cargandoFacebook}
                    deshabilitado={exitoFinal}
                    c={c}
                  />
  
                    <div style={{ borderTop: `1px solid ${c.divider}`, paddingTop: '12px' }}>
                    <p style={{ textAlign: 'center', fontSize: '13px', color: c.textMuted, margin: 0 }}>
                      {t('registro.hasAccount')}{' '}
                      <Link to="/login" style={{ color: c.accent, fontWeight: 700, textDecoration: 'none' }}>{t('registro.loginLink')}</Link>
                    </p>
                  </div>
                </form>
                </div>
              </div>
            </div>
          </div>
        </div>
  )
}
