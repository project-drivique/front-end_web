import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import {
  reportManagementService,
  REPORT_CATEGORIES,
  REPORT_FORMATS,
} from '../../../services/reportManagementService'
import { branchManagementService } from '../../../services/branchManagementService'
import { showAlert } from '../../../utils/swalConfig'
import { exportExcel, exportPdf } from '../../../utils/listExportUtils'
import { formatCurrency } from '../../../utils/currencyUtils'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './ReportsManagementPage.css'
import ModalReport from './ReportsManagementPage/ModalReport'
import ShowPreviewModal from './ReportsManagementPage/ShowPreviewModal'
import HistoryActiveTab from './ReportsManagementPage/HistoryActiveTab'
import BuilderSectionCard3 from './ReportsManagementPage/BuilderSectionCard3'
import BuilderSectionCard2 from './ReportsManagementPage/BuilderSectionCard2'
import BuilderSectionCard from './ReportsManagementPage/BuilderSectionCard'
import DashboardActiveTab from './ReportsManagementPage/DashboardActiveTab'
import ReportsTabsPillContainer from './ReportsManagementPage/ReportsTabsPillContainer'

export default function ReportsManagementPage({ branchOnly = false }) {
  const { t, i18n } = useTranslation()
  const { tema, moneda, tasaUSD } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const esModoOscuro = tema === 'oscuro'

  const esEncargado =
    branchOnly ||
    user?.rol === 'encargado' ||
    user?.rol === 'branch_manager' ||
    user?.rol === 'encargado_sucursal'
  const sucursalEncargado =
    user?.sucursalAsignada || user?.sucursalId || user?.sucursal || ''

  // Pestaña activa ('dashboard' | 'builder' | 'history')
  const [activeTab, setActiveTab] = useState('dashboard')

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
  const [filterCategory] = useState('all')
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
  const [dataVersion, setDataVersion] = useState(0)
  const [dashboard, setDashboard] = useState(null)

  const loadHistory = () => {
    const list = reportManagementService.getHistory()
    setHistory(list)
  }

  useEffect(() => {
    reportManagementService.prepararDatos()
      .catch((error) => console.error('No se pudieron cargar los datos de reportes:', error))
      .finally(() => {
        setSucursales(branchManagementService.list())
        loadHistory()
        setDataVersion((n) => n + 1)
        reportManagementService.getDashboard(user).then(setDashboard).catch(() => setDashboard(null))
      })
  }, [])

  // Exporta (o imprime) la tabla de desempeño por sucursal con los mismos datos que se ven en pantalla
  const datosTablaDesempeno = () => ({
    title: t('hc.desempeno_operativo_y_financiero_por_s', 'Desempeño Operativo y Financiero por Sucursal'),
    subtitle: t('hc2.sistema_operativo_de_gestion_e_inspecc', 'Sistema Operativo de Gestión e Inspección de Alquiler de Vehículos'),
    headers: [t('hc4.sucursal', 'Sucursal'), t('hc4.ciudad', 'Ciudad'), t('hc2.vehiculo_mas_demandado', 'Vehículo más demandado'), t('hc4.reservas', 'Reservas'), t('hc2.dias_alquilados', 'Días alquilados'), t('hc2.ingresos_netos_cop', 'Ingresos netos (COP)'), t('hc2.ocupacion', 'Ocupación (%)'), t('hc4.incidencias', 'Incidencias'), t('hc2.calificacion_113', 'Calificación')],
    rows: (dashboard?.sucursales || []).map((f) => [
      f.sucursal, f.ciudad, f.vehiculoTop || '—', f.reservas, f.dias, formatCurrency(f.ingresos, 'COP'),
      `${f.ocupacion}%`, f.incidencias, f.totalResenas > 0 ? f.calificacion.toFixed(1) : '—',
    ]),
    kpis: dashboard ? [
      { label: t('hc2.ingresos_totales_netos', 'Ingresos totales netos'), value: formatCurrency(dashboard.ingresos, 'COP') },
      { label: t('hc.reservas_facturadas', 'Reservas facturadas'), value: String(dashboard.reservasFacturadas) },
      { label: t('hc.ocupacion_de_flota', 'Ocupación de flota'), value: `${dashboard.ocupacion}%` },
    ] : [],
    filtersSummary: [],
    filename: `desempeno-sucursales-${new Date().toISOString().slice(0, 10)}`,
    user,
  })

  const handleDownloadDirect = (format) => {
    const payload = datosTablaDesempeno()
    if (format === 'excel') exportExcel(payload)
    else exportPdf(payload)
  }

  const handlePrintReport = () => exportPdf(datosTablaDesempeno())

  const openHistoryReport = async (report) => {
    try {
      setModalReport(await reportManagementService.getHistoryDetail(report.id))
    } catch (error) {
      showAlert({ icon: 'error', title: t('admin.reports.errorDownload', 'Error de descarga'), text: error.message })
    }
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

  // Vista previa en vivo: la calcula el servidor con los filtros elegidos
  const [livePreviewData, setLivePreviewData] = useState({ reportTitle: '', headers: [], rows: [], kpis: [], totalRegistros: 0 })
  const [previewError, setPreviewError] = useState('')
  useEffect(() => {
    let vigente = true
    setPreviewError('')
    const temporizador = setTimeout(() => {
      reportManagementService.previewReport({
        typeId: selectedTypeId,
        filters: {
          fechaInicio: filterStartDate,
          fechaFin: filterEndDate,
          sucursal: filterBranch,
          estado: filterState,
          categoria: filterCategory,
          gravedad: filterSeverity,
          search: filterSearch,
          moneda: moneda || 'COP',
          tasaUSD: tasaUSD || 4000,
        },
      })
        .then((datos) => { if (vigente) setLivePreviewData(datos) })
        .catch((error) => {
          if (!vigente) return
          setLivePreviewData({ reportTitle: '', headers: [], rows: [], kpis: [], totalRegistros: 0 })
          setPreviewError(error.message)
        })
    }, 300)
    return () => { vigente = false; clearTimeout(temporizador) }
  }, [selectedTypeId, filterStartDate, filterEndDate, filterBranch, filterState, filterCategory, filterSeverity, filterSearch, moneda, tasaUSD, user, dataVersion])

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

      const generated = await reportManagementService.generateReport({
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
  const handleDownloadFromHistory = async (reportId) => {
    try {
      await reportManagementService.downloadFromHistory(reportId, user)
    } catch (error) {
      console.error('Error descargando reporte de historial:', error)
      showAlert({
        icon: 'error',
        title: t('admin.reports.errorDownload', 'Error de descarga'),
        text: error.message || t('hc2.no_se_pudo_descargar_el_reporte_selecc', 'No se pudo descargar el reporte seleccionado.'),
      })
    }
  }

  // Imprimir reporte desde el historial
  const handlePrintFromHistory = async (report) => {
    try {
      const detail = report.snapshot ? report : await reportManagementService.getHistoryDetail(report.id)
      reportManagementService.printReport(detail.snapshot, user)
    } catch (error) {
      console.error('Error imprimiendo desde historial:', error)
      showAlert({
        icon: 'error',
        title: t('admin.reports.errorPrint', 'Error al imprimir'),
        text: t('hc.no_se_pudo_abrir_el_dialogo_de_impresi', 'No se pudo abrir el diálogo de impresión.'),
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
      try {
        await reportManagementService.deleteReportFromHistory(report.id)
      } catch (error) {
        showAlert({ icon: 'error', title: error.message })
        return
      }
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
      try {
        await reportManagementService.clearHistory()
      } catch (error) {
        showAlert({ icon: 'error', title: error.message })
        return
      }
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
    <div
      className={`reports-page-wrapper management-shell ${esModoOscuro ? 'management-shell--dark' : ''}`}
      data-theme={tema}
    >
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
        <ReportsTabsPillContainer activeTab={activeTab} history={history} setActiveTab={setActiveTab} t={t} />

        {/* =========================================================
            PESTAÑA DASHBOARD: DASHBOARD ANALÍTICO DE INTELIGENCIA
           ========================================================= */}
        {activeTab === 'dashboard' && !dashboard && (
          <div className="reports-dashboard-view">
            <p style={{ padding: 24, color: '#64748b' }}>{t('admin.reports.loadingDashboard', 'Cargando indicadores...')}</p>
          </div>
        )}

        {activeTab === 'dashboard' && dashboard && (
          <DashboardActiveTab dashboard={dashboard} handleDownloadDirect={handleDownloadDirect} handlePrintReport={handlePrintReport} t={t} />
        )}

        {/* =========================================================
            PESTAÑA 1: GENERADOR DE REPORTES (DISEÑO ESPACIOSO)
           ========================================================= */}
        {activeTab === 'builder' && (
          <div className="reports-builder-flow">
            {/* PASO 1: SELECCIÓN DEL REPORTE */}
            <BuilderSectionCard availableTypes={availableTypes} selectedCategory={selectedCategory} selectedTypeId={selectedTypeId} setSelectedCategory={setSelectedCategory} setSelectedTypeId={setSelectedTypeId} t={t} />

            {/* PASO 2: PARÁMETROS Y FILTROS */}
            <BuilderSectionCard2 currentTypeConfig={currentTypeConfig} datePreset={datePreset} esEncargado={esEncargado} filterBranch={filterBranch} filterEndDate={filterEndDate} filterSearch={filterSearch} filterSeverity={filterSeverity} filterStartDate={filterStartDate} filterState={filterState} handleDatePreset={handleDatePreset} setDatePreset={setDatePreset} setFilterBranch={setFilterBranch} setFilterEndDate={setFilterEndDate} setFilterSearch={setFilterSearch} setFilterSeverity={setFilterSeverity} setFilterStartDate={setFilterStartDate} setFilterState={setFilterState} sucursales={sucursales} t={t} />

            {/* PASO 3: FORMATO DE EXPORTACIÓN Y ACCIONES */}
            <BuilderSectionCard3 handleGenerateReport={handleGenerateReport} handlePrintCurrentReport={handlePrintCurrentReport} isGenerating={isGenerating} livePreviewData={livePreviewData} selectedFormat={selectedFormat} setSelectedFormat={setSelectedFormat} setShowPreviewModal={setShowPreviewModal} t={t} />
          </div>
        )}

        {/* =========================================================
            PESTAÑA 2: HISTORIAL DE REPORTES
           ========================================================= */}
        {activeTab === 'history' && (
          <HistoryActiveTab filteredHistory={filteredHistory} handleClearAllHistory={handleClearAllHistory} handleDeleteFromHistory={handleDeleteFromHistory} handleDownloadFromHistory={handleDownloadFromHistory} handlePrintFromHistory={handlePrintFromHistory} history={history} historyCategory={historyCategory} historyDateFilter={historyDateFilter} historyFormat={historyFormat} historySearch={historySearch} historyStats={historyStats} i18n={i18n} openHistoryReport={openHistoryReport} setHistoryCategory={setHistoryCategory} setHistoryDateFilter={setHistoryDateFilter} setHistoryFormat={setHistoryFormat} setHistorySearch={setHistorySearch} t={t} />
        )}

        {/* MODAL DE VISTA PREVIA EN VIVO */}
        {showPreviewModal && (
          <ShowPreviewModal currentTypeConfig={currentTypeConfig} handleGenerateReport={handleGenerateReport} handlePrintCurrentReport={handlePrintCurrentReport} isGenerating={isGenerating} livePreviewData={livePreviewData} previewError={previewError} selectedFormat={selectedFormat} setShowPreviewModal={setShowPreviewModal} t={t} />
        )}

        {/* MODAL DE DETALLE DE REPORTE DEL HISTORIAL */}
        {modalReport && (
          <ModalReport handleDownloadFromHistory={handleDownloadFromHistory} handlePrintFromHistory={handlePrintFromHistory} i18n={i18n} modalReport={modalReport} setModalReport={setModalReport} t={t} />
        )}
      </main>
    </div>
  )
}
