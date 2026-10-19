import { api } from './httpClient'
import i18n from '@/i18n'

const PUBLICATION_EVENT = 'drivique:promotions-updated'

// Cachés del último resultado del servidor (list() es síncrono para los componentes)
let allCache = null
let publishedCache = []

const TIPO_OFERTA = { COUPON: 'cupon', PROMOTION: 'promocion' }
const TIPO_DESCUENTO = { PERCENTAGE: 'porcentaje', FIXED_AMOUNT: 'fijo' }
const AUDIENCIA = { ALL: 'todos', NEW: 'nuevos', FREQUENT: 'frecuentes' }
const AUDIENCIA_API = { todos: 'ALL', nuevos: 'NEW', frecuentes: 'FREQUENT' }

const normalizeCode = (value) => String(value || '').trim().toUpperCase()

const notify = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(PUBLICATION_EVENT))
}

const errorCode = (error) => {
  const detail = error?.response?.data?.detail
  return new Error(detail || error?.message || i18n.t('hc2.no_fue_posible_completar_la_operacion_279', 'No fue posible completar la operación'))
}

function fromApi(p) {
  const vehiculos = p.vehicles || []
  const vehiculoEspecifico = p.vehicleId ? vehiculos.find((v) => v.id === p.vehicleId) || vehiculos[0] : null
  return {
    id: p.id,
    tipoOferta: TIPO_OFERTA[p.offerType] || 'cupon',
    codigo: p.code,
    nombre: p.name || p.code,
    tipoDescuento: TIPO_DESCUENTO[p.discountType] || 'porcentaje',
    valorDescuento: Number(p.discountValue),
    fechaInicio: p.startDate,
    fechaFin: p.endDate,
    reservaMinima: Number(p.minimumAmount || 0),
    categoriaVehiculo: p.vehicleCategoryName || 'Todos',
    vehiculoId: p.vehicleId || null,
    vehiculoNombre: p.vehicleName || '',
    vehiculoImagen: vehiculoEspecifico?.imageUrls?.[0] || '',
    vehiculos,
    audiencia: AUDIENCIA[p.audience] || 'todos',
    condiciones: p.conditions || '',
    usosMaximos: p.maxUsesLimit ?? null,
    usosActuales: p.currentUsesCount || 0,
    destacada: Boolean(p.featured),
    activa: Boolean(p.active),
    creadaEn: p.createdAt,
    actualizadaEn: p.updatedAt,
  }
}

function toApi(data, categorias) {
  const categoria = data.categoriaVehiculo && data.categoriaVehiculo !== 'Todos'
    ? categorias.find((c) => c.name === data.categoriaVehiculo)
    : null
  return {
    code: normalizeCode(data.codigo),
    name: String(data.nombre || '').trim(),
    conditions: String(data.condiciones || '').trim(),
    offerType: data.tipoOferta === 'promocion' ? 'PROMOTION' : 'COUPON',
    discountType: data.tipoDescuento === 'fijo' ? 'FIXED_AMOUNT' : 'PERCENTAGE',
    discountValue: Number(data.valorDescuento),
    startDate: data.fechaInicio,
    endDate: data.fechaFin,
    minimumAmount: Math.max(0, Number(data.reservaMinima) || 0),
    vehicleCategoryId: categoria?.id || null,
    vehicleId: data.vehiculoId || null,
    audience: AUDIENCIA_API[data.audiencia] || 'ALL',
    featured: Boolean(data.destacada),
    active: data.activa !== false,
  }
}

function isAudienceEligible() {
  // La audiencia (nuevos / frecuentes) ya la filtra el servidor en /promotions/published
  return true
}

const diasRestantesDe = (fechaFin) => {
  const expMs = new Date(`${fechaFin}T23:59:59`).getTime()
  return { expMs, dias: Math.ceil((expMs - Date.now()) / (1000 * 60 * 60 * 24)) }
}

async function categorias() {
  const { data } = await api.get('/vehicle-categories')
  return Array.isArray(data) ? data : []
}

export const promotionManagementService = {
  eventName: PUBLICATION_EVENT,

  /** Carga del servidor: todas (administración) o solo las vigentes (cliente). */
  async refresh({ admin = false } = {}) {
    if (admin) {
      const { data } = await api.get('/admin/promotions')
      allCache = (Array.isArray(data) ? data : []).map(fromApi)
    } else {
      try {
        const { data } = await api.get('/promotions/published')
        publishedCache = (Array.isArray(data) ? data : []).map(fromApi)
      } catch {
        publishedCache = []
      }
    }
    notify()
    return this.list()
  },

  list() {
    return (allCache || publishedCache).map((item) => ({ ...item }))
  },

  async create(data) {
    try {
      const { data: saved } = await api.post('/admin/promotions', toApi(data, await categorias()))
      await this.refresh({ admin: true })
      return fromApi(saved)
    } catch (error) {
      throw errorCode(error)
    }
  },

  async update(id, data) {
    try {
      const { data: saved } = await api.put(`/admin/promotions/${id}`, toApi(data, await categorias()))
      await this.refresh({ admin: true })
      return fromApi(saved)
    } catch (error) {
      throw errorCode(error)
    }
  },

  async toggle(id) {
    try {
      await api.patch(`/admin/promotions/${id}/active`)
      await this.refresh({ admin: true })
    } catch (error) {
      throw errorCode(error)
    }
  },

  async toggleFeatured(id) {
    try {
      await api.patch(`/admin/promotions/${id}/featured`)
      await this.refresh({ admin: true })
    } catch (error) {
      throw errorCode(error)
    }
  },

  async remove(id) {
    try {
      await api.delete(`/admin/promotions/${id}`)
      await this.refresh({ admin: true })
    } catch (error) {
      throw errorCode(error)
    }
  },

  listPublished(user = null, options = {}) {
    const filterTipo = options?.tipoOferta
    const requireFeatured = Boolean(options?.onlyFeatured)
    return publishedCache
      .filter((item) => (!filterTipo || item.tipoOferta === filterTipo) && (!requireFeatured || item.destacada) && isAudienceEligible(item, user))
      .map((item) => {
        const { expMs, dias } = diasRestantesDe(item.fechaFin)
        return {
          ...item,
          titulo: item.nombre,
          descuentoTexto: item.tipoDescuento === 'porcentaje'
            ? `${item.valorDescuento}%`
            : `$${Number(item.valorDescuento).toLocaleString('es-CO')}`,
          expiracionMs: expMs,
          diasRestantes: dias,
          porAgotarse: dias <= 3 && dias >= 0,
          fechaOtorgado: new Date(item.creadaEn || Date.now()).toLocaleDateString('es-CO'),
          aplicado: false,
          imagenes: item.vehiculos.flatMap((v) => v.imageUrls).slice(0, 3),
        }
      })
      .sort((a, b) => (b.destacada ? 1 : 0) - (a.destacada ? 1 : 0))
  },

  listPublishedCoupons(user = null) {
    return this.listPublished(user, { tipoOferta: 'cupon' })
  },

  listFeaturedVehiclePromotions(user = null) {
    let promos = this.listPublished(user, { tipoOferta: 'promocion', onlyFeatured: true })
    if (promos.length === 0) promos = this.listPublished(user, { tipoOferta: 'promocion' })

    return promos.flatMap((promo) => promo.vehiculos.map((veh) => ({
      id: `${promo.id}-${veh.id}`,
      promoId: promo.id,
      vehiculoId: veh.id,
      vehiculoNombre: veh.name,
      titulo: promo.vehiculoId || promo.vehiculos.length === 1 ? promo.nombre : `${promo.nombre} (${veh.name})`,
      fechaPublicacion: new Date(promo.creadaEn || Date.now()).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      expiracionMs: promo.expiracionMs,
      tipoDescuento: promo.tipoDescuento,
      valorDescuento: promo.valorDescuento,
      descuentoPorcentaje: promo.tipoDescuento === 'porcentaje' ? promo.valorDescuento : null,
      codigo: promo.codigo,
      categoriaVehiculo: veh.categoryName,
      vehiculoImagen: veh.imageUrls?.[0] || '',
      precioBase: Number(veh.dailyRate),
    })))
  },

  listPublishedForVehicle(vehicle, user = null, options = {}) {
    const published = this.listPublished(user, options)
    if (!vehicle) return published
    return published.filter((item) => {
      if (item.vehiculoId) return String(item.vehiculoId) === String(vehicle.id)
      if (item.categoriaVehiculo && item.categoriaVehiculo !== 'Todos') {
        return Boolean(vehicle.categoria && item.categoriaVehiculo.toLowerCase() === vehicle.categoria.toLowerCase())
      }
      return true
    })
  },

  getPromotionForVehicle(vehicle, user = null, options = {}) {
    if (!vehicle) return null
    return this.listPublishedForVehicle(vehicle, user, options)[0] || null
  },

  /**
   * Solo localiza el cupón; el servidor valida vigencia, alcance, mínimo, audiencia y usos
   * al cotizar y al crear la reserva, y es quien calcula el descuento.
   */
  validateCode(code) {
    const promotion = this.list().find((item) => item.codigo === normalizeCode(code))
    if (!promotion) throw new Error('notFound')
    if (!promotion.activa) throw new Error('inactive')
    const hoy = new Date().toLocaleDateString('en-CA')
    if (hoy < promotion.fechaInicio) throw new Error('notStarted')
    if (hoy > promotion.fechaFin) throw new Error('expired')
    return {
      promotion,
      discount: 0,
      percentage: promotion.tipoDescuento === 'porcentaje' ? promotion.valorDescuento : null,
    }
  },
}
