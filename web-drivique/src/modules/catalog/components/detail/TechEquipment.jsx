import { useTranslation } from 'react-i18next'
import * as FaIcons from 'react-icons/fa'
import { FaMicrochip } from 'react-icons/fa'

export default function TechEquipment({ equipamiento = [] }) {
  const { t } = useTranslation()

  if (!equipamiento.length) return null

  return (
    <div style={{ background: 'var(--bg-tarjeta)', border: '1px solid var(--borde)', borderRadius: 14, padding: '18px 20px' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--texto-second)', margin: '0 0 12px' }}>
        {t('vehiculo.techEquipment')}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
        {equipamiento.map((item, i) => {
          const Icono = FaIcons[item.icono] || FaMicrochip
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-item)', border: '1px solid var(--borde)', borderRadius: 10, padding: '10px 12px', minHeight: 48 }}>
              <Icono size={15} color="var(--texto-second)" />
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--texto-primary)' }}>{item.nombre}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}