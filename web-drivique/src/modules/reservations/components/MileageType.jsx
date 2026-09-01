import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/currencyUtils'
import { useLanding } from '../../landing/LandingContext'
import { FaTachometerAlt, FaCheckCircle } from 'react-icons/fa'

export default function TipoKilometraje({ vehiculo, tipoKm, onSeleccionar, c, dias = 1 }) {
  const { t } = useTranslation()
  const { moneda } = useLanding()

  const kmLimit = vehiculo.tarifas?.kmLimitado || { precio: 0, km: 150, excedente: 550 };
  const kmIlimit = vehiculo.tarifas?.kmIlimitado || { precio: 0 };

  const opciones = [
    {
      val: 'limitado',
      titulo: t('vehiculo.kmLimitedTitle', 'Kilometraje limitado'),
      descripcion: t('vehiculo.kmLimitedDesc', 'Incluye {{km}} km por día dentro del valor de la tarifa. Si te pasas del límite, se cobra {{excedente}} por cada km adicional.', { km: kmLimit.km, excedente: formatCurrency(kmLimit.excedente, moneda) }),
      precio: kmLimit.precio,
    },
    {
      val: 'ilimitado',
      titulo: t('vehiculo.kmUnlimitedTitle', 'Kilometraje ilimitado'),
      descripcion: t('vehiculo.kmUnlimitedDesc', 'Sin restricción de distancia dentro del territorio nacional. No aplica cobro adicional por exceso de kilómetros.'),
      precio: kmIlimit.precio,
    },
  ]

  const precioDiario = tipoKm ? opciones.find(o => o.val === tipoKm)?.precio || 0 : 0;
  const total = precioDiario * dias;

  return (
    <div className="mt-8">
      <div style={{
        background: c?.cardBg || '#ffffff',
        borderRadius: 16,
        padding: '16px',
        border: `1px solid ${c?.cardBorder || '#e2e8f0'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px' }}>
          <FaTachometerAlt color={c?.accentText || 'var(--brand-secondary)'} size={14} />
          <h3 style={{ fontSize: 13, fontWeight: 700, color: c?.accentText || 'var(--brand-secondary)', margin: 0, textTransform: 'none' }}>
            {t('vehiculo.kmTypeTitle', 'Tipo de Kilometraje')}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {opciones.map(op => {
            const activo = tipoKm === op.val
            return (
              <button
                key={op.val}
                type="button"
                onClick={() => onSeleccionar(op.val)}
                style={{ 
                  cursor: 'pointer',
                  background: 'transparent',
                  borderRadius: 16,
                  border: `1px solid ${activo ? (c?.accentText || 'var(--brand-primary)') : (c?.cardBorder || '#e2e8f0')}`,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'border-color 200ms ease',
                  padding: '20px',
                  textAlign: 'center',
                  alignItems: 'center'
                }}
              >
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: c?.textPrimary || 'var(--texto-primary)', margin: '0 0 8px' }}>
                {op.titulo}
              </h4>
              <p style={{ fontSize: '12px', fontWeight: 500, color: activo ? 'var(--brand-text)' : (c?.textSecondary || 'var(--texto-second)'), lineHeight: 1.4, margin: '0 0 16px', flex: 1 }}>
                {op.descripcion}
              </p>
              
              <div style={{ width: '100%', marginTop: 'auto' }}>
                <p style={{ fontSize: '18px', fontWeight: 900, color: 'var(--brand-text)', margin: '0 0 16px', letterSpacing: '-0.03em' }}>
                  {formatCurrency(op.precio, moneda)} <span style={{ fontSize: '10px', fontWeight: 600, color: c?.textSecondary || 'var(--texto-second)' }}>/ {t('catalogo.day', 'día')}</span>
                </p>
                <div style={{
                  width: '100%',
                  height: '36px',
                  borderRadius: '9px',
                  fontSize: '11px',
                  fontWeight: 800,
                  border: 'none',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  background: activo ? 'var(--brand-gradient)' : (c?.isDark ? '#1e293b' : '#f1f5f9'),
                  color: activo ? '#ffffff' : (c?.textSecondary || '#64748b'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 200ms ease',
                }}>
                  {activo && <FaCheckCircle size={12} />}
                  {activo ? t('vehiculo.selected', 'Seleccionado') : t('vehiculo.select', 'Seleccionar')}
                </div>
              </div>
              </button>
            )
          })}
        </div>

        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: `1px solid ${c?.cardBorder || '#e2e8f0'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: c?.textPrimary || '#0f172a' }}>
            {tipoKm 
              ? t('vehiculo.totalDynamic', `Total ${opciones.find(o => o.val === tipoKm)?.titulo} ({{diasText}})`, { name: opciones.find(o => o.val === tipoKm)?.titulo, diasText: `${dias} ${dias === 1 ? t('vehiculo.dayStr', 'día') : t('vehiculo.daysStr', 'días')}` })
              : t('vehiculo.totalMileageType', `Total tipo de kilometraje ({{diasText}})`, { diasText: `${dias} ${dias === 1 ? t('vehiculo.dayStr', 'día') : t('vehiculo.daysStr', 'días')}` })
            }
          </span>
          <span style={{ fontSize: 15, fontWeight: 800, color: c?.accentText || 'var(--brand-secondary)' }}>
            {formatCurrency(total, moneda)}
          </span>
        </div>
      </div>
    </div>
  )
}
