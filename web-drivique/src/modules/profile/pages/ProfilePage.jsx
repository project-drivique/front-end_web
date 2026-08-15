import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanding } from '@/modules/landing/LandingContext'
import { usePerfil } from '../hooks/useProfile'
import { useAuthStore } from '@/store/authStore'
import { showAlert } from '@/utils/swalConfig'
import PasswordVerificationModal from '../components/PasswordVerificationModal'
import ChangePassword from '../components/ChangePassword'
import DeleteAccountModal from '../components/DeleteAccountModal'
import MenuConfiguracion from '@/components/MenuConfiguracion'
import { FaEdit, FaCheck, FaTimes, FaUser, FaEnvelope, FaPhone, FaArrowLeft, FaSignOutAlt, FaExclamationTriangle, FaIdCard, FaGlobe, FaCalendarAlt, FaHashtag, FaTrashAlt } from 'react-icons/fa'
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
  if (!tipo) return ''
  const item = TIPOS_DOC.find(t => t.value === tipo || t.sigla === tipo)
  return item?.sigla || (tipo ? tipo.substring(0, 3).toUpperCase() : '')
}

function getPrefijoPais(nacionalidad) {
  if (!nacionalidad) return ''
  const pais = paisesMock.find(p => p.nombre.toLowerCase() === nacionalidad.toLowerCase())
  return pais?.prefijo || ''
}

export default function PerfilPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { usuario, logout } = useAuthStore()
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false)

  const handleCerrarSesion = () => {
    showAlert({
      icon: 'warning',
      title: t('catalogo.logout', 'Cerrar sesión'),
      text: t('perfil.logoutConfirm', '¿Estás seguro de que deseas cerrar sesión?'),
      showCancelButton: true,
      confirmButtonText: t('perfil.accept', 'Aceptar'),
      cancelButtonText: t('perfil.cancel', 'Cancelar'),
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
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
      
      <div className="detalle-contenido-inner" style={{ maxWidth: 1360, margin: '0 auto', padding: '24px 24px 60px' }}>
        
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

            {!modoEdicion && (
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
            )}
          </div>

          {/* 2. Fila con tres tarjetas: Datos Personales + Datos de Contacto + Documento de Identidad */}
          <div className="perfil-cards-grid">
            
            {/* Tarjeta 1: Datos Personales */}
            <div style={{ background: c.innerCardBg, borderRadius: '14px', border: `1px solid ${c.innerCardBorder}`, boxShadow: c.innerCardShadow, padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ paddingBottom: '12px', borderBottom: `1px solid ${esModoOscuro ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)'}` }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: esModoOscuro ? '#93c5fd' : '#1e3a8a', margin: 0, letterSpacing: '-0.01em' }}>
                  {t('perfil.personalInfo', 'Datos Personales')}
                </h2>
              </div>

              <p style={{ fontSize: '12.5px', color: c.textMuted, margin: 0, lineHeight: '1.45' }}>
                {t('perfil.personalInfoHint', 'Mantén tu nombre completo y fecha de nacimiento actualizados para personalizar tu perfil.')}
              </p>

              {/* Nombres Completo */}
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                  <FaUser style={{ color: c.accentText || '#1e3a8a', fontSize: '12px', marginRight: '6px' }} />
                  {t('perfil.firstName', 'Nombres completos')}
                </label>
                {modoEdicion ? (
                  <>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={e => {
                        const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
                        actualizarCampo('nombre', val)
                      }}
                      placeholder="Nombres completos"
                      style={inputStyle(!!errores.nombre)}
                      onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                      onBlur={e => e.target.style.borderColor = errores.nombre ? c.inputErrorBorder : c.inputBorder}
                    />
                    {errores.nombre && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.nombre}</p>}
                  </>
                ) : (
                  <div style={readonlyStyle}>
                    <span style={{ color: formData.nombre ? c.readonlyText : '#94a3b8', fontStyle: formData.nombre ? 'normal' : 'italic' }}>
                      {formData.nombre || t('perfil.incomplete', 'Incompleto')}
                    </span>
                  </div>
                )}
              </div>

              {/* Apellidos Completo */}
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                  <FaUser style={{ color: c.accentText || '#1e3a8a', fontSize: '12px', marginRight: '6px' }} />
                  {t('perfil.lastName', 'Apellidos completos')}
                </label>
                {modoEdicion ? (
                  <>
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={e => {
                        const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
                        actualizarCampo('apellido', val)
                      }}
                      placeholder="Apellidos completos"
                      style={inputStyle(!!errores.apellido)}
                      onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                      onBlur={e => e.target.style.borderColor = errores.apellido ? c.inputErrorBorder : c.inputBorder}
                    />
                    {errores.apellido && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.apellido}</p>}
                  </>
                ) : (
                  <div style={readonlyStyle}>
                    <span style={{ color: formData.apellido ? c.readonlyText : '#94a3b8', fontStyle: formData.apellido ? 'normal' : 'italic' }}>
                      {formData.apellido || t('perfil.incomplete', 'Incompleto')}
                    </span>
                  </div>
                )}
              </div>

              {/* Fecha de nacimiento */}
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                  <FaCalendarAlt style={{ color: c.accentText || '#1e3a8a', fontSize: '12px', marginRight: '6px' }} />
                  {t('perfil.birthDate', 'Fecha de nacimiento')}
                </label>
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
                      {formData.fechaNacimiento || t('perfil.incomplete', 'Incompleto')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tarjeta 2: Datos de Contacto */}
            <div style={{ background: c.innerCardBg, borderRadius: '14px', border: `1px solid ${c.innerCardBorder}`, boxShadow: c.innerCardShadow, padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ paddingBottom: '12px', borderBottom: `1px solid ${esModoOscuro ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)'}` }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: esModoOscuro ? '#93c5fd' : '#1e3a8a', margin: 0, letterSpacing: '-0.01em' }}>
                  {t('perfil.contactData', 'Datos de Contacto')}
                </h2>
              </div>

              <p style={{ fontSize: '12.5px', color: c.textMuted, margin: 0, lineHeight: '1.45' }}>
                {t('perfil.contactDataHint', 'Registra tu correo, nacionalidad y teléfono para recibir novedades de tus reservas.')}
              </p>

              {/* Correo electrónico */}
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                  <FaEnvelope style={{ color: c.accentText || '#1e3a8a', fontSize: '12px', marginRight: '6px' }} />
                  {t('perfil.email', 'Correo electrónico')}
                </label>
                {modoEdicion ? (
                  <>
                    <input type="email" value={formData.correo} onChange={e => actualizarCampo('correo', e.target.value)} placeholder="correo@ejemplo.com" style={inputStyle(!!errores.correo)} onFocus={e => e.target.style.borderColor = c.inputBorderFocus} onBlur={e => e.target.style.borderColor = errores.correo ? c.inputErrorBorder : c.inputBorder} />
                    {errores.correo && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.correo}</p>}
                  </>
                ) : (
                  <div style={{ ...readonlyStyle, padding: '0 14px' }}>
                    <span style={{ color: formData.correo ? c.readonlyText : '#94a3b8', fontStyle: formData.correo ? 'normal' : 'italic' }}>
                      {formData.correo || t('perfil.incomplete', 'Incompleto')}
                    </span>
                  </div>
                )}
              </div>

              {/* Nacionalidad */}
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                  <FaGlobe style={{ color: c.accentText || '#1e3a8a', fontSize: '12px', marginRight: '6px' }} />
                  {t('perfil.nationality', 'Nacionalidad')}
                </label>
                {modoEdicion ? (
                  <>
                    <select
                      value={formData.nacionalidad}
                      onChange={e => actualizarCampo('nacionalidad', e.target.value)}
                      style={selectStyle(!!errores.nacionalidad)}
                      onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                      onBlur={e => e.target.style.borderColor = errores.nacionalidad ? c.inputErrorBorder : c.inputBorder}
                    >
                      <option value="">{t('perfil.select', 'Seleccionar')}</option>
                      {[...paisesMock].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')).map(p => (
                        <option key={p.nombre} value={p.nombre}>{p.nombre} ({p.prefijo})</option>
                      ))}
                    </select>
                    {errores.nacionalidad && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.nacionalidad}</p>}
                  </>
                ) : (
                  <div style={{ ...readonlyStyle, padding: '0 14px' }}>
                    <span style={{ color: formData.nacionalidad ? c.readonlyText : '#94a3b8', fontStyle: formData.nacionalidad ? 'normal' : 'italic' }}>
                      {formData.nacionalidad || t('perfil.incomplete', 'Incompleto')}
                    </span>
                  </div>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                  <FaPhone style={{ color: c.accentText || '#1e3a8a', fontSize: '12px', marginRight: '6px' }} />
                  {t('perfil.phone', 'Teléfono')}
                </label>
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
                      {getPrefijoPais(formData.nacionalidad) && (
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
                          {getPrefijoPais(formData.nacionalidad)}
                        </span>
                      )}
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
                    <span style={{ color: formData.telefono ? c.readonlyText : '#94a3b8', fontStyle: formData.telefono ? 'normal' : 'italic' }}>
                      {formData.telefono ? `${getPrefijoPais(formData.nacionalidad)} ${formData.telefono}` : t('perfil.incomplete', 'Incompleto')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tarjeta 3: Documento de Identidad */}
            <div style={{ background: c.innerCardBg, borderRadius: '14px', border: `1px solid ${c.innerCardBorder}`, boxShadow: c.innerCardShadow, padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ paddingBottom: '12px', borderBottom: `1px solid ${esModoOscuro ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)'}` }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: esModoOscuro ? '#93c5fd' : '#1e3a8a', margin: 0, letterSpacing: '-0.01em' }}>
                  {t('perfil.identityDoc', 'Documento de Identidad')}
                </h2>
              </div>

              <p style={{ fontSize: '12.5px', color: c.textMuted, margin: 0, lineHeight: '1.45' }}>
                {t('perfil.identityDocHint', 'Ingresa tu documento oficial para validar tu cuenta y agilizar el alquiler de vehículos.')}
              </p>

              {/* Tipo de documento */}
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                  <FaIdCard style={{ color: c.accentText || '#1e3a8a', fontSize: '12px', marginRight: '6px' }} />
                  {t('perfil.docType', 'Tipo de documento')}
                </label>
                {modoEdicion ? (
                  <>
                    <select
                      value={formData.tipoDocumento}
                      onChange={e => actualizarCampo('tipoDocumento', e.target.value)}
                      style={selectStyle(!!errores.tipoDocumento)}
                      onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                      onBlur={e => e.target.style.borderColor = errores.tipoDocumento ? c.inputErrorBorder : c.inputBorder}
                    >
                      <option value="">{t('perfil.select', 'Seleccionar')}</option>
                      {TIPOS_DOC.map(td => (
                        <option key={td.value} value={td.value}>{td.label}</option>
                      ))}
                    </select>
                    {errores.tipoDocumento && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.tipoDocumento}</p>}
                  </>
                ) : (
                  <div style={readonlyStyle}>
                    <span style={{ color: formData.tipoDocumento ? c.readonlyText : '#94a3b8', fontStyle: formData.tipoDocumento ? 'normal' : 'italic' }}>
                      {TIPOS_DOC.find(t => t.value === formData.tipoDocumento)?.label || formData.tipoDocumento || t('perfil.incomplete', 'Incompleto')}
                    </span>
                  </div>
                )}
              </div>

              {/* Número de documento */}
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                  <FaHashtag style={{ color: c.accentText || '#1e3a8a', fontSize: '12px', marginRight: '6px' }} />
                  {t('perfil.docNumber', 'Número de documento')}
                </label>
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
                      {getSiglaDoc(formData.tipoDocumento) && (
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
                      )}
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
                        placeholder={
                          ['CC', 'TI'].includes(formData.tipoDocumento || 'CC') ? "1020304050" : "AB123456"
                        }
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
                      {formData.cedula ? `${getSiglaDoc(formData.tipoDocumento)} - ${formData.cedula}` : t('perfil.incomplete', 'Incompleto')}
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Botones de guardar/cancelar en modo edición */}
          {modoEdicion && (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px', marginBottom: '24px' }}>
              <button onClick={handleCancelar} disabled={cargando} style={{ padding: '11px 24px', borderRadius: '10px', background: c.btnSecBg, border: `1.5px solid ${c.btnSecBorder}`, color: c.btnSecText, fontWeight: 600, fontSize: '14px', cursor: cargando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: cargando ? 0.5 : 1 }}>
                {t('perfil.cancel', 'Cancelar')}
              </button>
              <button onClick={handleGuardar} disabled={cargando} style={{ padding: '11px 28px', borderRadius: '10px', background: c.btnPrimary, color: '#fff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: cargando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: cargando ? 0.7 : 1 }}>
                {cargando ? (
                  <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> {t('perfil.saving', 'Guardando...')}</>
                ) : (
                  t('perfil.save', 'Guardar cambios')
                )}
              </button>
            </div>
          )}

          {/* 3. Fila inferior de 3 tarjetas: Seguridad y Contraseña + Cerrar Sesión + Eliminar Cuenta */}
          <div className="perfil-cards-grid" style={{ marginTop: '24px' }}>
            
            {/* Tarjeta 4: Seguridad y Contraseña */}
            <ChangePassword c={c} esModoOscuro={esModoOscuro} />

            {/* Tarjeta 5: Cerrar Sesión */}
            <div
              style={{
                background: c.innerCardBg,
                borderRadius: '14px',
                border: `1px solid ${c.innerCardBorder}`,
                boxShadow: c.innerCardShadow,
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                flex: 1,
                justifyContent: 'space-between',
              }}
            >
              <div style={{ paddingBottom: '12px', borderBottom: `1px solid ${esModoOscuro ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)'}` }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: esModoOscuro ? '#93c5fd' : '#1e3a8a', margin: 0, letterSpacing: '-0.01em' }}>
                  {t('catalogo.logout', 'Cerrar Sesión')}
                </h2>
              </div>

              <p style={{ fontSize: '13px', color: c.textMuted, margin: 0, lineHeight: '1.45' }}>
                {t('perfil.logoutHint', 'Finaliza tu sesión activa actual en este dispositivo de forma segura.')}
              </p>

              <button
                onClick={handleCerrarSesion}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: `1.5px solid ${esModoOscuro ? '#475569' : '#cbd5e1'}`,
                  color: c.title,
                  fontWeight: 600,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = esModoOscuro ? 'rgba(255,255,255,0.05)' : '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <FaSignOutAlt style={{ fontSize: '13px', color: c.textMuted }} /> {t('catalogo.logout', 'Cerrar sesión')}
              </button>
            </div>

            {/* Tarjeta 6: Eliminar Cuenta */}
            <div
              style={{
                background: c.innerCardBg,
                borderRadius: '14px',
                border: `1px solid ${c.innerCardBorder}`,
                boxShadow: c.innerCardShadow,
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                flex: 1,
                justifyContent: 'space-between',
              }}
            >
              <div style={{ paddingBottom: '12px', borderBottom: `1px solid ${esModoOscuro ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)'}` }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: esModoOscuro ? '#93c5fd' : '#1e3a8a', margin: 0, letterSpacing: '-0.01em' }}>
                  {t('perfil.deleteAccountTitle', 'Eliminar Cuenta')}
                </h2>
              </div>

              <p style={{ fontSize: '13px', color: c.textMuted, margin: 0, lineHeight: '1.45' }}>
                {t('perfil.deleteAccountHint', 'Elimina permanentemente tu cuenta y todos tus datos guardados.')}
              </p>

              <button
                onClick={() => setModalEliminarAbierto(true)}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '10px',
                  background: esModoOscuro ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2',
                  border: `1.5px solid ${esModoOscuro ? 'rgba(239, 68, 68, 0.3)' : '#fee2e2'}`,
                  color: '#dc2626',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = esModoOscuro ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'}
                onMouseLeave={e => e.currentTarget.style.background = esModoOscuro ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2'}
              >
                <FaTrashAlt style={{ fontSize: '13px' }} /> {t('perfil.deleteAccountBtn', 'Eliminar cuenta')}
              </button>
            </div>
          </div>

          {/* Modal Discord de Eliminar Cuenta */}
          <DeleteAccountModal
            isOpen={modalEliminarAbierto}
            onClose={() => setModalEliminarAbierto(false)}
            c={c}
          />

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
