import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaSearch,
  FaBell,
  FaCalendarAlt,
  FaDollarSign,
  FaCalendarCheck,
  FaUndo,
  FaCar,
  FaTimes,
  FaArrowUp,
  FaCheckCircle,
  FaClock,
  FaClipboardList,
  FaIdCard,
  FaExclamationTriangle,
  FaCashRegister,
  FaCheckDouble,
  FaChevronRight,
  FaPlus,
  FaEllipsisV,
  FaEye,
  FaReceipt,
  FaPhone,
  FaChartBar,
  FaTimesCircle,
  FaBellSlash,
  FaInfoCircle,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { useBranchDashboard, getScheduleForRange } from '../../../hooks/useBranchDashboard'
import { useBranchNotifications } from '../../../hooks/useBranchNotifications'
import ManagementSidebar from './ManagementSidebar'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import KpiDetailModal from './KpiDetailModal'
import BranchNotificationModal from './BranchNotificationModal'
import './BranchDashboard.css'

const TODAY_STR = '2026-09-25'
const YESTERDAY_STR = '2026-09-24'
const TOMORROW_STR = '2026-09-26'

const getVehicleImage = (item) => {
  const name = (item?.vehiculoNombre || item?.vehiculo || '').toLowerCase()
  if (name.includes('corolla') || name.includes('toyota')) {
    return 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=600&q=80'
  }
  if (name.includes('cx-5') || name.includes('cx5') || name.includes('mazda cx')) {
    return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'
  }
  if (name.includes('tracker') || name.includes('chevrolet')) {
    return 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80'
  }
  if (name.includes('mazda 3') || name.includes('mazda3') || name.includes('mazda')) {
    return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80'
  }
  if (name.includes('sportage') || name.includes('kia')) {
    return 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80'
  }
  if (name.includes('jetta') || name.includes('volkswagen') || name.includes('vw')) {
    return 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80'
  }
  return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'
}

const getReservationStatusInfo = (rawStatus, t) => {
  const s = String(rawStatus || 'CONFIRMADA').trim().toUpperCase()

  if (['PENDIENTE', 'PENDIENTE_EFECTIVO', 'PENDIENTE_VALIDACION', 'DOCUMENTO_PENDIENTE'].includes(s) || s.includes('PENDIENTE')) {
    let sublabel = t('dashboard.status.pendingSub', 'Pendiente (Validación / Pago)')
    if (s === 'PENDIENTE_EFECTIVO') sublabel = t('dashboard.status.pendingCash', 'Pendiente (Pago en efectivo)')
    else if (s === 'PENDIENTE_VALIDACION' || s === 'DOCUMENTO_PENDIENTE') sublabel = t('dashboard.status.pendingDocs', 'Pendiente (Documentación)')
    
    return {
      visibleState: t('dashboard.status.pending', 'Pendiente'),
      internalStates: ['PENDIENTE', 'PENDIENTE_EFECTIVO', 'PENDIENTE_VALIDACION'],
      sublabel,
      badgeClass: 'branch-status-badge--amber',
      IconComp: FaClock,
    }
  }

  if (s === 'CONFIRMADA') {
    return {
      visibleState: t('dashboard.status.confirmed', 'Confirmada'),
      internalStates: ['CONFIRMADA'],
      sublabel: t('dashboard.status.confirmedSub', 'Aprobada y lista para entrega'),
      badgeClass: 'branch-status-badge--green',
      IconComp: FaCheckCircle,
    }
  }

  if (s === 'ACTIVA' || s === 'EN_CURSO' || s === 'EN CURSO') {
    return {
      visibleState: t('dashboard.status.active', 'En curso'),
      internalStates: ['ACTIVA'],
      sublabel: t('dashboard.status.activeSub', 'Vehículo entregado al cliente'),
      badgeClass: 'branch-status-badge--blue',
      IconComp: FaCar,
    }
  }

  if (s === 'COMPLETADA' || s === 'FINALIZADA' || s === 'RECIBIDA') {
    return {
      visibleState: t('dashboard.status.completed', 'Finalizada'),
      internalStates: ['COMPLETADA'],
      sublabel: t('dashboard.status.completedSub', 'Vehículo devuelto e inspeccionado'),
      badgeClass: 'branch-status-badge--teal',
      IconComp: FaCheckDouble,
    }
  }

  if (s === 'CANCELADA' || s === 'CANCELADA_POR_TIEMPO') {
    return {
      visibleState: t('dashboard.status.cancelled', 'Cancelada'),
      internalStates: ['CANCELADA', 'CANCELADA_POR_TIEMPO'],
      sublabel: s === 'CANCELADA_POR_TIEMPO' ? t('dashboard.status.cancelledTime', 'Expirada por tiempo') : t('dashboard.status.cancelledSub', 'Reserva anulada'),
      badgeClass: 'branch-status-badge--gray',
      IconComp: FaTimesCircle,
    }
  }

  return {
    visibleState: t('dashboard.status.confirmed', 'Confirmada'),
    internalStates: ['CONFIRMADA'],
    sublabel: t('dashboard.status.confirmedSub', 'Aprobada y lista para entrega'),
    badgeClass: 'branch-status-badge--green',
    IconComp: FaCheckCircle,
  }
}

const parseISOToDate = (str) => {
  if (!str) return new Date(2026, 8, 25)
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const formatDateToISO = (d) => {
  if (!d) return TODAY_STR
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '25/09/2026'
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3) return dateStr
  const [y, m, d] = parts
  const dayStr = String(d).padStart(2, '0')
  const monthStr = String(m).padStart(2, '0')
  return `${dayStr}/${monthStr}/${y}`
}

/* COMPONENTE NATIVO: CALENDARIO INLINE CON SELECCIÓN DE RANGO DE FECHAS */
function OperationalDateRangeCalendar({ startDateStr, endDateStr, onSelectRange }) {
  const { t } = useTranslation()
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(2026, 8, 1))

  const monthYearLabel = useMemo(() => {
    const monthNames = [
      t('common.months.january', 'Enero'), t('common.months.february', 'Febrero'), 
      t('common.months.march', 'Marzo'), t('common.months.april', 'Abril'), 
      t('common.months.may', 'Mayo'), t('common.months.june', 'Junio'),
      t('common.months.july', 'Julio'), t('common.months.august', 'Agosto'), 
      t('common.months.september', 'Septiembre'), t('common.months.october', 'Octubre'), 
      t('common.months.november', 'Noviembre'), t('common.months.december', 'Diciembre')
    ]
    return `${monthNames[currentMonthDate.getMonth()]} ${currentMonthDate.getFullYear()}`
  }, [currentMonthDate, t])

  const daysGrid = useMemo(() => {
    const year = currentMonthDate.getFullYear()
    const month = currentMonthDate.getMonth()

    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7
    const totalDays = new Date(year, month + 1, 0).getDate()
    const prevMonthTotalDays = new Date(year, month, 0).getDate()

    const days = []
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        dayNum: prevMonthTotalDays - i,
        isCurrentMonth: false,
        dateStr: null,
      })
    }
    for (let d = 1; d <= totalDays; d++) {
      const mStr = String(month + 1).padStart(2, '0')
      const dStr = String(d).padStart(2, '0')
      const dateStr = `${year}-${mStr}-${dStr}`
      days.push({
        dayNum: d,
        isCurrentMonth: true,
        dateStr,
      })
    }
    const remaining = (7 - (days.length % 7)) % 7
    for (let n = 1; n <= remaining; n++) {
      days.push({
        dayNum: n,
        isCurrentMonth: false,
        dateStr: null,
      })
    }
    return days
  }, [currentMonthDate])

  const handlePrevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleDayClick = (dayItem) => {
    if (!dayItem.isCurrentMonth || !dayItem.dateStr) return
    const clicked = dayItem.dateStr

    if (!startDateStr || (startDateStr && endDateStr && startDateStr !== endDateStr)) {
      onSelectRange(clicked, clicked)
    } else if (clicked < startDateStr) {
      onSelectRange(clicked, clicked)
    } else {
      onSelectRange(startDateStr, clicked)
    }
  }

  const weekHeaders = [
    t('common.daysShort.mon', 'Lu'), t('common.daysShort.tue', 'Ma'), 
    t('common.daysShort.wed', 'Mi'), t('common.daysShort.thu', 'Ju'), 
    t('common.daysShort.fri', 'Vi'), t('common.daysShort.sat', 'Sá'), 
    t('common.daysShort.sun', 'Do')
  ]

  return (
    <div className="native-inline-calendar">
      <div className="native-cal-header">
        <button type="button" className="native-cal-nav-btn" onClick={handlePrevMonth} title={t('common.prevMonth', 'Mes anterior')}>
          &lt;
        </button>
        <strong className="native-cal-title">{monthYearLabel}</strong>
        <button type="button" className="native-cal-nav-btn" onClick={handleNextMonth} title={t('common.nextMonth', 'Mes siguiente')}>
          &gt;
        </button>
      </div>

      <div className="native-cal-week-row">
        {weekHeaders.map((h) => (
          <span key={h} className="native-cal-week-head">{h}</span>
        ))}
      </div>

      <div className="native-cal-grid">
        {daysGrid.map((item, idx) => {
          if (!item.isCurrentMonth) {
            return (
              <div key={`disabled-${idx}`} className="native-cal-day native-cal-day--disabled">
                {item.dayNum}
              </div>
            )
          }

          const isStart = item.dateStr === startDateStr
          const isEnd = item.dateStr === endDateStr
          const isInRange =
            startDateStr &&
            endDateStr &&
            item.dateStr >= startDateStr &&
            item.dateStr <= endDateStr

          let cellClass = 'native-cal-day'
          if (isStart && isEnd) cellClass += ' native-cal-day--selected-single'
          else if (isStart) cellClass += ' native-cal-day--range-start'
          else if (isEnd) cellClass += ' native-cal-day--range-end'
          else if (isInRange) cellClass += ' native-cal-day--in-range'

          return (
            <button
              key={item.dateStr}
              type="button"
              className={cellClass}
              onClick={() => handleDayClick(item)}
            >
              {item.dayNum}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* COMPONENTE NATIVO: GRÁFICO SVG DE BARRAS DE CARGA OPERATIVA POR FRANJA HORARIA */
function OperationalHourlyBarChart({ hourlyData = [] }) {
  const { t } = useTranslation()
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const maxVal = useMemo(() => {
    const highest = Math.max(
      ...hourlyData.map((d) => Math.max(d.deliveries || 0, d.returns || 0)),
      3
    )
    return Math.ceil(highest / 3) * 3 || 3
  }, [hourlyData])

  const svgWidth = 560
  const svgHeight = 200
  const marginTop = 15
  const marginBottom = 32
  const marginLeft = 30
  const marginRight = 15

  const chartWidth = svgWidth - marginLeft - marginRight
  const chartHeight = svgHeight - marginTop - marginBottom

  const numSlots = hourlyData.length || 10
  const slotWidth = chartWidth / numSlots
  const barWidth = 7
  const barGap = 3

  const yTicks = [0, Math.round(maxVal / 3), Math.round((maxVal * 2) / 3), maxVal]

  return (
    <div className="native-barchart-wrapper" style={{ position: 'relative', width: '100%' }}>
      <div
        className="native-chart-legend"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '10px',
          fontSize: '11.5px',
          color: 'var(--texto-second, #64748b)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-primary, #2563eb)' }} />
          <span>{t('dashboard.labels.deliveries', 'Entregas')}</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          <span>{t('dashboard.labels.returns', 'Devoluciones')}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Y Gridlines */}
        {yTicks.map((tick) => {
          const yPos = marginTop + chartHeight * (1 - tick / maxVal)
          return (
            <g key={tick}>
              <line
                x1={marginLeft}
                y1={yPos}
                x2={svgWidth - marginRight}
                y2={yPos}
                stroke={tick === 0 ? 'var(--borde, #cbd5e1)' : 'var(--borde, #f1f5f9)'}
                strokeWidth={tick === 0 ? '1' : '1'}
                strokeDasharray={tick === 0 ? 'none' : '3 3'}
              />
              <text
                x={marginLeft - 8}
                y={yPos + 3.5}
                fill="var(--texto-second, #94a3b8)"
                fontSize="10"
                fontWeight="500"
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          )
        })}

        {/* Grouped Bars */}
        {hourlyData.map((item, idx) => {
          const groupCenterX = marginLeft + idx * slotWidth + slotWidth / 2
          const delVal = item.deliveries || 0
          const retVal = item.returns || 0

          const hDel = (delVal / maxVal) * chartHeight
          const yDel = marginTop + chartHeight - hDel
          const xDel = groupCenterX - barWidth - barGap / 2

          const hRet = (retVal / maxVal) * chartHeight
          const yRet = marginTop + chartHeight - hRet
          const xRet = groupCenterX + barGap / 2

          const isHovered = hoveredIndex === idx

          return (
            <g
              key={item.label}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              {isHovered && (
                <rect
                  x={groupCenterX - slotWidth / 2 + 2}
                  y={marginTop}
                  width={slotWidth - 4}
                  height={chartHeight}
                  fill="rgba(37, 99, 235, 0.04)"
                  rx="4"
                />
              )}

              {delVal > 0 && (
                <rect
                  x={xDel}
                  y={yDel}
                  width={barWidth}
                  height={hDel}
                  fill="var(--brand-primary, #2563eb)"
                  rx="2"
                  ry="2"
                />
              )}

              {retVal > 0 && (
                <rect
                  x={xRet}
                  y={yRet}
                  width={barWidth}
                  height={hRet}
                  fill="#10b981"
                  rx="2"
                  ry="2"
                />
              )}

              <text
                x={groupCenterX}
                y={svgHeight - 10}
                fill={isHovered ? 'var(--brand-primary, #2563eb)' : 'var(--texto-second, #64748b)'}
                fontSize="10.5"
                fontWeight={isHovered ? '700' : '500'}
                textAnchor="middle"
              >
                {item.label}
              </text>
            </g>
          )
        })}
      </svg>

      {hoveredIndex !== null && hourlyData[hoveredIndex] && (
        <div
          className="native-chart-tooltip"
          style={{
            position: 'absolute',
            top: '25px',
            left: `${((marginLeft + hoveredIndex * slotWidth + slotWidth / 2) / svgWidth) * 100}%`,
            transform: 'translateX(-50%)',
            background: 'var(--bg-tarjeta, #ffffff)',
            border: '1px solid var(--borde, #e2e8f0)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            padding: '6px 12px',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <strong style={{ display: 'block', fontSize: '11.5px', marginBottom: '3px', color: 'var(--texto-primary, #0f172a)' }}>
            {hourlyData[hoveredIndex].label}
          </strong>
          <div style={{ fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--brand-primary, #2563eb)' }}>
            <span>{t('dashboard.labels.deliveriesColon', 'Entregas:')}</span>
            <strong>{hourlyData[hoveredIndex].deliveries}</strong>
          </div>
          <div style={{ fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'center', color: '#10b981' }}>
            <span>{t('dashboard.labels.returnsColon', 'Devoluciones:')}</span>
            <strong>{hourlyData[hoveredIndex].returns}</strong>
          </div>
        </div>
      )}
    </div>
  )
}


export default function BranchDashboard({ branchOnly = true }) {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const usuario = useAuthStore((state) => state.usuario)
  const navigate = useNavigate()

  const { data: dashboardData, loading } = useBranchDashboard(usuario)
  const [activeTab, setActiveTab] = useState('entregas') // 'entregas' | 'devoluciones'
  const [selectedScheduleItem, setSelectedScheduleItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

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
    filter: notifFilter,
    setFilter: setNotifFilter,
    filteredNotifications,
    markAsRead: handleMarkNotificationRead,
    markAllAsRead: handleMarkAllNotificationsRead,
  } = useBranchNotifications(usuario, dashboardData)

  const drawerRef = useRef(null)
  const lastActiveElementRef = useRef(null)
  const notifRef = useRef(null)
  const notifBtnRef = useRef(null)

  const reservationsRoute = '/encargado/reservations'
  const incidentsRoute = '/encargado/incidents'
  const documentsRoute = '/encargado/documents'
  const cashRoute = '/encargado/cobro-sucursal'
  const vehiclesRoute = '/encargado/vehicles'

  const startDateStr = useMemo(() => formatDateToISO(startDateObj), [startDateObj])
  const endDateStr = useMemo(() => formatDateToISO(endDateObj || startDateObj), [endDateObj, startDateObj])

  const handleToggleKpiMenu = (id, e) => {
    e.stopPropagation()
    setActiveKpiMenu((prev) => (prev === id ? null : id))
  }

  const handleToggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev)
  }

  const handleNotificationClick = (notif) => {
    handleMarkNotificationRead(notif.id)
    setIsNotificationsOpen(false)
    if (notif.route) {
      navigate(notif.route, { state: notif.navigationState })
    }
  }

  const getKpiDataForExport = (metricKey) => {
    const branchName = dashboardData?.branchName || 'Alamo Bogotá - Aeropuerto'

    if (metricKey === 'ingresos') {
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
          t('dashboard.export.incomeStatus', 'Estado')
        ],
        rows: [
          ['RES-8920', 'Carlos Restrepo', 'Toyota Corolla (ABC-123)', '2026-09-20', '2026-09-25', '$ 1.250.000 COP', 'FINALIZADA'],
          ['RES-8918', 'Ana María Gómez', 'Chevrolet Tracker (MXP-492)', '2026-09-22', '2026-09-27', '$ 1.800.000 COP', 'EN CURSO'],
          ['RES-8915', 'Felipe Mendoza', 'Mazda CX-5 (KLS-849)', '2026-09-24', '2026-09-26', '$ 950.000 COP', 'CONFIRMADA'],
          ['RES-8910', 'Laura Sofía Ruiz', 'Renault Duster (JHK-201)', '2026-09-15', '2026-09-21', '$ 1.400.000 COP', 'FINALIZADA'],
          ['RES-8904', 'Diego Alexander Marín', 'Nissan Kicks (WER-902)', '2026-09-10', '2026-09-14', '$ 1.100.000 COP', 'FINALIZADA'],
        ],
        kpis: [
          { label: t('dashboard.export.totalIncome', 'Total Ingresos Mes'), value: '$ 45.200.000 COP' },
          { label: t('dashboard.export.growth', 'Crecimiento vs. Mes Anterior'), value: '+8.5%' },
          { label: t('dashboard.export.branch', 'Sucursal'), value: branchName },
        ],
      }
    }

    if (metricKey === 'entregas') {
      const rows = (deliveriesForRange || []).map((item) => [
        item.codigo || item.id || 'RES-8920',
        item.hora || '08:30 AM',
        item.clienteNombre || 'Cliente Registrado',
        item.clienteTelefono || item.telefono || '+57 310 456 7890',
        item.vehiculoNombre || 'Toyota Corolla',
        item.vehiculoPlaca || 'ABC-123',
        item.estado || 'COMPLETADA',
      ])
      return {
        title: t('dashboard.export.deliveriesTitle', 'Entregas de Hoy'),
        filename: 'reporte_entregas_hoy',
        headers: [
          t('dashboard.export.resId', 'Código Reserva'), 
          t('dashboard.export.time', 'Hora Programada'), 
          t('dashboard.export.client', 'Cliente'), 
          t('dashboard.export.phone', 'Teléfono'), 
          t('dashboard.export.vehicle', 'Nombre Vehículo'), 
          t('dashboard.export.plate', 'Placa'), 
          t('dashboard.export.deliveryStatus', 'Estado Entrega')
        ],
        rows: rows.length > 0 ? rows : [
          ['RES-8920', '08:30 AM', 'Carlos Restrepo', '+57 310 456 7890', 'Toyota Corolla', 'ABC-123', 'COMPLETADA'],
          ['RES-8922', '10:00 AM', 'Juan David Pérez', '+57 300 123 4567', 'Mazda CX-5', 'KLS-849', 'COMPLETADA'],
          ['RES-8925', '02:00 PM', 'Santiago Castro', '+57 315 789 0123', 'Renault Duster', 'JHK-201', 'PENDIENTE'],
        ],
        kpis: [
          { label: t('dashboard.export.totalScheduled', 'Total Programadas'), value: String(dashboardData?.todayDeliveriesCount ?? 3) },
          { label: t('dashboard.export.completedDeliveries', 'Entregadas/Completadas'), value: String(dashboardData?.todayDeliveriesCompleted ?? 2) },
          { label: t('dashboard.export.pending', 'Pendientes'), value: String(dashboardData?.todayDeliveriesPending ?? 1) },
        ],
      }
    }

    if (metricKey === 'devoluciones') {
      const rows = (returnsForRange || []).map((item) => [
        item.codigo || item.id || 'RES-8914',
        item.hora || '04:30 PM',
        item.clienteNombre || 'Cliente Registrado',
        item.clienteTelefono || item.telefono || '+57 320 987 6543',
        item.vehiculoNombre || 'Chevrolet Tracker',
        item.vehiculoPlaca || 'MXP-492',
        item.estado || 'RECIBIDA',
      ])
      return {
        title: t('dashboard.export.returnsTitle', 'Devoluciones de Hoy'),
        filename: 'reporte_devoluciones_hoy',
        headers: [
          t('dashboard.export.resId', 'Código Reserva'), 
          t('dashboard.export.time', 'Hora Programada'), 
          t('dashboard.export.client', 'Cliente'), 
          t('dashboard.export.phone', 'Teléfono'), 
          t('dashboard.export.vehicle', 'Nombre Vehículo'), 
          t('dashboard.export.plate', 'Placa'), 
          t('dashboard.export.returnStatus', 'Estado Devolución')
        ],
        rows: rows.length > 0 ? rows : [
          ['RES-8914', '01:30 PM', 'Ana María Gómez', '+57 320 987 6543', 'Chevrolet Tracker', 'MXP-492', 'RECIBIDA'],
          ['RES-8916', '04:30 PM', 'Felipe Mendoza', '+57 311 234 5678', 'Nissan Kicks', 'WER-902', 'RECIBIDA'],
        ],
        kpis: [
          { label: t('dashboard.export.totalScheduled', 'Total Programadas'), value: String(dashboardData?.todayReturnsCount ?? 2) },
          { label: t('dashboard.export.received', 'Recibidas'), value: String(dashboardData?.todayReturnsReceived ?? 2) },
          { label: t('dashboard.export.pending', 'Pendientes'), value: String(dashboardData?.todayReturnsPending ?? 0) },
        ],
      }
    }

    if (metricKey === 'ocupacion') {
      const f = dashboardData?.fleet || {}
      return {
        title: t('dashboard.export.fleetOccupancy', 'Ocupación de Flota'),
        filename: 'reporte_ocupacion_flota',
        headers: [
          t('dashboard.export.plate', 'Placa'), 
          t('dashboard.export.vehicle', 'Nombre Vehículo'), 
          t('dashboard.export.category', 'Categoría'), 
          t('dashboard.export.branch', 'Sucursal'), 
          t('dashboard.export.opStatus', 'Estado Operativo'), 
          t('dashboard.export.assignedRes', 'Código Reserva Asignada')
        ],
        rows: [
          ['ABC-123', 'Toyota Corolla', 'Sedán Élite', branchName, 'OCUPADO', 'RES-8920'],
          ['MXP-492', 'Chevrolet Tracker', 'SUV Compacto', branchName, 'OCUPADO', 'RES-8918'],
          ['KLS-849', 'Mazda CX-5', 'SUV Confort', branchName, 'DISPONIBLE', 'Sin reserva'],
          ['JHK-201', 'Renault Duster', 'SUV 4x4', branchName, 'RESERVADO', 'RES-8924'],
          ['WER-902', 'Nissan Kicks', 'Crossover', branchName, 'EN MANTENIMIENTO', 'Mantenimiento preventivo'],
        ],
        kpis: [
          { label: t('dashboard.export.occupancyRate', 'Tasa de Ocupación'), value: `${f.occupancyRate || 40}%` },
          { label: t('dashboard.export.occupied', 'Ocupados'), value: `${f.rentedVehicles || 2} de ${f.totalVehicles || 5}` },
          { label: t('dashboard.export.available', 'Disponibles'), value: String(f.availableVehicles || 2) },
          { label: t('dashboard.export.maintenance', 'En Mantenimiento'), value: String(f.maintenanceVehicles || 1) },
        ],
      }
    }

    return { title: 'Métrica Operativa', filename: 'reporte', headers: [], rows: [], kpis: [] }
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
      subtitle: `Sucursal: ${dashboardData?.branchName || 'Alamo Bogotá - Aeropuerto'}`,
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

  const scheduleForRange = useMemo(() => {
    return getScheduleForRange(startDateStr, endDateStr)
  }, [startDateStr, endDateStr])

  const deliveriesForRange = scheduleForRange.deliveries || []
  const returnsForRange = scheduleForRange.returns || []

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
  const totalF = fleet.totalVehicles || 5
  const availPct = Math.round((fleet.availableVehicles / totalF) * 100)
  const rentedPct = Math.round((fleet.rentedVehicles / totalF) * 100)
  const maintPct = Math.max(0, 100 - availPct - rentedPct)

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
        <div className="branch-top-global-bar">
          <div className="branch-top-breadcrumb">
            <span className="branch-breadcrumb-subtitle">{t('dashboard.subtitle', 'Panel operativo')}</span>
            <h1 className="branch-breadcrumb-title">{t('dashboard.title', 'Dashboard')}</h1>
          </div>

          <div className="branch-top-right-tools">
            <div className="branch-notification-wrapper" style={{ position: 'relative' }}>
              <button
                ref={notifBtnRef}
                type="button"
                className={`branch-icon-btn branch-notification-btn ${
                  isNotificationsOpen ? 'branch-icon-btn--active' : ''
                }`}
                title="Notificaciones y Alertas"
                aria-label="Notificaciones y Alertas"
                aria-expanded={isNotificationsOpen}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsNotificationsOpen((prev) => !prev)
                }}
              >
                <FaBell aria-hidden="true" />
                {unreadNotifCount > 0 && (
                  <span className="branch-notification-badge">{unreadNotifCount}</span>
                )}
              </button>

              <BranchNotificationModal
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
                unreadCount={unreadNotifCount}
                onMarkRead={handleMarkNotificationRead}
                onMarkAllRead={handleMarkAllNotificationsRead}
                onSelectNotification={handleNotificationClick}
                branchName={dashboardData?.branchName}
              />
            </div>

            <div className="branch-divider-v" />

            <MenuConfiguracion />

            <div className="branch-user-profile-chip">
              <div className="branch-user-avatar">
                {(usuario?.nombre || usuario?.correo || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="branch-user-info-text">
                <strong className="branch-user-name">
                  {usuario?.nombre || 'Andrés Felipe Castro'}
                </strong>
                <span className="branch-user-role">
                  {usuario?.rol || 'encargado_sucursal'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. ENCABEZADO CON FRANJA DE DEGRADADO Y TEXTO EN BLANCO ALTO CONTRASTE */}
        <header className="branch-gradient-hero-banner">
          <div className="branch-gradient-hero-content">
            <div className="branch-gradient-hero-badge">
              <span className="branch-hero-live-dot" />
              <span>{t('dashboard.hero.realtime', 'En tiempo real')}</span>
            </div>
            <h1 className="branch-gradient-hero-title">
              {dashboardData.branchName || 'Alamo Bogotá - Aeropuerto'}
            </h1>
            <p className="branch-gradient-hero-subtitle">
              {t('dashboard.hero.subtitle', 'Resumen general del rendimiento operativo de la sucursal')}
            </p>
          </div>

          <div className="branch-gradient-hero-actions">
            <button
              type="button"
              className="branch-hero-btn branch-hero-btn--outlined"
              onClick={() => navigate(incidentsRoute)}
            >
              <FaExclamationTriangle aria-hidden="true" />
              <span>{t('dashboard.hero.reportIncident', 'Reportar incidencia')}</span>
            </button>

            <button
              type="button"
              className="branch-hero-btn branch-hero-btn--white"
              onClick={() => navigate(reservationsRoute)}
            >
              <FaPlus aria-hidden="true" />
              <span>{t('dashboard.hero.createReservation', 'Crear reserva')}</span>
            </button>
          </div>
        </header>

        {/* 2. TARJETAS KPI (Ingresos, Entregas, Devoluciones, Ocupación) */}
        <section className="branch-kpi-grid">
          {/* Tarjeta 1: Ingresos del mes */}
          <article className="branch-kpi-card">
            <div className="branch-kpi-card-header">
              <div className="branch-kpi-title-with-icon">
                <span className="branch-kpi-title">
                  <FaDollarSign className="branch-kpi-inline-icon" aria-hidden="true" />
                  {t('dashboard.kpi.monthlyRevenue', 'Ingresos del mes')}
                </span>
              </div>

              <div className="branch-kpi-menu-wrapper">
                <button
                  type="button"
                  className="branch-kpi-menu-btn"
                  title="Opciones de métrica"
                  aria-label="Opciones de métrica"
                  onClick={(e) => handleToggleKpiMenu('kpi-1', e)}
                >
                  <FaEllipsisV aria-hidden="true" />
                </button>
                {activeKpiMenu === 'kpi-1' && (
                  <div className="branch-kpi-dropdown-menu" role="menu">
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleExportKpiExcel('ingresos')}
                    >
                      {t('common.exportExcel', 'Exportar a Excel')}
                    </button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleExportKpiPdf('ingresos')}
                    >
                      {t('common.exportPdf', 'Exportar a PDF')}
                    </button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handlePrintKpi('ingresos')}
                    >
                      {t('common.print', 'Imprimir')}
                    </button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleOpenKpiDetail('ingresos')}
                    >
                      {t('common.viewDetails', 'Ver detalle')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="branch-kpi-card-body">
              <div className="branch-kpi-value-row">
                <strong className="branch-kpi-value">
                  {formatCOP(dashboardData.monthlyRevenue || 45200000)}
                </strong>
              </div>

              <div className="branch-kpi-progress-track">
                <div
                  className="branch-kpi-progress-bar branch-kpi-progress-bar--brand"
                  style={{ width: '85%' }}
                />
              </div>
            </div>

            <div className="branch-kpi-card-footer">
              <span className="branch-kpi-trend-text">+8,5% vs. mes anterior</span>
            </div>
          </article>

          {/* Tarjeta 2: Entregas de hoy */}
          <article className="branch-kpi-card">
            <div className="branch-kpi-card-header">
              <div className="branch-kpi-title-with-icon">
                <span className="branch-kpi-title">
                  <FaCalendarCheck className="branch-kpi-inline-icon" aria-hidden="true" />
                  {t('dashboard.kpi.todayDeliveries', 'Entregas de hoy')}
                </span>
              </div>

              <div className="branch-kpi-menu-wrapper">
                <button
                  type="button"
                  className="branch-kpi-menu-btn"
                  title="Opciones de métrica"
                  aria-label="Opciones de métrica"
                  onClick={(e) => handleToggleKpiMenu('kpi-2', e)}
                >
                  <FaEllipsisV aria-hidden="true" />
                </button>
                {activeKpiMenu === 'kpi-2' && (
                  <div className="branch-kpi-dropdown-menu" role="menu">
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleExportKpiExcel('entregas')}
                    >{t('common.exportExcel', 'Exportar a Excel')}</button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleExportKpiPdf('entregas')}
                    >{t('common.exportPdf', 'Exportar a PDF')}</button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handlePrintKpi('entregas')}
                    >{t('common.print', 'Imprimir')}</button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleOpenKpiDetail('entregas')}
                    >{t('common.viewDetails', 'Ver detalle')}</button>
                  </div>
                )}
              </div>
            </div>

            <div className="branch-kpi-card-body">
              <div className="branch-kpi-value-row">
                <strong className="branch-kpi-value">
                  {dashboardData.todayDeliveriesCount ?? 3}
                </strong>
                <span className="branch-kpi-unit">{t("dashboard.kpi.scheduled", "programadas")}</span>
              </div>

              <div className="branch-kpi-progress-track">
                <div
                  className="branch-kpi-progress-bar branch-kpi-progress-bar--brand"
                  style={{
                    width: `${Math.round(
                      ((dashboardData.todayDeliveriesCompleted || 2) /
                        (dashboardData.todayDeliveriesCount || 3)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="branch-kpi-card-footer">
              <span className="branch-kpi-trend-text">
                {dashboardData.todayDeliveriesCompleted} {t("dashboard.kpi.completed", "completadas")} · {dashboardData.todayDeliveriesPending} {t("dashboard.kpi.pending", "pendientes")}
              </span>
            </div>
          </article>

          {/* Tarjeta 3: Devoluciones de hoy */}
          <article className="branch-kpi-card">
            <div className="branch-kpi-card-header">
              <div className="branch-kpi-title-with-icon">
                <span className="branch-kpi-title">
                  <FaUndo className="branch-kpi-inline-icon" aria-hidden="true" />
                  {t('dashboard.kpi.todayReturns', 'Devoluciones de hoy')}
                </span>
              </div>

              <div className="branch-kpi-menu-wrapper">
                <button
                  type="button"
                  className="branch-kpi-menu-btn"
                  title="Opciones de métrica"
                  aria-label="Opciones de métrica"
                  onClick={(e) => handleToggleKpiMenu('kpi-3', e)}
                >
                  <FaEllipsisV aria-hidden="true" />
                </button>
                {activeKpiMenu === 'kpi-3' && (
                  <div className="branch-kpi-dropdown-menu" role="menu">
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleExportKpiExcel('devoluciones')}
                    >{t('common.exportExcel', 'Exportar a Excel')}</button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleExportKpiPdf('devoluciones')}
                    >{t('common.exportPdf', 'Exportar a PDF')}</button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handlePrintKpi('devoluciones')}
                    >{t('common.print', 'Imprimir')}</button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleOpenKpiDetail('devoluciones')}
                    >{t('common.viewDetails', 'Ver detalle')}</button>
                  </div>
                )}
              </div>
            </div>

            <div className="branch-kpi-card-body">
              <div className="branch-kpi-value-row">
                <strong className="branch-kpi-value">
                  {dashboardData.todayReturnsCount ?? 2}
                </strong>
                <span className="branch-kpi-unit">{t("dashboard.kpi.scheduled", "programadas")}</span>
              </div>

              <div className="branch-kpi-progress-track">
                <div
                  className="branch-kpi-progress-bar branch-kpi-progress-bar--brand"
                  style={{
                    width: `${Math.round(
                      ((dashboardData.todayReturnsReceived || 0) /
                        (dashboardData.todayReturnsCount || 2)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="branch-kpi-card-footer">
              <span className="branch-kpi-trend-text">
                {dashboardData.todayReturnsPending} {t("dashboard.kpi.pending", "pendientes")} · {dashboardData.todayReturnsReceived} {t("dashboard.kpi.received", "recibidas")}
              </span>
            </div>
          </article>

          {/* Tarjeta 4: Ocupación */}
          <article className="branch-kpi-card">
            <div className="branch-kpi-card-header">
              <div className="branch-kpi-title-with-icon">
                <span className="branch-kpi-title">
                  <FaCar className="branch-kpi-inline-icon" aria-hidden="true" />
                  {t('dashboard.kpi.fleetOccupancy', 'Ocupación de flota')}
                </span>
              </div>

              <div className="branch-kpi-menu-wrapper">
                <button
                  type="button"
                  className="branch-kpi-menu-btn"
                  title="Opciones de métrica"
                  aria-label="Opciones de métrica"
                  onClick={(e) => handleToggleKpiMenu('kpi-4', e)}
                >
                  <FaEllipsisV aria-hidden="true" />
                </button>
                {activeKpiMenu === 'kpi-4' && (
                  <div className="branch-kpi-dropdown-menu" role="menu">
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleExportKpiExcel('ocupacion')}
                    >{t('common.exportExcel', 'Exportar a Excel')}</button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleExportKpiPdf('ocupacion')}
                    >{t('common.exportPdf', 'Exportar a PDF')}</button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handlePrintKpi('ocupacion')}
                    >{t('common.print', 'Imprimir')}</button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleOpenKpiDetail('ocupacion')}
                    >{t('common.viewDetails', 'Ver detalle')}</button>
                  </div>
                )}
              </div>
            </div>

            <div className="branch-kpi-card-body">
              <div className="branch-kpi-value-row">
                <strong className="branch-kpi-value">
                  {fleet.occupancyRate}%
                </strong>
                <span className="branch-kpi-unit">{t("dashboard.kpi.rented", "en alquiler")}</span>
              </div>

              <div className="branch-kpi-progress-track">
                <div
                  className="branch-kpi-progress-bar branch-kpi-progress-bar--brand"
                  style={{ width: `${fleet.occupancyRate}%` }}
                />
              </div>
            </div>

            <div className="branch-kpi-card-footer">
              <span className="branch-kpi-trend-text">
                {fleet.rentedVehicles} {t('dashboard.kpi.of', 'de')} {fleet.totalVehicles} {t('dashboard.kpi.vehiclesInUse', 'vehículos en uso')}
              </span>
            </div>
          </article>
        </section>

        {/* 3. COLUMNAS PRINCIPALES (1.7fr IZQUIERDA / 1fr DERECHA) */}
        <section className="branch-columns-grid">
          {/* COLUMNA IZQUIERDA: GRÁFICO RECHARTS + TABLA OPERATIVA */}
          <div className="branch-left-stack">
            {/* TARJETA DEDICADA: GRÁFICO RECHARTS DE BARRAS POR HORA */}
            <article className="branch-card branch-chart-card">
              <div className="branch-card-header-row">
                <div className="branch-card-title-group">
                  <div>
                    <h3 className="branch-card-title">
                      <FaChartBar className="branch-card-title-icon" aria-hidden="true" />{t('dashboard.charts.workload', 'Carga Operativa por Franja Horaria')}</h3>
                    <span className="branch-hourly-chart-sub">
                      {getSectionTitle(startDateStr, endDateStr)}
                    </span>
                  </div>
                </div>
              </div>

              {/* GRÁFICO NATIVO DE BARRAS DE CARGA OPERATIVA */}
              <div className="branch-recharts-container">
                <OperationalHourlyBarChart hourlyData={hourlyData} />
              </div>
            </article>

            {/* TARJETA DEDICADA: TABLA DE PROGRAMACIÓN DE RESERVAS */}
            <article className="branch-card branch-table-card">
              <div className="branch-card-header-row">
                <div className="branch-card-title-group">
                  <h3 className="branch-card-title">
                    <FaCalendarCheck className="branch-card-title-icon" aria-hidden="true" />
                    {activeTab === 'entregas' ? t('dashboard.charts.deliveriesList', 'Listado de Entregas') : t('dashboard.charts.returnsList', 'Listado de Devoluciones')}
                  </h3>
                </div>

                {/* PESTAÑAS PÍLDORA (ENTREGAS / DEVOLUCIONES) */}
                <div className="branch-schedule-pill-tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'entregas'}
                    className={`branch-schedule-pill-tab ${
                      activeTab === 'entregas' ? 'branch-schedule-pill-tab--active' : ''
                    }`}
                    onClick={() => setActiveTab('entregas')}
                  >
                    {t('common.deliveries', 'Entregas')}
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'devoluciones'}
                    className={`branch-schedule-pill-tab ${
                      activeTab === 'devoluciones' ? 'branch-schedule-pill-tab--active' : ''
                    }`}
                    onClick={() => setActiveTab('devoluciones')}
                  >
                    {t('common.returns', 'Devoluciones')}
                  </button>
                </div>
              </div>

              {/* RESUMEN VEHÍCULOS */}
              <div className="branch-schedule-summary-bar">
                <span>{t('dashboard.charts.totalVehicles', 'Total de vehículos')}: {deliveriesForRange.length || currentList.length}</span>
              </div>

              {currentList.length === 0 ? (
                <div className="branch-empty-row">
                  <span>
                    {activeTab === 'entregas'
                      ? t('dashboard.schedule.noDeliveries', 'No hay entregas programadas para el rango de fechas seleccionado en el calendario.')
                      : t('dashboard.schedule.noReturns', 'No hay devoluciones programadas para el rango de fechas seleccionado en el calendario.')}
                  </span>
                </div>
              ) : (
                <div className="branch-table-responsive">
                  <table className="branch-schedule-table">
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: '50px', textAlign: 'center' }}>{t('dashboard.schedule.table.id', 'ID')}</th>
                        <th scope="col">{t('dashboard.schedule.table.reservationCode', 'CÓDIGO RESERVA')}</th>
                        <th scope="col">{t('dashboard.schedule.table.client', 'NOMBRE COMPLETO')}</th>
                        <th scope="col">{t('dashboard.schedule.table.image', 'IMAGEN')}</th>
                        <th scope="col">{t('dashboard.schedule.table.vehicle', 'NOMBRE VEHÍCULO')}</th>
                        <th scope="col">{t('dashboard.schedule.table.plate', 'PLACA')}</th>
                        <th scope="col">{t('dashboard.schedule.table.date', 'FECHA')}</th>
                        <th scope="col">{t('dashboard.schedule.table.time', 'HORA')}</th>
                        <th scope="col">{t('dashboard.schedule.table.status', 'ESTADO')}</th>
                        <th scope="col" className="branch-th-actions">{t('dashboard.schedule.table.actions', 'ACCIONES')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentList.map((item, idx) => {
                        const itemUniqueId = item.id || `item-${idx}`
                        const itemSeqId = idx + 1
                        const resCodigo = item.codigo || item.id || `RES-88${20 + idx}`
                        const cliente = item.clienteNombre || 'Carlos Restrepo'
                        const vehiculo = item.vehiculoNombre || 'Toyota Corolla'
                        const placa = item.vehiculoPlaca || 'ABC-123'
                        
                        const displayDate = formatDateLabel(item.fecha || TODAY_STR)
                        const displayTime = item.hora || '08:30 AM'

                        return (
                          <tr key={itemUniqueId} className="branch-table-row">
                            {/* ID */}
                            <td className="branch-td-id" style={{ textAlign: 'center', fontWeight: '400', color: '#64748b' }}>
                              <span>{itemSeqId}</span>
                            </td>

                            {/* CÓDIGO RESERVA */}
                            <td className="branch-td-code" style={{ fontWeight: '400', color: '#334155' }}>
                              <span style={{ fontWeight: '400', color: '#334155', fontStyle: 'normal', display: 'inline' }}>
                                {resCodigo}
                              </span>
                            </td>

                            {/* NOMBRE COMPLETO */}
                            <td className="branch-td-client">
                              <span className="branch-table-client-name">{cliente}</span>
                            </td>

                            {/* IMAGEN */}
                            <td className="branch-td-image">
                              <img
                                src={getVehicleImage(item)}
                                alt={vehiculo}
                                className="branch-table-vehicle-thumb"
                              />
                            </td>

                            {/* VEHÍCULO */}
                            <td className="branch-td-vehicle">
                              <span className="branch-table-vehicle-name">{vehiculo}</span>
                            </td>

                            {/* PLACA */}
                            <td className="branch-td-plate">
                              <span className="branch-table-vehicle-plate">{placa}</span>
                            </td>

                            {/* FECHA */}
                            <td className="branch-td-date">
                              <span className="branch-table-date">{displayDate}</span>
                            </td>

                            {/* HORA */}
                            <td className="branch-td-time">
                              <span className="branch-table-time">{displayTime}</span>
                            </td>

                            {/* ESTADO VISIBLE */}
                            <td className="branch-td-status">
                              {(() => {
                                const stInfo = getReservationStatusInfo(item.estado, t)
                                const StatusIcon = stInfo.IconComp
                                return (
                                  <span className={`branch-status-badge ${stInfo.badgeClass}`}>
                                    <StatusIcon className="branch-badge-icon" aria-hidden="true" />
                                    {stInfo.visibleState}
                                  </span>
                                )
                              })()}
                            </td>

                            {/* ACCIONES - BOTÓN VER */}
                            <td className="branch-td-actions">
                              <div className="branch-row-actions-group">
                                <button
                                  type="button"
                                  style={{ padding: '6px 14px', fontSize: '13px', background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center', transition: 'all 0.18s ease' }}
                                  title={t('dashboard.schedule.table.viewDetails', 'Ver reserva completa')}
                                  aria-label={t('dashboard.schedule.table.viewDetails', 'Ver reserva completa')}
                                  onClick={(e) => handleOpenDrawer(item, e)}
                                  onMouseOver={e => { e.currentTarget.style.background='#ffedd5'; e.currentTarget.style.borderColor='#fdba74'; }}
                                  onMouseOut={e => { e.currentTarget.style.background='#fff7ed'; e.currentTarget.style.borderColor='#fed7aa'; }}
                                >
                                  <FaReceipt /> {t('dashboard.schedule.table.viewBtn', 'Ver')}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pie de tarjeta con enlace a Reservas (sin icono) */}
              <div className="branch-schedule-footer">
                <button
                  type="button"
                  className="branch-link-btn"
                  onClick={() => navigate(reservationsRoute)}
                >
                  <span>{t('dashboard.schedule.viewAllReservations', 'Ver todas las reservas')}</span>
                </button>
              </div>
            </article>

            {/* TARJETA: GUÍA EXPLICATIVA DE ESTADOS DE LA RESERVA CON COLORES TEMÁTICOS */}
            <article className="branch-card branch-status-guide-card">
              <div className="branch-card-header-row">
                <div className="branch-card-title-group">
                  <div>
                    <h3 className="branch-card-title">
                      <FaClipboardList className="branch-card-title-icon" aria-hidden="true" />
                      {t('dashboard.statesGuide.title', 'Estados de la Reserva')}
                    </h3>
                    <span className="branch-status-guide-sub">{t('dashboard.statesGuide.subtitle', 'Guía explicativa de estados operativos y su equivalencia interna')}</span>
                  </div>
                </div>
              </div>

              <div className="branch-status-guide-grid">
                {/* 1. PENDIENTE */}
                <div className="branch-status-card-item branch-status-card-item--amber">
                  <div className="branch-status-card-header">
                    <span className="branch-status-badge branch-status-badge--amber">
                      <FaClock className="branch-badge-icon" aria-hidden="true" />
                      {t('dashboard.status.pending', 'Pendiente')}
                    </span>
                  </div>
                  <p className="branch-status-card-text">
                    {t('dashboard.statesGuide.descPending1', 'Agrupa los estados internos')} <code className="branch-inline-code">PENDIENTE</code>, <code className="branch-inline-code">PENDIENTE_EFECTIVO</code> {t('common.and', 'y')} <code className="branch-inline-code">PENDIENTE_VALIDACION</code>. {t('dashboard.statesGuide.descPending2', 'La reserva está creada a la espera de pago en mostrador o validación de documentos.')}
                  </p>
                </div>

                {/* 2. CONFIRMADA */}
                <div className="branch-status-card-item branch-status-card-item--green">
                  <div className="branch-status-card-header">
                    <span className="branch-status-badge branch-status-badge--green">
                      <FaCheckCircle className="branch-badge-icon" aria-hidden="true" />
                      {t('dashboard.status.confirmed', 'Confirmada')}
                    </span>
                  </div>
                  <p className="branch-status-card-text">
                    {t('dashboard.statesGuide.descConfirmed1', 'Corresponde al estado interno')} <code className="branch-inline-code">CONFIRMADA</code>. {t('dashboard.statesGuide.descConfirmed2', 'Pago y documentos validados 100%. Vehículo alistado y listo para entrega.')}
                  </p>
                </div>

                {/* 3. EN CURSO */}
                <div className="branch-status-card-item branch-status-card-item--blue">
                  <div className="branch-status-card-header">
                    <span className="branch-status-badge branch-status-badge--blue">
                      <FaCar className="branch-badge-icon" aria-hidden="true" />
                      {t('dashboard.status.active', 'En curso')}
                    </span>
                  </div>
                  <p className="branch-status-card-text">
                    {t('dashboard.statesGuide.descActive1', 'Corresponde al estado interno')} <code className="branch-inline-code">ACTIVA</code>. {t('dashboard.statesGuide.descActive2', 'Vehículo entregado al cliente en sucursal y contrato de alquiler en ejecución.')}
                  </p>
                </div>

                {/* 4. FINALIZADA */}
                <div className="branch-status-card-item branch-status-card-item--teal">
                  <div className="branch-status-card-header">
                    <span className="branch-status-badge branch-status-badge--teal">
                      <FaCheckDouble className="branch-badge-icon" aria-hidden="true" />
                      {t('dashboard.status.completed', 'Finalizada')}
                    </span>
                  </div>
                  <p className="branch-status-card-text">
                    {t('dashboard.statesGuide.descCompleted1', 'Corresponde al estado interno')} <code className="branch-inline-code">COMPLETADA</code>. {t('dashboard.statesGuide.descCompleted2', 'Vehículo recibido en sucursal, inspeccionado y contrato cerrado.')}
                  </p>
                </div>

                {/* 5. CANCELADA */}
                <div className="branch-status-card-item branch-status-card-item--gray" style={{ gridColumn: 'span 2' }}>
                  <div className="branch-status-card-header">
                    <span className="branch-status-badge branch-status-badge--gray">
                      <FaTimesCircle className="branch-badge-icon" aria-hidden="true" />
                      {t('dashboard.status.cancelled', 'Cancelada')}
                    </span>
                  </div>
                  <p className="branch-status-card-text">
                    {t('dashboard.statesGuide.descCancelled1', 'Agrupa los estados internos')} <code className="branch-inline-code">CANCELADA</code> {t('common.and', 'y')} <code className="branch-inline-code">CANCELADA_POR_TIEMPO</code>. {t('dashboard.statesGuide.descCancelled2', 'Indica que la reserva fue anulada por solicitud del cliente o expirada automáticamente por tiempo límite.')}
                  </p>
                </div>
              </div>
            </article>
          </div>

          {/* COLUMNA DERECHA: CALENDARIO VISIBLE TODO EL TIEMPO + REQUIERE ATENCIÓN + FLOTA */}
          <div className="branch-right-stack">
            {/* TARJETA 1: CALENDARIO VISIBLE TODO EL TIEMPO (INLINE DATEPICKER) */}
            <article className="branch-card branch-calendar-card">
              <div className="branch-card-header-row">
                <div className="branch-card-title-group">
                  <div>
                    <h3 className="branch-card-title">
                      <FaCalendarAlt className="branch-card-title-icon" aria-hidden="true" />{t('dashboard.charts.calendar', 'Calendario Operativo')}</h3>
                    <span className="branch-calendar-card-sub">{t('dashboard.charts.selectDateRange', 'Selecciona un rango de fechas')}</span>
                  </div>
                </div>
              </div>

              {/* CONTENEDOR DEL CALENDARIO INLINE SIEMPRE VISIBLE */}
              <div className="branch-inline-datepicker-wrapper">
                <OperationalDateRangeCalendar
                  startDateStr={startDateStr}
                  endDateStr={endDateStr}
                  onSelectRange={(start, end) => {
                    setStartDateObj(parseISOToDate(start))
                    setEndDateObj(parseISOToDate(end))
                  }}
                />
              </div>
            </article>

            {/* TARJETA 2: REQUIERE TU ATENCIÓN */}
            <article className="branch-card branch-attention-card">
              <div className="branch-card-header-row">
                <div className="branch-card-title-group">
                  <h3 className="branch-card-title">
                    <FaBell className="branch-card-title-icon" aria-hidden="true" />
                    {t('dashboard.attention.title', 'Requiere tu atención')}
                  </h3>
                </div>
              </div>

              <div className="branch-attention-list">
                <button
                  type="button"
                  className="branch-attention-row"
                  onClick={() => navigate(documentsRoute)}
                >
                  <div className="branch-attention-left">
                    <span className="branch-dot branch-dot--amber" />
                    <span className="branch-attention-text">
                      {attentionNeeded.pendingDocuments || 2} {t('dashboard.attention.docsToValidate', 'documentos por validar')}
                    </span>
                  </div>
                  <span className="branch-attention-arrow">&gt;</span>
                </button>

                <button
                  type="button"
                  className="branch-attention-row"
                  onClick={() => navigate(incidentsRoute)}
                >
                  <div className="branch-attention-left">
                    <span className="branch-dot branch-dot--red" />
                    <span className="branch-attention-text">
                      {attentionNeeded.openIncidents || 1} {t('dashboard.attention.openIncidents', 'incidencia abierta')}
                    </span>
                  </div>
                  <span className="branch-attention-arrow">&gt;</span>
                </button>

                <button
                  type="button"
                  className="branch-attention-row"
                  onClick={() => navigate(vehiclesRoute)}
                >
                  <div className="branch-attention-left">
                    <span className="branch-dot branch-dot--blue" />
                    <span className="branch-attention-text">
                      {attentionNeeded.expiringVehicleDocs || 1} {t('dashboard.attention.expiringDocs', 'documento de vehículo por vencer')}
                    </span>
                  </div>
                  <span className="branch-attention-arrow">&gt;</span>
                </button>
              </div>
            </article>

            {/* TARJETA 3: ESTADO DE LA FLOTA — DETALLE OPERATIVO Y DISPONIBILIDAD */}
            <article className="branch-card branch-fleet-card">
              <div className="branch-card-header-row">
                <div className="branch-card-title-group">
                  <h3 className="branch-card-title">
                    <FaCar className="branch-card-title-icon" aria-hidden="true" />
                    {t('dashboard.fleet.title', 'Estado de la flota')}
                  </h3>
                </div>
                <span className="branch-fleet-total-pill">{totalF} {t('dashboard.fleet.vehiclesInBranch', 'vehículos en sucursal')}</span>
              </div>

              {/* 4 TARJETAS RESUMEN DE ESTADO */}
              <div className="branch-fleet-stats-grid">
                <div className="branch-fleet-stat-box branch-fleet-stat-box--green">
                  <div className="branch-fleet-stat-head">
                    <span className="branch-dot branch-dot--green" />
                    <span className="branch-fleet-stat-lbl">{t('dashboard.fleet.available', 'Disponibles')}</span>
                  </div>
                  <div className="branch-fleet-stat-num">
                    2 <small>(40%)</small>
                  </div>
                  <span className="branch-fleet-stat-desc">{t('dashboard.fleet.readyForDelivery', 'Listos para entrega')}</span>
                </div>

                <div className="branch-fleet-stat-box branch-fleet-stat-box--blue">
                  <div className="branch-fleet-stat-head">
                    <span className="branch-dot branch-dot--blue" />
                    <span className="branch-fleet-stat-lbl">{t('dashboard.fleet.occupied', 'Ocupados')}</span>
                  </div>
                  <div className="branch-fleet-stat-num">
                    1 <small>(20%)</small>
                  </div>
                  <span className="branch-fleet-stat-desc">{t('dashboard.fleet.activeContract', 'En contrato activo')}</span>
                </div>

                <div className="branch-fleet-stat-box branch-fleet-stat-box--cyan">
                  <div className="branch-fleet-stat-head">
                    <span className="branch-dot branch-dot--cyan" />
                    <span className="branch-fleet-stat-lbl">{t('dashboard.fleet.reserved', 'Reservados')}</span>
                  </div>
                  <div className="branch-fleet-stat-num">
                    1 <small>(20%)</small>
                  </div>
                  <span className="branch-fleet-stat-desc">{t('dashboard.fleet.forDeliveryToday', 'Para entrega hoy')}</span>
                </div>

                <div className="branch-fleet-stat-box branch-fleet-stat-box--amber">
                  <div className="branch-fleet-stat-head">
                    <span className="branch-dot branch-dot--amber" />
                    <span className="branch-fleet-stat-lbl">{t('dashboard.fleet.maintenance', 'En mantenimiento')}</span>
                  </div>
                  <div className="branch-fleet-stat-num">
                    1 <small>(20%)</small>
                  </div>
                  <span className="branch-fleet-stat-desc">{t('dashboard.fleet.technicalReview', 'Revisión técnica')}</span>
                </div>
              </div>

              {/* BARRA SEGMENTADA DE DISTRIBUCIÓN */}
              <div className="branch-fleet-bar-wrapper">
                <div className="branch-fleet-bar-labels">
                  <span>{t('dashboard.fleet.distAvailability', 'Distribución de disponibilidad')}</span>
                  <strong>80% {t('dashboard.fleet.operative', 'operativa')}</strong>
                </div>
                <div className="branch-fleet-multi-bar">
                  <div
                    className="branch-fleet-bar-seg branch-fleet-bar-seg--green"
                    style={{ width: '40%' }}
                    title="Disponibles: 40%"
                  />
                  <div
                    className="branch-fleet-bar-seg branch-fleet-bar-seg--blue"
                    style={{ width: '20%' }}
                    title="Ocupados: 20%"
                  />
                  <div
                    className="branch-fleet-bar-seg branch-fleet-bar-seg--cyan"
                    style={{ width: '20%' }}
                    title="Reservados: 20%"
                  />
                  <div
                    className="branch-fleet-bar-seg branch-fleet-bar-seg--amber"
                    style={{ width: '20%' }}
                    title="En mantenimiento: 20%"
                  />
                </div>
              </div>

              {/* LISTA RÁPIDA DE VEHÍCULOS ASIGNADOS */}
              <div className="branch-fleet-units-list">
                <span className="branch-fleet-units-title">{t('dashboard.fleet.branchUnits', 'Unidades de la sucursal')}</span>
                <div className="branch-fleet-unit-item">
                  <div className="branch-fleet-unit-meta">
                    <span className="branch-fleet-unit-name">Toyota Corolla</span>
                    <span className="branch-fleet-unit-plate">ABC-123 · Sedán</span>
                  </div>
                  <span className="branch-status-badge branch-status-badge--blue">{t('dashboard.fleet.occupied', 'Ocupado')}</span>
                </div>

                <div className="branch-fleet-unit-item">
                  <div className="branch-fleet-unit-meta">
                    <span className="branch-fleet-unit-name">Chevrolet Tracker</span>
                    <span className="branch-fleet-unit-plate">MXP-492 · SUV</span>
                  </div>
                  <span className="branch-status-badge branch-status-badge--green">{t('dashboard.fleet.available', 'Disponible')}</span>
                </div>

                <div className="branch-fleet-unit-item">
                  <div className="branch-fleet-unit-meta">
                    <span className="branch-fleet-unit-name">Mazda CX-5</span>
                    <span className="branch-fleet-unit-plate">KLS-849 · SUV</span>
                  </div>
                  <span className="branch-status-badge branch-status-badge--green">{t('dashboard.fleet.available', 'Disponible')}</span>
                </div>

                <div className="branch-fleet-unit-item">
                  <div className="branch-fleet-unit-meta">
                    <span className="branch-fleet-unit-name">Renault Duster</span>
                    <span className="branch-fleet-unit-plate">JHK-201 · 4x4</span>
                  </div>
                  <span className="branch-status-badge branch-status-badge--cyan">{t('dashboard.fleet.reserved', 'Reservado')}</span>
                </div>

                <div className="branch-fleet-unit-item">
                  <div className="branch-fleet-unit-meta">
                    <span className="branch-fleet-unit-name">Nissan Kicks</span>
                    <span className="branch-fleet-unit-plate">WER-902 · Crossover</span>
                  </div>
                  <span className="branch-status-badge branch-status-badge--amber">{t('dashboard.fleet.maintenance', 'En mantenimiento')}</span>
                </div>
              </div>

              <div className="branch-fleet-footer">
                <button
                  type="button"
                  className="branch-link-btn"
                  onClick={() => navigate(vehiclesRoute)}
                >
                  <span>{t('dashboard.fleet.viewFleet', 'Ver flota')} &gt;</span>
                </button>
              </div>
            </article>
          </div>
        </section>
      </main>

      {/* MODAL CENTRADO DE DETALLE DE RESERVA */}
      {selectedScheduleItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reservation-modal-title"
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(2px)',
            padding: '20px'
          }}
          onClick={e => { if (e.target === e.currentTarget) handleCloseDrawer(); }}
        >
          <div
            style={{
              background: 'var(--city-bg, #fff)', borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              width: '100%', maxWidth: '680px',
              maxHeight: '90vh', overflowY: 'auto',
              display: 'flex', flexDirection: 'column'
            }}
          >
            <div className="branch-drawer-content">
            <header className="branch-drawer-header" style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--city-bg,#fff)', borderRadius: '16px 16px 0 0' }}>
              <div>
                <span className="branch-drawer-code">
                  {selectedScheduleItem.codigo || `RES-${selectedScheduleItem.id}`}
                </span>
                <h3 id="reservation-modal-title" className="branch-drawer-title">
                  {t('dashboard.drawer.title', 'Consulta de Reserva Registrada')}
                </h3>
              </div>
              <button
                type="button"
                className="branch-drawer-close"
                onClick={handleCloseDrawer}
                aria-label={t('common.close', 'Cerrar')}
              >
                <FaTimes aria-hidden="true" />
              </button>
            </header>

            <div className="branch-drawer-body branch-drawer-full-detail">
              {/* Metadata de Registro */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--texto-second, #64748b)', fontWeight: '500' }}>
                  {t('dashboard.drawer.registrationDate', 'Fecha Registro')}: 20 sep 2026 · 02:45 PM
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--brand-primary, #2563eb)', fontWeight: '700' }}>
                  TX: #WOMPI-994820
                </span>
              </div>

              {/* Sección 1: Datos del Cliente */}
              <div className="branch-drawer-section">
                <span className="branch-drawer-sec-title">{t('dashboard.drawer.clientTitle', 'Titular de la Reserva')}</span>
                <div className="branch-drawer-value-row">
                  <div className="branch-schedule-avatar branch-avatar--soft-blue">
                    {getInitials(selectedScheduleItem.clienteNombre)}
                  </div>
                  <div className="branch-drawer-client-details">
                    <span className="branch-drawer-val-primary">
                      {selectedScheduleItem.clienteNombre || 'Carlos Restrepo Jaramillo'}
                    </span>
                    <span className="branch-drawer-val-sub">
                      {t('dashboard.drawer.document', 'Documento')}: CC 1.020.340.589 (Bogotá)
                    </span>
                  </div>
                </div>
                <div className="branch-drawer-grid-2" style={{ marginTop: '10px' }}>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.phone', 'Teléfono / Móvil')}</span>
                    <span className="branch-drawer-item-val">{selectedScheduleItem.clienteTelefono || '+57 310 456 7890'}</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.email', 'Correo electrónico')}</span>
                    <span className="branch-drawer-item-val">carlos.restrepo@gmail.com</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.license', 'Licencia de Conducción')}</span>
                    <span className="branch-drawer-item-val">LIC-B1-4920194 (Vence 2028)</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.mobile', 'Teléfono Móvil')}</span>
                    <span className="branch-drawer-item-val">+57 312 456 7890</span>
                  </div>
                </div>
              </div>

              {/* Sección 2: Vehículo Asignado y Especificaciones */}
              <div className="branch-drawer-section">
                <span className="branch-drawer-sec-title">{t('dashboard.drawer.vehicleTitle', 'Vehículo Registrado')}</span>
                
                <div className="branch-drawer-vehicle-banner">
                  <img
                    src={getVehicleImage(selectedScheduleItem)}
                    alt={selectedScheduleItem.vehiculoNombre || selectedScheduleItem.vehiculo || 'Vehículo'}
                    className="branch-drawer-vehicle-img"
                  />
                  <div className="branch-drawer-vehicle-banner-overlay">
                    <strong>{selectedScheduleItem.vehiculoNombre || selectedScheduleItem.vehiculo || 'Toyota Corolla 2.0 Hybrid'}</strong>
                    <span>{t('dashboard.drawer.plate', 'Placa')}: {selectedScheduleItem.vehiculoPlaca || selectedScheduleItem.placa || 'ABC-123'}</span>
                  </div>
                </div>

                <div className="branch-drawer-grid-2" style={{ marginTop: '12px' }}>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.model', 'Modelo y Motor')}</span>
                    <span className="branch-drawer-item-val">{selectedScheduleItem.vehiculoNombre || 'Toyota Corolla 2.0 Hybrid'}</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.assignedPlate', 'Placa Asignada')}</span>
                    <span className="branch-drawer-item-val">{selectedScheduleItem.vehiculoPlaca || selectedScheduleItem.placa || 'ABC-123'}</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.category', 'Categoría')}</span>
                    <span className="branch-drawer-item-val">{selectedScheduleItem.vehiculoCategoria || 'Sedán Ejecutivo'}</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.transmission', 'Transmisión / Combustible')}</span>
                    <span className="branch-drawer-item-val">Automática · Híbrido (Tanque lleno)</span>
                  </div>
                </div>
              </div>

              {/* Sección 3: Periodo e Itinerario del Alquiler */}
              <div className="branch-drawer-section">
                <span className="branch-drawer-sec-title">{t('dashboard.drawer.itineraryTitle', 'Itinerario y Sucursal')}</span>
                <div className="branch-drawer-grid-2">
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.pickupDate', 'Fecha / Hora Recogida')}</span>
                    <span className="branch-drawer-item-val">
                      {selectedScheduleItem.fecha ? `${formatDateLabel(selectedScheduleItem.fecha)} · ${selectedScheduleItem.hora}` : selectedScheduleItem.hora || '08:30 AM'}
                    </span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.returnDate', 'Fecha / Hora Devolución')}</span>
                    <span className="branch-drawer-item-val">28 sep 2026 · 08:30 AM</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.pickupBranch', 'Sucursal de Retiro')}</span>
                    <span className="branch-drawer-item-val">{dashboardData?.branchName || 'Alamo Bogotá - Aeropuerto'}</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.returnBranch', 'Sucursal de Retorno')}</span>
                    <span className="branch-drawer-item-val">{dashboardData?.branchName || 'Alamo Bogotá - Aeropuerto'}</span>
                  </div>
                </div>
              </div>

              {/* Sección 4: Coberturas y Servicios Adicionales */}
              <div className="branch-drawer-section">
                <span className="branch-drawer-sec-title">{t('dashboard.drawer.coverageTitle', 'Cobertura & Servicios Adicionales')}</span>
                <div className="branch-drawer-grid-2">
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.insurance', 'Seguro Contratado')}</span>
                    <span className="branch-drawer-item-val">Protección Total CDW + TP ($0 Deducible)</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.babyEquipment', 'Equipamiento Bebé')}</span>
                    <span className="branch-drawer-item-val">1 Silla infantil instalada</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.roadAssistance', 'Asistencia en Ruta')}</span>
                    <span className="branch-drawer-item-val">Servicio Grúa 24/7 Incluido</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.fuelPolicy', 'Política de Combustible')}</span>
                    <span className="branch-drawer-item-val">Lleno a Lleno</span>
                  </div>
                </div>
              </div>

              {/* Sección 5: Desglose Financiero Detallado (COP) */}
              <div className="branch-drawer-section">
                <span className="branch-drawer-sec-title">{t('dashboard.drawer.financeTitle', 'Desglose Financiero Completo (COP)')}</span>
                <div className="branch-drawer-price-row">
                  <span>{t('dashboard.drawer.baseRental', 'Alquiler Base (3 días x $120.000 COP)')}</span>
                  <strong>$ 360.000 COP</strong>
                </div>
                <div className="branch-drawer-price-row">
                  <span>{t('dashboard.drawer.totalCoverage', 'Seguro Cobertura Total CDW')}</span>
                  <strong>$ 45.000 COP</strong>
                </div>
                <div className="branch-drawer-price-row">
                  <span>{t('dashboard.drawer.babySeatAddon', 'Silla Bebé Adicional')}</span>
                  <strong>$ 15.000 COP</strong>
                </div>
                <div className="branch-drawer-price-row">
                  <span>{t('dashboard.drawer.taxes', 'Impuestos de Ley (IVA 19%)')}</span>
                  <strong>$ 79.800 COP</strong>
                </div>
                <div className="branch-drawer-price-row branch-drawer-price-total">
                  <span>{t('dashboard.drawer.grandTotal', 'Total General de la Reserva')}</span>
                  <span>$ 499.800 COP</span>
                </div>
                <div className="branch-drawer-grid-2" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.paymentMethod', 'Método de Pago')}</span>
                    <span className="branch-drawer-item-val">Tarjeta de Crédito (Wompi)</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">{t('dashboard.drawer.deposit', 'Depósito en Garantía')}</span>
                    <span className="branch-drawer-item-val">$ 500.000 COP (Pre-autorizado)</span>
                  </div>
                </div>
              </div>

              {/* Sección 6: Flujo Operativo y Progreso Actual (Stepper) */}
              <div className="branch-drawer-section">
                <span className="branch-drawer-sec-title">{t('dashboard.drawer.workflowTitle', 'Flujo Operativo (Progreso Actual)')}</span>
                
                <div className="branch-workflow-stepper">
                  {/* Paso 1: Reserva Creada */}
                  <div className="branch-stepper-step branch-stepper-step--completed">
                    <div className="branch-stepper-circle">
                      <FaCheckCircle aria-hidden="true" />
                    </div>
                    <div className="branch-stepper-info">
                      <strong>{t('dashboard.drawer.step1Title', '1. Reserva Creada & Registrada')}</strong>
                      <span>{t('dashboard.drawer.step1Desc', 'Registrada con código')} {selectedScheduleItem.codigo || 'RES-8821'}</span>
                    </div>
                  </div>

                  {/* Paso 2: Validación de Documentos */}
                  <div
                    className={`branch-stepper-step ${
                      String(selectedScheduleItem.estado || '').includes('DOCUMENTO')
                        ? 'branch-stepper-step--warning'
                        : 'branch-stepper-step--completed'
                    }`}
                  >
                    <div className="branch-stepper-circle">
                      {String(selectedScheduleItem.estado || '').includes('DOCUMENTO') ? (
                        <FaClock aria-hidden="true" />
                      ) : (
                        <FaCheckCircle aria-hidden="true" />
                      )}
                    </div>
                    <div className="branch-stepper-info">
                      <strong>{t('dashboard.drawer.step2Title', '2. Validación de Documentos')}</strong>
                      <span>
                        {String(selectedScheduleItem.estado || '').includes('DOCUMENTO')
                          ? t('dashboard.drawer.step2Pending', 'Pendiente: Cédula / Licencia por verificar')
                          : t('dashboard.drawer.step2Done', 'Completado: Cédula y Licencia aprobadas 100%')}
                      </span>
                    </div>
                  </div>

                  {/* Paso 3: Pago Registrado */}
                  <div className="branch-stepper-step branch-stepper-step--completed">
                    <div className="branch-stepper-circle">
                      <FaCheckCircle aria-hidden="true" />
                    </div>
                    <div className="branch-stepper-info">
                      <strong>{t('dashboard.drawer.step3Title', '3. Pago de la Reserva')}</strong>
                      <span>{t('dashboard.drawer.step3Desc', 'Completado: $ 499.800 COP cobrados y confirmados')}</span>
                    </div>
                  </div>

                  {/* Paso 4: Entrega del Vehículo */}
                  <div
                    className={`branch-stepper-step ${
                      activeTab === 'entregas'
                        ? 'branch-stepper-step--active'
                        : 'branch-stepper-step--completed'
                    }`}
                  >
                    <div className="branch-stepper-circle">
                      <FaCar aria-hidden="true" />
                    </div>
                    <div className="branch-stepper-info">
                      <strong>{t('dashboard.drawer.step4Title', '4. Entrega de Vehículo en Sucursal')}</strong>
                      <span>
                        {activeTab === 'entregas'
                          ? `${t('dashboard.drawer.step4Scheduled', 'Programada para hoy a las')} ${selectedScheduleItem.hora || '08:30 AM'}`
                          : t('dashboard.drawer.step4Done', 'Vehículo entregado con éxito al cliente')}
                      </span>
                    </div>
                  </div>

                  {/* Paso 5: Devolución e Inspección */}
                  <div
                    className={`branch-stepper-step ${
                      activeTab === 'devoluciones'
                        ? 'branch-stepper-step--active'
                        : 'branch-stepper-step--pending'
                    }`}
                  >
                    <div className="branch-stepper-circle">
                      <FaUndo aria-hidden="true" />
                    </div>
                    <div className="branch-stepper-info">
                      <strong>{t('dashboard.drawer.step5Title', '5. Devolución e Inspección Final')}</strong>
                      <span>
                        {activeTab === 'devoluciones'
                          ? t('dashboard.drawer.step5PendingBranch', 'Pendiente por recibir en sucursal')
                          : t('dashboard.drawer.step5PendingContract', 'Pendiente al finalizar el contrato')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer className="branch-drawer-footer">
              <button
                type="button"
                className="branch-btn branch-btn--secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleCloseDrawer}
              >
                {t('dashboard.drawer.closeInquiry', 'Cerrar Consulta')}
              </button>
            </footer>
          </div>
          </div>
        </div>
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
