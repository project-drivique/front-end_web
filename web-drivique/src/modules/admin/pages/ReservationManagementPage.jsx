import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCar,
  FaEdit,
  FaEye,
  FaFileExcel,
  FaFilePdf,
  FaPlus,
  FaPrint,
  FaSearch,
  FaTimes,
  FaUser,
  FaBuilding,
  FaClock,
  FaBan,
  FaCheckCircle,
  FaExclamationTriangle,
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
import './CityManagementPage.css'
import './ReservationManagementPage.css'

export default function ReservationManagementPage() {
  const { t } = useTranslation()
  const { tema, moneda, tasaUSD } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const esModoOscuro = tema === 'oscuro'

  const esEncargado = user?.rol === 'encargado' || user?.rol === 'branch_manager' || user?.rol === 'encargado_sucursal'
  const sucursalEncargado = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || 'Neiva'

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

  // Carga inicial y evaluación automática periódica
  const cargarYEvaluarReservas = () => {
    const lista = reservationManagementService.list(user)
    setReservas(lista)
  }

  useEffect(() => {
    cargarYEvaluarReservas()
    catalogService.getVehiculos().then((v) => setCatalogoVehiculos(v)).catch(() => {})

    // Intervalo para transición automática a "En curso" / "Finalizada" sin intervención manual
    const interval = setInterval(() => {
      cargarYEvaluarReservas()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

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
  const headersExport = [
    'Código',
    'Cliente',
    'Correo',
    'Teléfono',
    'Vehículo',
    'Placa',
    'Sucursal',
    'Fecha Recogida',
    'Fecha Devolución',
    'Estado',
    'Total (COP)',
  ]

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
    title: esEncargado ? `Gestión de Reservas - Sucursal ${sucursalEncargado}` : 'Gestión Global de Reservas - Drivique',
    headers: headersExport,
    rows: rowsExport,
    filename: `reservas-drivique-${new Date().toISOString().slice(0, 10)}`,
  }

  const handleExportExcel = () => {
    exportExcel(exportData)
    accessAuditService.record({
      correo: user?.correo || 'admin@drivique.com',
      rol: user?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: 'Exportó listado de reservas a Excel',
    })
  }

  const handleExportPdf = () => {
    exportPdf(exportData)
    accessAuditService.record({
      correo: user?.correo || 'admin@drivique.com',
      rol: user?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: 'Exportó listado de reservas a PDF',
    })
  }

  const handlePrint = () => {
    printTable(exportData)
    accessAuditService.record({
      correo: user?.correo || 'admin@drivique.com',
      rol: user?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: 'Imprimió listado de reservas',
    })
  }

  // --- Manejo de Crear Reserva Manual ---
  const [formCrear, setFormCrear] = useState({
    clienteNombre: '',
    clienteCorreo: '',
    clienteTelefono: '',
    vehiculoNombre: 'Toyota Prado VX',
    vehiculoPlaca: 'KLS-849',
    sucursal: esEncargado ? sucursalEncargado : 'Neiva',
    fechaInicio: new Date().toISOString().slice(0, 16),
    fechaFin: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
    estado: 'confirmada',
    totalCOP: 1200000,
    notas: 'Atención presencial directa en oficina.',
  })

  const submitCrearManual = (e) => {
    e.preventDefault()
    reservationManagementService.createManual(formCrear, user)
    setNotice(t('admin.reservations.createdSuccess', 'Reserva manual registrada exitosamente.'))
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
    setNotice(t('admin.reservations.updatedSuccess', 'Reserva actualizada correctamente.'))
    setModalEditar(null)
    cargarYEvaluarReservas()
  }

  // --- Manejo de Cancelar Reserva ---
  const [motivoCancelar, setMotivoCancelar] = useState('')

  const submitCancelarReserva = (e) => {
    e.preventDefault()
    reservationManagementService.cancel(modalCancelar.id, motivoCancelar, user)
    setNotice(t('admin.reservations.cancelledSuccess', `Reserva ${modalCancelar.codigo} cancelada.`))
    setModalCancelar(null)
    setMotivoCancelar('')
    cargarYEvaluarReservas()
  }

  return (
    <main className={`cities-page ${esModoOscuro ? 'cities-page--dark' : ''}`}>
      <div className="cities-container">
        {/* Topbar Superior */}
        <header className="cities-topbar">
          <div>
            <Link className="cities-back" to={esEncargado ? '/encargado' : '/admin'}>
              <FaArrowLeft /> {t('admin.backToDashboard', 'Volver al Panel')}
            </Link>
            <p className="cities-eyebrow">
              {esEncargado
                ? `Encargado de Sucursal (${sucursalEncargado})`
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
              onClick={() => setModalCrear(true)}
            >
              <FaPlus /> {t('admin.createManualReservation', '+ Reserva Manual')}
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
          <div className="branches-toolbar" style={{ flexWrap: 'wrap', gap: 12 }}>
            {/* Buscador general */}
            <label className="cities-search" style={{ flex: '1 1 240px' }}>
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
              style={{ flex: '0 1 180px' }}
            >
              <option value="all">{t('admin.allStatuses', 'Todos los estados')}</option>
              <option value="confirmada">{t('admin.statusConfirmada', 'Confirmada')}</option>
              <option value="en_curso">{t('admin.statusEnCurso', 'En curso')}</option>
              <option value="finalizada">{t('admin.statusFinalizada', 'Finalizada')}</option>
              <option value="pendiente">{t('admin.statusPendiente', 'Pendiente')}</option>
              <option value="cancelada">{t('admin.statusCancelada', 'Cancelada')}</option>
            </select>

            {/* Filtro de Sucursal (Bloqueado si es Encargado) */}
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              disabled={esEncargado}
              style={{ flex: '0 1 180px', opacity: esEncargado ? 0.7 : 1 }}
            >
              {!esEncargado && <option value="all">{t('admin.allBranches', 'Todas las sucursales')}</option>}
              {sucursales.map((s) => (
                <option key={s.id} value={s.nombre}>
                  {s.nombre}
                </option>
              ))}
            </select>

            {/* Filtros de Fecha Recogida */}
            <div className="reservations-date-inputs">
              <span>Desde:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span>Hasta:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            {/* Botones de Exportación e Impresión */}
            <div className="cities-export">
              <button type="button" onClick={handleExportExcel} title="Exportar a Excel">
                <FaFileExcel /> Excel
              </button>
              <button type="button" onClick={handleExportPdf} title="Exportar a PDF">
                <FaFilePdf /> PDF
              </button>
              <button type="button" onClick={handlePrint} title="Imprimir listado">
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
                    <th>Código</th>
                    <th>Cliente / Usuario</th>
                    <th>Vehículo / Placa</th>
                    <th>Sucursal</th>
                    <th>Fechas Recogida - Devolución</th>
                    <th>Estado</th>
                    <th>Total ({moneda})</th>
                    <th>{t('admin.actions', 'Acciones')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong style={{ color: '#2563eb' }}>{r.codigo}</strong>
                      </td>

                      <td>
                        <div>
                          <strong>{r.clienteNombre}</strong>
                          <small style={{ display: 'block', color: '#64748b', fontSize: 11 }}>
                            {r.clienteCorreo}
                          </small>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FaCar style={{ color: '#2563eb' }} />
                          <div>
                            <strong>{r.vehiculoNombre}</strong>
                            {r.vehiculoPlaca && (
                              <small style={{ display: 'block', color: '#64748b', fontSize: 11 }}>
                                Placa: {r.vehiculoPlaca}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span>
                          <FaBuilding style={{ marginRight: 4, color: '#64748b' }} />
                          {r.sucursal}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: 11 }}>
                          <div>
                            <strong>Inicio:</strong> {r.fechaInicio?.replace('T', ' ')}
                          </div>
                          <div>
                            <strong>Fin:</strong> {r.fechaFin?.replace('T', ' ')}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`reserva-status-badge ${r.estado}`}>
                          <span className="reserva-status-dot" />
                          {r.estado.replace('_', ' ')}
                        </span>
                      </td>

                      <td>
                        <strong style={{ fontSize: 14 }}>
                          {formatCurrency(r.totalCOP, moneda, tasaUSD)}
                        </strong>
                      </td>

                      <td>
                        <div className="cities-row-actions">
                          {/* Ver Detalle */}
                          <button
                            type="button"
                            onClick={() => setModalDetalle(r)}
                            title="Ver Detalle Completo"
                          >
                            <FaEye />
                          </button>

                          {/* Editar */}
                          <button
                            type="button"
                            onClick={() => openEditarModal(r)}
                            title="Editar Reserva"
                          >
                            <FaEdit />
                          </button>

                          {/* Cancelar */}
                          {r.estado !== 'cancelada' && (
                            <button
                              className="is-danger"
                              type="button"
                              onClick={() => setModalCancelar(r)}
                              title="Cancelar Reserva"
                            >
                              <FaBan />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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
                <p className="cities-eyebrow">Detalle de Reserva</p>
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
                  <FaUser /> Datos del Cliente
                </h4>
                <div className="reserva-detail-field">
                  <small>Nombre completo</small>
                  <strong>{modalDetalle.clienteNombre}</strong>
                </div>
                <div className="reserva-detail-field">
                  <small>Correo electrónico</small>
                  <strong>{modalDetalle.clienteCorreo}</strong>
                </div>
                <div className="reserva-detail-field">
                  <small>Teléfono</small>
                  <strong>{modalDetalle.clienteTelefono}</strong>
                </div>
              </div>

              {/* Información del Vehículo */}
              <div className="reserva-detail-card-box">
                <h4>
                  <FaCar /> Vehículo Asociado
                </h4>
                <div className="reserva-detail-field">
                  <small>Modelo</small>
                  <strong>{modalDetalle.vehiculoNombre}</strong>
                </div>
                <div className="reserva-detail-field">
                  <small>Placa</small>
                  <strong>{modalDetalle.vehiculoPlaca || 'N/A'}</strong>
                </div>
                <div className="reserva-detail-field">
                  <small>Sucursal asignada</small>
                  <strong>{modalDetalle.sucursal}</strong>
                </div>
              </div>
            </div>

            {/* Tiempos y Estado */}
            <div className="reserva-detail-card-box">
              <h4>
                <FaClock /> Tiempos de Alquiler y Pago
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="reserva-detail-field">
                  <small>Fecha y Hora Recogida</small>
                  <strong>{modalDetalle.fechaInicio?.replace('T', ' ')}</strong>
                </div>
                <div className="reserva-detail-field">
                  <small>Fecha y Hora Devolución</small>
                  <strong>{modalDetalle.fechaFin?.replace('T', ' ')}</strong>
                </div>
                <div className="reserva-detail-field">
                  <small>Estado actual</small>
                  <span className={`reserva-status-badge ${modalDetalle.estado}`}>
                    {modalDetalle.estado.replace('_', ' ')}
                  </span>
                </div>
                <div className="reserva-detail-field">
                  <small>Monto Total ({moneda})</small>
                  <strong>{formatCurrency(modalDetalle.totalCOP, moneda, tasaUSD)}</strong>
                </div>
              </div>
            </div>

            {/* Historial de Transiciones / Auditoría */}
            <div className="reserva-timeline-wrap">
              <h4 style={{ margin: '0 0 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaHistory style={{ color: '#2563eb' }} /> Historial de Transiciones y Auditoría
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
                Cerrar
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
                <p className="cities-eyebrow">Atención Directa</p>
                <h2>Crear Reserva Manual</h2>
              </div>
              <button type="button" onClick={() => setModalCrear(false)}>
                ×
              </button>
            </div>

            <form onSubmit={submitCrearManual}>
              <label>
                Nombre del Cliente *
                <input
                  required
                  value={formCrear.clienteNombre}
                  onChange={(e) => setFormCrear({ ...formCrear, clienteNombre: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                />
              </label>

              <div className="branches-form-grid">
                <label>
                  Correo Electrónico *
                  <input
                    type="email"
                    required
                    value={formCrear.clienteCorreo}
                    onChange={(e) => setFormCrear({ ...formCrear, clienteCorreo: e.target.value })}
                    placeholder="cliente@email.com"
                  />
                </label>
                <label>
                  Teléfono *
                  <input
                    required
                    value={formCrear.clienteTelefono}
                    onChange={(e) => setFormCrear({ ...formCrear, clienteTelefono: e.target.value })}
                    placeholder="+57 300 000 0000"
                  />
                </label>
              </div>

              <div className="branches-form-grid">
                <label>
                  Vehículo *
                  <select
                    value={formCrear.vehiculoNombre}
                    onChange={(e) => {
                      const veh = catalogoVehiculos.find((v) => v.nombre === e.target.value)
                      setFormCrear({
                        ...formCrear,
                        vehiculoNombre: e.target.value,
                        vehiculoPlaca: veh?.placa || 'KLS-849',
                      })
                    }}
                  >
                    {catalogoVehiculos.length > 0 ? (
                      catalogoVehiculos.map((v) => (
                        <option key={v.id} value={v.nombre}>
                          {v.nombre} ({v.placa || 'Sin placa'})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Toyota Prado VX">Toyota Prado VX (KLS-849)</option>
                        <option value="Chevrolet Spark GT">Chevrolet Spark GT (HGF-123)</option>
                        <option value="Ford Explorer 2024">Ford Explorer 2024 (ERT-456)</option>
                      </>
                    )}
                  </select>
                </label>

                <label>
                  Sucursal *
                  <select
                    value={formCrear.sucursal}
                    disabled={esEncargado}
                    onChange={(e) => setFormCrear({ ...formCrear, sucursal: e.target.value })}
                  >
                    {sucursales.map((s) => (
                      <option key={s.id} value={s.nombre}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="branches-form-grid">
                <label>
                  Fecha y Hora Recogida *
                  <input
                    type="datetime-local"
                    required
                    value={formCrear.fechaInicio}
                    onChange={(e) => setFormCrear({ ...formCrear, fechaInicio: e.target.value })}
                  />
                </label>
                <label>
                  Fecha y Hora Devolución *
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
                  Estado Inicial
                  <select
                    value={formCrear.estado}
                    onChange={(e) => setFormCrear({ ...formCrear, estado: e.target.value })}
                  >
                    <option value="confirmada">Confirmada</option>
                    <option value="en_curso">En curso</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
                </label>

                <label>
                  Monto Total (COP) *
                  <input
                    type="number"
                    required
                    value={formCrear.totalCOP}
                    onChange={(e) => setFormCrear({ ...formCrear, totalCOP: e.target.value })}
                  />
                </label>
              </div>

              <label>
                Notas de Atención
                <input
                  value={formCrear.notas}
                  onChange={(e) => setFormCrear({ ...formCrear, notas: e.target.value })}
                />
              </label>

              <div className="cities-modal__actions">
                <button type="button" onClick={() => setModalCrear(false)}>
                  Cancelar
                </button>
                <button className="cities-primary" type="submit">
                  Crear Reserva
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
                <p className="cities-eyebrow">Edición de Datos</p>
                <h2>Reserva {modalEditar.codigo}</h2>
              </div>
              <button type="button" onClick={() => setModalEditar(null)}>
                ×
              </button>
            </div>

            <form onSubmit={submitEditarReserva}>
              <label>
                Nombre del Cliente
                <input
                  value={formEditar.clienteNombre}
                  onChange={(e) => setFormEditar({ ...formEditar, clienteNombre: e.target.value })}
                />
              </label>

              <div className="branches-form-grid">
                <label>
                  Sucursal
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
                  Estado de Reserva
                  <select
                    value={formEditar.estado}
                    onChange={(e) => setFormEditar({ ...formEditar, estado: e.target.value })}
                  >
                    <option value="confirmada">Confirmada</option>
                    <option value="en_curso">En curso</option>
                    <option value="finalizada">Finalizada</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </label>
              </div>

              <div className="branches-form-grid">
                <label>
                  Fecha Recogida
                  <input
                    type="datetime-local"
                    value={formEditar.fechaInicio}
                    onChange={(e) => setFormEditar({ ...formEditar, fechaInicio: e.target.value })}
                  />
                </label>
                <label>
                  Fecha Devolución
                  <input
                    type="datetime-local"
                    value={formEditar.fechaFin}
                    onChange={(e) => setFormEditar({ ...formEditar, fechaFin: e.target.value })}
                  />
                </label>
              </div>

              <label>
                Total COP
                <input
                  type="number"
                  value={formEditar.totalCOP}
                  onChange={(e) => setFormEditar({ ...formEditar, totalCOP: e.target.value })}
                />
              </label>

              <label>
                Notas Operativas
                <input
                  value={formEditar.notas}
                  onChange={(e) => setFormEditar({ ...formEditar, notas: e.target.value })}
                />
              </label>

              <div className="cities-modal__actions">
                <button type="button" onClick={() => setModalEditar(null)}>
                  Cancelar
                </button>
                <button className="cities-primary" type="submit">
                  Guardar Cambios
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
            <h2>¿Cancelar Reserva {modalCancelar.codigo}?</h2>
            <p>
              Esta acción cambiará el estado a <strong>Cancelada</strong> y liberará el vehículo para nuevas solicitudes.
            </p>

            <form onSubmit={submitCancelarReserva} style={{ marginTop: 16 }}>
              <label>
                Motivo de la Cancelación *
                <input
                  required
                  placeholder="Ej: Solicitado por el cliente / Incumplimiento de requisitos"
                  value={motivoCancelar}
                  onChange={(e) => setMotivoCancelar(e.target.value)}
                />
              </label>

              <div className="cities-modal__actions">
                <button type="button" onClick={() => setModalCancelar(null)}>
                  Volver
                </button>
                <button className="cities-danger" type="submit">
                  Confirmar Cancelación
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
