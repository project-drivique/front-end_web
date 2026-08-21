import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaMoneyBillWave, FaCreditCard, FaArrowLeft } from 'react-icons/fa'
import logo from '@/assets/logo.png'
import { formatCurrency } from '@/utils/currencyUtils'
import { useLanding } from '../../landing/LandingContext'
import { HORAS_LIMITE_PAGO_EFECTIVO } from '@/services/reservationService'
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
  const { t } = useTranslation()
  const { tema, moneda } = useLanding()
  const navigate = useNavigate()
  const esModoOscuro = tema === 'oscuro'

  const c = {
    pageBg:        esModoOscuro ? '#0f172a'  : '#f8fafc',
    cardBg:        esModoOscuro ? '#111827'  : '#ffffff',
    cardBorder:    esModoOscuro ? '#1e293b'  : '#e2e8f0',
    subCardBg:     esModoOscuro ? '#1e293b'  : '#f8fafc',
    subCardBorder: esModoOscuro ? '#334155'  : '#e2e8f0',
    textPrimary:   esModoOscuro ? '#f8fafc'  : '#0f172a',
    textSecondary: esModoOscuro ? '#94a3b8'  : '#64748b',
    accentText:    esModoOscuro ? '#93c5fd'  : '#1e3a8a',
    isDark:        esModoOscuro,
  }
  
  const isMobile = useIsMobile()

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
    totalReserva,
    usuario,
  } = flow

  if (!vehiculo) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--texto-primary)' }}>{t('vehiculo.notFound')}</p>
      <Link to={usuario ? '/home' : '/catalogo'} style={{ color: '#1e3a8a', fontWeight: 700, fontSize: 14 }}>← {t('vehiculo.backToCatalog')}</Link>
    </div>
  )

  // ─── Pantalla: Firma de contrato (efectivo) ───────────────────────────────
  if (reservaCreada && reserva.metodoPago === 'efectivo' && !contratoFirmado) return (
    <div className="catalogo-page" style={{ minHeight: 'calc(100vh / 0.9)', background: 'var(--hero-fondo)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -80, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'var(--hero-orb1)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 350, height: 350, borderRadius: '50%', background: 'var(--hero-orb2)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', paddingTop: 48, paddingBottom: 48, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 28px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--texto-primary)', margin: '0 0 8px' }}>
            {t('contratoFirma.pageTitleCash')}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--texto-second)', margin: 0 }}>{t('contratoFirma.pageSubtitle')}</p>
        </div>
        <ContractSignature vehiculo={vehiculo} reservaGuardada={reservaCreada} onFirmado={handleContratoFirmado} />
      </div>
    </div>
  )

  // ─── Pantalla: Éxito / Pago ───────────────────────────────────────────────
  if (exito) return (
    <div className="catalogo-page" style={{ minHeight: 'calc(100vh / 0.9)', background: c.pageBg, color: c.textPrimary, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding: '24px 24px 0', maxWidth: 1360, margin: '0 auto', width: '100%', zIndex: 10 }}>
        <button onClick={() => navigate('/home')} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 8, color: c.textSecondary, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
          <FaArrowLeft size={12} /> {t('common.goBack')}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'var(--hero-orb1)', pointerEvents: 'none', opacity: 0.5 }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 350, height: 350, borderRadius: '50%', background: 'var(--hero-orb2)', pointerEvents: 'none', opacity: 0.5 }} />

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 560, width: '100%', background: c.cardBg, borderRadius: 28, boxShadow: '0 24px 70px rgba(15,23,42,0.16)', border: `1px solid ${c.cardBorder}`, padding: isMobile ? '32px 20px' : '48px 40px' }}>
          <img src={logo} alt="Drivique" style={{ width: 116, height: 116, borderRadius: '50%', objectFit: 'contain', background: '#fff', padding: 16, margin: '0 auto 28px', boxShadow: '0 14px 34px rgba(30,58,138,0.24)', border: `1px solid ${c.cardBorder}` }} />
          <h2 style={{ fontSize: 30, fontWeight: 900, color: c.textPrimary, margin: '0 0 14px', letterSpacing: '-0.02em' }}>
            {t('vehiculo.reservationRegisteredTitle', 'Reserva Registrada')}
          </h2>

          {reserva.metodoPago === 'efectivo' ? (
            <>
              <p style={{ fontSize: 16, color: c.textSecondary, lineHeight: 1.6, margin: '0 0 20px' }}>
                {t('vehiculo.cashReservationRegisteredDesc', 'Tu reserva quedó registrada. Acércate a la sucursal de {{sucursal}} para realizar el pago.', { sucursal: vehiculo.sucursal })}
              </p>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, padding: '16px 20px', marginBottom: 20, textAlign: 'left' }}>
                <p style={{ fontSize: 13, fontWeight: 900, color: '#92400e', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t('vehiculo.paymentDeadlineTitle', 'Plazo para pagar')}
                </p>
                <p style={{ fontSize: 14, color: '#92400e', margin: 0, lineHeight: 1.5 }}>
                  {t('vehiculo.paymentDeadlineDesc', 'Tienes {{horas}} horas desde ahora para acercarte a la sucursal.', { horas: HORAS_LIMITE_PAGO_EFECTIVO })}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    showAlert({ icon: 'success', title: t('vehiculo.reservationCompletedTitle', '¡Reserva Completada!'), text: t('vehiculo.reservationCompletedText', 'Tu reserva presencial ha sido registrada.'), confirmButtonText: t('common.accept', 'Aceptar') })
                      .then(() => navigate('/reservas'))
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '18px 36px', borderRadius: 16, background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', color: '#fff', fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.28)' }}
                >
                  <FaMoneyBillWave size={20} />
                  <span>{t('vehiculo.confirmAndViewReservations', 'Confirmar y Ver Mis Reservas')}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: 16, color: c.textSecondary, lineHeight: 1.6, margin: '0 0 20px' }}>
                {t('vehiculo.wompiReservationRegisteredDesc', 'Tu reserva quedó guardada. Completa el pago digital seguro con Wompi.')}
              </p>
              {datosPago && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={handlePagarConWompi}
                    onMouseEnter={() => setHoverWompi(true)}
                    onMouseLeave={() => setHoverWompi(false)}
                    disabled={redirigiendoPago}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 12,
                      padding: '18px 40px', borderRadius: 16,
                      background: redirigiendoPago ? '#94a3b8' : hoverWompi ? 'linear-gradient(90deg,#162d6e,#1d4fd8)' : 'linear-gradient(90deg,#1e3a8a,#2563eb)',
                      color: '#fff', fontWeight: 900, fontSize: 15, border: 'none',
                      cursor: redirigiendoPago ? 'default' : 'pointer',
                      boxShadow: '0 8px 24px rgba(37,99,235,0.28)',
                      transition: 'all 200ms ease', width: '100%', maxWidth: 320,
                    }}
                  >
                    <FaCreditCard size={20} />
                    <span>{redirigiendoPago ? t('vehiculo.redirecting', 'Redirigiendo…') : t('vehiculo.payWithWompi', 'Pagar con Wompi')}</span>
                  </button>
                </div>
              )}
              {errorPago && <p style={{ color: '#dc2626', fontSize: 13, fontWeight: 700, marginTop: 16 }}>{errorPago}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  )

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
        <div style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: isMobile ? 16 : 32, boxShadow: esModoOscuro ? '0 4px 24px rgba(0,0,0,0.40)' : '0 4px 24px rgba(30,58,138,0.07)' }}>

          <ReservationStepper pantalla={pantalla} setPantalla={setPantalla} esModoOscuro={esModoOscuro} />

          <div className="detalle-layout" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 32, alignItems: 'flex-start' }}>
            <div className="detalle-columna-principal" style={{ flex: 1, minWidth: 0 }}>

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

            {/* ── SideSummary (pasos 2 y 3, en columna lateral) ── */}
            {pantalla > 1 && (
              <div
                ref={resumenMovilRef}
                className={`detalle-resumen-wrapper${resumenMovilAbierto ? ' abierto' : ''}`}
                style={{ width: isMobile ? '100%' : '360px', flexShrink: 0 }}
              >
                <SideSummary c={c} 
                  vehiculo={vehiculo}
                  reserva={reserva}
                  seguroIdx={seguroIdx}
                  serviciosSeleccionados={serviciosSeleccionados}
                  onEditar={abrirModalEditar}
                  pantalla={pantalla}
                  onContinuar={pantalla < 3 ? irSiguiente : null}
                  c={c}
                />
              </div>
            )}

            {/* Botón continuar móvil */}
            {pantalla < 3 && (
              <div className="detalle-continuar-movil" style={{ display: 'none', width: '100%', marginTop: 24 }}>
                {errorPaso1 && <p style={{ color: '#dc2626', fontSize: 13, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>{errorPaso1}</p>}
                <button onClick={irSiguiente} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 40px', borderRadius: 16, background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', color: '#fff', fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.28)' }}>
                  {pantalla === 2 ? t('vehiculo.continueData') : t('common.continue')} <IcoArrow />
                </button>
              </div>
            )}

            {/* Footer confirmar móvil (paso 3) */}
            {pantalla === 3 && (
              <div className="confirmar-reserva-movil" style={{ display: 'none', width: '100%', marginTop: 24, background: 'linear-gradient(135deg,#0f1a3d,#1e3a8a)', borderRadius: 24, padding: '22px 24px', boxShadow: '0 12px 32px rgba(30,58,138,0.25)' }}>
                <p style={{ fontSize: 12, color: '#bfdbfe', fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('vehiculo.totalToPay')}</p>
                <p style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 0 16px' }}>{formatCurrency(totalReserva, moneda)}</p>
                <button onClick={handleReservar} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '15px 24px', borderRadius: 16, background: 'var(--bg-tarjeta)', color: '#1e3a8a', fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer' }}>
                  {t('vehiculo.confirmReserve')}
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
        </div>
      </div>
    </div>
  )
}

