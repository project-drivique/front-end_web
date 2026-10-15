import { useTranslation } from 'react-i18next'

export default function RolePermissionsModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  form,
  setForm,
  permissionList = [],
  onTogglePermiso,
  errorModal,
  roleItem,
}) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div
      className="cities-modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section className="cities-modal" style={{ maxWidth: 680 }}>
        <div className="cities-modal__head">
          <div>
            <p className="cities-eyebrow">
              {t('admin.rolesPage.securityConfigEyebrow', 'Configuración de Seguridad y Accesos')}
            </p>
            <h2>
              {isEditing
                ? t('admin.rolesPage.editPermissionsTitle', {
                    nombre: roleItem
                      ? t(`admin.rolesPage.role_name_${roleItem.id}`, roleItem.nombre)
                      : form.nombre,
                  })
                : t('admin.rolesPage.createRoleTitle', 'Crear Rol Personalizado')}
            </h2>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <label>
            {t('admin.rolesPage.labelRoleName', 'Nombre del Rol')}
            <input
              type="text"
              required
              value={form.id ? t(`admin.rolesPage.role_name_${form.id}`, form.nombre) : form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </label>

          <label>
            {t('admin.rolesPage.labelDescription', 'Descripción del Rol')}
            <input
              type="text"
              required
              value={form.id ? t(`admin.rolesPage.role_desc_${form.id}`, form.descripcion) : form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </label>

          {/* PERMISOS DEL SISTEMA (los que existen realmente en el servidor) */}
          <div className="permission-matrix-wrap">
            <table className="permission-matrix-table">
              <thead>
                <tr>
                  <th>{t('admin.rolesPage.permissionColumn', 'Permiso')}</th>
                  <th>{t('admin.rolesPage.permissionGranted', 'Concedido')}</th>
                </tr>
              </thead>
              <tbody>
                {permissionList.map((permiso) => (
                  <tr key={permiso.codigo}>
                    <td>
                      <strong>{permiso.nombre}</strong>
                      <br />
                      <small>{permiso.codigo}</small>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={Boolean(form.permisos?.[permiso.codigo])}
                        onChange={() => onTogglePermiso(permiso.codigo)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {errorModal && <p className="cities-error">{errorModal}</p>}

          <div className="cities-modal__actions">
            <button type="button" onClick={onClose}>
              {t('admin.rolesPage.btnCancel', 'Cancelar')}
            </button>
            <button type="submit" className="cities-primary">
              {isEditing
                ? t('admin.rolesPage.btnSavePermissions', 'Guardar Permisos')
                : t('admin.rolesPage.btnCreateRole', 'Crear Rol')}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
