import { useTranslation } from 'react-i18next'
import { FaRoad, FaShieldAlt } from 'react-icons/fa'
import { useLanding } from '../../../landing/LandingContext'
import { formatCurrency } from '@/utils/currencyUtils'

function PriceRow({ label, value, sub, isLast }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: isLast ? 'none' : '1px dashed var(--borde)',
    }}>
      <div>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--texto-primary)', margin: 0 }}>{label}</p>
        {sub && <p style={{ fontSize: 11.5, color: 'var(--texto-second)', margin: '2px 0 0' }}>{sub}</p>}
      </div>
      <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--texto-primary)' }}>{value}</span>
    </div>
  )
}

export default function PricingSection({ tarifas, seguros = [] }) {
  const { t } = useTranslation()
  const { moneda } = useLanding()

  if (!tarifas && !seguros.length) return null

  const kmLimit = tarifas?.kmLimitado || { precio: 0, km: 0 }
  const kmIlimit = tarifas?.kmIlimitado || { precio: 0 }

  return (
    <div style={{
      background: 'rgba(37,99,235,0.05)',
      border: '1px solid rgba(37,99,235,0.12)',
      borderRadius: 14,
      padding: '16px 18px',
    }}>
      <p style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 12, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
        color: 'var(--texto-second)', margin: '0 0 6px',
      }}>
        <FaRoad size={12} color="#2563eb" /> {t('catalogo.rates')}
      </p>

      {tarifas && (
        <>
          <PriceRow
            label={t('catalogo.limitedKm')}
            sub={`${kmLimit.km} km/${t('catalogo.day')}`}
            value={formatCurrency(kmLimit.precio, moneda)}
          />
          <PriceRow
            label={t('catalogo.unlimitedKm')}
            value={formatCurrency(kmIlimit.precio, moneda)}
            isLast={!seguros.length}
          />
        </>
      )}

      {seguros.length > 0 && (
        <>
          <p style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
            color: 'var(--texto-second)', margin: '14px 0 2px',
          }}>
            <FaShieldAlt size={12} color="#2563eb" /> {t('catalogo.insurance')}
          </p>
          {seguros.map((seg, i) => (
            <PriceRow
              key={i}
              label={seg.nombre}
              value={`${formatCurrency(seg.precio, moneda)}/${t('catalogo.day')}`}
              isLast={i === seguros.length - 1}
            />
          ))}
        </>
      )}
    </div>
  )
}