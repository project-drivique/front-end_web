import { FaTimes, FaInfoCircle, FaCalendarAlt, FaCar, FaTag } from 'react-icons/fa'
import { formatCurrency } from '@/utils/currencyUtils'
import { useLanding } from '@/modules/landing/LandingContext'
import { useTranslation } from 'react-i18next'

export default function ConditionsModal({ cupon, onClose }) {
  const { t } = useTranslation()
  const { moneda } = useLanding()

  if (!cupon) return null

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
          width: 'min(480px, 100%)',
          background: 'var(--bg-tarjeta, #ffffff)',
          borderRadius: 24,
          padding: '28px 24px',
          boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
          border: '1px solid var(--borde, #e2e8f0)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'var(--bg-item, #f1f5f9)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--texto-second, #64748b)',
          }}
        >
          <FaTimes />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'var(--bg-item, var(--brand-soft-light))',
              color: 'var(--brand-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            <FaInfoCircle />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--texto-primary, #0f172a)', margin: 0 }}>
              {t('promotions.modal.conditionsTitle')}
            </h3>
            <span style={{ fontSize: 12, color: 'var(--texto-second, #64748b)' }}>
              {cupon.titulo}
            </span>
          </div>
        </div>

        {/* Detalles en lista */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            background: 'var(--bg-item, #f8fafc)',
            padding: 16,
            borderRadius: 16,
            marginBottom: 20,
            border: '1px solid var(--borde, #e2e8f0)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--texto-primary, #0f172a)' }}>
            <FaTag color="var(--brand-text)" />
            <span><strong>{t('promotions.modal.discount')}:</strong> {cupon.descuentoTexto}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--texto-primary, #0f172a)' }}>
            <FaCar color="var(--brand-text)" />
            <span><strong>{t('promotions.modal.category')}:</strong> {t(`promotions.categories.${cupon.categoriaVehiculo}`, cupon.categoriaVehiculo)}</span>
          </div>

          {cupon.reservaMinima > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--texto-primary, #0f172a)' }}>
              <FaTag color="var(--brand-text)" />
              <span><strong>{t('promotions.modal.minimum')}:</strong> {formatCurrency(cupon.reservaMinima, moneda)}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--texto-primary, #0f172a)' }}>
            <FaCalendarAlt color="var(--brand-text)" />
            <span><strong>{t('promotions.modal.granted')}:</strong> {cupon.fechaOtorgado}</span>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--texto-second, #64748b)', lineHeight: 1.6, margin: '0 0 24px' }}>
          {cupon.condiciones}
        </p>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px 20px',
            borderRadius: 12,
            background: 'var(--brand-primary)',
            color: '#ffffff',
            border: 'none',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {t('promotions.modal.understood')}
        </button>
      </div>
    </div>
  )
}
