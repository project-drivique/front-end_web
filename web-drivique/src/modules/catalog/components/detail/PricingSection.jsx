import { useTranslation } from 'react-i18next'
import { FaRoad, FaShieldAlt } from 'react-icons/fa'
import { useLanding } from '../../../landing/LandingContext'
import { formatCurrency } from '@/utils/currencyUtils'

function PriceRow({ label, value, sub, isLast = false, c }) {
  const textPrimary = c?.textPrimary || '#0f172a'
  const textSecondary = c?.textSecondary || '#64748b'

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: sub ? 'flex-start' : 'center',
        gap: 12,
        padding: '12px 0',
        borderBottom: isLast ? 'none' : `1px solid ${c?.subCardBorder || 'rgba(0,0,0,0.06)'}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: textPrimary, margin: 0 }}>
          {label}
        </p>
        {sub && (
          <p style={{ fontSize: 11, color: textSecondary, margin: '4px 0 0', lineHeight: 1.35, fontWeight: 400 }}>
            {sub}
          </p>
        )}
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: textPrimary,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {value}
      </span>
    </div>
  )
}

export default function PricingSection({ tarifas, seguros = [], c }) {
  const { t } = useTranslation()
  const { moneda } = useLanding()

  if (!tarifas && !seguros.length) return null

  const bg = c?.cardBg || '#fff'
  const border = c?.cardBorder || '#e2e8f0'
  const titleColor = c?.titleColor || 'var(--brand-secondary, #0f172a)'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <FaRoad size={14} color={c?.accentText || "var(--brand-primary, #1e3a8a)"} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>
              {t('vehiculo.mileageRates', 'Tarifas por kilometraje')}
            </h3>
          </div>

          <div
            style={{
              background: subBg,
              border: `1px solid ${subBorder}`,
              borderRadius: 12,
              padding: '0 16px',
            }}
          >
            <PriceRow
              label={t('vehiculo.limitedMileage', 'Kilometraje limitado')}
              value={`${formatCurrency(kmLimit.precio, moneda)}${t('catalogo.perDay', '/día')}`}
              c={c}
            />
            <PriceRow
              label={t('vehiculo.unlimitedMileage', 'Kilometraje ilimitado')}
              value={`${formatCurrency(kmIlimit.precio, moneda)}${t('catalogo.perDay', '/día')}`}
              isLast={true}
              c={c}
            />
          </div>
        </div>
      )}

      {/* Tarjeta Seguros */}
      {seguros.length > 0 && (
        <div style={{ background: bg, padding: 20, borderRadius: 16, border: `1px solid ${border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <FaShieldAlt size={14} color={c?.accentText || "var(--brand-primary, #1e3a8a)"} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>
              {t('vehiculo.insurance', 'Seguros')}
            </h3>
          </div>

          <div
            style={{
              background: subBg,
              border: `1px solid ${subBorder}`,
              borderRadius: 12,
              padding: '0 16px',
            }}
          >
            {seguros.map((seg, i) => (
              <PriceRow
                key={i}
                label={seguroNombreMap[seg.nombre] ? t(seguroNombreMap[seg.nombre]) : seg.nombre}
                value={`${formatCurrency(seg.precio, moneda)}${t('catalogo.perDay', '/día')}`}
                isLast={i === seguros.length - 1}
                c={c}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
