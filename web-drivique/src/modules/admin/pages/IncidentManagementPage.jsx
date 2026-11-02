import { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useLanding } from '../../landing/LandingContext'
import { useBrand } from '../../../contexts/BrandContext'
import { incidentManagementService } from '../../../services/incidentManagementService'
import { vehicleManagementService } from '../../../services/vehicleManagementService'
import { branchManagementService } from '../../../services/branchManagementService'
import { useBranchScope } from '../../../hooks/useBranchScope'
import { useManagementModal } from '../../../hooks/useManagementModal'
import { useManagementExport } from '../../../hooks/useManagementExport'

import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './IncidentManagementPage.css'
import './DocumentVerificationPage.css'

import ManagementMain from './IncidentManagementPage/ManagementMain'

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
      <ManagementMain activeTab={activeTab} archivosCrear={archivosCrear} branchFilter={branchFilter} errorModal={errorModal} esEncargado={esEncargado} exportData={exportData} filtrados={filtrados} formCrear={formCrear} getStatusBadge={getStatusBadge} getVehiculoImagen={getVehiculoImagen} handleCrearIncidencia={handleCrearIncidencia} handleEliminarEvidenciaCrear={handleEliminarEvidenciaCrear} handleEliminarIncidencia={handleEliminarIncidencia} handleEvidenciasElegidas={handleEvidenciasElegidas} handleExportExcel={handleExportExcel} handleExportPdf={handleExportPdf} handlePrint={handlePrint} handleQuickStatusChange={handleQuickStatusChange} handleResponderYActualizar={handleResponderYActualizar} inputEvidenciasRef={inputEvidenciasRef} metrics={metrics} modalCrear={modalCrear} modalDetalle={modalDetalle} modalEliminar={modalEliminar} modalResponder={modalResponder} notice={notice} nuevaPrioridadModal={nuevaPrioridadModal} nuevoEstadoModal={nuevoEstadoModal} openDetalleModal={openDetalleModal} openResponderModal={openResponderModal} respuestaTexto={respuestaTexto} search={search} setActiveTab={setActiveTab} setBranchFilter={setBranchFilter} setErrorModal={setErrorModal} setFormCrear={setFormCrear} setModalCrear={setModalCrear} setModalDetalle={setModalDetalle} setModalEliminar={setModalEliminar} setModalResponder={setModalResponder} setNotice={setNotice} setNuevaPrioridadModal={setNuevaPrioridadModal} setNuevoEstadoModal={setNuevoEstadoModal} setRespuestaTexto={setRespuestaTexto} setSearch={setSearch} setStateFilter={setStateFilter} setValidationChecklist={setValidationChecklist} setZoomMedia={setZoomMedia} stateFilter={stateFilter} sucursalEncargado={sucursalEncargado} sucursales={sucursales} t={t} translateDescription={translateDescription} translateTimelineDesc={translateTimelineDesc} translateTimelineTitle={translateTimelineTitle} user={user} validationChecklist={validationChecklist} vehiculos={vehiculos} zoomMedia={zoomMedia} />
    </div>
  )
}
