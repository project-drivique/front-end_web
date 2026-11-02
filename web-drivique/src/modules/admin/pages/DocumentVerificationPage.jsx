import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { documentVerificationService } from '../../../services/documentVerificationService'
import { reservationManagementService } from '../../../services/reservationManagementService'

import { showAlert, getErrorMessage } from '../../../utils/swalConfig'
import { resolveDocumentUrl } from '../../../utils/documentUtils'
import DocumentPreviewer from '../../../components/DocumentPreviewer'

import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './DocumentVerificationPage.css'
import ZoomPdf from './DocumentVerificationPage/ZoomPdf'
import DocModalFooterFixed from './DocumentVerificationPage/DocModalFooterFixed'
import DocModalRightCol from './DocumentVerificationPage/DocModalRightCol'
import DocModalLeftCol from './DocumentVerificationPage/DocModalLeftCol'
import CitiesCard from './DocumentVerificationPage/CitiesCard'
import FleetAttachedTabs from './DocumentVerificationPage/FleetAttachedTabs'
import CashKpiBar from './DocumentVerificationPage/CashKpiBar'
import CitiesTopbar from './DocumentVerificationPage/CitiesTopbar'

export default function DocumentVerificationPage({ branchOnly = false }) {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const esEncargado =
    branchOnly ||
    user?.rol === 'BRANCH_MANAGER' ||
    user?.role === 'BRANCH_MANAGER' ||
    user?.rol === 'encargado' ||
    user?.rol === 'encargado_sucursal' ||
    user?.rol === 'branch_manager' ||
    (Array.isArray(user?.roles) && (user.roles.includes('BRANCH_ADMIN') || user.roles.includes('BRANCH_MANAGER')))
  const sucursalAsignada = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || (user?.correo === 'encargado.neiva@drivique.com' ? 'Drivique Neiva Centro' : '')

  const [verifications, setVerifications] = useState([])
  const recargar = () => documentVerificationService.listar().then(setVerifications).catch(() => {})
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('todos') // 'todos' | 'pendientes' | 'aprobados' | 'rechazados'
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let activo = true
    documentVerificationService.listar()
      .then((items) => { if (activo) setVerifications(items) })
      .catch(() => {})
    return () => { activo = false }
  }, [])

  // Modal de Validación de Expediente
  const [modalItem, setModalItem] = useState(null)
  const [observaciones, setObservaciones] = useState('')
  const [zoomPdf, setZoomPdf] = useState(null)
  const [identidadBlobUrl] = useState(null)
  const [licenciaBlobUrl] = useState(null)

  // Estado del Modal de 2 Columnas
  const [activeSection, setActiveSection] = useState('identidad') // 'identidad' | 'licencia' | 'reserva'
  const [, setIdentidadPage] = useState(1) // 1 | 2
  const [, setLicenciaPage] = useState(1) // 1 | 2
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
  const [liveReservations, setLiveReservations] = useState([])
  useEffect(() => {
    reservationManagementService.refresh().then(setLiveReservations).catch(() => {})
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
    if (item.estado === 'aprobado') return
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
    if (!esEncargado) return
    setModalChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
    if (errorMessage) setErrorMessage('')
  }

  const getSafeDocUrl = (url) => {
    return resolveDocumentUrl(url)
  }

  const renderDocPreview = (url, titleLabel, onBlob) => {
    return (
      <DocumentPreviewer
        url={url}
        title={titleLabel}
        onBlobReady={onBlob}
        fallbackSubtitle={modalItem?.clienteNombre ? `${modalItem.clienteNombre} · ${modalItem.documentoIdentidad}` : ''}
        fallbackDocNumber={modalItem?.documentoIdentidad}
      />
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
      const idsToReview = modalItem.allDocIds && modalItem.allDocIds.length > 0 ? modalItem.allDocIds : [modalItem.id]
      for (const docId of idsToReview) {
        await documentVerificationService.revisarDocumentoBackend(docId, 'aprobado', nota)
      }
      await recargar()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t('hc2.no_fue_posible_aprobar_el_documento', 'No fue posible aprobar el documento.')))
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
      const idsToReview = modalItem.allDocIds && modalItem.allDocIds.length > 0 ? modalItem.allDocIds : [modalItem.id]
      for (const docId of idsToReview) {
        await documentVerificationService.revisarDocumentoBackend(docId, 'rechazado', observaciones.trim())
      }
      await recargar()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t('hc2.no_fue_posible_rechazar_el_documento', 'No fue posible rechazar el documento.')))
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
        item.vehiculoNombre || item.vehiculo || t('hc2.vehiculo_reservado', 'Vehículo Reservado'),
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
          <CitiesTopbar t={t} user={user} />

          {/* Tarjetas KPI Superiores */}
          <CashKpiBar conteoAprobados={conteoAprobados} conteoPendientes={conteoPendientes} conteoRechazados={conteoRechazados} t={t} verifications={verifications} />

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
          <FleetAttachedTabs activeTab={activeTab} conteoAprobados={conteoAprobados} conteoPendientes={conteoPendientes} conteoRechazados={conteoRechazados} setActiveTab={setActiveTab} t={t} verifications={verifications} />

          {/* Tarjeta Principal */}
          <CitiesCard exportData={exportData} filtered={filtered} getReservaStatusBadge={getReservaStatusBadge} getSafeDocUrl={getSafeDocUrl} getStatusBadge={getStatusBadge} getUploadDateTime={getUploadDateTime} handleOpenReview={handleOpenReview} reservationMap={reservationMap} search={search} setSearch={setSearch} setZoomPdf={setZoomPdf} sucursalAsignada={sucursalAsignada} t={t} />
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
                  <h2 className="doc-modal-title">{t('hc4.validar_documentos', 'Validar documentos')}</h2>
                  <p className="doc-modal-subtitle">
                    Reserva N.º {modalItem.reservaCodigo} · Cliente: {modalItem.clienteNombre}
                  </p>
                </div>
                <button
                  type="button"
                  className="doc-modal-close-x"
                  onClick={() => setModalItem(null)}
                  title={t('hc4.cerrar', 'Cerrar')}
                >
                  &times;
                </button>
              </header>

              {/* CUERPO EN DOS COLUMNAS */}
              <div className="doc-modal-body-columns">
                {/* COLUMNA IZQUIERDA (Gris claro) */}
                <DocModalLeftCol activeSection={activeSection} countIdentidad={countIdentidad} countLicencia={countLicencia} countReserva={countReserva} getSafeDocUrl={getSafeDocUrl} identidadBlobUrl={identidadBlobUrl} licenciaBlobUrl={licenciaBlobUrl} modalItem={modalItem} renderDocPreview={renderDocPreview} setActiveSection={setActiveSection} t={t} />

                {/* COLUMNA DERECHA (Blanca con Checklist) */}
                <DocModalRightCol activeSection={activeSection} errorMessage={errorMessage} handleToggleCheck={handleToggleCheck} modalChecklist={modalChecklist} modalItem={modalItem} observaciones={observaciones} setErrorMessage={setErrorMessage} setObservaciones={setObservaciones} t={t} />
              </div>

              {/* PIE FIJO */}
              <DocModalFooterFixed errorMessage={errorMessage} handleAprobarDocumento={handleAprobarDocumento} handleRechazarDocumento={handleRechazarDocumento} totalChecked={totalChecked} totalPoints={totalPoints} />
            </div>
          </div>
        )}

        {/* Modal Visor de Documentos / Lightbox Adaptable */}
        {zoomPdf && (
          <ZoomPdf getSafeDocUrl={getSafeDocUrl} setZoomPdf={setZoomPdf} t={t} zoomPdf={zoomPdf} />
        )}
      </main>
    </div>
  )
}


