import { FaTicketAlt } from 'react-icons/fa'

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

export default function ModalCupones({ c, cuponesDisponibles, getErrorMessage, onApplyPromotion, setModalCupones, setPromoError, setViewingCondicionesPromo, t, vehiculo }) {
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
                          border: `1.5px solid ${c?.cardBorder || '#e2e8f0'}`,
                          background: c?.cardBg || '#ffffff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        {/* Left ticket details */}
                        <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, flex: 1 }}>
                                <FaTicketAlt size={13} color={c?.accentText || 'var(--brand-secondary)'} style={{ flexShrink: 0 }} />
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
                                🚗 {promo.categoriaVehiculo ? t('hc3.promo_category_colon', { defaultValue: 'Categoría: {{categoria}}', categoria: promo.categoriaVehiculo.toUpperCase() }) : t('hc2.todos_los_vehiculos', 'Todos los vehículos')}
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
                                color: c?.accentText || 'var(--brand-secondary)',
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
                          background: c?.isDark ? 'rgba(var(--brand-primary-rgb), 0.06)' : '#f8fbff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '14px 10px',
                          textAlign: 'center'
                        }}>
                          <span style={{ fontSize: 17, fontWeight: 900, color: c?.accentText || 'var(--brand-secondary)', lineHeight: 1.1 }}>
                            {valorDescFormatted}
                          </span>
                          <span style={{ fontSize: 10.5, color: c?.textSecondary || '#64748b', margin: '4px 0 10px', lineHeight: 1.2, fontWeight: 500 }}>
                            {promo.vehiculoNombre || (promo.categoriaVehiculo ? t('hc3.promo_category', { defaultValue: 'Categoría {{categoria}}', categoria: promo.categoriaVehiculo.toUpperCase() }) : t('promotions.allVehicles', 'Todos los vehículos'))}
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
                              background: 'var(--brand-gradient, #1d4ed8)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 8,
                              padding: '7px 18px',
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(var(--brand-primary-rgb), 0.25)',
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
  )
}
