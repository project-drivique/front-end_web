import initialBranches from '../mocks/branches.json'
import vehicles from '../mocks/vehicles.json'
import { cityManagementService } from './cityManagementService'
import { reservationService } from './reservationService'
import { mockUsersStorage } from './mockUsersStorage'
import accessConfig from '../mocks/adminAccessConfig.json'

const STORAGE_KEY = 'drivique_admin_branches'
const AUDIT_KEY = 'drivique_management_audit'
const normalize = (value) => String(value || '').trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const slugify = (value) => normalize(value).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
const compact = (value) => normalize(value).replace(/[^a-z0-9]/g, '')

function readArray(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null')
    return Array.isArray(value) ? value : fallback
  } catch { return fallback }
}

function configuredBranches() {
  const managers = mockUsersStorage.listar().filter((user) => user.rol === accessConfig.roles.branchManager)
  return initialBranches.map((branch) => {
    const assigned = managers.find((manager) => {
      const managerBranch = compact(manager.sucursalId)
      const branchName = compact(branch.nombre)
      return managerBranch && (branchName.includes(managerBranch) || managerBranch.includes(branchName))
    })
    return { id: branch.id || slugify(branch.nombre), ...branch, encargadoId: branch.encargadoId || assigned?.correo || '', autorizadoPagoEfectivo: branch.autorizadoPagoEfectivo ?? true }
  })
}

function recordAudit(action, branch, user) {
  const records = readArray(AUDIT_KEY)
  const entry = { id: `CRUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, fecha: new Date().toISOString(), modulo: 'sucursales', accion: action, entidadId: branch.id, entidadNombre: branch.nombre, usuario: user?.correo || user?.nombre || 'administrador' }
  localStorage.setItem(AUDIT_KEY, JSON.stringify([entry, ...records].slice(0, 200)))
}

function validate(data, branches, editingId) {
  const clean = { nombre: String(data.nombre || '').trim(), ciudad: String(data.ciudad || '').trim(), direccion: String(data.direccion || '').trim(), encargadoId: String(data.encargadoId || '').trim(), autorizadoPagoEfectivo: Boolean(data.autorizadoPagoEfectivo) }
  if (!clean.nombre || !clean.ciudad || !clean.direccion || !clean.encargadoId) throw new Error('required')
  if (!cityManagementService.list().some((city) => city.nombre === clean.ciudad)) throw new Error('invalidCity')
  if (!mockUsersStorage.listar().some((user) => user.correo === clean.encargadoId && user.rol === accessConfig.roles.branchManager)) throw new Error('invalidManager')
  if (branches.some((branch) => branch.id !== editingId && normalize(branch.nombre) === normalize(clean.nombre))) throw new Error('duplicate')
  return clean
}

function relatedNames(branch) {
  const original = configuredBranches().find((item) => item.id === branch.id)
  return new Set([normalize(branch.nombre), normalize(original?.nombre)].filter(Boolean))
}

function associations(branch) {
  const names = relatedNames(branch)
  const associatedVehicles = vehicles.filter((vehicle) => names.has(normalize(vehicle.sucursal)))
  const vehicleIds = new Set(associatedVehicles.map((vehicle) => Number(vehicle.id)))
  const associatedReservations = reservationService.getReservas().filter((reservation) => {
    const detail = reservation.reservaDetalles || {}
    return vehicleIds.has(Number(reservation.vehiculoId)) || [detail.sucursalRetiro, detail.sucursalDevolucion, detail.sucursalPagoEfectivo].some((name) => names.has(normalize(name)))
  })
  return { vehicles: associatedVehicles.length, reservations: associatedReservations.length }
}

export const branchManagementService = {
  list() { return readArray(STORAGE_KEY, configuredBranches()).map((branch) => ({ ...branch })) },
  managers() { return mockUsersStorage.listar().filter((user) => user.rol === accessConfig.roles.branchManager && user.activo !== false) },
  getCashAuthorized() { return this.list().filter((branch) => branch.autorizadoPagoEfectivo) },
  associations,
  managerName(branch) {
    const manager = this.managers().find((user) => user.correo === branch.encargadoId)
    return manager ? `${manager.nombre || ''} ${manager.apellido || ''}`.trim() || manager.correo : ''
  },
  create(data, user) {
    const branches = this.list()
    const clean = validate(data, branches)
    const base = slugify(clean.nombre) || `sucursal_${Date.now()}`
    let id = base; let suffix = 2
    while (branches.some((branch) => branch.id === id)) id = `${base}_${suffix++}`
    const branch = { id, ...clean }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...branches, branch]))
    recordAudit('crear', branch, user)
    return branch
  },
  update(id, data, user) {
    const branches = this.list()
    const current = branches.find((branch) => branch.id === id)
    if (!current) throw new Error('notFound')
    const updated = { ...current, ...validate(data, branches, id) }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(branches.map((branch) => branch.id === id ? updated : branch)))
    recordAudit('editar', updated, user)
    return updated
  },
  remove(id, user) {
    const branches = this.list()
    const branch = branches.find((item) => item.id === id)
    if (!branch) throw new Error('notFound')
    const linked = associations(branch)
    if (linked.vehicles || linked.reservations) { const error = new Error('hasAssociations'); error.linked = linked; throw error }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(branches.filter((item) => item.id !== id)))
    recordAudit('eliminar', branch, user)
  },
}
