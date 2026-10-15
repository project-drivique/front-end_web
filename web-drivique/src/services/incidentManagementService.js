import { incidentService } from './incidentService'

let cache = []

const ESTADO = { OPEN: 'recibido', IN_REVIEW: 'en_revision', RESOLVED: 'resuelto', CLOSED: 'cerrado' }
const GRAVEDAD = { CRITICAL: 'alta', HIGH: 'alta', MEDIUM: 'media', LOW: 'baja' }

const mapear = (i) => ({
  id: i.id,
  codigo: i.code,
  titulo: i.subject,
  descripcion: i.description,
  estado: ESTADO[i.status] || i.status,
  estadoCodigo: i.status,
  gravedad: GRAVEDAD[i.priority] || 'media',
  prioridad: i.priority,
  categoria: i.category,
  sucursal: i.branchName || '',
  vehiculoPlaca: i.vehiclePlate || '',
  vehiculoModelo: i.vehicleModel || '',
  reservaCodigo: i.reservationCode || '',
  fechaCreacion: i.createdAt,
  slaVencido: i.slaBreached,
})

// Lectura de incidencias para el tablero y los reportes; la gestión se hace en incidentService.
export const incidentManagementService = {
  async refresh() {
    cache = (await incidentService.forStaff()).map(mapear)
    return this.list()
  },

  list() {
    return cache.map((incident) => ({ ...incident }))
  },

  listForUser() {
    return this.list()
  },
}
