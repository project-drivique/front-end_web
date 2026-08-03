import { useTranslation } from 'react-i18next'
import { FaShieldAlt } from 'react-icons/fa'
import { useLanding } from '../../../landing/LandingContext'
import { formatCurrency } from '@/utils/currencyUtils'

export default function InsuranceSection({ seguros = [] }) {
  const { t } = useTranslation()
  const { moneda } = useLanding()

  if (!seguros.length) return null

  return (
    <div style={{ background: 'var(--bg-tarjeta)', border: '1px solid var(--borde)', borderRadius: 14, padding: '18px 20px' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--texto-second)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <FaShieldAlt size={15} /> {t('catalogo.insurance')}
      </p>
      {seguros.map((seg, i) => (
        <div
          key={i}
          style={{
            display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '9px 0',
            borderBottom: i < seguros.length - 1 ? '1px solid var(--borde)' : 'none',
          }}
        >
          <span style={{ color: 'var(--texto-primary)' }}>{seg.nombre}</span>
          <span style={{ fontWeight: 700, color: 'var(--texto-primary)' }}>{formatCurrency(seg.precio, moneda)}/{t('catalogo.day')}</span>
        </div>
      ))}
    </div>
  )
}