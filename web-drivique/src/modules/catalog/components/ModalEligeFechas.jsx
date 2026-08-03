import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { FaRegCalendarAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

export default function ModalEligeFechas({ abierto, onCerrar, c }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (!abierto) return null

  return createPortal(
    <div
      onClick={onCerrar}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(15,23,42,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.panelBg,
          width: '100%',
          maxWidth: '380px',
          borderRadius: '20px',
          padding: '32px 28px 28px',
          textAlign: 'center',
          boxShadow: '0 16px 48px rgba(0,0,0,0.28)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: c.accentBgSoft,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
          }}
        >
          <FaRegCalendarAlt size={26} color={c.accentText} />
        </div>

        <h2 style={{ fontSize: '19px', fontWeight: 800, color: c.textPrimary, margin: '0 0 10px' }}>
          {t('catalogo.chooseDatesTitle')}
        </h2>

        <p style={{ fontSize: '14px', color: c.textSecondary, lineHeight: 1.5, margin: '0 0 26px' }}>
          {t('catalogo.chooseDatesSubtitle')}
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onCerrar}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: '2px solid ' + c.loginBorder,
              background: 'transparent',
              color: c.loginText,
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: c.accentGradient,
              color: '#fff',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(30,58,138,0.25)',
            }}
          >
            {t('catalogo.signIn')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}