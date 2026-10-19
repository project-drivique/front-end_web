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
import { FaMoneyBillWave, FaSearch, FaCheckCircle, FaCalendarAlt, FaPrint, FaShieldAlt, FaReceipt, FaCashRegister, FaChevronLeft, FaChevronRight, FaTimes, FaFileExcel, FaFilePdf, FaDownload } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { reservationManagementService } from '../../../services/reservationManagementService'
import { branchManagementService } from '../../../services/branchManagementService'
import { hasMatchingBranch } from '../../../services/accessAuditService'
import { formatCurrency } from '../../../utils/currencyUtils'
import { showAlert } from '../../../utils/swalConfig'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import './CityManagementPage.css'
import './CashCollectionPage.css'

// â”€â”€ COMPONENTE DE UN SOLO CALENDARIO REUTILIZABLE PARA SELECCIÓN DE RANGO DE FECHAS â”€â”€
function SingleCalendarRangePicker({ dateRange, onChange }) {
  const { t } = useTranslation()
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
    return t('admin.cash.filterByDate', 'Filtrar por Fecha')
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
          <span className="cash-cal-clear" onClick={handleClear} title={`${t('admin.cash.clearBtn', 'Limpiar')} ${t('admin.cash.dateRange', 'rango de fechas')}`}>
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
                ? t('admin.cash.selectStartDate', 'Selecciona la fecha inicial')
                : !endDate
                ? t('admin.cash.selectEndDate', 'Selecciona la fecha final')
                : t('admin.cash.rangeSelected', 'Rango seleccionado')}
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
  const cargarReservas = useCallback(async () => {
    try {
      setTodasLasReservas(await reservationManagementService.refresh())
    } catch (e) {
      console.error('No se pudieron cargar los cobros desde el servidor:', e)
    }
  }, [])

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
      const metodo = r.reservaDetalles?.metodoPago || r.pasarela || r.metodoPagoConfirmado
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

  // Configuración de exportación unificada (Excel, PDF, Imprimir)
  const exportHeaders = [
    'ID',
    t('hc2.codigo_reserva', 'CÓDIGO RESERVA'),
    'CLIENTE',
    t('hc2.telefono_57', 'TELÉFONO'),
    t('hc2.medio_de_pago', 'MEDIO DE PAGO'),
    t('hc2.monto_total', 'MONTO TOTAL'),
    t('hc2.estado_pago', 'ESTADO PAGO'),
  ]

  const exportRows = useMemo(() => {
    return listFiltrada.map((r, index) => {
      const rawMetodo = String(r.metodoPago || r.reservaDetalles?.metodoPago || r.pasarela || r.metodoPagoConfirmado || 'Wompi').toLowerCase()
      const esEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal') || String(r.estado).toLowerCase().includes('efectivo')
      const esPagadaEnEfectivo = esEfectivo && esCobradoEnSucursal(r)
      const esPagadaDigital = !esEfectivo && (r.pagoEstado === 'aprobado' || r.estadoPago === 'aprobado' || r.estado === 'confirmada' || r.estado === 'en_curso' || r.estado === 'finalizada')
      const pagoConfirmado = esPagadaEnEfectivo || esPagadaDigital

      let tel = String(r.clienteTelefono || t('hc2.sin_telefono', 'Sin teléfono')).trim()
      if (tel !== 'Sin teléfono' && !tel.startsWith('+')) {
        tel = `+57 ${tel}`
      }

      let medioDisplay = esEfectivo ? t('admin.cash.paymentMethodBranch', 'Pago en Sucursal') : 'Wompi (Tarjeta)'
      if (!esEfectivo) {
        if (rawMetodo.includes('nequi')) medioDisplay = 'Wompi (Nequi)'
        else if (rawMetodo.includes('pse')) medioDisplay = 'Wompi (PSE)'
        else if (rawMetodo.includes('daviplata')) medioDisplay = 'Wompi (DaviPlata)'
        else if (rawMetodo.includes('bancolombia')) medioDisplay = 'Wompi (Bancolombia)'
        else if (rawMetodo !== 'wompi' && rawMetodo !== 'wompi (digital)') {
          medioDisplay = `Wompi (${rawMetodo.charAt(0).toUpperCase() + rawMetodo.slice(1)})`
        }
      }

      return [
        index + 1,
        r.codigo || r.referencia || r.id || 'N/A',
        r.clienteNombre || t('hc2.sin_nombre', 'Sin Nombre'),
        tel,
        medioDisplay,
        formatCurrency(Number(r.totalCOP || r.total || 0), moneda || 'COP', tasaUSD),
        pagoConfirmado ? t('admin.cash.statusPaid', 'Cobrado / Aprobado') : t('admin.cash.statusPending', 'Pendiente de Cobro'),
      ]
    })
  }, [listFiltrada, esCobradoEnSucursal, t, moneda, tasaUSD])

  const exportData = useMemo(() => ({
    title: t('admin.cash.exportTitle', 'Control de Caja y Cobro en Mostrador — Drivique'),
    headers: exportHeaders,
    rows: exportRows,
    items: listFiltrada,
    filename: `cobros-caja-drivique-${new Date().toISOString().slice(0, 10)}`,
  }), [exportHeaders, exportRows, listFiltrada, t])

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

    setProcesandoPago(true)
    try {
      await reservationManagementService.confirmCashPayment(ref)
      await cargarReservas()

      setModalReserva((prev) => ({
        ...prev,
        estado: 'confirmada',
        fechaPagoConfirmado: new Date().toISOString(),
        cajeroConfirmacion: user?.nombre || user?.correo || t('hc2.encargado_de_sucursal', 'Encargado de Sucursal'),
        observacionesCaja,
      }))

      // El modal cambia automáticamente al estado de recibo al actualizarse el estado
    } catch (err) {
      console.error(err)
      showAlert({
        icon: 'error',
        title: t('hc.error_al_registrar_cobro', 'Error al registrar cobro'),
        text: err?.message || t('hc2.no_se_pudo_actualizar_el_estado_de_la_', 'No se pudo actualizar el estado de la reserva. Intenta nuevamente.'),
        confirmButtonText: t('hc4.cerrar', 'Cerrar'),
      })
    } finally {
      setProcesandoPago(false)
    }
  }

  const handleSearchRef = () => {
    if (!searchRefValue.trim()) {
      showAlert(t('hc.atencion', 'Atención'), t('hc2.debes_ingresar_una_referencia', 'Debes ingresar una referencia.'), 'warning')
      return
    }
    
    const ref = searchRefValue.trim()
    setSearch(ref)
  }

  const formatFecha = (val) => {
    if (!val) return format(new Date(), 'dd/MM/yyyy - HH:mm')
    try {
      const d = new Date(val)
      if (isNaN(d.getTime())) return format(new Date(), 'dd/MM/yyyy - HH:mm')
      return format(d, 'dd/MM/yyyy - HH:mm')
    } catch {
      return format(new Date(), 'dd/MM/yyyy - HH:mm')
    }
  }

  const generarHtmlComprobante = (r) => {
    if (!r) return ''
    const rawMetodo = String(r.metodoPagoConfirmado || r.metodoPago || '').toLowerCase()
    const esEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal') || String(r.estado).toLowerCase().includes('efectivo') || esCobradoEnSucursal(r)
    const cod = r.codigo || r.referencia || r.id || 'RECIBO'
    const total = Number(r.totalCOP || r.total || 0)
    const totalFormateado = formatCurrency(total, moneda, tasaUSD)
    const fecha = formatFecha(r.fechaPagoConfirmado || r.fechaCreacion)
    const clienteNombre = r.clienteNombre || t('hc2.cliente_registrado', 'Cliente Registrado')
    const clienteTelefono = r.clienteTelefono || '—'
    const clienteCorreo = r.clienteCorreo || r.clienteEmail || '—'
    const vehiculoNombre = r.vehiculoNombre || t('hc2.vehiculo_reservado', 'Vehículo Reservado')
    const sucursal = r.sucursalRetiro || r.sucursalNombre || r.sucursal || 'Principal'
    const cajero = r.cajeroConfirmacion || t('hc5.counter_manager', 'Encargado Mostrador')
    const observaciones = r.observacionesCaja || ''

    if (esEfectivo) {
      return `
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px 28px;width:420px;margin:0 auto;box-shadow:0 10px 25px rgba(0,0,0,0.08);position:relative;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;box-sizing:border-box;">
          <div style="height:6px;background:linear-gradient(90deg, #10b981 0%, #059669 100%);border-radius:4px 4px 0 0;margin:-32px -28px 24px -28px;"></div>
          
          <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:#ecfdf5;color:#10b981;margin-bottom:12px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2"></rect>
              <circle cx="12" cy="12" r="2"></circle>
              <path d="M6 12h.01M18 12h.01"></path>
            </svg>
          </div>
          
          <h2 style="margin:0 0 4px;font-size:20px;font-weight:800;letter-spacing:0.5px;color:#111827;">${t('hc.recibo_de_caja', 'RECIBO DE CAJA')}</h2>
          <p style="margin:0 0 20px;font-size:13px;color:#64748b;font-weight:500;">${t('admin.cash.modal.branchPrefix', 'Sucursal')} ${sucursal}</p>
          
          <div style="border-top:1px dashed #cbd5e1;border-bottom:1px dashed #cbd5e1;padding:16px 0;margin:0 0 20px 0;text-align:left;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;">
              <span style="color:#64748b;">${t('admin.cash.modal.reference', 'Referencia')}:</span>
              <span style="font-weight:700;color:#0f172a;">${cod}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;">
              <span style="color:#64748b;">${t('admin.cash.modal.date', 'Fecha')}:</span>
              <span style="font-weight:600;color:#0f172a;">${fecha}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;">
              <span style="color:#64748b;">${t('admin.cash.modal.customer', 'Cliente')}:</span>
              <span style="font-weight:600;color:#0f172a;">${clienteNombre}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;">
              <span style="color:#64748b;">${t('hc.vehiculo', 'Vehículo')}:</span>
              <span style="font-weight:600;color:#0f172a;">${vehiculoNombre}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;">
              <span style="color:#64748b;">${t('admin.cash.modal.cashier', 'Cajero')}:</span>
              <span style="font-weight:600;color:#0f172a;">${cajero}</span>
            </div>
          </div>
          
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:15px;font-weight:700;color:#111827;">${t('admin.cash.modal.totalPaid', 'TOTAL PAGADO')}</span>
            <span style="font-size:24px;font-weight:800;color:#10b981;">${totalFormateado}</span>
          </div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;text-align:right;font-weight:600;">${t('admin.cash.modal.cashPayment', 'Pago en Efectivo')}</div>
          
          ${observaciones ? `
          <div style="margin-top:20px;padding:12px;border-radius:6px;background:#f8fafc;border:1px solid #e2e8f0;font-size:12px;text-align:left;color:#475569;">
            <strong style="color:#1e293b;">Nota:</strong> ${observaciones}
          </div>` : ''}

          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;display:flex;align-items:center;justify-content:space-between;">
            <span style="font-weight:800;color:#0f172a;letter-spacing:1px;">DRIVIQUE</span>
            <span>Documento de Recibo Oficial</span>
          </div>
        </div>
      `
    }

    let medioPago = t('admin.cash.modal.onlinePayment', 'Pago en línea (Wompi)')
    if (rawMetodo.includes('nequi')) medioPago = 'Wompi (Nequi)'
    else if (rawMetodo.includes('pse')) medioPago = 'Wompi (PSE)'
    else if (rawMetodo.includes('daviplata')) medioPago = 'Wompi (DaviPlata)'
    else if (rawMetodo.includes('bancolombia')) medioPago = 'Wompi (Bancolombia)'

    return `
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:6px solid #00a650;border-radius:12px;padding:36px 30px;width:420px;margin:0 auto;box-shadow:0 10px 25px rgba(0,0,0,0.08);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;box-sizing:border-box;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:#00a650;color:#ffffff;margin-bottom:14px;box-shadow:0 4px 12px rgba(0,166,80,0.25);">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 style="font-size:22px;color:#111827;font-weight:700;margin:0 0 6px 0;">${t('admin.cash.modal.paymentApprovedTitle', '¡Pago aprobado!')}</h2>
          <div style="font-size:30px;color:#00a650;font-weight:800;margin:0 0 6px 0;">
            ${totalFormateado}
          </div>
          <div style="font-size:13px;color:#6b7280;">
            ${fecha}
          </div>
        </div>
        
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;text-align:center;margin-bottom:24px;font-size:12.5px;color:#15803d;line-height:1.5;">
          Hemos registrado tu pago con éxito.<br>
          Comprobante digital enviado a <strong>${clienteCorreo}</strong>
        </div>
        
        <div style="margin-bottom:20px;">
          <h4 style="font-size:14px;color:#111827;font-weight:700;margin:0 0 12px 0;border-bottom:1px solid #f3f4f6;padding-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
            ${t('admin.cash.modal.transactionInfo', 'Información de la transacción')}
          </h4>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:10px;">
            <span style="color:#6b7280;">${t('hc4.referencia', 'Referencia')}:</span>
            <span style="font-weight:600;color:#111827;text-align:right;word-break:break-all;">${cod}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:10px;">
            <span style="color:#6b7280;">${t('hc.metodo_de_pago', 'Método de pago')}:</span>
            <span style="font-weight:600;color:#111827;">${medioPago}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;">
            <span style="color:#6b7280;">${t('hc.vehiculo', 'Vehículo')}:</span>
            <span style="font-weight:600;color:#111827;">${vehiculoNombre}</span>
          </div>
        </div>
        
        <div style="margin-bottom:24px;">
          <h4 style="font-size:14px;color:#111827;font-weight:700;margin:0 0 12px 0;border-bottom:1px solid #f3f4f6;padding-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
            ${t('admin.cash.modal.payerInfo', 'Información del pagador')}
          </h4>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:10px;">
            <span style="color:#6b7280;">${t('hc4.nombre', 'Nombre')}:</span>
            <span style="font-weight:500;color:#111827;">${clienteNombre}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:10px;">
            <span style="color:#6b7280;">${t('hc.telefono', 'Teléfono')}:</span>
            <span style="font-weight:500;color:#111827;">${clienteTelefono}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;">
            <span style="color:#6b7280;">Email:</span>
            <span style="font-weight:500;color:#111827;">${clienteCorreo}</span>
          </div>
        </div>

        <div style="padding-top:16px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;display:flex;align-items:center;justify-content:space-between;">
          <span style="font-weight:800;color:#0f172a;letter-spacing:1px;">DRIVIQUE</span>
          <span>Transacción Segura Wompi</span>
        </div>
      </div>
    `
  }

  const handleDescargarComprobante = async (r) => {
    if (!r) return
    const cod = r.codigo || r.referencia || r.id || 'RECIBO'
    const htmlTicket = generarHtmlComprobante(r)

    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'position:fixed;top:0;left:0;width:460px;z-index:-9999;pointer-events:none;opacity:1;background:#ffffff;padding:20px;box-sizing:border-box;'
    wrapper.innerHTML = htmlTicket
    document.body.appendChild(wrapper)

    try {
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `Comprobante-${cod}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Error al generar imagen de comprobante:', err)
      handleImprimirComprobante(r)
    } finally {
      if (wrapper.parentNode) {
        document.body.removeChild(wrapper)
      }
    }
  }

  const handleImprimirComprobante = (r) => {
    if (!r) return
    const cod = r.codigo || r.referencia || r.id || 'RECIBO'
    const htmlTicket = generarHtmlComprobante(r)

    const win = window.open('', '_blank', 'width=560,height=750')
    if (!win) return
    win.document.open()
    win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Comprobante-${cod}</title>
  <style>
    body {
      margin: 0;
      padding: 30px 15px;
      background: #f8fafc;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    @media print {
      body { background: transparent; padding: 0; }
    }
  </style>
</head>
<body>
  ${htmlTicket}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
  <\/script>
</body>
</html>`)
    win.document.close()
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

            <div className="cities-topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MenuConfiguracion />
              {/* Chip de perfil de usuario */}
              {user && (
                <div className="branch-user-profile-chip">
                  <div className="branch-user-avatar">
                    {(user?.nombre || user?.correo || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="branch-user-info-text">
                    <strong className="branch-user-name">
                      {(() => {
                        const nom = (user?.nombre || '').trim()
                        const ape = (user?.apellido || '').trim()
                        if (nom && ape && !nom.toLowerCase().includes(ape.toLowerCase())) return `${nom} ${ape}`
                        return nom || ape || user?.correo || 'Usuario'
                      })()}
                    </strong>
                    <span className="branch-user-role">
                      {user?.rol || 'encargado_sucursal'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Tarjetas de Resumen KPI */}
          <div className="cash-kpi-bar">
            {/* Tarjeta 1 */}
            <div className="cash-kpi-item-light">
              <div className="cash-kpi-header-light" style={{ color: '#f59e0b' }}>
                <FaMoneyBillWave />
                <span>{t('admin.cash.kpi.pendingCash', 'Pendientes (Efectivo)')}</span>
              </div>
              <strong className="cash-kpi-val-light">{pendientesEfectivo.length}</strong>
              <div className="cash-kpi-progress-bg">
                <div className="cash-kpi-progress-fill" style={{ width: '100%', background: '#f59e0b' }}></div>
              </div>
              <span className="cash-kpi-subtitle-light">{t('admin.cash.kpi.pendingReservations', 'Reservas por cobrar')}</span>
            </div>

            {/* Tarjeta 2 */}
            <div className="cash-kpi-item-light">
              <div className="cash-kpi-header-light" style={{ color: '#10b981' }}>
                <FaCashRegister />
                <span>{t('admin.cash.kpi.collectedToday', 'Recaudado Hoy (Caja)')}</span>
              </div>
              <strong className="cash-kpi-val-light">{formatCurrency(totalRecaudadoHoy, moneda, tasaUSD)}</strong>
              <div className="cash-kpi-progress-bg">
                <div className="cash-kpi-progress-fill" style={{ width: '100%', background: '#10b981' }}></div>
              </div>
              <span className="cash-kpi-subtitle-light">{t('admin.cash.kpi.confirmedIncome', 'Ingresos confirmados')}</span>
            </div>

            {/* Tarjeta 3 */}
            <div className="cash-kpi-item-light">
              <div className="cash-kpi-header-light" style={{ color: 'var(--brand-primary, #3b82f6)' }}>
                <FaCheckCircle />
                <span>{t('admin.cash.kpi.paymentsToday', 'Cobros Realizados Hoy')}</span>
              </div>
              <strong className="cash-kpi-val-light">{cobradasHoy.length}</strong>
              <div className="cash-kpi-progress-bg">
                <div className="cash-kpi-progress-fill" style={{ width: '100%', background: 'var(--brand-primary, #3b82f6)' }}></div>
              </div>
              <span className="cash-kpi-subtitle-light">{t('admin.cash.kpi.receiptsIssued', 'Comprobantes emitidos')}</span>
            </div>
          </div>

          {/* Tarjeta Principal con Buscador, Filtros y Tabla (Estilo exacto según captura) */}
          <section className="cities-card">
            <div className="cash-toolbar-container">
              {/* FILA 1: Buscador, Filtro Estado y Selector Sucursal */}
              <div className="cash-toolbar-row1" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>

                {/* Input referencia */}
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--city-card, #fff)', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: '8px', padding: '0 8px', height: '36px', minWidth: '160px' }}>
                  <input
                    type="text"
                    placeholder={t('admin.cash.filterRefPlaceholder', 'Ref. (Ej. RES-179...)')}
                    value={searchRefValue}
                    onChange={(e) => {
                      const val = e.target.value
                      setSearchRefValue(val)
                      setSearch(val)
                    }}
                    style={{ padding: '0 8px', border: 'none', background: 'transparent', color: 'var(--city-text, #0f172a)', fontSize: '13px', outline: 'none', width: '155px', height: '100%' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchRef()}
                  />
                </div>

                {/* Botones Filtrar y Limpiar */}
                <button
                  type="button"
                  onClick={handleSearchRef}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0 12px', height: '36px', background: '#f59e0b', borderRadius: '8px', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  <FaSearch /> {t('admin.cash.filterBtn', 'Filtrar')}
                </button>
                <button
                  type="button"
                  onClick={() => { setSearchRefValue(''); setSearch(''); }}
                  style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: '36px', background: 'var(--city-card, #fff)', borderRadius: '8px', border: '1.5px solid #f59e0b', color: '#f59e0b', fontWeight: 600, cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  {t('admin.cash.clearBtn', 'Limpiar')}
                </button>

                {/* Dropdown estado */}
                <select
                  value={filterTab}
                  onChange={(e) => setFilterTab(e.target.value)}
                  style={{ height: '36px', padding: '0 10px', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: '8px', fontSize: '13px', background: 'var(--city-card, #fff)', color: 'var(--city-text, #374151)', cursor: 'pointer', flexShrink: 0 }}
                >
                  <option value="todas">{t('admin.cash.allPayments', 'Todos los pagos')}</option>
                  <option value="pendientes">{t('admin.cash.pendingCashOption', 'Pendientes Efectivo ({{count}})', { count: pendientesEfectivo.length })}</option>
                  <option value="cobradas">{t('admin.cash.collectedOption', 'Cobradas Caja ({{count}})', { count: cobradasHoy.length })}</option>
                  <option value="digitales">{t('admin.cash.digitalGateway', 'Pasarela Digital')}</option>
                </select>

                {/* Dropdown Sucursal */}
                {!isBranchManager && (
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    style={{ height: '36px', padding: '0 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', background: '#fff', color: '#374151', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <option value="todas">{t('admin.cash.allBranches', 'Todas las sucursales')}</option>
                    {listaSucursales.map((suc) => (
                      <option key={suc} value={suc}>{suc}</option>
                    ))}
                  </select>
                )}

                {/* Fechas DESDE / HASTA - inline sin label apilado */}
                <input
                  type="date"
                  placeholder={t('admin.cash.dateFrom', 'Desde')}
                  title={t('hc4.desde', 'Desde')}
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={{ height: '36px', padding: '0 8px', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: '8px', fontSize: '13px', background: 'var(--city-card, #fff)', color: 'var(--city-text, #374151)', width: '140px', flexShrink: 0 }}
                />
                <input
                  type="date"
                  placeholder={t('admin.cash.dateTo', 'Hasta')}
                  title={t('hc4.hasta', 'Hasta')}
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={{ height: '36px', padding: '0 8px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', background: '#fff', color: '#374151', width: '140px', flexShrink: 0 }}
                />

                {/* Botones exportación */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
                  <button
                    type="button"
                    className="cash-exp-btn excel"
                    onClick={() => exportExcel(exportData)}
                    title={t('admin.cash.exportExcel', 'Excel')}
                  >
                    <FaFileExcel /> {t('admin.cash.exportExcel', 'Excel')}
                  </button>
                  <button
                    type="button"
                    className="cash-exp-btn pdf"
                    onClick={() => exportPdf(exportData)}
                    title={t('admin.cash.exportPdf', 'PDF')}
                  >
                    <FaFilePdf /> {t('admin.cash.exportPdf', 'PDF')}
                  </button>
                  <button
                    type="button"
                    className="cash-exp-btn print"
                    onClick={() => printTable(exportData)}
                    title={t('admin.reservationsManagement.print', 'Imprimir')}
                  >
                    <FaPrint /> {t('admin.reservationsManagement.print', 'Imprimir')}
                  </button>
                </div>
              </div>
            </div>

            {/* Resumen de Resultados */}
            <div className="cities-summary">
              <strong>{listFiltrada.length}</strong> {t('admin.cash.reservationsFound', 'reservas encontradas')}
            </div>

            {/* Tabla Simplificada para Cobro en Sucursal */}
            {listFiltrada.length === 0 ? (
              <div className="cities-empty">
                <FaCashRegister style={{ fontSize: 32, color: '#94a3b8' }} />
                <h2>{t('admin.cash.emptyTitle', 'No se encontraron reservas')}</h2>
                <p>{t('admin.cash.emptyDesc', 'No hay registros coincidentes con los criterios de búsqueda o filtro seleccionados.')}</p>
              </div>
            ) : (
              <div className="cities-table-wrap">
                <table className="branches-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{t('admin.cash.table.code', 'CÓDIGO RESERVA')}</th>
                      <th>{t('admin.cash.table.fullName', 'NOMBRE COMPLETO')}</th>
                      <th>{t('admin.cash.table.phone', 'TELÉFONO')}</th>
                      <th>{t('admin.cash.table.paymentMethod', 'MEDIO DE PAGO')}</th>
                      <th>{t('admin.cash.table.totalAmount', 'MONTO TOTAL')}</th>
                      <th>{t('admin.cash.table.paymentStatus', 'ESTADO PAGO')}</th>
                      <th>{t('admin.cash.table.receipt', 'COMPROBANTE DE PAGO')}</th>
                      <th>{t('admin.cash.table.downloadReceipt', 'DESCARGAR COMPROBANTE')}</th>
                      <th>{t('admin.cash.table.printReceipt', 'IMPRIMIR COMPROBANTE')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listFiltrada.map((r, index) => {
                      const sequentialId = index + 1
                      const dbId = r.id || 'N/A'
                      const cod = r.codigo || r.referencia || dbId
                      const total = Number(r.totalCOP || r.total || 0)
                      
                      const rawMetodo = String(r.metodoPago || r.reservaDetalles?.metodoPago || r.pasarela || r.metodoPagoConfirmado || 'Wompi').toLowerCase()
                      const esEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal') || String(r.estado).toLowerCase().includes('efectivo')
                      const esPagadaEnEfectivo = esEfectivo && esCobradoEnSucursal(r)
                      const esPagadaDigital = !esEfectivo && (r.pagoEstado === 'aprobado' || r.estadoPago === 'aprobado' || r.estado === 'confirmada' || r.estado === 'en_curso' || r.estado === 'finalizada')
                      
                      const pagoConfirmado = esPagadaEnEfectivo || esPagadaDigital
                      
                      // Lógica de prefijo de país para el teléfono
                      let tel = String(r.clienteTelefono || t('hc2.sin_telefono', 'Sin teléfono')).trim()
                      if (tel !== 'Sin teléfono' && !tel.startsWith('+')) {
                        tel = `+57 ${tel}`
                      }

                      // Formatear Medio de Pago
                      let medioDisplay = esEfectivo ? t('admin.cash.paymentMethodBranch', 'Pago en Sucursal') : 'Wompi (Tarjeta)'
                      if (!esEfectivo) {
                        if (rawMetodo.includes('nequi')) medioDisplay = 'Wompi (Nequi)'
                        else if (rawMetodo.includes('pse')) medioDisplay = 'Wompi (PSE)'
                        else if (rawMetodo.includes('daviplata')) medioDisplay = 'Wompi (DaviPlata)'
                        else if (rawMetodo.includes('bancolombia')) medioDisplay = 'Wompi (Bancolombia)'
                        else if (rawMetodo !== 'wompi' && rawMetodo !== 'wompi (digital)') {
                          // Capitalizar primera letra si viene algo específico de Wompi
                          const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)
                          medioDisplay = `Wompi (${capitalize(rawMetodo)})`
                        }
                      }

                      const finalName = r.clienteNombre || t('hc2.sin_nombre', 'Sin Nombre')

                      return (
                        <tr
                          key={dbId + cod}
                          style={{ cursor: 'default' }}
                        >
                          <td>
                            <span style={{ fontSize: 13, color: 'var(--city-muted, #475569)' }}>{sequentialId}</span>
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
                            <span style={{ fontSize: 13, color: 'var(--city-muted, #475569)' }}>
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
                              {formatCurrency(total, moneda, tasaUSD)}
                            </span>
                          </td>

                          {/* ESTADO PAGO */}
                          <td>
                            {!pagoConfirmado && esEfectivo ? (
                              <button
                                type="button"
                                style={{ width: '120px', height: '32px', fontSize: '13px', background: '#f59e0b', border: 'none', color: '#fff', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}
                                onClick={(e) => { e.stopPropagation(); openModalCobro(r) }}
                              >
                                {t('admin.cash.actions.chargeBox', 'Cobrar en Caja')}
                              </button>
                            ) : pagoConfirmado ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '120px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  backgroundColor: '#dcfce7',
                                  color: '#15803d',
                                  fontWeight: 600,
                                  fontSize: '13px',
                                  boxSizing: 'border-box'
                                }}
                              >
                                {t('admin.cash.status.approved', 'Aprobado')}
                              </span>
                            ) : (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '120px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  backgroundColor: '#fef9c3',
                                  color: '#a16207',
                                  fontWeight: 600,
                                  fontSize: '13px',
                                  boxSizing: 'border-box'
                                }}
                              >
                                {t('admin.cash.status.pending', 'Pendiente')}
                              </span>
                            )}
                          </td>

                          {/* COMPROBANTE DE PAGO */}
                          <td>
                            {pagoConfirmado ? (
                              <button
                                type="button"
                                style={{ width: '80px', padding: '6px 10px', fontSize: '13px', background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', borderRadius: '6px', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: '500', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (esPagadaEnEfectivo) { openModalCobro(r) } else { setComprobanteDigital(r) }
                                }}
                              >
                                <FaReceipt /> {t('admin.cash.actions.view', 'Ver')}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                style={{ width: '80px', padding: '6px 10px', fontSize: '13px', background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', borderRadius: '6px', opacity: 0.4, cursor: 'not-allowed', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: '500', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                              >
                                <FaReceipt /> {t('admin.cash.actions.view', 'Ver')}
                              </button>
                            )}
                          </td>

                          {/* DESCARGAR - descarga como PNG idéntico a la pantalla */}
                          <td>
                            <button
                              type="button"
                              className="cash-btn-primary"
                              disabled={!pagoConfirmado}
                              style={{ width: '100px', padding: '6px 10px', fontSize: '13px', background: pagoConfirmado ? '#faf5ff' : '#e5e7eb', borderColor: pagoConfirmado ? '#e9d5ff' : '#e5e7eb', color: pagoConfirmado ? '#9333ea' : '#9ca3af', whiteSpace: 'nowrap', textAlign: 'center', cursor: pagoConfirmado ? 'pointer' : 'not-allowed', fontWeight: '500', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (!pagoConfirmado) return
                                handleDescargarComprobante(r)
                              }}
                            >
                              <FaDownload /> {t('admin.cash.actions.download', 'Descargar')}
                            </button>
                          </td>

                          {/* IMPRIMIR */}
                          <td>
                            <button
                              type="button"
                              className="cash-btn-primary"
                              disabled={!pagoConfirmado}
                              style={{ width: '90px', padding: '6px 10px', fontSize: '13px', background: pagoConfirmado ? 'var(--city-soft, #eff6ff)' : '#e5e7eb', borderColor: pagoConfirmado ? 'var(--brand-border)' : '#e5e7eb', color: pagoConfirmado ? 'var(--brand-primary)' : '#9ca3af', whiteSpace: 'nowrap', textAlign: 'center', cursor: pagoConfirmado ? 'pointer' : 'not-allowed', fontWeight: '500', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (!pagoConfirmado) return
                                handleImprimirComprobante(r)
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

      {/* â”€â”€ MODAL ORGANIZADO DE CONFIRMACIÓN DE PAGO EN SUCURSAL â”€â”€ */}
      {modalReserva && (
        <div
          className="cities-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setModalReserva(null)}
        >
          <section className="cities-modal cash-modal" role="dialog" style={{ maxWidth: 440, borderRadius: '16px' }}>
            <div className="cities-modal__head" style={{ borderBottom: 'none', paddingBottom: 0, paddingTop: '16px', paddingRight: '16px' }}>
              <div></div>
              <button type="button" onClick={() => setModalReserva(null)} style={{ background: 'transparent', border: 'none', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280', fontSize: '20px' }}>
                <FaTimes />
              </button>
            </div>

            <div className="cash-modal-body" style={{ padding: '0 24px 24px 24px' }}>
              {!esCobradoEnSucursal(modalReserva) ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '48px', height: '48px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#f59e0b', fontSize: '24px' }}>
                      <FaMoneyBillWave />
                    </div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#111827', fontWeight: 700 }}>{t('admin.cash.modal.confirmCashTitle', 'Confirmar cobro en efectivo')}</h2>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>{t('admin.cash.modal.confirmCashSubtitle', 'Verifica los datos antes de registrar el ingreso en caja.')}</p>
                  </div>

                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                      <span style={{ color: '#6b7280' }}>{t('admin.cash.modal.reference', 'Referencia')}</span>
                      <strong style={{ color: '#111827' }}>{modalReserva.codigo || modalReserva.referencia || modalReserva.id}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                      <span style={{ color: '#6b7280' }}>{t('admin.cash.modal.customer', 'Cliente')}</span>
                      <strong style={{ color: '#111827', textAlign: 'right' }}>{modalReserva.clienteNombre || t('hc2.cliente_registrado', 'Cliente Registrado')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                      <span style={{ color: '#6b7280' }}>{t('admin.cash.modal.vehicle', 'Vehículo')}</span>
                      <strong style={{ color: '#111827', textAlign: 'right' }}>{modalReserva.vehiculoNombre || t('hc2.vehiculo_reservado', 'Vehículo Reservado')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #e5e7eb', fontSize: '15px', alignItems: 'center' }}>
                      <span style={{ color: '#374151', fontWeight: 600 }}>{t('admin.cash.modal.totalToCollect', 'Total a cobrar')}</span>
                      <strong style={{ color: '#10b981', fontSize: '20px', fontWeight: 800 }}>
                        {formatCurrency(Number(modalReserva.totalCOP || modalReserva.total || 0), moneda, tasaUSD)}
                      </strong>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 600 }}>
                      {t('admin.cash.modal.observations', 'Observaciones (opcional)')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('admin.cash.modal.observationsPlaceholder', 'Ej. Billetes verificados...')}
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
                      {procesandoPago ? t('admin.cash.modal.recordingPayment', 'Registrando cobro...') : t('admin.cash.modal.confirmPayment', 'Confirmar pago')}
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
                      <h3>{t('hc.recibo_de_caja', 'RECIBO DE CAJA')}</h3>
                      <p className="text-muted" style={{ margin: '0 0 20px 0', fontSize: 13 }}>{t('admin.cash.modal.branchPrefix', 'Sucursal')} {modalReserva.sucursalRetiro || 'Principal'}</p>
                      
                      <div className="ticket-dashed-border" style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '16px 0', margin: '0 0 20px 0', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span className="text-muted" style={{ fontSize: 13 }}>{t('admin.cash.modal.reference', 'Referencia')}:</span>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{modalReserva.codigo || modalReserva.referencia || modalReserva.id}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span className="text-muted" style={{ fontSize: 13 }}>{t('admin.cash.modal.date', 'Fecha')}:</span>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{format(new Date(modalReserva.fechaPagoConfirmado || Date.now()), 'dd/MM/yyyy - HH:mm')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span className="text-muted" style={{ fontSize: 13 }}>{t('admin.cash.modal.customer', 'Cliente')}:</span>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{modalReserva.clienteNombre || t('hc2.cliente_registrado', 'Cliente Registrado')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted" style={{ fontSize: 13 }}>{t('admin.cash.modal.cashier', 'Cajero')}:</span>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{modalReserva.cajeroConfirmacion || t('hc5.counter_manager', 'Encargado Mostrador')}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>{t('admin.cash.modal.totalPaid', 'TOTAL PAGADO')}</span>
                        <span style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{formatCurrency(Number(modalReserva.totalCOP || modalReserva.total || 0), moneda, tasaUSD)}</span>
                      </div>
                      <div className="text-muted" style={{ fontSize: 11, marginTop: 4, textAlign: 'right' }}>{t('admin.cash.modal.cashPayment', 'Pago en Efectivo')}</div>

                      {modalReserva.observacionesCaja && (
                        <div className="ticket-note" style={{ marginTop: 20, padding: 12, borderRadius: 6, fontSize: 12, textAlign: 'left' }}>
                          <strong>Nota:</strong> {modalReserva.observacionesCaja}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                      <button
                        type="button"
                        className="cash-confirm-btn-primary"
                        onClick={() => handleDescargarComprobante(modalReserva)}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', fontSize: '14px', fontWeight: 600 }}
                      >
                        <FaDownload /> {t('admin.cash.actions.download', 'Descargar')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleImprimirComprobante(modalReserva)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '12px',
                          fontSize: '14px',
                          fontWeight: 600,
                          background: 'var(--city-soft, #f1f5f9)',
                          border: '1px solid var(--city-border, #cbd5e1)',
                          color: 'var(--city-text, #334155)',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <FaPrint /> {t('admin.cash.modal.printReceiptBtn', 'Imprimir')}
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </section>
        </div>
      )}

      {/* â”€â”€ MODAL COMPROBANTE DIGITAL (RÉPLICA WOMPI) â”€â”€ */}
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
              <h2 style={{ fontSize: '22px', color: '#111827', fontWeight: 700, margin: '0 0 8px 0' }}>{t('admin.cash.modal.paymentApprovedTitle', '¡Pago aprobado!')}</h2>
              <div style={{ fontSize: '32px', color: '#00a650', fontWeight: 800, margin: '0 0 8px 0' }}>
                {formatCurrency(Number(comprobanteDigital.totalCOP || comprobanteDigital.total || 0), moneda, tasaUSD)}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                {format(new Date(), 'dd/MM/yyyy - HH:mm')}
              </div>
            </div>

            <div className="bg-success-light" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', textAlign: 'center', marginBottom: '32px' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>
                Hemos registrado tu pago.<br/>
                Guarda estos datos por si necesitas consultar tu compra.<br/>
                También te enviamos un comprobante a <strong>{comprobanteDigital.clienteCorreo || comprobanteDigital.clienteEmail || '—'}</strong>
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', color: '#111827', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                {t('admin.cash.modal.transactionInfo', 'Información de la transacción')}
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                <span style={{ color: '#4b5563' }}>{t('hc4.referencia', 'Referencia')}</span>
                <span style={{ color: '#111827', fontWeight: 500, textAlign: 'right', wordBreak: 'break-all', maxWidth: '60%' }}>
                  {comprobanteDigital.codigo || comprobanteDigital.referencia || comprobanteDigital.id}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                <span style={{ color: '#4b5563' }}>{t('hc.metodo_de_pago', 'Método de pago')}</span>
                <span style={{ color: '#111827', fontWeight: 600 }}>
                  {t('admin.cash.modal.onlinePayment', 'Pago en línea (Wompi)')}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '15px', color: '#111827', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                {t('admin.cash.modal.payerInfo', 'Información del pagador')}
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                <span style={{ color: '#4b5563' }}>{t('hc4.nombre', 'Nombre')}</span>
                <span style={{ color: '#111827', fontWeight: 500 }}>
                  {comprobanteDigital.clienteNombre || '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                <span style={{ color: '#4b5563' }}>{t('hc.telefono', 'Teléfono')}</span>
                <span style={{ color: '#111827', fontWeight: 500 }}>
                  {comprobanteDigital.clienteTelefono || '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                <span style={{ color: '#4b5563' }}>Email</span>
                <span style={{ color: '#111827', fontWeight: 500 }}>{comprobanteDigital.clienteCorreo || comprobanteDigital.clienteEmail || '—'}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '24px' }}>
              <button
                type="button"
                className="cash-confirm-btn-primary"
                onClick={() => handleDescargarComprobante(comprobanteDigital)}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, background: '#00a650', borderColor: '#00a650' }}
              >
                <FaDownload /> {t('admin.cash.actions.download', 'Descargar')}
              </button>
              <button
                type="button"
                onClick={() => handleImprimirComprobante(comprobanteDigital)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  background: 'var(--city-soft, #f1f5f9)',
                  border: '1px solid var(--city-border, #cbd5e1)',
                  color: 'var(--city-text, #334155)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <FaPrint /> {t('admin.cash.modal.printReceiptBtn', 'Imprimir')}
              </button>
            </div>

          </section>
        </div>
      )}
    </div>
  )
}
