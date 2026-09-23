import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FaStar, FaTimes } from 'react-icons/fa'
import { useAuthStore } from '../../../../store/authStore'

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

export default function ReviewsSection({ comentarios = [], calificacion = 0, vehiculoId = null, vehiculoNombre = '', c, embedded = false }) {
  const { t, i18n } = useTranslation()
  const usuario = useAuthStore(state => state.usuario)
  const [mostrarTodas, setMostrarTodas] = useState(false)
  const [fotoAmpliada, setFotoAmpliada] = useState(null)

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

  // Fusionar reseñas guardadas localmente por el usuario con las reseñas base del catálogo
  const listaComentarios = useMemo(() => {
    const fusionados = [...(comentarios || [])]
    try {
      const valoracionesLocales = JSON.parse(localStorage.getItem('drivique_valoraciones') || '{}')
      const reservasLocales = JSON.parse(localStorage.getItem('drivique_reservas') || '[]')

      // Recorrer las valoraciones locales guardadas
      Object.entries(valoracionesLocales).forEach(([reservaId, val]) => {
        if (!val) return
        const resMatch = reservasLocales.find(r => String(r.id) === String(reservaId) || String(r.codigo) === String(reservaId) || String(r.referencia) === String(reservaId))
        
        // Comprobar si la reseña corresponde a este vehículo (por ID o por nombre)
        const matchId = vehiculoId && resMatch && (Number(resMatch.vehiculoId) === Number(vehiculoId) || Number(resMatch.vehiculo?.id) === Number(vehiculoId))
        const matchNombre = vehiculoNombre && resMatch && (resMatch.vehiculo?.nombre === vehiculoNombre)
        const matchSinReserva = !resMatch // Si no hay match de reserva, incluir si es la valoración actual

        if (matchId || matchNombre || matchSinReserva) {
          const autorNombre = resMatch?.clienteNombre || resMatch?.datosForm?.nombre || usuario?.nombre || 'Tú (Cliente Drivique)'
          const yaExisteIdx = fusionados.findIndex(item => item.autor === autorNombre || item.esPropia)
          
          const elementoResena = {
            autor: autorNombre,
            calificacion: Number(val.estrellas || val.calificacion || 5),
            texto: val.comentario || 'Excelente servicio y vehículo.',
            fecha: val.actualizadoEn ? val.actualizadoEn.split('T')[0] : new Date().toISOString().split('T')[0],
            fotos: val.fotos || [],
            esPropia: true
          }

          if (yaExisteIdx !== -1) {
            fusionados[yaExisteIdx] = elementoResena
          } else {
            fusionados.unshift(elementoResena)
          }
        }
      })
    } catch (e) {
      console.warn('Error recuperando valoraciones locales:', e)
    }

    return fusionados
  }, [comentarios, vehiculoId, vehiculoNombre, usuario])

  // Recalcular calificación global basada en la lista combinada
  const calificacionFinal = useMemo(() => {
    if (!listaComentarios.length) return calificacion || 0
    const suma = listaComentarios.reduce((acc, curr) => acc + (Number(curr.calificacion) || 5), 0)
    return Number((suma / listaComentarios.length).toFixed(1))
  }, [listaComentarios, calificacion])

  if (!listaComentarios || listaComentarios.length === 0) {
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
        <h4 style={{ fontSize: 14.5, fontWeight: 700, color: isDark ? '#f1f5f9' : '#334155', margin: '0 0 16px', letterSpacing: '-0.01em' }}>
          {t('vehiculo.customerReviews', 'Reseñas de clientes')}
        </h4>
        <div
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
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

  // Muestra 4 reseñas inicialmente, y el enlace Ver más al final de la lista desplegará el resto
  const visibles = mostrarTodas ? listaComentarios : listaComentarios.slice(0, 4)

  const distribution = {
    5: listaComentarios.filter(c => Math.round(c.calificacion) === 5).length,
    4: listaComentarios.filter(c => Math.round(c.calificacion) === 4).length,
    3: listaComentarios.filter(c => Math.round(c.calificacion) === 3).length,
    2: listaComentarios.filter(c => Math.round(c.calificacion) === 2).length,
    1: listaComentarios.filter(c => Math.round(c.calificacion) === 1).length,
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
        borderRadius: embedded ? 0 : 16,
        padding: embedded ? 'clamp(18px, 2.5vw, 28px) 0 0' : 'clamp(14px, 2vw, 24px)',
        boxShadow: embedded ? 'none' : (isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 6px 20px rgba(0,0,0,0.03)'),
        boxSizing: 'border-box',
      }}
    >
      <h3 style={{ fontSize: 14.5, fontWeight: 700, color: isDark ? '#f1f5f9' : '#334155', margin: '0 0 16px', letterSpacing: '-0.01em' }}>
        {t('vehiculo.customerReviews', 'Reseñas de clientes')}
      </h3>

      <div className="resenas-layout" style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(16px, 2.5vw, 32px)' }}>
        {/* Columna Izquierda: Resumen */}
        <div className="resenas-resumen" style={{ flex: '1 1 200px', minWidth: 180, maxWidth: 280 }}>
          <div style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 900, color: isDark ? '#f1f5f9' : '#334155', lineHeight: 1, marginBottom: 8 }}>
            {calificacionFinal.toFixed(1)}
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {renderStars(Math.round(calificacionFinal))}
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: textSecondary, marginBottom: 16 }}>
            {t('vehiculo.reviewsCount', { count: listaComentarios.length, defaultValue: `${listaComentarios.length} reseñas` })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[5, 4, 3, 2, 1].map(star => {
              const count = distribution[star]
              const percentage = listaComentarios.length > 0 ? (count / listaComentarios.length) * 100 : 0
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: textSecondary }}>
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
        <div className="resenas-lista" style={{ flex: '1 1 260px', minWidth: 220, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {visibles.map((item, i) => {
            const textoTraducido = REVIEW_TEXT_MAP[item.texto] ? t(REVIEW_TEXT_MAP[item.texto]) : item.texto
            const fechaFormateada = formatearFecha(item.fecha || '2026-04-15')
            const tieneFotos = Boolean(item.fotos && item.fotos.length > 0)

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 14,
                  borderBottom: i < visibles.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` : 'none',
                  paddingBottom: 16,
                  alignItems: 'flex-start'
                }}
              >
                {/* Avatar con diseño neutro idéntico para todas las reseñas */}
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
                    color: isDark ? '#f1f5f9' : '#334155',
                    flexShrink: 0,
                  }}
                >
                  {item.autor.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>

                {/* Contenido (Texto a la izquierda, Estrellas y Fotos al lado derecho) */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    {/* Lado Izquierdo: Autor, Fecha, Comentario */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: isDark ? '#f1f5f9' : '#334155', marginBottom: 2 }}>
                        {item.autor} {item.esPropia && <span style={{ fontSize: 11, fontWeight: 600, color: textSecondary, marginLeft: 4 }}>(Tu reseña)</span>}
                      </div>
                      <div style={{ fontSize: 11.5, color: textSecondary, marginBottom: 6 }}>{fechaFormateada}</div>
                      <p style={{ fontSize: 13, color: isDark ? '#e2e8f0' : '#334155', margin: 0, lineHeight: 1.5 }}>
                        {textoTraducido}
                      </p>
                    </div>

                    {/* Lado Derecho: Estrellas y Fotos al lado directamente con click para ampliar */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <FaStar key={j} size={11} color={j < item.calificacion ? '#f59e0b' : (isDark ? '#334155' : '#e2e8f0')} />
                        ))}
                      </div>

                      {tieneFotos && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {item.fotos.map((imgSrc, imgIdx) => (
                            <img
                              key={imgIdx}
                              src={imgSrc}
                              alt={`Foto adjunta ${imgIdx + 1}`}
                              onClick={() => setFotoAmpliada(imgSrc)}
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 8,
                                objectFit: 'cover',
                                border: `1px solid ${border}`,
                                cursor: 'pointer',
                                transition: 'transform 0.15s ease, border-color 0.15s ease'
                              }}
                              title="Haz clic para ver imagen en pantalla completa"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Enlace "Ver más" / "Ver menos" abajo de las 4 reseñas */}
          {listaComentarios.length > 4 && (
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span
                role="button"
                tabIndex={0}
                onClick={() => setMostrarTodas(v => !v)}
                onKeyDown={e => e.key === 'Enter' && setMostrarTodas(v => !v)}
                style={{
                  color: 'var(--brand-primary, #2563eb)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                {mostrarTodas ? 'Ver menos' : 'Ver más'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modal / Lightbox para ver la foto ampliada en pantalla completa al hacer clic */}
      {fotoAmpliada && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setFotoAmpliada(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              background: '#ffffff',
              borderRadius: 16,
              padding: 12,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setFotoAmpliada(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                zIndex: 2,
                transition: 'background 0.2s ease'
              }}
              title="Cerrar vista"
            >
              <FaTimes />
            </button>
            <img
              src={fotoAmpliada}
              alt="Foto del vehículo ampliada"
              style={{
                maxWidth: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: 10,
                display: 'block'
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}