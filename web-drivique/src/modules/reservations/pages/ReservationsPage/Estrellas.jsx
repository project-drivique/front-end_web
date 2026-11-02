import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { FaStar } from 'react-icons/fa'

const ETIQUETAS_ESTRELLAS = (t) => ({
  1: `😞 ${t('reservas.ratingLabels.1', { defaultValue: 'Mala experiencia' })}`,
  2: `😐 ${t('reservas.ratingLabels.2', { defaultValue: 'Regular' })}`,
  3: `🙂 ${t('reservas.ratingLabels.3', { defaultValue: 'Bueno' })}`,
  4: `😊 ${t('reservas.ratingLabels.4', { defaultValue: 'Muy bueno' })}`,
  5: `🤩 ${t('reservas.ratingLabels.5', { defaultValue: '¡Excelente!' })}`
})

export default function Estrellas({ value, onChange, disabled = false }) {
  const { t } = useTranslation()
  const [hoverIndex, setHoverIndex] = useState(0)
  const activeRating = hoverIndex || value || 0
  const etiquetas = ETIQUETAS_ESTRELLAS(t)

  return (
    <div className="minimal-estrellas-box">
      <div
        className="minimal-estrellas-grid"
        role="radiogroup"
        aria-label={t('reservas.ratingAria', { defaultValue: 'Calificación por estrellas' })}
        onMouseLeave={() => !disabled && setHoverIndex(0)}
      >
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(n)}
            onMouseEnter={() => !disabled && setHoverIndex(n)}
            className={`minimal-star-btn ${n <= activeRating ? 'activa' : ''}`}
            aria-label={t('reservas.starsCount', { count: n, defaultValue: '{{count}} estrellas' })}
            aria-checked={value === n}
            role="radio"
          >
            <FaStar />
          </button>
        ))}
      </div>
      {!disabled && (
        <div className="minimal-label-status">
          {activeRating > 0 ? (
            <span className="minimal-label-txt-light">
              {etiquetas[activeRating]}
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}
