import { api } from './httpClient'
import { branchManagementService } from './branchManagementService'
import { exportPdf } from '../utils/listExportUtils'
import { formatCurrency } from '../utils/currencyUtils'


export const REPORT_CATEGORIES = {
  GENERAL: 'general',
  SPECIFIC: 'especifico',
}

export const REPORT_FORMATS = {
  WORD: 'WORD',
  PDF: 'PDF',
  EXCEL: 'EXCEL',
}

// Tipo de reporte de la pantalla -> tipo que calcula el servidor
const TIPO_SERVIDOR = {
  executive_summary: 'EXECUTIVE_SUMMARY',
  financial_consolidated: 'REVENUE_SUMMARY',
  fleet_occupancy: 'FLEET_OCCUPANCY',
  incidents_maintenance: 'INCIDENTS_MAINTENANCE',
  reservations: 'RESERVATIONS',
  vehicles: 'VEHICLES',
  contracts: 'CONTRACTS',
  incidents: 'INCIDENTS',
  users: 'USERS',
  promotions: 'PROMOTIONS',
  branches: 'BRANCHES',
}

// Valores de los filtros de la pantalla -> códigos del servidor (varios separados por coma)
const ESTADOS_SERVIDOR = {
  reservations: { confirmada: 'CONFIRMED', activa: 'IN_PROGRESS', completada: 'COMPLETED', cancelada: 'CANCELLED_BY_USER,CANCELLED_BY_TIMEOUT,REJECTED' },
  vehicles: { disponible: 'AVAILABLE', ocupado: 'RENTED,MAINTENANCE' },
  fleet_occupancy: { disponible: 'AVAILABLE', ocupado: 'RENTED,MAINTENANCE' },
  contracts: { firmado: 'ACTIVE', completado: 'FINALIZED', cancelado: 'CANCELLED' },
  incidents: { pendiente: 'OPEN', en_revision: 'IN_REVIEW', resuelto: 'RESOLVED,CLOSED' },
  incidents_maintenance: { pendiente: 'OPEN', en_revision: 'IN_REVIEW', resuelto: 'RESOLVED,CLOSED' },
  promotions: { activa: 'ACTIVE', inactiva: 'INACTIVE' },
}
const GRAVEDAD_SERVIDOR = { alta: 'HIGH,CRITICAL', media: 'MEDIUM', baja: 'LOW' }
const ROL_SERVIDOR = { usuario: 'CUSTOMER', administrador: 'ADMIN,SUPER_ADMIN', encargado_sucursal: 'BRANCH_ADMIN' }
const activo = (valor) => (valor && valor !== 'all' ? valor : undefined)

function filtrosParaServidor(typeId, filters = {}) {
  const sucursal = activo(filters.sucursal)
  const rama = sucursal
    ? branchManagementService.list().find((b) => b.id === sucursal || b.nombre === sucursal)
    : null
  const estado = activo(filters.estado)
  return {
    from: filters.fechaInicio || undefined,
    to: filters.fechaFin || undefined,
    branchId: rama?.id,
    status: typeId === 'users' ? undefined : (estado ? (ESTADOS_SERVIDOR[typeId]?.[estado] || undefined) : undefined),
    category: typeId === 'users' ? (estado ? ROL_SERVIDOR[estado] : undefined) : activo(filters.categoria),
    priority: activo(filters.gravedad) ? GRAVEDAD_SERVIDOR[filters.gravedad] : undefined,
    search: filters.search ? String(filters.search).trim() || undefined : undefined,
  }
}

function celda(valor, tipo, moneda, tasaUSD) {
  if (valor === null || valor === undefined || valor === '') return ''
  if (tipo === 'money') return formatCurrency(Number(valor), moneda, tasaUSD)
  if (tipo === 'percent') return `${valor}%`
  if (tipo === 'number') return Number(valor).toLocaleString('es-CO')
  if (tipo === 'date') {
    const fecha = new Date(valor)
    return Number.isNaN(fecha.getTime()) ? String(valor) : fecha.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
  }
  return String(valor)
}

function descargarArchivo(response, respaldo) {
  const disposicion = String(response.headers['content-disposition'] || '')
  const nombre = (/filename="?([^";]+)"?/i.exec(disposicion) || [])[1] || respaldo
  const url = URL.createObjectURL(response.data)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}

async function mensajeDeBlob(error) {
  // Con responseType blob el detalle del error llega como archivo
  try {
    const texto = await error.response.data.text()
    return JSON.parse(texto).detail
  } catch {
    return null
  }
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
    defaultColumns: ['Código Reserva', 'Cliente', 'Nombre Vehículo', 'Sucursal', 'Fecha Inicio', 'Fecha Fin', 'Estado', 'Total'],
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
    defaultColumns: ['Código Contrato', 'Código Reserva', 'Cliente', 'Documento', 'Nombre Vehículo', 'Sucursal', 'Vigencia', 'Estado', 'Monto'],
  },
  {
    id: 'incidents',
    categoria: REPORT_CATEGORIES.SPECIFIC,
    titulo: 'Reporte Específico de Incidencias',
    descripcion: 'Listado pormenorizado de reportes de novedades, choques o fallas mecánicas con fecha, vehículo involucrado, usuario y resolución.',
    icono: 'FaExclamationTriangle',
    filtrosSoportados: ['rangoFechas', 'sucursal', 'gravedad', 'estadoIncidencia', 'search'],
    defaultColumns: ['Código', 'Fecha', 'Nombre Vehículo', 'Sucursal', 'Tipo / Título', 'Gravedad', 'Estado', 'Costo Estimado'],
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
  {
    id: 'branches',
    categoria: REPORT_CATEGORIES.SPECIFIC,
    titulo: 'Reporte Específico de Sedes',
    descripcion: 'Vehículos, reservas, ingresos, incidencias y calificación de cada sucursal en el periodo seleccionado.',
    icono: 'FaBuilding',
    filtrosSoportados: ['rangoFechas', 'sucursal'],
    defaultColumns: ['Sucursal', 'Ciudad', 'Vehículos', 'Reservas', 'Ingresos', 'Incidencias', 'Calificación'],
  },
]

// Historial persistido en el servidor (la lista no trae los datos del reporte; se piden al abrirlo)
let historyCache = []

const CATEGORIA_POR_TIPO = Object.fromEntries(REPORT_TYPES_CONFIG.map((t) => [t.id, t.categoria]))

function fromApi(h) {
  const tipoId = String(h.typeCode || '').toLowerCase()
  return {
    id: h.id,
    codigo: h.code,
    titulo: h.title,
    tipoId,
    tipoCategoria: CATEGORIA_POR_TIPO[tipoId] || REPORT_CATEGORIES.GENERAL,
    formato: h.format,
    filtrosAplicados: h.filters?.applied || {},
    filtersSummary: h.filters?.summary || [],
    totalRegistros: h.totalRecords,
    fechaGeneracion: h.generatedAt,
    generadoPorNombre: h.generatedByName,
    generadoPorCorreo: h.generatedByEmail,
    generadoPorRol: h.generatedByRole,
    tamanoEstimado: h.filters?.size || '',
    snapshot: h.snapshot || null,
  }
}

const errorDe = (error) => new Error(error?.response?.data?.detail || error?.message || 'No fue posible completar la operación')




export const reportManagementService = {
  getReportTypes() {
    return REPORT_TYPES_CONFIG
  },

  getReportTypeById(id) {
    return REPORT_TYPES_CONFIG.find((t) => t.id === id) || null
  },

  getHistory({ search = '', categoria = 'all', formato = 'all', dateFilter = 'all' } = {}) {
    const all = historyCache
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
  /**
   * Vista previa del reporte: el servidor calcula las filas, los indicadores, el filtrado y la paginación.
   */
  async previewReport({ typeId, filters = {}, size = 25, page = 0 }) {
    const tipo = TIPO_SERVIDOR[typeId]
    if (!tipo) throw new Error('Tipo de reporte no disponible')
    const moneda = filters.moneda || 'COP'
    const tasaUSD = Number(filters.tasaUSD) || 4000
    let data
    try {
      const params = Object.fromEntries(Object.entries({ ...filtrosParaServidor(typeId, filters), page, size }).filter(([, v]) => v !== undefined))
      ;({ data } = await api.get(`/admin/reports/data/${tipo}`, { params }))
    } catch (error) {
      throw new Error(error?.response?.data?.detail || errorDe(error).message, { cause: error })
    }
    return {
      reportTitle: data.title,
      reportSubtitle: 'Sistema de gestión de alquiler de vehículos Drivique',
      headers: data.columns.map((c) => c.label),
      rows: data.rows.map((fila) => data.columns.map((c) => celda(fila[c.key], c.kind, moneda, tasaUSD))),
      kpis: data.summary.map((m) => ({ label: m.label, value: celda(m.value, m.kind, moneda, tasaUSD) })),
      filtersSummary: [],
      totalRegistros: data.totalElements,
      page: data.page,
      totalPages: data.totalPages,
    }
  },

  async getDashboard() {
    const { data } = await api.get('/admin/reports/dashboard')
    const maximo = Math.max(1, ...data.months.map((m) => m.value))
    let acumulado = 0
    const segmentosFlota = [
      { clave: 'alquilados', color: '#2563eb', valor: data.fleet.rented },
      { clave: 'disponibles', color: '#10b981', valor: data.fleet.available },
      { clave: 'mantenimiento', color: '#f59e0b', valor: data.fleet.maintenance },
    ].map((seg) => {
      const porcentaje = data.fleet.total > 0 ? (seg.valor / data.fleet.total) * 100 : 0
      const offset = (((25 - acumulado) % 100) + 100) % 100
      acumulado += porcentaje
      return { clave: seg.clave, color: seg.color, pct: Number(porcentaje.toFixed(2)), offset }
    })
    return {
      anio: data.year,
      ingresos: data.revenue,
      variacionMes: data.monthVariation,
      reservasFacturadas: data.billedReservations,
      tasaCompletadas: data.completionRate,
      ocupacion: data.occupancy,
      calificacion: data.rating,
      totalResenas: data.totalReviews,
      meses: data.months.map((m) => ({ label: m.label, valor: m.value, altura: Math.round((m.value / maximo) * 100) })),
      flota: {
        total: data.fleet.total,
        alquilados: data.fleet.rented,
        disponibles: data.fleet.available,
        mantenimiento: data.fleet.maintenance,
        pctAlquilados: data.fleet.rentedPct,
        pctDisponibles: data.fleet.availablePct,
        pctMantenimiento: data.fleet.maintenancePct,
      },
      segmentosFlota,
      pagos: { total: data.payments.total, pctWompi: data.payments.wompiPct, pctEfectivo: data.payments.cashPct },
      sucursales: data.branches.map((b) => ({
        id: b.id,
        sucursal: b.branch,
        ciudad: b.city,
        vehiculoTop: b.topVehicle,
        reservas: b.reservations,
        dias: b.days,
        ingresos: b.revenue,
        ocupacion: b.occupancy,
        incidencias: b.incidents,
        calificacion: b.rating,
        totalResenas: b.reviews,
      })),
    }
  },

  /** Recarga todo lo que alimenta los reportes desde el servidor (ya filtrado por el alcance del usuario). */
  async prepararDatos() {
    await Promise.all([branchManagementService.refresh(), this.refreshHistory()])
  },

  async refreshHistory() {
    const { data } = await api.get('/admin/reports/history')
    historyCache = (Array.isArray(data) ? data : []).map(fromApi)
    return historyCache
  },

  /** El servidor calcula el reporte, genera el archivo (PDF, Excel, CSV o Word), lo guarda en el historial y lo audita. */
  async generateReport({ typeId, filters = {}, format = REPORT_FORMATS.PDF, customTitle = '' }) {
    const config = this.getReportTypeById(typeId) || { id: typeId, titulo: customTitle || 'Reporte Administrativo' }
    const tipo = TIPO_SERVIDOR[typeId]
    if (!tipo) throw new Error('Tipo de reporte no disponible')
    const dateStamp = new Date().toISOString().slice(0, 10)
    let response
    try {
      response = await api.post('/admin/reports/export', { type: tipo, format, ...filtrosParaServidor(typeId, filters) }, { responseType: 'blob' })
    } catch (error) {
      throw new Error((await mensajeDeBlob(error)) || errorDe(error).message, { cause: error })
    }
    descargarArchivo(response, `${typeId}-${dateStamp}.${format === 'EXCEL' ? 'xlsx' : format === 'WORD' ? 'doc' : format.toLowerCase()}`)
    await this.refreshHistory()
    return {
      id: response.headers['x-report-id'],
      codigo: response.headers['x-report-code'],
      titulo: customTitle || config.titulo,
      formato: format,
    }
  },

  /** Detalle de un reporte del historial (incluye los datos guardados). */
  async getHistoryDetail(reportId) {
    try {
      const { data } = await api.get(`/admin/reports/history/${reportId}`)
      return fromApi(data)
    } catch (error) {
      throw errorDe(error)
    }
  },

  /**
   * RE-DESCARGA DESDE HISTORIAL (SIN REGENERAR NI ALTERAR DATOS)
   */
  async downloadFromHistory(reportId) {
    const entry = await this.getHistoryDetail(reportId)
    let response
    try {
      response = await api.get(`/admin/reports/history/${reportId}/download`, { responseType: 'blob' })
    } catch (error) {
      throw new Error((await mensajeDeBlob(error)) || errorDe(error).message, { cause: error })
    }
    descargarArchivo(response, `${entry.codigo || 'reporte'}.${entry.formato === 'EXCEL' ? 'xlsx' : entry.formato === 'WORD' ? 'doc' : String(entry.formato).toLowerCase()}`)
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
  },

  /**
   * ELIMINAR REPORTE DEL HISTORIAL
   */
  async deleteReportFromHistory(reportId) {
    try {
      await api.delete(`/admin/reports/history/${reportId}`)
    } catch (error) {
      throw errorDe(error)
    }
    return this.refreshHistory()
  },

  /**
   * LIMPIAR TODO EL HISTORIAL
   */
  async clearHistory() {
    try {
      await api.delete('/admin/reports/history')
    } catch (error) {
      throw errorDe(error)
    }
    return this.refreshHistory()
  },
}
