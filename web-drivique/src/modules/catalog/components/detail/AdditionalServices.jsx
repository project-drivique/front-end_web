import { useTranslation } from 'react-i18next'
import { FaWifi } from 'react-icons/fa'
import { useLanding } from '../../../landing/LandingContext'
import { formatCurrency } from '@/utils/currencyUtils'

export default function AdditionalServices({ servicios = [] }) {
  const { t } = useTranslation()
  const { moneda } = useLanding()

  if (!servicios.length) return null

  return (
    <div style={{ background: 'var(--bg-tarjeta)', border: '1px solid var(--borde)', borderRadius: 16, padding: '28px 32px' }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--texto-second)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <FaWifi size={18} /> {t('vehiculo.extraServices')}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {servicios.map((serv, i) => (
          <div key={i} style={{ background: 'var(--bg-item)', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--texto-primary)', margin: '0 0 6px' }}>{serv.nombre}</p>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#059669', margin: 0 }}>+{formatCurrency(serv.precio, moneda)} /{t('catalogo.day')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}