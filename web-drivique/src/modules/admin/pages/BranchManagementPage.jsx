import { useEffect, useMemo, useState } from 'react'
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
import BranchFormDeleteModal from '../components/BranchFormDeleteModal'
import './CityManagementPage.css'
import './BranchManagementPage.css'

/**
 * Estado inicial por defecto para el formulario de creación/edición de sucursales.
 */
const EMPTY = {
  nombre: '',
  ciudad: '',
  direccion: '',
  telefono: '',
  apertura: '08:00',
  cierre: '18:00',
  capacidadVehiculos: 20,
  estado: 'activa',
  encargadoId: '',
  autorizadoPagoEfectivo: true,
}

/**
 * Componente de Página: BranchManagementPage
 */
export default function BranchManagementPage() {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)

  const [branches, setBranches] = useState([])
  const [loadingBranches, setLoadingBranches] = useState(true)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('all')
  const [cashFilter, setCashFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    branchManagementService.refresh()
      .then((list) => active && setBranches(list))
      .catch(() => active && setError(t('hc.no_fue_posible_cargar_las_sucursales', 'No fue posible cargar las sucursales.')))
      .finally(() => active && setLoadingBranches(false))
    return () => { active = false }
  }, [])
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
    t('hc2.direccion_contacto', 'Dirección / Contacto'),
    t('hc2.horario_atencion', 'Horario Atención'),
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
      branch.horario,
      branchManagementService.managerName(branch) || t('hc2.sin_asignar', 'Sin asignar'),
      `${linked.vehicles} / ${branch.capacidadVehiculos} autos`,
      branch.autorizadoPagoEfectivo ? 'Autorizado' : 'No autorizado',
      (branch.estado || 'activa') === 'activa' ? t('hc5.active_f', 'Activa') : t('hc5.inactive_f', 'Inactiva'),
    ]
  })

  const exportData = {
    title: t('hc.gestion_administrativa_de_sucursales_d', 'Gestión Administrativa de Sucursales - Drivique'),
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
      encargadoId: '',
    })
    setError('')
    setModal({ type: 'form' })
  }

  const openEdit = (branch) => {
    setForm({
      nombre: branch.nombre || '',
      ciudad: branch.ciudad || '',
      direccion: branch.direccion || '',
      telefono: branch.telefono || '',
      apertura: branch.apertura || '08:00',
      cierre: branch.cierre || '18:00',
      capacidadVehiculos: branch.capacidadVehiculos || 20,
      estado: branch.estado || 'activa',
      encargadoId: branch.encargadoId || '',
      autorizadoPagoEfectivo: Boolean(branch.autorizadoPagoEfectivo),
    })
    setError('')
    setModal({ type: 'form', branch })
  }

  const save = async (event) => {
    event.preventDefault()
    try {
      if (modal.branch) {
        await branchManagementService.update(modal.branch.id, form, user)
      } else {
        await branchManagementService.create(form, user)
      }
      setBranches(branchManagementService.list())
      setNotice(modal.branch ? t('hc2.sucursal_actualizada_exitosamente', 'Sucursal actualizada exitosamente.') : t('hc2.nueva_sucursal_creada_con_exito', 'Nueva sucursal creada con éxito.'))
      close()
    } catch (caught) {
      setError(caught.message ? t('hc3.error_prefix', { defaultValue: 'Error: {{mensaje}}', mensaje: caught.message }) : t('hc2.error_al_guardar_la_sucursal', 'Error al guardar la sucursal.'))
    }
  }

  const remove = async () => {
    try {
      await branchManagementService.remove(modal.branch.id, user)
      setBranches(branchManagementService.list())
      setNotice(t('hc.sucursal_eliminada_exitosamente', 'Sucursal eliminada exitosamente.'))
      close()
    } catch (caught) {
      setModal(null)
      setNotice(caught.message)
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
              <h1>{t('hc.gestion_de_sucursales', 'Gestión de Sucursales')}</h1>
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
                á—
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
                  placeholder={t('hc.buscar_sucursal_ciudad_direccion', 'Buscar sucursal, ciudad, dirección...')}
                />
              </label>

              <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                <option value="all">{t('hc.todas_las_ciudades', 'Todas las ciudades')}</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.nombre}>
                    {city.nombre}
                  </option>
                ))}
              </select>

              <select value={cashFilter} onChange={(e) => setCashFilter(e.target.value)}>
                <option value="all">{t('hc.todos_los_cobros', 'Todos los cobros')}</option>
                <option value="true">{t('hc.cobro_en_efectivo_autorizado', 'Cobro en efectivo autorizado')}</option>
                <option value="false">{t('hc4.solo_pagos_online', 'Solo pagos online')}</option>
              </select>

              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">{t('hc.todos_los_estados', 'Todos los estados')}</option>
                <option value="activa">{t('hc4.sedes_activas', 'Sedes Activas')}</option>
                <option value="inactiva">{t('hc4.sedes_inactivas', 'Sedes Inactivas')}</option>
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
            {loadingBranches ? (<div className="cities-empty"><p>{t('hc.cargando_sucursales', 'Cargando sucursales...')}</p></div>) : filtered.length === 0 ? (
              <div className="cities-empty">
                <FaBuilding />
                <h2>{t('hc.no_se_encontraron_sucursales', 'No se encontraron sucursales')}</h2>
                <p>{t('hc.intenta_ajustar_los_filtros_de_busqued', 'Intenta ajustar los filtros de búsqueda o registra una nueva sede.')}</p>
              </div>
            ) : (
              <div className="cities-table-wrap">
                <table className="branches-table">
                  <thead>
                    <tr>
                      <th>{t('hc4.sucursal', 'Sucursal')}</th>
                      <th>{t('hc4.ciudad', 'Ciudad')}</th>
                      <th>{t('hc.direccion_y_contacto', 'Dirección y Contacto')}</th>
                      <th>{t('hc.horario_atencion', 'Horario Atención')}</th>
                      <th>{t('hc4.encargado', 'Encargado')}</th>
                      <th>{t('hc4.cobro_efectivo', 'Cobro Efectivo')}</th>
                      <th>{t('hc4.flota_capacidad', 'Flota / Capacidad')}</th>
                      <th>{t('hc4.estado', 'Estado')}</th>
                      <th>{t('hc4.acciones', 'Acciones')}</th>
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
                              {branch.horario}
                            </span>
                          </td>

                          <td>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--city-text, #0f172a)' }}>
                              {branchManagementService.managerName(branch) || t('hc2.sin_asignar', 'Sin asignar')}
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
                                Máx. capacidad: {branch.capacidadVehiculos}
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
                              {esActiva ? t('hc5.active_f', 'Activa') : t('hc5.inactive_f', 'Inactiva')}
                            </span>
                          </td>

                          <td>
                            <div className="cities-row-actions">
                              <button type="button" onClick={() => openEdit(branch)} title={t('hc.editar_sucursal', 'Editar Sucursal')}>
                                <FaEdit />
                              </button>
                              <button className="is-danger" type="button" onClick={() => setModal({ type: 'delete', branch })} title={t('hc.eliminar_sucursal', 'Eliminar Sucursal')}>
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
        <BranchFormDeleteModal
          modal={modal}
          close={close}
          save={save}
          remove={remove}
          form={form}
          setForm={setForm}
          cities={cities}
          managers={managers}
          error={error}
          t={t}
        />
      </main>
    </div>
  )
}
