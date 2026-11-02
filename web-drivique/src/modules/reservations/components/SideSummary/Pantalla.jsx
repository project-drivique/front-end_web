export default function Pantalla({ appliedPromotion, c, codigoCupon, cuponesDisponibles, handleAplicarCupon, onRemovePromotion, promoAlert, promoError, setCodigoCupon, setModalCupones, setPromoAlert, setPromoError, t }) {
  return (
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
                  background: c?.isDark ? 'rgba(var(--brand-primary-rgb), 0.08)' : 'var(--brand-soft)',
                  border: `1.5px solid ${c?.isDark ? 'rgba(var(--brand-primary-rgb), 0.25)' : 'var(--brand-border)'}`,
                  borderRadius: 12,
                  padding: '12px 14px',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--brand-primary)',
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
                      <div style={{ fontSize: 13, fontWeight: 800, color: c?.accentText || 'var(--brand-secondary)', letterSpacing: '0.04em', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
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
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: c?.textSecondary || '#64748b',
                      padding: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      borderRadius: 8,
                      transition: 'opacity 0.2s',
                      opacity: 0.85
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" x2="10" y1="11" y2="17" />
                      <line x1="14" x2="14" y1="11" y2="17" />
                    </svg>
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
  )
}
