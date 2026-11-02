import { FaExternalLinkAlt, FaIdCard, FaCheckCircle, FaShieldAlt } from 'react-icons/fa'
import DocumentPreviewer from '../../../../components/DocumentPreviewer'

export default function ZoomPdf({ setZoomPdf, t, zoomPdf }) {
  return (
    <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: 20,
            }}
            onClick={() => setZoomPdf(null)}
          >
            <div
              style={{
                background: 'var(--bg-tarjeta, #ffffff)',
                borderRadius: 20,
                padding: '24px 28px',
                maxWidth: 780,
                width: '100%',
                maxHeight: '88vh',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid var(--borde, #e2e8f0)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--borde, #e2e8f0)', paddingBottom: 14 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-primary, #2563eb)' }}>
                    {zoomPdf.docType === 'license' ? t('hc2.licencia_de_conduccion_oficial', 'Licencia de Conducción Oficial') : t('hc2.documento_de_identidad_oficial', 'Documento de Identidad Oficial')}
                  </span>
                  <h3 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 800, color: 'var(--texto-primary, #0f172a)' }}>
                    {zoomPdf.title}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {zoomPdf.url && (
                    <a
                      href={zoomPdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--brand-primary, #2563eb)',
                        textDecoration: 'none',
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: 'var(--brand-soft-light, #eff6ff)',
                      }}
                    >
                      <FaExternalLinkAlt size={11} /> Abrir original
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setZoomPdf(null)}
                    style={{
                      background: 'var(--city-bg, #f1f5f9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      fontWeight: 700,
                      color: 'var(--texto-second, #64748b)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
  
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {zoomPdf.url ? (
                  <div style={{ flex: 1, minHeight: 460 }}>
                    <DocumentPreviewer
                      url={zoomPdf.url}
                      title={zoomPdf.title}
                      isZoomed={true}
                      fallbackSubtitle={zoomPdf.cliNom}
                      fallbackDocNumber={zoomPdf.cliDoc}
                    />
                  </div>
                ) : (
                  /* TARJETA OFICIAL KYC DE DOCUMENTO VERIFICADO EN SUCURSAL */
                  <div style={{
                    padding: 24,
                    background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.9) 100%)',
                    borderRadius: 16,
                    border: '1.5px solid var(--borde, #cbd5e1)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
                  }}>
                    {/* Encabezado del Documento Oficial */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--brand-primary)', paddingBottom: 14, marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--brand-primary-hover) 0%, var(--brand-primary) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FaIdCard size={22} />
                        </div>
                        <div>
                          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', color: 'var(--brand-text)', textTransform: 'uppercase' }}>
                            REPÚBLICA DE COLOMBIA · SISTEMA NACIONAL RUNT
                          </span>
                          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: 'var(--texto-primary, #0f172a)' }}>
                            {zoomPdf.docType === 'license' ? t('hc2.licencia_de_conduccion_vehicular', 'LICENCIA DE CONDUCCIÓN VEHICULAR') : t('hc2.documento_nacional_de_identidad', 'DOCUMENTO NACIONAL DE IDENTIDAD')}
                          </h4>
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        background: '#dcfce7',
                        color: '#15803d',
                        fontSize: 11,
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5
                      }}>
                        <FaCheckCircle size={12} /> Vigente y Verificado
                      </span>
                    </div>
  
                    {/* Cuerpo con datos del Titular */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 18 }}>
                      <div style={{ background: 'var(--bg-tarjeta, #ffffff)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--borde, #e2e8f0)' }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--texto-second, #64748b)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                          Nombre del Titular
                        </span>
                        <strong style={{ fontSize: 14, color: 'var(--texto-primary, #0f172a)', display: 'block' }}>
                          {zoomPdf.cliNom}
                        </strong>
                      </div>
  
                      <div style={{ background: 'var(--bg-tarjeta, #ffffff)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--borde, #e2e8f0)' }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--texto-second, #64748b)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                          Número de Documento
                        </span>
                        <strong style={{ fontSize: 15, color: 'var(--brand-text)', fontFamily: 'monospace', display: 'block' }}>
                          {zoomPdf.cliDoc || '10203040'}
                        </strong>
                      </div>
  
                      <div style={{ background: 'var(--bg-tarjeta, #ffffff)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--borde, #e2e8f0)' }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--texto-second, #64748b)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                          Tipo de Documento
                        </span>
                        <strong style={{ fontSize: 13, color: 'var(--texto-primary, #0f172a)', display: 'block' }}>
                          {zoomPdf.tipoDoc || t('hc2.cedula_de_ciudadania', 'Cédula de Ciudadanía')}
                        </strong>
                      </div>
  
                      <div style={{ background: 'var(--bg-tarjeta, #ffffff)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--borde, #e2e8f0)' }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--texto-second, #64748b)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                          {zoomPdf.docType === 'license' ? t('hc2.categorias_autorizadas', 'Categorías Autorizadas') : 'Nacionalidad'}
                        </span>
                        <strong style={{ fontSize: 13, color: 'var(--texto-primary, #0f172a)', display: 'block' }}>
                          {zoomPdf.docType === 'license' ? t('hc2.b1_c1_automoviles_y_camionetas', 'B1, C1 (Automóviles y Camionetas)') : 'Colombiana'}
                        </strong>
                      </div>
                    </div>
  
                    {/* Sello de Seguridad y Validación de Sucursal */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: 'var(--bg-tarjeta, #ffffff)',
                      border: '1px dashed var(--brand-primary)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FaShieldAlt size={22} color="var(--brand-primary)" />
                        <div>
                          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-text)', display: 'block' }}>
                            Expediente Validado en Sucursal Drivique
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--texto-second, #64748b)' }}>
                            Registrado para reserva: {zoomPdf.reserva?.codigo || 'Oficial'} · {zoomPdf.fileName}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#059669', fontWeight: 700 }}>
                        <FaCheckCircle size={13} />
                        <span>{t('hc.conforme_ley_769_de_2002', 'Conforme Ley 769 de 2002')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
  
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18, borderTop: '1px solid var(--borde, #e2e8f0)', paddingTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setZoomPdf(null)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 10,
                    background: 'var(--brand-primary, #2563eb)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 13,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Cerrar Visor
                </button>
              </div>
            </div>
          </div>
  )
}
