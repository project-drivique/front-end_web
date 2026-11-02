import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaArrowLeft } from 'react-icons/fa'

import { useBrand } from '@/contexts/BrandContext'

import { useLanding } from '../../landing/LandingContext'
import { useNavigate } from 'react-router-dom'
import MenuConfiguracion from '@/components/MenuConfiguracion'

import { useReservationFlow } from '../hooks/useReservationFlow'
import { useIsMobile } from '../../../hooks/useIsMobile'
import ReservationStepper from '../components/ReservationStepper'



import EditReservationModal from '../components/EditReservationModal'

import VehicleDetailsModal from '../../catalog/components/detail/VehicleDetailsModal'
import '../../catalog/pages/CatalogPage.css'
import ReservaCreada2 from './ReservationFlowPage/ReservaCreada2'
import ReservaCreada from './ReservationFlowPage/ReservaCreada'
import ModalResumenMovil from './ReservationFlowPage/ModalResumenMovil'
import ReservationFlowPart from './ReservationFlowPage/ReservationFlowPart'
import ResumenMovilBarTrigger from './ReservationFlowPage/ResumenMovilBarTrigger'

export default function ReservationFlowPage() {
  const { brand } = useBrand()
  const { t } = useTranslation()
  const { tema, moneda } = useLanding()
  const navigate = useNavigate()
  const esModoOscuro = tema === 'oscuro'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
    datosForm, setDatosForm, errores, reservaCreada,
    redirigiendoPago, errorPago,
    docsVerificados,
    irSiguiente, irAtras, handleReservar,
    handlePagarConWompi,
    totalReserva, cotizacion, appliedPromotion, aplicarPromocion, quitarPromocion,
    procesandoReserva,
    cargandoVehiculo,
    usuario,
  } = flow

  useEffect(() => {
    if (!cargandoVehiculo && !vehiculo) navigate(usuario ? '/home' : '/catalogo', { replace: true })
  }, [vehiculo, usuario, navigate])

  // Redirección rápida automática a Mis Reservas cuando es fuera de horario (PENDING_SCHEDULE)
  useEffect(() => {
    if (reservaCreada?.estado === 'PENDING_SCHEDULE') {
      const timer = setTimeout(() => {
        sessionStorage.removeItem(`drivique_reservation_state_${vehiculo?.id}`)
        navigate('/reservas')
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [reservaCreada?.estado, vehiculo?.id, navigate])

  if (!vehiculo) {
    if (cargandoVehiculo) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary"></div>
        </div>
      )
    }
    return null
  }

  // ─── Variables para datos de sucursal de pago en efectivo ─────────────────
  const sucursalPago = reservaCreada?.reservaDetalles?.sucursalPagoEfectivo || reserva.sucursalPagoEfectivo || vehiculo?.sucursal || ''

  // ─── Flujo principal ──────────────────────────────────────────────────────
  return (
    <div className="catalogo-page" style={{ minHeight: 'calc(100vh / 0.9)', background: c.pageBg, color: c.textPrimary }}>
      <div className="detalle-contenido-inner" style={{ maxWidth: 1360, margin: '0 auto', padding: '24px 24px 60px' }}>

        {/* Top bar */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          <MenuConfiguracion />
        </div>

        {/* Tarjeta principal */}
        <div style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: isMobile ? 16 : 32, boxShadow: esModoOscuro ? '0 4px 24px rgba(0,0,0,0.40)' : '0 4px 24px rgba(var(--brand-secondary-rgb),0.07)' }}>

          <ReservationStepper pantalla={pantalla} setPantalla={setPantalla} esModoOscuro={esModoOscuro} />

          {/* Botón superior de resumen de reserva: siempre visible arriba en móvil */}
          <ResumenMovilBarTrigger moneda={moneda} reserva={reserva} setModalResumenMovil={setModalResumenMovil} t={t} totalReserva={totalReserva} vehiculo={vehiculo} />

          <ReservationFlowPart abrirModalEditar={abrirModalEditar} aplicarPromocion={aplicarPromocion} appliedPromotion={appliedPromotion} c={c} cambiarReserva={cambiarReserva} cotizacion={cotizacion} datosForm={datosForm} docsVerificados={docsVerificados} errorPaso1={errorPaso1} errores={errores} esModoOscuro={esModoOscuro} handleReservar={handleReservar} irSiguiente={irSiguiente} pantalla={pantalla} procesandoReserva={procesandoReserva} quitarPromocion={quitarPromocion} reserva={reserva} resumenMovilAbierto={resumenMovilAbierto} resumenMovilRef={resumenMovilRef} seguroIdx={seguroIdx} serviciosSeleccionados={serviciosSeleccionados} setDatosForm={setDatosForm} setSeguroIdx={setSeguroIdx} t={t} toggleServicio={toggleServicio} vehiculo={vehiculo} />

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
            <ModalResumenMovil abrirModalEditar={abrirModalEditar} aplicarPromocion={aplicarPromocion} appliedPromotion={appliedPromotion} c={c} cotizacion={cotizacion} pantalla={pantalla} quitarPromocion={quitarPromocion} reserva={reserva} seguroIdx={seguroIdx} serviciosSeleccionados={serviciosSeleccionados} setModalResumenMovil={setModalResumenMovil} t={t} vehiculo={vehiculo} />
          )}

          {/* ─── Modal: Reserva Registrada (Efectivo en Sucursal) ─── */}
          {reservaCreada && reserva.metodoPago === 'efectivo' && (
            <ReservaCreada brand={brand} c={c} moneda={moneda} navigate={navigate} reservaCreada={reservaCreada} sucursalPago={sucursalPago} t={t} vehiculo={vehiculo} />
          )}

          {/* ─── Modal: Reserva Registrada (Pago Digital Wompi) ─── */}
          {reservaCreada && reserva.metodoPago !== 'efectivo' && (
            <ReservaCreada2 brand={brand} c={c} errorPago={errorPago} handlePagarConWompi={handlePagarConWompi} navigate={navigate} redirigiendoPago={redirigiendoPago} reservaCreada={reservaCreada} t={t} vehiculo={vehiculo} />
          )}
        </div>
      </div>
    </div>
  )
}

