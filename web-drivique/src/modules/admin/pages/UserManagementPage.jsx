import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useLanding } from '../../landing/LandingContext'
import { useBrand } from '../../../contexts/BrandContext'
import { userManagementService } from '../../../services/userManagementService'
import { branchManagementService } from '../../../services/branchManagementService'


import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './UserManagementPage.css'
import ModalEliminar from './UserManagementPage/ModalEliminar'
import ModalEditar from './UserManagementPage/ModalEditar'
import ModalCrear from './UserManagementPage/ModalCrear'
import ModalDocumentos from './UserManagementPage/ModalDocumentos'
import CitiesContainer from './UserManagementPage/CitiesContainer'

export default function UserManagementPage() {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const { brand } = useBrand()
  const esModoOscuro = tema === 'oscuro'

  const [usersList, setUsersList] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [docFilter, setDocFilter] = useState('all')
  const [notice, setNotice] = useState('')

  // Modales
  const [modalCrear, setModalCrear] = useState(false)
  const [modalEditar, setModalEditar] = useState(null)
  const [modalDocumentos, setModalDocumentos] = useState(null)
  const [modalEliminar, setModalEliminar] = useState(null)

  // Formularios
  const [formCrear, setFormCrear] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    cedula: '',
    rol: 'cliente',
    sucursal: '',
  })

  const [formEditar, setFormEditar] = useState({})
  const [observacionDoc, setObservacionDoc] = useState('')
  const [errorModal, setErrorModal] = useState('')

  const [sucursales, setSucursales] = useState([])

  const cargarUsuarios = () => {
    setUsersList(userManagementService.list())
  }

  useEffect(() => {
    userManagementService.refresh().then(setUsersList).catch(() => setUsersList([]))
    branchManagementService.refresh()
      .then(() => setSucursales(branchManagementService.list().sort((a, b) => a.nombre.localeCompare(b.nombre))))
      .catch(() => setSucursales([]))
  }, [])

  // Filtrado dinámico
  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase()
    return usersList.filter((u) => {
      const matchRole = roleFilter === 'all' || u.rol === roleFilter
      const matchStatus =
        statusFilter === 'all' || (statusFilter === 'active' ? u.activo : !u.activo)
      const matchDoc = docFilter === 'all' || u.documentosEstado === docFilter

      const matchSearch =
        !term ||
        u.nombre?.toLowerCase().includes(term) ||
        u.correo?.toLowerCase().includes(term) ||
        u.telefono?.toLowerCase().includes(term) ||
        u.cedula?.toLowerCase().includes(term)

      return matchRole && matchStatus && matchDoc && matchSearch
    })
  }, [usersList, search, roleFilter, statusFilter, docFilter])

  // --- Handlers CRUD ---
  const handleCrearUsuario = async (e) => {
    e.preventDefault()
    try {
      setErrorModal('')
      await userManagementService.create(formCrear)
      setNotice(t('admin.users.createdSuccess', { defaultValue: 'Usuario {{nombre}} creado con éxito.', nombre: formCrear.nombre }))
      setModalCrear(false)
      setFormCrear({ nombre: '', correo: '', telefono: '', cedula: '', rol: 'cliente', sucursal: '' })
      cargarUsuarios()
    } catch (err) {
      setErrorModal(err.message || t('admin.users.createError', 'Error al crear el usuario.'))
    }
  }

  const openEditarModal = (u) => {
    setErrorModal('')
    setFormEditar({
      id: u.id,
      nombre: u.nombre,
      correo: u.correo,
      telefono: u.telefono,
      cedula: u.cedula,
      rol: u.rol,
      sucursal: u.sucursal || '',
    })
    setModalEditar(u)
  }

  const handleEditarUsuario = async (e) => {
    e.preventDefault()
    try {
      setErrorModal('')
      await userManagementService.update(formEditar.id, formEditar)
      setNotice(t('admin.users.updatedSuccess', { defaultValue: 'Datos de {{nombre}} actualizados.', nombre: formEditar.nombre }))
      setModalEditar(null)
      cargarUsuarios()
    } catch (err) {
      setErrorModal(err.message || t('admin.users.updateError', 'Error al actualizar usuario.'))
    }
  }

  const handleToggleActivo = async (u) => {
    try {
      await userManagementService.toggleActive(u.id)
    } catch (err) {
      setNotice(err.message)
      return
    }
    setNotice(
      t(
        u.activo ? 'admin.users.deactivatedSuccess' : 'admin.users.activatedSuccess',
        (u.activo ? t('hc3.account_deactivated', { defaultValue: 'Cuenta de {{nombre}} desactivada.', nombre: u.nombre }) : t('hc3.account_activated', { defaultValue: 'Cuenta de {{nombre}} activada.', nombre: u.nombre }))
      )
    )
    cargarUsuarios()
  }

  const openDocumentosModal = (u) => {
    setObservacionDoc(u.observacionDocumentos || '')
    setModalDocumentos(u)
  }

  const handleVerificarDocumentos = async (nuevoEstado) => {
    if (!modalDocumentos) return
    try {
      await userManagementService.verifyDocuments(
        modalDocumentos.id,
        { documentosEstado: nuevoEstado, observacionDocumentos: observacionDoc }
      )
    } catch (err) {
      setNotice(err.message)
      return
    }
    setNotice(
      t('admin.users.docVerifiedSuccess', {
        defaultValue: 'Documentos de {{nombre}} marcados como {{estado}}.',
        nombre: modalDocumentos.nombre,
        estado: nuevoEstado.toUpperCase(),
      })
    )
    setModalDocumentos(null)
    cargarUsuarios()
  }

  const handleEliminarUsuario = async (u) => {
    try {
      await userManagementService.remove(u.id)
      setNotice(t('admin.users.deletedSuccess', { defaultValue: 'Usuario {{nombre}} eliminado.', nombre: u.nombre }))
      setModalEliminar(null)
      cargarUsuarios()
    } catch (err) {
      setErrorModal(err.message || t('admin.users.deleteError', 'Error al eliminar usuario.'))
    }
  }

  // --- Exportaciones ---
  const headersExport = ['Nombre', 'Correo', t('hc2.telefono', 'Teléfono'), t('hc2.cedula', 'Cédula'), 'Rol', 'Sucursal', t('hc2.estado_cuenta', 'Estado Cuenta'), t('hc2.verificacion_documentos', 'Verificación Documentos'), t('hc2.reservas_activas', 'Reservas Activas')]
  const rowsExport = filtrados.map((u) => [
    u.nombre,
    u.correo,
    u.telefono,
    u.cedula,
    u.rol,
    u.sucursal || 'N/A',
    u.activo ? 'Activo' : 'Inactivo',
    u.documentosEstado || '—',
    u.reservasActivas,
  ])

  const exportData = {
    title: t('hc3.users_export_title', { defaultValue: 'Gestión de Usuarios — Plataforma {{marca}}', marca: brand?.name || 'Drivique' }),
    headers: headersExport,
    rows: rowsExport,
    items: filtrados,
    filename: `usuarios-drivique-${new Date().toISOString().slice(0, 10)}`,
  }

  return (
    <div className={`management-shell ${esModoOscuro ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar />
      <main className="management-main" style={{ padding: '24px 32px' }}>
        <CitiesContainer docFilter={docFilter} exportData={exportData} filtrados={filtrados} handleToggleActivo={handleToggleActivo} notice={notice} openDocumentosModal={openDocumentosModal} openEditarModal={openEditarModal} roleFilter={roleFilter} search={search} setDocFilter={setDocFilter} setErrorModal={setErrorModal} setModalCrear={setModalCrear} setModalEliminar={setModalEliminar} setNotice={setNotice} setRoleFilter={setRoleFilter} setSearch={setSearch} setStatusFilter={setStatusFilter} statusFilter={statusFilter} t={t} />

        {/* MODAL REVISIÓN DE DOCUMENTOS */}
        {modalDocumentos && (
          <ModalDocumentos handleVerificarDocumentos={handleVerificarDocumentos} modalDocumentos={modalDocumentos} observacionDoc={observacionDoc} setModalDocumentos={setModalDocumentos} setObservacionDoc={setObservacionDoc} t={t} />
        )}

        {/* MODAL CREAR USUARIO */}
        {modalCrear && (
          <ModalCrear errorModal={errorModal} formCrear={formCrear} handleCrearUsuario={handleCrearUsuario} setFormCrear={setFormCrear} setModalCrear={setModalCrear} sucursales={sucursales} t={t} />
        )}

        {/* MODAL EDITAR USUARIO */}
        {modalEditar && (
          <ModalEditar errorModal={errorModal} formEditar={formEditar} handleEditarUsuario={handleEditarUsuario} modalEditar={modalEditar} setFormEditar={setFormEditar} setModalEditar={setModalEditar} sucursales={sucursales} t={t} />
        )}

        {/* MODAL ELIMINAR USUARIO */}
        {modalEliminar && (
          <ModalEliminar errorModal={errorModal} handleEliminarUsuario={handleEliminarUsuario} modalEliminar={modalEliminar} setModalEliminar={setModalEliminar} t={t} />
        )}
      </main>
    </div>
  )
}
