import { useTranslation } from 'react-i18next'
import { useLanding } from '../../landing/LandingContext'
import { formatCurrency } from '@/utils/currencyUtils'
import { RECARGOS_LOGISTICOS } from '../../catalog/constants'

export default function ResumenLateral({ vehiculo, reserva, seguroIdx, serviciosSeleccionados = [], onEditar, onContinuar, pantalla = 1, c }) {
  const { t, i18n } = useTranslation()
  const { moneda } = useLanding();

  const editHabilitado = pantalla >= 3

  const fmt = d => {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    const fecha = new Date(parseInt(y), parseInt(m) - 1, parseInt(day));
    return fecha.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const translateLocation = (loc) => {
    if (loc === 'domicilio') return t('vehiculo.atHome', 'A Domicilio');
    if (loc === 'aeropuerto') return t('vehiculo.airport', 'Aeropuerto');
    if (loc === 'terminal') return t('vehiculo.terminal', 'Terminal');
    return loc || t('vehiculo.notSelected', 'No seleccionado');
  };

  const translateProtection = (protName) => {
    if (protName === 'Protección Obligatoria') return t('vehiculo.mandatoryProtection', 'Protección Obligatoria');
    if (protName === 'Protección Total') return t('vehiculo.totalProtection', 'Protección Total');
    return protName || t('vehiculo.noneSelected', 'Ninguna seleccionada');
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
      display: 'flex',
      flexDirection: 'column',
      background: c?.cardBg || '#ffffff',
      borderRadius: 16,
      border: `1px solid ${c?.cardBorder || 'var(--borde)'}`,
      overflow: 'hidden',
      position: 'sticky', top: 88,
      alignSelf: 'flex-start',
    }}>
      {/* Header estilo tarjeta */}
      <div style={{ padding: '24px 20px', background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: '#fff' }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'none' }}>
          {t('vehiculo.reserveSummary', 'Resumen de tu reserva')}
        </h3>
        <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>{vehiculo.nombre}</p>
      </div>

      <div style={{ padding: '20px', borderBottom: `1px solid ${c?.cardBorder || 'var(--borde)'}` }}>
        <h4 style={{ fontSize: 11, fontWeight: 800, color: c?.accentText || '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>
          {t('vehiculo.pickupLocation', 'Lugar de entrega')}
        </h4>
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: c?.textSecondary || '#64748b', textTransform: 'uppercase', margin: '0 0 4px' }}>{t('vehiculo.pickupDate', 'Fecha de Retiro')}</p>
          <p style={{ fontSize: 14, fontWeight: 800, color: c?.textPrimary || '#0f172a', margin: '0 0 2px' }}>
            {reserva.fechaInicio ? `${fmt(reserva.fechaInicio)}` : t('vehiculo.dateNotSelected', 'Fecha no seleccionada')}
          </p>
          <p style={{ fontSize: 12, color: c?.textSecondary || '#64748b', margin: 0 }}>
            {t('vehiculo.timeLabel', 'Hora de Entrega / Devolución:')} {reserva.horaInicio || '--:--'}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: c?.textSecondary || '#64748b', textTransform: 'uppercase', margin: '0 0 4px' }}>{t('vehiculo.pickupLocationLabel', 'Lugar de Retiro')}</p>
          <p style={{ fontSize: 14, fontWeight: 800, color: c?.textPrimary || '#0f172a', margin: '0' }}>
            {translateLocation(reserva.sucursalRetiro)}
          </p>
          {reserva.sucursalRetiro === 'domicilio' && (reserva.domicilioDireccion || reserva.domicilioBarrio) && (
            <p style={{ fontSize: 11, color: c?.accentText || '#2563eb', fontWeight: 700, margin: '4px 0 0', wordBreak: 'break-word', lineHeight: 1.3 }}>
              📍 {[reserva.domicilioDireccion, reserva.domicilioBarrio, reserva.domicilioCiudad].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      </div>

      <div style={{ padding: '20px', borderBottom: `1px solid ${c?.cardBorder || 'var(--borde)'}` }}>
        <h4 style={{ fontSize: 11, fontWeight: 800, color: c?.accentText || '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>
          {t('vehiculo.returnLocation', 'Lugar de devolución')}
        </h4>
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: c?.textSecondary || '#64748b', textTransform: 'uppercase', margin: '0 0 4px' }}>{t('vehiculo.returnDate', 'Fecha de Devolución')}</p>
          <p style={{ fontSize: 14, fontWeight: 800, color: c?.textPrimary || '#0f172a', margin: '0 0 2px' }}>
            {reserva.fechaFin ? `${fmt(reserva.fechaFin)}` : t('vehiculo.dateNotSelected', 'Fecha no seleccionada')}
          </p>
          <p style={{ fontSize: 12, color: c?.textSecondary || '#64748b', margin: 0 }}>
            {t('vehiculo.timeLabel', 'Hora de Entrega / Devolución:')} {reserva.horaFin || '--:--'}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: c?.textSecondary || '#64748b', textTransform: 'uppercase', margin: '0 0 4px' }}>{t('vehiculo.returnLocationLabel', 'Lugar de Devolución')}</p>
          <p style={{ fontSize: 14, fontWeight: 800, color: c?.textPrimary || '#0f172a', margin: '0' }}>
            {translateLocation(reserva.sucursalDevolucion)}
          </p>
          {reserva.sucursalDevolucion === 'domicilio' && (reserva.domicilioDireccion || reserva.domicilioBarrio) && (
            <p style={{ fontSize: 11, color: c?.accentText || '#2563eb', fontWeight: 700, margin: '4px 0 0', wordBreak: 'break-word', lineHeight: 1.3 }}>
              📍 {[reserva.domicilioDireccion, reserva.domicilioBarrio, reserva.domicilioCiudad].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      </div>

      <div style={{ padding: '20px', borderBottom: `1px solid ${c?.cardBorder || 'var(--borde)'}` }}>
        <h4 style={{ fontSize: 11, fontWeight: 800, color: c?.accentText || '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>
          {t('vehiculo.protectionExtras', 'Tu protección y extras')}
        </h4>
        
        {/* Protecciones */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: c?.textSecondary || '#64748b', textTransform: 'uppercase', margin: '0 0 4px' }}>{t('vehiculo.protections', 'Protecciones')}</p>
          <p style={{ fontSize: 14, fontWeight: 800, color: c?.textPrimary || '#0f172a', margin: '0' }}>
            {translateProtection(seguroIdx !== null ? vehiculo.seguros[seguroIdx]?.nombre : null)}
          </p>
        </div>
        
        {/* Kilometraje */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: c?.textSecondary || '#64748b', textTransform: 'uppercase', margin: '0 0 4px' }}>{t('vehiculo.mileageType', 'Tipo de kilometraje')}</p>
          <p style={{ fontSize: 14, fontWeight: 800, color: c?.textPrimary || '#0f172a', margin: '0' }}>
            {reserva.tipoKm === 'ilimitado' ? t('vehiculo.unlimited', 'Ilimitado') : (reserva.tipoKm === 'limitado' ? t('vehiculo.limited', 'Limitado') : t('vehiculo.notSelected', 'No seleccionado'))}
          </p>
        </div>
        
        {/* Servicios adicionales */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: c?.textSecondary || '#64748b', textTransform: 'uppercase', margin: 0 }}>{t('vehiculo.additionalServices', 'Servicios adicionales')}</p>
            {editHabilitado && (
              <button onClick={() => onEditar('servicios')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: c?.accentText || '#2563eb', fontWeight: 700, padding: 0 }}>
                {t('vehiculo.edit', 'Editar')}
              </button>
            )}
          </div>
          <p style={{ fontSize: 13, color: c?.textPrimary || '#0f172a', fontWeight: serviciosElegidos.length > 0 ? 800 : 400, margin: 0 }}>
            {serviciosElegidos.length > 0 ? formatCurrency(subtotalServicios, moneda) : t('vehiculo.noneSelected', 'Ninguno seleccionado')}
          </p>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <h4 style={{ fontSize: 11, fontWeight: 800, color: c?.textPrimary || '#0f172a', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 16px' }}>
          {t('vehiculo.fareBreakdown', 'Desglose de tarifa')}
        </h4>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: c?.textSecondary || '#64748b', marginBottom: 12 }}>
          <span>{reserva.tipoKm === 'ilimitado' ? t('vehiculo.unlimitedKm', 'Kilometraje ilimitado') : t('vehiculo.limitedKm', 'Kilometraje limitado')}</span>
          <span style={{ fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>{formatCurrency(subtotalDiario, moneda)}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: c?.textSecondary || '#64748b', marginBottom: 12 }}>
          <span>{translateProtection(seguroIdx !== null && vehiculo.seguros[seguroIdx] ? vehiculo.seguros[seguroIdx].nombre : null)}</span>
          <span style={{ fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>{subtotalSeguro > 0 ? formatCurrency(subtotalSeguro, moneda) : '-'}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: c?.textSecondary || '#64748b', marginBottom: 12 }}>
          <span>{t('vehiculo.additionalServices', 'Servicios adicionales')}</span>
          <span style={{ fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>{subtotalServicios > 0 ? formatCurrency(subtotalServicios, moneda) : '—'}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: c?.textSecondary || '#64748b', marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${c?.cardBorder || 'var(--borde)'}` }}>
          <span>{t('vehiculo.adminCharges', 'Cargos administrativos (10%)')}</span>
          <span style={{ fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>{formatCurrency(cargosAdmin, moneda)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: c?.textSecondary || '#64748b', marginBottom: 20 }}>
          <span>{t('vehiculo.vat', 'IVA (19%)')}</span>
          <span style={{ fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>{formatCurrency(iva, moneda)}</span>
        </div>

        {/* Total Box */}
        <div style={{ background: c?.subCardBg || '#f8fafc', border: `1px solid ${c?.cardBorder || '#e2e8f0'}`, borderRadius: 12, padding: '16px' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: c?.accentText || '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>
            {t('vehiculo.finalTotal', 'Total Final')}
          </p>
          <p style={{ fontSize: 24, fontWeight: 900, color: c?.accentText || '#1e3a8a', margin: '0 0 6px' }}>
            {formatCurrency(total, moneda)}
          </p>
          <p style={{ fontSize: 10, color: c?.textSecondary || '#64748b', margin: 0 }}>
            {t('vehiculo.totalIncludesVat', 'El total final incluye IVA y cargos adicionales')}
          </p>
        </div>
        
        {pantalla < 3 && (
           <div style={{ marginTop: 20 }}>
              <button 
                onClick={onContinuar}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: '#fff', borderRadius: 12, border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                {t('common.continue', 'Continuar')}
              </button>
           </div>
        )}
      </div>
    </aside>
  );
}