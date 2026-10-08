import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaStar,
  FaSearch,
  FaCommentDots,
  FaCheckCircle,
  FaBuilding,
  FaCar,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaExclamationCircle,
  FaFileImage,
  FaPaperPlane,
  FaEye,
  FaExternalLinkAlt,
  FaCheck,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { branchReviewManagementService } from '../../../services/branchReviewManagementService'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import { showAlert } from '../../../utils/swalConfig'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './CashCollectionPage.css'
import './DocumentVerificationPage.css'
import './BranchReviewsPage.css'

export default function BranchReviewsPage({ branchOnly = false }) {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const isBranchManager = branchOnly || user?.rol === 'encargado' || user?.rol === 'branch_manager' || user?.rol === 'encargado_sucursal'
  const sucursalAsignada = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || 'Alamo Bogotá - Aeropuerto'

  const [reviews, setReviews] = useState([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('todos')

  // Modal de Respuesta y Visor Lightbox
  const [modalReview, setModalReview] = useState(null)
  const [respuestaTexto, setRespuestaTexto] = useState('')
  const [zoomMedia, setZoomMedia] = useState(null)

  const refresh = async () => {
    const data = await branchReviewManagementService.list(user)
    setReviews(data)
  }

  useEffect(() => {
    refresh()
  }, [user])


  // KPI Calculations
  const promedioRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return '5.0'
    const suma = reviews.reduce((acc, curr) => acc + (curr.calificacion || 5), 0)
    return (suma / reviews.length).toFixed(1)
  }, [reviews])

  const pendientesContador = useMemo(() => {
    return reviews.filter((r) => r.estado === 'pendiente_respuesta' || !r.respuestaEncargado).length
  }, [reviews])

  const respondidasContador = useMemo(() => {
    return reviews.filter((r) => r.estado === 'publicada' || Boolean(r.respuestaEncargado)).length
  }, [reviews])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return reviews.filter((item) => {
      // Tab filtering
      if (activeTab === 'pendientes' && (item.estado === 'publicada' && Boolean(item.respuestaEncargado))) return false
      if (activeTab === 'respondidas' && (!item.respuestaEncargado || item.estado !== 'publicada')) return false
      if (activeTab === '5estrellas' && item.calificacion !== 5) return false
      if (activeTab === '4estrellas' && item.calificacion !== 4) return false
      if (activeTab === 'bajas' && item.calificacion > 3) return false

      // Search query
      if (q) {
        const text = `${item.reservaCodigo || ''} ${item.clienteNombre || ''} ${item.vehiculo || ''} ${item.comentario || ''} ${item.respuestaEncargado || ''}`.toLowerCase()
        if (!text.includes(q)) return false
      }

      return true
    })
  }, [reviews, search, activeTab])

  const exportData = useMemo(() => {
    return filtered.map((r, i) => [
      i + 1,
      r.reservaCodigo || `RES-${r.id}`,
      r.clienteNombre,
      r.vehiculo || '-',
      `${r.calificacion}.0 ★`,
      r.comentario,
      r.fecha || '-',
      r.respuestaEncargado || t('admin.reviews.noReply', 'Sin respuesta oficial'),
      r.respuestaEncargado ? t('admin.reviews.status.published', 'Respondida') : t('admin.reviews.status.pending', 'Pendiente')
    ])
  }, [filtered, t])

  const handleOpenResponder = (review) => {
    setModalReview(review)
    setRespuestaTexto(review.respuestaEncargado || '')
  }

  const handleEnviarRespuesta = async () => {
    if (!modalReview) return
    if (!respuestaTexto.trim()) {
      showAlert({ icon: 'warning', title: 'Campo requerido', text: 'Escribe un mensaje de respuesta para el cliente.' })
      return
    }
    try {
      await branchReviewManagementService.responderResena(modalReview.id, respuestaTexto)
      await refresh()
      setModalReview(null)
      setRespuestaTexto('')

      showAlert({ icon: 'success', title: 'Respuesta publicada', text: 'La respuesta a la reseña ha sido guardada exitosamente.' })
    } catch (error) {
      showAlert({ icon: 'error', title: 'Error', text: 'No se pudo publicar la respuesta.' })
    }
  }

  const backdropStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.65)', padding: 16 }
  const modalHeadStyle = { padding: '20px 24px', borderBottom: '1px solid var(--city-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  const closeBtnStyle = { background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--city-muted)', lineHeight: 1, padding: 0 }

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={isBranchManager} />

      <main className="management-main doc-verification-main">
        <div className="cities-container" style={{ maxWidth: '100%' }}>

          {/* TOPBAR HEADER WITH BADGE AND PROFILE CHIP */}
          <header className="cities-topbar reservations-management-header">
            <div className="branch-topbar-brand-title">
              <span className="branch-topbar-badge">{t('admin.branchManagement', 'GESTIÓN OPERATIVA')}</span>
              <h1 className="branch-topbar-heading">{t('admin.reviews.title', 'Reseñas y Calificaciones')}</h1>
            </div>
            <div className="cities-topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <MenuConfiguracion />
              {user && (
                <div className="branch-user-profile-chip">
                  <div className="branch-user-avatar">{(user?.nombre || user?.correo || 'A').charAt(0).toUpperCase()}</div>
                  <div className="branch-user-info-text">
                    <strong className="branch-user-name">{[user?.nombre, user?.apellido].filter(Boolean).join(' ') || user?.correo || 'Usuario'}</strong>
                    <span className="branch-user-role">{user?.rol || 'encargado_sucursal'}</span>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* KPI CARDS BAR */}
          <div className="cash-kpi-bar">
            {[
              { icon: FaStar, color: '#f59e0b', label: t('admin.reviews.kpi.average', 'Promedio Sede'), value: `${promedioRating} / 5.0 ★`, desc: t('admin.reviews.kpi.averageDesc', 'Puntuación acumulada') },
              { icon: FaCommentDots, color: '#3b82f6', label: t('admin.reviews.kpi.total', 'Total Reseñas'), value: reviews.length, desc: t('admin.reviews.kpi.totalDesc', 'Opiniones recibidas') },
              { icon: FaExclamationCircle, color: '#ef4444', label: t('admin.reviews.kpi.pending', 'Pendientes por Responder'), value: pendientesContador, desc: t('admin.reviews.kpi.pendingDesc', 'Requieren atención del encargado') },
              { icon: FaCheckCircle, color: '#10b981', label: t('admin.reviews.kpi.answered', 'Respuestas Publicadas'), value: respondidasContador, desc: t('admin.reviews.kpi.answeredDesc', 'Atención completada') },
            ].map(({ icon: Icon, color, label, value, desc }) => (
              <div key={label} className="cash-kpi-item-light">
                <div className="cash-kpi-header-light" style={{ color }}>
                  <Icon /><span>{label}</span>
                </div>
                <strong className="cash-kpi-val-light">{value}</strong>
                <div className="cash-kpi-progress-bg">
                  <div className="cash-kpi-progress-fill" style={{ width: reviews.length > 0 ? '100%' : '0%', background: color }} />
                </div>
                <span className="cash-kpi-subtitle-light">{desc}</span>
              </div>
            ))}
          </div>

          {/* FLEET ATTACHED TABS */}
          <div className="fleet-attached-tabs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div className="fleet-tabs-nav">
              <button
                type="button"
                onClick={() => setActiveTab('todos')}
                className={`fleet-tab-btn ${activeTab === 'todos' ? 'is-active' : ''}`}
              >
                {t('admin.reviews.tabs.all', 'Todas las Reseñas')} ({reviews.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pendientes')}
                className={`fleet-tab-btn ${activeTab === 'pendientes' ? 'is-active' : ''}`}
              >
                {t('admin.reviews.tabs.pending', 'Pendientes de Respuesta')} ({pendientesContador})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('respondidas')}
                className={`fleet-tab-btn ${activeTab === 'respondidas' ? 'is-active' : ''}`}
              >
                {t('admin.reviews.tabs.answered', 'Respondidas')} ({respondidasContador})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('5estrellas')}
                className={`fleet-tab-btn ${activeTab === '5estrellas' ? 'is-active' : ''}`}
              >
                {t('admin.reviews.tabs.star5', '5 Estrellas')} ({reviews.filter(r => r.calificacion === 5).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('4estrellas')}
                className={`fleet-tab-btn ${activeTab === '4estrellas' ? 'is-active' : ''}`}
              >
                {t('admin.reviews.tabs.star4', '4 Estrellas')} ({reviews.filter(r => r.calificacion === 4).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bajas')}
                className={`fleet-tab-btn ${activeTab === 'bajas' ? 'is-active' : ''}`}
              >
                {t('admin.reviews.tabs.low', '1 - 3 Estrellas')} ({reviews.filter(r => r.calificacion <= 3).length})
              </button>
            </div>
          </div>

          {/* MAIN CARD ATTACHED TO TABS */}
          <section className="cities-card attached-to-tabs">

            {/* TOOLBAR CON BUSCADOR, SUCURSAL Y EXPORT PILLS */}
            <div className="cities-toolbar doc-toolbar-wrapper">
              <label className="cities-search" style={{ flex: '1 1 250px', margin: 0 }}>
                <FaSearch />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('admin.reviews.searchPlaceholder', 'Buscar por cliente, vehículo, reserva o comentario...')}
                />
              </label>

              <div className="doc-branch-badge">
                <FaBuilding style={{ color: 'var(--city-muted, #64748b)' }} />
                <span>{sucursalAsignada}</span>
              </div>

              <div className="export-pills-group" style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="export-pill export-pill--excel"
                  onClick={() => exportExcel({ title: 'Reseñas - Drivique', headers: ['ID', 'RESERVA', 'CLIENTE', 'VEHÍCULO', 'CALIFICACIÓN', 'COMENTARIO', 'FECHA', 'RESPUESTA SUCURSAL', 'ESTADO'], rows: exportData })}
                  title="Excel"
                >
                  <FaFileExcel aria-hidden="true" /> Excel
                </button>
                <button
                  type="button"
                  className="export-pill export-pill--pdf"
                  onClick={() => exportPdf({ title: 'Reseñas - Drivique', headers: ['ID', 'RESERVA', 'CLIENTE', 'VEHÍCULO', 'CALIFICACIÓN', 'COMENTARIO', 'FECHA', 'RESPUESTA SUCURSAL', 'ESTADO'], rows: exportData })}
                  title="PDF"
                >
                  <FaFilePdf aria-hidden="true" /> PDF
                </button>
                <button
                  type="button"
                  className="export-pill export-pill--print"
                  onClick={() => printTable({ title: 'Reseñas - Drivique', headers: ['ID', 'RESERVA', 'CLIENTE', 'VEHÍCULO', 'CALIFICACIÓN', 'COMENTARIO', 'FECHA', 'RESPUESTA SUCURSAL', 'ESTADO'], rows: exportData })}
                  title="Imprimir"
                >
                  <FaPrint aria-hidden="true" /> Imprimir
                </button>
              </div>
            </div>

            {/* SUMMARY COUNT */}
            <div className="cities-summary" style={{ margin: '8px 0 12px' }}>
              <span>{filtered.length}</span>{' '}
              {t('admin.reviews.foundCount', 'RESEÑAS REGISTRADAS EN SUCURSAL').toUpperCase()}
            </div>

            {filtered.length === 0 ? (
              <div className="cities-empty">
                <FaCommentDots style={{ fontSize: 44, color: '#94a3b8', marginBottom: 12 }} />
                <h2>{t('admin.reviews.emptyTitle', 'No hay reseñas registradas')}</h2>
                <p>{t('admin.reviews.emptyDesc', 'Ajusta los filtros para consultar otras calificaciones.')}</p>
              </div>
            ) : (
              <>
                {/* 1. VISTA DE TABLA DESKTOP CON 1 COLUMNA POR RESPONSABILIDAD DE DATOS */}
                <div className="cities-table-wrap doc-desktop-table" style={{ overflowX: 'auto' }}>
                  <table className="incidents-table-v2" style={{ whiteSpace: 'nowrap', width: 'max-content', minWidth: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '35px' }}>ID</th>
                        <th>{t('admin.reviews.table.comment', 'DESCRIPCIÓN OPCIONAL')}</th>
                        <th>{t('admin.reviews.table.clientName', 'NOMBRE COMPLETO')}</th>
                        <th>{t('admin.reviews.table.vehicle', 'NOMBRE VEHÍCULO')}</th>
                        <th>{t('admin.reviews.table.reservationCode', 'CÓDIGO RESERVA')}</th>
                        <th style={{ textAlign: 'center' }}>EVIDENCIA FOTO 1</th>
                        <th style={{ textAlign: 'center' }}>EVIDENCIA FOTO 2</th>
                        <th style={{ textAlign: 'center' }}>EVIDENCIA FOTO 3</th>
                        <th style={{ textAlign: 'center' }}>{t('admin.reviews.table.rating', 'CALIFICACIÓN')}</th>
                        <th>{t('admin.reviews.table.date', 'FECHA DE RESEÑA')}</th>
                        <th>{t('admin.reviews.table.reply', 'RESPUESTA DE SUCURSAL')}</th>
                        <th style={{ textAlign: 'center' }}>{t('admin.reviews.table.actions', 'ACCIONES')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item, i) => {
                        const tieneRespuesta = Boolean(item.respuestaEncargado)
                        return (
                          <tr key={item.id}>
                            {/* 1. ID */}
                            <td style={{ fontWeight: 600, color: 'var(--city-text, #0f172a)', width: '35px' }}>{i + 1}</td>

                            {/* 2. DESCRIPCIÓN OPCIONAL */}
                            <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--city-text, #334155)', fontWeight: 400 }} title={item.comentario || 'Sin comentario'}>
                              {item.comentario ? `"${item.comentario}"` : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin descripción</span>}
                            </td>

                            {/* 3. NOMBRE COMPLETO */}
                            <td style={{ fontWeight: 700, color: 'var(--city-text, #0f172a)' }}>
                              {item.clienteNombre}
                            </td>

                            {/* 4. NOMBRE VEHÍCULO */}
                            <td style={{ fontWeight: 600, color: 'var(--city-text, #0f172a)' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                <FaCar style={{ color: '#2563eb', flexShrink: 0 }} />
                                {item.vehiculo}
                              </span>
                            </td>

                            {/* 5. CÓDIGO RESERVA */}
                            <td style={{ fontWeight: 700, color: '#2563eb' }}>
                              {item.reservaCodigo || `RES-${item.id}`}
                            </td>

                            {/* 6. EVIDENCIA FOTO 1 */}
                            <td style={{ textAlign: 'center' }}>
                              {item.evidenciaFoto1Url ? (
                                <button
                                  type="button"
                                  onClick={() => setZoomMedia({ title: item.evidenciaFoto1, url: item.evidenciaFoto1Url })}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '4px 10px',
                                    borderRadius: 9999,
                                    background: '#eff6ff',
                                    color: '#2563eb',
                                    border: '1px solid #bfdbfe',
                                    fontWeight: 700,
                                    fontSize: 12,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <FaFileImage /> {item.evidenciaFoto1}
                                </button>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: 12 }}>Sin foto 1</span>
                              )}
                            </td>

                            {/* 7. EVIDENCIA FOTO 2 */}
                            <td style={{ textAlign: 'center' }}>
                              {item.evidenciaFoto2Url ? (
                                <button
                                  type="button"
                                  onClick={() => setZoomMedia({ title: item.evidenciaFoto2, url: item.evidenciaFoto2Url })}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '4px 10px',
                                    borderRadius: 9999,
                                    background: '#eff6ff',
                                    color: '#2563eb',
                                    border: '1px solid #bfdbfe',
                                    fontWeight: 700,
                                    fontSize: 12,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <FaFileImage /> {item.evidenciaFoto2}
                                </button>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: 12 }}>Sin foto 2</span>
                              )}
                            </td>

                            {/* 8. EVIDENCIA FOTO 3 */}
                            <td style={{ textAlign: 'center' }}>
                              {item.evidenciaFoto3Url ? (
                                <button
                                  type="button"
                                  onClick={() => setZoomMedia({ title: item.evidenciaFoto3, url: item.evidenciaFoto3Url })}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '4px 10px',
                                    borderRadius: 9999,
                                    background: '#eff6ff',
                                    color: '#2563eb',
                                    border: '1px solid #bfdbfe',
                                    fontWeight: 700,
                                    fontSize: 12,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <FaFileImage /> {item.evidenciaFoto3}
                                </button>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: 12 }}>Sin foto 3</span>
                              )}
                            </td>

                            {/* 9. CALIFICACIÓN (ESTRELLAS) */}
                            <td style={{ textAlign: 'center', fontWeight: 800 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontSize: 13 }}>
                                <FaStar /> {item.calificacion}.0
                              </span>
                            </td>

                            {/* 10. FECHA DE RESEÑA */}
                            <td style={{ color: 'var(--city-muted, #64748b)', fontWeight: 500 }}>
                              {item.fecha || '-'}
                            </td>

                            {/* 11. RESPUESTA DE SUCURSAL (Solo lectura inmutable) */}
                            <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }} title={item.respuestaEncargado || ''}>
                              {tieneRespuesta ? (
                                <span style={{ color: '#15803d', fontSize: 12.5, fontWeight: 600 }}>
                                  {item.respuestaEncargado}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--city-muted, #94a3b8)', fontSize: 12, fontStyle: 'italic' }}>
                                  {t('admin.reviews.noReply', 'Sin respuesta oficial')}
                                </span>
                              )}
                            </td>

                            {/* 12. ACCIONES (Botón Verde "Responder" - Inmutable tras publicar) */}
                            <td style={{ textAlign: 'center', fontWeight: 400 }}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                {tieneRespuesta ? (
                                  <span
                                    style={{
                                      padding: '6px 16px',
                                      borderRadius: '9999px',
                                      background: '#f0fdf4',
                                      color: '#15803d',
                                      border: '1px solid #bbf7d0',
                                      fontWeight: 800,
                                      fontSize: 12,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                    }}
                                  >
                                    <FaCheck style={{ color: '#16a34a' }} /> Respondida
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenResponder(item)}
                                    title="Responder a la reseña"
                                    style={{
                                      padding: '7px 20px',
                                      borderRadius: '9999px',
                                      background: '#16a34a',
                                      color: '#ffffff',
                                      border: 'none',
                                      fontWeight: 800,
                                      fontSize: '12.5px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                                      transition: 'all 0.2s',
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = '#15803d' }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = '#16a34a' }}
                                  >
                                    <FaCommentDots /> {t('admin.reviews.replyBtn', 'Responder')}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 2. VISTA DE TARJETAS MÓVILES */}
                <div className="doc-mobile-cards">
                  {filtered.map((item, i) => {
                    const tieneRespuesta = Boolean(item.respuestaEncargado)
                    return (
                      <div key={item.id} className="doc-mobile-card">
                        <div className="doc-mobile-card-header">
                          <div className="doc-mobile-card-title">
                            <span style={{ fontWeight: 400, color: 'var(--brand-primary, #2563eb)', fontSize: 13 }}>ID {i + 1}</span>
                            <span style={{ fontWeight: 500, color: 'var(--city-text, #0f172a)', fontSize: 14 }}>{item.reservaCodigo || `RES-${item.id}`}</span>
                          </div>
                          <span className={`doc-status-badge ${tieneRespuesta ? 'aprobado' : 'pendiente'}`}>
                            {tieneRespuesta ? t('admin.reviews.status.published', 'Respondida') : t('admin.reviews.status.pending', 'Pendiente')}
                          </span>
                        </div>

                        <div className="doc-mobile-card-body">
                          <div className="doc-mobile-data-item doc-mobile-data-item--full">
                            <span className="doc-mobile-data-label">{t('admin.reviews.table.clientName', 'CLIENTE')}</span>
                            <span className="doc-mobile-data-value" style={{ fontSize: 14, fontWeight: 500 }}>{item.clienteNombre}</span>
                          </div>

                          <div className="doc-mobile-data-item doc-mobile-data-item--full">
                            <span className="doc-mobile-data-label">{t('admin.reviews.table.vehicle', 'VEHÍCULO')}</span>
                            <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>{item.vehiculo}</span>
                          </div>

                          <div className="doc-mobile-data-item">
                            <span className="doc-mobile-data-label">{t('admin.reviews.table.rating', 'CALIFICACIÓN')}</span>
                            <span className="doc-mobile-data-value" style={{ color: '#f59e0b', fontWeight: 700 }}>{item.calificacion}.0 ★</span>
                          </div>

                          <div className="doc-mobile-data-item">
                            <span className="doc-mobile-data-label">{t('admin.reviews.table.date', 'FECHA')}</span>
                            <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>{item.fecha || '-'}</span>
                          </div>

                          <div className="doc-mobile-data-item doc-mobile-data-item--full">
                            <span className="doc-mobile-data-label">{t('admin.reviews.table.comment', 'COMENTARIO')}</span>
                            <span className="doc-mobile-data-value" style={{ fontStyle: 'italic', color: 'var(--city-text, #334155)', fontWeight: 400 }}>"{item.comentario}"</span>
                          </div>

                          {tieneRespuesta && (
                            <div className="doc-mobile-data-item doc-mobile-data-item--full">
                              <span className="doc-mobile-data-label">{t('admin.reviews.table.reply', 'RESPUESTA SUCURSAL')}</span>
                              <span className="doc-mobile-data-value" style={{ color: '#166534', fontWeight: 500 }}>{item.respuestaEncargado}</span>
                            </div>
                          )}
                        </div>

                        <div className="doc-mobile-card-actions">
                          <button
                            type="button"
                            onClick={() => handleOpenResponder(item)}
                            style={{
                              width: '100%',
                              padding: '9px 14px',
                              borderRadius: '12px',
                              background: tieneRespuesta ? 'var(--brand-soft-light, #eff6ff)' : '#2563eb',
                              color: tieneRespuesta ? 'var(--brand-primary, #2563eb)' : '#ffffff',
                              border: tieneRespuesta ? '1px solid var(--brand-border-light, #bfdbfe)' : 'none',
                              fontWeight: 700,
                              fontSize: '13px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                            }}
                          >
                            <FaCommentDots /> {tieneRespuesta ? t('admin.reviews.editReplyBtn', 'Editar Respuesta') : t('admin.reviews.replyBtn', 'Responder')}
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
      </main>

      {/* MODAL DE RESPONDER RESEÑA */}
      {modalReview && (
        <div className="cities-modal-backdrop" style={backdropStyle} onMouseDown={e => e.target === e.currentTarget && setModalReview(null)}>
          <section className="cities-modal" style={{ maxWidth: 520, width: '100%', background: 'var(--city-card)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={modalHeadStyle}>
              <div>
                <p style={{ color: 'var(--city-muted)', margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  {t('admin.reviews.modal.eyebrow', 'RESPUESTA OFICIAL DE SUCURSAL')}
                </p>
                <h2 style={{ color: 'var(--city-text)', margin: 0, fontSize: 18, fontWeight: 800 }}>
                  {t('admin.reviews.modal.replyTo', 'Responder a {{name}}', { name: modalReview.clienteNombre })}
                </h2>
              </div>
              <button type="button" onClick={() => setModalReview(null)} style={closeBtnStyle}>&times;</button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: 13, color: 'var(--city-muted, #64748b)', marginBottom: 14, lineHeight: 1.5 }}>
                {t('admin.reviews.modal.description', 'Tu respuesta será visible públicamente para los clientes que consulten las opiniones de la sede.')}
              </p>

              <div style={{ padding: 14, background: 'var(--city-bg, #f8fafc)', borderRadius: 10, border: '1.5px solid var(--city-border, #cbd5e1)', marginBottom: 16 }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--city-muted, #64748b)', fontWeight: 600 }}>
                  {t('admin.reviews.modal.clientComment', 'Comentario del cliente:')}
                </p>
                <p style={{ margin: 0, fontSize: 13.5, color: 'var(--city-text, #0f172a)', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{modalReview.comentario}"
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--city-text, #0f172a)', marginBottom: 6 }}>
                  {t('admin.reviews.modal.officialResponseLabel', 'Respuesta Oficial de Sucursal *')}
                </label>
                <textarea
                  rows={4}
                  required
                  value={respuestaTexto}
                  onChange={(e) => setRespuestaTexto(e.target.value)}
                  placeholder={t('admin.reviews.modal.placeholder', 'Escribe la respuesta oficial de la sucursal...')}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--city-border, #cbd5e1)', background: 'var(--city-bg, #f8fafc)', color: 'var(--city-text, #0f172a)', fontSize: 13, outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--city-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setModalReview(null)}
                style={{ padding: '8px 18px', borderRadius: 9999, background: 'transparent', color: 'var(--city-muted)', border: '1.5px solid var(--city-border)', cursor: 'pointer', fontWeight: 700 }}
              >
                {t('admin.reviews.modal.cancelBtn', 'Cancelar')}
              </button>
              <button
                type="button"
                onClick={handleEnviarRespuesta}
                style={{ padding: '9px 24px', borderRadius: 9999, background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}
              >
                <FaPaperPlane size={12} /> {t('admin.reviews.modal.publishSubmit', 'Publicar Respuesta')}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* MODAL LIGHTBOX PARA EVIDENCIAS DE FOTOS */}
      {zoomMedia && (
        <div className="cities-modal-backdrop" style={backdropStyle} onMouseDown={(e) => e.target === e.currentTarget && setZoomMedia(null)}>
          <section className="cities-modal" style={{ maxWidth: 720, width: '100%', background: '#0f172a', borderRadius: 20, overflow: 'hidden', border: '1px solid #334155', color: '#ffffff' }}>
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EVIDENCIA DE FOTO ADJUNTADA</span>
                <h3 style={{ margin: 0, fontSize: 16, color: '#ffffff', fontWeight: 700 }}>{zoomMedia.title}</h3>
              </div>
              <button type="button" onClick={() => setZoomMedia(null)} style={{ background: 'transparent', border: 'none', fontSize: 24, color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#020617', minHeight: 320 }}>
              <img src={zoomMedia.url} alt={zoomMedia.title} style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 12, objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '14px 24px', background: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b' }}>
              <a href={zoomMedia.url} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FaExternalLinkAlt size={11} /> Abrir imagen original
              </a>
              <button type="button" onClick={() => setZoomMedia(null)} style={{ padding: '6px 18px', borderRadius: 9999, background: '#334155', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Cerrar
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
