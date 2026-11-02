export default function ModalCrear({ errorModal, formCrear, handleCrearUsuario, setFormCrear, setModalCrear, sucursales, t }) {
  return (
    <div
              className="cities-modal-backdrop"
              onMouseDown={(e) => e.target === e.currentTarget && setModalCrear(false)}
            >
              <section className="cities-modal">
                <div className="cities-modal__head">
                  <div>
                    <p className="cities-eyebrow">{t('admin.usersPage.registerFormTitle', 'Formulario de Registro')}</p>
                    <h2>{t('admin.usersPage.createNewUserTitle')}</h2>
                  </div>
                  <button type="button" onClick={() => setModalCrear(false)}>
                    á—
                  </button>
                </div>
  
                <form onSubmit={handleCrearUsuario}>
                  <label>
                    {t('admin.usersPage.fullNameLabel')}:
                    <input
                      type="text"
                      required
                      value={formCrear.nombre}
                      onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })}
                    />
                  </label>
  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label>
                      {t('admin.usersPage.emailLabel')}:
                      <input
                        type="email"
                        required
                        value={formCrear.correo}
                        onChange={(e) => setFormCrear({ ...formCrear, correo: e.target.value })}
                      />
                    </label>
                    <label>
                      {t('admin.usersPage.phoneLabel')}:
                      <input
                        type="text"
                        required
                        value={formCrear.telefono}
                        onChange={(e) => setFormCrear({ ...formCrear, telefono: e.target.value })}
                      />
                    </label>
                  </div>
  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label>
                      {t('admin.usersPage.idNumberLabel')}:
                      <input
                        type="text"
                        required
                        value={formCrear.cedula}
                        onChange={(e) => setFormCrear({ ...formCrear, cedula: e.target.value })}
                      />
                    </label>
                    <label>
                      {t('admin.usersPage.userRoleLabel')}:
                      <select
                        value={formCrear.rol}
                        onChange={(e) => setFormCrear({ ...formCrear, rol: e.target.value })}
                      >
                        <option value="cliente">{t('admin.usersPage.clientRole')}</option>
                        <option value="encargado">{t('admin.usersPage.branchManagerRole')}</option>
                        <option value="administrador">{t('admin.usersPage.adminRole')}</option>
                      </select>
                    </label>
                  </div>
  
                  {formCrear.rol === 'encargado' && (
                    <label>
                      {t('admin.usersPage.assignedBranchLabel')}:
                      <select
                        value={formCrear.sucursal}
                        onChange={(e) => setFormCrear({ ...formCrear, sucursal: e.target.value })}
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
                    <button type="button" onClick={() => setModalCrear(false)}>
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
