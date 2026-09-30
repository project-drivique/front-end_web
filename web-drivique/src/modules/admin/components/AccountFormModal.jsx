import { useTranslation } from 'react-i18next'

export default function AccountFormModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  form,
  setForm,
  rolesList,
  sucursales,
  errorModal,
}) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div
      className="cities-modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section className="cities-modal">
        <div className="cities-modal__head">
          <div>
            <p className="cities-eyebrow">
              {isEditing
                ? t('admin.rolesPage.configColaborador', 'Configuración de Colaborador')
                : t('admin.rolesPage.altaColaborador', 'Alta de Colaborador')}
            </p>
            <h2>
              {isEditing
                ? t('admin.rolesPage.editAccountTitle', 'Editar Cuenta Administrativa')
                : t('admin.rolesPage.createAccountTitle', 'Crear Cuenta Administrativa')}
            </h2>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <label>
            {t('admin.rolesPage.labelFullName', 'Nombre Completo')}
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              {t('admin.rolesPage.corpEmail', 'Correo Corporativo')}
              <input
                type="email"
                required
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
              />
            </label>
            <label>
              {t('admin.rolesPage.labelPhone', 'Teléfono de Contacto')}
              <input
                type="text"
                required
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </label>
          </div>

          <label>
            {t('admin.rolesPage.labelAssignedRole', 'Rol Asignado')}
            <select
              value={form.rolId}
              onChange={(e) => setForm({ ...form, rolId: e.target.value })}
            >
              {rolesList.map((r) => (
                <option key={r.id} value={r.id}>
                  {t(`admin.rolesPage.role_name_${r.id}`, r.nombre)}
                </option>
              ))}
            </select>
          </label>

          {(form.rolId === 'role-encargado' ||
            rolesList.find((r) => r.id === form.rolId)?.codigo === 'encargado_sucursal') && (
            <label>
              {t('admin.rolesPage.assignedBranch', 'Sucursal Asignada (Obligatoria)')}:
              <select
                value={form.sucursal}
                onChange={(e) => setForm({ ...form, sucursal: e.target.value })}
              >
                {sucursales.map((s) => (
                  <option key={s.id} value={s.nombre}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </label>
          )}

          {errorModal && <p className="cities-error">{errorModal}</p>}

          <div className="cities-modal__actions">
            <button type="button" onClick={onClose}>
              {t('admin.rolesPage.btnCancel', 'Cancelar')}
            </button>
            <button type="submit" className="cities-primary">
              {isEditing
                ? t('admin.rolesPage.btnSaveAccount', 'Guardar Cambios')
                : t('admin.rolesPage.btnCreateAccount', 'Crear Cuenta')}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
