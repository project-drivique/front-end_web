import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FaRegCalendarAlt } from 'react-icons/fa'
import { COLOR_MARCA } from '../constants'

export default function ChooseDatesModal({ visible, onCerrar }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (!visible) return null

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
          background: '#FFFFFF',
          width: '100%',
          maxWidth: '400px',
          borderRadius: '20px',
          padding: '32px 28px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 16px 50px rgba(0,0,0,0.25)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px',
          }}
        >
          <FaRegCalendarAlt size={28} color={COLOR_MARCA} />
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', textAlign: 'center', margin: 0 }}>
          {t('catalogo.chooseDatesModal.titulo')}
        </h2>

        <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', lineHeight: '20px', margin: '0 0 14px' }}>
          {t('catalogo.chooseDatesModal.mensaje')}
        </p>

        <div style={{ width: '100%', display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onCerrar}
            style={{
              flex: 1,
              borderRadius: '12px',
              padding: '13px',
              border: `2px solid ${COLOR_MARCA}`,
              cursor: 'pointer',
              background: '#FFFFFF',
              color: COLOR_MARCA,
              fontSize: '15px',
              fontWeight: 700,
            }}
          >
            {t('catalogo.chooseDatesModal.cancelar')}
          </button>

          <button
            type="button"
            onClick={() => { onCerrar(); navigate('/login') }}
            style={{
              flex: 1,
              borderRadius: '12px',
              padding: '13px',
              border: 'none',
              cursor: 'pointer',
              background: COLOR_MARCA,
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 700,
            }}
          >
            {t('catalogo.chooseDatesModal.iniciarSesion')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}