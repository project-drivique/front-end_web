import { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaMoneyBillWave,
  FaSearch,
  FaCheckCircle,
  FaCar,
  FaUser,
  FaCalendarAlt,
  FaPrint,
  FaShieldAlt,
  FaCashRegister,
  FaReceipt,
  FaClock,
  FaExclamationCircle,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { reservationManagementService } from '../../../services/reservationManagementService'
import { reservationService } from '../../../services/reservationService'
import { hasMatchingBranch } from '../../../services/accessAuditService'
import { formatCurrency } from '../../../utils/currencyUtils'
import { SUCURSALES } from '../../catalog/constants'
import { showAlert } from '../../../utils/swalConfig'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CashCollectionPage.css'

export default function CashCollectionPage({ branchOnly = false }) {
  const { t, i18n } = useTranslation()
  const { tema, moneda } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const isBranchManager = branchOnly || user?.rol === 'encargado' || user?.rol === 'branch_manager' || user?.rol === 'encargado_sucursal'
  const sucursalAsignada = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || ''

  const [codigoBusqueda, setCodigoBusqueda] = useState('')
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null)
  const [errorBusqueda, setErrorBusqueda] = useState('')
  const [procesandoPago, setProcesandoPago] = useState(false)
  const [observacionesCaja, setObservacionesCaja] = useState('')

  // Lista de reservas para consultar
  const [todasLasReservas, setTodasLasReservas] = useState([])

  const cargarReservas = useCallback(() => {
    const list = reservationManagementService.list(user)
    setTodasLasReservas(list)
  }, [user])

  useEffect(() => {
    cargarReservas()
  }, [cargarReservas])

  // Filtrar reservas que pertenecen a la sucursal del encargado (o todas si es admin)
  const reservasSucursal = useMemo(() => {
    if (isBranchManager && sucursalAsignada) {
      return todasLasReservas.filter((r) => {
        return (
          hasMatchingBranch(r.sucursal, sucursalAsignada) ||
          hasMatchingBranch(r.sucursalPagoEfectivo, sucursalAsignada) ||
          hasMatchingBranch(r.reservaDetalles?.sucursalPagoEfectivo, sucursalAsignada) ||
          hasMatchingBranch(r.reservaDetalles?.sucursalRetiro, sucursalAsignada) ||
          String(r.sucursal || '').trim().toLowerCase() === String(sucursalAsignada).trim().toLowerCase()
        )
      })
    }
    return todasLasReservas
  }, [todasLasReservas, isBranchManager, sucursalAsignada])

  // Reservas pendientes de cobro en efectivo
  const pendientesEfectivo = useMemo(() => {
    return reservasSucursal.filter((r) => {
      const raw = reservationService.obtenerPorReferencia(r.codigo || r.id || r.referencia) || r
      const metodo = raw?.reservaDetalles?.metodoPago || r.pasarela || r.metodoPagoConfirmado
      const estadoNorm = String(r.estado || '').toLowerCase()
      const esEfectivo = metodo === 'efectivo' || estadoNorm.includes('efectivo')
      return esEfectivo && (estadoNorm === 'pendiente' || estadoNorm === 'pendiente_efectivo')
    })
  }, [reservasSucursal])

  // Reservas cobradas hoy en efectivo
  const cobradasHoy = useMemo(() => {
    const hoyUTC = new Date().toISOString().slice(0, 10)
    const hoyLocal = new Date().toLocaleDateString('en-CA')

    return reservasSucursal.filter((r) => {
      const estadoNorm = String(r.estado || '').toLowerCase()
      const raw = reservationService.obtenerPorReferencia(r.codigo || r.id || r.referencia) || r
      const metodo = r.metodoPagoConfirmado || r.pasarela || raw?.reservaDetalles?.metodoPago || ''
      const esEfectivo =
        metodo === 'efectivo' ||
        estadoNorm.includes('efectivo') ||
        Boolean(r.cajeroConfirmacion) ||
        Boolean(r.observacionesCaja)

      const estaPagada =
        r.pagoEstado === 'aprobado' ||
        estadoNorm === 'confirmada' ||
        estadoNorm === 'en_curso' ||
        estadoNorm === 'activa'

      const fechaCobro = String(r.fechaPagoConfirmado || r.fechaCreacion || raw?.fechaPagoConfirmado || '').slice(0, 10)
      const esDeHoy = !fechaCobro || fechaCobro === hoyUTC || fechaCobro === hoyLocal

      return estaPagada && esEfectivo && esDeHoy
    })
  }, [reservasSucursal])

  const totalRecaudadoHoy = useMemo(() => {
    return cobradasHoy.reduce((acc, r) => acc + (Number(r.totalCOP) || 0), 0)
  }, [cobradasHoy])

  // Función para buscar reserva
  const handleBuscar = (e, explicitQuery = null) => {
    if (e) e.preventDefault()
    setErrorBusqueda('')
    const targetQuery = (explicitQuery !== null ? explicitQuery : codigoBusqueda).trim()
    const query = targetQuery.toLowerCase()
    if (!query) {
      setErrorBusqueda('Por favor ingresa un código de referencia, cédula o teléfono.')
      return
    }

    const queryNoZeros = query.replace(/0/g, 'o')
    const queryDigits = query.replace(/\D/g, '')

    // Buscar en reservasSucursal, luego en todasLasReservas
    const pool = reservasSucursal.length > 0 ? reservasSucursal : todasLasReservas
    let encontrada = pool.find((r) => {
      const cod = String(r.codigo || r.referencia || r.id || '').toLowerCase()
      const codNoZeros = cod.replace(/0/g, 'o')
      const doc = String(r.clienteDocumento || '').replace(/\D/g, '')
      const tel = String(r.clienteTelefono || '').replace(/\D/g, '')
      const nom = String(r.clienteNombre || '').toLowerCase()
      return (
        cod === query ||
        cod.includes(query) ||
        codNoZeros === queryNoZeros ||
        codNoZeros.includes(queryNoZeros) ||
        (queryDigits && (doc === queryDigits || tel.includes(queryDigits))) ||
        nom.includes(query)
      )
    })

    if (!encontrada && todasLasReservas.length > 0) {
      encontrada = todasLasReservas.find((r) => {
        const cod = String(r.codigo || r.referencia || r.id || '').toLowerCase()
        const codNoZeros = cod.replace(/0/g, 'o')
        return cod === query || cod.includes(query) || codNoZeros === queryNoZeros || codNoZeros.includes(queryNoZeros)
      })
    }

    if (!encontrada) {
      const rawDirect = reservationService.obtenerPorReferencia(targetQuery)
      if (rawDirect) {
        encontrada = rawDirect
      }
    }

    if (encontrada) {
      const rawSnapshot = reservationService.obtenerPorReferencia(encontrada.codigo || encontrada.id || encontrada.referencia) || encontrada
      setReservaSeleccionada({
        ...encontrada,
        snapshot: rawSnapshot,
      })
      setCodigoBusqueda(encontrada.codigo || encontrada.id || encontrada.referencia || targetQuery)
      setErrorBusqueda('')
    } else {
      setReservaSeleccionada(null)
      setErrorBusqueda(`No se encontró ninguna reserva asociada al criterio "${targetQuery}".`)
    }
  }

  // Seleccionar desde chip rápido
  const handleSeleccionarChip = (reserva) => {
    setCodigoBusqueda(reserva.codigo || reserva.id || reserva.referencia)
    const rawSnapshot = reservationService.obtenerPorReferencia(reserva.codigo || reserva.id || reserva.referencia) || reserva
    setReservaSeleccionada({
      ...reserva,
      snapshot: rawSnapshot,
    })
    setErrorBusqueda('')
  }

  // Auto-seleccionar si se pasa ?ref=... en la URL o si hay cobros registrados hoy y no hay nada seleccionado aún
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const refParam = params.get('ref') || params.get('codigo')
    if (refParam) {
      handleBuscar(null, refParam)
    } else if (!reservaSeleccionada && cobradasHoy.length > 0) {
      handleSeleccionarChip(cobradasHoy[0])
    }
  }, [cobradasHoy.length])

  // Confirmar Pago en Efectivo
  const handleConfirmarCobro = async () => {
    if (!reservaSeleccionada) return

    const ref = reservaSeleccionada.codigo || reservaSeleccionada.id
    const total = reservaSeleccionada.totalCOP || reservaSeleccionada.total || 0

    const confirm = await showAlert({
      icon: 'question',
      title: '¿Confirmar cobro en efectivo?',
      text: `¿Confirmas haber recibido ${formatCurrency(total, moneda)} en efectivo para la reserva ${ref}?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar cobro',
      cancelButtonText: 'Cancelar',
    })

    if (!confirm.isConfirmed) return

    setProcesandoPago(true)
    try {
      // 1. Actualizar estado a CONFIRMADA en reservationService y reservationManagementService
      reservationManagementService.confirmCashPayment(ref, user, observacionesCaja)
      reservationService.actualizarEstado(ref, 'CONFIRMADA')

      // 2. Refrescar listas
      cargarReservas()

      // 3. Actualizar la reserva seleccionada en la vista
      const actualizada = reservationService.obtenerPorReferencia(ref)
      setReservaSeleccionada((prev) => ({
        ...prev,
        estado: 'CONFIRMADA',
        fechaPagoConfirmado: new Date().toISOString(),
        cajeroConfirmacion: user?.nombre || user?.correo || 'Encargado de Sucursal',
        snapshot: actualizada,
      }))

      showAlert({
        icon: 'success',
        title: '¡Pago Registrado con Éxito!',
        text: `Se confirmó el cobro en efectivo de la reserva ${ref}. La reserva ahora está CONFIRMADA y el cliente puede firmar su contrato digital.`,
        confirmButtonText: 'Entendido',
      })
    } catch (err) {
      console.error(err)
      showAlert({
        icon: 'error',
        title: 'Error al registrar cobro',
        text: 'No se pudo actualizar el estado de la reserva. Intenta nuevamente.',
        confirmButtonText: 'Cerrar',
      })
    } finally {
      setProcesandoPago(false)
    }
  }

  // Imprimir comprobante de caja
  const handleImprimirRecibo = () => {
    if (!reservaSeleccionada) return
    window.print()
  }

  // Datos calculados de la reserva seleccionada
  const snapshot = reservaSeleccionada?.snapshot
  const esMetodoEfectivo =
    snapshot?.reservaDetalles?.metodoPago === 'efectivo' ||
    reservaSeleccionada?.pasarela === 'efectivo' ||
    reservaSeleccionada?.estado?.toLowerCase()?.includes('efectivo')

  const esWompiDigital = !esMetodoEfectivo
  const estadoActualNorm = String(reservaSeleccionada?.estado || '').toLowerCase()
  const estaPagada = estadoActualNorm === 'confirmada' || estadoActualNorm === 'activa' || estadoActualNorm === 'en_curso'

  return (
    <div className={`cash-collection-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={branchOnly} />

      <main className="cash-collection-main">
        <header className="cash-header">
          <div>
            <p className="management-eyebrow">
              {isBranchManager
                ? t('caja.eyebrowBranch', { sucursal: sucursalAsignada || 'Asignada', defaultValue: `Módulo de Caja · Sede ${sucursalAsignada || 'Asignada'}` })
                : t('caja.eyebrowCentral', { defaultValue: 'Administración Central · Módulo de Caja' })}
            </p>
            <h1>{t('caja.title', { defaultValue: 'Cobro de Reservas en Sucursal' })}</h1>
            <p>
              {t('caja.subtitle', { defaultValue: 'Consulta el código de reserva entregado por el cliente en el counter para confirmar pagos en efectivo o verificar transacciones Wompi / Bancolombia.' })}
            </p>
          </div>
          <MenuConfiguracion />
        </header>

        {/* KPIs de Caja */}
        <section className="cash-kpis">
          <article className="cash-kpi-card">
            <div className="cash-kpi-icon pending">
              <FaClock />
            </div>
            <div className="cash-kpi-data">
              <p>{t('caja.pendingToCollect', { defaultValue: 'Pendientes por Cobrar' })}</p>
              <strong>{t('caja.reservationsCount', { count: pendientesEfectivo.length, defaultValue: `${pendientesEfectivo.length} reservas` })}</strong>
            </div>
          </article>

          <article className="cash-kpi-card">
            <div className="cash-kpi-icon collected">
              <FaCashRegister />
            </div>
            <div className="cash-kpi-data">
              <p>{t('caja.collectedToday', { defaultValue: 'Recaudado Hoy en Caja' })}</p>
              <strong>{formatCurrency(totalRecaudadoHoy, moneda)}</strong>
            </div>
          </article>

          <article className="cash-kpi-card">
            <div className="cash-kpi-icon digital">
              <FaCheckCircle />
            </div>
            <div className="cash-kpi-data">
              <p>{t('caja.collectionsToday', { defaultValue: 'Cobros Realizados Hoy' })}</p>
              <strong>{t('caja.transactionsCount', { count: cobradasHoy.length, defaultValue: `${cobradasHoy.length} transacciones` })}</strong>
            </div>
          </article>
        </section>

        {/* Buscador Rápido de Caja */}
        <section className="cash-search-box">
          <h2 className="cash-search-title">
            <FaSearch color="var(--brand-primary, #2563eb)" />
            {t('caja.quickSearchTitle', { defaultValue: 'Buscador de Reservas en Mostrador' })}
          </h2>

          <form onSubmit={handleBuscar} className="cash-search-form">
            <div className="cash-search-input-wrapper">
              <FaSearch />
              <input
                type="text"
                className="cash-search-input"
                placeholder={t('caja.searchPlaceholder', { defaultValue: 'Ingrese el código de referencia (ej: RES-...), cédula o teléfono del cliente...' })}
                value={codigoBusqueda}
                onChange={(e) => setCodigoBusqueda(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="cash-search-btn">
              <FaSearch />
              {t('caja.searchBtn', { defaultValue: 'Consultar Reserva' })}
            </button>
          </form>

          {/* Chips de acceso rápido a reservas pendientes */}
          {pendientesEfectivo.length > 0 && (
            <div className="cash-quick-chips">
              <span className="cash-quick-chips-label">{t('caja.pendingChipsLabel', { defaultValue: 'Pendientes de cobro:' })}</span>
              {pendientesEfectivo.slice(0, 5).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`cash-chip ${reservaSeleccionada?.id === p.id ? 'active' : ''}`}
                  onClick={() => handleSeleccionarChip(p)}
                >
                  <FaMoneyBillWave size={11} />
                  <span>{p.codigo || p.id}</span>
                  <strong>{formatCurrency(p.totalCOP, moneda)}</strong>
                </button>
              ))}
            </div>
          )}

          {errorBusqueda && (
            <p style={{ color: '#ef4444', fontSize: 13, fontWeight: 700, margin: '14px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaExclamationCircle /> {errorBusqueda}
            </p>
          )}
        </section>

        {/* Tarjeta de Información y Liquidación de Reserva */}
        {reservaSeleccionada && (
          <section className="cash-detail-card">
            <div className="cash-detail-header">
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--texto-second, #64748b)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {t('caja.queriedReservation', { defaultValue: 'Reserva Consultada' })}
                </span>
                <div className="cash-detail-ref">{reservaSeleccionada.codigo || reservaSeleccionada.id}</div>
              </div>

              <div>
                {estaPagada ? (
                  <span className="cash-badge-confirmed">
                    <FaCheckCircle />
                    {esWompiDigital
                      ? t('caja.paidWompi', { defaultValue: 'Pagado (Aprobado Wompi)' })
                      : t('caja.paidCash', { defaultValue: 'Pagado en Efectivo' })}
                  </span>
                ) : (
                  <span className="cash-badge-pending">
                    <FaClock />
                    {t('caja.pendingCash72h', { defaultValue: 'Pendiente de Pago en Efectivo (72h)' })}
                  </span>
                )}
              </div>
            </div>

            <div className="cash-detail-body">
              {/* Columna Izquierda: Datos del Cliente y Vehículo */}
              <div>
                <h3 className="cash-col-title">
                  <FaUser /> {t('caja.clientData', { defaultValue: 'Datos del Cliente' })}
                </h3>
                <div className="cash-data-group">
                  <div className="cash-data-row">
                    <span className="cash-data-label">{t('caja.fullName', { defaultValue: 'Nombre Completo:' })}</span>
                    <span className="cash-data-val">{reservaSeleccionada.clienteNombre}</span>
                  </div>
                  <div className="cash-data-row">
                    <span className="cash-data-label">{t('caja.idDocument', { defaultValue: 'Documento de Identidad:' })}</span>
                    <span className="cash-data-val">{reservaSeleccionada.clienteDocumento || t('caja.notSpecified', { defaultValue: 'No especificado' })}</span>
                  </div>
                  <div className="cash-data-row">
                    <span className="cash-data-label">{t('caja.contactPhone', { defaultValue: 'Teléfono de Contacto:' })}</span>
                    <span className="cash-data-val">{reservaSeleccionada.clienteTelefono}</span>
                  </div>
                  <div className="cash-data-row">
                    <span className="cash-data-label">{t('caja.email', { defaultValue: 'Correo Electrónico:' })}</span>
                    <span className="cash-data-val">{reservaSeleccionada.clienteCorreo}</span>
                  </div>
                </div>

                <h3 className="cash-col-title">
                  <FaCar /> {t('caja.vehicleAndRental', { defaultValue: 'Información del Vehículo y Renta' })}
                </h3>
                <div className="cash-vehicle-preview">
                  {reservaSeleccionada.vehiculoImagen ? (
                    <img src={reservaSeleccionada.vehiculoImagen} alt={reservaSeleccionada.vehiculoNombre} />
                  ) : (
                    <div style={{ width: 80, height: 50, display: 'grid', placeItems: 'center', background: '#e2e8f0', borderRadius: 8 }}>
                      <FaCar size={24} color="#64748b" />
                    </div>
                  )}
                  <div className="cash-vehicle-info">
                    <strong>{reservaSeleccionada.vehiculoNombre}</strong>
                    <span>{t('caja.plate', { defaultValue: 'Placa:' })} {reservaSeleccionada.vehiculoPlaca || t('caja.plateAssign', { defaultValue: 'Asignación al entregar' })}</span>
                    <span>{t('caja.branch', { defaultValue: 'Sede:' })} {reservaSeleccionada.sucursal}</span>
                  </div>
                </div>

                <div className="cash-data-group" style={{ marginTop: 12 }}>
                  <div className="cash-data-row">
                    <span className="cash-data-label">{t('caja.rentalPeriod', { defaultValue: 'Periodo de Alquiler:' })}</span>
                    <span className="cash-data-val">
                      {reservaSeleccionada.fechaInicio?.slice(0, 10)} {t('caja.to', { defaultValue: 'al' })} {reservaSeleccionada.fechaFin?.slice(0, 10)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Liquidación de Cobro */}
              <div>
                <h3 className="cash-col-title">
                  <FaReceipt /> {t('caja.billingTitle', { defaultValue: 'Liquidación y Cobro en Caja' })}
                </h3>

                <div className="cash-billing-box">
                  <div className="cash-breakdown">
                    <div className="cash-breakdown-row">
                      <span>{t('caja.baseRate', { defaultValue: 'Valor Base Alquiler + Coberturas:' })}</span>
                      <span>{formatCurrency(Math.round((reservaSeleccionada.totalCOP || 0) / 1.19 * 0.9), moneda)}</span>
                    </div>
                    <div className="cash-breakdown-row">
                      <span>{t('caja.adminFees', { defaultValue: 'Cargos Administrativos (10%):' })}</span>
                      <span>{formatCurrency(Math.round((reservaSeleccionada.totalCOP || 0) / 1.19 * 0.1), moneda)}</span>
                    </div>
                    <div className="cash-breakdown-row">
                      <span>{t('caja.vatApplied', { defaultValue: 'IVA Aplicado (19%):' })}</span>
                      <span>{formatCurrency(Math.round((reservaSeleccionada.totalCOP || 0) * 0.19 / 1.19), moneda)}</span>
                    </div>
                    {reservaSeleccionada.promocion && (
                      <div className="cash-breakdown-row discount">
                        <span>{t('caja.promoDiscount', { defaultValue: 'Descuento Promocional:' })}</span>
                        <span>-{formatCurrency(reservaSeleccionada.promocion.descuento || 0, moneda)}</span>
                      </div>
                    )}
                  </div>

                  <div className="cash-divider" />

                  {/* Destacado de Total */}
                  <div className="cash-total-callout">
                    <p className="cash-total-label">
                      {estaPagada
                        ? t('caja.totalPaid', { defaultValue: 'Total Pagado' })
                        : t('caja.totalToCollect', { defaultValue: 'Total a Cobrar en Efectivo' })}
                    </p>
                    <div className="cash-total-number">
                      {formatCurrency(reservaSeleccionada.totalCOP || 0, moneda)}
                    </div>
                  </div>

                  {/* Casos según método y estado */}
                  {esWompiDigital ? (
                    <div className="cash-wompi-notice">
                      <h4>
                        <FaCheckCircle /> {t('caja.wompiNoticeTitle', { defaultValue: 'Pago Digital Wompi / Bancolombia' })}
                      </h4>
                      <p>
                        {t('caja.wompiNoticeDesc', { defaultValue: 'El cliente realizó el pago de forma 100% digital a través de Wompi. El saldo pendiente a cobrar en caja es $0 COP.' })}
                      </p>
                    </div>
                  ) : estaPagada ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ padding: 12, borderRadius: 12, background: '#ecfdf5', color: '#065f46', fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
                        {t('caja.collectionRegistered', {
                          cajero: reservaSeleccionada.cajeroConfirmacion || 'Encargado',
                          fecha: new Date(reservaSeleccionada.fechaPagoConfirmado || Date.now()).toLocaleString(i18n.resolvedLanguage || 'es'),
                          defaultValue: `Cobro registrado por ${reservaSeleccionada.cajeroConfirmacion || 'Encargado'} el ${new Date(reservaSeleccionada.fechaPagoConfirmado || Date.now()).toLocaleString('es-CO')}.`
                        })}
                      </div>
                      <button type="button" onClick={handleImprimirRecibo} className="cash-search-btn" style={{ width: '100%', justifyContent: 'center' }}>
                        <FaPrint /> {t('caja.printReceipt', { defaultValue: 'Imprimir Comprobante de Caja' })}
                      </button>
                    </div>
                  ) : isBranchManager ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--texto-second, #64748b)', marginBottom: 6 }}>
                          {t('caja.cashObservations', { defaultValue: 'Observaciones de Caja (Opcional):' })}
                        </label>
                        <input
                          type="text"
                          placeholder={t('caja.cashObservationsPlaceholder', { defaultValue: 'Ej. Billetes verificados, cliente entrega cédula física...' })}
                          value={observacionesCaja}
                          onChange={(e) => setObservacionesCaja(e.target.value)}
                          className="cash-obs-input"
                        />
                      </div>

                      <button
                        type="button"
                        className="cash-confirm-btn"
                        onClick={handleConfirmarCobro}
                        disabled={procesandoPago}
                      >
                        <FaMoneyBillWave />
                        {procesandoPago
                          ? t('caja.processingBtn', { defaultValue: 'Procesando Cobro…' })
                          : t('caja.confirmCashBtn', { total: formatCurrency(reservaSeleccionada.totalCOP, moneda), defaultValue: `Confirmar Pago en Efectivo (${formatCurrency(reservaSeleccionada.totalCOP, moneda)})` })}
                      </button>
                    </div>
                  ) : (
                    <div className="cash-audit-banner">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand-primary, #1D4ED8)', fontWeight: 800, marginBottom: 4 }}>
                        <FaShieldAlt /> {t('caja.auditModeTitle', { defaultValue: 'Modo Auditoría (Solo Lectura)' })}
                      </div>
                      <p style={{ margin: 0, fontSize: 12.5 }}>
                        {t('caja.auditModeDesc', {
                          sucursal: reservaSeleccionada.sucursal || 'Sede',
                          defaultValue: `La recepción física del dinero y la confirmación del pago en efectivo es responsabilidad exclusiva del Encargado de la Sucursal (${reservaSeleccionada.sucursal || 'Sede'}) en ventanilla.`
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Historial Reciente de Cobros en Caja */}
        <section className="cash-recent-section">
          <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800 }}>
            {t('caja.recentHistoryTitle', { defaultValue: 'Historial de Cobros Recientes en Efectivo' })}
          </h3>
          {cobradasHoy.length === 0 ? (
            <p style={{ color: 'var(--texto-second, #64748b)', fontSize: 13, margin: 0 }}>
              {t('caja.noRecentHistory', { defaultValue: 'No se han registrado cobros en efectivo durante el turno de hoy.' })}
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="cash-recent-table">
                <thead>
                  <tr>
                    <th>{t('caja.tableRef', { defaultValue: 'Referencia' })}</th>
                    <th>{t('caja.tableClient', { defaultValue: 'Cliente' })}</th>
                    <th>{t('caja.tableVehicle', { defaultValue: 'Vehículo' })}</th>
                    <th>{t('caja.tableBranch', { defaultValue: 'Sede' })}</th>
                    <th>{t('caja.tableTotal', { defaultValue: 'Total Cobrado' })}</th>
                    <th>{t('caja.tableTime', { defaultValue: 'Hora de Registro' })}</th>
                    <th>{t('caja.tableCashier', { defaultValue: 'Cajero / Encargado' })}</th>
                    <th>{t('caja.tableAction', { defaultValue: 'Acción' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {cobradasHoy.map((c) => {
                    const isSelected =
                      reservaSeleccionada?.id === c.id ||
                      (reservaSeleccionada?.codigo && reservaSeleccionada?.codigo === c.codigo) ||
                      (reservaSeleccionada?.referencia && reservaSeleccionada?.referencia === c.referencia)

                    return (
                      <tr
                        key={c.id}
                        onClick={() => handleSeleccionarChip(c)}
                        className={`cash-recent-row ${isSelected ? 'selected' : ''}`}
                        title="Clic para ver detalle y comprobante"
                      >
                        <td style={{ color: 'var(--brand-primary, #2563eb)', fontWeight: 800 }}>{c.codigo || c.id || c.referencia}</td>
                        <td>{c.clienteNombre}</td>
                        <td>{c.vehiculoNombre}</td>
                        <td>{c.sucursal}</td>
                        <td style={{ fontWeight: 800 }}>{formatCurrency(c.totalCOP, moneda)}</td>
                        <td>{new Date(c.fechaPagoConfirmado || c.fechaCreacion || Date.now()).toLocaleTimeString(i18n.resolvedLanguage || 'es', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>{c.cajeroConfirmacion || 'Encargado'}</td>
                        <td>
                          <button
                            type="button"
                            className="cash-table-action-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSeleccionarChip(c)
                            }}
                          >
                            <FaReceipt /> {t('caja.viewReceipt', { defaultValue: 'Ver Recibo' })}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
