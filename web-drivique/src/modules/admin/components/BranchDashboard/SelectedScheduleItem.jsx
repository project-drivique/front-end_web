import { FaTimes, FaCheckCircle, FaClock, FaCar, FaUndo } from 'react-icons/fa'
import { getVehicleImage, formatDateLabel } from '../branchDashboardHelpers'

export default function SelectedScheduleItem({ activeTab, dashboardData, formatCOP, getInitials, handleCloseDrawer, reservaDrawer, selectedScheduleItem, t, vehiculoDrawer }) {
  return (
    <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-modal-title"
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(2px)',
              padding: '20px'
            }}
            onClick={e => { if (e.target === e.currentTarget) handleCloseDrawer(); }}
          >
            <div
              style={{
                background: 'var(--city-bg, #fff)', borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                width: '100%', maxWidth: '680px',
                maxHeight: '90vh', overflowY: 'auto',
                display: 'flex', flexDirection: 'column'
              }}
            >
              <div className="branch-drawer-content">
              <header className="branch-drawer-header" style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--city-bg,#fff)', borderRadius: '16px 16px 0 0' }}>
                <div>
                  <span className="branch-drawer-code">
                    {selectedScheduleItem.codigo || `RES-${selectedScheduleItem.id}`}
                  </span>
                  <h3 id="reservation-modal-title" className="branch-drawer-title">
                    {t('dashboard.drawer.title', 'Consulta de Reserva Registrada')}
                  </h3>
                </div>
                <button
                  type="button"
                  className="branch-drawer-close"
                  onClick={handleCloseDrawer}
                  aria-label={t('common.close', 'Cerrar')}
                >
                  <FaTimes aria-hidden="true" />
                </button>
              </header>
  
              <div className="branch-drawer-body branch-drawer-full-detail">
                {/* Metadata de Registro */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--texto-second, #64748b)', fontWeight: '500' }}>
                    {t('dashboard.drawer.registrationDate', 'Fecha Registro')}: 20 sep 2026 · 02:45 PM
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--brand-primary, #2563eb)', fontWeight: '700' }}>
                    TX: #WOMPI-994820
                  </span>
                </div>
  
                {/* Sección 1: Datos del Cliente */}
                <div className="branch-drawer-section">
                  <span className="branch-drawer-sec-title">{t('dashboard.drawer.clientTitle', 'Titular de la Reserva')}</span>
                  <div className="branch-drawer-value-row">
                    <div className="branch-schedule-avatar branch-avatar--soft-blue">
                      {getInitials(selectedScheduleItem.clienteNombre)}
                    </div>
                    <div className="branch-drawer-client-details">
                      <span className="branch-drawer-val-primary">
                        {selectedScheduleItem.clienteNombre}
                      </span>
                      <span className="branch-drawer-val-sub">
                        {t('dashboard.drawer.document', 'Documento')}: CC 1.020.340.589 (Bogotá)
                      </span>
                    </div>
                  </div>
                  <div className="branch-drawer-grid-2" style={{ marginTop: '10px' }}>
                    <div className="branch-drawer-item-box">
                      <span className="branch-drawer-item-lbl">{t('dashboard.drawer.phone', 'Teléfono / Móvil')}</span>
                      <span className="branch-drawer-item-val">{selectedScheduleItem.clienteTelefono}</span>
                    </div>
                    <div className="branch-drawer-item-box">
                      <span className="branch-drawer-item-lbl">{t('dashboard.drawer.email', 'Correo electrónico')}</span>
                      <span className="branch-drawer-item-val">{selectedScheduleItem.clienteCorreo}</span>
                    </div>
                    
                    <div className="branch-drawer-item-box">
                      <span className="branch-drawer-item-lbl">{t('dashboard.drawer.mobile', 'Teléfono Móvil')}</span>
                      <span className="branch-drawer-item-val">{selectedScheduleItem.clienteTelefono}</span>
                    </div>
                  </div>
                </div>
  
                {/* Sección 2: Vehículo Asignado y Especificaciones */}
                <div className="branch-drawer-section">
                  <span className="branch-drawer-sec-title">{t('dashboard.drawer.vehicleTitle', 'Vehículo Registrado')}</span>
                  
                  <div className="branch-drawer-vehicle-banner">
                    <img
                      src={getVehicleImage(selectedScheduleItem)}
                      alt={selectedScheduleItem.vehiculoNombre || selectedScheduleItem.vehiculo || t('hc2.vehiculo', 'Vehículo')}
                      className="branch-drawer-vehicle-img"
                    />
                    <div className="branch-drawer-vehicle-banner-overlay">
                      <strong>{selectedScheduleItem.vehiculoNombre || selectedScheduleItem.vehiculo}</strong>
                      <span>{t('dashboard.drawer.plate', 'Placa')}: {selectedScheduleItem.vehiculoPlaca || selectedScheduleItem.placa}</span>
                    </div>
                  </div>
  
                  <div className="branch-drawer-grid-2" style={{ marginTop: '12px' }}>
                    <div className="branch-drawer-item-box">
                      <span className="branch-drawer-item-lbl">{t('dashboard.drawer.model', 'Modelo y Motor')}</span>
                      <span className="branch-drawer-item-val">{selectedScheduleItem.vehiculoNombre}</span>
                    </div>
                    <div className="branch-drawer-item-box">
                      <span className="branch-drawer-item-lbl">{t('dashboard.drawer.assignedPlate', 'Placa Asignada')}</span>
                      <span className="branch-drawer-item-val">{selectedScheduleItem.vehiculoPlaca || selectedScheduleItem.placa}</span>
                    </div>
                    <div className="branch-drawer-item-box">
                      <span className="branch-drawer-item-lbl">{t('dashboard.drawer.category', 'Categoría')}</span>
                      <span className="branch-drawer-item-val">{selectedScheduleItem.vehiculoCategoria}</span>
                    </div>
                    <div className="branch-drawer-item-box">
                      <span className="branch-drawer-item-lbl">{t('dashboard.drawer.transmission', 'Transmisión / Combustible')}</span>
                      <span className="branch-drawer-item-val">{[vehiculoDrawer?.transmision, vehiculoDrawer?.combustible].filter(Boolean).join(' · ') || '—'}</span>
                    </div>
                  </div>
                </div>
  
                {/* Sección 3: Periodo e Itinerario del Alquiler */}
                <div className="branch-drawer-section">
                  <span className="branch-drawer-sec-title">{t('dashboard.drawer.itineraryTitle', 'Itinerario y Sucursal')}</span>
                  <div className="branch-drawer-grid-2">
                    <div className="branch-drawer-item-box">
                      <span className="branch-drawer-item-lbl">{t('dashboard.drawer.pickupDate', 'Fecha / Hora Recogida')}</span>
                      <span className="branch-drawer-item-val">
                        {reservaDrawer ? `${formatDateLabel(reservaDrawer.fechaInicio)} · ${reservaDrawer.horaInicio}` : '—'}
                      </span>
                    </div>
                    <div className="branch-drawer-item-box">
                      <span className="branch-drawer-item-lbl">{t('dashboard.drawer.returnDate', 'Fecha / Hora Devolución')}</span>
                      <span className="branch-drawer-item-val">{reservaDrawer ? `${formatDateLabel(reservaDrawer.fechaFin)} · ${reservaDrawer.horaFin}` : '—'}</span>
                    </div>
                    <div className="branch-drawer-item-box">
                      <span className="branch-drawer-item-lbl">{t('dashboard.drawer.pickupBranch', 'Sucursal de Retiro')}</span>
                      <span className="branch-drawer-item-val">{reservaDrawer?.sucursalRetiro === 'domicilio' ? t('dashboard.drawer.homeDelivery', 'Entrega a domicilio') : (reservaDrawer?.sucursalRetiro || dashboardData?.branchName || '')}</span>
                    </div>
                    <div className="branch-drawer-item-box">
                      <span className="branch-drawer-item-lbl">{t('dashboard.drawer.returnBranch', 'Sucursal de Retorno')}</span>
                      <span className="branch-drawer-item-val">{reservaDrawer?.sucursalDevolucion === 'domicilio' ? t('dashboard.drawer.homePickup', 'Recogida a domicilio') : (reservaDrawer?.sucursalDevolucion || dashboardData?.branchName || '')}</span>
                    </div>
                  </div>
                </div>
  
                {/* Sección 4: Coberturas y Servicios Adicionales */}
                <div className="branch-drawer-section">
                  <span className="branch-drawer-sec-title">{t('dashboard.drawer.coverageTitle', 'Cobertura & Servicios Adicionales')}</span>
                  <div className="branch-drawer-grid-2">
                    <div className="branch-drawer-item-box">
                      <span className="branch-drawer-item-lbl">{t('dashboard.drawer.insurance', 'Seguro Contratado')}</span>
                      <span className="branch-drawer-item-val">{reservaDrawer?.detalle?.seguro?.nombre || '—'}</span>
                    </div>
                    <div className="branch-drawer-item-box">
                      <span className="branch-drawer-item-lbl">{t('dashboard.drawer.mileagePlan', 'Plan de kilometraje')}</span>
                      <span className="branch-drawer-item-val">{reservaDrawer?.detalle?.kilometraje?.nombre || '—'}</span>
                    </div>
                    <div className="branch-drawer-item-box">
                      <span className="branch-drawer-item-lbl">{t('dashboard.drawer.additionalServices', 'Servicios adicionales')}</span>
                      <span className="branch-drawer-item-val">{(reservaDrawer?.detalle?.servicios || []).map((sv) => sv.nombre).join(', ') || t('dashboard.drawer.noServices', 'Ninguno')}</span>
                    </div>
                    {reservaDrawer?.detalle?.cupon && (
                      <div className="branch-drawer-item-box">
                        <span className="branch-drawer-item-lbl">{t('dashboard.drawer.coupon', 'Cupón aplicado')}</span>
                        <span className="branch-drawer-item-val">{reservaDrawer.detalle.cupon}</span>
                      </div>
                    )}
                  </div>
                </div>
  
                {/* Sección 5: Desglose Financiero Detallado (COP) */}
                <div className="branch-drawer-section">
                  <span className="branch-drawer-sec-title">{t('dashboard.drawer.financeTitle', 'Desglose Financiero Completo (COP)')}</span>
                  {reservaDrawer?.detalle && (() => {
                    const d = reservaDrawer.detalle
                    const pct = (rate) => `${Math.round(Number(rate) * 100)}%`
                    return (
                      <>
                        <div className="branch-drawer-price-row">
                          <span>{t('dashboard.drawer.baseRental', 'Alquiler base')} ({d.dias} {t('dashboard.drawer.daysUnit', 'días')} × {formatCOP(d.tarifaDiaria)})</span>
                          <strong>{formatCOP(d.subtotalVehiculo)}</strong>
                        </div>
                        <div className="branch-drawer-price-row">
                          <span>{d.seguro.nombre || t('dashboard.drawer.insurance', 'Seguro Contratado')}</span>
                          <strong>{formatCOP(d.seguro.subtotal)}</strong>
                        </div>
                        <div className="branch-drawer-price-row">
                          <span>{d.kilometraje.nombre || t('dashboard.drawer.mileagePlan', 'Plan de kilometraje')}</span>
                          <strong>{formatCOP(d.kilometraje.subtotal)}</strong>
                        </div>
                        {d.servicios.map((sv) => (
                          <div className="branch-drawer-price-row" key={sv.nombre}>
                            <span>{sv.nombre}</span>
                            <strong>{formatCOP(sv.total)}</strong>
                          </div>
                        ))}
                        {d.cargoAdmin != null && (
                          <div className="branch-drawer-price-row">
                            <span>{t('dashboard.drawer.adminFee', 'Cargos administrativos')} ({pct(d.tasaCargoAdmin)})</span>
                            <strong>{formatCOP(d.cargoAdmin)}</strong>
                          </div>
                        )}
                        {d.iva != null && (
                          <div className="branch-drawer-price-row">
                            <span>{t('dashboard.drawer.taxes', 'IVA')} ({pct(d.tasaIva)})</span>
                            <strong>{formatCOP(d.iva)}</strong>
                          </div>
                        )}
                        {d.descuento > 0 && (
                          <div className="branch-drawer-price-row">
                            <span>{t('dashboard.drawer.discount', 'Descuento')}{d.cupon ? ` (${d.cupon})` : ''}</span>
                            <strong>-{formatCOP(d.descuento)}</strong>
                          </div>
                        )}
                        <div className="branch-drawer-price-row branch-drawer-price-total">
                          <span>{t('dashboard.drawer.grandTotal', 'Total General de la Reserva')}</span>
                          <span>{formatCOP(d.total)}</span>
                        </div>
                      </>
                    )
                  })()}
                  <div className="branch-drawer-grid-2" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                    <div className="branch-drawer-item-box">
                      <span className="branch-drawer-item-lbl">{t('dashboard.drawer.paymentMethod', 'Método de Pago')}</span>
                      <span className="branch-drawer-item-val">{reservaDrawer?.metodoPago === 'efectivo' ? t('dashboard.drawer.payCash', 'Efectivo en sucursal') : reservaDrawer ? 'Wompi' : '—'}</span>
                    </div>
                    <div className="branch-drawer-item-box">
                      <span className="branch-drawer-item-lbl">{t('dashboard.drawer.paymentStatus', 'Estado del pago')}</span>
                      <span className="branch-drawer-item-val">{reservaDrawer?.pagoEstado === 'aprobado' ? t('dashboard.drawer.paid', 'Pagado') : t('dashboard.drawer.unpaid', 'Pendiente')}</span>
                    </div>
                  </div>
                </div>
  
                {/* Sección 6: Flujo Operativo y Progreso Actual (Stepper) */}
                <div className="branch-drawer-section">
                  <span className="branch-drawer-sec-title">{t('dashboard.drawer.workflowTitle', 'Flujo Operativo (Progreso Actual)')}</span>
                  
                  <div className="branch-workflow-stepper">
                    {/* Paso 1: Reserva Creada */}
                    <div className="branch-stepper-step branch-stepper-step--completed">
                      <div className="branch-stepper-circle">
                        <FaCheckCircle aria-hidden="true" />
                      </div>
                      <div className="branch-stepper-info">
                        <strong>{t('dashboard.drawer.step1Title', '1. Reserva Creada & Registrada')}</strong>
                        <span>{t('dashboard.drawer.step1Desc', 'Registrada con código')} {selectedScheduleItem.codigo}</span>
                      </div>
                    </div>
  
                    {/* Paso 2: Validación de Documentos */}
                    <div
                      className={`branch-stepper-step ${
                        String(selectedScheduleItem.estado || '').includes('DOCUMENTO')
                          ? 'branch-stepper-step--warning'
                          : 'branch-stepper-step--completed'
                      }`}
                    >
                      <div className="branch-stepper-circle">
                        {String(selectedScheduleItem.estado || '').includes('DOCUMENTO') ? (
                          <FaClock aria-hidden="true" />
                        ) : (
                          <FaCheckCircle aria-hidden="true" />
                        )}
                      </div>
                      <div className="branch-stepper-info">
                        <strong>{t('dashboard.drawer.step2Title', '2. Validación de Documentos')}</strong>
                        <span>
                          {String(selectedScheduleItem.estado || '').includes('DOCUMENTO')
                            ? t('dashboard.drawer.step2Pending', 'Pendiente: Cédula / Licencia por verificar')
                            : t('dashboard.drawer.step2Done', 'Completado: Cédula y Licencia aprobadas 100%')}
                        </span>
                      </div>
                    </div>
  
                    {/* Paso 3: Pago Registrado */}
                    <div className={`branch-stepper-step ${reservaDrawer?.pagoEstado === 'aprobado' ? 'branch-stepper-step--completed' : 'branch-stepper-step--warning'}`}>
                      <div className="branch-stepper-circle">
                        {reservaDrawer?.pagoEstado === 'aprobado' ? <FaCheckCircle aria-hidden="true" /> : <FaClock aria-hidden="true" />}
                      </div>
                      <div className="branch-stepper-info">
                        <strong>{t('dashboard.drawer.step3Title', '3. Pago de la Reserva')}</strong>
                        <span>{reservaDrawer?.pagoEstado === 'aprobado'
                          ? t('dashboard.drawer.step3Done', 'Completado: {{amount}} cobrados y confirmados', { amount: formatCOP(reservaDrawer.detalle?.total || 0) })
                          : t('dashboard.drawer.step3Pending', 'Pendiente de pago')}</span>
                      </div>
                    </div>
  
                    {/* Paso 4: Entrega del Vehículo */}
                    <div
                      className={`branch-stepper-step ${
                        activeTab === 'entregas'
                          ? 'branch-stepper-step--active'
                          : 'branch-stepper-step--completed'
                      }`}
                    >
                      <div className="branch-stepper-circle">
                        <FaCar aria-hidden="true" />
                      </div>
                      <div className="branch-stepper-info">
                        <strong>{t('dashboard.drawer.step4Title', '4. Entrega de Vehículo en Sucursal')}</strong>
                        <span>
                          {activeTab === 'entregas'
                            ? `${t('dashboard.drawer.step4Scheduled', 'Programada para hoy a las')} ${selectedScheduleItem.hora || ''}`
                            : t('dashboard.drawer.step4Done', 'Vehículo entregado con éxito al cliente')}
                        </span>
                      </div>
                    </div>
  
                    {/* Paso 5: Devolución e Inspección */}
                    <div
                      className={`branch-stepper-step ${
                        activeTab === 'devoluciones'
                          ? 'branch-stepper-step--active'
                          : 'branch-stepper-step--pending'
                      }`}
                    >
                      <div className="branch-stepper-circle">
                        <FaUndo aria-hidden="true" />
                      </div>
                      <div className="branch-stepper-info">
                        <strong>{t('dashboard.drawer.step5Title', '5. Devolución e Inspección Final')}</strong>
                        <span>
                          {activeTab === 'devoluciones'
                            ? t('dashboard.drawer.step5PendingBranch', 'Pendiente por recibir en sucursal')
                            : t('dashboard.drawer.step5PendingContract', 'Pendiente al finalizar el contrato')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              <footer className="branch-drawer-footer">
                <button
                  type="button"
                  className="branch-btn branch-btn--secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleCloseDrawer}
                >
                  {t('dashboard.drawer.closeInquiry', 'Cerrar Consulta')}
                </button>
              </footer>
            </div>
            </div>
          </div>
  )
}
