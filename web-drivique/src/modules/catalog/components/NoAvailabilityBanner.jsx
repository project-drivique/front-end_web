import { useTranslation } from 'react-i18next'
import { FaCar, FaTimes } from 'react-icons/fa'

export default function NoAvailabilityBanner({ c, onCerrar }) {
  const { t } = useTranslation()

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: c.accentBgSoft,
        border: `1.5px solid ${c.accentBorder}`,
        borderRadius: '18px',
        padding: '18px 44px 18px 20px',
        marginBottom: '20px',
        boxShadow: '0 4px 16px rgba(30,58,138,0.06)',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: c.heroCardBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 6px rgba(30,58,138,0.10)',
        }}
      >
        <FaCar size={18} color={c.accentText} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: c.textPrimary }}>
          {t('catalogo.noAvailabilityFiltersTitle')}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: c.textSecondary, lineHeight: '19px' }}>
          {t('catalogo.noAvailabilityFiltersMsg')}
        </p>
      </div>

      <button
        type="button"
        onClick={onCerrar}
        aria-label={t('common.close')}
        style={{
          position: 'absolute',
          top: '14px',
          right: '14px',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: c.textSecondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FaTimes size={13} />
      </button>
    </div>
  )
}