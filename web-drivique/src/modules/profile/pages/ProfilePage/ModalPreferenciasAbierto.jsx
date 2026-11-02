import DeliveryPreferencesForm from '@/modules/notifications/components/DeliveryPreferencesForm'

export default function ModalPreferenciasAbierto({ setModalPreferenciasAbierto }) {
  return (
    <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                }}
                onClick={() => setModalPreferenciasAbierto(false)}
              >
                <div
                  style={{
                    maxWidth: '620px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    position: 'relative',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setModalPreferenciasAbierto(false)}
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        zIndex: 10,
                        background: 'rgba(0,0,0,0.06)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: 'var(--texto-second, #64748b)',
                      }}
                    >
                      ✕
                    </button>
                    <DeliveryPreferencesForm onGuardadoExitoso={() => {}} />
                  </div>
                </div>
              </div>
  )
}
