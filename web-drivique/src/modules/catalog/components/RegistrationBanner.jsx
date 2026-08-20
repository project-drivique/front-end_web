import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { FaLock } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { COLOR_MARCA } from '../constants'

export default function BannerRegistro({ visible, onCerrar, mensaje }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (!visible) return null
  const mensajeFinal = mensaje ?? t('catalogo.bannerRegistro.mensaje')

  return createPortal(
    <div
      onClick={onCerrar}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          width: '100%',
          maxWidth: '480px',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.30)',
        }}
      >
        <span style={{ fontSize: '32px', marginBottom: '8px' }}><FaLock /></span>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', textAlign: 'center', margin: 0 }}>
          {t('catalogo.bannerRegistro.titulo')}
        </h2>

        <p style={{ fontSize: '14px', color: '#666', textAlign: 'center', lineHeight: '20px', margin: '0 0 8px' }}>
          {mensajeFinal}
        </p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            onClick={() => { onCerrar(); navigate('/registro') }}
            style={{
              borderRadius: '12px',
              padding: '14px',
              border: 'none',
              cursor: 'pointer',
              background: `linear-gradient(90deg,${COLOR_MARCA},#2563eb)`,
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            {t('catalogo.bannerRegistro.registrarme')}
          </button>

          <button
            type="button"
            onClick={() => { onCerrar(); navigate('/login') }}
            style={{
              borderRadius: '12px',
              padding: '14px',
              border: 'none',
              cursor: 'pointer',
              background: '#F1F5F9',
              color: '#2563EB',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            {t('catalogo.bannerRegistro.iniciarSesion')}
          </button>
        </div>

        <button
          type="button"
          onClick={onCerrar}
          style={{
            marginTop: '4px',
            padding: '8px 0',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#999',
            fontSize: '14px',
          }}
        >
          {t('catalogo.bannerRegistro.continuarInvitado')}
        </button>
      </div>
    </div>,
    document.body
  )
}