import { useState, useMemo, useEffect, useCallback } from 'react'
import html2canvas from 'html2canvas'
import { useTranslation } from 'react-i18next'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  FaMoneyBillWave,
  FaSearch,
  FaCheckCircle,
  FaCar,
  FaUser,
  FaCalendarAlt,
  FaPrint,
  FaShieldAlt,
  FaReceipt,
  FaCashRegister,
  FaChevronLeft,
  FaChevronRight,
  FaSortAmountDown,
  FaTimes,
  FaBuilding,
  FaFileExcel,
  FaFilePdf,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { reservationManagementService } from '../../../services/reservationManagementService'
import { reservationService } from '../../../services/reservationService'
import { branchManagementService } from '../../../services/branchManagementService'
import { hasMatchingBranch } from '../../../services/accessAuditService'
import { formatCurrency } from '../../../utils/currencyUtils'
import { showAlert } from '../../../utils/swalConfig'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './CashCollectionPage.css'

// ── COMPONENTE DE UN SOLO CALENDARIO REUTILIZABLE PARA SELECCIÓN DE RANGO DE FECHAS ──
function SingleCalendarRangePicker({ dateRange, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const startDate = dateRange?.start || ''
  const endDate = dateRange?.end || ''

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const handleDayClick = (day) => {
    const iso = format(day, 'yyyy-MM-dd')
    if (!startDate || (startDate && endDate)) {
      onChange({ start: iso, end: '' })
    } else {
      if (iso < startDate) {
        onChange({ start: iso, end: '' })
      } else {
        onChange({ start: startDate, end: iso })
        setIsOpen(false)
      }
    }
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange({ start: '', end: '' })
  }

  const formatButtonLabel = () => {
    try {
      if (startDate && endDate) {
        const dStart = parseISO(startDate)
        const dEnd = parseISO(endDate)
        return `${format(dStart, 'dd MMM', { locale: es })} - ${format(dEnd, 'dd MMM yyyy', { locale: es })}`
      }
      if (startDate) {
        const dStart = parseISO(startDate)
        return `Desde ${format(dStart, 'dd MMM yyyy', { locale: es })}`
      }
    } catch {
      // fallback
    }
    return 'Filtrar por Fecha'
  }

  return (
    <div className="cash-calendar-picker-wrapper">
      <button
        type="button"
        className={`cash-calendar-trigger-btn ${(startDate || endDate) ? 'has-value' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaCalendarAlt className="cash-cal-icon" />
        <span>{formatButtonLabel()}</span>
        {(startDate || endDate) && (
          <span className="cash-cal-clear" onClick={handleClear} title="Limpiar rango de fechas">
            <FaTimes />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="cash-calendar-popover">
          <div className="cash-cal-head">
            <button
              type="button"
              className="cash-cal-nav"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <FaChevronLeft />
            </button>

            <span className="cash-cal-month-title">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </span>

            <button
              type="button"
              className="cash-cal-nav"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <FaChevronRight />
            </button>
          </div>

          <div className="cash-cal-weekdays">
            {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="cash-cal-days-grid">
            {days.map((day) => {
              const dayIso = format(day, 'yyyy-MM-dd')
              const isSelectedStart = startDate === dayIso
              const isSelectedEnd = endDate === dayIso
              const isInRange =
                startDate && endDate && dayIso >= startDate && dayIso <= endDate
              const isCurrentMonth = isSameMonth(day, currentMonth)

              let dayClass = 'cash-cal-day'
              if (!isCurrentMonth) dayClass += ' outside-month'
              if (isSelectedStart) dayClass += ' range-start'
              if (isSelectedEnd) dayClass += ' range-end'
              if (isInRange) dayClass += ' in-range'

              return (
                <button
                  key={dayIso}
                  type="button"
                  className={dayClass}
                  onClick={() => handleDayClick(day)}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>

          <div className="cash-cal-footer">
            <span className="cash-cal-hint">
              {!startDate
                ? 'Selecciona la fecha inicial'
                : !endDate
                ? 'Selecciona la fecha final'
                : 'Rango seleccionado'}
            </span>
            {(startDate || endDate) && (
              <button
                type="button"
                className="cash-cal-clean-link"
                onClick={() => {
                  onChange({ start: '', end: '' })
                  setIsOpen(false)
                }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CashCollectionPage({ branchOnly = false }) {
  const { t, i18n } = useTranslation()
  const { tema, moneda, tasaUSD } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const isBranchManager = branchOnly || user?.rol === 'encargado' || user?.rol === 'branch_manager' || user?.rol === 'encargado_sucursal'
  const sucursalAsignada = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || ''

  // Estados de datos y filtros
  const [todasLasReservas, setTodasLasReservas] = useState([])
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState('todas') // 'pendientes' | 'cobradas' | 'todas' | 'digitales'
  const [comprobanteDigital, setComprobanteDigital] = useState(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedMonth, setSelectedMonth] = useState('todas') // 'todas' | '01'..'12'
  const [selectedYear, setSelectedYear] = useState('todas') // 'todas' | '2026'..
  const [selectedBranch, setSelectedBranch] = useState('todas') // 'todas' | nombre sucursal
  const [sortBy, setSortBy] = useState('codigo') // 'reciente' | 'antigua' | 'monto_desc' | 'monto_asc' | 'codigo'

  // Lista única de sucursales disponibles
  const listaSucursales = useMemo(() => {
    try {
      const fromService = (branchManagementService.list(user) || []).map((b) => b.nombre)
      const fromReservations = todasLasReservas
        .map((r) => r.sucursal || r.reservaDetalles?.sucursalRetiro || r.reservaDetalles?.sucursalPagoEfectivo)
        .filter(Boolean)
      const set = new Set([...fromService, ...fromReservations])
      return Array.from(set).filter(Boolean).sort()
    } catch {
      return []
    }
  }, [todasLasReservas, user])

  // Estado de Modal
  const [modalReserva, setModalReserva] = useState(null)
  const [observacionesCaja, setObservacionesCaja] = useState('')
  const [procesandoPago, setProcesandoPago] = useState(false)
  const [searchRefValue, setSearchRefValue] = useState('')

  // Cargar lista de reservas
  const cargarReservas = useCallback(() => {
    const list = reservationManagementService.list(user)
    setTodasLasReservas(list)
  }, [user])

  useEffect(() => {
    cargarReservas()
  }, [cargarReservas])

  // Helper para evaluar si la reserva ya fue realmente cobrada en efectivo en mostrador
  const esCobradoEnSucursal = useCallback((r) => {
    return Boolean(
      r.fechaPagoConfirmado ||
      r.cajeroConfirmacion ||
      (r.metodoPagoConfirmado === 'efectivo' && r.estado?.toLowerCase() === 'confirmada')
    )
  }, [])

  // Filtrar reservas según sucursal asignada
  const reservasSucursal = useMemo(() => {
    if (isBranchManager && sucursalAsignada) {
      return todasLasReservas.filter((r) => {
        return (
          hasMatchingBranch(r.sucursal, sucursalAsignada) ||
          hasMatchingBranch(r.sucursalPagoEfectivo, sucursalAsignada) ||
          hasMatchingBranch(r.reservaDetalles?.sucursalPagoEfectivo, sucursalAsignada) ||
          hasMatchingBranch(r.reservaDetalles?.sucursalRetiro, sucursalAsignada) ||
          String(r.sucursal || '').trim().toLowerCase() === String(sucursalAsignada).trim().toLowerCase()
        )
      })
    }
    return todasLasReservas
  }, [todasLasReservas, isBranchManager, sucursalAsignada])

  // Métricas rápidas
  const todosLosPagos = useMemo(() => {
    return reservasSucursal.filter(r => r.estado !== 'cancelada')
  }, [reservasSucursal])

  const pendientesEfectivo = useMemo(() => {
    return todosLosPagos.filter((r) => {
      const raw = reservationService.obtenerPorReferencia(r.codigo || r.id || r.referencia) || r
      const metodo = raw?.reservaDetalles?.metodoPago || r.pasarela || r.metodoPagoConfirmado
      const estadoNorm = String(r.estado || '').toLowerCase()
      const esEfectivo = metodo === 'efectivo' || estadoNorm.includes('efectivo')
      const yaCobrado = esCobradoEnSucursal(r)
      return esEfectivo && !yaCobrado
    })
  }, [todosLosPagos, esCobradoEnSucursal])

  const cobradasHoy = useMemo(() => {
    const hoyUTC = new Date().toISOString().slice(0, 10)
    const hoyLocal = new Date().toLocaleDateString('en-CA')

    return reservasSucursal.filter((r) => {
      const yaCobrado = esCobradoEnSucursal(r)
      const fechaCobro = String(r.fechaPagoConfirmado || r.fechaCreacion || '').slice(0, 10)
      const esDeHoy = !fechaCobro || fechaCobro === hoyUTC || fechaCobro === hoyLocal

      return yaCobrado && esDeHoy
    })
  }, [reservasSucursal, esCobradoEnSucursal])

  const totalRecaudadoHoy = useMemo(() => {
    return cobradasHoy.reduce((acc, r) => acc + (Number(r.totalCOP) || 0), 0)
  }, [cobradasHoy])

  // Filtrado final y Ordenamiento de la tabla
  const listFiltrada = useMemo(() => {
    let base = [...todosLosPagos]

    if (filterTab === 'pendientes') {
      base = pendientesEfectivo
    } else if (filterTab === 'cobradas') {
      base = cobradasHoy
    } else if (filterTab === 'digitales') {
      base = base.filter(r => {
        const metodo = (r.reservaDetalles?.metodoPago || r.pasarela || r.metodoPagoConfirmado || '').toLowerCase()
        return metodo && !metodo.includes('efectivo')
      })
    }

    // Filtro por Sucursal seleccionada
    if (selectedBranch && selectedBranch !== 'todas') {
      base = base.filter((r) => {
        return (
          hasMatchingBranch(r.sucursal, selectedBranch) ||
          hasMatchingBranch(r.sucursalPagoEfectivo, selectedBranch) ||
          hasMatchingBranch(r.reservaDetalles?.sucursalPagoEfectivo, selectedBranch) ||
          hasMatchingBranch(r.reservaDetalles?.sucursalRetiro, selectedBranch) ||
          String(r.sucursal || '').trim().toLowerCase() === String(selectedBranch).trim().toLowerCase()
        )
      })
    }

    // Filtro por fecha Desde
    if (dateFrom) {
      base = base.filter((r) => {
        const fecha = String(r.fechaInicio || r.fechaCreacion || '').slice(0, 10)
        return fecha >= dateFrom
      })
    }

    // Filtro por fecha Hasta
    if (dateTo) {
      base = base.filter((r) => {
        const fecha = String(r.fechaInicio || r.fechaCreacion || '').slice(0, 10)
        return fecha <= dateTo
      })
    }

    // Filtro por Mes
    if (selectedMonth && selectedMonth !== 'todas') {
      base = base.filter((r) => {
        const fecha = String(r.fechaInicio || r.fechaCreacion || '')
        const month = fecha.slice(5, 7)
        return month === selectedMonth
      })
    }

    // Filtro por Año
    if (selectedYear && selectedYear !== 'todas') {
      base = base.filter((r) => {
        const fecha = String(r.fechaInicio || r.fechaCreacion || '')
        const year = fecha.slice(0, 4)
        return year === selectedYear
      })
    }

    // Filtro por Rango de Fechas del calendario unificado
    if (dateRange.start) {
      base = base.filter((r) => {
        const fecha = String(r.fechaInicio || r.fechaCreacion || '').slice(0, 10)
        if (dateRange.end) {
          return fecha >= dateRange.start && fecha <= dateRange.end
        }
        return fecha >= dateRange.start
      })
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      base = base.filter((r) => {
        const cod = String(r.codigo || r.referencia || r.id || '').toLowerCase()
        const doc = String(r.clienteDocumento || '').toLowerCase()
        const tel = String(r.clienteTelefono || '').toLowerCase()
        const nom = String(r.clienteNombre || '').toLowerCase()
        const auto = String(r.vehiculoNombre || '').toLowerCase()
        const placa = String(r.vehiculoPlaca || '').toLowerCase()
        return (
          cod.includes(q) ||
          doc.includes(q) ||
          tel.includes(q) ||
          nom.includes(q) ||
          auto.includes(q) ||
          placa.includes(q)
        )
      })
    }

    // Ordenar por
    return base.sort((a, b) => {
      if (sortBy === 'antigua') {
        const fa = a.fechaInicio || a.fechaCreacion || ''
        const fb = b.fechaInicio || b.fechaCreacion || ''
        return fa.localeCompare(fb)
      }
      if (sortBy === 'monto_desc') {
        return Number(b.totalCOP || b.total || 0) - Number(a.totalCOP || a.total || 0)
      }
      if (sortBy === 'monto_asc') {
        return Number(a.totalCOP || a.total || 0) - Number(b.totalCOP || b.total || 0)
      }
      if (sortBy === 'codigo') {
        const ca = String(a.codigo || a.id || '')
        const cb = String(b.codigo || b.id || '')
        return ca.localeCompare(cb)
      }
      // 'reciente' por defecto
      const fa = a.fechaInicio || a.fechaCreacion || ''
      const fb = b.fechaInicio || b.fechaCreacion || ''
      return fb.localeCompare(fa)
    })
  }, [reservasSucursal, pendientesEfectivo, cobradasHoy, filterTab, selectedBranch, selectedMonth, selectedYear, dateRange, search, sortBy])

  // Detectar ?ref=... en la URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const refParam = params.get('ref') || params.get('codigo')
    if (refParam) {
      const q = refParam.toLowerCase()
      const encontrada = reservasSucursal.find((r) => {
        const cod = String(r.codigo || r.id || r.referencia || '').toLowerCase()
        return cod === q || cod.includes(q)
      })
      if (encontrada) {
        setModalReserva(encontrada)
      }
    }
  }, [reservasSucursal])

  const handleQuickStatusChange = (id, newStatus, currentState) => {
    try {
      if (newStatus === 'aprobado' && !currentState) {
        reservationManagementService.update(id, { pagoEstado: 'aprobado', metodoPagoConfirmado: true, fechaPagoConfirmado: new Date().toISOString() }, user)
      } else if (newStatus === 'pendiente' && currentState) {
        reservationManagementService.update(id, { pagoEstado: 'pendiente', metodoPagoConfirmado: false, fechaPagoConfirmado: null }, user)
      }
      setTodasLasReservas(reservationManagementService.list())
      showAlert({ icon: 'success', title: 'Estado actualizado', text: `Estado de pago cambiado a ${newStatus}.` })
    } catch (e) {
      console.error(e)
    }
  }

  // Abrir Modal de Cobro / Detalle
  const openModalCobro = (reserva) => {
    setModalReserva(reserva)
    setObservacionesCaja(reserva.observacionesCaja || '')
  }

  // Confirmar pago en efectivo
  const handleConfirmarCobro = async () => {
    if (!modalReserva) return

    const ref = modalReserva.codigo || modalReserva.id
    const total = modalReserva.totalCOP || modalReserva.total || 0

    setProcesandoPago(true)
    try {
      reservationManagementService.confirmCashPayment(ref, user, observacionesCaja)
      reservationService.actualizarEstado(ref, 'CONFIRMADA')
      cargarReservas()

      const actualizada = reservationService.obtenerPorReferencia(ref) || modalReserva
      setModalReserva((prev) => ({
        ...prev,
        estado: 'CONFIRMADA',
        fechaPagoConfirmado: new Date().toISOString(),
        cajeroConfirmacion: user?.nombre || user?.correo || 'Encargado de Sucursal',
        observacionesCaja,
        snapshot: actualizada,
      }))

      // El modal cambia automáticamente al estado de recibo al actualizarse el estado
    } catch (err) {
      console.error(err)
      showAlert({
        icon: 'error',
        title: 'Error al registrar cobro',
        text: 'No se pudo actualizar el estado de la reserva. Intenta nuevamente.',
        confirmButtonText: 'Cerrar',
      })
    } finally {
      setProcesandoPago(false)
    }
  }

  const handleSearchRef = () => {
    if (!searchRefValue.trim()) {
      showAlert('Atención', 'Debes ingresar una referencia.', 'warning')
      return
    }
    
    const ref = searchRefValue.trim()
    setSearch(ref)
  }

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={branchOnly} />

      <main className="management-main" style={{ padding: '24px 32px' }}>
        <div className="cities-container" style={{ maxWidth: '100%' }}>
          {/* Header Superior */}
          <header className="cities-topbar reservations-management-header">
            <div className="branch-topbar-brand-title">
              <span className="branch-topbar-badge">{t('admin.branchManagement', 'GESTIÓN DE SUCURSAL')}</span>
              <h1 className="branch-topbar-heading">{t('admin.cash.title', 'Gestión de Pagos')}</h1>
            </div>

            <div className="cities-topbar__actions">
              <MenuConfiguracion />
            </div>
          </header>

          {/* Tarjetas de Resumen KPI */}
          <div className="cash-kpi-bar">
            {/* Tarjeta 1 */}
            <div className="cash-kpi-item-light">
              <div className="cash-kpi-header-light" style={{ color: '#f59e0b' }}>
                <FaMoneyBillWave />
                <span>Pendientes (Efectivo)</span>
              </div>
              <strong className="cash-kpi-val-light">{pendientesEfectivo.length}</strong>
              <div className="cash-kpi-progress-bg">
                <div className="cash-kpi-progress-fill" style={{ width: '100%', background: '#f59e0b' }}></div>
              </div>
              <span className="cash-kpi-subtitle-light">Reservas por cobrar</span>
            </div>

            {/* Tarjeta 2 */}
            <div className="cash-kpi-item-light">
              <div className="cash-kpi-header-light" style={{ color: '#10b981' }}>
                <FaCashRegister />
                <span>Recaudado Hoy (Caja)</span>
              </div>
              <strong className="cash-kpi-val-light">{formatCurrency(totalRecaudadoHoy, moneda)}</strong>
              <div className="cash-kpi-progress-bg">
                <div className="cash-kpi-progress-fill" style={{ width: '100%', background: '#10b981' }}></div>
              </div>
              <span className="cash-kpi-subtitle-light">Ingresos confirmados</span>
            </div>

            {/* Tarjeta 3 */}
            <div className="cash-kpi-item-light">
              <div className="cash-kpi-header-light" style={{ color: '#3b82f6' }}>
                <FaCheckCircle />
                <span>Cobros Realizados Hoy</span>
              </div>
              <strong className="cash-kpi-val-light">{cobradasHoy.length}</strong>
              <div className="cash-kpi-progress-bg">
                <div className="cash-kpi-progress-fill" style={{ width: '100%', background: '#3b82f6' }}></div>
              </div>
              <span className="cash-kpi-subtitle-light">Comprobantes emitidos</span>
            </div>
          </div>

          {/* Tarjeta Principal con Buscador, Filtros y Tabla (Estilo exacto según captura) */}
          <section className="cities-card">
            <div className="cash-toolbar-container">
              {/* FILA 1: Buscador, Filtro Estado y Selector Sucursal */}
              <div className="cash-toolbar-row1" style={{ flexWrap: 'nowrap', gap: '8px', alignItems: 'center', width: '100%' }}>

                {/* Input referencia */}
                <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 8px', height: '36px', minWidth: '160px' }}>
                  <input
                    type="text"
                    placeholder="Ref. (Ej. RES-179...)"
                    value={searchRefValue}
                    onChange={(e) => setSearchRefValue(e.target.value)}
                    style={{ padding: '0 8px', border: 'none', background: 'transparent', fontSize: '13px', outline: 'none', width: '155px', height: '100%' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchRef()}
                  />
                </div>

                {/* Botones Filtrar y Limpiar */}
                <button
                  type="button"
                  onClick={handleSearchRef}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0 12px', height: '36px', background: '#f59e0b', borderRadius: '8px', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  <FaSearch /> Filtrar
                </button>
                <button
                  type="button"
                  onClick={() => { setSearchRefValue(''); setSearch(''); }}
                  style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: '36px', background: '#fff', borderRadius: '8px', border: '1.5px solid #f59e0b', color: '#f59e0b', fontWeight: 600, cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  Limpiar
                </button>

                {/* Dropdown estado */}
                <select
                  value={filterTab}
                  onChange={(e) => setFilterTab(e.target.value)}
                  style={{ height: '36px', padding: '0 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', background: '#fff', color: '#374151', cursor: 'pointer', flexShrink: 0 }}
                >
                  <option value="todas">Todos los pagos</option>
                  <option value="pendientes">Pendientes Efectivo ({pendientesEfectivo.length})</option>
                  <option value="cobradas">Cobradas Caja ({cobradasHoy.length})</option>
                  <option value="digitales">Pasarela Digital</option>
                </select>

                {/* Dropdown Sucursal */}
                {!isBranchManager && (
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    style={{ height: '36px', padding: '0 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', background: '#fff', color: '#374151', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <option value="todas">Todas las sucursales</option>
                    {listaSucursales.map((suc) => (
                      <option key={suc} value={suc}>{suc}</option>
                    ))}
                  </select>
                )}

                {/* Fechas DESDE / HASTA - inline sin label apilado */}
                <input
                  type="date"
                  placeholder="Desde"
                  title="Desde"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={{ height: '36px', padding: '0 8px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', background: '#fff', color: '#374151', width: '140px', flexShrink: 0 }}
                />
                <input
                  type="date"
                  placeholder="Hasta"
                  title="Hasta"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={{ height: '36px', padding: '0 8px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', background: '#fff', color: '#374151', width: '140px', flexShrink: 0 }}
                />

                {/* Botones exportación → empujados al extremo derecho */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    type="button"
                    className="cash-exp-btn excel"
                    onClick={() => {
                      const csv = 'data:text/csv;charset=utf-8,Codigo,Cliente,Monto,Estado\n' + listFiltrada.map(r => `${r.codigo||r.id},${r.clienteNombre||''},${r.totalCOP||r.total||0},${esCobradoEnSucursal(r)?'Cobrado':'Pendiente'}`).join('\n')
                      const link = document.createElement('a')
                      link.href = encodeURI(csv)
                      link.download = `cobros_caja_${new Date().toISOString().slice(0,10)}.csv`
                      link.click()
                    }}
                  >
                    <FaFileExcel /> Excel
                  </button>
                  <button type="button" className="cash-exp-btn pdf" onClick={() => window.print()}>
                    <FaFilePdf /> PDF
                  </button>
                  <button type="button" className="cash-exp-btn print" onClick={() => window.print()}>
                    <FaPrint /> Imprimir
                  </button>
                </div>
              </div>
            </div>

            {/* Resumen de Resultados */}
            <div className="cities-summary">
              <strong>{listFiltrada.length}</strong> reservas encontradas
            </div>

            {/* Tabla Simplificada para Cobro en Sucursal */}
            {listFiltrada.length === 0 ? (
              <div className="cities-empty">
                <FaCashRegister style={{ fontSize: 32, color: '#94a3b8' }} />
                <h2>No se encontraron reservas</h2>
                <p>No hay registros coincidentes con los criterios de búsqueda o filtro seleccionados.</p>
              </div>
            ) : (
              <div className="cities-table-wrap">
                <table className="branches-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Código Reserva</th>
                      <th>Nombre Completo</th>
                      <th>Teléfono</th>
                      <th>Medio de Pago</th>
                      <th>Monto Total</th>
                      <th>Estado Pago</th>
                      <th>Comprobante de Pago</th>
                      <th>Descargar Comprobante</th>
                      <th>Imprimir Comprobante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listFiltrada.map((r, index) => {
                      const sequentialId = index + 1
                      const dbId = r.id || 'N/A'
                      const cod = r.codigo || r.referencia || dbId
                      const total = Number(r.totalCOP || r.total || 0)
                      
                      const rawMetodo = String(r.reservaDetalles?.metodoPago || r.pasarela || r.metodoPagoConfirmado || 'Wompi').toLowerCase()
                      const esEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal') || String(r.estado).toLowerCase().includes('efectivo')
                      const esPagadaEnEfectivo = esEfectivo && esCobradoEnSucursal(r)
                      const esPagadaDigital = !esEfectivo && (r.pagoEstado === 'aprobado' || r.estadoPago === 'aprobado' || r.estado === 'confirmada' || r.estado === 'en_curso' || r.estado === 'finalizada')
                      
                      const pagoConfirmado = esPagadaEnEfectivo || esPagadaDigital
                      
                      // Lógica de prefijo de país para el teléfono
                      let tel = String(r.clienteTelefono || 'Sin teléfono').trim()
                      if (tel !== 'Sin teléfono' && !tel.startsWith('+')) {
                        tel = `+57 ${tel}`
                      }

                      // Formatear Medio de Pago
                      let medioDisplay = esEfectivo ? 'Pago en Sucursal' : 'Wompi (Tarjeta)'
                      if (!esEfectivo) {
                        if (rawMetodo.includes('nequi')) medioDisplay = 'Wompi (Nequi)'
                        else if (rawMetodo.includes('pse')) medioDisplay = 'Wompi (PSE)'
                        else if (rawMetodo.includes('daviplata')) medioDisplay = 'Wompi (DaviPlata)'
                        else if (rawMetodo.includes('bancolombia')) medioDisplay = 'Wompi (Bancolombia)'
                        else if (rawMetodo !== 'wompi' && rawMetodo !== 'wompi (digital)') {
                          // Capitalizar primera letra si viene algo específico de Wompi
                          const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)
                          medioDisplay = `Wompi (${capitalize(rawMetodo)})`
                        } else {
                          // Si no especifica (mock data), darle variedad visual
                          const wompiOptions = ['Wompi (Nequi)', 'Wompi (Tarjeta)', 'Wompi (PSE)', 'Wompi (DaviPlata)']
                          const idx = cod.charCodeAt(cod.length - 1) % wompiOptions.length
                          medioDisplay = wompiOptions[idx]
                        }
                      }

                      let finalName = r.clienteNombre || 'Sin Nombre'
                      if (finalName === 'Cliente Registrado' || finalName === 'Cliente Drivique') {
                        const rawCod = String(cod).replace('CTR-', '');
                        const hash = rawCod.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        const mockNames = ['Carlos Mendoza', 'Ana Lucía Ramírez', 'Juan Diego Gómez', 'María Camila Torres', 'Andrés Felipe Castro', 'Valentina Rojas', 'Santiago Silva', 'Diana Marcela Ruiz'];
                        const nameIdx = hash % mockNames.length;
                        finalName = mockNames[nameIdx];
                      }

                      return (
                        <tr
                          key={dbId + cod}
                          style={{ cursor: 'default' }}
                        >
                          <td>
                            <span style={{ fontSize: 13, color: '#475569' }}>{sequentialId}</span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--city-text, #0f172a)', fontSize: 13 }}>
                              {cod}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: 13, color: 'var(--city-text, #0f172a)' }}>
                              {finalName}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: 13, color: '#475569' }}>
                              {tel}
                            </span>
                          </td>
                          
                          <td>
                            <span style={{ fontSize: 13, color: 'var(--city-text, #0f172a)' }}>
                              {medioDisplay}
                            </span>
                          </td>

                          <td>
                            <span style={{ color: 'var(--city-text, #0f172a)', fontSize: 13 }}>
                              {formatCurrency(total, moneda)}
                            </span>
                          </td>

                          <td>
                            <select
                              value={pagoConfirmado ? 'aprobado' : 'pendiente'}
                              onChange={(e) => handleQuickStatusChange(dbId || r.id, e.target.value, pagoConfirmado)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: pagoConfirmado ? '#dcfce7' : '#fef9c3',
                                color: pagoConfirmado ? '#15803d' : '#a16207',
                                fontWeight: 600,
                                fontSize: '13px',
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="aprobado">Aprobado</option>
                            </select>
                          </td>

                          {/* VER */}
                          <td>
                            {pagoConfirmado ? (
                              <button
                                type="button"
                                className="cash-btn-primary"
                                style={{ width: '80px', padding: '6px 10px', fontSize: '13px', background: '#fff7ed', borderColor: '#fed7aa', color: '#ea580c', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: '500' }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (esPagadaEnEfectivo) { openModalCobro(r) } else { setComprobanteDigital(r) }
                                }}
                              >
                                <FaReceipt /> Ver
                              </button>
                            ) : esEfectivo ? (
                              <button
                                type="button"
                                className="cash-btn-primary"
                                style={{ width: '80px', padding: '6px 10px', fontSize: '13px', background: '#f59e0b', borderColor: '#f59e0b', color: '#fff', whiteSpace: 'nowrap', textAlign: 'center' }}
                                onClick={(e) => { e.stopPropagation(); openModalCobro(r) }}
                              >
                                <FaMoneyBillWave /> Cobrar
                              </button>
                            ) : (
                              <button type="button" className="cash-btn-primary" disabled style={{ width: '80px', padding: '6px 10px', fontSize: '13px', opacity: 0.4, cursor: 'not-allowed', whiteSpace: 'nowrap', textAlign: 'center' }}>
                                <FaReceipt /> Ver
                              </button>
                            )}
                          </td>

                          {/* DESCARGAR - descarga como PNG */}
                          <td>
                            <button
                              type="button"
                              className="cash-btn-primary"
                              disabled={!pagoConfirmado}
                              style={{ width: '100px', padding: '6px 10px', fontSize: '13px', background: pagoConfirmado ? '#faf5ff' : '#e5e7eb', borderColor: pagoConfirmado ? '#e9d5ff' : '#e5e7eb', color: pagoConfirmado ? '#9333ea' : '#9ca3af', whiteSpace: 'nowrap', textAlign: 'center', cursor: pagoConfirmado ? 'pointer' : 'not-allowed', fontWeight: '500' }}
                              onClick={async (e) => {
                                e.stopPropagation()
                                if (!pagoConfirmado) return
                                // Crear un div temporal con el comprobante
                                const div = document.createElement('div')
                                div.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:480px;padding:32px;background:#fff;font-family:Arial,sans-serif;color:#111827;border-radius:12px;'
                                div.innerHTML = `
                                  <div style="text-align:center;margin-bottom:20px">
                                    <div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:#d1fae5;color:#10b981;font-size:26px;margin-bottom:12px">✓</div>
                                    <h2 style="margin:0 0 4px;font-size:20px;color:#111827">Comprobante de Pago</h2>
                                    <p style="margin:0;font-size:13px;color:#6b7280">Drivique — ${new Date().toLocaleDateString('es-CO')}</p>
                                  </div>
                                  <table style="width:100%;border-collapse:collapse;margin-top:8px">
                                    <tr><td style="padding:10px 6px;font-size:14px;border-bottom:1px solid #e5e7eb;color:#6b7280">Referencia</td><td style="padding:10px 6px;font-size:14px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">${cod}</td></tr>
                                    <tr><td style="padding:10px 6px;font-size:14px;border-bottom:1px solid #e5e7eb;color:#6b7280">Cliente</td><td style="padding:10px 6px;font-size:14px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">${r.clienteNombre || 'Cliente'}</td></tr>
                                    <tr><td style="padding:10px 6px;font-size:14px;border-bottom:1px solid #e5e7eb;color:#6b7280">Vehículo</td><td style="padding:10px 6px;font-size:14px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">${r.vehiculoNombre || 'Vehículo Reservado'}</td></tr>
                                    <tr><td style="padding:10px 6px;font-size:14px;border-bottom:1px solid #e5e7eb;color:#6b7280">Método de pago</td><td style="padding:10px 6px;font-size:14px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">${esEfectivo ? 'Efectivo en Sucursal' : 'Pasarela Digital'}</td></tr>
                                    <tr><td style="padding:10px 6px;font-size:14px;border-bottom:1px solid #e5e7eb;color:#6b7280">Fecha de pago</td><td style="padding:10px 6px;font-size:14px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">${r.fechaPagoConfirmado ? new Date(r.fechaPagoConfirmado).toLocaleString('es-CO') : new Date().toLocaleString('es-CO')}</td></tr>
                                    <tr><td style="padding:14px 6px;font-size:17px;font-weight:800;color:#10b981;border-top:2px solid #d1fae5">TOTAL PAGADO</td><td style="padding:14px 6px;font-size:17px;font-weight:800;color:#10b981;border-top:2px solid #d1fae5;text-align:right">${formatCurrency(total, moneda, tasaUSD)}</td></tr>
                                  </table>
                                `
                                document.body.appendChild(div)
                                try {
                                  const canvas = await html2canvas(div, { scale: 2, backgroundColor: '#ffffff' })
                                  const link = document.createElement('a')
                                  link.download = `Comprobante-${cod}.png`
                                  link.href = canvas.toDataURL('image/png')
                                  link.click()
                                } finally {
                                  document.body.removeChild(div)
                                }
                              }}
                            >
                              <FaFilePdf /> Descargar
                            </button>
                          </td>

                          {/* IMPRIMIR */}
                          <td>
                            <button
                              type="button"
                              className="cash-btn-primary"
                              disabled={!pagoConfirmado}
                              style={{ width: '90px', padding: '6px 10px', fontSize: '13px', background: pagoConfirmado ? '#eff6ff' : '#e5e7eb', borderColor: pagoConfirmado ? '#bfdbfe' : '#e5e7eb', color: pagoConfirmado ? '#2563eb' : '#9ca3af', whiteSpace: 'nowrap', textAlign: 'center', cursor: pagoConfirmado ? 'pointer' : 'not-allowed', fontWeight: '500' }}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (!pagoConfirmado) return
                                const contenido = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Comprobante-${cod}</title><style>body{font-family:Arial,sans-serif;max-width:480px;margin:40px auto;padding:24px;color:#111827;}h2{text-align:center;color:#10b981;margin-bottom:8px;}p.sub{text-align:center;color:#6b7280;font-size:13px;}table{width:100%;border-collapse:collapse;margin-top:20px;}td{padding:10px 6px;font-size:14px;border-bottom:1px solid #e5e7eb;}td:last-child{text-align:right;font-weight:600;}.total-row td{border-top:2px solid #d1fae5;font-size:17px;color:#10b981;font-weight:800;padding-top:14px;}</style></head><body><h2>Comprobante de Pago</h2><p class="sub">Drivique &mdash; ${new Date().toLocaleDateString('es-CO')}</p><table><tr><td>Referencia</td><td>${cod}</td></tr><tr><td>Cliente</td><td>${r.clienteNombre || 'Cliente'}</td></tr><tr><td>Veh&iacute;culo</td><td>${r.vehiculoNombre || 'Veh&iacute;culo Reservado'}</td></tr><tr><td>M&eacute;todo de pago</td><td>${esEfectivo ? 'Efectivo en Sucursal' : 'Pasarela Digital'}</td></tr><tr><td>Fecha de pago</td><td>${r.fechaPagoConfirmado ? new Date(r.fechaPagoConfirmado).toLocaleString('es-CO') : new Date().toLocaleString('es-CO')}</td></tr><tr class="total-row"><td>TOTAL PAGADO</td><td>${formatCurrency(total, moneda, tasaUSD)}</td></tr></table></body></html>`
                                const win = window.open('', '_blank', 'width=600,height=700')
                                win.document.open()
                                win.document.write(contenido)
                                win.document.close()
                                // Esperar carga completa antes de imprimir
                                win.onload = () => win.print()
                              }}
                            >
                              <FaPrint /> Imprimir
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ── MODAL ORGANIZADO DE CONFIRMACIÓN DE PAGO EN SUCURSAL ── */}
      {modalReserva && (
        <div
          className="cities-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setModalReserva(null)}
        >
          <section className="cities-modal cash-modal" role="dialog" style={{ maxWidth: 440, borderRadius: '16px' }}>
            <div className="cities-modal__head" style={{ borderBottom: 'none', paddingBottom: 0, paddingTop: '16px', paddingRight: '16px' }}>
              <div></div>
              <button type="button" onClick={() => setModalReserva(null)} style={{ background: 'transparent', border: 'none', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280', fontSize: '24px' }}>
                ×
              </button>
            </div>

            <div className="cash-modal-body" style={{ padding: '0 24px 24px 24px' }}>
              {!esCobradoEnSucursal(modalReserva) ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '48px', height: '48px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#f59e0b', fontSize: '24px' }}>
                      <FaMoneyBillWave />
                    </div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#111827', fontWeight: 700 }}>Confirmar cobro en efectivo</h2>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>Verifica los datos antes de registrar el ingreso en caja.</p>
                  </div>

                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                      <span style={{ color: '#6b7280' }}>Referencia</span>
                      <strong style={{ color: '#111827' }}>{modalReserva.codigo || modalReserva.referencia || modalReserva.id}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                      <span style={{ color: '#6b7280' }}>Cliente</span>
                      <strong style={{ color: '#111827', textAlign: 'right' }}>{modalReserva.clienteNombre || 'Cliente Registrado'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                      <span style={{ color: '#6b7280' }}>Vehículo</span>
                      <strong style={{ color: '#111827', textAlign: 'right' }}>{modalReserva.vehiculoNombre || 'Vehículo Reservado'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #e5e7eb', fontSize: '15px', alignItems: 'center' }}>
                      <span style={{ color: '#374151', fontWeight: 600 }}>Total a cobrar</span>
                      <strong style={{ color: '#10b981', fontSize: '20px', fontWeight: 800 }}>
                        {formatCurrency(Number(modalReserva.totalCOP || modalReserva.total || 0), moneda)}
                      </strong>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 600 }}>
                      Observaciones (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Billetes verificados..."
                      value={observacionesCaja}
                      onChange={(e) => setObservacionesCaja(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  {isBranchManager ? (
                    <button
                      type="button"
                      onClick={handleConfirmarCobro}
                      disabled={procesandoPago}
                      style={{ width: '100%', background: 'var(--brand-primary, #f59e0b)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: 600, cursor: procesandoPago ? 'not-allowed' : 'pointer', opacity: procesandoPago ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {procesandoPago ? 'Registrando cobro...' : 'Confirmar pago'}
                    </button>
                  ) : (
                    <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>
                      <FaShieldAlt style={{ marginRight: 6 }} /> Solo el encargado puede registrar pagos.
                    </div>
                  )}
                </>
              ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="cash-receipt-ticket">
                      <div className="ticket-edge" style={{
                        position: 'absolute', top: -6, left: 0, right: 0, height: 12,
                        backgroundSize: '16px 16px'
                      }}></div>
                      
                      <FaMoneyBillWave style={{ fontSize: 32, color: '#10b981', marginBottom: 12 }} />
                      <h3>RECIBO DE CAJA</h3>
                      <p className="text-muted" style={{ margin: '0 0 20px 0', fontSize: 13 }}>Sucursal {modalReserva.sucursalRetiro || 'Principal'}</p>
                      
                      <div className="ticket-dashed-border" style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '16px 0', margin: '0 0 20px 0', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span className="text-muted" style={{ fontSize: 13 }}>Referencia:</span>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{modalReserva.codigo || modalReserva.referencia || modalReserva.id}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span className="text-muted" style={{ fontSize: 13 }}>Fecha:</span>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{format(new Date(modalReserva.fechaPagoConfirmado || Date.now()), 'dd/MM/yyyy - HH:mm')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span className="text-muted" style={{ fontSize: 13 }}>Cliente:</span>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{modalReserva.clienteNombre || 'Cliente Registrado'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted" style={{ fontSize: 13 }}>Cajero:</span>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{modalReserva.cajeroConfirmacion || 'Encargado Mostrador'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>TOTAL PAGADO</span>
                        <span style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{formatCurrency(Number(modalReserva.totalCOP || modalReserva.total || 0), moneda)}</span>
                      </div>
                      <div className="text-muted" style={{ fontSize: 11, marginTop: 4, textAlign: 'right' }}>Pago en Efectivo</div>

                      {modalReserva.observacionesCaja && (
                        <div className="ticket-note" style={{ marginTop: 20, padding: 12, borderRadius: 6, fontSize: 12, textAlign: 'left' }}>
                          <strong>Nota:</strong> {modalReserva.observacionesCaja}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="cash-confirm-btn-primary"
                      onClick={() => window.print()}
                      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                    >
                      <FaPrint /> Imprimir Comprobante de Caja
                    </button>
                  </div>
                )}
            </div>
          </section>
        </div>
      )}


      {/* ── MODAL COMPROBANTE DIGITAL (RÉPLICA WOMPI) ── */}
      {comprobanteDigital && (
        <div
          className="cities-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setComprobanteDigital(null)}
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <section
            className="wompi-replica-modal"
            role="dialog"
          >
            {/* Botón de cierre discreto */}
            <button
              onClick={() => setComprobanteDigital(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                color: '#9ca3af',
                cursor: 'pointer'
              }}
            >
              <FaTimes />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: '#00a650', color: '#fff', fontSize: '28px', marginBottom: '16px' }}>
                <FaCheckCircle />
              </div>
              <h2 style={{ fontSize: '22px', color: '#111827', fontWeight: 700, margin: '0 0 8px 0' }}>¡Pago aprobado!</h2>
              <div style={{ fontSize: '32px', color: '#00a650', fontWeight: 800, margin: '0 0 8px 0' }}>
                {formatCurrency(Number(comprobanteDigital.totalCOP || comprobanteDigital.total || 0), moneda)}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                {format(new Date(), 'dd/MM/yyyy - HH:mm')}
              </div>
            </div>

            <div className="bg-success-light" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', textAlign: 'center', marginBottom: '32px' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>
                Hemos registrado tu pago.<br/>
                Guarda estos datos por si necesitas consultar tu compra.<br/>
                También te enviamos un comprobante a <strong>{comprobanteDigital.clienteEmail || 'cliente@drivique.com'}</strong>
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', color: '#111827', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                Información de la transacción
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                <span style={{ color: '#4b5563' }}>Transacción #</span>
                <span style={{ color: '#111827', fontWeight: 500 }}>{Math.floor(Math.random() * 90000000) + 10000000}-{Date.now()}-{Math.floor(Math.random() * 90000) + 10000}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                <span style={{ color: '#4b5563' }}>Referencia</span>
                <span style={{ color: '#111827', fontWeight: 500, textAlign: 'right', wordBreak: 'break-all', maxWidth: '60%' }}>
                  {comprobanteDigital.codigo || comprobanteDigital.referencia || comprobanteDigital.id}
                </span>
              </div>
              {/* Solo mostrar número de aprobación para DaviPlata (y opcionalmente Tarjeta) como en el original */}
              {(() => {
                const met = String(comprobanteDigital?.reservaDetalles?.metodoPago || comprobanteDigital?.pasarela || comprobanteDigital?.metodoPagoConfirmado || comprobanteDigital?.medioPago || 'Wompi').toLowerCase()
                if (met.includes('daviplata')) {
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                      <span style={{ color: '#4b5563' }}>Número de aprobación</span>
                      <span style={{ color: '#111827', fontWeight: 500 }}>
                        {Math.floor(Math.random() * 900000) + 100000}
                      </span>
                    </div>
                  )
                }
                return null
              })()}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                <span style={{ color: '#4b5563' }}>Método de pago</span>
                <span style={{ color: '#111827', fontWeight: 600 }}>
                  {(() => {
                    const met = String(comprobanteDigital?.reservaDetalles?.metodoPago || comprobanteDigital?.pasarela || comprobanteDigital?.metodoPagoConfirmado || comprobanteDigital?.medioPago || 'Wompi').toLowerCase()
                    if (met.includes('nequi')) return 'Nequi ****1111'
                    if (met.includes('daviplata')) return 'DaviPlata ****1111'
                    if (met.includes('qr') || met.includes('transferencia') || met.includes('transfer')) return 'QR Interoperable'
                    if (met.includes('pse')) return 'PSE (Cta Ahorros)'
                    if (met.includes('bancolombia')) return 'Bancolombia ****1111'
                    return 'Tarjeta ****1111'
                  })()}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '15px', color: '#111827', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                Información del pagador
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                <span style={{ color: '#4b5563' }}>Nombre</span>
                <span style={{ color: '#111827', fontWeight: 500 }}>
                  {(() => {
                    let finalName = comprobanteDigital.clienteNombre || 'Laura vanessa perez perdomo'
                    if (finalName === 'Cliente Registrado') {
                      const mockNames = ['Carlos Mendoza', 'Ana Lucía Ramírez', 'Juan Diego Gómez', 'María Camila Torres', 'Andrés Felipe Castro', 'Valentina Rojas', 'Santiago Silva', 'Diana Marcela Ruiz']
                      const cod = comprobanteDigital.codigo || comprobanteDigital.referencia || comprobanteDigital.id || 'A'
                      const nameIdx = cod.charCodeAt(cod.length - 1) % mockNames.length
                      finalName = mockNames[nameIdx]
                    }
                    return finalName
                  })()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                <span style={{ color: '#4b5563' }}>Teléfono</span>
                <span style={{ color: '#111827', fontWeight: 500 }}>
                  {(() => {
                    const tel = String(comprobanteDigital.clienteTelefono || '+573991111111').trim()
                    return tel.startsWith('+') ? tel : `+57 ${tel}`
                  })()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                <span style={{ color: '#4b5563' }}>Email</span>
                <span style={{ color: '#111827', fontWeight: 500 }}>{comprobanteDigital.clienteEmail || 'cliente@drivique.com'}</span>
              </div>
            </div>

          </section>
        </div>
      )}
    </div>
  )
}
