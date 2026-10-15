// src/services/incidentManagementService.js
//
// Incidencias de soporte: todo viene del servidor (lista, detalle, evidencias, respuestas y cambios de estado).
// Convierte la respuesta de la API a la forma que usan las pantallas de soporte, el tablero y los reportes.
import { incidentService } from './incidentService'
import { TIPOS_INCIDENCIA } from '../modules/support/data/supportCatalog'

const INCIDENT_EVENT = 'drivique:incidents-updated'

// Estados que ve el usuario <-> estados del servidor
const ESTADO = { OPEN: 'recibido', IN_REVIEW: 'atendiendo', RESOLVED: 'resuelto', CLOSED: 'rechazado' }
const ESTADO_API = { recibido: 'OPEN', atendiendo: 'IN_REVIEW', en_revision: 'IN_REVIEW', en_reparacion: 'IN_REVIEW', resuelto: 'RESOLVED', rechazado: 'CLOSED' }
const PRIORIDAD = { LOW: 'baja', MEDIUM: 'media', HIGH: 'alta', CRITICAL: 'urgente' }
const GRAVEDAD = { CRITICAL: 'alta', HIGH: 'alta', MEDIUM: 'media', LOW: 'baja' }
const COLOR_ESTADO = { OPEN: '#d97706', IN_REVIEW: '#0284c7', RESOLVED: '#16a34a', CLOSED: '#991b1b' }

// Tipo de incidencia (catálogo de la pantalla) -> categoría del servidor
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

let cache = []
const urlsDeEvidencia = new Map() // id de adjunto -> URL local del archivo

const emitir = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(INCIDENT_EVENT, { detail: cache.length }))
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
      titulo: entry.authorRole === 'STAFF' ? 'Respuesta Enviada al Cliente' : 'Mensaje del cliente',
      descripcion: entry.message || '',
      color: entry.authorRole === 'STAFF' ? '#0284c7' : 'var(--brand-primary)',
    }
  }
  if (entry.type === 'ASSIGNMENT') {
    return { ...base, estadoKey: ESTADO[incident.status] || 'recibido', titulo: 'Cambio de Estado', descripcion: entry.message || `Asignada a ${incident.assignedToName || 'el equipo'}`, color: '#6366f1' }
  }
  if (!entry.fromStatus) {
    return {
      ...base,
      estadoKey: 'recibido',
      titulo: incident.internal ? 'Reporte Interno Creado' : 'Reporte Creado por el Cliente',
      descripcion: entry.message || '',
      color: 'var(--brand-primary)',
    }
  }
  return {
    ...base,
    estadoKey: ESTADO[entry.toStatus] || 'recibido',
    titulo: 'Cambio de Estado',
    descripcion: entry.message || '',
    color: COLOR_ESTADO[entry.toStatus] || '#d97706',
  }
})

export const mapIncident = (i) => {
  const tipo = tipoDe(i.subject)
  const adjuntos = i.attachments || []
  const fotos = adjuntos.filter((a) => String(a.contentType || '').startsWith('image/'))
  const video = adjuntos.find((a) => String(a.contentType || '').startsWith('video/'))
  const foto = (n) => fotos[n]
  return {
    id: i.id,
    codigo: i.code,
    codigoReserva: i.reservationCode || '',
    tipoIncidenciaId: tipo.id,
    tipoIncidenciaNombre: tipo.nombre,
    titulo: i.subject,
    descripcion: i.description,
    vehiculoId: i.vehicleId || null,
    vehiculo: i.vehicleModel || '',
    placa: i.vehiclePlate || '',
    vehiculoPlaca: i.vehiclePlate || '',
    vehiculoModelo: i.vehicleModel || '',
    sucursal: i.branchName || '',
    reservaCodigo: i.reservationCode || '',
    contactoNombre: i.reporterName || '',
    contactoEmail: i.reporterEmail || '',
    contactoTelefono: '',
    origen: i.internal ? 'administrador' : 'cliente',
    estado: ESTADO[i.status] || 'recibido',
    estadoCodigo: i.status,
    prioridad: PRIORIDAD[i.priority] || 'media',
    gravedad: GRAVEDAD[i.priority] || 'media',
    categoria: i.category,
    tiempoEstimado: horasDeAtencion(i),
    slaVencido: i.slaBreached,
    permitidas: i.allowedTransitions || [],
    fechaIso: i.createdAt,
    fechaCreacion: i.createdAt,
    fechaRegistro: i.createdAt,
    evidenciasCount: adjuntos.length,
    adjuntos,
    evidenciaFoto1: foto(0)?.originalName || null,
    evidenciaFoto1Url: foto(0) ? urlsDeEvidencia.get(foto(0).id) || null : null,
    evidenciaFoto2: foto(1)?.originalName || null,
    evidenciaFoto2Url: foto(1) ? urlsDeEvidencia.get(foto(1).id) || null : null,
    evidenciaFoto3: foto(2)?.originalName || null,
    evidenciaFoto3Url: foto(2) ? urlsDeEvidencia.get(foto(2).id) || null : null,
    evidenciaVideo: video?.originalName || null,
    evidenciaVideoUrl: video ? urlsDeEvidencia.get(video.id) || null : null,
    historial: historial(i),
  }
}

// Los adjuntos son privados: se bajan con la sesión y se muestran desde una URL local
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
        /* sin permiso o archivo no disponible: se muestra solo el nombre */
      }
    }
  }
  return cambio
}

function reemplazar(lista) {
  cache = lista
  emitir()
  cargarEvidencias(lista).then((cambio) => {
    if (cambio) {
      cache = cache.map((item) => conRaw(item.__raw))
      emitir()
    }
  })
}

const conRaw = (raw) => ({ ...mapIncident(raw), __raw: raw })

const errorDe = (error) => {
  const mensaje = new Error(error?.message || 'No fue posible completar la operación.')
  mensaje.status = error?.status
  return mensaje
}

export const incidentManagementService = {
  eventName: INCIDENT_EVENT,

  async refresh() {
    const lista = (await incidentService.forStaff()).map(conRaw)
    reemplazar(lista)
    return this.list()
  },

  async refreshMine() {
    const lista = (await incidentService.mine()).map(conRaw)
    reemplazar(lista)
    return this.list()
  },

  list() {
    return cache.map(({ __raw, ...incident }) => ({ ...incident })) // eslint-disable-line no-unused-vars
  },

  // El servidor ya limita la lista a la sucursal del encargado
  listForUser() {
    return this.list()
  },

  getById(id) {
    return this.list().find((r) => r.id === id || r.codigo === id) || null
  },

  /** Detalle con la conversación y los adjuntos (el listado no los trae). */
  async loadDetail(id) {
    try {
      const raw = await incidentService.detail(id)
      const item = conRaw(raw)
      cache = cache.some((r) => r.id === id) ? cache.map((r) => (r.id === id ? item : r)) : [item, ...cache]
      await cargarEvidencias([{ id: raw.id, adjuntos: [
        ...(raw.attachments || []),
        ...((raw.timeline || []).flatMap((entry) => entry.attachments || [])),
      ] }])
      const refrescado = conRaw(raw)
      cache = cache.map((r) => (r.id === id ? refrescado : r))
      emitir()
      const { __raw, ...limpio } = refrescado // eslint-disable-line no-unused-vars
      return limpio
    } catch (error) {
      throw errorDe(error)
    }
  },

  /** Crea un reporte (cliente o personal); los archivos de evidencia se suben al servidor. */
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
      const item = conRaw(creada)
      cache = [item, ...cache.filter((r) => r.id !== item.id)]
      emitir()
      cargarEvidencias([{ id: creada.id, adjuntos: creada.attachments || [] }])
      const { __raw, ...limpio } = item // eslint-disable-line no-unused-vars
      return limpio
    } catch (error) {
      throw errorDe(error)
    }
  },

  /** Cambia el estado con una nota o responde al cliente; el servidor guarda, notifica y audita. */
  async updateStatusAndRespond(id, { nuevoEstado, respuestaTexto }) {
    try {
      const actual = this.getById(id)
      const destino = ESTADO_API[nuevoEstado] || actual?.estadoCodigo
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
      emitir()
      const { __raw, ...limpio } = item // eslint-disable-line no-unused-vars
      return limpio
    } catch (error) {
      throw errorDe(error)
    }
  },

  async removeIncident(id) {
    try {
      await incidentService.remove(id)
      cache = cache.filter((r) => r.id !== id)
      emitir()
      return true
    } catch (error) {
      if (error?.status === 403) throw new Error('clientReportCannotBeDeleted')
      if (error?.status === 409) throw new Error('onlyReceivedOwnReportsCanBeDeleted')
      throw errorDe(error)
    }
  },
}
