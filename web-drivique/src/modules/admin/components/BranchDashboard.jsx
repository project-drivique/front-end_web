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
  FaPhone,
  FaChartBar,
  FaTimesCircle,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { useBranchDashboard, getScheduleForRange } from '../../../hooks/useBranchDashboard'
import ManagementSidebar from './ManagementSidebar'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import KpiDetailModal from './KpiDetailModal'
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

const getReservationStatusInfo = (rawStatus) => {
  const s = String(rawStatus || 'CONFIRMADA').trim().toUpperCase()

  if (['PENDIENTE', 'PENDIENTE_EFECTIVO', 'PENDIENTE_VALIDACION', 'DOCUMENTO_PENDIENTE'].includes(s) || s.includes('PENDIENTE')) {
    let sublabel = 'Pendiente (Validación / Pago)'
    if (s === 'PENDIENTE_EFECTIVO') sublabel = 'Pendiente (Pago en efectivo)'
    else if (s === 'PENDIENTE_VALIDACION' || s === 'DOCUMENTO_PENDIENTE') sublabel = 'Pendiente (Documentación)'
    
    return {
      visibleState: 'Pendiente',
      internalStates: ['PENDIENTE', 'PENDIENTE_EFECTIVO', 'PENDIENTE_VALIDACION'],
      sublabel,
      badgeClass: 'branch-status-badge--amber',
      IconComp: FaClock,
    }
  }

  if (s === 'CONFIRMADA') {
    return {
      visibleState: 'Confirmada',
      internalStates: ['CONFIRMADA'],
      sublabel: 'Aprobada y lista para entrega',
      badgeClass: 'branch-status-badge--green',
      IconComp: FaCheckCircle,
    }
  }

  if (s === 'ACTIVA' || s === 'EN_CURSO' || s === 'EN CURSO') {
    return {
      visibleState: 'En curso',
      internalStates: ['ACTIVA'],
      sublabel: 'Vehículo entregado al cliente',
      badgeClass: 'branch-status-badge--blue',
      IconComp: FaCar,
    }
  }

  if (s === 'COMPLETADA' || s === 'FINALIZADA' || s === 'RECIBIDA') {
    return {
      visibleState: 'Finalizada',
      internalStates: ['COMPLETADA'],
      sublabel: 'Vehículo devuelto e inspeccionado',
      badgeClass: 'branch-status-badge--teal',
      IconComp: FaCheckDouble,
    }
  }

  if (s === 'CANCELADA' || s === 'CANCELADA_POR_TIEMPO') {
    return {
      visibleState: 'Cancelada',
      internalStates: ['CANCELADA', 'CANCELADA_POR_TIEMPO'],
      sublabel: s === 'CANCELADA_POR_TIEMPO' ? 'Expirada por tiempo' : 'Reserva anulada',
      badgeClass: 'branch-status-badge--gray',
      IconComp: FaTimesCircle,
    }
  }

  return {
    visibleState: 'Confirmada',
    internalStates: ['CONFIRMADA'],
    sublabel: 'Aprobada y lista para entrega',
    badgeClass: 'branch-status-badge--green',
    IconComp: FaCheckCircle,
  }
}

const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'newReservation',
    icon: FaClipboardList,
    iconColor: '#2563eb',
    iconBg: '#eff6ff',
    text: 'Nueva reserva #RES-8920 realizada por Carlos Restrepo',
    time: 'Hace 10 min',
    isRead: false,
    route: '/encargado/reservations',
  },
  {
    id: 'notif-2',
    type: 'pendingDocument',
    icon: FaIdCard,
    iconColor: '#b45309',
    iconBg: '#fef3c7',
    text: 'Documento de identidad por validar en Reserva #RES-8914',
    time: 'Hace 25 min',
    isRead: false,
    route: '/encargado/documents',
  },
  {
    id: 'notif-3',
    type: 'openIncident',
    icon: FaExclamationTriangle,
    iconColor: '#dc2626',
    iconBg: '#fef2f2',
    text: 'Incidencia de rayón reportada en Toyota Corolla (ABC-123)',
    time: 'Hace 1 hora',
    isRead: false,
    route: '/encargado/incidents',
  },
  {
    id: 'notif-4',
    type: 'returnCompleted',
    icon: FaUndo,
    iconColor: '#15803d',
    iconBg: '#dcfce7',
    text: 'Devolución completada para vehículo Mazda CX-5 (KLS-849)',
    time: 'Hace 2 horas',
    isRead: false,
    route: '/encargado/reservations',
  },
  {
    id: 'notif-5',
    type: 'paymentReceived',
    icon: FaCashRegister,
    iconColor: '#2563eb',
    iconBg: '#eff6ff',
    text: 'Pago recibido por $150.000 COP en mostrador de sucursal',
    time: 'Hace 3 horas',
    isRead: true,
    route: '/encargado/cobro-sucursal',
  },
  {
    id: 'notif-6',
    type: 'expiringDocument',
    icon: FaCar,
    iconColor: '#b45309',
    iconBg: '#fef3c7',
    text: 'SOAT de Chevrolet Tracker (MXP-492) próximo a vencer en 5 días',
    time: 'Hace 5 horas',
    isRead: true,
    route: '/encargado/vehicles',
  },
]

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
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(2026, 8, 1))

  const monthYearLabel = useMemo(() => {
    const months = [
      'Septiembre 2026', 'Octubre 2026', 'Noviembre 2026', 'Diciembre 2026'
    ]
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return `${monthNames[currentMonthDate.getMonth()]} ${currentMonthDate.getFullYear()}`
  }, [currentMonthDate])

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

  const weekHeaders = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

  return (
    <div className="native-inline-calendar">
      <div className="native-cal-header">
        <button type="button" className="native-cal-nav-btn" onClick={handlePrevMonth} title="Mes anterior">
          &lt;
        </button>
        <strong className="native-cal-title">{monthYearLabel}</strong>
        <button type="button" className="native-cal-nav-btn" onClick={handleNextMonth} title="Mes siguiente">
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
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const maxVal = useMemo(() => {
    const highest = Math.max(
      ...hourlyData.map((d) => Math.max(d.deliveries || 0, d.returns || 0)),
      3
    )
    return Math.ceil(highest / 3) * 3 || 3
  }, [hourlyData])

  const svgWidth = 560
  const svgHeight = 210
  const marginTop = 20
  const marginBottom = 35
  const marginLeft = 35
  const marginRight = 15

  const chartWidth = svgWidth - marginLeft - marginRight
  const chartHeight = svgHeight - marginTop - marginBottom

  const numSlots = hourlyData.length || 10
  const slotWidth = chartWidth / numSlots
  const barWidth = 14
  const barGap = 3

  const yTicks = [0, Math.round(maxVal / 3), Math.round((maxVal * 2) / 3), maxVal]

  return (
    <div className="native-barchart-wrapper" style={{ position: 'relative', width: '100%' }}>
      <div className="native-chart-legend">
        <div className="native-legend-item">
          <span className="native-legend-dot" style={{ background: '#2563eb' }} />
          <span>Entregas</span>
        </div>
        <div className="native-legend-item">
          <span className="native-legend-dot" style={{ background: '#10b981' }} />
          <span>Devoluciones</span>
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
                stroke={tick === 0 ? 'var(--borde, #cbd5e1)' : 'var(--borde-suave, #e2e8f0)'}
                strokeWidth={tick === 0 ? '1.5' : '1'}
                strokeDasharray={tick === 0 ? 'none' : '3 3'}
              />
              <text
                x={marginLeft - 8}
                y={yPos + 4}
                fill="var(--texto-second, #64748b)"
                fontSize="11"
                fontWeight="600"
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
                  x={groupCenterX - slotWidth / 2}
                  y={marginTop}
                  width={slotWidth}
                  height={chartHeight}
                  fill="rgba(37, 99, 235, 0.06)"
                  rx="4"
                />
              )}

              <rect
                x={xDel}
                y={yDel}
                width={barWidth}
                height={Math.max(hDel, 2)}
                fill="#2563eb"
                rx="3"
              />

              <rect
                x={xRet}
                y={yRet}
                width={barWidth}
                height={Math.max(hRet, 2)}
                fill="#10b981"
                rx="3"
              />

              <text
                x={groupCenterX}
                y={svgHeight - 10}
                fill={isHovered ? '#2563eb' : 'var(--texto-second, #64748b)'}
                fontSize="11"
                fontWeight={isHovered ? '700' : '600'}
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
            top: '30px',
            left: `${((marginLeft + hoveredIndex * slotWidth + slotWidth / 2) / svgWidth) * 100}%`,
            transform: 'translateX(-50%)',
            background: 'var(--bg-tarjeta, #ffffff)',
            border: '1px solid var(--borde, #e2e8f0)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '8px',
            padding: '6px 12px',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <strong style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--texto-primary, #1e293b)' }}>
            {hourlyData[hoveredIndex].label}
          </strong>
          <div style={{ fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'center', color: '#2563eb' }}>
            <span>Entregas:</span>
            <strong>{hourlyData[hoveredIndex].deliveries}</strong>
          </div>
          <div style={{ fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'center', color: '#10b981' }}>
            <span>Devoluciones:</span>
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
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

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

  const unreadNotifCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  const handleToggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev)
  }

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const handleNotificationClick = (notif) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    )
    setIsNotificationsOpen(false)
    if (notif.route) {
      navigate(notif.route)
    }
  }

  const getKpiDataForExport = (metricKey) => {
    const branchName = dashboardData?.branchName || 'Alamo Bogotá - Aeropuerto'

    if (metricKey === 'ingresos') {
      return {
        title: 'Ingresos del Mes',
        filename: 'reporte_ingresos_mes',
        headers: ['Código Reserva', 'Cliente', 'Vehículo', 'Fecha Inicio', 'Fecha Fin', 'Monto Total', 'Estado'],
        rows: [
          ['RES-8920', 'Carlos Restrepo', 'Toyota Corolla (ABC-123)', '2026-09-20', '2026-09-25', '$ 1.250.000 COP', 'FINALIZADA'],
          ['RES-8918', 'Ana María Gómez', 'Chevrolet Tracker (MXP-492)', '2026-09-22', '2026-09-27', '$ 1.800.000 COP', 'EN CURSO'],
          ['RES-8915', 'Felipe Mendoza', 'Mazda CX-5 (KLS-849)', '2026-09-24', '2026-09-26', '$ 950.000 COP', 'CONFIRMADA'],
          ['RES-8910', 'Laura Sofía Ruiz', 'Renault Duster (JHK-201)', '2026-09-15', '2026-09-21', '$ 1.400.000 COP', 'FINALIZADA'],
          ['RES-8904', 'Diego Alexander Marín', 'Nissan Kicks (WER-902)', '2026-09-10', '2026-09-14', '$ 1.100.000 COP', 'FINALIZADA'],
        ],
        kpis: [
          { label: 'Total Ingresos Mes', value: '$ 45.200.000 COP' },
          { label: 'Crecimiento vs. Mes Anterior', value: '+8.5%' },
          { label: 'Sucursal', value: branchName },
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
        title: 'Entregas de Hoy',
        filename: 'reporte_entregas_hoy',
        headers: ['Reserva ID', 'Hora Programada', 'Cliente', 'Teléfono', 'Vehículo', 'Placa', 'Estado Entrega'],
        rows: rows.length > 0 ? rows : [
          ['RES-8920', '08:30 AM', 'Carlos Restrepo', '+57 310 456 7890', 'Toyota Corolla', 'ABC-123', 'COMPLETADA'],
          ['RES-8922', '10:00 AM', 'Juan David Pérez', '+57 300 123 4567', 'Mazda CX-5', 'KLS-849', 'COMPLETADA'],
          ['RES-8925', '02:00 PM', 'Santiago Castro', '+57 315 789 0123', 'Renault Duster', 'JHK-201', 'PENDIENTE'],
        ],
        kpis: [
          { label: 'Total Programadas', value: String(dashboardData?.todayDeliveriesCount ?? 3) },
          { label: 'Entregadas/Completadas', value: String(dashboardData?.todayDeliveriesCompleted ?? 2) },
          { label: 'Pendientes', value: String(dashboardData?.todayDeliveriesPending ?? 1) },
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
        title: 'Devoluciones de Hoy',
        filename: 'reporte_devoluciones_hoy',
        headers: ['Reserva ID', 'Hora Programada', 'Cliente', 'Teléfono', 'Vehículo', 'Placa', 'Estado Devolución'],
        rows: rows.length > 0 ? rows : [
          ['RES-8914', '01:30 PM', 'Ana María Gómez', '+57 320 987 6543', 'Chevrolet Tracker', 'MXP-492', 'RECIBIDA'],
          ['RES-8916', '04:30 PM', 'Felipe Mendoza', '+57 311 234 5678', 'Nissan Kicks', 'WER-902', 'RECIBIDA'],
        ],
        kpis: [
          { label: 'Total Programadas', value: String(dashboardData?.todayReturnsCount ?? 2) },
          { label: 'Recibidas', value: String(dashboardData?.todayReturnsReceived ?? 2) },
          { label: 'Pendientes', value: String(dashboardData?.todayReturnsPending ?? 0) },
        ],
      }
    }

    if (metricKey === 'ocupacion') {
      const f = dashboardData?.fleet || {}
      return {
        title: 'Ocupación de Flota',
        filename: 'reporte_ocupacion_flota',
        headers: ['Placa', 'Vehículo', 'Categoría', 'Sucursal', 'Estado Operativo', 'Reserva Asignada'],
        rows: [
          ['ABC-123', 'Toyota Corolla', 'Sedán Élite', branchName, 'OCUPADO', 'RES-8920'],
          ['MXP-492', 'Chevrolet Tracker', 'SUV Compacto', branchName, 'OCUPADO', 'RES-8918'],
          ['KLS-849', 'Mazda CX-5', 'SUV Confort', branchName, 'DISPONIBLE', 'Sin reserva'],
          ['JHK-201', 'Renault Duster', 'SUV 4x4', branchName, 'RESERVADO', 'RES-8924'],
          ['WER-902', 'Nissan Kicks', 'Crossover', branchName, 'EN MANTENIMIENTO', 'Mantenimiento preventivo'],
        ],
        kpis: [
          { label: 'Tasa de Ocupación', value: `${f.occupancyRate || 40}%` },
          { label: 'Ocupados', value: `${f.rentedVehicles || 2} de ${f.totalVehicles || 5}` },
          { label: 'Disponibles', value: String(f.availableVehicles || 2) },
          { label: 'En Mantenimiento', value: String(f.maintenanceVehicles || 1) },
        ],
      }
    }

    return { title: 'Métrica Operativa', filename: 'reporte', headers: [], rows: [], kpis: [] }
  }

  const handleOpenKpiDetail = (metricKey) => {
    setActiveKpiMenu(null)
    if (metricKey === 'ingresos') {
      navigate('/encargado/reports')
    } else if (metricKey === 'entregas' || metricKey === 'devoluciones') {
      navigate('/encargado/reservations')
    } else if (metricKey === 'ocupacion') {
      navigate('/encargado/vehicles')
    }
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
      return `Programación del ${formatDateLabel(startStr)}`
    }
    return `Programación del ${formatDateLabel(startStr)} al ${formatDateLabel(endStr)}`
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
        if (
          isNotificationsOpen &&
          notifRef.current &&
          !notifRef.current.contains(e.target) &&
          !notifBtnRef.current?.contains(e.target)
        ) {
          setIsNotificationsOpen(false)
        }
        setActiveKpiMenu(null)
      }
    }

    document.addEventListener('keydown', handleGlobalClickAndKeys)
    document.addEventListener('mousedown', handleGlobalClickAndKeys)

    return () => {
      document.removeEventListener('keydown', handleGlobalClickAndKeys)
      document.removeEventListener('mousedown', handleGlobalClickAndKeys)
    }
  }, [isNotificationsOpen])

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

        {/* BARRA SUPERIOR GLOBAL CON BÚSQUEDA Y NOTIFICACIONES */}
        <div className="branch-top-global-bar">
          <div className="branch-search-box">
            <FaSearch className="branch-search-icon" aria-hidden="true" />
            <input
              type="text"
              className="branch-search-input"
              placeholder={t('dashboard.searchPlaceholder', 'Buscar en el sistema...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="branch-search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Limpiar búsqueda"
                aria-label="Limpiar búsqueda"
              >
                <FaTimes aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="branch-top-right-tools">
            <div className="branch-notification-wrapper">
              <button
                ref={notifBtnRef}
                type="button"
                className={`branch-icon-btn branch-notification-btn ${
                  isNotificationsOpen ? 'branch-icon-btn--active' : ''
                }`}
                title="Notificaciones"
                aria-label="Notificaciones"
                aria-expanded={isNotificationsOpen}
                aria-haspopup="menu"
                onClick={handleToggleNotifications}
              >
                <FaBell aria-hidden="true" />
                {unreadNotifCount > 0 && (
                  <span className="branch-notification-badge">{unreadNotifCount}</span>
                )}
              </button>

              {isNotificationsOpen && (
                <div
                  ref={notifRef}
                  className="branch-dropdown-menu branch-notifications-dropdown"
                  role="menu"
                  aria-label="Panel de Notificaciones"
                >
                  <div className="branch-notif-header">
                    <span className="branch-notif-title">
                      {t('dashboard.notifications.title', 'Notificaciones')}
                    </span>
                    {unreadNotifCount > 0 && (
                      <button
                        type="button"
                        className="branch-notif-mark-btn"
                        onClick={handleMarkAllNotificationsRead}
                      >
                        <FaCheckDouble aria-hidden="true" />
                        <span>{t('dashboard.notifications.markAllAsRead', 'Marcar todas como leídas')}</span>
                      </button>
                    )}
                  </div>

                  <div className="branch-notif-list">
                    {notifications.length === 0 ? (
                      <div className="branch-notif-empty">
                        {t('dashboard.notifications.empty', 'No tienes notificaciones pendientes.')}
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((notif) => {
                        const IconComp = notif.icon || FaBell
                        return (
                          <div
                            key={notif.id}
                            tabIndex={0}
                            role="menuitem"
                            className={`branch-notif-item ${
                              !notif.isRead ? 'branch-notif-item--unread' : ''
                            }`}
                            onClick={() => handleNotificationClick(notif)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleNotificationClick(notif)
                              }
                            }}
                          >
                            <div
                              className="branch-notif-icon-box"
                              style={{ background: notif.iconBg, color: notif.iconColor }}
                            >
                              <IconComp aria-hidden="true" />
                            </div>
                            <div className="branch-notif-text-wrap">
                              <p className="branch-notif-text">{notif.text}</p>
                              <span className="branch-notif-time">{notif.time}</span>
                            </div>
                            {!notif.isRead && <span className="branch-notif-unread-dot" />}
                          </div>
                        )
                      })
                    )}
                  </div>

                  <div className="branch-notif-footer">
                    <button
                      type="button"
                      className="branch-notif-view-all-btn"
                      onClick={() => {
                        setIsNotificationsOpen(false)
                        navigate('/encargado/reservations')
                      }}
                    >
                      {t('dashboard.notifications.viewAll', 'Ver todas')}
                    </button>
                  </div>
                </div>
              )}
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
              <span>En tiempo real</span>
            </div>
            <h1 className="branch-gradient-hero-title">
              {dashboardData.branchName || 'Alamo Bogotá - Aeropuerto'}
            </h1>
            <p className="branch-gradient-hero-subtitle">
              Resumen general del rendimiento operativo de la sucursal
            </p>
          </div>

          <div className="branch-gradient-hero-actions">
            <button
              type="button"
              className="branch-hero-btn branch-hero-btn--outlined"
              onClick={() => navigate(incidentsRoute)}
            >
              <FaExclamationTriangle aria-hidden="true" />
              <span>Reportar incidencia</span>
            </button>

            <button
              type="button"
              className="branch-hero-btn branch-hero-btn--white"
              onClick={() => navigate(reservationsRoute)}
            >
              <FaPlus aria-hidden="true" />
              <span>Crear reserva</span>
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
                      Exportar a Excel
                    </button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleExportKpiPdf('ingresos')}
                    >
                      Exportar a PDF
                    </button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handlePrintKpi('ingresos')}
                    >
                      Imprimir
                    </button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleOpenKpiDetail('ingresos')}
                    >
                      Ver detalle
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
                    >
                      Exportar a Excel
                    </button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleExportKpiPdf('entregas')}
                    >
                      Exportar a PDF
                    </button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handlePrintKpi('entregas')}
                    >
                      Imprimir
                    </button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleOpenKpiDetail('entregas')}
                    >
                      Ver detalle
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="branch-kpi-card-body">
              <div className="branch-kpi-value-row">
                <strong className="branch-kpi-value">
                  {dashboardData.todayDeliveriesCount ?? 3}
                </strong>
                <span className="branch-kpi-unit">programadas</span>
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
                {dashboardData.todayDeliveriesCompleted} completadas · {dashboardData.todayDeliveriesPending} pendientes
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
                    >
                      Exportar a Excel
                    </button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleExportKpiPdf('devoluciones')}
                    >
                      Exportar a PDF
                    </button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handlePrintKpi('devoluciones')}
                    >
                      Imprimir
                    </button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleOpenKpiDetail('devoluciones')}
                    >
                      Ver detalle
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="branch-kpi-card-body">
              <div className="branch-kpi-value-row">
                <strong className="branch-kpi-value">
                  {dashboardData.todayReturnsCount ?? 2}
                </strong>
                <span className="branch-kpi-unit">programadas</span>
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
                {dashboardData.todayReturnsPending} pendientes · {dashboardData.todayReturnsReceived} recibidas
              </span>
            </div>
          </article>

          {/* Tarjeta 4: Ocupación */}
          <article className="branch-kpi-card">
            <div className="branch-kpi-card-header">
              <div className="branch-kpi-title-with-icon">
                <span className="branch-kpi-title">
                  <FaCar className="branch-kpi-inline-icon" aria-hidden="true" />
                  {t('dashboard.kpi.occupancy', 'Ocupación de flota')}
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
                    >
                      Exportar a Excel
                    </button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleExportKpiPdf('ocupacion')}
                    >
                      Exportar a PDF
                    </button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handlePrintKpi('ocupacion')}
                    >
                      Imprimir
                    </button>
                    <button
                      type="button"
                      className="branch-kpi-dropdown-item"
                      onClick={() => handleOpenKpiDetail('ocupacion')}
                    >
                      Ver detalle
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="branch-kpi-card-body">
              <div className="branch-kpi-value-row">
                <strong className="branch-kpi-value">
                  {fleet.occupancyRate}%
                </strong>
                <span className="branch-kpi-unit">en alquiler</span>
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
                {fleet.rentedVehicles} de {fleet.totalVehicles} vehículos en uso
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
                      <FaChartBar className="branch-card-title-icon" aria-hidden="true" />
                      Carga Operativa por Franja Horaria
                    </h3>
                    <span className="branch-hourly-chart-sub">
                      {getSectionTitle(startDateStr, endDateStr)}
                    </span>
                  </div>
                </div>

                <div className="branch-hourly-stats-pill">
                  <span>Total: <strong>{deliveriesForRange.length + returnsForRange.length} ops</strong></span>
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
                    {activeTab === 'entregas' ? 'Listado de Entregas' : 'Listado de Devoluciones'}
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
                    Entregas
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
                    Devoluciones
                  </button>
                </div>
              </div>

              {/* RESUMEN VEHÍCULOS */}
              <div className="branch-schedule-summary-bar">
                <span>Total de vehículos: {deliveriesForRange.length || currentList.length}</span>
              </div>

              {currentList.length === 0 ? (
                <div className="branch-empty-row">
                  <span>
                    {activeTab === 'entregas'
                      ? 'No hay entregas programadas para el rango de fechas seleccionado en el calendario.'
                      : 'No hay devoluciones programadas para el rango de fechas seleccionado en el calendario.'}
                  </span>
                </div>
              ) : (
                <div className="branch-table-responsive">
                  <table className="branch-schedule-table">
                    <thead>
                      <tr>
                        <th scope="col">CLIENTE</th>
                        <th scope="col">IMAGEN</th>
                        <th scope="col">VEHÍCULO</th>
                        <th scope="col">PLACA</th>
                        <th scope="col">FECHA</th>
                        <th scope="col">HORA</th>
                        <th scope="col">ESTADO</th>
                        <th scope="col" className="branch-th-actions">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentList.map((item, idx) => {
                        const itemUniqueId = item.id || `item-${idx}`
                        const cliente = item.clienteNombre || 'Carlos Restrepo'
                        const vehiculo = item.vehiculoNombre || 'Toyota Corolla'
                        const placa = item.vehiculoPlaca || 'ABC-123'
                        
                        const displayDate = formatDateLabel(item.fecha || TODAY_STR)
                        const displayTime = item.hora || '08:30 AM'

                        return (
                          <tr key={itemUniqueId} className="branch-table-row">
                            {/* CLIENTE */}
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
                                const stInfo = getReservationStatusInfo(item.estado)
                                const StatusIcon = stInfo.IconComp
                                return (
                                  <span className={`branch-status-badge ${stInfo.badgeClass}`}>
                                    <StatusIcon className="branch-badge-icon" aria-hidden="true" />
                                    {stInfo.visibleState}
                                  </span>
                                )
                              })()}
                            </td>

                            {/* ACCIONES - ÍCONO VER DETALLES */}
                            <td className="branch-td-actions">
                              <div className="branch-row-actions-group">
                                <button
                                  type="button"
                                  className="branch-action-icon-btn branch-action-icon-btn--eye"
                                  title="Ver reserva completa"
                                  aria-label="Ver reserva completa"
                                  onClick={(e) => handleOpenDrawer(item, e)}
                                >
                                  <FaEye aria-hidden="true" />
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
                      Estados de la Reserva
                    </h3>
                    <span className="branch-status-guide-sub">Guía explicativa de estados operativos y su equivalencia interna</span>
                  </div>
                </div>
              </div>

              <div className="branch-status-guide-grid">
                {/* 1. PENDIENTE */}
                <div className="branch-status-card-item branch-status-card-item--amber">
                  <div className="branch-status-card-header">
                    <span className="branch-status-badge branch-status-badge--amber">
                      <FaClock className="branch-badge-icon" aria-hidden="true" />
                      Pendiente
                    </span>
                  </div>
                  <p className="branch-status-card-text">
                    Agrupa los estados internos <code className="branch-inline-code">PENDIENTE</code>, <code className="branch-inline-code">PENDIENTE_EFECTIVO</code> y <code className="branch-inline-code">PENDIENTE_VALIDACION</code>. La reserva está creada a la espera de pago en mostrador o validación de documentos.
                  </p>
                </div>

                {/* 2. CONFIRMADA */}
                <div className="branch-status-card-item branch-status-card-item--green">
                  <div className="branch-status-card-header">
                    <span className="branch-status-badge branch-status-badge--green">
                      <FaCheckCircle className="branch-badge-icon" aria-hidden="true" />
                      Confirmada
                    </span>
                  </div>
                  <p className="branch-status-card-text">
                    Corresponde al estado interno <code className="branch-inline-code">CONFIRMADA</code>. Pago y documentos validados 100%. Vehículo alistado y listo para entrega.
                  </p>
                </div>

                {/* 3. EN CURSO */}
                <div className="branch-status-card-item branch-status-card-item--blue">
                  <div className="branch-status-card-header">
                    <span className="branch-status-badge branch-status-badge--blue">
                      <FaCar className="branch-badge-icon" aria-hidden="true" />
                      En curso
                    </span>
                  </div>
                  <p className="branch-status-card-text">
                    Corresponde al estado interno <code className="branch-inline-code">ACTIVA</code>. Vehículo entregado al cliente en sucursal y contrato de alquiler en ejecución.
                  </p>
                </div>

                {/* 4. FINALIZADA */}
                <div className="branch-status-card-item branch-status-card-item--teal">
                  <div className="branch-status-card-header">
                    <span className="branch-status-badge branch-status-badge--teal">
                      <FaCheckDouble className="branch-badge-icon" aria-hidden="true" />
                      Finalizada
                    </span>
                  </div>
                  <p className="branch-status-card-text">
                    Corresponde al estado interno <code className="branch-inline-code">COMPLETADA</code>. Vehículo recibido en sucursal, inspeccionado y contrato cerrado.
                  </p>
                </div>

                {/* 5. CANCELADA */}
                <div className="branch-status-card-item branch-status-card-item--gray" style={{ gridColumn: 'span 2' }}>
                  <div className="branch-status-card-header">
                    <span className="branch-status-badge branch-status-badge--gray">
                      <FaTimesCircle className="branch-badge-icon" aria-hidden="true" />
                      Cancelada
                    </span>
                  </div>
                  <p className="branch-status-card-text">
                    Agrupa los estados internos <code className="branch-inline-code">CANCELADA</code> y <code className="branch-inline-code">CANCELADA_POR_TIEMPO</code>. Indica que la reserva fue anulada por solicitud del cliente o expirada automáticamente por tiempo límite.
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
                      <FaCalendarAlt className="branch-card-title-icon" aria-hidden="true" />
                      Calendario Operativo
                    </h3>
                    <span className="branch-calendar-card-sub">Selecciona un rango de fechas</span>
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
                      {attentionNeeded.pendingDocuments || 2} documentos por validar
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
                      {attentionNeeded.openIncidents || 1} incidencia abierta
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
                      {attentionNeeded.expiringVehicleDocs || 1} documento de vehículo por vencer
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
                <span className="branch-fleet-total-pill">{totalF} vehículos en sucursal</span>
              </div>

              {/* 4 TARJETAS RESUMEN DE ESTADO */}
              <div className="branch-fleet-stats-grid">
                <div className="branch-fleet-stat-box branch-fleet-stat-box--green">
                  <div className="branch-fleet-stat-head">
                    <span className="branch-dot branch-dot--green" />
                    <span className="branch-fleet-stat-lbl">Disponibles</span>
                  </div>
                  <div className="branch-fleet-stat-num">
                    2 <small>(40%)</small>
                  </div>
                  <span className="branch-fleet-stat-desc">Listos para entrega</span>
                </div>

                <div className="branch-fleet-stat-box branch-fleet-stat-box--blue">
                  <div className="branch-fleet-stat-head">
                    <span className="branch-dot branch-dot--blue" />
                    <span className="branch-fleet-stat-lbl">Ocupados</span>
                  </div>
                  <div className="branch-fleet-stat-num">
                    1 <small>(20%)</small>
                  </div>
                  <span className="branch-fleet-stat-desc">En contrato activo</span>
                </div>

                <div className="branch-fleet-stat-box branch-fleet-stat-box--cyan">
                  <div className="branch-fleet-stat-head">
                    <span className="branch-dot branch-dot--cyan" />
                    <span className="branch-fleet-stat-lbl">Reservados</span>
                  </div>
                  <div className="branch-fleet-stat-num">
                    1 <small>(20%)</small>
                  </div>
                  <span className="branch-fleet-stat-desc">Para entrega hoy</span>
                </div>

                <div className="branch-fleet-stat-box branch-fleet-stat-box--amber">
                  <div className="branch-fleet-stat-head">
                    <span className="branch-dot branch-dot--amber" />
                    <span className="branch-fleet-stat-lbl">En mantenimiento</span>
                  </div>
                  <div className="branch-fleet-stat-num">
                    1 <small>(20%)</small>
                  </div>
                  <span className="branch-fleet-stat-desc">Revisión técnica</span>
                </div>
              </div>

              {/* BARRA SEGMENTADA DE DISTRIBUCIÓN */}
              <div className="branch-fleet-bar-wrapper">
                <div className="branch-fleet-bar-labels">
                  <span>Distribución de disponibilidad</span>
                  <strong>80% operativa</strong>
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
                <span className="branch-fleet-units-title">Unidades de la sucursal</span>
                <div className="branch-fleet-unit-item">
                  <div className="branch-fleet-unit-meta">
                    <span className="branch-fleet-unit-name">Toyota Corolla</span>
                    <span className="branch-fleet-unit-plate">ABC-123 · Sedán</span>
                  </div>
                  <span className="branch-status-badge branch-status-badge--blue">Ocupado</span>
                </div>

                <div className="branch-fleet-unit-item">
                  <div className="branch-fleet-unit-meta">
                    <span className="branch-fleet-unit-name">Chevrolet Tracker</span>
                    <span className="branch-fleet-unit-plate">MXP-492 · SUV</span>
                  </div>
                  <span className="branch-status-badge branch-status-badge--green">Disponible</span>
                </div>

                <div className="branch-fleet-unit-item">
                  <div className="branch-fleet-unit-meta">
                    <span className="branch-fleet-unit-name">Mazda CX-5</span>
                    <span className="branch-fleet-unit-plate">KLS-849 · SUV</span>
                  </div>
                  <span className="branch-status-badge branch-status-badge--green">Disponible</span>
                </div>

                <div className="branch-fleet-unit-item">
                  <div className="branch-fleet-unit-meta">
                    <span className="branch-fleet-unit-name">Renault Duster</span>
                    <span className="branch-fleet-unit-plate">JHK-201 · 4x4</span>
                  </div>
                  <span className="branch-status-badge branch-status-badge--cyan">Reservado</span>
                </div>

                <div className="branch-fleet-unit-item">
                  <div className="branch-fleet-unit-meta">
                    <span className="branch-fleet-unit-name">Nissan Kicks</span>
                    <span className="branch-fleet-unit-plate">WER-902 · Crossover</span>
                  </div>
                  <span className="branch-status-badge branch-status-badge--amber">En mantenimiento</span>
                </div>
              </div>

              <div className="branch-fleet-footer">
                <button
                  type="button"
                  className="branch-link-btn"
                  onClick={() => navigate(vehiclesRoute)}
                >
                  <span>Ver flota &gt;</span>
                </button>
              </div>
            </article>
          </div>
        </section>
      </main>

      {/* DRAWER LATERAL SLIDE-OVER PARA VISTA DE DETALLE COMPLETO (SOLO LECTURA) */}
      {selectedScheduleItem && (
        <div
          className="branch-drawer-overlay"
          onClick={handleCloseDrawer}
          role="presentation"
        />
      )}

      <div
        ref={drawerRef}
        className={`branch-drawer ${selectedScheduleItem ? 'branch-drawer--open' : ''}`}
        aria-hidden={!selectedScheduleItem}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {selectedScheduleItem && (
          <div className="branch-drawer-content">
            <header className="branch-drawer-header">
              <div>
                <span className="branch-drawer-code">
                  {selectedScheduleItem.codigo || `RES-${selectedScheduleItem.id}`}
                </span>
                <h3 id="drawer-title" className="branch-drawer-title">
                  Consulta de Reserva Registrada
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
                  Fecha Registro: 20 sep 2026 · 02:45 PM
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--brand-primary, #2563eb)', fontWeight: '700' }}>
                  TX: #WOMPI-994820
                </span>
              </div>

              {/* Sección 1: Datos del Cliente */}
              <div className="branch-drawer-section">
                <span className="branch-drawer-sec-title">Titular de la Reserva</span>
                <div className="branch-drawer-value-row">
                  <div className="branch-schedule-avatar branch-avatar--soft-blue">
                    {getInitials(selectedScheduleItem.clienteNombre)}
                  </div>
                  <div className="branch-drawer-client-details">
                    <span className="branch-drawer-val-primary">
                      {selectedScheduleItem.clienteNombre || 'Carlos Restrepo Jaramillo'}
                    </span>
                    <span className="branch-drawer-val-sub">
                      Documento: CC 1.020.340.589 (Bogotá)
                    </span>
                  </div>
                </div>
                <div className="branch-drawer-grid-2" style={{ marginTop: '10px' }}>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Teléfono / Móvil</span>
                    <span className="branch-drawer-item-val">{selectedScheduleItem.clienteTelefono || '+57 310 456 7890'}</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Correo electrónico</span>
                    <span className="branch-drawer-item-val">carlos.restrepo@gmail.com</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Licencia de Conducción</span>
                    <span className="branch-drawer-item-val">LIC-B1-4920194 (Vence 2028)</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Conductor Adicional</span>
                    <span className="branch-drawer-item-val">Laura Restrepo (Habilitado)</span>
                  </div>
                </div>
              </div>

              {/* Sección 2: Vehículo Asignado y Especificaciones */}
              <div className="branch-drawer-section">
                <span className="branch-drawer-sec-title">Vehículo Registrado</span>
                
                <div className="branch-drawer-vehicle-banner">
                  <img
                    src={getVehicleImage(selectedScheduleItem)}
                    alt={selectedScheduleItem.vehiculoNombre || selectedScheduleItem.vehiculo || 'Vehículo'}
                    className="branch-drawer-vehicle-img"
                  />
                  <div className="branch-drawer-vehicle-banner-overlay">
                    <strong>{selectedScheduleItem.vehiculoNombre || selectedScheduleItem.vehiculo || 'Toyota Corolla 2.0 Hybrid'}</strong>
                    <span>Placa: {selectedScheduleItem.vehiculoPlaca || selectedScheduleItem.placa || 'ABC-123'}</span>
                  </div>
                </div>

                <div className="branch-drawer-grid-2" style={{ marginTop: '12px' }}>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Modelo y Motor</span>
                    <span className="branch-drawer-item-val">{selectedScheduleItem.vehiculoNombre || 'Toyota Corolla 2.0 Hybrid'}</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Placa Asignada</span>
                    <span className="branch-drawer-item-val">{selectedScheduleItem.vehiculoPlaca || selectedScheduleItem.placa || 'ABC-123'}</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Categoría</span>
                    <span className="branch-drawer-item-val">{selectedScheduleItem.vehiculoCategoria || 'Sedán Ejecutivo'}</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Transmisión / Combustible</span>
                    <span className="branch-drawer-item-val">Automática · Híbrido (Tanque lleno)</span>
                  </div>
                </div>
              </div>

              {/* Sección 3: Periodo e Itinerario del Alquiler */}
              <div className="branch-drawer-section">
                <span className="branch-drawer-sec-title">Itinerario y Sucursal</span>
                <div className="branch-drawer-grid-2">
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Fecha / Hora Recogida</span>
                    <span className="branch-drawer-item-val">
                      {selectedScheduleItem.fecha ? `${formatDateLabel(selectedScheduleItem.fecha)} · ${selectedScheduleItem.hora}` : selectedScheduleItem.hora || '08:30 AM'}
                    </span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Fecha / Hora Devolución</span>
                    <span className="branch-drawer-item-val">28 sep 2026 · 08:30 AM</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Sucursal de Retiro</span>
                    <span className="branch-drawer-item-val">{dashboardData?.branchName || 'Alamo Bogotá - Aeropuerto'}</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Sucursal de Retorno</span>
                    <span className="branch-drawer-item-val">{dashboardData?.branchName || 'Alamo Bogotá - Aeropuerto'}</span>
                  </div>
                </div>
              </div>

              {/* Sección 4: Coberturas y Servicios Adicionales */}
              <div className="branch-drawer-section">
                <span className="branch-drawer-sec-title">Cobertura &amp; Servicios Adicionales</span>
                <div className="branch-drawer-grid-2">
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Seguro Contratado</span>
                    <span className="branch-drawer-item-val">Protección Total CDW + TP ($0 Deducible)</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Equipamiento Bebé</span>
                    <span className="branch-drawer-item-val">1 Silla infantil instalada</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Asistencia en Ruta</span>
                    <span className="branch-drawer-item-val">Servicio Grúa 24/7 Incluido</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Política de Combustible</span>
                    <span className="branch-drawer-item-val">Lleno a Lleno</span>
                  </div>
                </div>
              </div>

              {/* Sección 5: Desglose Financiero Detallado (COP) */}
              <div className="branch-drawer-section">
                <span className="branch-drawer-sec-title">Desglose Financiero Completo (COP)</span>
                <div className="branch-drawer-price-row">
                  <span>Alquiler Base (3 días x $120.000 COP)</span>
                  <strong>$ 360.000 COP</strong>
                </div>
                <div className="branch-drawer-price-row">
                  <span>Seguro Cobertura Total CDW</span>
                  <strong>$ 45.000 COP</strong>
                </div>
                <div className="branch-drawer-price-row">
                  <span>Silla Bebé Adicional</span>
                  <strong>$ 15.000 COP</strong>
                </div>
                <div className="branch-drawer-price-row">
                  <span>Impuestos de Ley (IVA 19%)</span>
                  <strong>$ 79.800 COP</strong>
                </div>
                <div className="branch-drawer-price-row branch-drawer-price-total">
                  <span>Total General de la Reserva</span>
                  <span>$ 499.800 COP</span>
                </div>
                <div className="branch-drawer-grid-2" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Método de Pago</span>
                    <span className="branch-drawer-item-val">Tarjeta de Crédito (Wompi)</span>
                  </div>
                  <div className="branch-drawer-item-box">
                    <span className="branch-drawer-item-lbl">Depósito en Garantía</span>
                    <span className="branch-drawer-item-val">$ 500.000 COP (Pre-autorizado)</span>
                  </div>
                </div>
              </div>

              {/* Sección 6: Flujo Operativo y Progreso Actual (Stepper) */}
              <div className="branch-drawer-section">
                <span className="branch-drawer-sec-title">Flujo Operativo (Progreso Actual)</span>
                
                <div className="branch-workflow-stepper">
                  {/* Paso 1: Reserva Creada */}
                  <div className="branch-stepper-step branch-stepper-step--completed">
                    <div className="branch-stepper-circle">
                      <FaCheckCircle aria-hidden="true" />
                    </div>
                    <div className="branch-stepper-info">
                      <strong>1. Reserva Creada &amp; Registrada</strong>
                      <span>Registrada con código {selectedScheduleItem.codigo || 'RES-8821'}</span>
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
                      <strong>2. Validación de Documentos</strong>
                      <span>
                        {String(selectedScheduleItem.estado || '').includes('DOCUMENTO')
                          ? 'Pendiente: Cédula / Licencia por verificar'
                          : 'Completado: Cédula y Licencia aprobadas 100%'}
                      </span>
                    </div>
                  </div>

                  {/* Paso 3: Pago Registrado */}
                  <div className="branch-stepper-step branch-stepper-step--completed">
                    <div className="branch-stepper-circle">
                      <FaCheckCircle aria-hidden="true" />
                    </div>
                    <div className="branch-stepper-info">
                      <strong>3. Pago de la Reserva</strong>
                      <span>Completado: $ 499.800 COP cobrados y confirmados</span>
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
                      <strong>4. Entrega de Vehículo en Sucursal</strong>
                      <span>
                        {activeTab === 'entregas'
                          ? `Programada para hoy a las ${selectedScheduleItem.hora || '08:30 AM'}`
                          : 'Vehículo entregado con éxito al cliente'}
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
                      <strong>5. Devolución e Inspección Final</strong>
                      <span>
                        {activeTab === 'devoluciones'
                          ? 'Pendiente por recibir en sucursal'
                          : 'Pendiente al finalizar el contrato'}
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
                Cerrar Consulta
              </button>
            </footer>
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
    </div>
  )
}
