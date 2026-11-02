export default function DocModalRightCol({ activeSection, errorMessage, handleToggleCheck, modalChecklist, modalItem, observaciones, setErrorMessage, setObservaciones, t }) {
  return (
    <div className="doc-modal-right-col">
                    {/* SECCIÓN IDENTIDAD */}
                    {activeSection === 'identidad' && (
                      <div className="doc-checklist-section">
                        <h3 className="doc-section-title">{t('hc.documento_de_identidad', 'Documento de identidad')}</h3>
  
                        <div className="doc-checklist-group">
                          <h4 className="doc-group-subtitle">{t('hc.el_archivo', 'El archivo')}</h4>
                          
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.id_frente_reverso}
                              onChange={() => handleToggleCheck('id_frente_reverso')}
                            />
                            <span className={`doc-check-text ${modalChecklist.id_frente_reverso ? 'is-checked' : ''}`}>
                              El archivo contiene el documento completo.
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.id_legible}
                              onChange={() => handleToggleCheck('id_legible')}
                            />
                            <span className={`doc-check-text ${modalChecklist.id_legible ? 'is-checked' : ''}`}>
                              Se lee todo, sin partes borrosas, cortadas ni con reflejos.
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.id_bordes}
                              onChange={() => handleToggleCheck('id_bordes')}
                            />
                            <span className={`doc-check-text ${modalChecklist.id_bordes ? 'is-checked' : ''}`}>
                              Se ven los 4 bordes del documento.
                            </span>
                          </label>
                        </div>
  
                        <div className="doc-checklist-group">
                          <h4 className="doc-group-subtitle">{t('hc.los_datos', 'Los datos')}</h4>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.id_vigente}
                              onChange={() => handleToggleCheck('id_vigente')}
                            />
                            <span className={`doc-check-text ${modalChecklist.id_vigente ? 'is-checked' : ''}`}>
                              No está vencido (aplica a pasaporte y cédula de extranjería).
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.id_titular}
                              onChange={() => handleToggleCheck('id_titular')}
                            />
                            <span className={`doc-check-text ${modalChecklist.id_titular ? 'is-checked' : ''}`}>
                              El nombre y el número son los del titular de la reserva.
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.id_mayor_edad}
                              onChange={() => handleToggleCheck('id_mayor_edad')}
                            />
                            <span className={`doc-check-text ${modalChecklist.id_mayor_edad ? 'is-checked' : ''}`}>
                              La fecha de nacimiento confirma que es mayor de edad.
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.id_foto}
                              onChange={() => handleToggleCheck('id_foto')}
                            />
                            <span className={`doc-check-text ${modalChecklist.id_foto ? 'is-checked' : ''}`}>
                              La foto se parece al titular.
                            </span>
                          </label>
                        </div>
  
                        <div className="doc-checklist-group">
                          <h4 className="doc-group-subtitle">{t('hc.que_sea_real', 'Que sea real')}</h4>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.id_no_editada}
                              onChange={() => handleToggleCheck('id_no_editada')}
                            />
                            <span className={`doc-check-text ${modalChecklist.id_no_editada ? 'is-checked' : ''}`}>
                              No se ve editado (letras chuecas, fondo raro, foto pegada, tachones).
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.id_coinciden_lados}
                              onChange={() => handleToggleCheck('id_coinciden_lados')}
                            />
                            <span className={`doc-check-text ${modalChecklist.id_coinciden_lados ? 'is-checked' : ''}`}>
                              Las páginas y datos corresponden al mismo documento y titular.
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
  
                    {/* SECCIÓN LICENCIA */}
                    {activeSection === 'licencia' && (
                      <div className="doc-checklist-section">
                        <h3 className="doc-section-title">{t('hc.licencia_de_conduccion', 'Licencia de conducción')}</h3>
  
                        <div className="doc-checklist-group">
                          <h4 className="doc-group-subtitle">{t('hc.el_archivo', 'El archivo')}</h4>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.lic_frente_reverso}
                              onChange={() => handleToggleCheck('lic_frente_reverso')}
                            />
                            <span className={`doc-check-text ${modalChecklist.lic_frente_reverso ? 'is-checked' : ''}`}>
                              El archivo contiene la licencia completa.
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.lic_legible}
                              onChange={() => handleToggleCheck('lic_legible')}
                            />
                            <span className={`doc-check-text ${modalChecklist.lic_legible ? 'is-checked' : ''}`}>
                              Se lee todo, sin partes borrosas, cortadas ni con reflejos.
                            </span>
                          </label>
                        </div>
  
                        <div className="doc-checklist-group">
                          <h4 className="doc-group-subtitle">{t('hc.los_datos', 'Los datos')}</h4>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.lic_vigente_fechas}
                              onChange={() => handleToggleCheck('lic_vigente_fechas')}
                            />
                            <span className={`doc-check-text ${modalChecklist.lic_vigente_fechas ? 'is-checked' : ''}`}>
                              Está vigente hasta después de la fecha de fin del alquiler ({modalItem.fechaFin || '15 Oct 2026'}).
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.lic_categoria_apta}
                              onChange={() => handleToggleCheck('lic_categoria_apta')}
                            />
                            <span className={`doc-check-text ${modalChecklist.lic_categoria_apta ? 'is-checked' : ''}`}>
                              La categoría ({modalItem.categoriaLicencia || 'B1'}) sirve para el vehículo reservado ({modalItem.vehiculoNombre || modalItem.vehiculo || t('hc2.vehiculo', 'Vehículo')}).
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.lic_datos_cedula}
                              onChange={() => handleToggleCheck('lic_datos_cedula')}
                            />
                            <span className={`doc-check-text ${modalChecklist.lic_datos_cedula ? 'is-checked' : ''}`}>
                              El nombre y el número son los mismos de la cédula.
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.lic_foto_cedula}
                              onChange={() => handleToggleCheck('lic_foto_cedula')}
                            />
                            <span className={`doc-check-text ${modalChecklist.lic_foto_cedula ? 'is-checked' : ''}`}>
                              La foto es la misma persona de la cédula.
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.lic_antiguedad_minima}
                              onChange={() => handleToggleCheck('lic_antiguedad_minima')}
                            />
                            <span className={`doc-check-text ${modalChecklist.lic_antiguedad_minima ? 'is-checked' : ''}`}>
                              La fecha de expedición cumple la antigüedad mínima de la empresa.
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.lic_restricciones}
                              onChange={() => handleToggleCheck('lic_restricciones')}
                            />
                            <span className={`doc-check-text ${modalChecklist.lic_restricciones ? 'is-checked' : ''}`}>
                              Se revisaron las restricciones (ej. uso de lentes) y se informaron al cliente.
                            </span>
                          </label>
                        </div>
  
                        {/* GRUPO RUNT */}
                        <div className="doc-checklist-group doc-runt-group">
                          <div className="doc-runt-group-header">
                            <h4 className="doc-group-subtitle" style={{ margin: 0, color: '#0369a1' }}>
                              Verificación en el RUNT
                            </h4>
                            <a
                              href="https://www.runt.gov.co/actores/ciudadano/consulta-por-tipo-de-documento"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="doc-runt-btn"
                            >
                              Abrir RUNT ↗
                            </a>
                          </div>
                          <p className="doc-runt-subtext">
                            Consulta por tipo y número de documento. Pide captcha, hazlo en la pestaña que se abre.
                          </p>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.runt_activo}
                              onChange={() => handleToggleCheck('runt_activo')}
                            />
                            <span className={`doc-check-text ${modalChecklist.runt_activo ? 'is-checked' : ''}`}>
                              Consulté en el RUNT con el tipo y número de documento del titular.
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.runt_estado}
                              onChange={() => handleToggleCheck('runt_estado')}
                            />
                            <span className={`doc-check-text ${modalChecklist.runt_estado ? 'is-checked' : ''}`}>
                              El estado de la persona y de la licencia es activo (sin suspensión ni cancelación).
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.runt_categoria}
                              onChange={() => handleToggleCheck('runt_categoria')}
                            />
                            <span className={`doc-check-text ${modalChecklist.runt_categoria ? 'is-checked' : ''}`}>
                              La categoría del RUNT es la misma del PDF.
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.runt_vencimiento}
                              onChange={() => handleToggleCheck('runt_vencimiento')}
                            />
                            <span className={`doc-check-text ${modalChecklist.runt_vencimiento ? 'is-checked' : ''}`}>
                              La fecha de vencimiento del RUNT es la misma del PDF.
                            </span>
                          </label>
                        </div>
  
                        <div className="doc-checklist-group">
                          <h4 className="doc-group-subtitle">{t('hc.que_sea_real', 'Que sea real')}</h4>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.lic_no_editada}
                              onChange={() => handleToggleCheck('lic_no_editada')}
                            />
                            <span className={`doc-check-text ${modalChecklist.lic_no_editada ? 'is-checked' : ''}`}>
                              No se ve editada (letras chuecas, fondo raro, foto pegada, tachones).
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
  
                    {/* SECCIÓN RESERVA */}
                    {activeSection === 'reserva' && (
                      <div className="doc-checklist-section">
                        <h3 className="doc-section-title">{t('hc.revision_cruzada_de_reserva', 'Revisión cruzada de reserva')}</h3>
  
                        <div className="doc-checklist-group">
                          <h4 className="doc-group-subtitle">{t('hc.validacion_cruzada_de_coincidencia', 'Validación cruzada de coincidencia')}</h4>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.res_titular_unico}
                              onChange={() => handleToggleCheck('res_titular_unico')}
                            />
                            <span className={`doc-check-text ${modalChecklist.res_titular_unico ? 'is-checked' : ''}`}>
                              Los documentos son del mismo titular que hizo la reserva.
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.res_nombres_identicos}
                              onChange={() => handleToggleCheck('res_nombres_identicos')}
                            />
                            <span className={`doc-check-text ${modalChecklist.res_nombres_identicos ? 'is-checked' : ''}`}>
                              El nombre y el número son idénticos en la cédula y la licencia.
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.res_datos_coinciden}
                              onChange={() => handleToggleCheck('res_datos_coinciden')}
                            />
                            <span className={`doc-check-text ${modalChecklist.res_datos_coinciden ? 'is-checked' : ''}`}>
                              Los datos de esta reserva coinciden con los de los PDF.
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.res_fechas_cobertura}
                              onChange={() => handleToggleCheck('res_fechas_cobertura')}
                            />
                            <span className={`doc-check-text ${modalChecklist.res_fechas_cobertura ? 'is-checked' : ''}`}>
                              La licencia cubre todas las fechas de la reserva.
                            </span>
                          </label>
  
                          <label className="doc-check-row">
                            <input
                              type="checkbox"
                              checked={!!modalChecklist.res_unicidad_cliente}
                              onChange={() => handleToggleCheck('res_unicidad_cliente')}
                            />
                            <span className={`doc-check-text ${modalChecklist.res_unicidad_cliente ? 'is-checked' : ''}`}>
                              El documento no está asociado a otro cliente registrado.
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
  
                    {/* CAMPO DE OBSERVACIONES */}
                    <div className="doc-modal-observaciones-box">
                      <label className="doc-obs-label">
                        Observaciones <span className="doc-obs-req">{t('hc.obligatorio_si_se_rechaza', '(Obligatorio si se rechaza)')}</span>
                      </label>
                      <textarea
                        rows={3}
                        className="doc-obs-textarea"
                        value={observaciones}
                        onChange={(e) => {
                          setObservaciones(e.target.value)
                          if (errorMessage) setErrorMessage('')
                        }}
                        placeholder={t('hc.escribe_aqui_las_observaciones_o_el_mo', 'Escribe aquí las observaciones o el motivo de rechazo que se enviará al cliente...')}
                      />
                    </div>
                  </div>
  )
}
