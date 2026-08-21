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
import CompleteProfileModal from '../components/CompleteProfileModal'
import MenuConfiguracion from '@/components/MenuConfiguracion'
import { FaEdit, FaUser, FaEnvelope, FaPhone, FaArrowLeft, FaSignOutAlt, FaIdCard, FaGlobe, FaCalendarAlt, FaHashtag, FaTrashAlt } from 'react-icons/fa'
import { getNombreTipoDoc, getSiglaDoc, TIPOS_DOCUMENTO as TIPOS_DOC } from '@/utils/documentUtils'
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
        localStorage.removeItem('last_path')
        logout()
        navigate('/', { replace: true })
      }
    })
  }
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'

  const c = {
    pageBg: esModoOscuro ? '#0f172a' : '#eaeff8',
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

  const tieneNombre = (usuario?.nombre && usuario.nombre.trim()) || (usuario?.apellido && usuario.apellido.trim())

  return (
    <div className="catalogo-page" style={{ minHeight: '100vh', background: c.pageBg, color: c.textPrimary, zoom: 0.9 }}>
      
      <div className="detalle-contenido-inner perfil-container">
        
        {/* Top bar (Botón Volver al catálogo a la izquierda + Menú Configuración a la derecha) */}
        <div className="perfil-top-bar">
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
          
          {/* 1. Header de Perfil Usuario (Banner Azul Corporativo Drivique) */}
          <div
            className="perfil-banner-card"
            style={{
              background: esModoOscuro
                ? 'linear-gradient(135deg, #0f1a3d 0%, #1e3a8a 100%)'
                : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              borderRadius: '16px',
              padding: '24px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '24px',
              boxShadow: esModoOscuro ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(30, 58, 138, 0.25)',
            }}
          >
            {/* Formas Geométricas Decorativas de Fondo (Círculos Traslúcidos Elegantes) */}
            <div
              style={{
                position: 'absolute',
                right: '-60px',
                top: '-80px',
                width: '360px',
                height: '360px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.07)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: '90px',
                top: '-120px',
                width: '260px',
                height: '260px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                pointerEvents: 'none',
              }}
            />

            {/* Avatar en Círculo Blanco / Cristal */}
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 800,
                color: '#ffffff',
                flexShrink: 0,
                zIndex: 1,
              }}
            >
              {iniciales(usuario.nombre, usuario.apellido, usuario.correo)}
            </div>
            
            {/* Info de Nombre, Correo y Rol */}
            <div style={{ zIndex: 1 }}>
              {tieneNombre ? (
                <>
                  <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '0 0 3px', letterSpacing: '-0.01em' }}>
                    {`${usuario.nombre || ''} ${usuario.apellido || ''}`.trim()}
                  </h1>
                  <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', margin: '0 0 8px', fontWeight: 500 }}>
                    {usuario.correo}
                  </p>
                </>
              ) : (
                <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
                  {usuario.correo}
                </h1>
              )}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 12px',
                  borderRadius: '20px',
                  textTransform: 'capitalize',
                }}
              >
                <FaUser style={{ fontSize: '9px' }} />
                {t('perfil.roles.' + (usuario.rol || 'usuario').toLowerCase(), 'Usuario')}
              </span>
            </div>

            <div style={{ flex: 1 }} />

            {!modoEdicion && (
              <button
                onClick={habilitarEdicion}
                style={{
                  padding: '11px 24px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  color: '#1e3a8a',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 150ms ease',
                  zIndex: 1,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)'
                }}
              >
                <FaEdit style={{ fontSize: '13px', color: '#1e3a8a' }} />
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

              {/* Nombres Completo */}
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                  <FaUser style={{ color: c.accentText || '#1e3a8a', fontSize: '12px', marginRight: '6px' }} />
                  {t('perfil.firstName', 'Nombres completos')}
                </label>
                <div style={readonlyStyle}>
                  <span style={{ color: formData.nombre ? c.readonlyText : '#94a3b8', fontStyle: formData.nombre ? 'normal' : 'italic' }}>
                    {formData.nombre || t('perfil.incomplete', 'Incompleto')}
                  </span>
                </div>
              </div>

              {/* Apellidos Completo */}
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                  <FaUser style={{ color: c.accentText || '#1e3a8a', fontSize: '12px', marginRight: '6px' }} />
                  {t('perfil.lastName', 'Apellidos completos')}
                </label>
                <div style={readonlyStyle}>
                  <span style={{ color: formData.apellido ? c.readonlyText : '#94a3b8', fontStyle: formData.apellido ? 'normal' : 'italic' }}>
                    {formData.apellido || t('perfil.incomplete', 'Incompleto')}
                  </span>
                </div>
              </div>

              {/* Fecha de nacimiento */}
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                  <FaCalendarAlt style={{ color: c.accentText || '#1e3a8a', fontSize: '12px', marginRight: '6px' }} />
                  {t('perfil.birthDate', 'Fecha de nacimiento')}
                </label>
                <div style={readonlyStyle}>
                  <span style={{ color: formData.fechaNacimiento ? c.readonlyText : '#94a3b8', fontStyle: formData.fechaNacimiento ? 'normal' : 'italic' }}>
                    {formData.fechaNacimiento || t('perfil.incomplete', 'Incompleto')}
                  </span>
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Datos de Contacto */}
            <div style={{ background: c.innerCardBg, borderRadius: '14px', border: `1px solid ${c.innerCardBorder}`, boxShadow: c.innerCardShadow, padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ paddingBottom: '12px', borderBottom: `1px solid ${esModoOscuro ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)'}` }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: esModoOscuro ? '#93c5fd' : '#1e3a8a', margin: 0, letterSpacing: '-0.01em' }}>
                  {t('perfil.contactData', 'Datos de Contacto')}
                </h2>
              </div>

              {/* Correo electrónico */}
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                  <FaEnvelope style={{ color: c.accentText || '#1e3a8a', fontSize: '12px', marginRight: '6px' }} />
                  {t('perfil.email', 'Correo electrónico')}
                </label>
                <div style={{ ...readonlyStyle, padding: '0 14px' }}>
                  <span style={{ color: formData.correo ? c.readonlyText : '#94a3b8', fontStyle: formData.correo ? 'normal' : 'italic' }}>
                    {formData.correo || t('perfil.incomplete', 'Incompleto')}
                  </span>
                </div>
              </div>

              {/* Nacionalidad */}
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                  <FaGlobe style={{ color: c.accentText || '#1e3a8a', fontSize: '12px', marginRight: '6px' }} />
                  {t('perfil.nationality', 'Nacionalidad')}
                </label>
                <div style={{ ...readonlyStyle, padding: '0 14px' }}>
                  <span style={{ color: formData.nacionalidad ? c.readonlyText : '#94a3b8', fontStyle: formData.nacionalidad ? 'normal' : 'italic' }}>
                    {formData.nacionalidad ? t('perfil.countries.' + formData.nacionalidad, formData.nacionalidad) : t('perfil.incomplete', 'Incompleto')}
                  </span>
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                  <FaPhone style={{ color: c.accentText || '#1e3a8a', fontSize: '12px', marginRight: '6px' }} />
                  {t('perfil.phone', 'Teléfono')}
                </label>
                <div style={{ ...readonlyStyle, padding: '0 14px' }}>
                  <span style={{ color: formData.telefono ? c.readonlyText : '#94a3b8', fontStyle: formData.telefono ? 'normal' : 'italic' }}>
                    {formData.telefono ? `${getPrefijoPais(formData.nacionalidad)} ${formData.telefono}` : t('perfil.incomplete', 'Incompleto')}
                  </span>
                </div>
              </div>
            </div>

            {/* Tarjeta 3: Documento de Identidad */}
            <div style={{ background: c.innerCardBg, borderRadius: '14px', border: `1px solid ${c.innerCardBorder}`, boxShadow: c.innerCardShadow, padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ paddingBottom: '12px', borderBottom: `1px solid ${esModoOscuro ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)'}` }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: esModoOscuro ? '#93c5fd' : '#1e3a8a', margin: 0, letterSpacing: '-0.01em' }}>
                  {t('perfil.identityDoc', 'Documento de Identidad')}
                </h2>
              </div>

              {/* Tipo de documento */}
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                  <FaIdCard style={{ color: c.accentText || '#1e3a8a', fontSize: '12px', marginRight: '6px' }} />
                  {t('perfil.docType', 'Tipo de documento')}
                </label>
                <div style={readonlyStyle}>
                  <span style={{ color: formData.tipoDocumento ? c.readonlyText : '#94a3b8', fontStyle: formData.tipoDocumento ? 'normal' : 'italic' }}>
                    {formData.tipoDocumento ? getNombreTipoDoc(formData.tipoDocumento) : t('perfil.incomplete', 'Incompleto')}
                  </span>
                </div>
              </div>

              {/* Número de documento */}
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                  <FaHashtag style={{ color: c.accentText || '#1e3a8a', fontSize: '12px', marginRight: '6px' }} />
                  {t('perfil.docNumber', 'Número de documento')}
                </label>
                <div style={readonlyStyle}>
                  <span style={{ color: formData.cedula ? c.readonlyText : '#94a3b8', fontStyle: formData.cedula ? 'normal' : 'italic' }}>
                    {formData.cedula ? `${getNombreTipoDoc(formData.tipoDocumento)}: ${formData.cedula}` : t('perfil.incomplete', 'Incompleto')}
                  </span>
                </div>
              </div>
            </div>

          </div>

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
                  background: esModoOscuro ? 'rgba(239, 68, 68, 0.1)' : '#fff5f5',
                  border: `1.5px solid ${esModoOscuro ? 'rgba(239, 68, 68, 0.35)' : '#fecaca'}`,
                  color: esModoOscuro ? '#f87171' : '#dc2626',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = esModoOscuro ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'
                  e.currentTarget.style.borderColor = '#ef4444'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = esModoOscuro ? 'rgba(239, 68, 68, 0.1)' : '#fff5f5'
                  e.currentTarget.style.borderColor = esModoOscuro ? 'rgba(239, 68, 68, 0.35)' : '#fecaca'
                }}
              >
                <FaTrashAlt style={{ fontSize: '13px', color: esModoOscuro ? '#f87171' : '#dc2626' }} />
                {t('perfil.deleteAccountBtn', 'Eliminar cuenta')}
              </button>
            </div>
          </div>

          {/* Modal para Completar / Editar Perfil */}
          <CompleteProfileModal
            abierto={modoEdicion}
            onCerrar={handleCancelar}
            formData={formData}
            errores={errores}
            cargando={cargando}
            actualizarCampo={actualizarCampo}
            handleGuardar={handleGuardar}
            c={c}
            esModoOscuro={esModoOscuro}
            esPerfilIncompleto={esPerfilIncompleto}
          />

          {/* Modal de Eliminar Cuenta */}
          <DeleteAccountModal
            isOpen={modalEliminarAbierto}
            onClose={() => setModalEliminarAbierto(false)}
            c={c}
            esModoOscuro={esModoOscuro}
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
