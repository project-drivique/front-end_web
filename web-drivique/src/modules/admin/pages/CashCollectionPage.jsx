import { useState, useMemo, useEffect, useCallback } from 'react'
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
import './ReservationManagementPage.css'
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
  const { tema, moneda } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const isBranchManager = branchOnly || user?.rol === 'encargado' || user?.rol === 'branch_manager' || user?.rol === 'encargado_sucursal'
  const sucursalAsignada = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || ''

  // Estados de datos y filtros
  const [todasLasReservas, setTodasLasReservas] = useState([])
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState('pendientes') // 'pendientes' | 'cobradas' | 'todas'
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedMonth, setSelectedMonth] = useState('todas') // 'todas' | '01'..'12'
  const [selectedYear, setSelectedYear] = useState('todas') // 'todas' | '2026'..
  const [selectedBranch, setSelectedBranch] = useState('todas') // 'todas' | nombre sucursal
  const [sortBy, setSortBy] = useState('reciente') // 'reciente' | 'antigua' | 'monto_desc' | 'monto_asc' | 'codigo'

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
  const pendientesEfectivo = useMemo(() => {
    return reservasSucursal.filter((r) => {
      const raw = reservationService.obtenerPorReferencia(r.codigo || r.id || r.referencia) || r
      const metodo = raw?.reservaDetalles?.metodoPago || r.pasarela || r.metodoPagoConfirmado
      const estadoNorm = String(r.estado || '').toLowerCase()
      const esEfectivo = metodo === 'efectivo' || estadoNorm.includes('efectivo')
      const yaCobrado = esCobradoEnSucursal(r)
      return esEfectivo && !yaCobrado
    })
  }, [reservasSucursal, esCobradoEnSucursal])

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
    let base = [...reservasSucursal]

    if (filterTab === 'pendientes') {
      base = pendientesEfectivo
    } else if (filterTab === 'cobradas') {
      base = cobradasHoy
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

    const confirm = await showAlert({
      icon: 'question',
      title: '¿Confirmar cobro en efectivo?',
      text: `¿Confirmas haber recibido ${formatCurrency(total, moneda)} en efectivo para la reserva ${ref}?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar cobro',
      cancelButtonText: 'Cancelar',
    })

    if (!confirm.isConfirmed) return

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

      showAlert({
        icon: 'success',
        title: '¡Pago Registrado con Éxito!',
        text: `Se confirmó el cobro en efectivo de la reserva ${ref}. La reserva ahora está CONFIRMADA.`,
        confirmButtonText: 'Entendido',
      })
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

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={branchOnly} />

      <main className="management-main" style={{ padding: '24px 32px' }}>
        <div className="cities-container" style={{ maxWidth: '100%' }}>
          {/* Header Superior */}
          <header className="cities-topbar">
            <div>
              <p className="cities-eyebrow">
                {isBranchManager
                  ? `Módulo de Caja y Finanzas · Sede ${sucursalAsignada || 'Asignada'}`
                  : 'Administración Central · Módulo de Pagos y Caja'}
              </p>
              <h1>Gestión de Pagos</h1>
              <p className="cities-subtitle">
                Consulta integral de estados de pago, comprobantes digitales (Wompi, transferencias) y confirmación de cobros presenciales en caja.
              </p>
            </div>

            <div className="cities-topbar__actions">
              <MenuConfiguracion />
            </div>
          </header>

          {/* Tarjetas de Resumen KPI */}
          <div className="cash-kpi-bar">
            <div className="cash-kpi-item">
              <span className="cash-kpi-title">Pendientes por Cobrar (Efectivo)</span>
              <strong className="cash-kpi-val warning">{pendientesEfectivo.length} reservas</strong>
            </div>
            <div className="cash-kpi-item">
              <span className="cash-kpi-title">Recaudado Hoy en Caja</span>
              <strong className="cash-kpi-val success">{formatCurrency(totalRecaudadoHoy, moneda)}</strong>
            </div>
            <div className="cash-kpi-item">
              <span className="cash-kpi-title">Cobros Realizados Hoy</span>
              <strong className="cash-kpi-val info">{cobradasHoy.length} comprobantes</strong>
            </div>
          </div>

          {/* Tarjeta Principal con Buscador, Filtros y Tabla (Estilo exacto según captura) */}
          <section className="cities-card">
            <div className="cash-toolbar-container">
              {/* FILA 1: Buscador, Filtro Estado y Selector Sucursal */}
              <div className="cash-toolbar-row1">
                {/* Buscador general */}
                <div className="cash-search-box">
                  <FaSearch className="cash-search-icon" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por código, cliente, auto, placa..."
                  />
                </div>

                {/* Dropdown Todos los estados */}
                <div className="cash-select-box">
                  <select
                    value={filterTab}
                    onChange={(e) => setFilterTab(e.target.value)}
                    className="cash-state-select"
                  >
                    <option value="todas">Todos los estados</option>
                    <option value="pendientes">Pendientes ({pendientesEfectivo.length})</option>
                    <option value="cobradas">Cobradas hoy ({cobradasHoy.length})</option>
                  </select>
                </div>

                {/* Dropdown Sucursal (Destacado Azul con Icono Edificio) */}
                <div className="cash-branch-select-box">
                  <FaBuilding className="cash-branch-icon" />
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="cash-branch-select"
                  >
                    <option value="todas">Todas las sucursales</option>
                    {listaSucursales.map((suc) => (
                      <option key={suc} value={suc}>
                        {suc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* FILA 2: Fechas DESDE / HASTA y Botones de Exportación / Impresión */}
              <div className="cash-toolbar-row2">
                <div className="cash-date-fields-group">
                  <div className="cash-date-field">
                    <label className="cash-field-label">DESDE:</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="cash-date-input"
                    />
                  </div>

                  <div className="cash-date-field">
                    <label className="cash-field-label">HASTA:</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="cash-date-input"
                    />
                  </div>
                </div>

                {/* Botones Excel, PDF e Imprimir */}
                <div className="cash-export-buttons">
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

                  <button
                    type="button"
                    className="cash-exp-btn pdf"
                    onClick={() => window.print()}
                  >
                    <FaFilePdf /> PDF
                  </button>

                  <button
                    type="button"
                    className="cash-exp-btn print"
                    onClick={() => window.print()}
                  >
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
                      <th>N° Reserva</th>
                      <th>Cliente</th>
                      <th>Monto Total</th>
                      <th>Estado Pago</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listFiltrada.map((r) => {
                      const cod = r.codigo || r.referencia || r.id
                      const total = Number(r.totalCOP || r.total || 0)
                      const esPagada = esCobradoEnSucursal(r)

                      return (
                        <tr
                          key={r.id || cod}
                          onClick={() => openModalCobro(r)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>
                            <strong style={{ color: 'var(--brand-primary, #047857)', fontWeight: 800, fontSize: 14 }}>
                              {cod}
                            </strong>
                          </td>

                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <strong style={{ fontSize: 13, color: 'var(--city-text, #0f172a)' }}>
                                {r.clienteNombre || 'Cliente'}
                              </strong>
                              <small style={{ color: '#64748b', fontSize: 11 }}>
                                {r.clienteDocumento || r.clienteTelefono || 'Sin CC'}
                              </small>
                            </div>
                          </td>

                          <td>
                            <strong style={{ color: 'var(--city-text, #0f172a)', fontWeight: 800, fontSize: 14 }}>
                              {formatCurrency(total, moneda)}
                            </strong>
                          </td>

                          <td>
                            {esPagada ? (
                              <span className="reserva-status-badge finalizada">
                                <span className="reserva-status-dot" /> Cobrado
                              </span>
                            ) : (
                              <span className="reserva-status-badge pendiente">
                                <span className="reserva-status-dot" /> Pendiente Efectivo
                              </span>
                            )}
                          </td>

                          <td>
                            <button
                              type="button"
                              className={esPagada ? 'cities-secondary' : 'cash-btn-primary'}
                              onClick={(e) => {
                                e.stopPropagation()
                                openModalCobro(r)
                              }}
                            >
                              {esPagada ? (
                                <>
                                  <FaReceipt /> Ver Recibo
                                </>
                              ) : (
                                <>
                                  <FaMoneyBillWave /> Confirmar Pago en Sucursal
                                </>
                              )}
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
          <section className="cities-modal cash-modal" role="dialog" style={{ maxWidth: 660 }}>
            <div className="cities-modal__head">
              <div>
                <p className="cities-eyebrow">Cobro en Sucursal · Confirmación de Pago</p>
                <h2>{modalReserva.codigo || modalReserva.id}</h2>
              </div>
              <button type="button" onClick={() => setModalReserva(null)}>
                ×
              </button>
            </div>

            <div className="cash-modal-body">
              {/* Badge de Estado y Sucursal */}
              <div className="cash-modal-status-bar">
                <span className={`cash-status-badge ${esCobradoEnSucursal(modalReserva) ? 'confirmada' : 'pendiente'}`}>
                  {esCobradoEnSucursal(modalReserva)
                    ? '✓ Pago Confirmado en Efectivo'
                    : '⏳ Pendiente de Cobro en Ventanilla'}
                </span>

                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                  Sede: <strong>{modalReserva.sucursal || 'Principal'}</strong>
                </span>
              </div>

              {/* Resumen en 2 Columnas Organizadas */}
              <div className="reserva-detail-grid" style={{ marginBottom: 20 }}>
                <div className="reserva-detail-card-box">
                  <h4 style={{ color: 'var(--brand-primary, #047857)', marginBottom: 12 }}>
                    <FaUser /> Datos del Cliente
                  </h4>
                  <div className="reserva-detail-field">
                    <small>Nombre Completo</small>
                    <strong>{modalReserva.clienteNombre || 'Cliente'}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>Cédula / Documento</small>
                    <strong>{modalReserva.clienteDocumento || 'No especificado'}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>Teléfono de Contacto</small>
                    <strong>{modalReserva.clienteTelefono || 'No especificado'}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>Correo Electrónico</small>
                    <strong>{modalReserva.clienteCorreo || 'No especificado'}</strong>
                  </div>
                </div>

                <div className="reserva-detail-card-box">
                  <h4 style={{ color: 'var(--brand-primary, #047857)', marginBottom: 12 }}>
                    <FaCar /> Detalles del Alquiler
                  </h4>
                  <div className="reserva-detail-field">
                    <small>Vehículo Reservado</small>
                    <strong>{modalReserva.vehiculoNombre || 'Vehículo'}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>Placa</small>
                    <strong>{modalReserva.vehiculoPlaca || 'Asignar al entregar'}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>Fecha Recogida</small>
                    <strong>{modalReserva.fechaInicio || 'N/A'}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>Fecha Devolución</small>
                    <strong>{modalReserva.fechaFin || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              {/* Registro de Cobro y Liquidación */}
              <div className="cash-modal-pay-box">
                <div className="cash-modal-total-row">
                  <span>Monto Total a Cobrar en Efectivo:</span>
                  <strong className="cash-modal-total-amount">
                    {formatCurrency(Number(modalReserva.totalCOP || modalReserva.total || 0), moneda)}
                  </strong>
                </div>

                {!esCobradoEnSucursal(modalReserva) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                        Observaciones de Caja / N° Recibo (Opcional):
                      </label>
                      <input
                        type="text"
                        className="cash-obs-input"
                        placeholder="Ej: Billetes de $50.000 verificados / Recibo N° 0042..."
                        value={observacionesCaja}
                        onChange={(e) => setObservacionesCaja(e.target.value)}
                      />
                    </div>

                    {isBranchManager ? (
                      <button
                        type="button"
                        className="cash-confirm-btn-primary"
                        onClick={handleConfirmarCobro}
                        disabled={procesandoPago}
                      >
                        <FaMoneyBillWave />
                        {procesandoPago ? 'Registrando cobro...' : 'Confirmar Pago en Sucursal'}
                      </button>
                    ) : (
                      <div className="cash-audit-banner">
                        <FaShieldAlt /> Solo el encargado de sucursal en mostrador puede registrar pagos en efectivo.
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="cash-success-box">
                      <FaCheckCircle /> Cobro registrado en caja por <strong>{modalReserva.cajeroConfirmacion || 'Encargado'}</strong> el {new Date(modalReserva.fechaPagoConfirmado || Date.now()).toLocaleString()}.
                      {modalReserva.observacionesCaja && (
                        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.9 }}>
                          Nota: {modalReserva.observacionesCaja}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="cash-confirm-btn-primary"
                      onClick={() => window.print()}
                    >
                      <FaPrint /> Imprimir Comprobante de Caja
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
