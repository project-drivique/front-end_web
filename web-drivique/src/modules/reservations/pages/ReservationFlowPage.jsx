import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaMoneyBillWave, FaCreditCard, FaArrowLeft, FaTimes, FaClipboardList, FaArrowRight } from 'react-icons/fa'
import logo from '@/assets/logo.png'
import { useBrand } from '@/contexts/BrandContext'
import { formatCurrency } from '@/utils/currencyUtils'
import { useLanding } from '../../landing/LandingContext'
import { HORAS_LIMITE_PAGO_EFECTIVO } from '@/services/reservationService'
import { SUCURSALES } from '../../catalog/constants'
import { showAlert } from '@/utils/swalConfig'
import { useNavigate } from 'react-router-dom'

import { useReservationFlow } from '../hooks/useReservationFlow'
import { useIsMobile } from '../../../hooks/useIsMobile'
import ReservationStepper from '../components/ReservationStepper'
import ReservationStep1 from '../components/ReservationStep1'
import ReservationStep2 from '../components/ReservationStep2'
import SideSummary from '../components/SideSummary'
import EditReservationModal from '../components/EditReservationModal'
import PersonalData from '../components/PersonalData'
import VehicleDetailsModal from '../../catalog/components/detail/VehicleDetailsModal'
import ContractSignature from '../../contracts/components/ContractSignature'

import '../../catalog/pages/CatalogPage.css'

const IcoArrow = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)

export default function ReservationFlowPage() {
  const { brand } = useBrand()
  const { t } = useTranslation()
  const { tema, moneda } = useLanding()
  const navigate = useNavigate()
  const esModoOscuro = tema === 'oscuro'

  const c = {
    pageBg:        esModoOscuro ? '#0f172a'  : '#eaeff8',
    cardBg:        esModoOscuro ? '#111827'  : '#ffffff',
    cardBorder:    esModoOscuro ? '#1e293b'  : '#e2e8f0',
    subCardBg:     esModoOscuro ? '#1e293b'  : '#f8fafc',
    subCardBorder: esModoOscuro ? '#334155'  : '#e2e8f0',
    textPrimary:   esModoOscuro ? '#f8fafc'  : '#0f172a',
    textSecondary: esModoOscuro ? '#94a3b8'  : '#64748b',
    accentText:    'var(--brand-text)',
    isDark:        esModoOscuro,
  }
  
  const isMobile = useIsMobile()
  const [modalResumenMovil, setModalResumenMovil] = useState(false)

  const flow = useReservationFlow()
  const {
    vehiculo, pantalla, setPantalla, reserva, cambiarReserva,
    seguroIdx, setSeguroIdx, serviciosSeleccionados, setServiciosSeleccionados, toggleServicio,
    modalEditarOpen, setModalEditarOpen, modalEditarSeccion,
    localReserva, setLocalReserva, localSeguroIdx, setLocalSeguroIdx,
    localServiciosSeleccionados, setLocalServiciosSeleccionados,
    modalError, setModalError, abrirModalEditar,
    modalDetallesOpen, setModalDetallesOpen,
    resumenMovilAbierto, resumenMovilRef,
    errorPaso1,
    datosForm, setDatosForm, errores,
    exito, reservaCreada, contratoFirmado, datosPago,
    redirigiendoPago, errorPago,
    hoverWompi, setHoverWompi,
    docsVerificados,
    irSiguiente, irAtras, handleReservar, handleContratoFirmado,
    handlePagarConWompi,
    totalReserva, appliedPromotion, aplicarPromocion, quitarPromocion,
    usuario,
  } = flow

  if (!vehiculo) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--texto-primary)' }}>{t('vehiculo.notFound')}</p>
      <Link to={usuario ? '/home' : '/catalogo'} style={{ color: 'var(--brand-text)', fontWeight: 700, fontSize: 14 }}>← {t('vehiculo.backToCatalog')}</Link>
    </div>
  )

  // ─── Variables para datos de sucursal de pago en efectivo ─────────────────
  const sucursalPago = reservaCreada?.reservaDetalles?.sucursalPagoEfectivo || reserva.sucursalPagoEfectivo || vehiculo?.sucursal || 'Alquiler Neiva - Centro'
  const branchObj = SUCURSALES.find(s => s.nombre === sucursalPago)
  const ciudadPago = branchObj?.ciudad || vehiculo?.ciudad || 'Neiva'
  const direccionPago = branchObj?.direccion || 'Calle 9 # 8-25, Centro'

  // ─── Modal / Pantalla: Pago Digital (Wompi) ────────────────────────────────

  // ─── Modal / Pantalla: Pago Digital (Wompi) ────────────────────────────────
  if (exito && reserva.metodoPago !== 'efectivo') {
    return (
      <div className="catalogo-page" style={{ minHeight: 'calc(100vh / 0.9)', background: c.pageBg, color: c.textPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, borderRadius: 24, padding: isMobile ? 24 : 40, maxWidth: 520, width: '100%', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#ffffff', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14, margin: '0 auto 20px' }}>
            <img src={brand.logoDataUrl || logo} alt={brand.name || 'Drivique'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: c.textPrimary, margin: '0 0 12px' }}>
            {t('vehiculo.reservationRegisteredTitle', 'Reserva Registrada')}
          </h2>
          <p style={{ fontSize: 15, color: c.textSecondary, lineHeight: 1.6, margin: '0 0 24px' }}>
            {t('vehiculo.wompiReservationRegisteredDesc', 'Tu reserva quedó guardada. Completa el pago digital seguro con Wompi.')}
          </p>
          {datosPago && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <button
                onClick={handlePagarConWompi}
                onMouseEnter={() => setHoverWompi(true)}
                onMouseLeave={() => setHoverWompi(false)}
                disabled={redirigiendoPago}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  padding: '16px 32px', borderRadius: 16,
                  background: redirigiendoPago ? '#94a3b8' : hoverWompi ? 'var(--brand-gradient-hover)' : 'var(--brand-gradient)',
                  color: '#fff', fontWeight: 900, fontSize: 15, border: 'none',
                  cursor: redirigiendoPago ? 'default' : 'pointer',
                  boxShadow: '0 8px 24px rgba(var(--brand-primary-rgb),0.28)',
                  transition: 'all 200ms ease', width: '100%', maxWidth: 320,
                }}
              >
                <FaCreditCard size={18} />
                <span>{redirigiendoPago ? t('vehiculo.redirecting', 'Redirigiendo…') : t('vehiculo.payWithWompi', 'Pagar con Wompi')}</span>
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem(`drivique_reservation_state_${vehiculo.id}`)
                  navigate('/reservas')
                }}
                style={{
                  padding: '12px 24px', borderRadius: 12,
                  background: 'transparent',
                  color: c.textSecondary,
                  border: `1px solid ${c.cardBorder}`,
                  fontWeight: 700, fontSize: 13,
                  cursor: 'pointer', width: '100%', maxWidth: 320,
                }}
              >
                Pagar más tarde (Ir a Mis Reservas)
              </button>
            </div>
          )}
          {errorPago && <p style={{ color: '#dc2626', fontSize: 13, fontWeight: 700, marginTop: 16 }}>{errorPago}</p>}
        </div>
      </div>
    )
  }

  // ─── Flujo principal ──────────────────────────────────────────────────────
  return (
    <div className="catalogo-page" style={{ minHeight: 'calc(100vh / 0.9)', background: c.pageBg, color: c.textPrimary }}>
      <div className="detalle-contenido-inner" style={{ maxWidth: 1360, margin: '0 auto', padding: '24px 24px 60px' }}>

        {/* Top bar */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <button
            className="catalogo-header-back"
            onClick={irAtras}
            style={{
              background: c.cardBg,
              border: `1px solid ${c.cardBorder}`,
              color: c.accentText,
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <FaArrowLeft size={12} /> {pantalla === 1 ? t('vehiculo.backToCatalog') : t('common.goBack')}
          </button>
        </div>

        {/* Tarjeta principal */}
        <div style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: isMobile ? 16 : 32, boxShadow: esModoOscuro ? '0 4px 24px rgba(0,0,0,0.40)' : '0 4px 24px rgba(var(--brand-secondary-rgb),0.07)' }}>

          <ReservationStepper pantalla={pantalla} setPantalla={setPantalla} esModoOscuro={esModoOscuro} />

          {/* Botón superior de resumen de reserva: siempre visible arriba en móvil */}
          <div className="resumen-movil-bar-trigger">
            <button
              type="button"
              className="btn-resumen-movil-toggle"
              onClick={() => setModalResumenMovil(true)}
            >
              <div className="resumen-movil-toggle-left">
                <div className="resumen-movil-icon-wrapper">
                  <FaClipboardList size={16} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span className="resumen-movil-toggle-title">
                    {t('reservas.viewSummary', 'Resumen de reserva')}
                  </span>
                  <span className="resumen-movil-toggle-sub">
                    {vehiculo.nombre} {reserva.fechaInicio ? `· ${reserva.fechaInicio} al ${reserva.fechaFin || ''}` : ''}
                  </span>
                </div>
              </div>
              <div className="resumen-movil-toggle-right">
                <strong className="resumen-movil-toggle-price">
                  {formatCurrency(totalReserva, moneda)}
                </strong>
                <span className="resumen-movil-toggle-badge">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {t('reservas.openSummary', 'Ver resumen')} <FaArrowRight size={8} />
                  </span>
                </span>
              </div>
            </button>
          </div>

          <div className={`detalle-layout ${pantalla === 1 ? 'w-full' : 'grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'}`}>
            <div className={`detalle-columna-principal ${pantalla === 1 ? 'w-full' : 'lg:col-span-2 min-w-0 flex flex-col gap-6'}`}>

              {/* ── Paso 1 ── */}
              {pantalla === 1 && (
                <ReservationStep1
                  vehiculo={vehiculo}
                  c={c}
                  esModoOscuro={esModoOscuro}
                  reserva={reserva}
                  cambiarReserva={cambiarReserva}
                  seguroIdx={seguroIdx}
                  serviciosSeleccionados={serviciosSeleccionados}
                  abrirModalEditar={abrirModalEditar}
                  pantalla={pantalla}
                  onContinuar={irSiguiente}
                  appliedPromotion={appliedPromotion}
                  onApplyPromotion={aplicarPromocion}
                  onRemovePromotion={quitarPromocion}
                />
              )}

              {/* ── Paso 2 ── */}
              {pantalla === 2 && (
                <ReservationStep2
                  vehiculo={vehiculo}
                  c={c}
                  seguroIdx={seguroIdx}
                  setSeguroIdx={setSeguroIdx}
                  reserva={reserva}
                  cambiarReserva={cambiarReserva}
                  serviciosSeleccionados={serviciosSeleccionados}
                  toggleServicio={toggleServicio}
                />
              )}

              {/* ── Paso 3 ── */}
              {pantalla === 3 && (
                <PersonalData
                  vehiculo={vehiculo}
                  reserva={reserva}
                  seguroIdx={seguroIdx}
                  serviciosSeleccionados={serviciosSeleccionados}
                  datosForm={datosForm}
                  onCambio={(k, v) => setDatosForm(p => ({ ...p, [k]: v }))}
                  onReservar={handleReservar}
                  errores={errores}
                  docsVerificados={docsVerificados}
                  appliedPromotion={appliedPromotion}
                  onApplyPromotion={aplicarPromocion}
                  onRemovePromotion={quitarPromocion}
                  c={c}
                />
              )}

              {/* ── Botón continuar (pasos 1 y 2) ── */}
              {pantalla < 3 && errorPaso1 && (
                <div className="detalle-continuar-desktop" style={{ marginTop: 16 }}>
                  <p style={{ color: '#dc2626', fontSize: 13, fontWeight: 700, marginBottom: 12, textAlign: 'right' }}>{errorPaso1}</p>
                </div>
              )}
            </div>

            {/* ── SideSummary (pasos 2 y 3, en columna lateral desktop) ── */}
            {pantalla > 1 && (
              <div
                ref={resumenMovilRef}
                className={`detalle-resumen-wrapper lg:col-span-1 min-w-0${resumenMovilAbierto ? ' abierto' : ''}`}
              >
                <SideSummary
                  vehiculo={vehiculo}
                  reserva={reserva}
                  seguroIdx={seguroIdx}
                  serviciosSeleccionados={serviciosSeleccionados}
                  onEditar={abrirModalEditar}
                  pantalla={pantalla}
                  onContinuar={pantalla < 3 ? irSiguiente : null}
                  appliedPromotion={appliedPromotion}
                  onApplyPromotion={aplicarPromocion}
                  onRemovePromotion={quitarPromocion}
                  c={c}
                />
              </div>
            )}

            {/* Botón continuar móvil */}
            {pantalla < 3 && (
              <div className="detalle-continuar-movil" style={{ display: 'none', width: '100%', marginTop: 24 }}>
                {errorPaso1 && <p style={{ color: '#dc2626', fontSize: 13, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>{errorPaso1}</p>}
                <button onClick={irSiguiente} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 40px', borderRadius: 16, background: 'var(--brand-gradient)', color: 'var(--brand-on-primary)', fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: 'var(--brand-shadow)' }}>
                  {pantalla === 2 ? t('vehiculo.continueData') : t('common.continue')}
                </button>
              </div>
            )}
          </div>

          {/* Modal de edición */}
          <EditReservationModal
            modalEditarOpen={modalEditarOpen}
            setModalEditarOpen={setModalEditarOpen}
            modalEditarSeccion={modalEditarSeccion}
            localReserva={localReserva}
            setLocalReserva={setLocalReserva}
            localSeguroIdx={localSeguroIdx}
            setLocalSeguroIdx={setLocalSeguroIdx}
            localServiciosSeleccionados={localServiciosSeleccionados}
            setLocalServiciosSeleccionados={setLocalServiciosSeleccionados}
            modalError={modalError}
            setModalError={setModalError}
            vehiculo={vehiculo}
            setReserva={flow.setReserva ?? (() => {})}
            setSeguroIdx={setSeguroIdx}
            setServiciosSeleccionados={setServiciosSeleccionados}
            c={c}
          />

          {/* Modal detalles vehículo */}
          <VehicleDetailsModal
            vehiculo={vehiculo}
            visible={modalDetallesOpen}
            onCerrar={() => setModalDetallesOpen(false)}
            c={c}
          />

          {/* Modal de Resumen de Reserva para Celulares / Pantallas Móviles */}
          {modalResumenMovil && (
            <div
              className="modal-resumen-movil-backdrop"
              onClick={() => setModalResumenMovil(false)}
            >
              <div
                className="modal-resumen-movil-content"
                style={{
                  background: c.cardBg,
                  borderColor: c.cardBorder,
                  color: c.textPrimary,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-resumen-movil-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="resumen-movil-icon-wrapper">
                      <FaClipboardList size={16} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: c.textPrimary }}>
                      {t('reservas.summaryTitle', 'Resumen de tu Reserva')}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="modal-resumen-movil-close"
                    onClick={() => setModalResumenMovil(false)}
                    style={{ background: c.subCardBg, color: c.textSecondary, border: `1px solid ${c.cardBorder}` }}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="modal-resumen-movil-body">
                  <SideSummary
                    vehiculo={vehiculo}
                    reserva={reserva}
                    seguroIdx={seguroIdx}
                    serviciosSeleccionados={serviciosSeleccionados}
                    onEditar={(seccion) => {
                      setModalResumenMovil(false)
                      abrirModalEditar(seccion)
                    }}
                    pantalla={pantalla}
                    onContinuar={null}
                    appliedPromotion={appliedPromotion}
                    onApplyPromotion={aplicarPromocion}
                    onRemovePromotion={quitarPromocion}
                    c={c}
                  />
                </div>

                <div className="modal-resumen-movil-footer">
                  <button
                    type="button"
                    className="btn-cerrar-modal-resumen"
                    onClick={() => setModalResumenMovil(false)}
                  >
                    {t('common.close', 'Cerrar')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Modal: Reserva Registrada (Efectivo en Sucursal) ─── */}
          {reservaCreada && reserva.metodoPago === 'efectivo' && (
            <div style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(5px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16
            }}>
              <div style={{
                background: c.cardBg || '#ffffff',
                borderRadius: 28,
                maxWidth: 420,
                width: '100%',
                padding: '28px 24px',
                textAlign: 'center',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
                border: `1px solid ${c.cardBorder || '#e2e8f0'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxSizing: 'border-box'
              }}>
                {/* Logo Badge Circular */}
                <div style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 12,
                  marginBottom: 16
                }}>
                  <img
                    src={brand.logoDataUrl || logo}
                    alt={brand.name || 'Drivique'}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                {/* Titulo */}
                <h2 style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: c.textPrimary || '#0f172a',
                  margin: '0 0 10px',
                  letterSpacing: '-0.02em'
                }}>
                  {t('vehiculo.reservationRegisteredTitle', 'Reserva Registrada')}
                </h2>

                {/* Subtitulo */}
                <p style={{
                  fontSize: 13,
                  color: c.textSecondary || '#64748b',
                  lineHeight: 1.5,
                  margin: '0 0 20px',
                  padding: '0 8px'
                }}>
                  {t('vehiculo.cashReservationRegisteredDesc', {
                    defaultValue: `Tu reserva quedó registrada. Para confirmarla, realiza el pago en efectivo en el punto autorizado ${sucursalPago}.`,
                    sucursal: sucursalPago
                  })}
                </p>

                {/* Tarjeta de Resumen */}
                <div style={{
                  width: '100%',
                  background: c.isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                  border: `1px solid ${c.cardBorder || '#e2e8f0'}`,
                  borderRadius: 16,
                  padding: '16px 18px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  marginBottom: 16,
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: c.textSecondary || '#64748b', fontWeight: 600 }}>Referencia:</span>
                    <span style={{
                      fontWeight: 800,
                      color: 'var(--brand-primary, #2563eb)',
                      fontSize: 12.5,
                      letterSpacing: '0.02em'
                    }}>
                      {reservaCreada.referencia}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: c.textSecondary || '#64748b', fontWeight: 600 }}>Sucursal:</span>
                    <span style={{ fontWeight: 700, color: c.textPrimary || '#0f172a' }}>
                      {sucursalPago}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: c.textSecondary || '#64748b', fontWeight: 600 }}>Ciudad: :</span>
                    <span style={{ fontWeight: 700, color: c.textPrimary || '#0f172a' }}>
                      {ciudadPago}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: c.textSecondary || '#64748b', fontWeight: 600 }}>Dirección: :</span>
                    <span style={{ fontWeight: 700, color: c.textPrimary || '#0f172a' }}>
                      {direccionPago}
                    </span>
                  </div>

                  <div style={{ height: 1, background: c.cardBorder || '#e2e8f0', margin: '2px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: c.textSecondary || '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      TOTAL A PAGAR:
                    </span>
                    <span style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: 'var(--brand-primary, #2563eb)'
                    }}>
                      {formatCurrency(reservaCreada.total, moneda)}
                    </span>
                  </div>
                </div>

                {/* Tarjeta de Advertencia Plazo */}
                <div style={{
                  width: '100%',
                  background: '#fefce8',
                  border: '1.5px solid #fef08a',
                  borderRadius: 16,
                  padding: '14px 16px',
                  textAlign: 'left',
                  marginBottom: 20,
                  boxSizing: 'border-box'
                }}>
                  <p style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#854d0e',
                    margin: '0 0 6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    PLAZO PARA PAGAR
                  </p>
                  <p style={{
                    fontSize: 12,
                    color: '#854d0e',
                    margin: 0,
                    lineHeight: 1.45,
                    fontWeight: 500
                  }}>
                    Tienes 72 horas desde ahora para acercarte a la sucursal y pagar. Si no pagas dentro de este plazo, la reserva se cancelará automáticamente.
                  </p>
                </div>

                {/* Botones de Accion */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem(`drivique_reservation_state_${vehiculo.id}`)
                      navigate('/reservas')
                    }}
                    style={{
                      width: '100%',
                      height: 48,
                      borderRadius: 14,
                      background: 'var(--brand-primary, #2563eb)',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    Ir a Mis Reservas
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem(`drivique_reservation_state_${vehiculo.id}`)
                      navigate('/home')
                    }}
                    style={{
                      width: '100%',
                      height: 46,
                      borderRadius: 14,
                      background: c.cardBg || '#ffffff',
                      color: c.textPrimary || '#0f172a',
                      border: `1.5px solid ${c.cardBorder || '#e2e8f0'}`,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    Volver al Inicio
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

