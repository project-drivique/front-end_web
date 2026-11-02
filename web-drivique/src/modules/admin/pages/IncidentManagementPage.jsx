import { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FaBuilding, FaUserShield } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useBrand } from '../../../contexts/BrandContext'
import { incidentManagementService } from '../../../services/incidentManagementService'
import { vehicleManagementService } from '../../../services/vehicleManagementService'
import { branchManagementService } from '../../../services/branchManagementService'
import { useBranchScope } from '../../../hooks/useBranchScope'
import { useManagementModal } from '../../../hooks/useManagementModal'
import { useManagementExport } from '../../../hooks/useManagementExport'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './IncidentManagementPage.css'
import './DocumentVerificationPage.css'
import ZoomMedia from './IncidentManagementPage/ZoomMedia'
import ModalResponder from './IncidentManagementPage/ModalResponder'
import ModalEliminar from './IncidentManagementPage/ModalEliminar'
import ModalCrear from './IncidentManagementPage/ModalCrear'
import IncidentManagementPart2 from './IncidentManagementPage/IncidentManagementPart2'
import IncidentGrid2 from './IncidentManagementPage/IncidentGrid2'
import EsEncargado from './IncidentManagementPage/EsEncargado'
import IncidentManagementPart from './IncidentManagementPage/IncidentManagementPart'
import CitiesCard from './IncidentManagementPage/CitiesCard'
import IncidentKpisGrid from './IncidentManagementPage/IncidentKpisGrid'

// Marcador neutro cuando la evidencia no tiene vista previa (nunca una foto de internet)


export default function IncidentManagementPage() {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const { brand } = useBrand()
  const esModoOscuro = tema === 'oscuro'

  // Patrón Custom Hook: useBranchScope
  const { user, isBranchManager: esEncargado, assignedBranch: sucursalEncargado, branchKey } = useBranchScope()

  // Patrón Custom Hook: useManagementModal
  const {
    modalDetail: modalDetalle,
    setModalDetail: setModalDetalle,
    modalCreate: modalCrear,
    setModalCreate: setModalCrear,
    modalDelete: modalEliminar,
    setModalDelete: setModalEliminar,
    modalReply: modalResponder,
    setModalReply: setModalResponder,
    zoomMedia,
    setZoomMedia,
    notice,
    setNotice,
    errorModal,
    setErrorModal,
  } = useManagementModal()

  // Patrón Custom Hook: useManagementExport
  const { handleExportExcel, handleExportPdf, handlePrint } = useManagementExport(setNotice)

  // Estados de listado, filtros y pestañas
  const [incidents, setIncidents] = useState(() => incidentManagementService.listForUser(user))
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('clientes') // 'clientes' | 'internos'

  // Checklist interactivo de validación técnica para el encargado de sucursal
  const [validationChecklist, setValidationChecklist] = useState({
    evidenciasCoinciden: false,
    polizaVigente: false,
    placaKilometrajeVerificado: false,
    responsabilidadDictaminada: false,
  })

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
    cargarIncidencias()
    incidentManagementService.refresh().then(cargarIncidencias).catch(() => {})
    window.addEventListener(incidentManagementService.eventName, cargarIncidencias)
    return () => window.removeEventListener(incidentManagementService.eventName, cargarIncidencias)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Evidencias del nuevo reporte (archivos reales que se suben al servidor)
  const inputEvidenciasRef = useRef(null)
  const [archivosCrear, setArchivosCrear] = useState([])
  const [, setGuardando] = useState(false)

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
    return match?.imagenes?.[0] || match?.imagen || ''
  }

  const translateDescription = (text) => text || t('admin.incidents.table.noDesc', 'Problema reportado...')

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

  // Métricas para tarjetas KPI superiores
  const metrics = useMemo(() => {
    const list = incidents.filter((r) => {
      if (esEncargado && branchKey) {
        const rSucursal = String(r.sucursal || '').trim().toLowerCase()
        if (!rSucursal.includes(branchKey) && !branchKey.includes(rSucursal)) return false
      } else if (!esEncargado && branchFilter !== 'all') {
        if (r.sucursal !== branchFilter) return false
      }
      const isInternal = r.origen === 'admin' || r.origen === 'sucursal' || r.origen === 'interno'
      if (activeTab === 'clientes' && isInternal) return false
      if (activeTab === 'internos' && !isInternal) return false
      return true
    })

    return {
      total: list.length,
      recibido: list.filter((r) => r.estado === 'recibido').length,
      atendiendo: list.filter((r) => r.estado === 'atendiendo' || r.estado === 'en_revision' || r.estado === 'en_reparacion').length,
      resuelto: list.filter((r) => r.estado === 'resuelto').length,
      rechazado: list.filter((r) => r.estado === 'rechazado' || r.estado === 'cerrado').length,
    }
  }, [incidents, esEncargado, branchKey, branchFilter, activeTab])

  // Filtrado dinámico
  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase()
    return incidents.filter((r) => {
      // Tab filter (Clientes vs Internos)
      const isInternal = r.origen === 'admin' || r.origen === 'sucursal' || r.origen === 'interno'
      if (activeTab === 'clientes' && isInternal) return false
      if (activeTab === 'internos' && !isInternal) return false

      // Branch filter (Encargado vs Admin General)
      if (esEncargado && branchKey) {
        const rSucursal = String(r.sucursal || '').trim().toLowerCase()
        if (!rSucursal.includes(branchKey) && !branchKey.includes(rSucursal)) {
          return false
        }
      } else if (!esEncargado && branchFilter !== 'all') {
        if (r.sucursal !== branchFilter) return false
      }

      // Estado filter normalizado
      const normState = ['resuelto', 'atendiendo', 'rechazado', 'recibido'].includes(r.estado)
        ? r.estado
        : (r.estado === 'en_revision' || r.estado === 'en_reparacion' ? 'atendiendo' : 'recibido')

      if (stateFilter !== 'all' && normState !== stateFilter) return false

      const matchSearch =
        !term ||
        r.codigo?.toLowerCase().includes(term) ||
        r.codigoReserva?.toLowerCase().includes(term) ||
        r.vehiculo?.toLowerCase().includes(term) ||
        r.placa?.toLowerCase().includes(term) ||
        r.sucursal?.toLowerCase().includes(term) ||
        r.contactoNombre?.toLowerCase().includes(term) ||
        r.contactoEmail?.toLowerCase().includes(term) ||
        r.contactoTelefono?.toLowerCase().includes(term) ||
        r.descripcion?.toLowerCase().includes(term)

      return matchSearch
    })
  }, [incidents, search, stateFilter, branchFilter, activeTab, esEncargado, branchKey])

  // --- Handlers ---
  const handleCrearIncidencia = async (e) => {
    e.preventDefault()
    try {
      setErrorModal('')
      setGuardando(true)
      const vehiculo = vehiculos.find((v) => String(v.id) === String(formCrear.vehiculoId))
      await incidentManagementService.createIncident(
        {
          ...formCrear,
          placa: vehiculo?.placa || formCrear.placa || '',
          vehiculo: vehiculo?.nombre || '',
          sucursalId: vehiculo?.sucursalId || null,
        },
        user,
        archivosCrear
      )
      setNotice(t('admin.incidents.createdSuccess', 'Reporte de incidencia registrado correctamente.'))
      setModalCrear(false)
      setArchivosCrear([])
      setFormCrear({
        vehiculoId: '',
        placa: '',
        tipoIncidenciaId: 'choque',
        tipoIncidenciaNombre: t('admin.incidents.types.crash', 'Choque'),
        descripcion: '',
        prioridad: 'urgente',
        tiempoEstimado: t('admin.incidents.time.twoToFourHours', '2 a 4 horas'),
      })
      cargarIncidencias()
    } catch (error) {
      setErrorModal(error.message || t('admin.incidents.createError', 'Error al crear el reporte de incidencia.'))
    } finally {
      setGuardando(false)
    }
  }

  const handleEvidenciasElegidas = (e) => {
    const elegidos = Array.from(e.target.files || [])
    e.target.value = ''
    setArchivosCrear((actuales) => [...actuales, ...elegidos].slice(0, 3))
  }

  const handleEliminarEvidenciaCrear = (index) => {
    setArchivosCrear((actuales) => actuales.filter((_, i) => i !== index))
  }

  const openDetalleModal = async (r) => {
    setErrorModal('')
    setRespuestaTexto('')
    setNuevoEstadoModal(r.estado)
    setNuevaPrioridadModal(r.prioridad || 'media')
    setValidationChecklist({
      evidenciasCoinciden: r.estado !== 'recibido',
      polizaVigente: r.estado !== 'recibido',
      placaKilometrajeVerificado: r.estado !== 'recibido',
      responsabilidadDictaminada: r.estado === 'resuelto',
    })
    setModalDetalle(r)
    try {
      setModalDetalle(await incidentManagementService.loadDetail(r.id))
    } catch {
      /* se muestra lo que ya hay en la lista */
    }
  }

  const handleResponderYActualizar = async (e) => {
    e.preventDefault()
    if (!modalResponder) return
    if (!esEncargado) {
      setErrorModal(t('hc2.el_administrador_general_solo_tiene_pe', 'El Administrador General solo tiene permisos de supervisión global (solo lectura).'))
      return
    }
    try {
      setErrorModal('')
      setGuardando(true)
      await incidentManagementService.updateStatusAndRespond(
        modalResponder.id,
        { nuevoEstado: nuevoEstadoModal, respuestaTexto },
        user
      )
      setNotice(
        t(
          'admin.incidents.updatedSuccess',
          t('hc3.incident_updated_reply', { defaultValue: 'Reporte {{codigo}} actualizado a {{estado}} y respuesta enviada por correo y notificación.', codigo: modalResponder.codigo, estado: nuevoEstadoModal.toUpperCase() })
        )
      )
      setModalResponder(null)
      cargarIncidencias()
    } catch (error) {
      setErrorModal(error.message || t('hc2.error_al_responder_o_actualizar_el_est', 'Error al responder o actualizar el estado del incidente.'))
    } finally {
      setGuardando(false)
    }
  }

  const openResponderModal = (r) => {
    if (!esEncargado) return
    setErrorModal('')
    setRespuestaTexto('')
    setNuevoEstadoModal(r.estado)
    setNuevaPrioridadModal(r.prioridad || 'media')
    setModalResponder(r)
  }

  const handleQuickStatusChange = async (incidentId, newStatus) => {
    if (!esEncargado) {
      setNotice(t('hc.el_administrador_general_solo_tiene_pe', 'El Administrador General solo tiene permisos de supervisión global.'))
      return
    }
    try {
      const notaTecnica =
        newStatus === 'resuelto'
          ? t('hc2.incidencia_validada_y_dictamen_resuelt', 'Incidencia validada y dictamen resuelto conforme por la sucursal.')
          : newStatus === 'rechazado'
          ? t('hc2.reporte_de_incidente_desestimado_tras_', 'Reporte de incidente desestimado tras peritaje técnico en sede.')
          : t('hc2.validacion_tecnica_en_curso_vehiculo_i', 'Validación técnica en curso. Vehículo ingresado a peritaje/taller de asistencia.')

      const actualizado = await incidentManagementService.updateStatusAndRespond(
        incidentId,
        { nuevoEstado: newStatus, respuestaTexto: notaTecnica },
        user
      )
      setNotice(t('hc3.incident_status_updated', { defaultValue: 'Estado del reporte actualizado a {{estado}} correctamente.', estado: newStatus.toUpperCase() }))
      if (modalDetalle && modalDetalle.id === incidentId) {
        setModalDetalle(actualizado)
      }
      cargarIncidencias()
    } catch (error) {
      setNotice(error.message || t('hc2.no_se_pudo_cambiar_el_estado_del_repor', 'No se pudo cambiar el estado del reporte.'))
    }
  }

  const handleEliminarIncidencia = async (r) => {
    try {
      setErrorModal('')
      await incidentManagementService.removeIncident(r.id, user)
      setNotice(t('admin.incidents.deletedSuccess', `Reporte de incidencia ${r.codigo} eliminado.`))
      setModalEliminar(null)
      cargarIncidencias()
    } catch (err) {
      if (err.message === 'clientReportCannotBeDeleted') {
        setErrorModal(
          t(
            'admin.incidents.clientReportDeleteError',
            t('hc2.los_reportes_creados_por_los_clientes_', 'Los reportes creados por los clientes no pueden ser eliminados por control de auditoría.')
          )
        )
      } else if (err.message === 'onlyReceivedOwnReportsCanBeDeleted') {
        setErrorModal(
          t(
            'admin.incidents.ownReportStateDeleteError',
            t('hc2.no_se_puede_eliminar_un_reporte_propio', 'No se puede eliminar un reporte propio que ya ha pasado a estado de revisión o reparación.')
          )
        )
      } else {
        setErrorModal(t('admin.incidents.deleteError', 'Error al eliminar el reporte.'))
      }
    }
  }

  // Exportación
  const headersExport = [t('hc2.codigo_reserva_87', 'Código Reserva'), 'Remitente', t('hc2.vehiculo', 'Vehículo'), 'Placa', 'Tipo Incidencia', 'Evidencia Foto 1', 'Evidencia Foto 2', 'Evidencia Foto 3', 'Evidencia Video', t('hc2.telefono', 'Teléfono'), 'Correo', 'Estado']
  const rowsExport = filtrados.map((r) => [
    r.codigoReserva || r.codigo,
    r.contactoNombre,
    r.vehiculo,
    r.placa,
    r.tipoIncidenciaNombre || t('hc2.averia_mecanica', 'Avería Mecánica'),
    r.evidenciaFoto1 || '-',
    r.evidenciaFoto2 || '-',
    r.evidenciaFoto3 || '-',
    r.evidenciaVideo || t('hc2.sin_video', 'Sin video'),
    r.contactoTelefono || '',
    r.contactoEmail || '',
    r.estado,
  ])

  const exportData = {
    title: t('hc3.incident_export_title', { defaultValue: 'Reportes de Incidencias de Vehículos — {{marca}}', marca: brand?.name || 'Drivique' }),
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
              <span className="branch-topbar-badge">
                {esEncargado ? t('hc2.validacion_operativa_de_sucursal', 'VALIDACIÓN OPERATIVA DE SUCURSAL') : t('hc2.supervision_y_auditoria_global', 'SUPERVISIÓN Y AUDITORÍA GLOBAL')}
              </span>
              <h1 className="branch-topbar-heading">
                {esEncargado ? t('hc2.validacion_y_atencion_de_incidentes', 'Validación y Atención de Incidentes') : t('hc2.supervision_global_de_incidentes', 'Supervisión Global de Incidentes')}
              </h1>
            </div>

            <div className="cities-topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <MenuConfiguracion />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--city-card, #ffffff)', border: '1px solid #e2e8f0', borderRadius: '30px', padding: '4px 16px 4px 6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand-primary)', color: 'var(--city-card, #ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                  {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'A'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--city-text, #0f172a)', lineHeight: '1.2' }}>{user?.nombre || 'Administrador'}</span>
                  <span style={{ fontSize: '11px', color: 'var(--city-muted, #64748b)', lineHeight: '1.2' }}>{user?.rol || (esEncargado ? 'encargado_sucursal' : 'administrador')}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Notificación de Aviso */}
          {notice && (
            <div className="cities-notice" role="status">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice('')}>
                &times;
              </button>
            </div>
          )}

          {/* Banner de Contexto de Rol */}
          {esEncargado ? (
            <div style={{
              margin: '0 0 16px',
              padding: '14px 18px',
              borderRadius: 12,
              background: 'var(--brand-soft)',
              border: '1.5px solid var(--brand-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              color: 'var(--brand-text)'
            }}>
              <FaBuilding style={{ color: 'var(--brand-text)', fontSize: 24, flexShrink: 0 }} />
              <div style={{ fontSize: 13 }}>
                <strong style={{ display: 'block', color: 'var(--brand-text)', marginBottom: 2 }}>
                  Sede Operativa Asignada: {sucursalEncargado || t('hc2.tu_sucursal', 'Tu Sucursal')}
                </strong>
                Como Encargado de Sucursal tienes la potestad exclusiva de validar los siniestros y averías reportados por los clientes en esta sede, inspeccionar las evidencias fotográficas, dictaminar el peritaje técnico y responder formalmente al usuario.
              </div>
            </div>
          ) : (
            <div style={{
              margin: '0 0 16px',
              padding: '14px 18px',
              borderRadius: 12,
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              color: '#334155'
            }}>
              <FaUserShield style={{ color: 'var(--brand-text)', fontSize: 24, flexShrink: 0 }} />
              <div style={{ fontSize: 13 }}>
                <strong style={{ display: 'block', color: '#0f172a', marginBottom: 2 }}>
                  Modo Supervisión y Auditoría Global (Solo Lectura)
                </strong>
                Como Administrador General puedes consultar, filtrar y supervisar los reportes de incidentes de todas las sedes, revisar las evidencias y la trazabilidad técnica. La validación operativa y resolución de siniestros es responsabilidad exclusiva del Encargado de cada sucursal.
              </div>
            </div>
          )}

          {/* Tarjetas de Métricas KPI Superiores */}
          <IncidentKpisGrid metrics={metrics} setStateFilter={setStateFilter} stateFilter={stateFilter} t={t} />

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
          <CitiesCard branchFilter={branchFilter} esEncargado={esEncargado} exportData={exportData} filtrados={filtrados} getStatusBadge={getStatusBadge} getVehiculoImagen={getVehiculoImagen} handleExportExcel={handleExportExcel} handleExportPdf={handleExportPdf} handlePrint={handlePrint} openDetalleModal={openDetalleModal} openResponderModal={openResponderModal} search={search} setBranchFilter={setBranchFilter} setErrorModal={setErrorModal} setModalCrear={setModalCrear} setModalEliminar={setModalEliminar} setSearch={setSearch} setStateFilter={setStateFilter} setZoomMedia={setZoomMedia} stateFilter={stateFilter} sucursalEncargado={sucursalEncargado} sucursales={sucursales} t={t} translateDescription={translateDescription} />
        </div>

        {/* MODAL DETALLE Y PROCESO DE VALIDACIÓN DE INCIDENCIA */}
        {modalDetalle && (() => {
          const isRechazado = modalDetalle.estado === 'rechazado' || modalDetalle.estado === 'cerrado'
          const isResuelto = modalDetalle.estado === 'resuelto'
          const isAtendiendo = modalDetalle.estado === 'atendiendo' || modalDetalle.estado === 'en_revision' || modalDetalle.estado === 'en_reparacion'
          const isRecibido = modalDetalle.estado === 'recibido'

          return (
            <div
              className="cities-modal-backdrop"
              onMouseDown={(e) => e.target === e.currentTarget && setModalDetalle(null)}
            >
              <section className="cities-modal" style={{ maxWidth: 720, width: '100%', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}>
                <div className="cities-modal__head">
                  <div>
                    <p className="cities-eyebrow">{t('admin.incidents.detailTitle', 'Gestión de Incidencia')} {modalDetalle.codigo}</p>
                    <h2>{modalDetalle.vehiculo} ({modalDetalle.placa})</h2>
                  </div>
                  <button type="button" onClick={() => setModalDetalle(null)} style={{ background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--city-muted, #64748b)' }}>
                    &times;
                  </button>
                </div>

                {/* Banner de Vehículo con Imagen */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '14px 0', padding: '12px 16px', background: 'var(--city-soft)', borderRadius: 14, border: '1px solid var(--city-border)' }}>
                  <img
                    src={getVehiculoImagen(modalDetalle) || undefined}
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

                {/* ─── STEPPER: PROCESO DE VALIDACIÓN DEL REPORTE ─── */}
                <IncidentManagementPart isAtendiendo={isAtendiendo} isRechazado={isRechazado} isRecibido={isRecibido} isResuelto={isResuelto} t={t} />

                {/* ─── ACCIONES DE VALIDACIÓN (ENCARGADO) vs MODO SUPERVISIÓN (ADMIN) ─── */}
                {esEncargado ? (
                  <EsEncargado handleQuickStatusChange={handleQuickStatusChange} isAtendiendo={isAtendiendo} isRechazado={isRechazado} isRecibido={isRecibido} isResuelto={isResuelto} modalDetalle={modalDetalle} openResponderModal={openResponderModal} setModalDetalle={setModalDetalle} setValidationChecklist={setValidationChecklist} sucursalEncargado={sucursalEncargado} t={t} validationChecklist={validationChecklist} />
                ) : (
                  <div style={{
                    margin: '14px 0',
                    padding: '14px 18px',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    fontSize: 13,
                    color: '#334155'
                  }}>
                    <FaUserShield style={{ color: 'var(--brand-text)', fontSize: 26, flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', color: '#0f172a', marginBottom: 2 }}>{t('hc.supervision_de_auditoria_global_solo_l', 'Supervisión de Auditoría Global (Solo Lectura)')}</strong>
                      Este reporte de incidente es validado y resuelto operativamente por el Encargado de la sede <strong>{modalDetalle.sucursal}</strong>. El Administrador General cuenta con acceso de consulta integral y auditoría de evidencias sin intervención en las transiciones operativas ni alteración del peritaje.
                    </div>
                  </div>
                )}

                {/* Datos de Contacto y Ubicación */}
                <IncidentGrid2 modalDetalle={modalDetalle} t={t} />

                {/* ─── EVIDENCIAS ADJUNTADAS POR EL USUARIO (GALERÍA VISUAL) ─── */}
                <IncidentManagementPart2 modalDetalle={modalDetalle} setZoomMedia={setZoomMedia} t={t} />

                {/* Descripción del problema */}
                <div className="incident-field" style={{ margin: '4px 0 12px' }}>
                  <span className="incident-field-label">{t('admin.incidents.problemDescription', 'Descripción del problema')}</span>
                  <p style={{ background: 'var(--city-soft)', border: '1.5px solid var(--city-border)', padding: '12px 16px', borderRadius: 12, fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                    {translateDescription(modalDetalle.descripcion)}
                  </p>
                </div>

                {/* TIMELINE */}
                <span className="incident-field-label" style={{ display: 'block', marginBottom: 8 }}>{t('admin.incidents.historyTitle', 'Historial de respuestas y novedades')}</span>
                <div className="incident-timeline">
                  {(modalDetalle.historial || []).map((h, i) => (
                    <div key={i} className="incident-timeline-item" style={{ borderLeftColor: h.color || 'var(--brand-primary)' }}>
                      <strong>{translateTimelineTitle(h.titulo)} — {h.autor}</strong>
                      <p style={{ margin: '4px 0', fontSize: 12 }}>{translateTimelineDesc(h.descripcion)}</p>
                      <small>{h.hora} ({new Date(h.fecha).toLocaleDateString()})</small>
                    </div>
                  ))}
                </div>

                <div className="cities-modal__actions" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
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
          )
        })()}

        {/* MODAL CREAR INCIDENCIA PROPIA */}
        {modalCrear && (
          <ModalCrear archivosCrear={archivosCrear} errorModal={errorModal} formCrear={formCrear} handleCrearIncidencia={handleCrearIncidencia} handleEliminarEvidenciaCrear={handleEliminarEvidenciaCrear} handleEvidenciasElegidas={handleEvidenciasElegidas} inputEvidenciasRef={inputEvidenciasRef} setFormCrear={setFormCrear} setModalCrear={setModalCrear} t={t} user={user} vehiculos={vehiculos} />
        )}

        {/* MODAL ELIMINAR REPORTES CON VALIDACIÓN */}
        {modalEliminar && (
          <ModalEliminar errorModal={errorModal} handleEliminarIncidencia={handleEliminarIncidencia} modalEliminar={modalEliminar} setModalEliminar={setModalEliminar} t={t} />
        )}

        {/* MODAL RESPONDER AL INCIDENTE */}
        {modalResponder && (
          <ModalResponder errorModal={errorModal} handleResponderYActualizar={handleResponderYActualizar} modalResponder={modalResponder} nuevaPrioridadModal={nuevaPrioridadModal} nuevoEstadoModal={nuevoEstadoModal} respuestaTexto={respuestaTexto} setModalResponder={setModalResponder} setNuevaPrioridadModal={setNuevaPrioridadModal} setNuevoEstadoModal={setNuevoEstadoModal} setRespuestaTexto={setRespuestaTexto} t={t} translateDescription={translateDescription} />
        )}
        {/* Modal Visor de Evidencias (Imagen / Video) */}
        {zoomMedia && (
          <ZoomMedia setZoomMedia={setZoomMedia} t={t} zoomMedia={zoomMedia} />
        )}
      </main>
    </div>
  )
}
