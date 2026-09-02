import initialPromotions from '../mocks/promotions.json'
import VEHICULOS_MOCK from '../mocks/vehicles.json'

const STORAGE_KEY = 'drivique_admin_promotions'
const AUDIT_KEY = 'drivique_management_audit'
const PUBLICATION_EVENT = 'drivique:promotions-updated'

const readJson = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

const normalizeCode = (value) => String(value || '').trim().toUpperCase().replace(/\s+/g, '')
const nowIso = () => new Date().toISOString()

function persist(promotions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(promotions))
  window.dispatchEvent(new CustomEvent(PUBLICATION_EVENT))
}

function audit(action, promotion, user) {
  const records = readJson(AUDIT_KEY)
  const entry = {
    id: `CRUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fecha: nowIso(),
    modulo: 'promociones',
    accion: action,
    entidadId: promotion.id,
    entidadNombre: promotion.codigo,
    usuario: user?.correo || user?.nombre || 'administrador',
  }
  localStorage.setItem(AUDIT_KEY, JSON.stringify([entry, ...records].slice(0, 200)))
}

function cleanData(data, promotions, editingId) {
  const codigo = normalizeCode(data.codigo)
  const nombre = String(data.nombre || '').trim()
  const tipoDescuento = data.tipoDescuento === 'fijo' ? 'fijo' : 'porcentaje'
  const valorDescuento = Number(data.valorDescuento)
  const fechaInicio = String(data.fechaInicio || '')
  const fechaFin = String(data.fechaFin || '')
  const reservaMinima = Math.max(0, Number(data.reservaMinima) || 0)
  const categoriaVehiculo = String(data.categoriaVehiculo || 'Todos').trim()
  const vehiculoId = data.vehiculoId ? Number(data.vehiculoId) : null
  const vehiculoNombre = String(data.vehiculoNombre || '').trim()
  const audiencia = String(data.audiencia || 'todos')
  const condiciones = String(data.condiciones || '').trim()

  if (!codigo || !nombre || !fechaInicio || !fechaFin || !condiciones || !valorDescuento) throw new Error('required')
  if (!/^[A-Z0-9_-]{3,24}$/.test(codigo)) throw new Error('invalidCode')
  if (promotions.some((item) => item.id !== editingId && item.codigo === codigo)) throw new Error('duplicate')
  if (fechaFin < fechaInicio) throw new Error('invalidDates')
  if (tipoDescuento === 'porcentaje' && (valorDescuento <= 0 || valorDescuento > 100)) throw new Error('invalidPercentage')
  if (tipoDescuento === 'fijo' && valorDescuento <= 0) throw new Error('invalidValue')

  return {
    codigo,
    nombre,
    tipoDescuento,
    valorDescuento,
    fechaInicio,
    fechaFin,
    reservaMinima,
    categoriaVehiculo,
    vehiculoId,
    vehiculoNombre,
    audiencia,
    condiciones,
  }
}

function isAudienceEligible(promotion, user) {
  if (promotion.audiencia === 'todos') return true
  const completed = Number(user?.reservasCompletadas || 0)
  if (promotion.audiencia === 'nuevos') return completed === 0
  if (promotion.audiencia === 'frecuentes') return completed >= 2
  return true
}

export const promotionManagementService = {
  eventName: PUBLICATION_EVENT,

  list() {
    return readJson(STORAGE_KEY, initialPromotions).map((item) => ({ ...item }))
  },

  create(data, user) {
    const promotions = this.list()
    const clean = cleanData(data, promotions)
    const promotion = {
      id: `PROMO-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      ...clean,
      activa: data.activa !== false,
      creadaEn: nowIso(),
      actualizadaEn: nowIso(),
    }
    persist([promotion, ...promotions])
    audit('crear', promotion, user)
    return promotion
  },

  update(id, data, user) {
    const promotions = this.list()
    const current = promotions.find((item) => item.id === id)
    if (!current) throw new Error('notFound')
    const updated = {
      ...current,
      ...cleanData(data, promotions, id),
      activa: Boolean(data.activa),
      actualizadaEn: nowIso(),
    }
    persist(promotions.map((item) => (item.id === id ? updated : item)))
    audit('editar', updated, user)
    return updated
  },

  toggle(id, user) {
    const promotions = this.list()
    const current = promotions.find((item) => item.id === id)
    if (!current) throw new Error('notFound')
    const updated = { ...current, activa: !current.activa, actualizadaEn: nowIso() }
    persist(promotions.map((item) => (item.id === id ? updated : item)))
    audit(updated.activa ? 'activar' : 'desactivar', updated, user)
    return updated
  },

  remove(id, user) {
    const promotions = this.list()
    const current = promotions.find((item) => item.id === id)
    if (!current) throw new Error('notFound')
    persist(promotions.filter((item) => item.id !== id))
    audit('eliminar', current, user)
  },

  listPublished(user = null) {
    const today = new Date().toISOString().slice(0, 10)
    const nowMs = Date.now()
    return this.list()
      .filter((item) => {
        if (!item.activa) return false
        if (item.fechaInicio > today) return false
        if (item.fechaFin < today) return false
        const expMs = new Date(`${item.fechaFin}T23:59:59`).getTime()
        if (expMs < nowMs) return false
        return isAudienceEligible(item, user)
      })
      .map((item) => {
        let imagenes = []
        // 1. Si es para un vehículo específico, obtener sus fotos
        if (item.vehiculoId) {
          const veh = VEHICULOS_MOCK.find((v) => Number(v.id) === Number(item.vehiculoId))
          if (veh?.imagenes?.length) {
            imagenes = veh.imagenes.slice(0, 3)
          }
        } else if (item.vehiculoNombre) {
          const veh = VEHICULOS_MOCK.find((v) => v.nombre.toLowerCase().includes(item.vehiculoNombre.toLowerCase()))
          if (veh?.imagenes?.length) {
            imagenes = veh.imagenes.slice(0, 3)
          }
        } else if (item.categoriaVehiculo && item.categoriaVehiculo !== 'Todos') {
          // 2. Si es para una categoría específica, obtener fotos de vehículos de esa categoría
          const catVehs = VEHICULOS_MOCK.filter((v) => v.categoria?.toLowerCase() === item.categoriaVehiculo.toLowerCase())
          imagenes = catVehs.slice(0, 3).map((v) => v.imagenes?.[0]).filter(Boolean)
        } else {
          // 3. Si es para todos los vehículos, obtener fotos representativas
          imagenes = VEHICULOS_MOCK.slice(0, 3).map((v) => v.imagenes?.[0]).filter(Boolean)
        }

        const expMs = new Date(`${item.fechaFin}T23:59:59`).getTime()
        const diffMs = expMs - nowMs
        const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

        return {
          ...item,
          titulo: item.nombre,
          descuentoTexto:
            item.tipoDescuento === 'porcentaje'
              ? `${item.valorDescuento}%`
              : `$${Number(item.valorDescuento).toLocaleString('es-CO')}`,
          expiracionMs: expMs,
          diasRestantes,
          porAgotarse: diasRestantes <= 3 && diasRestantes >= 0,
          fechaOtorgado: new Date(item.creadaEn || Date.now()).toLocaleDateString('es-CO'),
          aplicado: false,
          imagenes,
        }
      })
  },

  getPromotionForVehicle(vehicle, user = null) {
    if (!vehicle) return null
    const published = this.listPublished(user)
    
    // 1. Coincidencia por vehículo específico
    const specificPromo = published.find((p) =>
      (p.vehiculoId && Number(p.vehiculoId) === Number(vehicle.id)) ||
      (p.vehiculoNombre && vehicle.nombre && vehicle.nombre.toLowerCase().includes(p.vehiculoNombre.toLowerCase()))
    )
    if (specificPromo) return specificPromo

    // 2. Coincidencia por categoría específica
    const catPromo = published.find((p) =>
      p.categoriaVehiculo &&
      p.categoriaVehiculo !== 'Todos' &&
      vehicle.categoria &&
      p.categoriaVehiculo.toLowerCase() === vehicle.categoria.toLowerCase()
    )
    if (catPromo) return catPromo

    // 3. Promoción global para todos los vehículos
    const globalPromo = published.find((p) => p.categoriaVehiculo === 'Todos' && !p.vehiculoId)
    return globalPromo || null
  },

  validateCode(code, context = {}) {
    const promotion = this.list().find((item) => item.codigo === normalizeCode(code))
    if (!promotion) throw new Error('notFound')
    const today = new Date().toISOString().slice(0, 10)
    if (!promotion.activa) throw new Error('inactive')
    if (today < promotion.fechaInicio) throw new Error('notStarted')
    if (today > promotion.fechaFin) throw new Error('expired')
    if (!isAudienceEligible(promotion, context.user)) throw new Error('audience')
    if (Number(context.total || 0) < promotion.reservaMinima) throw new Error('minimum')

    // Validar vehículo específico si la promoción lo restringe
    if (promotion.vehiculoId && context.vehicleId) {
      if (Number(promotion.vehiculoId) !== Number(context.vehicleId)) {
        throw new Error('vehicleMismatch')
      }
    } else if (promotion.vehiculoNombre && context.vehicleName) {
      if (!context.vehicleName.toLowerCase().includes(promotion.vehiculoNombre.toLowerCase())) {
        throw new Error('vehicleMismatch')
      }
    }

    // Validar categoría si la promoción no es 'Todos'
    if (promotion.categoriaVehiculo && promotion.categoriaVehiculo !== 'Todos' && context.category) {
      if (String(context.category).toLowerCase() !== promotion.categoriaVehiculo.toLowerCase()) {
        throw new Error('category')
      }
    }

    const rawDiscount =
      promotion.tipoDescuento === 'porcentaje'
        ? Math.round((Number(context.total || 0) * promotion.valorDescuento) / 100)
        : promotion.valorDescuento

    return {
      promotion,
      discount: Math.min(Number(context.total || 0), rawDiscount),
      percentage: promotion.tipoDescuento === 'porcentaje' ? promotion.valorDescuento : null,
    }
  },
}
