import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaStar } from 'react-icons/fa'

const REVIEW_TEXT_MAP = {
  "Muy cómodo para viajes cortos, sin problemas mecánicos y el proceso de entrega fue rápido.": "vehiculo.reviews.rev1",
  "Buen carro y buen precio, aunque el aire tardó un poco en enfriar el primer día.": "vehiculo.reviews.rev2",
  "Excelente vehículo, muy cómodo y puntual en la entrega.": "vehiculo.reviews.rev3",
  "Buen servicio, el carro en perfectas condiciones.": "vehiculo.reviews.rev4",
  "Lo recomiendo totalmente, volveré a alquilar.": "vehiculo.reviews.rev5",
  "Una locura de carro, corre muchísimo y está impecable.": "vehiculo.reviews.rev6",
  "Perfecta para ir al campo, muy fuerte.": "vehiculo.reviews.rev7",
  "Espacio de sobra para toda la familia. La volveré a alquilar.": "vehiculo.reviews.rev8"
}

export default function ReviewsSection({ comentarios = [], calificacion = 0, c, embedded = false }) {
  const { t, i18n } = useTranslation()
  const [mostrarTodas, setMostrarTodas] = useState(false)

  const bg = embedded ? 'transparent' : (c?.cardBg || 'var(--bg-tarjeta, #ffffff)')
  const border = c?.cardBorder || 'var(--borde, #e2e8f0)'
  const textPrimary = c?.textPrimary || 'var(--texto-primary, #0f172a)'
  const textSecondary = c?.textSecondary || 'var(--texto-second, #64748b)'
  const isDark = c?.isDark || false

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return ''
    try {
      const date = new Date(fechaStr)
      const langMap = { es: 'es-ES', en: 'en-US', fr: 'fr-FR', pt: 'pt-PT', br: 'pt-BR' }
      const locale = langMap[i18n.language] || 'es-ES'
      return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return fechaStr
    }
  }

  if (!comentarios || comentarios.length === 0) {
    return (
      <div
        className="resenas-card-wrap"
        style={{
          background: bg,
          border: embedded ? 'none' : `1px solid ${border}`,
          borderTop: embedded ? `1px solid ${border}` : undefined,
          borderRadius: embedded ? 0 : 20,
          padding: embedded ? '32px 0 0' : 24,
          boxShadow: embedded ? 'none' : (isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 6px 20px rgba(0,0,0,0.03)'),
        }}
      >
        <h4 style={{ fontSize: 15, fontWeight: 800, color: textPrimary, margin: '0 0 16px', letterSpacing: '-0.01em' }}>
          {t('vehiculo.customerReviews', 'Reseñas de clientes')}
        </h4>
        <div
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
            borderRadius: 14,
            padding: 24,
            textAlign: 'center',
            border: `1px solid ${border}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p style={{ color: textPrimary, fontWeight: 700, fontSize: 15, margin: '0 0 8px' }}>
            {t('catalog.reviews.emptyTitle', 'Este vehículo aún no tiene reseñas')}
          </p>
          <p style={{ color: textSecondary, fontSize: 13, margin: 0 }}>
            {t('catalog.reviews.emptySubtitle', '¡Anímate a reservarlo y sé el primero en compartir tu experiencia!')}
          </p>
        </div>
      </div>
    )
  }

  const visibles = mostrarTodas ? comentarios : comentarios.slice(0, 3)

  const distribution = {
    5: comentarios.filter(c => c.calificacion === 5).length,
    4: comentarios.filter(c => c.calificacion === 4).length,
    3: comentarios.filter(c => c.calificacion === 3).length,
    2: comentarios.filter(c => c.calificacion === 2).length,
    1: comentarios.filter(c => c.calificacion === 1).length,
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FaStar key={i} color={i < rating ? '#f59e0b' : (isDark ? '#334155' : '#e2e8f0')} size={18} />
    ))
  }

  return (
    <div
      className="resenas-card-wrap"
      style={{
        background: bg,
        border: embedded ? 'none' : `1px solid ${border}`,
        borderTop: embedded ? `1px solid ${border}` : undefined,
        borderRadius: embedded ? 0 : 20,
        padding: embedded ? '32px 0 0' : 24,
        boxShadow: embedded ? 'none' : (isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 6px 20px rgba(0,0,0,0.03)'),
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 800, color: textPrimary, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
        {t('vehiculo.customerReviews', 'Reseñas de clientes')}
      </h3>

      <div className="resenas-layout" style={{ display: 'flex', flexWrap: 'wrap', gap: 36 }}>
        {/* Columna Izquierda: Resumen */}
        <div className="resenas-resumen" style={{ flex: '0 0 240px' }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: textPrimary, lineHeight: 1, marginBottom: 10 }}>
            {calificacion.toFixed(1)}
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {renderStars(Math.round(calificacion))}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: textSecondary, marginBottom: 20 }}>
            {t('vehiculo.reviewsCount', { count: comentarios.length, defaultValue: `${comentarios.length} reseñas` })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[5, 4, 3, 2, 1].map(star => {
              const count = distribution[star]
              const percentage = comentarios.length > 0 ? (count / comentarios.length) * 100 : 0
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: textSecondary }}>
                  <span style={{ width: 12, textAlign: 'right', fontWeight: 600 }}>{star}</span>
                  <FaStar size={10} color="#f59e0b" />
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: 'var(--brand-primary, #2563eb)',
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <span style={{ width: 12, textAlign: 'right', fontWeight: 600 }}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Columna Derecha: Lista de Comentarios */}
        <div className="resenas-lista" style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {visibles.map((item, i) => {
            const textoTraducido = REVIEW_TEXT_MAP[item.texto] ? t(REVIEW_TEXT_MAP[item.texto]) : item.texto
            const fechaFormateada = formatearFecha(item.fecha || '2026-04-15')
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 14,
                  borderBottom: i < visibles.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` : 'none',
                  paddingBottom: 16,
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
                    border: `1px solid ${border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 800,
                    color: textPrimary,
                    flexShrink: 0,
                  }}
                >
                  {item.autor.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>

                {/* Contenido */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: textPrimary }}>{item.autor}</div>
                      <div style={{ fontSize: 11.5, color: textSecondary }}>{fechaFormateada}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <FaStar key={j} size={11} color={j < item.calificacion ? '#f59e0b' : (isDark ? '#334155' : '#e2e8f0')} />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: textSecondary, margin: 0, lineHeight: 1.5 }}>
                    {textoTraducido}
                  </p>
                </div>
              </div>
            )
          })}

          {comentarios.length > 3 && (
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setMostrarTodas(v => !v)}
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                  border: `1px solid ${border}`,
                  color: 'var(--brand-primary, #2563eb)',
                  padding: '8px 18px',
                  borderRadius: 10,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {mostrarTodas ? t('vehiculo.viewLessReviews', 'Ver menos reseñas') : t('vehiculo.viewMoreReviews', 'Ver más reseñas ˅')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}