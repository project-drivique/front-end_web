import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaBuilding, FaTag, FaStar, FaGift, FaCheckCircle } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { promotionManagementService } from '../../../services/promotionManagementService'

import { formatCurrency } from '../../../utils/currencyUtils'
import { showAlert } from '../../../utils/swalConfig'
import { vehicleManagementService } from '../../../services/vehicleManagementService'

import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './CashCollectionPage.css'
import './DocumentVerificationPage.css'
import './PromotionManagementPage.css'
import Modal from './PromotionManagementPage/Modal'
import ConditionsModal from './PromotionManagementPage/ConditionsModal'
import DocMobileCards from './PromotionManagementPage/DocMobileCards'
import CitiesTableWrap from './PromotionManagementPage/CitiesTableWrap'
import CitiesToolbar from './PromotionManagementPage/CitiesToolbar'
import FleetAttachedTabs from './PromotionManagementPage/FleetAttachedTabs'
import CitiesTopbar from './PromotionManagementPage/CitiesTopbar'

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
    user?.rol === 'branch_manager' ||
    (Array.isArray(user?.roles) && (user.roles.includes('BRANCH_ADMIN') || user.roles.includes('BRANCH_MANAGER')))

  const [promotions, setPromotions] = useState(() => promotionManagementService.list())
  const [vehiculos, setVehiculos] = useState(() => vehicleManagementService.list())
  const [categorias, setCategorias] = useState([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('todos')
  const [discountTypeFilter, setDiscountTypeFilter] = useState('all')

  const [modal, setModal] = useState(null)
  const [conditionsModal, setConditionsModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  const refresh = () => setPromotions(promotionManagementService.list())

  useEffect(() => {
    promotionManagementService.refresh({ admin: true }).then(setPromotions).catch(() => setPromotions([]))
    vehicleManagementService.refresh().then(setVehiculos).catch(() => setVehiculos([]))
    vehicleManagementService.categories().then(setCategorias).catch(() => setCategorias([]))
  }, [])

  const vehiculosFiltrados = useMemo(() => {
    return vehiculos.filter((v) => {
      if (esEncargado) {
        const sucursalUsuario = user?.sucursal || user?.branchName
        if (sucursalUsuario && v.sucursal && v.sucursal.toLowerCase() !== sucursalUsuario.toLowerCase()) {
          return false
        }
      }
      if (form.categoriaVehiculo && form.categoriaVehiculo !== 'Todos' && v.categoria !== form.categoriaVehiculo) {
        return false
      }
      return true
    })
  }, [vehiculos, esEncargado, user, form.categoriaVehiculo])

  const totalPromociones = useMemo(() => promotions.length, [promotions])
  const totalActivas = useMemo(() => promotions.filter(p => p.activa).length, [promotions])
  const totalDestacadas = useMemo(() => promotions.filter(p => p.destacada).length, [promotions])
  const totalCupones = useMemo(() => promotions.filter(p => p.tipoOferta === 'cupon').length, [promotions])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return promotions.filter((item) => {
      // Scoping: If Encargado, ONLY see promotions for their branch or their vehicles!
      if (esEncargado) {
        const sucursalUsuario = user?.sucursal || user?.branchName
        if (sucursalUsuario) {
          const matchesBranch = item.branchName && item.branchName.toLowerCase() === sucursalUsuario.toLowerCase()
          const vehicleMatch = item.vehiculoId && vehiculos.some(v => String(v.id) === String(item.vehiculoId) && v.sucursal?.toLowerCase() === sucursalUsuario.toLowerCase())
          if (!matchesBranch && !vehicleMatch && (item.branchName || item.vehiculoId)) {
            return false
          }
        }
      }

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
  }, [promotions, search, activeTab, discountTypeFilter, esEncargado, user, vehiculos])

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

  const save = async (event) => {
    event.preventDefault()
    try {
      if (modal.promotion) {
        await promotionManagementService.update(modal.promotion.id, form)
        showAlert({ icon: 'success', title: t('admin.promotions.messages.updated', 'Oferta actualizada exitosamente.') })
      } else {
        await promotionManagementService.create(form)
        showAlert({ icon: 'success', title: t('admin.promotions.messages.created', 'Oferta creada exitosamente.') })
      }
      refresh()
      closeModal()
    } catch (caught) {
      setError(t(`admin.promotions.errors.${caught.message}`, caught.message))
    }
  }

  const toggleActive = async (promotion) => {
    try {
      await promotionManagementService.toggle(promotion.id)
    } catch (caught) {
      showAlert({ icon: 'error', title: caught.message })
      return
    }
    refresh()
    showAlert({
      icon: 'success',
      title: promotion.activa
        ? t('admin.promotions.messages.deactivated', 'Promoción desactivada')
        : t('admin.promotions.messages.activated', 'Promoción activada')
    })
  }

  const toggleFeatured = async (promotion) => {
    try {
      await promotionManagementService.toggleFeatured(promotion.id)
    } catch (caught) {
      showAlert({ icon: 'error', title: caught.message })
      return
    }
    refresh()
    showAlert({
      icon: 'info',
      title: promotion.destacada ? 'Quitada de destacadas' : t('hc2.marcada_como_destacada', 'Marcada como destacada')
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
      try {
        await promotionManagementService.remove(promotion.id)
      } catch (caught) {
        showAlert({ icon: 'error', title: caught.message })
        return
      }
      refresh()
      showAlert({ icon: 'success', title: t('admin.promotions.messages.deleted', 'Oferta eliminada.') })
    }
  }

  const backdropStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.65)', padding: 16 }
  const modalHeadStyle = { padding: '20px 24px', borderBottom: '1px solid var(--city-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  const closeBtnStyle = { background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--city-muted)', lineHeight: 1, padding: 0 }

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={esEncargado} />
      <main className="management-main doc-verification-main">
        <div className="cities-container" style={{ maxWidth: '100%' }}>

          {/* TOPBAR WITH BADGE AND USER PROFILE CHIP */}
          <CitiesTopbar t={t} user={user} />

          {/* KPI CARDS BAR */}
          <div className="cash-kpi-bar">
            {[
              { icon: FaTag, color: 'var(--brand-text)', label: t('admin.promotions.kpi.total', 'Total Ofertas'), value: totalPromociones, desc: t('admin.promotions.kpi.totalDesc', 'Cupones y promociones registradas') },
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
          <FleetAttachedTabs activeTab={activeTab} esEncargado={esEncargado} openCreate={openCreate} setActiveTab={setActiveTab} t={t} totalActivas={totalActivas} totalCupones={totalCupones} totalDestacadas={totalDestacadas} totalPromociones={totalPromociones} />

          {/* MODO SUPERVISIÓN PARA ADMIN GENERAL */}
          {!esEncargado && (
            <div style={{
              margin: '14px 0 0',
              padding: '14px 18px',
              borderRadius: 12,
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              color: '#334155'
            }}>
              <FaBuilding style={{ color: 'var(--brand-text)', fontSize: 20, flexShrink: 0 }} />
              <div style={{ fontSize: 13 }}>
                <strong style={{ display: 'block', color: '#0f172a', marginBottom: 2 }}>{t('hc.modo_supervision_global_solo_lectura', 'Modo Supervisión Global (Solo Lectura)')}</strong>
                Como Administrador General puedes visualizar y auditar las promociones de todas las sucursales. La creación, activación y modificación es gestionada de manera autónoma por el Encargado de cada sede.
              </div>
            </div>
          )}

          {/* MAIN CARD ATTACHED TO TABS */}
          <section className="cities-card attached-to-tabs">
            
            {/* TOOLBAR CON BUSCADOR, FILTROS, SUCURSAL Y EXPORT PILLS */}
            <CitiesToolbar discountTypeFilter={discountTypeFilter} exportData={exportData} search={search} setDiscountTypeFilter={setDiscountTypeFilter} setSearch={setSearch} t={t} user={user} />

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
                <CitiesTableWrap esEncargado={esEncargado} filtered={filtered} handleDelete={handleDelete} labelDiscount={labelDiscount} labelTarget={labelTarget} moneda={moneda} openEdit={openEdit} setConditionsModal={setConditionsModal} t={t} tasaUSD={tasaUSD} toggleActive={toggleActive} toggleFeatured={toggleFeatured} />

                {/* 2. VISTA DE TARJETAS PARA MÓVIL */}
                <DocMobileCards esEncargado={esEncargado} filtered={filtered} labelDiscount={labelDiscount} labelTarget={labelTarget} openEdit={openEdit} setConditionsModal={setConditionsModal} t={t} toggleActive={toggleActive} />
              </>
            )}
          </section>
        </div>
      </main>

      {/* MODAL DETALLE CONDICIONES */}
      {conditionsModal && (
        <ConditionsModal backdropStyle={backdropStyle} closeBtnStyle={closeBtnStyle} conditionsModal={conditionsModal} labelDiscount={labelDiscount} labelTarget={labelTarget} modalHeadStyle={modalHeadStyle} moneda={moneda} setConditionsModal={setConditionsModal} t={t} tasaUSD={tasaUSD} />
      )}

      {/* MODAL CREAR / EDITAR PROMOCIÓN */}
      {modal && modal.type === 'form' && (
        <Modal backdropStyle={backdropStyle} categorias={categorias} closeBtnStyle={closeBtnStyle} closeModal={closeModal} error={error} form={form} modal={modal} modalHeadStyle={modalHeadStyle} save={save} setForm={setForm} t={t} vehiculos={vehiculos} vehiculosFiltrados={vehiculosFiltrados} />
      )}
    </div>
  )
}
