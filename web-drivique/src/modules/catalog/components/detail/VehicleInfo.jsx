import { useTranslation } from 'react-i18next';
import { useLanding } from '../../../landing/LandingContext';
import { formatCurrency } from '@/utils/currencyUtils';

export default function InfoVehiculo({ vehiculo }) {
  const { t } = useTranslation()
  const { moneda } = useLanding();

  return (
    <div style={{ background: 'var(--bg-tarjeta)', borderRadius: 14, border: '1px solid var(--borde)', overflow: 'hidden', marginBottom: 18 }}>
      <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#1e3a8a', background: '#eff6ff', padding: '3px 9px', borderRadius: 6 }}>
            {vehiculo.categoria}
          </span>
          <h2 className="info-vehiculo-nombre" style={{ fontSize: 20, fontWeight: 800, color: 'var(--texto-primary)', margin: 0 }}>
            {vehiculo.nombre}
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--texto-primary)' }}>{formatCurrency(vehiculo.precio, moneda)}</span>
          <span style={{ fontSize: 12, color: 'var(--texto-second)' }}>/{t('catalogo.day')}</span>
        </div>
      </div>
    </div>
  );
}