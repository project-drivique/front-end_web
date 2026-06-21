import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanding } from '@/modules/landing/LandingContext'
import { usePerfil } from '../hooks/usePerfil'
import { useAuthStore } from '@/store/authStore'
import { showAlert } from '@/utils/swalConfig'
import ModalVerificacionContrasena from '../components/ModalVerificacionContrasena'
import CambiarContrasena from '../components/CambiarContrasena'
import { FaEdit, FaCheck, FaTimes, FaUser, FaEnvelope, FaPhone, FaIdCard, FaBirthdayCake, FaLock } from 'react-icons/fa'

const colores = (dark) => ({
  pageBg: dark ? '#0f172a' : '#f1f5f9',
  cardBg: dark ? '#111827' : '#ffffff',
  cardBorder: dark ? '#1e293b' : '#e2e8f0',
  cardShadow: dark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 1px 6px rgba(0,0,0,0.07)',
  heroBg: dark
    ? 'linear-gradient(135deg,#0f1a3d 0%,#1e3a8a 100%)'
    : 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)',
  title: dark ? '#f8fafc' : '#0f172a',
  text: dark ? '#e2e8f0' : '#1e293b',
  textMuted: dark ? '#94a3b8' : '#64748b',
  labelText: dark ? '#cbd5e1' : '#475569',
  inputBg: dark ? '#0f172a' : '#f8fafc',
  inputBorder: dark ? '#334155' : '#e2e8f0',
  inputBorderFocus: dark ? '#475569' : '#93c5fd',
  inputErrorBg: dark ? 'rgba(127,29,29,0.18)' : '#fef2f2',
  inputErrorBorder: '#f87171',
  inputText: dark ? '#f8fafc' : '#1e293b',
  inputPlaceholder: dark ? '#64748b' : '#94a3b8',
  errorText: dark ? '#fca5a5' : '#ef4444',
  sectionTitle: dark ? '#93c5fd' : '#1e3a8a',
  divider: dark ? '#1e293b' : '#f1f5f9',
  readonlyBg: dark ? '#0d1526' : '#f8fafc',
  readonlyText: dark ? '#94a3b8' : '#64748b',
  badgeBg: dark ? 'rgba(30,58,138,0.25)' : 'rgba(30,58,138,0.08)',
  badgeText: dark ? '#93c5fd' : '#1e3a8a',
  btnPrimary: 'linear-gradient(90deg,#1e3a8a,#2563eb)',
  btnPrimaryHover: '0 6px 20px rgba(30,58,138,0.4)',
  btnSecBg: dark ? '#111827' : '#ffffff',
  btnSecBorder: dark ? '#334155' : '#e2e8f0',
  btnSecText: dark ? '#94a3b8' : '#64748b',
  modalBg: dark ? '#111827' : '#ffffff',
  modalDivider: dark ? '#1e293b' : '#f1f5f9',
  errorInline: dark ? '#fca5a5' : '#ef4444',
})

function iniciales(nombre = '', apellido = '') {
  const n = nombre.trim()[0] ?? ''
  const a = apellido.trim()[0] ?? ''
  return (n + a).toUpperCase() || 'U'
}

export default function PerfilPage() {
  const { t } = useTranslation()
  const { usuario } = useAuthStore()
  const { tema } = useLanding()
  const dark = tema === 'oscuro'
  const c = colores(dark)

  const {
    formData,
    errores,
    cargando,
    exito,
    error,
    modoEdicion,
    requiereVerificacion,
    errorVerificacion,
    cargandoVerificacion,
    actualizarCampo,
    handleGuardar,
    handleCancelar,
    habilitarEdicion,
    handleVerificarContrasena,
  } = usePerfil()

  useEffect(() => {
    if (exito) {
      showAlert({
        icon: 'success',
        title: t('perfil.profileUpdated'),
        text: t('perfil.profileUpdatedText'),
      })
    }
  }, [exito, t])

  useEffect(() => {
    if (error) {
      showAlert({ icon: 'error', title: t('perfil.errorUpdating'), text: error })
    }
  }, [error, t])

  if (!usuario) {
    return (
      <div style={{ minHeight: '100vh', background: c.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: c.text, fontSize: '18px' }}>Por favor, inicia sesión</div>
      </div>
    )
  }

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: `1.5px solid ${hasError ? c.inputErrorBorder : c.inputBorder}`,
    background: hasError ? c.inputErrorBg : c.inputBg,
    fontSize: '14px',
    color: c.inputText,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 150ms',
  })

  const readonlyStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: `1.5px solid ${c.inputBorder}`,
    background: c.readonlyBg,
    fontSize: '14px',
    color: c.readonlyText,
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'default',
  }

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: 700,
    color: c.labelText,
    marginBottom: '7px',
    letterSpacing: '0.04em',
  }

  return (
    <div style={{ minHeight: '100vh', background: c.pageBg }}>
      {/* Banner superior con avatar */}
      <div style={{ background: c.heroBg, padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: '3px solid rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: 800,
            color: '#fff',
            flexShrink: 0,
          }}>
            {iniciales(usuario.nombre, usuario.apellido)}
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
              {usuario.nombre} {usuario.apellido}
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: '0 0 8px' }}>
              {usuario.correo}
            </p>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '20px',
              textTransform: 'capitalize',
              letterSpacing: '0.04em',
            }}>
              <FaUser style={{ fontSize: '9px' }} />
              {usuario.rol || 'cliente'}
            </span>
          </div>
          <div style={{ flex: 1 }} />
          {!modoEdicion && (
            <button
              onClick={habilitarEdicion}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <FaEdit /> {t('perfil.edit')}
            </button>
          )}
        </div>
      </div>

      {/* Contenido principal, superpuesto al banner */}
      <div style={{ maxWidth: '780px', margin: '-44px auto 40px', padding: '0 24px' }}>

        {/* Información Personal */}
        <div style={{ background: c.cardBg, borderRadius: '14px', border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow, marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${c.divider}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaUser style={{ color: c.sectionTitle, fontSize: '15px' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: c.title, margin: 0 }}>
              {t('perfil.personalInfo')}
            </h2>
          </div>

          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Nombre */}
            <div>
              <label style={labelStyle}>
                <FaUser style={{ fontSize: '10px' }} /> {t('perfil.firstName')}
              </label>
              {modoEdicion ? (
                <>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={e => actualizarCampo('nombre', e.target.value)}
                    placeholder="Tu nombre"
                    style={inputStyle(!!errores.nombre)}
                    onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                    onBlur={e => e.target.style.borderColor = errores.nombre ? c.inputErrorBorder : c.inputBorder}
                  />
                  {errores.nombre && <p style={{ color: c.errorText, fontSize: '12px', margin: '5px 0 0' }}>{errores.nombre}</p>}
                </>
              ) : (
                <input type="text" value={formData.nombre} readOnly style={readonlyStyle} />
              )}
            </div>

            {/* Apellido */}
            <div>
              <label style={labelStyle}>
                <FaUser style={{ fontSize: '10px' }} /> {t('perfil.lastName')}
              </label>
              {modoEdicion ? (
                <>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={e => actualizarCampo('apellido', e.target.value)}
                    placeholder="Tu apellido"
                    style={inputStyle(!!errores.apellido)}
                    onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                    onBlur={e => e.target.style.borderColor = errores.apellido ? c.inputErrorBorder : c.inputBorder}
                  />
                  {errores.apellido && <p style={{ color: c.errorText, fontSize: '12px', margin: '5px 0 0' }}>{errores.apellido}</p>}
                </>
              ) : (
                <input type="text" value={formData.apellido} readOnly style={readonlyStyle} />
              )}
            </div>

            {/* Cédula (solo lectura) */}
            <div>
              <label style={labelStyle}>
                <FaIdCard style={{ fontSize: '10px' }} /> {t('perfil.docNumber')}
              </label>
              <input type="text" value={formData.cedula || '—'} readOnly style={readonlyStyle} />
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label style={labelStyle}>
                <FaBirthdayCake style={{ fontSize: '10px' }} /> {t('perfil.birthDate')}
              </label>
              {modoEdicion ? (
                <>
                  <input
                    type="date"
                    value={formData.fechaNacimiento || ''}
                    onChange={e => actualizarCampo('fechaNacimiento', e.target.value)}
                    style={{
                      ...inputStyle(false),
                      colorScheme: dark ? 'dark' : 'light',
                    }}
                    onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                    onBlur={e => e.target.style.borderColor = c.inputBorder}
                  />
                </>
              ) : (
                <input type="text" value={formData.fechaNacimiento || '—'} readOnly style={readonlyStyle} />
              )}
            </div>
          </div>
        </div>

        {/* Datos de Contacto */}
        <div style={{ background: c.cardBg, borderRadius: '14px', border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow, marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${c.divider}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaEnvelope style={{ color: c.sectionTitle, fontSize: '15px' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: c.title, margin: 0 }}>
              {t('perfil.contactData')}
            </h2>
          </div>

          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Correo */}
            <div>
              <label style={labelStyle}>
                <FaEnvelope style={{ fontSize: '10px' }} /> {t('perfil.email')}
              </label>
              {modoEdicion ? (
                <>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={e => actualizarCampo('correo', e.target.value)}
                    placeholder="correo@ejemplo.com"
                    style={inputStyle(!!errores.correo)}
                    onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                    onBlur={e => e.target.style.borderColor = errores.correo ? c.inputErrorBorder : c.inputBorder}
                  />
                  {errores.correo && <p style={{ color: c.errorText, fontSize: '12px', margin: '5px 0 0' }}>{errores.correo}</p>}
                  {formData.correo !== usuario.correo && !errores.correo && (
                    <p style={{ color: c.textMuted, fontSize: '11px', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaLock style={{ fontSize: '9px' }} /> Se solicitará tu contraseña actual
                    </p>
                  )}
                </>
              ) : (
                <input type="email" value={formData.correo} readOnly style={readonlyStyle} />
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label style={labelStyle}>
                <FaPhone style={{ fontSize: '10px' }} /> {t('perfil.phone')}
              </label>
              {modoEdicion ? (
                <>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={e => actualizarCampo('telefono', e.target.value)}
                    placeholder="+57 300 1234567"
                    style={inputStyle(!!errores.telefono)}
                    onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                    onBlur={e => e.target.style.borderColor = errores.telefono ? c.inputErrorBorder : c.inputBorder}
                  />
                  {errores.telefono && <p style={{ color: c.errorText, fontSize: '12px', margin: '5px 0 0' }}>{errores.telefono}</p>}
                </>
              ) : (
                <input type="tel" value={formData.telefono || '—'} readOnly style={readonlyStyle} />
              )}
            </div>
          </div>
        </div>

        {/* Seguridad y Contraseña */}
        <CambiarContrasena c={c} />

        {/* Botones cuando está en modo edición */}
        {modoEdicion && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={handleCancelar}
              disabled={cargando}
              style={{
                padding: '11px 24px',
                borderRadius: '10px',
                background: c.btnSecBg,
                border: `1.5px solid ${c.btnSecBorder}`,
                color: c.btnSecText,
                fontWeight: 600,
                fontSize: '14px',
                cursor: cargando ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: cargando ? 0.5 : 1,
                transition: 'all 150ms',
              }}
            >
              <FaTimes /> {t('perfil.cancel')}
            </button>
            <button
              onClick={handleGuardar}
              disabled={cargando}
              style={{
                padding: '11px 28px',
                borderRadius: '10px',
                background: c.btnPrimary,
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: cargando ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: cargando ? 0.7 : 1,
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { if (!cargando) e.currentTarget.style.boxShadow = c.btnPrimaryHover }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
            >
              {cargando ? (
                <>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  {t('perfil.saving')}
                </>
              ) : (
                <><FaCheck /> {t('perfil.save')}</>
              )}
            </button>
          </div>
        )}
      </div>

      {requiereVerificacion && (
        <ModalVerificacionContrasena
          onVerificar={handleVerificarContrasena}
          onCancelar={handleCancelar}
          cargando={cargandoVerificacion}
          error={errorVerificacion}
          c={{
            modalBg: c.modalBg,
            modalDivider: c.modalDivider,
            text: c.text,
            inputBg: c.inputBg,
            inputBorder: c.inputBorder,
            inputBorderHover: c.inputBorderFocus,
            inputErrorBg: c.inputErrorBg,
            inputErrorBorder: c.inputErrorBorder,
            inputText: c.inputText,
            errorInline: c.errorInline,
            secondaryBtnBg: c.btnSecBg,
            secondaryBtnBorder: c.btnSecBorder,
            secondaryBtnText: c.btnSecText,
          }}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: ${c.inputPlaceholder}; opacity: 1; }
      `}</style>
    </div>
  )
}
