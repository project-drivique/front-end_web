import { useTranslation } from 'react-i18next'
import * as FaIcons from 'react-icons/fa'
import { FaCar, FaSuitcase, FaBolt, FaPalette, FaCalendarAlt, FaSnowflake, FaRegHeart, FaCheckCircle, FaListUl } from 'react-icons/fa'

const TRANS_KEYS = { 'Automática': 'catalogo.transAuto', 'Manual': 'catalogo.transManual' }
const FUEL_KEYS  = { 'Gasolina': 'catalogo.fuelGas', 'Diesel': 'catalogo.fuelDiesel', 'Híbrido': 'catalogo.fuelHybrid', 'Eléctrico': 'catalogo.fuelElec' }

export default function VehicleCharacteristics({ vehiculo, caracteristicas = [] }) {
  const { t } = useTranslation()

  const transmision = TRANS_KEYS[vehiculo.transmision] ? t(TRANS_KEYS[vehiculo.transmision]) : vehiculo.transmision
  const combustible = FUEL_KEYS[vehiculo.combustible]  ? t(FUEL_KEYS[vehiculo.combustible])  : vehiculo.combustible

  const items = [
    { Icono: FaCar,        l: transmision },
    { Icono: FaBolt,       l: combustible },
    { Icono: FaRegHeart,   l: `${vehiculo.pasajeros} ${t('vehiculo.passengers')}` },
    { Icono: FaCar,        l: `${vehiculo.puertas} ${t('vehiculo.doors')}` },
    { Icono: FaSuitcase,   l: `${vehiculo.maletero}L ${t('vehiculo.trunk')}` },
    { Icono: FaBolt,       l: vehiculo.cilindraje },
    { Icono: FaPalette,    l: vehiculo.color },
    { Icono: FaCalendarAlt, l: `${t('vehiculo.year')} ${vehiculo.año}` },
    { Icono: FaSnowflake,  l: t('vehiculo.airConditioning') },
    ...caracteristicas.map(item => ({ Icono: FaIcons[item.icono] || FaCheckCircle, l: item.nombre })),
  ]

  return (
    <div style={{ background: 'var(--bg-tarjeta)', border: '1px solid var(--borde)', borderRadius: 14, padding: '18px 20px', height: '100%' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--texto-second)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <FaListUl size={15} /> {t('vehiculo.characteristics')}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: 10,
      }}>
        {items.map((c, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--bg-item)',
              border: '1px solid var(--borde)',
              borderRadius: 10,
              padding: '10px 12px',
              minHeight: 48,
            }}
          >
            <span style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(37,99,235,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <c.Icono size={13} color="#2563eb" />
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--texto-primary)', lineHeight: 1.25 }}>{c.l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}