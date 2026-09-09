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

export default function EquipmentSection({ caracteristicas = [], equipamiento = [], showTech = false, showGeneral = true, c }) {
  const { t } = useTranslation()

  const bg = c?.cardBg || 'var(--bg-tarjeta, #ffffff)'
  const border = c?.subCardBorder || c?.cardBorder || 'var(--borde, #e2e8f0)'
  const titleColor = c?.titleColor || 'var(--brand-secondary, #0f172a)'
  const subBg = c?.subCardBg || 'var(--bg-item, #f8fafc)'
  const textPrimary = c?.textPrimary || 'var(--texto-primary, #0f172a)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Equipamiento Tecnológico */}
      {showTech && equipamiento.length > 0 && (
        <div style={{ background: bg, padding: 'clamp(14px, 2vw, 20px)', borderRadius: 16, border: `1px solid ${border}`, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <FaMobileAlt color={c?.accentText || "var(--brand-primary)"} size={13} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>{t('vehiculo.techEquipment', 'Equipamiento tecnológico')}</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {equipamiento.map((item, i) => {
              const TechIcon = FaIcons[item.icono] || FaIcons.FaCheckCircle
              const itemLabel = TECH_MAP[item.nombre] ? t(TECH_MAP[item.nombre]) : item.nombre
              return (
                <span key={i} style={{
                  background: subBg, border: `1px solid ${border}`,
                  borderRadius: 20, padding: '5px 12px', fontSize: 12, color: textPrimary, fontWeight: 500,
                  display: 'inline-flex', alignItems: 'center', gap: 6
                }}>
                  <TechIcon color="#94a3b8" size={12} />
                  {itemLabel}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Equipamiento General (Características) */}
      {showGeneral && caracteristicas.length > 0 && (
        <div style={{ background: bg, padding: 'clamp(14px, 2vw, 20px)', borderRadius: 16, border: `1px solid ${border}`, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <FaMapMarkerAlt color={c?.accentText || "var(--brand-primary)"} size={13} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>{t('vehiculo.generalEquipment', 'Equipamiento')}</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
            {caracteristicas.map((item, i) => {
              const Icono = FaIcons[item.icono] || FaIcons.FaCheckCircle
              const itemLabel = EQ_MAP[item.nombre] ? t(EQ_MAP[item.nombre]) : item.nombre
              return (
                <div key={i} style={{
                  background: subBg, borderRadius: 8, padding: '8px 12px', border: `1px solid ${border}`,
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: textPrimary, fontWeight: 500,
                  minWidth: 0,
                }}>
                  <Icono color="#94a3b8" size={12} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{itemLabel}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
