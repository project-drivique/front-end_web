import { useTranslation } from 'react-i18next'
import * as FaIcons from 'react-icons/fa'
import { FaMobileAlt, FaMapMarkerAlt } from 'react-icons/fa'

const TECH_MAP = {
  'Pantalla táctil': 'vehiculo.techTouchScreen',
  'Cámara de reversa': 'vehiculo.techReverseCamera',
  'Bluetooth': 'vehiculo.techBluetooth',
  'Puerto USB': 'vehiculo.techUsbPort',
}

const EQ_MAP = {
  'Aire acondicionado': 'vehiculo.eqAirConditioning',
  'Vidrios eléctricos': 'vehiculo.eqElectricWindows',
  'Cierre centralizado': 'vehiculo.eqCentralLocking',
  'Frenos ABS': 'vehiculo.eqAbsBrakes',
  'Airbags': 'vehiculo.eqAirbags',
  'Navegación GPS': 'vehiculo.eqGpsNavigation',
  'Sensores de parqueo': 'vehiculo.eqParkingSensors',
  'Control de crucero': 'vehiculo.eqCruiseControl',
  'Techo panorámico': 'vehiculo.eqSunroof',
  'Asientos de cuero': 'vehiculo.eqLeatherSeats',
}

export default function EquipmentSection({ caracteristicas = [], equipamiento = [], c }) {
  const { t } = useTranslation()

  const bg = c?.cardBg || '#fff'
  const border = c?.cardBorder || '#e2e8f0'
  const titleColor = c?.titleColor || '#1e3a8a'
  const subBg = c?.subCardBg || '#fff'
  const textPrimary = c?.textPrimary || '#475569'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%', flex: 1 }}>

      {/* Equipamiento Tecnológico */}
      {equipamiento.length > 0 && (
        <div style={{ background: bg, padding: 20, borderRadius: 16, border: `1px solid ${border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FaMobileAlt color={c?.accentText || "#2563eb"} size={14} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>{t('vehiculo.techEquipment', 'Equipamiento tecnológico')}</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {equipamiento.map((item, i) => {
              const TechIcon = FaIcons[item.icono] || FaIcons.FaCheckCircle
              const itemLabel = TECH_MAP[item.nombre] ? t(TECH_MAP[item.nombre]) : item.nombre
              return (
                <span key={i} style={{ 
                  background: subBg, border: `1px solid ${border}`, 
                  borderRadius: 20, padding: '6px 14px', fontSize: 12, color: textPrimary, fontWeight: 500,
                  display: 'inline-flex', alignItems: 'center', gap: 6
                }}>
                  <TechIcon color={c?.accentText || "#2563eb"} size={12} />
                  {itemLabel}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Equipamiento General (Características) */}
      {caracteristicas.length > 0 && (
        <div style={{ background: bg, padding: 20, borderRadius: 16, border: `1px solid ${border}`, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FaMapMarkerAlt color={c?.accentText || "#2563eb"} size={14} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>{t('vehiculo.generalEquipment', 'Equipamiento')}</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {caracteristicas.map((item, i) => {
              const Icono = FaIcons[item.icono] || FaIcons.FaCheckCircle
              const itemLabel = EQ_MAP[item.nombre] ? t(EQ_MAP[item.nombre]) : item.nombre
              return (
                <div key={i} style={{ 
                  background: subBg, borderRadius: 8, padding: '10px 14px', border: `1px solid ${border}`,
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: textPrimary, fontWeight: 500
                }}>
                  <Icono color="#94a3b8" size={14} />
                  {itemLabel}
                </div>
              )
            })}
          </div>
        </div>
      )}
      
    </div>
  )
}