import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaStar } from 'react-icons/fa'
import DetailSection from './DetailSection'

export default function ReviewsSection({ comentarios = [], calificacion = 0 }) {
  const { t } = useTranslation()
  const [mostrarTodas, setMostrarTodas] = useState(false)

  if (!comentarios.length) return null

  const visibles = mostrarTodas ? comentarios : comentarios.slice(0, 2)

  return (
    <DetailSection
      icon={<FaStar size={12} />}
      title={t('vehiculo.reviews')}
      action={
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--texto-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FaStar size={13} color="#f59e0b" /> {calificacion.toFixed(1)}
          <span style={{ fontWeight: 500, color: 'var(--texto-second)' }}>· {comentarios.length}</span>
        </span>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
        {visibles.map((c, i) => (
          <div key={i} style={{ background: 'var(--bg-item)', borderRadius: 10, padding: '13px 15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--texto-primary)' }}>{c.autor}</span>
              <span style={{ fontSize: 12, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 3 }}>
                <FaStar size={12} /> {c.calificacion.toFixed(1)}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--texto-second)', margin: 0, lineHeight: 1.55 }}>{c.texto}</p>
          </div>
        ))}
      </div>

      {comentarios.length > 2 && (
        <button
          onClick={() => setMostrarTodas(v => !v)}
          style={{ width: '100%', marginTop: 12, padding: '10px', fontSize: 13, fontWeight: 700, color: '#2563eb', background: 'none', border: '1px solid var(--borde)', borderRadius: 10, cursor: 'pointer' }}
        >
          {mostrarTodas ? t('vehiculo.showLess') : t('vehiculo.viewAllReviews')}
        </button>
      )}
    </DetailSection>
  )
}