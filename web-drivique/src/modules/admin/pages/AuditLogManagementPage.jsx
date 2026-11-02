import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FaShieldAlt, FaLock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaBan, FaBuilding, FaRedo, FaGlobe } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { accessAuditService, hasMatchingBranch } from '../../../services/accessAuditService'
import { branchManagementService } from '../../../services/branchManagementService'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './AuditLogManagementPage.css'
import SelectedLogModal from './AuditLogManagementPage/SelectedLogModal'
import AuditCardsView from './AuditLogManagementPage/AuditCardsView'
import AuditTableCard from './AuditLogManagementPage/AuditTableCard'
import AuditPanelCard from './AuditLogManagementPage/AuditPanelCard'
import AuditKpiGrid from './AuditLogManagementPage/AuditKpiGrid'

export default function AuditLogManagementPage({ branchOnly = false }) {
  const { t } = useTranslation()
  const { tema, tasaUSD } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const esModoOscuro = tema === 'oscuro'

  const esEncargado =
    branchOnly ||
    user?.rol === 'encargado' ||
    user?.rol === 'encargado_sucursal' ||
    user?.rol === 'branch_manager'
  const sucursalEncargado = user?.sucursalId || user?.sucursal || user?.sucursalAsignada || ''

  const TIPOS_EVENTO = [
    { value: 'all', label: t('admin.audit_module.types.all', 'Todos los tipos de evento') },
    { value: 'COBRO_SUCURSAL', label: t('hc.cobro_en_mostrador_sucursal', 'Cobro en Mostrador / Sucursal') },
    { value: 'GESTION_RESERVAS', label: t('admin.audit_module.types.reservations', 'Gestión de Reservas') },
    { value: 'AUTENTICACION', label: t('admin.audit_module.types.auth', 'Autenticación y Acceso') },
    { value: 'SEGURIDAD_2FA', label: t('admin.audit_module.types.security2fa', 'Seguridad y 2FA') },
    { value: 'CRUD_VEHICULOS', label: t('admin.audit_module.types.vehicles', 'Gestión de Flota y Vehículos') },
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
    accessAuditService.refresh().catch(() => setLogs([]))
    branchManagementService.refresh().then(loadData).catch(() => {})
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
        const userEmail = String(user?.correo || '').trim().toLowerCase()
        const logEmail = String(log.correo || '').trim().toLowerCase()
        if (userEmail && logEmail === userEmail) {
          // Las acciones ejecutadas por el encargado siempre se le muestran
        } else if (sucursalEncargado) {
          if (!hasMatchingBranch(log.sucursal, sucursalEncargado)) {
            return false
          }
        }
      } else if (branchFilter !== 'all') {
        if (!hasMatchingBranch(log.sucursal, branchFilter)) {
          return false
        }
      }

      // 2. Filtro por tipo de evento
      if (typeFilter !== 'all') {
        const logTipo = String(log.tipo || '').toUpperCase()
        if (typeFilter === 'COBRO_SUCURSAL') {
          if (logTipo !== 'COBRO_SUCURSAL' && !logTipo.includes('COBRO') && !String(log.modulo || '').toLowerCase().includes('cobro')) {
            return false
          }
        } else if (typeFilter === 'GESTION_RESERVAS') {
          if (logTipo !== 'GESTION_RESERVAS' && logTipo !== 'COBRO_SUCURSAL' && !logTipo.includes('RESERVA')) {
            return false
          }
        } else if (logTipo !== typeFilter && !logTipo.includes(typeFilter)) {
          return false
        }
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
      subtitle: t('hc3.audit_generated_by', { defaultValue: 'Generado por {{usuario}} ({{correo}}) - {{fecha}}', usuario: user?.nombre || t('hc3.administrator', 'Administrador'), correo: user?.correo, fecha: new Date().toLocaleString() }),
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
                ? t('admin.audit_module.branchScope', { branch: sucursalEncargado || t('hc2.sucursal_autorizada', 'Sucursal Autorizada') })
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
        <AuditKpiGrid handleResetFilters={handleResetFilters} resultFilter={resultFilter} setResultFilter={setResultFilter} setTypeFilter={setTypeFilter} stats={stats} t={t} typeFilter={typeFilter} />

        {/* PANEL DE CONTROL, BÚSQUEDA Y FILTROS */}
        <AuditPanelCard TIPOS_EVENTO={TIPOS_EVENTO} branchFilter={branchFilter} branches={branches} endDate={endDate} esEncargado={esEncargado} filteredLogs={filteredLogs} handleExportExcel={handleExportExcel} handleExportPdf={handleExportPdf} handlePrint={handlePrint} handleResetFilters={handleResetFilters} mobileFiltersOpen={mobileFiltersOpen} resultFilter={resultFilter} roleFilter={roleFilter} search={search} setBranchFilter={setBranchFilter} setEndDate={setEndDate} setMobileFiltersOpen={setMobileFiltersOpen} setResultFilter={setResultFilter} setRoleFilter={setRoleFilter} setSearch={setSearch} setStartDate={setStartDate} setTypeFilter={setTypeFilter} startDate={startDate} t={t} typeFilter={typeFilter} />

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
            <AuditTableCard filteredLogs={filteredLogs} renderResultBadge={renderResultBadge} setSelectedLogModal={setSelectedLogModal} t={t} />

            {/* 2. VISTA DE CARDS PARA MÓVILES */}
            <AuditCardsView filteredLogs={filteredLogs} renderResultBadge={renderResultBadge} setSelectedLogModal={setSelectedLogModal} t={t} />
          </>
        )}

        {/* MODAL DE TRAZABILIDAD FORENSE */}
        {selectedLogModal && (
          <SelectedLogModal copiedId={copiedId} copiedJson={copiedJson} handleCopyJson={handleCopyJson} handleCopyLogId={handleCopyLogId} renderResultBadge={renderResultBadge} selectedLogModal={selectedLogModal} setSelectedLogModal={setSelectedLogModal} t={t} tasaUSD={tasaUSD} />
        )}
      </main>
    </div>
  )
}
