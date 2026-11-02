export default function ModalResponder({ errorModal, handleResponderYActualizar, modalResponder, nuevaPrioridadModal, nuevoEstadoModal, respuestaTexto, setModalResponder, setNuevaPrioridadModal, setNuevoEstadoModal, setRespuestaTexto, t, translateDescription }) {
  return (
    <div
              className="cities-modal-backdrop"
              onClick={(e) => {
                if (e.target.className === 'cities-modal-backdrop') setModalResponder(null)
              }}
            >
              <section className="cities-modal" style={{ maxWidth: 600 }}>
                <div className="cities-modal__head">
                  <h2 style={{ fontSize: 20, color: 'var(--brand-primary)', margin: 0 }}>
                    {t('admin.incidents.replyBtn', 'Responder al Cliente')}
                  </h2>
                  <button type="button" onClick={() => setModalResponder(null)} style={{ background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--city-muted, #64748b)' }}>
                    &times;
                  </button>
                </div>
                <div className="cities-modal__body" style={{ padding: '20px 24px' }}>
                  <p style={{ fontSize: 14, color: 'var(--city-muted, #475569)', marginBottom: 20 }}>
                    {t('admin.incidents.replyHint', 'Escribe tu respuesta. Esta notificación llegará automáticamente al correo del usuario y quedará registrada en el historial del incidente.')}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      {modalResponder.codigoReserva && (
                        <div style={{ flex: 1, background: 'var(--city-bg, #f8fafc)', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: 11, color: 'var(--city-muted, #64748b)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>{t('admin.incidents.associatedRes', 'Reserva Asociada')}</span>
                          <strong style={{ fontSize: 14, color: 'var(--brand-primary)' }}>{modalResponder.codigoReserva}</strong>
                        </div>
                      )}
                      <div style={{ flex: 1, background: 'var(--city-bg, #f8fafc)', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 11, color: 'var(--city-muted, #64748b)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>{t('admin.incidents.clientName', 'Cliente')}</span>
                        <strong style={{ fontSize: 14, color: 'var(--brand-primary)' }}>{modalResponder.contactoNombre || t('hc2.cliente_no_registrado', 'Cliente no registrado')}</strong>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ flex: 1, background: 'var(--city-bg, #f8fafc)', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 11, color: 'var(--city-muted, #64748b)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>{t('admin.incidents.incidentType', 'Tipo de Incidencia')}</span>
                        <strong style={{ fontSize: 14, color: 'var(--city-muted, #475569)' }}>{t(`admin.incidents.types.${modalResponder.tipoIncidenciaId || 'averia_mecanica'}`, modalResponder.tipoIncidenciaNombre || t('admin.incidents.notSpecified', 'No especificado'))}</strong>
                      </div>
                      <div style={{ flex: 1, background: 'var(--city-bg, #f8fafc)', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 11, color: 'var(--city-muted, #64748b)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>{t('admin.incidents.emailClient', 'Correo Cliente')}</span>
                        <strong style={{ fontSize: 14, color: 'var(--city-muted, #475569)' }}>{modalResponder.contactoEmail}</strong>
                      </div>
                    </div>
  
                    <div style={{ background: 'var(--city-bg, #f8fafc)', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, color: 'var(--city-muted, #64748b)', fontWeight: 700, display: 'block', textTransform: 'uppercase', marginBottom: 4 }}>{t('admin.incidents.problemDesc', 'Descripción del Problema')}</span>
                      <p style={{ fontSize: 14, color: 'var(--city-text, #334155)', margin: 0, lineHeight: 1.4 }}>{translateDescription(modalResponder.descripcion)}</p>
                    </div>
                  </div>
  
                  <form onSubmit={handleResponderYActualizar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="incident-grid-2">
                      <div className="incident-field">
                        <span className="incident-field-label" style={{ fontWeight: 600, fontSize: 13 }}>{t('admin.incidents.changeStatus', 'Cambiar estado')}</span>
                        <select
                          value={nuevoEstadoModal}
                          onChange={(e) => setNuevoEstadoModal(e.target.value)}
                          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E") no-repeat right 12px center', backgroundSize: '12px', appearance: 'none', WebkitAppearance: 'none', width: '100%', cursor: 'pointer', outline: 'none' }}
                        >
                          <option value="recibido">{t('admin.incidents.status.received', 'Recibido')}</option>
                          <option value="atendiendo">{t('admin.incidents.status.attending', 'Atendiendo')}</option>
                          <option value="resuelto">{t('admin.incidents.status.resolved', 'Resuelto')}</option>
                          <option value="rechazado">{t('admin.incidents.status.rejected', 'Rechazado')}</option>
                        </select>
                      </div>
                      <div className="incident-field">
                        <span className="incident-field-label" style={{ fontWeight: 600, fontSize: 13 }}>{t('admin.incidents.priority', 'Prioridad')}</span>
                        <select
                          value={nuevaPrioridadModal || modalResponder.prioridad || 'media'}
                          onChange={(e) => setNuevaPrioridadModal(e.target.value)}
                          disabled
                          title={t('admin.incidents.priorityAutomatic', 'La prioridad la calcula el sistema según el tipo y la reserva')}
                          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E") no-repeat right 12px center', backgroundSize: '12px', appearance: 'none', WebkitAppearance: 'none', width: '100%', cursor: 'pointer', outline: 'none' }}
                        >
                          <option value="baja">{t('admin.incidents.priorities.baja', 'Baja')}</option>
                          <option value="media">{t('admin.incidents.priorities.media', 'Media')}</option>
                          <option value="alta">{t('admin.incidents.priorities.alta', 'Alta')}</option>
                          <option value="urgente">{t('admin.incidents.priorities.urgente', 'Urgente')}</option>
                        </select>
                      </div>
                    </div>
  
                    <div className="incident-field">
                      <span className="incident-field-label" style={{ fontWeight: 600, fontSize: 13 }}>{t('admin.incidents.replyMessage', 'Mensaje de respuesta')}</span>
                      <textarea
                        required
                        rows={5}
                        placeholder={t('admin.incidents.replyPlaceholder', 'Escribe aquí la respuesta...')}
                        value={respuestaTexto}
                        onChange={(e) => setRespuestaTexto(e.target.value)}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', resize: 'none' }}
                      />
                    </div>
                    {errorModal && <p className="cities-error">{errorModal}</p>}
                    
                    <div className="cities-modal__actions" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button 
                        type="button" 
                        className="incident-modal-btn-cancel"
                        onClick={() => setModalResponder(null)} 
                        style={{ 
                          background: 'var(--city-bg, #f1f5f9)', 
                          color: 'var(--city-muted, #475569)', 
                          border: '1.5px solid #cbd5e1', 
                          padding: '8px 20px', 
                          borderRadius: '9999px', 
                          fontWeight: 700, 
                          fontSize: '13px', 
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0' }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'var(--city-bg, #f1f5f9)' }}
                      >
                        {t('admin.incidents.cancel', 'Cancelar')}
                      </button>
                      <button 
                        type="submit" 
                        className="cities-primary incident-modal-btn-submit"
                        style={{ 
                          background: 'var(--brand-primary)', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          padding: '8px 24px', 
                          borderRadius: '9999px', 
                          border: 'none', 
                          color: 'var(--city-card, #ffffff)', 
                          fontWeight: 800, 
                          fontSize: '13px', 
                          cursor: 'pointer', 
                          boxShadow: '0 2px 6px rgba(var(--brand-primary-rgb), 0.25)',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'var(--brand-primary, #1d4ed8)' }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'var(--brand-primary)' }}
                      >
                        {t('admin.incidents.saveAndSend', 'Enviar correo y Actualizar')}
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            </div>
  )
}
