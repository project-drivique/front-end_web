import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaSearch,
  FaMapMarkerAlt,
  FaUserTie,
  FaCalendarAlt,
  FaCar,
  FaCheckCircle,
  FaTimes,
  FaKey,
  FaRoute,
  FaExclamationCircle,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaBuilding,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaHashtag,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import { useAuthStore } from '@/store/authStore'
import { reservationManagementService } from '@/services/reservationManagementService'
import { showAlert } from '@/utils/swalConfig'
import { exportExcel, exportPdf, printTable } from '@/utils/listExportUtils'
import './CityManagementPage.css'
import './CashCollectionPage.css'
import './DocumentVerificationPage.css'

const DEFAULT_CONDUCTORES = [
  { id: 'COND-1', nombre: 'Carlos Eduardo Ramírez', tipoDoc: 'CC', numDoc: '1018432910', licencia: 'C1-84920412', categoriaLic: 'C1', vencimientoLic: '2028-11-15', telefono: '+57 310 492 8102', email: 'carlos.ramirez@drivique.com', vehiculo: 'Moto Yamaha NMAX 155 (ABC-12D)', estado: 'disponible' },
  { id: 'COND-2', nombre: 'Jhon Alejandro Gómez', tipoDoc: 'CC', numDoc: '1020491823', licencia: 'C2-94812039', categoriaLic: 'C2', vencimientoLic: '2027-06-30', telefono: '+57 315 829 1049', email: 'jhon.gomez@drivique.com', vehiculo: 'Renault Kangoo (EFG-456)', estado: 'en_servicio' },
  { id: 'COND-3', nombre: 'María Camila Mendoza', tipoDoc: 'CC', numDoc: '1032481920', licencia: 'B1-74839201', categoriaLic: 'B1', vencimientoLic: '2029-03-20', telefono: '+57 320 918 2736', email: 'camila.mendoza@drivique.com', vehiculo: 'Chevrolet Spark GT (HJK-789)', estado: 'disponible' },
  { id: 'COND-4', nombre: 'Andrés Felipe Castro', tipoDoc: 'CC', numDoc: '1098234120', licencia: 'B2-89210492', categoriaLic: 'B2', vencimientoLic: '2028-08-10', telefono: '+57 300 123 4567', email: 'andres.castro@drivique.com', vehiculo: 'Chevrolet N300 (WXY-123)', estado: 'disponible' },
  { id: 'COND-5', nombre: 'Laura Sofía Morales', tipoDoc: 'CE', numDoc: '94810293', licencia: 'C1-78192034', categoriaLic: 'C1', vencimientoLic: '2026-12-05', telefono: '+57 318 765 4321', email: 'laura.morales@drivique.com', vehiculo: 'Suzuki Swift (QWE-987)', estado: 'en_servicio' }
]

const INITIAL_CONDUCTOR = {
  nombre: '',
  email: '',
  tipoDoc: 'CC',
  numDoc: '',
  licencia: '',
  categoriaLic: 'B1',
  vencimientoLic: '',
  telefono: '',
  vehiculo: '',
  estado: 'disponible'
}

export default function DeliveryManagementPage() {
  const { tema } = useLanding()
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.usuario)
  const esEncargado =
    user?.rol === 'encargado' ||
    user?.rol === 'encargado_sucursal' ||
    user?.rol === 'branch_manager'

  const [reservations, setReservations] = useState([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('pendientes')
  const [modalAsignar, setModalAsignar] = useState(null)
  const [modalConductor, setModalConductor] = useState(false)
  const [editingConductor, setEditingConductor] = useState(null)
  const [modalVerificar, setModalVerificar] = useState(null)
  const [conductorSeleccionado, setConductorSeleccionado] = useState('')
  const [pinIngresado, setPinIngresado] = useState('')

    const [conductores, setConductores] = useState(() => {
    try {
      const stored = localStorage.getItem('drivique_conductores')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length >= 5) return parsed
      }
      localStorage.setItem('drivique_conductores', JSON.stringify(DEFAULT_CONDUCTORES))
      return DEFAULT_CONDUCTORES
    } catch {
      return DEFAULT_CONDUCTORES
    }
  })

  const [nuevoConductor, setNuevoConductor] = useState(INITIAL_CONDUCTOR)

  const loadReservations = () => {
    const all = reservationManagementService.list(user)
    const deliveries = all.filter(r => {
      if (r.estado === 'cancelada') return false
      const hasE = r.domicilioDireccion || r.serviciosSeleccionados?.some(s => s.id === 'srv-entrega-domicilio' || s.nombre?.toLowerCase().includes('entrega'))
      const hasD = r.domicilioDevolucionDireccion || r.serviciosSeleccionados?.some(s => s.id === 'srv-devolucion-domicilio' || s.nombre?.toLowerCase().includes('devolucion'))
      return hasE || hasD
    }).map((r) => {
      const hasE = r.domicilioDireccion || r.serviciosSeleccionados?.some(s => s.id === 'srv-entrega-domicilio' || s.nombre?.toLowerCase().includes('entrega'))
      const hasD = r.domicilioDevolucionDireccion || r.serviciosSeleccionados?.some(s => s.id === 'srv-devolucion-domicilio' || s.nombre?.toLowerCase().includes('devolucion'))
      let tipoServicio = t('admin.delivery.serviceTypes.delivery', 'Entrega a Domicilio')
      let direccion = r.domicilioDireccion || 'No registrada'
      let fecha = r.fechaInicio
      if (hasE && hasD) {
        tipoServicio = t('admin.delivery.serviceTypes.both', 'Entrega y Devolucion')
        direccion = `Ent: ${r.domicilioDireccion || 'N/R'} | Dev: ${r.domicilioDevolucionDireccion || 'N/R'}`
      } else if (hasD && !hasE) {
        tipoServicio = t('admin.delivery.serviceTypes.return', 'Devolucion a Domicilio')
        direccion = r.domicilioDevolucionDireccion || 'No registrada'
        fecha = r.fechaFin
      }
      const pinCalculado = r.domicilioPin || String(Math.abs(Array.from(String(r.codigo || r.id)).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0)) % 9000 + 1000)
      return {
        ...r,
        tipoServicio,
        direccionInfo: direccion,
        fechaEvento: fecha,
        domicilioPin: pinCalculado,
        domicilioCodigo: `DOM-${pinCalculado}`,
        estadoDomicilio: r.domicilioEstado || (r.domicilioConductor ? 'ASIGNADO' : 'PENDIENTE')
      }
    })
    setReservations(deliveries)
  }

  useEffect(() => { loadReservations() }, [user])

  const saveConductores = (lista) => {
    setConductores(lista)
    localStorage.setItem('drivique_conductores', JSON.stringify(lista))
  }

  const handleCrearConductor = (e) => {
    e.preventDefault()
    if (!nuevoConductor.nombre) return showAlert({ icon: 'warning', title: t('admin.delivery.modal.nameRequired', 'El nombre es obligatorio') })
    
    if (editingConductor) {
      const actualizados = conductores.map(c => c.id === editingConductor.id ? { ...nuevoConductor, id: editingConductor.id } : c)
      saveConductores(actualizados)
      showAlert({ icon: 'success', title: t('admin.delivery.modal.updateSuccess', 'Conductor actualizado exitosamente.') })
    } else {
      const creado = { ...nuevoConductor, id: 'COND-' + Date.now() }
      saveConductores([...conductores, creado])
      showAlert({ icon: 'success', title: t('admin.delivery.modal.createSuccess', 'Conductor creado exitosamente.') })
    }

    setNuevoConductor(INITIAL_CONDUCTOR)
    setEditingConductor(null)
    setModalConductor(false)
  }

  const handleEditarConductor = (cond) => {
    setEditingConductor(cond)
    setNuevoConductor({
      nombre: cond.nombre || '',
      email: cond.email || '',
      tipoDoc: cond.tipoDoc || 'CC',
      numDoc: cond.numDoc || '',
      licencia: cond.licencia || '',
      categoriaLic: cond.categoriaLic || 'B1',
      vencimientoLic: cond.vencimientoLic || '',
      telefono: cond.telefono || '',
      vehiculo: cond.vehiculo || '',
      estado: cond.estado || 'disponible'
    })
    setModalConductor(true)
  }

  const handleEliminarConductor = async (id) => {
    const result = await showAlert({
      title: t('admin.delivery.deleteConfirmTitle', '¿Eliminar conductor?'),
      text: t('admin.delivery.deleteConfirmText', 'Esta acción eliminará el registro del conductor del sistema.'),
      confirmButtonText: t('common.delete', 'Sí, eliminar'),
      showCancelButton: true,
      cancelButtonText: t('common.cancel', 'Cancelar'),
      icon: 'warning'
    })
    if (result?.isConfirmed) {
      saveConductores(conductores.filter(c => c.id !== id))
      showAlert({ icon: 'success', title: t('admin.delivery.deleteSuccess', 'Conductor eliminado') })
    }
  }

  const handleDirectSelectConductor = (reserva, nombreConductor) => {
    if (!nombreConductor) return
    try {
      const conductorObj = conductores.find(c => c.nombre === nombreConductor)
      const pin = reserva.domicilioPin || String(Math.floor(1000 + Math.random() * 9000))
      reservationManagementService.updateReservation(reserva.id, {
        domicilioConductor: nombreConductor,
        domicilioTelefonoConductor: conductorObj?.telefono || '',
        domicilioEstado: 'ASIGNADO',
        domicilioPin: pin
      }, user)
      showAlert({
        icon: 'success',
        title: t('admin.delivery.modal.assignSuccess', 'Conductor asignado'),
        text: `Conductor: ${nombreConductor} | Código Domicilio (PIN): ${pin}`
      })
      loadReservations()
    } catch (err) {
      showAlert({ icon: 'error', title: 'Error', text: err.message })
    }
  }

  const totalPendientes = useMemo(() => reservations.filter(r => r.estadoDomicilio === 'PENDIENTE').length, [reservations])
  const totalAsignados = useMemo(() => reservations.filter(r => r.estadoDomicilio === 'ASIGNADO').length, [reservations])
  const totalCompletados = useMemo(() => reservations.filter(r => r.estadoDomicilio === 'COMPLETADO').length, [reservations])

  const filtrados = useMemo(() => reservations.filter(r => {
    if (activeTab === 'pendientes' && r.estadoDomicilio !== 'PENDIENTE') return false
    if (activeTab === 'asignados' && r.estadoDomicilio !== 'ASIGNADO') return false
    if (activeTab === 'completados' && r.estadoDomicilio !== 'COMPLETADO') return false
    if (search && activeTab !== 'conductores') {
      const lower = search.toLowerCase()
      return r.codigo?.toLowerCase().includes(lower) || r.domicilioCodigo?.toLowerCase().includes(lower) || r.vehiculoNombre?.toLowerCase().includes(lower) || r.vehiculoPlaca?.toLowerCase().includes(lower) || r.clienteNombre?.toLowerCase().includes(lower) || r.domicilioConductor?.toLowerCase().includes(lower)
    }
    return true
  }).sort((a, b) => new Date(a.fechaEvento) - new Date(b.fechaEvento)), [reservations, search, activeTab])

  const conductoresFiltrados = useMemo(() => {
    if (!search) return conductores
    const lower = search.toLowerCase()
    return conductores.filter(c => 
      c.nombre?.toLowerCase().includes(lower) ||
      c.numDoc?.toLowerCase().includes(lower) ||
      c.licencia?.toLowerCase().includes(lower) ||
      c.telefono?.toLowerCase().includes(lower) ||
      c.vehiculo?.toLowerCase().includes(lower)
    )
  }, [conductores, search])

  const handleAsignar = (e) => {
    e.preventDefault()
    if (!conductorSeleccionado) return showAlert({ icon: 'warning', title: t('admin.delivery.modal.selectDriverWarning', 'Selecciona un conductor') })
    try {
      const pin = String(Math.floor(1000 + Math.random() * 9000))
      reservationManagementService.updateReservation(modalAsignar.id, { domicilioConductor: conductorSeleccionado, domicilioEstado: 'ASIGNADO', domicilioPin: pin }, user)
      showAlert({ icon: 'success', title: t('admin.delivery.modal.assignSuccess', 'Conductor asignado'), text: `PIN: ${pin}` })
      setModalAsignar(null)
      loadReservations()
    } catch (err) { showAlert({ icon: 'error', title: 'Error', text: err.message }) }
  }

  const handleVerificar = (e) => {
    e.preventDefault()
    if (!pinIngresado) return
    if (pinIngresado === modalVerificar.domicilioPin) {
      try {
        const isEntrega = modalVerificar.tipoServicio.includes('Entrega')
        reservationManagementService.updateReservation(modalVerificar.id, { domicilioEstado: 'COMPLETADO', estado: isEntrega ? 'en_curso' : 'finalizada' }, user)
        showAlert({ icon: 'success', title: t('admin.delivery.modal.pinSuccess', 'PIN verificado correctamente.') })
        setModalVerificar(null); setPinIngresado(''); loadReservations()
      } catch (err) { showAlert({ icon: 'error', title: 'Error', text: err.message }) }
    } else {
      showAlert({ icon: 'error', title: t('admin.delivery.modal.pinError', 'PIN incorrecto.'), text: t('admin.delivery.modal.pinErrorText', 'Verifica el codigo con el cliente.') })
    }
  }

  const getBadge = (estado) => {
    const norm = String(estado || 'PENDIENTE').toUpperCase()
    if (norm === 'COMPLETADO') {
      return (
        <span className="doc-status-badge aprobado">
          <FaCheckCircle style={{ fontSize: 11 }} />
          {t('admin.delivery.status.completado', 'Completado')}
        </span>
      )
    }
    if (norm === 'ASIGNADO') {
      return (
        <span className="doc-status-badge pendiente" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
          <FaUserTie style={{ fontSize: 11 }} />
          {t('admin.delivery.status.asignado', 'En Camino')}
        </span>
      )
    }
    return (
      <span className="doc-status-badge pendiente">
        <FaExclamationCircle style={{ fontSize: 11 }} />
        {t('admin.delivery.status.pendiente', 'Pendiente')}
      </span>
    )
  }

  const getConductorBadge = (estado) => {
    const norm = String(estado || 'disponible').toLowerCase()
    if (norm === 'disponible') {
      return (
        <span className="doc-status-badge aprobado" style={{ background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}>
          {t('admin.delivery.driverStatus.disponible', 'Disponible')}
        </span>
      )
    }
    if (norm === 'en_servicio') {
      return (
        <span className="doc-status-badge pendiente" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
          {t('admin.delivery.driverStatus.enServicio', 'En Ruta')}
        </span>
      )
    }
    return (
      <span className="doc-status-badge rechazada" style={{ background: '#f1f5f9', color: '#64748b', borderColor: '#cbd5e1' }}>
        {t('admin.delivery.driverStatus.inactivo', 'Inactivo')}
      </span>
    )
  }

  const closeBtnStyle = { background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--city-muted)', lineHeight: 1, padding: 0 }
  const modalHeadStyle = { padding: '20px 24px', borderBottom: '1px solid var(--city-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  const backdropStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.65)', padding: 16 }

  const exportData = useMemo(() => {
    if (activeTab === 'conductores') {
      return conductoresFiltrados.map((c, i) => [
        i + 1,
        c.nombre,
        c.email || '-',
        c.tipoDoc || 'CC',
        c.numDoc || '-',
        c.licencia || '-',
        c.categoriaLic || '-',
        c.vencimientoLic || '-',
        c.telefono || '-',
        c.vehiculo || 'Sin asignar',
        c.estado || 'disponible'
      ])
    }
    return filtrados.map((r, i) => [
      i + 1,
      r.codigo,
      r.domicilioCodigo || `DOM-${r.domicilioPin || '1862'}`,
      r.clienteNombre,
      r.vehiculoNombre || r.vehiculo?.nombre || '-',
      r.tipoServicio,
      r.direccionInfo,
      r.fechaEvento ? new Date(r.fechaEvento).toLocaleDateString() : '-',
      r.domicilioConductor || t('admin.delivery.noDriver', 'Sin asignar'),
      r.estadoDomicilio || 'PENDIENTE'
    ])
  }, [filtrados, conductoresFiltrados, activeTab, t])

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={esEncargado} />
      <main className="management-main doc-verification-main">
        <div className="cities-container" style={{ maxWidth: '100%' }}>

          <header className="cities-topbar reservations-management-header">
            <div className="branch-topbar-brand-title">
              <span className="branch-topbar-badge">{t('admin.branchManagement', 'GESTION OPERATIVA')}</span>
              <h1 className="branch-topbar-heading">{t('admin.delivery.title', 'Domicilio Reserva')}</h1>
            </div>
            <div className="cities-topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <MenuConfiguracion />
              {user && (
                <div className="branch-user-profile-chip">
                  <div className="branch-user-avatar">{(user?.nombre || user?.correo || 'A').charAt(0).toUpperCase()}</div>
                  <div className="branch-user-info-text">
                    <strong className="branch-user-name">{[user?.nombre, user?.apellido].filter(Boolean).join(' ') || user?.correo || 'Usuario'}</strong>
                    <span className="branch-user-role">{user?.rol || 'encargado_sucursal'}</span>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* KPI CARDS */}
          <div className="cash-kpi-bar">
            {[
              { icon: FaExclamationCircle, color: '#f59e0b', label: t('admin.delivery.kpi.pending', 'Pendientes de Asignar'), value: totalPendientes, desc: t('admin.delivery.kpi.pendingDesc', 'Sin conductor asignado') },
              { icon: FaRoute, color: '#3b82f6', label: t('admin.delivery.kpi.assigned', 'En Camino'), value: totalAsignados, desc: t('admin.delivery.kpi.assignedDesc', 'Con conductor asignado') },
              { icon: FaCheckCircle, color: '#10b981', label: t('admin.delivery.kpi.completed', 'Entregados'), value: totalCompletados, desc: t('admin.delivery.kpi.completedDesc', 'Servicios finalizados') },
              { icon: FaUserTie, color: '#8b5cf6', label: t('admin.delivery.kpi.drivers', 'Conductores Registrados'), value: conductores.length, desc: t('admin.delivery.kpi.driversDesc', 'Personal disponible en sucursal') },
            ].map(({ icon: Icon, color, label, value, desc }) => (
              <div key={label} className="cash-kpi-item-light">
                <div className="cash-kpi-header-light" style={{ color }}>
                  <Icon /><span>{label}</span>
                </div>
                <strong className="cash-kpi-val-light">{value}</strong>
                <div className="cash-kpi-progress-bg">
                  <div className="cash-kpi-progress-fill" style={{ width: value > 0 ? '100%' : '0%', background: color }} />
                </div>
                <span className="cash-kpi-subtitle-light">{desc}</span>
              </div>
            ))}
          </div>

          {/* PESTAÑAS ADHERIDAS CON BOTON AZUL "+ CREAR CONDUCTOR" A LA DERECHA */}
          <div className="fleet-attached-tabs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div className="fleet-tabs-nav">
              <button
                type="button"
                onClick={() => setActiveTab('todos')}
                className={`fleet-tab-btn ${activeTab === 'todos' ? 'is-active' : ''}`}
              >
                {t('admin.delivery.tabs.all', 'Todos los Domicilios Reserva')} ({reservations.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pendientes')}
                className={`fleet-tab-btn ${activeTab === 'pendientes' ? 'is-active' : ''}`}
              >
                {t('admin.delivery.tabs.pending', 'Pendientes')} ({totalPendientes})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('asignados')}
                className={`fleet-tab-btn ${activeTab === 'asignados' ? 'is-active' : ''}`}
              >
                {t('admin.delivery.tabs.assigned', 'En Camino')} ({totalAsignados})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('completados')}
                className={`fleet-tab-btn ${activeTab === 'completados' ? 'is-active' : ''}`}
              >
                {t('admin.delivery.tabs.completed', 'Completados')} ({totalCompletados})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('conductores')}
                className={`fleet-tab-btn ${activeTab === 'conductores' ? 'is-active' : ''}`}
              >
                {t('admin.delivery.tabs.drivers', 'Conductores')} ({conductores.length})
              </button>
            </div>

            {/* BOTÓN AZUL CREAR CONDUCTOR EN LA FILA DE SECCIONES A LA DERECHA */}
            <div className="fleet-tabs-action">
              <button
                type="button"
                className="city-btn city-btn--primary"
                onClick={() => { setEditingConductor(null); setNuevoConductor(INITIAL_CONDUCTOR); setModalConductor(true); }}
                style={{
                  background: 'var(--brand-primary, #2563eb)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  whiteSpace: 'nowrap',
                }}
              >
                <FaPlus style={{ fontSize: 11 }} />
                {t('admin.delivery.createDriverBtn', 'Crear Conductor')}
              </button>
            </div>
          </div>

          {/* TARJETA PRINCIPAL ADHERIDA A PESTAÑAS */}
          <section className="cities-card attached-to-tabs">
            {/* TOOLBAR CON BUSCADOR, SUCURSAL Y EXPORT PILLS */}
            <div className="cities-toolbar doc-toolbar-wrapper">
              <label className="cities-search" style={{ flex: '1 1 250px', margin: 0 }}>
                <FaSearch />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    activeTab === 'conductores'
                      ? t('admin.delivery.searchDriverPlaceholder', 'Buscar conductor por nombre, documento, licencia o teléfono...')
                      : t('admin.delivery.searchPlaceholder', 'Buscar por código, vehículo, placa o cliente...')
                  }
                />
              </label>

              <div className="doc-branch-badge">
                <FaBuilding style={{ color: 'var(--city-muted, #64748b)' }} />
                <span>{user?.sucursalAsignada || user?.sucursalId || user?.sucursal || 'Alamo Bogotá - Aeropuerto'}</span>
              </div>

              <div className="export-pills-group" style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="export-pill export-pill--excel"
                  onClick={() => exportExcel(exportData)}
                  title={t('admin.exportExcel', 'Excel')}
                >
                  <FaFileExcel aria-hidden="true" /> {t('admin.exportExcel', 'Excel')}
                </button>
                <button
                  type="button"
                  className="export-pill export-pill--pdf"
                  onClick={() => exportPdf(exportData)}
                  title={t('admin.exportPdf', 'PDF')}
                >
                  <FaFilePdf aria-hidden="true" /> {t('admin.exportPdf', 'PDF')}
                </button>
                <button
                  type="button"
                  className="export-pill export-pill--print"
                  onClick={() => printTable(exportData)}
                  title={t('admin.incidents.print', 'Imprimir')}
                >
                  <FaPrint aria-hidden="true" /> {t('admin.incidents.print', 'Imprimir')}
                </button>
              </div>
            </div>

            {/* SI PESTAÑA CONDUCTORES ESTÁ ACTIVA */}
            {activeTab === 'conductores' ? (
              <>
                <div className="cities-summary" style={{ margin: '8px 0 12px' }}>
                  <span>{conductoresFiltrados.length}</span>{' '}
                  {t('admin.delivery.driversFoundCount', 'CONDUCTORES REGISTRADOS EN SUCURSAL').toUpperCase()}
                </div>

                {conductoresFiltrados.length === 0 ? (
                  <div className="cities-empty">
                    <FaUserTie style={{ fontSize: 44, color: '#94a3b8', marginBottom: 12 }} />
                    <h2>{t('admin.delivery.emptyDriversTitle', 'No se encontraron conductores')}</h2>
                    <p>{t('admin.delivery.emptyDriversDesc', 'Haz clic en "+ Crear Conductor" para registrar el primer conductor.')}</p>
                  </div>
                ) : (
                  <div className="cities-table-wrap doc-desktop-table" style={{ overflowX: 'auto' }}>
                    <table className="incidents-table-v2" style={{ whiteSpace: 'nowrap', width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '35px' }}>{t('admin.delivery.table.id', 'ID')}</th>
                          <th>{t('admin.delivery.drivers.name', 'NOMBRE CONDUCTOR')}</th>
                          <th>{t('admin.delivery.drivers.email', 'CORREO ELECTRÓNICO')}</th>
                          <th>{t('admin.delivery.drivers.docType', 'TIPO DOC')}</th>
                          <th>{t('admin.delivery.drivers.docNum', 'NÚMERO DOC')}</th>
                          <th>{t('admin.delivery.drivers.licenseNum', 'NÚMERO LICENCIA')}</th>
                          <th>{t('admin.delivery.drivers.licenseCat', 'CATEGORÍA LICENCIA')}</th>
                          <th>{t('admin.delivery.drivers.licenseExp', 'VENCIMIENTO LICENCIA')}</th>
                          <th>{t('admin.delivery.drivers.phone', 'TELÉFONO')}</th>
                          <th>{t('admin.delivery.drivers.vehicle', 'VEHÍCULO ASIGNADO')}</th>
                          <th style={{ textAlign: 'center' }}>{t('admin.delivery.table.status', 'ESTADO')}</th>
                          <th style={{ textAlign: 'center' }}>{t('admin.delivery.table.actions', 'ACCIONES')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conductoresFiltrados.map((c, i) => (
                          <tr key={c.id}>
                            <td style={{ fontWeight: 400, color: 'var(--city-text, #0f172a)', width: '35px' }}>{i + 1}</td>
                            <td style={{ fontWeight: 500, color: 'var(--city-text, #0f172a)' }}>{c.nombre}</td>
                            <td style={{ fontWeight: 400, color: 'var(--city-muted, #64748b)' }}>{c.email || t('admin.delivery.noEmail', 'Sin correo')}</td>
                            <td style={{ fontWeight: 400, color: 'var(--city-text, #334155)' }}>{c.tipoDoc || 'CC'}</td>
                            <td style={{ fontWeight: 400, color: 'var(--city-text, #334155)' }}>{c.numDoc || '-'}</td>
                            <td style={{ fontWeight: 500, color: 'var(--brand-primary, #2563eb)' }}>{c.licencia || '-'}</td>
                            <td style={{ fontWeight: 400, color: 'var(--city-text, #334155)' }}>{c.categoriaLic || '-'}</td>
                            <td style={{ fontWeight: 400, color: 'var(--city-muted, #64748b)' }}>{c.vencimientoLic || '-'}</td>
                            <td style={{ fontWeight: 400, color: 'var(--city-text, #334155)' }}>{c.telefono || '-'}</td>
                            <td style={{ fontWeight: 400, color: 'var(--city-text, #334155)' }}>{c.vehiculo || t('admin.delivery.noVehicle', 'Sin vehículo asignado')}</td>
                            <td style={{ textAlign: 'center', fontWeight: 400 }}>
                              {getConductorBadge(c.estado)}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 400 }}>
                              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleEditarConductor(c)}
                                  title={t('admin.delivery.drivers.editBtn', 'Editar')}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    background: 'var(--brand-soft-light, #eff6ff)',
                                    color: 'var(--brand-primary, #2563eb)',
                                    border: '1px solid var(--brand-border-light, #bfdbfe)',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: 12,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}
                                >
                                  <FaEdit /> {t('admin.delivery.drivers.editBtn', 'Editar')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEliminarConductor(c.id)}
                                  title={t('admin.delivery.drivers.deleteBtn', 'Eliminar')}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: 12,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}
                                >
                                  <FaTrashAlt /> {t('admin.delivery.drivers.deleteBtn', 'Eliminar')}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              /* SI PESTAÑAS DE RESERVAS ESTÁN ACTIVAS */
              <>
                {/* CONTADOR SUMARIO */}
                <div className="cities-summary" style={{ margin: '8px 0 12px' }}>
                  <span>{filtrados.length}</span>{' '}
                  {t('admin.delivery.foundCount', 'DOMICILIOS RESERVA EN EL LISTADO').toUpperCase()}
                </div>

                {filtrados.length === 0 ? (
                  <div className="cities-empty">
                    <FaMapMarkerAlt style={{ fontSize: 44, color: '#94a3b8', marginBottom: 12 }} />
                    <h2>{t('admin.delivery.emptyTitle', 'No se encontraron domicilios')}</h2>
                    <p>{t('admin.delivery.emptyDesc', 'No hay entregas o devoluciones a domicilio que coincidan con los filtros seleccionados.')}</p>
                  </div>
                ) : (
                  <>
                    {/* 1. Vista de Tabla Completa para Escritorio & Tablets */}
                    <div className="cities-table-wrap doc-desktop-table" style={{ overflowX: 'auto' }}>
                      <table className="incidents-table-v2" style={{ whiteSpace: 'nowrap', width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '35px' }}>{t('admin.delivery.table.id', 'ID')}</th>
                            <th>{t('admin.delivery.table.reservationCode', 'CÓDIGO RESERVA')}</th>
                            <th>{t('admin.delivery.table.deliveryCode', 'CÓDIGO DOMICILIO (PIN)')}</th>
                            <th>{t('admin.delivery.table.clientName', 'NOMBRE CLIENTE')}</th>
                            <th>{t('admin.delivery.table.vehicleName', 'VEHÍCULO')}</th>
                            <th>{t('admin.delivery.table.serviceType', 'TIPO SERVICIO')}</th>
                            <th>{t('admin.delivery.table.address', 'DIRECCIÓN DE ENTREGA / RECOGIDA')}</th>
                            <th>{t('admin.delivery.table.dateTime', 'FECHA Y HORA')}</th>
                            <th>{t('admin.delivery.table.driver', 'CONDUCTOR ASIGNADO')}</th>
                            <th style={{ textAlign: 'center' }}>{t('admin.delivery.table.status', 'ESTADO')}</th>
                            <th style={{ textAlign: 'center' }}>{t('admin.delivery.table.actions', 'ACCIONES')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtrados.map((r, i) => (
                            <tr key={r.id}>
                              <td style={{ fontWeight: 400, color: 'var(--city-text, #0f172a)', width: '35px' }}>{i + 1}</td>
                              <td style={{ fontWeight: 500, color: 'var(--city-text, #0f172a)' }}>{r.codigo}</td>
                              <td style={{ fontWeight: 500, color: 'var(--brand-primary, #2563eb)' }}>
                                {r.domicilioCodigo || `DOM-${r.domicilioPin || '1862'}`}
                              </td>
                              <td style={{ fontWeight: 400, color: 'var(--city-text, #0f172a)' }}>{r.clienteNombre}</td>
                              <td style={{ fontWeight: 400, color: 'var(--city-text, #0f172a)' }}>{r.vehiculoNombre || r.vehiculo?.nombre || '-'}</td>
                              <td style={{ fontWeight: 400 }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--city-text, #334155)', fontWeight: 400 }}>
                                  <FaCar style={{ color: 'var(--city-muted, #64748b)', flexShrink: 0 }} />
                                  {r.tipoServicio}
                                </span>
                              </td>
                              <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--city-text, #334155)', fontWeight: 400 }} title={r.direccionInfo}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <FaMapMarkerAlt style={{ color: '#ef4444', fontSize: 11, flexShrink: 0 }} />
                                  {r.direccionInfo}
                                </span>
                              </td>
                              <td style={{ color: 'var(--city-muted, #64748b)', fontWeight: 400 }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                  <FaCalendarAlt style={{ fontSize: 11 }} />
                                  {r.fechaEvento ? new Date(r.fechaEvento).toLocaleDateString() : '-'}
                                </span>
                              </td>
                              <td style={{ fontWeight: 400 }}>
                                <select
                                  value={r.domicilioConductor || ''}
                                  onChange={(e) => handleDirectSelectConductor(r, e.target.value)}
                                  style={{
                                    padding: '6px 10px',
                                    borderRadius: 8,
                                    border: '1.5px solid var(--city-border, #cbd5e1)',
                                    background: 'var(--city-bg, #f8fafc)',
                                    color: r.domicilioConductor ? 'var(--city-text, #0f172a)' : 'var(--city-muted, #64748b)',
                                    fontSize: 12.5,
                                    fontWeight: 400,
                                    outline: 'none',
                                    cursor: 'pointer',
                                    maxWidth: 200
                                  }}
                                >
                                  <option value="">{t('admin.delivery.modal.selectDriverPlaceholder', '-- Seleccionar Conductor --')}</option>
                                  {conductores.map(c => (
                                    <option key={c.id} value={c.nombre}>
                                      {c.nombre} {c.vehiculo ? `(${c.vehiculo})` : ''}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 400 }}>
                                {getBadge(r.estadoDomicilio)}
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 400 }}>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                  {r.estadoDomicilio === 'ASIGNADO' && (
                                    <button
                                      type="button"
                                      onClick={() => setModalVerificar(r)}
                                      style={{
                                        padding: '6px 16px',
                                        borderRadius: '9999px',
                                        background: '#16a34a',
                                        color: 'var(--city-card, #ffffff)',
                                        border: 'none',
                                        fontWeight: 700,
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 5px rgba(22, 163, 74, 0.25)',
                                        transition: 'all 0.2s',
                                        whiteSpace: 'nowrap',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                      }}
                                    >
                                      <FaKey style={{ fontSize: 11 }} />
                                      {t('admin.delivery.verifyBtn', 'Verificar PIN')}
                                    </button>
                                  )}
                                  {r.estadoDomicilio === 'COMPLETADO' && (
                                    <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                      <FaCheckCircle />
                                      {t('admin.delivery.completedLabel', 'Entregado')}
                                    </span>
                                  )}
                                  {r.estadoDomicilio === 'PENDIENTE' && (
                                    <span style={{ fontSize: 12, color: '#d97706', fontWeight: 400 }}>
                                      {t('admin.delivery.status.pendiente', 'Pendiente')}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* 2. Vista de Tarjetas Adaptativas para Pantallas Móviles */}
                    <div className="doc-mobile-cards">
                      {filtrados.map((r, i) => (
                        <div key={r.id} className="doc-mobile-card">
                          <div className="doc-mobile-card-header">
                            <div className="doc-mobile-card-title">
                              <span style={{ fontWeight: 400, color: 'var(--brand-primary, #2563eb)', fontSize: 13 }}>ID {i + 1}</span>
                              <span style={{ fontWeight: 500, color: 'var(--city-text, #0f172a)', fontSize: 14 }}>{r.codigo}</span>
                            </div>
                            {getBadge(r.estadoDomicilio)}
                          </div>

                          <div className="doc-mobile-card-body">
                            <div className="doc-mobile-data-item doc-mobile-data-item--full">
                              <span className="doc-mobile-data-label">{t('admin.delivery.table.clientName', 'Nombre Cliente')}</span>
                              <span className="doc-mobile-data-value" style={{ fontSize: 14, fontWeight: 400 }}>{r.clienteNombre}</span>
                            </div>

                            <div className="doc-mobile-data-item doc-mobile-data-item--full">
                              <span className="doc-mobile-data-label">{t('admin.delivery.table.deliveryCode', 'Código Domicilio (PIN)')}</span>
                              <span className="doc-mobile-data-value" style={{ color: 'var(--brand-primary, #2563eb)', fontWeight: 500 }}>
                                {r.domicilioCodigo || `DOM-${r.domicilioPin || '1862'}`}
                              </span>
                            </div>

                            <div className="doc-mobile-data-item doc-mobile-data-item--full">
                              <span className="doc-mobile-data-label">{t('admin.delivery.table.vehicleName', 'Vehículo')}</span>
                              <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>{r.vehiculoNombre || r.vehiculo?.nombre || '-'}</span>
                            </div>

                            <div className="doc-mobile-data-item">
                              <span className="doc-mobile-data-label">{t('admin.delivery.table.serviceType', 'Tipo Servicio')}</span>
                              <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>{r.tipoServicio}</span>
                            </div>

                            <div className="doc-mobile-data-item">
                              <span className="doc-mobile-data-label">{t('admin.delivery.table.dateTime', 'Fecha')}</span>
                              <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>{r.fechaEvento ? new Date(r.fechaEvento).toLocaleDateString() : '-'}</span>
                            </div>

                            <div className="doc-mobile-data-item doc-mobile-data-item--full">
                              <span className="doc-mobile-data-label">{t('admin.delivery.table.address', 'Dirección')}</span>
                              <span className="doc-mobile-data-value" style={{ color: 'var(--brand-primary, #2563eb)', fontWeight: 400 }}>{r.direccionInfo}</span>
                            </div>

                            <div className="doc-mobile-data-item doc-mobile-data-item--full">
                              <span className="doc-mobile-data-label">{t('admin.delivery.table.driver', 'Conductor Asignado')}</span>
                              <select
                                value={r.domicilioConductor || ''}
                                onChange={(e) => handleDirectSelectConductor(r, e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: 8,
                                  border: '1.5px solid var(--city-border, #cbd5e1)',
                                  background: 'var(--city-bg, #f8fafc)',
                                  color: r.domicilioConductor ? 'var(--city-text, #0f172a)' : 'var(--city-muted, #64748b)',
                                  fontSize: 13,
                                  fontWeight: 400,
                                  outline: 'none',
                                  marginTop: 4
                                }}
                              >
                                <option value="">{t('admin.delivery.modal.selectDriverPlaceholder', '-- Seleccionar Conductor --')}</option>
                                {conductores.map(c => (
                                  <option key={c.id} value={c.nombre}>
                                    {c.nombre} {c.vehiculo ? `(${c.vehiculo})` : ''}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="doc-mobile-card-actions">
                            {r.estadoDomicilio === 'ASIGNADO' && (
                              <button
                                type="button"
                                onClick={() => setModalVerificar(r)}
                                style={{
                                  width: '100%',
                                  padding: '9px 18px',
                                  borderRadius: '12px',
                                  background: '#16a34a',
                                  color: 'var(--city-card, #ffffff)',
                                  border: 'none',
                                  fontWeight: 700,
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 8,
                                }}
                              >
                                <FaKey style={{ fontSize: 12 }} />
                                {t('admin.delivery.verifyBtn', 'Verificar PIN')}
                              </button>
                            )}
                            {r.estadoDomicilio === 'COMPLETADO' && (
                              <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FaCheckCircle />
                                {t('admin.delivery.completedLabel', 'Servicio Entregado')}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </section>
        </div>

        {/* MODAL CREAR / EDITAR CONDUCTOR CON TODOS LOS CAMPOS */}
        {modalConductor && (
          <div className="cities-modal-backdrop" style={backdropStyle} onMouseDown={e => e.target === e.currentTarget && (setModalConductor(false), setEditingConductor(null))}>
            <section className="cities-modal" style={{ maxWidth: 600, width: '100%', background: 'var(--city-card)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={modalHeadStyle}>
                <div>
                  <p style={{ color: 'var(--city-muted)', margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    {editingConductor ? t('admin.delivery.modal.editDriverEyebrow', 'EDICIÓN DE PERSONAL') : t('admin.delivery.modal.createDriverEyebrow', 'REGISTRO DE PERSONAL')}
                  </p>
                  <h2 style={{ color: 'var(--city-text)', margin: 0, fontSize: 18, fontWeight: 800 }}>
                    {editingConductor ? t('admin.delivery.modal.editDriverTitle', 'Editar Conductor') : t('admin.delivery.modal.createDriverTitle', 'Crear Nuevo Conductor')}
                  </h2>
                </div>
                <button type="button" onClick={() => { setModalConductor(false); setEditingConductor(null); }} style={closeBtnStyle}>&times;</button>
              </div>

              <div style={{ padding: '20px 24px', maxHeight: '78vh', overflowY: 'auto' }}>
                <form id="conductor-form" onSubmit={handleCrearConductor} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  
                  {/* Nombre Completo */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      {t('admin.delivery.modal.driverName', 'Nombre Completo del Conductor')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={nuevoConductor.nombre}
                      onChange={e => setNuevoConductor({ ...nuevoConductor, nombre: e.target.value })}
                      placeholder="Ej: Carlos Eduardo Ramírez"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    />
                  </div>

                  {/* {t('admin.delivery.modal.driverEmail', 'Correo Electrónico')} */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={nuevoConductor.email}
                      onChange={e => setNuevoConductor({ ...nuevoConductor, email: e.target.value })}
                      placeholder="conductor@drivique.com"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      {t('admin.delivery.modal.driverPhone', 'Teléfono / WhatsApp')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={nuevoConductor.telefono}
                      onChange={e => setNuevoConductor({ ...nuevoConductor, telefono: e.target.value })}
                      placeholder="+57 310 000 0000"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    />
                  </div>

                  {/* {t('admin.delivery.modal.driverDocType', 'Tipo de Documento')} */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      Tipo de Documento *
                    </label>
                    <select
                      value={nuevoConductor.tipoDoc}
                      onChange={e => setNuevoConductor({ ...nuevoConductor, tipoDoc: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    >
                      <option value="CC">Cédula de Ciudadanía (CC)</option>
                      <option value="CE">Cédula de Extranjería (CE)</option>
                      <option value="PAS">Pasaporte (PAS)</option>
                    </select>
                  </div>

                  {/* {t('admin.delivery.modal.driverDocNum', 'Número de Documento')} */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      Número de Documento *
                    </label>
                    <input
                      type="text"
                      required
                      value={nuevoConductor.numDoc}
                      onChange={e => setNuevoConductor({ ...nuevoConductor, numDoc: e.target.value })}
                      placeholder="1018432910"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    />
                  </div>

                  {/* {t('admin.delivery.modal.driverLicense', 'Número de Licencia')} */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      Número de Licencia *
                    </label>
                    <input
                      type="text"
                      required
                      value={nuevoConductor.licencia}
                      onChange={e => setNuevoConductor({ ...nuevoConductor, licencia: e.target.value })}
                      placeholder="C1-84920412"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    />
                  </div>

                  {/* {t('admin.delivery.modal.driverLicenseCat', 'Categoría de Licencia')} */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      Categoría de Licencia *
                    </label>
                    <select
                      value={nuevoConductor.categoriaLic}
                      onChange={e => setNuevoConductor({ ...nuevoConductor, categoriaLic: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    >
                      <option value="A2">A2 (Motocicletas)</option>
                      <option value="B1">B1 (Automóviles y Camionetas particulares)</option>
                      <option value="B2">B2 (Camiones particulares)</option>
                      <option value="C1">C1 (Automóviles y Camionetas servicio público)</option>
                      <option value="C2">C2 (Camiones servicio público)</option>
                    </select>
                  </div>

                  {/* Vencimiento Licencia */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      {t('admin.delivery.modal.driverLicenseExp', 'Vencimiento de Licencia')} *
                    </label>
                    <input
                      type="date"
                      required
                      value={nuevoConductor.vencimientoLic}
                      onChange={e => setNuevoConductor({ ...nuevoConductor, vencimientoLic: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    />
                  </div>

                  {/* Estado Inicial */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      {t('admin.delivery.modal.driverStatus', 'Estado del Conductor')} *
                    </label>
                    <select
                      value={nuevoConductor.estado}
                      onChange={e => setNuevoConductor({ ...nuevoConductor, estado: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    >
                      <option value="disponible">{t('admin.delivery.driverStatus.disponible', 'Disponible')}</option>
                      <option value="en_servicio">{t('admin.delivery.driverStatus.enServicio', 'En Ruta')}</option>
                      <option value="inactivo">{t('admin.delivery.driverStatus.inactivo', 'Inactivo')}</option>
                    </select>
                  </div>

                  {/* Vehículo Asignado */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                      {t('admin.delivery.modal.driverVehicle', 'Vehículo o Medio de Transporte Asignado')}
                    </label>
                    <input
                      type="text"
                      value={nuevoConductor.vehiculo}
                      onChange={e => setNuevoConductor({ ...nuevoConductor, vehiculo: e.target.value })}
                      placeholder="Ej: Moto Yamaha NMAX 155 (Placa ABC-12D) o Renault Kangoo"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                    />
                  </div>

                </form>
              </div>

              <div style={{ padding: '14px 24px', borderTop: '1px solid var(--city-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => { setModalConductor(false); setEditingConductor(null); }}
                  style={{ padding: '8px 18px', borderRadius: 9999, background: 'transparent', color: 'var(--city-muted)', border: '1.5px solid var(--city-border)', cursor: 'pointer', fontWeight: 700 }}
                >
                  {t('admin.delivery.modal.cancelBtn', 'Cancelar')}
                </button>
                <button
                  type="submit"
                  form="conductor-form"
                  style={{ padding: '8px 22px', borderRadius: 9999, background: 'var(--brand-primary, #2563eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
                >
                  {editingConductor ? t('common.saveChanges', 'Guardar Cambios') : t('admin.delivery.modal.saveBtn', 'Crear Conductor')}
                </button>
              </div>
            </section>
          </div>
        )}

        {/* MODAL VERIFICAR PIN */}
        {modalVerificar && (
          <div className="cities-modal-backdrop" style={backdropStyle} onMouseDown={e => e.target === e.currentTarget && (setModalVerificar(null), setPinIngresado(''))}>
            <section className="cities-modal" style={{ maxWidth: 400, background: 'var(--city-card)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={modalHeadStyle}>
                <div>
                  <p style={{ color: 'var(--city-muted)', margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{t('admin.delivery.modal.verifyEyebrow', 'VALIDACION DE ENTREGA')}</p>
                  <h2 style={{ color: 'var(--city-text)', margin: 0, fontSize: 18, fontWeight: 800 }}>{t('admin.delivery.modal.verifyTitle', 'Verificar Codigo PIN')}</h2>
                </div>
                <button type="button" onClick={() => { setModalVerificar(null); setPinIngresado('') }} style={closeBtnStyle}>&times;</button>
              </div>
              <div style={{ padding: 24 }}>
                <p style={{ fontSize: 13.5, color: 'var(--city-muted)', marginBottom: 14, lineHeight: 1.5 }}>{t('admin.delivery.modal.verifyDescription', 'El conductor solicita el PIN al cliente y lo digita aqui para confirmar la entrega.')}</p>
                <div style={{ marginBottom: 18, padding: 14, background: 'var(--city-bg)', borderRadius: 10, border: '1.5px solid var(--city-border)' }}>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--city-muted)', marginBottom: 2 }}>{t('admin.delivery.modal.reservation', 'Reserva')} <strong style={{ color: 'var(--brand-primary, #2563eb)' }}>{modalVerificar.codigo}</strong></p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--city-muted)' }}>{t('admin.delivery.modal.clientLabel', 'Cliente')} <strong style={{ color: 'var(--city-text)' }}>{modalVerificar.clienteNombre}</strong></p>
                </div>
                <form id="verificar-form" onSubmit={handleVerificar}>
                  <label style={{ display: 'block', textAlign: 'center', fontWeight: 700, color: 'var(--city-text)', fontSize: 13, marginBottom: 10 }}>{t('admin.delivery.modal.pinLabel', 'PIN de Verificacion')}</label>
                  <input type="text" inputMode="numeric" maxLength={4} placeholder="••••" value={pinIngresado} onChange={e => setPinIngresado(e.target.value.replace(/\D/g, ''))} required autoFocus
                    style={{ width: '100%', padding: 16, fontSize: 28, letterSpacing: 12, textAlign: 'center', borderRadius: 10, border: '2px solid var(--brand-primary, #2563eb)', background: 'var(--city-bg)', color: 'var(--city-text)', outline: 'none', boxSizing: 'border-box', fontWeight: 800 }} />
                </form>
              </div>
              <div style={{ padding: '14px 24px', borderTop: '1px solid var(--city-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => { setModalVerificar(null); setPinIngresado('') }} style={{ padding: '8px 18px', borderRadius: 9999, background: 'transparent', color: 'var(--city-muted)', border: '1.5px solid var(--city-border)', cursor: 'pointer', fontWeight: 700 }}>{t('admin.delivery.modal.cancelBtn', 'Cancelar')}</button>
                <button type="submit" form="verificar-form" style={{ padding: '8px 22px', borderRadius: 9999, background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 5px rgba(22,163,74,0.3)' }}>
                  <FaKey style={{ fontSize: 12 }} />{t('admin.delivery.modal.verifySubmit', 'Verificar PIN')}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
