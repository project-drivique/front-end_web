// src/services/incidentManagementService.js
import { accessAuditService } from './accessAuditService'
import { vehicleManagementService } from './vehicleManagementService'

const STORAGE_KEY = 'drivique_user_reports'
const NOTIFS_KEY = 'drivique_user_notifications'
const STORAGE_SCHEMA_KEY = 'drivique_user_reports_schema'
const STORAGE_SCHEMA = '2'
const LEGACY_INCIDENT_IDS = new Set(['REP-9102', 'REP-8401', 'REP-7730', 'REP-6521'])

const normalizeBranch = (value) => String(value || '').trim().toLocaleLowerCase()
const isBranchManager = (user) => ['encargado', 'encargado_sucursal', 'branch_manager'].includes(user?.rol)
const assignedBranch = (user) => user?.sucursalId || user?.sucursal || user?.sucursalAsignada || ''

function assertIncidentScope(user, branch) {
  if (!isBranchManager(user)) return
  if (!assignedBranch(user) || normalizeBranch(branch) !== normalizeBranch(assignedBranch(user))) {
    throw new Error('invalidBranch')
  }
}


function readIncidents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    let list = Array.isArray(parsed) ? parsed : []
    if (localStorage.getItem(STORAGE_SCHEMA_KEY) !== STORAGE_SCHEMA) {
      list = list.filter((incident) => !LEGACY_INCIDENT_IDS.has(String(incident?.id || incident?.codigo || '')))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      localStorage.setItem(STORAGE_SCHEMA_KEY, STORAGE_SCHEMA)
    }

    const vehiclesList = vehicleManagementService.list()
    return list.map(r => {
      if (r.sucursal) return { ...r }
      const matchingVehicle = vehiclesList.find(
          v => (v.placa && r.placa && v.placa.replace(/\s|-/g, '').toLowerCase() === r.placa.replace(/\s|-/g, '').toLowerCase()) || 
               (v.nombre && r.vehiculo && v.nombre.toLowerCase().includes(r.vehiculo.toLowerCase()))
        )
      return { ...r, sucursal: matchingVehicle?.sucursal || '' }
    });
  } catch {
    return []
  }
}

function writeIncidents(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Error guardando reportes de incidencias:', err)
  }
}

function addSystemNotification(titulo, mensaje) {
  try {
    const rawNotifs = localStorage.getItem(NOTIFS_KEY)
    const existing = rawNotifs ? JSON.parse(rawNotifs) : []
    const newNotif = {
      id: `notif-${Date.now()}`,
      tipo: 'sistema',
      titulo,
      mensaje,
      fecha: new Date().toISOString(),
      leida: false,
    }
    if (Array.isArray(existing)) {
      existing.unshift(newNotif)
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(existing))
    }
  } catch (e) {
    console.error('Error guardando notificación:', e)
  }
}

export const incidentManagementService = {
  list() {
    return readIncidents()
  },

  listForUser(currentUser) {
    const all = readIncidents()
    if (!isBranchManager(currentUser)) return all

    const userBranch = normalizeBranch(assignedBranch(currentUser))
    if (!userBranch) return []

    return all.filter((r) => normalizeBranch(r.sucursal) === userBranch)
  },

  getById(id) {
    return readIncidents().find((r) => r.id === id || r.codigo === id) || null
  },

  createIncident(data, adminUser) {
    const numRandom = Math.floor(1000 + Math.random() * 9000)
    const newCode = `REP-${numRandom}`

    // Obtener información del vehículo seleccionado si aplica
    let vehicleObj = null
    if (data.vehiculoId) {
      vehicleObj = vehicleManagementService.getById(data.vehiculoId)
    }
    const reportBranch = vehicleObj?.sucursal || data.sucursal || assignedBranch(adminUser)
    assertIncidentScope(adminUser, reportBranch)

    const newReport = {
      id: newCode,
      codigo: newCode,
      tipoIncidenciaId: data.tipoIncidenciaId || 'mantenimiento_general',
      tipoIncidenciaNombre: data.tipoIncidenciaNombre || 'Incidencia de Flota',
      vehiculoId: data.vehiculoId || null,
      vehiculo: vehicleObj?.nombre || data.vehiculo || '',
      placa: vehicleObj?.placa || data.placa || '',
      sucursal: reportBranch,
      vehiculoImagen: vehicleObj?.imagenes?.[0] || '',
      descripcion: data.descripcion || '',
      contactoNombre: adminUser?.nombre || '',
      contactoTelefono: adminUser?.telefono || '',
      contactoEmail: adminUser?.correo || '',
      origen: 'administrador',
      prioridad: data.prioridad || 'urgente',
      tiempoEstimado: data.tiempoEstimado || '2 a 6 horas',
      estado: 'recibido',
      fechaIso: new Date().toISOString(),
      evidenciasCount: data.evidenciasCount || 0,
      historial: [
        {
          estadoKey: 'recibido',
          titulo: 'Reporte Interno Creado',
          descripcion: data.descripcion || 'Reporte generado directamente por el administrador/encargado.',
          autor: adminUser?.nombre || 'Administrador',
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fecha: new Date().toISOString(),
          color: 'var(--brand-primary)',
        },
      ],
    }

    const incidents = readIncidents()
    incidents.unshift(newReport)
    writeIncidents(incidents)

    accessAuditService.record({
      correo: adminUser?.correo || 'admin@drivique.com',
      rol: adminUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `Creó el reporte interno de incidencia ${newReport.codigo} para el vehículo ${newReport.vehiculo} (${newReport.placa})`,
    })

    return newReport
  },

  updateStatusAndRespond(id, { nuevoEstado, respuestaTexto }, adminUser) {
    const incidents = readIncidents()
    const index = incidents.findIndex((r) => r.id === id || r.codigo === id)
    if (index < 0) throw new Error('reportNotFound')

    const current = incidents[index]
    assertIncidentScope(adminUser, current.sucursal)
    const updatedState = nuevoEstado || current.estado

    const responseEntry = {
      estadoKey: updatedState,
      titulo: `Actualización de Estado: ${updatedState.toUpperCase()}`,
      descripcion: respuestaTexto || `Estado del reporte actualizado a "${updatedState}".`,
      autor: adminUser?.nombre || 'Administrador Drivique',
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fecha: new Date().toISOString(),
      color: updatedState === 'resuelto' ? '#16a34a' : updatedState === 'en_reparacion' ? '#9333ea' : '#d97706',
    }

    incidents[index] = {
      ...current,
      estado: updatedState,
      historial: [...(current.historial || []), responseEntry],
    }

    writeIncidents(incidents)

    // Enviar notificación interna en el sistema
    addSystemNotification(
      `🔔 Respuesta al Reporte ${current.codigo}`,
      `Estimado(a) ${current.contactoNombre}: Tu reporte sobre el vehículo ${current.vehiculo} (${current.placa}) cambió a estado "${updatedState.toUpperCase()}". Mensaje: "${respuestaTexto || 'Se está dando atención a tu caso.'}"`
    )

    accessAuditService.record({
      correo: adminUser?.correo || 'admin@drivique.com',
      rol: adminUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `Respondió y actualizó el estado del reporte ${current.codigo} a ${updatedState}`,
    })

    return incidents[index]
  },

  removeIncident(id, adminUser) {
    const incident = this.getById(id)
    if (!incident) throw new Error('reportNotFound')
    assertIncidentScope(adminUser, incident.sucursal)

    // VALIDACIÓN 1: Reportes de clientes NO se eliminan
    if (incident.origen === 'cliente') {
      throw new Error('clientReportCannotBeDeleted')
    }

    // VALIDACIÓN 2: Reportes propios solo se eliminan si están en estado "recibido"
    if (incident.origen === 'administrador' && incident.estado !== 'recibido') {
      throw new Error('onlyReceivedOwnReportsCanBeDeleted')
    }

    const filtered = readIncidents().filter((r) => r.id !== id && r.codigo !== id)
    writeIncidents(filtered)

    accessAuditService.record({
      correo: adminUser?.correo || 'admin@drivique.com',
      rol: adminUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `Eliminó el reporte propio de incidencia ${incident.codigo} (${incident.vehiculo})`,
    })

    return true
  },
}
