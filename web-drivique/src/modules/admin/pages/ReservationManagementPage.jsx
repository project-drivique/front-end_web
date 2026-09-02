import { useState, useEffect, useMemo, useCallback } from 'react'
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
  const esModoOscuro = tema === 'oscuro'

  const esEncargado = user?.rol === 'encargado' || user?.rol === 'branch_manager' || user?.rol === 'encargado_sucursal'
  const sucursalEncargado = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || ''

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
                    <th>{t('admin.reservationsManagement.table.clientUser')}</th>
                    <th>{t('admin.reservationsManagement.table.vehiclePlate')}</th>
                    <th>{t('admin.reservationsManagement.table.branch')}</th>
                    <th>{t('admin.reservationsManagement.table.dates')}</th>
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

                    return (
                      <tr key={r.id || cod}>
                        <td>
                          <strong style={{ color: 'var(--brand-text, #2563eb)' }}>{cod}</strong>
                        </td>

                        <td>
                          <div>
                            <strong>{cliNom}</strong>
                            <small style={{ display: 'block', color: 'var(--city-muted, #64748b)', fontSize: 11 }}>
                              {cliMail}
                            </small>
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {r.vehiculoImagen ? (
                              <img
                                src={r.vehiculoImagen}
                                alt={r.vehiculoNombre}
                                style={{
                                  width: 44,
                                  height: 32,
                                  borderRadius: 8,
                                  objectFit: 'cover',
                                  border: '1px solid var(--city-border)',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                                }}
                              />
                            ) : (
                              <div className="cities-name">
                                <span><FaCar /></span>
                              </div>
                            )}
                            <div>
                              <strong style={{ display: 'block', fontSize: 13, color: 'var(--city-text)' }}>{r.vehiculoNombre || 'Mazda CX-5 2024'}</strong>
                              <small style={{ display: 'block', color: 'var(--city-muted, #64748b)', fontSize: 11, fontWeight: 700 }}>
                                {t('admin.reservationsManagement.table.plateLabel', 'Placa:')} {r.vehiculoPlaca || 'KLS-849'}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span>
                            <FaBuilding style={{ marginRight: 4, color: 'var(--brand-primary, #2563eb)' }} />
                            {r.sucursal || 'Bogotá - Calle 100'}
                          </span>
                        </td>

                        <td>
                          <div style={{ fontSize: 11 }}>
                            <div>
                              <strong>{t('admin.reservationsManagement.table.start', 'Inicio:')}</strong> {r.fechaInicio ? r.fechaInicio.replace('T', ' ') : new Date().toISOString().slice(0, 10)}
                            </div>
                            <div>
                              <strong>{t('admin.reservationsManagement.table.end', 'Fin:')}</strong> {r.fechaFin ? r.fechaFin.replace('T', ' ') : new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10)}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={`reserva-status-badge ${r.estado || 'confirmada'}`}>
                            <span className="reserva-status-dot" />
                            {t(`admin.reservationsManagement.editModal.state${r.estado === 'en_curso' ? 'Ongoing' : r.estado === 'finalizada' ? 'Finished' : r.estado === 'cancelada' ? 'Cancelled' : r.estado === 'confirmada' ? 'Confirmed' : 'Pending'}`, r.estado || 'Confirmada')}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ fontSize: 13.5, color: 'var(--city-text)' }}>
                              ${totalCOP.toLocaleString('es-CO')} COP
                            </strong>
                            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary, #2563eb)' }}>
                              ≈ ${totalUSD.toLocaleString('en-US')} USD
                            </span>
                          </div>
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

            <div className="reserva-detail-grid">
              {/* Información del Cliente */}
              <div className="reserva-detail-card-box">
                <h4>
                  <FaUser /> {t('admin.reservationsManagement.detailModal.clientData')}
                </h4>
                <div className="reserva-detail-field">
                  <small>{t('admin.reservationsManagement.detailModal.fullName')}</small>
                  <strong>{modalDetalle.clienteNombre}</strong>
                </div>
                <div className="reserva-detail-field">
                  <small>{t('admin.reservationsManagement.detailModal.email')}</small>
                  <strong>{modalDetalle.clienteCorreo}</strong>
                </div>
                <div className="reserva-detail-field">
                  <small>{t('admin.reservationsManagement.detailModal.phone')}</small>
                  <strong>{modalDetalle.clienteTelefono}</strong>
                </div>
              </div>

              {/* Información del Vehículo */}
              <div className="reserva-detail-card-box">
                <h4>
                  <FaCar /> {t('admin.reservationsManagement.detailModal.vehicleAssociated')}
                </h4>
                {modalDetalle.vehiculoImagen && (
                  <div style={{ marginBottom: 12 }}>
                    <img
                      src={modalDetalle.vehiculoImagen}
                      alt={modalDetalle.vehiculoNombre}
                      style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--city-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    />
                  </div>
                )}
                <div className="reserva-detail-field">
                  <small>{t('admin.reservationsManagement.detailModal.model')}</small>
                  <strong>{modalDetalle.vehiculoNombre}</strong>
                </div>
                <div className="reserva-detail-field">
                  <small>{t('admin.reservationsManagement.detailModal.plate')}</small>
                  <strong>{modalDetalle.vehiculoPlaca || 'N/A'}</strong>
                </div>
                <div className="reserva-detail-field">
                  <small>{t('admin.reservationsManagement.detailModal.assignedBranch')}</small>
                  <strong>{modalDetalle.sucursal}</strong>
                </div>
              </div>
            </div>

            {/* Tiempos y Estado */}
            <div className="reserva-detail-card-box">
              <h4>
                <FaClock /> {t('admin.reservationsManagement.detailModal.rentalTimes')}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="reserva-detail-field">
                  <small>{t('admin.reservationsManagement.detailModal.pickupDateTime')}</small>
                  <strong>{modalDetalle.fechaInicio?.replace('T', ' ')}</strong>
                </div>
                <div className="reserva-detail-field">
                  <small>{t('admin.reservationsManagement.detailModal.returnDateTime')}</small>
                  <strong>{modalDetalle.fechaFin?.replace('T', ' ')}</strong>
                </div>
                <div className="reserva-detail-field">
                  <small>{t('admin.reservationsManagement.detailModal.currentState')}</small>
                  <span className={`reserva-status-badge ${modalDetalle.estado}`}>
                    {t(`admin.reservationsManagement.editModal.state${modalDetalle.estado === 'en_curso' ? 'Ongoing' : modalDetalle.estado === 'finalizada' ? 'Finished' : modalDetalle.estado === 'cancelada' ? 'Cancelled' : modalDetalle.estado === 'confirmada' ? 'Confirmed' : 'Pending'}`)}
                  </span>
                </div>
                <div className="reserva-detail-field">
                  <small>{t('admin.reservationsManagement.detailModal.totalAmount', { currency: moneda })}</small>
                  <strong>{formatCurrency(modalDetalle.totalCOP, moneda, tasaUSD)}</strong>
                </div>
              </div>
            </div>

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
