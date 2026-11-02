import { FaStar } from 'react-icons/fa'

export default function EsFinalizadaModal({ onValorar, reserva, t }) {
  return (
    <div style={{ marginTop: '16px', textOverflow: 'ellipsis' }}>
              <button
                type="button"
                className="btn-secundario"
                onClick={() => onValorar(reserva)}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  background: '#fffbeb',
                  color: '#b45309',
                  borderColor: '#fde68a',
                  fontWeight: 800,
                  borderRadius: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <FaStar color="#f59e0b" size={16} />
                <span>{t('reservas.rateAndReview', { defaultValue: 'Calificar y reseñar mi experiencia' })}</span>
              </button>
            </div>
  )
}
