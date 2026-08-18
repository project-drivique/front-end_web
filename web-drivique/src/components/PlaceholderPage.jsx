import { Link } from 'react-router-dom'
import { FaArrowLeft, FaTools } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

export default function PlaceholderPage() {
  const { t } = useTranslation()
  return (
    <div className="placeholder-wrapper" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      fontFamily: 'Inter, sans-serif',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div className="placeholder-card" style={{
        background: 'white',
        padding: '48px',
        borderRadius: '24px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#eff6ff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: '#3b82f6'
        }}>
          <FaTools size={32} />
        </div>
        
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: '#0f172a',
          margin: '0 0 16px'
        }}>
          {t('placeholder.title', 'Aún falta implementar esta pantalla')}
        </h1>
        
        <p style={{
          color: '#64748b',
          fontSize: '15px',
          lineHeight: '1.6',
          margin: '0 0 32px'
        }}>
          {t('placeholder.subtitle', 'Estamos trabajando para tener lista esta sección lo antes posible.')}
        </p>

        <Link
          to="/home"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#2563eb',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '14px',
            transition: 'background 200ms'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
        >
          <FaArrowLeft size={14} />
          {t('placeholder.backBtn', 'Volver al Catálogo')}
        </Link>
      </div>
    </div>
  )
}
