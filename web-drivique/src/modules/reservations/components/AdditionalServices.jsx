import { useTranslation } from 'react-i18next'
import { FaCheck, FaWifi, FaBaby, FaUserPlus, FaRoad, FaPlane, FaPlusCircle, FaGasPump, FaShower } from 'react-icons/fa'
import { formatCurrency } from '@/utils/currencyUtils'
import { useLanding } from '../../landing/LandingContext'

const getIconForService = (name) => {
  const n = name.toLowerCase();
  if (n.includes('gps')) return <FaWifi size={14} />;
  if (n.includes('beb')) return <FaBaby size={14} />;
  if (n.includes('conductor')) return <FaUserPlus size={14} />;
  if (n.includes('lavado')) return <FaShower size={14} />;
  if (n.includes('tanque')) return <FaGasPump size={14} />;
  if (n.includes('peaje')) return <FaRoad size={14} />;
  if (n.includes('aeropuerto')) return <FaPlane size={14} />;
  return <FaPlusCircle size={14} />;
}

export default function ServiciosAdicionales({ servicios = [], seleccionados = [], onToggle, c, dias = 1 }) {
  const { t } = useTranslation()
  const { moneda } = useLanding()

  if (servicios.length === 0) return null

  // Calcular total de servicios adicionales
  const totalDiario = seleccionados.reduce((acc, nombreServicio) => {
    const s = servicios.find(s => s.nombre === nombreServicio);
    return acc + (s ? s.precio : 0);
  }, 0);
  const total = totalDiario * dias;

  return (
    <div className="mt-8">
      <div style={{
        background: c?.cardBg || '#ffffff',
        borderRadius: 16,
        padding: '16px',
        border: `1px solid ${c?.cardBorder || '#e2e8f0'}`,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px' }}>
          <FaPlusCircle color={c?.accentText || '#1e3a8a'} size={14} />
          <h3 style={{ fontSize: 13, fontWeight: 700, color: c?.accentText || '#1e3a8a', margin: 0, textTransform: 'none' }}>
            {t('vehiculo.extraServices', 'Servicios adicionales')}
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {servicios.map((servicio) => {
            const activo = seleccionados.includes(servicio.nombre)
            return (
              <button
                key={servicio.nombre}
                type="button"
                onClick={() => onToggle(servicio.nombre)}
                style={{
                  cursor: 'pointer',
                  background: activo ? 'rgba(37,99,235,0.04)' : 'transparent',
                  borderRadius: 8,
                  border: `1px solid ${activo ? (c?.accentText || '#2563eb') : (c?.cardBorder || '#e2e8f0')}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 200ms ease',
                  padding: '12px 16px',
                  textAlign: 'left'
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: `1px solid ${activo ? (c?.accentText || '#2563eb') : (c?.textSecondary || '#cbd5e1')}`,
                    background: activo ? (c?.accentText || '#2563eb') : 'transparent',
                    color: '#fff',
                    flexShrink: 0,
                    transition: 'all 150ms ease'
                  }}
                >
                  {activo && <FaCheck size={10} />}
                </span>

                <span style={{ color: activo ? (c?.accentText || '#2563eb') : (c?.textSecondary || '#94a3b8'), display: 'flex', alignItems: 'center' }}>
                  {getIconForService(servicio.nombre)}
                </span>

                <span style={{ fontSize: 13, fontWeight: activo ? 600 : 500, color: activo ? (c?.accentText || '#2563eb') : (c?.textPrimary || '#0f172a') }}>
                  {t('servicios.' + servicio.nombre, servicio.nombre)}
                </span>

                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: activo ? (c?.accentText || '#2563eb') : (c?.textSecondary || '#64748b') }}>
                  {formatCurrency(servicio.precio, moneda)} / {t('catalogo.day', 'día')}
                </span>
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
            {t('vehiculo.totalExtraServices', `Total servicios adicionales ({{diasText}})`, { diasText: `${dias} ${dias === 1 ? t('vehiculo.dayStr', 'día') : t('vehiculo.daysStr', 'días')}` })}
          </span>
          <span style={{ fontSize: 15, fontWeight: 800, color: c?.accentText || '#1e3a8a' }}>
            {formatCurrency(total, moneda)}
          </span>
        </div>
      </div>
    </div>
  )
}
