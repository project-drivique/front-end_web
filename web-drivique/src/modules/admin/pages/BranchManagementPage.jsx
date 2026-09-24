import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaBuilding,
  FaCar,
  FaEdit,
  FaFileExcel,
  FaFilePdf,
  FaMoneyBillWave,
  FaPlus,
  FaPrint,
  FaSearch,
  FaTrash,
  FaPhone,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { branchManagementService } from '../../../services/branchManagementService'
import { cityManagementService } from '../../../services/cityManagementService'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './BranchManagementPage.css'

const EMPTY = {
  nombre: '',
  ciudad: '',
  direccion: '',
  telefono: '+57 601 555 1234',
  horario: 'Lun-Vie 08:00 - 18:00 | Sáb 08:00 - 13:00',
  capacidadVehiculos: 25,
  estado: 'activa',
  encargadoId: '',
  autorizadoPagoEfectivo: true,
}

export default function BranchManagementPage() {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)

  const [branches, setBranches] = useState(() => branchManagementService.list())
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('all')
  const [cashFilter, setCashFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const cities = cityManagementService.list().sort((a, b) => a.nombre.localeCompare(b.nombre))
  const managers = branchManagementService.managers()

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    return branches
      .filter((branch) => {
        const matchCity = cityFilter === 'all' || branch.ciudad === cityFilter
        const matchCash = cashFilter === 'all' || String(branch.autorizadoPagoEfectivo) === cashFilter
        const matchStatus = statusFilter === 'all' || (branch.estado || 'activa') === statusFilter
        const matchSearch =
          !term ||
          `${branch.nombre} ${branch.ciudad} ${branch.direccion} ${branch.telefono} ${branchManagementService.managerName(branch)}`
            .toLocaleLowerCase()
            .includes(term)
        return matchCity && matchCash && matchStatus && matchSearch
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [branches, cashFilter, cityFilter, statusFilter, search])

  const headers = [
    'Sucursal',
    'Ciudad',
    'Dirección / Contacto',
    'Horario Atención',
    'Encargado Asignado',
    'Capacidad Flota',
    'Cobro Efectivo',
    'Estado',
  ]

  const rows = filtered.map((branch) => {
    const linked = branchManagementService.associations(branch)
    return [
      branch.nombre,
      branch.ciudad,
      `${branch.direccion} (Tel: ${branch.telefono || 'N/A'})`,
      branch.horario || '08:00 - 18:00',
      branchManagementService.managerName(branch) || 'Sin asignar',
      `${linked.vehicles} / ${branch.capacidadVehiculos || 20} autos`,
      branch.autorizadoPagoEfectivo ? 'Autorizado' : 'No autorizado',
      (branch.estado || 'activa') === 'activa' ? 'Activa' : 'Inactiva',
    ]
  })

  const exportData = {
    title: 'Gestión Administrativa de Sucursales - Drivique',
    headers,
    rows,
    filename: 'sucursales-drivique',
  }

  const close = () => {
    setModal(null)
    setError('')
  }

  const openCreate = () => {
    setForm({
      ...EMPTY,
      ciudad: cities[0]?.nombre || '',
      encargadoId: managers[0]?.correo || '',
    })
    setError('')
    setModal({ type: 'form' })
  }

  const openEdit = (branch) => {
    setForm({
      nombre: branch.nombre || '',
      ciudad: branch.ciudad || '',
      direccion: branch.direccion || '',
      telefono: branch.telefono || '+57 601 555 1234',
      horario: branch.horario || 'Lun-Vie 08:00 - 18:00 | Sáb 08:00 - 13:00',
      capacidadVehiculos: branch.capacidadVehiculos || 25,
      estado: branch.estado || 'activa',
      encargadoId: branch.encargadoId || '',
      autorizadoPagoEfectivo: Boolean(branch.autorizadoPagoEfectivo),
    })
    setError('')
    setModal({ type: 'form', branch })
  }

  const save = (event) => {
    event.preventDefault()
    try {
      if (modal.branch) {
        branchManagementService.update(modal.branch.id, form, user)
      } else {
        branchManagementService.create(form, user)
      }
      setBranches(branchManagementService.list())
      setNotice(modal.branch ? 'Sucursal actualizada exitosamente.' : 'Nueva sucursal creada con éxito.')
      close()
    } catch (caught) {
      setError(caught.message ? `Error: ${caught.message}` : 'Error al guardar la sucursal.')
    }
  }

  const remove = () => {
    try {
      branchManagementService.remove(modal.branch.id, user)
      setBranches(branchManagementService.list())
      setNotice('Sucursal eliminada exitosamente.')
      close()
    } catch (caught) {
      setModal(null)
      setNotice(
        `No se puede eliminar la sucursal porque tiene ${caught.linked?.vehicles || 0} vehículos y ${
          caught.linked?.reservations || 0
        } reservas vinculadas.`
      )
    }
  }

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar />
      <main className="management-main" style={{ padding: '24px 32px' }}>
        <div className="cities-container" style={{ maxWidth: '100%' }}>
          {/* Topbar */}
          <header className="cities-topbar">
            <div>
              <p className="cities-eyebrow">{t('admin.management', 'Gestión Operativa')}</p>
              <h1>Gestión de Sucursales</h1>
              <p className="cities-subtitle">
                Administración integral de sedes, encargados, horarios, capacidad de vehículos y cobro en efectivo.
              </p>
            </div>
            <div className="cities-topbar__actions">
              <MenuConfiguracion />
              <button className="cities-primary" type="button" onClick={openCreate}>
                <FaPlus /> Nueva Sucursal
              </button>
            </div>
          </header>

          {/* Notificación */}
          {notice && (
            <div className="cities-notice" role="status">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice('')}>
                ×
              </button>
            </div>
          )}

          {/* Toolbar */}
          <section className="cities-card">
            <div className="branches-toolbar" style={{ gridTemplateColumns: 'minmax(220px, 1fr) 160px 160px 140px auto' }}>
              <label className="cities-search">
                <FaSearch />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar sucursal, ciudad, dirección..."
                />
              </label>

              <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                <option value="all">Todas las ciudades</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.nombre}>
                    {city.nombre}
                  </option>
                ))}
              </select>

              <select value={cashFilter} onChange={(e) => setCashFilter(e.target.value)}>
                <option value="all">Todos los cobros</option>
                <option value="true">Cobro en efectivo autorizado</option>
                <option value="false">Solo pagos online</option>
              </select>

              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Todos los estados</option>
                <option value="activa">Sedes Activas</option>
                <option value="inactiva">Sedes Inactivas</option>
              </select>

              <div className="cities-export">
                <button type="button" onClick={() => exportExcel(exportData)}>
                  <FaFileExcel /> Excel
                </button>
                <button type="button" onClick={() => exportPdf(exportData)}>
                  <FaFilePdf /> PDF
                </button>
                <button type="button" onClick={() => printTable(exportData)}>
                  <FaPrint /> Imprimir
                </button>
              </div>
            </div>

            {/* Resumen */}
            <div className="cities-summary">
              <strong>{filtered.length}</strong> sucursales encontradas
            </div>

            {/* Tabla */}
            {filtered.length === 0 ? (
              <div className="cities-empty">
                <FaBuilding />
                <h2>No se encontraron sucursales</h2>
                <p>Intenta ajustar los filtros de búsqueda o registra una nueva sede.</p>
              </div>
            ) : (
              <div className="cities-table-wrap">
                <table className="branches-table">
                  <thead>
                    <tr>
                      <th>Sucursal</th>
                      <th>Ciudad</th>
                      <th>Dirección y Contacto</th>
                      <th>Horario Atención</th>
                      <th>Encargado</th>
                      <th>Cobro Efectivo</th>
                      <th>Flota / Capacidad</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((branch) => {
                      const linked = branchManagementService.associations(branch)
                      const esActiva = (branch.estado || 'activa') === 'activa'

                      return (
                        <tr key={branch.id}>
                          <td>
                            <div className="cities-name">
                              <span>
                                <FaBuilding />
                              </span>
                              <div>
                                <strong>{branch.nombre}</strong>
                                <small style={{ color: 'var(--city-muted, #64748b)' }}>ID: {branch.id}</small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span style={{ fontWeight: 600, color: 'var(--city-text, #0f172a)' }}>{branch.ciudad}</span>
                          </td>

                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span style={{ fontSize: 13, color: 'var(--city-text, #0f172a)' }}>{branch.direccion}</span>
                              <span style={{ fontSize: 11.5, color: 'var(--city-muted, #64748b)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <FaPhone style={{ fontSize: 10 }} /> {branch.telefono || '+57 601 555 1234'}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span style={{ fontSize: 12, color: 'var(--city-text, #0f172a)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <FaClock style={{ color: 'var(--city-muted, #64748b)', fontSize: 11 }} />
                              {branch.horario || 'Lun-Vie 08:00 - 18:00'}
                            </span>
                          </td>

                          <td>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--city-text, #0f172a)' }}>
                              {branchManagementService.managerName(branch) || 'Sin asignar'}
                            </span>
                          </td>

                          <td>
                            <span className={`branches-cash ${branch.autorizadoPagoEfectivo ? 'is-authorized' : ''}`}>
                              <FaMoneyBillWave />
                              {branch.autorizadoPagoEfectivo ? 'Autorizado' : 'No autorizado'}
                            </span>
                          </td>

                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span className="branches-linked">
                                <FaCar /> {linked.vehicles} vehículos
                              </span>
                              <small style={{ color: 'var(--city-muted, #64748b)', fontSize: 11 }}>
                                Máx. capacidad: {branch.capacidadVehiculos || 20}
                              </small>
                            </div>
                          </td>

                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '4px 9px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: 700,
                                background: esActiva ? '#ecfdf5' : '#fef2f2',
                                color: esActiva ? '#047857' : '#b91c1c',
                                border: `1px solid ${esActiva ? '#a7f3d0' : '#fecaca'}`,
                              }}
                            >
                              {esActiva ? <FaCheckCircle /> : <FaTimesCircle />}
                              {esActiva ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>

                          <td>
                            <div className="cities-row-actions">
                              <button type="button" onClick={() => openEdit(branch)} title="Editar Sucursal">
                                <FaEdit />
                              </button>
                              <button className="is-danger" type="button" onClick={() => setModal({ type: 'delete', branch })} title="Eliminar Sucursal">
                                <FaTrash />
                              </button>
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

        {/* Modal Crear / Editar */}
        {modal && (
          <div
            className="cities-modal-backdrop"
            role="presentation"
            onMouseDown={(e) => e.target === e.currentTarget && close()}
          >
            <section className="cities-modal branches-modal" role="dialog" aria-modal="true">
              {modal.type === 'form' ? (
                <>
                  <div className="cities-modal__head">
                    <div>
                      <p className="cities-eyebrow">Formulario de Sede</p>
                      <h2>{modal.branch ? 'Editar Sucursal' : 'Registrar Nueva Sucursal'}</h2>
                    </div>
                    <button type="button" onClick={close}>
                      ×
                    </button>
                  </div>

                  <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <label>
                      Nombre de la Sucursal
                      <input
                        autoFocus
                        required
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        placeholder="Ej: Alamo Bogotá - Calle 100"
                      />
                    </label>

                    <div className="branches-form-grid">
                      <label>
                        Ciudad
                        <select value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })}>
                          {cities.map((city) => (
                            <option key={city.id} value={city.nombre}>
                              {city.nombre}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Encargado Asignado
                        <select value={form.encargadoId} onChange={(e) => setForm({ ...form, encargadoId: e.target.value })}>
                          {managers.map((manager) => (
                            <option key={manager.correo} value={manager.correo}>
                              {`${manager.nombre || ''} ${manager.apellido || ''}`.trim() || manager.correo}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label>
                      Dirección Completa
                      <input
                        required
                        value={form.direccion}
                        onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                        placeholder="Ej: Av. Calle 100 # 15-20, Chicó"
                      />
                    </label>

                    <div className="branches-form-grid">
                      <label>
                        Teléfono de Contacto
                        <input
                          value={form.telefono}
                          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                          placeholder="Ej: +57 601 555 1234"
                        />
                      </label>

                      <label>
                        Capacidad Máxima de Autos
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={form.capacidadVehiculos}
                          onChange={(e) => setForm({ ...form, capacidadVehiculos: e.target.value })}
                        />
                      </label>
                    </div>

                    <div className="branches-form-grid">
                      <label>
                        Horario de Atención
                        <input
                          value={form.horario}
                          onChange={(e) => setForm({ ...form, horario: e.target.value })}
                          placeholder="Ej: Lun-Vie 08:00 - 18:00 | Sáb 08:00 - 13:00"
                        />
                      </label>

                      <label>
                        Estado de la Sede
                        <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                          <option value="activa">Activa / Operativa</option>
                          <option value="inactiva">Inactiva / Cerrada</option>
                        </select>
                      </label>
                    </div>

                    <label className="branches-cash-check">
                      <input
                        type="checkbox"
                        checked={form.autorizadoPagoEfectivo}
                        onChange={(e) => setForm({ ...form, autorizadoPagoEfectivo: e.target.checked })}
                      />
                      <span>
                        <strong>Autorizar Cobro en Efectivo en Sucursal</strong>
                        <small>Permite que esta sede reciba dinero en caja para reservaciones en mostrador.</small>
                      </span>
                    </label>

                    {managers.length === 0 && (
                      <p className="cities-error">No hay usuarios con el rol 'encargado_sucursal' registrados.</p>
                    )}
                    {error && <p className="cities-error">{error}</p>}

                    <div className="cities-modal__actions">
                      <button type="button" onClick={close}>
                        Cancelar
                      </button>
                      <button className="cities-primary" type="submit" disabled={!managers.length}>
                        Guardar Sucursal
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="cities-delete-icon">
                    <FaTrash />
                  </div>
                  <h2>¿Eliminar Sucursal?</h2>
                  <p>¿Estás seguro de eliminar la sucursal <strong>{modal.branch.nombre}</strong>?</p>
                  <div className="cities-modal__actions">
                    <button type="button" onClick={close}>
                      Cancelar
                    </button>
                    <button className="cities-danger" type="button" onClick={remove}>
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
