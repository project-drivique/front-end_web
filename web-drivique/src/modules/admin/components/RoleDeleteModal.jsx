import { useTranslation } from 'react-i18next'
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa'

export default function RoleDeleteModal({
  item,
  type = 'account', // 'account' | 'role'
  onClose,
  onConfirm,
  errorModal,
}) {
  const { t } = useTranslation()

  if (!item) return null

  const isAccount = type === 'account'

  return (
    <div
      className="cities-modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section className="cities-modal">
        <div className="cities-delete-icon">
          <FaTrash />
        </div>
        <h2>
          {isAccount
            ? t('admin.rolesPage.confirmDeleteAccountTitle', '¿Eliminar Cuenta?')
            : t('admin.rolesPage.confirmDeleteRoleTitle', '¿Eliminar Rol?')}
        </h2>
        <p>
          {isAccount ? (
            <>
              {t('admin.rolesPage.confirmDeleteAccountText', '¿Estás seguro de que deseas eliminar permanentemente a')}{' '}
              <strong>{item.nombre}</strong> ({item.correo})?
            </>
          ) : (
            <>
              {t('admin.rolesPage.confirmDeleteRoleText', '¿Estás seguro de que deseas eliminar permanentemente el rol')}{' '}
              <strong>{item.nombre}</strong>?
            </>
          )}
        </p>

        {!isAccount && item.cuentasAsignadas > 0 && (
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
            {t('admin.rolesPage.roleDeleteWarning1', 'No puedes eliminar este rol porque tiene')}{' '}
            {item.cuentasAsignadas}{' '}
            {t('admin.rolesPage.roleDeleteWarning2', 'cuentas asignadas. Reasigna las cuentas primero.')}
          </div>
        )}

        {errorModal && <p className="cities-error">{errorModal}</p>}

        <div className="cities-modal__actions">
          <button type="button" onClick={onClose}>
            {t('admin.rolesPage.btnCancel', 'Cancelar')}
          </button>
          <button
            className="cities-danger"
            type="button"
            disabled={!isAccount && item.cuentasAsignadas > 0}
            onClick={() => onConfirm(item)}
          >
            {t('admin.rolesPage.btnConfirmDelete', 'Confirmar Eliminación')}
          </button>
        </div>
      </section>
    </div>
  )
}
