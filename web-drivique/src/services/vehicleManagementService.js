import { api } from './httpClient'
import { branchManagementService } from './branchManagementService'
import { cityManagementService } from './cityManagementService'
import { reservationManagementService } from './reservationManagementService'

export const VEHICLE_STATES = Object.freeze({ AVAILABLE: 'disponible', RESERVED: 'reservado', MAINTENANCE: 'mantenimiento' })

const ESTADO_POR_CODIGO = { AVAILABLE: 'disponible', RENTED: 'reservado', MAINTENANCE: 'mantenimiento', INACTIVE: 'inactivo' }
const CODIGO_POR_ESTADO = { disponible: 'AVAILABLE', reservado: 'RENTED', mantenimiento: 'MAINTENANCE', inactivo: 'INACTIVE' }
const ESTADOS_RESERVA_FINAL = new Set(['cancelada', 'finalizada'])

let cache = []
let lookups = { brands: [], transmissions: [], fuels: [], statuses: [], categories: [] }

const normalizePlate = (value) => String(value || '').trim().toUpperCase().replace(/\s+/g, '')

export function calculatePicoYPlaca(plate) {
  const match = normalizePlate(plate).match(/\d(?=[^\d]*$)/)
  const digit = match ? Number(match[0]) : null
  const days = { 1: 'lunes', 2: 'lunes', 3: 'martes', 4: 'martes', 5: 'miercoles', 6: 'miercoles', 7: 'jueves', 8: 'jueves', 9: 'viernes', 0: 'viernes' }
  return { ultimoDigito: digit, dia: digit === null ? null : days[digit] }
}

export function getPicoYPlacaInfo(plate, branchName) {
  const calculated = calculatePicoYPlaca(plate)
  const branch = branchManagementService.list().find((item) => item.nombre === branchName)
  const city = cityManagementService.list().find((item) => item.nombre === branch?.ciudad)
  const configuration = city?.picoYPlaca
  if (!city || !configuration) return { ...calculated, ciudad: branch?.ciudad || null, estado: 'consulta', dia: null, enlaceOficial: '' }
  if (!configuration.aplica) return { ...calculated, ciudad: city.nombre, estado: 'sin_restriccion', dia: null, enlaceOficial: configuration.notaLink || '' }
  return { ...calculated, ciudad: city.nombre, estado: calculated.dia ? 'orientativo' : 'consulta', enlaceOficial: configuration.notaLink || '', horario: configuration.horario || '' }
}

const reservasActivas = (vehicleId) => reservationManagementService.list()
  .filter((r) => String(r.vehiculoId) === String(vehicleId) && !ESTADOS_RESERVA_FINAL.has(r.estado)).length

function mapear(v) {
  const estadoFlota = v.isActive ? (ESTADO_POR_CODIGO[v.statusCode] || 'disponible') : 'inactivo'
  const activas = reservasActivas(v.id)
  const estadoEfectivo = activas ? VEHICLE_STATES.RESERVED : estadoFlota
  return {
    id: v.id,
    nombre: `${v.brandName} ${v.model}`.trim(),
    marca: v.brandName,
    modelo: v.model,
    placa: v.plate,
    vin: v.vin,
    categoria: v.categoryName,
    transmision: v.transmissionTypeName,
    combustible: v.fuelTypeName,
    color: v.color || '',
    ano: v.year,
    año: v.year,
    sucursal: v.currentBranchName,
    ciudad: v.currentCityName,
    kilometraje: v.mileage,
    puertas: v.doorsCount,
    pasajeros: v.passengerCapacity,
    maletero: v.trunkCapacityLiters,
    destacado: v.isFeatured,
    precio: Number(v.dailyRate),
    precioLimitado: Number(v.dailyRate),
    tarifas: { kmLimitado: { precio: Number(v.dailyRate) }, kmIlimitado: { precio: Number(v.dailyRate) } },
    imagenes: v.mainImageUrl ? [v.mainImageUrl] : [],
    seguros: [],
    caracteristicas: [],
    activo: v.isActive,
    estadoFlota,
    estadoEfectivo,
    disponible: estadoEfectivo === VEHICLE_STATES.AVAILABLE,
    reservasActivas: activas,
    picoYPlaca: getPicoYPlacaInfo(v.plate, v.currentBranchName),
  }
}

function toError(error) {
  const result = new Error(error?.response?.data?.detail || error?.message || 'No fue posible completar la operación.')
  result.status = error?.response?.status
  const errors = error?.response?.data?.errors
  if (Array.isArray(errors) && errors.length) result.message = errors.map((e) => e.message || e.field).join(' · ')
  return result
}

const porNombre = (lista, nombre) => lista.find((item) => String(item.name).toLowerCase() === String(nombre || '').toLowerCase())

function payload(data) {
  const brand = porNombre(lookups.brands, data.marca)
  const category = porNombre(lookups.categories, data.categoria)
  const transmission = porNombre(lookups.transmissions, data.transmision)
  const fuel = porNombre(lookups.fuels, data.combustible)
  const branch = branchManagementService.list().find((b) => b.nombre === data.sucursal)
  if (!brand || !category || !transmission || !fuel || !branch) throw new Error('Completa marca, categoría, transmisión, combustible y sucursal.')
  const status = lookups.statuses.find((s) => s.code === CODIGO_POR_ESTADO[data.estadoEfectivo || 'disponible'])
  return {
    plate: normalizePlate(data.placa),
    vin: String(data.vin || '').trim().toUpperCase(),
    brandId: brand.id,
    categoryId: category.id,
    transmissionTypeId: transmission.id,
    fuelTypeId: fuel.id,
    statusId: status?.id,
    currentBranchId: branch.id,
    model: String(data.modelo || '').trim(),
    year: Number(data.ano),
    color: String(data.color || '').trim(),
    passengerCapacity: Number(data.pasajeros) || 5,
    doorsCount: Number(data.puertas) || 4,
    trunkCapacityLiters: data.maletero === '' || data.maletero == null ? null : Number(data.maletero),
    mileage: Number(data.kilometraje) || 0,
    dailyRate: Number(data.precioLimitado),
    mainImageUrl: data.imagenes?.[0] || null,
    isFeatured: Boolean(data.destacado),
  }
}

export const vehicleManagementService = {
  async refresh() {
    const [vehicles, brands, transmissions, fuels, statuses, categories] = await Promise.all([
      api.get('/admin/vehicles', { params: { size: 500 } }),
      api.get('/vehicle-brands'),
      api.get('/transmission-types'),
      api.get('/fuel-types'),
      api.get('/vehicle-statuses'),
      api.get('/vehicle-categories'),
    ])
    lookups = {
      brands: brands.data, transmissions: transmissions.data, fuels: fuels.data,
      statuses: statuses.data, categories: categories.data,
    }
    cache = (vehicles.data?.content || []).map(mapear)
    return this.list()
  },

  list() { return cache.map((vehicle) => ({ ...vehicle })) },

  lookups() {
    return {
      brands: lookups.brands.map((b) => b.name),
      transmissions: lookups.transmissions.map((t) => t.name),
      fuels: lookups.fuels.map((f) => f.name),
    }
  },

  async categories() {
    if (!lookups.categories.length) {
      const { data } = await api.get('/vehicle-categories')
      lookups = { ...lookups, categories: data }
    }
    return lookups.categories.map((c) => ({ id: c.id, name: c.name }))
  },

  getById(id) { return this.list().find((vehicle) => String(vehicle.id) === String(id)) || null },

  activeReservationCount(id) { return reservasActivas(id) },

  async create(data) {
    try {
      await api.post('/admin/vehicles', payload(data))
    } catch (error) {
      throw error?.response ? toError(error) : error
    }
    return this.refresh()
  },

  async update(id, data) {
    try {
      await api.put(`/admin/vehicles/${id}`, payload(data))
    } catch (error) {
      throw error?.response ? toError(error) : error
    }
    return this.refresh()
  },

  async changeState(id, estado) {
    try {
      await api.patch(`/admin/vehicles/${id}/status`, { statusCode: CODIGO_POR_ESTADO[estado] })
    } catch (error) {
      throw toError(error)
    }
    return this.refresh()
  },

  async remove(id) {
    try {
      await api.delete(`/admin/vehicles/${id}`)
    } catch (error) {
      throw toError(error)
    }
    return this.refresh()
  },
}
