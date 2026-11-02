import { FaTimes } from 'react-icons/fa'

export default function PuedeCancelarModal({ cancelando, handleCancelarReserva, t }) {
  return (
    <div style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="btn-secundario"
                onClick={handleCancelarReserva}
                disabled={cancelando}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  borderColor: '#fca5a5',
                  fontWeight: 800,
                  borderRadius: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <FaTimes color="#dc2626" size={15} />
                <span>{cancelando ? t('reservas.cancelling', { defaultValue: 'Cancelando reserva...' }) : t('reservas.cancelReservation', { defaultValue: 'Cancelar reserva' })}</span>
              </button>
            </div>
  )
}
