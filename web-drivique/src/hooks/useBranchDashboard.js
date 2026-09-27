import { useState, useEffect, useCallback } from 'react'
import { adminDashboardService } from '../services/adminDashboardService'
import { documentVerificationService } from '../services/documentVerificationService'
import { incidentManagementService } from '../services/incidentManagementService'
import { reservationManagementService } from '../services/reservationManagementService'
import { vehicleManagementService } from '../services/vehicleManagementService'

export const MOCK_SCHEDULE_BY_DATE = {
  '2026-09-25': {
    deliveries: [
      {
        id: 'RES-8821',
        codigo: 'RES-8821',
        hora: '08:30 AM',
        tipo: 'entrega',
        clienteNombre: 'Carlos Restrepo',
        clienteTelefono: '+57 310 456 7890',
        vehiculoNombre: 'Toyota Corolla',
        vehiculoPlaca: 'ABC-123',
        vehiculoCategoria: 'Sedán',
        estado: 'CONFIRMADA',
      },
      {
        id: 'RES-8824',
        codigo: 'RES-8824',
        hora: '10:15 AM',
        tipo: 'entrega',
        clienteNombre: 'Camila Montoya',
        clienteTelefono: '+57 315 890 1234',
        vehiculoNombre: 'Mazda CX-5',
        vehiculoPlaca: 'KLS-849',
        vehiculoCategoria: 'SUV',
        estado: 'PENDIENTE_VALIDACION',
      },
      {
        id: 'RES-8830',
        codigo: 'RES-8830',
        hora: '02:00 PM',
        tipo: 'entrega',
        clienteNombre: 'Alejandro Morales',
        clienteTelefono: '+57 300 567 8901',
        vehiculoNombre: 'Chevrolet Tracker',
        vehiculoPlaca: 'MXP-492',
        vehiculoCategoria: 'SUV',
        estado: 'CONFIRMADA',
      },
    ],
    returns: [
      {
        id: 'RES-8799',
        codigo: 'RES-8799',
        hora: '11:00 AM',
        tipo: 'devolucion',
        clienteNombre: 'Juan Manuel Gómez',
        clienteTelefono: '+57 312 345 6789',
        vehiculoNombre: 'Nissan Kicks',
        vehiculoPlaca: 'ZTR-771',
        vehiculoCategoria: 'SUV Compacto',
        estado: 'ACTIVA',
      },
      {
        id: 'RES-8802',
        codigo: 'RES-8802',
        hora: '04:30 PM',
        tipo: 'devolucion',
        clienteNombre: 'Laura Sofía Silva',
        clienteTelefono: '+57 318 901 2345',
        vehiculoNombre: 'Kia Cerato',
        vehiculoPlaca: 'BOG-992',
        vehiculoCategoria: 'Sedán',
        estado: 'ACTIVA',
      },
    ],
  },
  '2026-09-24': {
    deliveries: [
      {
        id: 'RES-8780',
        codigo: 'RES-8780',
        hora: '09:00 AM',
        tipo: 'entrega',
        clienteNombre: 'Fernando Vargas',
        clienteTelefono: '+57 311 222 3344',
        vehiculoNombre: 'Renault Duster',
        vehiculoPlaca: 'HJK-342',
        vehiculoCategoria: 'SUV',
        estado: 'COMPLETADA',
      },
      {
        id: 'RES-8785',
        codigo: 'RES-8785',
        hora: '03:30 PM',
        tipo: 'entrega',
        clienteNombre: 'Mariana Ríos',
        clienteTelefono: '+57 301 999 8877',
        vehiculoNombre: 'Nissan Sentra',
        vehiculoPlaca: 'LKP-881',
        vehiculoCategoria: 'Sedán',
        estado: 'COMPLETADA',
      },
    ],
    returns: [
      {
        id: 'RES-8772',
        codigo: 'RES-8772',
        hora: '10:00 AM',
        tipo: 'devolucion',
        clienteNombre: 'Mateo Jaramillo',
        clienteTelefono: '+57 320 555 4433',
        vehiculoNombre: 'Hyundai Tucson',
        vehiculoPlaca: 'HJT-449',
        vehiculoCategoria: 'SUV',
        estado: 'COMPLETADA',
      },
      {
        id: 'RES-8775',
        codigo: 'RES-8775',
        hora: '01:15 PM',
        tipo: 'devolucion',
        clienteNombre: 'Andrea Cepeda',
        clienteTelefono: '+57 314 666 7788',
        vehiculoNombre: 'Chevrolet Onix',
        vehiculoPlaca: 'QWE-102',
        vehiculoCategoria: 'Hatchback',
        estado: 'COMPLETADA',
      },
      {
        id: 'RES-8779',
        codigo: 'RES-8779',
        hora: '05:00 PM',
        tipo: 'devolucion',
        clienteNombre: 'Daniel Ospina',
        clienteTelefono: '+57 302 111 2233',
        vehiculoNombre: 'Toyota Fortuner',
        vehiculoPlaca: 'RTY-994',
        vehiculoCategoria: '4x4',
        estado: 'COMPLETADA',
      },
    ],
  },
  '2026-09-26': {
    deliveries: [
      {
        id: 'RES-8840',
        codigo: 'RES-8840',
        hora: '08:00 AM',
        tipo: 'entrega',
        clienteNombre: 'Sofía Vergara',
        clienteTelefono: '+57 310 777 8899',
        vehiculoNombre: 'Mazda 3',
        vehiculoPlaca: 'MZD-112',
        vehiculoCategoria: 'Sedán',
        estado: 'CONFIRMADA',
      },
      {
        id: 'RES-8842',
        codigo: 'RES-8842',
        hora: '11:30 AM',
        tipo: 'entrega',
        clienteNombre: 'Santiago Castro',
        clienteTelefono: '+57 316 444 5566',
        vehiculoNombre: 'Chevrolet Tracker',
        vehiculoPlaca: 'MXP-492',
        vehiculoCategoria: 'SUV',
        estado: 'CONFIRMADA',
      },
      {
        id: 'RES-8845',
        codigo: 'RES-8845',
        hora: '01:00 PM',
        tipo: 'entrega',
        clienteNombre: 'Paula Restrepo',
        clienteTelefono: '+57 305 333 2211',
        vehiculoNombre: 'Kia Sportage',
        vehiculoPlaca: 'KSP-554',
        vehiculoCategoria: 'SUV',
        estado: 'DOCUMENTO_PENDIENTE',
      },
      {
        id: 'RES-8850',
        codigo: 'RES-8850',
        hora: '04:00 PM',
        tipo: 'entrega',
        clienteNombre: 'Gabriel Beltrán',
        clienteTelefono: '+57 318 888 9900',
        vehiculoNombre: 'Volkswagen Jetta',
        vehiculoPlaca: 'VWJ-789',
        vehiculoCategoria: 'Sedán',
        estado: 'CONFIRMADA',
      },
    ],
    returns: [
      {
        id: 'RES-8835',
        codigo: 'RES-8835',
        hora: '02:30 PM',
        tipo: 'devolucion',
        clienteNombre: 'Carlos Restrepo',
        clienteTelefono: '+57 310 456 7890',
        vehiculoNombre: 'Toyota Corolla',
        vehiculoPlaca: 'ABC-123',
        vehiculoCategoria: 'Sedán',
        estado: 'CONFIRMADA',
      },
    ],
  },
  '2026-09-27': {
    deliveries: [
      {
        id: 'RES-8860',
        codigo: 'RES-8860',
        hora: '10:00 AM',
        tipo: 'entrega',
        clienteNombre: 'Valeria Osorio',
        clienteTelefono: '+57 312 999 0011',
        vehiculoNombre: 'Renault Logan',
        vehiculoPlaca: 'RLG-301',
        vehiculoCategoria: 'Sedán',
        estado: 'CONFIRMADA',
      },
    ],
    returns: [
      {
        id: 'RES-8855',
        codigo: 'RES-8855',
        hora: '09:00 AM',
        tipo: 'devolucion',
        clienteNombre: 'Alejandro Morales',
        clienteTelefono: '+57 300 567 8901',
        vehiculoNombre: 'Chevrolet Tracker',
        vehiculoPlaca: 'MXP-492',
        vehiculoCategoria: 'SUV',
        estado: 'CONFIRMADA',
      },
      {
        id: 'RES-8858',
        codigo: 'RES-8858',
        hora: '03:00 PM',
        tipo: 'devolucion',
        clienteNombre: 'Camila Montoya',
        clienteTelefono: '+57 315 890 1234',
        vehiculoNombre: 'Mazda CX-5',
        vehiculoPlaca: 'KLS-849',
        vehiculoCategoria: 'SUV',
        estado: 'CONFIRMADA',
      },
    ],
  },
}

export function getScheduleForDate(dateStr) {
  if (MOCK_SCHEDULE_BY_DATE[dateStr]) {
    return MOCK_SCHEDULE_BY_DATE[dateStr]
  }
  return { deliveries: [], returns: [] }
}

export function getScheduleForRange(startStr, endStr) {
  const allDates = Object.keys(MOCK_SCHEDULE_BY_DATE).filter(
    (d) => d >= startStr && d <= endStr
  )

  let deliveries = []
  let returns = []

  allDates.forEach((dStr) => {
    const dayData = MOCK_SCHEDULE_BY_DATE[dStr]
    if (dayData) {
      if (dayData.deliveries) {
        deliveries = deliveries.concat(
          dayData.deliveries.map((item) => ({ ...item, fecha: dStr }))
        )
      }
      if (dayData.returns) {
        returns = returns.concat(
          dayData.returns.map((item) => ({ ...item, fecha: dStr }))
        )
      }
    }
  })

  return { deliveries, returns }
}

export function useBranchDashboard(user) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState(new Date())

  const refresh = useCallback(() => {
    const isBranchManager =
      user?.rol === 'encargado' || user?.rol === 'branch_manager' || user?.rol === 'encargado_sucursal'
    const branchName =
      user?.sucursalAsignada || user?.sucursalId || user?.sucursal || 'Alamo Bogotá - Aeropuerto'

    const allVehicles = vehicleManagementService.list() || []
    const branchVehicles = isBranchManager
      ? allVehicles.filter(
          (v) =>
            (v.sucursal || '').toLowerCase().includes(branchName.toLowerCase()) ||
            (branchName || '').toLowerCase().includes((v.sucursal || '').toLowerCase())
        )
      : allVehicles

    const totalVehicles = branchVehicles.length >= 5 ? branchVehicles.length : 5
    const availableVehicles =
      branchVehicles.length >= 5
        ? branchVehicles.filter(
            (v) =>
              v.disponible !== false &&
              v.estadoFlota !== 'EN_MANTENIMIENTO' &&
              v.estadoFlota !== 'mantenimiento' &&
              !v.reservasActivas
          ).length
        : 2
    const rentedVehicles =
      branchVehicles.length >= 5
        ? branchVehicles.filter((v) => v.reservasActivas > 0 || v.disponible === false).length
        : 2
    const maintenanceVehicles =
      branchVehicles.length >= 5
        ? branchVehicles.filter(
            (v) => v.estadoFlota === 'EN_MANTENIMIENTO' || v.estadoFlota === 'mantenimiento'
          ).length
        : 1

    const occupancyRate = Math.round((rentedVehicles / totalVehicles) * 100)

    const docs = documentVerificationService.list(user) || []
    const pendingDocs = docs.filter((d) => d.estado === 'pendiente').length || 2

    const incidents = incidentManagementService.listForUser(user) || []
    const openIncidents =
      incidents.filter((i) =>
        ['recibido', 'en_revision', 'en_reparacion'].includes(String(i.estado || '').toLowerCase())
      ).length || 1

    const reservations = reservationManagementService.list(user) || []
    const pendingPayments = reservations.filter(
      (r) =>
        r.pagoEstado !== 'aprobado' &&
        !['cancelada', 'cancelada_por_tiempo'].includes(String(r.estado || '').toLowerCase()) &&
        String(r.pasarela || r.metodoPago || '').toLowerCase().includes('efectivo')
    ).length

    const summary = adminDashboardService.getSummary(user) || {}
    const todaySched = MOCK_SCHEDULE_BY_DATE['2026-09-25']
    const todayDeliveriesList = todaySched.deliveries
    const todayReturnsList = todaySched.returns

    const deliveriesCompleted = todayDeliveriesList.filter((d) =>
      ['CONFIRMADA', 'COMPLETADA', 'ENTREGADA', 'completada', 'confirmada'].includes(
        String(d.estado || '').toUpperCase()
      )
    ).length
    const deliveriesPending = Math.max(0, todayDeliveriesList.length - deliveriesCompleted)

    const returnsReceived = todayReturnsList.filter((r) =>
      ['RECIBIDO', 'RECIBIDA', 'COMPLETADA', 'FINALIZADA', 'recibida', 'completada'].includes(
        String(r.estado || '').toUpperCase()
      )
    ).length
    const returnsPending = Math.max(0, todayReturnsList.length - returnsReceived)

    const weeklyActivity = adminDashboardService.getWeeklyActivity(user) || []
    const expiringVehicleDocs = 1

    setData({
      branchName,
      monthlyRevenue: summary.monthlyRevenue || 45200000,
      todayDeliveriesCount: todayDeliveriesList.length,
      todayDeliveriesCompleted: deliveriesCompleted,
      todayDeliveriesPending: deliveriesPending,
      todayReturnsCount: todayReturnsList.length,
      todayReturnsReceived: returnsReceived,
      todayReturnsPending: returnsPending,
      todayDeliveriesList,
      todayReturnsList,
      weeklyActivity,
      fleet: {
        totalVehicles,
        availableVehicles,
        rentedVehicles,
        maintenanceVehicles,
        occupancyRate,
      },
      attentionNeeded: {
        pendingDocuments: pendingDocs,
        openIncidents: openIncidents,
        pendingPayments: pendingPayments,
        expiringVehicleDocs: expiringVehicleDocs,
        allClear:
          pendingDocs === 0 &&
          openIncidents === 0 &&
          pendingPayments === 0 &&
          expiringVehicleDocs === 0,
      },
    })
    setLastSync(new Date())
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, 3000)
    window.addEventListener('focus', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  return { data, loading, lastSync, refresh }
}
