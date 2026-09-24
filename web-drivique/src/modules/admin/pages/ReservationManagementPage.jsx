import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaCalendarAlt,
  FaCar,
  FaEdit,
  FaEye,
  FaFileExcel,
  FaFilePdf,
  FaPlus,
  FaPrint,
  FaSearch,
  FaUser,
  FaBuilding,
  FaClock,
  FaBan,
  FaHistory,
  FaUserCheck,
  FaSave,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaMoneyBillWave,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { reservationManagementService } from '../../../services/reservationManagementService'
import { branchManagementService } from '../../../services/branchManagementService'
import { catalogService } from '../../../services/catalogService'
import { accessAuditService } from '../../../services/accessAuditService'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import { formatCurrency } from '../../../utils/currencyUtils'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './ReservationManagementPage.css'

const INITIAL_START_DATE = new Date().toISOString().slice(0, 16)
const INITIAL_END_DATE = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16)

export default function ReservationManagementPage() {
  const { t } = useTranslation()
  const { tema, moneda, tasaUSD } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const navigate = useNavigate()
  const esModoOscuro = tema === 'oscuro'

  const esEncargado = user?.rol === 'encargado' || user?.rol === 'branch_manager' || user?.rol === 'encargado_sucursal'
  const sucursalEncargado = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || ''
  const cashRoute = esEncargado ? '/encargado/cobro-sucursal' : '/admin/cobro-sucursal'

  const [reservas, setReservas] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState(esEncargado ? sucursalEncargado : 'all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Modales
  const [modalDetalle, setModalDetalle] = useState(null)
  const [modalCrear, setModalCrear] = useState(false)
  const [modalEditar, setModalEditar] = useState(null)
  const [modalCancelar, setModalCancelar] = useState(null)

  // Mensaje de notificación
  const [notice, setNotice] = useState('')

  // Estado para gestión de Domicilio (Encargado de Sucursal)
  const [domicilioFormState, setDomicilioFormState] = useState({
    domicilioEstado: 'EN_PREPARACION',
    domicilioConductor: '',
    domicilioTelefonoConductor: '',
  })

  useEffect(() => {
    if (modalDetalle) {
      setDomicilioFormState({
        domicilioEstado: modalDetalle.domicilioEstado || 'EN_PREPARACION',
        domicilioConductor: modalDetalle.domicilioConductor || '',
        domicilioTelefonoConductor: modalDetalle.domicilioTelefonoConductor || '',
      })
    }
  }, [modalDetalle])

  const handleGuardarLogisticaDomicilio = (e) => {
    e.preventDefault()
    if (!modalDetalle) return
    try {
      reservationManagementService.updateDeliveryLogistics(modalDetalle.id, domicilioFormState, user)
      setNotice('Logística a domicilio actualizada con éxito para el cliente.')
      setTimeout(() => setNotice(''), 4000)
      const lista = reservationManagementService.list(user)
      setReservas(lista)
      const actualizada = lista.find(r => String(r.id) === String(modalDetalle.id) || String(r.codigo) === String(modalDetalle.codigo))
      if (actualizada) setModalDetalle(actualizada)
    } catch (err) {
      console.error('Error al actualizar logística a domicilio:', err)
    }
  }

  // Datos para selector en formularios
  const [catalogoVehiculos, setCatalogoVehiculos] = useState([])
  const sucursales = useMemo(() => branchManagementService.list(), [])
  const sucursalesVisibles = useMemo(() => esEncargado
    ? sucursales.filter((branch) => String(branch.nombre || '').trim().toLocaleLowerCase() === String(sucursalEncargado).trim().toLocaleLowerCase())
    : sucursales, [esEncargado, sucursalEncargado, sucursales])
  const vehiculosDisponibles = useMemo(() => catalogoVehiculos.filter((vehicle) => !esEncargado || (
    Boolean(sucursalEncargado) &&
    String(vehicle.sucursal || '').trim().toLocaleLowerCase() === String(sucursalEncargado).trim().toLocaleLowerCase()
  )), [catalogoVehiculos, esEncargado, sucursalEncargado])

  // Carga inicial y evaluación automática periódica
  const cargarYEvaluarReservas = useCallback(() => {
    const lista = reservationManagementService.list(user)
    setReservas(lista)
  }, [user])

  useEffect(() => {
    cargarYEvaluarReservas()
    catalogService.getVehiculos().then((v) => setCatalogoVehiculos(v)).catch(() => undefined)

    // Intervalo para transición automática a "En curso" / "Finalizada" sin intervención manual
    const interval = setInterval(() => {
      cargarYEvaluarReservas()
    }, 30000)

    return () => clearInterval(interval)
  }, [cargarYEvaluarReservas])

  // Filtrado de reservas
  const filtradas = useMemo(() => {
    const term = search.trim().toLowerCase()
    return reservas.filter((res) => {
      const matchSearch =
        !term ||
        `${res.codigo} ${res.clienteNombre} ${res.clienteCorreo} ${res.vehiculoNombre} ${res.vehiculoPlaca} ${res.sucursal}`
          .toLowerCase()
          .includes(term)

      const matchStatus = statusFilter === 'all' || res.estado === statusFilter
      const matchBranch = branchFilter === 'all' || (res.sucursal || '').toLowerCase() === branchFilter.toLowerCase()

      let matchDate = true
      if (dateFrom) {
        matchDate = matchDate && new Date(res.fechaInicio) >= new Date(dateFrom)
      }
      if (dateTo) {
        matchDate = matchDate && new Date(res.fechaFin) <= new Date(`${dateTo}T23:59:59`)
      }

      return matchSearch && matchStatus && matchBranch && matchDate
    })
  }, [reservas, search, statusFilter, branchFilter, dateFrom, dateTo])

  // Configuración de exportación Excel / PDF / Impresión
  const headersExport = ['code', 'client', 'email', 'phone', 'vehicle', 'plate', 'branch', 'pickupDate', 'returnDate', 'state', 'total'].map((key) => t(`admin.reservationsManagement.fields.${key}`))

  const rowsExport = filtradas.map((r) => [
    r.codigo,
    r.clienteNombre,
    r.clienteCorreo,
    r.clienteTelefono,
    r.vehiculoNombre,
    r.vehiculoPlaca,
    r.sucursal,
    r.fechaInicio ? r.fechaInicio.replace('T', ' ') : '',
    r.fechaFin ? r.fechaFin.replace('T', ' ') : '',
    r.estado,
    r.totalCOP,
  ])

  const exportData = {
    title: esEncargado ? t('admin.reservationsManagement.exportTitleBranch', { branch: sucursalEncargado }) : t('admin.reservationsManagement.exportTitleGlobal'),
    headers: headersExport,
    rows: rowsExport,
    items: filtradas,
    filename: `reservas-drivique-${new Date().toISOString().slice(0, 10)}`,
  }

  const handleExportExcel = () => {
    exportExcel(exportData)
    accessAuditService.record({
      correo: user?.correo || 'admin@drivique.com',
      rol: user?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: t('admin.reservationsManagement.audit.exportExcel'),
    })
  }

  const handleExportPdf = () => {
    exportPdf(exportData)
    accessAuditService.record({
      correo: user?.correo || 'admin@drivique.com',
      rol: user?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: t('admin.reservationsManagement.audit.exportPdf'),
    })
  }

  const handlePrint = () => {
    printTable(exportData)
    accessAuditService.record({
      correo: user?.correo || 'admin@drivique.com',
      rol: user?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: t('admin.reservationsManagement.audit.print'),
    })
  }

  // --- Manejo de Crear Reserva Manual ---
  const [formCrear, setFormCrear] = useState({
    clienteNombre: '',
    clienteCorreo: '',
    clienteTelefono: '',
    vehiculoNombre: '',
    vehiculoPlaca: '',
    sucursal: esEncargado ? sucursalEncargado : '',
    fechaInicio: INITIAL_START_DATE,
    fechaFin: INITIAL_END_DATE,
    estado: 'confirmada',
    totalCOP: 0,
    notas: '',
  })

  const openCrearModal = () => {
    const firstVehicle = vehiculosDisponibles[0]
    setFormCrear((current) => ({ ...current, vehiculoNombre: firstVehicle?.nombre || '', vehiculoPlaca: firstVehicle?.placa || '', sucursal: esEncargado ? sucursalEncargado : (firstVehicle?.sucursal || sucursales[0]?.nombre || '') }))
    setModalCrear(true)
  }

  const submitCrearManual = (e) => {
    e.preventDefault()
    reservationManagementService.createManual(formCrear, user)
    setNotice(t('admin.reservationsModal.createdSuccess', 'Reserva manual registrada exitosamente.'))
    setModalCrear(false)
    cargarYEvaluarReservas()
  }

  // --- Manejo de Editar Reserva ---
  const [formEditar, setFormEditar] = useState({})

  const openEditarModal = (res) => {
    setFormEditar({
      id: res.id,
      clienteNombre: res.clienteNombre,
      clienteCorreo: res.clienteCorreo,
      clienteTelefono: res.clienteTelefono,
      sucursal: res.sucursal,
      fechaInicio: res.fechaInicio,
      fechaFin: res.fechaFin,
      estado: res.estado,
      totalCOP: res.totalCOP,
      notas: res.notas || '',
    })
    setModalEditar(res)
  }

  const submitEditarReserva = (e) => {
    e.preventDefault()
    reservationManagementService.update(formEditar.id, formEditar, user)
    setNotice(t('admin.reservationsModal.updatedSuccess', 'Reserva actualizada correctamente.'))
    setModalEditar(null)
    cargarYEvaluarReservas()
  }

  // --- Manejo de Cancelar Reserva ---
  const [motivoCancelar, setMotivoCancelar] = useState('')

  const submitCancelarReserva = (e) => {
    e.preventDefault()
    reservationManagementService.cancel(modalCancelar.id, motivoCancelar, user)
    setNotice(t('admin.reservationsModal.cancelledSuccess', `Reserva ${modalCancelar.codigo} cancelada.`))
    setModalCancelar(null)
    setMotivoCancelar('')
    cargarYEvaluarReservas()
  }

  return (
    <div className={`management-shell ${esModoOscuro ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={esEncargado} />
      <main className="management-main" style={{ padding: '24px 32px' }}>
        <div className="cities-container" style={{ maxWidth: '100%' }}>
        {/* Topbar Superior */}
        <header className="cities-topbar reservations-management-header">
          <div>
            <p className="cities-eyebrow">
              {esEncargado
                ? t('admin.reservationsManagement.encargadoSucursal', { branch: sucursalEncargado })
                : t('admin.management', 'Gestión Operativa')}
            </p>
            <h1>{t('admin.reservationsTitle', 'Gestión de Reservas')}</h1>
            <p className="cities-subtitle">
              {t(
                'admin.reservationsSubtitle',
                'Control operativo completo de reservas, entregas, devoluciones y cancelaciones.'
              )}
            </p>
          </div>

          <div className="cities-topbar__actions">
            <MenuConfiguracion />
            <button
              className="cities-primary"
              type="button"
              onClick={openCrearModal}
            >
              <FaPlus /> {t('admin.createManualReservation', 'Reserva Manual')}
            </button>
          </div>
        </header>

        {/* Mensaje de Aviso / Notificación */}
        {notice && (
          <div className="cities-notice" role="status">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice('')}>
              ×
            </button>
          </div>
        )}

        {/* Barra de Filtros y Búsqueda */}
        <section className="cities-card">
          <div className="branches-toolbar reservations-management-toolbar">
            {/* Buscador general */}
            <label className="cities-search">
              <FaSearch />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('admin.searchReservations', 'Buscar por código, cliente, auto, placa...')}
              />
            </label>

            {/* Filtro de Estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="reservations-filter-select"
            >
              <option value="all">{t('admin.allStatuses', 'Todos los estados')}</option>
              <option value="confirmada">{t('admin.statusConfirmada', 'Confirmada')}</option>
              <option value="en_curso">{t('admin.statusEnCurso', 'En curso')}</option>
              <option value="finalizada">{t('admin.statusFinalizada', 'Finalizada')}</option>
              <option value="pendiente">{t('admin.statusPendiente', 'Pendiente')}</option>
              <option value="cancelada">{t('admin.statusCancelada', 'Cancelada')}</option>
            </select>

            {/* Filtro de Sucursal (Bloqueado si es Encargado) */}
            {esEncargado ? (
              <div className="reservations-assigned-branch">
                <FaBuilding />
                <span>{sucursalEncargado || t('admin.reservationsManagement.noAssignedBranch')}</span>
              </div>
            ) : (
              <select
                className="reservations-filter-select"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                <option value="all">{t('admin.allBranches', 'Todas las sucursales')}</option>
                {sucursalesVisibles.map((s) => (
                  <option key={s.id} value={s.nombre}>{s.nombre}</option>
                ))}
              </select>
            )}

            {/* Filtros de Fecha Recogida */}
            <div className="reservations-date-inputs">
              <label><span>{t('admin.reservationsManagement.dateFrom')}</span><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></label>
              <label><span>{t('admin.reservationsManagement.dateTo')}</span><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></label>
            </div>

            {/* Botones de Exportación e Impresión */}
            <div className="cities-export reservations-export-actions">
              <button type="button" onClick={handleExportExcel} title={t('admin.reservationsManagement.exportExcelTitle')}>
                <FaFileExcel /> Excel
              </button>
              <button type="button" onClick={handleExportPdf} title={t('admin.reservationsManagement.exportPdfTitle')}>
                <FaFilePdf /> PDF
              </button>
              <button type="button" onClick={handlePrint} title={t('admin.reservationsManagement.printTitle')}>
                <FaPrint /> {t('admin.print', 'Imprimir')}
              </button>
            </div>
          </div>

          {/* Resumen de resultados */}
          <div className="cities-summary">
            <strong>{filtradas.length}</strong> {t('admin.reservationsFound', 'reservas encontradas')}
          </div>

          {/* Tabla de Reservas */}
          {filtradas.length === 0 ? (
            <div className="cities-empty">
              <FaCalendarAlt />
              <h2>{t('admin.noReservationsTitle', 'No hay reservas registradas')}</h2>
              <p>{t('admin.noReservationsText', 'No se encontraron reservas con los filtros aplicados.')}</p>
            </div>
          ) : (
            <div className="cities-table-wrap">
              <table className="branches-table reservations-admin-table">
                <thead>
                  <tr>
                    <th>{t('admin.reservationsManagement.table.code')}</th>
                    <th>Cliente</th>
                    <th>Correo</th>
                    <th>Imagen</th>
                    <th>Vehículo</th>
                    <th>Placa</th>
                    <th>{t('admin.reservationsManagement.table.branch')}</th>
                    <th>Fecha Retiro</th>
                    <th>Fecha Devolución</th>
                    <th>Medio de Pago</th>
                    <th>Estado Pago</th>
                    <th>{t('admin.reservationsManagement.table.state')}</th>
                    <th>{t('admin.reservationsManagement.table.totalSuffix')} ({moneda})</th>
                    <th>{t('admin.actions', 'Acciones')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((r) => {
                    const cod = r.codigo || r.referencia || 'RES-2026-9102'
                    const cliNom = r.clienteNombre || 'Carlos Mendoza'
                    const cliMail = r.clienteCorreo || 'cliente@drivique.com'
                    const totalCOP = Number(r.totalCOP || r.total || r.precioTotal || 348000)
                    const totalUSD = Math.round(totalCOP / (tasaUSD || 4000))

                    const rawMetodo = String(
                      r.reservaDetalles?.metodoPago ||
                      r.pasarela ||
                      r.metodoPagoConfirmado ||
                      r.metodoPago ||
                      ''
                    ).toLowerCase()

                    const canalPago = String(
                      r.reservaDetalles?.metodoDetalle ||
                      r.reservaDetalles?.tipoTarjeta ||
                      r.reservaDetalles?.banco ||
                      r.canalPago ||
                      ''
                    ).toLowerCase()

                    let textoMedioPago = 'Wompi - Tarjeta'
                    if (rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal')) {
                      textoMedioPago = 'Pago en Sucursal'
                    } else if (rawMetodo.includes('wompi') || rawMetodo.includes('pasarela') || rawMetodo.includes('card') || rawMetodo.includes('tarjeta')) {
                      if (canalPago.includes('nequi')) textoMedioPago = 'Wompi - Nequi'
                      else if (canalPago.includes('bancolombia')) textoMedioPago = 'Wompi - Bancolombia'
                      else if (canalPago.includes('pse')) textoMedioPago = 'Wompi - PSE'
                      else if (canalPago.includes('efectivo')) textoMedioPago = 'Wompi - Efectivo'
                      else textoMedioPago = 'Wompi - Tarjeta'
                    }

                    const esCobroPresencialPendiente =
                      (rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal')) &&
                      !Boolean(r.metodoPagoConfirmado) &&
                      r.pagoEstado !== 'aprobado'

                    const pagoRecibido =
                      (r.pagoEstado === 'aprobado' ||
                        Boolean(r.metodoPagoConfirmado) ||
                        Boolean(r.fechaPagoConfirmado) ||
                        r.estado === 'confirmada' ||
                        r.estado === 'en_curso' ||
                        r.estado === 'finalizada') &&
                      !esCobroPresencialPendiente

                    return (
                      <tr key={r.id || cod}>
                        <td>
                          <strong style={{ color: 'var(--city-text, #0f172a)', fontWeight: 700 }}>{cod}</strong>
                        </td>

                        <td>
                          <span style={{ fontSize: 13, color: 'var(--city-text, #0f172a)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {cliNom}
                          </span>
                        </td>

                        <td>
                          <span style={{ color: 'var(--city-muted, #64748b)', fontSize: 12, whiteSpace: 'nowrap' }}>
                            {cliMail}
                          </span>
                        </td>

                        <td>
                          {r.vehiculoImagen ? (
                            <img
                              src={r.vehiculoImagen}
                              alt={r.vehiculoNombre}
                              style={{
                                width: 44,
                                height: 30,
                                borderRadius: 6,
                                objectFit: 'cover',
                                border: '1px solid var(--city-border)',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                display: 'block'
                              }}
                            />
                          ) : (
                            <div className="cities-name" style={{ width: 32, height: 32 }}>
                              <span><FaCar /></span>
                            </div>
                          )}
                        </td>

                        <td>
                          <span style={{ fontSize: 13, color: 'var(--city-text, #0f172a)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {r.vehiculoNombre || 'Mazda CX-5 2024'}
                          </span>
                        </td>

                        <td>
                          <span
                            style={{
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              padding: '3px 7px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              letterSpacing: '0.5px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {r.vehiculoPlaca || 'KLS-849'}
                          </span>
                        </td>

                        <td>
                          <span style={{ fontSize: 13, color: 'var(--city-text, #0f172a)', display: 'inline-flex', alignItems: 'flex-start', gap: 6, lineHeight: 1.35 }}>
                            <FaBuilding style={{ color: 'var(--city-muted, #64748b)', fontSize: 12, marginTop: 2, flexShrink: 0 }} />
                            <span>{r.sucursal || 'Bogotá - Calle 100'}</span>
                          </span>
                        </td>

                        <td>
                          <span style={{ fontSize: 12.5, color: 'var(--city-text, #0f172a)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {r.fechaInicio ? r.fechaInicio.replace('T', ' ').slice(0, 16) : new Date().toISOString().slice(0, 10)}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 12.5, color: 'var(--city-text, #0f172a)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {r.fechaFin ? r.fechaFin.replace('T', ' ').slice(0, 16) : new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10)}
                          </span>
                        </td>

                        <td>
                          <span style={{ fontSize: 12, color: 'var(--city-text, #0f172a)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {textoMedioPago}
                          </span>
                        </td>

                        <td>
                          {pagoRecibido ? (
                            <span
                              style={{
                                background: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                color: '#047857',
                                padding: '4px 9px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: 700,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Recibido
                            </span>
                          ) : (
                            <span
                              style={{
                                background: '#fffbe1',
                                border: '1px solid #fde68a',
                                color: '#b45309',
                                padding: '4px 9px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: 700,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              No Recibido
                            </span>
                          )}
                        </td>

                        <td>
                          <span className={`reserva-status-badge ${r.estado || 'confirmada'}`}>
                            <span className="reserva-status-dot" />
                            {t(`admin.reservationsManagement.editModal.state${r.estado === 'en_curso' ? 'Ongoing' : r.estado === 'finalizada' ? 'Finished' : r.estado === 'cancelada' ? 'Cancelled' : r.estado === 'confirmada' ? 'Confirmed' : 'Pending'}`, r.estado || 'Confirmada')}
                          </span>
                        </td>

                        <td>
                          <span style={{ fontSize: 13.5, color: 'var(--city-text, #0f172a)', fontWeight: 600 }}>
                            {formatCurrency(totalCOP, moneda, tasaUSD)}
                          </span>
                        </td>

                        <td>
                          <div className="cities-row-actions">
                            <button
                              type="button"
                              onClick={() => setModalDetalle(r)}
                              title={t('admin.reservationsManagement.tooltips.viewDetail', 'Ver Detalle')}
                            >
                              <FaEye />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditarModal(r)}
                              title={t('admin.reservationsManagement.tooltips.edit', 'Editar')}
                            >
                              <FaEdit />
                            </button>
                            {r.estado !== 'cancelada' && (
                              <button
                                className="is-danger"
                                type="button"
                                onClick={() => setModalCancelar(r)}
                                title={t('admin.reservationsManagement.tooltips.cancel', 'Cancelar')}
                              >
                                <FaBan />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ── MODAL 1: DETALLE COMPLETO DE RESERVA ── */}
      {modalDetalle && (
        <div
          className="cities-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setModalDetalle(null)}
        >
          <section className="cities-modal reserva-detail-modal" role="dialog">
            <div className="cities-modal__head">
              <div>
                <p className="cities-eyebrow">{t('admin.reservationsManagement.detailModal.eyebrow')}</p>
                <h2>{modalDetalle.codigo}</h2>
              </div>
              <button type="button" onClick={() => setModalDetalle(null)}>
                ×
              </button>
            </div>

            {/* ── ESTRUCTURA DE LOS 3 PASOS DEL FLUJO DE RESERVA ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* PASO 1: SELECCIÓN DE VEHÍCULO, FECHAS Y SUCURSALES */}
              <div className="reserva-detail-card-box" style={{ borderLeft: '4px solid var(--brand-primary, #2563eb)' }}>
                <h4 style={{ color: 'var(--brand-primary, #2563eb)', margin: '0 0 12px', fontSize: 14 }}>
                  <FaCar /> PASO 1: Selección de Vehículo, Fechas y Sucursal
                </h4>
                
                {modalDetalle.vehiculoImagen && (
                  <div style={{ marginBottom: 12 }}>
                    <img
                      src={modalDetalle.vehiculoImagen}
                      alt={modalDetalle.vehiculoNombre}
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--city-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="reserva-detail-field">
                    <small>Vehículo Asociado:</small>
                    <strong>{modalDetalle.vehiculoNombre}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>Placa del Auto:</small>
                    <span style={{ display: 'inline-block', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                      {modalDetalle.vehiculoPlaca || 'KLS-849'}
                    </span>
                  </div>
                  <div className="reserva-detail-field">
                    <small>Sucursal de Retiro:</small>
                    <strong>{modalDetalle.sucursal || 'Bogotá - Calle 100'}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>Sucursal de Devolución:</small>
                    <strong>{modalDetalle.reservaDetalles?.sucursalDevolucion || modalDetalle.sucursal || 'Bogotá - Calle 100'}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>Fecha y Hora de Retiro:</small>
                    <strong style={{ color: '#047857' }}>{modalDetalle.fechaInicio?.replace('T', ' ')}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>Fecha y Hora de Devolución:</small>
                    <strong style={{ color: '#0284c7' }}>{modalDetalle.fechaFin?.replace('T', ' ')}</strong>
                  </div>
                </div>
              </div>

              {/* PASO 2: SEGUROS, KILOMETRAJE Y SERVICIOS ADICIONALES */}
              <div className="reserva-detail-card-box" style={{ borderLeft: '4px solid #059669' }}>
                <h4 style={{ color: '#059669', margin: '0 0 12px', fontSize: 14 }}>
                  <FaShieldAlt /> PASO 2: Cobertura, Kilometraje y Adicionales
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="reserva-detail-field">
                    <small>Cobertura de Seguro:</small>
                    <strong>{modalDetalle.reservaDetalles?.cobertura?.nombre || modalDetalle.cobertura || 'Protección Estándar CDW'}</strong>
                  </div>

                  <div className="reserva-detail-field">
                    <small>Tipo de Kilometraje:</small>
                    <strong>{modalDetalle.reservaDetalles?.kilometraje || modalDetalle.kilometraje || 'Ilimitado'}</strong>
                  </div>

                  <div className="reserva-detail-field" style={{ gridColumn: 'span 2' }}>
                    <small>Servicios Adicionales Contratados:</small>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      {(modalDetalle.reservaDetalles?.serviciosAdicionales?.length > 0) ? (
                        modalDetalle.reservaDetalles.serviciosAdicionales.map((s, idx) => (
                          <span key={idx} style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
                            {typeof s === 'string' ? s : s.nombre}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--city-muted, #94a3b8)', fontSize: 12, italic: 'true' }}>
                          No aplicó servicios adicionales
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* PASO 3: DATOS DEL CLIENTE, TÉRMINOS, CUPONES Y PAGO */}
              <div className="reserva-detail-card-box" style={{ borderLeft: '4px solid #7c3aed' }}>
                <h4 style={{ color: '#7c3aed', margin: '0 0 12px', fontSize: 14 }}>
                  <FaUser /> PASO 3: Cliente, Términos, Cupones y Gestión de Pago
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div className="reserva-detail-field">
                    <small>Nombre del Cliente / Titular:</small>
                    <strong>{modalDetalle.clienteNombre}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>Cédula / Documento Identidad:</small>
                    <strong>{modalDetalle.clienteDocumento || '1020304050'}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>Correo Electrónico:</small>
                    <strong>{modalDetalle.clienteCorreo}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>Teléfono de Contacto:</small>
                    <strong>{modalDetalle.clienteTelefono}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>Términos y Condiciones:</small>
                    <span style={{ color: '#047857', fontWeight: 700, fontSize: 12 }}>
                      ✓ Aceptados por el cliente
                    </span>
                  </div>
                  <div className="reserva-detail-field">
                    <small>Cupón de Descuento:</small>
                    <strong>
                      {modalDetalle.cuponCodigo || modalDetalle.reservaDetalles?.cuponAplicado
                        ? `Aplicó (${modalDetalle.cuponCodigo || 'DRIVIQUE2026'})`
                        : 'No aplicó'}
                    </strong>
                  </div>
                </div>

                {/* Bloque Financiero y Pago por ID Único */}
                <div style={{ background: 'var(--city-soft, #f8fafc)', padding: 14, borderRadius: 12, border: '1px solid var(--adm-border, #cbd5e1)', marginTop: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div>
                      <small style={{ color: 'var(--city-muted)', fontSize: 11 }}>ID Único de Reserva:</small>
                      <strong style={{ display: 'block', fontSize: 14, color: 'var(--brand-primary, #2563eb)' }}>{modalDetalle.codigo}</strong>
                    </div>
                    <div>
                      <small style={{ color: 'var(--city-muted)', fontSize: 11 }}>Monto Total Reserva:</small>
                      <strong style={{ display: 'block', fontSize: 15, color: 'var(--city-text)' }}>{formatCurrency(modalDetalle.totalCOP, moneda, tasaUSD)}</strong>
                    </div>
                    <div>
                      <small style={{ color: 'var(--city-muted)', fontSize: 11 }}>Medio de Pago:</small>
                      <strong style={{ display: 'block', fontSize: 12 }}>
                        {modalDetalle.reservaDetalles?.metodoPago?.includes('efectivo') ? 'Pago Presencial en Sucursal' : 'Wompi - Pasarela Digital'}
                      </strong>
                    </div>
                    <div>
                      <small style={{ color: 'var(--city-muted)', fontSize: 11 }}>Estado del Pago:</small>
                      <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: modalDetalle.pagoEstado === 'aprobado' || modalDetalle.metodoPagoConfirmado ? '#ecfdf5' : '#fffbe1', color: modalDetalle.pagoEstado === 'aprobado' || modalDetalle.metodoPagoConfirmado ? '#047857' : '#b45309' }}>
                        {modalDetalle.pagoEstado === 'aprobado' || modalDetalle.metodoPagoConfirmado ? 'Pago Recibido' : 'No Recibido'}
                      </span>
                    </div>
                  </div>

                  {/* Botón Condicional de Confirmación de Cobro en Caja */}
                  {(!modalDetalle.metodoPagoConfirmado && modalDetalle.pagoEstado !== 'aprobado' && modalDetalle.reservaDetalles?.metodoPago?.includes('efectivo')) && (
                    <button
                      type="button"
                      className="cities-primary"
                      onClick={() => {
                        setModalDetalle(null)
                        navigate(`${cashRoute}?ref=${encodeURIComponent(modalDetalle.codigo)}`)
                      }}
                      style={{ width: '100%', marginTop: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', background: '#047857', borderRadius: 10, color: '#fff', fontWeight: 800, fontSize: 12, border: 'none', cursor: 'pointer' }}
                    >
                      <FaMoneyBillWave /> Confirmar Cobro en Caja (Sucursal)
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Gestión de Logística a Domicilio (Encargado de Sucursal) */}
            {(modalDetalle.sucursalRetiro === 'domicilio' || modalDetalle.sucursalDevolucion === 'domicilio' || modalDetalle.domicilioDireccion) && (
              <div className="reserva-detail-card-box" style={{ background: 'var(--city-bg-sub, #f8fafc)', border: '1.5px solid var(--brand-border-light, #cbd5e1)' }}>
                <h4 style={{ color: 'var(--brand-primary, #2563eb)' }}>
                  Gestión de Logística a Domicilio (Sucursal)
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  {modalDetalle.domicilioDireccion && (
                    <div className="reserva-detail-field">
                      <small>Dirección de Entrega (Retiro):</small>
                      <strong>{modalDetalle.domicilioDireccion}</strong>
                      {modalDetalle.domicilioBarrio && <small style={{ color: 'var(--city-muted)' }}>Barrio: {modalDetalle.domicilioBarrio}</small>}
                      {modalDetalle.domicilioReferencias && <small style={{ color: 'var(--city-muted)' }}>Ref: {modalDetalle.domicilioReferencias}</small>}
                    </div>
                  )}
                  {modalDetalle.domicilioDevolucionDireccion && (
                    <div className="reserva-detail-field">
                      <small>Dirección de Recogida (Devolución):</small>
                      <strong>{modalDetalle.domicilioDevolucionDireccion}</strong>
                    </div>
                  )}
                  <div className="reserva-detail-field" style={{ background: '#eff6ff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe', gridColumn: 'span 2' }}>
                    <small style={{ color: '#1d4ed8', fontWeight: 800 }}>PIN DE SEGURIDAD PARA VALIDAR ENTREGA:</small>
                    <strong style={{ fontSize: 16, color: '#1e40af', letterSpacing: '0.12em' }}>
                      {modalDetalle.domicilioPin || '4829'}
                    </strong>
                  </div>
                </div>

                <form onSubmit={handleGuardarLogisticaDomicilio} style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg-tarjeta, #ffffff)', padding: 14, borderRadius: 12, border: '1px solid var(--borde, #e2e8f0)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--city-text)' }}>
                        Estado de Logística:
                      </label>
                      <select
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700 }}
                        value={domicilioFormState.domicilioEstado}
                        onChange={(e) => setDomicilioFormState({ ...domicilioFormState, domicilioEstado: e.target.value })}
                      >
                        <option value="EN_PREPARACION">1. En preparación (Sucursal)</option>
                        <option value="EN_CAMINO">2. Agente en camino a entrega</option>
                        <option value="ENTREGADO">3. Vehículo entregado al cliente</option>
                        <option value="RECOGIDO">4. Vehículo recogido y retornado</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--city-text)' }}>
                        Nombre del Agente / Conductor:
                      </label>
                      <input
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
                        placeholder="ej. Carlos Restrepo (Logística Drivique)"
                        value={domicilioFormState.domicilioConductor}
                        onChange={(e) => setDomicilioFormState({ ...domicilioFormState, domicilioConductor: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--city-text)' }}>
                      Teléfono / WhatsApp del Conductor:
                    </label>
                    <input
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
                      placeholder="ej. +57 312 456 7890"
                      value={domicilioFormState.domicilioTelefonoConductor}
                      onChange={(e) => setDomicilioFormState({ ...domicilioFormState, domicilioTelefonoConductor: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, background: 'var(--brand-primary, #2563eb)', color: '#ffffff', border: 'none', fontWeight: 800, fontSize: 12, cursor: 'pointer', marginTop: 4 }}
                  >
                    <FaSave /> Actualizar Logística a Domicilio
                  </button>
                </form>
              </div>
            )}

            {/* Historial de Transiciones / Auditoría */}
            <div className="reserva-timeline-wrap">
              <h4 style={{ margin: '0 0 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaHistory style={{ color: 'var(--brand-text)' }} /> {t('admin.reservationsManagement.detailModal.historyTitle')}
              </h4>
              <div style={{ maxHeight: 160, overflowY: 'auto' }}>
                {(modalDetalle.historialAcciones || []).map((h, idx) => (
                  <div key={idx} className="reserva-timeline-item">
                    <div className="reserva-timeline-dot-wrap">
                      <div className="reserva-timeline-dot" />
                      {idx < modalDetalle.historialAcciones.length - 1 && (
                        <div className="reserva-timeline-line" />
                      )}
                    </div>
                    <div className="reserva-timeline-content">
                      <p>{h.accion}</p>
                      <small>
                        {h.usuario} • {new Date(h.fecha).toLocaleString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cities-modal__actions" style={{ marginTop: 20 }}>
              <button type="button" onClick={() => setModalDetalle(null)}>
                {t('admin.reservationsManagement.detailModal.close')}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ── MODAL 2: CREAR RESERVA MANUAL ── */}
      {modalCrear && (
        <div
          className="cities-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setModalCrear(false)}
        >
          <section className="cities-modal" role="dialog">
            <div className="cities-modal__head">
              <div>
                <p className="cities-eyebrow">{t('admin.reservationsModal.directAttention')}</p>
                <h2>{t('admin.reservationsModal.createManualResTitle')}</h2>
              </div>
              <button type="button" onClick={() => setModalCrear(false)}>
                ×
              </button>
            </div>

            <form onSubmit={submitCrearManual}>
              <label>
                {t('admin.reservationsModal.clientName')}
                <input
                  required
                  value={formCrear.clienteNombre}
                  onChange={(e) => setFormCrear({ ...formCrear, clienteNombre: e.target.value })}
                  placeholder={t('admin.reservationsModal.clientNamePlaceholder')}
                />
              </label>

              <div className="branches-form-grid">
                <label>
                  {t('admin.reservationsModal.clientEmail')}
                  <input
                    type="email"
                    required
                    value={formCrear.clienteCorreo}
                    onChange={(e) => setFormCrear({ ...formCrear, clienteCorreo: e.target.value })}
                    placeholder={t('admin.reservationsModal.clientEmailPlaceholder')}
                  />
                </label>
                <label>
                  {t('admin.reservationsModal.clientPhone')}
                  <input
                    required
                    value={formCrear.clienteTelefono}
                    onChange={(e) => setFormCrear({ ...formCrear, clienteTelefono: e.target.value })}
                    placeholder={t('admin.reservationsModal.clientPhonePlaceholder')}
                  />
                </label>
              </div>

              <div className="branches-form-grid">
                <label>
                  {t('admin.reservationsManagement.createModal.vehicle')}
                  <select
                    value={formCrear.vehiculoNombre}
                    onChange={(e) => {
                      const veh = vehiculosDisponibles.find((v) => v.nombre === e.target.value)
                      setFormCrear({
                        ...formCrear,
                        vehiculoNombre: e.target.value,
                        vehiculoPlaca: veh?.placa || '',
                      })
                    }}
                  >
                    {vehiculosDisponibles.length > 0 ? (
                      vehiculosDisponibles.map((v) => (
                        <option key={v.id} value={v.nombre}>
                          {v.nombre} ({v.placa || t('admin.reservationsModal.noLicensePlate')})
                        </option>
                      ))
                    ) : <option value="" disabled>{t('admin.reservationsManagement.createModal.noVehicles')}</option>}
                  </select>
                </label>

                <label>
                  {t('admin.reservationsModal.branch')}
                  <select
                    value={formCrear.sucursal}
                    disabled={esEncargado}
                    onChange={(e) => setFormCrear({ ...formCrear, sucursal: e.target.value })}
                  >
                    {sucursalesVisibles.map((s) => (
                      <option key={s.id} value={s.nombre}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="branches-form-grid">
                <label>
                  {t('admin.reservationsModal.pickupDate')}
                  <input
                    type="datetime-local"
                    required
                    value={formCrear.fechaInicio}
                    onChange={(e) => setFormCrear({ ...formCrear, fechaInicio: e.target.value })}
                  />
                </label>
                <label>
                  {t('admin.reservationsModal.returnDate')}
                  <input
                    type="datetime-local"
                    required
                    value={formCrear.fechaFin}
                    onChange={(e) => setFormCrear({ ...formCrear, fechaFin: e.target.value })}
                  />
                </label>
              </div>

              <div className="branches-form-grid">
                <label>
                  {t('admin.reservationsModal.initialStatus')}
                  <select
                    value={formCrear.estado}
                    onChange={(e) => setFormCrear({ ...formCrear, estado: e.target.value })}
                  >
                    <option value="confirmada">{t('admin.reservationsModal.statusConfirmed')}</option>
                    <option value="en_curso">{t('admin.reservationsModal.statusInProgress')}</option>
                    <option value="pendiente">{t('admin.reservationsModal.statusPending')}</option>
                  </select>
                </label>

                <label>
                  {t('admin.reservationsModal.totalAmountCOP')}
                  <input
                    type="number"
                    required
                    value={formCrear.totalCOP}
                    onChange={(e) => setFormCrear({ ...formCrear, totalCOP: e.target.value })}
                  />
                </label>
              </div>

              <label>
                {t('admin.reservationsModal.notes')}
                <input
                  value={formCrear.notas}
                  onChange={(e) => setFormCrear({ ...formCrear, notas: e.target.value })}
                />
              </label>

              <div className="cities-modal__actions">
                <button type="button" onClick={() => setModalCrear(false)}>
                  {t('common.cancel')}
                </button>
                <button className="cities-primary" type="submit" disabled={!vehiculosDisponibles.length || (esEncargado && !sucursalEncargado)}>
                  {t('admin.reservationsManagement.createModal.create')}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* ── MODAL 3: EDITAR RESERVA ── */}
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
                ×
              </button>
            </div>

            <form onSubmit={submitEditarReserva}>
              <label>
                {t('admin.reservationsManagement.editModal.clientName')}
                <input
                  value={formEditar.clienteNombre}
                  onChange={(e) => setFormEditar({ ...formEditar, clienteNombre: e.target.value })}
                />
              </label>

              <div className="branches-form-grid">
                <label>
                  {t('admin.reservationsManagement.editModal.branch')}
                  <select
                    value={formEditar.sucursal}
                    disabled={esEncargado}
                    onChange={(e) => setFormEditar({ ...formEditar, sucursal: e.target.value })}
                  >
                    {sucursales.map((s) => (
                      <option key={s.id} value={s.nombre}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  {t('admin.reservationsManagement.editModal.state')}
                  <select
                    value={formEditar.estado}
                    onChange={(e) => setFormEditar({ ...formEditar, estado: e.target.value })}
                  >
                    <option value="confirmada">{t('admin.reservationsManagement.editModal.stateConfirmed')}</option>
                    <option value="en_curso">{t('admin.reservationsManagement.editModal.stateOngoing')}</option>
                    <option value="finalizada">{t('admin.reservationsManagement.editModal.stateFinished')}</option>
                    <option value="pendiente">{t('admin.reservationsManagement.editModal.statePending')}</option>
                    <option value="cancelada">{t('admin.reservationsManagement.editModal.stateCancelled')}</option>
                  </select>
                </label>
              </div>

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

              <label>
                {t('admin.reservationsManagement.editModal.total', { currency: moneda })}
                <input
                  type="number"
                  value={formEditar.totalCOP}
                  onChange={(e) => setFormEditar({ ...formEditar, totalCOP: e.target.value })}
                />
              </label>

              <label>
                {t('admin.reservationsManagement.editModal.notes')}
                <input
                  value={formEditar.notas}
                  onChange={(e) => setFormEditar({ ...formEditar, notas: e.target.value })}
                />
              </label>

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

      {/* ── MODAL 4: CANCELAR RESERVA ── */}
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
    </main>
    </div>
  )
}
