import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanding } from '@/modules/landing/LandingContext'
import { usePerfil } from '../hooks/useProfile'
import { useAuthStore } from '@/store/authStore'
import { showAlert } from '@/utils/swalConfig'
import PasswordVerificationModal from '../components/PasswordVerificationModal'
import ChangePassword from '../components/ChangePassword'
import MenuConfiguracion from '@/components/MenuConfiguracion'
import { FaEdit, FaCheck, FaTimes, FaUser, FaEnvelope, FaPhone, FaArrowLeft, FaSignOutAlt, FaExclamationTriangle, FaIdCard, FaGlobe } from 'react-icons/fa'
import paisesMock from '@/mocks/nationalities.json'
import '@/modules/catalog/pages/CatalogPage.css'
import '@/modules/catalog/pages/VehicleDetailsPage.css'
import './ProfilePage.css'

function iniciales(nombre = '', apellido = '', correo = '') {
  const n = (nombre || '').trim()[0] ?? ''
  const a = (apellido || '').trim()[0] ?? ''
  if (n || a) return (n + a).toUpperCase()
  if (correo) return (correo || '').trim()[0].toUpperCase()
  return 'U'
}

const TIPOS_DOC = [
  { value: 'CC', sigla: 'CC', label: 'Cédula de ciudadanía (CC)' },
  { value: 'TI', sigla: 'TI', label: 'Tarjeta de identidad (TI)' },
  { value: 'CE', sigla: 'CE', label: 'Documento extranjero (CE)' },
  { value: 'PAS', sigla: 'PAS', label: 'Pasaporte (PAS)' },
]

function getSiglaDoc(tipo) {
  const item = TIPOS_DOC.find(t => t.value === tipo || t.sigla === tipo)
  return item?.sigla || (tipo ? tipo.substring(0, 3).toUpperCase() : 'CC')
}

function getPrefijoPais(nacionalidad) {
  if (!nacionalidad) return '+57'
  const pais = paisesMock.find(p => p.nombre.toLowerCase() === nacionalidad.toLowerCase())
  return pais?.prefijo || '+57'
}

export default function PerfilPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { usuario, logout } = useAuthStore()

  const handleCerrarSesion = () => {
    showAlert({
      icon: 'warning',
      title: t('catalogo.logout', 'Cerrar sesión'),
      text: t('perfil.logoutConfirm', '¿Seguro que deseas cerrar tu sesión?'),
      showCancelButton: true,
      confirmButtonText: t('catalogo.logout', 'Cerrar sesión'),
      cancelButtonText: t('perfil.cancel', 'Cancelar'),
    }).then((result) => {
      if (result.isConfirmed) {
        logout()
        window.location.replace('/')
      }
    })
  }
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'

  const c = {
    pageBg: esModoOscuro ? '#0f172a' : '#f8fafc',
    cardBg: esModoOscuro ? '#111827' : '#ffffff',
    cardBorder: esModoOscuro ? '#334155' : '#e2e8f0',
    subCardBg: esModoOscuro ? '#1e293b' : '#f8fafc',
    subCardBorder: esModoOscuro ? '#334155' : '#e2e8f0',
    textPrimary: esModoOscuro ? '#f8fafc' : '#111a3a',
    textSecondary: esModoOscuro ? '#94a3b8' : '#64748b',
    accentText: esModoOscuro ? '#93c5fd' : '#1e3a8a',
    titleColor: esModoOscuro ? '#93c5fd' : '#1e3a8a',
    accentBgSoft: esModoOscuro ? 'rgba(37,99,235,0.18)' : '#eff6ff',
    accentGradient: 'linear-gradient(90deg, #1e3a8a, #2563eb)',
    navBg: esModoOscuro ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.98)',
    navBorder: esModoOscuro ? '#1e293b' : '#e8eef8',
    navShadow: esModoOscuro ? '0 2px 12px rgba(0,0,0,0.25)' : '0 2px 14px rgba(30,58,138,0.06)',
    title: esModoOscuro ? '#f8fafc' : '#111a3a',
    text: esModoOscuro ? '#e2e8f0' : '#1e293b',
    textMuted: esModoOscuro ? '#94a3b8' : '#64748b',
    labelText: esModoOscuro ? '#94a3b8' : '#64748b',
    inputBg: esModoOscuro ? '#0f172a' : '#f8fafc',
    inputBorder: esModoOscuro ? '#334155' : '#e2e8f0',
    inputBorderFocus: esModoOscuro ? '#60a5fa' : '#93c5fd',
    inputErrorBg: esModoOscuro ? 'rgba(127,29,29,0.18)' : '#fef2f2',
    inputErrorBorder: '#f87171',
    inputText: esModoOscuro ? '#e2e8f0' : '#1e293b',
    inputPlaceholder: esModoOscuro ? '#64748b' : '#94a3b8',
    errorText: esModoOscuro ? '#fca5a5' : '#ef4444',
    readonlyBg: esModoOscuro ? '#0f172a' : '#f8fafc',
    readonlyText: esModoOscuro ? '#e2e8f0' : '#1e293b',
    innerCardBg: esModoOscuro ? '#111827' : '#ffffff',
    innerCardBorder: esModoOscuro ? '#334155' : '#e2e8f0',
    innerCardShadow: esModoOscuro ? '0 4px 20px rgba(0,0,0,0.30)' : '0 2px 10px rgba(30,58,138,0.04)',
    badgeBg: esModoOscuro ? 'rgba(37,99,235,0.18)' : '#eff6ff',
    badgeText: esModoOscuro ? '#93c5fd' : '#1e3a8a',
    btnPrimary: 'linear-gradient(90deg,#1e3a8a,#2563eb)',
    btnSecBg: esModoOscuro ? '#1e293b' : '#ffffff',
    btnSecBorder: esModoOscuro ? '#334155' : '#e2e8f0',
    btnSecText: esModoOscuro ? '#cbd5e1' : '#64748b',
    modalBg: esModoOscuro ? '#111827' : '#ffffff',
    modalDivider: esModoOscuro ? '#1e293b' : '#f1f5f9',
    errorInline: esModoOscuro ? '#fca5a5' : '#ef4444',
  }

  const {
    formData,
    errores,
    cargando,
    exito,
    error,
    modoEdicion,
    esPerfilIncompleto,
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

  if (!usuario) return null

  const inputStyle = (hasError) => ({
    width: '100%',
    height: '42px',
    padding: '0 14px',
    borderRadius: '10px',
    border: `1.5px solid ${hasError ? c.inputErrorBorder : c.inputBorder}`,
    background: hasError ? c.inputErrorBg : c.inputBg,
    fontSize: '13.5px',
    color: c.inputText,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 150ms ease',
  })

  const selectStyle = (hasError) => ({
    width: '100%',
    height: '42px',
    padding: '0 36px 0 14px',
    borderRadius: '10px',
    border: `1.5px solid ${hasError ? c.inputErrorBorder : c.inputBorder}`,
    background: hasError ? c.inputErrorBg : c.inputBg,
    fontSize: '13.5px',
    color: c.inputText,
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
  })

  const readonlyStyle = {
    width: '100%',
    height: '42px',
    padding: '0 14px',
    borderRadius: '10px',
    border: `1px solid ${c.innerCardBorder}`,
    background: c.readonlyBg,
    fontSize: '13.5px',
    fontWeight: '500',
    color: c.readonlyText,
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'default',
    display: 'flex',
    alignItems: 'center',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11.5px',
    fontWeight: 600,
    color: c.labelText,
    marginBottom: '5px',
  }

  const nombreMostrar = (usuario.nombre || usuario.apellido)
    ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim()
    : (usuario.correo || 'Usuario')

  return (
    <div className="catalogo-page" style={{ minHeight: '100vh', background: c.pageBg, color: c.textPrimary, zoom: 0.9 }}>
      
      <div className="detalle-contenido-inner" style={{ maxWidth: 1040, margin: '0 auto', padding: '20px 20px 50px' }}>
        
        {/* Top bar (Botón Volver al catálogo a la izquierda + Menú Configuración a la derecha) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button 
            className="catalogo-header-back" 
            onClick={() => navigate('/home')}
            style={{
              background: c.cardBg,
              border: `1px solid ${c.cardBorder}`,
              color: c.accentText,
              padding: '7px 15px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            <FaArrowLeft size={12} /> {t('perfil.backToCatalog', 'Volver al catálogo')}
          </button>

          <MenuConfiguracion />
        </div>

        {/* Contenedor Maestro Unificado */}
        <div className="vehiculo-main-container perfil-master-wrapper" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, boxShadow: esModoOscuro ? '0 4px 24px rgba(0,0,0,0.40)' : '0 4px 24px rgba(30,58,138,0.07)', borderRadius: '20px', padding: '24px' }}>
          
          {/* 1. Banner Superior con Avatar (Card Azul) */}
          <div className="perfil-banner-card" style={{ background: esModoOscuro ? 'linear-gradient(135deg, #0f1a3d 0%, #1e3a8a 100%)' : '#1b43b5', borderRadius: '14px', padding: '22px 28px', display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', overflow: 'hidden' }}>
            
            {/* Formas Geométricas Decorativas de Fondo (Doble Círculo Traslúcido) */}
            <div style={{
              position: 'absolute',
              right: '-60px',
              top: '-80px',
              width: '360px',
              height: '360px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute',
              right: '90px',
              top: '-120px',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.04)',
              pointerEvents: 'none',
            }} />

            {/* Avatar en Círculo con borde fino */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1.5px solid rgba(255, 255, 255, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
              zIndex: 1,
            }}>
              {iniciales(usuario.nombre, usuario.apellido, usuario.correo)}
            </div>
            
            {/* Info de Nombre, Correo y Rol */}
            <div style={{ zIndex: 1 }}>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
                {nombreMostrar}
              </h1>
              <p style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.75)', margin: '0 0 8px' }}>
                {usuario.correo}
              </p>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                fontSize: '10.5px',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '20px',
                textTransform: 'capitalize',
              }}>
                <FaUser style={{ fontSize: '9px' }} />
                {usuario.rol ? (usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)) : 'Usuario'}
              </span>
            </div>

            <div style={{ flex: 1 }} />

            {!modoEdicion ? (
              <button
                onClick={habilitarEdicion}
                style={{
                  padding: '9px 20px',
                  borderRadius: '10px',
                  background: esPerfilIncompleto ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  border: esPerfilIncompleto ? 'none' : '1px solid rgba(255, 255, 255, 0.35)',
                  color: esPerfilIncompleto ? '#1e3a8a' : '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 150ms ease',
                  marginLeft: 'auto',
                  zIndex: 1,
                  boxShadow: esPerfilIncompleto ? '0 4px 16px rgba(0,0,0,0.18)' : 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  if (!esPerfilIncompleto) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  if (!esPerfilIncompleto) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                }}
              >
                <FaEdit style={{ fontSize: '13px' }} />
                {esPerfilIncompleto
                  ? t('perfil.completeProfileBtn', 'Completar perfil')
                  : t('perfil.editProfileBtn', 'Editar perfil')}
              </button>
            ) : (
              <button
                onClick={handleCancelar}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  transition: 'all 150ms ease',
                  marginLeft: 'auto',
                  zIndex: 1,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.28)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              >
                <FaTimes style={{ fontSize: '13px' }} /> {t('perfil.cancel', 'Cancelar')}
              </button>
            )}
          </div>

          {/* 2. Fila con dos tarjetas: Información Personal + Datos de Contacto */}
          <div className="perfil-cards-grid">
            
            {/* Tarjeta Izquierda: Información Personal */}
            <div style={{ background: c.innerCardBg, borderRadius: '14px', border: `1px solid ${c.innerCardBorder}`, boxShadow: c.innerCardShadow, padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: c.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaUser style={{ color: c.badgeText, fontSize: '13px' }} />
                  </div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: c.title, margin: 0 }}>
                    {t('perfil.personalInfo', 'Información Personal')}
                  </h2>
                </div>

                {esPerfilIncompleto ? (
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: esModoOscuro ? 'rgba(148, 163, 184, 0.15)' : '#f1f5f9',
                      color: esModoOscuro ? '#cbd5e1' : '#475569',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: `1px solid ${esModoOscuro ? 'rgba(148, 163, 184, 0.3)' : '#cbd5e1'}`,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: esModoOscuro ? '#94a3b8' : '#64748b' }} />
                    {t('perfil.statusIncomplete', 'Incompleto')}
                  </span>
                ) : (
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: esModoOscuro ? 'rgba(37, 99, 235, 0.2)' : '#eff6ff',
                      color: esModoOscuro ? '#93c5fd' : '#1e3a8a',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: `1px solid ${esModoOscuro ? 'rgba(37, 99, 235, 0.4)' : '#bfdbfe'}`,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: esModoOscuro ? '#60a5fa' : '#2563eb' }} />
                    {t('perfil.statusVerified', 'Verificado')}
                  </span>
                )}
              </div>

              <div className="perfil-info-grid">
                {/* Nombres Completo */}
                <div>
                  <label style={labelStyle}>{t('perfil.firstName', 'Nombres completos')}</label>
                  {modoEdicion ? (
                    <>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={e => {
                          const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
                          actualizarCampo('nombre', val)
                        }}
                        placeholder="Tus nombres completos"
                        style={inputStyle(!!errores.nombre)}
                        onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                        onBlur={e => e.target.style.borderColor = errores.nombre ? c.inputErrorBorder : c.inputBorder}
                      />
                      {errores.nombre && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.nombre}</p>}
                    </>
                  ) : (
                    <div style={readonlyStyle}>
                      <span style={{ color: formData.nombre ? c.readonlyText : '#94a3b8', fontStyle: formData.nombre ? 'normal' : 'italic' }}>
                        {formData.nombre || t('perfil.notSpecified', 'Sin registrar')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Apellidos Completo */}
                <div>
                  <label style={labelStyle}>{t('perfil.lastName', 'Apellidos completos')}</label>
                  {modoEdicion ? (
                    <>
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={e => {
                          const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
                          actualizarCampo('apellido', val)
                        }}
                        placeholder="Tus apellidos completos"
                        style={inputStyle(!!errores.apellido)}
                        onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                        onBlur={e => e.target.style.borderColor = errores.apellido ? c.inputErrorBorder : c.inputBorder}
                      />
                      {errores.apellido && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.apellido}</p>}
                    </>
                  ) : (
                    <div style={readonlyStyle}>
                      <span style={{ color: formData.apellido ? c.readonlyText : '#94a3b8', fontStyle: formData.apellido ? 'normal' : 'italic' }}>
                        {formData.apellido || t('perfil.notSpecified', 'Sin registrar')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tipo de documento */}
                <div>
                  <label style={labelStyle}>{t('perfil.docType', 'Tipo de documento')}</label>
                  {modoEdicion ? (
                    <>
                      <select
                        value={formData.tipoDocumento}
                        onChange={e => actualizarCampo('tipoDocumento', e.target.value)}
                        style={selectStyle(!!errores.tipoDocumento)}
                        onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                        onBlur={e => e.target.style.borderColor = errores.tipoDocumento ? c.inputErrorBorder : c.inputBorder}
                      >
                        <option value="">{t('perfil.selectDocType', 'Seleccionar tipo')}</option>
                        {TIPOS_DOC.map(td => (
                          <option key={td.value} value={td.value}>{td.label}</option>
                        ))}
                      </select>
                      {errores.tipoDocumento && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.tipoDocumento}</p>}
                    </>
                  ) : (
                    <div style={readonlyStyle}>
                      <span style={{ color: formData.tipoDocumento ? c.readonlyText : '#94a3b8', fontStyle: formData.tipoDocumento ? 'normal' : 'italic' }}>
                        {TIPOS_DOC.find(t => t.value === formData.tipoDocumento)?.label || formData.tipoDocumento || t('perfil.notSpecified', 'Sin registrar')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Número de documento con insignia de Sigla unificada */}
                <div>
                  <label style={labelStyle}>{t('perfil.docNumber', 'Número de documento')}</label>
                  {modoEdicion ? (
                    <>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '10px',
                          border: `1.5px solid ${errores.cedula ? c.inputErrorBorder : c.inputBorder}`,
                          background: errores.cedula ? c.inputErrorBg : c.inputBg,
                          height: '42px',
                          overflow: 'hidden',
                          boxSizing: 'border-box',
                          transition: 'all 150ms ease',
                        }}
                      >
                        <span
                          style={{
                            padding: '0 12px',
                            height: '100%',
                            background: esModoOscuro ? '#1e293b' : '#f1f5f9',
                            borderRight: `1px solid ${c.inputBorder}`,
                            color: esModoOscuro ? '#93c5fd' : '#1e3a8a',
                            fontSize: '12.5px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            userSelect: 'none',
                            letterSpacing: '0.04em',
                            flexShrink: 0,
                          }}
                        >
                          {getSiglaDoc(formData.tipoDocumento)}
                        </span>
                        <input
                          type="text"
                          value={formData.cedula}
                          onChange={e => {
                            const isNumericOnly = ['CC', 'TI'].includes(formData.tipoDocumento || 'CC')
                            const val = isNumericOnly
                              ? e.target.value.replace(/\D/g, '')
                              : e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
                            actualizarCampo('cedula', val)
                          }}
                          placeholder={['CC', 'TI'].includes(formData.tipoDocumento || 'CC') ? "Ej: 1020304050" : "Ej: AB123456"}
                          style={{
                            flex: 1,
                            height: '100%',
                            border: 'none',
                            background: 'transparent',
                            padding: '0 12px',
                            fontSize: '13.5px',
                            color: c.inputText,
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      {errores.cedula && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.cedula}</p>}
                    </>
                  ) : (
                    <div style={readonlyStyle}>
                      <span style={{ color: formData.cedula ? c.readonlyText : '#94a3b8', fontStyle: formData.cedula ? 'normal' : 'italic' }}>
                        {formData.cedula ? `${getSiglaDoc(formData.tipoDocumento)} - ${formData.cedula}` : t('perfil.notSpecified', 'Sin registrar')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Fecha de nacimiento */}
                <div>
                  <label style={labelStyle}>{t('perfil.birthDate', 'Fecha de nacimiento')}</label>
                  {modoEdicion ? (
                    <>
                      <input
                        type="date"
                        value={formData.fechaNacimiento || ''}
                        onChange={e => actualizarCampo('fechaNacimiento', e.target.value)}
                        style={{ ...inputStyle(!!errores.fechaNacimiento), colorScheme: esModoOscuro ? 'dark' : 'light' }}
                        onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                        onBlur={e => e.target.style.borderColor = errores.fechaNacimiento ? c.inputErrorBorder : c.inputBorder}
                      />
                      {errores.fechaNacimiento && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.fechaNacimiento}</p>}
                    </>
                  ) : (
                    <div style={readonlyStyle}>
                      <span style={{ color: formData.fechaNacimiento ? c.readonlyText : '#94a3b8', fontStyle: formData.fechaNacimiento ? 'normal' : 'italic' }}>
                        {formData.fechaNacimiento || t('perfil.notSpecified', 'Sin registrar')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tarjeta Derecha: Datos de Contacto */}
            <div style={{ background: c.innerCardBg, borderRadius: '14px', border: `1px solid ${c.innerCardBorder}`, boxShadow: c.innerCardShadow, padding: '22px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: c.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaEnvelope style={{ color: c.badgeText, fontSize: '13px' }} />
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: c.title, margin: 0 }}>
                  {t('perfil.contactData', 'Datos de Contacto')}
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Correo electrónico */}
                <div>
                  <label style={labelStyle}>{t('perfil.email', 'Correo electrónico')}</label>
                  {modoEdicion ? (
                    <>
                      <input type="email" value={formData.correo} onChange={e => actualizarCampo('correo', e.target.value)} placeholder="correo@ejemplo.com" style={inputStyle(!!errores.correo)} onFocus={e => e.target.style.borderColor = c.inputBorderFocus} onBlur={e => e.target.style.borderColor = errores.correo ? c.inputErrorBorder : c.inputBorder} />
                      {errores.correo && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.correo}</p>}
                    </>
                  ) : (
                    <div style={{ ...readonlyStyle, padding: '0 14px' }}>
                      <FaEnvelope style={{ color: esModoOscuro ? '#94a3b8' : '#1e3a8a', fontSize: '13px', marginRight: '10px', flexShrink: 0 }} />
                      <span style={{ color: formData.correo ? c.readonlyText : '#94a3b8', fontStyle: formData.correo ? 'normal' : 'italic' }}>
                        {formData.correo || t('perfil.notSpecified', 'Sin registrar')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Nacionalidad */}
                <div>
                  <label style={labelStyle}>{t('perfil.nationality', 'Nacionalidad')}</label>
                  {modoEdicion ? (
                    <>
                      <select
                        value={formData.nacionalidad}
                        onChange={e => actualizarCampo('nacionalidad', e.target.value)}
                        style={selectStyle(!!errores.nacionalidad)}
                        onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                        onBlur={e => e.target.style.borderColor = errores.nacionalidad ? c.inputErrorBorder : c.inputBorder}
                      >
                        <option value="">{t('perfil.selectNationality', 'Seleccionar país')}</option>
                        {paisesMock.map(p => (
                          <option key={p.nombre} value={p.nombre}>{p.nombre} ({p.prefijo})</option>
                        ))}
                      </select>
                      {errores.nacionalidad && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.nacionalidad}</p>}
                    </>
                  ) : (
                    <div style={{ ...readonlyStyle, padding: '0 14px' }}>
                      <FaGlobe style={{ color: esModoOscuro ? '#94a3b8' : '#1e3a8a', fontSize: '13px', marginRight: '10px', flexShrink: 0 }} />
                      <span style={{ color: formData.nacionalidad ? c.readonlyText : '#94a3b8', fontStyle: formData.nacionalidad ? 'normal' : 'italic' }}>
                        {formData.nacionalidad || t('perfil.notSpecified', 'Sin registrar')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Teléfono con insignia de prefijo internacional (+57, +1, +55, etc.) unificada */}
                <div>
                  <label style={labelStyle}>{t('perfil.phone', 'Teléfono')}</label>
                  {modoEdicion ? (
                    <>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '10px',
                          border: `1.5px solid ${errores.telefono ? c.inputErrorBorder : c.inputBorder}`,
                          background: errores.telefono ? c.inputErrorBg : c.inputBg,
                          height: '42px',
                          overflow: 'hidden',
                          boxSizing: 'border-box',
                          transition: 'all 150ms ease',
                        }}
                      >
                        <span
                          style={{
                            padding: '0 12px',
                            height: '100%',
                            background: esModoOscuro ? '#1e293b' : '#f1f5f9',
                            borderRight: `1px solid ${c.inputBorder}`,
                            color: esModoOscuro ? '#93c5fd' : '#1e3a8a',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            userSelect: 'none',
                            letterSpacing: '0.04em',
                            flexShrink: 0,
                          }}
                        >
                          {getPrefijoPais(formData.nacionalidad)}
                        </span>
                        <input
                          type="tel"
                          value={formData.telefono}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '')
                            actualizarCampo('telefono', val)
                          }}
                          placeholder="3001234567"
                          style={{
                            flex: 1,
                            height: '100%',
                            border: 'none',
                            background: 'transparent',
                            padding: '0 12px',
                            fontSize: '13.5px',
                            color: c.inputText,
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      {errores.telefono && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.telefono}</p>}
                    </>
                  ) : (
                    <div style={{ ...readonlyStyle, padding: '0 14px' }}>
                      <FaPhone style={{ color: esModoOscuro ? '#94a3b8' : '#1e3a8a', fontSize: '13px', marginRight: '10px', flexShrink: 0 }} />
                      <span style={{ color: formData.telefono ? c.readonlyText : '#94a3b8', fontStyle: formData.telefono ? 'normal' : 'italic' }}>
                        {formData.telefono ? `${getPrefijoPais(formData.nacionalidad)} ${formData.telefono}` : t('perfil.notSpecified', 'Sin registrar')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botones de guardar/cancelar en modo edición */}
          {modoEdicion && (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px', marginBottom: '24px' }}>
              <button onClick={handleCancelar} disabled={cargando} style={{ padding: '11px 24px', borderRadius: '10px', background: c.btnSecBg, border: `1.5px solid ${c.btnSecBorder}`, color: c.btnSecText, fontWeight: 600, fontSize: '14px', cursor: cargando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: cargando ? 0.5 : 1 }}>
                <FaTimes /> {t('perfil.cancel', 'Cancelar')}
              </button>
              <button onClick={handleGuardar} disabled={cargando} style={{ padding: '11px 28px', borderRadius: '10px', background: c.btnPrimary, color: '#fff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: cargando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: cargando ? 0.7 : 1 }}>
                {cargando ? ( <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> {t('perfil.saving', 'Guardando...')}</> ) : ( <><FaCheck /> {t('perfil.save', 'Guardar cambios')}</> )}
              </button>
            </div>
          )}

          {/* 3. Seguridad y Contraseña */}
          <div>
            <ChangePassword c={c} />
          </div>

          {/* 4. Cerrar sesión */}
          <div style={{
            background: c.innerCardBg,
            borderRadius: '14px',
            border: `1px solid ${c.innerCardBorder}`,
            boxShadow: c.innerCardShadow,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: c.title, margin: '0 0 3px' }}>
                {t('catalogo.logout', 'Cerrar sesión')}
              </h2>
              <p style={{ fontSize: '12.5px', color: c.textMuted, margin: 0 }}>
                {t('perfil.logoutConfirm', '¿Seguro que deseas cerrar tu sesión?')}
              </p>
            </div>
            
            <button
              onClick={handleCerrarSesion}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                background: 'transparent',
                border: '1.5px solid #ef4444',
                color: '#ef4444',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                whiteSpace: 'nowrap',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <FaSignOutAlt style={{ fontSize: '13px' }} /> {t('catalogo.logout', 'Cerrar sesión')}
            </button>
          </div>

        </div>

      </div>

      {requiereVerificacion && (
        <PasswordVerificationModal
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
