import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanding } from '../../landing/LandingContext'
import { FaArrowLeft } from 'react-icons/fa'

export default function AuthHeaderControls({ backTo = '/login', backLabelKey = 'common.goBack', backLabelFallback = 'Volver' }) {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'

  const c = {
    btnBg: esModoOscuro ? '#0e172a' : '#ffffff',
    btnBorder: esModoOscuro ? '#1e293b' : '#dbe5f3',
    btnText: esModoOscuro ? '#60a5fa' : '#1e3a8a',
    btnShadow: esModoOscuro ? '0 4px 14px rgba(0,0,0,0.3)' : '0 2px 10px rgba(30,58,138,0.04)',
    btnHoverBg: esModoOscuro ? '#1e2a45' : '#f8fafc',
    btnHoverBorder: esModoOscuro ? '#3b82f6' : '#cbd5e1',
  }

  return (
    <div style={{ width: '100%', marginBottom: '16px', display: 'flex', justifyContent: 'flex-start' }}>
      <Link
        to={backTo}
        className="catalogo-header-back"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: 700,
          color: c.btnText,
          background: c.btnBg,
          padding: '8px 16px',
          borderRadius: '10px',
          border: `1px solid ${c.btnBorder}`,
          textDecoration: 'none',
          boxShadow: c.btnShadow,
          transition: 'all 180ms ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = c.btnHoverBg
          e.currentTarget.style.borderColor = c.btnHoverBorder
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = c.btnBg
          e.currentTarget.style.borderColor = c.btnBorder
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <FaArrowLeft size={12} color={c.btnText} />
        {t(backLabelKey, backLabelFallback)}
      </Link>
    </div>
  )
}
