import { useTranslation } from 'react-i18next'
import { FaCar, FaGasPump, FaUserFriends, FaDoorOpen, FaSuitcase, FaBolt, FaPalette, FaCalendarAlt, FaListUl, FaTag, FaIdCard } from 'react-icons/fa'
import SpecsGrid from './SpecsGrid'

const CAT_KEYS   = { 'Económico': 'catalogo.catEco', 'Deportivo': 'catalogo.catSport', 'Sedan': 'catalogo.catSedan', 'SUV': 'catalogo.catSuv' }
const TRANS_KEYS = { 'Automática': 'catalogo.transAuto', 'Manual': 'catalogo.transManual' }
const FUEL_KEYS  = { 'Gasolina': 'catalogo.fuelGas', 'Diesel': 'catalogo.fuelDiesel', 'Híbrido': 'catalogo.fuelHybrid', 'Eléctrico': 'catalogo.fuelElec' }
const COLOR_MAP  = {
  'Gris Highland': 'vehiculo.colorGrisHighland',
  'Blanco': 'vehiculo.colorBlanco',
  'Negro': 'vehiculo.colorNegro',
  'Rojo': 'vehiculo.colorRojo',
  'Azul': 'vehiculo.colorAzul',
  'Plata': 'vehiculo.colorPlata',
}

export default function VehicleCharacteristics({ vehiculo, c, showIcon = true, compact = false }) {
  const { t } = useTranslation()

  const bg = c?.cardBg || '#fff'
  const border = c?.cardBorder || '#e2e8f0'
  const titleColor = c?.titleColor || 'var(--brand-secondary, #0f172a)'

  const categoria   = CAT_KEYS[vehiculo?.categoria]     ? t(CAT_KEYS[vehiculo.categoria])   : (vehiculo?.categoria || 'Económico')
  const transmision = TRANS_KEYS[vehiculo?.transmision] ? t(TRANS_KEYS[vehiculo.transmision]) : (vehiculo?.transmision || 'Manual')
  const combustible = FUEL_KEYS[vehiculo?.combustible]  ? t(FUEL_KEYS[vehiculo.combustible])  : (vehiculo?.combustible || 'Gasolina')
  const color       = COLOR_MAP[vehiculo?.color]        ? t(COLOR_MAP[vehiculo.color])      : (vehiculo?.color || 'Gris Highland')

  const items = [
    { Icono: FaTag,         label: t('vehiculo.category', 'Categoría'), value: categoria },
    { Icono: FaCar,         label: t('vehiculo.transmission', 'Transmisión'), value: transmision },
    { Icono: FaGasPump,     label: t('vehiculo.fuel', 'Combustible'), value: combustible },
    { Icono: FaUserFriends, label: t('vehiculo.capacity', 'Capacidad'), value: `${vehiculo?.pasajeros || 5} ${t('vehiculo.passengers', 'pasajeros')}` },
    { Icono: FaDoorOpen,    label: t('vehiculo.doorsLabel', 'Puertas'), value: `${vehiculo?.puertas || 5}` },
    { Icono: FaSuitcase,    label: t('vehiculo.trunk', 'Maletero'), value: `${vehiculo?.maletero || 320} L` },
    { Icono: FaBolt,        label: t('vehiculo.engine', 'Motor'), value: vehiculo?.cilindraje || '1.6L' },
    { Icono: FaPalette,     label: t('vehiculo.colorLabel', 'Color'), value: color },
    { Icono: FaCalendarAlt, label: t('vehiculo.year', 'Año'), value: `${vehiculo?.año || vehiculo?.anio || 2023}` },
    { Icono: FaIdCard,      label: t('vehiculo.plateLabel', 'Placa'), value: vehiculo?.placa || 'PQR-678' },
  ]

  return (
    <div
      style={{
        background: bg,
        padding: '22px 24px',
        borderRadius: 20,
        border: `1px solid ${border}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <FaListUl color={c?.accentText || "var(--brand-primary, #1e3a8a)"} size={14} />
        <h3 style={{ fontSize: 14, fontWeight: 800, color: titleColor, margin: 0 }}>
          {t('vehiculo.characteristics', 'Características')}
        </h3>
      </div>
      <div>
        <SpecsGrid items={items} c={c} showIcon={showIcon} compact={compact} />
      </div>
    </div>
  )
}
