import { FaTimes, FaMoneyBillWave, FaShieldAlt, FaDownload, FaPrint } from 'react-icons/fa'
import { formatCurrency } from '../../../../utils/currencyUtils'
import { format } from 'date-fns'

export default function ModalReserva({ esCobradoEnSucursal, handleConfirmarCobro, handleDescargarComprobante, handleImprimirComprobante, isBranchManager, modalReserva, moneda, observacionesCaja, procesandoPago, setModalReserva, setObservacionesCaja, t, tasaUSD }) {
  return (
    <div
            className="cities-modal-backdrop"
            onMouseDown={(e) => e.target === e.currentTarget && setModalReserva(null)}
          >
            <section className="cities-modal cash-modal" role="dialog" style={{ maxWidth: 440, borderRadius: '16px' }}>
              <div className="cities-modal__head" style={{ borderBottom: 'none', paddingBottom: 0, paddingTop: '16px', paddingRight: '16px' }}>
                <div></div>
                <button type="button" onClick={() => setModalReserva(null)} style={{ background: 'transparent', border: 'none', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280', fontSize: '20px' }}>
                  <FaTimes />
                </button>
              </div>
  
              <div className="cash-modal-body" style={{ padding: '0 24px 24px 24px' }}>
                {!esCobradoEnSucursal(modalReserva) ? (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <div style={{ width: '48px', height: '48px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#f59e0b', fontSize: '24px' }}>
                        <FaMoneyBillWave />
                      </div>
                      <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#111827', fontWeight: 700 }}>{t('admin.cash.modal.confirmCashTitle', 'Confirmar cobro en efectivo')}</h2>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>{t('admin.cash.modal.confirmCashSubtitle', 'Verifica los datos antes de registrar el ingreso en caja.')}</p>
                    </div>
  
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                        <span style={{ color: '#6b7280' }}>{t('admin.cash.modal.reference', 'Referencia')}</span>
                        <strong style={{ color: '#111827' }}>{modalReserva.codigo || modalReserva.referencia || modalReserva.id}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                        <span style={{ color: '#6b7280' }}>{t('admin.cash.modal.customer', 'Cliente')}</span>
                        <strong style={{ color: '#111827', textAlign: 'right' }}>{modalReserva.clienteNombre || t('hc2.cliente_registrado', 'Cliente Registrado')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                        <span style={{ color: '#6b7280' }}>{t('admin.cash.modal.vehicle', 'Vehículo')}</span>
                        <strong style={{ color: '#111827', textAlign: 'right' }}>{modalReserva.vehiculoNombre || t('hc2.vehiculo_reservado', 'Vehículo Reservado')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #e5e7eb', fontSize: '15px', alignItems: 'center' }}>
                        <span style={{ color: '#374151', fontWeight: 600 }}>{t('admin.cash.modal.totalToCollect', 'Total a cobrar')}</span>
                        <strong style={{ color: '#10b981', fontSize: '20px', fontWeight: 800 }}>
                          {formatCurrency(Number(modalReserva.totalCOP || modalReserva.total || 0), moneda, tasaUSD)}
                        </strong>
                      </div>
                    </div>
  
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 600 }}>
                        {t('admin.cash.modal.observations', 'Observaciones (opcional)')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('admin.cash.modal.observationsPlaceholder', 'Ej. Billetes verificados...')}
                        value={observacionesCaja}
                        onChange={(e) => setObservacionesCaja(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
  
                    {isBranchManager ? (
                      <button
                        type="button"
                        onClick={handleConfirmarCobro}
                        disabled={procesandoPago}
                        style={{ width: '100%', background: 'var(--brand-primary, #f59e0b)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: 600, cursor: procesandoPago ? 'not-allowed' : 'pointer', opacity: procesandoPago ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        {procesandoPago ? t('admin.cash.modal.recordingPayment', 'Registrando cobro...') : t('admin.cash.modal.confirmPayment', 'Confirmar pago')}
                      </button>
                    ) : (
                      <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>
                        <FaShieldAlt style={{ marginRight: 6 }} /> Solo el encargado puede registrar pagos.
                      </div>
                    )}
                  </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div className="cash-receipt-ticket">
                        <div className="ticket-edge" style={{
                          position: 'absolute', top: -6, left: 0, right: 0, height: 12,
                          backgroundSize: '16px 16px'
                        }}></div>
                        
                        <FaMoneyBillWave style={{ fontSize: 32, color: '#10b981', marginBottom: 12 }} />
                        <h3>{t('hc.recibo_de_caja', 'RECIBO DE CAJA')}</h3>
                        <p className="text-muted" style={{ margin: '0 0 20px 0', fontSize: 13 }}>{t('admin.cash.modal.branchPrefix', 'Sucursal')} {modalReserva.sucursalRetiro || 'Principal'}</p>
                        
                        <div className="ticket-dashed-border" style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '16px 0', margin: '0 0 20px 0', textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span className="text-muted" style={{ fontSize: 13 }}>{t('admin.cash.modal.reference', 'Referencia')}:</span>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{modalReserva.codigo || modalReserva.referencia || modalReserva.id}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span className="text-muted" style={{ fontSize: 13 }}>{t('admin.cash.modal.date', 'Fecha')}:</span>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{format(new Date(modalReserva.fechaPagoConfirmado || new Date().getTime()), 'dd/MM/yyyy - HH:mm')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span className="text-muted" style={{ fontSize: 13 }}>{t('admin.cash.modal.customer', 'Cliente')}:</span>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{modalReserva.clienteNombre || t('hc2.cliente_registrado', 'Cliente Registrado')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-muted" style={{ fontSize: 13 }}>{t('admin.cash.modal.cashier', 'Cajero')}:</span>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{modalReserva.cajeroConfirmacion || t('hc5.counter_manager', 'Encargado Mostrador')}</span>
                          </div>
                        </div>
  
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 16, fontWeight: 700 }}>{t('admin.cash.modal.totalPaid', 'TOTAL PAGADO')}</span>
                          <span style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{formatCurrency(Number(modalReserva.totalCOP || modalReserva.total || 0), moneda, tasaUSD)}</span>
                        </div>
                        <div className="text-muted" style={{ fontSize: 11, marginTop: 4, textAlign: 'right' }}>{t('admin.cash.modal.cashPayment', 'Pago en Efectivo')}</div>
  
                        {modalReserva.observacionesCaja && (
                          <div className="ticket-note" style={{ marginTop: 20, padding: 12, borderRadius: 6, fontSize: 12, textAlign: 'left' }}>
                            <strong>Nota:</strong> {modalReserva.observacionesCaja}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                        <button
                          type="button"
                          className="cash-confirm-btn-primary"
                          onClick={() => handleDescargarComprobante(modalReserva)}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', fontSize: '14px', fontWeight: 600 }}
                        >
                          <FaDownload /> {t('admin.cash.actions.download', 'Descargar')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleImprimirComprobante(modalReserva)}
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
                    </div>
                  )}
              </div>
            </section>
          </div>
  )
}
