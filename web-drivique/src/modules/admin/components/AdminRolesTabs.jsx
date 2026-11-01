import {
  FaEdit,
  FaEnvelope,
  FaFileExcel,
  FaFilePdf,
  FaPhone,
  FaPrint,
  FaSearch,
  FaToggleOff,
  FaToggleOn,
  FaTrash,
  FaUserShield,
} from 'react-icons/fa'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'

export function AdminAccountsSection({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  rolesList,
  statusFilter,
  setStatusFilter,
  branchFilter,
  setBranchFilter,
  sucursales,
  exportDataAccounts,
  cuentasFiltradas,
  openEditarCuenta,
  handleToggleActivoCuenta,
  setErrorModal,
  setModalEliminarCuenta,
  t,
}) {
  return (
    <section className="cities-card">
      <div className="cities-toolbar">
        <label className="cities-search">
          <FaSearch />
          <input
            type="text"
            placeholder={t('admin.rolesPage.searchAccPlaceholder', 'Buscar por nombre, correo, ID o sucursal...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">{t('admin.rolesPage.allRoles', 'Todos los Roles')}</option>
          {rolesList.map((r) => (
            <option key={r.id} value={r.id}>
              {t(`admin.rolesPage.role_name_${r.id}`, r.nombre)}
            </option>
          ))}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">{t('admin.rolesPage.allStatuses', 'Todos los Estados')}</option>
          <option value="active">{t('hc4.activas', 'Activas')}</option>
          <option value="inactive">{t('hc4.inactivas', 'Inactivas')}</option>
        </select>

        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
          <option value="all">{t('admin.rolesPage.allBranches', 'Todas las Sucursales')}</option>
          {sucursales.map((s) => (
            <option key={s.id} value={s.nombre}>
              {s.nombre}
            </option>
          ))}
        </select>

        <div className="cities-export">
          <button type="button" onClick={() => exportExcel(exportDataAccounts)}>
            <FaFileExcel /> {t('admin.rolesPage.excel', 'Excel')}
          </button>
          <button type="button" onClick={() => exportPdf(exportDataAccounts)}>
            <FaFilePdf /> {t('admin.rolesPage.pdf', 'PDF')}
          </button>
          <button type="button" onClick={() => printTable(exportDataAccounts)}>
            <FaPrint /> {t('admin.rolesPage.print', 'Imprimir')}
          </button>
        </div>
      </div>

      <div className="cities-summary">
        <strong>{cuentasFiltradas.length}</strong> {t('admin.rolesPage.accountsFoundCount', 'cuentas encontradas')}
      </div>

      {cuentasFiltradas.length === 0 ? (
        <div className="cities-empty">
          <FaUserShield />
          <h2>{t('admin.rolesPage.noAccountsFound', 'No se encontraron cuentas')}</h2>
          <p>{t('hc.ajusta_el_termino_de_busqueda_o_cambia', 'Ajusta el término de búsqueda o cambia los filtros seleccionados.')}</p>
        </div>
      ) : (
        <div className="cities-table-wrap">
          <table className="roles-accounts-table">
            <thead>
              <tr>
                <th>{t('admin.rolesPage.colaborador', 'Colaborador')}</th>
                <th>{t('admin.rolesPage.contacto', 'Contacto')}</th>
                <th>{t('admin.rolesPage.rolAsignado', 'Rol Asignado')}</th>
                <th>{t('hc4.sucursal', 'Sucursal')}</th>
                <th>{t('hc.estado_cuenta', 'Estado Cuenta')}</th>
                <th>{t('admin.rolesPage.tableActions', 'Acciones')}</th>
              </tr>
            </thead>
            <tbody>
              {cuentasFiltradas.map((acc) => (
                <tr key={acc.id}>
                  <td>
                    <div className="cities-name">
                      <span>
                        <FaUserShield />
                      </span>
                      <div>
                        <span style={{ fontSize: 13, color: 'var(--city-text, #0f172a)' }}>{acc.nombre}</span>
                        <small style={{ color: 'var(--city-muted, #64748b)', fontWeight: 600 }}>{acc.id}</small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--city-text, #0f172a)' }}>
                        <FaEnvelope size={11} color="var(--city-muted, #64748b)" />
                        <span>{acc.correo}</span>
                      </div>
                      {acc.telefono && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--city-muted, #64748b)' }}>
                          <FaPhone size={10} />
                          <span>{acc.telefono}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td>
                    <span style={{ fontSize: 13, color: 'var(--city-text, #0f172a)' }}>{acc.rolNombre}</span>
                  </td>

                  <td>
                    <span style={{ fontSize: 13, color: 'var(--city-text, #0f172a)' }}>
                      {acc.sucursal ? acc.sucursal : t('hc2.global_todas', 'Global (Todas)')}
                    </span>
                  </td>

                  <td>
                    <span className={`user-account-badge ${acc.activo ? 'activo' : 'inactivo'}`}>
                      <span className="user-account-dot" />
                      {acc.activo ? t('admin.rolesPage.active', 'Activo') : t('admin.rolesPage.inactive', 'Inactivo')}
                    </span>
                  </td>

                  <td>
                    <div className="cities-row-actions">
                      <button
                        type="button"
                        onClick={() => openEditarCuenta(acc)}
                        title={t('admin.rolesPage.actionEditAccount', 'Editar')}
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActivoCuenta(acc)}
                        title={
                          acc.activo
                            ? t('admin.rolesPage.actionDeactivateAccount', 'Desactivar')
                            : t('admin.rolesPage.actionActivateAccount', 'Activar')
                        }
                        style={{ color: acc.activo ? '#16a34a' : '#94a3b8' }}
                      >
                        {acc.activo ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                      </button>
                      <button
                        className="is-danger"
                        type="button"
                        onClick={() => {
                          setErrorModal('')
                          setModalEliminarCuenta(acc)
                        }}
                        title={t('admin.rolesPage.actionDeleteAccount', 'Eliminar')}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export function AdminRolesGridSection({
  search,
  setSearch,
  rolesFiltrados,
  openEditarRol,
  setErrorModal,
  setModalEliminarRol,
  t,
}) {
  return (
    <section className="cities-card">
      <div className="cities-toolbar">
        <label className="cities-search">
          <FaSearch />
          <input
            type="text"
            placeholder={t('admin.rolesPage.searchRoleDesc', 'Buscar rol por nombre o descripción...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      <div className="roles-grid">
        {rolesFiltrados.map((role) => (
          <div key={role.id} className="role-card">
            <div>
              <div className="role-card__head">
                <h3>{t(`admin.rolesPage.role_name_${role.id}`, role.nombre)}</h3>
                <span>
                  {role.cuentasAsignadas} {t('admin.rolesPage.accountsCount', 'Cuentas')}
                </span>
              </div>
              <p>{t(`admin.rolesPage.role_desc_${role.id}`, role.descripcion)}</p>
            </div>

            <div className="role-card__actions">
              <button
                type="button"
                className="cities-primary"
                style={{ padding: '8px 14px', fontSize: 12 }}
                onClick={() => openEditarRol(role)}
              >
                <FaEdit /> {t('admin.rolesPage.configPermissions', 'Configurar Permisos')}
              </button>

              {!role.esSistema && (
                <button
                  type="button"
                  className="cities-danger"
                  style={{ padding: '8px 12px', fontSize: 12 }}
                  onClick={() => {
                    setErrorModal('')
                    setModalEliminarRol(role)
                  }}
                >
                  <FaTrash />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
