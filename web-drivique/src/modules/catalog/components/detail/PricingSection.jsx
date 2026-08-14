import { useTranslation } from 'react-i18next'
import { FaRoad, FaShieldAlt } from 'react-icons/fa'
import { useLanding } from '../../../landing/LandingContext'
import { formatCurrency } from '@/utils/currencyUtils'

function PriceRow({ label, value, sub }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.04)',
    }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--texto-primary)', margin: 0 }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: 'var(--texto-second)', margin: '4px 0 0' }}>{sub}</p>}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--texto-primary)' }}>{value}</span>
    </div>
  )
}

export default function PricingSection({ tarifas, seguros = [], c }) {
  const { t } = useTranslation()
  const { moneda } = useLanding()

  if (!tarifas && !seguros.length) return null

  const bg = c?.cardBg || '#fff'
  const border = c?.cardBorder || '#e2e8f0'
  const titleColor = c?.titleColor || '#1e3a8a'
  const subBg = c?.subCardBg || '#f8fafc'
  const subBorder = c?.subCardBorder || '#e2e8f0'

  const kmLimit = tarifas?.kmLimitado || { precio: 0, km: 0 }
  const kmIlimit = tarifas?.kmIlimitado || { precio: 0 }

  const seguroNombreMap = {
    'Protección Obligatoria': 'catalogo.basicProtection',
    'Protección Total': 'catalogo.fullProtection',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Tarjeta Tarifas */}
      {tarifas && (
        <div style={{ background: bg, padding: 20, borderRadius: 16, border: `1px solid ${border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FaRoad size={14} color={c?.accentText || "#2563eb"} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>{t('vehiculo.mileageRates', 'Tarifas por kilometraje')}</h3>
          </div>

          <div style={{ 
            background: subBg, 
            border: `1px solid ${subBorder}`, 
            borderRadius: 12, padding: '0 16px' 
          }}>
            <PriceRow
              label={t('vehiculo.limitedMileage', 'Kilometraje limitado')}
              sub={t('vehiculo.kmIncludedSub', { km: kmLimit.km, excedente: formatCurrency(kmLimit.excedente, moneda), defaultValue: `${kmLimit.km} km/día incluidos · Excedente: ${formatCurrency(kmLimit.excedente, moneda)}/km adicional` })}
              value={`${formatCurrency(kmLimit.precio, moneda)}${t('catalogo.perDay', '/día')}`}
            />
            <PriceRow
              label={t('vehiculo.unlimitedMileage', 'Kilometraje ilimitado')}
              value={`${formatCurrency(kmIlimit.precio, moneda)}${t('catalogo.perDay', '/día')}`}
            />
          </div>
        </div>
      )}

      {/* Tarjeta Seguros */}
      {seguros.length > 0 && (
        <div style={{ background: bg, padding: 20, borderRadius: 16, border: `1px solid ${border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FaShieldAlt size={14} color={c?.accentText || "#2563eb"} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>{t('vehiculo.insurance', 'Seguros')}</h3>
          </div>

          <div style={{ 
            background: subBg, 
            border: `1px solid ${subBorder}`, 
            borderRadius: 12, padding: '0 16px' 
          }}>
            {seguros.map((seg, i) => (
              <PriceRow
                key={i}
                label={seguroNombreMap[seg.nombre] ? t(seguroNombreMap[seg.nombre]) : seg.nombre}
                value={`${formatCurrency(seg.precio, moneda)}${t('catalogo.perDay', '/día')}`}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}