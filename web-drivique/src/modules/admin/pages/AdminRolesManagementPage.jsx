import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaEdit,
  FaFileExcel,
  FaFilePdf,
  FaKey,
  FaPlus,
  FaPrint,
  FaSearch,
  FaToggleOff,
  FaToggleOn,
  FaTrash,
  FaUserPlus,
  FaUserShield,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useBrand } from '../../../contexts/BrandContext'
import { roleManagementService } from '../../../services/roleManagementService'
import { branchManagementService } from '../../../services/branchManagementService'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import AccountFormModal from '../components/AccountFormModal'
import RolePermissionsModal from '../components/RolePermissionsModal'
import RoleDeleteModal from '../components/RoleDeleteModal'
import './CityManagementPage.css'
import './AdminRolesManagementPage.css'

export default function AdminRolesManagementPage() {
  const { t } = useTranslation()

  const { tema } = useLanding()
  const { brand } = useBrand()
  const esModoOscuro = tema === 'oscuro'

  const [activeTab, setActiveTab] = useState('accounts') // 'accounts' | 'roles'
  const [accountsList, setAccountsList] = useState([])
  const [rolesList, setRolesList] = useState([])
  const [permissionList, setPermissionList] = useState([])
  const [search, setSearch] = useState('')

  // Filtros Cuentas
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('all')

  const [notice, setNotice] = useState('')
  const [errorModal, setErrorModal] = useState('')

  // Modales Cuentas
  const [modalCrearCuenta, setModalCrearCuenta] = useState(false)
  const [modalEditarCuenta, setModalEditarCuenta] = useState(null)
  const [modalEliminarCuenta, setModalEliminarCuenta] = useState(null)

  // Modales Roles
  const [modalCrearRol, setModalCrearRol] = useState(false)
  const [modalEditarRol, setModalEditarRol] = useState(null)
  const [modalEliminarRol, setModalEliminarRol] = useState(null)

  // Formularios Cuentas
  const [formCuenta, setFormCuenta] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    rolId: '',
    sucursal: '',
  })

  // Formularios Roles
  const [formRol, setFormRol] = useState({
    nombre: '',
    descripcion: '',
    permisos: {},
  })

  const [sucursales, setSucursales] = useState([])

  const cargarDatos = () => {
    setAccountsList(roleManagementService.listAccounts())
    setRolesList(roleManagementService.listRoles())
    setPermissionList(roleManagementService.listPermissions())
  }

  useEffect(() => {
    roleManagementService.refresh().then(cargarDatos).catch(() => {
      setAccountsList([])
      setRolesList([])
    })
    branchManagementService.refresh()
      .then(() => setSucursales(branchManagementService.list().sort((a, b) => a.nombre.localeCompare(b.nombre))))
      .catch(() => setSucursales([]))
  }, [])

  // Filtrado de Cuentas
  const cuentasFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase()
    return accountsList.filter((acc) => {
      const matchRole = roleFilter === 'all' || acc.rolId === roleFilter || acc.rolCodigo === roleFilter
      const matchStatus =
        statusFilter === 'all' || (statusFilter === 'active' ? acc.activo : !acc.activo)
      const matchBranch = branchFilter === 'all' || acc.sucursal === branchFilter

      const matchSearch =
        !term ||
        acc.nombre?.toLowerCase().includes(term) ||
        acc.correo?.toLowerCase().includes(term) ||
        acc.id?.toLowerCase().includes(term) ||
        acc.rolNombre?.toLowerCase().includes(term) ||
        acc.sucursal?.toLowerCase().includes(term)

      return matchRole && matchStatus && matchBranch && matchSearch
    })
  }, [accountsList, search, roleFilter, statusFilter, branchFilter])

  // Filtrado de Roles
  const rolesFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase()
    return rolesList.filter(
      (r) =>
        !term ||
        r.nombre?.toLowerCase().includes(term) ||
        r.descripcion?.toLowerCase().includes(term)
    )
  }, [rolesList, search])

  // --- Handlers Cuentas ---
  const handleCrearCuenta = async (e) => {
    e.preventDefault()
    try {
      setErrorModal('')
      await roleManagementService.createAccount(formCuenta)
      setNotice(
        t(
          'admin.roles.accountCreated',
          `Cuenta de ${formCuenta.nombre} creada exitosamente. Recibirá un código por correo para definir su contraseña.`
        )
      )
      setModalCrearCuenta(false)
      setFormCuenta({ nombre: '', correo: '', telefono: '', rolId: '', sucursal: '' })
      cargarDatos()
    } catch (err) {
      setErrorModal(err.message || 'Error al crear la cuenta administrativa.')
    }
  }

  const openEditarCuenta = (acc) => {
    setErrorModal('')
    setFormCuenta({
      id: acc.id,
      nombre: acc.nombre,
      correo: acc.correo,
      telefono: acc.telefono,
      rolId: acc.rolId,
      sucursal: acc.sucursal || '',
    })
    setModalEditarCuenta(acc)
  }

  const handleEditarCuenta = async (e) => {
    e.preventDefault()
    try {
      setErrorModal('')
      await roleManagementService.updateAccount(formCuenta.id, formCuenta)
      setNotice(t('admin.roles.accountUpdated', `Cuenta de ${formCuenta.nombre} actualizada.`))
      setModalEditarCuenta(null)
      cargarDatos()
    } catch (err) {
      setErrorModal(err.message || 'Error al actualizar la cuenta.')
    }
  }

  const handleToggleActivoCuenta = async (acc) => {
    try {
      await roleManagementService.toggleActiveAccount(acc.id)
    } catch (err) {
      setNotice(err.message)
      return
    }
    setNotice(
      t(
        acc.activo ? 'admin.roles.accountDeactivated' : 'admin.roles.accountActivated',
        `Cuenta de ${acc.nombre} ${acc.activo ? 'desactivada' : 'activada'}.`
      )
    )
    cargarDatos()
  }

  const handleEliminarCuenta = async (acc) => {
    try {
      await roleManagementService.removeAccount(acc.id)
    } catch (err) {
      setErrorModal(err.message)
      return
    }
    setNotice(t('admin.roles.accountDeleted', `Cuenta de ${acc.nombre} eliminada.`))
    setModalEliminarCuenta(null)
    cargarDatos()
  }

  // --- Handlers Roles ---
  const handleCrearRol = async (e) => {
    e.preventDefault()
    try {
      setErrorModal('')
      await roleManagementService.createRole(formRol)
      setNotice(t('admin.roles.roleCreated', `Rol ${formRol.nombre} creado exitosamente.`))
      setModalCrearRol(false)
      cargarDatos()
    } catch (err) {
      setErrorModal(err.message || 'Error al crear el rol.')
    }
  }

  const openEditarRol = (r) => {
    setErrorModal('')
    setFormRol({
      id: r.id,
      nombre: r.nombre,
      descripcion: r.descripcion,
      permisos: r.permisos,
    })
    setModalEditarRol(r)
  }

  const handleEditarRol = async (e) => {
    e.preventDefault()
    try {
      setErrorModal('')
      await roleManagementService.updateRole(formRol.id, formRol)
      setNotice(t('admin.roles.roleUpdated', `Permisos del rol ${formRol.nombre} actualizados.`))
      setModalEditarRol(null)
      cargarDatos()
    } catch (err) {
      setErrorModal(err.message || 'Error al actualizar el rol.')
    }
  }

  const handleEliminarRol = async (r) => {
    try {
      setErrorModal('')
      await roleManagementService.removeRole(r.id)
      setNotice(t('admin.roles.roleDeleted', `Rol ${r.nombre} eliminado.`))
      setModalEliminarRol(null)
      cargarDatos()
    } catch (err) {
      setErrorModal(err.message || 'Error al eliminar el rol.')
    }
  }

  const handleTogglePermiso = (codigo) => {
    setFormRol((prev) => ({
      ...prev,
      permisos: { ...prev.permisos, [codigo]: !prev.permisos?.[codigo] },
    }))
  }

  // --- Exportación ---
  const headersExportAccounts = ['Nombre', 'Correo', 'Teléfono', 'Rol Asignado', 'Sucursal', 'Estado']
  const rowsExportAccounts = cuentasFiltradas.map((acc) => [
    acc.nombre,
    acc.correo,
    acc.telefono,
    acc.rolNombre,
    acc.sucursal || 'N/A',
    acc.activo ? 'Activo' : 'Inactivo',
  ])

  const exportDataAccounts = {
    title: `Cuentas Administrativas — Plataforma ${brand?.name || 'Drivique'}`,
    headers: headersExportAccounts,
    rows: rowsExportAccounts,
    items: cuentasFiltradas,
    filename: `cuentas-admin-${new Date().toISOString().slice(0, 10)}`,
  }

  return (
    <div className={`management-shell ${esModoOscuro ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar />
      <main className="management-main" style={{ padding: '24px 32px' }}>
        <div className="cities-container" style={{ maxWidth: '100%' }}>
          {/* Header Superior */}
          <header className="cities-topbar">
            <div>
              <p className="cities-eyebrow">{t('admin.management', 'Gestión de Seguridad')}</p>
              <h1>{t('admin.rolesTitle', 'Administradores y Permisos')}</h1>
              <p className="cities-subtitle">
                {t(
                  'admin.rolesSubtitle',
                  'Control de acceso, creación de cuentas administrativas y matriz de permisos por rol.'
                )}
              </p>
            </div>

            <div className="cities-topbar__actions">
              <MenuConfiguracion />
              {activeTab === 'accounts' ? (
                <button
                  className="cities-primary"
                  type="button"
                  onClick={() => {
                    setErrorModal('')
                    setFormCuenta({
                      nombre: '',
                      correo: '',
                      telefono: '',
                      rolId: rolesList[0]?.id || '',
                      sucursal: '',
                    })
                    setModalCrearCuenta(true)
                  }}
                >
                  <FaUserPlus /> {t('admin.rolesPage.newAccount', 'Nuevo')} Admin
                </button>
              ) : (
                <button
                  className="cities-primary"
                  type="button"
                  onClick={() => {
                    setErrorModal('')
                    setFormRol({
                      nombre: '',
                      descripcion: '',
                      permisos: {
                        vehicles: { ver: true, crear: false, editar: false, eliminar: false },
                        reservations: { ver: true, crear: false, editar: false, eliminar: false },
                        users: { ver: false, crear: false, editar: false, eliminar: false },
                        contracts: { ver: false, crear: false, editar: false, eliminar: false },
                        cities: { ver: false, crear: false, editar: false, eliminar: false },
                        branches: { ver: false, crear: false, editar: false, eliminar: false },
                        audit: { ver: false, crear: false, editar: false, eliminar: false },
                      },
                    })
                    setModalCrearRol(true)
                  }}
                >
                  <FaPlus /> {t('admin.rolesPage.createRoleTitle', 'Crear Nuevo Rol')}
                </button>
              )}
            </div>
          </header>

          {/* Notificación de Aviso */}
          {notice && (
            <div className="cities-notice" role="status">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice('')}>
                á—
              </button>
            </div>
          )}

          {/* Pestañas de Navegación */}
          <div className="roles-tabs">
            <button
              type="button"
              className={`roles-tab-btn ${activeTab === 'accounts' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('accounts')}
            >
              <FaUserShield /> {t('admin.rolesPage.adminAccountsTab', 'Cuentas Administrativas')} ({accountsList.length})
            </button>
            <button
              type="button"
              className={`roles-tab-btn ${activeTab === 'roles' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('roles')}
            >
              <FaKey /> {t('admin.rolesPage.rolesPermissionsTab', 'Roles y Permisos')} ({rolesList.length})
            </button>
          </div>

          {/* VISTA 1: CUENTAS ADMINISTRATIVAS */}
          {activeTab === 'accounts' && (
            <section className="cities-card">
              {/* Toolbar con Buscador y Filtros */}
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
                  <option value="active">Activas</option>
                  <option value="inactive">Inactivas</option>
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
                  <p>Ajusta el término de búsqueda o cambia los filtros seleccionados.</p>
                </div>
              ) : (
                <div className="cities-table-wrap">
                  <table className="roles-accounts-table">
                    <thead>
                      <tr>
                        <th>{t('admin.rolesPage.colaborador', 'Colaborador')}</th>
                        <th>{t('admin.rolesPage.contacto', 'Contacto')}</th>
                        <th>{t('admin.rolesPage.rolAsignado', 'Rol Asignado')}</th>
                        <th>Sucursal</th>
                        <th>Estado Cuenta</th>
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
                            <span style={{ fontSize: 13, color: 'var(--city-text, #0f172a)' }}>{acc.sucursal ? acc.sucursal : 'Global (Todas)'}</span>
                          </td>

                          <td>
                            <span className={`user-account-badge ${acc.activo ? 'activo' : 'inactivo'}`}>
                              <span className="user-account-dot" />
                              {acc.activo ? t('admin.rolesPage.active', 'Activo') : t('admin.rolesPage.inactive', 'Inactivo')}
                            </span>
                          </td>

                          <td>
                            <div className="cities-row-actions">
                              <button type="button" onClick={() => openEditarCuenta(acc)} title={t('admin.rolesPage.actionEditAccount', 'Editar')}>
                                <FaEdit />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleActivoCuenta(acc)}
                                title={acc.activo ? t('admin.rolesPage.actionDeactivateAccount', 'Desactivar') : t('admin.rolesPage.actionActivateAccount', 'Activar')}
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
          )}

          {/* VISTA 2: ROLES Y PERMISOS */}
          {activeTab === 'roles' && (
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
          )}
        </div>

        {/* MODAL CREAR CUENTA */}
        <AccountFormModal
          isOpen={modalCrearCuenta}
          onClose={() => setModalCrearCuenta(false)}
          onSubmit={handleCrearCuenta}
          isEditing={false}
          form={formCuenta}
          setForm={setFormCuenta}
          rolesList={rolesList}
          sucursales={sucursales}
          errorModal={errorModal}
        />

        {/* MODAL EDITAR CUENTA */}
        <AccountFormModal
          isOpen={Boolean(modalEditarCuenta)}
          onClose={() => setModalEditarCuenta(null)}
          onSubmit={handleEditarCuenta}
          isEditing={true}
          form={formCuenta}
          setForm={setFormCuenta}
          rolesList={rolesList}
          sucursales={sucursales}
          errorModal={errorModal}
        />

        {/* MODAL CREAR / EDITAR ROL Y MATRIZ DE PERMISOS */}
        <RolePermissionsModal
          isOpen={modalCrearRol || Boolean(modalEditarRol)}
          onClose={() => {
            setModalCrearRol(false)
            setModalEditarRol(null)
          }}
          onSubmit={modalEditarRol ? handleEditarRol : handleCrearRol}
          isEditing={Boolean(modalEditarRol)}
          form={formRol}
          setForm={setFormRol}
          permissionList={permissionList}
          onTogglePermiso={handleTogglePermiso}
          errorModal={errorModal}
          roleItem={modalEditarRol}
        />

        {/* MODAL ELIMINAR CUENTA */}
        <RoleDeleteModal
          item={modalEliminarCuenta}
          type="account"
          onClose={() => setModalEliminarCuenta(null)}
          onConfirm={handleEliminarCuenta}
          errorModal={errorModal}
        />

        {/* MODAL ELIMINAR ROL */}
        <RoleDeleteModal
          item={modalEliminarRol}
          type="role"
          onClose={() => setModalEliminarRol(null)}
          onConfirm={handleEliminarRol}
          errorModal={errorModal}
        />
      </main>
    </div>
  )
}
