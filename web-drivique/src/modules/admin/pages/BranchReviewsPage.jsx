import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaStar,
  FaSearch,
  FaCommentDots,
  FaCheckCircle,
  FaPaperPlane,
  FaTrash,
  FaBuilding,
  FaUserCheck,
  FaQuoteLeft,
  FaCar,
  FaFilter,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { branchReviewManagementService } from '../../../services/branchReviewManagementService'
import { showAlert } from '../../../utils/swalConfig'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './ReservationManagementPage.css'

export default function BranchReviewsPage({ branchOnly = false }) {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const isBranchManager = branchOnly || user?.rol === 'encargado' || user?.rol === 'branch_manager' || user?.rol === 'encargado_sucursal'
  const sucursalAsignada = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || 'Medellín - El Poblado'

  const [reviews, setReviews] = useState(() => branchReviewManagementService.list(user))
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all') // 'all' | '5' | '4' | '3' | '2' | '1'
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'pendiente_respuesta' | 'publicada'
  
  // Modal de Respuesta
  const [modalReview, setModalReview] = useState(null)
  const [respuestaTexto, setRespuestaTexto] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return reviews.filter((item) => {
      const matchRating = ratingFilter === 'all' || Number(item.calificacion) === Number(ratingFilter)
      const matchStatus = statusFilter === 'all' || item.estado === statusFilter
      const matchQuery =
        !q ||
        item.clienteNombre.toLowerCase().includes(q) ||
        item.vehiculo.toLowerCase().includes(q) ||
        item.comentario.toLowerCase().includes(q)

      return matchRating && matchStatus && matchQuery
    })
  }, [reviews, search, ratingFilter, statusFilter])

  // Promedio de Calificación de la Sucursal
  const promedioRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 5.0
    const suma = reviews.reduce((acc, curr) => acc + (curr.calificacion || 5), 0)
    return (suma / reviews.length).toFixed(1)
  }, [reviews])

  const pendientesContador = useMemo(() => {
    return reviews.filter((r) => r.estado === 'pendiente_respuesta' || !r.respuestaEncargado).length
  }, [reviews])

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

    branchReviewManagementService.responderReseña(modalReview.id, respuestaTexto)
    setReviews(branchReviewManagementService.list(user))
    setModalReview(null)
    setRespuestaTexto('')

    showAlert({ icon: 'success', title: 'Respuesta enviada', text: 'La respuesta a la reseña ha sido guardada y publicada.' })
  }

  const handleEliminarReseña = async (id) => {
    const confirm = await showAlert({
      icon: 'warning',
      title: '¿Eliminar reseña?',
      text: 'Esta acción removerá la reseña de la lista de la sucursal.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (confirm.isConfirmed) {
      const updated = branchReviewManagementService.eliminarReseña(id)
      setReviews(branchReviewManagementService.list(user))
      showAlert({ icon: 'success', title: 'Reseña eliminada' })
    }
  }

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={branchOnly} />

      <main className="management-main" style={{ padding: '24px 32px' }}>
        {/* Encabezado */}
        <header className="management-header" style={{ marginBottom: 20 }}>
          <div>
            <p className="management-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaBuilding style={{ color: 'var(--brand-primary, #2563eb)' }} />
              <span>Sede: <strong>{isBranchManager ? sucursalAsignada : 'Todas las Sucursales'}</strong></span>
            </p>
            <h1>Reseñas y Calificaciones de Sucursal</h1>
            <p className="cities-subtitle">
              Gestión exclusiva de opiniones, experiencias y calificaciones enviadas por clientes atendidos en esta sede.
            </p>
          </div>

          <div className="management-header__actions">
            <MenuConfiguracion />
          </div>
        </header>

        {/* Tarjetas KPI de Reseñas */}
        <div className="cash-kpi-bar" style={{ marginBottom: 24 }}>
          <div className="cash-kpi-item">
            <span className="cash-kpi-title">Calificación Promedio de Sede</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong className="cash-kpi-val success" style={{ fontSize: 24 }}>{promedioRating} / 5.0</strong>
              <div style={{ color: '#f59e0b', fontSize: 16 }}>
                {'★'.repeat(Math.round(promedioRating))}
              </div>
            </div>
          </div>

          <div className="cash-kpi-item">
            <span className="cash-kpi-title">Total Reseñas Recibidas</span>
            <strong className="cash-kpi-val info" style={{ fontSize: 22 }}>{reviews.length} opiniones</strong>
          </div>

          <div className="cash-kpi-item">
            <span className="cash-kpi-title">Pendientes por Responder</span>
            <strong className={`cash-kpi-val ${pendientesContador > 0 ? 'warning' : 'success'}`} style={{ fontSize: 22 }}>
              {pendientesContador} pendientes
            </strong>
          </div>
        </div>

        {/* Filtros y Contenedor Principal */}
        <section className="cities-card" style={{ padding: 24 }}>
          <div className="cash-toolbar-container" style={{ marginBottom: 20 }}>
            <div className="cash-toolbar-row1" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div className="cash-search-box" style={{ flex: 1, minWidth: 260 }}>
                <FaSearch className="cash-search-icon" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por cliente, vehículo o palabras clave..."
                />
              </div>

              <div className="cash-select-box">
                <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                  <option value="all">⭐ Todas las estrellas</option>
                  <option value="5">5 Estrellas (Excelente)</option>
                  <option value="4">4 Estrellas (Muy Bueno)</option>
                  <option value="3">3 Estrellas (Regular)</option>
                  <option value="2">2 Estrellas (Malo)</option>
                  <option value="1">1 Estrella (Deficiente)</option>
                </select>
              </div>

              <div className="cash-select-box">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">💬 Todos los estados</option>
                  <option value="pendiente_respuesta">⏳ Pendientes de Respuesta</option>
                  <option value="publicada">✅ Respondidas / Publicadas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Listado de Reseñas */}
          {filtered.length === 0 ? (
            <div className="cities-empty" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <FaCommentDots style={{ fontSize: 40, color: '#94a3b8', marginBottom: 12 }} />
              <h3>No se encontraron reseñas con los filtros seleccionados</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {filtered.map((item) => {
                const estrellas = Array.from({ length: 5 }, (_, i) => i < item.calificacion)
                const tieneRespuesta = Boolean(item.respuestaEncargado)

                return (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid var(--city-border, #e2e8f0)',
                      borderRadius: 14,
                      padding: 20,
                      background: 'var(--city-card, #ffffff)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <strong style={{ fontSize: 16, color: 'var(--city-text, #0f172a)' }}>{item.clienteNombre}</strong>
                          <span style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                            {item.sucursal}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FaCar /> {item.vehiculo} {item.placa ? `(${item.placa})` : ''} · <span style={{ color: '#94a3b8' }}>{item.fecha}</span>
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ display: 'flex', color: '#f59e0b', fontSize: 16 }}>
                          {estrellas.map((isFilled, idx) => (
                            <FaStar key={idx} style={{ opacity: isFilled ? 1 : 0.25 }} />
                          ))}
                        </div>
                        <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{item.calificacion}.0</span>
                      </div>
                    </div>

                    <div style={{ marginTop: 14, padding: 12, background: 'var(--adm-card-alt, #f8fafc)', borderRadius: 10, borderLeft: '4px solid var(--brand-primary, #2563eb)' }}>
                      <p style={{ margin: 0, fontSize: 13.5, color: 'var(--city-text, #1e293b)', fontStyle: 'italic', lineHeight: 1.5 }}>
                        "{item.comentario}"
                      </p>
                    </div>

                    {tieneRespuesta ? (
                      <div style={{ marginTop: 14, padding: 12, background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <FaUserCheck style={{ color: '#16a34a', fontSize: 13 }} />
                          <strong style={{ fontSize: 12, color: '#15803d' }}>Respuesta de la Sucursal ({item.fechaRespuesta || 'Reciente'})</strong>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: '#166534', lineHeight: 1.4 }}>
                          {item.respuestaEncargado}
                        </p>
                      </div>
                    ) : (
                      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          type="button"
                          className="cities-primary"
                          onClick={() => handleOpenResponder(item)}
                          style={{ padding: '8px 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                          <FaCommentDots /> Responder Reseña
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Modal de Responder Reseña */}
        {modalReview && (
          <div className="cities-modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, zIndex: 1000 }}>
            <div className="cities-modal" style={{ width: '100%', maxWidth: 540, padding: 24, borderRadius: 16 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800 }}>Responder a {modalReview.clienteNombre}</h2>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                Tu respuesta será visible públicamente para los clientes que consulten las opiniones de la sede {sucursalAsignada}.
              </p>

              <div style={{ padding: 12, background: '#f8fafc', borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#334155' }}>
                <strong>Comentario del cliente:</strong>
                <p style={{ margin: '4px 0 0', fontStyle: 'italic' }}>"{modalReview.comentario}"</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                  Escribe tu respuesta oficial:
                </label>
                <textarea
                  rows={4}
                  value={respuestaTexto}
                  onChange={(e) => setRespuestaTexto(e.target.value)}
                  placeholder="Ej: Hola, muchas gracias por tus comentarios. Nos complace saber que tuviste una gran experiencia..."
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="brand-secondary" onClick={() => setModalReview(null)}>
                  Cancelar
                </button>
                <button type="button" className="cities-primary" onClick={handleEnviarRespuesta}>
                  <FaPaperPlane /> Publicar Respuesta
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
