import { useState, useMemo, useEffect } from 'react'
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
  const sucursalAsignada = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || (user?.correo === 'encargado.neiva@drivique.com' ? 'Drivique Neiva Centro' : '')

  const [verifications, setVerifications] = useState(() => documentVerificationService.list(user))
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('todos') // 'todos' | 'pendientes' | 'aprobados' | 'rechazados'
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let activo = true
    documentVerificationService.listarPendientesBackend()
      .then((items) => { if (activo && items.length) setVerifications(items) })
      .catch(() => {})
    return () => { activo = false }
  }, [])
  // Modal de Validación de Expediente
  const [modalItem, setModalItem] = useState(null)
  const [observaciones, setObservaciones] = useState('')
  const [zoomPdf, setZoomPdf] = useState(null)

  // Estado del Modal de 2 Columnas
  const [activeSection, setActiveSection] = useState('identidad') // 'identidad' | 'licencia' | 'reserva'
  const [identidadPage, setIdentidadPage] = useState(1) // 1 | 2
  const [licenciaPage, setLicenciaPage] = useState(1) // 1 | 2
  const [errorMessage, setErrorMessage] = useState('')

  // Checklist Interactivo en el Modal
  const [modalChecklist, setModalChecklist] = useState({
    id_frente_reverso: false,
    id_legible: false,
    id_bordes: false,
    id_vigente: false,
    id_titular: false,
    id_mayor_edad: false,
    id_foto: false,
    id_no_editada: false,
    id_coinciden_lados: false,

    lic_frente_reverso: false,
    lic_legible: false,
    lic_vigente_fechas: false,
    lic_categoria_apta: false,
    lic_datos_cedula: false,
    lic_foto_cedula: false,
    lic_antiguedad_minima: false,
    lic_restricciones: false,
    runt_activo: false,
    runt_estado: false,
    runt_categoria: false,
    runt_vencimiento: false,
    lic_no_editada: false,

    res_titular_unico: false,
    res_nombres_identicos: false,
    res_datos_coinciden: false,
    res_fechas_cobertura: false,
    res_unicidad_cliente: false,
  })

  const IDENTIDAD_KEYS = useMemo(() => [
    'id_frente_reverso',
    'id_legible',
    'id_bordes',
    'id_vigente',
    'id_titular',
    'id_mayor_edad',
    'id_foto',
    'id_no_editada',
    'id_coinciden_lados',
  ], [])

  const LICENCIA_KEYS = useMemo(() => [
    'lic_frente_reverso',
    'lic_legible',
    'lic_vigente_fechas',
    'lic_categoria_apta',
    'lic_datos_cedula',
    'lic_foto_cedula',
    'lic_antiguedad_minima',
    'lic_restricciones',
    'runt_activo',
    'runt_estado',
    'runt_categoria',
    'runt_vencimiento',
    'lic_no_editada',
  ], [])

  const RESERVA_KEYS = useMemo(() => [
    'res_titular_unico',
    'res_nombres_identicos',
    'res_datos_coinciden',
    'res_fechas_cobertura',
    'res_unicidad_cliente',
  ], [])

  const countIdentidad = useMemo(() => IDENTIDAD_KEYS.filter((k) => modalChecklist[k]).length, [IDENTIDAD_KEYS, modalChecklist])
  const countLicencia = useMemo(() => LICENCIA_KEYS.filter((k) => modalChecklist[k]).length, [LICENCIA_KEYS, modalChecklist])
  const countReserva = useMemo(() => RESERVA_KEYS.filter((k) => modalChecklist[k]).length, [RESERVA_KEYS, modalChecklist])
  const totalChecked = countIdentidad + countLicencia + countReserva
  const totalPoints = 27

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
    if (!fechaSubida) return { fecha: '—', hora: '—' }
    const parts = String(fechaSubida).trim().split(' ')
    const fecha = parts[0] || '—'
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
    setActiveSection('identidad')
    setIdentidadPage(1)
    setLicenciaPage(1)
    setObservaciones(item.observaciones || '')
    setErrorMessage('')

    const isApproved = item.estado === 'aprobado'
    const defaultChecklist = {
      id_frente_reverso: isApproved,
      id_legible: isApproved,
      id_bordes: isApproved,
      id_vigente: isApproved,
      id_titular: isApproved,
      id_mayor_edad: isApproved,
      id_foto: isApproved,
      id_no_editada: isApproved,
      id_coinciden_lados: isApproved,

      lic_frente_reverso: isApproved,
      lic_legible: isApproved,
      lic_vigente_fechas: isApproved,
      lic_categoria_apta: isApproved,
      lic_datos_cedula: isApproved,
      lic_foto_cedula: isApproved,
      lic_antiguedad_minima: isApproved,
      lic_restricciones: isApproved,
      runt_activo: isApproved,
      runt_estado: isApproved,
      runt_categoria: isApproved,
      runt_vencimiento: isApproved,
      lic_no_editada: isApproved,

      res_titular_unico: isApproved,
      res_nombres_identicos: isApproved,
      res_datos_coinciden: isApproved,
      res_fechas_cobertura: isApproved,
      res_unicidad_cliente: isApproved,
    }

    setModalChecklist(item.checklist || defaultChecklist)
  }

  const handleToggleCheck = (key) => {
    setModalChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
    if (errorMessage) setErrorMessage('')
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
          <img src={url} alt={titleLabel} className="doc-preview-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
        <div className="doc-preview-hover-overlay">
          <FaEye /> {t('admin.documents.modal.zoomPdfLabel', 'Ampliar PDF')}
        </div>
      </div>
    )
  }

  const handleAprobarDocumento = async () => {
    if (!modalItem) return

    if (totalChecked < totalPoints) {
      setErrorMessage(t('admin.documents.modal.errorCheckAll', 'Marca todos los puntos para aprobar'))
      return
    }

    const nota = observaciones || t('admin.documents.defaultApproveObs', 'Documentos validados y aprobados correctamente por la sucursal.')
    try {
      if (modalItem.backend) await documentVerificationService.revisarDocumentoBackend(modalItem.id, 'aprobado', nota)
      else documentVerificationService.actualizarEstado(modalItem.id, 'aprobado', nota, user?.nombre || 'Encargado de Sucursal', modalChecklist)
      setVerifications((items) => items.map((item) => item.id === modalItem.id ? { ...item, estado: 'aprobado', observaciones: nota } : item))
    } catch (error) {
      setErrorMessage(error?.response?.data?.detail || 'No fue posible aprobar el documento.')
      return
    }
    setModalItem(null)
    setNotice(`✅ ${t('admin.documents.alerts.approvedNotice', 'Los documentos de {{name}} ({{code}}) fueron aprobados.', { name: modalItem.clienteNombre, code: modalItem.reservaCodigo })}`)

    showAlert({
      icon: 'success',
      title: t('admin.documents.alerts.approvedTitle', 'Documentación Aprobada'),
      text: t('admin.documents.alerts.approvedText', 'Se ha confirmado la aprobación de documentos para la reserva {{code}}.', { code: modalItem.reservaCodigo }),
    })
  }

  const handleRechazarDocumento = async () => {
    if (!modalItem) return

    if (!observaciones.trim()) {
      setErrorMessage(t('admin.documents.modal.errorObsRequired', 'Escribe el motivo del rechazo'))
      return
    }

    try {
      if (modalItem.backend) await documentVerificationService.revisarDocumentoBackend(modalItem.id, 'rechazado', observaciones.trim())
      else documentVerificationService.actualizarEstado(modalItem.id, 'rechazado', observaciones.trim(), user?.nombre || 'Encargado de Sucursal', modalChecklist)
      setVerifications((items) => items.map((item) => item.id === modalItem.id ? { ...item, estado: 'rechazado', observaciones: observaciones.trim() } : item))
    } catch (error) {
      setErrorMessage(error?.response?.data?.detail || 'No fue posible rechazar el documento.')
      return
    }
    setModalItem(null)
    setNotice(`❌ ${t('admin.documents.alerts.rejectedNotice', 'Se registró el rechazo de documentos para la reserva {{code}}.', { code: modalItem.reservaCodigo })}`)

    showAlert({
      icon: 'error',
      title: t('admin.documents.alerts.rejectedTitle', 'Documentación Rechazada'),
      text: t('admin.documents.alerts.rejectedText', 'Se ha notificado el rechazo de documentos para la reserva {{code}} al correo y notificaciones del usuario.', { code: modalItem.reservaCodigo }),
    })
  }

  // Exportación
  const exportData = {
    title: t('admin.documents.exportTitle', 'Validación de Documentos de Identidad y Licencias — Drivique'),
    headers: [
      t('admin.documents.table.id', 'ID'),
      t('admin.documents.table.reservationCode', 'CÓDIGO RESERVA'),
      t('admin.documents.table.clientName', 'NOMBRE CLIENTE'),
      t('admin.documents.table.documentNumber', 'NÚMERO DE DOCUMENTO'),
      t('admin.documents.table.licenseNumber', 'NÚMERO DE CONDUCCIÓN'),
      t('admin.documents.table.vehicleName', 'NOMBRE VEHÍCULO'),
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
        item.vehiculoNombre || item.vehiculo || 'Vehículo Reservado',
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
          {/* Header Superior idéntico al estándar del Administrador */}
          <header className="cities-topbar reservations-management-header">
            <div className="branch-topbar-brand-title">
              <span className="branch-topbar-badge">{t('admin.branchManagement', 'GESTIÓN DE SUCURSAL')}</span>
              <h1 className="branch-topbar-heading">{t('admin.documents.title', 'Validación de Documentos')}</h1>
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
              <span className="cash-kpi-subtitle-light" style={{ fontSize: '11.5px', color: 'var(--city-muted, #64748b)' }}>{t('admin.documents.kpis.pendingSub', 'En espera de revisión')}</span>
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
              <span className="cash-kpi-subtitle-light" style={{ fontSize: '11.5px', color: 'var(--city-muted, #64748b)' }}>{t('admin.documents.kpis.rejectedSub', 'Requieren corrección del cliente')}</span>
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

          {/* Notificación de Aviso */}
          {notice && (
            <div className="cities-notice" role="status" style={{ marginBottom: 16 }}>
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice('')}>
                á—
              </button>
            </div>
          )}

          {/* Pestañas de Secciones Adheridas */}
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
            {/* Toolbar con Buscador, Filtros y Botones de Exportación */}
            <div className="cities-toolbar doc-toolbar-wrapper">
              {/* Buscador general en vivo */}
              <label className="cities-search" style={{ flex: '1 1 250px', margin: 0 }}>
                <FaSearch />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('admin.documents.searchPlaceholder', 'Buscar por código, cliente, cédula, licencia...')}
                />
              </label>

              {/* Indicador de Sucursal Asignada */}
              <div className="doc-branch-badge">
                <FaBuilding style={{ color: 'var(--city-muted, #64748b)' }} />
                <span>{sucursalAsignada}</span>
              </div>

              {/* Botones de Exportación con píldoras */}
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

            {/* Contenido: Tabla para Desktop + Cards para Móvil */}
            {filtered.length === 0 ? (
              <div className="cities-empty">
                <FaIdCard style={{ fontSize: 44, color: '#94a3b8', marginBottom: 12 }} />
                <h2>{t('admin.documents.emptyTitle', 'No se encontraron expedientes de documentación')}</h2>
                <p>{t('admin.documents.emptyDesc', 'No hay registros que coincidan con la pestaña o los términos de búsqueda seleccionados.')}</p>
              </div>
            ) : (
              <>
                {/* 1. Vista de Tabla Completa para Escritorio & Tablets */}
                <div className="cities-table-wrap doc-desktop-table" style={{ overflowX: 'auto' }}>
                  <table className="incidents-table-v2" style={{ whiteSpace: 'nowrap', width: 'max-content', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>{t('admin.documents.table.id', 'ID')}</th>
                        <th>{t('admin.documents.table.reservationCode', 'CÓDIGO RESERVA')}</th>
                        <th>{t('admin.documents.table.clientName', 'NOMBRE CLIENTE')}</th>
                        <th>{t('admin.documents.table.documentNumber', 'NÚMERO DE DOCUMENTO')}</th>
                        <th>{t('admin.documents.table.identityDoc', 'DOCUMENTO DE IDENTIDAD')}</th>
                        <th>{t('admin.documents.table.licenseNumber', 'NÚMERO DE CONDUCCIÓN')}</th>
                        <th>{t('admin.documents.table.driverLicense', 'LICENCIA DE CONDUCCIÓN')}</th>
                        <th>{t('admin.documents.table.vehicleName', 'NOMBRE VEHÍCULO')}</th>
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
                            
                            {/* Columna Documento de Identidad (Link PDF con ícono rojo) */}
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

                            {/* Columna Número de Conducción (Texto limpio, sin fondo gris) */}
                            <td style={{ color: 'var(--city-text, #334155)', fontWeight: 600 }}>
                              {item.numeroLicencia}
                            </td>

                            {/* Columna Licencia de Conducción (Link PDF con ícono rojo) */}
                            <td>
                              <div
                                className="doc-table-pdf-link"
                                onClick={() => setZoomPdf({
                                  url: licUrl,
                                  title: `${t('admin.documents.table.driverLicense', 'Licencia de Conducción')} - ${item.clienteNombre}`
                                })}
                                title={t('admin.documents.table.openDocTooltip', 'Clic para abrir documento')}
                              >
                                <FaFilePdf />
                                <span>{licFile}</span>
                              </div>
                            </td>

                            {/* Columna Nombre Vehículo */}
                            <td style={{ color: 'var(--city-text, #0f172a)', fontWeight: 600 }}>
                              {item.vehiculoNombre || item.vehiculo || 'Vehículo Reservado'}
                            </td>

                            {/* Columna Estado de Reserva (Actualizado en tiempo real) */}
                            <td style={{ textAlign: 'center' }}>
                              {getReservaStatusBadge(resState)}
                            </td>

                            {/* Columna Fecha Subida */}
                            <td style={{ color: 'var(--city-muted, #64748b)' }}>{fecha}</td>

                            {/* Columna Hora Subida */}
                            <td style={{ color: 'var(--city-muted, #64748b)' }}>{hora}</td>

                            {/* Columna Estado de Validación */}
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

                {/* 2. Vista de Tarjetas Adaptativas para Pantallas Móviles */}
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
                            <span className="doc-mobile-data-label">{t('admin.documents.table.documentNumber', 'Nº Documento')}</span>
                            <span className="doc-mobile-data-value">{item.documentoIdentidad}</span>
                          </div>

                          <div className="doc-mobile-data-item">
                            <span className="doc-mobile-data-label">{t('admin.documents.table.licenseNumber', 'Número de Conducción')}</span>
                            <span className="doc-mobile-data-value" style={{ fontWeight: 600 }}>
                              {item.numeroLicencia}
                            </span>
                          </div>

                          <div className="doc-mobile-data-item doc-mobile-data-item--full">
                            <span className="doc-mobile-data-label">{t('admin.documents.table.vehicleName', 'Nombre Vehículo')}</span>
                            <span className="doc-mobile-data-value">{item.vehiculoNombre || item.vehiculo || 'Vehículo Reservado'}</span>
                          </div>

                          <div className="doc-mobile-data-item">
                            <span className="doc-mobile-data-label">{t('admin.documents.table.reservationStatus', 'Estado de Reserva')}</span>
                            <div style={{ marginTop: 2 }}>{getReservaStatusBadge(resState)}</div>
                          </div>

                          <div className="doc-mobile-data-item">
                            <span className="doc-mobile-data-label">{t('admin.documents.table.uploadDate', 'Fecha / Hora Subida')}</span>
                            <span className="doc-mobile-data-value" style={{ color: 'var(--city-muted, #64748b)', fontSize: 12 }}>
                              {fecha} ⬢ {hora}
                            </span>
                          </div>
                        </div>

                        {/* Documentos subidos links móviles */}
                        <div className="doc-mobile-card-docs">
                          <div
                            className="doc-table-pdf-link"
                            onClick={() => setZoomPdf({
                              url: docIdUrl,
                              title: `${t('admin.documents.table.identityDoc', 'Documento de Identidad')} - ${item.clienteNombre}`
                            })}
                          >
                            <FaFilePdf />
                            <span>{t('admin.documents.modal.idDocCard', 'Cédula')}: {docIdFile}</span>
                          </div>

                          <div
                            className="doc-table-pdf-link"
                            onClick={() => setZoomPdf({
                              url: licUrl,
                              title: `${t('admin.documents.table.driverLicense', 'Licencia de Conducción')} - ${item.clienteNombre}`
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
        {modalItem && (
          <div
            className="doc-modal-overlay"
            onClick={() => setModalItem(null)}
          >
            <div className="doc-modal-container" onClick={(e) => e.stopPropagation()}>
              {/* ENCABEZADO FIJO */}
              <header className="doc-modal-header-fixed">
                <div className="doc-modal-header-info">
                  <h2 className="doc-modal-title">Validar documentos</h2>
                  <p className="doc-modal-subtitle">
                    Reserva N.º {modalItem.reservaCodigo} · Cliente: {modalItem.clienteNombre}
                  </p>
                </div>
                <button
                  type="button"
                  className="doc-modal-close-x"
                  onClick={() => setModalItem(null)}
                  title="Cerrar"
                >
                  &times;
                </button>
              </header>

              {/* CUERPO EN DOS COLUMNAS */}
              <div className="doc-modal-body-columns">
                {/* COLUMNA IZQUIERDA (Gris claro) */}
                <div className="doc-modal-left-col">
                  {/* Botones Pequeños de Navegación entre Secciones */}
                  <div className="doc-section-nav-buttons">
                    <button
                      type="button"
                      className={`doc-nav-btn ${activeSection === 'identidad' ? 'is-active' : ''}`}
                      onClick={() => setActiveSection('identidad')}
                    >
                      <span>Identidad</span>
                      <span className="doc-nav-btn-badge">
                        {countIdentidad}/9 {countIdentidad === 9 ? '✔' : ''}
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`doc-nav-btn ${activeSection === 'licencia' ? 'is-active' : ''}`}
                      onClick={() => setActiveSection('licencia')}
                    >
                      <span>Licencia</span>
                      <span className="doc-nav-btn-badge">
                        {countLicencia}/13 {countLicencia === 13 ? '✔' : ''}
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`doc-nav-btn ${activeSection === 'reserva' ? 'is-active' : ''}`}
                      onClick={() => setActiveSection('reserva')}
                    >
                      <span>Reserva</span>
                      <span className="doc-nav-btn-badge">
                        {countReserva}/5 {countReserva === 5 ? '✔' : ''}
                      </span>
                    </button>
                  </div>

                  {/* VISTA PREVIA SEGÚN SECCIÓN ACTIVA */}
                  {activeSection === 'identidad' && (
                    <div className="doc-left-preview-box">
                      <div className="doc-sheet-card">
                        {renderDocPreview(
                          identidadPage === 1
                            ? (modalItem.fotoCedulaFrente || modalItem.pdfCedulaUrl)
                            : (modalItem.fotoCedulaReverso || modalItem.pdfCedulaUrl),
                          `Cédula - Página ${identidadPage}`
                        )}
                      </div>
                      <div className="doc-page-switch-buttons">
                        <button
                          type="button"
                          className={`doc-page-btn ${identidadPage === 1 ? 'is-active' : ''}`}
                          onClick={() => setIdentidadPage(1)}
                        >
                          Frente
                        </button>
                        <button
                          type="button"
                          className={`doc-page-btn ${identidadPage === 2 ? 'is-active' : ''}`}
                          onClick={() => setIdentidadPage(2)}
                        >
                          Reverso
                        </button>
                      </div>
                      <p className="doc-page-info-text">
                        PDF · {modalItem.documentoIdentidadPdf || `Cedula-${modalItem.documentoIdentidad}.pdf`} · página {identidadPage} de 2
                      </p>
                    </div>
                  )}

                  {activeSection === 'licencia' && (
                    <div className="doc-left-preview-box">
                      <div className="doc-sheet-card">
                        {renderDocPreview(
                          licenciaPage === 1
                            ? (modalItem.fotoLicenciaFrente || modalItem.pdfLicenciaUrl)
                            : (modalItem.fotoLicenciaReverso || modalItem.pdfLicenciaUrl),
                          `Licencia - Página ${licenciaPage}`
                        )}
                      </div>
                      <div className="doc-page-switch-buttons">
                        <button
                          type="button"
                          className={`doc-page-btn ${licenciaPage === 1 ? 'is-active' : ''}`}
                          onClick={() => setLicenciaPage(1)}
                        >
                          Frente
                        </button>
                        <button
                          type="button"
                          className={`doc-page-btn ${licenciaPage === 2 ? 'is-active' : ''}`}
                          onClick={() => setLicenciaPage(2)}
                        >
                          Reverso
                        </button>
                      </div>
                      <p className="doc-page-info-text">
                        PDF · {modalItem.licenciaConduccionPdf || `Licencia-${modalItem.documentoIdentidad}.pdf`} · página {licenciaPage} de 2
                      </p>
                    </div>
                  )}

                  {activeSection === 'reserva' && (
                    <div className="doc-left-reserva-comparison">
                      <h4 className="doc-reserva-card-title">Datos de la Reserva para Comparar</h4>
                      <div className="doc-reserva-card-body">
                        <div className="doc-reserva-row">
                          <span className="label">Cliente / Titular:</span>
                          <span className="value">{modalItem.clienteNombre}</span>
                        </div>
                        <div className="doc-reserva-row">
                          <span className="label">Número de Documento:</span>
                          <span className="value">{modalItem.documentoIdentidad}</span>
                        </div>
                        <div className="doc-reserva-row">
                          <span className="label">Licencia / Categoría:</span>
                          <span className="value">{modalItem.numeroLicencia} ({modalItem.categoriaLicencia || 'B1'})</span>
                        </div>
                        <div className="doc-reserva-row">
                          <span className="label">Vehículo Reservado:</span>
                          <span className="value">{modalItem.vehiculoNombre || modalItem.vehiculo || 'Vehículo Reservado'}</span>
                        </div>
                        <div className="doc-reserva-row">
                          <span className="label">Fecha Inicio Alquiler:</span>
                          <span className="value">{modalItem.fechaInicio || '10 Oct 2026'}</span>
                        </div>
                        <div className="doc-reserva-row">
                          <span className="label">Fecha Fin Alquiler:</span>
                          <span className="value">{modalItem.fechaFin || '15 Oct 2026'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* COLUMNA DERECHA (Blanca con Checklist) */}
                <div className="doc-modal-right-col">
                  {/* SECCIÓN IDENTIDAD */}
                  {activeSection === 'identidad' && (
                    <div className="doc-checklist-section">
                      <h3 className="doc-section-title">Documento de identidad</h3>

                      <div className="doc-checklist-group">
                        <h4 className="doc-group-subtitle">El archivo</h4>
                        
                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.id_frente_reverso}
                            onChange={() => handleToggleCheck('id_frente_reverso')}
                          />
                          <span className={`doc-check-text ${modalChecklist.id_frente_reverso ? 'is-checked' : ''}`}>
                            Tiene frente y reverso.
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.id_legible}
                            onChange={() => handleToggleCheck('id_legible')}
                          />
                          <span className={`doc-check-text ${modalChecklist.id_legible ? 'is-checked' : ''}`}>
                            Se lee todo, sin partes borrosas, cortadas ni con reflejos.
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.id_bordes}
                            onChange={() => handleToggleCheck('id_bordes')}
                          />
                          <span className={`doc-check-text ${modalChecklist.id_bordes ? 'is-checked' : ''}`}>
                            Se ven los 4 bordes del documento.
                          </span>
                        </label>
                      </div>

                      <div className="doc-checklist-group">
                        <h4 className="doc-group-subtitle">Los datos</h4>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.id_vigente}
                            onChange={() => handleToggleCheck('id_vigente')}
                          />
                          <span className={`doc-check-text ${modalChecklist.id_vigente ? 'is-checked' : ''}`}>
                            No está vencido (aplica a pasaporte y cédula de extranjería).
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.id_titular}
                            onChange={() => handleToggleCheck('id_titular')}
                          />
                          <span className={`doc-check-text ${modalChecklist.id_titular ? 'is-checked' : ''}`}>
                            El nombre y el número son los del titular de la reserva.
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.id_mayor_edad}
                            onChange={() => handleToggleCheck('id_mayor_edad')}
                          />
                          <span className={`doc-check-text ${modalChecklist.id_mayor_edad ? 'is-checked' : ''}`}>
                            La fecha de nacimiento confirma que es mayor de edad.
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.id_foto}
                            onChange={() => handleToggleCheck('id_foto')}
                          />
                          <span className={`doc-check-text ${modalChecklist.id_foto ? 'is-checked' : ''}`}>
                            La foto se parece al titular.
                          </span>
                        </label>
                      </div>

                      <div className="doc-checklist-group">
                        <h4 className="doc-group-subtitle">Que sea real</h4>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.id_no_editada}
                            onChange={() => handleToggleCheck('id_no_editada')}
                          />
                          <span className={`doc-check-text ${modalChecklist.id_no_editada ? 'is-checked' : ''}`}>
                            No se ve editado (letras chuecas, fondo raro, foto pegada, tachones).
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.id_coinciden_lados}
                            onChange={() => handleToggleCheck('id_coinciden_lados')}
                          />
                          <span className={`doc-check-text ${modalChecklist.id_coinciden_lados ? 'is-checked' : ''}`}>
                            Frente y reverso son del mismo documento.
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* SECCIÓN LICENCIA */}
                  {activeSection === 'licencia' && (
                    <div className="doc-checklist-section">
                      <h3 className="doc-section-title">Licencia de conducción</h3>

                      <div className="doc-checklist-group">
                        <h4 className="doc-group-subtitle">El archivo</h4>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.lic_frente_reverso}
                            onChange={() => handleToggleCheck('lic_frente_reverso')}
                          />
                          <span className={`doc-check-text ${modalChecklist.lic_frente_reverso ? 'is-checked' : ''}`}>
                            Tiene frente y reverso.
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.lic_legible}
                            onChange={() => handleToggleCheck('lic_legible')}
                          />
                          <span className={`doc-check-text ${modalChecklist.lic_legible ? 'is-checked' : ''}`}>
                            Se lee todo, sin partes borrosas, cortadas ni con reflejos.
                          </span>
                        </label>
                      </div>

                      <div className="doc-checklist-group">
                        <h4 className="doc-group-subtitle">Los datos</h4>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.lic_vigente_fechas}
                            onChange={() => handleToggleCheck('lic_vigente_fechas')}
                          />
                          <span className={`doc-check-text ${modalChecklist.lic_vigente_fechas ? 'is-checked' : ''}`}>
                            Está vigente hasta después de la fecha de fin del alquiler ({modalItem.fechaFin || '15 Oct 2026'}).
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.lic_categoria_apta}
                            onChange={() => handleToggleCheck('lic_categoria_apta')}
                          />
                          <span className={`doc-check-text ${modalChecklist.lic_categoria_apta ? 'is-checked' : ''}`}>
                            La categoría ({modalItem.categoriaLicencia || 'B1'}) sirve para el vehículo reservado ({modalItem.vehiculoNombre || modalItem.vehiculo || 'Vehículo'}).
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.lic_datos_cedula}
                            onChange={() => handleToggleCheck('lic_datos_cedula')}
                          />
                          <span className={`doc-check-text ${modalChecklist.lic_datos_cedula ? 'is-checked' : ''}`}>
                            El nombre y el número son los mismos de la cédula.
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.lic_foto_cedula}
                            onChange={() => handleToggleCheck('lic_foto_cedula')}
                          />
                          <span className={`doc-check-text ${modalChecklist.lic_foto_cedula ? 'is-checked' : ''}`}>
                            La foto es la misma persona de la cédula.
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.lic_antiguedad_minima}
                            onChange={() => handleToggleCheck('lic_antiguedad_minima')}
                          />
                          <span className={`doc-check-text ${modalChecklist.lic_antiguedad_minima ? 'is-checked' : ''}`}>
                            La fecha de expedición cumple la antigüedad mínima de la empresa.
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.lic_restricciones}
                            onChange={() => handleToggleCheck('lic_restricciones')}
                          />
                          <span className={`doc-check-text ${modalChecklist.lic_restricciones ? 'is-checked' : ''}`}>
                            Se revisaron las restricciones (ej. uso de lentes) y se informaron al cliente.
                          </span>
                        </label>
                      </div>

                      {/* GRUPO RUNT */}
                      <div className="doc-checklist-group doc-runt-group">
                        <div className="doc-runt-group-header">
                          <h4 className="doc-group-subtitle" style={{ margin: 0, color: '#0369a1' }}>
                            Verificación en el RUNT
                          </h4>
                          <a
                            href="https://www.runt.gov.co/actores/ciudadano/consulta-por-tipo-de-documento"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="doc-runt-btn"
                          >
                            Abrir RUNT ↗
                          </a>
                        </div>
                        <p className="doc-runt-subtext">
                          Consulta por tipo y número de documento. Pide captcha, hazlo en la pestaña que se abre.
                        </p>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.runt_activo}
                            onChange={() => handleToggleCheck('runt_activo')}
                          />
                          <span className={`doc-check-text ${modalChecklist.runt_activo ? 'is-checked' : ''}`}>
                            Consulté en el RUNT con el tipo y número de documento del titular.
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.runt_estado}
                            onChange={() => handleToggleCheck('runt_estado')}
                          />
                          <span className={`doc-check-text ${modalChecklist.runt_estado ? 'is-checked' : ''}`}>
                            El estado de la persona y de la licencia es activo (sin suspensión ni cancelación).
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.runt_categoria}
                            onChange={() => handleToggleCheck('runt_categoria')}
                          />
                          <span className={`doc-check-text ${modalChecklist.runt_categoria ? 'is-checked' : ''}`}>
                            La categoría del RUNT es la misma del PDF.
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.runt_vencimiento}
                            onChange={() => handleToggleCheck('runt_vencimiento')}
                          />
                          <span className={`doc-check-text ${modalChecklist.runt_vencimiento ? 'is-checked' : ''}`}>
                            La fecha de vencimiento del RUNT es la misma del PDF.
                          </span>
                        </label>
                      </div>

                      <div className="doc-checklist-group">
                        <h4 className="doc-group-subtitle">Que sea real</h4>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.lic_no_editada}
                            onChange={() => handleToggleCheck('lic_no_editada')}
                          />
                          <span className={`doc-check-text ${modalChecklist.lic_no_editada ? 'is-checked' : ''}`}>
                            No se ve editada (letras chuecas, fondo raro, foto pegada, tachones).
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* SECCIÓN RESERVA */}
                  {activeSection === 'reserva' && (
                    <div className="doc-checklist-section">
                      <h3 className="doc-section-title">Revisión cruzada de reserva</h3>

                      <div className="doc-checklist-group">
                        <h4 className="doc-group-subtitle">Validación cruzada de coincidencia</h4>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.res_titular_unico}
                            onChange={() => handleToggleCheck('res_titular_unico')}
                          />
                          <span className={`doc-check-text ${modalChecklist.res_titular_unico ? 'is-checked' : ''}`}>
                            Los documentos son del mismo titular que hizo la reserva.
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.res_nombres_identicos}
                            onChange={() => handleToggleCheck('res_nombres_identicos')}
                          />
                          <span className={`doc-check-text ${modalChecklist.res_nombres_identicos ? 'is-checked' : ''}`}>
                            El nombre y el número son idénticos en la cédula y la licencia.
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.res_datos_coinciden}
                            onChange={() => handleToggleCheck('res_datos_coinciden')}
                          />
                          <span className={`doc-check-text ${modalChecklist.res_datos_coinciden ? 'is-checked' : ''}`}>
                            Los datos de esta reserva coinciden con los de los PDF.
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.res_fechas_cobertura}
                            onChange={() => handleToggleCheck('res_fechas_cobertura')}
                          />
                          <span className={`doc-check-text ${modalChecklist.res_fechas_cobertura ? 'is-checked' : ''}`}>
                            La licencia cubre todas las fechas de la reserva.
                          </span>
                        </label>

                        <label className="doc-check-row">
                          <input
                            type="checkbox"
                            checked={!!modalChecklist.res_unicidad_cliente}
                            onChange={() => handleToggleCheck('res_unicidad_cliente')}
                          />
                          <span className={`doc-check-text ${modalChecklist.res_unicidad_cliente ? 'is-checked' : ''}`}>
                            El documento no está asociado a otro cliente registrado.
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* CAMPO DE OBSERVACIONES */}
                  <div className="doc-modal-observaciones-box">
                    <label className="doc-obs-label">
                      Observaciones <span className="doc-obs-req">(Obligatorio si se rechaza)</span>
                    </label>
                    <textarea
                      rows={3}
                      className="doc-obs-textarea"
                      value={observaciones}
                      onChange={(e) => {
                        setObservaciones(e.target.value)
                        if (errorMessage) setErrorMessage('')
                      }}
                      placeholder="Escribe aquí las observaciones o el motivo de rechazo que se enviará al cliente..."
                    />
                  </div>
                </div>
              </div>

              {/* PIE FIJO */}
              <footer className="doc-modal-footer-fixed">
                {errorMessage && (
                  <div className="doc-modal-error-banner">
                    ⚠️ {errorMessage}
                  </div>
                )}
                <div className="doc-modal-footer-bar">
                  <div className="doc-modal-counter">
                    <strong>{totalChecked} de {totalPoints}</strong> revisados
                  </div>
                  <div className="doc-modal-footer-btns">
                    <button
                      type="button"
                      className="doc-btn-reject"
                      onClick={handleRechazarDocumento}
                    >
                      Rechazar
                    </button>
                    <button
                      type="button"
                      className="doc-btn-approve"
                      onClick={handleAprobarDocumento}
                    >
                      Aprobar
                    </button>
                  </div>
                </div>
              </footer>
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


