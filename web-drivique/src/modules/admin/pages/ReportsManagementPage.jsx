import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaChartPie,
  FaMoneyBillWave,
  FaCarSide,
  FaTools,
  FaClipboardList,
  FaCar,
  FaFileContract,
  FaExclamationTriangle,
  FaUsers,
  FaTags,
  FaFileWord,
  FaFilePdf,
  FaFileExcel,
  FaDownload,
  FaPrint,
  FaEye,
  FaTrash,
  FaSearch,
  FaCalendarAlt,
  FaBuilding,
  FaTimes,
  FaHistory,
  FaFileAlt,
  FaCheckCircle,
  FaSyncAlt,
  FaCheck,
  FaArrowRight,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { useBrand } from '../../../contexts/BrandContext'
import {
  reportManagementService,
  REPORT_CATEGORIES,
  REPORT_FORMATS,
} from '../../../services/reportManagementService'
import { branchManagementService } from '../../../services/branchManagementService'
import { showAlert } from '../../../utils/swalConfig'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './ReportsManagementPage.css'

const ICONS_MAP = {
  FaChartPie,
  FaMoneyBillWave,
  FaCarSide,
  FaTools,
  FaClipboardList,
  FaCar,
  FaFileContract,
  FaExclamationTriangle,
  FaUsers,
  FaTags,
}

const HEADER_KEY_MAP = {
  'Métrica / Indicador': 'metric_indicator',
  'Valor Actual': 'current_value',
  'Participación / Estado': 'share_status',
  'Observaciones': 'observations',
  'Sucursal / Concepto': 'branch_concept',
  'Reservas Facturadas': 'billed_reservations',
  'Ingresos Netos': 'net_revenue',
  'Ingresos Netos COP': 'net_revenue',
  'Ingresos Netos USD': 'net_revenue',
  'Ticket Promedio': 'average_ticket',
  'Participación %': 'share_percent',
  'Categoría / Tipo': 'category_type',
  'Total Unidades': 'total_units',
  'En Alquiler': 'rented_units',
  'Disponibles': 'available_units',
  'En Taller': 'maintenance_units',
  'Tasa Ocupación': 'occupancy_rate',
  'Gravedad / Categoría': 'severity_category',
  'Casos Reportados': 'reported_cases',
  'Resueltos': 'resolved_cases',
  'En Revisión': 'under_review_cases',
  'Costo Estimado COP': 'estimated_cost_cop',
  'Costo Estimado USD': 'estimated_cost',
  'Código': 'code',
  'Cliente': 'client',
  'Vehículo': 'vehicle',
  'Sucursal': 'branch',
  'Fecha Inicio': 'start_date',
  'Fecha Fin': 'end_date',
  'Estado': 'status',
  'Total': 'total',
  'Total COP': 'total',
  'Total USD': 'total',
  'Placa': 'plate',
  'Marca / Modelo': 'brand_model',
  'Categoría': 'category',
  'Transmisión': 'transmission',
  'Combustible': 'fuel',
  'Tarifa / Día': 'daily_rate',
  'Tarifa/Día': 'daily_rate',
  'No. Contrato': 'contract_number',
  'Reserva': 'reservation',
  'Documento': 'document',
  'Vigencia': 'validity',
  'Monto': 'amount',
  'Monto Total': 'amount',
  'Fecha': 'date',
  'Tipo / Título': 'type_title',
  'Gravedad': 'severity',
  'Costo Estimado': 'estimated_cost',
  'Nombre Completo': 'full_name',
  'Correo Electrónico': 'email',
  'Teléfono': 'phone',
  'Rol': 'role',
  'Registro': 'registration',
  'Código Cupón': 'coupon_code',
  'Título': 'title',
  'Descuento': 'discount',
  'Válido Desde': 'valid_from',
  'Válido Hasta': 'valid_until',
  'Usos Máx.': 'max_uses',
}

const KPI_KEY_MAP = {
  'Total Reservas': 'total_reservations',
  'Ingresos Estimados': 'estimated_revenue',
  'Tasa Ocupación Flota': 'fleet_occupancy_rate',
  'Tasa Ocupación': 'fleet_occupancy_rate',
  'Incidencias Activas': 'active_incidents',
  'Total Vehículos': 'total_vehicles',
  'Disponibles': 'available_vehicles',
  'Vehículos Disponibles': 'available_vehicles',
  'En Alquiler': 'rented_vehicles',
  'En Taller / Mant.': 'maintenance_vehicles',
  'En Taller': 'maintenance_units',
  'Ocupados / Taller': 'rented_or_workshop',
  'Total Incidencias': 'total_incidents',
  'Costo Acumulado': 'cumulative_cost',
  'Costo Estimado Daños': 'cumulative_cost',
  'Costo Estimado Total': 'cumulative_cost',
  'Total Contratos': 'total_contracts',
  'Monto Facturado': 'billed_amount',
  'Monto Consolidado': 'billed_amount',
  'Valor Acumulado': 'billed_amount',
  'Total Usuarios': 'total_users',
  'Usuarios Verificados': 'verified_users',
  'Promociones Activas': 'active_promotions',
  'Ingresos Totales': 'total_revenue',
  'Total Recaudado': 'total_revenue',
  'Ticket Promedio': 'average_ticket',
  'Promedio Reserva': 'average_ticket',
  'Mejor Sucursal': 'best_branch',
}

const FILTER_LABEL_MAP = {
  'Período': 'period',
  'Sucursal': 'branch',
  'Estado': 'status',
  'Gravedad': 'severity',
  'Rol': 'role',
  'Búsqueda': 'search',
  'Moneda': 'currency',
}

function translateHeader(headerStr, t) {
  if (!headerStr) return ''
  const key = HEADER_KEY_MAP[headerStr]
  return key ? t(`admin.reports.headers.${key}`, headerStr) : headerStr
}

function translateKpi(kpiLabel, t) {
  if (!kpiLabel) return ''
  const key = KPI_KEY_MAP[kpiLabel]
  return key ? t(`admin.reports.kpis.${key}`, kpiLabel) : kpiLabel
}

function translateFilterLabel(label, t) {
  if (!label) return ''
  const key = FILTER_LABEL_MAP[label]
  return key ? t(`admin.reports.filterLabels.${key}`, label) : label
}

function translateFilterValue(val) {
  if (typeof val !== 'string') return val
  return val.replace(/\s+al\s+/g, ' → ')
}

export default function ReportsManagementPage({ branchOnly = false }) {
  const { t, i18n } = useTranslation()
  const { tema, moneda, tasaUSD } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const { brand } = useBrand()
  const esModoOscuro = tema === 'oscuro'

  const esEncargado =
    branchOnly ||
    user?.rol === 'encargado' ||
    user?.rol === 'branch_manager' ||
    user?.rol === 'encargado_sucursal'
  const sucursalEncargado =
    user?.sucursalAsignada || user?.sucursalId || user?.sucursal || ''

  // Pestaña activa ('builder' | 'history')
  const [activeTab, setActiveTab] = useState('builder')

  // Catálogo de tipos de reportes
  const reportTypes = useMemo(() => reportManagementService.getReportTypes(), [])
  const [sucursales, setSucursales] = useState([])

  // Estado del Generador
  const [selectedCategory, setSelectedCategory] = useState(REPORT_CATEGORIES.GENERAL)
  const [selectedTypeId, setSelectedTypeId] = useState('executive_summary')
  const [selectedFormat, setSelectedFormat] = useState(REPORT_FORMATS.PDF)
  const [isGenerating, setIsGenerating] = useState(false)

  // Filtros del generador
  const [datePreset, setDatePreset] = useState('all')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [filterBranch, setFilterBranch] = useState(esEncargado ? sucursalEncargado : 'all')
  const [filterState, setFilterState] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterSearch, setFilterSearch] = useState('')

  // Estado del Historial
  const [history, setHistory] = useState([])
  const [historySearch, setHistorySearch] = useState('')
  const [historyCategory, setHistoryCategory] = useState('all')
  const [historyFormat, setHistoryFormat] = useState('all')
  const [historyDateFilter, setHistoryDateFilter] = useState('all')

  // Modal de Vista Previa y Detalle
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [modalReport, setModalReport] = useState(null)

  // Cargar sucursales e historial inicial
  useEffect(() => {
    setSucursales(branchManagementService.list())
    loadHistory()
  }, [])

  const loadHistory = () => {
    const list = reportManagementService.getHistory()
    setHistory(list)
  }

  // Manejador de fechas predefinidas
  const handleDatePreset = (preset) => {
    setDatePreset(preset)
    const now = new Date()
    const formatDate = (d) => d.toISOString().slice(0, 10)

    if (preset === 'today') {
      const todayStr = formatDate(now)
      setFilterStartDate(todayStr)
      setFilterEndDate(todayStr)
    } else if (preset === 'week') {
      const lastWeek = new Date(now)
      lastWeek.setDate(lastWeek.getDate() - 7)
      setFilterStartDate(formatDate(lastWeek))
      setFilterEndDate(formatDate(now))
    } else if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      setFilterStartDate(formatDate(firstDay))
      setFilterEndDate(formatDate(now))
    } else if (preset === 'year') {
      const firstYearDay = new Date(now.getFullYear(), 0, 1)
      setFilterStartDate(formatDate(firstYearDay))
      setFilterEndDate(formatDate(now))
    } else {
      setFilterStartDate('')
      setFilterEndDate('')
    }
  }

  // Filtrar tipos de reportes según categoría
  const availableTypes = useMemo(() => {
    return reportTypes.filter((t) => t.categoria === selectedCategory)
  }, [reportTypes, selectedCategory])

  // Cuando cambia de categoría, asegurar que el tipo seleccionado sea válido
  useEffect(() => {
    if (availableTypes.length > 0 && !availableTypes.some((t) => t.id === selectedTypeId)) {
      setSelectedTypeId(availableTypes[0].id)
    }
  }, [selectedCategory, availableTypes, selectedTypeId])

  const currentTypeConfig = useMemo(() => {
    return reportManagementService.getReportTypeById(selectedTypeId) || reportTypes[0]
  }, [reportTypes, selectedTypeId])

  // Generar vista previa en vivo
  const livePreviewData = useMemo(() => {
    const filters = {
      fechaInicio: filterStartDate,
      fechaFin: filterEndDate,
      sucursal: filterBranch,
      estado: filterState,
      categoria: filterCategory,
      gravedad: filterSeverity,
      search: filterSearch,
      moneda: moneda || 'COP',
      tasaUSD: tasaUSD || 4000,
    }
    return reportManagementService.buildReportData({
      typeId: selectedTypeId,
      filters,
      user,
    })
  }, [
    selectedTypeId,
    filterStartDate,
    filterEndDate,
    filterBranch,
    filterState,
    filterCategory,
    filterSeverity,
    filterSearch,
    moneda,
    tasaUSD,
    user,
  ])

  // Generar y descargar reporte
  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      const filters = {
        fechaInicio: filterStartDate,
        fechaFin: filterEndDate,
        sucursal: filterBranch,
        estado: filterState,
        categoria: filterCategory,
        gravedad: filterSeverity,
        search: filterSearch,
        moneda: moneda || 'COP',
        tasaUSD: tasaUSD || 4000,
      }

      const generated = reportManagementService.generateReport({
        typeId: selectedTypeId,
        filters,
        format: selectedFormat,
        user,
      })

      loadHistory()

      await showAlert({
        icon: 'success',
        title: t('admin.reports.successTitle', '¡Reporte Generado con Éxito!'),
        text: t('admin.reports.successMsg', {
          title: generated.titulo,
          format: generated.formato,
          code: generated.codigo,
          defaultValue: `El reporte "${generated.titulo}" ha sido generado en formato ${generated.formato} y guardado en el historial con el código ${generated.codigo}.`,
        }),
        confirmButtonText: t('admin.reports.understood', 'Entendido'),
      })
    } catch (error) {
      console.error('Error generando reporte:', error)
      showAlert({
        icon: 'error',
        title: t('admin.reports.errorTitle', 'Error al generar reporte'),
        text: error.message || t('admin.reports.errorGeneric', 'Ocurrió un error inesperado al procesar el archivo.'),
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Imprimir reporte actual
  const handlePrintCurrentReport = () => {
    try {
      reportManagementService.printReport(livePreviewData, user)
    } catch (error) {
      console.error('Error imprimiendo reporte:', error)
      showAlert({
        icon: 'error',
        title: t('admin.reports.errorPrint', 'Error al imprimir'),
        text: t('admin.reports.errorPrintMsg', 'Verifica que tu navegador permita ventanas emergentes para la impresión.'),
      })
    }
  }

  // Re-descargar desde el historial
  const handleDownloadFromHistory = (reportId) => {
    try {
      reportManagementService.downloadFromHistory(reportId, user)
    } catch (error) {
      console.error('Error descargando reporte de historial:', error)
      showAlert({
        icon: 'error',
        title: t('admin.reports.errorDownload', 'Error de descarga'),
        text: error.message || 'No se pudo descargar el reporte seleccionado.',
      })
    }
  }

  // Imprimir reporte desde el historial
  const handlePrintFromHistory = (report) => {
    if (!report.snapshot) return
    try {
      reportManagementService.printReport(report.snapshot, user)
    } catch (error) {
      console.error('Error imprimiendo desde historial:', error)
      showAlert({
        icon: 'error',
        title: t('admin.reports.errorPrint', 'Error al imprimir'),
        text: 'No se pudo abrir el diálogo de impresión.',
      })
    }
  }

  // Eliminar reporte del historial
  const handleDeleteFromHistory = async (report) => {
    const res = await showAlert({
      icon: 'question',
      title: t('admin.reports.confirmDeleteTitle', '¿Eliminar del historial?'),
      text: t('admin.reports.confirmDeleteMsg', {
        title: report.titulo,
        code: report.codigo,
        defaultValue: `¿Deseas eliminar el registro del reporte "${report.titulo}" (${report.codigo})? Esta acción quedará registrada en auditoría.`,
      }),
      showCancelButton: true,
      confirmButtonText: t('admin.reports.deleteBtn', 'Sí, eliminar'),
      cancelButtonText: t('admin.reports.cancelBtn', 'Cancelar'),
    })

    if (res.isConfirmed) {
      reportManagementService.deleteReportFromHistory(report.id, user)
      loadHistory()
      if (modalReport?.id === report.id) setModalReport(null)
    }
  }

  // Limpiar todo el historial
  const handleClearAllHistory = async () => {
    if (history.length === 0) return
    const res = await showAlert({
      icon: 'warning',
      title: t('admin.reports.clearAllTitle', '¿Vaciar historial completo?'),
      text: t('admin.reports.clearAllMsg', 'Se eliminarán todos los registros de reportes generados anteriormente. Esta acción quedará registrada en auditoría.'),
      showCancelButton: true,
      confirmButtonText: t('admin.reports.clearConfirmBtn', 'Sí, vaciar historial'),
      cancelButtonText: t('admin.reports.cancelBtn', 'Cancelar'),
    })

    if (res.isConfirmed) {
      reportManagementService.clearHistory(user)
      loadHistory()
    }
  }

  // Filtrado del historial para visualización
  const filteredHistory = useMemo(() => {
    return reportManagementService.getHistory({
      search: historySearch,
      categoria: historyCategory,
      formato: historyFormat,
      dateFilter: historyDateFilter,
    })
  }, [history, historySearch, historyCategory, historyFormat, historyDateFilter])

  // Estadísticas rápidas del historial
  const historyStats = useMemo(() => {
    const total = history.length
    const pdfCount = history.filter((h) => h.formato === REPORT_FORMATS.PDF).length
    const excelCount = history.filter((h) => h.formato === REPORT_FORMATS.EXCEL).length
    const wordCount = history.filter((h) => h.formato === REPORT_FORMATS.WORD).length
    const lastReport = history[0] || null
    return { total, pdfCount, excelCount, wordCount, lastReport }
  }, [history])

  return (
    <div className={`reports-page-wrapper management-shell ${esModoOscuro ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={branchOnly} />

      <main className="reports-main-content">
        {/* ENCABEZADO SUPERIOR */}
        <div className="reports-hero-header">
          <div className="reports-hero-title-group">
            <p className="management-eyebrow">
              {t('admin.reports.sectionEyebrow', 'CENTRO DE INTELIGENCIA Y REPORTES')}
            </p>
            <h1>{t('admin.reports.title', 'Reportes Administrativos')}</h1>
            <p className="reports-hero-subtitle">
              {esEncargado
                ? t('admin.reports.branchSubtitle', {
                    branch: sucursalEncargado,
                    defaultValue: `Generación de informes operativos, reservas y contratos para ${sucursalEncargado}.`,
                  })
                : t('admin.reports.mainSubtitle', 'Genera informes analíticos, consolidados financieros y reportes específicos en formatos Word, PDF y Excel con respaldo automático en historial y trazabilidad.')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MenuConfiguracion />
          </div>
        </div>

        {/* SELECTOR DE PESTAÑAS TIPO SEGMENTED CONTROL */}
        <div className="reports-tabs-pill-container">
          <button
            type="button"
            className={`reports-tab-pill-btn ${activeTab === 'builder' ? 'active' : ''}`}
            onClick={() => setActiveTab('builder')}
          >
            <FaFileAlt />
            <span>{t('admin.reports.tabBuilder', 'Generador de Reportes')}</span>
          </button>

          <button
            type="button"
            className={`reports-tab-pill-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <FaHistory />
            <span>{t('admin.reports.tabHistory', 'Historial de Reportes')}</span>
            <span className="reports-tab-counter-badge">{history.length}</span>
          </button>
        </div>

        {/* =========================================================
            PESTAÑA 1: GENERADOR DE REPORTES (DISEÑO ESPACIOSO)
           ========================================================= */}
        {activeTab === 'builder' && (
          <div className="reports-builder-flow">
            {/* PASO 1: SELECCIÓN DEL REPORTE */}
            <div className="builder-section-card">
              <div className="builder-section-header">
                <div className="builder-step-indicator">
                  <div className="step-circle-badge">1</div>
                  <div>
                    <h3 className="step-title-text">{t('admin.reports.step1Title', 'Selecciona el Tipo de Reporte')}</h3>
                    <p className="step-subtitle-text">{t('admin.reports.step1Subtitle', 'Elige la plantilla analítica o el reporte específico que deseas generar')}</p>
                  </div>
                </div>

                <div className="category-switcher-bar">
                  <button
                    type="button"
                    className={`category-switch-btn ${selectedCategory === REPORT_CATEGORIES.GENERAL ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(REPORT_CATEGORIES.GENERAL)}
                  >
                    {t('admin.reports.catGeneral', 'Reportes Generales')}
                  </button>
                  <button
                    type="button"
                    className={`category-switch-btn ${selectedCategory === REPORT_CATEGORIES.SPECIFIC ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(REPORT_CATEGORIES.SPECIFIC)}
                  >
                    {t('admin.reports.catSpecific', 'Reportes Específicos')}
                  </button>
                </div>
              </div>

              <div className="reports-type-grid">
                {availableTypes.map((type) => {
                  const IconComp = ICONS_MAP[type.icono] || FaChartPie
                  const isSelected = selectedTypeId === type.id
                  return (
                    <div
                      key={type.id}
                      className={`report-type-card-modern ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedTypeId(type.id)}
                    >
                      <div className="card-top-content">
                        <div className="card-icon-bubble">
                          <IconComp />
                        </div>
                        <div className="card-text-group">
                          <h4>{t(`admin.reports.types.${type.id}_title`, type.titulo)}</h4>
                          <p>{t(`admin.reports.types.${type.id}_desc`, type.descripcion)}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="card-selected-tag">
                          <FaCheck /> <span>{t('admin.reports.selected', 'Seleccionado')}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* PASO 2: PARÁMETROS Y FILTROS */}
            <div className="builder-section-card">
              <div className="builder-section-header">
                <div className="builder-step-indicator">
                  <div className="step-circle-badge">2</div>
                  <div>
                    <h3 className="step-title-text">{t('admin.reports.step2Title', 'Parámetros y Filtros de Búsqueda')}</h3>
                    <p className="step-subtitle-text">{t('admin.reports.step2Subtitle', 'Ajusta el período, sucursal y criterios para filtrar los datos a incluir')}</p>
                  </div>
                </div>
              </div>

              <div className="filters-grid-container">
                {/* Rango de Fechas Elegante y Moderno */}
                {currentTypeConfig.filtrosSoportados.includes('rangoFechas') && (
                  <div className="date-filter-full-width">
                    <div className="date-filter-header-row">
                      <div className="date-filter-title-info">
                        <div className="date-icon-box">
                          <FaCalendarAlt />
                        </div>
                        <div>
                          <h4>{t('admin.reports.dateRangeLabel', 'Período del Reporte')}</h4>
                          <p>{t('admin.reports.dateRangeDesc', 'Filtra por períodos predefinidos o ingresa un rango personalizado')}</p>
                        </div>
                      </div>

                      <div className="date-presets-segmented-bar">
                        <button
                          type="button"
                          className={`date-preset-pill ${datePreset === 'all' ? 'active' : ''}`}
                          onClick={() => handleDatePreset('all')}
                        >
                          {t('admin.reports.presetAll', 'Todo')}
                        </button>
                        <button
                          type="button"
                          className={`date-preset-pill ${datePreset === 'today' ? 'active' : ''}`}
                          onClick={() => handleDatePreset('today')}
                        >
                          {t('admin.reports.presetToday', 'Hoy')}
                        </button>
                        <button
                          type="button"
                          className={`date-preset-pill ${datePreset === 'week' ? 'active' : ''}`}
                          onClick={() => handleDatePreset('week')}
                        >
                          {t('admin.reports.presetWeek', '7 Días')}
                        </button>
                        <button
                          type="button"
                          className={`date-preset-pill ${datePreset === 'month' ? 'active' : ''}`}
                          onClick={() => handleDatePreset('month')}
                        >
                          {t('admin.reports.presetMonth', 'Este Mes')}
                        </button>
                        <button
                          type="button"
                          className={`date-preset-pill ${datePreset === 'year' ? 'active' : ''}`}
                          onClick={() => handleDatePreset('year')}
                        >
                          {t('admin.reports.presetYear', 'Este Año')}
                        </button>
                      </div>
                    </div>

                    <div className="date-range-picker-row">
                      <div className="date-picker-card">
                        <label className="date-picker-label">
                          <FaCalendarAlt />
                          <span>{t('admin.reports.startDateLabel', 'Fecha Desde')}</span>
                        </label>
                        <input
                          type="date"
                          className="date-styled-input"
                          value={filterStartDate}
                          onChange={(e) => {
                            setDatePreset('custom')
                            setFilterStartDate(e.target.value)
                          }}
                        />
                      </div>

                      <div className="date-range-divider">
                        <FaArrowRight />
                      </div>

                      <div className="date-picker-card">
                        <label className="date-picker-label">
                          <FaCalendarAlt />
                          <span>{t('admin.reports.endDateLabel', 'Fecha Hasta')}</span>
                        </label>
                        <input
                          type="date"
                          className="date-styled-input"
                          value={filterEndDate}
                          onChange={(e) => {
                            setDatePreset('custom')
                            setFilterEndDate(e.target.value)
                          }}
                        />
                      </div>

                      <div className="date-range-summary-badge">
                        <span className="badge-dot" />
                        <span>
                          {filterStartDate || filterEndDate
                            ? `${filterStartDate || 'Inicio'} → ${filterEndDate || 'Hoy'}`
                            : t('admin.reports.allHistory', 'Todo el histórico')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sucursal */}
                {currentTypeConfig.filtrosSoportados.includes('sucursal') && !esEncargado && (
                  <div className="filter-input-card">
                    <label>
                      <FaBuilding style={{ color: 'var(--brand-primary)' }} />
                      {t('admin.reports.branchLabel', 'Sucursal')}
                    </label>
                    <select
                      value={filterBranch}
                      onChange={(e) => setFilterBranch(e.target.value)}
                    >
                      <option value="all">{t('admin.reports.allBranches', 'Todas las Sucursales')}</option>
                      {sucursales.map((s) => (
                        <option key={s.id || s.nombre} value={s.nombre}>
                          {s.nombre} ({s.ciudad || 'Colombia'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Estado dinámico */}
                {(currentTypeConfig.filtrosSoportados.includes('estadoReserva') ||
                  currentTypeConfig.filtrosSoportados.includes('estadoContrato') ||
                  currentTypeConfig.filtrosSoportados.includes('estadoVehiculo') ||
                  currentTypeConfig.filtrosSoportados.includes('estadoIncidencia') ||
                  currentTypeConfig.filtrosSoportados.includes('estadoPromo')) && (
                  <div className="filter-input-card">
                    <label>{t('admin.reports.stateLabel', 'Estado Operativo')}</label>
                    <select
                      value={filterState}
                      onChange={(e) => setFilterState(e.target.value)}
                    >
                      <option value="all">{t('admin.reports.allStates', 'Todos los Estados')}</option>
                      {currentTypeConfig.id === 'reservations' && (
                        <>
                          <option value="confirmada">{t('admin.reports.stateConfirmed', 'Confirmada')}</option>
                          <option value="activa">{t('admin.reports.stateActive', 'En Curso / Activa')}</option>
                          <option value="completada">{t('admin.reports.stateCompleted', 'Completada / Finalizada')}</option>
                          <option value="cancelada">{t('admin.reports.stateCancelled', 'Cancelada')}</option>
                        </>
                      )}
                      {currentTypeConfig.id === 'vehicles' && (
                        <>
                          <option value="disponible">{t('admin.reports.stateAvailable', 'Disponible')}</option>
                          <option value="ocupado">{t('admin.reports.stateOccupied', 'En Alquiler / Mantenimiento')}</option>
                        </>
                      )}
                      {currentTypeConfig.id === 'contracts' && (
                        <>
                          <option value="firmado">{t('admin.reports.stateSigned', 'Firmado / Activo')}</option>
                          <option value="completado">{t('admin.reports.stateCompleted', 'Finalizado')}</option>
                          <option value="cancelado">{t('admin.reports.stateCancelled', 'Cancelado')}</option>
                        </>
                      )}
                      {currentTypeConfig.id === 'incidents' && (
                        <>
                          <option value="pendiente">{t('admin.reports.statePending', 'Pendiente')}</option>
                          <option value="en_revision">{t('admin.reports.stateInReview', 'En Revisión')}</option>
                          <option value="resuelto">{t('admin.reports.stateResolved', 'Resuelto')}</option>
                        </>
                      )}
                      {currentTypeConfig.id === 'promotions' && (
                        <>
                          <option value="activa">{t('admin.reports.statePromoActive', 'Activa')}</option>
                          <option value="inactiva">{t('admin.reports.statePromoInactive', 'Inactiva')}</option>
                        </>
                      )}
                    </select>
                  </div>
                )}

                {/* Gravedad (Incidencias) */}
                {currentTypeConfig.filtrosSoportados.includes('gravedad') && (
                  <div className="filter-input-card">
                    <label>{t('admin.reports.severityLabel', 'Nivel de Gravedad')}</label>
                    <select
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                    >
                      <option value="all">{t('admin.reports.allSeverities', 'Todas las Gravedades')}</option>
                      <option value="alta">{t('admin.reports.severityHigh', 'Alta / Crítica')}</option>
                      <option value="media">{t('admin.reports.severityMedium', 'Media / Moderada')}</option>
                      <option value="baja">{t('admin.reports.severityLow', 'Baja / Leve')}</option>
                    </select>
                  </div>
                )}

                {/* Rol de usuario */}
                {currentTypeConfig.filtrosSoportados.includes('rol') && (
                  <div className="filter-input-card">
                    <label>{t('admin.reports.roleLabel', 'Rol de Usuario')}</label>
                    <select
                      value={filterState}
                      onChange={(e) => setFilterState(e.target.value)}
                    >
                      <option value="all">{t('admin.reports.allRoles', 'Todos los Roles')}</option>
                      <option value="usuario">{t('admin.reports.roleCustomer', 'Clientes / Usuarios')}</option>
                      <option value="administrador">{t('admin.reports.roleAdmin', 'Administradores')}</option>
                      <option value="encargado_sucursal">{t('admin.reports.roleManager', 'Encargados de Sucursal')}</option>
                    </select>
                  </div>
                )}

                {/* Búsqueda por texto */}
                {currentTypeConfig.filtrosSoportados.includes('search') && (
                  <div className="filter-input-card">
                    <label>{t('admin.reports.textSearchLabel', 'Búsqueda por Texto')}</label>
                    <input
                      type="text"
                      placeholder={t('admin.reports.searchPlaceholder', 'Buscar cliente, placa, código...')}
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* PASO 3: FORMATO DE EXPORTACIÓN Y ACCIONES */}
            <div className="builder-section-card">
              <div className="builder-section-header">
                <div className="builder-step-indicator">
                  <div className="step-circle-badge">3</div>
                  <div>
                    <h3 className="step-title-text">{t('admin.reports.step3Title', 'Selecciona el Formato de Salida y Genera')}</h3>
                    <p className="step-subtitle-text">{t('admin.reports.step3Subtitle', 'Elige el formato de documento deseado y descarga inmediatamente tu reporte')}</p>
                  </div>
                </div>
              </div>

              <div className="format-and-actions-wrapper">
                <div className="formats-row-selector">
                  <div
                    className={`format-selection-card word ${selectedFormat === REPORT_FORMATS.WORD ? 'active' : ''}`}
                    onClick={() => setSelectedFormat(REPORT_FORMATS.WORD)}
                  >
                    <div className="format-icon-box">
                      <FaFileWord />
                    </div>
                    <div className="format-info-group">
                      <strong>{t('admin.reports.formatWordTitle', 'Microsoft Word')}</strong>
                      <span>{t('admin.reports.formatWordDesc', 'Documento formal (.doc)')}</span>
                    </div>
                  </div>

                  <div
                    className={`format-selection-card pdf ${selectedFormat === REPORT_FORMATS.PDF ? 'active' : ''}`}
                    onClick={() => setSelectedFormat(REPORT_FORMATS.PDF)}
                  >
                    <div className="format-icon-box">
                      <FaFilePdf />
                    </div>
                    <div className="format-info-group">
                      <strong>{t('admin.reports.formatPdfTitle', 'Documento PDF')}</strong>
                      <span>{t('admin.reports.formatPdfDesc', 'Imprimible estilizado (.pdf)')}</span>
                    </div>
                  </div>

                  <div
                    className={`format-selection-card excel ${selectedFormat === REPORT_FORMATS.EXCEL ? 'active' : ''}`}
                    onClick={() => setSelectedFormat(REPORT_FORMATS.EXCEL)}
                  >
                    <div className="format-icon-box">
                      <FaFileExcel />
                    </div>
                    <div className="format-info-group">
                      <strong>{t('admin.reports.formatExcelTitle', 'Microsoft Excel')}</strong>
                      <span>{t('admin.reports.formatExcelDesc', 'Hoja de cálculo (.xls)')}</span>
                    </div>
                  </div>
                </div>

                <div className="actions-launch-bar">
                  <div className="launch-bar-info">
                    <FaCheckCircle style={{ color: '#15803d' }} />
                    <span>
                      {t('admin.reports.readyToExport', {
                        count: livePreviewData.totalRegistros,
                        format: selectedFormat,
                        defaultValue: `Listo para exportar ${livePreviewData.totalRegistros} registros en formato ${selectedFormat}`,
                      })}
                    </span>
                  </div>

                  <div className="launch-bar-buttons">
                    <div className="launch-bar-secondary-actions">
                      <button
                        type="button"
                        className="btn-print-hero btn-preview"
                        onClick={() => setShowPreviewModal(true)}
                      >
                        <FaEye /> {t('admin.reports.viewPreviewBtn', 'Ver Vista Previa')}
                      </button>

                      <button
                        type="button"
                        className="btn-print-hero btn-print"
                        onClick={handlePrintCurrentReport}
                      >
                        <FaPrint /> {t('admin.reports.printCurrentBtn', 'Imprimir')}
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn-generate-hero"
                      onClick={handleGenerateReport}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <FaSyncAlt className="fa-spin" /> {t('admin.reports.generating', 'Generando Reporte...')}
                        </>
                      ) : (
                        <>
                          <FaDownload /> {t('admin.reports.generateBtn', 'Generar y Descargar Reporte')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            PESTAÑA 2: HISTORIAL DE REPORTES
           ========================================================= */}
        {activeTab === 'history' && (
          <div>
            {/* STATS DEL HISTORIAL */}
            <div className="history-kpis-bar">
              <div className="history-kpi-card">
                <div className="history-kpi-icon total">
                  <FaHistory />
                </div>
                <div className="history-kpi-details">
                  <span>{t('admin.reports.statTotal', 'Total Generados')}</span>
                  <strong>{historyStats.total}</strong>
                </div>
              </div>

              <div className="history-kpi-card">
                <div className="history-kpi-icon pdf">
                  <FaFilePdf />
                </div>
                <div className="history-kpi-details">
                  <span>{t('admin.reports.statPdf', 'Reportes PDF')}</span>
                  <strong>{historyStats.pdfCount}</strong>
                </div>
              </div>

              <div className="history-kpi-card">
                <div className="history-kpi-icon excel">
                  <FaFileExcel />
                </div>
                <div className="history-kpi-details">
                  <span>{t('admin.reports.statExcel', 'Reportes Excel')}</span>
                  <strong>{historyStats.excelCount}</strong>
                </div>
              </div>

              <div className="history-kpi-card">
                <div className="history-kpi-icon word">
                  <FaFileWord />
                </div>
                <div className="history-kpi-details">
                  <span>{t('admin.reports.statWord', 'Reportes Word')}</span>
                  <strong>{historyStats.wordCount}</strong>
                </div>
              </div>
            </div>

            {/* BARRA DE BÚSQUEDA Y FILTROS */}
            <div className="history-control-toolbar">
              <div className="history-search-box">
                <FaSearch />
                <input
                  type="text"
                  className="history-search-input-field"
                  placeholder={t('admin.reports.searchHistoryPlaceholder', 'Buscar en el historial por código, título, usuario o filtro...')}
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                />
              </div>

              <div className="history-select-group">
                <select
                  value={historyCategory}
                  onChange={(e) => setHistoryCategory(e.target.value)}
                >
                  <option value="all">{t('admin.reports.allCategories', 'Todas las categorías')}</option>
                  <option value={REPORT_CATEGORIES.GENERAL}>{t('admin.reports.catGeneral', 'Generales')}</option>
                  <option value={REPORT_CATEGORIES.SPECIFIC}>{t('admin.reports.catSpecific', 'Específicos')}</option>
                </select>

                <select
                  value={historyFormat}
                  onChange={(e) => setHistoryFormat(e.target.value)}
                >
                  <option value="all">{t('admin.reports.allFormats', 'Todos los formatos')}</option>
                  <option value={REPORT_FORMATS.WORD}>Word (.doc)</option>
                  <option value={REPORT_FORMATS.PDF}>PDF (.pdf)</option>
                  <option value={REPORT_FORMATS.EXCEL}>Excel (.xls)</option>
                </select>

                <select
                  value={historyDateFilter}
                  onChange={(e) => setHistoryDateFilter(e.target.value)}
                >
                  <option value="all">{t('admin.reports.allDates', 'Cualquier fecha')}</option>
                  <option value="today">{t('admin.reports.today', 'Hoy')}</option>
                  <option value="week">{t('admin.reports.lastWeek', 'Últimos 7 días')}</option>
                  <option value="month">{t('admin.reports.thisMonth', 'Este mes')}</option>
                </select>

                {history.length > 0 && (
                  <button
                    type="button"
                    className="btn-print-hero"
                    style={{ height: 44, color: '#e11d48', borderColor: '#fecdd3' }}
                    onClick={handleClearAllHistory}
                  >
                    <FaTrash /> {t('admin.reports.clearHistoryBtn', 'Vaciar')}
                  </button>
                )}
              </div>
            </div>

            {/* TABLA DEL HISTORIAL (ESCRITORIO & TABLET) */}
            <div className="history-desktop-table-container">
              <div className="builder-section-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-frame-responsive" style={{ maxHeight: 600, border: 'none' }}>
                  <table className="reports-data-table">
                    <thead>
                      <tr>
                        <th>{t('admin.reports.thCode', 'Código / ID')}</th>
                        <th>{t('admin.reports.thTitle', 'Título del Reporte')}</th>
                        <th>{t('admin.reports.thCategory', 'Categoría')}</th>
                        <th>{t('admin.reports.thFormat', 'Formato')}</th>
                        <th>{t('admin.reports.thGeneratedBy', 'Generado Por')}</th>
                        <th>{t('admin.reports.thDate', 'Fecha y Hora')}</th>
                        <th>{t('admin.reports.thRows', 'Registros / Tamaño')}</th>
                        <th style={{ textAlign: 'center' }}>{t('admin.reports.thActions', 'Acciones')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan={8}>
                            <div className="reports-empty-state">
                              <FaHistory />
                              <h3>{t('admin.reports.emptyHistoryTitle', 'No se encontraron reportes')}</h3>
                              <p>{t('admin.reports.emptyHistorySubtitle', 'Aún no has generado reportes que coincidan con los filtros de búsqueda.')}</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map((report) => (
                          <tr key={report.id}>
                            <td>
                              <strong style={{ color: 'var(--brand-primary)', fontFamily: 'monospace' }}>
                                {report.codigo}
                              </strong>
                            </td>
                            <td>
                              <strong style={{ fontSize: 13.5 }}>
                                {t(`admin.reports.types.${report.tipoId}_title`, report.titulo)}
                              </strong>
                              {report.filtersSummary && report.filtersSummary.length > 0 && (
                                <div style={{ fontSize: 11, color: 'var(--adm-muted)', marginTop: 3 }}>
                                  {report.filtersSummary
                                    .map((f) => `${translateFilterLabel(f.label, t)}: ${translateFilterValue(f.value)}`)
                                    .join(' • ')}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className={`category-pill-tag ${report.tipoCategoria}`}>
                                {report.tipoCategoria === REPORT_CATEGORIES.GENERAL
                                  ? t('admin.reports.catGeneralTag', 'General')
                                  : t('admin.reports.catSpecificTag', 'Específico')}
                              </span>
                            </td>
                            <td>
                              <span className={`format-pill-tag ${report.formato}`}>
                                {report.formato === REPORT_FORMATS.WORD && <FaFileWord />}
                                {report.formato === REPORT_FORMATS.PDF && <FaFilePdf />}
                                {report.formato === REPORT_FORMATS.EXCEL && <FaFileExcel />}
                                {report.formato}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 650 }}>
                                {report.generadoPorRol === 'admin' || report.generadoPorNombre === 'Administrador'
                                  ? t('admin.reports.roleAdminSingle', 'Administrador')
                                  : report.generadoPorRol === 'encargado_sucursal' ||
                                    report.generadoPorRol === 'encargado' ||
                                    report.generadoPorNombre === 'Encargado de Sucursal'
                                  ? t('admin.reports.roleManagerSingle', 'Encargado de Sucursal')
                                  : report.generadoPorNombre}
                              </div>
                              <small style={{ color: 'var(--adm-muted)' }}>{report.generadoPorCorreo}</small>
                            </td>
                            <td>
                              <div>{new Date(report.fechaGeneracion).toLocaleDateString(i18n.language || undefined)}</div>
                              <small style={{ color: 'var(--adm-muted)' }}>
                                {new Date(report.fechaGeneracion).toLocaleTimeString(i18n.language || undefined, {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </small>
                            </td>
                            <td>
                              <strong>
                                {report.totalRegistros} {t('admin.reports.records', 'reg.')}
                              </strong>
                              <small style={{ display: 'block', color: 'var(--adm-muted)' }}>
                                {report.tamanoEstimado}
                              </small>
                            </td>
                            <td>
                              <div className="history-table-row-actions">
                                <button
                                  type="button"
                                  className="btn-history-action download"
                                  title={t('admin.reports.downloadAgain', 'Descargar de nuevo sin regenerar')}
                                  onClick={() => handleDownloadFromHistory(report.id)}
                                >
                                  <FaDownload />
                                </button>

                                <button
                                  type="button"
                                  className="btn-history-action print"
                                  title={t('admin.reports.printReport', 'Imprimir reporte')}
                                  onClick={() => handlePrintFromHistory(report)}
                                >
                                  <FaPrint />
                                </button>

                                <button
                                  type="button"
                                  className="btn-history-action details"
                                  title={t('admin.reports.viewDetails', 'Ver detalle y snapshot')}
                                  onClick={() => setModalReport(report)}
                                >
                                  <FaEye />
                                </button>

                                <button
                                  type="button"
                                  className="btn-history-action delete"
                                  title={t('admin.reports.deleteReport', 'Eliminar del historial')}
                                  onClick={() => handleDeleteFromHistory(report)}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* VISTA MÓVIL EN TARJETAS (SOLO PANTALLAS PEQUEÑAS) */}
            <div className="history-mobile-cards-container">
              {filteredHistory.length === 0 ? (
                <div className="reports-empty-state">
                  <FaHistory />
                  <h3>{t('admin.reports.emptyHistoryTitle', 'No se encontraron reportes')}</h3>
                  <p>{t('admin.reports.emptyHistorySubtitle', 'Aún no has generado reportes que coincidan con los filtros de búsqueda.')}</p>
                </div>
              ) : (
                filteredHistory.map((report) => (
                  <div key={report.id} className="history-mobile-card">
                    <div className="hm-card-header">
                      <span className="hm-code-badge">{report.codigo}</span>
                      <span className={`format-pill-tag ${report.formato}`}>
                        {report.formato === REPORT_FORMATS.WORD && <FaFileWord />}
                        {report.formato === REPORT_FORMATS.PDF && <FaFilePdf />}
                        {report.formato === REPORT_FORMATS.EXCEL && <FaFileExcel />}
                        {report.formato}
                      </span>
                    </div>

                    <div className="hm-card-title-row">
                      <h4>{t(`admin.reports.types.${report.tipoId}_title`, report.titulo)}</h4>
                      <span className={`category-pill-tag ${report.tipoCategoria}`}>
                        {report.tipoCategoria === REPORT_CATEGORIES.GENERAL
                          ? t('admin.reports.catGeneralTag', 'General')
                          : t('admin.reports.catSpecificTag', 'Específico')}
                      </span>
                    </div>

                    {report.filtersSummary && report.filtersSummary.length > 0 && (
                      <div className="hm-card-filters">
                        {report.filtersSummary.map((f, i) => (
                          <span key={i} className="hm-filter-pill">
                            <strong>{translateFilterLabel(f.label, t)}:</strong> {translateFilterValue(f.value)}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="hm-card-meta-grid">
                      <div className="hm-meta-item">
                        <small>{t('admin.reports.thGeneratedBy', 'Generado por')}</small>
                        <span>
                          {report.generadoPorRol === 'admin' || report.generadoPorNombre === 'Administrador'
                            ? t('admin.reports.roleAdminSingle', 'Administrador')
                            : report.generadoPorRol === 'encargado_sucursal' ||
                              report.generadoPorRol === 'encargado' ||
                              report.generadoPorNombre === 'Encargado de Sucursal'
                            ? t('admin.reports.roleManagerSingle', 'Encargado de Sucursal')
                            : report.generadoPorNombre}
                        </span>
                      </div>
                      <div className="hm-meta-item">
                        <small>{t('admin.reports.thDate', 'Fecha y Hora')}</small>
                        <span>
                          {new Date(report.fechaGeneracion).toLocaleDateString(i18n.language || undefined)}{' '}
                          {new Date(report.fechaGeneracion).toLocaleTimeString(i18n.language || undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="hm-meta-item">
                        <small>{t('admin.reports.thRows', 'Registros / Tamaño')}</small>
                        <span>
                          <strong>{report.totalRegistros} {t('admin.reports.records', 'reg.')}</strong> ({report.tamanoEstimado})
                        </span>
                      </div>
                    </div>

                    <div className="hm-card-actions">
                      <button
                        type="button"
                        className="hm-btn-action download"
                        onClick={() => handleDownloadFromHistory(report.id)}
                      >
                        <FaDownload /> <span>{t('admin.reports.downloadAgain', 'Descargar')}</span>
                      </button>
                      <button
                        type="button"
                        className="hm-btn-action print"
                        title={t('admin.reports.printReport', 'Imprimir reporte')}
                        onClick={() => handlePrintFromHistory(report)}
                      >
                        <FaPrint />
                      </button>
                      <button
                        type="button"
                        className="hm-btn-action details"
                        title={t('admin.reports.viewDetails', 'Ver detalle')}
                        onClick={() => setModalReport(report)}
                      >
                        <FaEye />
                      </button>
                      <button
                        type="button"
                        className="hm-btn-action delete"
                        title={t('admin.reports.deleteReport', 'Eliminar')}
                        onClick={() => handleDeleteFromHistory(report)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MODAL DE VISTA PREVIA EN VIVO */}
        {showPreviewModal && (
          <div className="modal-overlay-backdrop" onClick={() => setShowPreviewModal(false)}>
            <div className="modal-dialog-box" style={{ maxWidth: 960 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-dialog-header">
                <div>
                  <h3 style={{ margin: 0 }}>{t(`admin.reports.types.${currentTypeConfig.id}_title`, livePreviewData.reportTitle)}</h3>
                  <small style={{ color: 'var(--brand-primary)', fontWeight: 750 }}>
                    {t('admin.reports.previewModalSubtitle', {
                      count: livePreviewData.totalRegistros,
                      format: selectedFormat,
                      defaultValue: `${livePreviewData.totalRegistros} registros encontrados • Formato seleccionado: ${selectedFormat}`,
                    })}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-history-action"
                  onClick={() => setShowPreviewModal(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="modal-dialog-body">
                {/* KPIS DE RESUMEN */}
                {livePreviewData.kpis && livePreviewData.kpis.length > 0 && (
                  <div className="preview-summary-pills">
                    {livePreviewData.kpis.map((kpi, idx) => (
                      <div key={idx} className="preview-stat-box">
                        <span className="stat-label">{translateKpi(kpi.label, t)}</span>
                        <span className="stat-number">{kpi.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* TABLA DE VISTA PREVIA */}
                <div className="table-frame-responsive" style={{ maxHeight: 420 }}>
                  <table className="reports-data-table">
                    <thead>
                      <tr>
                        {livePreviewData.headers.map((h, i) => (
                          <th key={i}>{translateHeader(h, t)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {livePreviewData.rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={livePreviewData.headers.length}
                            style={{ textAlign: 'center', padding: '40px', color: 'var(--adm-muted)' }}
                          >
                            {t('admin.reports.noDataMatch', 'No hay datos que coincidan con los filtros seleccionados.')}
                          </td>
                        </tr>
                      ) : (
                        livePreviewData.rows.slice(0, 25).map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx}>{cell}</td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {livePreviewData.rows.length > 25 && (
                  <div style={{ fontSize: 12, color: 'var(--adm-muted)', textAlign: 'right' }}>
                    <em>
                      {t('admin.reports.previewLimitNote', {
                        count: 25,
                        total: livePreviewData.totalRegistros,
                        defaultValue: `Mostrando las primeras 25 filas de ${livePreviewData.totalRegistros} en esta vista previa. El archivo exportado contendrá la totalidad de los datos.`,
                      })}
                    </em>
                  </div>
                )}
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="btn-print-hero"
                  onClick={handlePrintCurrentReport}
                >
                  <FaPrint /> {t('admin.reports.printCurrentBtn', 'Imprimir')}
                </button>

                <button
                  type="button"
                  className="btn-generate-hero"
                  onClick={() => {
                    setShowPreviewModal(false)
                    handleGenerateReport()
                  }}
                  disabled={isGenerating}
                >
                  <FaDownload /> {t('admin.reports.generateBtn', 'Generar y Descargar')} ({selectedFormat})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE DETALLE DE REPORTE DEL HISTORIAL */}
        {modalReport && (
          <div className="modal-overlay-backdrop" onClick={() => setModalReport(null)}>
            <div className="modal-dialog-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-dialog-header">
                <div>
                  <h3 style={{ margin: 0 }}>
                    {t(`admin.reports.types.${modalReport.tipoId}_title`, modalReport.titulo)}
                  </h3>
                  <small style={{ color: 'var(--brand-primary)', fontFamily: 'monospace', fontWeight: 800 }}>
                    {modalReport.codigo} • {modalReport.formato}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-history-action"
                  onClick={() => setModalReport(null)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="modal-dialog-body">
                {/* Metadatos */}
                <div className="modal-metadata-grid">
                  <div>
                    <span className="meta-label">
                      {t('admin.reports.generationDate', 'Fecha Generación')}
                    </span>
                    <strong className="meta-value">
                      {new Date(modalReport.fechaGeneracion).toLocaleString(i18n.language || undefined)}
                    </strong>
                  </div>
                  <div>
                    <span className="meta-label">
                      {t('admin.reports.generatedBy', 'Generado Por')}
                    </span>
                    <strong className="meta-value">
                      {modalReport.generadoPorRol === 'admin' || modalReport.generadoPorNombre === 'Administrador'
                        ? t('admin.reports.roleAdminSingle', 'Administrador')
                        : modalReport.generadoPorRol === 'encargado_sucursal' ||
                          modalReport.generadoPorRol === 'encargado' ||
                          modalReport.generadoPorNombre === 'Encargado de Sucursal'
                        ? t('admin.reports.roleManagerSingle', 'Encargado de Sucursal')
                        : modalReport.generadoPorNombre}
                    </strong>
                  </div>
                  <div>
                    <span className="meta-label">
                      {t('admin.reports.totalRecords', 'Total Registros')}
                    </span>
                    <strong className="meta-value">
                      {modalReport.totalRegistros} {t('admin.reports.records', 'registros')} ({modalReport.tamanoEstimado})
                    </strong>
                  </div>
                  <div>
                    <span className="meta-label">
                      {t('admin.reports.savedFormat', 'Formato Guardado')}
                    </span>
                    <strong className="meta-value">{modalReport.formato}</strong>
                  </div>
                </div>

                {/* Filtros aplicados */}
                {modalReport.filtersSummary && modalReport.filtersSummary.length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: 13, textTransform: 'uppercase', color: 'var(--adm-muted)', fontWeight: 800 }}>
                      {t('admin.reports.appliedFilters', 'Filtros Aplicados')}
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {modalReport.filtersSummary.map((f, i) => (
                        <span key={i} style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', padding: '5px 12px', borderRadius: 8, fontSize: 12 }}>
                          <strong>{translateFilterLabel(f.label, t)}:</strong> {translateFilterValue(f.value)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Snapshot KPIs */}
                {modalReport.snapshot?.kpis && modalReport.snapshot.kpis.length > 0 && (
                  <div className="preview-summary-pills">
                    {modalReport.snapshot.kpis.map((kpi, i) => (
                      <div key={i} className="preview-stat-box">
                        <span className="stat-label">{translateKpi(kpi.label, t)}</span>
                        <span className="stat-number">{kpi.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tabla de Datos Snapshot */}
                {modalReport.snapshot?.rows && modalReport.snapshot.rows.length > 0 && (
                  <div className="table-frame-responsive">
                    <table className="reports-data-table">
                      <thead>
                        <tr>
                          {modalReport.snapshot.headers.map((h, i) => (
                            <th key={i}>{translateHeader(h, t)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {modalReport.snapshot.rows.slice(0, 15).map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="btn-print-hero"
                  onClick={() => handlePrintFromHistory(modalReport)}
                >
                  <FaPrint /> {t('admin.reports.printReport', 'Imprimir')}
                </button>

                <button
                  type="button"
                  className="btn-generate-hero"
                  onClick={() => handleDownloadFromHistory(modalReport.id)}
                >
                  <FaDownload /> {t('admin.reports.downloadAgain', 'Descargar')} ({modalReport.formato})
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
