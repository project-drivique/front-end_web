import initialPromotions from '../mocks/promotions.json'
import VEHICULOS_MOCK from '../mocks/vehicles.json'

const STORAGE_KEY = 'drivique_admin_promotions'
const AUDIT_KEY = 'drivique_management_audit'
const PUBLICATION_EVENT = 'drivique:promotions-updated'

function getStoredPromotions() {
  if (typeof window === 'undefined') return initialPromotions
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPromotions))
      return initialPromotions
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return initialPromotions
  }
}

const readAuditRecords = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(AUDIT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const normalizeCode = (value) => String(value || '').trim().toUpperCase().replace(/\s+/g, '')
const nowIso = () => new Date().toISOString()

function persist(promotions) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(promotions))
    window.dispatchEvent(new CustomEvent(PUBLICATION_EVENT))
  }
}

function audit(action, promotion, user) {
  const records = readAuditRecords()
  const entry = {
    id: `CRUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fecha: nowIso(),
    modulo: 'promociones',
    accion: action,
    entidadId: promotion.id,
    entidadNombre: promotion.codigo,
    usuario: user?.correo || user?.nombre || 'administrador',
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUDIT_KEY, JSON.stringify([entry, ...records].slice(0, 200)))
  }
}

function cleanData(data, promotions, editingId) {
  const codigo = normalizeCode(data.codigo)
  const nombre = String(data.nombre || '').trim()
  const tipoOferta = data.tipoOferta === 'promocion' ? 'promocion' : 'cupon'
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
  const destacada = Boolean(data.destacada)

  if (!codigo || !nombre || !fechaInicio || !fechaFin || !condiciones || !valorDescuento) throw new Error('required')
  if (!/^[A-Z0-9_-]{3,24}$/.test(codigo)) throw new Error('invalidCode')
  if (promotions.some((item) => item.id !== editingId && item.codigo === codigo)) throw new Error('duplicate')
  if (fechaFin < fechaInicio) throw new Error('invalidDates')
  if (tipoDescuento === 'porcentaje' && (valorDescuento <= 0 || valorDescuento > 100)) throw new Error('invalidPercentage')
  if (tipoDescuento === 'fijo' && valorDescuento <= 0) throw new Error('invalidValue')

  let vehiculoImagen = data.vehiculoImagen || ''
  if (!vehiculoImagen && (vehiculoId || vehiculoNombre)) {
    const matched = VEHICULOS_MOCK.find(
      (v) => (vehiculoId && Number(v.id) === Number(vehiculoId)) ||
             (vehiculoNombre && v.nombre.toLowerCase().includes(vehiculoNombre.toLowerCase()))
    )
    vehiculoImagen = matched?.imagenes?.[0] || matched?.imagen || ''
  }

  return {
    tipoOferta,
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
    vehiculoImagen,
    audiencia,
    condiciones,
    destacada,
  }
}

function isAudienceEligible(promotion, user) {
  if (!promotion.audiencia || promotion.audiencia === 'todos') return true
  const completed = Number(user?.reservasCompletadas || 0)
  if (promotion.audiencia === 'nuevos') return completed === 0
  if (promotion.audiencia === 'frecuentes') return completed >= 2
  return true
}

export const promotionManagementService = {
  eventName: PUBLICATION_EVENT,

  cleanStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('drivique_user_cupones')
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPromotions))
      window.dispatchEvent(new CustomEvent(PUBLICATION_EVENT))
    }
  },

  list() {
    const raw = getStoredPromotions()
    return raw.map((item) => {
      let vehiculoImagen = item.vehiculoImagen || ''
      if (!vehiculoImagen && (item.vehiculoId || item.vehiculoNombre)) {
        const matched = VEHICULOS_MOCK.find(
          (v) => (item.vehiculoId && Number(v.id) === Number(item.vehiculoId)) ||
                 (item.vehiculoNombre && v.nombre.toLowerCase().includes(item.vehiculoNombre.toLowerCase()))
        )
        vehiculoImagen = matched?.imagenes?.[0] || matched?.imagen || ''
      }
      const tipoOferta = item.tipoOferta || (item.vehiculoId || (item.categoriaVehiculo && item.categoriaVehiculo !== 'Todos') ? 'promocion' : 'cupon')
      return {
        ...item,
        tipoOferta,
        vehiculoImagen,
        destacada: Boolean(item.destacada),
        activa: item.activa !== false,
      }
    })
  },

  create(data, user) {
    const promotions = this.list()
    const clean = cleanData(data, promotions)
    const promotion = {
      id: `${clean.tipoOferta === 'promocion' ? 'PROMO' : 'CUPON'}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
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

  toggleFeatured(id, user) {
    const promotions = this.list()
    const current = promotions.find((item) => item.id === id)
    if (!current) throw new Error('notFound')
    const updated = { ...current, destacada: !current.destacada, actualizadaEn: nowIso() }
    persist(promotions.map((item) => (item.id === id ? updated : item)))
    audit(updated.destacada ? 'destacar' : 'quitar-destacado', updated, user)
    return updated
  },

  remove(id, user) {
    const promotions = this.list()
    const current = promotions.find((item) => item.id === id)
    if (!current) throw new Error('notFound')
    persist(promotions.filter((item) => item.id !== id))
    audit('eliminar', current, user)
  },

  listPublished(user = null, options = {}) {
    const today = new Date().toISOString().slice(0, 10)
    const nowMs = Date.now()
    const requireFeatured = Boolean(options?.onlyFeatured)
    const filterTipo = options?.tipoOferta

    return this.list()
      .filter((item) => {
        if (!item.activa) return false
        if (filterTipo && item.tipoOferta !== filterTipo) return false
        if (requireFeatured && !item.destacada) return false
        if (item.fechaInicio > today) return false
        if (item.fechaFin < today) return false
        const expMs = new Date(`${item.fechaFin}T23:59:59`).getTime()
        if (expMs < nowMs) return false
        return isAudienceEligible(item, user)
      })
      .map((item) => {
        let imagenes = []
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
          const catVehs = VEHICULOS_MOCK.filter((v) => v.categoria?.toLowerCase() === item.categoriaVehiculo.toLowerCase())
          imagenes = catVehs.slice(0, 3).map((v) => v.imagenes?.[0]).filter(Boolean)
        } else {
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
      .sort((a, b) => (b.destacada ? 1 : 0) - (a.destacada ? 1 : 0))
  },

  listPublishedCoupons(user = null) {
    return this.listPublished(user, { tipoOferta: 'cupon' })
  },

  listFeaturedVehiclePromotions(user = null) {
    let targetPromos = this.listPublished(user, { tipoOferta: 'promocion', onlyFeatured: true })
    if (targetPromos.length === 0) {
      targetPromos = this.listPublished(user, { tipoOferta: 'promocion' })
    }
    const results = []

    targetPromos.forEach((promo) => {
      // 1. Si apunta a un vehículo específico por ID
      if (promo.vehiculoId) {
        const veh = VEHICULOS_MOCK.find((v) => Number(v.id) === Number(promo.vehiculoId))
        if (veh) {
          results.push({
            id: `${promo.id}-${veh.id}`,
            promoId: promo.id,
            vehiculoId: veh.id,
            vehiculoNombre: veh.nombre,
            titulo: promo.nombre,
            fechaPublicacion: new Date(promo.creadaEn || Date.now()).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            expiracionMs: promo.expiracionMs,
            tipoDescuento: promo.tipoDescuento,
            valorDescuento: promo.valorDescuento,
            descuentoPorcentaje: promo.tipoDescuento === 'porcentaje' ? promo.valorDescuento : null,
            codigo: promo.codigo,
            categoriaVehiculo: veh.categoria,
            vehiculoImagen: veh.imagenes?.[0] || promo.vehiculoImagen || '',
            precioBase: veh.precio,
          })
          return
        }
      }

      // 2. Si apunta a un vehículo por nombre
      if (promo.vehiculoNombre) {
        const veh = VEHICULOS_MOCK.find((v) => v.nombre.toLowerCase().includes(promo.vehiculoNombre.toLowerCase()))
        if (veh) {
          results.push({
            id: `${promo.id}-${veh.id}`,
            promoId: promo.id,
            vehiculoId: veh.id,
            vehiculoNombre: veh.nombre,
            titulo: promo.nombre,
            fechaPublicacion: new Date(promo.creadaEn || Date.now()).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            expiracionMs: promo.expiracionMs,
            tipoDescuento: promo.tipoDescuento,
            valorDescuento: promo.valorDescuento,
            descuentoPorcentaje: promo.tipoDescuento === 'porcentaje' ? promo.valorDescuento : null,
            codigo: promo.codigo,
            categoriaVehiculo: veh.categoria,
            vehiculoImagen: veh.imagenes?.[0] || promo.vehiculoImagen || '',
            precioBase: veh.precio,
          })
          return
        }
      }

      // 3. Si apunta a una categoría específica
      if (promo.categoriaVehiculo && promo.categoriaVehiculo !== 'Todos') {
        const matchingVehs = VEHICULOS_MOCK.filter((v) => v.categoria?.toLowerCase() === promo.categoriaVehiculo.toLowerCase())
        matchingVehs.slice(0, 2).forEach((veh) => {
          results.push({
            id: `${promo.id}-${veh.id}`,
            promoId: promo.id,
            vehiculoId: veh.id,
            vehiculoNombre: veh.nombre,
            titulo: `${promo.nombre} (${veh.nombre})`,
            fechaPublicacion: new Date(promo.creadaEn || Date.now()).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            expiracionMs: promo.expiracionMs,
            tipoDescuento: promo.tipoDescuento,
            valorDescuento: promo.valorDescuento,
            descuentoPorcentaje: promo.tipoDescuento === 'porcentaje' ? promo.valorDescuento : null,
            codigo: promo.codigo,
            categoriaVehiculo: veh.categoria,
            vehiculoImagen: veh.imagenes?.[0] || '',
            precioBase: veh.precio,
          })
        })
        return
      }

      // 4. Si es para todos los vehículos
      const defaultVeh = VEHICULOS_MOCK[0]
      if (defaultVeh) {
        results.push({
          id: `${promo.id}-${defaultVeh.id}`,
          promoId: promo.id,
          vehiculoId: defaultVeh.id,
          vehiculoNombre: defaultVeh.nombre,
          titulo: promo.nombre,
          fechaPublicacion: new Date(promo.creadaEn || Date.now()).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          expiracionMs: promo.expiracionMs,
          tipoDescuento: promo.tipoDescuento,
          valorDescuento: promo.valorDescuento,
          descuentoPorcentaje: promo.tipoDescuento === 'porcentaje' ? promo.valorDescuento : null,
          codigo: promo.codigo,
          categoriaVehiculo: defaultVeh.categoria,
          vehiculoImagen: defaultVeh.imagenes?.[0] || '',
          precioBase: defaultVeh.precio,
        })
      }
    })

    return results
  },

  listPublishedForVehicle(vehicle, user = null, options = {}) {
    const published = this.listPublished(user, options)
    if (!vehicle) return published
    return published.filter((item) => {
      if (item.vehiculoId || item.vehiculoNombre) {
        const matchesId = item.vehiculoId && Number(item.vehiculoId) === Number(vehicle.id)
        const matchesName =
          item.vehiculoNombre &&
          vehicle.nombre &&
          (vehicle.nombre.toLowerCase().includes(item.vehiculoNombre.toLowerCase()) ||
            item.vehiculoNombre.toLowerCase().includes(vehicle.nombre.toLowerCase()))
        return matchesId || matchesName
      }
      if (item.categoriaVehiculo && item.categoriaVehiculo !== 'Todos') {
        return Boolean(
          vehicle.categoria &&
            item.categoriaVehiculo.toLowerCase() === vehicle.categoria.toLowerCase()
        )
      }
      return true
    })
  },

  getPromotionForVehicle(vehicle, user = null, options = {}) {
    if (!vehicle) return null
    const published = this.listPublishedForVehicle(vehicle, user, options)
    return published[0] || null
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

    if (promotion.vehiculoId && context.vehicleId) {
      if (Number(promotion.vehiculoId) !== Number(context.vehicleId)) {
        throw new Error('vehicleMismatch')
      }
    } else if (promotion.vehiculoNombre && context.vehicleName) {
      if (!context.vehicleName.toLowerCase().includes(promotion.vehiculoNombre.toLowerCase())) {
        throw new Error('vehicleMismatch')
      }
    }

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
