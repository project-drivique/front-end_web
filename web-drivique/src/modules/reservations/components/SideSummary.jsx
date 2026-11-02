import { diasDeAlquiler } from '../utils/pricing';
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanding } from '../../landing/LandingContext'


import { promotionManagementService } from '@/services/promotionManagementService'
import ViewingCondicionesPromo from './SideSummary/ViewingCondicionesPromo'
import ModalCupones from './SideSummary/ModalCupones'
import SideSummaryPart3 from './SideSummary/SideSummaryPart3'
import Pantalla from './SideSummary/Pantalla'
import SideSummaryPart2 from './SideSummary/SideSummaryPart2'
import SideSummaryPart from './SideSummary/SideSummaryPart'



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
  onRemovePromotion,
  cotizacion
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

  const tarifaDiaria = Number(vehiculo.precio ?? vehiculo.dailyRate ?? vehiculo.tarifaDiaria ?? 0);
  const precio = tarifaDiaria + (reserva.tipoKm === 'ilimitado'
    ? Number(kmIlimit.precio || 0)
    : (reserva.tipoKm === 'limitado' ? Number(kmLimit.precio || 0) : 0));

  const dias = diasDeAlquiler(reserva);

  const precioSeguro = seguroIdx !== null ? Number(vehiculo.seguros[seguroIdx]?.precio ?? vehiculo.seguros[seguroIdx]?.dailyRate ?? vehiculo.seguros[seguroIdx]?.price ?? 0) : 0;
  const serviciosElegidos = (vehiculo.servicios || []).filter(s => serviciosSeleccionados.includes(s.nombre));
  const precioServicios = serviciosElegidos.reduce((suma, s) => suma + Number(s?.precio ?? s?.dailyRate ?? s?.price ?? 0), 0);

  const subtotalDiario = precio * dias;
  const subtotalSeguro = precioSeguro * dias;
  const subtotalServicios = precioServicios * dias;
  // Cargo administrativo, IVA, descuento y total los calcula el servidor
  const cargosAdmin = Number(cotizacion?.adminFee || 0);
  const iva = Number(cotizacion?.vat || 0);
  const total = cotizacion ? Number(cotizacion.estimatedTotal) + Number(cotizacion.discountAmount || 0) : subtotalDiario + subtotalSeguro + subtotalServicios;
  const discount = cotizacion ? Number(cotizacion.discountAmount || 0) : 0
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
        <SideSummaryPart c={c} editHabilitado={editHabilitado} fmt={fmt} onEditar={onEditar} reserva={reserva} t={t} translateLocation={translateLocation} />

        {/* ── Tu protección y extras ── */}
        <SideSummaryPart2 c={c} dias={dias} editHabilitado={editHabilitado} moneda={moneda} onEditar={onEditar} reserva={reserva} seguroIdx={seguroIdx} serviciosElegidos={serviciosElegidos} t={t} translateProtection={translateProtection} vehiculo={vehiculo} />

        {/* ── Cupón de Descuento (Opcional - Solo visible en Flujo 3) ── */}
        {pantalla >= 3 && (
          <Pantalla appliedPromotion={appliedPromotion} c={c} codigoCupon={codigoCupon} cuponesDisponibles={cuponesDisponibles} handleAplicarCupon={handleAplicarCupon} onRemovePromotion={onRemovePromotion} promoAlert={promoAlert} promoError={promoError} setCodigoCupon={setCodigoCupon} setModalCupones={setModalCupones} setPromoAlert={setPromoAlert} setPromoError={setPromoError} t={t} />
        )}

        {/* ── Desglose de tarifa ── */}
        <SideSummaryPart3 appliedPromotion={appliedPromotion} c={c} cargosAdmin={cargosAdmin} cotizacion={cotizacion} dias={dias} discount={discount} finalTotal={finalTotal} iva={iva} moneda={moneda} onContinuar={onContinuar} pantalla={pantalla} reserva={reserva} seguroIdx={seguroIdx} subtotalDiario={subtotalDiario} subtotalSeguro={subtotalSeguro} subtotalServicios={subtotalServicios} t={t} translateProtection={translateProtection} vehiculo={vehiculo} />
      </aside>

      {/* Modal 1: Cupones Disponibles */}
      {modalCupones && (
        <ModalCupones c={c} cuponesDisponibles={cuponesDisponibles} getErrorMessage={getErrorMessage} onApplyPromotion={onApplyPromotion} setModalCupones={setModalCupones} setPromoError={setPromoError} setViewingCondicionesPromo={setViewingCondicionesPromo} t={t} vehiculo={vehiculo} />
      )}

      {/* Modal 2: Condiciones del Cupón */}
      {viewingCondicionesPromo && (
        <ViewingCondicionesPromo appliedPromotion={appliedPromotion} c={c} getErrorMessage={getErrorMessage} onApplyPromotion={onApplyPromotion} setModalCupones={setModalCupones} setPromoError={setPromoError} setViewingCondicionesPromo={setViewingCondicionesPromo} t={t} vehiculo={vehiculo} viewingCondicionesPromo={viewingCondicionesPromo} />
      )}
    </>
  );
}
