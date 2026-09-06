import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanding } from '../../landing/LandingContext'
import { formatCurrency } from '@/utils/currencyUtils'
import { RECARGOS_LOGISTICOS } from '../../catalog/constants'
import { FaTicketAlt, FaTrashAlt } from 'react-icons/fa'
import { promotionManagementService } from '@/services/promotionManagementService'

const formatearFechaExp = (fechaStr) => {
  if (!fechaStr) return '';
  try {
    const parts = fechaStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${day} de ${meses[monthIdx] || parts[1]} de ${year}`;
    }
    const d = new Date(fechaStr + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return fechaStr;
  }
};

export default function ResumenLateral({
  vehiculo,
  reserva,
  seguroIdx,
  serviciosSeleccionados = [],
  onEditar,
  onContinuar,
  pantalla = 1,
  c,
  appliedPromotion,
  onApplyPromotion,
  onRemovePromotion
}) {
  const { t, i18n } = useTranslation()
  const { moneda } = useLanding();
  const [codigoCupon, setCodigoCupon] = useState('')
  const [promoError, setPromoError] = useState('')
  const [promoAlert, setPromoAlert] = useState('')
  const [modalCupones, setModalCupones] = useState(false)
  const [viewingCondicionesPromo, setViewingCondicionesPromo] = useState(null)

  const [cuponesDisponibles, setCuponesDisponibles] = useState(() => {
    try {
      return promotionManagementService.listPublishedForVehicle(vehiculo, null) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        setCuponesDisponibles(promotionManagementService.listPublishedForVehicle(vehiculo, null) || []);
      } catch {
        setCuponesDisponibles([]);
      }
    };
    handleUpdate();
    window.addEventListener(promotionManagementService.eventName, handleUpdate);
    return () => window.removeEventListener(promotionManagementService.eventName, handleUpdate);
  }, [vehiculo]);

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

  const precio = reserva.tipoKm === 'ilimitado'
    ? kmIlimit.precio
    : (reserva.tipoKm === 'limitado' ? kmLimit.precio : (vehiculo.precio || kmLimit.precio || 0));

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
  const discount = appliedPromotion
    ? Math.min(total, appliedPromotion.tipoDescuento === 'porcentaje' ? Math.round(total * appliedPromotion.valorDescuento / 100) : appliedPromotion.valorDescuento)
    : 0
  const finalTotal = total - discount

  const getErrorMessage = (err) => {
    const code = err?.message;
    if (code === 'notFound' || code === 'expired' || code === 'inactive' || code === 'notStarted') {
      return t('promotions.validation.notFoundOrExpired', 'El código ingresado no existe o ya expiró.');
    }
    if (code === 'minimum') {
      return t('promotions.validation.minimum', 'El monto de la reserva no alcanza el mínimo requerido para este cupón.');
    }
    if (code === 'category' || code === 'vehicleMismatch') {
      return t('promotions.validation.vehicleMismatch', 'Este cupón no aplica para el vehículo seleccionado.');
    }
    if (code === 'audience') {
      return t('promotions.validation.audience', 'Tu usuario no cumple las condiciones para aplicar este cupón.');
    }
    return t('promotions.validation.notFoundOrExpired', 'El código ingresado no existe o ya expiró.');
  };

  const handleAplicarCupon = () => {
    setPromoAlert('');
    if (!codigoCupon.trim() || !onApplyPromotion) return;
    try {
      onApplyPromotion(codigoCupon.trim().toUpperCase());
      setPromoError('');
    } catch (error) {
      setPromoError(getErrorMessage(error));
    }
  };

  return (
    <>
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
        <div style={{ padding: '24px 20px', background: 'var(--brand-gradient)', color: 'var(--brand-on-primary)' }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'none' }}>
            {t('vehiculo.reserveSummary', 'Resumen de tu reserva')}
          </h3>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>{vehiculo.nombre}</p>
        </div>

        {/* ── Fechas y Lugares ── */}
        <div style={{ padding: '20px', borderBottom: `1px solid ${c?.cardBorder || 'var(--borde)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ fontSize: 11, fontWeight: 800, color: c?.accentText || 'var(--brand-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
              {t('vehiculo.datesAndLocations', 'Fechas y Lugares')}
            </h4>
            {editHabilitado && (
              <button onClick={() => onEditar('retiro')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: c?.accentText || 'var(--brand-primary)', fontWeight: 700, padding: 0 }}>
                {t('vehiculo.edit', 'Editar')}
              </button>
            )}
          </div>

          {/* Entrega */}
          <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px dashed ${c?.cardBorder || 'var(--borde)'}` }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: c?.textSecondary || '#64748b', textTransform: 'uppercase', margin: '0 0 8px' }}>{t('vehiculo.pickupLocation', 'Entrega')}</p>
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: c?.textPrimary || '#0f172a', margin: '0 0 2px' }}>
                {reserva.fechaInicio ? `${fmt(reserva.fechaInicio)}` : t('vehiculo.dateNotSelected', 'Fecha no seleccionada')}
              </p>
              <p style={{ fontSize: 11, color: c?.textSecondary || '#64748b', margin: 0 }}>
                {reserva.horaInicio || '--:--'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: c?.textPrimary || '#0f172a', margin: '0' }}>
                {translateLocation(reserva.sucursalRetiro)}
              </p>
              {reserva.sucursalRetiro === 'domicilio' && (reserva.domicilioDireccion || reserva.domicilioBarrio) && (
                <p style={{ fontSize: 11, color: c?.accentText || 'var(--brand-primary)', fontWeight: 700, margin: '4px 0 0', wordBreak: 'break-word', lineHeight: 1.3 }}>
                  📍 {[reserva.domicilioDireccion, reserva.domicilioBarrio, reserva.domicilioCiudad].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Devolución */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: c?.textSecondary || '#64748b', textTransform: 'uppercase', margin: '0 0 8px' }}>{t('vehiculo.returnLocation', 'Devolución')}</p>
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: c?.textPrimary || '#0f172a', margin: '0 0 2px' }}>
                {reserva.fechaFin ? `${fmt(reserva.fechaFin)}` : t('vehiculo.dateNotSelected', 'Fecha no seleccionada')}
              </p>
              <p style={{ fontSize: 11, color: c?.textSecondary || '#64748b', margin: 0 }}>
                {reserva.horaFin || '--:--'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: c?.textPrimary || '#0f172a', margin: '0' }}>
                {translateLocation(reserva.sucursalDevolucion)}
              </p>
              {reserva.sucursalDevolucion === 'domicilio' && (reserva.domicilioDireccion || reserva.domicilioBarrio) && (
                <p style={{ fontSize: 11, color: c?.accentText || 'var(--brand-primary)', fontWeight: 700, margin: '4px 0 0', wordBreak: 'break-word', lineHeight: 1.3 }}>
                  📍 {[reserva.domicilioDireccion, reserva.domicilioBarrio, reserva.domicilioCiudad].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Tu protección y extras ── */}
        <div style={{ padding: '20px', borderBottom: `1px solid ${c?.cardBorder || 'var(--borde)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ fontSize: 11, fontWeight: 800, color: c?.accentText || 'var(--brand-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
              {t('vehiculo.protectionExtras', 'Tu protección y extras')}
            </h4>
            {editHabilitado && (
              <button onClick={() => onEditar('grupo')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: c?.accentText || 'var(--brand-primary)', fontWeight: 700, padding: 0 }}>
                {t('vehiculo.edit', 'Editar')}
              </button>
            )}
          </div>
          
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
                <button onClick={() => onEditar('servicios')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: c?.accentText || 'var(--brand-primary)', fontWeight: 700, padding: 0 }}>
                  {t('vehiculo.edit', 'Editar')}
                </button>
              )}
            </div>
            <p style={{ fontSize: 13, color: c?.textPrimary || '#0f172a', fontWeight: serviciosElegidos.length > 0 ? 800 : 400, margin: 0 }}>
              {serviciosElegidos.length > 0 ? formatCurrency(subtotalServicios, moneda) : t('vehiculo.noneSelected', 'Ninguno seleccionado')}
            </p>
          </div>
        </div>

        {/* ── Cupón de Descuento (Opcional) ── */}
        <div style={{ padding: '20px', borderBottom: `1px solid ${c?.cardBorder || 'var(--borde)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <h4 style={{ fontSize: 11, fontWeight: 800, color: c?.accentText || 'var(--brand-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
              {t('promotions.codeLabelOptional', 'Cupón de descuento (Opcional)')}
            </h4>
          </div>

          {appliedPromotion ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: c?.isDark ? 'rgba(255, 255, 255, 0.03)' : (c?.subCardBg || '#f8fafc'),
              border: `1.5px solid ${c?.cardBorder || '#e2e8f0'}`,
              borderRadius: 12,
              padding: '12px 14px',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'var(--brand-primary, #e11d48)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: c?.textPrimary || '#0f172a', letterSpacing: '0.04em', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {appliedPromotion.codigo}
                  </div>
                  <div style={{ fontSize: 11, color: c?.textSecondary || '#64748b', fontWeight: 600, marginTop: 2 }}>
                    {appliedPromotion.tipoDescuento === 'porcentaje'
                      ? `${appliedPromotion.valorDescuento}% OFF aplicado`
                      : `$${Number(appliedPromotion.valorDescuento).toLocaleString('es-CO')} OFF aplicado`}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onRemovePromotion}
                title={t('promotions.remove', 'Quitar')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: c?.textSecondary || '#94a3b8',
                  padding: 4,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s',
                  borderRadius: 6,
                  flexShrink: 0
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = c?.textSecondary || '#94a3b8'}
              >
                <FaTrashAlt size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                value={codigoCupon}
                onChange={e => {
                  setCodigoCupon(e.target.value.toUpperCase());
                  setPromoError('');
                  setPromoAlert('');
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAplicarCupon();
                  }
                }}
                placeholder={t('promotions.codePlaceholder', 'Ingresa un código')}
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: 40,
                  padding: '0 12px',
                  borderRadius: 10,
                  border: `1.5px solid ${promoError ? '#ef4444' : (c?.cardBorder || '#e2e8f0')}`,
                  background: c?.isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                  color: c?.textPrimary || '#0f172a',
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={handleAplicarCupon}
                disabled={!codigoCupon.trim()}
                style={{
                  height: 40,
                  padding: '0 16px',
                  borderRadius: 10,
                  background: codigoCupon.trim() ? 'var(--brand-gradient)' : (c?.isDark ? '#334155' : '#94a3b8'),
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 11.5,
                  letterSpacing: '0.05em',
                  border: 'none',
                  cursor: codigoCupon.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                  flexShrink: 0
                }}
              >
                {t('promotions.apply', 'APLICAR')}
              </button>
            </div>
          )}

          {promoError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: c?.isDark ? 'rgba(239, 68, 68, 0.12)' : '#fff1f2',
              border: `1px solid ${c?.isDark ? 'rgba(239, 68, 68, 0.35)' : '#fecdd3'}`,
              borderRadius: 10,
              padding: '8px 12px',
              marginTop: 10,
              gap: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 900,
                  flexShrink: 0
                }}>
                  !
                </div>
                <span style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: c?.isDark ? '#fca5a5' : '#b91c1c',
                  lineHeight: 1.3
                }}>
                  {promoError}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPromoError('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: c?.isDark ? '#f87171' : '#e11d48',
                  fontSize: 13,
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                ✕
              </button>
            </div>
          )}

          {promoAlert && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: c?.isDark ? 'rgba(234, 179, 8, 0.12)' : '#fefce8',
              border: `1px solid ${c?.isDark ? 'rgba(234, 179, 8, 0.35)' : '#fef08a'}`,
              borderRadius: 10,
              padding: '8px 12px',
              marginTop: 10,
              gap: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#eab308',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 900,
                  flexShrink: 0
                }}>
                  ℹ
                </div>
                <span style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: c?.isDark ? '#fef08a' : '#854d0e',
                  lineHeight: 1.3
                }}>
                  {promoAlert}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPromoAlert('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: c?.isDark ? '#fef08a' : '#854d0e',
                  fontSize: 13,
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                ✕
              </button>
            </div>
          )}

          {!appliedPromotion && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button
                type="button"
                onClick={() => {
                  setPromoError('');
                  setPromoAlert('');
                  if (!cuponesDisponibles || cuponesDisponibles.length === 0) {
                    setPromoAlert(t('promotions.noCouponsForVehicle', 'No hay cupones disponibles para este vehículo en este momento.'));
                  } else {
                    setModalCupones(true);
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: c?.accentText || 'var(--brand-secondary)',
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'inherit',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {t('promotions.viewAvailableCoupons', 'Ver cupones disponibles')}
              </button>
            </div>
          )}
        </div>

        {/* ── Desglose de tarifa ── */}
        <div style={{ padding: '20px' }}>
          <h4 style={{ fontSize: 11, fontWeight: 800, color: c?.textPrimary || '#0f172a', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 16px' }}>
            {t('vehiculo.fareBreakdown', 'Desglose de tarifa')}
          </h4>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: c?.textSecondary || '#64748b', marginBottom: 12 }}>
            <span>{dias > 1 ? t('vehiculo.dailyRatesCount', 'Diarias ({{dias}} días)', { dias }) : t('vehiculo.dailyRates', 'Diarias')}</span>
            <span style={{ fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>{formatCurrency(subtotalDiario, moneda)}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: c?.textSecondary || '#64748b', marginBottom: 12 }}>
            <span>{t('vehiculo.mileageType', 'Kilometraje')}</span>
            <span style={{ fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>
              {reserva.tipoKm ? (reserva.tipoKm === 'ilimitado' ? t('vehiculo.unlimited', 'Ilimitado') : t('vehiculo.limited', 'Limitado')) : '-'}
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: c?.textSecondary || '#64748b', marginBottom: 12 }}>
            <span>{t('vehiculo.protections', 'Protecciones')}</span>
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

          {discount > 0 && (
            <div
              className="reservation-discount-row"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#ecfdf5',
                border: '1px solid #6ee7b7',
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 16,
                color: '#047857',
                fontWeight: 800,
                fontSize: '13px',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                🏷️ {t('promotions.discount', 'Descuento')}
                <small style={{ fontWeight: 700, opacity: 0.9 }}>
                  ({appliedPromotion?.tipoDescuento === 'porcentaje' ? `-${appliedPromotion.valorDescuento}%` : 'Descuento'})
                </small>
              </span>
              <strong style={{ fontSize: '15px', color: '#065f46' }}>
                -{formatCurrency(discount, moneda)}
              </strong>
            </div>
          )}

          {/* Total Box */}
          <div style={{ background: c?.subCardBg || '#f8fafc', border: `1px solid ${c?.cardBorder || '#e2e8f0'}`, borderRadius: 12, padding: '16px' }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: c?.accentText || 'var(--brand-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>
              {t('vehiculo.finalTotal', 'Total Final')}
            </p>
            <p style={{ fontSize: 24, fontWeight: 900, color: c?.accentText || 'var(--brand-secondary)', margin: '0 0 6px' }}>
              {formatCurrency(finalTotal, moneda)}
            </p>
            <p style={{ fontSize: 10, color: c?.textSecondary || '#64748b', margin: 0 }}>
              {t('vehiculo.totalIncludesVat', 'El total final incluye IVA y cargos adicionales')}
            </p>
          </div>
          
          {pantalla < 3 && (
            <div style={{ marginTop: 20 }}>
              <button 
                onClick={onContinuar}
                style={{ width: '100%', padding: '14px', background: 'var(--brand-gradient)', color: 'var(--brand-on-primary)', borderRadius: 12, border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                {t('common.continue', 'Continuar')}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Modal 1: Cupones Disponibles */}
      {modalCupones && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setModalCupones(false)}
        >
          <div
            style={{
              background: c?.cardBg || '#ffffff',
              borderRadius: 22,
              maxWidth: 540,
              width: '100%',
              maxHeight: '88vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
              border: `1px solid ${c?.cardBorder || '#e2e8f0'}`,
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--brand-gradient, #e11d48)',
              color: '#ffffff'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 800,
                color: '#ffffff'
              }}>
                {t('promotions.availableCouponsTitle', 'Cupones Disponibles')}
              </h3>

              <button
                type="button"
                onClick={() => setModalCupones(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  border: 'none',
                  fontSize: 15,
                  lineHeight: 1,
                  cursor: 'pointer',
                  color: '#ffffff',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
              >
                ✕
              </button>
            </div>

            {/* Coupons List */}
            <div style={{ padding: '16px 20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
              {cuponesDisponibles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: c?.textSecondary || '#64748b' }}>
                  <FaTicketAlt size={36} style={{ opacity: 0.35, margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                    {t('promotions.emptyTitle', 'No hay cupones activos disponibles para este vehículo en este momento')}
                  </p>
                </div>
              ) : (
                cuponesDisponibles.map(promo => {
                  const promoKey = promo.id || promo.codigo;
                  const promoThumbnails = (promo.imagenes && promo.imagenes.length > 0)
                    ? promo.imagenes.slice(0, 3)
                    : (vehiculo?.imagenes?.length ? vehiculo.imagenes.slice(0, 3) : (promo.vehiculoImagen ? [promo.vehiculoImagen] : []));
                  const valorDescFormatted = promo.tipoDescuento === 'porcentaje'
                    ? `${promo.valorDescuento}% OFF`
                    : `$${Number(promo.valorDescuento).toLocaleString('es-CO')} OFF`;

                  return (
                    <div
                      key={promoKey}
                      style={{
                        display: 'flex',
                        borderRadius: 16,
                        border: promo.destacada
                          ? `1.5px solid rgba(225, 29, 72, 0.4)`
                          : `1.5px solid ${c?.cardBorder || '#e2e8f0'}`,
                        background: c?.cardBg || '#ffffff',
                        boxShadow: promo.destacada
                          ? '0 6px 18px rgba(225, 29, 72, 0.1)'
                          : '0 2px 8px rgba(0,0,0,0.03)',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      {/* Left ticket details */}
                      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, flex: 1 }}>
                              <FaTicketAlt size={13} color="var(--brand-primary, #e11d48)" style={{ flexShrink: 0 }} />
                              <h4 style={{
                                margin: 0,
                                fontSize: 13.5,
                                fontWeight: 800,
                                color: c?.textPrimary || '#0f172a',
                                lineHeight: 1.3,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {promo.nombre || promo.titulo}
                              </h4>
                            </div>
                            {promo.destacada && (
                              <span style={{
                                fontSize: 10,
                                fontWeight: 800,
                                background: 'rgba(225, 29, 72, 0.08)',
                                color: 'var(--brand-primary, #e11d48)',
                                border: '1px solid rgba(225, 29, 72, 0.25)',
                                borderRadius: 10,
                                padding: '2px 7px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                flexShrink: 0
                              }}>
                                ⭐ Destacado
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Vehicle thumbnails */}
                        <div style={{ display: 'flex', gap: 6, margin: '6px 0 8px', height: 38, alignItems: 'center' }}>
                          {promoThumbnails.length > 0 ? (
                            promoThumbnails.map((imgUrl, i) => (
                              <img
                                key={i}
                                src={imgUrl}
                                alt="Car preview"
                                style={{
                                  width: 56,
                                  height: 38,
                                  objectFit: 'cover',
                                  borderRadius: 7,
                                  border: `1px solid ${c?.cardBorder || '#e2e8f0'}`,
                                  background: '#f8fafc',
                                  flexShrink: 0
                                }}
                                onError={e => { e.currentTarget.style.display = 'none'; }}
                              />
                            ))
                          ) : (
                            <div style={{ height: 38, display: 'flex', alignItems: 'center', color: c?.textSecondary || '#94a3b8', fontSize: 11 }}>
                              🚗 {promo.categoriaVehiculo ? `Categoría: ${promo.categoriaVehiculo.toUpperCase()}` : 'Todos los vehículos'}
                            </div>
                          )}
                        </div>

                        {/* Bottom row: Exp date & View Condiciones */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 2 }}>
                          <span style={{ fontSize: 11, color: c?.textSecondary || '#64748b' }}>
                            Exp: {formatearFechaExp(promo.fechaFin)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setModalCupones(false);
                              setViewingCondicionesPromo(promo);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              color: 'var(--brand-primary, #e11d48)',
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            {t('promotions.conditions', 'Condiciones')}
                          </button>
                        </div>
                      </div>

                      {/* Dotted border line with notches */}
                      <div style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 0,
                        borderLeft: `1.5px dashed ${c?.cardBorder || '#cbd5e1'}`
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: -8,
                          left: -8,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: c?.isDark ? '#0f172a' : '#f1f5f9',
                          border: `1px solid ${c?.cardBorder || '#e2e8f0'}`
                        }} />
                        <div style={{
                          position: 'absolute',
                          bottom: -8,
                          left: -8,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: c?.isDark ? '#0f172a' : '#f1f5f9',
                          border: `1px solid ${c?.cardBorder || '#e2e8f0'}`
                        }} />
                      </div>

                      {/* Right side: Discount & Apply */}
                      <div style={{
                        width: '36%',
                        minWidth: 125,
                        background: c?.isDark ? 'rgba(225, 29, 72, 0.08)' : 'rgba(225, 29, 72, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '14px 10px',
                        textAlign: 'center'
                      }}>
                        <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--brand-primary, #e11d48)', lineHeight: 1.1 }}>
                          {valorDescFormatted}
                        </span>
                        <span style={{ fontSize: 10.5, color: c?.textSecondary || '#64748b', margin: '4px 0 10px', lineHeight: 1.2, fontWeight: 500 }}>
                          {promo.vehiculoNombre || (promo.categoriaVehiculo ? `Categoría ${promo.categoriaVehiculo.toUpperCase()}` : t('promotions.allVehicles', 'Todos los vehículos'))}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setModalCupones(false);
                            if (onApplyPromotion) {
                              try {
                                onApplyPromotion(promo.codigo);
                                setPromoError('');
                              } catch (err) {
                                setPromoError(getErrorMessage(err));
                              }
                            }
                          }}
                          style={{
                            background: 'var(--brand-gradient, #e11d48)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '7px 18px',
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(225, 29, 72, 0.25)',
                            transition: 'all 0.2s'
                          }}
                        >
                          {t('promotions.apply', 'Aplicar')}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Condiciones del Cupón */}
      {viewingCondicionesPromo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setViewingCondicionesPromo(null)}
        >
          <div
            style={{
              background: c?.cardBg || '#ffffff',
              borderRadius: 22,
              maxWidth: 480,
              width: '100%',
              maxHeight: '88vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
              border: `1px solid ${c?.cardBorder || '#e2e8f0'}`,
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--brand-gradient, #e11d48)',
              color: '#ffffff'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 800,
                color: '#ffffff'
              }}>
                {t('promotions.couponConditionsTitle', 'Condiciones del Cupón')}
              </h3>

              <button
                type="button"
                onClick={() => setViewingCondicionesPromo(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  border: 'none',
                  fontSize: 15,
                  lineHeight: 1,
                  cursor: 'pointer',
                  color: '#ffffff',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '22px 26px 20px', overflowY: 'auto', flex: 1 }}>
              {/* Red Title */}
              <h4 style={{
                margin: '0 0 6px',
                fontSize: 17,
                fontWeight: 800,
                color: 'var(--brand-primary, #e11d48)'
              }}>
                {viewingCondicionesPromo.nombre || viewingCondicionesPromo.titulo || viewingCondicionesPromo.codigo}
              </h4>

              {/* Subtitle / Description */}
              <p style={{
                margin: '0 0 20px',
                fontSize: 13.5,
                color: c?.textSecondary || '#475569',
                lineHeight: 1.55
              }}>
                {viewingCondicionesPromo.descripcion ||
                  (viewingCondicionesPromo.tipoDescuento === 'porcentaje'
                    ? `Descuento del ${viewingCondicionesPromo.valorDescuento}% exclusivo para reservas del ${viewingCondicionesPromo.vehiculoNombre || (vehiculo?.nombre ? vehiculo.nombre : 'vehículo seleccionado')}.`
                    : `Descuento de $${Number(viewingCondicionesPromo.valorDescuento).toLocaleString('es-CO')} COP exclusivo para reservas del ${viewingCondicionesPromo.vehiculoNombre || (vehiculo?.nombre ? vehiculo.nombre : 'vehículo seleccionado')}.`)}
              </p>

              {/* Terms & Conditions Header */}
              <h5 style={{
                margin: '0 0 14px',
                fontSize: 14,
                fontWeight: 800,
                color: c?.textPrimary || '#0f172a'
              }}>
                {t('promotions.termsAndConditionsHeader', 'Términos y condiciones:')}
              </h5>

              {/* Full Terms & Conditions List */}
              <ul style={{
                margin: 0,
                paddingLeft: 20,
                listStyleType: 'disc',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                fontSize: 13,
                color: c?.textSecondary || '#475569',
                lineHeight: 1.55
              }}>
                <li>Código: {viewingCondicionesPromo.codigo}</li>
                <li>{t('promotions.termsDigitalPayments', 'Válido para pagos digitales e iniciales.')}</li>
                <li>{t('promotions.termsNonTransferable', 'No transferible a otros usuarios.')}</li>
                <li>{t('promotions.termsOnePerReservation', 'Solo se puede aplicar un cupón por reserva.')}</li>
                <li>
                  {t('promotions.termsValidCategories', 'Categorías válidas:')}{' '}
                  {(viewingCondicionesPromo.categoriaVehiculo || 'TODOS').toUpperCase()}
                  {viewingCondicionesPromo.vehiculoNombre ? ` (Exclusivo: ${viewingCondicionesPromo.vehiculoNombre})` : ''}
                </li>
                {viewingCondicionesPromo.audiencia && viewingCondicionesPromo.audiencia !== 'todos' && (
                  <li>
                    Exclusivo para {viewingCondicionesPromo.audiencia === 'nuevos' ? 'nuevos usuarios' : 'clientes frecuentes'}.
                  </li>
                )}
                {viewingCondicionesPromo.reservaMinima > 0 ? (
                  <li>
                    {t('promotions.termsMinAmount', 'Requiere un monto mínimo de reserva de')} ${Number(viewingCondicionesPromo.reservaMinima).toLocaleString('es-CO')} COP. {t('promotions.termsNonCumulative', 'No acumulable con otras promociones.')}
                  </li>
                ) : (
                  <li>
                    {t('promotions.termsGeneralConditions', 'Válido para vehículos de la flota. No acumulable con otras promociones.')}
                  </li>
                )}
                <li>
                  {t('promotions.termsExpires', 'Vence:')}{' '}
                  {formatearFechaExp(viewingCondicionesPromo.fechaFin)}
                </li>
                {viewingCondicionesPromo.condiciones && (
                  <li>
                    Condiciones especiales: {viewingCondicionesPromo.condiciones}
                  </li>
                )}
              </ul>
            </div>

            {/* Footer Action Buttons */}
            <div style={{
              padding: '16px 26px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}>
              <button
                type="button"
                onClick={() => {
                  const codigo = viewingCondicionesPromo.codigo;
                  setViewingCondicionesPromo(null);
                  if (onApplyPromotion && (!appliedPromotion || appliedPromotion.codigo !== codigo)) {
                    try {
                      onApplyPromotion(codigo);
                      setPromoError('');
                    } catch (err) {
                      setPromoError(getErrorMessage(err));
                    }
                  }
                }}
                style={{
                  width: '100%',
                  background: 'var(--brand-gradient, #e11d48)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 20px',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(225, 29, 72, 0.25)',
                  transition: 'transform 0.15s ease'
                }}
              >
                Entendido
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewingCondicionesPromo(null);
                  setModalCupones(true);
                }}
                style={{
                  width: '100%',
                  background: c?.isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                  color: c?.textPrimary || '#334155',
                  border: `1.5px solid ${c?.cardBorder || '#e2e8f0'}`,
                  borderRadius: 12,
                  padding: '12px 20px',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
