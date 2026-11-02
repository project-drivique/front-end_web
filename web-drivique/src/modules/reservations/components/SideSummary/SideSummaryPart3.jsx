import { formatCurrency } from '@/utils/currencyUtils'

export default function SideSummaryPart3({ appliedPromotion, c, cargosAdmin, cotizacion, dias, discount, finalTotal, iva, moneda, onContinuar, pantalla, reserva, seguroIdx, subtotalDiario, subtotalSeguro, subtotalServicios, t, translateProtection, vehiculo }) {
  return (
    <div style={{ padding: '20px' }}>
            <h4 style={{ fontSize: 12, fontWeight: 800, color: c?.textPrimary || '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 16px' }}>
              {t('vehiculo.fareBreakdown', 'DESGLOSE DE TARIFA')}
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: c?.textSecondary || '#64748b' }}>
                <span>{dias > 1 ? t('vehiculo.dailyRatesCount', 'Diarias ({{dias}} días)', { dias }) : t('vehiculo.dailyRates', 'Diarias')}</span>
                <span style={{ fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>{formatCurrency(subtotalDiario, moneda)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: c?.textSecondary || '#64748b' }}>
                <span>
                  {reserva.tipoKm === 'ilimitado'
                    ? t('vehiculo.unlimitedMileage', 'Kilometraje ilimitado')
                    : (reserva.tipoKm === 'limitado' ? t('vehiculo.limitedMileage', 'Kilometraje limitado') : t('vehiculo.mileage', 'Kilometraje'))}
                </span>
                <span style={{ fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>
                  {reserva.tipoKm ? formatCurrency(subtotalDiario, moneda) : '—'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: c?.textSecondary || '#64748b' }}>
                <span>
                  {seguroIdx !== null && vehiculo.seguros?.[seguroIdx]
                    ? translateProtection(vehiculo.seguros[seguroIdx].nombre)
                    : t('vehiculo.mandatoryProtection', 'Protección Obligatoria')}
                </span>
                <span style={{ fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>
                  {seguroIdx !== null ? formatCurrency(subtotalSeguro, moneda) : '—'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: c?.textSecondary || '#64748b' }}>
                <span>
                  {t('vehiculo.additionalServices', 'Servicios adicionales')}
                </span>
                <span style={{ fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>
                  {subtotalServicios > 0 ? formatCurrency(subtotalServicios, moneda) : '—'}
                </span>
              </div>
              
              {cotizacion && (<>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                color: c?.textSecondary || '#64748b',
                paddingBottom: 14,
                borderBottom: `1px solid ${c?.cardBorder || '#e2e8f0'}`
              }}>
                <span>{t('vehiculo.adminChargesLabel', 'Cargos Administrativos').replace(/\s*\(\d+%\)/, '')} ({Math.round(Number(cotizacion?.adminFeeRate || 0) * 100)}%)</span>
                <span style={{ fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>{formatCurrency(cargosAdmin, moneda)}</span>
              </div>
  
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: c?.textSecondary || '#64748b' }}>
                <span>{t('vehiculo.vatLabel', 'IVA')} ({Math.round(Number(cotizacion?.vatRate || 0) * 100)}%)</span>
                <span style={{ fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>{formatCurrency(iva, moneda)}</span>
              </div>
              </>)}
  
              {discount > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  color: '#10b981',
                  fontWeight: 700
                }}>
                  <span>
                    {t('promotions.discount', 'Descuento')} ({appliedPromotion?.codigo || 'PROMO'})
                  </span>
                  <span style={{ fontWeight: 800 }}>
                    -{formatCurrency(discount, moneda)}
                  </span>
                </div>
              )}
            </div>
  
            {/* Total Box */}
            <div style={{
              background: c?.subCardBg || '#f8fafc',
              border: `1px solid ${c?.cardBorder || '#e2e8f0'}`,
              borderRadius: 16,
              padding: '16px 20px',
              marginTop: 18
            }}>
              <p style={{
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--brand-primary, #2563eb)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 6px'
              }}>
                {t('vehiculo.finalTotal', 'TOTAL FINAL')}
              </p>
              <p style={{
                fontSize: 26,
                fontWeight: 900,
                color: c?.textPrimary || '#0f172a',
                letterSpacing: '-0.02em',
                margin: '0 0 6px'
              }}>
                {formatCurrency(finalTotal, moneda)}
              </p>
            </div>
            
            {pantalla < 3 && onContinuar && (
              <div style={{ marginTop: 20 }}>
                <button 
                  onClick={onContinuar}
                  style={{ width: '100%', padding: '14px', background: 'var(--brand-gradient)', color: 'var(--brand-on-primary)', borderRadius: 12, border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                  {t('common.continue', 'Continuar')}
                </button>
              </div>
            )}
          </div>
  )
}
