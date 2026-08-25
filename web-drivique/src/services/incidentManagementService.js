// src/services/incidentManagementService.js
import { accessAuditService } from './accessAuditService'
import { vehicleManagementService } from './vehicleManagementService'

const STORAGE_KEY = 'drivique_user_reports'
const NOTIFS_KEY = 'drivique_user_notifications'

const INITIAL_INCIDENTS = [
  {
    id: 'REP-9102',
    codigo: 'REP-9102',
    tipoIncidenciaId: 'averia_mecanica',
    tipoIncidenciaNombre: 'Avería mecánica',
    vehiculoId: 1,
    vehiculo: 'Toyota Prado VX',
    placa: 'KLS-849',
    sucursal: 'Alquiler Neiva - Centro',
    vehiculoImagen: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    descripcion: 'Se encendió el testigo de revisión de motor en el tablero durante el trayecto a Neiva.',
    contactoNombre: 'Carlos Mendoza',
    contactoTelefono: '+57 314 478 9702',
    contactoEmail: 'carlos.mendoza@email.com',
    origen: 'cliente', // 'cliente' | 'administrador'
    prioridad: 'urgente', // 'urgente' (<24h) | 'alta' (24-48h) | 'media' (48-72h) | 'baja' (>72h)
    tiempoEstimado: '2 a 4 horas',
    estado: 'en_revision', // 'recibido' | 'en_revision' | 'en_reparacion' | 'resuelto' | 'rechazado'
    fechaIso: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    evidenciasCount: 2,
    historial: [
      {
        estadoKey: 'recibido',
        titulo: 'Reporte Recibido',
        descripcion: 'Reporte de falla mecánica registrado por el cliente.',
        autor: 'Carlos Mendoza',
        hora: '11:20 AM',
        fecha: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
        color: '#2563eb',
      },
      {
        estadoKey: 'en_revision',
        titulo: 'En revisión técnica',
        descripcion: 'Asignado al taller central autorizado para evaluación diagnóstica.',
        autor: 'Administrador Drivique',
        hora: '11:45 AM',
        fecha: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
        color: '#d97706',
      },
    ],
  },
  {
    id: 'REP-8401',
    codigo: 'REP-8401',
    tipoIncidenciaId: 'limpieza_estetica',
    tipoIncidenciaNombre: 'Limpieza / Estética',
    vehiculoId: 2,
    vehiculo: 'Chevrolet Spark GT',
    placa: 'HGF-123',
    sucursal: 'Alamo Bogotá - Aeropuerto',
    vehiculoImagen: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    descripcion: 'El interior del vehículo requiere desinfección y limpieza profunda en la tapicería trasera.',
    contactoNombre: 'Ana María Gómez',
    contactoTelefono: '+57 311 589 2041',
    contactoEmail: 'ana.gomez@email.com',
    origen: 'cliente',
    prioridad: 'media',
    tiempoEstimado: '12 a 24 horas',
    estado: 'resuelto',
    fechaIso: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    evidenciasCount: 1,
    historial: [
      {
        estadoKey: 'recibido',
        titulo: 'Reporte Recibido',
        descripcion: 'Solicitud de aseo especial en entrega.',
        autor: 'Ana María Gómez',
        hora: '09:00 AM',
        fecha: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
        color: '#2563eb',
      },
      {
        estadoKey: 'resuelto',
        titulo: 'Incidencia Resuelta',
        descripcion: 'Se realizó detallado completo y lavado en seco de tapicería.',
        autor: 'Supervisora Bogotá',
        hora: '02:15 PM',
        fecha: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
        color: '#16a34a',
      },
    ],
  },
  {
    id: 'REP-7730',
    codigo: 'REP-7730',
    tipoIncidenciaId: 'falla_electrica',
    tipoIncidenciaNombre: 'Falla Eléctrica / Batería',
    vehiculoId: 3,
    vehiculo: 'Renault Duster 4x4',
    placa: 'MXP-451',
    sucursal: 'Alamo Medellín Poblado',
    vehiculoImagen: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    descripcion: 'Falla en alternador detectada durante inspección de salida en bahía de entrega.',
    contactoNombre: 'Encargado Medellín',
    contactoTelefono: '+57 310 106 2006',
    contactoEmail: 'encargado.alamo_medellin_poblado@drivique.com',
    origen: 'administrador',
    prioridad: 'urgente',
    tiempoEstimado: '2 a 6 horas',
    estado: 'recibido',
    fechaIso: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    evidenciasCount: 3,
    historial: [
      {
        estadoKey: 'recibido',
        titulo: 'Reporte Interno Creado',
        descripcion: 'Reporte generado preventivamente por el encargado de sucursal.',
        autor: 'Encargado Medellín',
        hora: '10:00 AM',
        fecha: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
        color: '#2563eb',
      },
    ],
  },
  {
    id: 'REP-6521',
    codigo: 'REP-6521',
    tipoIncidenciaId: 'pinchazo_neumatico',
    tipoIncidenciaNombre: 'Pinchazo / Neumático',
    vehiculoId: 4,
    vehiculo: 'Mazda CX-5 Grand Touring',
    placa: 'TBR-902',
    sucursal: 'Alamo Cali - Ciudad',
    vehiculoImagen: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
    descripcion: 'Pérdida de presión constante en neumático delantero derecho.',
    contactoNombre: 'Roberto Silva',
    contactoTelefono: '+57 310 892 1104',
    contactoEmail: 'roberto.silva@email.com',
    origen: 'cliente',
    prioridad: 'alta',
    tiempoEstimado: '1 a 3 horas',
    estado: 'en_reparacion',
    fechaIso: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    evidenciasCount: 1,
    historial: [
      {
        estadoKey: 'recibido',
        titulo: 'Reporte Recibido',
        descripcion: 'Solicitud de asistencia con neumático de repuesto.',
        autor: 'Roberto Silva',
        hora: '08:30 AM',
        fecha: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
        color: '#2563eb',
      },
      {
        estadoKey: 'en_reparacion',
        titulo: 'En reparación',
        descripcion: 'Vehículo ingresado a vulcanizadora autorizada.',
        autor: 'Encargado Cali',
        hora: '09:45 AM',
        fecha: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
        color: '#9333ea',
      },
    ],
  },
]

function readIncidents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    let list = []
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INCIDENTS))
      list = INITIAL_INCIDENTS
    } else {
      const parsed = JSON.parse(raw)
      list = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_INCIDENTS
    }

    const vehiclesList = vehicleManagementService.list()
    return list.map(r => {
      if (!r.sucursal) {
        const matchingVehicle = vehiclesList.find(
          v => (v.placa && r.placa && v.placa.replace(/\s|-/g, '').toLowerCase() === r.placa.replace(/\s|-/g, '').toLowerCase()) || 
               (v.nombre && r.vehiculo && v.nombre.toLowerCase().includes(r.vehiculo.toLowerCase()))
        );
        r.sucursal = matchingVehicle ? matchingVehicle.sucursal : 'Neiva';
      }
      return r;
    });
  } catch {
    return INITIAL_INCIDENTS
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
    const isManager =
      currentUser?.rol === 'encargado' ||
      currentUser?.rol === 'encargado_sucursal' ||
      currentUser?.rol === 'branch_manager'

    if (!isManager) return all

    const userBranch = (currentUser?.sucursal || currentUser?.sucursalAsignada || currentUser?.sucursalId || '').toLowerCase()
    if (!userBranch) return all

    return all.filter((r) => {
      const repBranch = (r.sucursal || '').toLowerCase()
      return repBranch.includes(userBranch) || userBranch.includes(repBranch)
    })
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

    const newReport = {
      id: newCode,
      codigo: newCode,
      tipoIncidenciaId: data.tipoIncidenciaId || 'mantenimiento_general',
      tipoIncidenciaNombre: data.tipoIncidenciaNombre || 'Incidencia de Flota',
      vehiculoId: data.vehiculoId || null,
      vehiculo: vehicleObj ? vehicleObj.nombre : data.vehiculo || 'Vehículo de la Flota',
      placa: vehicleObj ? vehicleObj.placa : data.placa || 'N/A',
      sucursal: vehicleObj ? vehicleObj.sucursal : data.sucursal || adminUser?.sucursal || 'Neiva',
      vehiculoImagen: vehicleObj?.imagenes?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
      descripcion: data.descripcion || 'Incidencia reportada internamente.',
      contactoNombre: adminUser?.nombre || 'Administración Drivique',
      contactoTelefono: adminUser?.telefono || '+57 300 000 0000',
      contactoEmail: adminUser?.correo || 'admin@drivique.com',
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
          color: '#2563eb',
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
