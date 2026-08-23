import { accessAuditService } from './accessAuditService'

const STORAGE_KEY = 'drivique_reservas'

const INITIAL_RESERVATIONS = [
  {
    id: 'RES-901',
    codigo: 'RES-901',
    clienteNombre: 'Carlos Mendoza',
    clienteCorreo: 'carlos.mendoza@email.com',
    clienteTelefono: '+57 314 478 9702',
    vehiculoId: 'v1',
    vehiculoNombre: 'Toyota Prado VX',
    vehiculoPlaca: 'KLS-849',
    vehiculoImagen: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    sucursal: 'Neiva',
    fechaInicio: '2026-08-20T08:00',
    fechaFin: '2026-08-28T18:00',
    estado: 'en_curso',
    totalCOP: 2240000,
    contratoFirmado: true,
    pagoEstado: 'aprobado',
    pasarela: 'Wompi',
    notas: 'Cliente VIP. Vehículo entregado con tanque lleno y revisión completa.',
    fechaCreacion: '2026-08-18T10:30:00.000Z',
    historialAcciones: [
      { fecha: '2026-08-18T10:30:00.000Z', accion: 'Creación de reserva online', usuario: 'carlos.mendoza@email.com' },
      { fecha: '2026-08-20T08:00:00.000Z', accion: 'Transición automática a En curso', usuario: 'Sistema Automático' }
    ]
  },
  {
    id: 'RES-902',
    codigo: 'RES-902',
    clienteNombre: 'Ana María Gómez',
    clienteCorreo: 'ana.gomez@email.com',
    clienteTelefono: '+57 311 589 2041',
    vehiculoId: 'v2',
    vehiculoNombre: 'Chevrolet Spark GT',
    vehiculoPlaca: 'HGF-123',
    vehiculoImagen: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    sucursal: 'Bogotá',
    fechaInicio: '2026-08-25T09:00',
    fechaFin: '2026-08-30T17:00',
    estado: 'confirmada',
    totalCOP: 650000,
    contratoFirmado: true,
    pagoEstado: 'aprobado',
    pasarela: 'Wompi',
    notas: 'Reserva confirmada. Requiere silla para bebé.',
    fechaCreacion: '2026-08-21T14:15:00.000Z',
    historialAcciones: [
      { fecha: '2026-08-21T14:15:00.000Z', accion: 'Creación de reserva online', usuario: 'ana.gomez@email.com' }
    ]
  },
  {
    id: 'RES-903',
    codigo: 'RES-903',
    clienteNombre: 'Roberto Silva',
    clienteCorreo: 'roberto.silva@email.com',
    clienteTelefono: '+57 300 452 8899',
    vehiculoId: 'v3',
    vehiculoNombre: 'Ford Explorer 2024',
    vehiculoPlaca: 'ERT-456',
    vehiculoImagen: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
    sucursal: 'Medellín',
    fechaInicio: '2026-08-10T10:00',
    fechaFin: '2026-08-15T18:00',
    estado: 'finalizada',
    totalCOP: 1850000,
    contratoFirmado: true,
    pagoEstado: 'aprobado',
    pasarela: 'Wompi',
    notas: 'Vehículo devuelto en perfecto estado. Depósito devuelto.',
    fechaCreacion: '2026-08-08T11:00:00.000Z',
    historialAcciones: [
      { fecha: '2026-08-08T11:00:00.000Z', accion: 'Creación de reserva online', usuario: 'roberto.silva@email.com' },
      { fecha: '2026-08-10T10:00:00.000Z', accion: 'Transición automática a En curso', usuario: 'Sistema Automático' },
      { fecha: '2026-08-15T18:00:00.000Z', accion: 'Transición automática a Finalizada', usuario: 'Sistema Automático' }
    ]
  },
  {
    id: 'RES-904',
    codigo: 'RES-904',
    clienteNombre: 'Laura Restrepo',
    clienteCorreo: 'laura.restrepo@email.com',
    clienteTelefono: '+57 318 901 2345',
    vehiculoId: 'v4',
    vehiculoNombre: 'Toyota Corolla 2024',
    vehiculoPlaca: 'ABC-123',
    vehiculoImagen: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=600&q=80',
    sucursal: 'Cali',
    fechaInicio: '2026-08-28T08:00',
    fechaFin: '2026-09-02T19:00',
    estado: 'pendiente',
    totalCOP: 950000,
    contratoFirmado: false,
    pagoEstado: 'pendiente',
    pasarela: 'Wompi',
    notas: 'Pendiente validación de cédula y pago.',
    fechaCreacion: '2026-08-22T09:30:00.000Z',
    historialAcciones: [
      { fecha: '2026-08-22T09:30:00.000Z', accion: 'Solicitud de reserva pendiente', usuario: 'laura.restrepo@email.com' }
    ]
  },
  {
    id: 'RES-905',
    codigo: 'RES-905',
    clienteNombre: 'Daniela Morales',
    clienteCorreo: 'daniela.morales@email.com',
    clienteTelefono: '+57 312 678 4321',
    vehiculoId: 'v5',
    vehiculoNombre: 'Mazda CX-5 2024',
    vehiculoPlaca: 'XYZ-789',
    vehiculoImagen: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
    sucursal: 'Cartagena',
    fechaInicio: '2026-08-12T14:00',
    fechaFin: '2026-08-14T14:00',
    estado: 'cancelada',
    totalCOP: 520000,
    contratoFirmado: false,
    pagoEstado: 'reembolsado',
    pasarela: 'Wompi',
    notas: 'Cancelada por el cliente por cambio de itinerario.',
    fechaCreacion: '2026-08-11T16:00:00.000Z',
    historialAcciones: [
      { fecha: '2026-08-11T16:00:00.000Z', accion: 'Creación de reserva online', usuario: 'daniela.morales@email.com' },
      { fecha: '2026-08-12T10:00:00.000Z', accion: 'Cancelación solicitada por cliente', usuario: 'daniela.morales@email.com' }
    ]
  }
]

function normalizarReserva(r) {
  if (!r) return null
  return {
    id: String(r.id || r.codigo || `RES-${Math.random().toString(36).substring(2, 6)}`),
    codigo: String(r.codigo || r.id || 'RES-000'),
    clienteNombre: r.clienteNombre || r.usuarioEmail || r.usuario?.nombre || 'Cliente Drivique',
    clienteCorreo: r.clienteCorreo || r.usuarioEmail || r.usuario?.email || 'cliente@email.com',
    clienteTelefono: r.clienteTelefono || r.telefono || '+57 300 000 0000',
    vehiculoId: String(r.vehiculoId || 'v1'),
    vehiculoNombre: r.vehiculoNombre || r.vehiculo?.nombre || 'Vehículo Drivique',
    vehiculoPlaca: r.vehiculoPlaca || r.vehiculo?.placa || 'KLS-849',
    vehiculoImagen: r.vehiculoImagen || r.vehiculo?.imagen || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    sucursal: r.sucursal || r.reservaDetalles?.sucursalRetiro || 'Neiva',
    fechaInicio: r.fechaInicio || (r.fechaRecogida ? `${r.fechaRecogida}T${r.horaRecogida || '08:00'}` : new Date().toISOString().slice(0, 16)),
    fechaFin: r.fechaFin || (r.fechaDevolucion ? `${r.fechaDevolucion}T${r.horaDevolucion || '18:00'}` : new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16)),
    estado: (r.estado || 'confirmada').toLowerCase(),
    totalCOP: Number(r.totalCOP || r.precioTotal || r.total || 1200000),
    contratoFirmado: Boolean(r.contratoFirmado),
    pagoEstado: r.pagoEstado || 'aprobado',
    pasarela: r.pasarela || 'Wompi',
    notas: r.notas || 'Reserva registrada en sistema.',
    fechaCreacion: r.fechaCreacion || new Date().toISOString(),
    historialAcciones: Array.isArray(r.historialAcciones) ? r.historialAcciones : [
      { fecha: r.fechaCreacion || new Date().toISOString(), accion: 'Registro de reserva', usuario: r.clienteCorreo || 'Sistema' }
    ]
  }
}

function readStoredReservations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RESERVATIONS))
      return INITIAL_RESERVATIONS
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RESERVATIONS))
      return INITIAL_RESERVATIONS
    }
    return parsed.map(normalizarReserva).filter(Boolean)
  } catch {
    return INITIAL_RESERVATIONS
  }
}

function writeStoredReservations(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Error writing reservations storage:', err)
  }
}

/**
 * Transición automática de estados según fecha/hora actual:
 * - Si fechaHoraActual >= fechaInicio Y estado === 'confirmada' -> pasa a 'en_curso'
 * - Si fechaHoraActual >= fechaFin Y (estado === 'en_curso' || estado === 'confirmada') -> pasa a 'finalizada'
 */
function evaluarTransicionesAutomaticas(listaReservas) {
  const ahora = new Date()
  let huboCambios = false

  const actualizadas = listaReservas.map((res) => {
    if (res.estado === 'cancelada' || res.estado === 'finalizada') {
      return res
    }

    const inicio = new Date(res.fechaInicio)
    const fin = new Date(res.fechaFin)

    let nuevoEstado = res.estado
    let motivoAccion = ''

    if (ahora >= fin && (res.estado === 'en_curso' || res.estado === 'confirmada')) {
      nuevoEstado = 'finalizada'
      motivoAccion = 'Transición automática a Finalizada al llegar la fecha/hora de devolución'
    } else if (ahora >= inicio && res.estado === 'confirmada') {
      nuevoEstado = 'en_curso'
      motivoAccion = 'Transición automática a En curso al llegar la fecha/hora de recogida'
    }

    if (nuevoEstado !== res.estado) {
      huboCambios = true
      const historialNuevo = [
        ...(res.historialAcciones || []),
        {
          fecha: ahora.toISOString(),
          accion: motivoAccion,
          usuario: 'Sistema Automático (Cron/Timer)',
        },
      ]
      return {
        ...res,
        estado: nuevoEstado,
        historialAcciones: historialNuevo,
      }
    }

    return res
  })

  if (huboCambios) {
    writeStoredReservations(actualizadas)
  }

  return actualizadas
}

export const reservationManagementService = {
  /**
   * Obtener reservas filtradas por el rol del usuario (Encargado ve solo su sucursal)
   */
  list(user) {
    const raw = readStoredReservations()
    const evaluadas = evaluarTransicionesAutomaticas(raw)

    const isManager = user?.rol === 'encargado' || user?.rol === 'branch_manager' || user?.rol === 'encargado_sucursal'
    const userBranch = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || 'Neiva'

    if (isManager) {
      return evaluadas.filter(
        (r) => (r.sucursal || '').toLowerCase().includes(userBranch.toLowerCase()) ||
               userBranch.toLowerCase().includes((r.sucursal || '').toLowerCase())
      )
    }

    return evaluadas
  },

  /**
   * Crear reserva manual (Administrador / Encargado)
   */
  createManual(formData, currentUser) {
    const lista = readStoredReservations()
    const now = new Date()

    const nuevoId = `RES-${now.getTime().toString().slice(-4)}`

    const nuevaReserva = {
      id: nuevoId,
      codigo: nuevoId,
      clienteNombre: formData.clienteNombre || 'Atención Directa',
      clienteCorreo: formData.clienteCorreo || 'cliente.directo@drivique.com',
      clienteTelefono: formData.clienteTelefono || '+57 300 000 0000',
      vehiculoId: formData.vehiculoId || 'v1',
      vehiculoNombre: formData.vehiculoNombre || 'Toyota Prado VX',
      vehiculoPlaca: formData.vehiculoPlaca || 'KLS-849',
      vehiculoImagen: formData.vehiculoImagen || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
      sucursal: formData.sucursal || currentUser?.sucursalAsignada || 'Neiva',
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin,
      estado: formData.estado || 'confirmada',
      totalCOP: Number(formData.totalCOP) || 1200000,
      contratoFirmado: true,
      pagoEstado: 'aprobado',
      pasarela: 'Atención Directa / Manual',
      notas: formData.notas || 'Reserva manual creada desde el panel administrativo.',
      fechaCreacion: now.toISOString(),
      historialAcciones: [
        {
          fecha: now.toISOString(),
          accion: 'Creación de reserva manual',
          usuario: currentUser?.correo || 'Administrador',
        },
      ],
    }

    const evaluadas = evaluarTransicionesAutomaticas([nuevaReserva, ...lista])
    writeStoredReservations(evaluadas)

    accessAuditService.record({
      correo: currentUser?.correo || 'admin@drivique.com',
      rol: currentUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `Reserva manual ${nuevoId} creada para ${nuevaReserva.clienteNombre}`,
    })

    return nuevaReserva
  },

  /**
   * Editar reserva existente
   */
  update(id, formData, currentUser) {
    const lista = readStoredReservations()
    const now = new Date()

    const actualizadas = lista.map((res) => {
      if (res.id === id || res.codigo === id) {
        const historialNuevo = [
          ...(res.historialAcciones || []),
          {
            fecha: now.toISOString(),
            accion: `Edición de datos (Estado: ${formData.estado}, Fechas: ${formData.fechaInicio} a ${formData.fechaFin})`,
            usuario: currentUser?.correo || 'Administrador',
          },
        ]

        return {
          ...res,
          clienteNombre: formData.clienteNombre !== undefined ? formData.clienteNombre : res.clienteNombre,
          clienteCorreo: formData.clienteCorreo !== undefined ? formData.clienteCorreo : res.clienteCorreo,
          clienteTelefono: formData.clienteTelefono !== undefined ? formData.clienteTelefono : res.clienteTelefono,
          sucursal: formData.sucursal || res.sucursal,
          fechaInicio: formData.fechaInicio || res.fechaInicio,
          fechaFin: formData.fechaFin || res.fechaFin,
          estado: formData.estado || res.estado,
          totalCOP: formData.totalCOP !== undefined ? Number(formData.totalCOP) : res.totalCOP,
          notas: formData.notas !== undefined ? formData.notas : res.notas,
          historialAcciones: historialNuevo,
        }
      }
      return res
    })

    const evaluadas = evaluarTransicionesAutomaticas(actualizadas)
    writeStoredReservations(evaluadas)

    accessAuditService.record({
      correo: currentUser?.correo || 'admin@drivique.com',
      rol: currentUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `Reserva ${id} actualizada por ${currentUser?.correo || 'Administrador'}`,
    })

    return true
  },

  /**
   * Cancelar reserva desde el panel
   */
  cancel(id, motivoCancelacion, currentUser) {
    const lista = readStoredReservations()
    const now = new Date()

    const actualizadas = lista.map((res) => {
      if (res.id === id || res.codigo === id) {
        const historialNuevo = [
          ...(res.historialAcciones || []),
          {
            fecha: now.toISOString(),
            accion: `Reserva Cancelada. Motivo: ${motivoCancelacion || 'Sin motivo especificado'}`,
            usuario: currentUser?.correo || 'Administrador',
          },
        ]

        return {
          ...res,
          estado: 'cancelada',
          pagoEstado: 'reembolsado',
          notas: `${res.notas || ''} | Cancelada: ${motivoCancelacion || 'Desde panel'}`.trim(),
          historialAcciones: historialNuevo,
        }
      }
      return res
    })

    writeStoredReservations(actualizadas)

    accessAuditService.record({
      correo: currentUser?.correo || 'admin@drivique.com',
      rol: currentUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `Reserva ${id} cancelada. Motivo: ${motivoCancelacion}`,
    })

    return true
  },
}
