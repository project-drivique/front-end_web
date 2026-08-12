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

export default function PricingSection({ tarifas, seguros = [] }) {
  const { t } = useTranslation()
  const { moneda } = useLanding()

  if (!tarifas && !seguros.length) return null

  const kmLimit = tarifas?.kmLimitado || { precio: 0, km: 0 }
  const kmIlimit = tarifas?.kmIlimitado || { precio: 0 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
          {/* Tarjeta Tarifas */}
      {tarifas && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FaRoad size={14} color="#2563eb" />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1e3a8a', margin: 0 }}>Tarifas por kilometraje</h3>
          </div>
          
          <div style={{ 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: 12, padding: '0 16px' 
          }}>
            <PriceRow
              label="Kilometraje limitado"
              sub={`${kmLimit.km} km/día incluidos · Excedente: ${formatCurrency(kmLimit.excedente, moneda)}/km adicional`}
              value={`${formatCurrency(kmLimit.precio, moneda)} /día`}
            />
            <PriceRow
              label="Kilometraje ilimitado"
              value={`${formatCurrency(kmIlimit.precio, moneda)} /día`}
            />
          </div>
        </div>
      )}

      {/* Tarjeta Seguros */}
      {seguros.length > 0 && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FaShieldAlt size={14} color="#2563eb" />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1e3a8a', margin: 0 }}>Seguros</h3>
          </div>
          
          <div style={{ 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: 12, padding: '0 16px' 
          }}>
            {seguros.map((seg, i) => (
              <PriceRow
                key={i}
                label={seg.nombre}
                value={`${formatCurrency(seg.precio, moneda)} /día`}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}