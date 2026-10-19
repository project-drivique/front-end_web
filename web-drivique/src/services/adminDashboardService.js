import { vehicleManagementService } from './vehicleManagementService'
import { reservationManagementService } from './reservationManagementService'
import i18n from '@/i18n'

const CANCELLED = new Set(['cancelada'])

const sameLocalDate = (isoOrDate, reference) => {
  if (!isoOrDate) return false
  const date = new Date(String(isoOrDate).length === 10 ? `${isoOrDate}T00:00:00` : isoOrDate)
  return !Number.isNaN(date.getTime())
    && date.getFullYear() === reference.getFullYear()
    && date.getMonth() === reference.getMonth()
    && date.getDate() === reference.getDate()
}

const sameMonth = (isoOrDate, reference) => {
  if (!isoOrDate) return false
  const date = new Date(isoOrDate)
  return !Number.isNaN(date.getTime()) && date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth()
}

// El servidor ya limita reservas y vehículos a la sucursal del encargado; aquí solo se agregan los datos.
export const adminDashboardService = {
  async refresh() {
    await Promise.all([reservationManagementService.refresh(), vehicleManagementService.refresh()])
  },

  getSummary(user, referenceDate = new Date()) {
    const vehicles = vehicleManagementService.list()
    const reservations = reservationManagementService.list()
    const isBranchManager = ['encargado_sucursal', 'encargado', 'branch_manager'].includes(user?.rol)

    const rented = vehicles.filter((v) => v.estadoEfectivo === 'reservado').length
    const maintenance = vehicles.filter((v) => v.estadoFlota === 'mantenimiento').length
    const available = vehicles.filter((v) => v.estadoEfectivo === 'disponible').length

    const monthlyRevenue = reservations
      .filter((r) => r.pagoEstado === 'aprobado' && sameMonth(r.fechaPagoConfirmado || r.fechaCreacion, referenceDate))
      .reduce((total, r) => total + (Number(r.totalCOP) || 0), 0)

    const previousMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1)
    const previousRevenue = reservations
      .filter((r) => r.pagoEstado === 'aprobado' && sameMonth(r.fechaPagoConfirmado || r.fechaCreacion, previousMonth))
      .reduce((total, r) => total + (Number(r.totalCOP) || 0), 0)
    // Sin ingresos el mes anterior no hay con qué comparar
    const monthlyRevenueChange = previousRevenue > 0 ? Math.round(((monthlyRevenue - previousRevenue) / previousRevenue) * 1000) / 10 : null

    const todayDeliveriesList = reservations.filter((r) => !CANCELLED.has(r.estado) && sameLocalDate(r.fechaInicio, referenceDate))
    const todayReturnsList = reservations.filter((r) => !CANCELLED.has(r.estado) && sameLocalDate(r.fechaFin, referenceDate))

    const count = (estado) => reservations.filter((r) => r.estado === estado).length

    return {
      scope: isBranchManager ? 'branch' : 'global',
      branch: isBranchManager ? (vehicles[0]?.sucursal || '') : null,
      monthlyRevenue,
      monthlyRevenueChange,
      previousMonthRevenue: previousRevenue,
      rentedVehicles: rented,
      availableVehicles: available,
      maintenanceVehicles: maintenance,
      occupancyRate: vehicles.length ? Math.min(100, Math.round((rented / vehicles.length) * 100)) : 0,
      todayDeliveries: todayDeliveriesList.length,
      todayReturns: todayReturnsList.length,
      todayDeliveriesList,
      todayReturnsList,
      allBranchReservations: reservations,
      statusBreakdown: {
        confirmada: count('confirmada'),
        en_curso: count('en_curso'),
        finalizada: count('finalizada'),
        pendiente: count('creada'),
        cancelada: count('cancelada'),
      },
      vehicleCount: vehicles.length,
      reservationCount: reservations.length,
      generatedAt: referenceDate.toISOString(),
    }
  },

  getWeeklyActivity(user, referenceDate = new Date()) {
    const reservations = reservationManagementService.list()
    const monday = new Date(referenceDate)
    monday.setDate(referenceDate.getDate() - ((referenceDate.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)

    return i18n.t('vehiculo.calendarDays', 'Lun,Mar,Mié,Jue,Vie,Sáb,Dom').split(',').map((day, index) => {
      const target = new Date(monday)
      target.setDate(monday.getDate() + index)
      return {
        day,
        entregas: reservations.filter((r) => !CANCELLED.has(r.estado) && sameLocalDate(r.fechaInicio, target)).length,
        devoluciones: reservations.filter((r) => !CANCELLED.has(r.estado) && sameLocalDate(r.fechaFin, target)).length,
      }
    })
  },
}
