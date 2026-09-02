import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaCar, FaEdit, FaFileExcel, FaFilePdf, FaGift, FaPlus, FaPrint, FaSearch, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { promotionManagementService } from '../../../services/promotionManagementService'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import VEHICULOS_MOCK from '../../../mocks/vehicles.json'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './PromotionManagementPage.css'

const today = () => new Date().toISOString().slice(0, 10)
const EMPTY_FORM = {
  codigo: '',
  nombre: '',
  tipoDescuento: 'porcentaje',
  valorDescuento: '',
  fechaInicio: today(),
  fechaFin: '',
  reservaMinima: 0,
  categoriaVehiculo: 'Todos',
  vehiculoId: '',
  vehiculoNombre: '',
  audiencia: 'todos',
  condiciones: '',
  activa: true,
}

export default function PromotionManagementPage() {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const [promotions, setPromotions] = useState(() => promotionManagementService.list())
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return promotions.filter(
      (item) =>
        (status === 'all' || (status === 'active') === item.activa) &&
        (type === 'all' || item.tipoDescuento === type) &&
        (!term || `${item.codigo} ${item.nombre} ${item.condiciones} ${item.vehiculoNombre || ''} ${item.categoriaVehiculo || ''}`.toLowerCase().includes(term))
    )
  }, [promotions, search, status, type])

  const labelDiscount = (item) =>
    item.tipoDescuento === 'porcentaje'
      ? `${item.valorDescuento}%`
      : `$${Number(item.valorDescuento).toLocaleString('es-CO')}`

  const labelTarget = (item) => {
    if (item.vehiculoNombre) return item.vehiculoNombre
    if (item.categoriaVehiculo && item.categoriaVehiculo !== 'Todos') return `Categoría: ${item.categoriaVehiculo}`
    return 'Todos los vehículos'
  }

  const headers = [
    t('admin.promotions.fields.code'),
    t('admin.promotions.fields.name'),
    'Alcance / Vehículo',
    t('admin.promotions.fields.discount'),
    t('admin.promotions.fields.validity'),
    t('admin.promotions.fields.audience'),
    t('admin.promotions.fields.status'),
  ]
  const rows = filtered.map((item) => [
    item.codigo,
    item.nombre,
    labelTarget(item),
    labelDiscount(item),
    `${item.fechaInicio} — ${item.fechaFin}`,
    t(`admin.promotions.audiences.${item.audiencia}`),
    t(item.activa ? 'admin.promotions.active' : 'admin.promotions.inactive'),
  ])
  const exportData = { title: t('admin.promotions.exportTitle'), headers, rows, filename: 'promociones-drivique' }

  const refresh = () => setPromotions(promotionManagementService.list())
  const closeModal = () => {
    setModal(null)
    setError('')
  }
  const openCreate = () => {
    setForm(EMPTY_FORM)
    setError('')
    setModal({ type: 'form' })
  }
  const openEdit = (promotion) => {
    setForm({
      ...promotion,
      vehiculoId: promotion.vehiculoId || '',
      vehiculoNombre: promotion.vehiculoNombre || '',
      categoriaVehiculo: promotion.categoriaVehiculo || 'Todos',
    })
    setError('')
    setModal({ type: 'form', promotion })
  }

  const save = (event) => {
    event.preventDefault()
    try {
      modal.promotion
        ? promotionManagementService.update(modal.promotion.id, form, user)
        : promotionManagementService.create(form, user)
      refresh()
      setNotice(t(modal.promotion ? 'admin.promotions.messages.updated' : 'admin.promotions.messages.created'))
      closeModal()
    } catch (caught) {
      setError(t(`admin.promotions.errors.${caught.message}`, caught.message))
    }
  }

  const toggle = (promotion) => {
    promotionManagementService.toggle(promotion.id, user)
    refresh()
    setNotice(t(promotion.activa ? 'admin.promotions.messages.deactivated' : 'admin.promotions.messages.activated'))
  }

  const remove = () => {
    promotionManagementService.remove(modal.promotion.id, user)
    refresh()
    setNotice(t('admin.promotions.messages.deleted'))
    closeModal()
  }

  const vehiculosFiltrados = useMemo(() => {
    if (!form.categoriaVehiculo || form.categoriaVehiculo === 'Todos') return VEHICULOS_MOCK
    return VEHICULOS_MOCK.filter((v) => v.categoria?.toLowerCase() === form.categoriaVehiculo.toLowerCase())
  }, [form.categoriaVehiculo])

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar />
      <main className="management-main" style={{ padding: '24px 32px' }}>
        <div className="cities-container" style={{ maxWidth: '100%' }}>
          <header className="cities-topbar">
            <div>
              <p className="cities-eyebrow">{t('admin.management')}</p>
              <h1>{t('admin.promotions.title')}</h1>
              <p className="cities-subtitle">{t('admin.promotions.subtitle')}</p>
            </div>
            <div className="cities-topbar__actions">
              <MenuConfiguracion />
              <button className="cities-primary" type="button" onClick={openCreate}>
                <FaPlus /> {t('admin.promotions.create')}
              </button>
            </div>
          </header>
          {notice && (
            <div className="cities-notice" role="status">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice('')} aria-label={t('common.close')}>
                ×
              </button>
            </div>
          )}
          <section className="cities-card">
            <div className="cities-toolbar">
              <label className="cities-search">
                <FaSearch />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('admin.promotions.search')}
                />
              </label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                aria-label={t('admin.promotions.filterStatus')}
              >
                <option value="all">{t('admin.promotions.allStatuses')}</option>
                <option value="active">{t('admin.promotions.active')}</option>
                <option value="inactive">{t('admin.promotions.inactive')}</option>
              </select>
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                aria-label={t('admin.promotions.filterType')}
              >
                <option value="all">{t('admin.promotions.allTypes')}</option>
                <option value="porcentaje">{t('admin.promotions.types.percentage')}</option>
                <option value="fijo">{t('admin.promotions.types.fixed')}</option>
              </select>
              <div className="cities-export">
                <button type="button" onClick={() => exportExcel(exportData)}>
                  <FaFileExcel /> Excel
                </button>
                <button type="button" onClick={() => exportPdf(exportData)}>
                  <FaFilePdf /> PDF
                </button>
                <button type="button" onClick={() => printTable(exportData)}>
                  <FaPrint /> {t('admin.promotions.print')}
                </button>
              </div>
            </div>
            <div className="cities-summary">
              <strong>{filtered.length}</strong> {t('admin.promotions.results', { count: filtered.length })}
            </div>
            {!filtered.length ? (
              <div className="cities-empty">
                <FaGift />
                <h2>{t('admin.promotions.emptyTitle')}</h2>
                <p>{t('admin.promotions.emptyText')}</p>
              </div>
            ) : (
              <div className="cities-table-wrap">
                <table>
                  <thead>
                    <tr>
                      {headers.map((header) => (
                        <th key={header}>{header}</th>
                      ))}
                      <th>{t('admin.promotions.fields.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="cities-name">
                            <span>
                              <FaGift />
                            </span>
                            <div>
                              <strong>{item.codigo}</strong>
                              <small>{item.id}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{item.nombre}</strong>
                          <small className="promotion-condition">{item.condiciones}</small>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: '12px', color: item.vehiculoNombre ? 'var(--brand-primary)' : 'inherit' }}>
                            {item.vehiculoNombre ? <FaCar /> : null}
                            {labelTarget(item)}
                          </span>
                        </td>
                        <td>
                          <span className="promotion-discount">{labelDiscount(item)}</span>
                        </td>
                        <td>
                          {item.fechaInicio}
                          <br />
                          <small>{item.fechaFin}</small>
                        </td>
                        <td>{t(`admin.promotions.audiences.${item.audiencia}`)}</td>
                        <td>
                          <span className={`cities-status ${item.activa ? 'is-yes' : ''}`}>
                            {t(item.activa ? 'admin.promotions.active' : 'admin.promotions.inactive')}
                          </span>
                        </td>
                        <td>
                          <div className="cities-row-actions">
                            <button
                              type="button"
                              onClick={() => toggle(item)}
                              aria-label={t(item.activa ? 'admin.promotions.deactivate' : 'admin.promotions.activate')}
                            >
                              {item.activa ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                            <button type="button" onClick={() => openEdit(item)} aria-label={t('common.edit')}>
                              <FaEdit />
                            </button>
                            <button
                              className="is-danger"
                              type="button"
                              onClick={() => setModal({ type: 'delete', promotion: item })}
                              aria-label={t('common.delete')}
                            >
                              <FaTrash />
                            </button>
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
      </main>

      {modal && (
        <div
          className="cities-modal-backdrop"
          onMouseDown={(event) => event.target === event.currentTarget && closeModal()}
        >
          <section className="cities-modal promotion-modal" role="dialog" aria-modal="true">
            {modal.type === 'form' ? (
              <>
                <div className="cities-modal__head">
                  <div>
                    <p className="cities-eyebrow">{t('admin.promotions.formLabel')}</p>
                    <h2>{t(modal.promotion ? 'admin.promotions.editTitle' : 'admin.promotions.createTitle')}</h2>
                  </div>
                  <button type="button" onClick={closeModal}>
                    ×
                  </button>
                </div>
                <form onSubmit={save}>
                  <div className="promotion-form-grid">
                    <label>
                      {t('admin.promotions.fields.code')}
                      <input
                        autoFocus
                        value={form.codigo}
                        maxLength={24}
                        onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                        placeholder="EJ: SUV20, VERANO15"
                      />
                    </label>
                    <label>
                      {t('admin.promotions.fields.name')}
                      <input
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        placeholder="Nombre descriptivo de la promoción"
                      />
                    </label>
                    <label>
                      {t('admin.promotions.fields.type')}
                      <select
                        value={form.tipoDescuento}
                        onChange={(e) => setForm({ ...form, tipoDescuento: e.target.value })}
                      >
                        <option value="porcentaje">{t('admin.promotions.types.percentage')}</option>
                        <option value="fijo">{t('admin.promotions.types.fixed')}</option>
                      </select>
                    </label>
                    <label>
                      {t('admin.promotions.fields.value')}
                      <input
                        type="number"
                        min="1"
                        max={form.tipoDescuento === 'porcentaje' ? 100 : undefined}
                        value={form.valorDescuento}
                        onChange={(e) => setForm({ ...form, valorDescuento: e.target.value })}
                        placeholder={form.tipoDescuento === 'porcentaje' ? 'Ej: 20' : 'Ej: 50000'}
                      />
                    </label>
                    <label>
                      {t('admin.promotions.fields.category')}
                      <select
                        value={form.categoriaVehiculo}
                        onChange={(e) => {
                          const cat = e.target.value
                          setForm({ ...form, categoriaVehiculo: cat, vehiculoId: '', vehiculoNombre: '' })
                        }}
                      >
                        {['Todos', 'SUV', 'Sedan', 'Compacto', 'Camioneta', 'Deportivo', 'Económico'].map(
                          (category) => (
                            <option key={category} value={category}>
                              {t(`promotions.categories.${category}`, category)}
                            </option>
                          )
                        )}
                      </select>
                    </label>
                    <label>
                      Vehículo Específico (Opcional)
                      <select
                        value={form.vehiculoId || ''}
                        onChange={(e) => {
                          const vId = e.target.value
                          const selectedVeh = VEHICULOS_MOCK.find((v) => String(v.id) === String(vId))
                          setForm({
                            ...form,
                            vehiculoId: vId ? Number(vId) : '',
                            vehiculoNombre: selectedVeh ? selectedVeh.nombre : '',
                            categoriaVehiculo: selectedVeh ? selectedVeh.categoria : form.categoriaVehiculo,
                          })
                        }}
                      >
                        <option value="">Cualquier vehículo {form.categoriaVehiculo !== 'Todos' ? `de categoría ${form.categoriaVehiculo}` : 'del catálogo'}</option>
                        {vehiculosFiltrados.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.nombre} ({v.categoria})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {t('admin.promotions.fields.start')}
                      <input
                        type="date"
                        value={form.fechaInicio}
                        onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                      />
                    </label>
                    <label>
                      {t('admin.promotions.fields.end')}
                      <input
                        type="date"
                        value={form.fechaFin}
                        onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                      />
                    </label>
                    <label>
                      {t('admin.promotions.fields.minimum')}
                      <input
                        type="number"
                        min="0"
                        value={form.reservaMinima}
                        onChange={(e) => setForm({ ...form, reservaMinima: e.target.value })}
                        placeholder="0 para sin mínimo"
                      />
                    </label>
                    <label>
                      {t('admin.promotions.fields.audience')}
                      <select
                        value={form.audiencia}
                        onChange={(e) => setForm({ ...form, audiencia: e.target.value })}
                      >
                        <option value="todos">{t('admin.promotions.audiences.todos')}</option>
                        <option value="nuevos">{t('admin.promotions.audiences.nuevos')}</option>
                        <option value="frecuentes">{t('admin.promotions.audiences.frecuentes')}</option>
                      </select>
                    </label>
                    <label className="promotion-active" style={{ gridColumn: 'span 2' }}>
                      <input
                        type="checkbox"
                        checked={form.activa}
                        onChange={(e) => setForm({ ...form, activa: e.target.checked })}
                      />{' '}
                      {t('admin.promotions.publishActive')}
                    </label>
                  </div>
                  <label>
                    {t('admin.promotions.fields.conditions')}
                    <textarea
                      value={form.condiciones}
                      onChange={(e) => setForm({ ...form, condiciones: e.target.value })}
                      placeholder="Términos, condiciones y detalles del cupón..."
                    />
                  </label>
                  {error && <p className="cities-error">{error}</p>}
                  <div className="cities-modal__actions">
                    <button type="button" onClick={closeModal}>
                      {t('common.cancel')}
                    </button>
                    <button className="cities-primary" type="submit">
                      {t('common.save')}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="cities-delete-icon">
                  <FaTrash />
                </div>
                <h2>{t('admin.promotions.deleteTitle')}</h2>
                <p>{t('admin.promotions.deleteText', { code: modal.promotion.codigo })}</p>
                <div className="cities-modal__actions">
                  <button type="button" onClick={closeModal}>
                    {t('common.cancel')}
                  </button>
                  <button className="cities-danger" type="button" onClick={remove}>
                    {t('common.delete')}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
