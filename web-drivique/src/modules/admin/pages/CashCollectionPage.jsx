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
import { formatCurrency } from '../../../utils/currencyUtils'
import { SUCURSALES } from '../../catalog/constants'
import { showAlert } from '../../../utils/swalConfig'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CashCollectionPage.css'

export default function CashCollectionPage({ branchOnly = false }) {
  const { t } = useTranslation()
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
      return todasLasReservas.filter(
        (r) => String(r.sucursal || '').trim().toLowerCase() === String(sucursalAsignada).trim().toLowerCase()
      )
    }
    return todasLasReservas
  }, [todasLasReservas, isBranchManager, sucursalAsignada])

  // Reservas pendientes de cobro en efectivo
  const pendientesEfectivo = useMemo(() => {
    return reservasSucursal.filter((r) => {
      const raw = reservationService.obtenerPorReferencia(r.codigo || r.id)
      const metodo = raw?.reservaDetalles?.metodoPago || r.pasarela
      const estadoNorm = String(r.estado || '').toLowerCase()
      const esEfectivo = metodo === 'efectivo' || estadoNorm.includes('efectivo')
      return esEfectivo && (estadoNorm === 'pendiente' || estadoNorm === 'pendiente_efectivo')
    })
  }, [reservasSucursal])

  // Reservas cobradas hoy en efectivo
  const cobradasHoy = useMemo(() => {
    const hoy = new Date().toISOString().slice(0, 10)
    return reservasSucursal.filter((r) => {
      return (r.fechaPagoConfirmado || r.fechaCreacion)?.slice(0, 10) === hoy && r.metodoPagoConfirmado === 'efectivo'
    })
  }, [reservasSucursal])

  const totalRecaudadoHoy = useMemo(() => {
    return cobradasHoy.reduce((acc, r) => acc + (Number(r.totalCOP) || 0), 0)
  }, [cobradasHoy])

  // Función para buscar reserva
  const handleBuscar = (e) => {
    if (e) e.preventDefault()
    setErrorBusqueda('')
    const query = codigoBusqueda.trim().toLowerCase()
    if (!query) {
      setErrorBusqueda('Por favor ingresa un código de referencia, cédula o teléfono.')
      return
    }

    const encontrada = reservasSucursal.find((r) => {
      const cod = String(r.codigo || r.id || '').toLowerCase()
      const doc = String(r.clienteDocumento || '').replace(/\D/g, '')
      const tel = String(r.clienteTelefono || '').replace(/\D/g, '')
      const nom = String(r.clienteNombre || '').toLowerCase()
      return (
        cod === query ||
        cod.includes(query) ||
        (doc && doc === query.replace(/\D/g, '')) ||
        (tel && tel.includes(query.replace(/\D/g, ''))) ||
        nom.includes(query)
      )
    })

    if (encontrada) {
      // Obtener snapshot original
      const rawSnapshot = reservationService.obtenerPorReferencia(encontrada.codigo || encontrada.id)
      setReservaSeleccionada({
        ...encontrada,
        snapshot: rawSnapshot,
      })
      setErrorBusqueda('')
    } else {
      setReservaSeleccionada(null)
      setErrorBusqueda(`No se encontró ninguna reserva asociada al criterio "${codigoBusqueda}".`)
    }
  }

  // Seleccionar desde chip rápido
  const handleSeleccionarChip = (reserva) => {
    setCodigoBusqueda(reserva.codigo || reserva.id)
    const rawSnapshot = reservationService.obtenerPorReferencia(reserva.codigo || reserva.id)
    setReservaSeleccionada({
      ...reserva,
      snapshot: rawSnapshot,
    })
    setErrorBusqueda('')
  }

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
              {isBranchManager ? `Módulo de Caja · Sede ${sucursalAsignada || 'Asignada'}` : 'Administración Central · Módulo de Caja'}
            </p>
            <h1>Cobro de Reservas en Sucursal</h1>
            <p>
              Consulta el código de reserva entregado por el cliente en el counter para confirmar pagos en efectivo o verificar transacciones Wompi / Bancolombia.
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
              <p>Pendientes por Cobrar</p>
              <strong>{pendientesEfectivo.length} reservas</strong>
            </div>
          </article>

          <article className="cash-kpi-card">
            <div className="cash-kpi-icon collected">
              <FaCashRegister />
            </div>
            <div className="cash-kpi-data">
              <p>Recaudado Hoy en Caja</p>
              <strong>{formatCurrency(totalRecaudadoHoy, moneda)}</strong>
            </div>
          </article>

          <article className="cash-kpi-card">
            <div className="cash-kpi-icon digital">
              <FaCheckCircle />
            </div>
            <div className="cash-kpi-data">
              <p>Cobros Realizados Hoy</p>
              <strong>{cobradasHoy.length} transacciones</strong>
            </div>
          </article>
        </section>

        {/* Buscador Rápido de Caja */}
        <section className="cash-search-box">
          <h2 className="cash-search-title">
            <FaSearch color="var(--brand-primary, #2563eb)" />
            Buscador de Reservas en Mostrador
          </h2>

          <form onSubmit={handleBuscar} className="cash-search-form">
            <div className="cash-search-input-wrapper">
              <FaSearch />
              <input
                type="text"
                className="cash-search-input"
                placeholder="Ingrese el código de referencia (ej: RES-...), cédula o teléfono del cliente..."
                value={codigoBusqueda}
                onChange={(e) => setCodigoBusqueda(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="cash-search-btn">
              <FaSearch />
              Consultar Reserva
            </button>
          </form>

          {/* Chips de acceso rápido a reservas pendientes */}
          {pendientesEfectivo.length > 0 && (
            <div className="cash-quick-chips">
              <span className="cash-quick-chips-label">Pendientes de cobro:</span>
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
                  Reserva Consultada
                </span>
                <div className="cash-detail-ref">{reservaSeleccionada.codigo || reservaSeleccionada.id}</div>
              </div>

              <div>
                {estaPagada ? (
                  <span className="cash-badge-confirmed">
                    <FaCheckCircle />
                    {esWompiDigital ? 'Pagado (Aprobado Wompi)' : 'Pagado en Efectivo'}
                  </span>
                ) : (
                  <span className="cash-badge-pending">
                    <FaClock />
                    Pendiente de Pago en Efectivo (72h)
                  </span>
                )}
              </div>
            </div>

            <div className="cash-detail-body">
              {/* Columna Izquierda: Datos del Cliente y Vehículo */}
              <div>
                <h3 className="cash-col-title">
                  <FaUser /> Datos del Cliente
                </h3>
                <div className="cash-data-group">
                  <div className="cash-data-row">
                    <span className="cash-data-label">Nombre Completo:</span>
                    <span className="cash-data-val">{reservaSeleccionada.clienteNombre}</span>
                  </div>
                  <div className="cash-data-row">
                    <span className="cash-data-label">Documento de Identidad:</span>
                    <span className="cash-data-val">{reservaSeleccionada.clienteDocumento || 'No especificado'}</span>
                  </div>
                  <div className="cash-data-row">
                    <span className="cash-data-label">Teléfono de Contacto:</span>
                    <span className="cash-data-val">{reservaSeleccionada.clienteTelefono}</span>
                  </div>
                  <div className="cash-data-row">
                    <span className="cash-data-label">Correo Electrónico:</span>
                    <span className="cash-data-val">{reservaSeleccionada.clienteCorreo}</span>
                  </div>
                </div>

                <h3 className="cash-col-title">
                  <FaCar /> Información del Vehículo y Renta
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
                    <span>Placa: {reservaSeleccionada.vehiculoPlaca || 'Asignación al entregar'}</span>
                    <span>Sede: {reservaSeleccionada.sucursal}</span>
                  </div>
                </div>

                <div className="cash-data-group" style={{ marginTop: 12 }}>
                  <div className="cash-data-row">
                    <span className="cash-data-label">Periodo de Alquiler:</span>
                    <span className="cash-data-val">
                      {reservaSeleccionada.fechaInicio?.slice(0, 10)} al {reservaSeleccionada.fechaFin?.slice(0, 10)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Liquidación de Cobro */}
              <div>
                <h3 className="cash-col-title">
                  <FaReceipt /> Liquidación y Cobro en Caja
                </h3>

                <div className="cash-billing-box">
                  <div className="cash-breakdown">
                    <div className="cash-breakdown-row">
                      <span>Valor Base Alquiler + Coberturas:</span>
                      <span>{formatCurrency(Math.round((reservaSeleccionada.totalCOP || 0) / 1.19 * 0.9), moneda)}</span>
                    </div>
                    <div className="cash-breakdown-row">
                      <span>Cargos Administrativos (10%):</span>
                      <span>{formatCurrency(Math.round((reservaSeleccionada.totalCOP || 0) / 1.19 * 0.1), moneda)}</span>
                    </div>
                    <div className="cash-breakdown-row">
                      <span>IVA Aplicado (19%):</span>
                      <span>{formatCurrency(Math.round((reservaSeleccionada.totalCOP || 0) * 0.19 / 1.19), moneda)}</span>
                    </div>
                    {reservaSeleccionada.promocion && (
                      <div className="cash-breakdown-row discount">
                        <span>Descuento Promocional:</span>
                        <span>-{formatCurrency(reservaSeleccionada.promocion.descuento || 0, moneda)}</span>
                      </div>
                    )}
                  </div>

                  <div className="cash-divider" />

                  {/* Destacado de Total */}
                  <div className="cash-total-callout">
                    <p className="cash-total-label">
                      {estaPagada ? 'Total Pagado' : 'Total a Cobrar en Efectivo'}
                    </p>
                    <div className="cash-total-number">
                      {formatCurrency(reservaSeleccionada.totalCOP || 0, moneda)}
                    </div>
                  </div>

                  {/* Casos según método y estado */}
                  {esWompiDigital ? (
                    <div className="cash-wompi-notice">
                      <h4>
                        <FaCheckCircle /> Pago Digital Wompi / Bancolombia
                      </h4>
                      <p>
                        El cliente realizó el pago de forma 100% digital a través de Wompi. El saldo pendiente a cobrar en caja es <strong>$0 COP</strong>.
                      </p>
                    </div>
                  ) : estaPagada ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ padding: 12, borderRadius: 12, background: '#ecfdf5', color: '#065f46', fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
                        Cobro registrado por {reservaSeleccionada.cajeroConfirmacion || 'Encargado'} el {new Date(reservaSeleccionada.fechaPagoConfirmado || Date.now()).toLocaleString('es-CO')}.
                      </div>
                      <button type="button" onClick={handleImprimirRecibo} className="cash-search-btn" style={{ width: '100%', justifyContent: 'center' }}>
                        <FaPrint /> Imprimir Comprobante de Caja
                      </button>
                    </div>
                  ) : isBranchManager ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--texto-second, #64748b)', marginBottom: 6 }}>
                          Observaciones de Caja (Opcional):
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Billetes verificados, cliente entrega cédula física..."
                          value={observacionesCaja}
                          onChange={(e) => setObservacionesCaja(e.target.value)}
                          style={{
                            width: '100%',
                            height: 42,
                            borderRadius: 10,
                            border: '1px solid var(--borde, #cbd5e1)',
                            padding: '0 12px',
                            fontSize: 13,
                            boxSizing: 'border-box',
                            background: '#ffffff',
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        className="cash-confirm-btn"
                        onClick={handleConfirmarCobro}
                        disabled={procesandoPago}
                      >
                        <FaMoneyBillWave />
                        {procesandoPago ? 'Procesando Cobro…' : `Confirmar Pago en Efectivo (${formatCurrency(reservaSeleccionada.totalCOP, moneda)})`}
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: 13, lineHeight: 1.5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1D4ED8', fontWeight: 800, marginBottom: 4 }}>
                        <FaShieldAlt /> Modo Auditoría (Solo Lectura)
                      </div>
                      <p style={{ margin: 0, fontSize: 12.5 }}>
                        La recepción física del dinero y la confirmación del pago en efectivo es responsabilidad exclusiva del <strong>Encargado de la Sucursal ({reservaSeleccionada.sucursal || 'Sede'})</strong> en ventanilla.
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
            Historial de Cobros Recientes en Efectivo
          </h3>
          {cobradasHoy.length === 0 ? (
            <p style={{ color: 'var(--texto-second, #64748b)', fontSize: 13, margin: 0 }}>
              No se han registrado cobros en efectivo durante el turno de hoy.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="cash-recent-table">
                <thead>
                  <tr>
                    <th>Referencia</th>
                    <th>Cliente</th>
                    <th>Vehículo</th>
                    <th>Sede</th>
                    <th>Total Cobrado</th>
                    <th>Hora de Registro</th>
                    <th>Cajero / Encargado</th>
                  </tr>
                </thead>
                <tbody>
                  {cobradasHoy.map((c) => (
                    <tr key={c.id}>
                      <td style={{ color: 'var(--brand-primary, #2563eb)', fontWeight: 800 }}>{c.codigo || c.id}</td>
                      <td>{c.clienteNombre}</td>
                      <td>{c.vehiculoNombre}</td>
                      <td>{c.sucursal}</td>
                      <td style={{ fontWeight: 800 }}>{formatCurrency(c.totalCOP, moneda)}</td>
                      <td>{new Date(c.fechaPagoConfirmado || c.fechaCreacion).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{c.cajeroConfirmacion || 'Encargado'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
