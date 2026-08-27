import initialPromotions from '../mocks/promotions.json'

const STORAGE_KEY = 'drivique_admin_promotions'
const AUDIT_KEY = 'drivique_management_audit'
const PUBLICATION_EVENT = 'drivique:promotions-updated'

const readJson = (key, fallback = []) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null')
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
  const audiencia = String(data.audiencia || 'todos')
  const condiciones = String(data.condiciones || '').trim()

  if (!codigo || !nombre || !fechaInicio || !fechaFin || !condiciones || !valorDescuento) throw new Error('required')
  if (!/^[A-Z0-9_-]{4,24}$/.test(codigo)) throw new Error('invalidCode')
  if (promotions.some((item) => item.id !== editingId && item.codigo === codigo)) throw new Error('duplicate')
  if (fechaFin < fechaInicio) throw new Error('invalidDates')
  if (tipoDescuento === 'porcentaje' && (valorDescuento <= 0 || valorDescuento > 100)) throw new Error('invalidPercentage')
  if (tipoDescuento === 'fijo' && valorDescuento <= 0) throw new Error('invalidValue')

  return { codigo, nombre, tipoDescuento, valorDescuento, fechaInicio, fechaFin, reservaMinima, categoriaVehiculo, audiencia, condiciones }
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
    const promotion = { id: `PROMO-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, ...clean, activa: data.activa !== false, creadaEn: nowIso(), actualizadaEn: nowIso() }
    persist([promotion, ...promotions])
    audit('crear', promotion, user)
    return promotion
  },

  update(id, data, user) {
    const promotions = this.list()
    const current = promotions.find((item) => item.id === id)
    if (!current) throw new Error('notFound')
    const updated = { ...current, ...cleanData(data, promotions, id), activa: Boolean(data.activa), actualizadaEn: nowIso() }
    persist(promotions.map((item) => item.id === id ? updated : item))
    audit('editar', updated, user)
    return updated
  },

  toggle(id, user) {
    const promotions = this.list()
    const current = promotions.find((item) => item.id === id)
    if (!current) throw new Error('notFound')
    const updated = { ...current, activa: !current.activa, actualizadaEn: nowIso() }
    persist(promotions.map((item) => item.id === id ? updated : item))
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

  listPublished(user) {
    const today = new Date().toISOString().slice(0, 10)
    return this.list().filter((item) => item.activa && item.fechaInicio <= today && item.fechaFin >= today && isAudienceEligible(item, user)).map((item) => ({
      ...item,
      titulo: item.nombre,
      descuentoTexto: item.tipoDescuento === 'porcentaje' ? `${item.valorDescuento}%` : `$${item.valorDescuento.toLocaleString('es-CO')}`,
      expiracionMs: new Date(`${item.fechaFin}T23:59:59`).getTime(),
      fechaOtorgado: new Date(item.creadaEn).toLocaleDateString('es-CO'),
      aplicado: false,
      imagenes: [],
    }))
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
    if (promotion.categoriaVehiculo !== 'Todos' && String(context.category || '').toLowerCase() !== promotion.categoriaVehiculo.toLowerCase()) throw new Error('category')
    const rawDiscount = promotion.tipoDescuento === 'porcentaje'
      ? Math.round(Number(context.total || 0) * promotion.valorDescuento / 100)
      : promotion.valorDescuento
    return { promotion, discount: Math.min(Number(context.total || 0), rawDiscount) }
  },
}
