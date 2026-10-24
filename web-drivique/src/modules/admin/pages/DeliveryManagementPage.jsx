import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaSearch, FaMapMarkerAlt, FaUserTie, FaCalendarAlt, FaCar, FaCheckCircle, FaTimesCircle, FaKey, FaRoute, FaExclamationCircle, FaFileExcel, FaFilePdf, FaPrint, FaBuilding, FaPlus, FaEdit, FaTrashAlt, FaIdCard, FaPhone, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import { useAuthStore } from '@/store/authStore'
import { reservationManagementService } from '@/services/reservationManagementService'
import { showAlert } from '@/utils/swalConfig'
import { deliveryService } from '@/services/deliveryService'
import { exportExcel, exportPdf, printTable } from '@/utils/listExportUtils'
import './CityManagementPage.css'
import './CashCollectionPage.css'
import './DocumentVerificationPage.css'

const INITIAL_CONDUCTOR = {
  nombre: '',
  email: '',
  tipoDoc: 'CC',
  numDoc: '',
  licencia: '',
  categoriaLic: 'B1',
  vencimientoLic: '',
  telefono: '',
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
  const [modalConductor, setModalConductor] = useState(false)
  const [editingConductor, setEditingConductor] = useState(null)
  const [modalVerificar, setModalVerificar] = useState(null)
  const [pinIngresado, setPinIngresado] = useState('')
  const [assigningPointId, setAssigningPointId] = useState(null)
  const [revealedPins, setRevealedPins] = useState({})

  const [conductores, setConductores] = useState(() => deliveryService.list())

  const [nuevoConductor, setNuevoConductor] = useState(INITIAL_CONDUCTOR)

  const ESTADO_DOMICILIO = { PENDING: 'PENDIENTE', ASSIGNED: 'ASIGNADO', COMPLETED: 'COMPLETADO' }

  const loadReservations = () => {
    const all = reservationManagementService.list(user)
    const filas = []
    all.forEach((r) => {
      const puntoRecogida = (r.domicilioPuntos || []).find((p) => p.tipo === 'PICKUP')
      const puntoDevolucion = (r.domicilioPuntos || []).find((p) => p.tipo === 'RETURN')

      ;(r.domicilioPuntos || []).forEach((p) => {
        const esEntrega = p.tipo === 'PICKUP'
        filas.push({
          ...r,
          rowId: `${r.id}:${p.tipo}`,
          puntoTipo: p.tipo,
          tipoServicio: esEntrega
            ? t('admin.delivery.serviceTypes.delivery', 'Entrega a Domicilio')
            : t('admin.delivery.serviceTypes.return', 'Devolucion a Domicilio'),
          direccionInfo: p.direccion || 'No registrada',
          fechaEvento: esEntrega ? r.fechaInicio : r.fechaFin,
          // Campos separados para Recogida
          direccionRecogida: puntoRecogida ? (puntoRecogida.direccion || 'No registrada') : 'No aplica',
          fechaRecogida: puntoRecogida ? (r.fechaInicio || '—') : 'No aplica',
          horaRecogida: puntoRecogida ? (r.horaInicio || '—') : 'No aplica',
          // Campos separados para Devolución
          direccionDevolucion: puntoDevolucion ? (puntoDevolucion.direccion || 'No registrada') : 'No aplica',
          fechaDevolucion: puntoDevolucion ? (r.fechaFin || '—') : 'No aplica',
          horaDevolucion: puntoDevolucion ? (r.horaFin || '—') : 'No aplica',

          domicilioCodigo: p.deliveryPin || '—',
          domicilioPin: p.deliveryPin || '—',
          domicilioConductor: p.conductor,
          domicilioConductorId: p.conductorId,
          estadoDomicilio: ESTADO_DOMICILIO[p.estado] || 'PENDIENTE',
        })
      })
    })
    setReservations(filas)
  }

  const cargarConductores = () => deliveryService.refresh().then(setConductores).catch(() => setConductores([]))

  useEffect(() => {
    let mounted = true
    const refreshData = () => {
      reservationManagementService.refresh().then(() => {
        if (mounted) loadReservations()
      }).catch(() => {})
    }

    refreshData()
    cargarConductores()

    // Auto-polling cada 12 segundos para actualizar en tiempo real si el conductor confirma o reporta desde el correo
    const intervalId = setInterval(refreshData, 12000)

    // Sincronizar inmediatamente cuando la ventana vuelve a primer plano
    const onFocus = () => refreshData()
    window.addEventListener('focus', onFocus)

    return () => {
      mounted = false
      clearInterval(intervalId)
      window.removeEventListener('focus', onFocus)
    }
  }, [user])

  const handleCrearConductor = async (e) => {
    e.preventDefault()
    if (!nuevoConductor.nombre) return showAlert({ icon: 'warning', title: t('admin.delivery.modal.nameRequired', 'El nombre es obligatorio') })

    try {
      if (editingConductor) {
        setConductores(await deliveryService.update(editingConductor.id, nuevoConductor))
        showAlert({ icon: 'success', title: t('admin.delivery.modal.updateSuccess', 'Conductor actualizado exitosamente.') })
      } else {
        setConductores(await deliveryService.create(nuevoConductor))
        showAlert({ icon: 'success', title: t('admin.delivery.modal.createSuccess', 'Conductor creado exitosamente.') })
      }
    } catch (err) {
      return showAlert({ icon: 'error', title: t('hc4.error', 'Error'), text: err.message })
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
      try {
        setConductores(await deliveryService.remove(id))
        showAlert({ icon: 'success', title: t('admin.delivery.deleteSuccess', 'Conductor eliminado') })
      } catch (err) {
        showAlert({ icon: 'error', title: t('hc4.error', 'Error'), text: err.message })
      }
    }
  }

  const handleDirectSelectConductor = async (reserva, nombreConductor) => {
    if (!nombreConductor) return
    const rowKey = reserva.rowId || reserva.id
    if (assigningPointId === rowKey) return
    setAssigningPointId(rowKey)
    try {
      const conductorObj = conductores.find(c => c.nombre === nombreConductor)
      if (!conductorObj) return
      await deliveryService.assign(reserva.id, reserva.puntoTipo, conductorObj.id)
      await reservationManagementService.refresh()
      showAlert({
        icon: 'success',
        title: t('admin.delivery.modal.assignSuccess', 'Conductor asignado'),
        text: t('hc3.driver_assigned_msg', { defaultValue: 'Conductor: {{conductor}}. El cliente y el conductor reciben el código de confirmación por correo; el conductor confirma o rechaza desde su correo.', conductor: nombreConductor })
      })
      loadReservations()
    } catch (err) {
      showAlert({ icon: 'error', title: t('hc4.error', 'Error'), text: err.message })
    } finally {
      setAssigningPointId(null)
    }
  }

  const hoy = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const totalPendientes = useMemo(
    () => reservations.filter((r) => r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'PENDIENTE').length,
    [reservations]
  )
  const totalAsignados = useMemo(
    () => reservations.filter((r) => r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'ASIGNADO').length,
    [reservations]
  )
  const totalEnCaminoHoy = useMemo(
    () => reservations.filter((r) => r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'ASIGNADO' && r.fechaEvento <= hoy).length,
    [reservations, hoy]
  )
  const totalProgramados = useMemo(
    () => reservations.filter((r) => r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'ASIGNADO' && r.fechaEvento > hoy).length,
    [reservations, hoy]
  )
  const totalCompletados = useMemo(
    () => reservations.filter((r) => r.estadoDomicilio === 'COMPLETADO' || r.estado === 'finalizada').length,
    [reservations]
  )

  const filtrados = useMemo(() => reservations.filter(r => {
    if (activeTab === 'pendientes') {
      return r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'PENDIENTE'
    }
    if (activeTab === 'asignados') {
      return r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'ASIGNADO'
    }
    if (activeTab === 'completados') {
      return r.estadoDomicilio === 'COMPLETADO' || r.estado === 'finalizada'
    }
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


  const handleVerificar = async (e) => {
    e.preventDefault()
    if (!pinIngresado) return
    try {
      await deliveryService.complete(modalVerificar.id, modalVerificar.puntoTipo, pinIngresado)
      await reservationManagementService.refresh()
      showAlert({ icon: 'success', title: t('admin.delivery.modal.pinSuccess', 'PIN verificado correctamente.') })
      setModalVerificar(null); setPinIngresado(''); loadReservations()
    } catch (err) {
      showAlert({ icon: 'error', title: t('admin.delivery.modal.pinError', 'PIN incorrecto.'), text: err.message })
    }
  }

  const getBadge = (estado, reservaEstado, fechaEvento) => {
    if (reservaEstado === 'cancelada' || estado === 'CANCELADO') {
      return (
        <span className="doc-status-badge rechazada" style={{ background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' }}>
          <FaTimesCircle style={{ fontSize: 11 }} />
          {t('admin.delivery.status.cancelada', 'Cancelada')}
        </span>
      )
    }
    if (reservaEstado === 'finalizada' || estado === 'COMPLETADO') {
      return (
        <span className="doc-status-badge aprobado">
          <FaCheckCircle style={{ fontSize: 11 }} />
          {t('admin.delivery.status.completado', 'Completado')}
        </span>
      )
    }
    if (estado === 'ASIGNADO') {
      const esFuturo = fechaEvento && fechaEvento > hoy
      if (esFuturo) {
        return (
          <span className="doc-status-badge" style={{ background: '#f8fafc', color: '#475569', borderColor: '#cbd5e1' }}>
            <FaCalendarAlt style={{ fontSize: 11, color: '#2563eb' }} />
            {t('admin.delivery.status.programado', 'Programado')}
          </span>
        )
      }
      return (
        <span className="doc-status-badge pendiente" style={{ background: 'var(--brand-soft)', color: 'var(--brand-text)', borderColor: 'var(--brand-border)' }}>
          <FaRoute style={{ fontSize: 11 }} />
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
        <span className="doc-status-badge pendiente" style={{ background: 'var(--brand-soft)', color: 'var(--brand-text)', borderColor: 'var(--brand-border)' }}>
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
      return {
        title: 'Conductores Registrados en Sucursal — Drivique',
        headers: [
          'ID',
          'NOMBRE CONDUCTOR',
          'CORREO ELECTRÓNICO',
          'TIPO DOC',
          'NÚMERO DOC',
          'NÚMERO LICENCIA',
          'CATEGORÍA LICENCIA',
          'VENCIMIENTO LICENCIA',
          'TELÉFONO',
          'VEHÍCULO ASIGNADO',
          'ESTADO',
        ],
        rows: conductoresFiltrados.map((c, i) => [
          i + 1,
          c.nombre,
          c.email || '-',
          c.tipoDoc || 'CC',
          c.numDoc || '-',
          c.licencia || '-',
          c.categoriaLic || '-',
          c.vencimientoLic || '-',
          c.telefono || '-',
          c.vehiculo || t('hc2.sin_asignar', 'Sin asignar'),
          c.estado || 'disponible',
        ]),
        filename: `conductores-sucursal-${new Date().toISOString().slice(0, 10)}`,
      }
    }
    return {
      title: 'Domicilios y Entregas de Reserva — Drivique',
      headers: [
        'ID',
        'CÓDIGO RESERVA',
        'CÓDIGO DOMICILIO (PIN)',
        'NOMBRE CLIENTE',
        'VEHÍCULO',
        'TIPO SERVICIO',
        'DIRECCIÓN RECOGIDA',
        'FECHA RECOGIDA',
        'HORA RECOGIDA',
        'DIRECCIÓN DEVOLUCIÓN',
        'FECHA DEVOLUCIÓN',
        'HORA DEVOLUCIÓN',
        'CONDUCTOR ASIGNADO',
        'ESTADO',
      ],
      rows: filtrados.map((r, i) => [
        i + 1,
        r.codigo,
        r.domicilioCodigo,
        r.clienteNombre,
        r.vehiculoNombre || r.vehiculo?.nombre || '-',
        r.tipoServicio,
        r.direccionRecogida,
        r.fechaRecogida,
        r.horaRecogida,
        r.direccionDevolucion,
        r.fechaDevolucion,
        r.horaDevolucion,
        r.domicilioConductor || t('admin.delivery.noDriver', 'Sin asignar'),
        r.estadoDomicilio || 'PENDIENTE',
      ]),
      filename: `domicilios-reserva-${new Date().toISOString().slice(0, 10)}`,
    }
  }, [filtrados, conductoresFiltrados, activeTab, t])

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`} data-theme={tema}>
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
                    <strong className="branch-user-name">
                      {(() => {
                        const nom = (user?.nombre || '').trim()
                        const ape = (user?.apellido || '').trim()
                        if (nom && ape && !nom.toLowerCase().includes(ape.toLowerCase())) return `${nom} ${ape}`
                        return nom || ape || user?.correo || 'Usuario'
                      })()}
                    </strong>
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
              { icon: FaRoute, color: 'var(--brand-text)', label: t('admin.delivery.kpi.assigned', 'En Camino / Programados'), value: totalAsignados, desc: `${totalEnCaminoHoy} en camino hoy · ${totalProgramados} programados` },
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
                {t('admin.delivery.tabs.assigned', 'Conductores Asignados')} ({totalAsignados})
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
                  boxShadow: '0 4px 12px rgba(var(--brand-primary-rgb), 0.25)',
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
                <span>{user?.sucursalAsignada || user?.sucursalId || user?.sucursal || t('hc2.todas_las_sucursales', 'Todas las sucursales')}</span>
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
                            <th style={{ textAlign: 'center' }}>{t('admin.delivery.table.deliveryCode', 'CÓDIGO DOMICILIO (PIN)')}</th>
                            <th>{t('admin.delivery.table.clientName', 'NOMBRE CLIENTE')}</th>
                            <th>{t('admin.delivery.table.vehicleName', 'VEHÍCULO')}</th>
                            <th>{t('admin.delivery.table.serviceType', 'TIPO SERVICIO')}</th>
                            <th>DIRECCIÓN RECOGIDA</th>
                            <th>FECHA RECOGIDA</th>
                            <th>HORA RECOGIDA</th>
                            <th>DIRECCIÓN DEVOLUCIÓN</th>
                            <th>FECHA DEVOLUCIÓN</th>
                            <th>HORA DEVOLUCIÓN</th>
                            <th>{t('admin.delivery.table.driver', 'CONDUCTOR ASIGNADO')}</th>
                            <th style={{ textAlign: 'center' }}>{t('admin.delivery.table.status', 'ESTADO')}</th>
                            <th style={{ textAlign: 'center' }}>{t('admin.delivery.table.actions', 'ACCIONES')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtrados.map((r, i) => (
                            <tr key={r.rowId || r.id}>
                              <td style={{ fontWeight: 400, color: 'var(--city-text, #0f172a)', width: '35px' }}>{i + 1}</td>
                              <td style={{ fontWeight: 500, color: 'var(--city-text, #0f172a)' }}>{r.codigo}</td>
                              <td style={{ textAlign: 'center' }}>
                                {(() => {
                                  const esFuturo = r.fechaEvento && r.fechaEvento > hoy
                                  if (esFuturo) {
                                    return (
                                      <span
                                        title={`PIN protegido por seguridad hasta el día de la entrega (${r.fechaEvento})`}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: 6,
                                          fontFamily: "'Courier New', Courier, monospace",
                                          fontWeight: 700,
                                          fontSize: 12.5,
                                          color: '#64748b',
                                          background: '#f8fafc',
                                          padding: '4px 10px',
                                          borderRadius: 8,
                                          border: '1px solid #e2e8f0',
                                        }}
                                      >
                                        <FaLock style={{ fontSize: 10, color: '#94a3b8' }} />
                                        ••••••
                                      </span>
                                    )
                                  }
                                  const isRevealed = Boolean(revealedPins[r.rowId || r.id])
                                  return (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{
                                        fontFamily: "'Courier New', Courier, monospace",
                                        fontWeight: 800,
                                        fontSize: 14,
                                        letterSpacing: '2.5px',
                                        color: 'var(--brand-primary, #1e3a8a)',
                                        background: 'var(--brand-soft-light, #eff6ff)',
                                        padding: '4px 10px',
                                        borderRadius: 8,
                                        border: '1.5px dashed var(--brand-border-light, #cbd5e1)',
                                        display: 'inline-block',
                                      }}>
                                        {isRevealed ? r.domicilioCodigo : '••••••'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setRevealedPins(prev => ({ ...prev, [r.rowId || r.id]: !prev[r.rowId || r.id] }))}
                                        title={isRevealed ? 'Ocultar PIN' : 'Revelar PIN de entrega'}
                                        style={{
                                          border: 'none',
                                          background: 'transparent',
                                          cursor: 'pointer',
                                          color: 'var(--brand-primary, #2563eb)',
                                          padding: '4px',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          fontSize: 13,
                                        }}
                                      >
                                        {isRevealed ? <FaEyeSlash /> : <FaEye />}
                                      </button>
                                    </div>
                                  )
                                })()}
                              </td>
                              <td style={{ fontWeight: 400, color: 'var(--city-text, #0f172a)' }}>{r.clienteNombre}</td>
                              <td style={{ fontWeight: 400, color: 'var(--city-text, #0f172a)' }}>{r.vehiculoNombre || r.vehiculo?.nombre || '-'}</td>
                              <td style={{ fontWeight: 400, color: 'var(--city-text, #334155)' }}>
                                {r.tipoServicio}
                              </td>
                              <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', color: r.direccionRecogida === 'No aplica' ? 'var(--city-muted, #94a3b8)' : 'var(--city-text, #334155)', fontWeight: 400 }} title={r.direccionRecogida}>
                                {r.direccionRecogida}
                              </td>
                              <td style={{ color: r.fechaRecogida === 'No aplica' ? 'var(--city-muted, #94a3b8)' : 'var(--city-text, #334155)', fontWeight: 400 }}>
                                {r.fechaRecogida}
                              </td>
                              <td style={{ color: r.horaRecogida === 'No aplica' ? 'var(--city-muted, #94a3b8)' : 'var(--city-text, #334155)', fontWeight: 400 }}>
                                {r.horaRecogida}
                              </td>
                              <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', color: r.direccionDevolucion === 'No aplica' ? 'var(--city-muted, #94a3b8)' : 'var(--city-text, #334155)', fontWeight: 400 }} title={r.direccionDevolucion}>
                                {r.direccionDevolucion}
                              </td>
                              <td style={{ color: r.fechaDevolucion === 'No aplica' ? 'var(--city-muted, #94a3b8)' : 'var(--city-text, #334155)', fontWeight: 400 }}>
                                {r.fechaDevolucion}
                              </td>
                              <td style={{ color: r.horaDevolucion === 'No aplica' ? 'var(--city-muted, #94a3b8)' : 'var(--city-text, #334155)', fontWeight: 400 }}>
                                {r.horaDevolucion}
                              </td>
                              <td style={{ fontWeight: 400 }}>
                                {r.estado === 'cancelada' ? (
                                  <span style={{ fontSize: 12, color: '#ef4444', fontStyle: 'italic', fontWeight: 500 }}>
                                    {r.estadoCodigo === 'CANCELLED_BY_TIMEOUT' ? 'Cancelada automáticamente' : 'Reserva cancelada'}
                                  </span>
                                ) : r.estado === 'finalizada' ? (
                                  <span style={{ fontSize: 12, color: '#16a34a', fontStyle: 'italic', fontWeight: 500 }}>
                                    {r.domicilioConductor ? `${r.domicilioConductor} (Finalizado)` : 'Servicio finalizado'}
                                  </span>
                                ) : (
                                  <select
                                    disabled={assigningPointId === (r.rowId || r.id) || r.estadoDomicilio === 'COMPLETADO'}
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
                                      cursor: assigningPointId === (r.rowId || r.id) ? 'wait' : 'pointer',
                                      opacity: assigningPointId === (r.rowId || r.id) ? 0.6 : 1,
                                      maxWidth: 200
                                    }}
                                  >
                                    <option value="">
                                      {assigningPointId === (r.rowId || r.id)
                                        ? '⏳ Asignando...'
                                        : t('admin.delivery.modal.selectDriverPlaceholder', '-- Seleccionar Conductor --')}
                                    </option>
                                    {conductores.map(c => (
                                      <option key={c.id} value={c.nombre}>
                                        {c.nombre}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 400 }}>
                                {getBadge(r.estadoDomicilio, r.estado, r.fechaEvento)}
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 400 }}>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                                  {r.estado === 'cancelada' && (
                                    <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, background: '#fef2f2', padding: '3px 8px', borderRadius: 6, border: '1px solid #fecaca' }}>
                                      Cancelada
                                    </span>
                                  )}
                                  {r.estado === 'finalizada' && (
                                    <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                      <FaCheckCircle /> Finalizada
                                    </span>
                                  )}
                                  {r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'ASIGNADO' && (
                                    (() => {
                                      const esFuturo = r.fechaEvento && r.fechaEvento > hoy
                                      if (esFuturo) {
                                        return (
                                          <button
                                            type="button"
                                            disabled
                                            title={`Disponible el día de la entrega (${r.fechaEvento})`}
                                            style={{
                                              padding: '6px 14px',
                                              borderRadius: '9999px',
                                              background: '#f1f5f9',
                                              color: '#64748b',
                                              border: '1px solid #cbd5e1',
                                              fontWeight: 600,
                                              fontSize: '11.5px',
                                              cursor: 'not-allowed',
                                              whiteSpace: 'nowrap',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: 6,
                                              opacity: 0.85,
                                            }}
                                          >
                                            <FaLock style={{ fontSize: 10, color: '#94a3b8' }} />
                                            <span>Habilita el {r.fechaEvento}</span>
                                          </button>
                                        )
                                      }
                                      return (
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
                                      )
                                    })()
                                  )}
                                  {r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'COMPLETADO' && (
                                    <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                      <FaCheckCircle />
                                      {t('admin.delivery.completedLabel', 'Entregado')}
                                    </span>
                                  )}
                                  {r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'PENDIENTE' && (
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
                        <div key={r.rowId || r.id} className="doc-mobile-card">
                          <div className="doc-mobile-card-header">
                            <div className="doc-mobile-card-title">
                              <span style={{ fontWeight: 400, color: 'var(--brand-primary, #2563eb)', fontSize: 13 }}>ID {i + 1}</span>
                              <span style={{ fontWeight: 500, color: 'var(--city-text, #0f172a)', fontSize: 14 }}>{r.codigo}</span>
                            </div>
                            {getBadge(r.estadoDomicilio, r.estado, r.fechaEvento)}
                          </div>

                          <div className="doc-mobile-card-body">
                            <div className="doc-mobile-data-item doc-mobile-data-item--full">
                              <span className="doc-mobile-data-label">{t('admin.delivery.table.clientName', 'Nombre Cliente')}</span>
                              <span className="doc-mobile-data-value" style={{ fontSize: 14, fontWeight: 400 }}>{r.clienteNombre}</span>
                            </div>

                            <div className="doc-mobile-data-item doc-mobile-data-item--full">
                              <span className="doc-mobile-data-label">{t('admin.delivery.table.deliveryCode', 'Código Domicilio (PIN)')}</span>
                              <span className="doc-mobile-data-value">
                                {(() => {
                                  const esFuturo = r.fechaEvento && r.fechaEvento > hoy
                                  if (esFuturo) {
                                    return (
                                      <span
                                        title={`PIN protegido hasta el día de la entrega (${r.fechaEvento})`}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: 6,
                                          fontFamily: "'Courier New', Courier, monospace",
                                          fontWeight: 700,
                                          fontSize: 13,
                                          color: '#64748b',
                                          background: '#f8fafc',
                                          padding: '4px 10px',
                                          borderRadius: 8,
                                          border: '1px solid #e2e8f0',
                                        }}
                                      >
                                        <FaLock style={{ fontSize: 11, color: '#94a3b8' }} />
                                        •••••• (Protegido hasta {r.fechaEvento})
                                      </span>
                                    )
                                  }
                                  const isRevealed = Boolean(revealedPins[r.rowId || r.id])
                                  return (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                      <span style={{
                                        fontFamily: "'Courier New', Courier, monospace",
                                        fontWeight: 800,
                                        fontSize: 14,
                                        letterSpacing: '2.5px',
                                        color: 'var(--brand-primary, #1e3a8a)',
                                        background: 'var(--brand-soft-light, #eff6ff)',
                                        padding: '3px 10px',
                                        borderRadius: 8,
                                        border: '1.5px dashed var(--brand-border-light, #cbd5e1)',
                                      }}>
                                        {isRevealed ? r.domicilioCodigo : '••••••'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setRevealedPins(prev => ({ ...prev, [r.rowId || r.id]: !prev[r.rowId || r.id] }))}
                                        style={{
                                          border: 'none',
                                          background: 'transparent',
                                          cursor: 'pointer',
                                          color: 'var(--brand-primary, #2563eb)',
                                          padding: '4px',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          fontSize: 15,
                                        }}
                                      >
                                        {isRevealed ? <FaEyeSlash /> : <FaEye />}
                                      </button>
                                    </div>
                                  )
                                })()}
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

                            <div className="doc-mobile-data-item doc-mobile-data-item--full">
                              <span className="doc-mobile-data-label">Recogida</span>
                              <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>
                                {r.direccionRecogida} {r.direccionRecogida !== 'No aplica' ? `(${r.fechaRecogida} - ${r.horaRecogida})` : ''}
                              </span>
                            </div>

                            <div className="doc-mobile-data-item doc-mobile-data-item--full">
                              <span className="doc-mobile-data-label">Devolución</span>
                              <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>
                                {r.direccionDevolucion} {r.direccionDevolucion !== 'No aplica' ? `(${r.fechaDevolucion} - ${r.horaDevolucion})` : ''}
                              </span>
                            </div>

                            <div className="doc-mobile-data-item doc-mobile-data-item--full">
                              <span className="doc-mobile-data-label">{t('admin.delivery.table.driver', 'Conductor Asignado')}</span>
                              {r.estado === 'cancelada' ? (
                                <div style={{ fontSize: 13, color: '#ef4444', fontStyle: 'italic', fontWeight: 500, marginTop: 4 }}>
                                  {r.estadoCodigo === 'CANCELLED_BY_TIMEOUT' ? 'Cancelada automáticamente (Tiempo expirado)' : 'Reserva cancelada'}
                                </div>
                              ) : r.estado === 'finalizada' ? (
                                <div style={{ fontSize: 13, color: '#16a34a', fontStyle: 'italic', fontWeight: 500, marginTop: 4 }}>
                                  {r.domicilioConductor ? `${r.domicilioConductor} (Finalizado)` : 'Servicio finalizado'}
                                </div>
                              ) : (
                                <select
                                  disabled={assigningPointId === (r.rowId || r.id) || r.estadoDomicilio === 'COMPLETADO'}
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
                                    marginTop: 4,
                                    cursor: assigningPointId === (r.rowId || r.id) ? 'wait' : 'pointer',
                                    opacity: assigningPointId === (r.rowId || r.id) ? 0.6 : 1
                                  }}
                                >
                                  <option value="">
                                    {assigningPointId === (r.rowId || r.id)
                                      ? '⏳ Asignando...'
                                      : t('admin.delivery.modal.selectDriverPlaceholder', '-- Seleccionar Conductor --')}
                                  </option>
                                  {conductores.map(c => (
                                    <option key={c.id} value={c.nombre}>
                                      {c.nombre}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>

                          <div className="doc-mobile-card-actions">
                            {r.estado === 'cancelada' && (
                              <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600, background: '#fef2f2', padding: '6px 12px', borderRadius: 8, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%' }}>
                                <FaTimesCircle /> Reserva Cancelada
                              </span>
                            )}
                            {r.estado === 'finalizada' && (
                              <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%' }}>
                                <FaCheckCircle /> Servicio Finalizado
                              </span>
                            )}
                            {r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'ASIGNADO' && (
                              (() => {
                                const esFuturo = r.fechaEvento && r.fechaEvento > hoy
                                if (esFuturo) {
                                  return (
                                    <button
                                      type="button"
                                      disabled
                                      title={`Disponible el día de la entrega (${r.fechaEvento})`}
                                      style={{
                                        width: '100%',
                                        padding: '9px 18px',
                                        borderRadius: '12px',
                                        background: '#f1f5f9',
                                        color: '#64748b',
                                        border: '1px solid #cbd5e1',
                                        fontWeight: 600,
                                        fontSize: '12px',
                                        cursor: 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        opacity: 0.85,
                                      }}
                                    >
                                      <FaLock style={{ fontSize: 11, color: '#94a3b8' }} />
                                      <span>Verificación bloqueada hasta el {r.fechaEvento}</span>
                                    </button>
                                  )
                                }
                                return (
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
                                )
                              })()
                            )}
                            {r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'COMPLETADO' && (
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

        {/* MODAL CREAR / EDITAR CONDUCTOR CON DISEÑO ELEGANTE Y ESTRUCTURADO */}
        {modalConductor && (
          <div className="cities-modal-backdrop" style={backdropStyle} onMouseDown={e => e.target === e.currentTarget && (setModalConductor(false), setEditingConductor(null))}>
            <section className="cities-modal" style={{ maxWidth: 660, width: '100%', background: 'var(--city-card, #ffffff)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 45px rgba(15,23,42,0.25)', border: '1px solid var(--city-border, #e2e8f0)' }}>
              
              {/* ENCABEZADO MODAL ELEGANTE */}
              <div style={{ padding: '20px 26px', borderBottom: '1px solid var(--city-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--city-bg, #f8fafc)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 20, boxShadow: '0 4px 10px rgba(37,99,235,0.3)' }}>
                    <FaUserTie />
                  </div>
                  <div>
                    <span style={{ color: 'var(--brand-primary, #2563eb)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {editingConductor ? 'GESTIÓN DE PERSONAL OPERATIVO' : 'REGISTRO DE PERSONAL OPERATIVO'}
                    </span>
                    <h2 style={{ color: 'var(--city-text, #0f172a)', margin: '2px 0 0', fontSize: 19, fontWeight: 800 }}>
                      {editingConductor ? 'Editar Conductor' : 'Crear Nuevo Conductor'}
                    </h2>
                  </div>
                </div>
                <button type="button" onClick={() => { setModalConductor(false); setEditingConductor(null); }} style={closeBtnStyle} title="Cerrar">&times;</button>
              </div>

              {/* CUERPO DEL MODAL CON SECCIONES AGRUPADAS */}
              <div style={{ padding: '22px 26px', maxHeight: '74vh', overflowY: 'auto' }}>
                <form id="conductor-form" onSubmit={handleCrearConductor} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  
                  {/* SECCIÓN 1: DATOS PERSONALES Y CONTACTO */}
                  <div style={{ background: 'var(--city-bg, #f8fafc)', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: 14, padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, borderBottom: '1px solid var(--city-border, #e2e8f0)', paddingBottom: 8 }}>
                      <span style={{ fontSize: 14, color: 'var(--brand-primary, #2563eb)', display: 'flex', alignItems: 'center' }}><FaIdCard /></span>
                      <strong style={{ fontSize: 13, color: 'var(--city-text, #0f172a)', fontWeight: 700 }}>1. Identificación y Contacto</strong>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {/* Nombre Completo */}
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                          Nombre Completo del Conductor *
                        </label>
                        <input
                          type="text"
                          required
                          value={nuevoConductor.nombre}
                          onChange={e => setNuevoConductor({ ...nuevoConductor, nombre: e.target.value })}
                          placeholder="Ej: Carlos Eduardo Ramírez"
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Correo Electrónico */}
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                          Correo Electrónico (Notificaciones PIN) *
                        </label>
                        <input
                          type="email"
                          required
                          value={nuevoConductor.email}
                          onChange={e => setNuevoConductor({ ...nuevoConductor, email: e.target.value })}
                          placeholder="conductor@drivique.com"
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Teléfono / WhatsApp */}
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                          Teléfono / WhatsApp *
                        </label>
                        <input
                          type="text"
                          required
                          value={nuevoConductor.telefono}
                          onChange={e => setNuevoConductor({ ...nuevoConductor, telefono: e.target.value })}
                          placeholder="+57 310 000 0000"
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Tipo Documento */}
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                          Tipo de Documento *
                        </label>
                        <select
                          value={nuevoConductor.tipoDoc}
                          onChange={e => setNuevoConductor({ ...nuevoConductor, tipoDoc: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                        >
                          <option value="CC">Cédula de Ciudadanía (CC)</option>
                          <option value="CE">Cédula de Extranjería (CE)</option>
                          <option value="PAS">Pasaporte (PAS)</option>
                        </select>
                      </div>

                      {/* Número Documento */}
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                          Número de Documento *
                        </label>
                        <input
                          type="text"
                          required
                          value={nuevoConductor.numDoc}
                          onChange={e => setNuevoConductor({ ...nuevoConductor, numDoc: e.target.value })}
                          placeholder="1018432910"
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 2: LICENCIA DE CONDUCCIÓN Y MEDIO DE DESPLAZAMIENTO */}
                  <div style={{ background: 'var(--city-bg, #f8fafc)', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: 14, padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, borderBottom: '1px solid var(--city-border, #e2e8f0)', paddingBottom: 8 }}>
                      <span style={{ fontSize: 14, color: 'var(--brand-primary, #2563eb)', display: 'flex', alignItems: 'center' }}><FaCar /></span>
                      <strong style={{ fontSize: 13, color: 'var(--city-text, #0f172a)', fontWeight: 700 }}>2. Habilitación de Conducción</strong>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {/* Número de Licencia */}
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                          Número de Licencia de Conducción *
                        </label>
                        <input
                          type="text"
                          required
                          value={nuevoConductor.licencia}
                          onChange={e => setNuevoConductor({ ...nuevoConductor, licencia: e.target.value })}
                          placeholder="C1-84920412"
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Vencimiento Licencia */}
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                          Vencimiento de Licencia *
                        </label>
                        <input
                          type="date"
                          required
                          value={nuevoConductor.vencimientoLic}
                          onChange={e => setNuevoConductor({ ...nuevoConductor, vencimientoLic: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Categoría de Licencia */}
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                          Categoría de Licencia * <span style={{ fontWeight: 400, color: 'var(--brand-primary, #2563eb)' }}>(Automóviles y Camionetas de alquiler)</span>
                        </label>
                        <select
                          value={nuevoConductor.categoriaLic}
                          onChange={e => setNuevoConductor({ ...nuevoConductor, categoriaLic: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                        >
                          <option value="B1">B1 · Automóviles, Camperos y Camionetas (Particular - Estándar)</option>
                          <option value="C1">C1 · Automóviles, Camperos y Camionetas (Público / Comercial)</option>
                        </select>
                      </div>

                      {/* Nota operativa de flota */}
                      <div style={{
                        gridColumn: '1 / -1',
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'rgba(37, 99, 235, 0.06)',
                        border: '1px solid rgba(37, 99, 235, 0.18)',
                        fontSize: 12,
                        color: 'var(--brand-primary, #1e40af)',
                        lineHeight: 1.45,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}>
                        <FaCar style={{ flexShrink: 0, marginTop: 2, fontSize: 13, color: 'var(--brand-primary, #2563eb)' }} />
                        <span>
                          <strong>Operativa de Flota:</strong> El conductor se presenta en la sucursal para recibir las llaves del vehículo de la reserva y conducirlo hasta el domicilio del cliente.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 3: DISPONIBILIDAD OPERATIVA (SIN ESTADO 'EN RUTA' AL CREAR) */}
                  {editingConductor ? (
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--city-text, #334155)', fontWeight: 600, marginBottom: 5 }}>
                        Disponibilidad del Conductor *
                      </label>
                      <select
                        value={nuevoConductor.estado}
                        onChange={e => setNuevoConductor({ ...nuevoConductor, estado: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-card, #ffffff)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                      >
                        <option value="disponible">🟢 Disponible (Activo para asignación)</option>
                        <option value="inactivo">⚪ Inactivo (Fuera de turno / Descanso)</option>
                      </select>
                    </div>
                  ) : (
                    <div style={{ padding: '12px 14px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18, color: '#16a34a' }}>●</span>
                      <div>
                        <strong style={{ fontSize: 12.5, color: '#15803d', display: 'block' }}>Estado Inicial: Disponible</strong>
                        <span style={{ fontSize: 11, color: '#166534' }}>El nuevo conductor quedará registrado como disponible en sucursal para ser asignado a órdenes de entrega.</span>
                      </div>
                    </div>
                  )}

                </form>
              </div>

              {/* PIE DEL MODAL CON BOTONES PULIDOS */}
              <div style={{ padding: '16px 26px', borderTop: '1px solid var(--city-border, #e2e8f0)', display: 'flex', justifyContent: 'flex-end', gap: 12, background: 'var(--city-bg, #f8fafc)' }}>
                <button
                  type="button"
                  onClick={() => { setModalConductor(false); setEditingConductor(null); }}
                  style={{ padding: '9px 20px', borderRadius: 10, background: 'transparent', color: 'var(--city-text, #475569)', border: '1.5px solid var(--city-border, #cbd5e1)', cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="conductor-form"
                  style={{ padding: '9px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)', transition: 'all 0.2s' }}
                >
                  <FaCheckCircle style={{ fontSize: 13 }} />
                  {editingConductor ? 'Guardar Cambios' : 'Registrar Conductor'}
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
                  <label style={{ display: 'block', textAlign: 'center', fontWeight: 700, color: 'var(--city-text)', fontSize: 13, marginBottom: 10 }}>
                    Código de Confirmación (6 caracteres alfanuméricos)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoCapitalize="characters"
                    placeholder="EJ: 3K8B7X"
                    value={pinIngresado}
                    onChange={e => setPinIngresado(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    required
                    autoFocus
                    style={{
                      width: '100%',
                      padding: 14,
                      fontSize: 26,
                      letterSpacing: 8,
                      textAlign: 'center',
                      borderRadius: 10,
                      border: '2px solid var(--brand-primary, #2563eb)',
                      background: 'var(--city-bg)',
                      color: 'var(--city-text)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontWeight: 800,
                      fontFamily: "'Courier New', Courier, monospace"
                    }}
                  />
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
