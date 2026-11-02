import MenuConfiguracion from '../../../../components/MenuConfiguracion'
import { FaBuilding, FaUserShield } from 'react-icons/fa'
import IncidentKpisGrid from './IncidentKpisGrid'
import CitiesCard from './CitiesCard'
import IncidentManagementPart from './IncidentManagementPart'
import EsEncargado from './EsEncargado'
import IncidentGrid2 from './IncidentGrid2'
import IncidentManagementPart2 from './IncidentManagementPart2'
import ModalCrear from './ModalCrear'
import ModalEliminar from './ModalEliminar'
import ModalResponder from './ModalResponder'
import ZoomMedia from './ZoomMedia'

export default function ManagementMain({ activeTab, archivosCrear, branchFilter, errorModal, esEncargado, exportData, filtrados, formCrear, getStatusBadge, getVehiculoImagen, handleCrearIncidencia, handleEliminarEvidenciaCrear, handleEliminarIncidencia, handleEvidenciasElegidas, handleExportExcel, handleExportPdf, handlePrint, handleQuickStatusChange, handleResponderYActualizar, inputEvidenciasRef, metrics, modalCrear, modalDetalle, modalEliminar, modalResponder, notice, nuevaPrioridadModal, nuevoEstadoModal, openDetalleModal, openResponderModal, respuestaTexto, search, setActiveTab, setBranchFilter, setErrorModal, setFormCrear, setModalCrear, setModalDetalle, setModalEliminar, setModalResponder, setNotice, setNuevaPrioridadModal, setNuevoEstadoModal, setRespuestaTexto, setSearch, setStateFilter, setValidationChecklist, setZoomMedia, stateFilter, sucursalEncargado, sucursales, t, translateDescription, translateTimelineDesc, translateTimelineTitle, user, validationChecklist, vehiculos, zoomMedia }) {
  return (
    <main className="management-main" style={{ padding: '24px 32px' }}>
          <div className="cities-container" style={{ maxWidth: '100%' }}>
            {/* Header Superior */}
            <header className="cities-topbar reservations-management-header">
              <div className="branch-topbar-brand-title">
                <span className="branch-topbar-badge">
                  {esEncargado ? t('hc2.validacion_operativa_de_sucursal', 'VALIDACIÓN OPERATIVA DE SUCURSAL') : t('hc2.supervision_y_auditoria_global', 'SUPERVISIÓN Y AUDITORÍA GLOBAL')}
                </span>
                <h1 className="branch-topbar-heading">
                  {esEncargado ? t('hc2.validacion_y_atencion_de_incidentes', 'Validación y Atención de Incidentes') : t('hc2.supervision_global_de_incidentes', 'Supervisión Global de Incidentes')}
                </h1>
              </div>
  
              <div className="cities-topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <MenuConfiguracion />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--city-card, #ffffff)', border: '1px solid #e2e8f0', borderRadius: '30px', padding: '4px 16px 4px 6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand-primary)', color: 'var(--city-card, #ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                    {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--city-text, #0f172a)', lineHeight: '1.2' }}>{user?.nombre || 'Administrador'}</span>
                    <span style={{ fontSize: '11px', color: 'var(--city-muted, #64748b)', lineHeight: '1.2' }}>{user?.rol || (esEncargado ? 'encargado_sucursal' : 'administrador')}</span>
                  </div>
                </div>
              </div>
            </header>
  
            {/* Notificación de Aviso */}
            {notice && (
              <div className="cities-notice" role="status">
                <span>{notice}</span>
                <button type="button" onClick={() => setNotice('')}>
                  &times;
                </button>
              </div>
            )}
  
            {/* Banner de Contexto de Rol */}
            {esEncargado ? (
              <div style={{
                margin: '0 0 16px',
                padding: '14px 18px',
                borderRadius: 12,
                background: 'var(--brand-soft)',
                border: '1.5px solid var(--brand-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                color: 'var(--brand-text)'
              }}>
                <FaBuilding style={{ color: 'var(--brand-text)', fontSize: 24, flexShrink: 0 }} />
                <div style={{ fontSize: 13 }}>
                  <strong style={{ display: 'block', color: 'var(--brand-text)', marginBottom: 2 }}>
                    Sede Operativa Asignada: {sucursalEncargado || t('hc2.tu_sucursal', 'Tu Sucursal')}
                  </strong>
                  Como Encargado de Sucursal tienes la potestad exclusiva de validar los siniestros y averías reportados por los clientes en esta sede, inspeccionar las evidencias fotográficas, dictaminar el peritaje técnico y responder formalmente al usuario.
                </div>
              </div>
            ) : (
              <div style={{
                margin: '0 0 16px',
                padding: '14px 18px',
                borderRadius: 12,
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                color: '#334155'
              }}>
                <FaUserShield style={{ color: 'var(--brand-text)', fontSize: 24, flexShrink: 0 }} />
                <div style={{ fontSize: 13 }}>
                  <strong style={{ display: 'block', color: '#0f172a', marginBottom: 2 }}>
                    Modo Supervisión y Auditoría Global (Solo Lectura)
                  </strong>
                  Como Administrador General puedes consultar, filtrar y supervisar los reportes de incidentes de todas las sedes, revisar las evidencias y la trazabilidad técnica. La validación operativa y resolución de siniestros es responsabilidad exclusiva del Encargado de cada sucursal.
                </div>
              </div>
            )}
  
            {/* Tarjetas de Métricas KPI Superiores */}
            <IncidentKpisGrid metrics={metrics} setStateFilter={setStateFilter} stateFilter={stateFilter} t={t} />
  
            {/* Pestañas de Secciones Idénticas a Reservas */}
            <div className="fleet-attached-tabs">
              <div className="fleet-tabs-nav">
                <button
                  type="button"
                  onClick={() => setActiveTab('clientes')}
                  className={`fleet-tab-btn ${activeTab === 'clientes' ? 'is-active' : ''}`}
                >
                  {t('admin.incidents.tabIncidents', 'Reportes de Clientes')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('internos')}
                  className={`fleet-tab-btn ${activeTab === 'internos' ? 'is-active' : ''}`}
                >
                  {t('admin.incidents.tabInternal', 'Reportes Internos')}
                </button>
              </div>
            </div>
  
            {/* Tarjeta Principal Adherida a las Pestañas */}
            <CitiesCard branchFilter={branchFilter} esEncargado={esEncargado} exportData={exportData} filtrados={filtrados} getStatusBadge={getStatusBadge} getVehiculoImagen={getVehiculoImagen} handleExportExcel={handleExportExcel} handleExportPdf={handleExportPdf} handlePrint={handlePrint} openDetalleModal={openDetalleModal} openResponderModal={openResponderModal} search={search} setBranchFilter={setBranchFilter} setErrorModal={setErrorModal} setModalCrear={setModalCrear} setModalEliminar={setModalEliminar} setSearch={setSearch} setStateFilter={setStateFilter} setZoomMedia={setZoomMedia} stateFilter={stateFilter} sucursalEncargado={sucursalEncargado} sucursales={sucursales} t={t} translateDescription={translateDescription} />
          </div>
  
          {/* MODAL DETALLE Y PROCESO DE VALIDACIÓN DE INCIDENCIA */}
          {modalDetalle && (() => {
            const isRechazado = modalDetalle.estado === 'rechazado' || modalDetalle.estado === 'cerrado'
            const isResuelto = modalDetalle.estado === 'resuelto'
            const isAtendiendo = modalDetalle.estado === 'atendiendo' || modalDetalle.estado === 'en_revision' || modalDetalle.estado === 'en_reparacion'
            const isRecibido = modalDetalle.estado === 'recibido'
  
            return (
              <div
                className="cities-modal-backdrop"
                onMouseDown={(e) => e.target === e.currentTarget && setModalDetalle(null)}
              >
                <section className="cities-modal" style={{ maxWidth: 720, width: '100%', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}>
                  <div className="cities-modal__head">
                    <div>
                      <p className="cities-eyebrow">{t('admin.incidents.detailTitle', 'Gestión de Incidencia')} {modalDetalle.codigo}</p>
                      <h2>{modalDetalle.vehiculo} ({modalDetalle.placa})</h2>
                    </div>
                    <button type="button" onClick={() => setModalDetalle(null)} style={{ background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--city-muted, #64748b)' }}>
                      &times;
                    </button>
                  </div>
  
                  {/* Banner de Vehículo con Imagen */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '14px 0', padding: '12px 16px', background: 'var(--city-soft)', borderRadius: 14, border: '1px solid var(--city-border)' }}>
                    <img
                      src={getVehiculoImagen(modalDetalle) || undefined}
                      alt={modalDetalle.vehiculo}
                      style={{ width: 76, height: 50, objectFit: 'cover', borderRadius: 10, border: '1px solid #cbd5e1', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/a2cb0b378c25efdb1e116246f84149744c2f4081.jpg'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 3px', fontSize: 16, fontWeight: 800, color: 'var(--city-text)' }}>{modalDetalle.vehiculo}</h3>
                      <span style={{ fontSize: 13, color: 'var(--city-muted, #64748b)', fontWeight: 600 }}>{t('admin.incidents.table.plate', 'Placa')}: <strong style={{ color: 'var(--brand-text)' }}>{modalDetalle.placa}</strong> ⬢ {modalDetalle.sucursal}</span>
                    </div>
                    {modalDetalle.codigoReserva && (
                      <div style={{ textAlign: 'right', background: 'var(--city-card, #ffffff)', padding: '8px 12px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        <span style={{ fontSize: 11, color: 'var(--city-muted, #64748b)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>{t('admin.incidents.associatedRes', 'Reserva Asociada')}</span>
                        <strong style={{ fontSize: 14, color: 'var(--brand-primary)' }}>{modalDetalle.codigoReserva}</strong>
                      </div>
                    )}
                  </div>
  
                  {/* ─── STEPPER: PROCESO DE VALIDACIÓN DEL REPORTE ─── */}
                  <IncidentManagementPart isAtendiendo={isAtendiendo} isRechazado={isRechazado} isRecibido={isRecibido} isResuelto={isResuelto} t={t} />
  
                  {/* ─── ACCIONES DE VALIDACIÓN (ENCARGADO) vs MODO SUPERVISIÓN (ADMIN) ─── */}
                  {esEncargado ? (
                    <EsEncargado handleQuickStatusChange={handleQuickStatusChange} isAtendiendo={isAtendiendo} isRechazado={isRechazado} isRecibido={isRecibido} isResuelto={isResuelto} modalDetalle={modalDetalle} openResponderModal={openResponderModal} setModalDetalle={setModalDetalle} setValidationChecklist={setValidationChecklist} sucursalEncargado={sucursalEncargado} t={t} validationChecklist={validationChecklist} />
                  ) : (
                    <div style={{
                      margin: '14px 0',
                      padding: '14px 18px',
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      fontSize: 13,
                      color: '#334155'
                    }}>
                      <FaUserShield style={{ color: 'var(--brand-text)', fontSize: 26, flexShrink: 0 }} />
                      <div>
                        <strong style={{ display: 'block', color: '#0f172a', marginBottom: 2 }}>{t('hc.supervision_de_auditoria_global_solo_l', 'Supervisión de Auditoría Global (Solo Lectura)')}</strong>
                        Este reporte de incidente es validado y resuelto operativamente por el Encargado de la sede <strong>{modalDetalle.sucursal}</strong>. El Administrador General cuenta con acceso de consulta integral y auditoría de evidencias sin intervención en las transiciones operativas ni alteración del peritaje.
                      </div>
                    </div>
                  )}
  
                  {/* Datos de Contacto y Ubicación */}
                  <IncidentGrid2 modalDetalle={modalDetalle} t={t} />
  
                  {/* ─── EVIDENCIAS ADJUNTADAS POR EL USUARIO (GALERÍA VISUAL) ─── */}
                  <IncidentManagementPart2 modalDetalle={modalDetalle} setZoomMedia={setZoomMedia} t={t} />
  
                  {/* Descripción del problema */}
                  <div className="incident-field" style={{ margin: '4px 0 12px' }}>
                    <span className="incident-field-label">{t('admin.incidents.problemDescription', 'Descripción del problema')}</span>
                    <p style={{ background: 'var(--city-soft)', border: '1.5px solid var(--city-border)', padding: '12px 16px', borderRadius: 12, fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                      {translateDescription(modalDetalle.descripcion)}
                    </p>
                  </div>
  
                  {/* TIMELINE */}
                  <span className="incident-field-label" style={{ display: 'block', marginBottom: 8 }}>{t('admin.incidents.historyTitle', 'Historial de respuestas y novedades')}</span>
                  <div className="incident-timeline">
                    {(modalDetalle.historial || []).map((h, i) => (
                      <div key={i} className="incident-timeline-item" style={{ borderLeftColor: h.color || 'var(--brand-primary)' }}>
                        <strong>{translateTimelineTitle(h.titulo)} — {h.autor}</strong>
                        <p style={{ margin: '4px 0', fontSize: 12 }}>{translateTimelineDesc(h.descripcion)}</p>
                        <small>{h.hora} ({new Date(h.fecha).toLocaleDateString()})</small>
                      </div>
                    ))}
                  </div>
  
                  <div className="cities-modal__actions" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button 
                      type="button" 
                      onClick={() => setModalDetalle(null)} 
                      style={{ 
                        background: 'var(--city-bg, #f1f5f9)', 
                        color: 'var(--city-muted, #475569)', 
                        border: '1.5px solid #cbd5e1', 
                        padding: '8px 22px', 
                        borderRadius: '9999px', 
                        fontWeight: 700, 
                        fontSize: '13px', 
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0' }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'var(--city-bg, #f1f5f9)' }}
                    >
                      {t('admin.incidents.close', 'Cerrar')}
                    </button>
                  </div>
                </section>
              </div>
            )
          })()}
  
          {/* MODAL CREAR INCIDENCIA PROPIA */}
          {modalCrear && (
            <ModalCrear archivosCrear={archivosCrear} errorModal={errorModal} formCrear={formCrear} handleCrearIncidencia={handleCrearIncidencia} handleEliminarEvidenciaCrear={handleEliminarEvidenciaCrear} handleEvidenciasElegidas={handleEvidenciasElegidas} inputEvidenciasRef={inputEvidenciasRef} setFormCrear={setFormCrear} setModalCrear={setModalCrear} t={t} user={user} vehiculos={vehiculos} />
          )}
  
          {/* MODAL ELIMINAR REPORTES CON VALIDACIÓN */}
          {modalEliminar && (
            <ModalEliminar errorModal={errorModal} handleEliminarIncidencia={handleEliminarIncidencia} modalEliminar={modalEliminar} setModalEliminar={setModalEliminar} t={t} />
          )}
  
          {/* MODAL RESPONDER AL INCIDENTE */}
          {modalResponder && (
            <ModalResponder errorModal={errorModal} handleResponderYActualizar={handleResponderYActualizar} modalResponder={modalResponder} nuevaPrioridadModal={nuevaPrioridadModal} nuevoEstadoModal={nuevoEstadoModal} respuestaTexto={respuestaTexto} setModalResponder={setModalResponder} setNuevaPrioridadModal={setNuevaPrioridadModal} setNuevoEstadoModal={setNuevoEstadoModal} setRespuestaTexto={setRespuestaTexto} t={t} translateDescription={translateDescription} />
          )}
          {/* Modal Visor de Evidencias (Imagen / Video) */}
          {zoomMedia && (
            <ZoomMedia setZoomMedia={setZoomMedia} t={t} zoomMedia={zoomMedia} />
          )}
        </main>
  )
}
