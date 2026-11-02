import { FaTimes, FaShieldAlt } from 'react-icons/fa'

export default function EsDocumentosRechazados({ navigate, reserva, sucursalPago, t }) {
  return (
    <div className="modal-wompi-card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'linear-gradient(180deg, rgba(254, 242, 242, 0.7) 0%, rgba(255, 255, 255, 1) 100%)' }}>
              <div className="modal-wompi-subcard">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <FaTimes style={{ fontSize: '24px', color: '#dc2626' }} />
                  <h3 className="modal-wompi-titulo" style={{ margin: 0, color: '#b91c1c' }}>
                    Documentación Requiere Corrección
                  </h3>
                </div>
                <p className="modal-wompi-desc" style={{ color: '#7f1d1d' }}>
                  La sucursal <strong>{reserva.sucursal || sucursalPago}</strong> revisó tus documentos e indicó que requieren corrección antes de continuar con la entrega del vehículo.
                  {reserva.motivoRechazoDocumentos && (
                    <span style={{ display: 'block', marginTop: '8px', padding: '8px 12px', background: '#fee2e2', borderRadius: '8px', color: '#991b1b', fontWeight: 600 }}>
                      Observación del encargado: {reserva.motivoRechazoDocumentos}
                    </span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/perfil?tab=documentos')}
                  className="modal-wompi-btn"
                  style={{ background: '#dc2626', marginTop: '12px' }}
                >
                  <FaShieldAlt size={16} />
                  <span>{t('hc.actualizar_documentos_en_mi_perfil', 'Actualizar Documentos en Mi Perfil')}</span>
                </button>
              </div>
            </div>
  )
}
