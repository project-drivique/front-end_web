import { FaFileAlt } from 'react-icons/fa'
import { formatCurrency } from '../../../../utils/currencyUtils'

export default function ConditionsModal({ backdropStyle, closeBtnStyle, conditionsModal, labelDiscount, labelTarget, modalHeadStyle, moneda, setConditionsModal, t, tasaUSD }) {
  return (
    <div className="cities-modal-backdrop" style={backdropStyle} onMouseDown={e => e.target === e.currentTarget && setConditionsModal(null)}>
            <section className="cities-modal" style={{ maxWidth: 480, width: '100%', background: 'var(--city-card)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={modalHeadStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(var(--brand-primary-rgb),0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary, #2563eb)' }}>
                    <FaFileAlt size={18} />
                  </div>
                  <div>
                    <p style={{ color: 'var(--city-muted)', margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{t('hc.terminos_y_condiciones', 'TÉRMINOS Y CONDICIONES')}</p>
                    <h2 style={{ color: 'var(--city-text)', margin: 0, fontSize: 18, fontWeight: 800 }}>{t('hc.detalle_de_la_oferta', 'Detalle de la Oferta')}</h2>
                  </div>
                </div>
                <button type="button" onClick={() => setConditionsModal(null)} style={closeBtnStyle}>&times;</button>
              </div>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'var(--city-bg, #f8fafc)', borderRadius: 12, padding: '14px 16px', border: '1.5px solid var(--city-border, #cbd5e1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <strong style={{ fontSize: 15, color: 'var(--brand-primary, #2563eb)' }}>{conditionsModal.codigo}</strong>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>{labelDiscount(conditionsModal)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--city-text, #0f172a)', fontWeight: 500 }}>{conditionsModal.nombre}</p>
                </div>
  
                <div>
                  <strong style={{ fontSize: 12.5, display: 'block', marginBottom: 6, color: 'var(--city-text, #0f172a)', fontWeight: 600 }}>
                    Condiciones aplicables:
                  </strong>
                  <div style={{ background: 'var(--city-bg, #f8fafc)', border: '1.5px solid var(--city-border, #cbd5e1)', borderRadius: 10, padding: 14, fontSize: 13, color: 'var(--city-text, #334155)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {conditionsModal.condiciones || t('admin.promotions.noCond', 'Sin condiciones especiales')}
                  </div>
                </div>
  
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                  <div style={{ padding: 10, borderRadius: 8, background: 'var(--city-bg, #f8fafc)', border: '1px solid var(--city-border, #cbd5e1)' }}>
                    <span style={{ color: 'var(--city-muted, #64748b)', display: 'block' }}>Vigencia:</span>
                    <strong style={{ color: 'var(--city-text)' }}>{conditionsModal.fechaInicio} al {conditionsModal.fechaFin}</strong>
                  </div>
                  <div style={{ padding: 10, borderRadius: 8, background: 'var(--city-bg, #f8fafc)', border: '1px solid var(--city-border, #cbd5e1)' }}>
                    <span style={{ color: 'var(--city-muted, #64748b)', display: 'block' }}>{t('hc.monto_minimo', 'Monto Mínimo:')}</span>
                    <strong style={{ color: 'var(--city-text)' }}>{conditionsModal.reservaMinima > 0 ? formatCurrency(conditionsModal.reservaMinima, moneda, tasaUSD) : t('hc2.sin_minimo', 'Sin mínimo')}</strong>
                  </div>
                  <div style={{ padding: 10, borderRadius: 8, background: 'var(--city-bg, #f8fafc)', border: '1px solid var(--city-border, #cbd5e1)' }}>
                    <span style={{ color: 'var(--city-muted, #64748b)', display: 'block' }}>Alcance:</span>
                    <strong style={{ color: 'var(--city-text)' }}>{labelTarget(conditionsModal)}</strong>
                  </div>
                  <div style={{ padding: 10, borderRadius: 8, background: 'var(--city-bg, #f8fafc)', border: '1px solid var(--city-border, #cbd5e1)' }}>
                    <span style={{ color: 'var(--city-muted, #64748b)', display: 'block' }}>{t('hc.clasificacion', 'Clasificación:')}</span>
                    <strong style={{ color: 'var(--city-text)' }}>{conditionsModal.tipoOferta === 'promocion' ? t('hc2.promocion', 'Promoción') : t('hc2.cupon', 'Cupón')} {conditionsModal.destacada ? '• Destacada' : ''}</strong>
                  </div>
                  {conditionsModal.branchName && (
                    <div style={{ padding: 10, borderRadius: 8, background: 'var(--city-bg, #f8fafc)', border: '1px solid var(--city-border, #cbd5e1)', gridColumn: 'span 2' }}>
                      <span style={{ color: 'var(--city-muted, #64748b)', display: 'block' }}>{t('hc.sucursal_asignada', 'Sucursal Asignada:')}</span>
                      <strong style={{ color: 'var(--brand-primary, #2563eb)' }}>{conditionsModal.branchName}</strong>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ padding: '14px 24px', borderTop: '1px solid var(--city-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setConditionsModal(null)}
                  style={{ padding: '8px 22px', borderRadius: 9999, background: 'var(--brand-primary, #2563eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800 }}
                >
                  Cerrar
                </button>
              </div>
            </section>
          </div>
  )
}
