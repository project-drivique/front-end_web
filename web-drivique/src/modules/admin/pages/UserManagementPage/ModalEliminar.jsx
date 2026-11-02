import { FaTrash, FaExclamationTriangle } from 'react-icons/fa'

export default function ModalEliminar({ errorModal, handleEliminarUsuario, modalEliminar, setModalEliminar, t }) {
  return (
    <div
              className="cities-modal-backdrop"
              onMouseDown={(e) => e.target === e.currentTarget && setModalEliminar(null)}
            >
              <section className="cities-modal">
                <div className="cities-delete-icon">
                  <FaTrash />
                </div>
                <h2>{t('hc.confirmar_eliminacion_de_usuario', 'Confirmar Eliminación de Usuario')}</h2>
                <p>
                  ¿Estás seguro de que deseas eliminar a <strong>{modalEliminar.nombre}</strong> (
                  {modalEliminar.correo})?
                </p>
  
                {modalEliminar.reservasActivas > 0 && (
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
                    No es posible eliminar este usuario porque tiene {modalEliminar.reservasActivas} reserva(s)
                    activa(s).
                  </div>
                )}
  
                {errorModal && <p className="cities-error">{errorModal}</p>}
  
                <div className="cities-modal__actions">
                  <button type="button" onClick={() => setModalEliminar(null)}>
                    Cancelar
                  </button>
                  <button
                    className="cities-danger"
                    type="button"
                    disabled={modalEliminar.reservasActivas > 0}
                    onClick={() => handleEliminarUsuario(modalEliminar)}
                  >
                    Confirmar Eliminación
                  </button>
                </div>
              </section>
            </div>
  )
}
