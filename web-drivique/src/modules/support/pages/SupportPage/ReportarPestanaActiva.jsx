import { FaInfoCircle, FaExclamationTriangle, FaWrench, FaClock, FaCamera, FaUser, FaPaperPlane } from 'react-icons/fa'
import { TIPOS_INCIDENCIA } from '../../data/supportCatalog'

export default function ReportarPestanaActiva({ archivos, enviando, formData, handleAdjuntarEvidencia, handleArchivosElegidos, handleEliminarEvidencia, handleEnviarReporte, handleSelectVehiculoChange, handleTipoChipClick, inputEvidenciasRef, renderIconoChip, setFormData, t, tipoSeleccionadoObj, vehiculosElegibles }) {
  return (
    <div>
              {/* Banner de Información */}
              <div className="form-info-banner">
                <FaInfoCircle style={{ fontSize: 20, color: 'var(--brand-text)', flexShrink: 0 }} />
                <span>
                  {t(
                    'soporte.formBanner',
                    t('hc2.complete_el_formulario_para_reportar_c', 'Complete el formulario para reportar cualquier problema técnico o mecánico durante su reserva.')
                  )}
                </span>
              </div>
  
              {/* Aviso si no hay reservas confirmadas activas */}
              {vehiculosElegibles.length === 0 && !formData.vehiculo && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    borderRadius: 16,
                    padding: '16px 20px',
                    marginBottom: 24,
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <FaExclamationTriangle style={{ fontSize: 20, flexShrink: 0 }} />
                  <span>
                    No cuentas con reservas confirmadas o en curso en este momento. Para reportar una incidencia debes tener una reserva confirmada activa.
                  </span>
                </div>
              )}
  
              {/* Card del Formulario */}
              <form className="formulario-incidencia-card" onSubmit={handleEnviarReporte}>
                <div className="form-header-row">
                  <FaWrench style={{ color: 'var(--brand-text)', fontSize: 22 }} />
                  <h3>{t('soporte.formTitle', 'Formulario de Incidencia')}</h3>
                </div>
  
                {/* Vehículo (Select de Reservas en curso) / Placa asociada */}
                <div className="form-grupo">
                  <label className="form-label">
                    {t('soporte.vehiculoLabel', 'Vehículo / Reserva asociada')}
                  </label>
                  <div className="form-grid-2col">
                    {/* Select desplegable con vehículos en reserva confirmada/en curso/finalizada */}
                    <select
                      className="form-input-text"
                      value={vehiculosElegibles.find(v => v.nombre === formData.vehiculo)?.id || formData.vehiculo}
                      onChange={handleSelectVehiculoChange}
                      disabled={enviando || (vehiculosElegibles.length === 0 && !formData.vehiculo)}
                    >
                      {vehiculosElegibles.length === 0 ? (
                        <option value="">{t('hc.no_tienes_reservas_confirmadas_para_re', 'No tienes reservas confirmadas para reportar')}</option>
                      ) : (
                        vehiculosElegibles.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.nombre} {item.placa ? `— Placa: ${item.placa}` : ''}
                          </option>
                        ))
                      )}
                      {formData.vehiculo &&
                        !vehiculosElegibles.some((v) => v.nombre === formData.vehiculo || v.id === formData.vehiculo) && (
                          <option value={formData.vehiculo}>{formData.vehiculo}</option>
                        )}
                    </select>
  
                    {/* Input de Placa automática del carro */}
                    <input
                      type="text"
                      className="form-input-text"
                      placeholder={t('hc2.placa_ej_kls_849', 'Placa del vehículo (ej: KLS-849)')}
                      value={formData.placa}
                      onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                      readOnly={Boolean(formData.vehiculo && vehiculosElegibles.some(v => (v.nombre === formData.vehiculo || v.id === formData.vehiculo) && v.placa))}
                      style={{
                        fontFamily: 'monospace, sans-serif',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        background: formData.placa ? 'var(--city-bg, #f8fafc)' : undefined,
                      }}
                    />
                  </div>
                </div>
  
                {/* Tipo de Incidencia */}
                <div className="form-grupo">
                  <label className="form-label">
                    {t('soporte.tipoIncidenciaLabel', 'Tipo de Incidencia')} <span>*</span>
                  </label>
                  <div className="tipos-incidencia-grid">
                    {TIPOS_INCIDENCIA.map((tipo) => {
                      const isSelected = formData.tipoIncidenciaId === tipo.id
                      return (
                        <button
                          key={tipo.id}
                          type="button"
                          className={`tipo-chip-btn ${isSelected ? 'seleccionado' : ''}`}
                          onClick={() => handleTipoChipClick(tipo.id)}
                        >
                          {renderIconoChip(tipo.icono)}
                          <span>{tipo.nombre}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
  
                {/* Banner de Tiempo Estimado Dinámico */}
                <div className="tiempo-estimado-banner">
                  <FaClock style={{ fontSize: 24, flexShrink: 0 }} />
                  <div>
                    <span className="tiempo-estimado-text">
                      {t('soporte.tiempoEstLabel', 'Tiempo estimado de atención técnica:')}
                    </span>
                    <span className="tiempo-estimado-val">{tipoSeleccionadoObj.tiempoEstimado}</span>
                  </div>
                </div>
  
                {/* Descripción del problema */}
                <div className="form-grupo">
                  <label className="form-label">
                    {t('soporte.descripcionLabel', 'Descripción del problema')} <span>*</span>
                  </label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    placeholder={t(
                      'soporte.descripcionPlaceholder',
                      t('hc2.describe_lo_sucedido_ruidos_testigos_e', 'Describe lo sucedido, ruidos, testigos en tablero o ubicación actual...')
                    )}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  />
                </div>
  
                {/* Evidencias (Imágenes / Videos opcionales) */}
                <div className="form-grupo">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      {t('soporte.evidenciasLabel', 'Evidencias (Imágenes / Videos opcionales)')}
                    </label>
                    <span style={{ fontSize: 11, color: 'var(--texto-second, #94a3b8)' }}>
                      Máx 3 fotos ({formData.evidenciasCount}/3)
                    </span>
                  </div>
  
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    {archivos.length < 3 && (
                      <div className="evidencias-upload-box" onClick={handleAdjuntarEvidencia} style={{ flexShrink: 0 }}>
                        <FaCamera style={{ fontSize: 22 }} />
                        <span>{t('hc4.adjunto', '+ Adjunto')}</span>
                      </div>
                    )}
                    <input
                      ref={inputEvidenciasRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,video/mp4"
                      multiple
                      hidden
                      onChange={handleArchivosElegidos}
                    />
  
                    {/* Vista previa de las fotos subidas */}
                    {archivos.map((archivo, idx) => {
                      const previewUrl = URL.createObjectURL(archivo)
                      const isVideo = archivo.type?.startsWith('video/')
                      return (
                        <div
                          key={`${archivo.name}-${idx}`}
                          style={{
                            position: 'relative',
                            width: 100,
                            height: 90,
                            borderRadius: 16,
                            overflow: 'hidden',
                            border: '1px solid var(--borde, #e2e8f0)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            background: '#0f172a',
                            flexShrink: 0
                          }}
                        >
                          {isVideo ? (
                            <video
                              src={previewUrl}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <img
                              src={previewUrl}
                              alt={`Evidencia ${idx + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => handleEliminarEvidencia(idx)}
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              background: 'rgba(0,0,0,0.7)',
                              color: '#ffffff',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: 13,
                              lineHeight: 1
                            }}
                            title={t('common.delete', 'Eliminar')}
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
  
                {/* Datos de contacto para seguimiento */}
                <div className="contacto-seccion-header">
                  <h4>
                    <FaUser style={{ color: 'var(--brand-text)' }} />
                    {t('soporte.contactoHeader', 'Datos de contacto para seguimiento')}
                  </h4>
                  <p>
                    {t(
                      'soporte.contactoSub',
                      t('hc2.precargados_automaticamente_desde_tu_p', 'Precargados automáticamente desde tu perfil registrado (puedes editarlos si lo requieres).')
                    )}
                  </p>
                </div>
  
                <div className="form-grupo">
                  <label className="form-label">
                    {t('soporte.nombreLabel', 'Nombre completo')} <span>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input-text"
                    value={formData.contactoNombre}
                    onChange={(e) => setFormData({ ...formData, contactoNombre: e.target.value })}
                  />
                </div>
  
                <div className="form-grupo">
                  <div className="form-grid-2col">
                    <div>
                      <label className="form-label">
                        {t('soporte.telefonoLabel', 'Teléfono')} <span>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input-text"
                        value={formData.contactoTelefono}
                        onChange={(e) => setFormData({ ...formData, contactoTelefono: e.target.value })}
                      />
                    </div>
  
                    <div>
                      <label className="form-label">
                        {t('soporte.emailLabel', 'Correo electrónico')} <span>*</span>
                      </label>
                      <input
                        type="email"
                        className="form-input-text"
                        value={formData.contactoEmail}
                        onChange={(e) => setFormData({ ...formData, contactoEmail: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
  
                <button
                  type="submit"
                  className="btn-enviar-reporte"
                  disabled={vehiculosElegibles.length === 0 && !formData.vehiculo}
                  style={{
                    opacity: vehiculosElegibles.length === 0 && !formData.vehiculo ? 0.6 : 1,
                    cursor: vehiculosElegibles.length === 0 && !formData.vehiculo ? 'not-allowed' : 'pointer',
                  }}
                >
                  <FaPaperPlane /> {t('soporte.btnEnviarReporte', 'Enviar Reporte de Incidencia')}
                </button>
              </form>
            </div>
  )
}
