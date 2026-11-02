import { FaPhone, FaClock } from 'react-icons/fa'

export default function IncidentGrid2({ modalDetalle, t }) {
  return (
    <div className="incident-grid-2" style={{ margin: '14px 0' }}>
                    <div className="incident-info-card">
                      <span className="incident-info-card__label">{t('admin.incidents.sender', 'Remitente')}</span>
                      <p>{modalDetalle.contactoNombre}</p>
                      <small>{modalDetalle.contactoEmail}</small>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <small>{modalDetalle.contactoTelefono || t('admin.incidents.noPhone', 'Sin teléfono registrado')}</small>
                        {modalDetalle.contactoTelefono && (
                        <a 
                          href={`tel:${modalDetalle.contactoTelefono}`}
                          style={{ padding: '4px 8px', borderRadius: '4px', background: '#ecfeff', color: '#0891b2', border: '1px solid #cffafe', textDecoration: 'none', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}
                        >
                          <FaPhone /> {t('admin.incidents.call', 'Llamar')}
                        </a>
                        )}
                      </div>
                    </div>
  
                    <div className="incident-info-card">
                      <span className="incident-info-card__label">{t('admin.incidents.locationPriority', 'Ubicación y Prioridad')}</span>
                      <p>{modalDetalle.sucursal}</p>
                      <span className={`priority-badge ${modalDetalle.prioridad}`} style={{ marginTop: 6 }}>
                        <FaClock /> {t('admin.incidents.estimatedTime', 'Tiempo estimado:')} {modalDetalle.tiempoEstimado}
                      </span>
                    </div>
                  </div>
  )
}
