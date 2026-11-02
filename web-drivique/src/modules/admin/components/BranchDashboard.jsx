import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaTimes } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { useBranchDashboard, getScheduleForRange } from '../../../hooks/useBranchDashboard'
import { reservationManagementService } from '../../../services/reservationManagementService'
import { vehicleManagementService } from '../../../services/vehicleManagementService'
import { useBranchNotifications } from '../../../hooks/useBranchNotifications'
import ManagementSidebar from './ManagementSidebar'

import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import KpiDetailModal from './KpiDetailModal'

import './BranchDashboard.css'


import { TODAY_STR, parseISOToDate, formatDateToISO, formatDateLabel } from './branchDashboardHelpers'
import SelectedScheduleItem from './BranchDashboard/SelectedScheduleItem'
import BranchRightStack from './BranchDashboard/BranchRightStack'
import BranchLeftStack from './BranchDashboard/BranchLeftStack'
import BranchKpiGrid from './BranchDashboard/BranchKpiGrid'
import BranchGradientHeroBanner from './BranchDashboard/BranchGradientHeroBanner'
import BranchTopGlobalBar from './BranchDashboard/BranchTopGlobalBar'

export default function BranchDashboard({ branchOnly = true }) {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const usuario = useAuthStore((state) => state.usuario)
  const navigate = useNavigate()

  const { data: dashboardData, loading } = useBranchDashboard(usuario)
  const [activeTab, setActiveTab] = useState('entregas') // 'entregas' | 'devoluciones'
  const [selectedScheduleItem, setSelectedScheduleItem] = useState(null)
  // Reserva completa (la agenda solo trae un resumen) y su vehículo, ambos desde el servidor
  const reservaDrawer = selectedScheduleItem
    ? reservationManagementService.list().find((r) => String(r.id) === String(selectedScheduleItem.reservaId))
    : null
  const vehiculoDrawer = reservaDrawer ? vehicleManagementService.getById(reservaDrawer.vehiculoId) : null
  const [searchQuery] = useState('')

  // Rango de Fechas con objetos Date para el DatePicker Visibilidad Permanente (Inline)
  const [startDateObj, setStartDateObj] = useState(parseISOToDate(TODAY_STR))
  const [endDateObj, setEndDateObj] = useState(parseISOToDate(TODAY_STR))

  const [activeKpiMenu, setActiveKpiMenu] = useState(null)
  const [activeModalMetric, setActiveModalMetric] = useState(null)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Patrón Controller/Hook: Gestión desacoplada de notificaciones operativas
  const {
    notifications,
    unreadCount: unreadNotifCount,
    markAsRead: handleMarkNotificationRead,
    markAllAsRead: handleMarkAllNotificationsRead,
  } = useBranchNotifications(usuario, dashboardData)

  const lastActiveElementRef = useRef(null)
  const notifBtnRef = useRef(null)

  const reservationsRoute = '/encargado/reservations'
  const incidentsRoute = '/encargado/incidents'
  const documentsRoute = '/encargado/documents'
  const vehiclesRoute = '/encargado/vehicles'

  const startDateStr = useMemo(() => formatDateToISO(startDateObj), [startDateObj])
  const endDateStr = useMemo(() => formatDateToISO(endDateObj || startDateObj), [endDateObj, startDateObj])

  const scheduleForRange = useMemo(() => {
    return getScheduleForRange(startDateStr, endDateStr)
  }, [startDateStr, endDateStr, dashboardData])

  const deliveriesForRange = useMemo(() => scheduleForRange.deliveries || [], [scheduleForRange])
  const returnsForRange = useMemo(() => scheduleForRange.returns || [], [scheduleForRange])

  const handleToggleKpiMenu = (id, e) => {
    e.stopPropagation()
    setActiveKpiMenu((prev) => (prev === id ? null : id))
  }


  const handleNotificationClick = (notif) => {
    handleMarkNotificationRead(notif.id)
    setIsNotificationsOpen(false)
    if (notif.route) {
      navigate(notif.route, { state: notif.navigationState })
    }
  }

  const getKpiDataForExport = (metricKey) => {
    const branchName = dashboardData?.branchName || ''
    const reservas = reservationManagementService.list()
    const ahora = new Date()
    const money = (value) => `$ ${Number(value || 0).toLocaleString('es-CO')} COP`
    const estadoTexto = (estado) => String(estado || '').replace('_', ' ').toUpperCase()

    if (metricKey === 'ingresos') {
      const delMes = reservas.filter((r) => r.pagoEstado === 'aprobado'
        && new Date(r.fechaPagoConfirmado || r.fechaCreacion).getMonth() === ahora.getMonth()
        && new Date(r.fechaPagoConfirmado || r.fechaCreacion).getFullYear() === ahora.getFullYear())
      return {
        title: t('dashboard.export.incomeTitle', 'Ingresos del Mes'),
        filename: 'reporte_ingresos_mes',
        headers: [
          t('dashboard.export.incomeCode', 'Código Reserva'),
          t('dashboard.export.incomeClient', 'Cliente'),
          t('dashboard.export.incomeVehicle', 'Vehículo'),
          t('dashboard.export.incomeStart', 'Fecha Inicio'),
          t('dashboard.export.incomeEnd', 'Fecha Fin'),
          t('dashboard.export.incomeAmount', 'Monto Total'),
          t('dashboard.export.incomeStatus', 'Estado'),
        ],
        rows: delMes.map((r) => [r.codigo, r.clienteNombre, `${r.vehiculoNombre} (${r.vehiculoPlaca})`, r.fechaInicio, r.fechaFin, money(r.totalCOP), estadoTexto(r.estado)]),
        kpis: [
          { label: t('dashboard.export.totalIncome', 'Total Ingresos Mes'), value: money(dashboardData?.monthlyRevenue) },
          { label: t('dashboard.export.branch', 'Sucursal'), value: branchName },
        ],
      }
    }

    if (metricKey === 'entregas' || metricKey === 'devoluciones') {
      const esEntrega = metricKey === 'entregas'
      const lista = (esEntrega ? deliveriesForRange : returnsForRange) || []
      return {
        title: esEntrega ? t('dashboard.export.deliveriesTitle', 'Entregas de Hoy') : t('dashboard.export.returnsTitle', 'Devoluciones de Hoy'),
        filename: esEntrega ? 'reporte_entregas_hoy' : 'reporte_devoluciones_hoy',
        headers: [
          t('dashboard.export.resId', 'Código Reserva'),
          t('dashboard.export.time', 'Hora Programada'),
          t('dashboard.export.client', 'Cliente'),
          t('dashboard.export.phone', 'Teléfono'),
          t('dashboard.export.vehicle', 'Nombre Vehículo'),
          t('dashboard.export.plate', 'Placa'),
          esEntrega ? t('dashboard.export.deliveryStatus', 'Estado Entrega') : t('dashboard.export.returnStatus', 'Estado Devolución'),
        ],
        rows: lista.map((item) => [item.codigo, item.hora, item.clienteNombre, item.clienteTelefono, item.vehiculoNombre, item.vehiculoPlaca, estadoTexto(item.estado)]),
        kpis: esEntrega
          ? [
              { label: t('dashboard.export.totalScheduled', 'Total Programadas'), value: String(dashboardData?.todayDeliveriesCount ?? 0) },
              { label: t('dashboard.export.completedDeliveries', 'Entregadas/Completadas'), value: String(dashboardData?.todayDeliveriesCompleted ?? 0) },
              { label: t('dashboard.export.pending', 'Pendientes'), value: String(dashboardData?.todayDeliveriesPending ?? 0) },
            ]
          : [
              { label: t('dashboard.export.totalScheduled', 'Total Programadas'), value: String(dashboardData?.todayReturnsCount ?? 0) },
              { label: t('dashboard.export.received', 'Recibidas'), value: String(dashboardData?.todayReturnsReceived ?? 0) },
              { label: t('dashboard.export.pending', 'Pendientes'), value: String(dashboardData?.todayReturnsPending ?? 0) },
            ],
      }
    }

    if (metricKey === 'ocupacion') {
      const f = dashboardData?.fleet || {}
      const vehiculos = vehicleManagementService.list()
      return {
        title: t('dashboard.export.fleetOccupancy', 'Ocupación de Flota'),
        filename: 'reporte_ocupacion_flota',
        headers: [
          t('dashboard.export.plate', 'Placa'),
          t('dashboard.export.vehicle', 'Nombre Vehículo'),
          t('dashboard.export.category', 'Categoría'),
          t('dashboard.export.branch', 'Sucursal'),
          t('dashboard.export.opStatus', 'Estado Operativo'),
          t('dashboard.export.assignedRes', 'Código Reserva Asignada'),
        ],
        rows: vehiculos.map((v) => {
          const activa = reservas.find((r) => String(r.vehiculoId) === String(v.id) && r.estado !== 'cancelada' && r.estado !== 'finalizada')
          return [v.placa, v.nombre, v.categoria, v.sucursal, estadoTexto(v.estadoEfectivo), activa ? activa.codigo : t('hc2.sin_reserva', 'Sin reserva')]
        }),
        kpis: [
          { label: t('dashboard.export.occupancyRate', 'Tasa de Ocupación'), value: `${f.occupancyRate ?? 0}%` },
          { label: t('dashboard.export.occupied', 'Ocupados'), value: `${f.rentedVehicles ?? 0} de ${f.totalVehicles ?? 0}` },
          { label: t('dashboard.export.available', 'Disponibles'), value: String(f.availableVehicles ?? 0) },
          { label: t('dashboard.export.maintenance', 'En Mantenimiento'), value: String(f.maintenanceVehicles ?? 0) },
        ],
      }
    }

    return { title: t('hc.metrica_operativa', 'Métrica Operativa'), filename: 'reporte', headers: [], rows: [], kpis: [] }
  }

  const handleOpenKpiDetail = (metricKey) => {
    setActiveKpiMenu(null)
    setActiveModalMetric(metricKey)
  }

  const handleExportKpiExcel = (metricKey) => {
    setActiveKpiMenu(null)
    const data = getKpiDataForExport(metricKey)
    exportExcel({
      title: `Reporte — ${data.title}`,
      headers: data.headers,
      rows: data.rows,
      kpis: data.kpis,
      filename: `${data.filename}_${TODAY_STR}`,
    })
    setToastMessage(`Reporte de ${data.title} exportado a Excel exitosamente.`)
  }

  const handleExportKpiPdf = (metricKey) => {
    setActiveKpiMenu(null)
    const data = getKpiDataForExport(metricKey)
    exportPdf({
      title: `Reporte Oficial — ${data.title}`,
      subtitle: t('hc3.branch_subtitle', { defaultValue: 'Sucursal: {{sucursal}}', sucursal: dashboardData?.branchName || '' }),
      headers: data.headers,
      rows: data.rows,
      kpis: data.kpis,
    })
  }

  const handlePrintKpi = (metricKey) => {
    setActiveKpiMenu(null)
    const data = getKpiDataForExport(metricKey)
    printTable({
      title: `Reporte — ${data.title}`,
      headers: data.headers,
      rows: data.rows,
      kpis: data.kpis,
    })
  }

  const handleOpenDrawer = (item, e) => {
    lastActiveElementRef.current = e?.currentTarget || document.activeElement
    setSelectedScheduleItem(item)
  }

  const handleCloseDrawer = () => {
    setSelectedScheduleItem(null)
    if (lastActiveElementRef.current) {
      setTimeout(() => {
        lastActiveElementRef.current?.focus()
      }, 50)
    }
  }

  const getSectionTitle = (startStr, endStr) => {
    if (startStr === endStr) {
      return `${t('dashboard.scheduleFor', 'Programación del')} ${formatDateLabel(startStr)}`
    }
    return `${t('dashboard.scheduleFor', 'Programación del')} ${formatDateLabel(startStr)} ${t('common.to', 'al')} ${formatDateLabel(endStr)}`
  }

  const currentList = useMemo(() => {
    const rawList = activeTab === 'entregas' ? deliveriesForRange : returnsForRange
    if (!searchQuery.trim()) return rawList
    const q = searchQuery.toLowerCase()
    return rawList.filter((item) => {
      const name = (item.clienteNombre || '').toLowerCase()
      const veh = (item.vehiculoNombre || '').toLowerCase()
      const code = (item.codigo || '').toLowerCase()
      return name.includes(q) || veh.includes(q) || code.includes(q)
    })
  }, [activeTab, deliveriesForRange, returnsForRange, searchQuery])

  // Datos para Recharts Bar Chart
  const hourlyData = useMemo(() => {
    const slots = [
      { label: '8am', hour24: 8 },
      { label: '9am', hour24: 9 },
      { label: '10am', hour24: 10 },
      { label: '11am', hour24: 11 },
      { label: '12pm', hour24: 12 },
      { label: '1pm', hour24: 13 },
      { label: '2pm', hour24: 14 },
      { label: '3pm', hour24: 15 },
      { label: '4pm', hour24: 16 },
      { label: '5pm', hour24: 17 },
    ]

    const parseItemHour = (horaStr) => {
      if (!horaStr) return 8
      const match = horaStr.match(/(\d+):(\d+)\s*(AM|PM)?/i)
      if (!match) return 8
      let h = parseInt(match[1], 10)
      const period = match[3] ? match[3].toUpperCase() : ''
      if (period === 'PM' && h < 12) h += 12
      if (period === 'AM' && h === 12) h = 0
      return h
    }

    return slots.map((slot) => {
      const delCount = deliveriesForRange.filter((d) => parseItemHour(d.hora) === slot.hour24).length
      const retCount = returnsForRange.filter((r) => parseItemHour(r.hora) === slot.hour24).length
      return {
        label: slot.label,
        deliveries: delCount,
        returns: retCount,
        total: delCount + retCount,
      }
    })
  }, [deliveriesForRange, returnsForRange])

  useEffect(() => {
    const handleGlobalClickAndKeys = (e) => {
      if (e.key === 'Escape') {
        setIsNotificationsOpen(false)
        setActiveKpiMenu(null)
      }
      if (e.type === 'mousedown') {
        if (!e.target.closest('.branch-kpi-menu-wrapper')) {
          setActiveKpiMenu(null)
        }
      }
    }

    document.addEventListener('keydown', handleGlobalClickAndKeys)
    document.addEventListener('mousedown', handleGlobalClickAndKeys)

    return () => {
      document.removeEventListener('keydown', handleGlobalClickAndKeys)
      document.removeEventListener('mousedown', handleGlobalClickAndKeys)
    }
  }, [])

  const formatCOP = (val) => {
    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(val || 0)
    } catch {
      return `$ ${val}`
    }
  }

  const getInitials = (name) => {
    if (!name) return 'CL'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  if (loading || !dashboardData) {
    return (
      <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
        <ManagementSidebar branchOnly={branchOnly} />
        <main className="management-main branch-dashboard-main">
          <div className="branch-skeleton-header">
            <div className="branch-skeleton-block" style={{ width: 140, height: 16 }} />
            <div className="branch-skeleton-block" style={{ width: 280, height: 32, marginTop: 8 }} />
          </div>
          <div className="branch-kpi-grid">
            <div className="branch-skeleton-block" style={{ height: 130 }} />
            <div className="branch-skeleton-block" style={{ height: 130 }} />
            <div className="branch-skeleton-block" style={{ height: 130 }} />
            <div className="branch-skeleton-block" style={{ height: 130 }} />
          </div>
        </main>
      </div>
    )
  }

  const { fleet, attentionNeeded } = dashboardData

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={branchOnly} />

      <main className="management-main branch-dashboard-main">
        {toastMessage && (
          <div className="branch-toast-banner" role="alert">
            <span>{toastMessage}</span>
            <button
              type="button"
              className="branch-toast-close"
              onClick={() => setToastMessage(null)}
            >
              <FaTimes aria-hidden="true" />
            </button>
          </div>
        )}

        {/* BARRA SUPERIOR GLOBAL CON HERRAMIENTAS Y NOTIFICACIONES */}
        <BranchTopGlobalBar dashboardData={dashboardData} handleMarkAllNotificationsRead={handleMarkAllNotificationsRead} handleMarkNotificationRead={handleMarkNotificationRead} handleNotificationClick={handleNotificationClick} isNotificationsOpen={isNotificationsOpen} notifBtnRef={notifBtnRef} notifications={notifications} setIsNotificationsOpen={setIsNotificationsOpen} t={t} unreadNotifCount={unreadNotifCount} usuario={usuario} />

        {/* 1. ENCABEZADO CON FRANJA DE DEGRADADO Y TEXTO EN BLANCO ALTO CONTRASTE */}
        <BranchGradientHeroBanner dashboardData={dashboardData} incidentsRoute={incidentsRoute} navigate={navigate} reservationsRoute={reservationsRoute} t={t} />

        {/* 2. TARJETAS KPI (Ingresos, Entregas, Devoluciones, Ocupación) */}
        <BranchKpiGrid activeKpiMenu={activeKpiMenu} dashboardData={dashboardData} fleet={fleet} formatCOP={formatCOP} handleExportKpiExcel={handleExportKpiExcel} handleExportKpiPdf={handleExportKpiPdf} handleOpenKpiDetail={handleOpenKpiDetail} handlePrintKpi={handlePrintKpi} handleToggleKpiMenu={handleToggleKpiMenu} t={t} />

        {/* 3. COLUMNAS PRINCIPALES (1.7fr IZQUIERDA / 1fr DERECHA) */}
        <section className="branch-columns-grid">
          {/* COLUMNA IZQUIERDA: GRÁFICO RECHARTS + TABLA OPERATIVA */}
          <BranchLeftStack activeTab={activeTab} currentList={currentList} deliveriesForRange={deliveriesForRange} endDateStr={endDateStr} getSectionTitle={getSectionTitle} handleOpenDrawer={handleOpenDrawer} hourlyData={hourlyData} navigate={navigate} reservationsRoute={reservationsRoute} setActiveTab={setActiveTab} startDateStr={startDateStr} t={t} />

          {/* COLUMNA DERECHA: CALENDARIO VISIBLE TODO EL TIEMPO + REQUIERE ATENCIÓN + FLOTA */}
          <BranchRightStack attentionNeeded={attentionNeeded} documentsRoute={documentsRoute} endDateStr={endDateStr} incidentsRoute={incidentsRoute} navigate={navigate} setEndDateObj={setEndDateObj} setStartDateObj={setStartDateObj} startDateStr={startDateStr} t={t} vehiclesRoute={vehiclesRoute} />
        </section>
      </main>

      {/* MODAL CENTRADO DE DETALLE DE RESERVA */}
      {selectedScheduleItem && (
        <SelectedScheduleItem activeTab={activeTab} dashboardData={dashboardData} formatCOP={formatCOP} getInitials={getInitials} handleCloseDrawer={handleCloseDrawer} reservaDrawer={reservaDrawer} selectedScheduleItem={selectedScheduleItem} t={t} vehiculoDrawer={vehiculoDrawer} />
      )}

        {/* MODAL DETALLE DE MÉTRICA CON EXPORTACIÓN A EXCEL, PDF, IMPRESIÓN Y NAVEGACIÓN A REPORTES */}
        {activeModalMetric && (
          <KpiDetailModal
            metricKey={activeModalMetric}
            metricTitle={getKpiDataForExport(activeModalMetric).title}
            kpiData={getKpiDataForExport(activeModalMetric)}
            onClose={() => setActiveModalMetric(null)}
            onGoToReports={() => {
              const currentMetric = activeModalMetric
              setActiveModalMetric(null)
              navigate('/encargado/reports', { state: { metric: currentMetric } })
            }}
          />
        )}
    </div>
  )
}
