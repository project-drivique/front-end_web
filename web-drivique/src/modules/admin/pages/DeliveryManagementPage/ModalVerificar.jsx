import { FaKey } from 'react-icons/fa'

export default function ModalVerificar({ backdropStyle, closeBtnStyle, handleVerificar, modalHeadStyle, modalVerificar, pinIngresado, setModalVerificar, setPinIngresado, t }) {
  return (
    <div className="cities-modal-backdrop" style={backdropStyle} onMouseDown={e => e.target === e.currentTarget && (setModalVerificar(null), setPinIngresado(''))}>
              <section className="cities-modal" style={{ maxWidth: 400, background: 'var(--city-card)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={modalHeadStyle}>
                  <div>
                    <p style={{ color: 'var(--city-muted)', margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{t('admin.delivery.modal.verifyEyebrow', 'VALIDACION DE ENTREGA')}</p>
                    <h2 style={{ color: 'var(--city-text)', margin: 0, fontSize: 18, fontWeight: 800 }}>{t('admin.delivery.modal.verifyTitle', 'Verificar Codigo PIN')}</h2>
                  </div>
                  <button type="button" onClick={() => { setModalVerificar(null); setPinIngresado('') }} style={closeBtnStyle}>&times;</button>
                </div>
                <div style={{ padding: 24 }}>
                  <p style={{ fontSize: 13.5, color: 'var(--city-muted)', marginBottom: 14, lineHeight: 1.5 }}>{t('admin.delivery.modal.verifyDescription', 'El conductor solicita el PIN al cliente y lo digita aqui para confirmar la entrega.')}</p>
                  <div style={{ marginBottom: 18, padding: 14, background: 'var(--city-bg)', borderRadius: 10, border: '1.5px solid var(--city-border)' }}>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--city-muted)', marginBottom: 2 }}>{t('admin.delivery.modal.reservation', 'Reserva')} <strong style={{ color: 'var(--brand-primary, #2563eb)' }}>{modalVerificar.codigo}</strong></p>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--city-muted)' }}>{t('admin.delivery.modal.clientLabel', 'Cliente')} <strong style={{ color: 'var(--city-text)' }}>{modalVerificar.clienteNombre}</strong></p>
                  </div>
                  <form id="verificar-form" onSubmit={handleVerificar}>
                    <label style={{ display: 'block', textAlign: 'center', fontWeight: 700, color: 'var(--city-text)', fontSize: 13, marginBottom: 10 }}>
                      Código de Confirmación (6 caracteres alfanuméricos)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      autoCapitalize="characters"
                      placeholder="EJ: 3K8B7X"
                      value={pinIngresado}
                      onChange={e => setPinIngresado(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      required
                      autoFocus
                      style={{
                        width: '100%',
                        padding: 14,
                        fontSize: 26,
                        letterSpacing: 8,
                        textAlign: 'center',
                        borderRadius: 10,
                        border: '2px solid var(--brand-primary, #2563eb)',
                        background: 'var(--city-bg)',
                        color: 'var(--city-text)',
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontWeight: 800,
                        fontFamily: "'Courier New', Courier, monospace"
                      }}
                    />
                  </form>
                </div>
                <div style={{ padding: '14px 24px', borderTop: '1px solid var(--city-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" onClick={() => { setModalVerificar(null); setPinIngresado('') }} style={{ padding: '8px 18px', borderRadius: 9999, background: 'transparent', color: 'var(--city-muted)', border: '1.5px solid var(--city-border)', cursor: 'pointer', fontWeight: 700 }}>{t('admin.delivery.modal.cancelBtn', 'Cancelar')}</button>
                  <button type="submit" form="verificar-form" style={{ padding: '8px 22px', borderRadius: 9999, background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 5px rgba(22,163,74,0.3)' }}>
                    <FaKey style={{ fontSize: 12 }} />{t('admin.delivery.modal.verifySubmit', 'Verificar PIN')}
                  </button>
                </div>
              </section>
            </div>
  )
}
