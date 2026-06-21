import { useTranslation } from 'react-i18next';
import { FaCar, FaSuitcase, FaBolt, FaPalette, FaCalendarAlt, FaSnowflake, FaRegHeart } from 'react-icons/fa';
import { useLanding } from '../../../landing/LandingContext';
import { formatCurrency } from '@/utils/monedaUtils';

const TRANS_KEYS = { 'Automática': 'catalogo.transAuto', 'Manual': 'catalogo.transManual' }
const FUEL_KEYS  = { 'Gasolina': 'catalogo.fuelGas', 'Diesel': 'catalogo.fuelDiesel', 'Híbrido': 'catalogo.fuelHybrid', 'Eléctrico': 'catalogo.fuelElec' }

export default function InfoVehiculo({ vehiculo }) {
  const { t } = useTranslation()
  const { moneda } = useLanding();

  const transmision = TRANS_KEYS[vehiculo.transmision] ? t(TRANS_KEYS[vehiculo.transmision]) : vehiculo.transmision
  const combustible = FUEL_KEYS[vehiculo.combustible]  ? t(FUEL_KEYS[vehiculo.combustible])  : vehiculo.combustible

  return (
    <div style={{ background: 'var(--bg-tarjeta)', borderRadius: 20, border: '1px solid var(--borde)', overflow: 'hidden', marginBottom: 28, boxShadow: 'var(--sombra-tarjeta)' }}>
      <div style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#1e3a8a', background: '#eff6ff', padding: '3px 9px', borderRadius: 6, marginBottom: 6, display: 'inline-block' }}>
              {vehiculo.categoria}
            </span>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--texto-primary)', margin: '4px 0 6px' }}>
              {vehiculo.nombre}
            </h2>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--texto-primary)' }}><FaCar style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--texto-second)' }} /> {transmision}</span>
              <span style={{ fontSize: 12, color: 'var(--texto-primary)' }}><FaBolt style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--texto-second)' }} /> {combustible}</span>
              <span style={{ fontSize: 12, color: 'var(--texto-primary)' }}><FaRegHeart style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--texto-second)' }} /> {vehiculo.pasajeros} {t('vehiculo.passengers')}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--texto-primary)' }}>{formatCurrency(vehiculo.precio, moneda)}</span>
            <span style={{ fontSize: 12, color: 'var(--texto-second)' }}>/{t('catalogo.day')}</span>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
          {[
            { Icono: FaCar, l: `${vehiculo.puertas} ${t('vehiculo.doors')}` },
            { Icono: FaSuitcase, l: `${vehiculo.maletero}L ${t('vehiculo.trunk')}` },
            { Icono: FaBolt, l: vehiculo.cilindraje },
            { Icono: FaPalette, l: vehiculo.color },
            { Icono: FaCalendarAlt, l: `${t('vehiculo.year')} ${vehiculo.año}` },
            { Icono: FaSnowflake, l: t('vehiculo.airConditioning') },
          ].map((c, i) => (
            <div key={i} style={{ background: 'var(--bg-item)', borderRadius: 10, padding: '10px', border: '1px solid var(--borde)', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 200ms ease' }}>
              <span style={{ fontSize: 16, color: '#2563eb' }}>
                <c.Icono />
              </span>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--texto-primary)' }}>{c.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
