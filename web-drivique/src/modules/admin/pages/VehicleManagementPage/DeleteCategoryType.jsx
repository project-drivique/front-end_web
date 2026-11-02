import { FaTimes, FaTrash } from 'react-icons/fa'

export default function DeleteCategoryType({ close, modal, removeCategory, t }) {
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
                      {t("categoriesManagement.deleteTitle", "Eliminar Categoría")}
                    </h3>
                    <p className="fleet-alert-message">
                      {t(
                        "categoriesManagement.deleteConfirm",
                        { defaultValue: '¿Estás seguro de que deseas eliminar la categoría "{{name}}"? Esta acción no se puede deshacer.', name: modal.category.nombre }
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
                        onClick={removeCategory}
                      >
                        {t("common.delete", "Eliminar")}
                      </button>
                    </div>
                  </div>
  )
}
