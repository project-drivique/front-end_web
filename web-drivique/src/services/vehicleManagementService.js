import initialVehicles from '../mocks/vehicles.json'
import { branchManagementService } from './branchManagementService'
import { cityManagementService } from './cityManagementService'
import { reservationService } from './reservationService'

const STORAGE_KEY = 'drivique_admin_vehicles'
const AUDIT_KEY = 'drivique_management_audit'
const ACTIVE_RESERVATION_STATES = new Set(['PENDIENTE', 'PENDIENTE_EFECTIVO', 'PENDIENTE_VALIDACION', 'CONFIRMADA', 'ACTIVA', 'EN_CURSO'])
export const VEHICLE_STATES = Object.freeze({ AVAILABLE: 'disponible', RESERVED: 'reservado', MAINTENANCE: 'mantenimiento' })

function readArray(key, fallback = []) { try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return Array.isArray(value) ? value : fallback } catch { return fallback } }
const normalizePlate = (value) => String(value || '').trim().toUpperCase().replace(/\s+/g, '')
const normalizeBranch = (value) => String(value || '').trim().toLocaleLowerCase()

function assertBranchScope(user, ...branchNames) {
  const managerRoles = new Set(['encargado', 'encargado_sucursal', 'branch_manager'])
  if (!managerRoles.has(user?.rol)) return
  const assignedBranch = user?.sucursalId || user?.sucursal || user?.sucursalAsignada
  if (!assignedBranch || branchNames.some((branch) => normalizeBranch(branch) !== normalizeBranch(assignedBranch))) {
    throw new Error('invalidBranch')
  }
}

function configuredVehicles() {
  return initialVehicles.map((vehicle) => ({ ...vehicle, estadoFlota: vehicle.estadoFlota || (vehicle.disponible === false ? VEHICLE_STATES.MAINTENANCE : VEHICLE_STATES.AVAILABLE) }))
}

function recordAudit(action, vehicle, user) {
  const records = readArray(AUDIT_KEY)
  const entry = { id: `CRUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, fecha: new Date().toISOString(), modulo: 'vehiculos', accion: action, entidadId: vehicle.id, entidadNombre: vehicle.nombre, usuario: user?.correo || user?.nombre || 'administrador' }
  localStorage.setItem(AUDIT_KEY, JSON.stringify([entry, ...records].slice(0, 200)))
}

function activeReservations(vehicleId) {
  return reservationService.getReservas().filter((reservation) => Number(reservation.vehiculoId) === Number(vehicleId) && ACTIVE_RESERVATION_STATES.has(String(reservation.estado || '').toUpperCase()))
}

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

function validate(data, vehicles, editingId) {
  const clean = {
    nombre: String(data.nombre || '').trim(), placa: normalizePlate(data.placa), categoria: String(data.categoria || '').trim(), transmision: String(data.transmision || '').trim(), combustible: String(data.combustible || '').trim(), color: String(data.color || '').trim(), año: Number(data.año), sucursal: String(data.sucursal || '').trim(), descripcion: String(data.descripcion || '').trim(), estadoFlota: data.estadoFlota || VEHICLE_STATES.AVAILABLE,
    puertas: Number(data.puertas), pasajeros: Number(data.pasajeros), maletero: Number(data.maletero), cilindraje: String(data.cilindraje || '').trim(), destacado: Boolean(data.destacado),
  }
  if (!clean.nombre || !clean.placa || !clean.categoria || !clean.transmision || !clean.combustible || !clean.color || !clean.año || !clean.sucursal || !clean.puertas || !clean.pasajeros) throw new Error('required')
  if (!/^[A-Z]{3}-?\d{3}$/.test(clean.placa)) throw new Error('invalidPlate')
  if (vehicles.some((vehicle) => vehicle.id !== editingId && normalizePlate(vehicle.placa) === clean.placa)) throw new Error('duplicatePlate')
  if (!branchManagementService.list().some((branch) => branch.nombre === clean.sucursal)) throw new Error('invalidBranch')
  if (!Object.values(VEHICLE_STATES).includes(clean.estadoFlota)) throw new Error('invalidState')
  return clean
}

function enrich(vehicle) {
  const active = activeReservations(vehicle.id).length
  const effectiveState = active ? VEHICLE_STATES.RESERVED : vehicle.estadoFlota
  return { ...vehicle, estadoEfectivo: effectiveState, disponible: effectiveState === VEHICLE_STATES.AVAILABLE, reservasActivas: active, picoYPlaca: getPicoYPlacaInfo(vehicle.placa, vehicle.sucursal) }
}

export const vehicleManagementService = {
  list() { return readArray(STORAGE_KEY, configuredVehicles()).map(enrich) },
  getById(id) { return this.list().find((vehicle) => Number(vehicle.id) === Number(id)) || null },
  activeReservationCount(id) { return activeReservations(id).length },
  create(data, user) {
    const vehicles = readArray(STORAGE_KEY, configuredVehicles())
    assertBranchScope(user, data.sucursal)
    const clean = validate(data, vehicles)
    const id = vehicles.reduce((max, vehicle) => Math.max(max, Number(vehicle.id) || 0), 0) + 1
    const branch = branchManagementService.list().find((item) => item.nombre === clean.sucursal)
    const vehicle = { id, ...clean, precio: Number(data.precioLimitado), calificacion: 0, disponible: clean.estadoFlota === VEHICLE_STATES.AVAILABLE, caracteristicas: data.caracteristicas || [], equipamientoTecnologico: data.equipamientoTecnologico || [], tarifas: { kmLimitado: { km: Number(data.kmLimitado), precio: Number(data.precioLimitado), excedente: Number(data.precioExcedente) }, kmIlimitado: { precio: Number(data.precioIlimitado) } }, seguros: data.seguros || [], servicios: [], imagenes: data.imagenes || [], disponibilidad: { ocupados: [] }, comentarios: [], sucursalInfo: { nombre: branch.nombre, direccion: branch.direccion, horario: '' } }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...vehicles, vehicle])); recordAudit('crear', vehicle, user); return enrich(vehicle)
  },
  update(id, data, user) {
    const vehicles = readArray(STORAGE_KEY, configuredVehicles()); const current = vehicles.find((vehicle) => Number(vehicle.id) === Number(id)); if (!current) throw new Error('notFound')
    assertBranchScope(user, current.sucursal, data.sucursal)
    const clean = validate(data, vehicles, current.id); const branch = branchManagementService.list().find((item) => item.nombre === clean.sucursal)
    const updated = { ...current, ...clean, precio: Number(data.precioLimitado), caracteristicas: data.caracteristicas || [], equipamientoTecnologico: data.equipamientoTecnologico || [], tarifas: { kmLimitado: { km: Number(data.kmLimitado), precio: Number(data.precioLimitado), excedente: Number(data.precioExcedente) }, kmIlimitado: { precio: Number(data.precioIlimitado) } }, seguros: data.seguros || [], imagenes: data.imagenes || [], sucursalInfo: { ...current.sucursalInfo, nombre: branch.nombre, direccion: branch.direccion } }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles.map((vehicle) => vehicle.id === current.id ? updated : vehicle))); recordAudit('editar', updated, user); return enrich(updated)
  },
  remove(id, user) {
    const vehicles = readArray(STORAGE_KEY, configuredVehicles()); const vehicle = vehicles.find((item) => Number(item.id) === Number(id)); if (!vehicle) throw new Error('notFound')
    assertBranchScope(user, vehicle.sucursal)
    const count = activeReservations(id).length; if (count) { const error = new Error('hasActiveReservations'); error.count = count; throw error }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles.filter((item) => Number(item.id) !== Number(id)))); recordAudit('eliminar', vehicle, user)
  },
}
