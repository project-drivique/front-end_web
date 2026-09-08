import { accessAuditService, hasMatchingBranch } from './accessAuditService'
import initialVehicles from '../mocks/vehicles.json'
import { reservationService } from './reservationService'

const STORAGE_KEY = 'drivique_reservas'
const STORAGE_SCHEMA_KEY = 'drivique_reservas_schema'
const STORAGE_SCHEMA = '2'
const LEGACY_RESERVATION_IDS = new Set(['RES-901', 'RES-902', 'RES-903', 'RES-904', 'RES-905'])
const managerRoles = new Set(['encargado', 'branch_manager', 'encargado_sucursal'])
function normalizeBranch(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function assertReservationScope(user, reservation, requestedBranch = reservation?.sucursal) {
  if (!managerRoles.has(user?.rol)) return
  const branch = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || ''
  if (!branch) return

  const branchNorm = normalizeBranch(branch)
  const resBranchNorm = normalizeBranch(reservation?.sucursal)
  const reqBranchNorm = normalizeBranch(requestedBranch)
  const efectivoBranchNorm = normalizeBranch(reservation?.reservaDetalles?.sucursalPagoEfectivo)
  const retiroBranchNorm = normalizeBranch(reservation?.reservaDetalles?.sucursalRetiro)

  const matches =
    hasMatchingBranch(branch, reservation?.sucursal) ||
    hasMatchingBranch(branch, requestedBranch) ||
    hasMatchingBranch(branch, reservation?.reservaDetalles?.sucursalPagoEfectivo) ||
    hasMatchingBranch(branch, reservation?.reservaDetalles?.sucursalRetiro) ||
    resBranchNorm.includes(branchNorm) || branchNorm.includes(resBranchNorm) ||
    reqBranchNorm.includes(branchNorm) || branchNorm.includes(reqBranchNorm) ||
    efectivoBranchNorm.includes(branchNorm) || branchNorm.includes(efectivoBranchNorm) ||
    retiroBranchNorm.includes(branchNorm) || branchNorm.includes(retiroBranchNorm)

  if (!matches) {
    throw new Error('invalidBranch')
  }
}

function normalizarReserva(r) {
  if (!r) return null
  const codigo = r.referencia || r.codigo || r.id || 'RES-SIN-REF'
  const df = r.datosForm || {}
  const clienteNombre = [df.nombres, df.apellidos].filter(Boolean).join(' ').trim() || r.clienteNombre || 'Cliente Registrado'
  const clienteCorreo = df.correo || r.clienteCorreo || 'cliente@drivique.com'
  const clienteTelefono = df.celular || df.telefono || r.clienteTelefono || '+57 300 000 0000'
  const clienteDocumento = df.numDoc || df.documento || r.clienteDocumento || '1020304050'

  const rd = r.reservaDetalles || {}
  const hoyMs = Date.now()
  const fInicio = rd.fechaInicio || r.fechaInicio || new Date(hoyMs).toISOString().slice(0, 10)
  const fFin = rd.fechaFin || r.fechaFin || new Date(hoyMs + 86400000 * 2).toISOString().slice(0, 10)

  let estadoNorm = String(r.estado || 'PENDIENTE').toLowerCase()
  if (estadoNorm === 'confirmado') estadoNorm = 'confirmada'
  if (estadoNorm === 'en curso') estadoNorm = 'en_curso'

  const vId = String(r.vehiculoId || '')
  const vNom = r.vehiculoNombre || r.vehiculo?.nombre || ''
  const vPlaca = r.vehiculoPlaca || r.vehiculo?.placa || ''
  const matchingMockVehicle = initialVehicles.find((v) =>
    (vId && String(v.id) === vId) ||
    (vPlaca && v.placa && v.placa.replace(/\s|-/g, '').toLowerCase() === vPlaca.replace(/\s|-/g, '').toLowerCase()) ||
    (vNom && v.nombre && v.nombre.toLowerCase().includes(vNom.toLowerCase())) ||
    (vNom && v.nombre && vNom.toLowerCase().includes(v.nombre.toLowerCase()))
  )

  const vehiculoImagen = r.vehiculoImagen || r.vehiculo?.imagen || r.vehiculo?.imagenes?.[0] || matchingMockVehicle?.imagenes?.[0] || ''

  return {
    id: String(r.id || codigo),
    codigo,
    clienteNombre,
    clienteCorreo,
    clienteTelefono,
    clienteDocumento,
    vehiculoId: String(r.vehiculoId || matchingMockVehicle?.id || '2'),
    vehiculoNombre: vNom || matchingMockVehicle?.nombre || 'Mazda CX-5 2024',
    vehiculoPlaca: vPlaca || matchingMockVehicle?.placa || 'KLS-849',
    vehiculoImagen,
    sucursal: r.reservaDetalles?.sucursalPagoEfectivo || r.sucursalPagoEfectivo || r.sucursal || r.reservaDetalles?.sucursalRetiro || matchingMockVehicle?.sucursal || 'Bogotá - Calle 100',
    sucursalPagoEfectivo: r.sucursalPagoEfectivo || r.reservaDetalles?.sucursalPagoEfectivo || r.sucursal || '',
    fechaInicio: fInicio,
    fechaFin: fFin,
    estado: estadoNorm,
    totalCOP: Number(r.totalCOP || r.total || r.precioTotal || 348000),
    contratoFirmado: Boolean(r.contratoFirmado || r.estado === 'ACTIVA' || estadoNorm === 'en_curso'),
    pagoEstado: r.pagoEstado || 'aprobado',
    pasarela: r.pasarela || r.reservaDetalles?.metodoPago || 'Wompi',
    metodoPagoConfirmado: r.metodoPagoConfirmado || ((estadoNorm === 'confirmada' || estadoNorm === 'en_curso' || r.pagoEstado === 'aprobado') && (r.pasarela === 'efectivo' || r.reservaDetalles?.metodoPago === 'efectivo' || estadoNorm.includes('efectivo')) ? 'efectivo' : undefined),
    fechaPagoConfirmado: r.fechaPagoConfirmado || (r.pagoEstado === 'aprobado' && r.metodoPagoConfirmado === 'efectivo' ? r.fechaCreacion : undefined),
    cajeroConfirmacion: r.cajeroConfirmacion || undefined,
    observacionesCaja: r.observacionesCaja || '',
    notas: r.notas || '',
    fechaCreacion: r.fechaCreacion || new Date().toISOString(),
    historialAcciones: Array.isArray(r.historialAcciones) ? r.historialAcciones : [
      { fecha: r.fechaCreacion || new Date().toISOString(), accion: 'Registro de reserva', usuario: clienteCorreo }
    ]
  }
}

function readStoredReservations() {
  try {
    const parsed = reservationService.getReservas()
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
        hasMatchingBranch(r.sucursal, userBranch) ||
        hasMatchingBranch(r.sucursalPagoEfectivo, userBranch) ||
        hasMatchingBranch(r.reservaDetalles?.sucursalPagoEfectivo, userBranch) ||
        hasMatchingBranch(r.reservaDetalles?.sucursalRetiro, userBranch) ||
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

  /**
   * Confirmar pago en efectivo en mostrador/sucursal
   */
  confirmCashPayment(idOrCode, currentUser, notes = '') {
    const rawList = readStoredReservations()
    const now = new Date()
    const search = String(idOrCode).trim().toLowerCase()
    const target = rawList.find((res) => {
      const codigo = String(res.codigo || res.referencia || res.id || '').toLowerCase()
      return (
        codigo === search ||
        String(res.id || '').trim().toLowerCase() === search ||
        String(res.referencia || '').trim().toLowerCase() === search
      )
    })
    if (!target) throw new Error('notFound')
    assertReservationScope(currentUser, target, target.sucursal)

    const sucursalEvento = target.sucursal || currentUser?.sucursal || currentUser?.sucursalAsignada || 'Alamo Medellín Poblado'
    const totalCobrado = target.totalCOP || target.total || 0

    const actualizadas = rawList.map((res) => {
      const codigo = String(res.codigo || res.referencia || res.id || '').toLowerCase()
      if (
        codigo === search ||
        String(res.id || '').trim().toLowerCase() === search ||
        String(res.referencia || '').trim().toLowerCase() === search
      ) {
        const historialNuevo = [
          ...(res.historialAcciones || []),
          {
            fecha: now.toISOString(),
            accion: `Cobro en efectivo confirmado en sucursal ${sucursalEvento} por $${Number(res.totalCOP || res.total || 0).toLocaleString('es-CO')}`,
            usuario: currentUser?.nombre || currentUser?.correo || 'Encargado de Sucursal',
          },
        ]

        return {
          ...res,
          estado: 'confirmada',
          pagoEstado: 'aprobado',
          metodoPagoConfirmado: 'efectivo',
          fechaPagoConfirmado: now.toISOString(),
          cajeroConfirmacion: currentUser?.nombre || currentUser?.correo || 'Encargado de Sucursal',
          notas: notes ? `${res.notas || ''} | Caja: ${notes}`.trim() : res.notas,
          historialAcciones: historialNuevo,
        }
      }
      return res
    })

    writeStoredReservations(actualizadas)

    accessAuditService.record({
      tipo: 'COBRO_SUCURSAL',
      modulo: 'Cobro en Sucursal',
      accion: `Confirmación de cobro en efectivo en sucursal`,
      actor: currentUser?.nombre || currentUser?.correo || 'Encargado de Sucursal',
      correo: currentUser?.correo || 'enc06@drivique.com',
      rol: currentUser?.rol || 'encargado_sucursal',
      sucursal: sucursalEvento,
      resultado: 'EXITO',
      motivo: `Pago en efectivo de $${Number(totalCobrado).toLocaleString('es-CO')} recibido y confirmado en mostrador para reserva ${target.codigo || target.id}`,
      detalles: {
        referencia: target.codigo || target.id,
        reservaId: target.id,
        total: totalCobrado,
        metodoPago: 'efectivo',
        sucursal: sucursalEvento,
        cliente: target.clienteNombre,
        documento: target.clienteDocumento,
        cajero: currentUser?.nombre || currentUser?.correo || 'Encargado',
        notas: notes || null,
        confirmadoEn: now.toISOString(),
      },
    })

    return actualizadas.find((r) => String(r.id) === String(target.id) || String(r.codigo) === String(target.codigo))
  },
}
