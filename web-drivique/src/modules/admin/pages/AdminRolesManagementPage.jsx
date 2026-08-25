import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaBuilding,
  FaCheckCircle,
  FaEdit,
  FaExclamationTriangle,
  FaFileExcel,
  FaFilePdf,
  FaKey,
  FaPlus,
  FaPrint,
  FaSearch,
  FaShieldAlt,
  FaTimesCircle,
  FaToggleOff,
  FaToggleOn,
  FaTrash,
  FaUserPlus,
  FaUserShield,
  FaUsers,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { roleManagementService } from '../../../services/roleManagementService'
import { branchManagementService } from '../../../services/branchManagementService'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './AdminRolesManagementPage.css'



export default function AdminRolesManagementPage() {
  const { t } = useTranslation()

  const MODULE_KEYS = [
    { key: 'vehicles', label: t('admin.rolesPage.modVehicles') },
    { key: 'reservations', label: t('admin.rolesPage.modReservations') },
    { key: 'users', label: t('admin.rolesPage.modUsers') },
    { key: 'contracts', label: t('admin.rolesPage.modContracts') },
    { key: 'cities', label: t('admin.rolesPage.modCities') },
    { key: 'branches', label: t('admin.rolesPage.modBranches') },
    { key: 'audit', label: t('admin.rolesPage.modAudit') },
  ]
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const esModoOscuro = tema === 'oscuro'

  const [activeTab, setActiveTab] = useState('accounts') // 'accounts' | 'roles'
  const [accountsList, setAccountsList] = useState([])
  const [rolesList, setRolesList] = useState([])
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
    rolId: 'role-admin',
    sucursal: 'Neiva',
  })

  // Formularios Roles
  const [formRol, setFormRol] = useState({
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

  const sucursales = useMemo(
    () => branchManagementService.list().sort((a, b) => a.nombre.localeCompare(b.nombre)),
    []
  )

  const cargarDatos = () => {
    setAccountsList(roleManagementService.listAccounts())
    setRolesList(roleManagementService.listRoles())
  }

  useEffect(() => {
    cargarDatos()
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
        acc.telefono?.toLowerCase().includes(term)

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
  const handleCrearCuenta = (e) => {
    e.preventDefault()
    try {
      setErrorModal('')
      const created = roleManagementService.createAccount(formCuenta, user)
      setNotice(
        t(
          'admin.roles.accountCreated',
          `Cuenta de ${formCuenta.nombre} creada exitosamente. Notificación con credenciales enviada.`
        )
      )
      setModalCrearCuenta(false)
      setFormCuenta({ nombre: '', correo: '', telefono: '', rolId: 'role-admin', sucursal: 'Neiva' })
      cargarDatos()
    } catch (err) {
      if (err.message === 'mailAlreadyExists') {
        setErrorModal('El correo ya está asignado a otra cuenta administrativa.')
      } else if (err.message === 'branchRequiredForManager') {
        setErrorModal('Debes asignar una sucursal obligatoria al Encargado.')
      } else {
        setErrorModal('Error al crear la cuenta administrativa.')
      }
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
      sucursal: acc.sucursal || 'Neiva',
    })
    setModalEditarCuenta(acc)
  }

  const handleEditarCuenta = (e) => {
    e.preventDefault()
    try {
      setErrorModal('')
      roleManagementService.updateAccount(formCuenta.id, formCuenta, user)
      setNotice(t('admin.roles.accountUpdated', `Cuenta de ${formCuenta.nombre} actualizada.`))
      setModalEditarCuenta(null)
      cargarDatos()
    } catch (err) {
      if (err.message === 'branchRequiredForManager') {
        setErrorModal('Debes asignar una sucursal obligatoria al Encargado.')
      } else {
        setErrorModal('Error al actualizar la cuenta.')
      }
    }
  }

  const handleToggleActivoCuenta = (acc) => {
    roleManagementService.toggleActiveAccount(acc.id, user)
    setNotice(
      t(
        acc.activo ? 'admin.roles.accountDeactivated' : 'admin.roles.accountActivated',
        `Cuenta de ${acc.nombre} ${acc.activo ? 'desactivada' : 'activada'}.`
      )
    )
    cargarDatos()
  }

  const handleEliminarCuenta = (acc) => {
    roleManagementService.removeAccount(acc.id, user)
    setNotice(t('admin.roles.accountDeleted', `Cuenta de ${acc.nombre} eliminada.`))
    setModalEliminarCuenta(null)
    cargarDatos()
  }

  // --- Handlers Roles ---
  const handleCrearRol = (e) => {
    e.preventDefault()
    try {
      setErrorModal('')
      roleManagementService.createRole(formRol, user)
      setNotice(t('admin.roles.roleCreated', `Rol ${formRol.nombre} creado exitosamente.`))
      setModalCrearRol(false)
      cargarDatos()
    } catch (err) {
      if (err.message === 'roleAlreadyExists') {
        setErrorModal('Ya existe un rol registrado con este nombre.')
      } else {
        setErrorModal('Error al crear el rol.')
      }
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

  const handleEditarRol = (e) => {
    e.preventDefault()
    try {
      setErrorModal('')
      roleManagementService.updateRole(formRol.id, formRol, user)
      setNotice(t('admin.roles.roleUpdated', `Permisos del rol ${formRol.nombre} actualizados.`))
      setModalEditarRol(null)
      cargarDatos()
    } catch (err) {
      setErrorModal('Error al actualizar el rol.')
    }
  }

  const handleEliminarRol = (r) => {
    try {
      setErrorModal('')
      roleManagementService.removeRole(r.id, user)
      setNotice(t('admin.roles.roleDeleted', `Rol ${r.nombre} eliminado.`))
      setModalEliminarRol(null)
      cargarDatos()
    } catch (err) {
      if (err.message === 'roleHasAssignedAccounts') {
        setErrorModal(
          t(
            'admin.roles.hasAssignedAccounts',
            'No se puede eliminar un rol que tiene cuentas asignadas. Reasigna las cuentas primero.'
          )
        )
      } else if (err.message === 'systemRoleCannotBeDeleted') {
        setErrorModal('Los roles base del sistema no pueden ser eliminados.')
      } else {
        setErrorModal('Error al eliminar el rol.')
      }
    }
  }

  const handleTogglePermiso = (moduleKey, actionKey) => {
    setFormRol((prev) => {
      const currentModule = prev.permisos[moduleKey] || { ver: false, crear: false, editar: false, eliminar: false }
      return {
        ...prev,
        permisos: {
          ...prev.permisos,
          [moduleKey]: {
            ...currentModule,
            [actionKey]: !currentModule[actionKey],
          },
        },
      }
    })
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
    title: 'Cuentas Administrativas — Plataforma Drivique',
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
                    setFormCuenta({ nombre: '', correo: '', telefono: '', rolId: rolesList[0]?.id || 'role-admin', sucursal: 'Neiva' })
                    setModalCrearCuenta(true)
                  }}
                >
                  <FaUserPlus /> {t('admin.rolesPage.newAccount')} Admin
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
                  <FaPlus /> Crear Nuevo Rol
                </button>
              )}
            </div>
          </header>

          {/* Notificación de Aviso */}
          {notice && (
            <div className="cities-notice" role="status">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice('')}>
                ×
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
              <FaUserShield /> {t('admin.rolesPage.adminAccountsTab')} ({accountsList.length})
            </button>
            <button
              type="button"
              className={`roles-tab-btn ${activeTab === 'roles' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('roles')}
            >
              <FaKey /> {t('admin.rolesPage.rolesPermissionsTab')} ({rolesList.length})
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
                    placeholder={t('admin.rolesPage.searchAccPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>

                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="all">{t('admin.rolesPage.allRoles')}</option>
                  {rolesList.map((r) => (
                    <option key={r.id} value={r.id}>{t(`admin.rolesPage.role_name_${r.id}`, r.nombre)}</option>
                  ))}
                </select>

                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">{t('admin.rolesPage.allStatuses')}</option>
                  <option value="active">Activas</option>
                  <option value="inactive">Inactivas</option>
                </select>

                <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
                  <option value="all">{t('admin.rolesPage.allBranches')}</option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.nombre}>
                      {s.nombre}
                    </option>
                  ))}
                </select>

                <div className="cities-export">
                  <button type="button" onClick={() => exportExcel(exportDataAccounts)}>
                    <FaFileExcel /> {t('admin.rolesPage.excel')}
                  </button>
                  <button type="button" onClick={() => exportPdf(exportDataAccounts)}>
                    <FaFilePdf /> {t('admin.rolesPage.pdf')}
                  </button>
                  <button type="button" onClick={() => printTable(exportDataAccounts)}>
                    <FaPrint /> {t('admin.rolesPage.print')}
                  </button>
                </div>
              </div>

              <div className="cities-summary">
                <strong>{cuentasFiltradas.length}</strong> {t('admin.rolesPage.accountsFoundCount')}
              </div>

              {cuentasFiltradas.length === 0 ? (
                <div className="cities-empty">
                  <FaUserShield />
                  <h2>{t('admin.rolesPage.noAccountsFound')}</h2>
                  <p>Ajusta el término de búsqueda o cambia los filtros seleccionados.</p>
                </div>
              ) : (
                <div className="cities-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>{t('admin.rolesPage.colaborador')}</th>
                        <th>{t('admin.rolesPage.contacto')}</th>
                        <th>{t('admin.rolesPage.rolAsignado')}</th>
                        <th>Sucursal</th>
                        <th>Estado Cuenta</th>
                        <th>{t('admin.rolesPage.tableActions')}</th>
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
                                <strong>{acc.nombre}</strong>
                                <small>{acc.id}</small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div style={{ fontSize: 12 }}>
                              <div>
                                <FaEnvelope style={{ marginRight: 4, color: '#64748b' }} />
                                {acc.correo}
                              </div>
                              <div style={{ color: '#64748b', fontSize: 11 }}>
                                <FaPhone style={{ marginRight: 4 }} />
                                {acc.telefono}
                              </div>
                            </div>
                          </td>

                          <td>
                            <strong style={{ fontSize: 13, color: '#2563eb' }}>{acc.rolNombre}</strong>
                          </td>

                          <td>
                            <span>{acc.sucursal ? acc.sucursal : 'Global (Todas)'}</span>
                          </td>

                          <td>
                            <span className={`user-account-badge ${acc.activo ? 'activo' : 'inactivo'}`}>
                              <span className="user-account-dot" />
                              {acc.activo ? t('admin.rolesPage.active') : t('admin.rolesPage.inactive')}
                            </span>
                          </td>

                          <td>
                            <div className="cities-row-actions">
                              <button type="button" onClick={() => openEditarCuenta(acc)} title={t('admin.rolesPage.actionEditAccount')}>
                                <FaEdit />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleActivoCuenta(acc)}
                                title={acc.activo ? t('admin.rolesPage.actionDeactivateAccount') : t('admin.rolesPage.actionActivateAccount')}
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
                                title={t('admin.rolesPage.actionDeleteAccount')}
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
                    placeholder={t('admin.rolesPage.searchRoleDesc')}
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
                        <span>{role.cuentasAsignadas} {t('admin.rolesPage.accountsCount', 'Cuentas')}</span>
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
                        <FaEdit /> {t('admin.rolesPage.configPermissions')}
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
        {modalCrearCuenta && (
          <div className="cities-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModalCrearCuenta(false)}>
            <section className="cities-modal">
              <div className="cities-modal__head">
                <div>
                  <p className="cities-eyebrow">{t('admin.rolesPage.altaColaborador')}</p>
                  <h2>Crear Cuenta Administrativa</h2>
                </div>
                <button type="button" onClick={() => setModalCrearCuenta(false)}>
                  ×
                </button>
              </div>

              <form onSubmit={handleCrearCuenta}>
                <label>
                  {t('admin.rolesPage.labelFullName')}
                  <input
                    type="text"
                    required
                    value={formCuenta.nombre}
                    onChange={(e) => setFormCuenta({ ...formCuenta, nombre: e.target.value })}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label>
                    {t('admin.rolesPage.corpEmail')}
                    <input
                      type="email"
                      required
                      value={formCuenta.correo}
                      onChange={(e) => setFormCuenta({ ...formCuenta, correo: e.target.value })}
                    />
                  </label>
                  <label>
                    {t('admin.rolesPage.contactPhone')}
                    <input
                      type="text"
                      required
                      value={formCuenta.telefono}
                      onChange={(e) => setFormCuenta({ ...formCuenta, telefono: e.target.value })}
                    />
                  </label>
                </div>

                <label>
                  {t('admin.rolesPage.labelAssignedRole')}
                  <select
                    value={formCuenta.rolId}
                    onChange={(e) => setFormCuenta({ ...formCuenta, rolId: e.target.value })}
                  >
                    {rolesList.map((r) => (
                    <option key={r.id} value={r.id}>{t(`admin.rolesPage.role_name_${r.id}`, r.nombre)}</option>
                    ))}
                  </select>
                </label>

                {(formCuenta.rolId === 'role-encargado' ||
                  rolesList.find((r) => r.id === formCuenta.rolId)?.codigo === 'encargado_sucursal') && (
                  <label>
                    Sucursal Asignada (Obligatoria):
                    <select
                      value={formCuenta.sucursal}
                      onChange={(e) => setFormCuenta({ ...formCuenta, sucursal: e.target.value })}
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
                  <button type="button" onClick={() => setModalCrearCuenta(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="cities-primary">
                    Crear y Enviar Notificación
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* MODAL EDITAR CUENTA */}
        {modalEditarCuenta && (
          <div className="cities-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModalEditarCuenta(null)}>
            <section className="cities-modal">
              <div className="cities-modal__head">
                <div>
                  <p className="cities-eyebrow">Edición Administrativa</p>
                  <h2>{t('admin.rolesPage.formEditAccountTitle', { nombre: modalEditarCuenta.nombre })}</h2>
                </div>
                <button type="button" onClick={() => setModalEditarCuenta(null)}>
                  ×
                </button>
              </div>

              <form onSubmit={handleEditarCuenta}>
                <label>
                  {t('admin.rolesPage.labelFullName')}
                  <input
                    type="text"
                    required
                    value={formCuenta.nombre}
                    onChange={(e) => setFormCuenta({ ...formCuenta, nombre: e.target.value })}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label>
                    {t('admin.rolesPage.corpEmail')}
                    <input
                      type="email"
                      required
                      value={formCuenta.correo}
                      onChange={(e) => setFormCuenta({ ...formCuenta, correo: e.target.value })}
                    />
                  </label>
                  <label>
                    {t('admin.rolesPage.labelPhone')}
                    <input
                      type="text"
                      required
                      value={formCuenta.telefono}
                      onChange={(e) => setFormCuenta({ ...formCuenta, telefono: e.target.value })}
                    />
                  </label>
                </div>

                <label>
                  {t('admin.rolesPage.labelAssignedRole')}
                  <select
                    value={formCuenta.rolId}
                    onChange={(e) => setFormCuenta({ ...formCuenta, rolId: e.target.value })}
                  >
                    {rolesList.map((r) => (
                    <option key={r.id} value={r.id}>{t(`admin.rolesPage.role_name_${r.id}`, r.nombre)}</option>
                    ))}
                  </select>
                </label>

                {(formCuenta.rolId === 'role-encargado' ||
                  rolesList.find((r) => r.id === formCuenta.rolId)?.codigo === 'encargado_sucursal') && (
                  <label>
                    Sucursal Asignada (Obligatoria):
                    <select
                      value={formCuenta.sucursal}
                      onChange={(e) => setFormCuenta({ ...formCuenta, sucursal: e.target.value })}
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
                  <button type="button" onClick={() => setModalEditarCuenta(null)}>
                    Cancelar
                  </button>
                  <button type="submit" className="cities-primary">
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* MODAL CREAR / EDITAR ROL Y MATRIZ DE PERMISOS */}
        {(modalCrearRol || modalEditarRol) && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setModalCrearRol(false)
                setModalEditarRol(null)
              }
            }}
          >
            <section className="cities-modal" style={{ maxWidth: 680 }}>
              <div className="cities-modal__head">
                <div>
                  <p className="cities-eyebrow">{t('admin.rolesPage.securityConfigEyebrow')}</p>
                  <h2>{modalEditarRol ? t('admin.rolesPage.editPermissionsTitle', { nombre: t(`admin.rolesPage.role_name_${modalEditarRol.id}`, modalEditarRol.nombre) }) : t('admin.rolesPage.createRoleTitle')}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalCrearRol(false)
                    setModalEditarRol(null)
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={modalEditarRol ? handleEditarRol : handleCrearRol}>
                <label>
                  {t('admin.rolesPage.labelRoleName')}
                  <input
                    type="text"
                    required
                    value={t(`admin.rolesPage.role_name_${formRol.id}`, formRol.nombre)}
                    onChange={(e) => setFormRol({ ...formRol, nombre: e.target.value })}
                  />
                </label>

                <label>
                  {t('admin.rolesPage.labelDescription')}
                  <input
                    type="text"
                    required
                    value={t(`admin.rolesPage.role_desc_${formRol.id}`, formRol.descripcion)}
                    onChange={(e) => setFormRol({ ...formRol, descripcion: e.target.value })}
                  />
                </label>

                {/* MATRIZ DE PERMISOS POR MÓDULO */}
                <div className="permission-matrix-wrap">
                  <table className="permission-matrix-table">
                    <thead>
                      <tr>
                        <th>{t('admin.rolesPage.moduleResource')}</th>
                        <th>{t('admin.rolesPage.permView')}</th>
                        <th>{t('admin.rolesPage.permCreate')}</th>
                        <th>{t('admin.rolesPage.permEdit')}</th>
                        <th>{t('admin.rolesPage.permDelete')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MODULE_KEYS.map((mod) => {
                        const mPerms = formRol.permisos[mod.key] || {
                          ver: false,
                          crear: false,
                          editar: false,
                          eliminar: false,
                        }
                        return (
                          <tr key={mod.key}>
                            <td>{mod.label}</td>
                            {['ver', 'crear', 'editar', 'eliminar'].map((action) => (
                              <td key={action}>
                                <input
                                  type="checkbox"
                                  checked={Boolean(mPerms[action])}
                                  onChange={() => handleTogglePermiso(mod.key, action)}
                                />
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {errorModal && <p className="cities-error">{errorModal}</p>}

                <div className="cities-modal__actions">
                  <button
                    type="button"
                    onClick={() => {
                      setModalCrearRol(false)
                      setModalEditarRol(null)
                    }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="cities-primary">
                    {modalEditarRol ? t('admin.rolesPage.btnSavePermissions') : t('admin.rolesPage.btnCreateRole')}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* MODAL ELIMINAR CUENTA */}
        {modalEliminarCuenta && (
          <div className="cities-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModalEliminarCuenta(null)}>
            <section className="cities-modal">
              <div className="cities-delete-icon">
                <FaTrash />
              </div>
              <h2>{t('admin.rolesPage.confirmDeleteAccountTitle')}</h2>
              <p>
                {t('admin.rolesPage.confirmDeleteAccountText')} <strong>{modalEliminarCuenta.nombre}</strong> (
                {modalEliminarCuenta.correo})?
              </p>

              <div className="cities-modal__actions">
                <button type="button" onClick={() => setModalEliminarCuenta(null)}>
                  Cancelar
                </button>
                <button
                  className="cities-danger"
                  type="button"
                  onClick={() => handleEliminarCuenta(modalEliminarCuenta)}
                >
                  Confirmar Eliminación
                </button>
              </div>
            </section>
          </div>
        )}

        {/* MODAL ELIMINAR ROL CON VALIDACIÓN */}
        {modalEliminarRol && (
          <div className="cities-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModalEliminarRol(null)}>
            <section className="cities-modal">
              <div className="cities-delete-icon">
                <FaTrash />
              </div>
              <h2>{t('admin.rolesPage.confirmDeleteRoleTitle')}</h2>
              <p>
                {t('admin.rolesPage.confirmDeleteRoleText')} <strong>{modalEliminarRol.nombre}</strong>?
              </p>

              {modalEliminarRol.cuentasAsignadas > 0 && (
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
                  {t('admin.rolesPage.roleDeleteWarning1')} {modalEliminarRol.cuentasAsignadas}  {t('admin.rolesPage.roleDeleteWarning2')}
                </div>
              )}

              {errorModal && <p className="cities-error">{errorModal}</p>}

              <div className="cities-modal__actions">
                <button type="button" onClick={() => setModalEliminarRol(null)}>
                  Cancelar
                </button>
                <button
                  className="cities-danger"
                  type="button"
                  disabled={modalEliminarRol.cuentasAsignadas > 0}
                  onClick={() => handleEliminarRol(modalEliminarRol)}
                >
                  Confirmar Eliminación
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
