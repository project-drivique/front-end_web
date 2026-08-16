import { useTranslation } from 'react-i18next';
import { FaCreditCard, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';

export default function PaymentMethodCard({ reserva, onCambio, c }) {
  const { t } = useTranslation();
  const esModoOscuro = c?.isDark ?? false;

  const metodoPago = reserva?.metodoPago || 'wompi';

  return (
    <div
      style={{
        background: esModoOscuro ? '#1e293b' : '#ffffff',
        border: `1px solid ${esModoOscuro ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
        borderRadius: 20,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        boxShadow: esModoOscuro ? '0 8px 24px rgba(0,0,0,0.3)' : '0 6px 20px rgba(0,0,0,0.03)',
      }}
    >
      {/* Encabezado de la Tarjeta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: esModoOscuro ? 'rgba(59,130,246,0.2)' : '#eff6ff',
            color: esModoOscuro ? '#60a5fa' : '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
          }}
        >
          <FaCreditCard />
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 800,
            color: esModoOscuro ? '#f8fafc' : '#0f172a',
            letterSpacing: '-0.01em',
          }}
        >
          {t('vehiculo.paymentMethodTitle', 'Selecciona el método de pago')}
        </h3>
      </div>

      {/* Opciones de Método de Pago */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Opción 1: Wompi / Tarjetas & PSE */}
        <label
          onClick={() => onCambio('metodoPago', 'wompi')}
          style={{
            display: 'flex',
            alignItems: 'start',
            gap: 14,
            padding: 16,
            borderRadius: 14,
            border: `2px solid ${metodoPago === 'wompi' ? '#2563eb' : esModoOscuro ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            background: metodoPago === 'wompi' 
              ? (esModoOscuro ? 'rgba(37,99,235,0.15)' : '#f0f6ff') 
              : (esModoOscuro ? 'rgba(255,255,255,0.02)' : '#f8fafc'),
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
        >
          <input
            type="radio"
            name="metodoPagoCard"
            value="wompi"
            checked={metodoPago === 'wompi'}
            onChange={() => onCambio('metodoPago', 'wompi')}
            style={{ accentColor: '#2563eb', width: 18, height: 18, marginTop: 2, cursor: 'pointer' }}
          />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: esModoOscuro ? '#f8fafc' : '#0f172a' }}>
                {t('vehiculo.paymentWompiTitle', 'Pagar en línea (Wompi / Tarjetas / PSE)')}
              </span>
              <FaCreditCard color={metodoPago === 'wompi' ? '#2563eb' : '#94a3b8'} size={16} />
            </div>
            <span style={{ fontSize: 12, color: esModoOscuro ? '#94a3b8' : '#64748b', lineHeight: 1.4 }}>
              {t('vehiculo.paymentWompiDesc', 'Pago seguro inmediato con tarjeta de crédito, débito o PSE.')}
            </span>
          </div>
        </label>

        {/* Opción 2: Efectivo en Sucursal */}
        <label
          onClick={() => onCambio('metodoPago', 'efectivo')}
          style={{
            display: 'flex',
            alignItems: 'start',
            gap: 14,
            padding: 16,
            borderRadius: 14,
            border: `2px solid ${metodoPago === 'efectivo' ? '#2563eb' : esModoOscuro ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            background: metodoPago === 'efectivo' 
              ? (esModoOscuro ? 'rgba(37,99,235,0.15)' : '#f0f6ff') 
              : (esModoOscuro ? 'rgba(255,255,255,0.02)' : '#f8fafc'),
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
        >
          <input
            type="radio"
            name="metodoPagoCard"
            value="efectivo"
            checked={metodoPago === 'efectivo'}
            onChange={() => onCambio('metodoPago', 'efectivo')}
            style={{ accentColor: '#2563eb', width: 18, height: 18, marginTop: 2, cursor: 'pointer' }}
          />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: esModoOscuro ? '#f8fafc' : '#0f172a' }}>
                {t('vehiculo.paymentCashTitle', 'Pago en efectivo')}
              </span>
              <FaMoneyBillWave color={metodoPago === 'efectivo' ? '#2563eb' : '#94a3b8'} size={16} />
            </div>
            <span style={{ fontSize: 12, color: esModoOscuro ? '#94a3b8' : '#64748b', lineHeight: 1.4 }}>
              {t('vehiculo.paymentCashDesc', 'Reserva ahora y paga directamente al retirar el vehículo.')}
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
