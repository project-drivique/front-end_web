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
  const [modalVerificar, setModalVerificar] = useState(null)
  const [conductorSeleccionado, setConductorSeleccionado] = useState('')
  const [pinIngresado, setPinIngresado] = useState('')
  const [conductores, setConductores] = useState(() => {
    try { return JSON.parse(localStorage.getItem('drivique_conductores') || '[]') } catch { return [] }
  })
  const [nuevoConductor, setNuevoConductor] = useState({ nombre: '', telefono: '', licencia: '', vehiculo: '' })

  const loadReservations = () => {
    const all = reservationManagementService.list(user)
    const deliveries = all.filter(r => {
      if (r.estado === 'cancelada') return false
      const hasE = r.domicilioDireccion || r.serviciosSeleccionados?.some(s => s.id === 'srv-entrega-domicilio' || s.nombre?.toLowerCase().includes('entrega'))
      const hasD = r.domicilioDevolucionDireccion || r.serviciosSeleccionados?.some(s => s.id === 'srv-devolucion-domicilio' || s.nombre?.toLowerCase().includes('devolucion'))
      return hasE || hasD
    }).map(r => {
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
      return { ...r, tipoServicio, direccionInfo: direccion, fechaEvento: fecha, estadoDomicilio: r.domicilioEstado || (r.domicilioConductor ? 'ASIGNADO' : 'PENDIENTE') }
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
    if (!nuevoConductor.nombre) return
    saveConductores([...conductores, { ...nuevoConductor, id: 'COND-' + Date.now(), estado: 'activo' }])
    setNuevoConductor({ nombre: '', telefono: '', licencia: '', vehiculo: '' })
    setModalConductor(false)
    showAlert({ icon: 'success', title: t('admin.delivery.modal.createSuccess', 'Conductor creado exitosamente.') })
  }

  const totalPendientes = useMemo(() => reservations.filter(r => r.estadoDomicilio === 'PENDIENTE').length, [reservations])
  const totalAsignados = useMemo(() => reservations.filter(r => r.estadoDomicilio === 'ASIGNADO').length, [reservations])
  const totalCompletados = useMemo(() => reservations.filter(r => r.estadoDomicilio === 'COMPLETADO').length, [reservations])

  const filtrados = useMemo(() => reservations.filter(r => {
    if (activeTab === 'pendientes' && r.estadoDomicilio !== 'PENDIENTE') return false
    if (activeTab === 'asignados' && r.estadoDomicilio !== 'ASIGNADO') return false
    if (activeTab === 'completados' && r.estadoDomicilio !== 'COMPLETADO') return false
    if (search) {
      const lower = search.toLowerCase()
      return r.codigo?.toLowerCase().includes(lower) || r.vehiculoNombre?.toLowerCase().includes(lower) || r.vehiculoPlaca?.toLowerCase().includes(lower) || r.clienteNombre?.toLowerCase().includes(lower) || r.domicilioConductor?.toLowerCase().includes(lower)
    }
    return true
  }).sort((a, b) => new Date(a.fechaEvento) - new Date(b.fechaEvento)), [reservations, search, activeTab])

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

  const closeBtnStyle = { background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--city-muted)', lineHeight: 1, padding: 0 }
  const modalHeadStyle = { padding: '20px 24px', borderBottom: '1px solid var(--city-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  const backdropStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.65)', padding: 16 }

  const exportData = useMemo(() => {
    return filtrados.map((r, i) => [
      i + 1,
      r.codigo,
      r.clienteNombre,
      r.vehiculoNombre || r.vehiculo?.nombre || '-',
      r.tipoServicio,
      r.direccionInfo,
      r.fechaEvento ? new Date(r.fechaEvento).toLocaleDateString() : '-',
      r.domicilioConductor || t('admin.delivery.noDriver', 'Sin asignar'),
      r.estadoDomicilio || 'PENDIENTE'
    ])
  }, [filtrados, t])

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={esEncargado} />
      <main className="management-main doc-verification-main">
        <div className="cities-container" style={{ maxWidth: '100%' }}>

          <header className="cities-topbar reservations-management-header">
            <div className="branch-topbar-brand-title">
              <span className="branch-topbar-badge">{t('admin.branchManagement', 'GESTION OPERATIVA')}</span>
              <h1 className="branch-topbar-heading">{t('admin.delivery.title', 'Gestion de Domicilios')}</h1>
              <p className="cities-subtitle" style={{ color: 'var(--city-muted)', marginTop: 2 }}>
                {t('admin.delivery.subtitle', 'Asignacion de conductores para entregas y recogidas a domicilio.')}
              </p>
            </div>
            <div className="cities-topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="button" className="city-btn city-btn--primary" onClick={() => setModalConductor(true)}>
                + {t('admin.delivery.createDriverBtn', 'Crear Conductor')}
              </button>
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

          {/* PESTAÑAS ADHERIDAS IDENTICAS A VALIDACION DOCUMENTOS */}
          <div className="fleet-attached-tabs">
            <div className="fleet-tabs-nav">
              <button
                type="button"
                onClick={() => setActiveTab('todos')}
                className={`fleet-tab-btn ${activeTab === 'todos' ? 'is-active' : ''}`}
              >
                {t('admin.delivery.tabs.all', 'Todos los Domicilios')} ({reservations.length})
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
                  placeholder={t('admin.delivery.searchPlaceholder', 'Buscar por código, vehículo, placa o cliente...')}
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

            {/* CONTADOR SUMARIO */}
            <div className="cities-summary" style={{ margin: '8px 0 12px' }}>
              <span>{filtrados.length}</span>{' '}
              {t('admin.delivery.foundCount', 'DOMICILIOS EN EL LISTADO').toUpperCase()}
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
                  <table className="incidents-table-v2" style={{ whiteSpace: 'nowrap', width: 'max-content', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>{t('admin.delivery.table.id', 'ID')}</th>
                        <th>{t('admin.delivery.table.reservationCode', 'CÓDIGO RESERVA')}</th>
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
                          <td style={{ fontWeight: 600, color: 'var(--city-text, #0f172a)', width: '40px' }}>{i + 1}</td>
                          <td style={{ fontWeight: 700, color: 'var(--city-text, #0f172a)' }}>{r.codigo}</td>
                          <td style={{ color: 'var(--city-text, #0f172a)', fontWeight: 600 }}>{r.clienteNombre}</td>
                          <td style={{ color: 'var(--city-text, #0f172a)', fontWeight: 600 }}>{r.vehiculoNombre || r.vehiculo?.nombre || '-'}</td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--city-text, #334155)', fontWeight: 500 }}>
                              <FaCar style={{ color: 'var(--city-muted, #64748b)', flexShrink: 0 }} />
                              {r.tipoServicio}
                            </span>
                          </td>
                          <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--city-text, #334155)' }} title={r.direccionInfo}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <FaMapMarkerAlt style={{ color: '#ef4444', fontSize: 11, flexShrink: 0 }} />
                              {r.direccionInfo}
                            </span>
                          </td>
                          <td style={{ color: 'var(--city-muted, #64748b)' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <FaCalendarAlt style={{ fontSize: 11 }} />
                              {r.fechaEvento ? new Date(r.fechaEvento).toLocaleDateString() : '-'}
                            </span>
                          </td>
                          <td style={{ fontWeight: r.domicilioConductor ? 600 : 400, color: r.domicilioConductor ? 'var(--city-text, #0f172a)' : 'var(--city-muted, #64748b)' }}>
                            {r.domicilioConductor || t('admin.delivery.noDriver', 'Sin asignar')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {getBadge(r.estadoDomicilio)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                              {r.estadoDomicilio === 'PENDIENTE' && (
                                <button
                                  type="button"
                                  onClick={() => { setModalAsignar(r); setConductorSeleccionado(r.domicilioConductor || '') }}
                                  style={{
                                    padding: '7px 22px',
                                    borderRadius: '9999px',
                                    background: '#2563eb',
                                    color: 'var(--city-card, #ffffff)',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontSize: '12.5px',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 5px rgba(37, 99, 235, 0.25)',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                  }}
                                >
                                  <FaUserTie style={{ fontSize: 11 }} />
                                  {t('admin.delivery.assignBtn', 'Asignar')}
                                </button>
                              )}
                              {r.estadoDomicilio === 'ASIGNADO' && (
                                <button
                                  type="button"
                                  onClick={() => setModalVerificar(r)}
                                  style={{
                                    padding: '7px 22px',
                                    borderRadius: '9999px',
                                    background: '#16a34a',
                                    color: 'var(--city-card, #ffffff)',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontSize: '12.5px',
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
                                <span style={{ fontSize: 12.5, color: '#15803d', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <FaCheckCircle />
                                  {t('admin.delivery.completedLabel', 'Entregado')}
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
                          <span style={{ fontWeight: 800, color: 'var(--brand-primary, #2563eb)', fontSize: 13 }}>#{i + 1}</span>
                          <span style={{ fontWeight: 800, color: 'var(--city-text, #0f172a)', fontSize: 14 }}>{r.codigo}</span>
                        </div>
                        {getBadge(r.estadoDomicilio)}
                      </div>

                      <div className="doc-mobile-card-body">
                        <div className="doc-mobile-data-item doc-mobile-data-item--full">
                          <span className="doc-mobile-data-label">{t('admin.delivery.table.clientName', 'Nombre Cliente')}</span>
                          <span className="doc-mobile-data-value" style={{ fontSize: 14 }}>{r.clienteNombre}</span>
                        </div>

                        <div className="doc-mobile-data-item doc-mobile-data-item--full">
                          <span className="doc-mobile-data-label">{t('admin.delivery.table.vehicleName', 'Vehículo')}</span>
                          <span className="doc-mobile-data-value">{r.vehiculoNombre || r.vehiculo?.nombre || '-'}</span>
                        </div>

                        <div className="doc-mobile-data-item">
                          <span className="doc-mobile-data-label">{t('admin.delivery.table.serviceType', 'Tipo Servicio')}</span>
                          <span className="doc-mobile-data-value">{r.tipoServicio}</span>
                        </div>

                        <div className="doc-mobile-data-item">
                          <span className="doc-mobile-data-label">{t('admin.delivery.table.dateTime', 'Fecha')}</span>
                          <span className="doc-mobile-data-value">{r.fechaEvento ? new Date(r.fechaEvento).toLocaleDateString() : '-'}</span>
                        </div>

                        <div className="doc-mobile-data-item doc-mobile-data-item--full">
                          <span className="doc-mobile-data-label">{t('admin.delivery.table.address', 'Dirección')}</span>
                          <span className="doc-mobile-data-value" style={{ color: '#2563eb' }}>{r.direccionInfo}</span>
                        </div>

                        <div className="doc-mobile-data-item doc-mobile-data-item--full">
                          <span className="doc-mobile-data-label">{t('admin.delivery.table.driver', 'Conductor Asignado')}</span>
                          <span className="doc-mobile-data-value">{r.domicilioConductor || t('admin.delivery.noDriver', 'Sin asignar')}</span>
                        </div>
                      </div>

                      <div className="doc-mobile-card-actions">
                        {r.estadoDomicilio === 'PENDIENTE' && (
                          <button
                            type="button"
                            onClick={() => { setModalAsignar(r); setConductorSeleccionado(r.domicilioConductor || '') }}
                            style={{
                              width: '100%',
                              padding: '9px 18px',
                              borderRadius: '12px',
                              background: '#2563eb',
                              color: 'var(--city-card, #ffffff)',
                              border: 'none',
                              fontWeight: 800,
                              fontSize: '13px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8,
                            }}
                          >
                            <FaUserTie style={{ fontSize: 12 }} />
                            {t('admin.delivery.assignBtn', 'Asignar Conductor')}
                          </button>
                        )}
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
                              fontWeight: 800,
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
                          <span style={{ fontSize: 13, color: '#15803d', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
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
          </section>
        </div>

        {/* MODAL CREAR CONDUCTOR */}
        {modalConductor && (
          <div className="cities-modal-backdrop" style={backdropStyle} onMouseDown={e => e.target === e.currentTarget && setModalConductor(false)}>
            <section className="cities-modal" style={{ maxWidth: 420, background: 'var(--city-card)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={modalHeadStyle}>
                <div>
                  <p style={{ color: 'var(--city-muted)', margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{t('admin.delivery.modal.createDriverEyebrow', 'REGISTRO DE PERSONAL')}</p>
                  <h2 style={{ color: 'var(--city-text)', margin: 0, fontSize: 18, fontWeight: 800 }}>{t('admin.delivery.modal.createDriverTitle', 'Crear Nuevo Conductor')}</h2>
                </div>
                <button type="button" onClick={() => setModalConductor(false)} style={closeBtnStyle}>&times;</button>
              </div>
              <div style={{ padding: 24 }}>
                <form id="conductor-form" onSubmit={handleCrearConductor} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { k: 'nombre', l: t('admin.delivery.modal.driverName', 'Nombre Completo'), r: true, p: 'Juan Perez' },
                    { k: 'telefono', l: t('admin.delivery.modal.driverPhone', 'Telefono'), r: true, p: '+57 300 000 0000' },
                    { k: 'licencia', l: t('admin.delivery.modal.driverLicense', 'Numero de Licencia'), r: false, p: 'C1-123456' },
                    { k: 'vehiculo', l: t('admin.delivery.modal.driverVehicle', 'Vehiculo Asignado'), r: false, p: 'Moto Honda CB125F' },
                  ].map(({ k, l, r, p }) => (
                    <div key={k}>
                      <label style={{ display: 'block', fontSize: 13, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>{l}</label>
                      <input type="text" required={r} value={nuevoConductor[k]} onChange={e => setNuevoConductor({ ...nuevoConductor, [k]: e.target.value })} placeholder={p}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                  ))}
                </form>
              </div>
              <div style={{ padding: '14px 24px', borderTop: '1px solid var(--city-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setModalConductor(false)} style={{ padding: '8px 18px', borderRadius: 9999, background: 'transparent', color: 'var(--city-muted)', border: '1.5px solid var(--city-border)', cursor: 'pointer', fontWeight: 700 }}>{t('admin.delivery.modal.cancelBtn', 'Cancelar')}</button>
                <button type="submit" form="conductor-form" style={{ padding: '8px 20px', borderRadius: 9999, background: 'var(--brand-primary, #2563eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>{t('admin.delivery.modal.saveBtn', 'Guardar')}</button>
              </div>
            </section>
          </div>
        )}

        {/* MODAL ASIGNAR CONDUCTOR */}
        {modalAsignar && (
          <div className="cities-modal-backdrop" style={backdropStyle} onMouseDown={e => e.target === e.currentTarget && setModalAsignar(null)}>
            <section className="cities-modal" style={{ maxWidth: 460, background: 'var(--city-card)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={modalHeadStyle}>
                <div>
                  <p style={{ color: 'var(--city-muted)', margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{t('admin.delivery.modal.assignEyebrow', 'ASIGNACION DE PERSONAL')}</p>
                  <h2 style={{ color: 'var(--city-text)', margin: 0, fontSize: 18, fontWeight: 800 }}>{t('admin.delivery.modal.assignTitle', 'Asignar Conductor')}</h2>
                </div>
                <button type="button" onClick={() => setModalAsignar(null)} style={closeBtnStyle}>&times;</button>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ marginBottom: 18, padding: 14, background: 'var(--city-bg)', borderRadius: 10, border: '1.5px solid var(--city-border)' }}>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--city-muted)', marginBottom: 2 }}>{t('admin.delivery.modal.reservation', 'Reserva')}</p>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--brand-primary, #2563eb)', marginBottom: 10 }}>{modalAsignar.codigo}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div><p style={{ margin: 0, fontSize: 11, color: 'var(--city-muted)' }}>{t('admin.delivery.modal.clientLabel', 'Cliente')}</p><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--city-text)' }}>{modalAsignar.clienteNombre}</p></div>
                    <div><p style={{ margin: 0, fontSize: 11, color: 'var(--city-muted)' }}>{t('admin.delivery.modal.service', 'Servicio')}</p><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--city-text)' }}>{modalAsignar.tipoServicio}</p></div>
                    <div style={{ gridColumn: '1/-1' }}><p style={{ margin: 0, fontSize: 11, color: 'var(--city-muted)' }}>{t('admin.delivery.table.address', 'Direccion')}</p><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--city-text)' }}>{modalAsignar.direccionInfo}</p></div>
                  </div>
                </div>
                <form id="asignar-form" onSubmit={handleAsignar}>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--city-text)', fontWeight: 700, marginBottom: 6 }}>{t('admin.delivery.modal.selectDriver', 'Seleccionar Conductor')}</label>
                  <select value={conductorSeleccionado} onChange={e => setConductorSeleccionado(e.target.value)} required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}>
                    <option value="">{t('admin.delivery.modal.selectDriverPlaceholder', 'Elige un conductor disponible...')}</option>
                    {conductores.map(c => <option key={c.id} value={c.nombre}>{c.nombre}{c.vehiculo ? ` - ${c.vehiculo}` : ''}</option>)}
                  </select>
                  {conductores.length === 0 && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{t('admin.delivery.modal.noDrivers', 'No hay conductores. Crea uno primero.')}</p>}
                </form>
              </div>
              <div style={{ padding: '14px 24px', borderTop: '1px solid var(--city-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setModalAsignar(null)} style={{ padding: '8px 18px', borderRadius: 9999, background: 'transparent', color: 'var(--city-muted)', border: '1.5px solid var(--city-border)', cursor: 'pointer', fontWeight: 700 }}>{t('admin.delivery.modal.cancelBtn', 'Cancelar')}</button>
                <button type="submit" form="asignar-form" disabled={conductores.length === 0}
                  style={{ padding: '8px 22px', borderRadius: 9999, background: 'var(--brand-primary, #2563eb)', color: '#fff', border: 'none', cursor: conductores.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: conductores.length === 0 ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <FaUserTie style={{ fontSize: 12 }} />{t('admin.delivery.modal.saveBtn', 'Asignar Conductor')}
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
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--city-muted)', marginBottom: 2 }}>{t('admin.delivery.modal.pinReservation', 'Reserva')} <strong style={{ color: 'var(--brand-primary, #2563eb)' }}>{modalVerificar.codigo}</strong></p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--city-muted)' }}>{t('admin.delivery.modal.pinClient', 'Cliente')} <strong style={{ color: 'var(--city-text)' }}>{modalVerificar.clienteNombre}</strong></p>
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
