import { useTranslation } from 'react-i18next'
import { FaCreditCard, FaMoneyBillWave } from 'react-icons/fa'

export default function PaymentMethodCard({ reserva, onCambio, c }) {
  const { t } = useTranslation()

  const bg          = c?.cardBg     || '#fff'
  const border      = c?.cardBorder || '#e2e8f0'
  const titleColor  = c?.titleColor || '#1e3a8a'
  const textPrimary = c?.textPrimary  || 'var(--texto-primary)'
  const textSecond  = c?.textSecondary || 'var(--texto-second)'
  const accent      = c?.accentText || '#2563eb'

  const metodoPago = reserva?.metodoPago

  const opciones = [
    {
      value: 'wompi',
      Icono: FaCreditCard,
      titulo: t('vehiculo.paymentWompiTitle', 'Pagar en línea (Wompi / Tarjetas / PSE)'),
      desc:   t('vehiculo.paymentWompiDesc', 'Pago seguro inmediato con tarjeta de crédito, débito o PSE.'),
    },
    {
      value: 'efectivo',
      Icono: FaMoneyBillWave,
      titulo: t('vehiculo.paymentCashTitle', 'Pago en efectivo'),
      desc:   t('vehiculo.paymentCashDesc', 'Reserva ahora y paga directamente al retirar el vehículo.'),
    },
  ]

  return (
    <div style={{ background: bg, padding: 20, borderRadius: 16, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Encabezado igual que BranchInfo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0 }}>
        <FaCreditCard color={accent} size={14} />
        <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>
          {t('vehiculo.paymentMethodTitle', 'Selecciona el método de pago')}
        </h3>
      </div>

      {/* Opciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {opciones.map(({ value, Icono, titulo, desc }) => {
          const activo = metodoPago === value
          return (
            <label
              key={value}
              onClick={() => onCambio('metodoPago', value)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                border: `1px solid ${activo ? accent : border}`,
                background: activo ? (c?.isDark ? 'rgba(37,99,235,0.12)' : '#eff6ff') : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.18s',
              }}
            >
              <input
                type="radio"
                name="metodoPagoCard"
                value={value}
                checked={activo}
                onChange={() => onCambio('metodoPago', value)}
                style={{ accentColor: accent, width: 16, height: 16, marginTop: 3, cursor: 'pointer', flexShrink: 0 }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: activo ? accent : textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icono size={13} color={activo ? accent : '#94a3b8'} />
                  {titulo}
                </p>
                <p style={{ fontSize: 12, color: textSecond, margin: 0, lineHeight: 1.4 }}>
                  {desc}
                </p>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
