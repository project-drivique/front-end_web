export default function VerTyC({ c, handleTermsScroll, hasScrolledToBottom, onCambio, setTerminosLeidos, setVerTyC, t, termsScrollRef }) {
  return (
    <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16
            }}
            onClick={() => setVerTyC(false)}
          >
            <div
              style={{
                background: c?.cardBg || '#ffffff',
                borderRadius: 24,
                maxWidth: 540,
                width: '100%',
                maxHeight: '88vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
                border: `1px solid ${c?.cardBorder || '#e2e8f0'}`
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Top pill handle */}
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
                <div style={{ width: 44, height: 4.5, borderRadius: 3, background: c?.isDark ? '#475569' : '#cbd5e1' }} />
              </div>
  
              {/* Header */}
              <div style={{
                padding: '12px 24px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: `1px solid ${c?.cardBorder || '#e2e8f0'}`
              }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>
                  {t('vehiculo.termsModalTitle', 'Términos y condiciones de alquiler')}
                </h3>
                <button
                  type="button"
                  onClick={() => setVerTyC(false)}
                  style={{
                    background: c?.isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                    border: 'none',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: c?.textSecondary || '#64748b',
                    fontSize: 15,
                    fontWeight: 700
                  }}
                >
                  ✕
                </button>
              </div>
  
              {/* Scrollable Terms Content */}
              <div
                style={{
                  padding: '16px 20px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  minHeight: 0
                }}
              >
                {/* Unified Terms Card with Visible Scrollbar */}
                <div
                  ref={termsScrollRef}
                  onScroll={handleTermsScroll}
                  className="terms-modal-scroll"
                  style={{
                    borderRadius: 16,
                    border: `1.5px solid ${c?.cardBorder || '#e2e8f0'}`,
                    background: c?.cardBg || '#ffffff',
                    maxHeight: '380px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Important Policy Top Banner */}
                  <div style={{
                    background: c?.isDark ? 'rgba(var(--brand-primary-rgb), 0.08)' : 'var(--brand-soft)',
                    borderBottom: `1px solid ${c?.isDark ? 'rgba(var(--brand-primary-rgb), 0.25)' : 'var(--brand-border)'}`,
                    padding: '16px 20px',
                    flexShrink: 0
                  }}>
                    <p style={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: c?.accentText || 'var(--brand-secondary)',
                      margin: '0 0 6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {t('vehiculo.importantPoliciesTitle', 'POLÍTICAS IMPORTANTES DEL CONTRATO')}
                    </p>
                    <p style={{ fontSize: 12.5, color: c?.textPrimary || '#0f172a', margin: 0, lineHeight: 1.55 }}>
                      <strong style={{ color: c?.textPrimary || '#0f172a' }}>{t('hc.politica_de_no_reembolso', 'Política de No Reembolso:')}</strong> Una vez confirmada y pagada la reserva, no se realizan devoluciones de dinero bajo ninguna circunstancia. El cliente podrá reprogramar su fecha de alquiler notificando con al menos 48 horas de anticipación.
                    </p>
                  </div>
  
                  {/* Clauses Section */}
                  <div style={{ padding: '20px' }}>
                    <p style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: c?.textSecondary || '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      margin: '0 0 16px'
                    }}>
                      {t('vehiculo.termsSectionTitle', 'TÉRMINOS Y CONDICIONES DE ALQUILER DRIVIQUE')}
                    </p>
  
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 12.5, color: c?.textSecondary || '#64748b', lineHeight: 1.6 }}>
                      <p style={{ margin: 0 }}>
                        <strong style={{ color: c?.textPrimary || '#0f172a' }}>{t('hc.1_objeto_del_contrato', '1. OBJETO DEL CONTRATO:')}</strong> El arrendador entrega al arrendatario el vehículo descrito en las condiciones óptimas de funcionamiento para su uso personal o comercial autorizado.
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong style={{ color: c?.textPrimary || '#0f172a' }}>{t('hc.2_uso_del_vehiculo', '2. USO DEL VEHÍCULO:')}</strong> Queda estrictamente prohibido utilizar el vehículo para fines ilícitos, subarrendar, transporte de carga pesada no autorizada o conducir bajo los efectos del alcohol o sustancias psicoactivas. El vehículo debe ser usado únicamente dentro del territorio colombiano.
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong style={{ color: c?.textPrimary || '#0f172a' }}>{t('hc.3_documentacion_obligatoria', '3. DOCUMENTACIÓN OBLIGATORIA:')}</strong> El conductor debe presentar documento de identidad original válido y licencia de conducción vigente al momento de la entrega del vehículo.
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong style={{ color: c?.textPrimary || '#0f172a' }}>{t('hc.4_politica_de_cancelacion_y_no_reembol', '4. POLÍTICA DE CANCELACIÓN Y NO REEMBOLSO:')}</strong> No se realizarán devoluciones de dinero. Las cancelaciones se gestionan mediante saldo a favor para futuras reservas.
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong style={{ color: c?.textPrimary || '#0f172a' }}>{t('hc.5_duracion_y_modificaciones', '5. DURACIÓN Y MODIFICACIONES:')}</strong> La duración de la renta será la acordada en la reserva. Cualquier cambio en fechas, horas o sucursal de entrega/devolución debe ser coordinado con antelación y puede generar ajustes en la tarifa.
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong style={{ color: c?.textPrimary || '#0f172a' }}>{t('hc.6_kilometraje_y_excedentes', '6. KILOMETRAJE Y EXCEDENTES:')}</strong> En plan Limitado se incluye un cupo de km por día; el kilómetro adicional excedente tendrá un valor de $1.500 COP/km calculado al devolver el auto. En plan Ilimitado no aplica cobro por distancia recorrida.
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong style={{ color: c?.textPrimary || '#0f172a' }}>{t('hc.7_pagos_y_tarifas', '7. PAGOS Y TARIFAS:')}</strong> El valor pactado incluye la renta diaria del vehículo, coberturas de protección seleccionadas, cargos administrativos e impuestos de ley.
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong style={{ color: c?.textPrimary || '#0f172a' }}>{t('hc.8_danos_y_responsabilidad', '8. DAÑOS Y RESPONSABILIDAD:')}</strong> El arrendatario es responsable del cuidado del vehículo durante el periodo contratado. En caso de siniestro o eventualidad, se deberá notificar de forma inmediata a Drivique y a las autoridades competentes.
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong style={{ color: c?.textPrimary || '#0f172a' }}>{t('hc.9_legislacion_aplicable', '9. LEGISLACIÓN APLICABLE:')}</strong> El presente contrato de alquiler se rige en su totalidad por las leyes de la República de Colombia.
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong style={{ color: c?.textPrimary || '#0f172a' }}>{t('hc.10_politica_de_devolucion_puntual', '10. POLÍTICA DE DEVOLUCIÓN PUNTUAL:')}</strong> Por favor entrega el vehículo en la fecha y hora acordadas. Cuentas con 30 minutos de cortesía. Pasado este tiempo, la hora adicional tendrá un valor de $30.000 COP. Si el retraso supera las 2 horas o pasa al siguiente día, se cobrará el valor equivalente a un (1) día completo de alquiler a la tarifa contratada.
                      </p>
                    </div>
                  </div>
                </div>
  
              </div>
  
              {/* Footer Buttons */}
              <div style={{
                padding: '16px 24px 20px',
                borderTop: `1px solid ${c?.cardBorder || '#e2e8f0'}`,
                display: 'flex',
                gap: 12,
                alignItems: 'center'
              }}>
                <button
                  type="button"
                  onClick={() => setVerTyC(false)}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 12,
                    border: `1.5px solid ${c?.cardBorder || '#e2e8f0'}`,
                    background: c?.cardBg || '#ffffff',
                    color: c?.textPrimary || '#0f172a',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {t('common.close', 'Cerrar')}
                </button>
  
                <button
                  type="button"
                  disabled={!hasScrolledToBottom}
                  onClick={() => {
                    setTerminosLeidos(true);
                    onCambio('terminos', true);
                    setVerTyC(false);
                  }}
                  style={{
                    flex: 1.5,
                    height: 48,
                    borderRadius: 12,
                    border: 'none',
                    background: hasScrolledToBottom
                      ? 'var(--brand-gradient, #1d4ed8)'
                      : (c?.isDark ? '#334155' : '#e2e8f0'),
                    color: hasScrolledToBottom
                      ? '#ffffff'
                      : (c?.isDark ? '#64748b' : '#94a3b8'),
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: hasScrolledToBottom ? 'pointer' : 'not-allowed',
                    boxShadow: hasScrolledToBottom
                      ? '0 4px 14px rgba(var(--brand-primary-rgb), 0.25)'
                      : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {t('common.understood', 'Entendido')}
                </button>
              </div>
            </div>
          </div>
  )
}
