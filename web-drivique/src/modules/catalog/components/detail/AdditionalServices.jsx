import { useTranslation } from 'react-i18next'
import { FaWifi } from 'react-icons/fa'
import { useLanding } from '../../../landing/LandingContext'
import { formatCurrency } from '@/utils/currencyUtils'
import DetailSection from './DetailSection'

export default function AdditionalServices({ servicios = [] }) {
  const { t } = useTranslation()
  const { moneda } = useLanding()

  if (!servicios.length) return null

  return (
    <DetailSection icon={<FaWifi size={12} />} title={t('vehiculo.extraServices')}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
        {servicios.map((serv, i) => (
          <div key={i} style={{ background: 'var(--bg-item)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--texto-primary)', margin: '0 0 6px' }}>{serv.nombre}</p>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#059669', margin: 0 }}>+{formatCurrency(serv.precio, moneda)} /{t('catalogo.day')}</p>
          </div>
        ))}
      </div>
    </DetailSection>
  )
}