// src/services/incidentManagementService.js
//
// Incidencias de soporte: gestión y validación de reportes de clientes e internos
// para Administrador General (Supervisión y Auditoría) y Encargado de Sucursal (Validación Operativa).
import { incidentService } from './incidentService'
import { TIPOS_INCIDENCIA } from '../modules/support/data/supportCatalog'

const INCIDENT_EVENT = 'drivique:incidents-updated'
const STORAGE_KEY = 'drivique_incidents_v2'

// Estados que ve el usuario <-> estados del servidor
const ESTADO = { OPEN: 'recibido', IN_REVIEW: 'atendiendo', RESOLVED: 'resuelto', CLOSED: 'rechazado' }
const ESTADO_API = { recibido: 'OPEN', atendiendo: 'IN_REVIEW', en_revision: 'IN_REVIEW', en_reparacion: 'IN_REVIEW', resuelto: 'RESOLVED', rechazado: 'CLOSED' }
const PRIORIDAD = { LOW: 'baja', MEDIUM: 'media', HIGH: 'alta', CRITICAL: 'urgente' }
const GRAVEDAD = { CRITICAL: 'alta', HIGH: 'alta', MEDIUM: 'media', LOW: 'baja' }
const COLOR_ESTADO = { OPEN: '#d97706', IN_REVIEW: '#0284c7', RESOLVED: '#16a34a', CLOSED: '#991b1b' }

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

// ─── REPOSITORIO DE REPORTES DE CLIENTES INICIALES (DEMO / FALLBACK) ────────
const INITIAL_SEED_INCIDENTS = [
  {
    id: 'inc-seed-001',
    codigo: 'INC-2026-0041',
    codigoReserva: 'RES-2026-0842',
    tipoIncidenciaId: 'choque',
    tipoIncidenciaNombre: 'Choque / Colisión',
    titulo: 'Impacto leve en parachoques trasero izquierdo en Calle 26',
    descripcion: 'Durante el retorno hacia el aeropuerto un vehículo particular nos impactó levemente el parachoques trasero izquierdo en la Calle 26. No hay lesionados, pero el parachoques quedó desalineado y la luz de freno posterior izquierda está rota. Adjunto fotos del golpe y del vehículo involucrado.',
    vehiculoId: 'v-corolla-bog',
    vehiculo: 'Toyota Corolla Híbrido 2024',
    placa: 'FRT-892',
    vehiculoPlaca: 'FRT-892',
    vehiculoModelo: 'Toyota Corolla Híbrido 2024',
    sucursal: 'Alamo Bogotá - Aeropuerto El Dorado',
    contactoNombre: 'Carlos Andrés Mendoza',
    contactoEmail: 'carlos.mendoza@gmail.com',
    contactoTelefono: '+57 312 458 9912',
    origen: 'cliente',
    estado: 'recibido',
    estadoCodigo: 'OPEN',
    prioridad: 'urgente',
    gravedad: 'alta',
    categoria: 'VEHICLE',
    tiempoEstimado: '2 a 4 horas',
    slaVencido: false,
    fechaIso: '2026-10-17T09:15:00.000Z',
    fechaCreacion: '2026-10-17T09:15:00.000Z',
    fechaRegistro: '2026-10-17T09:15:00.000Z',
    evidenciasCount: 3,
    adjuntos: [],
    evidenciaFoto1: 'dano_parachoques_trasero.jpg',
    evidenciaFoto1Url: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80',
    evidenciaFoto2: 'impacto_lateral_izquierdo.jpg',
    evidenciaFoto2Url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
    evidenciaFoto3: 'croquis_calle26.jpg',
    evidenciaFoto3Url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
    evidenciaVideo: 'inspeccion_dano_trasero.mp4',
    evidenciaVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    historial: [
      {
        autor: 'Carlos Andrés Mendoza (Cliente)',
        hora: '09:15',
        fecha: '2026-10-17T09:15:00.000Z',
        titulo: 'Reporte Creado por el Cliente',
        descripcion: 'Reporte de choque menor registrado desde la aplicación móvil con 3 fotografías y 1 video adjuntos.',
        color: 'var(--brand-primary)',
      },
    ],
  },
  {
    id: 'inc-seed-002',
    codigo: 'INC-2026-0038',
    codigoReserva: 'RES-2026-0419',
    tipoIncidenciaId: 'averia_mecanica',
    tipoIncidenciaNombre: 'Avería Mecánica',
    titulo: 'Pérdida de potencia y testigo Check Engine en subida Las Palmas',
    descripcion: 'El testigo de Check Engine comenzó a parpadear en el tablero al subir hacia Las Palmas y el vehículo perdió potencia repentinamente. Nos detuvimos a un costado seguro de la vía. Requerimos asistencia de taller o vehículo de reemplazo.',
    vehiculoId: 'v-cx30-med',
    vehiculo: 'Mazda CX-30 Grand Touring 2023',
    placa: 'LKM-341',
    vehiculoPlaca: 'LKM-341',
    vehiculoModelo: 'Mazda CX-30 Grand Touring 2023',
    sucursal: 'Alamo Medellín - El Poblado',
    contactoNombre: 'Laura Marcela Gómez',
    contactoEmail: 'laura.gomez@hotmail.com',
    contactoTelefono: '+57 320 871 4455',
    origen: 'cliente',
    estado: 'atendiendo',
    estadoCodigo: 'IN_REVIEW',
    prioridad: 'alta',
    gravedad: 'alta',
    categoria: 'VEHICLE',
    tiempoEstimado: '2 a 4 horas',
    slaVencido: false,
    fechaIso: '2026-10-16T15:30:00.000Z',
    fechaCreacion: '2026-10-16T15:30:00.000Z',
    fechaRegistro: '2026-10-16T15:30:00.000Z',
    evidenciasCount: 2,
    adjuntos: [],
    evidenciaFoto1: 'testigo_tablero_check_engine.jpg',
    evidenciaFoto1Url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    evidenciaFoto2: 'ubicacion_via_las_palmas.jpg',
    evidenciaFoto2Url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    evidenciaVideo: null,
    evidenciaVideoUrl: null,
    historial: [
      {
        autor: 'Laura Marcela Gómez (Cliente)',
        hora: '15:30',
        fecha: '2026-10-16T15:30:00.000Z',
        titulo: 'Reporte Creado por el Cliente',
        descripcion: 'Reporte registrado solicitando asistencia técnica en ruta.',
        color: 'var(--brand-primary)',
      },
      {
        autor: 'Encargado Sede El Poblado',
        hora: '16:05',
        fecha: '2026-10-16T16:05:00.000Z',
        titulo: 'Validación Técnica de Sede',
        descripcion: 'Caso validado con póliza de asistencia Sura. Se coordinó grúa de plataforma y técnico mecánico para diagnóstico en sitio.',
        color: '#0284c7',
      },
    ],
  },
  {
    id: 'inc-seed-003',
    codigo: 'INC-2026-0029',
    codigoReserva: 'RES-2026-0911',
    tipoIncidenciaId: 'pinchazo',
    tipoIncidenciaNombre: 'Pinchazo',
    titulo: 'Pinchazo neumático delantero derecho en vía Palmira',
    descripcion: 'Pinchazo en el neumático delantero derecho en la salida hacia Palmira. Se utilizó la llanta de repuesto provista en el baúl para continuar el trayecto hasta centro autorizado.',
    vehiculoId: 'v-duster-cali',
    vehiculo: 'Renault Duster 4x4 2024',
    placa: 'QWE-765',
    vehiculoPlaca: 'QWE-765',
    vehiculoModelo: 'Renault Duster 4x4 2024',
    sucursal: 'Alamo Cali - Granada',
    contactoNombre: 'Juan David Echeverry',
    contactoEmail: 'juand.echeverry@yahoo.com',
    contactoTelefono: '+57 318 652 1109',
    origen: 'cliente',
    estado: 'resuelto',
    estadoCodigo: 'RESOLVED',
    prioridad: 'media',
    gravedad: 'media',
    categoria: 'VEHICLE',
    tiempoEstimado: '1 a 2 horas',
    slaVencido: false,
    fechaIso: '2026-10-15T11:20:00.000Z',
    fechaCreacion: '2026-10-15T11:20:00.000Z',
    fechaRegistro: '2026-10-15T11:20:00.000Z',
    evidenciasCount: 2,
    adjuntos: [],
    evidenciaFoto1: 'llanta_delantera_pinchada.jpg',
    evidenciaFoto1Url: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=1200&q=80',
    evidenciaFoto2: 'reemplazo_montado.jpg',
    evidenciaFoto2Url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
    evidenciaVideo: null,
    evidenciaVideoUrl: null,
    historial: [
      {
        autor: 'Juan David Echeverry (Cliente)',
        hora: '11:20',
        fecha: '2026-10-15T11:20:00.000Z',
        titulo: 'Reporte Creado por el Cliente',
        descripcion: 'Reporte de neumático pinchado en carretera.',
        color: 'var(--brand-primary)',
      },
      {
        autor: 'Encargado Sede Granada',
        hora: '11:45',
        fecha: '2026-10-15T11:45:00.000Z',
        titulo: 'Validación Técnica de Sede',
        descripcion: 'Reporte verificado. Se autorizó cambio y vulcanización en centro de servicio autorizado.',
        color: '#0284c7',
      },
      {
        autor: 'Encargado Sede Granada',
        hora: '13:10',
        fecha: '2026-10-15T13:10:00.000Z',
        titulo: 'Cambio de Estado — Resuelto',
        descripcion: 'Factura de vulcanización reembolsada al cliente. Vehículo opera con normalidad. Caso resuelto.',
        color: '#16a34a',
      },
    ],
  },
  {
    id: 'inc-seed-004',
    codigo: 'INC-2026-0017',
    codigoReserva: 'RES-2026-0155',
    tipoIncidenciaId: 'bateria_descargada',
    tipoIncidenciaNombre: 'Batería Descargada',
    titulo: 'Vehículo no enciende tras estacionamiento en CC Buenavista',
    descripcion: 'El vehículo no enciende tras dejarlo estacionado dos horas con las luces de cortesía encendidas en el Centro Comercial Buenavista. El motor de arranque no responde.',
    vehiculoId: 'v-tracker-baq',
    vehiculo: 'Chevrolet Tracker Turbo 2023',
    placa: 'ZXC-908',
    vehiculoPlaca: 'ZXC-908',
    vehiculoModelo: 'Chevrolet Tracker Turbo 2023',
    sucursal: 'Alamo Barranquilla - Prado',
    contactoNombre: 'Sofía Valencia Restrepo',
    contactoEmail: 'sofia.valencia@gmail.com',
    contactoTelefono: '+57 315 789 2233',
    origen: 'cliente',
    estado: 'recibido',
    estadoCodigo: 'OPEN',
    prioridad: 'alta',
    gravedad: 'alta',
    categoria: 'VEHICLE',
    tiempoEstimado: '1 a 2 horas',
    slaVencido: false,
    fechaIso: '2026-10-17T08:00:00.000Z',
    fechaCreacion: '2026-10-17T08:00:00.000Z',
    fechaRegistro: '2026-10-17T08:00:00.000Z',
    evidenciasCount: 1,
    adjuntos: [],
    evidenciaFoto1: 'panel_sin_bateria.jpg',
    evidenciaFoto1Url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    evidenciaFoto2: null,
    evidenciaFoto2Url: null,
    evidenciaFoto3: null,
    evidenciaFoto3Url: null,
    evidenciaVideo: null,
    evidenciaVideoUrl: null,
    historial: [
      {
        autor: 'Sofía Valencia Restrepo (Cliente)',
        hora: '08:00',
        fecha: '2026-10-17T08:00:00.000Z',
        titulo: 'Reporte Creado por el Cliente',
        descripcion: 'Reporte registrado solicitando asistencia de carga de batería o puente eléctrico.',
        color: 'var(--brand-primary)',
      },
    ],
  },
  {
    id: 'inc-seed-005',
    codigo: 'INC-2026-0012',
    codigoReserva: 'RES-2026-0330',
    tipoIncidenciaId: 'falla_electrica',
    tipoIncidenciaNombre: 'Falla Eléctrica',
    titulo: 'Reclamo de climatización / aire acondicionado en Bocagrande',
    descripcion: 'El aire acondicionado no enfriaba lo suficiente al mediodía durante recorrido en Bocagrande.',
    vehiculoId: 'v-kicks-ctg',
    vehiculo: 'Nissan Kicks Exclusive 2024',
    placa: 'MNB-512',
    vehiculoPlaca: 'MNB-512',
    vehiculoModelo: 'Nissan Kicks Exclusive 2024',
    sucursal: 'Alamo Cartagena - Bocagrande',
    contactoNombre: 'Andrés Felipe Castro',
    contactoEmail: 'af.castro@gmail.com',
    contactoTelefono: '+57 301 234 5678',
    origen: 'cliente',
    estado: 'rechazado',
    estadoCodigo: 'CLOSED',
    prioridad: 'baja',
    gravedad: 'baja',
    categoria: 'VEHICLE',
    tiempoEstimado: '1 a 2 horas',
    slaVencido: false,
    fechaIso: '2026-10-14T14:10:00.000Z',
    fechaCreacion: '2026-10-14T14:10:00.000Z',
    fechaRegistro: '2026-10-14T14:10:00.000Z',
    evidenciasCount: 1,
    adjuntos: [],
    evidenciaFoto1: 'temperatura_tablero.jpg',
    evidenciaFoto1Url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    evidenciaFoto2: null,
    evidenciaFoto2Url: null,
    evidenciaFoto3: null,
    evidenciaFoto3Url: null,
    evidenciaVideo: null,
    evidenciaVideoUrl: null,
    historial: [
      {
        autor: 'Andrés Felipe Castro (Cliente)',
        hora: '14:10',
        fecha: '2026-10-14T14:10:00.000Z',
        titulo: 'Reporte Creado por el Cliente',
        descripcion: 'Reporte de climatización.',
        color: 'var(--brand-primary)',
      },
      {
        autor: 'Encargado Sede Bocagrande',
        hora: '15:00',
        fecha: '2026-10-14T15:00:00.000Z',
        titulo: 'Cambio de Estado — Rechazado / Desestimado',
        descripcion: 'Se verificó en sede: el botón de A/C estaba desactivado por el usuario. Al activarlo funcionó a 18°C. Reporte cerrado sin novedad técnica.',
        color: '#991b1b',
      },
    ],
  },
  {
    id: 'inc-seed-006',
    codigo: 'INC-2026-0050',
    codigoReserva: '',
    tipoIncidenciaId: 'mantenimiento',
    tipoIncidenciaNombre: 'Inspección Técnica Preventiva',
    titulo: 'Mantenimiento preventivo de 20.000 km e inspección de frenos',
    descripcion: 'Inspección de 20.000 km programada en taller autorizado. Cambio de pastillas de freno y rotación de llantas antes de asignación a nueva reserva.',
    vehiculoId: 'v-sportage-bog',
    vehiculo: 'Kia Sportage GT Line 2024',
    placa: 'ABC-123',
    vehiculoPlaca: 'ABC-123',
    vehiculoModelo: 'Kia Sportage GT Line 2024',
    sucursal: 'Alamo Bogotá - Aeropuerto El Dorado',
    contactoNombre: 'Encargado Sede Aeropuerto',
    contactoEmail: 'encargado.bogota@drivique.com',
    contactoTelefono: '+57 314 478 9702',
    origen: 'administrador',
    estado: 'recibido',
    estadoCodigo: 'OPEN',
    prioridad: 'media',
    gravedad: 'media',
    categoria: 'VEHICLE',
    tiempoEstimado: '2 a 4 horas',
    slaVencido: false,
    fechaIso: '2026-10-17T07:45:00.000Z',
    fechaCreacion: '2026-10-17T07:45:00.000Z',
    fechaRegistro: '2026-10-17T07:45:00.000Z',
    evidenciasCount: 0,
    adjuntos: [],
    evidenciaFoto1: null,
    evidenciaFoto1Url: null,
    evidenciaFoto2: null,
    evidenciaFoto2Url: null,
    evidenciaFoto3: null,
    evidenciaFoto3Url: null,
    evidenciaVideo: null,
    evidenciaVideoUrl: null,
    historial: [
      {
        autor: 'Encargado Sede Aeropuerto',
        hora: '07:45',
        fecha: '2026-10-17T07:45:00.000Z',
        titulo: 'Reporte Interno Creado',
        descripcion: 'Reporte generado internamente por el personal de patio para inspección de mantenimiento.',
        color: 'var(--brand-primary)',
      },
    ],
  },
]

function cargarStorage() {
  if (typeof window === 'undefined') return INITIAL_SEED_INCIDENTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_SEED_INCIDENTS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SEED_INCIDENTS
  } catch {
    return INITIAL_SEED_INCIDENTS
  }
}

function guardarStorage(lista) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista))
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
    contactoTelefono: i.contactoTelefono || '',
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
  const mensaje = new Error(error?.message || 'No fue posible completar la operación.')
  mensaje.status = error?.status
  return mensaje
}

export const incidentManagementService = {
  eventName: INCIDENT_EVENT,

  async refresh() {
    try {
      const serverList = await incidentService.forStaff()
      if (Array.isArray(serverList) && serverList.length > 0) {
        const mapped = serverList.map(conRaw)
        // Combinamos lo del servidor con seed preservado que no esté en el server
        const serverCodes = new Set(mapped.map((r) => r.codigo || r.id))
        const extras = cache.filter((r) => !serverCodes.has(r.codigo) && !serverCodes.has(r.id))
        reemplazar([...mapped, ...extras])
        return this.list()
      }
    } catch {
      /* Si falla el endpoint o no tiene conexión, usamos cache/seed */
    }
    if (cache.length === 0) {
      reemplazar(INITIAL_SEED_INCIDENTS)
    }
    return this.list()
  },

  async refreshMine() {
    try {
      const serverList = await incidentService.mine()
      if (Array.isArray(serverList) && serverList.length > 0) {
        reemplazar(serverList.map(conRaw))
        return this.list()
      }
    } catch {
      /* fallback */
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
      throw errorDe({ message: 'No se encontró el reporte solicitado.' })
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
      const item = conRaw(creada)
      cache = [item, ...cache.filter((r) => r.id !== item.id)]
      guardarStorage(cache)
      emitir()
      cargarEvidencias([{ id: creada.id, adjuntos: creada.attachments || [] }])
      const { __raw, ...limpio } = item // eslint-disable-line no-unused-vars
      return limpio
    } catch {
      // Fallback local creation
      const prefix = 'INC-' + new Date().getFullYear() + '-'
      const code = prefix + String(Math.floor(1000 + Math.random() * 9000))
      const nowIso = new Date().toISOString()
      const fallbackItem = {
        id: 'inc-local-' + Date.now(),
        codigo: code,
        codigoReserva: data.codigoReserva || '',
        tipoIncidenciaId: tipoId,
        tipoIncidenciaNombre: nombre,
        titulo: nombre,
        descripcion: data.descripcion,
        vehiculoId: data.vehiculoId || null,
        vehiculo: data.vehiculo || 'Vehículo asignado',
        placa: data.placa || '',
        sucursal: data.sucursal || user?.sucursal || 'Alamo Bogotá - Aeropuerto El Dorado',
        contactoNombre: user?.nombre || 'Usuario Registrado',
        contactoEmail: user?.correo || 'soporte@drivique.com',
        contactoTelefono: user?.telefono || '+57 300 0000000',
        origen: user?.rol === 'administrador' ? 'administrador' : 'cliente',
        estado: 'recibido',
        estadoCodigo: 'OPEN',
        prioridad: data.prioridad || 'media',
        gravedad: 'media',
        tiempoEstimado: data.tiempoEstimado || '2 a 4 horas',
        fechaIso: nowIso,
        fechaCreacion: nowIso,
        fechaRegistro: nowIso,
        evidenciasCount: files.length,
        adjuntos: [],
        evidenciaFoto1: files[0]?.name || null,
        evidenciaFoto1Url: files[0] ? URL.createObjectURL(files[0]) : null,
        evidenciaFoto2: files[1]?.name || null,
        evidenciaFoto2Url: files[1] ? URL.createObjectURL(files[1]) : null,
        evidenciaFoto3: files[2]?.name || null,
        evidenciaFoto3Url: files[2] ? URL.createObjectURL(files[2]) : null,
        historial: [
          {
            autor: user?.nombre || 'Cliente',
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            fecha: nowIso,
            titulo: 'Reporte Creado',
            descripcion: data.descripcion,
            color: 'var(--brand-primary)',
          },
        ],
      }
      cache = [fallbackItem, ...cache]
      guardarStorage(cache)
      emitir()
      return fallbackItem
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
          ? 'Validado y Resuelto por Sucursal'
          : nuevoEstado === 'rechazado'
          ? 'Reporte Desestimado / Cerrado'
          : nuevoEstado === 'atendiendo'
          ? 'Validación Técnica y Atención en Curso'
          : 'Actualización de Estado'

      const nuevoHistorial = [
        ...(actual.historial || []),
        {
          autor: user?.nombre ? `${user.nombre} (${actual.sucursal || 'Sede'})` : 'Encargado de Sucursal',
          hora: horaStr,
          fecha: nowIso,
          titulo: statusTitle,
          descripcion:
            respuestaTexto ||
            `El estado del reporte ha sido actualizado a ${nuevoEstado.toUpperCase()} tras validación técnica en sede.`,
          color: nuevoEstado === 'resuelto' ? '#16a34a' : nuevoEstado === 'rechazado' ? '#dc2626' : '#0284c7',
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
      if (error?.status === 403) throw new Error('clientReportCannotBeDeleted')
      if (error?.status === 409) throw new Error('onlyReceivedOwnReportsCanBeDeleted')
    }
    cache = cache.filter((r) => r.id !== id)
    guardarStorage(cache)
    emitir()
    return true
  },
}
