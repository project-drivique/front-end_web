import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaBuilding,
  FaCar,
  FaClock,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaEye,
  FaFileExcel,
  FaFilePdf,
  FaPaperPlane,
  FaPlus,
  FaPrint,
  FaSearch,
  FaTrash,
  FaUser,
  FaUserShield,
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

export default function IncidentManagementPage() {
  const { t } = useTranslation()
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
  const [originFilter, setOriginFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [notice, setNotice] = useState('')
  const [errorModal, setErrorModal] = useState('')

  // Modales
  const [modalDetalle, setModalDetalle] = useState(null)
  const [modalCrear, setModalCrear] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(null)

  // Formularios
  const [formCrear, setFormCrear] = useState({
    vehiculoId: '',
    tipoIncidenciaId: 'averia_mecanica',
    tipoIncidenciaNombre: 'Avería mecánica',
    descripcion: '',
    prioridad: 'urgente',
    tiempoEstimado: '2 a 4 horas',
  })

  const [respuestaTexto, setRespuestaTexto] = useState('')
  const [nuevoEstadoModal, setNuevoEstadoModal] = useState('recibido')

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

  // Filtrado dinámico
  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase()
    return incidents.filter((r) => {
      const matchState = stateFilter === 'all' || r.estado === stateFilter
      const matchBranch = branchFilter === 'all' || r.sucursal === branchFilter
      const matchOrigin = originFilter === 'all' || r.origen === originFilter
      const matchPriority = priorityFilter === 'all' || r.prioridad === priorityFilter

      const matchSearch =
        !term ||
        r.codigo?.toLowerCase().includes(term) ||
        r.vehiculo?.toLowerCase().includes(term) ||
        r.placa?.toLowerCase().includes(term) ||
        r.contactoNombre?.toLowerCase().includes(term) ||
        r.descripcion?.toLowerCase().includes(term)

      return matchState && matchBranch && matchOrigin && matchPriority && matchSearch
    })
  }, [incidents, search, stateFilter, branchFilter, originFilter, priorityFilter])

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
        tipoIncidenciaId: 'averia_mecanica',
        tipoIncidenciaNombre: 'Avería mecánica',
        descripcion: '',
        prioridad: 'urgente',
        tiempoEstimado: '2 a 4 horas',
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
    setModalDetalle(r)
  }

  const handleResponderYActualizar = (e) => {
    e.preventDefault()
    if (!modalDetalle) return
    try {
      setErrorModal('')
      incidentManagementService.updateStatusAndRespond(
        modalDetalle.id,
        { nuevoEstado: nuevoEstadoModal, respuestaTexto },
        user
      )
      setNotice(
        t(
          'admin.incidents.updatedSuccess',
          `Reporte ${modalDetalle.codigo} actualizado a ${nuevoEstadoModal.toUpperCase()} y respuesta enviada por correo y notificación.`
        )
      )
      setModalDetalle(null)
      cargarIncidencias()
    } catch {
      setErrorModal(t('admin.incidents.updateError', 'Error al actualizar y responder el reporte.'))
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
  const headersExport = ['Código', 'Vehículo', 'Placa', 'Sucursal', 'Remitente', 'Origen', 'Prioridad', 'Estado', 'Descripción']
  const rowsExport = filtrados.map((r) => [
    r.codigo,
    r.vehiculo,
    r.placa,
    r.sucursal,
    r.contactoNombre,
    r.origen === 'cliente' ? 'Cliente' : 'Administrador',
    r.prioridad,
    r.estado,
    r.descripcion,
  ])

  const exportData = {
    title: `Reportes de Incidencias de Vehículos — ${brand.name}`,
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
          <header className="cities-topbar">
            <div>
              <p className="cities-eyebrow">{t('admin.management', 'Gestión Operativa')}</p>
              <h1>{t('admin.incidentsTitle', 'Reportes de Incidencias de Vehículos')}</h1>
              <p className="cities-subtitle">
                {t(
                  'admin.incidentsSubtitle',
                  'Control de incidencias de la flota, respuestas a clientes, priorización de reparación y trazabilidad.'
                )}
              </p>
            </div>

            <div className="cities-topbar__actions">
              <MenuConfiguracion />
              <button
                className="cities-primary"
                type="button"
                onClick={() => {
                  setErrorModal('')
                  setModalCrear(true)
                }}
              >
                <FaPlus /> {t('admin.incidents.newReport', 'Nuevo Reporte de Incidencia')}
              </button>
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

          {/* Tarjeta Principal */}
          <section className="cities-card">
            {/* Toolbar con Buscador y Filtros */}
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
                <option value="all">{t('admin.incidents.allStates', 'Todos los estados')}</option>
                <option value="recibido">{t('admin.incidents.recibido', 'Recibidos')}</option>
                <option value="en_revision">{t('admin.incidents.en_revision', 'En Revisión')}</option>
                <option value="en_reparacion">{t('admin.incidents.en_reparacion', 'En Reparación')}</option>
                <option value="resuelto">{t('admin.incidents.resuelto', 'Resueltos')}</option>
                <option value="rechazado">{t('admin.incidents.rechazado', 'Rechazados')}</option>
              </select>

              {/* Filtro Sucursal (Bloqueado para Encargado) */}
              {!esEncargado && (
                <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
                  <option value="all">{t('admin.incidents.allBranches', 'Todas las sucursales')}</option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.nombre}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              )}

              {/* Filtro Origen */}
              <select value={originFilter} onChange={(e) => setOriginFilter(e.target.value)}>
                <option value="all">{t('admin.incidents.allOrigins', 'Todos los orígenes')}</option>
                <option value="cliente">{t('admin.incidents.clientOrigin', 'Reportes de Clientes')}</option>
                <option value="administrador">{t('admin.incidents.adminOrigin', 'Reportes Internos (Admin)')}</option>
              </select>

              {/* Filtro Prioridad */}
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="all">{t('admin.incidents.allPriorities', 'Todas las prioridades')}</option>
                <option value="urgente">{t('admin.incidents.urgente', 'Urgente (< 24h)')}</option>
                <option value="alta">{t('admin.incidents.alta', 'Alta (24-48h)')}</option>
                <option value="media">{t('admin.incidents.media', 'Media (48-72h)')}</option>
                <option value="baja">{t('admin.incidents.baja', 'Baja (> 72h)')}</option>
              </select>

              {/* Botones de Exportación */}
              <div className="cities-export">
                <button type="button" onClick={() => exportExcel(exportData)}>
                  <FaFileExcel /> {t('admin.exportExcel', 'Excel')}
                </button>
                <button type="button" onClick={() => exportPdf(exportData)}>
                  <FaFilePdf /> {t('admin.exportPdf', 'PDF')}
                </button>
                <button type="button" onClick={() => printTable(exportData)}>
                  <FaPrint /> {t('admin.incidents.print', 'Imprimir')}
                </button>
              </div>
            </div>

            {/* Contador de Resultados */}
            <div className="cities-summary">
              <strong>{filtrados.length}</strong> {t('admin.incidents.registered', 'incidencias registradas')}
            </div>

            {/* Tabla Estilizada de Incidencias */}
            {filtrados.length === 0 ? (
              <div className="cities-empty">
                <FaExclamationTriangle />
                <h2>{t('admin.incidents.emptyTitle', 'No se encontraron reportes de incidencias')}</h2>
                <p>{t('admin.incidents.emptySubtitle', 'Intenta ajustar los criterios de búsqueda o los filtros seleccionados.')}</p>
              </div>
            ) : (
              <div className="cities-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t('admin.incidents.tableCode', 'Reporte / Código')}</th>
                      <th>{t('admin.incidents.tableVehicle', 'Vehículo / Placa')}</th>
                      <th>{t('admin.incidents.tableSender', 'Remitente')}</th>
                      <th>{t('admin.incidents.tableBranch', 'Sucursal')}</th>
                      <th>{t('admin.incidents.tableOrigin', 'Origen')}</th>
                      <th>{t('admin.incidents.tablePriority', 'Prioridad / Tiempo')}</th>
                      <th>{t('admin.incidents.tableStatus', 'Estado')}</th>
                      <th>{t('admin.incidents.tableActions', 'Acciones')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div className="cities-name">
                            <span>
                              <FaExclamationCircle />
                            </span>
                            <div>
                              <strong>{r.codigo}</strong>
                              <small>{new Date(r.fechaIso).toLocaleDateString()}</small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="fleet-vehicle">
                            {r.vehiculoImagen ? (
                              <img src={r.vehiculoImagen} alt="" style={{ width: 44, height: 32, borderRadius: 8 }} />
                            ) : (
                              <span>
                                <FaCar />
                              </span>
                            )}
                            <div>
                              <strong>{r.vehiculo}</strong>
                              <small>{r.placa}</small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: 12 }}>
                            <strong>{r.contactoNombre}</strong>
                            <small style={{ display: 'block', color: '#64748b' }}>{r.contactoEmail}</small>
                          </div>
                        </td>

                        <td>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-text)' }}>
                            <FaBuilding style={{ marginRight: 3 }} /> {r.sucursal}
                          </span>
                        </td>

                        <td>
                          <span className={`origin-badge ${r.origen}`}>
                            {r.origen === 'cliente' ? <FaUser /> : <FaUserShield />}
                            {r.origen === 'cliente' ? t('admin.incidents.client', 'Cliente') : t('admin.incidents.internal', 'Interno')}
                          </span>
                        </td>

                        <td>
                          <span className={`priority-badge ${t(`admin.incidents.${r.prioridad}`, r.prioridad)}`}>
                            <FaClock /> {r.prioridad} ({r.tiempoEstimado})
                          </span>
                        </td>

                        <td>
                          <span
                            className="doc-status-badge"
                            style={{
                              background:
                                r.estado === 'resuelto'
                                  ? '#dcfce7'
                                  : r.estado === 'en_reparacion'
                                  ? '#f3e8ff'
                                  : r.estado === 'en_revision'
                                  ? '#fef3c7'
                                  : 'var(--brand-soft-strong-light)',
                              color:
                                r.estado === 'resuelto'
                                  ? '#15803d'
                                  : r.estado === 'en_reparacion'
                                  ? '#6b21a8'
                                  : r.estado === 'en_revision'
                                  ? '#b45309'
                                  : 'var(--brand-text-light)',
                            }}
                          >
                            {t(`admin.incidents.${r.estado}`, r.estado)}
                          </span>
                        </td>

                        <td>
                          <div className="cities-row-actions">
                            <button
                              type="button"
                              onClick={() => openDetalleModal(r)}
                              title={t("admin.incidents.viewDetails", "Ver Detalle y Responder")}
                              style={{ color: 'var(--brand-text)' }}
                            >
                              <FaEye />
                            </button>

                            <button
                              className="is-danger"
                              type="button"
                              onClick={() => {
                                setErrorModal('')
                                setModalEliminar(r)
                              }}
                              title={t("admin.incidents.deleteReport", "Eliminar Reporte")}
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
                  ×
                </button>
              </div>

              <div className="incident-grid-2" style={{ margin: '18px 0' }}>
                <div className="incident-info-card">
                  <span className="incident-info-card__label">{t('admin.incidents.sender', 'Remitente')}</span>
                  <p>{modalDetalle.contactoNombre}</p>
                  <small>{modalDetalle.contactoEmail}</small>
                  <small>{modalDetalle.contactoTelefono}</small>
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
                <span className="incident-field-label">{t('admin.incidents.problemDescription', 'Descripci\u00f3n del problema')}</span>
                <p style={{ background: 'var(--city-soft)', border: '1.5px solid var(--city-border)', padding: '12px 16px', borderRadius: 12, fontSize: 13, margin: 0 }}>
                  {modalDetalle.descripcion}
                </p>
              </div>

              {/* TIMELINE */}
              <span className="incident-field-label" style={{ display: 'block', marginBottom: 8 }}>{t('admin.incidents.historyTitle', 'Historial de respuestas')}</span>
              <div className="incident-timeline">
                {(modalDetalle.historial || []).map((h, i) => (
                  <div key={i} className="incident-timeline-item" style={{ borderLeftColor: h.color || 'var(--brand-primary)' }}>
                    <strong>{h.titulo} \u2014 {h.autor}</strong>
                    <p style={{ margin: '4px 0', fontSize: 12 }}>{h.descripcion}</p>
                    <small>{h.hora} ({new Date(h.fecha).toLocaleDateString()})</small>
                  </div>
                ))}
              </div>

              <form onSubmit={handleResponderYActualizar} className="incident-form">
                <div className="incident-grid-2">
                  <div className="incident-field">
                    <span className="incident-field-label">{t('admin.incidents.changeStatus', 'Cambiar estado')}</span>
                    <select
                      value={nuevoEstadoModal}
                      onChange={(e) => setNuevoEstadoModal(e.target.value)}
                    >
                      <option value="recibido">{t('admin.incidents.recibido', 'Recibido')}</option>
                      <option value="en_revision">{t('admin.incidents.en_revision', 'En Revisi\u00f3n T\u00e9cnica')}</option>
                      <option value="en_reparacion">{t('admin.incidents.en_reparacion', 'En Reparaci\u00f3n Taller')}</option>
                      <option value="resuelto">{t('admin.incidents.resuelto', 'Resuelto')}</option>
                      <option value="rechazado">{t('admin.incidents.rechazado', 'Rechazado')}</option>
                    </select>
                  </div>
                  <div className="incident-notice-box">
                    <FaPaperPlane style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{t('admin.incidents.noticeEmailMsg', 'Se enviar\u00e1 correo y notificaci\u00f3n al usuario.')}</span>
                  </div>
                </div>
                <div className="incident-field">
                  <span className="incident-field-label">{t('admin.incidents.replyLabel', 'Mensaje de respuesta')}</span>
                  <textarea
                    required
                    rows={3}
                    placeholder={t('admin.incidents.replyPlaceholder', 'Escribe la respuesta oficial...')}
                    value={respuestaTexto}
                    onChange={(e) => setRespuestaTexto(e.target.value)}
                  />
                </div>
                {errorModal && <p className="cities-error">{errorModal}</p>}
                <div className="cities-modal__actions">
                  <button type="button" onClick={() => setModalDetalle(null)}>
                    {t('admin.incidents.cancel', 'Cancelar')}
                  </button>
                  <button type="submit" className="cities-primary">
                    <FaPaperPlane /> {t('admin.incidents.saveAndSend', 'Guardar y Enviar')}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* MODAL CREAR INCIDENCIA PROPIA */}
        {modalCrear && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) => e.target === e.currentTarget && setModalCrear(false)}
          >
            <section className="cities-modal">
              <div className="cities-modal__head">
                <div>
                  <p className="cities-eyebrow">{t('admin.incidents.internalHeader', 'Reporte de Flota Interno')}</p>
                  <h2>{t('admin.incidents.createTitle', 'Report New Incident')}</h2>
                </div>
                <button type="button" onClick={() => setModalCrear(false)}>
                  ×
                </button>
              </div>

              <form onSubmit={handleCrearIncidencia} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span>{t('admin.incidents.selectVehicle', 'Seleccionar Vehículo Afectado:')}</span>
                  <select
                    required
                    value={formCrear.vehiculoId}
                    onChange={(e) => setFormCrear({ ...formCrear, vehiculoId: e.target.value })}
                  >
                    <option value="">{t('admin.incidents.chooseVehicle', 'Selecciona un vehículo de la flota...')}</option>
                    {vehiculos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nombre} ({v.placa}) — {v.sucursal}
                      </option>
                    ))}
                  </select>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span>{t('admin.incidents.incidentType', 'Tipo de Incidencia:')}</span>
                    <select
                      value={formCrear.tipoIncidenciaId}
                      onChange={(e) => {
                        const optText = e.target.options[e.target.selectedIndex].text
                        setFormCrear({
                          ...formCrear,
                          tipoIncidenciaId: e.target.value,
                          tipoIncidenciaNombre: optText,
                        })
                      }}
                    >
                      <option value="averia_mecanica">{t('admin.incidents.types.averia_mecanica', 'Avería mecánica')}</option>
                      <option value="falla_electrica">{t('admin.incidents.types.falla_electrica', 'Falla eléctrica / Batería')}</option>
                      <option value="pinchazo_neumatico">{t('admin.incidents.types.pinchazo_neumatico', 'Pinchazo / Neumático')}</option>
                      <option value="limpieza_estetica">{t('admin.incidents.types.limpieza_estetica', 'Limpieza / Estética')}</option>
                      <option value="choque_carroceria">{t('admin.incidents.types.choque_carroceria', 'Choque / Carrocería')}</option>
                      <option value="mantenimiento_preventivo">{t('admin.incidents.types.mantenimiento_preventivo', 'Mantenimiento preventivo')}</option>
                    </select>
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span>{t('admin.incidents.priorityUrgency', 'Prioridad / Urgencia:')}</span>
                    <select
                      value={formCrear.prioridad}
                      onChange={(e) => {
                        const val = e.target.value
                        let time = '2 a 6 horas'
                        if (val === 'alta') time = '24 a 48 horas'
                        if (val === 'media') time = '48 a 72 horas'
                        if (val === 'baja') time = 'Más de 72 horas'
                        setFormCrear({ ...formCrear, prioridad: val, tiempoEstimado: time })
                      }}
                    >
                      <option value="urgente">{t('admin.incidents.urgente', 'Urgente (< 24h)')}</option>
                      <option value="alta">{t('admin.incidents.alta', 'Alta (24-48h)')}</option>
                      <option value="media">{t('admin.incidents.media', 'Media (48-72h)')}</option>
                      <option value="baja">{t('admin.incidents.baja', 'Baja (> 72h)')}</option>
                    </select>
                  </label>
                </div>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span>{t('admin.incidents.descriptionLabel', 'Descripción detallada de la incidencia / diagnóstico:')}</span>
                  <textarea
                    required
                    rows={4}
                    placeholder={t('admin.incidents.descriptionPlaceholder', 'Describe los síntomas de la falla o los trabajos de reparación requeridos...')}
                    value={formCrear.descripcion}
                    onChange={(e) => setFormCrear({ ...formCrear, descripcion: e.target.value })}
                  />
                </label>

                {errorModal && <p className="cities-error">{errorModal}</p>}

                <div className="cities-modal__actions" style={{ marginTop: 12 }}>
                  <button type="button" onClick={() => setModalCrear(false)}>
                    {t('admin.incidents.cancel', 'Cancelar')}
                  </button>
                  <button type="submit" className="cities-primary">
                    {t('admin.incidents.createBtn', 'Crear Reporte')}
                  </button>
                </div>
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

              <div className="cities-modal__actions">
                <button type="button" onClick={() => setModalEliminar(null)}>
                  Cancelar
                </button>
                <button
                  className="cities-danger"
                  type="button"
                  disabled={
                    modalEliminar.origen === 'cliente' ||
                    (modalEliminar.origen === 'administrador' && modalEliminar.estado !== 'recibido')
                  }
                  onClick={() => handleEliminarIncidencia(modalEliminar)}
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
