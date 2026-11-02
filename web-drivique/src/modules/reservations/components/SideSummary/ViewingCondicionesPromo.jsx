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

export default function ViewingCondicionesPromo({ appliedPromotion, c, getErrorMessage, onApplyPromotion, setModalCupones, setPromoError, setViewingCondicionesPromo, t, vehiculo, viewingCondicionesPromo }) {
  return (
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
                      ? t('hc3.promo_percent_desc', { defaultValue: 'Descuento del {{valor}}% exclusivo para reservas del {{vehiculo}}.', valor: viewingCondicionesPromo.valorDescuento, vehiculo: viewingCondicionesPromo.vehiculoNombre || (vehiculo?.nombre ? vehiculo.nombre : t('hc3.selected_vehicle', 'vehículo seleccionado')) })
                      : t('hc3.promo_amount_desc', { defaultValue: 'Descuento de ${{valor}} COP exclusivo para reservas del {{vehiculo}}.', valor: Number(viewingCondicionesPromo.valorDescuento).toLocaleString('es-CO'), vehiculo: viewingCondicionesPromo.vehiculoNombre || (vehiculo?.nombre ? vehiculo.nombre : t('hc3.selected_vehicle', 'vehículo seleccionado')) }))}
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
  )
}
