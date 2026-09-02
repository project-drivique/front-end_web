import { reservationService } from './reservationService'
import { vehicleManagementService } from './vehicleManagementService'
import { contractManagementService } from './contractManagementService'
import { incidentManagementService } from './incidentManagementService'
import { userManagementService } from './userManagementService'
import { branchManagementService } from './branchManagementService'
import { promotionManagementService } from './promotionManagementService'
import { accessAuditService } from './accessAuditService'
import { exportExcel, exportPdf, exportWord } from '../utils/listExportUtils'
import { formatCurrency } from '../utils/currencyUtils'
import { ROLES } from '../modules/auth/utils/accessControl'
import { ESTADOS_RESERVA } from '../modules/reservations/utils/reservationStatus'

const HISTORY_KEY = 'drivique_admin_reports_history'
const MAX_HISTORY = 150

export const REPORT_CATEGORIES = {
  GENERAL: 'general',
  SPECIFIC: 'especifico',
}

export const REPORT_FORMATS = {
  WORD: 'WORD',
  PDF: 'PDF',
  EXCEL: 'EXCEL',
}

export const REPORT_TYPES_CONFIG = [
  // REPORTES GENERALES
  {
    id: 'executive_summary',
    categoria: REPORT_CATEGORIES.GENERAL,
    titulo: 'Resumen Ejecutivo y Operativo',
    descripcion: 'Balance global del negocio con indicadores clave de reservas, ingresos estimados, ocupación de flota, contratos activos e incidencias.',
    icono: 'FaChartPie',
    filtrosSoportados: ['rangoFechas', 'sucursal'],
    defaultColumns: ['Métrica / Indicador', 'Valor Actual', 'Participación / Estado', 'Observaciones'],
  },
  {
    id: 'financial_consolidated',
    categoria: REPORT_CATEGORIES.GENERAL,
    titulo: 'Consolidado Financiero e Ingresos',
    descripcion: 'Desglose detallado de ingresos por reservas, sucursales con mayor facturación, métodos de pago y valor promedio de alquiler.',
    icono: 'FaMoneyBillWave',
    filtrosSoportados: ['rangoFechas', 'sucursal', 'metodoPago'],
    defaultColumns: ['Sucursal / Concepto', 'Reservas Facturadas', 'Ingresos Netos', 'Ticket Promedio', 'Participación %'],
  },
  {
    id: 'fleet_occupancy',
    categoria: REPORT_CATEGORIES.GENERAL,
    titulo: 'Consolidado de Flota y Ocupación',
    descripcion: 'Análisis de disponibilidad, tasa de ocupación de vehículos, modelos de mayor rotación y vehículos en taller o fuera de servicio.',
    icono: 'FaCarSide',
    filtrosSoportados: ['sucursal', 'categoriaVehiculo', 'estadoVehiculo'],
    defaultColumns: ['Categoría / Tipo', 'Total Unidades', 'En Alquiler', 'Disponibles', 'En Taller', 'Tasa Ocupación'],
  },
  {
    id: 'incidents_maintenance',
    categoria: REPORT_CATEGORIES.GENERAL,
    titulo: 'Balance de Incidencias y Mantenimiento',
    descripcion: 'Resumen de reportes de daños mecánicos o estéticos, costos estimados acumulados, gravedad y tiempos de atención.',
    icono: 'FaTools',
    filtrosSoportados: ['rangoFechas', 'sucursal', 'gravedad', 'estadoIncidencia'],
    defaultColumns: ['Gravedad / Categoría', 'Casos Reportados', 'Resueltos', 'En Revisión', 'Costo Estimado COP'],
  },

  // REPORTES ESPECÍFICOS
  {
    id: 'reservations',
    categoria: REPORT_CATEGORIES.SPECIFIC,
    titulo: 'Reporte Específico de Reservas',
    descripcion: 'Listado detallado de todas las reservas registradas con filtros por código, cliente, fechas de recogida/devolución y estado operativo.',
    icono: 'FaClipboardList',
    filtrosSoportados: ['rangoFechas', 'sucursal', 'estadoReserva', 'search'],
    defaultColumns: ['Código', 'Cliente', 'Vehículo', 'Sucursal', 'Fecha Inicio', 'Fecha Fin', 'Estado', 'Total'],
  },
  {
    id: 'vehicles',
    categoria: REPORT_CATEGORIES.SPECIFIC,
    titulo: 'Reporte Específico de Flota y Vehículos',
    descripcion: 'Inventario exhaustivo de vehículos con placa, marca, modelo, transmisión, combustible, sucursal base, tarifa diaria y disponibilidad.',
    icono: 'FaCar',
    filtrosSoportados: ['sucursal', 'categoriaVehiculo', 'estadoVehiculo', 'combustible', 'search'],
    defaultColumns: ['Placa', 'Marca / Modelo', 'Categoría', 'Sucursal', 'Transmisión', 'Combustible', 'Tarifa/Día', 'Estado'],
  },
  {
    id: 'contracts',
    categoria: REPORT_CATEGORIES.SPECIFIC,
    titulo: 'Reporte Específico de Contratos',
    descripcion: 'Relación de contratos de arrendamiento generados, cliente firmante, documento de identidad, vigencia, monto total y estado contractual.',
    icono: 'FaFileContract',
    filtrosSoportados: ['rangoFechas', 'sucursal', 'estadoContrato', 'search'],
    defaultColumns: ['No. Contrato', 'Reserva', 'Cliente', 'Documento', 'Vehículo', 'Sucursal', 'Vigencia', 'Estado', 'Monto'],
  },
  {
    id: 'incidents',
    categoria: REPORT_CATEGORIES.SPECIFIC,
    titulo: 'Reporte Específico de Incidencias',
    descripcion: 'Listado pormenorizado de reportes de novedades, choques o fallas mecánicas con fecha, vehículo involucrado, usuario y resolución.',
    icono: 'FaExclamationTriangle',
    filtrosSoportados: ['rangoFechas', 'sucursal', 'gravedad', 'estadoIncidencia', 'search'],
    defaultColumns: ['Código', 'Fecha', 'Vehículo', 'Sucursal', 'Tipo / Título', 'Gravedad', 'Estado', 'Costo Estimado'],
  },
  {
    id: 'users',
    categoria: REPORT_CATEGORIES.SPECIFIC,
    titulo: 'Reporte Específico de Clientes y Usuarios',
    descripcion: 'Directorio de usuarios registrados en el sistema con correo, rol asignado, estado de bloqueo o verificación y fecha de registro.',
    icono: 'FaUsers',
    filtrosSoportados: ['rol', 'estadoUsuario', 'search'],
    defaultColumns: ['Nombre Completo', 'Correo Electrónico', 'Documento', 'Teléfono', 'Rol', 'Estado', 'Registro'],
  },
  {
    id: 'promotions',
    categoria: REPORT_CATEGORIES.SPECIFIC,
    titulo: 'Reporte Específico de Promociones y Cupones',
    descripcion: 'Catálogo de cupones de descuento y promociones vigentes con porcentajes, vigencia, límite de redenciones y estado.',
    icono: 'FaTags',
    filtrosSoportados: ['estadoPromo', 'search'],
    defaultColumns: ['Código Cupón', 'Título', 'Descuento', 'Válido Desde', 'Válido Hasta', 'Usos Máx.', 'Estado'],
  },
]

function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeHistory(records) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(0, MAX_HISTORY)))
  } catch (error) {
    console.error('Error saving reports history:', error)
  }
}

function parseDate(val) {
  if (!val) return null
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

function isDateInRange(dateVal, startStr, endStr) {
  if (!dateVal) return true
  const d = new Date(dateVal)
  if (isNaN(d.getTime())) return true

  if (startStr) {
    const start = new Date(`${startStr}T00:00:00`)
    if (!isNaN(start.getTime()) && d < start) return false
  }
  if (endStr) {
    const end = new Date(`${endStr}T23:59:59`)
    if (!isNaN(end.getTime()) && d > end) return false
  }
  return true
}

function normalize(val) {
  return String(val || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export const reportManagementService = {
  getReportTypes() {
    return REPORT_TYPES_CONFIG
  },

  getReportTypeById(id) {
    return REPORT_TYPES_CONFIG.find((t) => t.id === id) || null
  },

  getHistory({ search = '', categoria = 'all', formato = 'all', dateFilter = 'all' } = {}) {
    const all = readHistory()
    const term = search.trim().toLowerCase()
    const now = new Date()

    return all.filter((item) => {
      if (categoria !== 'all' && item.tipoCategoria !== categoria) return false
      if (formato !== 'all' && item.formato !== formato) return false

      if (dateFilter === 'today') {
        const itemDate = new Date(item.fechaGeneracion)
        if (
          itemDate.getFullYear() !== now.getFullYear() ||
          itemDate.getMonth() !== now.getMonth() ||
          itemDate.getDate() !== now.getDate()
        ) {
          return false
        }
      } else if (dateFilter === 'week') {
        const itemDate = new Date(item.fechaGeneracion)
        const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24)
        if (diffDays > 7) return false
      } else if (dateFilter === 'month') {
        const itemDate = new Date(item.fechaGeneracion)
        if (
          itemDate.getFullYear() !== now.getFullYear() ||
          itemDate.getMonth() !== now.getMonth()
        ) {
          return false
        }
      }

      if (term) {
        const matchCode = String(item.codigo || '').toLowerCase().includes(term)
        const matchTitle = String(item.titulo || '').toLowerCase().includes(term)
        const matchUser = String(item.generadoPorNombre || '').toLowerCase().includes(term) || String(item.generadoPorCorreo || '').toLowerCase().includes(term)
        const matchFilterText = JSON.stringify(item.filtrosAplicados || {}).toLowerCase().includes(term)
        if (!matchCode && !matchTitle && !matchUser && !matchFilterText) return false
      }

      return true
    })
  },

  /**
   * RECOLECCIÓN Y PROCESAMIENTO DE DATOS SEGÚN EL TIPO Y FILTROS
   */
  buildReportData({ typeId, filters = {}, user = null }) {
    const isBranchManager =
      user?.rol === ROLES.BRANCH_MANAGER ||
      user?.rol === 'encargado' ||
      user?.rol === 'encargado_sucursal'
    const assignedBranch = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || ''
    const effectiveBranch = isBranchManager ? assignedBranch : filters.sucursal || 'all'

    // Obtener datos maestros de forma segura
    const rawReservations = typeof reservationService?.getReservas === 'function' ? reservationService.getReservas() : []
    const rawVehicles = typeof vehicleManagementService?.list === 'function' ? vehicleManagementService.list() : []
    const rawContracts = typeof contractManagementService?.list === 'function' ? contractManagementService.list(user) : []
    const rawIncidents = typeof incidentManagementService?.list === 'function' ? incidentManagementService.list(user) : []
    const rawUsers = typeof userManagementService?.list === 'function' ? userManagementService.list() : []
    const rawBranches = typeof branchManagementService?.list === 'function' ? branchManagementService.list() : []
    const rawPromotions = typeof promotionManagementService?.list === 'function' ? promotionManagementService.list() : []

    const targetCurrency = filters.moneda || 'COP'
    const tasaUSD = Number(filters.tasaUSD) || 4000
    const formatMoney = (val) => formatCurrency(val, targetCurrency, tasaUSD)

    let headers = []
    let rows = []
    let kpis = []
    let filtersSummary = []
    let reportTitle = ''
    let reportSubtitle = 'Sistema Operativo de Gestión e Inspección de Alquiler de Vehículos'

    // Registrar moneda seleccionada en resumen de filtros
    if (targetCurrency === 'USD') {
      filtersSummary.push({
        label: 'Moneda',
        value: `USD ($) • 1 USD ≈ $${Math.round(tasaUSD).toLocaleString('es-CO')} COP`,
      })
    } else {
      filtersSummary.push({
        label: 'Moneda',
        value: 'COP ($ Pesos Colombianos)',
      })
    }

    // Registrar resumen de filtros aplicados
    if (filters.fechaInicio || filters.fechaFin) {
      filtersSummary.push({
        label: 'Período',
        value: `${filters.fechaInicio || 'Inicio'} al ${filters.fechaFin || 'Hoy'}`,
      })
    }
    if (effectiveBranch && effectiveBranch !== 'all') {
      filtersSummary.push({ label: 'Sucursal', value: effectiveBranch })
    }
    if (filters.estado && filters.estado !== 'all') {
      filtersSummary.push({ label: 'Estado', value: filters.estado })
    }
    if (filters.categoria && filters.categoria !== 'all') {
      filtersSummary.push({ label: 'Categoría', value: filters.categoria })
    }
    if (filters.gravedad && filters.gravedad !== 'all') {
      filtersSummary.push({ label: 'Gravedad', value: filters.gravedad })
    }

    switch (typeId) {
      // 1. RESUMEN EJECUTIVO GENERAL
      case 'executive_summary': {
        reportTitle = 'Resumen Ejecutivo y Balance Operativo'
        headers = ['Métrica / Indicador Operativo', 'Valor Actual', 'Detalle / Estado', 'Observaciones']

        // Filtrar reservas por fecha y sucursal
        const filteredRes = rawReservations.filter((r) => {
          const matchDate = isDateInRange(r.fechaReserva || r.reservaDetalles?.fechaInicio, filters.fechaInicio, filters.fechaFin)
          const matchBranch = effectiveBranch === 'all' || normalize(r.reservaDetalles?.sucursalRetiro) === normalize(effectiveBranch)
          return matchDate && matchBranch
        })

        const totalIngresos = filteredRes
          .filter((r) => [ESTADOS_RESERVA.CONFIRMADA, ESTADOS_RESERVA.ACTIVA, ESTADOS_RESERVA.COMPLETADA].includes(String(r.estado).toUpperCase()))
          .reduce((sum, r) => sum + (Number(r.total) || 0), 0)

        const totalVehiculos = rawVehicles.filter((v) => effectiveBranch === 'all' || normalize(v.sucursal) === normalize(effectiveBranch)).length
        const vehiculosDisponibles = rawVehicles.filter((v) => (effectiveBranch === 'all' || normalize(v.sucursal) === normalize(effectiveBranch)) && v.disponible !== false).length
        const vehiculosAlquilados = totalVehiculos - vehiculosDisponibles

        const totalIncidencias = rawIncidents.filter((inc) => {
          const matchDate = isDateInRange(inc.fechaCreacion, filters.fechaInicio, filters.fechaFin)
          const matchBranch = effectiveBranch === 'all' || normalize(inc.sucursal) === normalize(effectiveBranch)
          return matchDate && matchBranch
        }).length

        const totalContratos = rawContracts.filter((c) => {
          const matchDate = isDateInRange(c.fechaCreacion || c.fechaInicio, filters.fechaInicio, filters.fechaFin)
          const matchBranch = effectiveBranch === 'all' || normalize(c.sucursal) === normalize(effectiveBranch)
          return matchDate && matchBranch
        }).length

        const tasaOcupacion = totalVehiculos > 0 ? ((vehiculosAlquilados / totalVehiculos) * 100).toFixed(1) : 0

        kpis = [
          { label: 'Ingresos Totales', value: formatMoney(totalIngresos) },
          { label: 'Reservas Registradas', value: String(filteredRes.length) },
          { label: 'Ocupación de Flota', value: `${tasaOcupacion}%` },
          { label: 'Contratos Activos', value: String(totalContratos) },
          { label: 'Incidencias Abiertas', value: String(totalIncidencias) },
        ]

        rows = [
          ['Ingresos Brutos Estimados', formatMoney(totalIngresos), 'Consolidado facturación', 'Incluye reservas confirmadas y completadas'],
          ['Total Reservas Procesadas', filteredRes.length, `${filteredRes.filter((r) => r.estado === 'confirmada' || r.estado === 'activa').length} Activas`, 'Volumen en el período seleccionado'],
          ['Flota Vehicular Total', `${totalVehiculos} unidades`, `${vehiculosDisponibles} disponibles / ${vehiculosAlquilados} ocupadas`, 'Unidades asignadas en la red'],
          ['Tasa de Ocupación de Flota', `${tasaOcupacion}%`, vehiculosAlquilados > 0 ? 'Alta demanda' : 'Normal', 'Vehículos actualmente en renta'],
          ['Contratos Registrados', `${totalContratos} acuerdos`, 'Contratos formalizados', 'Firmados y en custodia legal'],
          ['Incidencias y Mantenimientos', `${totalIncidencias} casos`, 'Reportes mecánicos/daños', 'Casos reportados en la red'],
          ['Clientes y Usuarios Activos', `${rawUsers.length} cuentas`, 'Base de datos usuarios', 'Usuarios registrados en el sistema'],
          ['Sucursales Operativas', `${rawBranches.length} sedes`, 'Cobertura nacional', 'Puntos de entrega y devolución'],
        ]
        break
      }

      // 2. CONSOLIDADO FINANCIERO E INGRESOS
      case 'financial_consolidated': {
        reportTitle = 'Consolidado Financiero e Ingresos por Sucursal'
        headers = ['Sucursal / Centro de Operación', 'Reservas Facturadas', targetCurrency === 'USD' ? 'Ingresos Netos USD' : 'Ingresos Netos COP', 'Ticket Promedio', 'Participación']

        const filteredRes = rawReservations.filter((r) => {
          const matchDate = isDateInRange(r.fechaReserva || r.reservaDetalles?.fechaInicio, filters.fechaInicio, filters.fechaFin)
          const matchBranch = effectiveBranch === 'all' || normalize(r.reservaDetalles?.sucursalRetiro) === normalize(effectiveBranch)
          return matchDate && matchBranch
        })

        const totalGlobal = filteredRes.reduce((sum, r) => sum + (Number(r.total) || 0), 0) || 1

        const branchMap = new Map()
        // Inicializar con sucursales existentes
        rawBranches.forEach((b) => branchMap.set(b.nombre, { count: 0, total: 0 }))
        if (!branchMap.has('General / Sin Asignar')) branchMap.set('General / Sin Asignar', { count: 0, total: 0 })

        filteredRes.forEach((r) => {
          const branchName = r.reservaDetalles?.sucursalRetiro || 'General / Sin Asignar'
          const curr = branchMap.get(branchName) || { count: 0, total: 0 }
          curr.count += 1
          curr.total += Number(r.total) || 0
          branchMap.set(branchName, curr)
        })

        let grandTotal = 0
        let totalReservasCount = 0

        rows = Array.from(branchMap.entries())
          .filter(([name, data]) => {
            if (effectiveBranch !== 'all') return normalize(name) === normalize(effectiveBranch)
            return data.count > 0 || data.total > 0
          })
          .map(([name, data]) => {
            grandTotal += data.total
            totalReservasCount += data.count
            const avg = data.count > 0 ? data.total / data.count : 0
            const share = ((data.total / totalGlobal) * 100).toFixed(1)
            return [name, data.count, formatMoney(data.total), formatMoney(avg), `${share}%`]
          })

        if (rows.length === 0) {
          rows.push(['Sin registros en el rango seleccionado', 0, '$0', '$0', '0%'])
        }

        kpis = [
          { label: 'Total Recaudado', value: formatMoney(grandTotal) },
          { label: 'Total Reservas', value: String(totalReservasCount) },
          { label: 'Ticket Promedio', value: totalReservasCount > 0 ? formatMoney(grandTotal / totalReservasCount) : '$0' },
        ]
        break
      }

      // 3. CONSOLIDADO DE FLOTA Y OCUPACIÓN
      case 'fleet_occupancy': {
        reportTitle = 'Consolidado de Flota y Ocupación Vehicular'
        headers = ['Categoría de Vehículo', 'Total Flota', 'Disponibles', 'En Alquiler', 'En Mantenimiento', 'Tasa Ocupación']

        const filteredVehicles = rawVehicles.filter((v) => {
          const matchBranch = effectiveBranch === 'all' || normalize(v.sucursal) === normalize(effectiveBranch)
          const matchCat = !filters.categoria || filters.categoria === 'all' || normalize(v.categoria) === normalize(filters.categoria)
          return matchBranch && matchCat
        })

        const catMap = new Map()
        filteredVehicles.forEach((v) => {
          const cat = v.categoria || 'Estándar'
          const curr = catMap.get(cat) || { total: 0, disp: 0, rent: 0, mant: 0 }
          curr.total += 1
          if (v.disponible === false) {
            curr.rent += 1
          } else if (v.enMantenimiento || v.estado === 'mantenimiento') {
            curr.mant += 1
          } else {
            curr.disp += 1
          }
          catMap.set(cat, curr)
        })

        let totalUnits = 0
        let totalRent = 0

        rows = Array.from(catMap.entries()).map(([cat, data]) => {
          totalUnits += data.total
          totalRent += data.rent
          const rate = data.total > 0 ? ((data.rent / data.total) * 100).toFixed(1) : 0
          return [cat, data.total, data.disp, data.rent, data.mant, `${rate}%`]
        })

        kpis = [
          { label: 'Flota Total', value: `${totalUnits} veh.` },
          { label: 'En Alquiler', value: `${totalRent} veh.` },
          { label: 'Disponibles', value: `${totalUnits - totalRent} veh.` },
          { label: 'Ocupación Global', value: totalUnits > 0 ? `${((totalRent / totalUnits) * 100).toFixed(1)}%` : '0%' },
        ]
        break
      }

      // 4. BALANCE DE INCIDENCIAS Y MANTENIMIENTO
      case 'incidents_maintenance': {
        reportTitle = 'Balance de Incidencias y Mantenimiento de Flota'
        headers = ['Nivel de Gravedad', 'Total Casos', 'Resueltos', 'En Revisión / Taller', targetCurrency === 'USD' ? 'Costo Estimado USD' : 'Costo Estimado COP']

        const filteredInc = rawIncidents.filter((inc) => {
          const matchDate = isDateInRange(inc.fechaCreacion, filters.fechaInicio, filters.fechaFin)
          const matchBranch = effectiveBranch === 'all' || normalize(inc.sucursal) === normalize(effectiveBranch)
          return matchDate && matchBranch
        })

        const gravMap = {
          alta: { label: 'Alta / Crítica', total: 0, resueltos: 0, pendientes: 0, costo: 0 },
          media: { label: 'Media / Moderada', total: 0, resueltos: 0, pendientes: 0, costo: 0 },
          baja: { label: 'Baja / Leve', total: 0, resueltos: 0, pendientes: 0, costo: 0 },
        }

        let totalCosto = 0
        let totalCasos = 0

        filteredInc.forEach((inc) => {
          const gKey = (inc.gravedad || 'media').toLowerCase()
          const target = gravMap[gKey] || gravMap.media
          target.total += 1
          totalCasos += 1
          const cost = Number(inc.costoEstimado || inc.costo || 0)
          target.costo += cost
          totalCosto += cost

          const st = String(inc.estado || '').toLowerCase()
          if (st === 'resuelto' || st === 'cerrado' || st === 'reparado') {
            target.resueltos += 1
          } else {
            target.pendientes += 1
          }
        })

        rows = Object.values(gravMap).map((g) => [
          g.label,
          g.total,
          g.resueltos,
          g.pendientes,
          formatMoney(g.costo),
        ])

        kpis = [
          { label: 'Total Incidencias', value: String(totalCasos) },
          { label: 'Costo Estimado Daños', value: formatMoney(totalCosto) },
          { label: 'Casos Resueltos', value: String(Object.values(gravMap).reduce((s, g) => s + g.resueltos, 0)) },
        ]
        break
      }

      // 5. REPORTE ESPECÍFICO DE RESERVAS
      case 'reservations': {
        reportTitle = 'Reporte Detallado de Reservas de Vehículos'
        headers = ['Código Reserva', 'Cliente', 'Vehículo', 'Sucursal Retiro', 'Fecha Inicio', 'Fecha Fin', 'Estado', targetCurrency === 'USD' ? 'Total USD' : 'Total COP']

        const filtered = rawReservations.filter((r) => {
          const matchDate = isDateInRange(r.fechaReserva || r.reservaDetalles?.fechaInicio, filters.fechaInicio, filters.fechaFin)
          const matchBranch = effectiveBranch === 'all' || normalize(r.reservaDetalles?.sucursalRetiro) === normalize(effectiveBranch)
          const matchState = !filters.estado || filters.estado === 'all' || normalize(r.estado) === normalize(filters.estado)
          const matchTerm = !filters.search || `${r.codigo || r.id} ${r.usuarioNombre || ''} ${r.vehiculoNombre || ''}`.toLowerCase().includes(filters.search.toLowerCase())
          return matchDate && matchBranch && matchState && matchTerm
        })

        const totalMonto = filtered.reduce((s, r) => s + (Number(r.total) || 0), 0)

        rows = filtered.map((r) => [
          r.codigo || `RES-${r.id}`,
          r.usuarioNombre || r.conductorPrincipal?.nombre || 'Cliente General',
          r.vehiculoNombre || `Vehículo #${r.vehiculoId}`,
          r.reservaDetalles?.sucursalRetiro || 'Sucursal Principal',
          r.reservaDetalles?.fechaInicio ? String(r.reservaDetalles.fechaInicio).slice(0, 10) : '',
          r.reservaDetalles?.fechaFin ? String(r.reservaDetalles.fechaFin).slice(0, 10) : '',
          String(r.estado || 'Confirmada').toUpperCase(),
          formatMoney(r.total || 0),
        ])

        kpis = [
          { label: 'Total Reservas', value: String(filtered.length) },
          { label: 'Monto Consolidado', value: formatMoney(totalMonto) },
          { label: 'Promedio Reserva', value: filtered.length > 0 ? formatMoney(totalMonto / filtered.length) : '$0' },
        ]
        break
      }

      // 6. REPORTE ESPECÍFICO DE VEHÍCULOS / FLOTA
      case 'vehicles': {
        reportTitle = 'Reporte Exhaustivo de Flota y Vehículos'
        headers = ['Placa', 'Marca y Modelo', 'Categoría', 'Sucursal', 'Transmisión', 'Combustible', 'Tarifa / Día', 'Disponibilidad']

        const filtered = rawVehicles.filter((v) => {
          const matchBranch = effectiveBranch === 'all' || normalize(v.sucursal) === normalize(effectiveBranch)
          const matchCat = !filters.categoria || filters.categoria === 'all' || normalize(v.categoria) === normalize(filters.categoria)
          const matchState = !filters.estado || filters.estado === 'all' || (filters.estado === 'disponible' ? v.disponible !== false : v.disponible === false)
          const matchTerm = !filters.search || `${v.placa} ${v.marca} ${v.modelo}`.toLowerCase().includes(filters.search.toLowerCase())
          return matchBranch && matchCat && matchState && matchTerm
        })

        const disponiblesCount = filtered.filter((v) => v.disponible !== false).length

        rows = filtered.map((v) => [
          v.placa || 'N/A',
          `${v.marca || ''} ${v.modelo || ''}`.trim() || 'Vehículo',
          v.categoria || 'Estándar',
          v.sucursal || 'Sin Asignar',
          v.transmision || 'Automática',
          v.combustible || 'Gasolina',
          formatMoney(v.precioPorDia || v.precio || 0),
          v.disponible !== false ? 'DISPONIBLE' : 'EN ALQUILER / TALLER',
        ])

        kpis = [
          { label: 'Total Vehículos', value: String(filtered.length) },
          { label: 'Disponibles', value: String(disponiblesCount) },
          { label: 'Ocupados / Taller', value: String(filtered.length - disponiblesCount) },
        ]
        break
      }

      // 7. REPORTE ESPECÍFICO DE CONTRATOS
      case 'contracts': {
        reportTitle = 'Reporte Detallado de Contratos de Alquiler'
        headers = ['No. Contrato', 'Cód. Reserva', 'Cliente', 'Documento', 'Vehículo', 'Sucursal', 'Vigencia', 'Estado', 'Monto Total']

        const filtered = rawContracts.filter((c) => {
          const matchDate = isDateInRange(c.fechaCreacion || c.fechaInicio, filters.fechaInicio, filters.fechaFin)
          const matchBranch = effectiveBranch === 'all' || normalize(c.sucursal) === normalize(effectiveBranch)
          const matchState = !filters.estado || filters.estado === 'all' || normalize(c.estado) === normalize(filters.estado)
          const matchTerm = !filters.search || `${c.contratoNumero} ${c.clienteNombre} ${c.clienteDocumento}`.toLowerCase().includes(filters.search.toLowerCase())
          return matchDate && matchBranch && matchState && matchTerm
        })

        const totalContratosMonto = filtered.reduce((s, c) => s + (Number(c.totalCOP) || 0), 0)

        rows = filtered.map((c) => [
          c.contratoNumero || `CTR-${c.id}`,
          c.reservaCodigo || 'N/A',
          c.clienteNombre || 'Cliente',
          c.clienteDocumento || 'N/A',
          `${c.vehiculoNombre || ''} (${c.vehiculoPlaca || ''})`,
          c.sucursal || 'Principal',
          `${c.fechaInicio ? String(c.fechaInicio).slice(0, 10) : ''} - ${c.fechaFin ? String(c.fechaFin).slice(0, 10) : ''}`,
          String(c.estado || 'Activo').toUpperCase(),
          formatMoney(c.totalCOP || 0),
        ])

        kpis = [
          { label: 'Contratos Listados', value: String(filtered.length) },
          { label: 'Valor Acumulado', value: formatMoney(totalContratosMonto) },
        ]
        break
      }

      // 8. REPORTE ESPECÍFICO DE INCIDENCIAS
      case 'incidents': {
        reportTitle = 'Reporte Pormenorizado de Incidencias y Daños'
        headers = ['Código', 'Fecha', 'Vehículo', 'Sucursal', 'Título / Novedad', 'Gravedad', 'Estado', 'Costo Estimado']

        const filtered = rawIncidents.filter((inc) => {
          const matchDate = isDateInRange(inc.fechaCreacion, filters.fechaInicio, filters.fechaFin)
          const matchBranch = effectiveBranch === 'all' || normalize(inc.sucursal) === normalize(effectiveBranch)
          const matchGrav = !filters.gravedad || filters.gravedad === 'all' || normalize(inc.gravedad) === normalize(filters.gravedad)
          const matchState = !filters.estado || filters.estado === 'all' || normalize(inc.estado) === normalize(filters.estado)
          const matchTerm = !filters.search || `${inc.codigo || inc.id} ${inc.vehiculoPlaca || ''} ${inc.titulo || ''}`.toLowerCase().includes(filters.search.toLowerCase())
          return matchDate && matchBranch && matchGrav && matchState && matchTerm
        })

        const totalCostoInc = filtered.reduce((s, inc) => s + (Number(inc.costoEstimado || inc.costo) || 0), 0)

        rows = filtered.map((inc) => [
          inc.codigo || `INC-${inc.id}`,
          inc.fechaCreacion ? String(inc.fechaCreacion).slice(0, 10) : '',
          `${inc.vehiculoPlaca || ''} ${inc.vehiculoModelo || ''}`,
          inc.sucursal || 'General',
          inc.titulo || inc.descripcion || 'Incidencia reportada',
          String(inc.gravedad || 'MEDIA').toUpperCase(),
          String(inc.estado || 'PENDIENTE').toUpperCase(),
          formatMoney(inc.costoEstimado || inc.costo || 0),
        ])

        kpis = [
          { label: 'Total Incidencias', value: String(filtered.length) },
          { label: 'Costo Estimado Total', value: formatMoney(totalCostoInc) },
        ]
        break
      }

      // 9. REPORTE ESPECÍFICO DE USUARIOS
      case 'users': {
        reportTitle = 'Directorio y Reporte de Clientes y Usuarios'
        headers = ['Nombre Completo', 'Correo Electrónico', 'Documento', 'Teléfono', 'Rol de Acceso', 'Estado Cuenta', 'Fecha Registro']

        const filtered = rawUsers.filter((u) => {
          const matchRol = !filters.rol || filters.rol === 'all' || normalize(u.rol) === normalize(filters.rol)
          const matchState = !filters.estado || filters.estado === 'all' || (filters.estado === 'bloqueado' ? u.bloqueado : !u.bloqueado)
          const matchTerm = !filters.search || `${u.nombre || ''} ${u.correo || ''} ${u.documento || ''}`.toLowerCase().includes(filters.search.toLowerCase())
          return matchRol && matchState && matchTerm
        })

        rows = filtered.map((u) => [
          u.nombre || u.name || 'Usuario',
          u.correo || u.email || 'N/A',
          u.documento || u.cedula || 'N/A',
          u.telefono || 'N/A',
          String(u.rol || 'Cliente').toUpperCase(),
          u.bloqueado ? 'BLOQUEADO' : 'ACTIVO',
          u.fechaRegistro ? String(u.fechaRegistro).slice(0, 10) : 'Preexistente',
        ])

        kpis = [
          { label: 'Usuarios Listados', value: String(filtered.length) },
          { label: 'Clientes Registrados', value: String(filtered.filter((u) => u.rol === 'usuario' || !u.rol).length) },
          { label: 'Cuentas Administrativas', value: String(filtered.filter((u) => u.rol === 'administrador' || u.rol === 'encargado_sucursal').length) },
        ]
        break
      }

      // 10. REPORTE ESPECÍFICO DE PROMOCIONES Y CUPONES
      case 'promotions': {
        reportTitle = 'Reporte de Promociones y Cupones de Descuento'
        headers = ['Código Cupón', 'Título de Campaña', 'Descuento', 'Válido Desde', 'Válido Hasta', 'Usos Máximos', 'Estado']

        const filtered = rawPromotions.filter((p) => {
          const matchState = !filters.estado || filters.estado === 'all' || (filters.estado === 'activa' ? p.activa : !p.activa)
          const matchTerm = !filters.search || `${p.codigo || ''} ${p.titulo || ''}`.toLowerCase().includes(filters.search.toLowerCase())
          return matchState && matchTerm
        })

        rows = filtered.map((p) => [
          p.codigo || 'PROMO',
          p.titulo || 'Campaña especial',
          `${p.descuento || 0}%`,
          p.fechaInicio ? String(p.fechaInicio).slice(0, 10) : 'Sin límite',
          p.fechaFin ? String(p.fechaFin).slice(0, 10) : 'Sin límite',
          p.limiteUsos || 'Ilimitado',
          p.activa !== false ? 'ACTIVA' : 'INACTIVA',
        ])

        kpis = [
          { label: 'Total Cupones', value: String(filtered.length) },
          { label: 'Campañas Activas', value: String(filtered.filter((p) => p.activa !== false).length) },
        ]
        break
      }

      default: {
        reportTitle = 'Reporte Administrativo Drivique'
        headers = ['ID', 'Descripción', 'Fecha', 'Estado']
        rows = [['001', 'Reporte general de prueba', new Date().toLocaleDateString(), 'COMPLETADO']]
        kpis = [{ label: 'Total Registros', value: '1' }]
      }
    }

    return {
      typeId,
      reportTitle,
      reportSubtitle,
      headers,
      rows,
      kpis,
      filtersSummary,
      totalRegistros: rows.length,
    }
  },

  /**
   * GENERAR, DESCARGAR Y GUARDAR EN HISTORIAL
   */
  generateReport({ typeId, filters = {}, format = REPORT_FORMATS.PDF, user = null, customTitle = '' }) {
    const config = this.getReportTypeById(typeId) || {
      id: typeId,
      titulo: customTitle || 'Reporte Administrativo',
      categoria: REPORT_CATEGORIES.GENERAL,
    }

    const reportData = this.buildReportData({ typeId, filters, user })
    const finalTitle = customTitle || reportData.reportTitle || config.titulo
    const now = new Date()
    const dateStamp = now.toISOString().slice(0, 10)
    const timeStamp = now.getTime().toString().slice(-4)
    const code = `REP-${dateStamp.replace(/-/g, '')}-${timeStamp}`
    const filename = `${config.id}-${dateStamp}-${timeStamp}`

    const userEmail = user?.correo || user?.email || 'admin@drivique.com'
    const userName = user?.nombre || user?.name || 'Administrador'
    const userRole = user?.rol || ROLES.ADMIN

    // 1. Ejecutar descarga física según el formato
    const exportPayload = {
      title: finalTitle,
      subtitle: reportData.reportSubtitle,
      headers: reportData.headers,
      rows: reportData.rows,
      kpis: reportData.kpis,
      filtersSummary: reportData.filtersSummary,
      filename,
      user,
    }

    if (format === REPORT_FORMATS.EXCEL) {
      exportExcel(exportPayload)
    } else if (format === REPORT_FORMATS.WORD) {
      exportWord(exportPayload)
    } else {
      // PDF
      exportPdf(exportPayload)
    }

    // 2. Estimar tamaño de archivo
    const roughBytes = JSON.stringify(exportPayload).length * 1.8 + 2048
    const estimatedSize = roughBytes > 1024 * 1024
      ? `${(roughBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.max(12, Math.round(roughBytes / 1024))} KB`

    // 3. Crear registro para historial con snapshot de datos
    const historyEntry = {
      id: `rep_${now.getTime()}_${Math.random().toString(36).slice(2, 6)}`,
      codigo: code,
      titulo: finalTitle,
      tipoId: config.id,
      tipoCategoria: config.categoria,
      formato: format,
      filtrosAplicados: { ...filters },
      filtersSummary: reportData.filtersSummary,
      totalRegistros: reportData.totalRegistros,
      fechaGeneracion: now.toISOString(),
      generadoPorNombre: userName,
      generadoPorCorreo: userEmail,
      generadoPorRol: userRole,
      tamanoEstimado: estimatedSize,
      snapshot: {
        title: finalTitle,
        subtitle: reportData.reportSubtitle,
        headers: reportData.headers,
        rows: reportData.rows,
        kpis: reportData.kpis,
        filtersSummary: reportData.filtersSummary,
        filename,
      },
    }

    // 4. Guardar en historial persistente
    const history = readHistory()
    writeHistory([historyEntry, ...history])

    // 5. Registrar en Auditoría
    const filtrosDesc = reportData.filtersSummary.map((f) => `${f.label}: ${f.value}`).join(', ') || 'Sin filtros específicos'
    accessAuditService.record({
      correo: userEmail,
      rol: userRole,
      resultado: 'exitoso',
      motivo: `Generó reporte administrativo [${finalTitle}] (${code}) en formato ${format}. Filtros: [${filtrosDesc}]. Total registros: ${reportData.totalRegistros}.`,
    })

    return historyEntry
  },

  /**
   * RE-DESCARGA DESDE HISTORIAL (SIN REGENERAR NI ALTERAR DATOS)
   */
  downloadFromHistory(reportId, user = null) {
    const history = readHistory()
    const entry = history.find((h) => h.id === reportId)
    if (!entry || !entry.snapshot) {
      throw new Error('Reporte no encontrado en el historial')
    }

    const { snapshot, formato, codigo, titulo } = entry
    const exportPayload = {
      ...snapshot,
      user,
    }

    if (formato === REPORT_FORMATS.EXCEL) {
      exportExcel(exportPayload)
    } else if (formato === REPORT_FORMATS.WORD) {
      exportWord(exportPayload)
    } else {
      exportPdf(exportPayload)
    }

    const userEmail = user?.correo || user?.email || 'admin@drivique.com'
    const userRole = user?.rol || ROLES.ADMIN

    // Registrar en auditoría la re-descarga
    accessAuditService.record({
      correo: userEmail,
      rol: userRole,
      resultado: 'exitoso',
      motivo: `Descargó desde el historial el reporte [${titulo}] (${codigo}) en formato ${formato}.`,
    })

    return entry
  },

  /**
   * IMPRIMIR REPORTE DIRECTAMENTE
   */
  printReport(reportData, user = null) {
    const exportPayload = {
      title: reportData.title || reportData.reportTitle || 'Reporte Drivique',
      subtitle: reportData.subtitle || reportData.reportSubtitle || 'Sistema Operativo de Gestión e Inspección de Alquiler de Vehículos',
      headers: reportData.headers || [],
      rows: reportData.rows || [],
      kpis: reportData.kpis || [],
      filtersSummary: reportData.filtersSummary || [],
      filename: 'impresion-reporte',
      user,
    }

    exportPdf(exportPayload)

    const userEmail = user?.correo || user?.email || 'admin@drivique.com'
    const userRole = user?.rol || ROLES.ADMIN

    accessAuditService.record({
      correo: userEmail,
      rol: userRole,
      resultado: 'exitoso',
      motivo: `Imprimió reporte administrativo [${exportPayload.title}].`,
    })
  },

  /**
   * ELIMINAR REPORTE DEL HISTORIAL
   */
  deleteReportFromHistory(reportId, user = null) {
    const history = readHistory()
    const entry = history.find((h) => h.id === reportId)
    const updated = history.filter((h) => h.id !== reportId)
    writeHistory(updated)

    if (entry) {
      const userEmail = user?.correo || user?.email || 'admin@drivique.com'
      const userRole = user?.rol || ROLES.ADMIN
      accessAuditService.record({
        correo: userEmail,
        rol: userRole,
        resultado: 'exitoso',
        motivo: `Eliminó del historial el reporte [${entry.titulo}] (${entry.codigo}).`,
      })
    }
    return updated
  },

  /**
   * LIMPIAR TODO EL HISTORIAL
   */
  clearHistory(user = null) {
    writeHistory([])
    const userEmail = user?.correo || user?.email || 'admin@drivique.com'
    const userRole = user?.rol || ROLES.ADMIN
    accessAuditService.record({
      correo: userEmail,
      rol: userRole,
      resultado: 'exitoso',
      motivo: `Vació por completo el historial de reportes administrativos generados.`,
    })
    return []
  },
}
