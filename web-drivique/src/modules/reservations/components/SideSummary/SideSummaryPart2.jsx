import { formatCurrency } from '@/utils/currencyUtils'

export default function SideSummaryPart2({ c, dias, editHabilitado, moneda, onEditar, reserva, seguroIdx, serviciosElegidos, t, translateProtection, vehiculo }) {
  return (
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
                {seguroIdx !== null && vehiculo.seguros?.[seguroIdx] ? translateProtection(vehiculo.seguros[seguroIdx]?.nombre) : '—'}
              </p>
            </div>
            
            {/* Kilometraje */}
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: c?.textSecondary || '#64748b', textTransform: 'uppercase', margin: '0 0 4px' }}>{t('vehiculo.mileageType', 'Tipo de kilometraje')}</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: c?.textPrimary || '#0f172a', margin: '0' }}>
                {reserva.tipoKm === 'ilimitado' ? t('vehiculo.unlimited', 'Ilimitado') : (reserva.tipoKm === 'limitado' ? t('vehiculo.limited', 'Limitado') : '—')}
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
              {serviciosElegidos.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  {serviciosElegidos.map(s => (
                    <div key={s.nombre} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
                      <span style={{ color: c?.textPrimary || '#0f172a', fontWeight: 800 }}>
                        {s.nombre}{' '}
                        <span style={{ color: c?.textSecondary || '#64748b', fontWeight: 600, fontSize: 12 }}>
                          ({dias} {dias === 1 ? t('vehiculo.day', 'día') : t('vehiculo.days', 'días')})
                        </span>
                      </span>
                      <span style={{ color: c?.textPrimary || '#0f172a', fontWeight: 800 }}>
                        {formatCurrency(Number(s?.precio ?? s?.dailyRate ?? s?.price ?? 0) * dias, moneda)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 14, fontWeight: 800, color: c?.textPrimary || '#0f172a', margin: '2px 0 0' }}>
                  —
                </p>
              )}
            </div>
          </div>
  )
}
