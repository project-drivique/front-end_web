import { FaFlag } from 'react-icons/fa'

export default function EstaEnCursoModal({ onReportar, reserva, t }) {
  return (
    <div style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="btn-secundario"
                onClick={() => onReportar(reserva)}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  background: 'var(--brand-soft)',
                  color: 'var(--brand-text)',
                  borderColor: 'var(--brand-border)',
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
                <FaFlag color="var(--brand-primary)" size={15} />
                <span>{t('reservas.reportIncident', { defaultValue: 'Soporte / Reportar Incidencia' })}</span>
              </button>
            </div>
  )
}
