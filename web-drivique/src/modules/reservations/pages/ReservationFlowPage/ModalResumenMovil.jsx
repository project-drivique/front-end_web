import { FaClipboardList, FaTimes } from 'react-icons/fa'
import SideSummary from '../../components/SideSummary'

export default function ModalResumenMovil({ abrirModalEditar, aplicarPromocion, appliedPromotion, c, cotizacion, pantalla, quitarPromocion, reserva, seguroIdx, serviciosSeleccionados, setModalResumenMovil, t, vehiculo }) {
  return (
    <div
                className="modal-resumen-movil-backdrop"
                onClick={() => setModalResumenMovil(false)}
              >
                <div
                  className="modal-resumen-movil-content"
                  style={{
                    background: c.cardBg,
                    borderColor: c.cardBorder,
                    color: c.textPrimary,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-resumen-movil-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="resumen-movil-icon-wrapper">
                        <FaClipboardList size={16} />
                      </div>
                      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: c.textPrimary }}>
                        {t('reservas.summaryTitle', 'Resumen de tu Reserva')}
                      </h3>
                    </div>
                    <button
                      type="button"
                      className="modal-resumen-movil-close"
                      onClick={() => setModalResumenMovil(false)}
                      style={{ background: c.subCardBg, color: c.textSecondary, border: `1px solid ${c.cardBorder}` }}
                    >
                      <FaTimes />
                    </button>
                  </div>
  
                  <div className="modal-resumen-movil-body">
                    <SideSummary
                      vehiculo={vehiculo}
                      reserva={reserva}
                      seguroIdx={seguroIdx}
                      serviciosSeleccionados={serviciosSeleccionados}
                      onEditar={(seccion) => {
                        setModalResumenMovil(false)
                        abrirModalEditar(seccion)
                      }}
                      pantalla={pantalla}
                      onContinuar={null}
                      appliedPromotion={appliedPromotion}
                    cotizacion={cotizacion}
                      onApplyPromotion={aplicarPromocion}
                      onRemovePromotion={quitarPromocion}
                      c={c}
                    />
                  </div>
  
                  <div className="modal-resumen-movil-footer">
                    <button
                      type="button"
                      className="btn-cerrar-modal-resumen"
                      onClick={() => setModalResumenMovil(false)}
                    >
                      {t('common.close', 'Cerrar')}
                    </button>
                  </div>
                </div>
              </div>
  )
}
