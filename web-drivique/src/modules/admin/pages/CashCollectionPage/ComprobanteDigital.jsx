import { FaTimes, FaCheckCircle, FaDownload, FaPrint } from 'react-icons/fa'
import { formatCurrency } from '../../../../utils/currencyUtils'
import { format } from 'date-fns'

export default function ComprobanteDigital({ comprobanteDigital, handleDescargarComprobante, handleImprimirComprobante, moneda, setComprobanteDigital, t, tasaUSD }) {
  return (
    <div
            className="cities-modal-backdrop"
            onMouseDown={(e) => e.target === e.currentTarget && setComprobanteDigital(null)}
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <section
              className="wompi-replica-modal"
              role="dialog"
            >
              {/* Botón de cierre discreto */}
              <button
                onClick={() => setComprobanteDigital(null)}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  color: '#9ca3af',
                  cursor: 'pointer'
                }}
              >
                <FaTimes />
              </button>
  
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: '#00a650', color: '#fff', fontSize: '28px', marginBottom: '16px' }}>
                  <FaCheckCircle />
                </div>
                <h2 style={{ fontSize: '22px', color: '#111827', fontWeight: 700, margin: '0 0 8px 0' }}>{t('admin.cash.modal.paymentApprovedTitle', '¡Pago aprobado!')}</h2>
                <div style={{ fontSize: '32px', color: '#00a650', fontWeight: 800, margin: '0 0 8px 0' }}>
                  {formatCurrency(Number(comprobanteDigital.totalCOP || comprobanteDigital.total || 0), moneda, tasaUSD)}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {format(new Date(), 'dd/MM/yyyy - HH:mm')}
                </div>
              </div>
  
              <div className="bg-success-light" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', textAlign: 'center', marginBottom: '32px' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>
                  Hemos registrado tu pago.<br/>
                  Guarda estos datos por si necesitas consultar tu compra.<br/>
                  También te enviamos un comprobante a <strong>{comprobanteDigital.clienteCorreo || comprobanteDigital.clienteEmail || '—'}</strong>
                </p>
              </div>
  
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '15px', color: '#111827', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                  {t('admin.cash.modal.transactionInfo', 'Información de la transacción')}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                  <span style={{ color: '#4b5563' }}>{t('hc4.referencia', 'Referencia')}</span>
                  <span style={{ color: '#111827', fontWeight: 500, textAlign: 'right', wordBreak: 'break-all', maxWidth: '60%' }}>
                    {comprobanteDigital.codigo || comprobanteDigital.referencia || comprobanteDigital.id}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                  <span style={{ color: '#4b5563' }}>{t('hc.metodo_de_pago', 'Método de pago')}</span>
                  <span style={{ color: '#111827', fontWeight: 600 }}>
                    {t('admin.cash.modal.onlinePayment', 'Pago en línea (Wompi)')}
                  </span>
                </div>
              </div>
  
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '15px', color: '#111827', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                  {t('admin.cash.modal.payerInfo', 'Información del pagador')}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                  <span style={{ color: '#4b5563' }}>{t('hc4.nombre', 'Nombre')}</span>
                  <span style={{ color: '#111827', fontWeight: 500 }}>
                    {comprobanteDigital.clienteNombre || '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                  <span style={{ color: '#4b5563' }}>{t('hc.telefono', 'Teléfono')}</span>
                  <span style={{ color: '#111827', fontWeight: 500 }}>
                    {comprobanteDigital.clienteTelefono || '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                  <span style={{ color: '#4b5563' }}>Email</span>
                  <span style={{ color: '#111827', fontWeight: 500 }}>{comprobanteDigital.clienteCorreo || comprobanteDigital.clienteEmail || '—'}</span>
                </div>
              </div>
  
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="cash-confirm-btn-primary"
                  onClick={() => handleDescargarComprobante(comprobanteDigital)}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, background: '#00a650', borderColor: '#00a650' }}
                >
                  <FaDownload /> {t('admin.cash.actions.download', 'Descargar')}
                </button>
                <button
                  type="button"
                  onClick={() => handleImprimirComprobante(comprobanteDigital)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    background: 'var(--city-soft, #f1f5f9)',
                    border: '1px solid var(--city-border, #cbd5e1)',
                    color: 'var(--city-text, #334155)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <FaPrint /> {t('admin.cash.modal.printReceiptBtn', 'Imprimir')}
                </button>
              </div>
  
            </section>
          </div>
  )
}
