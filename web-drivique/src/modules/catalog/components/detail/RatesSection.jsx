import { useTranslation } from 'react-i18next'
import { FaRoad } from 'react-icons/fa'
import { useLanding } from '../../../landing/LandingContext'
import { formatCurrency } from '@/utils/currencyUtils'

export default function RatesSection({ tarifas }) {
  const { t } = useTranslation()
  const { moneda } = useLanding()

  if (!tarifas) return null

  const kmLimit = tarifas.kmLimitado || { precio: 0, km: 0 }
  const kmIlimit = tarifas.kmIlimitado || { precio: 0 }

  return (
    <div style={{ background: 'var(--bg-tarjeta)', border: '1px solid var(--borde)', borderRadius: 14, padding: '18px 20px' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--texto-second)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <FaRoad size={15} /> {t('catalogo.rates')}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '9px 0', borderBottom: '1px solid var(--borde)' }}>
        <span style={{ color: 'var(--texto-primary)' }}>{t('catalogo.limitedKm')} ({kmLimit.km} km/{t('catalogo.day')})</span>
        <span style={{ fontWeight: 700, color: 'var(--texto-primary)' }}>{formatCurrency(kmLimit.precio, moneda)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '9px 0' }}>
        <span style={{ color: 'var(--texto-primary)' }}>{t('catalogo.unlimitedKm')}</span>
        <span style={{ fontWeight: 700, color: 'var(--texto-primary)' }}>{formatCurrency(kmIlimit.precio, moneda)}</span>
      </div>
    </div>
  )
}