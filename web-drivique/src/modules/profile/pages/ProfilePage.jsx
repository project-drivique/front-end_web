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
    padding: '12px 16px',
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
    padding: '0 14px',
    height: '38px',
    borderRadius: '10px',
    border: 'none',
    background: c.readonlyBg,
    fontSize: '13px',
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

        {/* Banner Alerta de Perfil Incompleto */}
        {esPerfilIncompleto && !modoEdicion && (
          <div
            style={{
              marginBottom: '20px',
              padding: '16px 20px',
              borderRadius: '14px',
              background: esModoOscuro ? 'rgba(234, 179, 8, 0.14)' : '#fffbe8',
              border: `1.5px solid ${esModoOscuro ? 'rgba(234, 179, 8, 0.4)' : '#fef08a'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              boxShadow: esModoOscuro ? '0 4px 16px rgba(0,0,0,0.25)' : '0 2px 10px rgba(234,179,8,0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: esModoOscuro ? 'rgba(234, 179, 8, 0.2)' : '#fef08a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FaExclamationTriangle size={18} color={esModoOscuro ? '#facc15' : '#ca8a04'} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 800, color: esModoOscuro ? '#fef08a' : '#854d0e' }}>
                  {t('perfil.incompleteBannerTitle', 'Información de perfil opcional')}
                </h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: esModoOscuro ? '#fef9c3' : '#a16207' }}>
                  {t('perfil.incompleteBannerText', 'Puedes completar tus datos aquí, o si lo prefieres, se guardarán y completarán automáticamente al realizar tu primera reserva.')}
                </p>
              </div>
            </div>
            <button
              onClick={habilitarEdicion}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                background: 'linear-gradient(90deg, #ca8a04, #eab308)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '12.5px',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(202,138,4,0.25)',
              }}
            >
              {t('perfil.completeProfileBtn', 'Completar perfil ahora')}
            </button>
          </div>
        )}

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
                  padding: '7px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  color: '#fff',
                  fontWeight: 500,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background 150ms',
                  marginLeft: 'auto',
                  zIndex: 1,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              >
                <FaEdit style={{ fontSize: '12px' }} /> {t('perfil.edit', 'Editar')}
              </button>
            )}
          </div>

          {/* 2. Fila con dos tarjetas: Información Personal + Datos de Contacto */}
          <div className="perfil-cards-grid">
            
            {/* Tarjeta Izquierda: Información Personal */}
            <div style={{ background: c.innerCardBg, borderRadius: '14px', border: `1px solid ${c.innerCardBorder}`, boxShadow: c.innerCardShadow, padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: c.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaUser style={{ color: c.badgeText, fontSize: '13px' }} />
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: c.title, margin: 0 }}>
                  {t('perfil.personalInfo', 'Información Personal')}
                </h2>
              </div>

              <div className="perfil-info-grid">
                {/* Nombre Completo */}
                <div>
                  <label style={labelStyle}>{t('perfil.firstName', 'Nombres completos')}</label>
                  {modoEdicion ? (
                    <>
                      <input type="text" value={formData.nombre} onChange={e => actualizarCampo('nombre', e.target.value)} placeholder="Tus nombres completos" style={inputStyle(!!errores.nombre)} onFocus={e => e.target.style.borderColor = c.inputBorderFocus} onBlur={e => e.target.style.borderColor = errores.nombre ? c.inputErrorBorder : c.inputBorder} />
                      {errores.nombre && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.nombre}</p>}
                    </>
                  ) : ( <input type="text" value={formData.nombre || ''} readOnly style={readonlyStyle} /> )}
                </div>

                {/* Apellidos Completo */}
                <div>
                  <label style={labelStyle}>{t('perfil.lastName', 'Apellidos completos')}</label>
                  {modoEdicion ? (
                    <>
                      <input type="text" value={formData.apellido} onChange={e => actualizarCampo('apellido', e.target.value)} placeholder="Tus apellidos completos" style={inputStyle(!!errores.apellido)} onFocus={e => e.target.style.borderColor = c.inputBorderFocus} onBlur={e => e.target.style.borderColor = errores.apellido ? c.inputErrorBorder : c.inputBorder} />
                      {errores.apellido && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.apellido}</p>}
                    </>
                  ) : ( <input type="text" value={formData.apellido || ''} readOnly style={readonlyStyle} /> )}
                </div>

                {/* Tipo de documento */}
                <div>
                  <label style={labelStyle}>{t('perfil.docType', 'Tipo de documento')}</label>
                  {modoEdicion ? (
                    <>
                      <select
                        value={formData.tipoDocumento}
                        onChange={e => actualizarCampo('tipoDocumento', e.target.value)}
                        style={{ ...inputStyle(!!errores.tipoDocumento), cursor: 'pointer' }}
                      >
                        <option value="">{t('perfil.selectDocType', 'Seleccionar tipo')}</option>
                        <option value="CC">Cédula de Ciudadanía (CC)</option>
                        <option value="CE">Cédula de Extranjería (CE)</option>
                        <option value="Pasaporte">Pasaporte</option>
                        <option value="CNH">Carteira de Habilitação (CNH)</option>
                      </select>
                      {errores.tipoDocumento && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.tipoDocumento}</p>}
                    </>
                  ) : (
                    <input type="text" value={formData.tipoDocumento || ''} readOnly style={readonlyStyle} />
                  )}
                </div>

                {/* Número de documento */}
                <div>
                  <label style={labelStyle}>{t('perfil.docNumber', 'Número de documento')}</label>
                  {modoEdicion ? (
                    <>
                      <input type="text" value={formData.cedula} onChange={e => actualizarCampo('cedula', e.target.value)} placeholder="Número de documento" style={inputStyle(!!errores.cedula)} onFocus={e => e.target.style.borderColor = c.inputBorderFocus} onBlur={e => e.target.style.borderColor = errores.cedula ? c.inputErrorBorder : c.inputBorder} />
                      {errores.cedula && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.cedula}</p>}
                    </>
                  ) : (
                    <input type="text" value={formData.cedula || ''} readOnly style={readonlyStyle} />
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
                        style={{ ...inputStyle(!!errores.nacionalidad), cursor: 'pointer' }}
                      >
                        <option value="">{t('perfil.selectNationality', 'Seleccionar país')}</option>
                        {paisesMock.map(p => (
                          <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
                        ))}
                      </select>
                      {errores.nacionalidad && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.nacionalidad}</p>}
                    </>
                  ) : (
                    <input type="text" value={formData.nacionalidad || ''} readOnly style={readonlyStyle} />
                  )}
                </div>

                {/* Fecha de nacimiento */}
                <div>
                  <label style={labelStyle}>{t('perfil.birthDate', 'Fecha de nacimiento')}</label>
                  {modoEdicion ? (
                    <>
                      <input type="date" value={formData.fechaNacimiento || ''} onChange={e => actualizarCampo('fechaNacimiento', e.target.value)} style={{ ...inputStyle(!!errores.fechaNacimiento), colorScheme: esModoOscuro ? 'dark' : 'light' }} onFocus={e => e.target.style.borderColor = c.inputBorderFocus} onBlur={e => e.target.style.borderColor = errores.fechaNacimiento ? c.inputErrorBorder : c.inputBorder} />
                      {errores.fechaNacimiento && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.fechaNacimiento}</p>}
                    </>
                  ) : (
                    <input type="text" value={formData.fechaNacimiento || ''} readOnly style={readonlyStyle} />
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
                      <input type="email" value={formData.correo || ''} readOnly style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px', fontWeight: '500', color: c.readonlyText, cursor: 'default' }} />
                    </div>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label style={labelStyle}>{t('perfil.phone', 'Teléfono')}</label>
                  {modoEdicion ? (
                    <>
                      <input type="tel" value={formData.telefono} onChange={e => actualizarCampo('telefono', e.target.value)} placeholder="+57 300 1234567" style={inputStyle(!!errores.telefono)} onFocus={e => e.target.style.borderColor = c.inputBorderFocus} onBlur={e => e.target.style.borderColor = errores.telefono ? c.inputErrorBorder : c.inputBorder} />
                      {errores.telefono && <p style={{ color: c.errorText, fontSize: '11.5px', margin: '4px 0 0' }}>{errores.telefono}</p>}
                    </>
                  ) : (
                    <div style={{ ...readonlyStyle, padding: '0 14px' }}>
                      <FaPhone style={{ color: esModoOscuro ? '#94a3b8' : '#1e3a8a', fontSize: '13px', marginRight: '10px', flexShrink: 0 }} />
                      <input type="tel" value={formData.telefono || ''} readOnly style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px', fontWeight: '500', color: c.readonlyText, cursor: 'default' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

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

          {/* Botones de guardar/cancelar en modo edición */}
          {modoEdicion && (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={handleCancelar} disabled={cargando} style={{ padding: '11px 24px', borderRadius: '10px', background: c.btnSecBg, border: `1.5px solid ${c.btnSecBorder}`, color: c.btnSecText, fontWeight: 600, fontSize: '14px', cursor: cargando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: cargando ? 0.5 : 1 }}>
                <FaTimes /> {t('perfil.cancel')}
              </button>
              <button onClick={handleGuardar} disabled={cargando} style={{ padding: '11px 28px', borderRadius: '10px', background: c.btnPrimary, color: '#fff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: cargando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: cargando ? 0.7 : 1 }}>
                {cargando ? ( <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> {t('perfil.saving')}</> ) : ( <><FaCheck /> {t('perfil.save')}</> )}
              </button>
            </div>
          )}

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
