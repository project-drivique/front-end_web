import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanding } from '../../landing/LandingContext'
import { useRecover } from '../hooks/useRecover'
import AuthHeaderControls from '../components/AuthHeaderControls'
import AlertModal from '@/modules/catalog/components/AlertModal'
import { FaExclamationTriangle } from 'react-icons/fa'

export default function RecuperarContrasenaPage() {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'
  const { correo, setCorreo, cargando, error, handleSubmit } = useRecover()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (error) {
      setShowModal(true)
    }
  }, [error])

  const isNotRegistered = error && error.toLowerCase().includes('registrado')

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
      background: c.pageBg,
      color: c.textPrimary,
      padding: '40px 20px',
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      zoom: 0.9,
      position: 'relative',
      overflowX: 'hidden'
    }}>
      
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '460px',
        zIndex: 1,
        position: 'relative'
      }}>

        {/* Back Button positioned directly above the form card */}
        <AuthHeaderControls
          backTo="/login"
          backLabelKey="common.goBack"
          backLabelFallback="Volver"
        />

        {/* Main Card */}
        <div style={{
          width: '100%',
          background: c.cardBg,
          borderRadius: '24px',
          border: `1px solid ${c.cardBorder}`,
          boxShadow: c.cardShadow,
          padding: '42px 36px',
          textAlign: 'left',
          boxSizing: 'border-box',
          transition: 'all 200ms ease'
        }}>
          
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
              {t('recuperar.title', 'Recuperar contraseña')}
            </h1>
            <p style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              color: esModoOscuro ? '#94a3b8' : '#64748b',
              fontSize: '13.5px',
              fontWeight: 500,
              margin: 0,
              lineHeight: 1.5
            }}>
              {t('recuperar.subtitle', 'Ingresa tu correo electrónico registrado para enviarte las instrucciones de recuperación.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Outfit, Inter, system-ui, sans-serif', fontSize: '13px', fontWeight: 800, color: c.labelColor, marginBottom: '8px' }}>
                {t('recuperar.email', 'Correo electrónico')}
              </label>
              <input
                type="email"
                required
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                placeholder={t('recuperar.emailPlaceholder', 'ejemplo@correo.com')}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: error ? '1.5px solid #ef4444' : `1.5px solid ${c.inputBorder}`,
                  background: c.inputBg,
                  fontSize: '14.5px',
                  color: c.textPrimary,
                  outline: 'none',
                  transition: 'all 180ms ease',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: '#ffffff',
                fontSize: '14.5px',
                fontWeight: 800,
                border: 'none',
                cursor: cargando ? 'not-allowed' : 'pointer',
                transition: 'all 180ms ease',
                marginTop: '4px',
                opacity: cargando ? 0.8 : 1,
                boxShadow: '0 6px 18px rgba(37,99,235,0.25)'
              }}
              onMouseEnter={e => { if (!cargando) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { if (!cargando) e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {cargando ? t('recuperar.sending', 'Enviando...') : t('recuperar.submit', 'Enviar instrucciones')}
            </button>
          </form>
          
          <div style={{ marginTop: '28px', fontSize: '13.5px', color: c.textSecondary, textAlign: 'center' }}>
            {t('recuperar.noAccount', '¿No tienes una cuenta?')}{' '}
            <Link to="/registro" style={{ color: c.accentText, fontWeight: 800, textDecoration: 'none' }}>
              {t('recuperar.registerHere', 'Regístrate aquí')}
            </Link>
          </div>
        </div>
      </div>

      {showModal && (
        <AlertModal
          icon={<FaExclamationTriangle size={22} color={esModoOscuro ? '#93c5fd' : '#1e3a8a'} />}
          titulo={isNotRegistered ? t('recuperar.notRegisteredTitle', 'Correo no registrado') : t('common.error', 'Error')}
          mensaje={isNotRegistered ? t('recuperar.notRegisteredSub', 'No encontramos ninguna cuenta asociada a este correo.') : error}
          primaryText={t('common.accept', 'Aceptar')}
          onPrimary={() => setShowModal(false)}
          onCerrar={() => setShowModal(false)}
          showCloseButton
        />
      )}
    </div>
  )
}