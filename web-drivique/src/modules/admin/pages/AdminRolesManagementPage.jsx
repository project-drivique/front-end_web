import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaKey,
  FaPlus,
  FaUserPlus,
  FaUserShield,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useBrand } from '../../../contexts/BrandContext'
import { roleManagementService } from '../../../services/roleManagementService'
import { branchManagementService } from '../../../services/branchManagementService'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import AccountFormModal from '../components/AccountFormModal'
import RolePermissionsModal from '../components/RolePermissionsModal'
import RoleDeleteModal from '../components/RoleDeleteModal'
import { AdminAccountsSection, AdminRolesGridSection } from '../components/AdminRolesTabs'
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
        t('admin.roles.accountCreated', {
          defaultValue: 'Cuenta de {{nombre}} creada exitosamente. Recibirá un código por correo para definir su contraseña.',
          nombre: formCuenta.nombre,
        })
      )
      setModalCrearCuenta(false)
      setFormCuenta({ nombre: '', correo: '', telefono: '', rolId: '', sucursal: '' })
      cargarDatos()
    } catch (err) {
      setErrorModal(err.message || t('hc2.error_al_crear_la_cuenta_administrativ', 'Error al crear la cuenta administrativa.'))
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
      setNotice(t('admin.roles.accountUpdated', { defaultValue: 'Cuenta de {{nombre}} actualizada.', nombre: formCuenta.nombre }))
      setModalEditarCuenta(null)
      cargarDatos()
    } catch (err) {
      setErrorModal(err.message || t('hc2.error_al_actualizar_la_cuenta', 'Error al actualizar la cuenta.'))
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
        (acc.activo ? t('hc3.account_deactivated', { defaultValue: 'Cuenta de {{nombre}} desactivada.', nombre: acc.nombre }) : t('hc3.account_activated', { defaultValue: 'Cuenta de {{nombre}} activada.', nombre: acc.nombre }))
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
    setNotice(t('admin.roles.accountDeleted', { defaultValue: 'Cuenta de {{nombre}} eliminada.', nombre: acc.nombre }))
    setModalEliminarCuenta(null)
    cargarDatos()
  }

  // --- Handlers Roles ---
  const handleCrearRol = async (e) => {
    e.preventDefault()
    try {
      setErrorModal('')
      await roleManagementService.createRole(formRol)
      setNotice(t('admin.roles.roleCreated', { defaultValue: 'Rol {{nombre}} creado exitosamente.', nombre: formRol.nombre }))
      setModalCrearRol(false)
      cargarDatos()
    } catch (err) {
      setErrorModal(err.message || t('hc2.error_al_crear_el_rol', 'Error al crear el rol.'))
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
      setNotice(t('admin.roles.roleUpdated', { defaultValue: 'Permisos del rol {{nombre}} actualizados.', nombre: formRol.nombre }))
      setModalEditarRol(null)
      cargarDatos()
    } catch (err) {
      setErrorModal(err.message || t('hc2.error_al_actualizar_el_rol', 'Error al actualizar el rol.'))
    }
  }

  const handleEliminarRol = async (r) => {
    try {
      setErrorModal('')
      await roleManagementService.removeRole(r.id)
      setNotice(t('admin.roles.roleDeleted', { defaultValue: 'Rol {{nombre}} eliminado.', nombre: r.nombre }))
      setModalEliminarRol(null)
      cargarDatos()
    } catch (err) {
      setErrorModal(err.message || t('hc2.error_al_eliminar_el_rol', 'Error al eliminar el rol.'))
    }
  }

  const handleTogglePermiso = (codigo) => {
    setFormRol((prev) => ({
      ...prev,
      permisos: { ...prev.permisos, [codigo]: !prev.permisos?.[codigo] },
    }))
  }

  // --- Exportación ---
  const headersExportAccounts = ['Nombre', 'Correo', t('hc2.telefono', 'Teléfono'), 'Rol Asignado', 'Sucursal', 'Estado']
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
                  t('hc2.control_de_acceso_creacion_de_cuentas_', 'Control de acceso, creación de cuentas administrativas y matriz de permisos por rol.')
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

          {activeTab === 'accounts' && (
            <AdminAccountsSection
              search={search}
              setSearch={setSearch}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              rolesList={rolesList}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              branchFilter={branchFilter}
              setBranchFilter={setBranchFilter}
              sucursales={sucursales}
              exportDataAccounts={exportDataAccounts}
              cuentasFiltradas={cuentasFiltradas}
              openEditarCuenta={openEditarCuenta}
              handleToggleActivoCuenta={handleToggleActivoCuenta}
              setErrorModal={setErrorModal}
              setModalEliminarCuenta={setModalEliminarCuenta}
              t={t}
            />
          )}

          {activeTab === 'roles' && (
            <AdminRolesGridSection
              search={search}
              setSearch={setSearch}
              rolesFiltrados={rolesFiltrados}
              openEditarRol={openEditarRol}
              setErrorModal={setErrorModal}
              setModalEliminarRol={setModalEliminarRol}
              t={t}
            />
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
