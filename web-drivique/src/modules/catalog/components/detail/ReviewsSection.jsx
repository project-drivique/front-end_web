import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaStar } from 'react-icons/fa'

export default function ReviewsSection({ comentarios = [], calificacion = 0 }) {
  const { t } = useTranslation()
  const [mostrarTodas, setMostrarTodas] = useState(false)

  if (!comentarios.length) return null

  const visibles = mostrarTodas ? comentarios : comentarios.slice(0, 2)

  return (
    <div style={{ background: 'var(--bg-tarjeta)', border: '1px solid var(--borde)', borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--texto-second)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaStar size={15} /> {t('vehiculo.reviews')}
        </p>
        <span style={{ fontSize: 13, color: 'var(--texto-second)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FaStar size={13} color="#f59e0b" /> {calificacion.toFixed(1)} · {comentarios.length}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        {visibles.map((c, i) => (
          <div key={i} style={{ background: 'var(--bg-item)', border: '1px solid var(--borde)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--texto-primary)' }}>{c.autor}</span>
              <span style={{ fontSize: 12, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 3 }}>
                <FaStar size={12} /> {c.calificacion.toFixed(1)}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--texto-second)', margin: 0, lineHeight: 1.5 }}>{c.texto}</p>
          </div>
        ))}
      </div>

      {comentarios.length > 2 && (
        <button
          onClick={() => setMostrarTodas(v => !v)}
          style={{ width: '100%', marginTop: 12, padding: '10px', fontSize: 13, fontWeight: 700, color: '#2563eb', background: 'none', border: '1px solid var(--borde)', borderRadius: 8, cursor: 'pointer' }}
        >
          {mostrarTodas ? t('vehiculo.showLess') : t('vehiculo.viewAllReviews')}
        </button>
      )}
    </div>
  )
}