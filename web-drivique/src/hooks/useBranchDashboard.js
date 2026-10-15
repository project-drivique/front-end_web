import { useState, useEffect, useCallback } from 'react'
import { adminDashboardService } from '../services/adminDashboardService'
import { documentVerificationService } from '../services/documentVerificationService'
import { incidentManagementService } from '../services/incidentManagementService'
import { reservationManagementService } from '../services/reservationManagementService'
import { vehicleManagementService } from '../services/vehicleManagementService'

const toAgendaItem = (reserva, tipo, fecha, hora) => ({
  id: tipo === 'devolucion' ? `ret-${reserva.id}` : reserva.id,
  reservaId: reserva.id,
  codigo: reserva.codigo,
  fecha,
  hora,
  tipo,
  clienteNombre: reserva.clienteNombre,
  clienteTelefono: reserva.clienteTelefono,
  clienteCorreo: reserva.clienteCorreo,
  vehiculoNombre: reserva.vehiculoNombre,
  vehiculoPlaca: reserva.vehiculoPlaca,
  vehiculoCategoria: vehicleManagementService.getById(reserva.vehiculoId)?.categoria || '',
  estado: String(reserva.estado || '').toUpperCase(),
  sucursal: reserva.sucursal,
})

/** Programación de entregas y devoluciones tomada de las reservas reales (el servidor ya filtra por sucursal). */
export function getScheduleForRange(startStr, endStr) {
  const reservas = reservationManagementService.list().filter((r) => r.estado !== 'cancelada')
  const enRango = (fecha) => fecha >= startStr && fecha <= endStr
  return {
    deliveries: reservas.filter((r) => enRango(r.fechaInicio)).map((r) => toAgendaItem(r, 'entrega', r.fechaInicio, r.horaInicio)),
    returns: reservas.filter((r) => enRango(r.fechaFin)).map((r) => toAgendaItem(r, 'devolucion', r.fechaFin, r.horaFin)),
  }
}

export function getScheduleForDate(dateStr) {
  return getScheduleForRange(dateStr, dateStr)
}

export function useBranchDashboard(user) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState(new Date())

  const refresh = useCallback(async () => {
    try {
      const [, , , expedientes] = await Promise.all([
        adminDashboardService.refresh(),
        incidentManagementService.refresh(),
        Promise.resolve(),
        documentVerificationService.listar(),
      ])

      const summary = adminDashboardService.getSummary(user)
      const vehicles = vehicleManagementService.list()
      const mantenimiento = vehicles.filter((v) => v.estadoFlota === 'mantenimiento').length
      const reservations = reservationManagementService.list()
      const hoy = new Date().toLocaleDateString('en-CA')
      const agenda = getScheduleForRange(hoy, hoy)

      const entregasCompletadas = agenda.deliveries.filter((d) => ['EN_CURSO', 'FINALIZADA'].includes(d.estado)).length
      const devolucionesRecibidas = agenda.returns.filter((d) => d.estado === 'FINALIZADA').length

      const documentosPendientes = expedientes.filter((e) => e.estado === 'pendiente')
      const incidenciasAbiertas = incidentManagementService.list().filter((i) => ['OPEN', 'IN_REVIEW'].includes(i.estadoCodigo)).length
      const pagosPendientes = reservations.filter((r) => r.pagoEstado !== 'aprobado' && r.estado !== 'cancelada' && r.metodoPago === 'efectivo').length

      setData({
        branchName: user?.sucursalAsignada || user?.branchName || '',
        monthlyRevenue: summary.monthlyRevenue,
        monthlyRevenueChange: summary.monthlyRevenueChange,
        previousMonthRevenue: summary.previousMonthRevenue,
        todayDeliveriesCount: agenda.deliveries.length,
        todayDeliveriesCompleted: entregasCompletadas,
        todayDeliveriesPending: agenda.deliveries.length - entregasCompletadas,
        todayReturnsCount: agenda.returns.length,
        todayReturnsReceived: devolucionesRecibidas,
        todayReturnsPending: agenda.returns.length - devolucionesRecibidas,
        todayDeliveriesList: agenda.deliveries,
        todayReturnsList: agenda.returns,
        weeklyActivity: adminDashboardService.getWeeklyActivity(user),
        fleet: {
          totalVehicles: vehicles.length,
          availableVehicles: summary.availableVehicles,
          rentedVehicles: summary.rentedVehicles,
          maintenanceVehicles: mantenimiento,
          occupancyRate: summary.occupancyRate,
        },
        attentionNeeded: {
          pendingDocuments: documentosPendientes.length,
          pendingDocsList: documentosPendientes,
          openIncidents: incidenciasAbiertas,
          pendingPayments: pagosPendientes,
          expiringVehicleDocs: 0,
          allClear: documentosPendientes.length === 0 && incidenciasAbiertas === 0 && pagosPendientes === 0,
        },
      })
      setLastSync(new Date())
    } catch (error) {
      console.error('No se pudo cargar el tablero:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, 30000)
    window.addEventListener('focus', refresh)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', refresh)
    }
  }, [refresh])

  return { data, loading, lastSync, refresh }
}
