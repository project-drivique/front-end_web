// src/services/incidentManagementService.js
//
// Incidencias de soporte: gestión y validación de reportes de clientes e internos
// para Administrador General (Supervisión y Auditoría) y Encargado de Sucursal (Validación Operativa).
import { incidentService } from './incidentService'
import { TIPOS_INCIDENCIA } from '../modules/support/data/supportCatalog'
import i18n from '@/i18n'

const INCIDENT_EVENT = 'drivique:incidents-updated'
const STORAGE_KEY = 'drivique_incidents_v2'

// Estados que ve el usuario <-> estados del servidor
const ESTADO = { OPEN: 'recibido', IN_REVIEW: 'atendiendo', RESOLVED: 'resuelto', CLOSED: 'rechazado' }
const ESTADO_API = { recibido: 'OPEN', atendiendo: 'IN_REVIEW', en_revision: 'IN_REVIEW', en_reparacion: 'IN_REVIEW', resuelto: 'RESOLVED', rechazado: 'CLOSED' }
const PRIORIDAD = { LOW: 'baja', MEDIUM: 'media', HIGH: 'alta', CRITICAL: 'urgente' }
const GRAVEDAD = { CRITICAL: 'alta', HIGH: 'alta', MEDIUM: 'media', LOW: 'baja' }
const COLOR_ESTADO = { OPEN: '#d97706', IN_REVIEW: 'var(--brand-primary)', RESOLVED: '#16a34a', CLOSED: '#991b1b' }

// Tipo de incidencia -> categoría del servidor
const CATEGORIA_DE_TIPO = {
  choque: 'VEHICLE',
  averia_mecanica: 'VEHICLE',
  pinchazo: 'VEHICLE',
  bateria_descargada: 'VEHICLE',
  falla_electrica: 'VEHICLE',
  robo: 'VEHICLE',
  asistencia_general: 'RESERVATION',
  otro_problema: 'OTHER',
}

// ─── REPOSITORIO DE REPORTES DE CLIENTES (CERO DATOS QUEMADOS) ────────

function cargarStorage() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    const limpios = (Array.isArray(parsed) ? parsed : []).filter(
      (item) => item && !String(item.id || '').startsWith('inc-seed-')
    )
    if (limpios.length !== (parsed || []).length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limpios))
    }
    return limpios
  } catch {
    return []
  }
}

function guardarStorage(lista) {
  if (typeof window === 'undefined') return
  try {
    const limpios = (Array.isArray(lista) ? lista : []).filter(
      (item) => item && !String(item.id || '').startsWith('inc-seed-')
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limpios))
  } catch {
    /* ignore storage quota errors */
  }
}

let cache = cargarStorage()
const urlsDeEvidencia = new Map()

const emitir = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(INCIDENT_EVENT, { detail: cache.length }))
  }
}

const tipoDe = (subject) => {
  const texto = String(subject || '').trim().toLowerCase()
  const encontrado = TIPOS_INCIDENCIA.find((tipo) => tipo.nombre.toLowerCase() === texto)
  return encontrado || { id: 'otro_problema', nombre: subject || 'Incidencia', tiempoEstimado: '' }
}

const hora = (iso) => (iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')

const horasDeAtencion = (incident) => {
  if (!incident.slaDueAt || !incident.createdAt) return ''
  const horas = Math.max(1, Math.round((new Date(incident.slaDueAt) - new Date(incident.createdAt)) / 3600000))
  return `${horas} h`
}

const historial = (incident) => (incident.timeline || []).map((entry) => {
  const base = { autor: entry.authorName || '', hora: hora(entry.createdAt), fecha: entry.createdAt }
  if (entry.type === 'MESSAGE') {
    return {
      ...base,
      estadoKey: ESTADO[incident.status] || 'recibido',
      titulo: entry.authorRole === 'STAFF' ? i18n.t('hc2.respuesta_enviada_al_cliente', 'Respuesta Enviada al Cliente') : i18n.t('hc2.mensaje_del_cliente', 'Mensaje del cliente'),
      descripcion: entry.message || '',
      color: entry.authorRole === 'STAFF' ? 'var(--brand-primary)' : 'var(--brand-primary)',
    }
  }
  if (entry.type === 'ASSIGNMENT') {
    return { ...base, estadoKey: ESTADO[incident.status] || 'recibido', titulo: i18n.t('hc2.cambio_de_estado', 'Cambio de Estado'), descripcion: entry.message || i18n.t('hc3.assigned_to', { defaultValue: 'Asignada a {{equipo}}', equipo: incident.assignedToName || i18n.t('hc3.the_team', 'el equipo') }), color: '#6366f1' }
  }
  if (!entry.fromStatus) {
    return {
      ...base,
      estadoKey: 'recibido',
      titulo: incident.internal ? i18n.t('hc5.internal_report_created', 'Reporte Interno Creado') : i18n.t('hc2.reporte_creado_por_el_cliente', 'Reporte Creado por el Cliente'),
      descripcion: entry.message || '',
      color: 'var(--brand-primary)',
    }
  }
  return {
    ...base,
    estadoKey: ESTADO[entry.toStatus] || 'recibido',
    titulo: i18n.t('hc2.cambio_de_estado', 'Cambio de Estado'),
    descripcion: entry.message || '',
    color: COLOR_ESTADO[entry.toStatus] || '#d97706',
  }
})

export const mapIncident = (i) => {
  if (!i) return null
  // Si ya es un objeto mapeado
  if (i.codigo && i.contactoNombre && !i.subject) return i

  const tipo = tipoDe(i.subject)
  const adjuntos = i.attachments || []
  const fotos = adjuntos.filter((a) => String(a.contentType || '').startsWith('image/'))
  const video = adjuntos.find((a) => String(a.contentType || '').startsWith('video/'))
  const foto = (n) => fotos[n]

  return {
    id: i.id,
    codigo: i.code || i.codigo,
    codigoReserva: i.reservationCode || i.codigoReserva || '',
    tipoIncidenciaId: tipo.id,
    tipoIncidenciaNombre: tipo.nombre,
    titulo: i.subject,
    descripcion: i.description || i.descripcion,
    vehiculoId: i.vehicleId || null,
    vehiculo: i.vehicleModel || i.vehiculo || '',
    placa: i.vehiclePlate || i.placa || '',
    vehiculoPlaca: i.vehiclePlate || i.placa || '',
    vehiculoModelo: i.vehicleModel || i.vehiculo || '',
    sucursal: i.branchName || i.sucursal || '',
    reservaCodigo: i.reservationCode || i.codigoReserva || '',
    contactoNombre: i.reporterName || i.contactoNombre || '',
    contactoEmail: i.reporterEmail || i.contactoEmail || '',
    contactoTelefono: i.reporterPhone || i.contactoTelefono || '',
    origen: i.internal ? 'administrador' : 'cliente',
    estado: ESTADO[i.status] || i.estado || 'recibido',
    estadoCodigo: i.status || ESTADO_API[i.estado] || 'OPEN',
    prioridad: PRIORIDAD[i.priority] || i.prioridad || 'media',
    gravedad: GRAVEDAD[i.priority] || i.gravedad || 'media',
    categoria: i.category || 'VEHICLE',
    tiempoEstimado: horasDeAtencion(i) || i.tiempoEstimado || '2 a 4 horas',
    slaVencido: i.slaBreached || false,
    permitidas: i.allowedTransitions || [],
    fechaIso: i.createdAt || i.fechaIso || new Date().toISOString(),
    fechaCreacion: i.createdAt || i.fechaCreacion || new Date().toISOString(),
    fechaRegistro: i.createdAt || i.fechaRegistro || new Date().toISOString(),
    evidenciasCount: adjuntos.length || i.evidenciasCount || 0,
    adjuntos,
    evidenciaFoto1: foto(0)?.originalName || i.evidenciaFoto1 || null,
    evidenciaFoto1Url: foto(0) ? urlsDeEvidencia.get(foto(0).id) || null : (i.evidenciaFoto1Url || null),
    evidenciaFoto2: foto(1)?.originalName || i.evidenciaFoto2 || null,
    evidenciaFoto2Url: foto(1) ? urlsDeEvidencia.get(foto(1).id) || null : (i.evidenciaFoto2Url || null),
    evidenciaFoto3: foto(2)?.originalName || i.evidenciaFoto3 || null,
    evidenciaFoto3Url: foto(2) ? urlsDeEvidencia.get(foto(2).id) || null : (i.evidenciaFoto3Url || null),
    evidenciaVideo: video?.originalName || i.evidenciaVideo || null,
    evidenciaVideoUrl: video ? urlsDeEvidencia.get(video.id) || null : (i.evidenciaVideoUrl || null),
    historial: Array.isArray(i.historial) && i.historial.length ? i.historial : historial(i),
  }
}

async function cargarEvidencias(incidentes) {
  let cambio = false
  for (const incident of incidentes) {
    const aVer = (incident.adjuntos || []).filter((a) => /^(image|video)\//.test(String(a.contentType || ''))).slice(0, 4)
    for (const adjunto of aVer) {
      if (urlsDeEvidencia.has(adjunto.id)) continue
      try {
        urlsDeEvidencia.set(adjunto.id, await incidentService.attachmentUrl(incident.id, adjunto.id))
        cambio = true
      } catch {
        /* sin permiso o archivo no disponible */
      }
    }
  }
  return cambio
}

function reemplazar(lista) {
  cache = lista
  guardarStorage(cache)
  emitir()
  cargarEvidencias(lista).then((cambio) => {
    if (cambio) {
      cache = cache.map((item) => (item.__raw ? conRaw(item.__raw) : item))
      guardarStorage(cache)
      emitir()
    }
  })
}

const conRaw = (raw) => ({ ...mapIncident(raw), __raw: raw })

const errorDe = (error) => {
  const mensaje = new Error(error?.message || i18n.t('hc2.no_fue_posible_completar_la_operacion', 'No fue posible completar la operación.'))
  mensaje.status = error?.status
  return mensaje
}

export const incidentManagementService = {
  eventName: INCIDENT_EVENT,

  async refresh() {
    try {
      const serverList = await incidentService.forStaff()
      if (Array.isArray(serverList)) {
        reemplazar(serverList.map(conRaw))
        return this.list()
      }
    } catch (err) {
      console.warn('Error refreshing staff incidents:', err)
    }
    return this.list()
  },

  async refreshMine() {
    try {
      const serverList = await incidentService.mine()
      if (Array.isArray(serverList)) {
        reemplazar(serverList.map(conRaw))
        return this.list()
      }
    } catch (err) {
      console.warn('Error refreshing user incidents:', err)
    }
    return this.list()
  },

  list() {
    return cache.map(({ __raw, ...incident }) => ({ ...incident })) // eslint-disable-line no-unused-vars
  },

  listForUser(user) {
    const list = this.list()
    if (!user) return list
    const esEncargado =
      user.rol === 'encargado' ||
      user.rol === 'encargado_sucursal' ||
      user.rol === 'branch_manager' ||
      (Array.isArray(user.roles) && user.roles.includes('BRANCH_MANAGER'))

    if (!esEncargado) return list

    const userBranch = String(user.sucursal || user.branchName || user.sucursalNombre || '').trim().toLowerCase()
    if (!userBranch) return list

    return list.filter((r) => {
      const rBranch = String(r.sucursal || '').trim().toLowerCase()
      return !rBranch || rBranch.includes(userBranch) || userBranch.includes(rBranch)
    })
  },

  getById(id) {
    return this.list().find((r) => r.id === id || r.codigo === id) || null
  },

  async loadDetail(id) {
    const local = this.getById(id)
    try {
      const raw = await incidentService.detail(id)
      const item = conRaw(raw)
      cache = cache.some((r) => r.id === id) ? cache.map((r) => (r.id === id ? item : r)) : [item, ...cache]
      guardarStorage(cache)
      await cargarEvidencias([
        {
          id: raw.id,
          adjuntos: [
            ...(raw.attachments || []),
            ...((raw.timeline || []).flatMap((entry) => entry.attachments || [])),
          ],
        },
      ])
      const refrescado = conRaw(raw)
      cache = cache.map((r) => (r.id === id ? refrescado : r))
      guardarStorage(cache)
      emitir()
      const { __raw, ...limpio } = refrescado // eslint-disable-line no-unused-vars
      return limpio
    } catch {
      if (local) return local
      throw errorDe({ message: i18n.t('hc.no_se_encontro_el_reporte_solicitado', 'No se encontró el reporte solicitado.') })
    }
  },

  async createIncident(data, user, files = []) {
    const tipo = tipoDe(data.tipoIncidenciaNombre || (TIPOS_INCIDENCIA.find((t) => t.id === data.tipoIncidenciaId) || {}).nombre)
    const tipoId = data.tipoIncidenciaId || tipo.id
    const nombre = data.tipoIncidenciaNombre || (TIPOS_INCIDENCIA.find((t) => t.id === tipoId) || {}).nombre || tipo.nombre
    const payload = {
      category: data.categoria || CATEGORIA_DE_TIPO[tipoId] || 'OTHER',
      vehicleId: data.vehiculoId || null,
      reservationId: data.reservaId || null,
      branchId: data.sucursalId || user?.sucursalId || null,
      subject: String(nombre).slice(0, 150),
      description: data.descripcion,
    }
    try {
      let creada = await incidentService.create(payload)
      if (files.length) creada = await incidentService.uploadAttachments(creada.id, files)
      if (!creada.vehiclePlate && (data.placa || data.vehiclePlate)) {
        creada.vehiclePlate = data.placa || data.vehiclePlate
      }
      if (!creada.vehicleModel && (data.vehiculo || data.vehicleModel)) {
        creada.vehicleModel = data.vehiculo || data.vehicleModel
      }
      const item = conRaw(creada)
      cache = [item, ...cache.filter((r) => r.id !== item.id)]
      guardarStorage(cache)
      emitir()
      cargarEvidencias([{ id: creada.id, adjuntos: creada.attachments || [] }])
      const { __raw, ...limpio } = item // eslint-disable-line no-unused-vars
      return limpio
    } catch (err) {
      console.error("Error creating incident on server:", err);
      throw errorDe(err?.response?.data || err);
    }
  },

  async updateStatusAndRespond(id, { nuevoEstado, respuestaTexto }, user) {
    const actual = this.getById(id)
    if (!actual) throw new Error('Reporte no encontrado.')

    const destino = ESTADO_API[nuevoEstado] || actual?.estadoCodigo
    try {
      let raw
      if (destino && actual && destino !== actual.estadoCodigo) {
        raw = await incidentService.changeStatus(id, destino, respuestaTexto)
      } else if (respuestaTexto) {
        raw = await incidentService.respond(id, respuestaTexto, [])
      } else {
        raw = await incidentService.detail(id)
      }
      const item = conRaw(raw)
      cache = cache.map((r) => (r.id === id ? item : r))
      guardarStorage(cache)
      emitir()
      const { __raw, ...limpio } = item // eslint-disable-line no-unused-vars
      return limpio
    } catch {
      // Fallback local update
      const nowIso = new Date().toISOString()
      const horaStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const statusTitle =
        nuevoEstado === 'resuelto'
          ? i18n.t('hc2.validado_y_resuelto_por_sucursal', 'Validado y Resuelto por Sucursal')
          : nuevoEstado === 'rechazado'
          ? i18n.t('hc5.report_dismissed_closed', 'Reporte Desestimado / Cerrado')
          : nuevoEstado === 'atendiendo'
          ? i18n.t('hc2.validacion_tecnica_y_atencion_en_curso', 'Validación Técnica y Atención en Curso')
          : i18n.t('hc2.actualizacion_de_estado', 'Actualización de Estado')

      const nuevoHistorial = [
        ...(actual.historial || []),
        {
          autor: user?.nombre ? `${user.nombre} (${actual.sucursal || i18n.t('hc5.branch_word', 'Sede')})` : i18n.t('hc2.encargado_de_sucursal', 'Encargado de Sucursal'),
          hora: horaStr,
          fecha: nowIso,
          titulo: statusTitle,
          descripcion:
            respuestaTexto ||
            i18n.t('hc3.report_status_updated_sede', { defaultValue: 'El estado del reporte ha sido actualizado a {{estado}} tras validación técnica en sede.', estado: nuevoEstado.toUpperCase() }),
          color: nuevoEstado === 'resuelto' ? '#16a34a' : nuevoEstado === 'rechazado' ? '#dc2626' : 'var(--brand-primary)',
        },
      ]

      const actualizado = {
        ...actual,
        estado: nuevoEstado,
        estadoCodigo: destino,
        historial: nuevoHistorial,
      }

      cache = cache.map((r) => (r.id === id ? actualizado : r))
      guardarStorage(cache)
      emitir()
      return actualizado
    }
  },

  async removeIncident(id) {
    try {
      await incidentService.remove(id)
    } catch (error) {
      if (error?.status === 403) throw new Error('clientReportCannotBeDeleted', { cause: error })
      if (error?.status === 409) throw new Error('onlyReceivedOwnReportsCanBeDeleted', { cause: error })
    }
    cache = cache.filter((r) => r.id !== id)
    guardarStorage(cache)
    emitir()
    return true
  },
}
