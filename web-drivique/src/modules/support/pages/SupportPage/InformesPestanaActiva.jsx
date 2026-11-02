import { FaFolderOpen } from 'react-icons/fa'

export default function InformesPestanaActiva({ abrirDetalle, reportes, setReporteSeleccionadoModal, t }) {
  return (
    <div>
              {reportes.length === 0 ? (
                <div className="notificaciones-vacio" style={{ background: 'var(--bg-tarjeta, #ffffff)' }}>
                  <FaFolderOpen className="notificaciones-vacio-icon" />
                  <h3>{t('soporte.sinReportesTitle', 'No tienes informes o reportes activos')}</h3>
                  <p>{t('soporte.sinReportesMsg', 'Si tienes alguna avería o problema con tu vehículo, puedes crear un reporte en la pestaña anterior.')}</p>
                </div>
              ) : (
                <div className="reportes-lista">
                  {reportes.map((rep) => {
                    const getEstadoPill = (estado) => {
                      switch (estado) {
                        case 'resuelto':
                          return { text: t('hc4.resuelto', 'Resuelto'), bg: '#dcfce7', color: '#15803d', dot: '#16a34a' }
                        case 'en_atencion':
                          return { text: t('hc.en_atencion', 'En atención'), bg: '#e0f2fe', color: '#0369a1', dot: 'var(--brand-primary)' }
                        case 'en_revision':
                          return { text: t('hc.en_revision', 'En revisión'), bg: '#fef3c7', color: '#b45309', dot: '#d97706' }
                        case 'recibido':
                        default:
                          return { text: t('hc4.recibido', 'Recibido'), bg: 'var(--brand-soft-strong-light)', color: 'var(--brand-text-light)', dot: 'var(--brand-primary)' }
                      }
                    }
  
                    const pill = getEstadoPill(rep.estado)
  
                    return (
                      <div key={rep.id} className="reporte-card-item">
                        <div className="reporte-top-row">
                          <span className="reporte-codigo">{rep.codigo}</span>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              background: pill.bg,
                              color: pill.color,
                              padding: '4px 10px',
                              borderRadius: 14,
                              fontSize: 11,
                              fontWeight: 800,
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: pill.dot }} />
                            {pill.text}
                          </span>
                        </div>
  
                        <div className="reporte-tipo-vehiculo">{rep.tipoIncidenciaNombre}</div>
                        <div className="reporte-vehiculo-sub">
                          {rep.vehiculo} {rep.placa && t('hc3.plate_paren', { defaultValue: '(Placa: {{placa}})', placa: rep.placa })}
                        </div>
  
                        <p className="reporte-desc-snippet">{rep.descripcion}</p>
  
                        <div className="reporte-footer-row">
                          <span className="reporte-tiempo-est">
                            Tiempo est: {rep.tiempoEstimado}
                          </span>
  
                          <button
                            className="btn-ver-detalle-reporte"
                            onClick={async () => setReporteSeleccionadoModal(await abrirDetalle(rep.id).catch(() => rep))}
                          >
                            Ver detalle →
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
  )
}
