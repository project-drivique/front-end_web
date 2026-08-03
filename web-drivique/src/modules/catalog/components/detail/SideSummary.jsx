import { useTranslation } from 'react-i18next'
import { useLanding } from '../../../landing/LandingContext'
import { formatCurrency } from '@/utils/currencyUtils'
import { RECARGOS_LOGISTICOS } from '../../constants'

const IcoEdit = () => (
  <svg width="13" height="13" fill="none" stroke="#1e3a8a" strokeWidth="2.2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
  </svg>
)

export default function ResumenLateral({ vehiculo, reserva, seguroIdx, serviciosSeleccionados = [], onEditar }) {
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
  const serviciosElegidos = (vehiculo.servicios || []).filter(s => serviciosSeleccionados.includes(s.nombre));
  const precioServicios = serviciosElegidos.reduce((suma, s) => suma + s.precio, 0);

  const subtotalDiario = precio * dias;
  const subtotalSeguro = precioSeguro * dias;
  const subtotalServicios = precioServicios * dias;
  const cargosAdmin = Math.round((subtotalDiario + subtotalSeguro + subtotalServicios) * 0.10);

  const recargoRetiro = RECARGOS_LOGISTICOS[reserva.sucursalRetiro] || 0;
  const recargoDevolucion = RECARGOS_LOGISTICOS[reserva.sucursalDevolucion] || 0;
  const recargoLogistico = recargoRetiro + recargoDevolucion;

  const subtotalReserva = subtotalDiario + subtotalSeguro + subtotalServicios + cargosAdmin;
  const subtotalPreIva = subtotalReserva + recargoLogistico;
  const iva = Math.round(subtotalPreIva * 0.19);
  const total = subtotalPreIva + iva;

  return (
    <aside className="detalle-resumen-lateral" style={{
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
              <IcoEdit /> {reserva.fechaInicio ? t('common.edit') : t('common.select')}
            </button>
          </div>
          <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--texto-primary)', margin: '0 0 4px' }}>
            {reserva.fechaInicio ? `${fmt(reserva.fechaInicio)}` : t('vehiculo.dateNotSelected')}
          </p>
          <p style={{ fontSize: 12, color: 'var(--texto-second)', margin: 0 }}>
            {reserva.sucursalRetiro === 'domicilio' ? t('vehiculo.deliveryHome') : (reserva.sucursalRetiro || 'Lugar no seleccionado')} — {reserva.horaInicio || 'Hora no seleccionada'}
          </p>
          {reserva.sucursalRetiro === 'domicilio' && (reserva.domicilioDireccion || reserva.domicilioBarrio) && (
            <p style={{ fontSize: 11, color: '#2563eb', fontWeight: 700, margin: '4px 0 0', wordBreak: 'break-word', lineHeight: 1.3 }}>
              📍 {[reserva.domicilioDireccion, reserva.domicilioBarrio, reserva.domicilioCiudad].filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        <div style={{ padding: '16px 0', borderBottom: '1px solid var(--borde)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{t('vehiculo.returnSummary')}</span>
            <button onClick={() => onEditar('devolucion')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2563eb', fontWeight: 700, padding: 0 }}>
              <IcoEdit /> {reserva.fechaFin ? t('common.edit') : t('common.select')}
            </button>
          </div>
          <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--texto-primary)', margin: '0 0 4px' }}>
            {reserva.fechaFin ? `${fmt(reserva.fechaFin)}` : t('vehiculo.dateNotSelected')}
          </p>
          <p style={{ fontSize: 12, color: 'var(--texto-second)', margin: 0 }}>
            {reserva.sucursalDevolucion === 'domicilio' ? t('vehiculo.returnHome') : (reserva.sucursalDevolucion || 'Lugar no seleccionado')} — {reserva.horaFin || 'Hora no seleccionada'}
          </p>
          {reserva.sucursalDevolucion === 'domicilio' && (reserva.domicilioDireccion || reserva.domicilioBarrio) && (
            <p style={{ fontSize: 11, color: '#2563eb', fontWeight: 700, margin: '4px 0 0', wordBreak: 'break-word', lineHeight: 1.3 }}>
              📍 {[reserva.domicilioDireccion, reserva.domicilioBarrio, reserva.domicilioCiudad].filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        <div style={{ padding: '16px 0', borderBottom: '1px solid var(--borde)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Tu Protección y Extras</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => onEditar('servicios')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2563eb', fontWeight: 700, padding: 0 }}>
                <IcoEdit /> {t('vehiculo.extraServices')}
              </button>
              <button onClick={() => onEditar('grupo')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2563eb', fontWeight: 700, padding: 0 }}>
                <IcoEdit /> {t('common.edit')}
              </button>
            </div>
          </div>
          <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--texto-primary)', margin: '0 0 4px' }}>{vehiculo.categoria} — {vehiculo.transmision}</p>
          {reserva.tipoKm ? (
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700, marginTop: 4,
              padding: '4px 12px', borderRadius: 9999,
              background: reserva.tipoKm === 'ilimitado' ? '#ecfdf5' : '#eff6ff',
              color: reserva.tipoKm === 'ilimitado' ? '#059669' : '#1e3a8a',
              border: `1px solid ${reserva.tipoKm === 'ilimitado' ? '#bbf7d0' : '#bfdbfe'}`,
            }}>
              {reserva.tipoKm === 'ilimitado' ? `∞ ${t('catalogo.unlimitedKm')}` : `${kmLimit.km} km/día ${t('catalogo.limitedKm')}`}
            </span>
          ) : (
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700, marginTop: 4,
              padding: '4px 12px', borderRadius: 9999,
              background: 'var(--bg-item)',
              color: '#64748b',
              border: '1px solid #e2e8f0',
            }}>
              Tipo de km no seleccionado
            </span>
          )}
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
          {seguroIdx !== null ? (
            <>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--texto-second)', margin: '0 0 4px' }}>{t('vehiculo.protectionsLabel')}</p>
              <div style={{ fontSize: 12, color: 'var(--texto-primary)', marginBottom: 4 }}>{vehiculo.seguros[seguroIdx]?.nombre}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 12 }}>
                <span style={{ color: 'var(--texto-primary)' }}>{dias} {t('vehiculo.daysCount')} × {formatCurrency(precioSeguro, moneda)}</span>
                <span style={{ fontWeight: 800, color: 'var(--texto-primary)' }}>{formatCurrency(subtotalSeguro, moneda)}</span>
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--texto-second)', margin: '0 0 4px' }}>{t('vehiculo.protectionsLabel')}</p>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12, fontStyle: 'italic' }}>Protección no seleccionada</div>
            </>
          )}
          {serviciosElegidos.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--texto-second)', margin: 0 }}>{t('vehiculo.extraServices')}</p>
                <button onClick={() => onEditar('servicios')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2563eb', fontWeight: 700, padding: 0 }}>
                  <IcoEdit /> {t('common.edit')}
                </button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--texto-primary)', marginBottom: 4 }}>{serviciosElegidos.map(s => s.nombre).join(', ')}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 12 }}>
                <span style={{ color: 'var(--texto-primary)' }}>{dias} {t('vehiculo.daysCount')} × {formatCurrency(precioServicios, moneda)}</span>
                <span style={{ fontWeight: 800, color: 'var(--texto-primary)' }}>{formatCurrency(subtotalServicios, moneda)}</span>
              </div>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingBottom: 10 }}>
            <span style={{ color: 'var(--texto-primary)' }}>{t('vehiculo.adminChargesLabel')}</span>
            <span style={{ fontWeight: 800, color: 'var(--texto-primary)' }}>{formatCurrency(cargosAdmin, moneda)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingBottom: 10 }}>
            <span style={{ color: 'var(--texto-primary)' }}>Subtotal Reserva</span>
            <span style={{ fontWeight: 800, color: 'var(--texto-primary)' }}>{formatCurrency(subtotalReserva, moneda)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingBottom: 10, flexWrap: 'wrap', gap: 4 }}>
            <span style={{ color: 'var(--texto-primary)' }}>Recargo Logístico</span>
            <span style={{ fontWeight: 800, color: 'var(--texto-primary)' }}>{formatCurrency(recargoLogistico, moneda)}</span>
            {recargoLogistico > 0 && (
              <span style={{ fontSize: 10, color: 'var(--texto-second)', width: '100%', display: 'block', textAlign: 'left' }}>
                ({reserva.sucursalRetiro === 'domicilio' || reserva.sucursalRetiro === 'aeropuerto' || reserva.sucursalRetiro === 'terminal' ? `${reserva.sucursalRetiro}: ${formatCurrency(recargoRetiro, moneda)}` : ''}
                {recargoDevolucion > 0 ? ` + devoluc. ${reserva.sucursalDevolucion}: ${formatCurrency(recargoDevolucion, moneda)}` : ''})
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingBottom: 14, borderBottom: '1px solid var(--borde)', marginBottom: 14 }}>
            <span style={{ color: 'var(--texto-primary)' }}>IVA (19%)</span>
            <span style={{ fontWeight: 800, color: 'var(--texto-primary)' }}>{formatCurrency(iva, moneda)}</span>
          </div>

          <div style={{ background: 'var(--bg-item)', borderRadius: 16, padding: '16px', border: '1px solid var(--borde)' }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 4px' }}>Total Final</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: '#1e3a8a', margin: 0 }}>{formatCurrency(total, moneda)}</p>
            <p style={{ fontSize: 10, color: 'var(--texto-second)', margin: '6px 0 0' }}>{t('vehiculo.totalIncludesTaxes')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}