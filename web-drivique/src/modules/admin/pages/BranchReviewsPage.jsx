import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaStar, FaSearch, FaCommentDots, FaCheckCircle, FaBuilding, FaCar, FaFileExcel, FaFilePdf, FaPrint, FaExclamationCircle, FaFileImage, FaCheck } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { branchReviewManagementService } from '../../../services/branchReviewManagementService'
import { hasMatchingBranch } from '../../../services/accessAuditService'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import { showAlert } from '../../../utils/swalConfig'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import { BranchReviewsMobileCards, BranchReviewsModals } from '../components/BranchReviewsSubcomponents'
import './CityManagementPage.css'
import './CashCollectionPage.css'
import './DocumentVerificationPage.css'
import './BranchReviewsPage.css'

export default function BranchReviewsPage({ branchOnly = false }) {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const isBranchManager = branchOnly || user?.rol === 'encargado' || user?.rol === 'branch_manager' || user?.rol === 'encargado_sucursal'
  const sucursalAsignada = user?.sucursalAsignada || user?.branchName || user?.sucursal || user?.sucursalId || ''

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
    if (!reviews || reviews.length === 0) return '—'
    const suma = reviews.reduce((acc, curr) => acc + (curr.calificacion || 0), 0)
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
      if (isBranchManager && sucursalAsignada) {
        const itemBranch = item.sucursal || item.branchName || item.sucursalNombre || ''
        if (itemBranch && !hasMatchingBranch(itemBranch, sucursalAsignada)) return false
      }

      if (activeTab === 'pendientes' && (item.estado === 'publicada' && Boolean(item.respuestaEncargado))) return false
      if (activeTab === 'respondidas' && (!item.respuestaEncargado || item.estado !== 'publicada')) return false
      if (activeTab === '5estrellas' && item.calificacion !== 5) return false
      if (activeTab === '4estrellas' && item.calificacion !== 4) return false
      if (activeTab === 'bajas' && item.calificacion > 3) return false

      if (q) {
        const text = `${item.reservaCodigo || ''} ${item.clienteNombre || ''} ${item.vehiculo || ''} ${item.comentario || ''} ${item.respuestaEncargado || ''}`.toLowerCase()
        if (!text.includes(q)) return false
      }

      return true
    })
  }, [reviews, search, activeTab, isBranchManager, sucursalAsignada])

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
      showAlert({ icon: 'warning', title: t('hc4.campo_requerido', 'Campo requerido'), text: t('hc.escribe_un_mensaje_de_respuesta_para_e', 'Escribe un mensaje de respuesta para el cliente.') })
      return
    }
    try {
      await branchReviewManagementService.responderResena(modalReview.id, respuestaTexto)
      await refresh()
      setModalReview(null)
      setRespuestaTexto('')

      showAlert({ icon: 'success', title: t('hc4.respuesta_publicada', 'Respuesta publicada'), text: t('hc.la_respuesta_a_la_resena_ha_sido_guard', 'La respuesta a la reseña ha sido guardada exitosamente.') })
    } catch (error) {
      showAlert({ icon: 'error', title: t('hc4.error', 'Error'), text: error.message || t('hc2.no_se_pudo_publicar_la_respuesta', 'No se pudo publicar la respuesta.') })
    }
  }

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
                    <strong className="branch-user-name">
                      {(() => {
                        const nom = (user?.nombre || '').trim()
                        const ape = (user?.apellido || '').trim()
                        if (nom && ape && !nom.toLowerCase().includes(ape.toLowerCase())) return `${nom} ${ape}`
                        return nom || ape || user?.correo || 'Usuario'
                      })()}
                    </strong>
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
              { icon: FaCommentDots, color: 'var(--brand-text)', label: t('admin.reviews.kpi.total', 'Total Reseñas'), value: reviews.length, desc: t('admin.reviews.kpi.totalDesc', 'Opiniones recibidas') },
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
                  onClick={() => exportExcel({ title: t('hc.resenas_drivique', 'Reseñas - Drivique'), headers: ['ID', 'RESERVA', 'CLIENTE', t('hc2.vehiculo_52', 'VEHÍCULO'), t('hc2.calificacion', 'CALIFICACIÓN'), 'COMENTARIO', 'FECHA', t('hc2.respuesta_sucursal', 'RESPUESTA SUCURSAL'), 'ESTADO'], rows: exportData })}
                  title="Excel"
                >
                  <FaFileExcel aria-hidden="true" /> Excel
                </button>
                <button
                  type="button"
                  className="export-pill export-pill--pdf"
                  onClick={() => exportPdf({ title: t('hc.resenas_drivique', 'Reseñas - Drivique'), headers: ['ID', 'RESERVA', 'CLIENTE', t('hc2.vehiculo_52', 'VEHÍCULO'), t('hc2.calificacion', 'CALIFICACIÓN'), 'COMENTARIO', 'FECHA', t('hc2.respuesta_sucursal', 'RESPUESTA SUCURSAL'), 'ESTADO'], rows: exportData })}
                  title="PDF"
                >
                  <FaFilePdf aria-hidden="true" /> PDF
                </button>
                <button
                  type="button"
                  className="export-pill export-pill--print"
                  onClick={() => printTable({ title: t('hc.resenas_drivique', 'Reseñas - Drivique'), headers: ['ID', 'RESERVA', 'CLIENTE', t('hc2.vehiculo_52', 'VEHÍCULO'), t('hc2.calificacion', 'CALIFICACIÓN'), 'COMENTARIO', 'FECHA', t('hc2.respuesta_sucursal', 'RESPUESTA SUCURSAL'), 'ESTADO'], rows: exportData })}
                  title={t('hc4.imprimir', 'Imprimir')}
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
                <div className="cities-table-wrap doc-desktop-table" style={{ overflowX: 'auto' }}>
                  <table className="incidents-table-v2" style={{ whiteSpace: 'nowrap', width: 'max-content', minWidth: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '35px' }}>ID</th>
                        <th>{t('admin.reviews.table.comment', 'DESCRIPCIÓN OPCIONAL')}</th>
                        <th>{t('admin.reviews.table.clientName', 'NOMBRE COMPLETO')}</th>
                        <th>{t('admin.reviews.table.vehicle', 'NOMBRE VEHÍCULO')}</th>
                        <th>{t('admin.reviews.table.reservationCode', 'CÓDIGO RESERVA')}</th>
                        <th style={{ textAlign: 'center' }}>{t('hc4.evidencia_foto_1', 'EVIDENCIA FOTO 1')}</th>
                        <th style={{ textAlign: 'center' }}>{t('hc4.evidencia_foto_2', 'EVIDENCIA FOTO 2')}</th>
                        <th style={{ textAlign: 'center' }}>{t('hc4.evidencia_foto_3', 'EVIDENCIA FOTO 3')}</th>
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
                            <td style={{ fontWeight: 600, color: 'var(--city-text, #0f172a)', width: '35px' }}>{i + 1}</td>
                            <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--city-text, #334155)', fontWeight: 400 }} title={item.comentario || t('hc2.sin_comentario', 'Sin comentario')}>
                              {item.comentario ? `"${item.comentario}"` : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>{t('hc.sin_descripcion', 'Sin descripción')}</span>}
                            </td>
                            <td style={{ fontWeight: 700, color: 'var(--city-text, #0f172a)' }}>
                              {item.clienteNombre}
                            </td>
                            <td style={{ fontWeight: 600, color: 'var(--city-text, #0f172a)' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                <FaCar style={{ color: 'var(--brand-text)', flexShrink: 0 }} />
                                {item.vehiculo}
                              </span>
                            </td>
                            <td style={{ fontWeight: 700, color: 'var(--brand-text)' }}>
                              {item.reservaCodigo || `RES-${item.id}`}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {item.evidenciaFoto1Url ? (
                                <button
                                  type="button"
                                  onClick={() => setZoomMedia({ title: item.evidenciaFoto1, url: item.evidenciaFoto1Url })}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 9999, background: 'var(--brand-soft)', color: 'var(--brand-text)', border: '1px solid var(--brand-border)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                                >
                                  <FaFileImage /> {item.evidenciaFoto1}
                                </button>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: 12 }}>{t('hc.sin_foto_1', 'Sin foto 1')}</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {item.evidenciaFoto2Url ? (
                                <button
                                  type="button"
                                  onClick={() => setZoomMedia({ title: item.evidenciaFoto2, url: item.evidenciaFoto2Url })}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 9999, background: 'var(--brand-soft)', color: 'var(--brand-text)', border: '1px solid var(--brand-border)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                                >
                                  <FaFileImage /> {item.evidenciaFoto2}
                                </button>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: 12 }}>{t('hc.sin_foto_2', 'Sin foto 2')}</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {item.evidenciaFoto3Url ? (
                                <button
                                  type="button"
                                  onClick={() => setZoomMedia({ title: item.evidenciaFoto3, url: item.evidenciaFoto3Url })}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 9999, background: 'var(--brand-soft)', color: 'var(--brand-text)', border: '1px solid var(--brand-border)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                                >
                                  <FaFileImage /> {item.evidenciaFoto3}
                                </button>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: 12 }}>{t('hc.sin_foto_3', 'Sin foto 3')}</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 800 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontSize: 13 }}>
                                <FaStar /> {item.calificacion}.0
                              </span>
                            </td>
                            <td style={{ color: 'var(--city-muted, #64748b)', fontWeight: 500 }}>
                              {item.fecha || '-'}
                            </td>
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
                            <td style={{ textAlign: 'center', fontWeight: 400 }}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                {tieneRespuesta ? (
                                  <span style={{ padding: '6px 16px', borderRadius: '9999px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', fontWeight: 800, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <FaCheck style={{ color: '#16a34a' }} /> Respondida
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenResponder(item)}
                                    title={t('hc.responder_a_la_resena', 'Responder a la reseña')}
                                    style={{ padding: '7px 20px', borderRadius: '9999px', background: '#16a34a', color: '#ffffff', border: 'none', fontWeight: 800, fontSize: '12.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)', transition: 'all 0.2s' }}
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

                <BranchReviewsMobileCards
                  filtered={filtered}
                  handleOpenResponder={handleOpenResponder}
                  t={t}
                />
              </>
            )}
          </section>
        </div>
      </main>

      <BranchReviewsModals
        modalReview={modalReview}
        setModalReview={setModalReview}
        respuestaTexto={respuestaTexto}
        setRespuestaTexto={setRespuestaTexto}
        handleEnviarRespuesta={handleEnviarRespuesta}
        zoomMedia={zoomMedia}
        setZoomMedia={setZoomMedia}
        t={t}
      />
    </div>
  )
}
