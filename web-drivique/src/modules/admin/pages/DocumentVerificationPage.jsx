import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaIdCard,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaBuilding,
  FaShieldAlt,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaTimes,
  FaCheckSquare,
  FaRegSquare,
  FaExternalLinkAlt,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { documentVerificationService } from '../../../services/documentVerificationService'
import { reservationManagementService } from '../../../services/reservationManagementService'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import { showAlert } from '../../../utils/swalConfig'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './DocumentVerificationPage.css'

export default function DocumentVerificationPage({ branchOnly = false }) {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const sucursalAsignada = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || 'Alamo BogotÃ¡ - Aeropuerto'

  const [verifications, setVerifications] = useState(() => documentVerificationService.list(user))
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('todos') // 'todos' | 'pendientes' | 'aprobados' | 'rechazados'
  const [notice, setNotice] = useState('')

  // Modal de ValidaciÃ³n de Expediente
  const [modalItem, setModalItem] = useState(null)
  const [observaciones, setObservaciones] = useState('')
  const [zoomPdf, setZoomPdf] = useState(null)

  // Checklist Interactivo en el Modal
  const [modalChecklist, setModalChecklist] = useState({
    cedulaLegible: false,
    identidadCoincide: false,
    licenciaVigente: false,
    categoriaApta: false,
    datosCompletos: false,
  })

  // Obtener estado en tiempo real de las reservas asociadas
  const liveReservations = useMemo(() => {
    try {
      return reservationManagementService.list(user) || []
    } catch {
      return []
    }
  }, [user])

  const reservationMap = useMemo(() => {
    const map = {}
    liveReservations.forEach((r) => {
      const code = r.referencia || r.codigo || r.id
      if (code) {
        map[code] = r.estado || 'confirmada'
      }
    })
    return map
  }, [liveReservations])

  const getUploadDateTime = (fechaSubida) => {
    if (!fechaSubida) return { fecha: 'â€”', hora: 'â€”' }
    const parts = String(fechaSubida).trim().split(' ')
    const fecha = parts[0] || 'â€”'
    const hora = parts[1] || '10:00'
    return { fecha, hora }
  }

  const getReservaStatusBadge = (estadoReserva) => {
    const norm = String(estadoReserva || 'confirmada').toLowerCase().trim()
    if (norm.includes('confirma')) {
      return <span className="doc-reserva-badge confirmada">{t('admin.documents.reservationStatus.confirmed', 'Confirmada')}</span>
    }
    if (norm.includes('curso') || norm.includes('activa')) {
      return <span className="doc-reserva-badge en_curso">{t('admin.documents.reservationStatus.inProgress', 'En curso')}</span>
    }
    if (norm.includes('pend')) {
      return <span className="doc-reserva-badge pendiente">{t('admin.documents.reservationStatus.pending', 'Pendiente')}</span>
    }
    if (norm.includes('fin') || norm.includes('comp')) {
      return <span className="doc-reserva-badge finalizada">{t('admin.documents.reservationStatus.completed', 'Completada')}</span>
    }
    if (norm.includes('canc')) {
      return <span className="doc-reserva-badge cancelada">{t('admin.documents.reservationStatus.cancelled', 'Cancelada')}</span>
    }
    return <span className="doc-reserva-badge confirmada">{estadoReserva}</span>
  }

  const conteoPendientes = useMemo(() => verifications.filter((v) => v.estado === 'pendiente').length, [verifications])
  const conteoAprobados = useMemo(() => verifications.filter((v) => v.estado === 'aprobado').length, [verifications])
  const conteoRechazados = useMemo(() => verifications.filter((v) => v.estado === 'rechazado').length, [verifications])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return verifications.filter((item) => {
      // Tab filter
      if (activeTab === 'pendientes' && item.estado !== 'pendiente') return false
      if (activeTab === 'aprobados' && item.estado !== 'aprobado') return false
      if (activeTab === 'rechazados' && item.estado !== 'rechazado') return false

      const matchQuery =
        !q ||
        item.clienteNombre?.toLowerCase().includes(q) ||
        item.documentoIdentidad?.toLowerCase().includes(q) ||
        item.reservaCodigo?.toLowerCase().includes(q) ||
        item.numeroLicencia?.toLowerCase().includes(q) ||
        item.vehiculoNombre?.toLowerCase().includes(q)

      return matchQuery
    })
  }, [verifications, search, activeTab])

  const handleOpenReview = (item) => {
    setModalItem(item)
    setObservaciones(item.observaciones || '')
    setModalChecklist(
      item.checklist || {
        cedulaLegible: item.estado === 'aprobado',
        identidadCoincide: item.estado === 'aprobado',
        licenciaVigente: item.estado === 'aprobado',
        categoriaApta: item.estado === 'aprobado',
        datosCompletos: item.estado === 'aprobado',
      }
    )
  }

  const handleToggleCheck = (key) => {
    setModalChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const renderDocPreview = (url, titleLabel) => {
    if (!url) {
      return (
        <div className="doc-preview-empty">
          <FaFilePdf style={{ fontSize: 32, opacity: 0.4 }} />
          <span>{t('admin.documents.modal.notAvailable', 'No disponible')}</span>
        </div>
      )
    }

    const isPdf = url.toLowerCase().includes('.pdf')

    if (!isPdf) {
      return (
        <div className="doc-preview-container" onClick={() => setZoomPdf({ url, title: titleLabel })} title={t('admin.documents.modal.clickToZoom', 'Clic para ampliar documento')}>
          <img src={url} alt={titleLabel} className="doc-preview-img" />
          <div className="doc-preview-hover-overlay">
            <FaEye /> {t('admin.documents.modal.zoomLabel', 'Ampliar')}
          </div>
        </div>
      )
    }

    return (
      <div className="doc-preview-container" onClick={() => setZoomPdf({ url, title: titleLabel })} title={t('admin.documents.modal.clickToZoom', 'Clic para ampliar documento')}>
        <iframe
          src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
          title={titleLabel}
          className="doc-preview-iframe"
          scrolling="no"
        />
        <div className="doc-preview-hover-overlay">
          <FaEye /> {t('admin.documents.modal.zoomPdfLabel', 'Ampliar PDF')}
        </div>
      </div>
    )
  }

  const handleAprobarDocumento = async () => {
    if (!modalItem) return

    documentVerificationService.actualizarEstado(
      modalItem.id,
      'aprobado',
      observaciones || t('admin.documents.defaultApproveObs', 'Documentos validados y aprobados correctamente por la sucursal.'),
      user?.nombre || 'Encargado de Sucursal',
      modalChecklist
    )
    setVerifications(documentVerificationService.list(user))
    setModalItem(null)
    setNotice(`âœ… ${t('admin.documents.alerts.approvedNotice', 'Los documentos de {{name}} ({{code}}) fueron aprobados.', { name: modalItem.clienteNombre, code: modalItem.reservaCodigo })}`)

    showAlert({
      icon: 'success',
      title: t('admin.documents.alerts.approvedTitle', 'DocumentaciÃ³n Aprobada'),
      text: t('admin.documents.alerts.approvedText', 'Se ha confirmado la aprobaciÃ³n de documentos para la reserva {{code}}. Se enviÃ³ confirmaciÃ³n al correo del cliente y a su panel de notificaciones.', { code: modalItem.reservaCodigo }),
    })
  }

  const handleRechazarDocumento = async () => {
    if (!modalItem) return
    if (!observaciones.trim()) {
      showAlert({
        icon: 'warning',
        title: t('admin.documents.alerts.reasonRequiredTitle', 'Motivo requerido'),
        text: t('admin.documents.alerts.reasonRequiredText', 'Por favor indica la razÃ³n del rechazo para que el cliente sepa quÃ© documento corregir.'),
      })
      return
    }

    documentVerificationService.actualizarEstado(
      modalItem.id,
      'rechazado',
      observaciones,
      user?.nombre || 'Encargado de Sucursal',
      modalChecklist
    )
    setVerifications(documentVerificationService.list(user))
    setModalItem(null)
    setNotice(`âŒ ${t('admin.documents.alerts.rejectedNotice', 'Se registrÃ³ el rechazo de documentos para la reserva {{code}}.', { code: modalItem.reservaCodigo })}`)

    showAlert({
      icon: 'error',
      title: t('admin.documents.alerts.rejectedTitle', 'DocumentaciÃ³n Rechazada'),
      text: t('admin.documents.alerts.rejectedText', 'Se ha notificado el rechazo de documentos para la reserva {{code}} al correo y notificaciones del usuario.', { code: modalItem.reservaCodigo }),
    })
  }

  // ExportaciÃ³n
  const exportData = {
    title: t('admin.documents.exportTitle', 'ValidaciÃ³n de Documentos de Identidad y Licencias â€” Drivique'),
    headers: [
      t('admin.documents.table.id', 'ID'),
      t('admin.documents.table.reservationCode', 'CÃ“DIGO RESERVA'),
      t('admin.documents.table.clientName', 'NOMBRE CLIENTE'),
      t('admin.documents.table.documentNumber', 'NÃšMERO DE DOCUMENTO'),
      t('admin.documents.table.licenseNumber', 'NÃšMERO DE CONDUCCIÃ“N'),
      t('admin.documents.table.vehicleName', 'NOMBRE VEHÃCULO'),
      t('admin.documents.table.reservationStatus', 'ESTADO DE RESERVA'),
      t('admin.documents.table.uploadDate', 'FECHA SUBIDA'),
      t('admin.documents.table.uploadTime', 'HORA SUBIDA'),
      t('admin.documents.table.status', 'ESTADO'),
      t('admin.documents.table.observations', 'Observaciones'),
    ],
    rows: filtered.map((item, index) => {
      const { fecha, hora } = getUploadDateTime(item.fechaSubida)
      const resState = reservationMap[item.reservaCodigo] || item.reservaEstado || 'confirmada'
      return [
        index + 1,
        item.reservaCodigo,
        item.clienteNombre,
        item.documentoIdentidad,
        item.numeroLicencia,
        item.vehiculoNombre || item.vehiculo || 'VehÃ­culo Reservado',
        resState,
        fecha,
        hora,
        item.estado,
        item.observaciones || t('admin.documents.noObservations', 'Sin observaciones'),
      ]
    }),
    items: filtered,
    filename: `documentos-sucursal-${new Date().toISOString().slice(0, 10)}`,
  }

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'aprobado':
        return <span className="doc-status-badge aprobado">{t('admin.documents.status.approved', 'Aprobado')}</span>
      case 'rechazado':
        return <span className="doc-status-badge rechazado">{t('admin.documents.status.rejected', 'Rechazado')}</span>
      case 'pendiente':
      default:
        return <span className="doc-status-badge pendiente">{t('admin.documents.status.pending', 'Pendiente')}</span>
    }
  }

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={branchOnly} />

      <main className="management-main doc-verification-main">
        <div className="cities-container" style={{ maxWidth: '100%' }}>
          {/* Header Superior idÃ©ntico al estÃ¡ndar del Administrador */}
          <header className="cities-topbar reservations-management-header">
            <div className="branch-topbar-brand-title">
              <span className="branch-topbar-badge">{t('admin.branchManagement', 'GESTIÃ“N DE SUCURSAL')}</span>
              <h1 className="branch-topbar-heading">{t('admin.documents.title', 'ValidaciÃ³n de Documentos')}</h1>
            </div>

            <div className="cities-topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <MenuConfiguracion />
              <div className="doc-topbar-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--city-card, #ffffff)', border: '1.5px solid var(--city-border, #e2e8f0)', borderRadius: '30px', padding: '4px 16px 4px 6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', color: 'var(--city-card, #ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                  {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'A'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="doc-topbar-profile-name" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--city-text, #0f172a)', lineHeight: '1.2' }}>{user?.nombre || 'Administrador'}</span>
                  <span className="doc-topbar-profile-role" style={{ fontSize: '11px', color: 'var(--city-muted, #64748b)', lineHeight: '1.2' }}>{user?.rol || 'encargado'}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Tarjetas KPI Superiores */}
          <div className="cash-kpi-bar doc-kpi-bar">
            {/* KPI 1: Pendientes */}
            <div className="cash-kpi-item-light" style={{ background: 'var(--city-card, #ffffff)', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="cash-kpi-header-light" style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', fontWeight: 700, marginBottom: 8 }}>
                <FaIdCard />
                <span>{t('admin.documents.kpis.pending', 'Pendientes por Validar')}</span>
              </div>
              <strong className="cash-kpi-val-light" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--city-text, #0f172a)', display: 'block', marginBottom: 8 }}>
                {conteoPendientes}
              </strong>
              <div className="cash-kpi-progress-bg" style={{ width: '100%', height: 4, background: 'var(--city-border, #f1f5f9)', borderRadius: 2, marginBottom: 8 }}>
                <div className="cash-kpi-progress-fill" style={{ width: '100%', height: '100%', background: '#f59e0b', borderRadius: 2 }}></div>
              </div>
              <span className="cash-kpi-subtitle-light" style={{ fontSize: '11.5px', color: 'var(--city-muted, #64748b)' }}>{t('admin.documents.kpis.pendingSub', 'En espera de revisiÃ³n')}</span>
            </div>

            {/* KPI 2: Aprobados por Sucursal */}
            <div className="cash-kpi-item-light" style={{ background: 'var(--city-card, #ffffff)', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="cash-kpi-header-light" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', fontWeight: 700, marginBottom: 8 }}>
                <FaCheckCircle />
                <span>{t('admin.documents.kpis.approved', 'Aprobados por Sucursal')}</span>
              </div>
              <strong className="cash-kpi-val-light" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--city-text, #0f172a)', display: 'block', marginBottom: 8 }}>
                {conteoAprobados}
              </strong>
              <div className="cash-kpi-progress-bg" style={{ width: '100%', height: 4, background: 'var(--city-border, #f1f5f9)', borderRadius: 2, marginBottom: 8 }}>
                <div className="cash-kpi-progress-fill" style={{ width: '100%', height: '100%', background: '#10b981', borderRadius: 2 }}></div>
              </div>
              <span className="cash-kpi-subtitle-light" style={{ fontSize: '11.5px', color: 'var(--city-muted, #64748b)' }}>{t('admin.documents.kpis.approvedSub', 'Verificados por el encargado')}</span>
            </div>

            {/* KPI 3: Rechazados por Sucursal */}
            <div className="cash-kpi-item-light" style={{ background: 'var(--city-card, #ffffff)', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="cash-kpi-header-light" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', fontWeight: 700, marginBottom: 8 }}>
                <FaTimesCircle />
                <span>{t('admin.documents.kpis.rejected', 'Rechazados por Sucursal')}</span>
              </div>
              <strong className="cash-kpi-val-light" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--city-text, #0f172a)', display: 'block', marginBottom: 8 }}>
                {conteoRechazados}
              </strong>
              <div className="cash-kpi-progress-bg" style={{ width: '100%', height: 4, background: 'var(--city-border, #f1f5f9)', borderRadius: 2, marginBottom: 8 }}>
                <div className="cash-kpi-progress-fill" style={{ width: '100%', height: '100%', background: '#ef4444', borderRadius: 2 }}></div>
              </div>
              <span className="cash-kpi-subtitle-light" style={{ fontSize: '11.5px', color: 'var(--city-muted, #64748b)' }}>{t('admin.documents.kpis.rejectedSub', 'Requieren correcciÃ³n del cliente')}</span>
            </div>

            {/* KPI 4: Total Expedientes */}
            <div className="cash-kpi-item-light" style={{ background: 'var(--city-card, #ffffff)', border: '1px solid var(--city-border, #e2e8f0)', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="cash-kpi-header-light" style={{ color: 'var(--brand-primary, #3b82f6)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', fontWeight: 700, marginBottom: 8 }}>
                <FaShieldAlt />
                <span>{t('admin.documents.kpis.total', 'Total Expedientes')}</span>
              </div>
              <strong className="cash-kpi-val-light" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--city-text, #0f172a)', display: 'block', marginBottom: 8 }}>
                {verifications.length}
              </strong>
              <div className="cash-kpi-progress-bg" style={{ width: '100%', height: 4, background: 'var(--city-border, #f1f5f9)', borderRadius: 2, marginBottom: 8 }}>
                <div className="cash-kpi-progress-fill" style={{ width: '100%', height: '100%', background: 'var(--brand-primary, #3b82f6)', borderRadius: 2 }}></div>
              </div>
              <span className="cash-kpi-subtitle-light" style={{ fontSize: '11.5px', color: 'var(--city-muted, #64748b)' }}>{t('admin.documents.kpis.totalSub', 'Registros en sucursal')}</span>
            </div>
          </div>

          {/* NotificaciÃ³n de Aviso */}
          {notice && (
            <div className="cities-notice" role="status" style={{ marginBottom: 16 }}>
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice('')}>
                Ã—
              </button>
            </div>
          )}

          {/* PestaÃ±as de Secciones Adheridas */}
          <div className="fleet-attached-tabs">
            <div className="fleet-tabs-nav">
              <button
                type="button"
                onClick={() => setActiveTab('todos')}
                className={`fleet-tab-btn ${activeTab === 'todos' ? 'is-active' : ''}`}
              >
                {t('admin.documents.tabs.all', 'Todos los Expedientes')} ({verifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pendientes')}
                className={`fleet-tab-btn ${activeTab === 'pendientes' ? 'is-active' : ''}`}
              >
                {t('admin.documents.tabs.pending', 'Pendientes')} ({conteoPendientes})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('aprobados')}
                className={`fleet-tab-btn ${activeTab === 'aprobados' ? 'is-active' : ''}`}
              >
                {t('admin.documents.tabs.approved', 'Aprobados')} ({conteoAprobados})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rechazados')}
                className={`fleet-tab-btn ${activeTab === 'rechazados' ? 'is-active' : ''}`}
              >
                {t('admin.documents.tabs.rejected', 'Rechazados')} ({conteoRechazados})
              </button>
            </div>
          </div>

          {/* Tarjeta Principal */}
          <section className="cities-card attached-to-tabs">
            {/* Toolbar con Buscador, Filtros y Botones de ExportaciÃ³n */}
            <div className="cities-toolbar doc-toolbar-wrapper">
              {/* Buscador general en vivo */}
              <label className="cities-search" style={{ flex: '1 1 250px', margin: 0 }}>
                <FaSearch />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('admin.documents.searchPlaceholder', 'Buscar por cÃ³digo, cliente, cÃ©dula, licencia...')}
                />
              </label>

              {/* Indicador de Sucursal Asignada */}
              <div className="doc-branch-badge">
                <FaBuilding style={{ color: 'var(--city-muted, #64748b)' }} />
                <span>{sucursalAsignada}</span>
              </div>

              {/* Botones de ExportaciÃ³n con pÃ­ldoras */}
              <div className="export-pills-group" style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="export-pill export-pill--excel"
                  onClick={() => exportExcel(exportData)}
                  title={t('admin.exportExcel', 'Excel')}
                >
                  <FaFileExcel aria-hidden="true" /> {t('admin.exportExcel', 'Excel')}
                </button>
                <button
                  type="button"
                  className="export-pill export-pill--pdf"
                  onClick={() => exportPdf(exportData)}
                  title={t('admin.exportPdf', 'PDF')}
                >
                  <FaFilePdf aria-hidden="true" /> {t('admin.exportPdf', 'PDF')}
                </button>
                <button
                  type="button"
                  className="export-pill export-pill--print"
                  onClick={() => printTable(exportData)}
                  title={t('admin.incidents.print', 'Imprimir')}
                >
                  <FaPrint aria-hidden="true" /> {t('admin.incidents.print', 'Imprimir')}
                </button>
              </div>
            </div>

            {/* Contador de Resultados */}
            <div className="cities-summary" style={{ margin: '8px 0 12px' }}>
              <span>{filtered.length}</span>{' '}
              {t('admin.documents.foundCount', 'EXPEDIENTES EN EL LISTADO').toUpperCase()}
            </div>

            {/* Contenido: Tabla para Desktop + Cards para MÃ³vil */}
            {filtered.length === 0 ? (
              <div className="cities-empty">
                <FaIdCard style={{ fontSize: 44, color: '#94a3b8', marginBottom: 12 }} />
                <h2>{t('admin.documents.emptyTitle', 'No se encontraron expedientes de documentaciÃ³n')}</h2>
                <p>{t('admin.documents.emptyDesc', 'No hay registros que coincidan con la pestaÃ±a o los tÃ©rminos de bÃºsqueda seleccionados.')}</p>
              </div>
            ) : (
              <>
                {/* 1. Vista de Tabla Completa para Escritorio & Tablets */}
                <div className="cities-table-wrap doc-desktop-table" style={{ overflowX: 'auto' }}>
                  <table className="incidents-table-v2" style={{ whiteSpace: 'nowrap', width: 'max-content', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>{t('admin.documents.table.id', 'ID')}</th>
                        <th>{t('admin.documents.table.reservationCode', 'CÃ“DIGO RESERVA')}</th>
                        <th>{t('admin.documents.table.clientName', 'NOMBRE CLIENTE')}</th>
                        <th>{t('admin.documents.table.documentNumber', 'NÃšMERO DE DOCUMENTO')}</th>
                        <th>{t('admin.documents.table.identityDoc', 'DOCUMENTO DE IDENTIDAD')}</th>
                        <th>{t('admin.documents.table.licenseNumber', 'NÃšMERO DE CONDUCCIÃ“N')}</th>
                        <th>{t('admin.documents.table.driverLicense', 'LICENCIA DE CONDUCCIÃ“N')}</th>
                        <th>{t('admin.documents.table.vehicleName', 'NOMBRE VEHÃCULO')}</th>
                        <th style={{ textAlign: 'center' }}>{t('admin.documents.table.reservationStatus', 'ESTADO DE RESERVA')}</th>
                        <th>{t('admin.documents.table.uploadDate', 'FECHA SUBIDA')}</th>
                        <th>{t('admin.documents.table.uploadTime', 'HORA SUBIDA')}</th>
                        <th style={{ textAlign: 'center' }}>{t('admin.documents.table.status', 'ESTADO')}</th>
                        <th style={{ textAlign: 'center' }}>{t('admin.documents.table.actions', 'ACCIONES')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item, index) => {
                        const docIdFile = item.documentoIdentidadPdf || `Cedula-${item.documentoIdentidad}.pdf`
                        const licFile = item.licenciaConduccionPdf || `Licencia-${item.documentoIdentidad}.pdf`
                        const docIdUrl = item.fotoCedulaFrente || item.pdfCedulaUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
                        const licUrl = item.fotoLicenciaFrente || item.pdfLicenciaUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
                        const { fecha, hora } = getUploadDateTime(item.fechaSubida)
                        const resState = reservationMap[item.reservaCodigo] || item.reservaEstado || 'confirmada'

                        return (
                          <tr key={item.id}>
                            <td style={{ fontWeight: 600, color: 'var(--city-text, #0f172a)', width: '40px' }}>{index + 1}</td>
                            <td style={{ fontWeight: 700, color: 'var(--city-text, #0f172a)' }}>{item.reservaCodigo}</td>
                            <td style={{ color: 'var(--city-text, #0f172a)', fontWeight: 600 }}>{item.clienteNombre}</td>
                            <td style={{ color: 'var(--city-text, #334155)' }}>{item.documentoIdentidad}</td>
                            
                            {/* Columna Documento de Identidad (Link PDF con Ã­cono rojo) */}
                            <td>
                              <div
                                className="doc-table-pdf-link"
                                onClick={() => setZoomPdf({
                                  url: docIdUrl,
                                  title: `${t('admin.documents.table.identityDoc', 'Documento de Identidad')} - ${item.clienteNombre}`
                                })}
                                title={t('admin.documents.table.openDocTooltip', 'Clic para abrir documento')}
                              >
                                <FaFilePdf />
                                <span>{docIdFile}</span>
                              </div>
                            </td>

                            {/* Columna NÃºmero de ConducciÃ³n (Texto limpio, sin fondo gris) */}
                            <td style={{ color: 'var(--city-text, #334155)', fontWeight: 600 }}>
                              {item.numeroLicencia}
                            </td>

                            {/* Columna Licencia de ConducciÃ³n (Link PDF con Ã­cono rojo) */}
                            <td>
                              <div
                                className="doc-table-pdf-link"
                                onClick={() => setZoomPdf({
                                  url: licUrl,
                                  title: `${t('admin.documents.table.driverLicense', 'Licencia de ConducciÃ³n')} - ${item.clienteNombre}`
                                })}
                                title={t('admin.documents.table.openDocTooltip', 'Clic para abrir documento')}
                              >
                                <FaFilePdf />
                                <span>{licFile}</span>
                              </div>
                            </td>

                            {/* Columna Nombre VehÃ­culo */}
                            <td style={{ color: 'var(--city-text, #0f172a)', fontWeight: 600 }}>
                              {item.vehiculoNombre || item.vehiculo || 'VehÃ­culo Reservado'}
                            </td>

                            {/* Columna Estado de Reserva (Actualizado en tiempo real) */}
                            <td style={{ textAlign: 'center' }}>
                              {getReservaStatusBadge(resState)}
                            </td>

                            {/* Columna Fecha Subida */}
                            <td style={{ color: 'var(--city-muted, #64748b)' }}>{fecha}</td>

                            {/* Columna Hora Subida */}
                            <td style={{ color: 'var(--city-muted, #64748b)' }}>{hora}</td>

                            {/* Columna Estado de ValidaciÃ³n */}
                            <td style={{ textAlign: 'center' }}>
                              {getStatusBadge(item.estado)}
                            </td>

                            {/* Columna Acciones */}
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenReview(item)}
                                style={{
                                  padding: '7px 22px',
                                  borderRadius: '9999px',
                                  background: '#2563eb',
                                  color: 'var(--city-card, #ffffff)',
                                  border: 'none',
                                  fontWeight: 800,
                                  fontSize: '12.5px',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 5px rgba(37, 99, 235, 0.25)',
                                  transition: 'all 0.2s',
                                  whiteSpace: 'nowrap',
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'var(--brand-primary, #1d4ed8)' }}
                                onMouseOut={(e) => { e.currentTarget.style.background = '#2563eb' }}
                              >
                                {t('admin.documents.table.validateBtn', 'Validar')}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 2. Vista de Tarjetas Adaptativas para Pantallas MÃ³viles */}
                <div className="doc-mobile-cards">
                  {filtered.map((item, index) => {
                    const docIdFile = item.documentoIdentidadPdf || `Cedula-${item.documentoIdentidad}.pdf`
                    const licFile = item.licenciaConduccionPdf || `Licencia-${item.documentoIdentidad}.pdf`
                    const docIdUrl = item.fotoCedulaFrente || item.pdfCedulaUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
                    const licUrl = item.fotoLicenciaFrente || item.pdfLicenciaUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
                    const { fecha, hora } = getUploadDateTime(item.fechaSubida)
                    const resState = reservationMap[item.reservaCodigo] || item.reservaEstado || 'confirmada'

                    return (
                      <div key={item.id} className="doc-mobile-card">
                        <div className="doc-mobile-card-header">
                          <div className="doc-mobile-card-title">
                            <span style={{ fontWeight: 800, color: 'var(--brand-primary, #2563eb)', fontSize: 13 }}>#{index + 1}</span>
                            <span style={{ fontWeight: 800, color: 'var(--city-text, #0f172a)', fontSize: 14 }}>{item.reservaCodigo}</span>
                          </div>
                          {getStatusBadge(item.estado)}
                        </div>

                        <div className="doc-mobile-card-body">
                          <div className="doc-mobile-data-item doc-mobile-data-item--full">
                            <span className="doc-mobile-data-label">{t('admin.documents.table.clientName', 'Nombre Cliente')}</span>
                            <span className="doc-mobile-data-value" style={{ fontSize: 14 }}>{item.clienteNombre}</span>
                          </div>

                          <div className="doc-mobile-data-item">
                            <span className="doc-mobile-data-label">{t('admin.documents.table.documentNumber', 'NÂº Documento')}</span>
                            <span className="doc-mobile-data-value">{item.documentoIdentidad}</span>
                          </div>

                          <div className="doc-mobile-data-item">
                            <span className="doc-mobile-data-label">{t('admin.documents.table.licenseNumber', 'NÃºmero de ConducciÃ³n')}</span>
                            <span className="doc-mobile-data-value" style={{ fontWeight: 600 }}>
                              {item.numeroLicencia}
                            </span>
                          </div>

                          <div className="doc-mobile-data-item doc-mobile-data-item--full">
                            <span className="doc-mobile-data-label">{t('admin.documents.table.vehicleName', 'Nombre VehÃ­culo')}</span>
                            <span className="doc-mobile-data-value">{item.vehiculoNombre || item.vehiculo || 'VehÃ­culo Reservado'}</span>
                          </div>

                          <div className="doc-mobile-data-item">
                            <span className="doc-mobile-data-label">{t('admin.documents.table.reservationStatus', 'Estado de Reserva')}</span>
                            <div style={{ marginTop: 2 }}>{getReservaStatusBadge(resState)}</div>
                          </div>

                          <div className="doc-mobile-data-item">
                            <span className="doc-mobile-data-label">{t('admin.documents.table.uploadDate', 'Fecha / Hora Subida')}</span>
                            <span className="doc-mobile-data-value" style={{ color: 'var(--city-muted, #64748b)', fontSize: 12 }}>
                              {fecha} â€¢ {hora}
                            </span>
                          </div>
                        </div>

                        {/* Documentos subidos links mÃ³viles */}
                        <div className="doc-mobile-card-docs">
                          <div
                            className="doc-table-pdf-link"
                            onClick={() => setZoomPdf({
                              url: docIdUrl,
                              title: `${t('admin.documents.table.identityDoc', 'Documento de Identidad')} - ${item.clienteNombre}`
                            })}
                          >
                            <FaFilePdf />
                            <span>{t('admin.documents.modal.idDocCard', 'CÃ©dula')}: {docIdFile}</span>
                          </div>

                          <div
                            className="doc-table-pdf-link"
                            onClick={() => setZoomPdf({
                              url: licUrl,
                              title: `${t('admin.documents.table.driverLicense', 'Licencia de ConducciÃ³n')} - ${item.clienteNombre}`
                            })}
                          >
                            <FaFilePdf />
                            <span>{t('admin.documents.modal.licenseCard', 'Licencia')}: {licFile}</span>
                          </div>
                        </div>

                        <div className="doc-mobile-card-actions">
                          <button
                            type="button"
                            onClick={() => handleOpenReview(item)}
                            style={{
                              width: '100%',
                              padding: '9px 18px',
                              borderRadius: '12px',
                              background: '#2563eb',
                              color: 'var(--city-card, #ffffff)',
                              border: 'none',
                              fontWeight: 800,
                              fontSize: '13px',
                              cursor: 'pointer',
                              boxShadow: '0 2px 5px rgba(37, 99, 235, 0.25)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8,
                            }}
                          >
                            {t('admin.documents.table.validateBtn', 'Validar')}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </section>
        </div>

        {/* Modal de Validación con Checklist Independiente por Documento */}
        {modalItem && (
          <div
            className="cities-modal-backdrop"
            onClick={() => setModalItem(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              padding: 16,
            }}
          >
            <div className="doc-modal-card" onClick={(e) => e.stopPropagation()}>
              
              {/* Header Limpio del Modal */}
              <div className="doc-modal-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--city-text, #0f172a)' }}>
                      {t('admin.documents.modal.title', 'Validar Documentos')}
                    </h2>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'var(--city-soft, #eff6ff)', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                      {modalItem.reservaCodigo}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: 'var(--city-muted, #64748b)' }}>
                    {t('admin.documents.modal.vehicle', 'Vehículo')}: <strong>{modalItem.vehiculoNombre || modalItem.vehiculo || 'Vehículo Reservado'}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalItem(null)}
                  title={t('admin.documents.modal.closeBtn', 'Cerrar')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: 26,
                    lineHeight: 1,
                    cursor: 'pointer',
                    color: 'var(--city-muted, #64748b)',
                    padding: '0 2px',
                    flexShrink: 0,
                    fontWeight: 300,
                  }}
                >
                  &times;
                </button>
              </div>

              {/* Tira Resumen de Datos Clave */}
              <div className="doc-modal-summary-strip">
                <div>
                  <span style={{ color: 'var(--city-muted, #64748b)', fontSize: 11, display: 'block', marginBottom: 2 }}>{t('admin.documents.modal.client', 'Cliente / Titular')}</span>
                  <strong style={{ fontSize: 13, color: 'var(--city-text, #0f172a)' }}>{modalItem.clienteNombre}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--city-muted, #64748b)', fontSize: 11, display: 'block', marginBottom: 2 }}>{t('admin.documents.modal.docNumber', 'No. Documento')}</span>
                  <strong style={{ fontSize: 13, color: 'var(--city-text, #0f172a)' }}>{modalItem.documentoIdentidad}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--city-muted, #64748b)', fontSize: 11, display: 'block', marginBottom: 2 }}>{t('admin.documents.modal.license', 'Licencia')}</span>
                  <strong style={{ fontSize: 13, color: 'var(--city-text, #0f172a)' }}>
                    {modalItem.numeroLicencia} ({modalItem.categoriaLicencia})
                  </strong>
                </div>
              </div>

              {/* TARJETA DOCUMENTO 1: CÉDULA DE IDENTIDAD */}
              <div className="doc-item-card">
                <div className="doc-item-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaIdCard style={{ color: '#2563eb', fontSize: 16 }} />
                    <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--city-text, #0f172a)' }}>
                      {t('admin.documents.modal.idDocCard', 'Cédula de Identidad')}
                    </span>
                  </div>
                  <span className="doc-item-card-subinfo">
                    {t('admin.documents.modal.docNumber', 'No. Documento')}: <strong>{modalItem.documentoIdentidad}</strong>
                  </span>
                </div>
                <div className="doc-item-card-grid">
                  <div>
                    {renderDocPreview(
                      modalItem.fotoCedulaFrente || modalItem.pdfCedulaUrl,
                      `${t('admin.documents.modal.idDocCard', 'Cédula de Identidad')} - ${modalItem.clienteNombre}`
                    )}
                  </div>
                  <div>
                    <div className="doc-checklist-box" style={{ marginBottom: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: 'var(--city-text, #0f172a)', marginBottom: 10 }}>
                        <FaShieldAlt style={{ color: '#2563eb' }} />
                        <span>{t('admin.documents.modal.idChecklistTitle', 'Verificación de Cédula')}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div className="doc-check-item" onClick={() => handleToggleCheck('cedulaLegible')}>
                          {modalChecklist.cedulaLegible ? <FaCheckSquare style={{ color: '#16a34a', fontSize: 16, flexShrink: 0 }} /> : <FaRegSquare style={{ color: '#94a3b8', fontSize: 16, flexShrink: 0 }} />}
                          <span style={{ color: modalChecklist.cedulaLegible ? '#16a34a' : 'var(--city-text, #334155)', fontWeight: modalChecklist.cedulaLegible ? 600 : 400 }}>
                            {t('admin.documents.modal.check1', '1. Cédula de Identidad es legible, nítida y completa.')}
                          </span>
                        </div>
                        <div className="doc-check-item" onClick={() => handleToggleCheck('identidadCoincide')}>
                          {modalChecklist.identidadCoincide ? <FaCheckSquare style={{ color: '#16a34a', fontSize: 16, flexShrink: 0 }} /> : <FaRegSquare style={{ color: '#94a3b8', fontSize: 16, flexShrink: 0 }} />}
                          <span style={{ color: modalChecklist.identidadCoincide ? '#16a34a' : 'var(--city-text, #334155)', fontWeight: modalChecklist.identidadCoincide ? 600 : 400 }}>
                            {t('admin.documents.modal.check2', '2. Número de documento y nombre coinciden con la reserva.')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TARJETA DOCUMENTO 2: LICENCIA DE CONDUCCIÓN */}
              <div className="doc-item-card">
                <div className="doc-item-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaIdCard style={{ color: '#2563eb', fontSize: 16 }} />
                    <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--city-text, #0f172a)' }}>
                      {t('admin.documents.modal.licenseCard', 'Licencia de Conducción')}
                    </span>
                  </div>
                  <span className="doc-item-card-subinfo">
                    {t('admin.documents.modal.license', 'Licencia')}: <strong>{modalItem.numeroLicencia} ({modalItem.categoriaLicencia})</strong>
                  </span>
                </div>
                <div className="doc-item-card-grid">
                  <div>
                    {renderDocPreview(
                      modalItem.fotoLicenciaFrente || modalItem.pdfLicenciaUrl,
                      `${t('admin.documents.modal.licenseCard', 'Licencia de Conducción')} - ${modalItem.clienteNombre}`
                    )}
                  </div>
                  <div>
                    <div className="doc-checklist-box" style={{ marginBottom: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: 'var(--city-text, #0f172a)', marginBottom: 10 }}>
                        <FaShieldAlt style={{ color: '#2563eb' }} />
                        <span>{t('admin.documents.modal.licenseChecklistTitle', 'Verificación de Licencia')}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div className="doc-check-item" onClick={() => handleToggleCheck('licenciaVigente')}>
                          {modalChecklist.licenciaVigente ? <FaCheckSquare style={{ color: '#16a34a', fontSize: 16, flexShrink: 0 }} /> : <FaRegSquare style={{ color: '#94a3b8', fontSize: 16, flexShrink: 0 }} />}
                          <span style={{ color: modalChecklist.licenciaVigente ? '#16a34a' : 'var(--city-text, #334155)', fontWeight: modalChecklist.licenciaVigente ? 600 : 400 }}>
                            {t('admin.documents.modal.check3', '3. La Licencia de Conducción se encuentra vigente durante todo el alquiler.')}
                          </span>
                        </div>
                        <div className="doc-check-item" onClick={() => handleToggleCheck('categoriaApta')}>
                          {modalChecklist.categoriaApta ? <FaCheckSquare style={{ color: '#16a34a', fontSize: 16, flexShrink: 0 }} /> : <FaRegSquare style={{ color: '#94a3b8', fontSize: 16, flexShrink: 0 }} />}
                          <span style={{ color: modalChecklist.categoriaApta ? '#16a34a' : 'var(--city-text, #334155)', fontWeight: modalChecklist.categoriaApta ? 600 : 400 }}>
                            {t('admin.documents.modal.check4', '4. La categoría de la licencia autoriza conducir el tipo de vehículo.')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* OBSERVACIONES */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--city-muted, #64748b)' }}>
                  {t('admin.documents.modal.observationsLabel', 'Observaciones / Motivo (se notificará al cliente):')}
                </label>
                <textarea
                  rows={3}
                  className="doc-modal-textarea"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder={t('admin.documents.modal.observationsPlaceholder', 'Opcional al aprobar. Si rechazas, indica la razón para que el cliente la corrija...')}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--city-border, #cbd5e1)', fontSize: 13, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px' }}
                />
              </div>

              {/* BOTONES DE DECISIÓN (Sin botón Close) */}
              <div className="doc-modal-decision-btns" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, borderTop: '1px solid var(--city-border, #e2e8f0)', paddingTop: 16 }}>
                <button
                  type="button"
                  onClick={handleRechazarDocumento}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 9999,
                    background: '#dc2626',
                    color: 'var(--city-card, #ffffff)',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                  }}
                >
                  {t('admin.documents.modal.rejectBtn', 'Desaprobado')}
                </button>
                <button
                  type="button"
                  onClick={handleAprobarDocumento}
                  style={{
                    padding: '10px 28px',
                    borderRadius: 9999,
                    background: '#16a34a',
                    color: 'var(--city-card, #ffffff)',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                  }}
                >
                  {t('admin.documents.modal.approveBtn', 'Aprobado')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Visor de Documentos / Lightbox Adaptable */}
        {zoomPdf && (
          <div
            className="doc-zoom-backdrop"
            onClick={() => setZoomPdf(null)}
          >
            <div
              className={`doc-zoom-modal ${
                zoomPdf.url?.toLowerCase().includes('.pdf')
                  ? 'doc-zoom-modal--iframe'
                  : ''
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="doc-zoom-header">
                <div className="doc-zoom-title-box">
                  <h3 className="doc-zoom-title">{zoomPdf.title}</h3>
                  <span className="doc-zoom-subtitle">
                    <FaEye style={{ color: '#2563eb' }} />
                    {t('admin.documents.modal.previewTitle', 'Vista previa del documento')}
                  </span>
                </div>
                <div className="doc-zoom-actions">
                  {zoomPdf.url && (
                    <a
                      href={zoomPdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="doc-zoom-btn-action"
                      title={t('admin.documents.openNewTab', 'Abrir original')}
                    >
                      <FaExternalLinkAlt style={{ fontSize: 11 }} />
                      <span>{t('admin.documents.openNewTab', 'Abrir original')}</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setZoomPdf(null)}
                    className="doc-modal-close"
                    title={t('admin.documents.modal.closeBtn', 'Cerrar')}
                  >
                    &times;
                  </button>
                </div>
              </div>

              <div className="doc-zoom-preview-box">
                {!zoomPdf.url?.toLowerCase().includes('.pdf') ? (
                  <img
                    src={zoomPdf.url}
                    alt={zoomPdf.title}
                    className="doc-zoom-img"
                  />
                ) : (
                  <iframe
                    src={zoomPdf.url}
                    title={zoomPdf.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      minHeight: '65vh',
                      border: 'none',
                      borderRadius: 8,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


