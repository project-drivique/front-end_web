import { vehicleManagementService } from './vehicleManagementService'
import { reservationService } from './reservationService'
import { ESTADOS_RESERVA } from '../modules/reservations/utils/reservationStatus'
import { ROLES } from '../modules/auth/utils/accessControl'

const REVENUE_STATES = new Set([
  ESTADOS_RESERVA.CONFIRMADA,
  ESTADOS_RESERVA.ACTIVA,
  ESTADOS_RESERVA.COMPLETADA,
])

const CANCELLED_STATES = new Set([
  ESTADOS_RESERVA.CANCELADA,
  ESTADOS_RESERVA.CANCELADA_POR_TIEMPO,
])

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function sameBranch(value, assignedBranch) {
  const branch = normalize(value)
  const assigned = normalize(assignedBranch)
  return Boolean(branch && assigned) && branch === assigned
}

function reservationBranch(reservation, vehicleById) {
  const pickup = reservation.reservaDetalles?.sucursalRetiro
  if (pickup && !['domicilio', 'aeropuerto', 'terminal'].includes(pickup)) return pickup
  return vehicleById.get(Number(reservation.vehiculoId))?.sucursal || ''
}

function isSameLocalDate(value, reference) {
  if (!value) return false
  const dateStr = String(value).slice(0, 10)
  const refStr = reference.toISOString().slice(0, 10)
  if (dateStr === refStr) return true
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  return !Number.isNaN(date.getTime())
    && date.getFullYear() === reference.getFullYear()
    && date.getMonth() === reference.getMonth()
    && date.getDate() === reference.getDate()
}

function isSameMonth(value, reference) {
  if (!value) return false
  const date = new Date(value)
  return !Number.isNaN(date.getTime())
    && date.getFullYear() === reference.getFullYear()
    && date.getMonth() === reference.getMonth()
}

export const adminDashboardService = {
  getSummary(user, referenceDate = new Date()) {
    const vehicles = vehicleManagementService.list()
    const vehicleById = new Map(vehicles.map((vehicle) => [Number(vehicle.id), vehicle]))
    const isBranchManager = user?.rol === ROLES.BRANCH_MANAGER || user?.rol === 'encargado_sucursal' || user?.rol === 'encargado'
    const assignedBranch = user?.sucursalId || user?.sucursal || user?.sucursalAsignada || ''
    const scopedVehicles = isBranchManager
      ? vehicles.filter((vehicle) => sameBranch(vehicle.sucursal, assignedBranch))
      : vehicles
    const scopedVehicleIds = new Set(scopedVehicles.map((vehicle) => Number(vehicle.id)))
    const reservations = reservationService.getReservas().filter((reservation) => {
      if (!isBranchManager) return true
      return scopedVehicleIds.has(Number(reservation.vehiculoId))
        || sameBranch(reservationBranch(reservation, vehicleById), assignedBranch)
    })

    const activeVehicleIds = new Set(
      reservations
        .filter((reservation) => String(reservation.estado).toUpperCase() === ESTADOS_RESERVA.ACTIVA)
        .map((reservation) => Number(reservation.vehiculoId)),
    )
    scopedVehicles.forEach((vehicle) => {
      if (vehicle.disponible === false) activeVehicleIds.add(Number(vehicle.id))
    })

    const monthlyRevenue = reservations
      .filter((reservation) => REVENUE_STATES.has(String(reservation.estado).toUpperCase()))
      .filter((reservation) => isSameMonth(reservation.fechaReserva || reservation.reservaDetalles?.fechaInicio, referenceDate))
      .reduce((total, reservation) => total + (Number(reservation.total) || 0), 0)

    const todayDeliveriesList = reservations.filter((reservation) => {
      const state = String(reservation.estado).toUpperCase()
      const startDate = reservation.reservaDetalles?.fechaInicio || reservation.fechaInicio
      return !CANCELLED_STATES.has(state) && isSameLocalDate(startDate, referenceDate)
    })

    const todayReturnsList = reservations.filter((reservation) => {
      const state = String(reservation.estado).toUpperCase()
      const endDate = reservation.reservaDetalles?.fechaFin || reservation.fechaFin
      return !CANCELLED_STATES.has(state) && isSameLocalDate(endDate, referenceDate)
    })

    const totalVehiclesCount = scopedVehicles.length || 1
    const rentedVehiclesCount = activeVehicleIds.size
    const availableVehiclesCount = scopedVehicles.filter(
      (vehicle) => vehicle.disponible !== false && !activeVehicleIds.has(Number(vehicle.id)),
    ).length
    const maintenanceVehiclesCount = scopedVehicles.filter(
      (vehicle) => vehicle.estadoFlota === 'EN_MANTENIMIENTO' || vehicle.disponible === false,
    ).length

    const occupancyRate = Math.min(100, Math.round((rentedVehiclesCount / totalVehiclesCount) * 100))

    const statusBreakdown = {
      confirmada: reservations.filter((r) => String(r.estado).toLowerCase().includes('confirmad')).length,
      en_curso: reservations.filter((r) => String(r.estado).toLowerCase().includes('curso') || String(r.estado).toLowerCase().includes('activ')).length,
      finalizada: reservations.filter((r) => String(r.estado).toLowerCase().includes('finaliz') || String(r.estado).toLowerCase().includes('complet')).length,
      pendiente: reservations.filter((r) => String(r.estado).toLowerCase().includes('pendient')).length,
      cancelada: reservations.filter((r) => String(r.estado).toLowerCase().includes('cancel')).length,
    }

    return {
      scope: isBranchManager ? 'branch' : 'global',
      branch: isBranchManager ? (scopedVehicles[0]?.sucursal || assignedBranch) : null,
      monthlyRevenue,
      rentedVehicles: rentedVehiclesCount,
      availableVehicles: availableVehiclesCount,
      maintenanceVehicles: maintenanceVehiclesCount,
      occupancyRate,
      todayDeliveries: todayDeliveriesList.length,
      todayReturns: todayReturnsList.length,
      todayDeliveriesList,
      todayReturnsList,
      allBranchReservations: reservations,
      statusBreakdown,
      vehicleCount: scopedVehicles.length,
      reservationCount: reservations.length,
      generatedAt: referenceDate.toISOString(),
    }
  },

  getWeeklyActivity(user, referenceDate = new Date()) {
    const vehicles = vehicleManagementService.list()
    const vehicleById = new Map(vehicles.map((v) => [Number(v.id), v]))
    const isBranchManager = user?.rol === ROLES.BRANCH_MANAGER || user?.rol === 'encargado_sucursal' || user?.rol === 'encargado'
    const assignedBranch = user?.sucursalId || user?.sucursal || user?.sucursalAsignada || ''
    const scopedVehicles = isBranchManager
      ? vehicles.filter((vehicle) => sameBranch(vehicle.sucursal, assignedBranch))
      : vehicles
    const scopedVehicleIds = new Set(scopedVehicles.map((vehicle) => Number(vehicle.id)))
    const reservations = reservationService.getReservas().filter((reservation) => {
      if (!isBranchManager) return true
      return scopedVehicleIds.has(Number(reservation.vehiculoId))
        || sameBranch(reservationBranch(reservation, vehicleById), assignedBranch)
    })

    const current = new Date(referenceDate)
    const dayOfWeek = current.getDay()
    const diffToMonday = (dayOfWeek + 6) % 7
    const monday = new Date(current)
    monday.setDate(current.getDate() - diffToMonday)
    monday.setHours(0, 0, 0, 0)

    const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    return dayLabels.map((label, idx) => {
      const targetDate = new Date(monday)
      targetDate.setDate(monday.getDate() + idx)

      const entregas = reservations.filter((r) => {
        const state = String(r.estado).toUpperCase()
        const startDate = r.reservaDetalles?.fechaInicio || r.fechaInicio
        return !CANCELLED_STATES.has(state) && isSameLocalDate(startDate, targetDate)
      }).length

      const devoluciones = reservations.filter((r) => {
        const state = String(r.estado).toUpperCase()
        const endDate = r.reservaDetalles?.fechaFin || r.fechaFin
        return !CANCELLED_STATES.has(state) && isSameLocalDate(endDate, targetDate)
      }).length

      return { day: label, entregas, devoluciones }
    })
  },
}
