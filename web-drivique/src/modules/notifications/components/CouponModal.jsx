import { useState } from 'react'
import { FaCheckCircle, FaCopy, FaTicketAlt } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

export default function CouponModal({ cupon, onClose, onAplicar }) {
  const { t } = useTranslation()
  const [copiado, setCopiado] = useState(false)

  if (!cupon) return null

  const handleCopiar = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cupon.codigo)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    }
  }

  const handleConfirmar = () => {
    if (onAplicar) onAplicar(cupon.codigo)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(420px, 100%)',
          background: 'var(--bg-tarjeta, #ffffff)',
          borderRadius: 24,
          padding: '32px 24px 28px',
          textAlign: 'center',
          boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
          border: '1px solid var(--borde, #e2e8f0)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icono animado de éxito */}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'var(--bg-item, #eff6ff)',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 28,
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.18)',
          }}
        >
          <FaTicketAlt />
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--texto-primary, #0f172a)', margin: '0 0 8px' }}>
          {t('promotions.modal.successTitle')}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--texto-second, #64748b)', margin: '0 0 20px', lineHeight: 1.5 }}>
          {t('promotions.modal.successText')}
        </p>

        {/* Caja del código */}
        <div
          style={{
            background: 'var(--bg-item, #f8fafc)',
            border: '2px dashed #60a5fa',
            borderRadius: 16,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '0.1em', color: 'var(--texto-primary, #1e3a8a)' }}>
            {cupon.codigo}
          </span>
          <button
            onClick={handleCopiar}
            style={{
              background: copiado ? '#10b981' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background 0.2s',
            }}
          >
            {copiado ? <FaCheckCircle /> : <FaCopy />}
            {copiado ? t('promotions.modal.copied') : t('promotions.modal.copy')}
          </button>
        </div>

        <p style={{ fontSize: 12, color: 'var(--texto-second, #64748b)', margin: '0 0 24px' }}>
          {t('promotions.modal.usageHint')}
        </p>

        <button
          onClick={handleConfirmar}
          style={{
            width: '100%',
            padding: '13px 20px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#ffffff',
            border: 'none',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
          }}
        >
          {t('promotions.modal.confirm')}
        </button>
      </div>
    </div>
  )
}
