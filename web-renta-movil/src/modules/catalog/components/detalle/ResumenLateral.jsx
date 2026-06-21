import { useTranslation } from 'react-i18next'
import { useLanding } from '../../../landing/LandingContext'
import { formatCurrency } from '@/utils/monedaUtils'

const IcoEdit = () => (
  <svg width="13" height="13" fill="none" stroke="#1e3a8a" strokeWidth="2.2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/>
  </svg>
)

export default function ResumenLateral({ vehiculo, reserva, seguroIdx, onEditar }) {
  const { t, i18n } = useTranslation()
  const { moneda } = useLanding();

  const fmt = d => {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    const fecha = new Date(parseInt(y), parseInt(m) - 1, parseInt(day));
    return fecha.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' });
  };
  if (!vehiculo) return null;

  const tarifas = vehiculo.tarifas || {};
  const kmLimit = tarifas.kmLimitado || { precio: 0, km: 0 };
  const kmIlimit = tarifas.kmIlimitado || { precio: 0 };

  const precio = reserva.tipoKm === 'ilimitado' ? kmIlimit.precio : kmLimit.precio;

  const dias = reserva.fechaInicio && reserva.fechaFin
    ? Math.max(1, Math.ceil((new Date(reserva.fechaFin) - new Date(reserva.fechaInicio)) / 86400000))
    : 1;

  const precioSeguro = seguroIdx !== null ? (vehiculo.seguros[seguroIdx]?.precio ?? 0) : 0;
  const subtotalDiario = precio * dias;
  const subtotalSeguro = precioSeguro * dias;
  const cargosAdmin = Math.round((subtotalDiario + subtotalSeguro) * 0.10);
  const total = subtotalDiario + subtotalSeguro + cargosAdmin;

  return (
    <aside style={{
      width: 320, flexShrink: 0,
      background: 'var(--bg-tarjeta)', borderRadius: 24,
      border: '1px solid var(--borde)',
      boxShadow: '0 12px 36px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      position: 'sticky', top: 88,
      alignSelf: 'flex-start',
    }}>
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', padding: '18px 24px' }}>
        <p style={{ color: '#bfdbfe', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 4px' }}>{t('vehiculo.reserveSummary')}</p>
        <p style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>{vehiculo.nombre}</p>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ padding: '16px 0', borderBottom: '1px solid var(--borde)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{t('vehiculo.pickupLocation')}</span>
            <button onClick={() => onEditar('retiro')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2563eb', fontWeight: 700, padding: 0 }}>
              <IcoEdit /> {t('common.edit')}
            </button>
          </div>
          <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--texto-primary)', margin: '0 0 4px' }}>
            {reserva.fechaInicio ? `${fmt(reserva.fechaInicio)}` : t('vehiculo.dateNotSelected')}
          </p>
          <p style={{ fontSize: 12, color: 'var(--texto-second)', margin: 0 }}>
            {reserva.sucursalRetiro || 'Centro'} — {reserva.horaInicio || '09:00'}
          </p>
        </div>

        <div style={{ padding: '16px 0', borderBottom: '1px solid var(--borde)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{t('vehiculo.returnSummary')}</span>
            <button onClick={() => onEditar('devolucion')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2563eb', fontWeight: 700, padding: 0 }}>
              <IcoEdit /> {t('common.edit')}
            </button>
          </div>
          <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--texto-primary)', margin: '0 0 4px' }}>
            {reserva.fechaFin ? `${fmt(reserva.fechaFin)}` : t('vehiculo.dateNotSelected')}
          </p>
          <p style={{ fontSize: 12, color: 'var(--texto-second)', margin: 0 }}>
            {reserva.sucursalDevolucion || 'Centro'} — {reserva.horaFin || '09:00'}
          </p>
        </div>

        <div style={{ padding: '16px 0', borderBottom: '1px solid var(--borde)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{t('vehiculo.group')}</span>
            <button onClick={() => onEditar('km')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2563eb', fontWeight: 700, padding: 0 }}>
              <IcoEdit /> {t('common.edit')}
            </button>
          </div>
          <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--texto-primary)', margin: '0 0 4px' }}>{vehiculo.categoria} — {vehiculo.transmision}</p>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, marginTop: 4,
            padding: '4px 12px', borderRadius: 9999,
            background: reserva.tipoKm === 'ilimitado' ? '#ecfdf5' : '#eff6ff',
            color: reserva.tipoKm === 'ilimitado' ? '#059669' : '#1e3a8a',
            border: `1px solid ${reserva.tipoKm === 'ilimitado' ? '#bbf7d0' : '#bfdbfe'}`,
          }}>
            {reserva.tipoKm === 'ilimitado' ? `∞ ${t('catalogo.unlimitedKm')}` : `${kmLimit.km} km/día ${t('catalogo.limitedKm')}`}
          </span>
        </div>

        <div style={{ paddingTop: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--texto-primary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>{t('vehiculo.standardOffer')}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, color: 'var(--texto-second)', marginBottom: 6 }}>
            <span>{t('vehiculo.dailyLabel')}</span><span>{t('vehiculo.total')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 12 }}>
            <span style={{ color: 'var(--texto-primary)' }}>{dias} {t('vehiculo.daysCount')} × {formatCurrency(precio, moneda)}</span>
            <span style={{ fontWeight: 800, color: 'var(--texto-primary)' }}>{formatCurrency(subtotalDiario, moneda)}</span>
          </div>
          {seguroIdx !== null && (
            <>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--texto-second)', margin: '0 0 4px' }}>{t('vehiculo.protectionsLabel')}</p>
              <div style={{ fontSize: 12, color: 'var(--texto-primary)', marginBottom: 4 }}>{vehiculo.seguros[seguroIdx]?.nombre}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 12 }}>
                <span style={{ color: 'var(--texto-primary)' }}>{dias} {t('vehiculo.daysCount')} × {formatCurrency(precioSeguro, moneda)}</span>
                <span style={{ fontWeight: 800, color: 'var(--texto-primary)' }}>{formatCurrency(subtotalSeguro, moneda)}</span>
              </div>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingBottom: 14, borderBottom: '1px solid var(--borde)', marginBottom: 14 }}>
            <span style={{ color: 'var(--texto-primary)' }}>{t('vehiculo.adminChargesLabel')}</span>
            <span style={{ fontWeight: 800, color: 'var(--texto-primary)' }}>{formatCurrency(cargosAdmin, moneda)}</span>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 16, padding: '16px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 4px' }}>{t('vehiculo.expectedTotal')}</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: '#1e3a8a', margin: 0 }}>{formatCurrency(total, moneda)}</p>
            <p style={{ fontSize: 10, color: 'var(--texto-second)', margin: '6px 0 0' }}>{t('vehiculo.totalIncludesTaxes')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
