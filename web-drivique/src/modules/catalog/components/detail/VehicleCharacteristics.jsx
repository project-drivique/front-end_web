import { useTranslation } from 'react-i18next'
import { FaCar, FaGasPump, FaUserFriends, FaDoorOpen, FaSuitcase, FaBolt, FaPalette, FaCalendarAlt, FaListUl } from 'react-icons/fa'
import DetailSection from './DetailSection'
import SpecsGrid from './SpecsGrid'

const TRANS_KEYS = { 'Automática': 'catalogo.transAuto', 'Manual': 'catalogo.transManual' }
const FUEL_KEYS  = { 'Gasolina': 'catalogo.fuelGas', 'Diesel': 'catalogo.fuelDiesel', 'Híbrido': 'catalogo.fuelHybrid', 'Eléctrico': 'catalogo.fuelElec' }

export default function VehicleCharacteristics({ vehiculo }) {
  const { t } = useTranslation()

  const transmision = TRANS_KEYS[vehiculo.transmision] ? t(TRANS_KEYS[vehiculo.transmision]) : vehiculo.transmision
  const combustible = FUEL_KEYS[vehiculo.combustible]  ? t(FUEL_KEYS[vehiculo.combustible])  : vehiculo.combustible

  const items = [
    { Icono: FaCar,         label: t('vehiculo.transmission', 'Transmisión'), value: transmision },
    { Icono: FaGasPump,     label: t('vehiculo.fuel', 'Combustible'), value: combustible },
    { Icono: FaUserFriends, label: t('vehiculo.capacity', 'Capacidad'), value: `${vehiculo.pasajeros} ${t('vehiculo.passengers')}` },
    { Icono: FaDoorOpen,    label: t('vehiculo.doorsLabel', 'Puertas'), value: `${vehiculo.puertas}` },
    { Icono: FaSuitcase,    label: t('vehiculo.trunk'), value: `${vehiculo.maletero} L` },
    { Icono: FaBolt,        label: t('vehiculo.engine', 'Motor'), value: vehiculo.cilindraje },
    { Icono: FaPalette,     label: t('vehiculo.colorLabel', 'Color'), value: vehiculo.color },
    { Icono: FaCalendarAlt, label: t('vehiculo.year'), value: `${vehiculo.año}` },
  ]

  return (
    <DetailSection icon={<FaListUl size={12} />} title={t('vehiculo.characteristics')}>
      <SpecsGrid items={items} />
    </DetailSection>
  )
}