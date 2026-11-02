import { FaTrash, FaExclamationTriangle } from 'react-icons/fa'

export default function ModalEliminar({ errorModal, handleEliminarIncidencia, modalEliminar, setModalEliminar, t }) {
  return (
    <div
              className="cities-modal-backdrop"
              onMouseDown={(e) => e.target === e.currentTarget && setModalEliminar(null)}
            >
              <section className="cities-modal">
                <div className="cities-delete-icon">
                  <FaTrash />
                </div>
                <h2>{t('admin.incidents.deleteConfirmTitle', 'Confirmar Eliminación de Reporte')}</h2>
                <p>
                  {t('admin.incidents.deleteConfirmDesc1', '¿Deseas eliminar el reporte')} <strong>{modalEliminar.codigo}</strong> (
                  {modalEliminar.vehiculo})?
                </p>
  
                {/* VALIDACIÓN 1: CLIENTES */}
                {modalEliminar.origen === 'cliente' && (
                  <div
                    style={{
                      background: '#fee2e2',
                      border: '1.5px solid #fca5a5',
                      color: '#991b1b',
                      padding: '12px 14px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 16,
                    }}
                  >
                    <FaExclamationTriangle style={{ marginRight: 6 }} />
                    {t('admin.incidents.clientReportDeleteError', 'Los reportes creados por los clientes no pueden ser eliminados por control de auditoría.')}
                  </div>
                )}
  
                {/* VALIDACIÓN 2: PROPIOS EN ESTADO DIFERENTE A RECIBIDO */}
                {modalEliminar.origen === 'administrador' && modalEliminar.estado !== 'recibido' && (
                  <div
                    style={{
                      background: '#fee2e2',
                      border: '1.5px solid #fca5a5',
                      color: '#991b1b',
                      padding: '12px 14px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 16,
                    }}
                  >
                    <FaExclamationTriangle style={{ marginRight: 6 }} />
                    {t('admin.incidents.ownReportStateDeleteError', 'No se puede eliminar un reporte propio que ya ha pasado a estado de revisión o reparación.')}
                  </div>
                )}
  
                {errorModal && <p className="cities-error">{errorModal}</p>}
  
                <div className="cities-modal__actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button 
                    type="button" 
                    className="incident-modal-btn-cancel"
                    onClick={() => setModalEliminar(null)}
                    style={{ 
                      background: 'var(--city-bg, #f1f5f9)', 
                      color: 'var(--city-muted, #475569)', 
                      border: '1.5px solid #cbd5e1', 
                      padding: '8px 20px', 
                      borderRadius: '9999px', 
                      fontWeight: 700, 
                      fontSize: '13px', 
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0' }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'var(--city-bg, #f1f5f9)' }}
                  >
                    {t('admin.incidents.cancel', 'Cancelar')}
                  </button>
                  <button
                    type="button"
                    className="cities-danger incident-modal-btn-delete"
                    disabled={
                      modalEliminar.origen === 'cliente' ||
                      (modalEliminar.origen === 'administrador' && modalEliminar.estado !== 'recibido')
                    }
                    onClick={() => handleEliminarIncidencia(modalEliminar)}
                    style={{ 
                      background: '#dc2626', 
                      color: 'var(--city-card, #ffffff)', 
                      border: 'none', 
                      padding: '8px 24px', 
                      borderRadius: '9999px', 
                      fontWeight: 800, 
                      fontSize: '13px', 
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                      opacity: modalEliminar.origen === 'cliente' || (modalEliminar.origen === 'administrador' && modalEliminar.estado !== 'recibido') ? 0.5 : 1,
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#b91c1c' }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#dc2626' }}
                  >
                    {t('admin.incidents.confirmDelete', 'Confirmar Eliminación')}
                  </button>
                </div>
              </section>
            </div>
  )
}
