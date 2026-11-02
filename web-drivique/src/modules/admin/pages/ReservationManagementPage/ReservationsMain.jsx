import MenuConfiguracion from '../../../../components/MenuConfiguracion'
import ReservationsToolbar from './ReservationsToolbar'
import { FaCalendarAlt, FaBan } from 'react-icons/fa'
import ReservationsPaymentBody from './ReservationsPaymentBody'
import { formatCurrency } from '../../../../utils/currencyUtils'
import ReservationsActionsBody from './ReservationsActionsBody'
import ModalDetalle from './ModalDetalle'
import ModalCrear from './ModalCrear'
import ZoomImage from './ZoomImage'
import ZoomPdf from './ZoomPdf'
import ContratoModalReserva from './ContratoModalReserva'

export default function ReservationsMain({ abrirNovedades, activeTab, branchFilter, cashRoute, contratoModalReserva, currentPage, dateFrom, dateTo, esEncargado, filtradas, formCrear, formEditar, handleEntregarAuto, handleExportExcel, handleExportPdf, handleOpenDocument, handlePrint, handleRecibirDevolucion, modalCancelar, modalCrear, modalDetalle, modalEditar, moneda, motivoCancelar, navigate, notice, paginatedReservations, search, setActiveTab, setBranchFilter, setContratoModalReserva, setCurrentPage, setDateFrom, setDateTo, setFormCrear, setFormEditar, setModalCancelar, setModalCrear, setModalDetalle, setModalEditar, setMotivoCancelar, setNotice, setSearch, setStatusFilter, setZoomImage, setZoomPdf, statusFilter, submitCancelarReserva, submitCrearManual, submitEditarReserva, sucursalEncargado, sucursalesVisibles, t, tasaUSD, totalPages, user, vehiculosDisponibles, zoomImage, zoomPdf }) {
  return (
    <main className="management-main" style={{ padding: '24px 32px' }}>
          <div className="cities-container" style={{ maxWidth: '100%' }}>
          {/* Topbar Superior */}
          <header className="cities-topbar reservations-management-header">
            <div className="branch-topbar-brand-title">
              <span className="branch-topbar-badge">{t('admin.reservationsManagement.subtitle', 'GESTIÓN DE SUCURSAL')}</span>
              <h1 className="branch-topbar-heading">{t('admin.reservationsManagement.title', 'Gestión de Reservas')}</h1>
            </div>
  
            <div className="branch-topbar-actions">
              <MenuConfiguracion />
              {user && (
                <div className="branch-user-profile-chip">
                  <div className="branch-user-avatar">
                    {(user?.nombre || user?.correo || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="branch-user-info-text">
                    <strong className="branch-user-name">
                      {(() => {
                        const nom = (user?.nombre || '').trim()
                        const ape = (user?.apellido || '').trim()
                        if (nom && ape && !nom.toLowerCase().includes(ape.toLowerCase())) return `${nom} ${ape}`
                        return nom || ape || user?.correo || 'Usuario'
                      })()}
                    </strong>
                    <span className="branch-user-role">
                      {user?.rol || 'administrador'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </header>
  
          {/* Mensaje de Aviso / Notificación */}
          {notice && (
            <div className="cities-notice" role="status">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice('')}>
                á—
              </button>
            </div>
          )}
  
          {/* Pestañas de Secciones y Botón Crear a la derecha */}
          <div className="fleet-attached-tabs">
            <div className="fleet-tabs-nav">
              <button
                type="button"
                onClick={() => setActiveTab('fechas_ubicacion')}
                className={`fleet-tab-btn ${activeTab === 'fechas_ubicacion' ? 'is-active' : ''}`}
              >{t('admin.reservationsManagement.tabs.details', 'Detalles')}</button>
              <button
                type="button"
                onClick={() => setActiveTab('proteccion_extras')}
                className={`fleet-tab-btn ${activeTab === 'proteccion_extras' ? 'is-active' : ''}`}
              >{t('admin.reservationsManagement.tabs.coverages', 'Coberturas')}</button>
              <button
                type="button"
                onClick={() => setActiveTab('datos_pago')}
                className={`fleet-tab-btn ${activeTab === 'datos_pago' ? 'is-active' : ''}`}
              >{t('admin.reservationsManagement.tabs.payments', 'Pagos')}</button>
            </div>
  
            {/*
            <div className="fleet-tabs-action">
              <button
                className="cities-primary fleet-btn-create-tab"
                type="button"
                onClick={openCrearModal}
              >
                <FaPlus style={{ marginRight: 8 }} /> {t('admin.createManualReservation', 'Reserva Manual')}
              </button>
            </div>
            */}
          </div>
  
          {/* Sección del Flujo Activo */}
          <section className="cities-card attached-to-tabs">
            <ReservationsToolbar branchFilter={branchFilter} dateFrom={dateFrom} dateTo={dateTo} esEncargado={esEncargado} handleExportExcel={handleExportExcel} handleExportPdf={handleExportPdf} handlePrint={handlePrint} search={search} setBranchFilter={setBranchFilter} setDateFrom={setDateFrom} setDateTo={setDateTo} setSearch={setSearch} setStatusFilter={setStatusFilter} statusFilter={statusFilter} sucursalEncargado={sucursalEncargado} sucursalesVisibles={sucursalesVisibles} t={t} />
  
            {/* Resumen de resultados del flujo activo */}
            <div className="cities-summary" style={{ margin: "8px 0 12px" }}>
              <span>{filtradas.length}</span>{" "}
              {t("admin.reservationsFound", "RESERVAS EN EL LISTADO").toUpperCase()}
            </div>
  
            {/* Tabla de Reservas del Flujo Activo */}
            {filtradas.length === 0 ? (
              <div className="cities-empty">
                <FaCalendarAlt />
                <h2>{t("admin.reservationsManagement.emptyTitle", "No hay reservas registradas en esta sección")}</h2>
                <p>{t("admin.reservationsManagement.emptyText", "No se encontraron registros en esta categoría con los filtros aplicados.")}</p>
              </div>
            ) : (
              <div className="cities-table-wrap">
                <table className="branches-table reservations-admin-table">
                  {/* â”€â”€ TABLA 1: FECHAS Y UBICACIÓN (PASO 1 DE RESERVA) â”€â”€ */}
                  {activeTab === 'fechas_ubicacion' && (
                    <>
                      <thead>
                        <tr>
                          <th style={{ textTransform: "uppercase" }}>ID</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.code", "CÓDIGO RESERVA")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.photo", "IMAGEN")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.vehicle", "NOMBRE VEHÍCULO")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.plate", "PLACA")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.paymentMethod", "MEDIO DE PAGO")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.pickup", "LUGAR DE RETIRO")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.dropoff", "LUGAR DE DEVOLUCIÓN")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.pickupDate", "FECHA DE RETIRO")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.dropoffDate", "FECHA DE DEVOLUCIÓN")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.pickupTime", "HORA DE RETIRO")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.dropoffTime", "HORA DE DEVOLUCIÓN")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.duration", "DURACIÓN DEL ALQUILER")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.earlyReturn", "DEVOLUCIÓN ANTICIPADA")}</th>
                        </tr>
                      </thead>
                      <ReservationsPaymentBody paginatedReservations={paginatedReservations} setModalDetalle={setModalDetalle} setZoomImage={setZoomImage} t={t} />
                    </>
                  )}
  
                  {/* â”€â”€ TABLA 2: PROTECCIÓN Y EXTRAS â”€â”€ */}
                  {activeTab === 'proteccion_extras' && (
                    <>
                      <thead>
                        <tr>
                          <th style={{ textTransform: "uppercase" }}>ID</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.code", "CÓDIGO RESERVA")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.protectionPlan", "PLAN PROTECCIÓN")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.protectionPrice", "PRECIO PROTECCIÓN")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.mileageType", "TIPO KILOMETRAJE")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.mileagePrice", "PRECIO KILOMETRAJE")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.additionalServices", "SERVICIOS ADICIONALES")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.servicesPrice", "PRECIO SERVICIOS")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedReservations.map((r, idx) => {
                          const cod = r.codigo || r.referencia || `RES-${r.id}`
                          // Coberturas, kilometraje y servicios: nombre y subtotal calculados por el servidor (r.detalle)
                          const det = r.detalle || {}
                          const cobNombre = det.seguro?.nombre || ''
                          const cobTotal = Number(det.seguro?.subtotal) || 0
                          const kilNombre = det.kilometraje?.nombre || ''
                          const kilTotal = Number(det.kilometraje?.subtotal) || 0
                          const serviciosServidor = Array.isArray(det.servicios) ? det.servicios : []
                          const extras = serviciosServidor.length > 0 ? serviciosServidor.map((sv) => sv.nombre).join(', ') : 'Ninguno'
                          const extrasTotal = serviciosServidor.reduce((acc, sv) => acc + (Number(sv.total) || 0), 0)
  
                          return (
                            <tr key={r.id || cod}>
                              <td>{idx + 1}</td>
                              <td>
                                <code role="button" tabIndex={0} title={t('hc.ver_detalle_de_la_reserva_y_novedades', 'Ver detalle de la reserva y novedades')} style={{ cursor: "pointer", textDecoration: "underline dotted" }} onClick={() => setModalDetalle(r)} onKeyDown={(e) => e.key === "Enter" && setModalDetalle(r)}>{cod}</code>
                              </td>
                              <td>{cobNombre === 'Protección Obligatoria' ? t('admin.reservationsManagement.protectionMandatory', 'Protección Obligatoria') : cobNombre === 'Protección Total' ? t('admin.reservationsManagement.protectionTotal', 'Protección Total') : cobNombre}</td>
                              <td style={{ fontWeight: 600 }}>{formatCurrency(cobTotal, moneda || 'COP', tasaUSD)}</td>
                              <td>{String(kilNombre).toLowerCase().includes('ilimitado') ? t('admin.reservationsManagement.mileageUnlimited', 'Kilometraje ilimitado') : String(kilNombre).toLowerCase().includes('limitado') ? t('admin.reservationsManagement.mileageLimited', 'Kilometraje limitado') : kilNombre}</td>
                              <td style={{ fontWeight: 600 }}>{formatCurrency(kilTotal, moneda || 'COP', tasaUSD)}</td>
                              <td>{extras === 'Ninguno' ? t('admin.reservationsManagement.none', 'Ninguno') : extras}</td>
                              <td style={{ fontWeight: 600 }}>{formatCurrency(extrasTotal, moneda || 'COP', tasaUSD)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </>
                  )}
  
                  {/* â”€â”€ TABLA 3: DATOS PERSONALES Y PAGO â”€â”€ */}
                  {activeTab === 'datos_pago' && (
                    <>
                      <thead>
                        <tr>
                          <th style={{ textTransform: "uppercase" }}>ID</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.code", "CÓDIGO RESERVA")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.fullName", "NOMBRE COMPLETO")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.email", "CORREO")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.docType", "TIPO DE DOCUMENTO")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.nationality", "NACIONALIDAD")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.phone", "TELÉFONO CELULAR")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.docNumber", "NÚMERO DE DOCUMENTO")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.idDocument", "DOCUMENTO DE IDENTIDAD")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.drivingLicense", "LICENCIA DE CONDUCCIÓN")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.terms", "TÉRMINOS Y CONDICIONES")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.promotions", "PROMOCIONES")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.totalPayment", "PAGO TOTAL")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.reservationStatus", "ESTADO RESERVA")}</th>
                          <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.paymentStatus", "ESTADO DEL PAGO")}</th>
                          <th style={{ textAlign: 'center', textTransform: "uppercase" }}>{t("admin.reservationsManagement.contractStatus", "ESTADO FIRMA DE CONTRATO")}</th>
                          <th style={{ textAlign: 'center', textTransform: "uppercase" }}>{t("admin.reservationsManagement.confirmPickup", "CONFIRMAR ENTREGA")}</th>
                          <th style={{ textAlign: 'center', textTransform: "uppercase" }}>{t("admin.reservationsManagement.confirmReturn", "CONFIRMAR DEVOLUCIÓN")}</th>
                        </tr>
                      </thead>
                      <ReservationsActionsBody abrirNovedades={abrirNovedades} cashRoute={cashRoute} esEncargado={esEncargado} handleEntregarAuto={handleEntregarAuto} handleOpenDocument={handleOpenDocument} handleRecibirDevolucion={handleRecibirDevolucion} moneda={moneda} navigate={navigate} paginatedReservations={paginatedReservations} setContratoModalReserva={setContratoModalReserva} setModalDetalle={setModalDetalle} t={t} tasaUSD={tasaUSD} />
                    </>
                  )}
                
                </table>
                
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '20px', padding: '16px 0', borderTop: '1px solid var(--city-border)' }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--city-border)', background: currentPage === 1 ? 'var(--city-bg)' : 'var(--bg-seccion1)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, color: currentPage === 1 ? 'var(--texto-terciary)' : 'var(--texto-primary)' }}
                    >
                      Anterior
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--texto-second)' }}>
                      {t('admin.reservationsManagement.pagination.page', 'Página {{current}} de {{total}}', { current: currentPage, total: totalPages })}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--city-border)', background: currentPage === totalPages ? 'var(--city-bg)' : 'var(--bg-seccion1)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, color: currentPage === totalPages ? 'var(--texto-terciary)' : 'var(--texto-primary)' }}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
  
            )}
          </section>
        </div>
  
        {/* â”€â”€ MODAL 1: DETALLE COMPLETO DE RESERVA â”€â”€ */}
        {modalDetalle && (
          <ModalDetalle cashRoute={cashRoute} modalDetalle={modalDetalle} moneda={moneda} navigate={navigate} setModalDetalle={setModalDetalle} t={t} tasaUSD={tasaUSD} />
        )}
  
        {/* â”€â”€ MODAL 2: CREAR RESERVA MANUAL â”€â”€ */}
        {modalCrear && (
          <ModalCrear esEncargado={esEncargado} formCrear={formCrear} setFormCrear={setFormCrear} setModalCrear={setModalCrear} submitCrearManual={submitCrearManual} sucursalEncargado={sucursalEncargado} sucursalesVisibles={sucursalesVisibles} t={t} vehiculosDisponibles={vehiculosDisponibles} />
        )}
  
        {/* â”€â”€ MODAL 3: EDITAR RESERVA â”€â”€ */}
        {modalEditar && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) => e.target === e.currentTarget && setModalEditar(null)}
          >
            <section className="cities-modal" role="dialog">
              <div className="cities-modal__head">
                <div>
                  <p className="cities-eyebrow">{t('admin.reservationsManagement.editModal.eyebrow')}</p>
                  <h2>{t('admin.reservationsManagement.editModal.titlePrefix', { code: modalEditar.codigo })}</h2>
                </div>
                <button type="button" onClick={() => setModalEditar(null)}>
                  á—
                </button>
              </div>
  
              <form onSubmit={submitEditarReserva}>
                <div className="branches-form-grid">
                  <label>
                    {t('admin.reservationsManagement.editModal.pickupDate')}
                    <input
                      type="datetime-local"
                      value={formEditar.fechaInicio}
                      onChange={(e) => setFormEditar({ ...formEditar, fechaInicio: e.target.value })}
                    />
                  </label>
                  <label>
                    {t('admin.reservationsManagement.editModal.returnDate')}
                    <input
                      type="datetime-local"
                      value={formEditar.fechaFin}
                      onChange={(e) => setFormEditar({ ...formEditar, fechaFin: e.target.value })}
                    />
                  </label>
                </div>
  
                <div className="cities-modal__actions">
                  <button type="button" onClick={() => setModalEditar(null)}>
                    {t('common.cancel')}
                  </button>
                  <button className="cities-primary" type="submit">
                    {t('admin.reservationsManagement.editModal.save')}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
  
        {/* â”€â”€ MODAL 4: CANCELAR RESERVA â”€â”€ */}
        {modalCancelar && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) => e.target === e.currentTarget && setModalCancelar(null)}
          >
            <section className="cities-modal" role="dialog">
              <div className="cities-delete-icon">
                <FaBan />
              </div>
              <h2>{t('admin.reservationsManagement.cancelModal.titlePrefix', { code: modalCancelar.codigo })}</h2>
              <p>{t('admin.reservationsManagement.cancelModal.warningText')}</p>
  
              <form onSubmit={submitCancelarReserva} style={{ marginTop: 16 }}>
                <label>
                  {t('admin.reservationsManagement.cancelModal.reasonLabel')}
                  <input
                    required
                    placeholder={t('admin.reservationsManagement.cancelModal.reasonPlaceholder')}
                    value={motivoCancelar}
                    onChange={(e) => setMotivoCancelar(e.target.value)}
                  />
                </label>
  
                <div className="cities-modal__actions">
                  <button type="button" onClick={() => setModalCancelar(null)}>
                    {t('admin.reservationsManagement.cancelModal.back')}
                  </button>
                  <button className="cities-danger" type="submit">
                    {t('admin.reservationsManagement.cancelModal.confirm')}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
        {/* â”€â”€ MODAL DE IMAGEN AMPLIADA â”€â”€ */}
        {zoomImage && (
          <ZoomImage setZoomImage={setZoomImage} t={t} zoomImage={zoomImage} />
        )}
  
        {/* MODAL VISOR DE DOCUMENTO IDENTIDAD / LICENCIA */}
        {zoomPdf && (
          <ZoomPdf setZoomPdf={setZoomPdf} t={t} zoomPdf={zoomPdf} />
        )}
  
        {/* MODAL VER CONTRATO OFICIAL CON FIRMA */}
        {contratoModalReserva && (
          <ContratoModalReserva contratoModalReserva={contratoModalReserva} setContratoModalReserva={setContratoModalReserva} />
        )}
      </main>
  )
}
