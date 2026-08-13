import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaStar } from 'react-icons/fa'

export default function ReviewsSection({ comentarios = [], calificacion = 0 }) {
  const { t } = useTranslation()
  const [mostrarTodas, setMostrarTodas] = useState(false)

  if (!comentarios || comentarios.length === 0) {
    return (
      <div style={{ paddingTop: 10 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--texto-primary)', margin: '0 0 16px' }}>
          Reseñas de clientes
        </h4>
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: 24, textAlign: 'center', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--texto-primary)', fontWeight: 700, fontSize: 15, margin: '0 0 8px' }}>{t('catalog.reviews.emptyTitle', 'Este vehículo aún no tiene reseñas')}</p>
          <p style={{ color: 'var(--texto-second)', fontSize: 13, margin: 0 }}>{t('catalog.reviews.emptySubtitle', '¡Anímate a reservarlo y sé el primero en compartir tu experiencia!')}</p>
        </div>
      </div>
    );
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
      <FaStar key={i} color={i < rating ? '#f59e0b' : '#e2e8f0'} size={18} />
    ))
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, paddingTop: 10 }}>
      
      {/* Columna Izquierda: Resumen */}
      <div style={{ flex: '0 0 240px' }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--texto-primary)', margin: '0 0 16px' }}>
          Reseñas de clientes
        </h4>
        <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--texto-primary)', lineHeight: 1, marginBottom: 12 }}>
          {calificacion.toFixed(1)}
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {renderStars(Math.round(calificacion))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--texto-second)', marginBottom: 24 }}>
          {comentarios.length} reseñas
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[5, 4, 3, 2, 1].map(star => {
            const count = distribution[star]
            const percentage = comentarios.length > 0 ? (count / comentarios.length) * 100 : 0
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--texto-second)' }}>
                <span style={{ width: 12, textAlign: 'right' }}>{star}</span>
                <FaStar size={10} color="#94a3b8" />
                <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${percentage}%`, height: '100%', background: '#64748b', borderRadius: 3 }} />
                </div>
                <span style={{ width: 12, textAlign: 'right' }}>{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Columna Derecha: Lista de Comentarios */}
      <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {visibles.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: 20 }}>
              {/* Avatar */}
              <div style={{ 
                width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: 14, fontWeight: 700, color: '#475569', flexShrink: 0
              }}>
                {c.autor.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              
              {/* Contenido */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--texto-primary)' }}>{c.autor}</div>
                    <div style={{ fontSize: 11, color: 'var(--texto-second)' }}>15 abr 2024</div>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <FaStar key={j} size={10} color={j < c.calificacion ? '#f59e0b' : '#e2e8f0'} />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--texto-second)', margin: 0, lineHeight: 1.5 }}>{c.texto}</p>
              </div>
            </div>
          ))
        }

        {comentarios.length > 3 && (
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <button
              onClick={() => setMostrarTodas(v => !v)}
              style={{ 
                background: '#fff', border: '1px solid #dbe5f3', color: '#2f4ea2',
                padding: '8px 16px', borderRadius: '8px', display: 'inline-flex',
                alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600,
                fontSize: 13
              }}
            >
              {mostrarTodas ? 'Ver menos reseñas' : 'Ver más reseñas ˅'}
            </button>
          </div>
        )}
      </div>

    </div>
  )
}