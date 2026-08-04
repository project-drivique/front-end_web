import { FaRegHeart } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Modal centrado para bloquear "Favoritos" a invitados.
// Se monta UNA sola vez a nivel de página (no dentro de cada tarjeta).
export default function GuestFavoriteModal({ c, visible, onCerrar }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (!visible) return null

  return (
    <div
      onClick={onCerrar}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
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
          width: '100%',
          maxWidth: '340px',
          background: c.heroCardBg,
          borderRadius: '20px',
          border: '1px solid ' + c.heroCardBorder,
          boxShadow: '0 20px 50px rgba(0,0,0,0.30)',
          padding: '28px 24px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: c.accentBgSoft,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <FaRegHeart size={22} color={c.accentText} />
        </div>

        <p style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: c.textPrimary }}>
          {t('catalogo.guestFavoriteModal.titulo')}
        </p>
        <p style={{ margin: '8px 0 22px', fontSize: '13.5px', color: c.textSecondary, lineHeight: '20px' }}>
          {t('catalogo.guestFavoriteModal.mensaje')}
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onCerrar}
            style={{
              flex: 1,
              height: '46px',
              borderRadius: '12px',
              background: 'transparent',
              border: `1.5px solid ${c.accentText}`,
              color: c.accentText,
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => { onCerrar(); navigate('/login') }}
            style={{
              flex: 1,
              height: '46px',
              borderRadius: '12px',
              background: c.accentGradient,
              color: '#fff',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(30,58,138,0.25)',
            }}
          >
            {t('catalogo.guestFavoriteModal.iniciarSesion')}
          </button>
        </div>
      </div>
    </div>
  )
}