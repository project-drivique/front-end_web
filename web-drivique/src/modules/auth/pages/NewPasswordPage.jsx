import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanding } from '../../landing/LandingContext'
import { useNewPassword } from '../hooks/useNewPassword'
import AlertModal from '../../catalog/components/AlertModal'
import { FaExclamationTriangle } from 'react-icons/fa'
import { showAlert } from '@/utils/swalConfig'

const IconoError = () => (
  <svg width="36" height="36" fill="none" stroke="#dc2626" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
)

function EyeIcon({ visible }) {
  return visible
    ? <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
    : <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
}

export default function NuevaContrasenaPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'
  const {
    contrasena, confirmar, mostrarPass, mostrarConf,
    cargando, error, tokenInvalido, exito,
    setContrasena, setConfirmar,
    setMostrarPass, setMostrarConf,
    esValida,
    handleSubmit,
  } = useNewPassword()
  
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (error) setShowModal(true)
  }, [error])

  useEffect(() => {
    if (exito) {
      showAlert({
        icon: 'success',
        title: t('nuevaContrasena.successTitle', '¡Contraseña actualizada!'),
        text: t('nuevaContrasena.successText', 'Tu contraseña fue cambiada correctamente.'),
        timer: 2000,
        showConfirmButton: false,
      })
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    }
  }, [exito, t, navigate])

  const c = {
    pageBg: esModoOscuro ? '#0b1220' : '#f8fafc',
    cardBg: esModoOscuro ? '#0e172a' : '#ffffff',
    cardBorder: esModoOscuro ? '#1e293b' : '#dbe5f3',
    cardShadow: esModoOscuro ? '0 24px 60px rgba(0,0,0,0.45)' : '0 10px 30px rgba(30,58,138,0.06)',
    textPrimary: esModoOscuro ? '#ffffff' : '#1e3a8a',
    textSecondary: esModoOscuro ? '#94a3b8' : '#64748b',
    labelColor: esModoOscuro ? '#ffffff' : '#1e3a8a',
    inputBg: esModoOscuro ? '#172136' : '#ffffff',
    inputBorder: esModoOscuro ? '#23314d' : '#dbe5f3',
    accentText: esModoOscuro ? '#60a5fa' : '#1e3a8a',
  }

  return (
    <div style={{
      minHeight: '111.12vh',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: c.pageBg,
      color: c.textPrimary,
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      zoom: 0.9,
      position: 'relative',
      overflowX: 'hidden'
    }}>
      
      <div style={{ width: '100%', maxWidth: '500px', zIndex: 1, position: 'relative' }}>
        
        <div style={{
          background: c.cardBg,
          borderRadius: '24px',
          border: `1px solid ${c.cardBorder}`,
          boxShadow: c.cardShadow,
          padding: '42px 36px',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'left'
        }}>

          {/* Token inválido o expirado */}
          {tokenInvalido && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: esModoOscuro ? 'rgba(239,68,68,0.2)' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid #fecaca' }}>
                <IconoError />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: c.textPrimary, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                {t('nuevaContrasena.invalidToken', 'Enlace expirado o inválido')}
              </h2>
              <p style={{ color: c.textSecondary, fontSize: '14px', margin: '0 0 28px', lineHeight: 1.6 }}>
                {t('nuevaContrasena.invalidTokenText', 'El enlace de recuperación ya no es válido. Por favor solicita uno nuevo.')}
              </p>
              <Link
                to="/recuperar"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '15px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '14.5px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  boxShadow: '0 6px 18px rgba(37,99,235,0.25)',
                  boxSizing: 'border-box'
                }}
              >
                {t('nuevaContrasena.requestNew', 'Solicitar nuevo enlace')}
              </Link>
            </div>
          )}

          {/* Formulario de Nueva Contraseña */}
          {!tokenInvalido && (
            <div>
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <h1 style={{
                  fontFamily: 'Outfit, Inter, system-ui, sans-serif',
                  fontSize: '1.55rem',
                  fontWeight: 900,
                  color: c.textPrimary,
                  margin: '0 0 6px',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.25
                }}>
                  {t('nuevaContrasena.formTitle', 'Crear nueva contraseña')}
                </h1>
                <p style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  color: esModoOscuro ? '#94a3b8' : '#64748b',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  {t('nuevaContrasena.formSubtitle', 'Tu nueva contraseña debe ser diferente a las anteriores.')}
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '22px', textAlign: 'left' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Outfit, Inter, system-ui, sans-serif', fontSize: '13px', fontWeight: 800, color: c.labelColor, marginBottom: '8px' }}>
                    {t('nuevaContrasena.password', 'Nueva contraseña')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={mostrarPass ? 'text' : 'password'}
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      disabled={cargando}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      style={{
                        width: '100%',
                        padding: '14px 48px 14px 18px',
                        borderRadius: '12px',
                        border: `1.5px solid ${c.inputBorder}`,
                        background: c.inputBg,
                        fontSize: '14.5px',
                        color: c.textPrimary,
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'all 180ms ease'
                      }}
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
                        color: c.textSecondary,
                        padding: 0,
                        display: 'flex'
                      }}
                    >
                      <EyeIcon visible={mostrarPass} />
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: c.labelColor, marginBottom: '8px' }}>
                    {t('nuevaContrasena.confirmPassword', 'Confirmar contraseña')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={mostrarConf ? 'text' : 'password'}
                      value={confirmar}
                      onChange={(e) => setConfirmar(e.target.value)}
                      disabled={cargando}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      style={{
                        width: '100%',
                        padding: '14px 48px 14px 18px',
                        borderRadius: '12px',
                        border: `1.5px solid ${c.inputBorder}`,
                        background: c.inputBg,
                        fontSize: '14.5px',
                        color: c.textPrimary,
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'all 180ms ease'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConf(!mostrarConf)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: c.textSecondary,
                        padding: 0,
                        display: 'flex'
                      }}
                    >
                      <EyeIcon visible={mostrarConf} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargando || !esValida}
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                    color: '#ffffff',
                    fontSize: '14.5px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: (cargando || !esValida) ? 'not-allowed' : 'pointer',
                    transition: 'all 180ms ease',
                    opacity: (cargando || !esValida) ? 0.6 : 1,
                    marginTop: '4px',
                    boxShadow: '0 6px 18px rgba(37,99,235,0.25)'
                  }}
                >
                  {cargando ? t('nuevaContrasena.resetting', 'Restableciendo...') : t('nuevaContrasena.submit', 'Restablecer contraseña')}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {showModal && (
        <AlertModal
          icon={<FaExclamationTriangle size={22} color={esModoOscuro ? '#93c5fd' : '#1e3a8a'} />}
          titulo={t('common.error', 'Error')}
          mensaje={error}
          primaryText={t('common.accept', 'Aceptar')}
          onPrimary={() => setShowModal(false)}
          onCerrar={() => setShowModal(false)}
          showCloseButton
        />
      )}
    </div>
  )
}
