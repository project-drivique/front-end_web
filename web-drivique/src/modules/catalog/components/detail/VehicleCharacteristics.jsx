import { useTranslation } from 'react-i18next'
import { FaCogs, FaUserFriends } from 'react-icons/fa'
import SpecsGrid from './SpecsGrid'

const CAT_KEYS   = { 'Económico': 'catalogo.catEco', 'Deportivo': 'catalogo.catSport', 'Sedan': 'catalogo.catSedan', 'SUV': 'catalogo.catSuv' }
const TRANS_KEYS = { 'Automática': 'catalogo.transAuto', 'Manual': 'catalogo.transManual' }
const FUEL_KEYS  = { 'Gasolina': 'catalogo.fuelGas', 'Diesel': 'catalogo.fuelDiesel', 'Híbrido': 'catalogo.fuelHybrid', 'Eléctrico': 'catalogo.fuelElec' }
const COLOR_MAP  = {
  'Gris Highland': 'vehiculo.colorGrisHighland',
  'Blanco': 'vehiculo.colorBlanco',
  'Blanco Perla': 'vehiculo.colorBlanco',
  'Negro': 'vehiculo.colorNegro',
  'Rojo': 'vehiculo.colorRojo',
  'Azul': 'vehiculo.colorAzul',
  'Plata': 'vehiculo.colorPlata',
}

export default function VehicleCharacteristics({ vehiculo, c, showIcon = false, compact = false }) {
  const { t } = useTranslation()

  const bg = c?.cardBg || '#fff'
  const border = c?.cardBorder || '#e2e8f0'
  const titleColor = c?.titleColor || 'var(--brand-secondary, #0f172a)'

  const categoria   = CAT_KEYS[vehiculo?.categoria]     ? t(CAT_KEYS[vehiculo.categoria])   : (vehiculo?.categoria || 'Económico')
  const transmision = TRANS_KEYS[vehiculo?.transmision] ? t(TRANS_KEYS[vehiculo.transmision]) : (vehiculo?.transmision || 'Manual')
  const combustible = FUEL_KEYS[vehiculo?.combustible]  ? t(FUEL_KEYS[vehiculo.combustible])  : (vehiculo?.combustible || 'Gasolina')
  const color       = COLOR_MAP[vehiculo?.color]        ? t(COLOR_MAP[vehiculo.color])      : (vehiculo?.color || 'Gris Highland')

  const techSpecsItems = [
    { label: t('vehiculo.category', 'Categoría'), value: categoria },
    { label: t('vehiculo.transmission', 'Transmisión'), value: transmision },
    { label: t('vehiculo.fuel', 'Combustible'), value: combustible },
    { label: t('vehiculo.engine', 'Motor'), value: vehiculo?.cilindraje || '1.6L' },
    { label: t('vehiculo.year', 'Año'), value: `${vehiculo?.año || vehiculo?.anio || 2023}` },
  ]

  const capacityItems = [
    { label: t('vehiculo.capacity', 'Capacidad'), value: `${vehiculo?.pasajeros || 5} ${t('vehiculo.passengers', 'pasajeros')}` },
    { label: t('vehiculo.doorsLabel', 'Puertas'), value: `${vehiculo?.puertas || 5}` },
    { label: t('vehiculo.trunk', 'Maletero'), value: `${vehiculo?.maletero || 320} L` },
    { label: t('vehiculo.colorLabel', 'Color'), value: color },
    { label: t('vehiculo.plateLabel', 'Placa'), value: vehiculo?.placa || 'PQR-678' },
  ]

  const cardStyle = {
    background: bg,
    padding: 'clamp(14px, 2vw, 20px)',
    borderRadius: 16,
    border: `1px solid ${border}`,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tarjeta 1: Especificaciones Técnicas */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <FaCogs color={c?.accentText || "var(--brand-primary, #1e3a8a)"} size={13} />
          <h3 style={{ fontSize: 13, fontWeight: 800, color: titleColor, margin: 0 }}>
            {t('vehiculo.techSpecs', 'Especificaciones técnicas')}
          </h3>
        </div>
        <div>
          <SpecsGrid items={techSpecsItems} c={c} showIcon={showIcon} compact={compact} />
        </div>
      </div>

      {/* Tarjeta 2: Capacidad y Detalles */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <FaUserFriends color={c?.accentText || "var(--brand-primary, #1e3a8a)"} size={13} />
          <h3 style={{ fontSize: 13, fontWeight: 800, color: titleColor, margin: 0 }}>
            {t('vehiculo.capacityAndDetails', 'Capacidad y detalles')}
          </h3>
        </div>
        <div>
          <SpecsGrid items={capacityItems} c={c} showIcon={showIcon} compact={compact} />
        </div>
      </div>
    </div>
  )
}
