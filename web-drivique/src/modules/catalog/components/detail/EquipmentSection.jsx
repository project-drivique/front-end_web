import { useTranslation } from 'react-i18next'
import * as FaIcons from 'react-icons/fa'
import { FaCheckCircle, FaSlidersH } from 'react-icons/fa'
import DetailSection from './DetailSection'
import IconChipGrid from './IconChipGrid'

export default function EquipmentSection({ caracteristicas = [], equipamiento = [] }) {
  const { t } = useTranslation()

  const items = [
    ...caracteristicas.map(item => ({ Icono: FaIcons[item.icono] || FaCheckCircle, l: item.nombre, color: '#2563eb' })),
    ...equipamiento.map(item => ({ Icono: FaIcons[item.icono] || FaCheckCircle, l: item.nombre, color: '#2563eb' })),
  ]

  return (
    <DetailSection icon={<FaSlidersH size={12} />} title={t('vehiculo.equipmentComfort', 'Equipamiento y confort')}>
      <IconChipGrid items={items} />
    </DetailSection>
  )
}