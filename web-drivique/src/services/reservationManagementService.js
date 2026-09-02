import { accessAuditService } from './accessAuditService'

const STORAGE_KEY = 'drivique_reservas'
const STORAGE_SCHEMA_KEY = 'drivique_reservas_schema'
const STORAGE_SCHEMA = '2'
const LEGACY_RESERVATION_IDS = new Set(['RES-901', 'RES-902', 'RES-903', 'RES-904', 'RES-905'])
const managerRoles = new Set(['encargado', 'branch_manager', 'encargado_sucursal'])
const normalizeBranch = (value) => String(value || '').trim().toLocaleLowerCase()

function assertReservationScope(user, reservation, requestedBranch = reservation?.sucursal) {
  if (!managerRoles.has(user?.rol)) return
  const branch = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || ''
  if (!branch || normalizeBranch(reservation?.sucursal) !== normalizeBranch(branch) || normalizeBranch(requestedBranch) !== normalizeBranch(branch)) {
    throw new Error('invalidBranch')
  }
}

function normalizarReserva(r) {
  if (!r) return null
  const codigo = String(
    r.codigo ||
    r.referencia ||
    (r.id && !String(r.id).startsWith('RES-') ? `RES-${r.id}` : r.id) ||
    'RES-2026-9102'
  )

  const df = r.datosForm || {}
  const dfNombre = [df.nombres, df.apellidos].filter(Boolean).join(' ').trim()

  const clienteNombre = String(
    r.clienteNombre ||
    dfNombre ||
    r.usuario?.nombre ||
    r.nombre ||
    'Carlos Mendoza'
  )

  const clienteCorreo = String(
    r.clienteCorreo ||
    df.correo ||
    r.usuario?.email ||
    r.usuarioEmail ||
    r.email ||
    'cliente@drivique.com'
  ).toLowerCase().trim()

  const clienteTelefono = String(
    r.clienteTelefono ||
    df.telefono ||
    r.telefono ||
    '+57 314 478 9702'
  )

  const clienteDocumento = String(
    r.clienteDocumento ||
    df.numDoc ||
    df.documento ||
    r.usuario?.documento ||
    r.cedula ||
    r.documento ||
    '1020304050'
  )

  let fInicio = r.fechaInicio
  if (!fInicio && r.reservaDetalles?.fechaInicio) {
    fInicio = `${r.reservaDetalles.fechaInicio}T${r.reservaDetalles.horaInicio || '08:00'}`
  } else if (!fInicio && r.fechaRecogida) {
    fInicio = `${r.fechaRecogida}T${r.horaRecogida || '08:00'}`
  } else if (!fInicio) {
    fInicio = new Date().toISOString().slice(0, 16)
  }

  let fFin = r.fechaFin
  if (!fFin && r.reservaDetalles?.fechaFin) {
    fFin = `${r.reservaDetalles.fechaFin}T${r.reservaDetalles.horaFin || '18:00'}`
  } else if (!fFin && r.fechaDevolucion) {
    fFin = `${r.fechaDevolucion}T${r.horaDevolucion || '18:00'}`
  } else if (!fFin) {
    fFin = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16)
  }

  let estadoNorm = String(r.estado || 'confirmada').toLowerCase()
  if (estadoNorm === 'activa') estadoNorm = 'en_curso'
  if (estadoNorm === 'pendiente_efectivo') estadoNorm = 'pendiente'

  return {
    id: String(r.id || codigo),
    codigo,
    clienteNombre,
    clienteCorreo,
    clienteTelefono,
    clienteDocumento,
    vehiculoId: String(r.vehiculoId || '2'),
    vehiculoNombre: r.vehiculoNombre || r.vehiculo?.nombre || 'Mazda CX-5 2024',
    vehiculoPlaca: r.vehiculoPlaca || r.vehiculo?.placa || 'KLS-849',
    vehiculoImagen: r.vehiculoImagen || r.vehiculo?.imagen || '',
    sucursal: r.sucursal || r.reservaDetalles?.sucursalRetiro || 'Bogotá - Calle 100',
    fechaInicio: fInicio,
    fechaFin: fFin,
    estado: estadoNorm,
    totalCOP: Number(r.totalCOP || r.total || r.precioTotal || 348000),
    contratoFirmado: Boolean(r.contratoFirmado || r.estado === 'ACTIVA' || estadoNorm === 'en_curso'),
    pagoEstado: r.pagoEstado || 'aprobado',
    pasarela: r.pasarela || r.reservaDetalles?.metodoPago || 'Wompi',
    notas: r.notas || '',
    fechaCreacion: r.fechaCreacion || new Date().toISOString(),
    historialAcciones: Array.isArray(r.historialAcciones) ? r.historialAcciones : [
      { fecha: r.fechaCreacion || new Date().toISOString(), accion: 'Registro de reserva', usuario: clienteCorreo }
    ]
  }
}

function readStoredReservations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return []
    if (localStorage.getItem(STORAGE_SCHEMA_KEY) !== STORAGE_SCHEMA) {
      const migrated = parsed.filter((reservation) => !LEGACY_RESERVATION_IDS.has(String(reservation?.id || reservation?.codigo || '')))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
      localStorage.setItem(STORAGE_SCHEMA_KEY, STORAGE_SCHEMA)
      return migrated.map(normalizarReserva).filter(Boolean)
    }
    return parsed.map(normalizarReserva).filter(Boolean)
  } catch {
    return []
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
    const userBranch = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || ''

    if (isManager) {
      if (!userBranch) return []
      return evaluadas.filter((r) =>
        String(r.sucursal || '').trim().toLocaleLowerCase() === String(userBranch).trim().toLocaleLowerCase()
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
    const isManager = currentUser?.rol === 'encargado' || currentUser?.rol === 'branch_manager' || currentUser?.rol === 'encargado_sucursal'
    const assignedBranch = currentUser?.sucursalAsignada || currentUser?.sucursalId || currentUser?.sucursal || ''
    const requestedBranch = isManager ? assignedBranch : formData.sucursal
    if (!requestedBranch || (isManager && String(formData.sucursal || '').trim().toLocaleLowerCase() !== String(assignedBranch).trim().toLocaleLowerCase())) {
      throw new Error('invalidBranch')
    }

    const nuevoId = `RES-${now.getTime().toString().slice(-4)}`

    const nuevaReserva = {
      id: nuevoId,
      codigo: nuevoId,
      clienteNombre: formData.clienteNombre,
      clienteCorreo: formData.clienteCorreo,
      clienteTelefono: formData.clienteTelefono,
      vehiculoId: formData.vehiculoId || '',
      vehiculoNombre: formData.vehiculoNombre,
      vehiculoPlaca: formData.vehiculoPlaca,
      vehiculoImagen: formData.vehiculoImagen || '',
      sucursal: requestedBranch,
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin,
      estado: formData.estado || 'confirmada',
      totalCOP: Number(formData.totalCOP) || 0,
      contratoFirmado: true,
      pagoEstado: 'aprobado',
      pasarela: 'Atención Directa / Manual',
      notas: formData.notas || '',
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
    const target = lista.find((res) => res.id === id || res.codigo === id)
    if (!target) throw new Error('notFound')
    assertReservationScope(currentUser, target, formData.sucursal || target.sucursal)

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
    const target = lista.find((res) => res.id === id || res.codigo === id)
    if (!target) throw new Error('notFound')
    assertReservationScope(currentUser, target)

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
