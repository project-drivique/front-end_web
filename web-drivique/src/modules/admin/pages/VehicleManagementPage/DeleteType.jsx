import { FaTimes, FaTrash } from 'react-icons/fa'

export default function DeleteType({ close, modal, remove, t }) {
  return (
    <div className="fleet-alert-content">
                    <button
                      type="button"
                      className="fleet-alert-close-btn"
                      onClick={close}
                      aria-label={t("common.close", "Cerrar")}
                    >
                      <FaTimes size={13} />
                    </button>
                    <div className="fleet-alert-icon-wrapper is-danger">
                      <FaTrash size={20} />
                    </div>
                    <h3 className="fleet-alert-title">
                      {t("admin.vehiclesManagement.deleteTitle", "Eliminar Vehículo")}
                    </h3>
                    <p className="fleet-alert-message">
                      {t(
                        "admin.vehiclesManagement.deleteText",
                        t('hc3.vehicle_delete_confirm', { defaultValue: '¿Estás seguro de que deseas eliminar el vehículo {{nombre}}? Esta acción no se puede deshacer.', nombre: modal.vehicle.nombre }),
                        { vehicle: modal.vehicle.nombre }
                      )}
                    </p>
                    <div className="fleet-alert-actions">
                      <button
                        type="button"
                        className="fleet-alert-btn-secondary"
                        onClick={close}
                      >
                        {t("common.cancel", "Cancelar")}
                      </button>
                      <button
                        className="fleet-alert-btn-danger"
                        type="button"
                        onClick={remove}
                      >
                        {t("common.delete", "Eliminar")}
                      </button>
                    </div>
                  </div>
  )
}
