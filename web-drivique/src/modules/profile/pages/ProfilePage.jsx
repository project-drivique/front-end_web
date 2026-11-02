import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanding } from '@/modules/landing/LandingContext'
import { usePerfil } from '../hooks/useProfile'
import { useAuthStore } from '@/store/authStore'
import { showAlert } from '@/utils/swalConfig'
import PasswordVerificationModal from '../components/PasswordVerificationModal'

import DeleteAccountModal from '../components/DeleteAccountModal'
import CompleteProfileModal from '../components/CompleteProfileModal'

import MenuConfiguracion from '@/components/MenuConfiguracion'
import { FaArrowLeft } from 'react-icons/fa'


import '@/modules/catalog/pages/CatalogPage.css'
import '@/modules/catalog/pages/VehicleDetailsPage.css'
import './ProfilePage.css'
import ModalPreferenciasAbierto from './ProfilePage/ModalPreferenciasAbierto'
import PerfilCardsGrid2 from './ProfilePage/PerfilCardsGrid2'
import PerfilCardsGrid from './ProfilePage/PerfilCardsGrid'
import PerfilBannerCard from './ProfilePage/PerfilBannerCard'





export default function PerfilPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { usuario, logout } = useAuthStore()
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false)
  const [modalPreferenciasAbierto, setModalPreferenciasAbierto] = useState(false)

  const handleCerrarSesion = () => {
    showAlert({
      icon: 'warning',
      title: t('catalogo.logout', 'Cerrar sesión'),
      text: t('perfil.logoutConfirm', '¿Estás seguro de que deseas cerrar sesión?'),
      showCancelButton: true,
      confirmButtonText: t('perfil.accept', 'Aceptar'),
      cancelButtonText: t('perfil.cancel', 'Cancelar'),
      confirmButtonColor: 'var(--brand-primary)',
      cancelButtonColor: '#64748b',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('last_path')
        logout()
        window.location.replace('/')
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
    accentText: 'var(--brand-text)',
    titleColor: 'var(--brand-text)',
    accentBgSoft: 'var(--brand-soft)',
    accentGradient: 'var(--brand-gradient)',
    navBg: esModoOscuro ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.98)',
    navBorder: esModoOscuro ? '#1e293b' : '#e8eef8',
    navShadow: esModoOscuro ? '0 2px 12px rgba(0,0,0,0.25)' : '0 2px 14px rgba(var(--brand-secondary-rgb),0.06)',
    title: esModoOscuro ? '#f8fafc' : '#111a3a',
    text: esModoOscuro ? '#e2e8f0' : '#1e293b',
    textMuted: esModoOscuro ? '#94a3b8' : '#64748b',
    labelText: esModoOscuro ? '#94a3b8' : '#64748b',
    inputBg: esModoOscuro ? '#0f172a' : '#f8fafc',
    inputBorder: esModoOscuro ? '#334155' : '#e2e8f0',
    inputBorderFocus: 'var(--brand-primary)',
    inputErrorBg: esModoOscuro ? 'rgba(127,29,29,0.18)' : '#fef2f2',
    inputErrorBorder: '#f87171',
    inputText: esModoOscuro ? '#e2e8f0' : '#1e293b',
    inputPlaceholder: esModoOscuro ? '#64748b' : '#94a3b8',
    errorText: esModoOscuro ? '#fca5a5' : '#ef4444',
    readonlyBg: esModoOscuro ? '#0f172a' : '#f8fafc',
    readonlyText: esModoOscuro ? '#e2e8f0' : '#1e293b',
    innerCardBg: esModoOscuro ? '#111827' : '#ffffff',
    innerCardBorder: esModoOscuro ? '#334155' : '#e2e8f0',
    innerCardShadow: esModoOscuro ? '0 4px 20px rgba(0,0,0,0.30)' : '0 2px 10px rgba(var(--brand-secondary-rgb),0.04)',
    badgeBg: 'var(--brand-soft)',
    badgeText: 'var(--brand-text)',
    btnPrimary: 'var(--brand-gradient)',
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
        <div className="vehiculo-main-container perfil-master-wrapper" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, boxShadow: esModoOscuro ? '0 4px 24px rgba(0,0,0,0.40)' : '0 4px 24px rgba(var(--brand-secondary-rgb),0.07)', borderRadius: '20px', padding: '24px' }}>
          
          {/* 1. Header de Perfil Usuario (Banner Azul Corporativo Drivique) */}
          <PerfilBannerCard esModoOscuro={esModoOscuro} esPerfilIncompleto={esPerfilIncompleto} habilitarEdicion={habilitarEdicion} modoEdicion={modoEdicion} t={t} tieneNombre={tieneNombre} usuario={usuario} />

          {/* 2. Fila con tres tarjetas: Datos Personales + Datos de Contacto + Documento de Identidad */}
          <PerfilCardsGrid c={c} esModoOscuro={esModoOscuro} formData={formData} labelStyle={labelStyle} readonlyStyle={readonlyStyle} t={t} />

          {/* 3. Fila inferior de tarjetas: Seguridad y Contraseña + Preferencias de Entrega + Cerrar Sesión + Eliminar Cuenta */}
          <PerfilCardsGrid2 c={c} esModoOscuro={esModoOscuro} handleCerrarSesion={handleCerrarSesion} setModalEliminarAbierto={setModalEliminarAbierto} setModalPreferenciasAbierto={setModalPreferenciasAbierto} t={t} />

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

          {/* Modal de Preferencias de Entrega (HU-INT-17) */}
          {modalPreferenciasAbierto && (
            <ModalPreferenciasAbierto setModalPreferenciasAbierto={setModalPreferenciasAbierto} />
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
