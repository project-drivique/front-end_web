import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaBuilding,
  FaCar,
  FaClock,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaEye,
  FaFileExcel,
  FaFileImage,
  FaFilePdf,
  FaPaperPlane,
  FaPhone,
  FaPlus,
  FaPrint,
  FaSearch,
  FaTrash,
  FaUser,
  FaUserShield,
  FaVideo,
  FaWrench,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { useBrand } from '../../../contexts/BrandContext'
import { incidentManagementService } from '../../../services/incidentManagementService'
import { vehicleManagementService } from '../../../services/vehicleManagementService'
import { branchManagementService } from '../../../services/branchManagementService'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './IncidentManagementPage.css'
import './DocumentVerificationPage.css'

export default function IncidentManagementPage() {
  const { t, i18n } = useTranslation()
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const { brand } = useBrand()
  const esModoOscuro = tema === 'oscuro'

  const esEncargado =
    user?.rol === 'encargado' ||
    user?.rol === 'encargado_sucursal' ||
    user?.rol === 'branch_manager'
  const sucursalEncargado = user?.sucursalId || user?.sucursal || user?.sucursalAsignada || ''
  const branchKey = String(sucursalEncargado).trim().toLocaleLowerCase()

  const [incidents, setIncidents] = useState([])
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('clientes')
  const [notice, setNotice] = useState('')
  const [errorModal, setErrorModal] = useState('')

  // Modales
  const [modalDetalle, setModalDetalle] = useState(null)
  const [modalCrear, setModalCrear] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(null)
  const [modalResponder, setModalResponder] = useState(null)
  const [zoomMedia, setZoomMedia] = useState(null)

  // Formularios
  const [formCrear, setFormCrear] = useState({
    vehiculoId: '',
    tipoIncidenciaId: 'choque',
    tipoIncidenciaNombre: t('admin.incidents.types.crash', 'Choque'),
    descripcion: '',
    prioridad: 'urgente',
    tiempoEstimado: t('admin.incidents.time.twoToFourHours', '2 a 4 horas'),
  })

  const [respuestaTexto, setRespuestaTexto] = useState('')
  const [nuevoEstadoModal, setNuevoEstadoModal] = useState('recibido')
  const [nuevaPrioridadModal, setNuevaPrioridadModal] = useState('urgente')

  const sucursales = useMemo(
    () => branchManagementService.list()
      .filter((branch) => !esEncargado || String(branch.nombre || '').trim().toLocaleLowerCase() === branchKey)
      .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [branchKey, esEncargado]
  )

  const vehiculos = useMemo(
    () => vehicleManagementService.list()
      .filter((vehicle) => !esEncargado || String(vehicle.sucursal || '').trim().toLocaleLowerCase() === branchKey)
      .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [branchKey, esEncargado]
  )

  const cargarIncidencias = () => {
    setIncidents(incidentManagementService.listForUser(user))
  }

  useEffect(() => {
    setIncidents(incidentManagementService.listForUser(user))
  }, [user])

  const getVehiculoImagen = (r) => {
    if (!r) return ''
    if (r.vehiculoImagen) return r.vehiculoImagen
    const vBrand = (r.vehiculo || '').split(' ')[0].toLowerCase()
    const match = vehiculos.find(
      (v) =>
        (v.id && r.vehiculoId && String(v.id) === String(r.vehiculoId)) ||
        (v.placa && r.placa && v.placa.replace(/\s|-/g, '').toLowerCase() === r.placa.replace(/\s|-/g, '').toLowerCase()) ||
        (v.nombre && r.vehiculo && v.nombre.toLowerCase().includes(r.vehiculo.toLowerCase())) ||
        (r.vehiculo && v.nombre && r.vehiculo.toLowerCase().includes(v.nombre.toLowerCase())) ||
        (vBrand && v.nombre && v.nombre.toLowerCase().includes(vBrand))
    )
    return match?.imagenes?.[0] || match?.imagen || vehiculos[0]?.imagenes?.[0] || 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/a2cb0b378c25efdb1e116246f84149744c2f4081.jpg'
  }

  const translateDescription = (text) => {
    if (!text) return t('admin.incidents.table.noDesc', 'Problema reportado...')
    const lang = (i18n?.language || '').toLowerCase()
    const isEn = lang.startsWith('en')
    const isFr = lang.startsWith('fr')
    const isPt = lang.startsWith('pt') || lang.startsWith('br')

    const lower = text.toLowerCase()
    if (
      lower.includes('testigo') ||
      lower.includes('motor') ||
      lower.includes('check engine') ||
      lower.includes('neiva') ||
      lower.includes('warning light') ||
      lower.includes('voyant moteur')
    ) {
      if (isEn) return 'The check engine warning light came on during the trip to Neiva.'
      if (isFr) return "Le voyant moteur s'est allumé sur le tableau de bord pendant le trajet vers Neiva."
      if (isPt) return 'A luz de verificação do motor acendeu no painel durante a viagem para Neiva.'
      return t('admin.incidents.dummyDesc1', 'Se encendió el testigo de revisión de motor en el tablero durante el trayecto a Neiva.')
    }
    if (
      lower.includes('choque') ||
      lower.includes('parachoques') ||
      lower.includes('rear-end') ||
      lower.includes('semáforo') ||
      lower.includes('semaforo') ||
      lower.includes('parqueadero') ||
      lower.includes('trasera') ||
      lower.includes('bumper') ||
      lower.includes('collision') ||
      lower.includes('accrochage')
    ) {
      if (isEn) return 'Minor rear-end collision at a traffic light. Only minor damage to the rear bumper.'
      if (isFr) return 'Accrochage léger à l\'arrière à un feu tricolore. Seuls dégâts sur le pare-chocs arrière.'
      if (isPt) return 'Pequena colisão traseira no semáforo. Apenas danos no para-choque traseiro.'
      return t('admin.incidents.dummyDesc2', 'Choque leve en la parte trasera en un semáforo. Solo daños en el parachoques trasero.')
    }
    return text
  }

  const translateTimelineTitle = (title) => {
    if (!title) return ''
    const lower = title.toLowerCase()
    if (lower.includes('interno') || lower.includes('internal')) return t('admin.incidents.timeline.internalCreated', 'Reporte Interno Creado')
    if (lower.includes('creado') || lower.includes('created')) return t('admin.incidents.timeline.reportCreated', 'Reporte Creado por el Cliente')
    if (lower.includes('respuesta') || lower.includes('response')) return t('admin.incidents.timeline.responseSent', 'Respuesta Enviada al Cliente')
    if (lower.includes('estado') || lower.includes('status')) return t('admin.incidents.timeline.statusChanged', 'Cambio de Estado')
    return title
  }

  const translateTimelineDesc = (desc) => {
    if (!desc) return ''
    const lower = desc.toLowerCase()
    if (lower.includes('directamente por el administrador') || lower.includes('directly by the administrator')) {
      return t('admin.incidents.timeline.adminGeneratedDesc', 'Reporte generado directamente por el administrador/encargado.')
    }
    if (lower.includes('registrado por el cliente') || lower.includes('registered by the client')) {
      return t('admin.incidents.timeline.clientGeneratedDesc', 'Reporte de incidente registrado por el cliente desde el portal de soporte.')
    }
    return desc
  }

  const getStatusBadge = (estado) => {
    const norm = ['resuelto', 'atendiendo', 'rechazado', 'recibido'].includes(estado)
      ? estado
      : (estado === 'en_revision' || estado === 'en_reparacion' ? 'atendiendo' : 'recibido')

    const styles = {
      recibido: {
        bg: 'var(--city-bg, #f1f5f9)',
        color: 'var(--city-muted, #475569)',
        border: '1px solid #cbd5e1',
        label: t('admin.incidents.status.received', 'Recibido'),
      },
      atendiendo: {
        bg: '#e0f2fe',
        color: '#0369a1',
        border: '1px solid #bae6fd',
        label: t('admin.incidents.status.attending', 'Atendiendo'),
      },
      resuelto: {
        bg: '#dcfce7',
        color: '#15803d',
        border: '1px solid #bbf7d0',
        label: t('admin.incidents.status.resolved', 'Resuelto'),
      },
      rechazado: {
        bg: '#fee2e2',
        color: '#991b1b',
        border: '1px solid #fecaca',
        label: t('admin.incidents.status.rejected', 'Rechazado'),
      },
    }

    const current = styles[norm] || styles.recibido

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '5px 14px',
          borderRadius: '9999px',
          backgroundColor: current.bg,
          color: current.color,
          border: current.border,
          fontWeight: '700',
          fontSize: '12px',
          textTransform: 'capitalize',
        }}
      >
        {current.label}
      </span>
    )
  }

  // Filtrado dinámico
  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase()
    return incidents.filter((r) => {
      // Tab filter (Clientes vs Internos)
      const isInternal = r.origen === 'admin' || r.origen === 'sucursal' || r.origen === 'interno'
      if (activeTab === 'clientes' && isInternal) return false
      if (activeTab === 'internos' && !isInternal) return false

      const matchState = stateFilter === 'all' || r.estado === stateFilter
      const matchBranch = branchFilter === 'all' || r.sucursal === branchFilter

      const matchSearch =
        !term ||
        r.codigo?.toLowerCase().includes(term) ||
        r.vehiculo?.toLowerCase().includes(term) ||
        r.placa?.toLowerCase().includes(term) ||
        r.contactoNombre?.toLowerCase().includes(term) ||
        r.descripcion?.toLowerCase().includes(term)

      return matchState && matchBranch && matchSearch
    })
  }, [incidents, search, stateFilter, branchFilter, activeTab])

  // --- Handlers ---
  const handleCrearIncidencia = (e) => {
    e.preventDefault()
    try {
      setErrorModal('')
      incidentManagementService.createIncident(formCrear, user)
      setNotice(t('admin.incidents.createdSuccess', 'Reporte de incidencia registrado correctamente.'))
      setModalCrear(false)
      setFormCrear({
        vehiculoId: '',
        tipoIncidenciaId: 'choque',
        tipoIncidenciaNombre: t('admin.incidents.types.crash', 'Choque'),
        descripcion: '',
        prioridad: 'urgente',
        tiempoEstimado: t('admin.incidents.time.twoToFourHours', '2 a 4 horas'),
      })
      cargarIncidencias()
    } catch {
      setErrorModal(t('admin.incidents.createError', 'Error al crear el reporte de incidencia.'))
    }
  }

  const openDetalleModal = (r) => {
    setErrorModal('')
    setRespuestaTexto('')
    setNuevoEstadoModal(r.estado)
    setNuevaPrioridadModal(r.prioridad || 'media')
    setModalDetalle(r)
  }

  const handleResponderYActualizar = (e) => {
    e.preventDefault()
    if (!modalResponder) return
    try {
      setErrorModal('')
      incidentManagementService.updateStatusAndRespond(
        modalResponder.id,
        { nuevoEstado: nuevoEstadoModal, respuestaTexto, nuevaPrioridad: nuevaPrioridadModal },
        user
      )
      setNotice(
        t(
          'admin.incidents.updatedSuccess',
          `Reporte ${modalResponder.codigo} actualizado a ${nuevoEstadoModal.toUpperCase()} y respuesta enviada por correo y notificación.`
        )
      )
      setModalResponder(null)
      cargarIncidencias()
    } catch {
      setErrorModal('Error al responder o actualizar el estado del incidente.')
    }
  }

  const openResponderModal = (r) => {
    setErrorModal('')
    setRespuestaTexto('')
    setNuevoEstadoModal(r.estado)
    setNuevaPrioridadModal(r.prioridad || 'media')
    setModalResponder(r)
  }

  const handleQuickStatusChange = (incidentId, newStatus) => {
    try {
      incidentManagementService.updateStatusAndRespond(
        incidentId,
        { nuevoEstado: newStatus, respuestaTexto: `El estado ha sido actualizado a ${newStatus}.`, nuevaPrioridad: 'media' },
        user
      )
      setNotice(`Estado actualizado a ${newStatus} correctamente.`)
      cargarIncidencias()
    } catch {
      console.error('Error al cambiar estado rápidamente')
    }
  }

  const handleEliminarIncidencia = (r) => {
    try {
      setErrorModal('')
      incidentManagementService.removeIncident(r.id, user)
      setNotice(t('admin.incidents.deletedSuccess', `Reporte de incidencia ${r.codigo} eliminado.`))
      setModalEliminar(null)
      cargarIncidencias()
    } catch (err) {
      if (err.message === 'clientReportCannotBeDeleted') {
        setErrorModal(
          t(
            'admin.incidents.clientReportDeleteError',
            'Los reportes creados por los clientes no pueden ser eliminados por control de auditoría.'
          )
        )
      } else if (err.message === 'onlyReceivedOwnReportsCanBeDeleted') {
        setErrorModal(
          t(
            'admin.incidents.ownReportStateDeleteError',
            'No se puede eliminar un reporte propio que ya ha pasado a estado de revisión o reparación.'
          )
        )
      } else {
        setErrorModal(t('admin.incidents.deleteError', 'Error al eliminar el reporte.'))
      }
    }
  }

  // Exportación
  const headersExport = ['Código Reserva', 'Remitente', 'Vehículo', 'Placa', 'Tipo Incidencia', 'Evidencia Foto 1', 'Evidencia Foto 2', 'Evidencia Foto 3', 'Evidencia Video', 'Teléfono', 'Correo', 'Estado']
  const rowsExport = filtrados.map((r) => [
    r.codigoReserva || r.codigo,
    r.contactoNombre,
    r.vehiculo,
    r.placa,
    r.tipoIncidenciaNombre || 'Avería Mecánica',
    r.evidenciaFoto1 || '-',
    r.evidenciaFoto2 || '-',
    r.evidenciaFoto3 || '-',
    r.evidenciaVideo || 'Sin video',
    r.contactoTelefono || '',
    r.contactoEmail || '',
    r.estado,
  ])

  const exportData = {
    title: `Reportes de Incidencias de Vehículos — ${brand?.name || 'Drivique'}`,
    headers: headersExport,
    rows: rowsExport,
    items: filtrados,
    filename: `incidencias-drivique-${new Date().toISOString().slice(0, 10)}`,
  }

  return (
    <div className={`management-shell ${esModoOscuro ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar />
      <main className="management-main" style={{ padding: '24px 32px' }}>
        <div className="cities-container" style={{ maxWidth: '100%' }}>
          {/* Header Superior */}
          <header className="cities-topbar reservations-management-header">
            <div className="branch-topbar-brand-title">
              <span className="branch-topbar-badge">{t('admin.branchManagement', 'GESTIÓN DE SUCURSAL')}</span>
              <h1 className="branch-topbar-heading">{t('admin.incidents.title', 'Gestión de Incidentes')}</h1>
            </div>

            <div className="cities-topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <MenuConfiguracion />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--city-card, #ffffff)', border: '1px solid #e2e8f0', borderRadius: '30px', padding: '4px 16px 4px 6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', color: 'var(--city-card, #ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                  {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'A'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--city-text, #0f172a)', lineHeight: '1.2' }}>{user?.nombre || 'Administrador'}</span>
                  <span style={{ fontSize: '11px', color: 'var(--city-muted, #64748b)', lineHeight: '1.2' }}>{user?.rol || 'encargado'}</span>
                </div>
              </div>
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

          {/* Pestañas de Secciones Idénticas a Reservas */}
          <div className="fleet-attached-tabs">
            <div className="fleet-tabs-nav">
              <button
                type="button"
                onClick={() => setActiveTab('clientes')}
                className={`fleet-tab-btn ${activeTab === 'clientes' ? 'is-active' : ''}`}
              >
                {t('admin.incidents.tabIncidents', 'Reportes de Clientes')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('internos')}
                className={`fleet-tab-btn ${activeTab === 'internos' ? 'is-active' : ''}`}
              >
                {t('admin.incidents.tabInternal', 'Reportes Internos')}
              </button>
            </div>
          </div>

          {/* Tarjeta Principal Adherida a las Pestañas */}
          <section className="cities-card attached-to-tabs">
            {/* Toolbar con Buscador, Filtros, Botón Crear y Exportación */}
            <div className="cities-toolbar">
              <label className="cities-search">
                <FaSearch />
                <input
                  type="text"
                  placeholder={t('admin.incidents.searchPlaceholder', 'Buscar por código, vehículo, placa o cliente...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>

              {/* Filtro Estado */}
              <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
                <option value="all">{t('admin.incidents.allStatuses', 'Todos los estados')}</option>
                <option value="recibido">{t('admin.incidents.status.received', 'Recibido')}</option>
                <option value="atendiendo">{t('admin.incidents.status.attending', 'Atendiendo')}</option>
                <option value="resuelto">{t('admin.incidents.status.resolved', 'Resuelto')}</option>
                <option value="rechazado">{t('admin.incidents.status.rejected', 'Rechazado')}</option>
              </select>

              {/* Filtro Sucursal (Bloqueado para Encargado o Selector para Admin) */}
              {!esEncargado ? (
                <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
                  <option value="all">{t('admin.incidents.allBranches', 'Todas las sucursales')}</option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.nombre}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--city-border, #e2e8f0)', background: 'var(--city-bg, #f8fafc)', fontSize: '13px', color: 'var(--city-text, #334155)', fontWeight: 600 }}>
                  <FaBuilding style={{ color: 'var(--city-muted, #64748b)' }} />
                  <span>{sucursalEncargado || 'Alamo Bogotá - Aeropuerto'}</span>
                </div>
              )}

              {/* Botón Nuevo Reporte */}
              <button
                type="button"
                onClick={() => {
                  setErrorModal('')
                  setModalCrear(true)
                }}
                style={{
                  padding: '8px 20px',
                  background: '#2563eb',
                  color: 'var(--city-card, #ffffff)',
                  borderRadius: '9999px',
                  fontWeight: '800',
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'var(--brand-primary, #1d4ed8)' }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#2563eb' }}
              >
                <FaPlus /> {t('admin.incidents.newReport', 'Nuevo Reporte de Incidencia')}
              </button>

              {/* Botones de Exportación */}
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

            {/* Contador de Resultados */}
            <div className="cities-summary" style={{ margin: '8px 0 12px' }}>
              <span>{filtrados.length}</span>{' '}
              {t('admin.incidents.registered', 'INCIDENCIAS REGISTRADAS').toUpperCase()}
            </div>

            {/* Tabla Estilizada de Incidencias */}
            {filtrados.length === 0 ? (
              <div className="cities-empty">
                <FaExclamationTriangle />
                <h2>{t('admin.incidents.emptyTitle', 'No se encontraron reportes de incidencias')}</h2>
                <p>{t('admin.incidents.emptySubtitle', 'Intenta ajustar los criterios de búsqueda o los filtros seleccionados.')}</p>
              </div>
            ) : (
              <div className="cities-table-wrap" style={{ overflowX: 'auto' }}>
                <table className="incidents-table-v2" style={{ whiteSpace: 'nowrap', width: 'max-content', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>ID</th>
                      <th>{t('admin.incidents.table.reservationCode', 'CÓDIGO RESERVA')}</th>
                      <th>{t('admin.incidents.table.fullName', 'NOMBRE COMPLETO')}</th>
                      <th>{t('admin.incidents.table.vehicleName', 'NOMBRE VEHÍCULO')}</th>
                      <th>{t('admin.incidents.table.image', 'IMAGEN')}</th>
                      <th>{t('admin.incidents.table.plate', 'PLACA')}</th>
                      <th>{t('admin.incidents.table.incidentType', 'TIPO DE INCIDENTE')}</th>
                      <th>{t('admin.incidents.table.problemDesc', 'DESCRIPCIÓN PROBLEMA')}</th>
                      <th>{t('admin.incidents.table.reportDate', 'FECHA DE REPORTE')}</th>
                      <th>{t('admin.incidents.table.reportTime', 'HORA DE REPORTE')}</th>
                      <th>{t('admin.incidents.table.evidence1', 'EVIDENCIA FOTO 1')}</th>
                      <th>{t('admin.incidents.table.evidence2', 'EVIDENCIA FOTO 2')}</th>
                      <th>{t('admin.incidents.table.evidence3', 'EVIDENCIA FOTO 3')}</th>
                      <th>{t('admin.incidents.table.evidenceVideo', 'EVIDENCIA VIDEO')}</th>
                      <th>{t('admin.incidents.table.phone', 'TELÉFONO')}</th>
                      <th>{t('admin.incidents.table.email', 'CORREO')}</th>
                      <th style={{ textAlign: 'center' }}>{t('admin.incidents.table.incidentStatus', 'ESTADO DE INCIDENTE')}</th>
                      <th style={{ textAlign: 'center' }}>{t('admin.incidents.table.actions', 'ACCIONES')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((r, index) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600, color: 'var(--city-text)', width: '40px' }}>{index + 1}</td>
                        <td style={{ fontWeight: 500, color: 'var(--city-text, #0f172a)' }}>{r.codigoReserva || `RES-${r.id.split('-')[1] || Math.floor(Math.random() * 10000)}`}</td>
                        <td style={{ color: 'var(--city-text, #0f172a)' }}>{r.contactoNombre}</td>
                        <td style={{ color: 'var(--city-text)' }}>{r.vehiculo}</td>
                        <td>
                            <img src={getVehiculoImagen(r)} alt={r.vehiculo} style={{ width: 44, height: 28, borderRadius: 6, objectFit: 'cover', border: '1px solid #cbd5e1' }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/a2cb0b378c25efdb1e116246f84149744c2f4081.jpg' }} />
                        </td>
                        <td style={{ color: 'var(--city-muted, #64748b)' }}>{r.placa}</td>
                        
                        <td style={{ color: 'var(--city-text, #334155)', fontWeight: 500 }}>{t(`admin.incidents.types.${r.tipoIncidenciaId || 'averia_mecanica'}`, r.tipoIncidenciaNombre || 'Avería Mecánica')}</td>
                        <td style={{ color: 'var(--city-muted, #64748b)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{translateDescription(r.descripcion)}</td>
                        <td style={{ color: 'var(--city-text, #0f172a)' }}>{new Date(r.fechaIso || r.fechaRegistro || Date.now()).toLocaleDateString()}</td>
                        <td style={{ color: 'var(--city-text, #0f172a)' }}>{new Date(r.fechaIso || r.fechaRegistro || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        
                        <td>
                          <div
                            className="doc-table-pdf-link"
                            onClick={() => setZoomMedia({ url: r.evidenciaFoto1Url, title: `Evidencia Foto 1 — ${r.codigoReserva || r.codigo}`, isVideo: false })}
                            title="Abrir foto de evidencia 1"
                          >
                            <FaFileImage style={{ color: '#2563eb', fontSize: 13 }} />
                            <span>{r.evidenciaFoto1 || `Evidencia-Foto-1-${r.codigo}.jpg`}</span>
                          </div>
                        </td>
                        <td>
                          <div
                            className="doc-table-pdf-link"
                            onClick={() => setZoomMedia({ url: r.evidenciaFoto2Url, title: `Evidencia Foto 2 — ${r.codigoReserva || r.codigo}`, isVideo: false })}
                            title="Abrir foto de evidencia 2"
                          >
                            <FaFileImage style={{ color: '#2563eb', fontSize: 13 }} />
                            <span>{r.evidenciaFoto2 || `Evidencia-Foto-2-${r.codigo}.jpg`}</span>
                          </div>
                        </td>
                        <td>
                          <div
                            className="doc-table-pdf-link"
                            onClick={() => setZoomMedia({ url: r.evidenciaFoto3Url, title: `Evidencia Foto 3 — ${r.codigoReserva || r.codigo}`, isVideo: false })}
                            title="Abrir foto de evidencia 3"
                          >
                            <FaFileImage style={{ color: '#2563eb', fontSize: 13 }} />
                            <span>{r.evidenciaFoto3 || `Evidencia-Foto-3-${r.codigo}.jpg`}</span>
                          </div>
                        </td>
                        <td>
                          {r.evidenciaVideo ? (
                            <div
                              className="doc-table-pdf-link"
                              onClick={() => setZoomMedia({ url: r.evidenciaVideoUrl, title: `Evidencia Video — ${r.codigoReserva || r.codigo}`, isVideo: true })}
                              title="Reproducir video de evidencia"
                            >
                              <FaVideo style={{ color: '#0284c7', fontSize: 13 }} />
                              <span>{r.evidenciaVideo}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--city-muted, #94a3b8)', fontSize: 12.5, fontStyle: 'italic' }}>
                              Sin video
                            </span>
                          )}
                        </td>

                        <td style={{ color: 'var(--city-muted, #475569)' }}>{r.contactoTelefono || '+57 300 0000000'}</td>
                        <td style={{ color: 'var(--city-muted, #64748b)' }}>{r.contactoEmail}</td>
                        
                        <td style={{ textAlign: 'center' }}>
                          {getStatusBadge(r.estado)}
                        </td>
                        
                        <td style={{ textAlign: 'center' }}>
                          <div className="incident-row-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="incident-btn-reply"
                              onClick={() => openResponderModal(r)}
                            >
                              {t('admin.incidents.replyBtn', 'Responder')}
                            </button>

                            {!esEncargado && (
                              <button
                                type="button"
                                onClick={() => {
                                  setErrorModal('')
                                  setModalEliminar(r)
                                }}
                                style={{ padding: '6px 12px', fontSize: '13px', background: 'transparent', color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
                              >
                                {t('admin.incidents.deleteBtn', 'Eliminar')}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* MODAL DETALLE Y RESPUESTA AL USUARIO */}
        {modalDetalle && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) => e.target === e.currentTarget && setModalDetalle(null)}
          >
            <section className="cities-modal" style={{ maxWidth: 680 }}>
              <div className="cities-modal__head">
                <div>
                  <p className="cities-eyebrow">{t('admin.incidents.detailTitle', 'Gestión de Incidencia')} {modalDetalle.codigo}</p>
                  <h2>{modalDetalle.vehiculo} ({modalDetalle.placa})</h2>
                </div>
                <button type="button" onClick={() => setModalDetalle(null)}>
                  á—
                </button>
              </div>

              {/* Banner de Vehículo con Imagen */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '14px 0', padding: '12px 16px', background: 'var(--city-soft)', borderRadius: 14, border: '1px solid var(--city-border)' }}>
                <img
                  src={getVehiculoImagen(modalDetalle)}
                  alt={modalDetalle.vehiculo}
                  style={{ width: 76, height: 50, objectFit: 'cover', borderRadius: 10, border: '1px solid #cbd5e1', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/a2cb0b378c25efdb1e116246f84149744c2f4081.jpg'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 3px', fontSize: 16, fontWeight: 800, color: 'var(--city-text)' }}>{modalDetalle.vehiculo}</h3>
                  <span style={{ fontSize: 13, color: 'var(--city-muted, #64748b)', fontWeight: 600 }}>{t('admin.incidents.table.plate', 'Placa')}: <strong style={{ color: 'var(--brand-text)' }}>{modalDetalle.placa}</strong> ⬢ {modalDetalle.sucursal}</span>
                </div>
                {modalDetalle.codigoReserva && (
                  <div style={{ textAlign: 'right', background: 'var(--city-card, #ffffff)', padding: '8px 12px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <span style={{ fontSize: 11, color: 'var(--city-muted, #64748b)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>{t('admin.incidents.associatedRes', 'Reserva Asociada')}</span>
                    <strong style={{ fontSize: 14, color: 'var(--brand-primary)' }}>{modalDetalle.codigoReserva}</strong>
                  </div>
                )}
              </div>

              <div className="incident-grid-2" style={{ margin: '18px 0' }}>
                <div className="incident-info-card">
                  <span className="incident-info-card__label">{t('admin.incidents.sender', 'Remitente')}</span>
                  <p>{modalDetalle.contactoNombre}</p>
                  <small>{modalDetalle.contactoEmail}</small>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <small>{modalDetalle.contactoTelefono}</small>
                    <a 
                      href={`tel:${modalDetalle.contactoTelefono}`}
                      style={{ padding: '4px 8px', borderRadius: '4px', background: '#ecfeff', color: '#0891b2', border: '1px solid #cffafe', textDecoration: 'none', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}
                    >
                      <FaPhone /> {t('admin.incidents.call', 'Llamar')}
                    </a>
                  </div>
                </div>

                <div className="incident-info-card">
                  <span className="incident-info-card__label">{t('admin.incidents.locationPriority', 'Ubicación y Prioridad')}</span>
                  <p>{modalDetalle.sucursal}</p>
                  <span className={`priority-badge ${modalDetalle.prioridad}`} style={{ marginTop: 6 }}>
                    <FaClock /> {t('admin.incidents.estimatedTime', 'Tiempo estimado:')} {modalDetalle.tiempoEstimado}
                  </span>
                </div>
              </div>


              <div className="incident-field" style={{ margin: '4px 0 12px' }}>
                <span className="incident-field-label">{t('admin.incidents.problemDescription', 'Descripción del problema')}</span>
                <p style={{ background: 'var(--city-soft)', border: '1.5px solid var(--city-border)', padding: '12px 16px', borderRadius: 12, fontSize: 13, margin: 0 }}>
                  {translateDescription(modalDetalle.descripcion)}
                </p>
              </div>

              {/* TIMELINE */}
              <span className="incident-field-label" style={{ display: 'block', marginBottom: 8 }}>{t('admin.incidents.historyTitle', 'Historial de respuestas')}</span>
              <div className="incident-timeline">
                {(modalDetalle.historial || []).map((h, i) => (
                  <div key={i} className="incident-timeline-item" style={{ borderLeftColor: h.color || 'var(--brand-primary)' }}>
                    <strong>{translateTimelineTitle(h.titulo)} — {h.autor}</strong>
                    <p style={{ margin: '4px 0', fontSize: 12 }}>{translateTimelineDesc(h.descripcion)}</p>
                    <small>{h.hora} ({new Date(h.fecha).toLocaleDateString()})</small>
                  </div>
                ))}
              </div>

              <div className="cities-modal__actions" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setModalDetalle(null)} 
                  style={{ 
                    background: 'var(--city-bg, #f1f5f9)', 
                    color: 'var(--city-muted, #475569)', 
                    border: '1.5px solid #cbd5e1', 
                    padding: '8px 22px', 
                    borderRadius: '9999px', 
                    fontWeight: 700, 
                    fontSize: '13px', 
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0' }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'var(--city-bg, #f1f5f9)' }}
                >
                  {t('admin.incidents.close', 'Cerrar')}
                </button>
              </div>
            </section>
          </div>
        )}

        {/* MODAL CREAR INCIDENCIA PROPIA */}
        {modalCrear && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) => e.target === e.currentTarget && setModalCrear(false)}
          >
            <section className="cities-modal" style={{ maxWidth: 700, padding: '24px 32px' }}>
              <div className="cities-modal__head" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 16 }}>
                <h2 style={{ fontSize: 20, color: 'var(--city-text, #1e3a8a)', margin: 0 }}>
                  {t('admin.incidents.createTitle', 'Formulario de Incidencia')}
                </h2>
                <button type="button" onClick={() => setModalCrear(false)} style={{ background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--city-muted, #64748b)' }}>
                  á—
                </button>
              </div>

              <form onSubmit={handleCrearIncidencia} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Vehículo / Reserva asociada (Opcional) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{t('admin.incidents.selectVehicle', 'Vehículo / Reserva asociada')} <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: 12 }}>({t('common.optional', 'Opcional')})</span></span>
                    <select
                      value={formCrear.vehiculoId}
                      onChange={(e) => setFormCrear({ ...formCrear, vehiculoId: e.target.value })}
                      style={{ background: 'var(--city-bg, #f8fafc)', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 8, fontSize: 14, color: 'var(--city-text, #334155)' }}
                    >
                      <option value="">{t('admin.incidents.chooseVehicleOptional', 'Sin vehículo / General...')}</option>
                      {vehiculos.map((v) => (
                        <option key={v.id} value={v.id}>{v.nombre}</option>
                      ))}
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'flex-end' }}>
                    <input 
                      type="text" 
                      readOnly 
                      value={vehiculos.find(v => v.id === formCrear.vehiculoId)?.placa || ''}
                      placeholder={t('admin.incidents.vehiclePlatePlaceholder', 'Placa del vehículo (si aplica)')}
                      style={{ background: 'var(--city-bg, #f8fafc)', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 8, fontSize: 14, color: 'var(--city-muted, #64748b)' }}
                    />
                  </label>
                </div>

                {/* Tipo de Incidencia */}
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 12 }}>{t('admin.incidents.incidentType', 'Tipo de Incidencia')} <span style={{ color: '#ef4444' }}>*</span></span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                      { id: 'choque', label: t('admin.incidents.types.crash', 'Choque') },
                      { id: 'averia_mecanica', label: t('admin.incidents.types.mechanicalBreakdown', 'Avería Mecánica') },
                      { id: 'pinchazo', label: t('admin.incidents.types.flatTire', 'Pinchazo') },
                      { id: 'bateria_descargada', label: t('admin.incidents.types.deadBattery', 'Batería Descargada') },
                      { id: 'falla_electrica', label: t('admin.incidents.types.electricalFailure', 'Falla Eléctrica') },
                      { id: 'robo', label: t('admin.incidents.types.theft', 'Robo') },
                      { id: 'asistencia_general', label: t('admin.incidents.types.generalAssistance', 'Asistencia General') },
                      { id: 'otro_problema', label: t('admin.incidents.types.other', 'Otro') },
                    ].map(tipo => (
                      <button
                        key={tipo.id}
                        type="button"
                        onClick={() => {
                           let time = t('admin.incidents.time.twoToFourHours', '2 a 4 horas');
                           if (tipo.id === 'falla_electrica' || tipo.id === 'bateria_descargada') time = t('admin.incidents.time.oneToTwoHours', '1 a 2 horas');
                           if (tipo.id === 'asistencia_general') time = t('admin.incidents.time.oneHour', '1 hora');
                           if (tipo.id === 'otro_problema') time = t('admin.incidents.time.toBeDefined', 'Por definir');
                           setFormCrear({ ...formCrear, tipoIncidenciaId: tipo.id, tipoIncidenciaNombre: tipo.label, tiempoEstimado: time })
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 10,
                          background: formCrear.tipoIncidenciaId === tipo.id ? '#2563eb' : 'var(--city-bg, #f8fafc)',
                          color: formCrear.tipoIncidenciaId === tipo.id ? 'var(--city-card, #ffffff)' : 'var(--city-text, #0f172a)',
                          border: formCrear.tipoIncidenciaId === tipo.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                          cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', justifyContent: 'center'
                        }}
                      >
                        {tipo.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notice Tiempo */}
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <FaClock style={{ color: '#b45309', fontSize: 20, marginTop: 2 }} />
                  <div>
                    <span style={{ display: 'block', fontSize: 12, color: '#b45309', fontWeight: 600 }}>{t('admin.incidents.estimatedTime', 'Tiempo estimado de atención técnica:')}</span>
                    <strong style={{ color: '#92400e', fontSize: 14 }}>{formCrear.tiempoEstimado}</strong>
                  </div>
                </div>

                {/* Descripcion */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{t('admin.incidents.problemDescription', 'Descripción del problema')} <span style={{ color: '#ef4444' }}>*</span></span>
                  <textarea
                    required
                    rows={4}
                    placeholder={t('admin.incidents.describeSymptoms', 'Describe los síntomas...')}
                    value={formCrear.descripcion}
                    onChange={(e) => setFormCrear({ ...formCrear, descripcion: e.target.value })}
                    style={{ background: 'var(--city-bg, #f8fafc)', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 8, fontSize: 14, resize: 'none', color: 'var(--city-text, #334155)' }}
                  />
                </label>

                {/* Evidencias */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{t('admin.incidents.evidencesOptional', 'Evidencias (Imágenes / Videos opcionales)')}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{t('admin.incidents.maxPhotos', 'Máx 3 fotos')} (1/3)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button type="button" style={{ width: 80, height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'var(--city-bg, #f8fafc)', border: '1.5px dashed #3b82f6', borderRadius: 12, color: 'var(--brand-primary, #3b82f6)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      <FaPlus style={{ fontSize: 16 }} /> {t('admin.incidents.attachment', 'Adjunto')}
                    </button>
                    <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>{t('admin.incidents.evidenceAttached', 'âœ“ 1 evidencia(s) adjuntada(s)')}</span>
                  </div>
                </div>

                <hr style={{ borderColor: 'var(--city-bg, #f1f5f9)', margin: '4px 0', borderTop: 'none' }} />

                {/* Datos de contacto */}
                <div>
                  <h3 style={{ fontSize: 16, color: 'var(--city-text, #1e3a8a)', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 4px 0' }}>
                    <FaUser style={{ color: 'var(--city-text, #1e3a8a)' }} /> {t('admin.incidents.contactDataTitle', 'Datos de contacto para seguimiento')}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--city-muted, #64748b)', marginBottom: 16 }}>
                    {t('admin.incidents.contactDataSubtitle', 'Precargados automáticamente desde tu perfil registrado (puedes editarlos si lo requieres).')}
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{t('admin.incidents.fullName', 'Nombre completo')} <span style={{ color: '#ef4444' }}>*</span></span>
                      <input type="text" readOnly value={user?.nombre || 'Administrador Interno'} style={{ background: 'var(--city-bg, #f8fafc)', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 8, fontSize: 14, color: 'var(--city-text, #334155)' }} />
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{t('admin.incidents.phone', 'Teléfono')} <span style={{ color: '#ef4444' }}>*</span></span>
                        <input type="text" readOnly value={user?.telefono || '3100000000'} style={{ background: 'var(--city-bg, #f8fafc)', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 8, fontSize: 14, color: 'var(--city-text, #334155)' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{t('admin.incidents.email', 'Correo electrónico')} <span style={{ color: '#ef4444' }}>*</span></span>
                        <input type="email" readOnly value={user?.correo || 'admin@drivique.com'} style={{ background: 'var(--city-bg, #f8fafc)', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 8, fontSize: 14, color: 'var(--city-text, #334155)' }} />
                      </label>
                    </div>
                  </div>
                </div>

                {errorModal && <p className="cities-error">{errorModal}</p>}

                <button 
                  type="submit" 
                  className="cities-primary incident-modal-btn-create"
                  style={{ 
                    background: '#16a34a', 
                    color: '#fff', 
                    padding: '12px 24px', 
                    borderRadius: '9999px', 
                    fontSize: '14px', 
                    fontWeight: 800, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    border: 'none', 
                    cursor: 'pointer', 
                    marginTop: 8,
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#15803d' }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#16a34a' }}
                >
                  {t('admin.incidents.createBtn', 'Enviar Reporte de Incidencia')}
                </button>
              </form>
            </section>
          </div>
        )}

        {/* MODAL ELIMINAR REPORTES CON VALIDACIÓN */}
        {modalEliminar && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) => e.target === e.currentTarget && setModalEliminar(null)}
          >
            <section className="cities-modal">
              <div className="cities-delete-icon">
                <FaTrash />
              </div>
              <h2>{t('admin.incidents.deleteConfirmTitle', 'Confirmar Eliminación de Reporte')}</h2>
              <p>
                {t('admin.incidents.deleteConfirmDesc1', '¿Deseas eliminar el reporte')} <strong>{modalEliminar.codigo}</strong> (
                {modalEliminar.vehiculo})?
              </p>

              {/* VALIDACIÓN 1: CLIENTES */}
              {modalEliminar.origen === 'cliente' && (
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
                  {t('admin.incidents.clientReportDeleteError', 'Los reportes creados por los clientes no pueden ser eliminados por control de auditoría.')}
                </div>
              )}

              {/* VALIDACIÓN 2: PROPIOS EN ESTADO DIFERENTE A RECIBIDO */}
              {modalEliminar.origen === 'administrador' && modalEliminar.estado !== 'recibido' && (
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
                  {t('admin.incidents.ownReportStateDeleteError', 'No se puede eliminar un reporte propio que ya ha pasado a estado de revisión o reparación.')}
                </div>
              )}

              {errorModal && <p className="cities-error">{errorModal}</p>}

              <div className="cities-modal__actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" 
                  className="incident-modal-btn-cancel"
                  onClick={() => setModalEliminar(null)}
                  style={{ 
                    background: 'var(--city-bg, #f1f5f9)', 
                    color: 'var(--city-muted, #475569)', 
                    border: '1.5px solid #cbd5e1', 
                    padding: '8px 20px', 
                    borderRadius: '9999px', 
                    fontWeight: 700, 
                    fontSize: '13px', 
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0' }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'var(--city-bg, #f1f5f9)' }}
                >
                  {t('admin.incidents.cancel', 'Cancelar')}
                </button>
                <button
                  type="button"
                  className="cities-danger incident-modal-btn-delete"
                  disabled={
                    modalEliminar.origen === 'cliente' ||
                    (modalEliminar.origen === 'administrador' && modalEliminar.estado !== 'recibido')
                  }
                  onClick={() => handleEliminarIncidencia(modalEliminar)}
                  style={{ 
                    background: '#dc2626', 
                    color: 'var(--city-card, #ffffff)', 
                    border: 'none', 
                    padding: '8px 24px', 
                    borderRadius: '9999px', 
                    fontWeight: 800, 
                    fontSize: '13px', 
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                    opacity: modalEliminar.origen === 'cliente' || (modalEliminar.origen === 'administrador' && modalEliminar.estado !== 'recibido') ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#b91c1c' }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#dc2626' }}
                >
                  {t('admin.incidents.confirmDelete', 'Confirmar Eliminación')}
                </button>
              </div>
            </section>
          </div>
        )}

        {/* MODAL RESPONDER AL INCIDENTE */}
        {modalResponder && (
          <div
            className="cities-modal-backdrop"
            onClick={(e) => {
              if (e.target.className === 'cities-modal-backdrop') setModalResponder(null)
            }}
          >
            <section className="cities-modal" style={{ maxWidth: 600 }}>
              <div className="cities-modal__head">
                <h2 style={{ fontSize: 20, color: 'var(--brand-primary)', margin: 0 }}>
                  {t('admin.incidents.replyBtn', 'Responder al Cliente')}
                </h2>
                <button type="button" onClick={() => setModalResponder(null)} style={{ background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--city-muted, #64748b)' }}>
                  á—
                </button>
              </div>
              <div className="cities-modal__body" style={{ padding: '20px 24px' }}>
                <p style={{ fontSize: 14, color: 'var(--city-muted, #475569)', marginBottom: 20 }}>
                  {t('admin.incidents.replyHint', 'Escribe tu respuesta. Esta notificación llegará automáticamente al correo del usuario y quedará registrada en el historial del incidente.')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {modalResponder.codigoReserva && (
                      <div style={{ flex: 1, background: 'var(--city-bg, #f8fafc)', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 11, color: 'var(--city-muted, #64748b)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>{t('admin.incidents.associatedRes', 'Reserva Asociada')}</span>
                        <strong style={{ fontSize: 14, color: 'var(--brand-primary)' }}>{modalResponder.codigoReserva}</strong>
                      </div>
                    )}
                    <div style={{ flex: 1, background: 'var(--city-bg, #f8fafc)', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, color: 'var(--city-muted, #64748b)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>{t('admin.incidents.clientName', 'Cliente')}</span>
                      <strong style={{ fontSize: 14, color: 'var(--brand-primary)' }}>{modalResponder.contactoNombre || 'Cliente no registrado'}</strong>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1, background: 'var(--city-bg, #f8fafc)', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, color: 'var(--city-muted, #64748b)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>{t('admin.incidents.incidentType', 'Tipo de Incidencia')}</span>
                      <strong style={{ fontSize: 14, color: 'var(--city-muted, #475569)' }}>{t(`admin.incidents.types.${modalResponder.tipoIncidenciaId || 'averia_mecanica'}`, modalResponder.tipoIncidenciaNombre || t('admin.incidents.notSpecified', 'No especificado'))}</strong>
                    </div>
                    <div style={{ flex: 1, background: 'var(--city-bg, #f8fafc)', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, color: 'var(--city-muted, #64748b)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>{t('admin.incidents.emailClient', 'Correo Cliente')}</span>
                      <strong style={{ fontSize: 14, color: 'var(--city-muted, #475569)' }}>{modalResponder.contactoEmail}</strong>
                    </div>
                  </div>

                  <div style={{ background: 'var(--city-bg, #f8fafc)', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 11, color: 'var(--city-muted, #64748b)', fontWeight: 700, display: 'block', textTransform: 'uppercase', marginBottom: 4 }}>{t('admin.incidents.problemDesc', 'Descripción del Problema')}</span>
                    <p style={{ fontSize: 14, color: 'var(--city-text, #334155)', margin: 0, lineHeight: 1.4 }}>{translateDescription(modalResponder.descripcion)}</p>
                  </div>
                </div>

                <form onSubmit={handleResponderYActualizar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="incident-grid-2">
                    <div className="incident-field">
                      <span className="incident-field-label" style={{ fontWeight: 600, fontSize: 13 }}>{t('admin.incidents.changeStatus', 'Cambiar estado')}</span>
                      <select
                        value={nuevoEstadoModal}
                        onChange={(e) => setNuevoEstadoModal(e.target.value)}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E") no-repeat right 12px center', backgroundSize: '12px', appearance: 'none', WebkitAppearance: 'none', width: '100%', cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="recibido">{t('admin.incidents.status.received', 'Recibido')}</option>
                        <option value="atendiendo">{t('admin.incidents.status.attending', 'Atendiendo')}</option>
                        <option value="resuelto">{t('admin.incidents.status.resolved', 'Resuelto')}</option>
                        <option value="rechazado">{t('admin.incidents.status.rejected', 'Rechazado')}</option>
                      </select>
                    </div>
                    <div className="incident-field">
                      <span className="incident-field-label" style={{ fontWeight: 600, fontSize: 13 }}>{t('admin.incidents.priority', 'Prioridad')}</span>
                      <select
                        value={nuevaPrioridadModal || modalResponder.prioridad || 'media'}
                        onChange={(e) => setNuevaPrioridadModal(e.target.value)}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E") no-repeat right 12px center', backgroundSize: '12px', appearance: 'none', WebkitAppearance: 'none', width: '100%', cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="baja">{t('admin.incidents.priorities.baja', 'Baja')}</option>
                        <option value="media">{t('admin.incidents.priorities.media', 'Media')}</option>
                        <option value="alta">{t('admin.incidents.priorities.alta', 'Alta')}</option>
                        <option value="urgente">{t('admin.incidents.priorities.urgente', 'Urgente')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="incident-field">
                    <span className="incident-field-label" style={{ fontWeight: 600, fontSize: 13 }}>{t('admin.incidents.replyMessage', 'Mensaje de respuesta')}</span>
                    <textarea
                      required
                      rows={5}
                      placeholder={t('admin.incidents.replyPlaceholder', 'Escribe aquí la respuesta...')}
                      value={respuestaTexto}
                      onChange={(e) => setRespuestaTexto(e.target.value)}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', resize: 'none' }}
                    />
                  </div>
                  {errorModal && <p className="cities-error">{errorModal}</p>}
                  
                  <div className="cities-modal__actions" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button 
                      type="button" 
                      className="incident-modal-btn-cancel"
                      onClick={() => setModalResponder(null)} 
                      style={{ 
                        background: 'var(--city-bg, #f1f5f9)', 
                        color: 'var(--city-muted, #475569)', 
                        border: '1.5px solid #cbd5e1', 
                        padding: '8px 20px', 
                        borderRadius: '9999px', 
                        fontWeight: 700, 
                        fontSize: '13px', 
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0' }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'var(--city-bg, #f1f5f9)' }}
                    >
                      {t('admin.incidents.cancel', 'Cancelar')}
                    </button>
                    <button 
                      type="submit" 
                      className="cities-primary incident-modal-btn-submit"
                      style={{ 
                        background: '#2563eb', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        padding: '8px 24px', 
                        borderRadius: '9999px', 
                        border: 'none', 
                        color: 'var(--city-card, #ffffff)', 
                        fontWeight: 800, 
                        fontSize: '13px', 
                        cursor: 'pointer', 
                        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'var(--brand-primary, #1d4ed8)' }}
                      onMouseOut={(e) => { e.currentTarget.style.background = '#2563eb' }}
                    >
                      {t('admin.incidents.saveAndSend', 'Enviar correo y Actualizar')}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        )}
        {/* Modal Visor de Evidencias (Imagen / Video) */}
        {zoomMedia && (
          <div
            className="doc-zoom-backdrop"
            onClick={() => setZoomMedia(null)}
          >
            <div
              className="doc-zoom-modal"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: zoomMedia.isVideo ? 720 : 640 }}
            >
              <div className="doc-zoom-header">
                <div className="doc-zoom-title-box">
                  <h3 className="doc-zoom-title">{zoomMedia.title}</h3>
                  <span className="doc-zoom-subtitle">
                    <FaEye style={{ color: '#2563eb' }} />
                    {zoomMedia.isVideo ? 'Reproductor de evidencia en video' : 'Vista previa de evidencia fotográfica'}
                  </span>
                </div>
                <div className="doc-zoom-actions">
                  {zoomMedia.url && (
                    <a
                      href={zoomMedia.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="doc-zoom-btn-action"
                      title="Abrir original"
                    >
                      <FaExternalLinkAlt style={{ fontSize: 11 }} />
                      <span>Abrir original</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setZoomMedia(null)}
                    className="doc-modal-close"
                    title="Cerrar"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <div className="doc-zoom-preview-box" style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
                {zoomMedia.isVideo ? (
                  <video
                    src={zoomMedia.url}
                    controls
                    autoPlay
                    style={{ width: '100%', maxHeight: '65vh', borderRadius: 12, outline: 'none' }}
                  />
                ) : (
                  <img
                    src={zoomMedia.url}
                    alt={zoomMedia.title}
                    className="doc-zoom-img"
                    style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: 12, objectFit: 'contain' }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
