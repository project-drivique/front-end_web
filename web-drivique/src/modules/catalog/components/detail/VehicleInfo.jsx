import { useTranslation } from 'react-i18next';
import { useLanding } from '../../../landing/LandingContext';
import { formatCurrency } from '@/utils/currencyUtils';

export default function InfoVehiculo({ vehiculo }) {
  const { t } = useTranslation()
  const { moneda } = useLanding();

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      flexWrap: 'wrap', gap: 12, paddingBottom: 18, borderBottom: '1px solid var(--borde)',
    }}>
      <div>
        <span style={{
          display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#1e3a8a',
          background: '#eff6ff', padding: '4px 10px', borderRadius: 6, marginBottom: 8,
        }}>
          {vehiculo.categoria}
        </span>
        <h1 style={{ fontSize: 23, fontWeight: 800, color: 'var(--texto-primary)', margin: 0, lineHeight: 1.2 }}>
          {vehiculo.nombre}
        </h1>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: 25, fontWeight: 800, color: 'var(--texto-primary)' }}>{formatCurrency(vehiculo.precio, moneda)}</span>
        <span style={{ fontSize: 13, color: 'var(--texto-second)' }}> /{t('catalogo.day')}</span>
      </div>
    </div>
  );
}