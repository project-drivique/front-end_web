import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaCar, FaEdit, FaFileAlt, FaFileExcel, FaFilePdf, FaGift, FaInfoCircle, FaPlus, FaPrint, FaRegStar, FaSearch, FaStar, FaTag, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa'
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
  tipoOferta: 'cupon',
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
  destacada: false,
}

export default function PromotionManagementPage() {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const [promotions, setPromotions] = useState(() => promotionManagementService.list())
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [offerTypeFilter, setOfferTypeFilter] = useState('all')
  const [featuredFilter, setFeaturedFilter] = useState('all')
  const [modal, setModal] = useState(null)
  const [conditionsModal, setConditionsModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return promotions.filter(
      (item) =>
        (status === 'all' || (status === 'active') === item.activa) &&
        (type === 'all' || item.tipoDescuento === type) &&
        (offerTypeFilter === 'all' || item.tipoOferta === offerTypeFilter) &&
        (featuredFilter === 'all' || (featuredFilter === 'featured' ? item.destacada : !item.destacada)) &&
        (!term || `${item.codigo} ${item.nombre} ${item.condiciones} ${item.vehiculoNombre || ''} ${item.categoriaVehiculo || ''}`.toLowerCase().includes(term))
    )
  }, [promotions, search, status, type, offerTypeFilter, featuredFilter])

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
    'Tipo',
    t('admin.promotions.fields.code', 'Código'),
    t('admin.promotions.fields.name', 'Nombre'),
    'Audiencia',
    'Condiciones',
    'Alcance / Vehículo',
    t('admin.promotions.fields.discount', 'Descuento'),
    t('admin.promotions.fields.validity', 'Vigencia'),
    'Destacada',
    t('admin.promotions.fields.status', 'Estado'),
  ]
  const rows = filtered.map((item) => [
    item.tipoOferta === 'promocion' ? 'Promoción' : 'Cupón',
    item.codigo,
    item.nombre,
    item.audiencia === 'new_users' ? 'Nuevos usuarios' : item.audiencia === 'frequent' ? 'Clientes frecuentes' : 'Todos los usuarios',
    item.condiciones || '—',
    labelTarget(item),
    labelDiscount(item),
    `${item.fechaInicio} — ${item.fechaFin}`,
    item.destacada ? 'Sí (Destacada)' : 'No',
    t(item.activa ? 'admin.promotions.active' : 'admin.promotions.inactive'),
  ])
  const exportData = { title: t('admin.promotions.exportTitle', 'Promociones y Cupones - Drivique'), headers, rows, filename: 'promociones-cupones-drivique' }

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
      tipoOferta: promotion.tipoOferta || 'cupon',
      destacada: Boolean(promotion.destacada),
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
      setNotice(t(modal.promotion ? 'admin.promotions.messages.updated' : 'admin.promotions.messages.created', 'Oferta guardada exitosamente.'))
      closeModal()
    } catch (caught) {
      setError(t(`admin.promotions.errors.${caught.message}`, caught.message))
    }
  }

  const toggle = (promotion) => {
    promotionManagementService.toggle(promotion.id, user)
    refresh()
    setNotice(t(promotion.activa ? 'admin.promotions.messages.deactivated' : 'admin.promotions.messages.activated', 'Estado actualizado.'))
  }

  const toggleFeatured = (promotion) => {
    promotionManagementService.toggleFeatured(promotion.id, user)
    refresh()
    setNotice(promotion.destacada ? 'Oferta quitada de destacadas' : 'Oferta marcada como destacada')
  }

  const remove = () => {
    promotionManagementService.remove(modal.promotion.id, user)
    refresh()
    setNotice(t('admin.promotions.messages.deleted', 'Oferta eliminada.'))
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
              <p className="cities-eyebrow">{t('admin.management', 'Gestión')}</p>
              <h1>{t('admin.promotions.title', 'Promociones y Cupones')}</h1>
              <p className="cities-subtitle">{t('admin.promotions.subtitle', 'Crea campañas controladas y gestiona cupones y promociones para usuarios.')}</p>
            </div>
            <div className="cities-topbar__actions">
              <MenuConfiguracion />
              <button className="cities-primary" type="button" onClick={openCreate}>
                <FaPlus /> {t('admin.promotions.create', 'Nueva oferta')}
              </button>
            </div>
          </header>
          {notice && (
            <div className="cities-notice" role="status">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice('')} aria-label={t('common.close', 'Cerrar')}>
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
                  placeholder={t('admin.promotions.search', 'Buscar por código, nombre o condición...')}
                />
              </label>

              {/* Filtro por Clasificación: Cupones vs Promociones */}
              <select
                value={offerTypeFilter}
                onChange={(event) => setOfferTypeFilter(event.target.value)}
                aria-label="Filtrar por clasificación"
                style={{ fontWeight: 600 }}
              >
                <option value="all">Todos los registros (Cupones y Promos)</option>
                <option value="cupon">Solo Cupones</option>
                <option value="promocion">Solo Promociones</option>
              </select>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                aria-label={t('admin.promotions.filterStatus', 'Estado')}
              >
                <option value="all">{t('admin.promotions.allStatuses', 'Todos los estados')}</option>
                <option value="active">{t('admin.promotions.active', 'Activas')}</option>
                <option value="inactive">{t('admin.promotions.inactive', 'Inactivas')}</option>
              </select>
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                aria-label={t('admin.promotions.filterType', 'Tipo de descuento')}
              >
                <option value="all">{t('admin.promotions.allTypes', 'Todos los descuentos')}</option>
                <option value="porcentaje">{t('admin.promotions.types.percentage', 'Porcentaje')}</option>
                <option value="fijo">{t('admin.promotions.types.fixed', 'Monto fijo')}</option>
              </select>
              <select
                value={featuredFilter}
                onChange={(event) => setFeaturedFilter(event.target.value)}
                aria-label="Filtrar por destacada"
              >
                <option value="all">Todas las visibilidades</option>
                <option value="featured">Solo Destacadas</option>
                <option value="not_featured">No destacadas</option>
              </select>
              <div className="cities-export">
                <button type="button" onClick={() => exportExcel(exportData)}>
                  <FaFileExcel /> Excel
                </button>
                <button type="button" onClick={() => exportPdf(exportData)}>
                  <FaFilePdf /> PDF
                </button>
                <button type="button" onClick={() => printTable(exportData)}>
                  <FaPrint /> {t('admin.promotions.print', 'Imprimir')}
                </button>
              </div>
            </div>
            <div className="cities-summary">
              <strong>{filtered.length}</strong> {t('admin.promotions.results', { count: filtered.length, defaultValue: 'registros encontrados' })}
            </div>
            {!filtered.length ? (
              <div className="cities-empty">
                <FaGift />
                <h2>{t('admin.promotions.emptyTitle', 'No hay registros')}</h2>
                <p>{t('admin.promotions.emptyText', 'Crea una oferta o cupón para publicarlo.')}</p>
              </div>
            ) : (
              <div className="cities-table-wrap">
                <table className="promotions-mgmt-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>{t('admin.promotions.fields.code', 'Código')}</th>
                      <th>{t('admin.promotions.fields.name', 'Nombre')}</th>
                      <th>Audiencia</th>
                      <th>Condiciones</th>
                      <th>Alcance / Vehículo</th>
                      <th>{t('admin.promotions.fields.discount', 'Descuento')}</th>
                      <th>{t('admin.promotions.fields.validity', 'Vigencia')}</th>
                      <th>Destacada</th>
                      <th>{t('admin.promotions.fields.status', 'Estado')}</th>
                      <th>{t('admin.promotions.fields.actions', 'Acciones')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span className={`offer-type-badge ${item.tipoOferta || 'cupon'}`}>
                            {item.tipoOferta === 'promocion' ? 'Promoción' : 'Cupón'}
                          </span>
                        </td>
                        <td>
                          <div className="cities-name">
                            <span>
                              {item.tipoOferta === 'promocion' ? <FaCar size={13} /> : <FaTag size={12} />}
                            </span>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <strong style={{ color: 'var(--city-text, #0f172a)' }}>{item.codigo}</strong>
                                {item.destacada && (
                                  <span className="promotion-destacada-badge">
                                    DESTACADA
                                  </span>
                                )}
                              </div>
                              <small style={{ color: 'var(--city-muted, #64748b)' }}>{item.id}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong style={{ display: 'block', fontSize: 13.5, color: 'var(--city-text, #0f172a)' }}>{item.nombre}</strong>
                        </td>
                        <td>
                          <span style={{ fontSize: 12.5, color: 'var(--city-text, #0f172a)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            {item.audiencia === 'new_users'
                              ? 'Nuevos usuarios'
                              : item.audiencia === 'frequent'
                              ? 'Clientes frecuentes'
                              : t(`admin.promotions.audiences.${item.audiencia}`, 'Todos los usuarios')}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 260 }}>
                            <span style={{ fontSize: 12.5, color: 'var(--city-text, #0f172a)', lineHeight: 1.45 }}>
                              {item.condiciones || 'Sin condiciones específicas'}
                            </span>
                            {item.condiciones && (
                              <button
                                type="button"
                                onClick={() => setConditionsModal(item)}
                                className="promotion-conditions-btn"
                              >
                                <FaInfoCircle size={11} />
                                <span>Ver detalle</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td>
                          {item.vehiculoId || item.vehiculoNombre ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {item.vehiculoImagen || VEHICULOS_MOCK.find(v => (item.vehiculoId && Number(v.id) === Number(item.vehiculoId)) || (item.vehiculoNombre && v.nombre === item.vehiculoNombre))?.imagenes?.[0] ? (
                                <img
                                  src={item.vehiculoImagen || VEHICULOS_MOCK.find(v => (item.vehiculoId && Number(v.id) === Number(item.vehiculoId)) || (item.vehiculoNombre && v.nombre === item.vehiculoNombre))?.imagenes?.[0]}
                                  alt={labelTarget(item)}
                                  style={{ width: 46, height: 32, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--city-border, #cbd5e1)', flexShrink: 0 }}
                                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                                />
                              ) : (
                                <span style={{ width: 46, height: 32, borderRadius: 8, background: 'var(--adm-card-alt, #f1f5f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--adm-muted, #475569)', flexShrink: 0 }}>
                                  <FaCar size={15} />
                                </span>
                              )}
                              <div>
                                <strong style={{ display: 'block', fontSize: 13, color: 'var(--city-text, #0f172a)' }}>{labelTarget(item)}</strong>
                                <small style={{ color: 'var(--city-muted, #64748b)', fontSize: 11 }}>Vehículo específico</small>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ width: 34, height: 26, borderRadius: 6, background: 'var(--adm-card-alt, #f1f5f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--adm-muted, #475569)', flexShrink: 0 }}>
                                <FaCar size={13} />
                              </span>
                              <span style={{ fontWeight: 500, fontSize: 12, color: 'var(--city-text, #0f172a)' }}>{labelTarget(item)}</span>
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="promotion-discount">{labelDiscount(item)}</span>
                        </td>
                        <td>
                          <span style={{ color: 'var(--city-text, #0f172a)' }}>{item.fechaInicio}</span>
                          <br />
                          <small style={{ color: 'var(--city-muted, #64748b)' }}>{item.fechaFin}</small>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="promotion-toggle-btn"
                            onClick={() => toggleFeatured(item)}
                            title={item.destacada ? 'Quitar de destacadas' : 'Marcar como destacada'}
                          >
                            {item.destacada ? <FaStar color="#f59e0b" size={13} /> : <FaRegStar color="#94a3b8" size={13} />}
                            <span>{item.destacada ? 'Destacada' : 'Normal'}</span>
                          </button>
                        </td>
                        <td>
                          <span className={`cities-status ${item.activa ? 'is-yes' : ''}`}>
                            {t(item.activa ? 'admin.promotions.active' : 'admin.promotions.inactive', item.activa ? 'Activa' : 'Inactiva')}
                          </span>
                        </td>
                        <td>
                          <div className="cities-row-actions">
                            <button
                              type="button"
                              onClick={() => toggle(item)}
                              aria-label={t(item.activa ? 'admin.promotions.deactivate' : 'admin.promotions.activate', 'Cambiar estado')}
                            >
                              {item.activa ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                            <button type="button" onClick={() => openEdit(item)} aria-label={t('common.edit', 'Editar')}>
                              <FaEdit />
                            </button>
                            <button
                              className="is-danger"
                              type="button"
                              onClick={() => setModal({ type: 'delete', promotion: item })}
                              aria-label={t('common.delete', 'Eliminar')}
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

      {conditionsModal && (
        <div
          className="cities-modal-backdrop"
          onMouseDown={(event) => event.target === event.currentTarget && setConditionsModal(null)}
        >
          <section className="cities-modal promotion-modal" style={{ maxWidth: 480 }} role="dialog" aria-modal="true">
            <div className="cities-modal__head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(var(--brand-primary-rgb, 37,99,235), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary, #2563eb)' }}>
                  <FaFileAlt size={18} />
                </div>
                <div>
                  <p className="cities-eyebrow">Detalles y Términos</p>
                  <h2 style={{ fontSize: 18 }}>Condiciones de la Oferta</h2>
                </div>
              </div>
              <button type="button" onClick={() => setConditionsModal(null)}>
                ×
              </button>
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--city-soft, rgba(0,0,0,0.03))', borderRadius: 12, padding: '12px 16px', border: '1px solid var(--city-border, #e2e8f0)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <strong style={{ fontSize: 15, color: 'var(--city-text)' }}>{conditionsModal.codigo}</strong>
                  </div>
                  <span className="promotion-discount">{labelDiscount(conditionsModal)}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--city-muted, #64748b)' }}>{conditionsModal.nombre}</p>
              </div>

              <div>
                <strong style={{ fontSize: 13, display: 'block', marginBottom: 6, color: 'var(--city-text)' }}>
                  Texto de condiciones configurado:
                </strong>
                <div style={{ background: '#fff', border: '1px solid var(--city-border, #cbd5e1)', borderRadius: 10, padding: 14, fontSize: 13, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {conditionsModal.condiciones || 'No se han especificado condiciones especiales para esta promoción.'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                <div style={{ padding: 10, borderRadius: 8, background: 'var(--city-soft, rgba(0,0,0,0.02))', border: '1px solid var(--city-border, #e2e8f0)' }}>
                  <span style={{ color: 'var(--city-muted, #64748b)', display: 'block' }}>Vigencia:</span>
                  <strong>{conditionsModal.fechaInicio} al {conditionsModal.fechaFin}</strong>
                </div>
                <div style={{ padding: 10, borderRadius: 8, background: 'var(--city-soft, rgba(0,0,0,0.02))', border: '1px solid var(--city-border, #e2e8f0)' }}>
                  <span style={{ color: 'var(--city-muted, #64748b)', display: 'block' }}>Monto Mínimo:</span>
                  <strong>{conditionsModal.reservaMinima > 0 ? `$${Number(conditionsModal.reservaMinima).toLocaleString('es-CO')}` : 'Sin mínimo'}</strong>
                </div>
                <div style={{ padding: 10, borderRadius: 8, background: 'var(--city-soft, rgba(0,0,0,0.02))', border: '1px solid var(--city-border, #e2e8f0)' }}>
                  <span style={{ color: 'var(--city-muted, #64748b)', display: 'block' }}>Alcance:</span>
                  <strong>{labelTarget(conditionsModal)}</strong>
                </div>
                <div style={{ padding: 10, borderRadius: 8, background: 'var(--city-soft, rgba(0,0,0,0.02))', border: '1px solid var(--city-border, #e2e8f0)' }}>
                  <span style={{ color: 'var(--city-muted, #64748b)', display: 'block' }}>Clasificación:</span>
                  <strong>{conditionsModal.tipoOferta === 'promocion' ? 'Promoción' : 'Cupón'} {conditionsModal.destacada ? '• Destacada' : ''}</strong>
                </div>
              </div>
            </div>
            <div className="cities-modal__actions" style={{ padding: '12px 24px 20px' }}>
              <button
                type="button"
                onClick={() => {
                  const target = conditionsModal
                  setConditionsModal(null)
                  openEdit(target)
                }}
              >
                <FaEdit /> Editar Condiciones
              </button>
              <button className="cities-primary" type="button" onClick={() => setConditionsModal(null)}>
                Cerrar
              </button>
            </div>
          </section>
        </div>
      )}

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
                    <p className="cities-eyebrow">{t('admin.promotions.formLabel', 'Gestión de Campaña')}</p>
                    <h2>{t(modal.promotion ? 'admin.promotions.editTitle' : 'admin.promotions.createTitle', modal.promotion ? 'Editar Oferta' : 'Crear Oferta')}</h2>
                  </div>
                  <button type="button" onClick={closeModal}>
                    ×
                  </button>
                </div>
                <form onSubmit={save}>
                  <div className="promotion-form-grid">
                    
                    {/* Selector de Clasificación: Cupón vs Promoción */}
                    <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--city-text)', margin: 0 }}>
                        Tipo de Oferta / Clasificación *
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, tipoOferta: 'cupon' })}
                          style={{
                            padding: '12px 14px',
                            borderRadius: 12,
                            border: `2px solid ${form.tipoOferta === 'cupon' ? 'var(--brand-primary, #2563eb)' : 'var(--city-border, #cbd5e1)'}`,
                            background: form.tipoOferta === 'cupon' ? 'var(--brand-soft-light, #eff6ff)' : '#ffffff',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10,
                            transition: 'all 0.2s',
                          }}
                        >
                          <span style={{ fontSize: 16, marginTop: 2, color: 'var(--brand-primary, #2563eb)' }}><FaTag /></span>
                          <div>
                            <strong style={{ display: 'block', fontSize: 13.5, color: form.tipoOferta === 'cupon' ? 'var(--brand-primary, #2563eb)' : '#0f172a' }}>
                              Cupón de Descuento
                            </strong>
                            <small style={{ color: '#64748b', fontSize: 11, lineHeight: 1.3, display: 'block', marginTop: 2 }}>
                              Código de canje visible en pestaña "Más cupones geniales" y aplicable en checkout.
                            </small>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setForm({ ...form, tipoOferta: 'promocion' })}
                          style={{
                            padding: '12px 14px',
                            borderRadius: 12,
                            border: `2px solid ${form.tipoOferta === 'promocion' ? 'var(--brand-primary, #2563eb)' : 'var(--city-border, #cbd5e1)'}`,
                            background: form.tipoOferta === 'promocion' ? 'var(--brand-soft-light, #eff6ff)' : '#ffffff',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10,
                            transition: 'all 0.2s',
                          }}
                        >
                          <span style={{ fontSize: 16, marginTop: 2, color: 'var(--brand-primary, #2563eb)' }}><FaCar /></span>
                          <div>
                            <strong style={{ display: 'block', fontSize: 13.5, color: form.tipoOferta === 'promocion' ? 'var(--brand-primary, #2563eb)' : '#0f172a' }}>
                              Promoción de Catálogo
                            </strong>
                            <small style={{ color: '#64748b', fontSize: 11, lineHeight: 1.3, display: 'block', marginTop: 2 }}>
                              Oferta comercial con precio rebajado en "Promociones destacadas" con botón de reserva.
                            </small>
                          </div>
                        </button>
                      </div>
                    </div>

                    <label>
                      {t('admin.promotions.fields.code', 'Código')}
                      <input
                        autoFocus
                        value={form.codigo}
                        maxLength={24}
                        onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                        placeholder="EJ: SUV20, VERANO15, BONO50K"
                      />
                    </label>
                    <label>
                      {t('admin.promotions.fields.name', 'Nombre')}
                      <input
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        placeholder="Nombre descriptivo de la campaña"
                      />
                    </label>
                    <label>
                      {t('admin.promotions.fields.type', 'Tipo de descuento')}
                      <select
                        value={form.tipoDescuento}
                        onChange={(e) => setForm({ ...form, tipoDescuento: e.target.value })}
                      >
                        <option value="porcentaje">{t('admin.promotions.types.percentage', 'Porcentaje (%)')}</option>
                        <option value="fijo">{t('admin.promotions.types.fixed', 'Monto fijo ($ COP)')}</option>
                      </select>
                    </label>
                    <label>
                      {t('admin.promotions.fields.value', 'Valor descuento')}
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
                      {t('admin.promotions.fields.category', 'Categoría')}
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
                    {form.vehiculoId && (() => {
                      const selectedV = VEHICULOS_MOCK.find((v) => Number(v.id) === Number(form.vehiculoId))
                      const imgUrl = selectedV?.imagenes?.[0]
                      if (!imgUrl) return null
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--city-soft, rgba(0,0,0,0.03))', borderRadius: 12, border: '1px solid var(--city-border, #e2e8f0)', marginTop: -6, marginBottom: 6 }}>
                          <img src={imgUrl} alt={selectedV.nombre} style={{ width: 64, height: 42, borderRadius: 8, objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                          <div>
                            <strong style={{ display: 'block', fontSize: 13 }}>{selectedV.nombre}</strong>
                            <small style={{ color: 'var(--city-muted, #64748b)', fontSize: 11 }}>{selectedV.categoria} • {selectedV.placa}</small>
                          </div>
                        </div>
                      )
                    })()}
                    <label>
                      {t('admin.promotions.fields.start', 'Fecha inicio')}
                      <input
                        type="date"
                        value={form.fechaInicio}
                        onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                      />
                    </label>
                    <label>
                      {t('admin.promotions.fields.end', 'Fecha fin')}
                      <input
                        type="date"
                        value={form.fechaFin}
                        onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                      />
                    </label>
                    <label>
                      {t('admin.promotions.fields.minimum', 'Reserva mínima ($ COP)')}
                      <input
                        type="number"
                        min="0"
                        value={form.reservaMinima}
                        onChange={(e) => setForm({ ...form, reservaMinima: e.target.value })}
                        placeholder="0 para sin mínimo"
                      />
                    </label>
                    <label>
                      {t('admin.promotions.fields.audience', 'Audiencia')}
                      <select
                        value={form.audiencia}
                        onChange={(e) => setForm({ ...form, audiencia: e.target.value })}
                      >
                        <option value="todos">{t('admin.promotions.audiences.todos', 'Todos los usuarios')}</option>
                        <option value="nuevos">{t('admin.promotions.audiences.nuevos', 'Nuevos usuarios')}</option>
                        <option value="frecuentes">{t('admin.promotions.audiences.frecuentes', 'Usuarios frecuentes')}</option>
                      </select>
                    </label>
                    
                    {/* Switch / Checkbox Destacada */}
                    <div style={{ gridColumn: 'span 2', padding: '12px 16px', background: form.destacada ? 'var(--brand-soft-light, #eff6ff)' : 'rgba(0,0,0,0.02)', border: `1.5px solid ${form.destacada ? 'var(--brand-border, #bfdbfe)' : 'var(--city-border, #cbd5e1)'}`, borderRadius: 12, transition: 'all 0.2s' }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={form.destacada}
                          onChange={(e) => setForm({ ...form, destacada: e.target.checked })}
                          style={{ marginTop: 3, width: 18, height: 18, accentColor: 'var(--brand-primary, #2563eb)' }}
                        />
                        <div>
                          <strong style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: form.destacada ? 'var(--brand-primary, #2563eb)' : 'var(--city-text)' }}>
                            <FaStar color={form.destacada ? 'var(--brand-primary, #2563eb)' : '#94a3b8'} /> Marcar como Oferta Destacada
                          </strong>
                          <span style={{ display: 'block', fontSize: 12, color: form.destacada ? 'var(--brand-primary, #2563eb)' : 'var(--city-muted, #64748b)', marginTop: 2 }}>
                            Aparecerá con distintivo destacado prioritario en la vista de promociones y catálogo.
                          </span>
                        </div>
                      </label>
                    </div>

                    <label className="promotion-active" style={{ gridColumn: 'span 2' }}>
                      <input
                        type="checkbox"
                        checked={form.activa}
                        onChange={(e) => setForm({ ...form, activa: e.target.checked })}
                      />{' '}
                      {t('admin.promotions.publishActive', 'Publicar oferta como Activa')}
                    </label>
                  </div>
                  <label>
                    {t('admin.promotions.fields.conditions', 'Condiciones')}
                    <textarea
                      value={form.condiciones}
                      onChange={(e) => setForm({ ...form, condiciones: e.target.value })}
                      placeholder="Términos, condiciones y detalles de aplicación..."
                      rows={4}
                    />
                  </label>
                  {error && <p className="cities-error">{error}</p>}
                  <div className="cities-modal__actions">
                    <button type="button" onClick={closeModal}>
                      {t('common.cancel', 'Cancelar')}
                    </button>
                    <button className="cities-primary" type="submit">
                      {t('common.save', 'Guardar')}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="cities-delete-icon">
                  <FaTrash />
                </div>
                <h2>{t('admin.promotions.deleteTitle', 'Eliminar Oferta')}</h2>
                <p>{t('admin.promotions.deleteText', { code: modal.promotion.codigo })}</p>
                <div className="cities-modal__actions">
                  <button type="button" onClick={closeModal}>
                    {t('common.cancel', 'Cancelar')}
                  </button>
                  <button className="cities-danger" type="button" onClick={remove}>
                    {t('common.delete', 'Eliminar')}
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
