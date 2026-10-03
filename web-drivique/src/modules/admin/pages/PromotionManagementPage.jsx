import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaBuilding,
  FaTag,
  FaCar,
  FaStar,
  FaRegStar,
  FaToggleOn,
  FaToggleOff,
  FaInfoCircle,
  FaGift,
  FaCheckCircle,
  FaFileAlt,
  FaExclamationCircle,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { promotionManagementService } from '../../../services/promotionManagementService'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import { formatCurrency } from '../../../utils/currencyUtils'
import { showAlert } from '../../../utils/swalConfig'
import VEHICULOS_MOCK from '../../../mocks/vehicles.json'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './CashCollectionPage.css'
import './DocumentVerificationPage.css'
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
  const { tema, moneda, tasaUSD } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const esEncargado =
    user?.rol === 'encargado' ||
    user?.rol === 'encargado_sucursal' ||
    user?.rol === 'branch_manager'

  const [promotions, setPromotions] = useState(() => promotionManagementService.list())
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('todos')
  const [discountTypeFilter, setDiscountTypeFilter] = useState('all')

  const [modal, setModal] = useState(null)
  const [conditionsModal, setConditionsModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  const refresh = () => setPromotions(promotionManagementService.list())

  const totalPromociones = useMemo(() => promotions.length, [promotions])
  const totalActivas = useMemo(() => promotions.filter(p => p.activa).length, [promotions])
  const totalDestacadas = useMemo(() => promotions.filter(p => p.destacada).length, [promotions])
  const totalCupones = useMemo(() => promotions.filter(p => p.tipoOferta === 'cupon').length, [promotions])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return promotions.filter((item) => {
      // Filter by activeTab
      if (activeTab === 'cupones' && item.tipoOferta !== 'cupon') return false
      if (activeTab === 'promociones' && item.tipoOferta !== 'promocion') return false
      if (activeTab === 'activas' && !item.activa) return false
      if (activeTab === 'inactivas' && item.activa) return false
      if (activeTab === 'destacadas' && !item.destacada) return false

      // Filter by discountTypeFilter
      if (discountTypeFilter !== 'all' && item.tipoDescuento !== discountTypeFilter) return false

      // Search term
      if (term) {
        const fullText = `${item.codigo} ${item.nombre} ${item.condiciones || ''} ${item.vehiculoNombre || ''} ${item.categoriaVehiculo || ''}`.toLowerCase()
        if (!fullText.includes(term)) return false
      }

      return true
    })
  }, [promotions, search, activeTab, discountTypeFilter])

  const labelDiscount = (item) =>
    item.tipoDescuento === 'porcentaje'
      ? `${item.valorDescuento}%`
      : formatCurrency(item.valorDescuento, moneda, tasaUSD)

  const labelTarget = (item) => {
    if (item.vehiculoNombre) return item.vehiculoNombre
    if (item.categoriaVehiculo && item.categoriaVehiculo !== 'Todos') return `${t('admin.promotions.categoryPrefix', 'Categoría:')} ${item.categoriaVehiculo}`
    return t('admin.promotions.allVehicles', 'Todos los vehículos')
  }

  const exportData = useMemo(() => {
    return filtered.map((item, i) => [
      i + 1,
      item.tipoOferta === 'promocion' ? t('admin.promotions.offerTypes.promocion', 'Promoción') : t('admin.promotions.offerTypes.cupon', 'Cupón'),
      item.codigo,
      item.nombre,
      item.audiencia === 'nuevos' ? t('admin.promotions.audiences.nuevos', 'Nuevos usuarios') : item.audiencia === 'frecuentes' ? t('admin.promotions.audiences.frecuentes', 'Clientes frecuentes') : t('admin.promotions.audiences.todos', 'Todos los usuarios'),
      labelDiscount(item),
      item.reservaMinima > 0 ? formatCurrency(item.reservaMinima, moneda, tasaUSD) : t('admin.promotions.noMin', 'Sin mínimo'),
      labelTarget(item),
      item.fechaInicio || '-',
      item.fechaFin || '-',
      item.condiciones || t('admin.promotions.noCond', 'Sin condiciones'),
      item.destacada ? t('admin.promotions.featuredBadge.yes', 'Destacada') : t('admin.promotions.featuredBadge.no', 'Normal'),
      item.activa ? t('admin.promotions.status.active', 'Activa') : t('admin.promotions.status.inactive', 'Inactiva')
    ])
  }, [filtered, moneda, tasaUSD, t])

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
      if (modal.promotion) {
        promotionManagementService.update(modal.promotion.id, form, user)
        showAlert({ icon: 'success', title: t('admin.promotions.messages.updated', 'Oferta actualizada exitosamente.') })
      } else {
        promotionManagementService.create(form, user)
        showAlert({ icon: 'success', title: t('admin.promotions.messages.created', 'Oferta creada exitosamente.') })
      }
      refresh()
      closeModal()
    } catch (caught) {
      setError(t(`admin.promotions.errors.${caught.message}`, caught.message))
    }
  }

  const toggleActive = (promotion) => {
    promotionManagementService.toggle(promotion.id, user)
    refresh()
    showAlert({
      icon: 'success',
      title: promotion.activa
        ? t('admin.promotions.messages.deactivated', 'Promoción desactivada')
        : t('admin.promotions.messages.activated', 'Promoción activada')
    })
  }

  const toggleFeatured = (promotion) => {
    promotionManagementService.toggleFeatured(promotion.id, user)
    refresh()
    showAlert({
      icon: 'info',
      title: promotion.destacada ? 'Quitada de destacadas' : 'Marcada como destacada'
    })
  }

  const handleDelete = async (promotion) => {
    const result = await showAlert({
      title: t('admin.promotions.deleteConfirmTitle', '¿Eliminar oferta?'),
      text: t('admin.promotions.deleteConfirmText', 'Esta acción no se puede deshacer.'),
      confirmButtonText: t('common.delete', 'Sí, eliminar'),
      showCancelButton: true,
      cancelButtonText: t('common.cancel', 'Cancelar'),
      icon: 'warning'
    })
    if (result?.isConfirmed) {
      promotionManagementService.remove(promotion.id, user)
      refresh()
      showAlert({ icon: 'success', title: t('admin.promotions.messages.deleted', 'Oferta eliminada.') })
    }
  }

  const vehiculosFiltrados = useMemo(() => {
    if (!form.categoriaVehiculo || form.categoriaVehiculo === 'Todos') return VEHICULOS_MOCK
    return VEHICULOS_MOCK.filter((v) => v.categoria?.toLowerCase() === form.categoriaVehiculo.toLowerCase())
  }, [form.categoriaVehiculo])

  const backdropStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.65)', padding: 16 }
  const modalHeadStyle = { padding: '20px 24px', borderBottom: '1px solid var(--city-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  const closeBtnStyle = { background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--city-muted)', lineHeight: 1, padding: 0 }

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={esEncargado} />
      <main className="management-main doc-verification-main">
        <div className="cities-container" style={{ maxWidth: '100%' }}>

          {/* TOPBAR WITH BADGE AND USER PROFILE CHIP */}
          <header className="cities-topbar reservations-management-header">
            <div className="branch-topbar-brand-title">
              <span className="branch-topbar-badge">{t('admin.branchManagement', 'GESTIÓN OPERATIVA')}</span>
              <h1 className="branch-topbar-heading">{t('admin.promotions.title', 'Gestión de Promociones')}</h1>
            </div>
            <div className="cities-topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <MenuConfiguracion />
              {user && (
                <div className="branch-user-profile-chip">
                  <div className="branch-user-avatar">{(user?.nombre || user?.correo || 'A').charAt(0).toUpperCase()}</div>
                  <div className="branch-user-info-text">
                    <strong className="branch-user-name">{[user?.nombre, user?.apellido].filter(Boolean).join(' ') || user?.correo || 'Usuario'}</strong>
                    <span className="branch-user-role">{user?.rol || 'encargado_sucursal'}</span>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* KPI CARDS BAR */}
          <div className="cash-kpi-bar">
            {[
              { icon: FaTag, color: '#3b82f6', label: t('admin.promotions.kpi.total', 'Total Ofertas'), value: totalPromociones, desc: t('admin.promotions.kpi.totalDesc', 'Cupones y promociones registradas') },
              { icon: FaCheckCircle, color: '#10b981', label: t('admin.promotions.kpi.active', 'Ofertas Activas'), value: totalActivas, desc: t('admin.promotions.kpi.activeDesc', 'Disponibles para clientes') },
              { icon: FaStar, color: '#f59e0b', label: t('admin.promotions.kpi.featured', 'Destacadas'), value: totalDestacadas, desc: t('admin.promotions.kpi.featuredDesc', 'Visibilidad prioritaria en catálogo') },
              { icon: FaGift, color: '#8b5cf6', label: t('admin.promotions.kpi.coupons', 'Cupones Directos'), value: totalCupones, desc: t('admin.promotions.kpi.couponsDesc', 'Códigos de canje comercial') },
            ].map(({ icon: Icon, color, label, value, desc }) => (
              <div key={label} className="cash-kpi-item-light">
                <div className="cash-kpi-header-light" style={{ color }}>
                  <Icon /><span>{label}</span>
                </div>
                <strong className="cash-kpi-val-light">{value}</strong>
                <div className="cash-kpi-progress-bg">
                  <div className="cash-kpi-progress-fill" style={{ width: value > 0 ? '100%' : '0%', background: color }} />
                </div>
                <span className="cash-kpi-subtitle-light">{desc}</span>
              </div>
            ))}
          </div>

          {/* FLEET ATTACHED TABS WITH BLUE "+ CREAR PROMOCIÓN" BUTTON ON RIGHT */}
          <div className="fleet-attached-tabs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div className="fleet-tabs-nav">
              <button
                type="button"
                onClick={() => setActiveTab('todos')}
                className={`fleet-tab-btn ${activeTab === 'todos' ? 'is-active' : ''}`}
              >
                {t('admin.promotions.tabs.all', 'Todas las Ofertas')} ({totalPromociones})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cupones')}
                className={`fleet-tab-btn ${activeTab === 'cupones' ? 'is-active' : ''}`}
              >
                {t('admin.promotions.tabs.coupons', 'Solo Cupones')} ({totalCupones})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('promociones')}
                className={`fleet-tab-btn ${activeTab === 'promociones' ? 'is-active' : ''}`}
              >
                {t('admin.promotions.tabs.promotions', 'Solo Promociones')} ({totalPromociones - totalCupones})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('activas')}
                className={`fleet-tab-btn ${activeTab === 'activas' ? 'is-active' : ''}`}
              >
                {t('admin.promotions.tabs.active', 'Activas')} ({totalActivas})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inactivas')}
                className={`fleet-tab-btn ${activeTab === 'inactivas' ? 'is-active' : ''}`}
              >
                {t('admin.promotions.tabs.inactive', 'Inactivas')} ({totalPromociones - totalActivas})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('destacadas')}
                className={`fleet-tab-btn ${activeTab === 'destacadas' ? 'is-active' : ''}`}
              >
                {t('admin.promotions.tabs.featured', 'Destacadas')} ({totalDestacadas})
              </button>
            </div>

            {/* BLUE ACTION BUTTON */}
            <div className="fleet-tabs-action">
              <button
                type="button"
                className="city-btn city-btn--primary"
                onClick={openCreate}
                style={{
                  background: 'var(--brand-primary, #2563eb)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  whiteSpace: 'nowrap',
                }}
              >
                <FaPlus style={{ fontSize: 11 }} />
                {t('admin.promotions.createBtn', 'Crear Promoción')}
              </button>
            </div>
          </div>

          {/* MAIN CARD ATTACHED TO TABS */}
          <section className="cities-card attached-to-tabs">
            
            {/* TOOLBAR CON BUSCADOR, FILTROS, SUCURSAL Y EXPORT PILLS */}
            <div className="cities-toolbar doc-toolbar-wrapper">
              <label className="cities-search" style={{ flex: '1 1 250px', margin: 0 }}>
                <FaSearch />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('admin.promotions.searchPlaceholder', 'Buscar por código, nombre, vehículo o condición...')}
                />
              </label>

              <select
                value={discountTypeFilter}
                onChange={(e) => setDiscountTypeFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--city-border, #cbd5e1)', fontSize: 13, background: 'var(--city-bg, #f8fafc)', color: 'var(--city-text, #0f172a)', outline: 'none' }}
              >
                <option value="all">Todos los descuentos</option>
                <option value="porcentaje">Porcentaje (%)</option>
                <option value="fijo">Monto Fijo ($)</option>
              </select>

              <div className="doc-branch-badge">
                <FaBuilding style={{ color: 'var(--city-muted, #64748b)' }} />
                <span>{user?.sucursalAsignada || user?.sucursalId || user?.sucursal || 'Alamo Bogotá - Aeropuerto'}</span>
              </div>

              <div className="export-pills-group" style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="export-pill export-pill--excel"
                  onClick={() => exportExcel({ title: 'Promociones - Drivique', headers: ['ID', 'TIPO', 'CÓDIGO', 'NOMBRE', 'AUDIENCIA', 'DESCUENTO', 'RES MÍNIMA', 'ALCANCE', 'INICIO', 'FIN', 'CONDICIONES', 'DESTACADA', 'ESTADO'], rows: exportData })}
                  title="Excel"
                >
                  <FaFileExcel aria-hidden="true" /> Excel
                </button>
                <button
                  type="button"
                  className="export-pill export-pill--pdf"
                  onClick={() => exportPdf({ title: 'Promociones - Drivique', headers: ['ID', 'TIPO', 'CÓDIGO', 'NOMBRE', 'AUDIENCIA', 'DESCUENTO', 'RES MÍNIMA', 'ALCANCE', 'INICIO', 'FIN', 'CONDICIONES', 'DESTACADA', 'ESTADO'], rows: exportData })}
                  title="PDF"
                >
                  <FaFilePdf aria-hidden="true" /> PDF
                </button>
                <button
                  type="button"
                  className="export-pill export-pill--print"
                  onClick={() => printTable({ title: 'Promociones - Drivique', headers: ['ID', 'TIPO', 'CÓDIGO', 'NOMBRE', 'AUDIENCIA', 'DESCUENTO', 'RES MÍNIMA', 'ALCANCE', 'INICIO', 'FIN', 'CONDICIONES', 'DESTACADA', 'ESTADO'], rows: exportData })}
                  title="Imprimir"
                >
                  <FaPrint aria-hidden="true" /> Imprimir
                </button>
              </div>
            </div>

            {/* SUMMARY COUNT */}
            <div className="cities-summary" style={{ margin: '8px 0 12px' }}>
              <span>{filtered.length}</span>{' '}
              {t('admin.promotions.foundCount', 'PROMOCIONES Y CUPONES REGISTRADOS').toUpperCase()}
            </div>

            {filtered.length === 0 ? (
              <div className="cities-empty">
                <FaGift style={{ fontSize: 44, color: '#94a3b8', marginBottom: 12 }} />
                <h2>{t('admin.promotions.emptyTitle', 'No hay promociones registradas')}</h2>
                <p>{t('admin.promotions.emptyDesc', 'Haz clic en "+ Crear Promoción" para registrar una nueva oferta o cupón.')}</p>
              </div>
            ) : (
              <>
                {/* 1. VISTA DE TABLA CON 1 COLUMNA POR RESPONSABILIDAD DE DATOS */}
                <div className="cities-table-wrap doc-desktop-table" style={{ overflowX: 'auto' }}>
                  <table className="incidents-table-v2" style={{ whiteSpace: 'nowrap', width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '35px' }}>{t('admin.promotions.table.id', 'ID')}</th>
                        <th>{t('admin.promotions.table.offerType', 'TIPO OFERTA')}</th>
                        <th>{t('admin.promotions.table.code', 'CÓDIGO')}</th>
                        <th>{t('admin.promotions.table.name', 'NOMBRE OFERTA')}</th>
                        <th>{t('admin.promotions.table.audience', 'AUDIENCIA')}</th>
                        <th>{t('admin.promotions.table.discount', 'DESCUENTO')}</th>
                        <th>{t('admin.promotions.table.minimum', 'RESERVA MÍNIMA')}</th>
                        <th>{t('admin.promotions.table.scope', 'ALCANCE / VEHÍCULO')}</th>
                        <th>{t('admin.promotions.table.start', 'FECHA INICIO')}</th>
                        <th>{t('admin.promotions.table.end', 'FECHA FIN')}</th>
                        <th>{t('admin.promotions.table.conditions', 'CONDICIONES')}</th>
                        <th style={{ textAlign: 'center' }}>{t('admin.promotions.table.featured', 'DESTACADA')}</th>
                        <th style={{ textAlign: 'center' }}>{t('admin.promotions.table.status', 'ESTADO')}</th>
                        <th style={{ textAlign: 'center' }}>{t('admin.promotions.table.actions', 'ACCIONES')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item, i) => (
                        <tr key={item.id}>
                          {/* 1. ID */}
                          <td style={{ fontWeight: 400, color: 'var(--city-text, #0f172a)', width: '35px' }}>{i + 1}</td>

                          {/* 2. TIPO OFERTA */}
                          <td style={{ fontWeight: 400 }}>
                            <span className={`offer-type-badge ${item.tipoOferta || 'cupon'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
                              {item.tipoOferta === 'promocion' ? <FaCar size={11} /> : <FaTag size={10} />}
                              {item.tipoOferta === 'promocion' ? t('admin.promotions.offerTypes.promocion', 'Promoción') : t('admin.promotions.offerTypes.cupon', 'Cupón')}
                            </span>
                          </td>

                          {/* 3. CÓDIGO */}
                          <td style={{ fontWeight: 600, color: 'var(--brand-primary, #2563eb)' }}>
                            {item.codigo}
                          </td>

                          {/* 4. NOMBRE OFERTA */}
                          <td style={{ fontWeight: 400, color: 'var(--city-text, #0f172a)' }}>
                            {item.nombre}
                          </td>

                          {/* 5. AUDIENCIA */}
                          <td style={{ fontWeight: 400, color: 'var(--city-text, #334155)' }}>
                            {item.audiencia === 'nuevos'
                              ? t('admin.promotions.audiences.nuevos', 'Nuevos usuarios')
                              : item.audiencia === 'frecuentes'
                              ? t('admin.promotions.audiences.frecuentes', 'Clientes frecuentes')
                              : t('admin.promotions.audiences.todos', 'Todos los usuarios')}
                          </td>

                          {/* 6. DESCUENTO */}
                          <td style={{ fontWeight: 600, color: '#16a34a' }}>
                            {labelDiscount(item)}
                          </td>

                          {/* 7. RESERVA MÍNIMA */}
                          <td style={{ fontWeight: 400, color: 'var(--city-text, #334155)' }}>
                            {item.reservaMinima > 0
                              ? formatCurrency(item.reservaMinima, moneda, tasaUSD)
                              : t('admin.promotions.noMin', 'Sin mínimo')}
                          </td>

                          {/* 8. ALCANCE / VEHÍCULO */}
                          <td style={{ fontWeight: 400, color: 'var(--city-text, #334155)' }}>
                            {labelTarget(item)}
                          </td>

                          {/* 9. FECHA INICIO */}
                          <td style={{ fontWeight: 400, color: 'var(--city-muted, #64748b)' }}>
                            {item.fechaInicio || '-'}
                          </td>

                          {/* 10. FECHA FIN */}
                          <td style={{ fontWeight: 400, color: 'var(--city-muted, #64748b)' }}>
                            {item.fechaFin || '-'}
                          </td>

                          {/* 11. CONDICIONES */}
                          <td style={{ fontWeight: 400 }}>
                            {item.condiciones ? (
                              <button
                                type="button"
                                onClick={() => setConditionsModal(item)}
                                className="promotion-conditions-btn"
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  background: 'var(--brand-soft-light, #eff6ff)',
                                  color: 'var(--brand-primary, #2563eb)',
                                  border: '1px solid var(--brand-border-light, #bfdbfe)',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  fontSize: 11.5,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <FaInfoCircle size={11} /> {t('admin.promotions.viewDetailBtn', 'Ver detalle')}
                              </button>
                            ) : (
                              <span style={{ color: 'var(--city-muted, #64748b)', fontSize: 12 }}>
                                {t('admin.promotions.noCond', 'Sin condiciones')}
                              </span>
                            )}
                          </td>

                          {/* 12. DESTACADA */}
                          <td style={{ textAlign: 'center', fontWeight: 400 }}>
                            <button
                              type="button"
                              onClick={() => toggleFeatured(item)}
                              title={item.destacada ? 'Quitar de destacadas' : 'Marcar como destacada'}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                color: item.destacada ? '#f59e0b' : '#94a3b8',
                                fontWeight: 600,
                                fontSize: 12
                              }}
                            >
                              {item.destacada ? <FaStar color="#f59e0b" size={14} /> : <FaRegStar color="#94a3b8" size={14} />}
                              <span>{item.destacada ? t('admin.promotions.featuredBadge.yes', 'Destacada') : t('admin.promotions.featuredBadge.no', 'Normal')}</span>
                            </button>
                          </td>

                          {/* 13. ESTADO */}
                          <td style={{ textAlign: 'center', fontWeight: 400 }}>
                            <span className={`doc-status-badge ${item.activa ? 'aprobado' : 'rechazada'}`}>
                              {item.activa ? t('admin.promotions.status.active', 'Activa') : t('admin.promotions.status.inactive', 'Inactiva')}
                            </span>
                          </td>

                          {/* 14. ACCIONES */}
                          <td style={{ textAlign: 'center', fontWeight: 400 }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                              <button
                                type="button"
                                onClick={() => toggleActive(item)}
                                title={item.activa ? 'Desactivar' : 'Activar'}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  background: item.activa ? '#ecfdf5' : '#f1f5f9',
                                  color: item.activa ? '#047857' : '#64748b',
                                  border: `1px solid ${item.activa ? '#a7f3d0' : '#cbd5e1'}`,
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  fontSize: 12,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                {item.activa ? <FaToggleOn size={14} /> : <FaToggleOff size={14} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => openEdit(item)}
                                title="Editar"
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  background: 'var(--brand-soft-light, #eff6ff)',
                                  color: 'var(--brand-primary, #2563eb)',
                                  border: '1px solid var(--brand-border-light, #bfdbfe)',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  fontSize: 12,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <FaEdit />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item)}
                                title="Eliminar"
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  background: '#fef2f2',
                                  color: '#dc2626',
                                  border: '1px solid #fecaca',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  fontSize: 12,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
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

                {/* 2. VISTA DE TARJETAS PARA MÓVIL */}
                <div className="doc-mobile-cards">
                  {filtered.map((item, i) => (
                    <div key={item.id} className="doc-mobile-card">
                      <div className="doc-mobile-card-header">
                        <div className="doc-mobile-card-title">
                          <span style={{ fontWeight: 400, color: 'var(--brand-primary, #2563eb)', fontSize: 13 }}>ID {i + 1}</span>
                          <span style={{ fontWeight: 500, color: 'var(--city-text, #0f172a)', fontSize: 14 }}>{item.codigo}</span>
                        </div>
                        <span className={`doc-status-badge ${item.activa ? 'aprobado' : 'rechazada'}`}>
                          {item.activa ? t('admin.promotions.status.active', 'Activa') : t('admin.promotions.status.inactive', 'Inactiva')}
                        </span>
                      </div>

                      <div className="doc-mobile-card-body">
                        <div className="doc-mobile-data-item doc-mobile-data-item--full">
                          <span className="doc-mobile-data-label">{t('admin.promotions.table.name', 'NOMBRE OFERTA')}</span>
                          <span className="doc-mobile-data-value" style={{ fontSize: 14, fontWeight: 500 }}>{item.nombre}</span>
                        </div>

                        <div className="doc-mobile-data-item">
                          <span className="doc-mobile-data-label">{t('admin.promotions.table.offerType', 'TIPO OFERTA')}</span>
                          <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>{item.tipoOferta === 'promocion' ? 'Promoción' : 'Cupón'}</span>
                        </div>

                        <div className="doc-mobile-data-item">
                          <span className="doc-mobile-data-label">{t('admin.promotions.table.discount', 'DESCUENTO')}</span>
                          <span className="doc-mobile-data-value" style={{ color: '#16a34a', fontWeight: 600 }}>{labelDiscount(item)}</span>
                        </div>

                        <div className="doc-mobile-data-item">
                          <span className="doc-mobile-data-label">{t('admin.promotions.table.start', 'FECHA INICIO')}</span>
                          <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>{item.fechaInicio || '-'}</span>
                        </div>

                        <div className="doc-mobile-data-item">
                          <span className="doc-mobile-data-label">{t('admin.promotions.table.end', 'FECHA FIN')}</span>
                          <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>{item.fechaFin || '-'}</span>
                        </div>

                        <div className="doc-mobile-data-item doc-mobile-data-item--full">
                          <span className="doc-mobile-data-label">{t('admin.promotions.table.scope', 'ALCANCE / VEHÍCULO')}</span>
                          <span className="doc-mobile-data-value" style={{ fontWeight: 400 }}>{labelTarget(item)}</span>
                        </div>
                      </div>

                      <div className="doc-mobile-card-actions" style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => toggleActive(item)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '8px',
                            background: item.activa ? '#ecfdf5' : '#f1f5f9',
                            color: item.activa ? '#047857' : '#64748b',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: 12
                          }}
                        >
                          {item.activa ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '8px',
                            background: 'var(--brand-soft-light, #eff6ff)',
                            color: 'var(--brand-primary, #2563eb)',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: 12
                          }}
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* MODAL DETALLE CONDICIONES */}
      {conditionsModal && (
        <div className="cities-modal-backdrop" style={backdropStyle} onMouseDown={e => e.target === e.currentTarget && setConditionsModal(null)}>
          <section className="cities-modal" style={{ maxWidth: 480, width: '100%', background: 'var(--city-card)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={modalHeadStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary, #2563eb)' }}>
                  <FaFileAlt size={18} />
                </div>
                <div>
                  <p style={{ color: 'var(--city-muted)', margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>TÉRMINOS Y CONDICIONES</p>
                  <h2 style={{ color: 'var(--city-text)', margin: 0, fontSize: 18, fontWeight: 800 }}>Detalle de la Oferta</h2>
                </div>
              </div>
              <button type="button" onClick={() => setConditionsModal(null)} style={closeBtnStyle}>&times;</button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--city-bg, #f8fafc)', borderRadius: 12, padding: '14px 16px', border: '1.5px solid var(--city-border, #cbd5e1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <strong style={{ fontSize: 15, color: 'var(--brand-primary, #2563eb)' }}>{conditionsModal.codigo}</strong>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>{labelDiscount(conditionsModal)}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--city-text, #0f172a)', fontWeight: 500 }}>{conditionsModal.nombre}</p>
              </div>

              <div>
                <strong style={{ fontSize: 12.5, display: 'block', marginBottom: 6, color: 'var(--city-text, #0f172a)', fontWeight: 600 }}>
                  Condiciones aplicables:
                </strong>
                <div style={{ background: 'var(--city-bg, #f8fafc)', border: '1.5px solid var(--city-border, #cbd5e1)', borderRadius: 10, padding: 14, fontSize: 13, color: 'var(--city-text, #334155)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {conditionsModal.condiciones || t('admin.promotions.noCond', 'Sin condiciones especiales')}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                <div style={{ padding: 10, borderRadius: 8, background: 'var(--city-bg, #f8fafc)', border: '1px solid var(--city-border, #cbd5e1)' }}>
                  <span style={{ color: 'var(--city-muted, #64748b)', display: 'block' }}>Vigencia:</span>
                  <strong style={{ color: 'var(--city-text)' }}>{conditionsModal.fechaInicio} al {conditionsModal.fechaFin}</strong>
                </div>
                <div style={{ padding: 10, borderRadius: 8, background: 'var(--city-bg, #f8fafc)', border: '1px solid var(--city-border, #cbd5e1)' }}>
                  <span style={{ color: 'var(--city-muted, #64748b)', display: 'block' }}>Monto Mínimo:</span>
                  <strong style={{ color: 'var(--city-text)' }}>{conditionsModal.reservaMinima > 0 ? formatCurrency(conditionsModal.reservaMinima, moneda, tasaUSD) : 'Sin mínimo'}</strong>
                </div>
                <div style={{ padding: 10, borderRadius: 8, background: 'var(--city-bg, #f8fafc)', border: '1px solid var(--city-border, #cbd5e1)' }}>
                  <span style={{ color: 'var(--city-muted, #64748b)', display: 'block' }}>Alcance:</span>
                  <strong style={{ color: 'var(--city-text)' }}>{labelTarget(conditionsModal)}</strong>
                </div>
                <div style={{ padding: 10, borderRadius: 8, background: 'var(--city-bg, #f8fafc)', border: '1px solid var(--city-border, #cbd5e1)' }}>
                  <span style={{ color: 'var(--city-muted, #64748b)', display: 'block' }}>Clasificación:</span>
                  <strong style={{ color: 'var(--city-text)' }}>{conditionsModal.tipoOferta === 'promocion' ? 'Promoción' : 'Cupón'} {conditionsModal.destacada ? '• Destacada' : ''}</strong>
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--city-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setConditionsModal(null)}
                style={{ padding: '8px 22px', borderRadius: 9999, background: 'var(--brand-primary, #2563eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800 }}
              >
                Cerrar
              </button>
            </div>
          </section>
        </div>
      )}

      {/* MODAL CREAR / EDITAR PROMOCIÓN */}
      {modal && modal.type === 'form' && (
        <div className="cities-modal-backdrop" style={backdropStyle} onMouseDown={e => e.target === e.currentTarget && closeModal()}>
          <section className="cities-modal" style={{ maxWidth: 640, width: '100%', background: 'var(--city-card)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={modalHeadStyle}>
              <div>
                <p style={{ color: 'var(--city-muted)', margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  {t('admin.promotions.modal.eyebrow', 'GESTIÓN DE CAMPAÑA')}
                </p>
                <h2 style={{ color: 'var(--city-text)', margin: 0, fontSize: 18, fontWeight: 800 }}>
                  {t(modal.promotion ? 'admin.promotions.modal.editTitle' : 'admin.promotions.modal.createTitle', modal.promotion ? 'Editar Oferta' : 'Crear Nueva Oferta')}
                </h2>
              </div>
              <button type="button" onClick={closeModal} style={closeBtnStyle}>&times;</button>
            </div>

            <div style={{ padding: '20px 24px', maxHeight: '78vh', overflowY: 'auto' }}>
              <form id="promo-form" onSubmit={save} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                
                {/* Clasificación */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, margin: 0 }}>
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
                        background: form.tipoOferta === 'cupon' ? 'var(--brand-soft-light, #eff6ff)' : 'var(--city-card, #ffffff)',
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
                        <strong style={{ display: 'block', fontSize: 13, color: form.tipoOferta === 'cupon' ? 'var(--brand-primary, #2563eb)' : 'var(--city-text, #0f172a)' }}>
                          Cupón de Descuento
                        </strong>
                        <small style={{ color: 'var(--city-muted, #64748b)', fontSize: 11, lineHeight: 1.3, display: 'block', marginTop: 2 }}>
                          Código de canje aplicable en el checkout de reserva.
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
                        background: form.tipoOferta === 'promocion' ? 'var(--brand-soft-light, #eff6ff)' : 'var(--city-card, #ffffff)',
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
                        <strong style={{ display: 'block', fontSize: 13, color: form.tipoOferta === 'promocion' ? 'var(--brand-primary, #2563eb)' : 'var(--city-text, #0f172a)' }}>
                          Promoción de Catálogo
                        </strong>
                        <small style={{ color: 'var(--city-muted, #64748b)', fontSize: 11, lineHeight: 1.3, display: 'block', marginTop: 2 }}>
                          Oferta con precio rebajado en vehículos destacados.
                        </small>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Código */}
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                    Código Promocional *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.codigo}
                    maxLength={24}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                    placeholder="EJ: SUV20, BONO50K"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                  />
                </div>

                {/* Nombre */}
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                    Nombre de la Oferta *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Especial Verano 2026"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                  />
                </div>

                {/* Tipo de Descuento */}
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                    Tipo de Descuento *
                  </label>
                  <select
                    value={form.tipoDescuento}
                    onChange={(e) => setForm({ ...form, tipoDescuento: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="fijo">Monto Fijo ($ COP)</option>
                  </select>
                </div>

                {/* Valor Descuento */}
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                    Valor del Descuento *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={form.tipoDescuento === 'porcentaje' ? 100 : undefined}
                    value={form.valorDescuento}
                    onChange={(e) => setForm({ ...form, valorDescuento: e.target.value })}
                    placeholder={form.tipoDescuento === 'porcentaje' ? 'Ej: 20' : 'Ej: 50000'}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                    Categoría de Vehículo
                  </label>
                  <select
                    value={form.categoriaVehiculo}
                    onChange={(e) => {
                      const cat = e.target.value
                      setForm({ ...form, categoriaVehiculo: cat, vehiculoId: '', vehiculoNombre: '' })
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                  >
                    {['Todos', 'SUV', 'Sedan', 'Compacto', 'Camioneta', 'Deportivo', 'Económico'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Vehículo específico */}
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                    Vehículo Específico (Opcional)
                  </label>
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
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                  >
                    <option value="">Cualquier vehículo</option>
                    {vehiculosFiltrados.map((v) => (
                      <option key={v.id} value={v.id}>{v.nombre} ({v.categoria})</option>
                    ))}
                  </select>
                </div>

                {/* Fecha Inicio */}
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                    Fecha Inicio *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.fechaInicio}
                    onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                  />
                </div>

                {/* Fecha Fin */}
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                    Fecha Fin *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.fechaFin}
                    onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                  />
                </div>

                {/* Reserva Mínima */}
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                    Reserva Mínima ($ COP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.reservaMinima}
                    onChange={(e) => setForm({ ...form, reservaMinima: e.target.value })}
                    placeholder="0 para sin mínimo"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                  />
                </div>

                {/* Audiencia */}
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                    Audiencia / Destinatarios
                  </label>
                  <select
                    value={form.audiencia}
                    onChange={(e) => setForm({ ...form, audiencia: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none' }}
                  >
                    <option value="todos">Todos los usuarios</option>
                    <option value="nuevos">Nuevos usuarios</option>
                    <option value="frecuentes">Clientes frecuentes</option>
                  </select>
                </div>

                {/* Checkbox Destacada */}
                <div style={{ gridColumn: '1 / -1', padding: '12px 14px', background: form.destacada ? 'var(--brand-soft-light, #eff6ff)' : 'var(--city-bg, #f8fafc)', border: `1.5px solid ${form.destacada ? 'var(--brand-border-light, #bfdbfe)' : 'var(--city-border, #cbd5e1)'}`, borderRadius: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={form.destacada}
                      onChange={(e) => setForm({ ...form, destacada: e.target.checked })}
                      style={{ width: 17, height: 17, accentColor: 'var(--brand-primary, #2563eb)' }}
                    />
                    <strong style={{ fontSize: 13, color: form.destacada ? 'var(--brand-primary, #2563eb)' : 'var(--city-text, #0f172a)' }}>
                      Marcar como Oferta Destacada en Catálogo
                    </strong>
                  </label>
                </div>

                {/* Checkbox Activa */}
                <div style={{ gridColumn: '1 / -1', padding: '12px 14px', background: form.activa ? '#ecfdf5' : 'var(--city-bg, #f8fafc)', border: `1.5px solid ${form.activa ? '#a7f3d0' : 'var(--city-border, #cbd5e1)'}`, borderRadius: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={form.activa}
                      onChange={(e) => setForm({ ...form, activa: e.target.checked })}
                      style={{ width: 17, height: 17, accentColor: '#10b981' }}
                    />
                    <strong style={{ fontSize: 13, color: form.activa ? '#047857' : 'var(--city-text, #0f172a)' }}>
                      Publicar oferta como Activa inmediatamente
                    </strong>
                  </label>
                </div>

                {/* Condiciones */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12.5, color: 'var(--city-text)', fontWeight: 600, marginBottom: 4 }}>
                    Términos y Condiciones Especificos *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.condiciones}
                    onChange={(e) => setForm({ ...form, condiciones: e.target.value })}
                    placeholder="Escribe los términos y condiciones de la oferta..."
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--city-border)', background: 'var(--city-bg)', color: 'var(--city-text)', fontSize: 13, outline: 'none', resize: 'vertical' }}
                  />
                </div>

                {error && <p style={{ gridColumn: '1 / -1', color: '#dc2626', fontSize: 13, margin: 0 }}>{error}</p>}
              </form>
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--city-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={closeModal}
                style={{ padding: '8px 18px', borderRadius: 9999, background: 'transparent', color: 'var(--city-muted)', border: '1.5px solid var(--city-border)', cursor: 'pointer', fontWeight: 700 }}
              >
                {t('admin.promotions.modal.cancelBtn', 'Cancelar')}
              </button>
              <button
                type="submit"
                form="promo-form"
                style={{ padding: '8px 22px', borderRadius: 9999, background: 'var(--brand-primary, #2563eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
              >
                {t('admin.promotions.modal.saveBtn', 'Guardar Oferta')}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
