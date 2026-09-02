import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaShieldAlt,
  FaSearch,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaEye,
  FaLock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaBan,
  FaBuilding,
  FaUserShield,
  FaCalendarAlt,
  FaDesktop,
  FaCopy,
  FaTimes,
  FaRedo,
  FaGlobe,
  FaUser,
  FaFilter,
  FaLayerGroup,
  FaHistory,
  FaCheck,
  FaSlidersH,
  FaChevronRight,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { useBrand } from '../../../contexts/BrandContext'
import { accessAuditService } from '../../../services/accessAuditService'
import { branchManagementService } from '../../../services/branchManagementService'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './AuditLogManagementPage.css'

export default function AuditLogManagementPage({ branchOnly = false }) {
  const { t } = useTranslation()
  const { tema, moneda, tasaUSD } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const { brand } = useBrand()
  const esModoOscuro = tema === 'oscuro'

  const esEncargado =
    branchOnly ||
    user?.rol === 'encargado' ||
    user?.rol === 'encargado_sucursal' ||
    user?.rol === 'branch_manager'
  const sucursalEncargado = user?.sucursalId || user?.sucursal || user?.sucursalAsignada || ''

  const TIPOS_EVENTO = [
    { value: 'all', label: t('admin.audit_module.types.all', 'Todos los tipos de evento') },
    { value: 'AUTENTICACION', label: t('admin.audit_module.types.auth', 'Autenticación y Acceso') },
    { value: 'SEGURIDAD_2FA', label: t('admin.audit_module.types.security2fa', 'Seguridad y 2FA') },
    { value: 'CRUD_VEHICULOS', label: t('admin.audit_module.types.vehicles', 'Gestión de Flota y Vehículos') },
    { value: 'GESTION_RESERVAS', label: t('admin.audit_module.types.reservations', 'Gestión de Reservas') },
    { value: 'GESTION_CONTRATOS', label: t('admin.audit_module.types.contracts', 'Gestión de Contratos') },
    { value: 'GESTION_INCIDENCIAS', label: t('admin.audit_module.types.incidents', 'Gestión de Incidencias') },
    { value: 'GESTION_USUARIOS', label: t('admin.audit_module.types.users', 'Gestión de Usuarios') },
    { value: 'ROLES_PERMISOS', label: t('admin.audit_module.types.roles', 'Roles y Permisos') },
    { value: 'PROMOCIONES', label: t('admin.audit_module.types.promotions', 'Promociones y Descuentos') },
    { value: 'REPORTES_EXPORTACION', label: t('admin.audit_module.types.reports', 'Reportes y Exportación') },
    { value: 'SISTEMA_CONFIGURACION', label: t('admin.audit_module.types.system', 'Configuración del Sistema') },
    { value: 'NAVEGACION', label: t('admin.audit_module.types.navigation', 'Navegación y Catálogo') },
  ]

  const [logs, setLogs] = useState(() => accessAuditService.listForUser(user))
  const [branches, setBranches] = useState(() => branchManagementService.list())
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [resultFilter, setResultFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [selectedLogModal, setSelectedLogModal] = useState(null)
  const [copiedId, setCopiedId] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Cargar datos
  const loadData = () => {
    const list = accessAuditService.listForUser(user)
    setLogs(list)
    setBranches(branchManagementService.list())
  }

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener(accessAuditService.eventName, handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener(accessAuditService.eventName, handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [user])

  // Filtrado de eventos
  const filteredLogs = useMemo(() => {
    const currentList = Array.isArray(logs) ? logs : []
    return currentList.filter((log) => {
      if (!log) return false

      // 1. Filtro por sucursal
      if (esEncargado) {
        const branchNorm = String(sucursalEncargado || '').toLowerCase()
        if (branchNorm) {
          const logBranch = String(log.sucursal || '').toLowerCase()
          if (!logBranch.includes(branchNorm) && !branchNorm.includes(logBranch)) return false
        }
      } else if (branchFilter !== 'all') {
        const branchNorm = String(log.sucursal || '').toLowerCase()
        if (!branchNorm.includes(branchFilter.toLowerCase())) return false
      }

      // 2. Filtro por tipo de evento
      if (typeFilter !== 'all') {
        const logTipo = String(log.tipo || '').toUpperCase()
        if (logTipo !== typeFilter && !logTipo.includes(typeFilter)) return false
      }

      // 3. Filtro por resultado
      if (resultFilter !== 'all') {
        const res = String(log.resultado || '').toUpperCase()
        if (resultFilter === 'EXITO' && !res.includes('EXIT')) return false
        if (resultFilter === 'FALLO' && !res.includes('FALL') && !res.includes('ERR')) return false
        if (resultFilter === 'DENEGADO' && !res.includes('DENEG') && !res.includes('BLOQ')) return false
        if (resultFilter === 'ADVERTENCIA' && !res.includes('ADV') && !res.includes('WARN')) return false
      }

      // 4. Filtro por rol
      if (roleFilter !== 'all') {
        const rolNorm = String(log.rol || '').toLowerCase()
        if (!rolNorm.includes(roleFilter.toLowerCase())) return false
      }

      // 5. Filtro por fechas
      if (startDate) {
        const logDate = log.fecha ? log.fecha.slice(0, 10) : ''
        if (logDate && logDate < startDate) return false
      }
      if (endDate) {
        const logDate = log.fecha ? log.fecha.slice(0, 10) : ''
        if (logDate && logDate > endDate) return false
      }

      // 6. Búsqueda por texto (Actor, Correo, Acción, IP, ID, Módulo)
      if (search.trim()) {
        const query = search.toLowerCase()
        const matchId = String(log.id || '').toLowerCase().includes(query)
        const matchActor = String(log.actor || '').toLowerCase().includes(query)
        const matchEmail = String(log.correo || '').toLowerCase().includes(query)
        const matchAction = String(log.accion || '').toLowerCase().includes(query)
        const matchIp = String(log.ip || '').toLowerCase().includes(query)
        const matchModule = String(log.modulo || '').toLowerCase().includes(query)
        if (!matchId && !matchActor && !matchEmail && !matchAction && !matchIp && !matchModule) {
          return false
        }
      }

      return true
    })
  }, [logs, esEncargado, branchFilter, typeFilter, resultFilter, roleFilter, startDate, endDate, search])

  // KPIs
  const stats = useMemo(() => {
    const total = filteredLogs.length
    const exitosos = filteredLogs.filter((l) => l.resultado === 'EXITO' || l.resultado === 'EXITOSO').length
    const fallidos = filteredLogs.filter((l) => l.resultado === 'FALLO' || l.resultado === 'FALLIDO' || l.resultado === 'DENEGADO').length
    const seguridad = filteredLogs.filter((l) => l.tipo.includes('SEGURIDAD') || l.tipo.includes('2FA') || l.tipo.includes('AUTENTICACION')).length
    return { total, exitosos, fallidos, seguridad }
  }, [filteredLogs])

  const handleResetFilters = () => {
    setSearch('')
    setTypeFilter('all')
    setResultFilter('all')
    setRoleFilter('all')
    setBranchFilter('all')
    setStartDate('')
    setEndDate('')
  }

  // Helper de badges de resultado
  const renderResultBadge = (resultado) => {
    const res = String(resultado || '').toUpperCase()
    if (res === 'EXITO' || res === 'EXITOSO') {
      return (
        <span className="audit-badge audit-badge--success">
          <FaCheckCircle size={10} /> {t('admin.audit_module.results.success', 'ÉXITO')}
        </span>
      )
    }
    if (res === 'FALLO' || res === 'FALLIDO') {
      return (
        <span className="audit-badge audit-badge--danger">
          <FaTimesCircle size={10} /> {t('admin.audit_module.results.failure', 'FALLO')}
        </span>
      )
    }
    if (res === 'DENEGADO' || res === 'BLOQUEADO') {
      return (
        <span className="audit-badge audit-badge--denied">
          <FaBan size={10} /> {t('admin.audit_module.results.denied', 'DENEGADO')}
        </span>
      )
    }
    return (
      <span className="audit-badge audit-badge--warning">
        <FaExclamationTriangle size={10} /> {t('admin.audit_module.results.warning', 'ADVERTENCIA')}
      </span>
    )
  }

  // Exportación Excel
  const handleExportExcel = () => {
    const headers = [
      t('admin.audit_module.modal.copyId', 'ID Registro'),
      t('admin.audit_module.table.dateTime', 'Fecha / Hora'),
      t('admin.audit_module.table.moduleType', 'Módulo / Tipo'),
      t('admin.audit_module.table.actorUser', 'Actor / Usuario'),
      'Correo',
      t('admin.audit_module.actorRole', 'Rol'),
      t('admin.audit_module.table.branch', 'Sucursal'),
      'IP',
      t('admin.audit_module.table.action', 'Acción Realizada'),
      t('admin.audit_module.table.result', 'Resultado'),
      t('admin.audit_module.modal.reason', 'Motivo o Causa'),
    ]
    const rows = filteredLogs.map((log) => {
      const d = new Date(log.fecha)
      return [
        log.id,
        `${d.toLocaleDateString('es-CO')} ${d.toLocaleTimeString('es-CO')}`,
        `${log.tipo} (${log.modulo})`,
        log.actor,
        log.correo,
        log.rol,
        log.sucursal,
        log.ip,
        log.accion,
        log.resultado,
        log.motivo || 'N/A',
      ]
    })

    exportExcel({
      title: esEncargado
        ? `${t('admin.audit_module.title', 'Auditoría')} - ${sucursalEncargado}`
        : t('admin.audit_module.title', 'Auditoría y Registro de Actividad'),
      headers,
      rows,
      kpis: [
        { label: t('admin.audit_module.totalEvents', 'Total Eventos'), value: stats.total },
        { label: t('admin.audit_module.successfulEvents', 'Exitosos'), value: stats.exitosos },
        { label: t('admin.audit_module.failedEvents', 'Fallos / Alertas'), value: stats.fallidos },
        { label: t('admin.audit_module.securityEvents', 'Accesos & 2FA'), value: stats.seguridad },
      ],
      filtersSummary: [
        { label: t('admin.audit_module.branchLabel', 'Sucursal'), value: esEncargado ? sucursalEncargado : branchFilter },
        { label: t('admin.audit_module.allEventTypes', 'Tipo'), value: typeFilter },
        { label: t('admin.audit_module.allResults', 'Resultado'), value: resultFilter },
      ],
      filename: `auditoria_${esEncargado ? 'sucursal' : 'global'}_${new Date().toISOString().slice(0, 10)}`,
    })
  }

  // Exportación PDF
  const handleExportPdf = () => {
    const headers = [
      t('admin.audit_module.table.dateTime', 'Fecha / Hora'),
      t('admin.audit_module.table.moduleType', 'Módulo / Tipo'),
      t('admin.audit_module.table.actorUser', 'Actor / Usuario'),
      t('admin.audit_module.table.branch', 'Sucursal'),
      t('admin.audit_module.table.ipDevice', 'IP / Dispositivo'),
      t('admin.audit_module.table.action', 'Acción Realizada'),
      t('admin.audit_module.table.result', 'Resultado'),
    ]
    const rows = filteredLogs.map((log) => {
      const d = new Date(log.fecha)
      return [
        `${d.toLocaleDateString('es-CO')} ${d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`,
        `${log.tipo}\n(${log.modulo})`,
        `${log.actor}\n${log.correo} [${log.rol}]`,
        log.sucursal,
        log.ip,
        log.accion,
        log.resultado,
      ]
    })

    exportPdf({
      title: esEncargado
        ? `${t('admin.audit_module.title', 'Auditoría')} - ${sucursalEncargado}`
        : t('admin.audit_module.title', 'Auditoría y Registro de Actividad'),
      headers,
      rows,
      filename: `auditoria_${esEncargado ? 'sucursal' : 'global'}_${new Date().toISOString().slice(0, 10)}`,
    })
  }

  // Imprimir Listado
  const handlePrint = () => {
    const headers = [
      t('admin.audit_module.table.dateTime', 'Fecha / Hora'),
      t('admin.audit_module.table.moduleType', 'Tipo Evento'),
      t('admin.audit_module.table.actorUser', 'Actor / Correo'),
      t('admin.audit_module.table.branch', 'Sucursal'),
      'IP',
      t('admin.audit_module.table.action', 'Acción / Detalle'),
      t('admin.audit_module.table.result', 'Resultado'),
    ]
    const rows = filteredLogs.map((log) => {
      const d = new Date(log.fecha)
      return [
        `${d.toLocaleDateString('es-CO')} ${d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`,
        log.tipo,
        `${log.actor} (${log.correo})`,
        log.sucursal,
        log.ip,
        log.accion,
        log.resultado,
      ]
    })

    printTable({
      title: esEncargado
        ? `${t('admin.audit_module.title', 'Auditoría')} - ${sucursalEncargado}`
        : t('admin.audit_module.title', 'Auditoría Centralizada y Registro de Actividad'),
      headers,
      rows,
      subtitle: `Generado por ${user?.nombre || 'Administrador'} (${user?.correo}) - ${new Date().toLocaleString()}`,
    })
  }

  const handleCopyLogId = (id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  const handleCopyJson = (data) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopiedJson(true)
      setTimeout(() => setCopiedJson(false), 2000)
    }
  }

  return (
    <div
      className={`management-shell audit-shell ${esModoOscuro ? 'management-shell--dark' : ''}`}
      data-theme={tema}
    >
      <ManagementSidebar branchOnly={branchOnly} />

      <main className="management-main audit-management-page">
        {/* TOP BAR */}
        <header className="audit-header">
          <div className="audit-header-titles">
            <span className="audit-eyebrow">
              <FaShieldAlt size={12} /> {t('admin.audit_module.eyebrow', 'Supervisión Forense y Seguridad')}
            </span>
            <h1 className="audit-title">{t('admin.audit_module.title', 'Auditoría y Registro de Actividad')}</h1>
            <p className="audit-subtitle">
              {t('admin.audit_module.subtitle', 'Consolidado inmutable de todos los eventos, accesos, verificaciones 2FA, acciones CRUD y cambios de estado.')}
            </p>
          </div>

          <div className="audit-header-actions">
            <span className="audit-readonly-badge">
              <FaLock size={11} /> {t('admin.audit_module.readOnly', 'Solo Lectura')}
            </span>
            <MenuConfiguracion />
          </div>
        </header>

        {/* BANNER DE ALCANCE */}
        <div className={`audit-scope-banner ${esEncargado ? 'audit-scope-banner--branch' : 'audit-scope-banner--global'}`}>
          <div className="audit-scope-icon-wrap">
            {esEncargado ? <FaBuilding size={14} /> : <FaGlobe size={14} />}
          </div>
          <div className="audit-scope-text">
            <strong>
              {esEncargado
                ? t('admin.audit_module.branchScope', { branch: sucursalEncargado || 'Sucursal Autorizada' })
                : t('admin.audit_module.globalScope', 'Alcance Global del Sistema (Supervisión Total)')}
            </strong>
            <p>
              {esEncargado
                ? t('admin.audit_module.branchScopeDesc', 'Solo puedes consultar los eventos registrados para tu sucursal autorizada.')
                : t('admin.audit_module.globalScopeDesc', 'Supervisión completa de todas las sedes y módulos de la plataforma.')}
            </p>
          </div>
        </div>

        {/* STATS / KPIS COMPACTOS */}
        <section className="audit-kpi-grid">
          <div
            className={`audit-kpi-card ${resultFilter === 'all' && typeFilter === 'all' ? 'audit-kpi-card--active' : ''}`}
            onClick={handleResetFilters}
            title={t('admin.audit_module.totalEventsSub', 'Trazabilidad auditada')}
          >
            <div className="audit-kpi-card__head">
              <span className="audit-kpi-card__label">{t('admin.audit_module.totalEvents', 'Total Eventos')}</span>
              <span className="audit-kpi-card__icon audit-kpi-card__icon--brand">
                <FaLayerGroup size={13} />
              </span>
            </div>
            <p className="audit-kpi-card__value">{stats.total}</p>
            <span className="audit-kpi-card__sub">{t('admin.audit_module.totalEventsSub', 'Trazabilidad auditada')}</span>
          </div>

          <div
            className={`audit-kpi-card ${resultFilter === 'EXITO' ? 'audit-kpi-card--active' : ''}`}
            onClick={() => setResultFilter(resultFilter === 'EXITO' ? 'all' : 'EXITO')}
            title={t('admin.audit_module.successfulEventsSub', 'Operaciones válidas')}
          >
            <div className="audit-kpi-card__head">
              <span className="audit-kpi-card__label">{t('admin.audit_module.successfulEvents', 'Exitosos')}</span>
              <span className="audit-kpi-card__icon audit-kpi-card__icon--green">
                <FaCheckCircle size={13} />
              </span>
            </div>
            <p className="audit-kpi-card__value">{stats.exitosos}</p>
            <span className="audit-kpi-card__sub">{t('admin.audit_module.successfulEventsSub', 'Operaciones válidas')}</span>
          </div>

          <div
            className={`audit-kpi-card ${resultFilter === 'FALLO' ? 'audit-kpi-card--active' : ''}`}
            onClick={() => setResultFilter(resultFilter === 'FALLO' ? 'all' : 'FALLO')}
            title={t('admin.audit_module.failedEventsSub', 'Intentos fallidos / denegados')}
          >
            <div className="audit-kpi-card__head">
              <span className="audit-kpi-card__label">{t('admin.audit_module.failedEvents', 'Fallos / Alertas')}</span>
              <span className="audit-kpi-card__icon audit-kpi-card__icon--red">
                <FaTimesCircle size={13} />
              </span>
            </div>
            <p className="audit-kpi-card__value">{stats.fallidos}</p>
            <span className="audit-kpi-card__sub">{t('admin.audit_module.failedEventsSub', 'Intentos fallidos / denegados')}</span>
          </div>

          <div
            className={`audit-kpi-card ${typeFilter === 'AUTENTICACION' ? 'audit-kpi-card--active' : ''}`}
            onClick={() => setTypeFilter(typeFilter === 'AUTENTICACION' ? 'all' : 'AUTENTICACION')}
            title={t('admin.audit_module.securityEventsSub', 'Sesiones y OTP')}
          >
            <div className="audit-kpi-card__head">
              <span className="audit-kpi-card__label">{t('admin.audit_module.securityEvents', 'Accesos & 2FA')}</span>
              <span className="audit-kpi-card__icon audit-kpi-card__icon--brand">
                <FaLock size={13} />
              </span>
            </div>
            <p className="audit-kpi-card__value">{stats.seguridad}</p>
            <span className="audit-kpi-card__sub">{t('admin.audit_module.securityEventsSub', 'Sesiones y OTP')}</span>
          </div>
        </section>

        {/* PANEL DE CONTROL, BÚSQUEDA Y FILTROS */}
        <section className="audit-panel-card">
          <div className="audit-panel-head">
            <div className="audit-panel-head-title">
              <FaFilter size={13} className="audit-icon-brand" />
              <span>{t('admin.audit_module.filtersTitle', 'Filtros y Controles')}</span>
              <span className="audit-count-badge">{filteredLogs.length}</span>
            </div>

            <div className="audit-actions-group">
              <button
                type="button"
                className="audit-btn-action audit-btn-action--excel"
                onClick={handleExportExcel}
                title="Exportar a Microsoft Excel"
              >
                <FaFileExcel size={12} /> {t('admin.audit_module.exportExcel', 'Excel')}
              </button>

              <button
                type="button"
                className="audit-btn-action audit-btn-action--pdf"
                onClick={handleExportPdf}
                title="Exportar a PDF"
              >
                <FaFilePdf size={12} /> {t('admin.audit_module.exportPdf', 'PDF')}
              </button>

              <button
                type="button"
                className="audit-btn-action audit-btn-action--print"
                onClick={handlePrint}
                title="Imprimir listado"
              >
                <FaPrint size={12} /> {t('admin.audit_module.print', 'Imprimir')}
              </button>
            </div>
          </div>

          {/* FILA PRINCIPAL */}
          <div className="audit-filter-row audit-filter-row--primary">
            <div className="audit-field-search">
              <div className="audit-search-input-wrap">
                <FaSearch className="audit-search-input-icon" />
                <input
                  type="text"
                  placeholder={t('admin.audit_module.searchPlaceholder', 'Buscar por usuario, correo, IP, acción o ID...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="audit-input audit-input--search"
                />
                {search && (
                  <button
                    type="button"
                    className="audit-search-clear-btn"
                    onClick={() => setSearch('')}
                  >
                    <FaTimes size={10} />
                  </button>
                )}
              </div>
            </div>

            <div className="audit-field-select">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="audit-select"
              >
                {TIPOS_EVENTO.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="audit-field-select">
              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value)}
                className="audit-select"
              >
                <option value="all">{t('admin.audit_module.allResults', 'Todos los resultados')}</option>
                <option value="EXITO">{t('admin.audit_module.results.success', 'Éxito')}</option>
                <option value="FALLO">{t('admin.audit_module.results.failure', 'Fallo')}</option>
                <option value="DENEGADO">{t('admin.audit_module.results.denied', 'Denegado')}</option>
                <option value="ADVERTENCIA">{t('admin.audit_module.results.warning', 'Advertencia')}</option>
              </select>
            </div>

            <button
              type="button"
              className="audit-btn-toggle-filters"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <FaSlidersH size={11} /> {mobileFiltersOpen ? t('admin.audit_module.lessFilters', 'Menos filtros') : t('admin.audit_module.moreFilters', 'Más filtros')}
            </button>
          </div>

          {/* FILA SECUNDARIA */}
          <div className={`audit-filter-row audit-filter-row--secondary ${mobileFiltersOpen ? 'audit-filter-row--open' : ''}`}>
            <div className="audit-field-select">
              <label className="audit-input-label">{t('admin.audit_module.actorRole', 'Rol del Actor')}</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="audit-select"
              >
                <option value="all">{t('admin.audit_module.allRoles', 'Todos los roles')}</option>
                <option value="administrador">{t('admin.audit_module.roles.admin', 'Administrador')}</option>
                <option value="encargado">{t('admin.audit_module.roles.manager', 'Encargado de Sucursal')}</option>
                <option value="usuario">{t('admin.audit_module.roles.user', 'Usuario / Cliente')}</option>
                <option value="visitante">{t('admin.audit_module.roles.guest', 'Visitante')}</option>
              </select>
            </div>

            {!esEncargado && (
              <div className="audit-field-select">
                <label className="audit-input-label">{t('admin.audit_module.branchLabel', 'Sucursal')}</label>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="audit-select"
                >
                  <option value="all">{t('admin.audit_module.allBranches', 'Todas las sucursales')}</option>
                  <option value="Global / Sistema">{t('admin.audit_module.globalSystem', 'Global / Sistema')}</option>
                  {branches.map((b) => (
                    <option key={b.id || b.nombre} value={b.nombre}>
                      {b.nombre} ({b.ciudad})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="audit-field-date">
              <label className="audit-input-label">
                <FaCalendarAlt size={10} /> {t('admin.audit_module.dateFrom', 'Desde')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="audit-input audit-input--date"
              />
            </div>

            <div className="audit-field-date">
              <label className="audit-input-label">
                <FaCalendarAlt size={10} /> {t('admin.audit_module.dateTo', 'Hasta')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="audit-input audit-input--date"
              />
            </div>

            <div className="audit-field-btn">
              <button
                type="button"
                className="audit-btn-reset"
                onClick={handleResetFilters}
                title="Restablecer todos los filtros"
              >
                <FaRedo size={11} /> {t('admin.audit_module.resetFilters', 'Limpiar')}
              </button>
            </div>
          </div>
        </section>

        {/* VISTA DUAL: TABLA PARA PANTALLAS GRANDES Y CARDS PARA MÓVIL */}
        {filteredLogs.length === 0 ? (
          <div className="audit-empty-card">
            <FaShieldAlt className="audit-empty-icon" />
            <h3>{t('admin.audit_module.empty.title', 'No se encontraron registros de auditoría')}</h3>
            <p>{t('admin.audit_module.empty.desc', 'Prueba ajustando los criterios de búsqueda o el rango de fechas.')}</p>
            <button
              type="button"
              className="audit-btn-reset audit-btn-reset--inline"
              onClick={handleResetFilters}
            >
              <FaRedo size={11} /> {t('admin.audit_module.empty.reset', 'Restablecer filtros')}
            </button>
          </div>
        ) : (
          <>
            {/* 1. TABLA DESKTOP / TABLET */}
            <div className="audit-table-card audit-desktop-view">
              <div className="audit-table-container">
                <table className="audit-data-table">
                  <thead>
                    <tr>
                      <th>{t('admin.audit_module.table.dateTime', 'Fecha / Hora')}</th>
                      <th>{t('admin.audit_module.table.moduleType', 'Módulo / Tipo')}</th>
                      <th>{t('admin.audit_module.table.actorUser', 'Actor / Usuario')}</th>
                      <th>{t('admin.audit_module.table.branch', 'Sucursal')}</th>
                      <th>{t('admin.audit_module.table.ipDevice', 'IP / Dispositivo')}</th>
                      <th>{t('admin.audit_module.table.action', 'Acción Realizada')}</th>
                      <th>{t('admin.audit_module.table.result', 'Resultado')}</th>
                      <th style={{ textAlign: 'center' }}>{t('admin.audit_module.table.detail', 'Detalle')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => {
                      const d = new Date(log.fecha)
                      return (
                        <tr key={log.id} className="audit-table-row">
                          {/* Fecha y Hora */}
                          <td className="audit-td-timestamp">
                            <span className="audit-td-date">
                              {d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                            <span className="audit-td-time">
                              {d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </td>

                          {/* Módulo / Tipo */}
                          <td className="audit-td-module">
                            <span className="audit-module-pill">{log.tipo}</span>
                            <span className="audit-module-name">{log.modulo}</span>
                          </td>

                          {/* Actor / Usuario */}
                          <td className="audit-td-actor">
                            <div className="audit-actor-block">
                              <span className="audit-actor-name">{log.actor}</span>
                              <span className="audit-actor-email">{log.correo}</span>
                              <span className="audit-actor-role-tag">{log.rol}</span>
                            </div>
                          </td>

                          {/* Sucursal */}
                          <td className="audit-td-branch">
                            <div className="audit-branch-tag">
                              <FaBuilding size={11} className="audit-branch-icon" />
                              <span>{log.sucursal}</span>
                            </div>
                          </td>

                          {/* IP / Dispositivo */}
                          <td className="audit-td-ip">
                            <span className="audit-ip-code">{log.ip}</span>
                            <span className="audit-device-text" title={log.dispositivo}>
                              {log.dispositivo ? log.dispositivo.slice(0, 22) + '...' : 'Cliente Web'}
                            </span>
                          </td>

                          {/* Acción Realizada */}
                          <td className="audit-td-action">
                            <p className="audit-action-text">{log.accion}</p>
                            {log.motivo && (
                              <span className="audit-reason-text">
                                {t('admin.audit_module.table.note', 'Nota:')} {log.motivo}
                              </span>
                            )}
                          </td>

                          {/* Resultado */}
                          <td className="audit-td-result">
                            {renderResultBadge(log.resultado)}
                          </td>

                          {/* Detalle */}
                          <td className="audit-td-detail">
                            <button
                              type="button"
                              className="audit-btn-detail"
                              onClick={() => setSelectedLogModal(log)}
                              title={t('admin.audit_module.table.detail', 'Ver detalle')}
                            >
                              <FaEye size={12} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. VISTA DE CARDS PARA MÓVILES */}
            <div className="audit-cards-view">
              {filteredLogs.map((log) => {
                const d = new Date(log.fecha)
                return (
                  <div key={log.id} className="audit-mobile-card" onClick={() => setSelectedLogModal(log)}>
                    <div className="audit-mobile-card__top">
                      <span className="audit-module-pill">{log.tipo}</span>
                      {renderResultBadge(log.resultado)}
                      <span className="audit-mobile-time">
                        {d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })} - {d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="audit-mobile-card__actor">
                      <FaUser className="audit-icon-brand" size={11} />
                      <strong>{log.actor}</strong>
                      <span className="audit-actor-email">({log.correo})</span>
                    </div>

                    <p className="audit-mobile-action">{log.accion}</p>

                    <div className="audit-mobile-card__foot">
                      <div className="audit-mobile-meta">
                        <span><FaBuilding size={10} /> {log.sucursal}</span>
                        <span><FaDesktop size={10} /> {log.ip}</span>
                      </div>
                      <button type="button" className="audit-mobile-btn-view" title="Ver detalle">
                        <FaEye size={11} /> {t('admin.audit_module.table.detail', 'Detalle')}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* MODAL DE TRAZABILIDAD FORENSE */}
        {selectedLogModal && (
          <div
            className="audit-modal-backdrop"
            onClick={() => setSelectedLogModal(null)}
          >
            <div
              className="audit-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="audit-modal-head">
                <div className="audit-modal-head-title">
                  <span className="audit-modal-eyebrow">
                    <FaShieldAlt size={11} /> {t('admin.audit_module.modal.eyebrow', 'REGISTRO FORENSE DE AUDITORÍA')}
                  </span>
                  <h2>{selectedLogModal.id}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLogModal(null)}
                  className="audit-modal-close"
                >
                  <FaTimes size={13} />
                </button>
              </div>

              <div className="audit-modal-body">
                {/* Barra superior de acciones */}
                <div className="audit-modal-status-bar">
                  <div className="audit-modal-result-badge">
                    {renderResultBadge(selectedLogModal.resultado)}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="audit-btn-modal-copy"
                      onClick={() => handleCopyLogId(selectedLogModal.id)}
                    >
                      {copiedId ? <FaCheck size={10} color="#16a34a" /> : <FaCopy size={10} />}
                      {copiedId ? t('admin.audit_module.modal.copied', 'Copiado') : t('admin.audit_module.modal.copyId', 'Copiar ID')}
                    </button>
                    {selectedLogModal.detalles && (
                      <button
                        type="button"
                        className="audit-btn-modal-copy"
                        onClick={() => handleCopyJson(selectedLogModal)}
                      >
                        {copiedJson ? <FaCheck size={10} color="#16a34a" /> : <FaCopy size={10} />}
                        {copiedJson ? t('admin.audit_module.modal.copied', 'Copiado') : t('admin.audit_module.modal.copyJson', 'Copiar JSON')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid de Metadatos */}
                <div className="audit-modal-meta-grid">
                  <div className="audit-modal-meta-item">
                    <span className="audit-modal-meta-label">{t('admin.audit_module.modal.dateTime', 'Fecha y Hora')}</span>
                    <strong>{new Date(selectedLogModal.fecha).toLocaleString('es-CO')}</strong>
                  </div>

                  <div className="audit-modal-meta-item">
                    <span className="audit-modal-meta-label">{t('admin.audit_module.modal.moduleType', 'Módulo / Tipo')}</span>
                    <strong>{selectedLogModal.modulo}</strong>
                    <small>{selectedLogModal.tipo}</small>
                  </div>

                  <div className="audit-modal-meta-item">
                    <span className="audit-modal-meta-label">{t('admin.audit_module.modal.actorUser', 'Actor / Usuario')}</span>
                    <strong>{selectedLogModal.actor}</strong>
                    <small>{selectedLogModal.correo} ({selectedLogModal.rol})</small>
                  </div>

                  <div className="audit-modal-meta-item">
                    <span className="audit-modal-meta-label">{t('admin.audit_module.modal.branch', 'Sucursal')}</span>
                    <strong>{selectedLogModal.sucursal}</strong>
                  </div>

                  <div className="audit-modal-meta-item">
                    <span className="audit-modal-meta-label">{t('admin.audit_module.modal.ipAddress', 'Dirección IP')}</span>
                    <strong style={{ fontFamily: 'monospace' }}>{selectedLogModal.ip}</strong>
                  </div>

                  <div className="audit-modal-meta-item">
                    <span className="audit-modal-meta-label">{t('admin.audit_module.modal.device', 'Dispositivo')}</span>
                    <strong style={{ fontSize: 11.5 }}>{selectedLogModal.dispositivo || 'N/A'}</strong>
                  </div>
                </div>

                {/* Acción Registrada */}
                <div className="audit-modal-section">
                  <span className="audit-modal-meta-label">{t('admin.audit_module.modal.action', 'Acción Registrada')}</span>
                  <div className="audit-modal-box">
                    <p>{selectedLogModal.accion}</p>
                  </div>
                </div>

                {/* Motivo */}
                {selectedLogModal.motivo && (
                  <div className="audit-modal-section">
                    <span className="audit-modal-meta-label">{t('admin.audit_module.modal.reason', 'Motivo o Causa')}</span>
                    <div className="audit-modal-box">
                      <p>{selectedLogModal.motivo}</p>
                    </div>
                  </div>
                )}

                {/* Conversión de Moneda si el evento contiene montos */}
                {selectedLogModal.detalles &&
                  (selectedLogModal.detalles.total ||
                    selectedLogModal.detalles.precioNuevo ||
                    selectedLogModal.detalles.precio ||
                    selectedLogModal.detalles.precioAnterior) && (
                    <div className="audit-modal-section">
                      <span className="audit-modal-meta-label">
                        {t('admin.audit_module.modal.currencyConversion', 'Conversión Monetaria (COP ⇄ USD)')}
                      </span>
                      <div className="audit-modal-currency-card">
                        <div className="audit-currency-box audit-currency-box--cop">
                          <span className="audit-currency-label">{t('admin.audit_module.modal.copLabel', 'Pesos Colombianos')}</span>
                          <strong>
                            $
                            {Number(
                              selectedLogModal.detalles.total ||
                                selectedLogModal.detalles.precioNuevo ||
                                selectedLogModal.detalles.precio ||
                                0
                            ).toLocaleString('es-CO')}{' '}
                            COP
                          </strong>
                        </div>
                        <span className="audit-currency-transfer-icon">⇄</span>
                        <div className="audit-currency-box audit-currency-box--usd">
                          <span className="audit-currency-label">{t('admin.audit_module.modal.usdLabel', 'Dólares Americanos')}</span>
                          <strong>
                            ≈ $
                            {Math.round(
                              Number(
                                selectedLogModal.detalles.total ||
                                  selectedLogModal.detalles.precioNuevo ||
                                  selectedLogModal.detalles.precio ||
                                  0
                              ) / (tasaUSD || 4000)
                            ).toLocaleString('en-US')}{' '}
                            USD
                          </strong>
                        </div>
                      </div>
                      <small className="audit-currency-rate-sub">
                        {t('admin.audit_module.modal.rateApplied', { rate: (tasaUSD || 4000).toLocaleString('es-CO'), defaultValue: `Tasa de cambio calculada: 1 USD ≈ ${(tasaUSD || 4000).toLocaleString('es-CO')} COP` })}
                      </small>
                    </div>
                  )}

                {/* Detalles JSON */}
                {selectedLogModal.detalles && (
                  <div className="audit-modal-section">
                    <span className="audit-modal-meta-label">{t('admin.audit_module.modal.jsonMetadata', 'Metadatos del Evento (JSON)')}</span>
                    <pre className="audit-modal-json-pre">
                      {JSON.stringify(selectedLogModal.detalles, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Sello de seguridad */}
                <div className="audit-modal-watermark">
                  <FaLock size={13} className="audit-modal-watermark-icon" />
                  <span>
                    {t('admin.audit_module.modal.watermark', 'Este registro de auditoría es inmutable y no puede ser alterado ni eliminado según las normativas de trazabilidad de la plataforma.')}
                  </span>
                </div>
              </div>

              <div className="audit-modal-foot">
                <button
                  type="button"
                  className="audit-modal-btn-close"
                  onClick={() => setSelectedLogModal(null)}
                >
                  {t('admin.audit_module.modal.close', 'Cerrar')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
