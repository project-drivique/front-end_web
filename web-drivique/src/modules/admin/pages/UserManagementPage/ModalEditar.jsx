export default function ModalEditar({ errorModal, formEditar, handleEditarUsuario, modalEditar, setFormEditar, setModalEditar, sucursales, t }) {
  return (
    <div
              className="cities-modal-backdrop"
              onMouseDown={(e) => e.target === e.currentTarget && setModalEditar(null)}
            >
              <section className="cities-modal">
                <div className="cities-modal__head">
                  <div>
                    <p className="cities-eyebrow">{t('admin.usersPage.editProfileTitle', 'Edición de Perfil')}</p>
                    <h2>{t('admin.usersPage.editUserTitleOf', 'Editar Datos de {{nombre}}', { nombre: modalEditar.nombre })}</h2>
                  </div>
                  <button type="button" onClick={() => setModalEditar(null)}>
                    á—
                  </button>
                </div>
  
                <form onSubmit={handleEditarUsuario}>
                  <label>
                    {t('admin.usersPage.fullNameLabel')}:
                    <input
                      type="text"
                      required
                      value={formEditar.nombre}
                      onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })}
                    />
                  </label>
  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label>
                      {t('admin.usersPage.emailLabel')}:
                      <input
                        type="email"
                        required
                        value={formEditar.correo}
                        onChange={(e) => setFormEditar({ ...formEditar, correo: e.target.value })}
                      />
                    </label>
                    <label>
                      {t('admin.usersPage.phoneLabel')}:
                      <input
                        type="text"
                        required
                        value={formEditar.telefono}
                        onChange={(e) => setFormEditar({ ...formEditar, telefono: e.target.value })}
                      />
                    </label>
                  </div>
  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label>
                      {t('admin.usersPage.tableId')}:
                      <input
                        type="text"
                        value={formEditar.cedula}
                        onChange={(e) => setFormEditar({ ...formEditar, cedula: e.target.value })}
                      />
                    </label>
                    <label>
                      {t('admin.usersPage.userRoleLabel')}:
                      <select
                        value={formEditar.rol}
                        onChange={(e) => setFormEditar({ ...formEditar, rol: e.target.value })}
                      >
                        <option value="cliente">{t('admin.usersPage.clientRole')}</option>
                        <option value="encargado">{t('admin.usersPage.branchManagerRole')}</option>
                        <option value="administrador">{t('admin.usersPage.adminRole')}</option>
                      </select>
                    </label>
                  </div>
  
                  {formEditar.rol === 'encargado' && (
                    <label>
                      {t('admin.usersPage.assignedBranchLabel')}:
                      <select
                        value={formEditar.sucursal}
                        onChange={(e) => setFormEditar({ ...formEditar, sucursal: e.target.value })}
                      >
                        <option value="">{t('admin.usersPage.noBranch', 'Sin asignar (asignar luego)')}</option>
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
                    <button type="button" onClick={() => setModalEditar(null)}>
                      {t('admin.usersPage.cancelBtn')}
                    </button>
                    <button type="submit" className="cities-primary">
                      {t('admin.usersPage.saveUserBtn')}
                    </button>
                  </div>
                </form>
              </section>
            </div>
  )
}
