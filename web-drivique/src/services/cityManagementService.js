import initialCities from '../mocks/cities.json'
import branches from '../mocks/branches.json'

const STORAGE_KEY = 'drivique_admin_cities'
const AUDIT_KEY = 'drivique_management_audit'

const normalize = (value) => String(value || '').trim().toLocaleLowerCase('es')

function relatedCityNames(city) {
  const original = initialCities.find((item) => item.id === city.id)
  return new Set([normalize(city.nombre), normalize(original?.nombre)].filter(Boolean))
}

function countBranches(city) {
  const names = relatedCityNames(city)
  return branches.filter((branch) => names.has(normalize(branch.ciudad))).length
}

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null')
    return Array.isArray(value) ? value : fallback
  } catch {
    return fallback
  }
}

function saveCities(cities) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cities))
}

function recordAudit(action, city, user) {
  const records = readJson(AUDIT_KEY, [])
  const entry = {
    id: `CRUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fecha: new Date().toISOString(),
    modulo: 'ciudades',
    accion: action,
    entidadId: city.id,
    entidadNombre: city.nombre,
    usuario: user?.correo || user?.nombre || 'administrador',
  }
  localStorage.setItem(AUDIT_KEY, JSON.stringify([entry, ...records].slice(0, 200)))
}

function slugify(value) {
  return normalize(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

function validate(data, cities, editingId) {
  const nombre = String(data.nombre || '').trim()
  const departamento = String(data.departamento || '').trim()
  if (!nombre || !departamento) throw new Error('required')
  if (cities.some((city) => city.id !== editingId && normalize(city.nombre) === normalize(nombre))) throw new Error('duplicate')
  return { nombre, departamento }
}

export const cityManagementService = {
  list() {
    return readJson(STORAGE_KEY, initialCities).map((city) => ({ ...city }))
  },

  create(data, user) {
    const cities = this.list()
    const clean = validate(data, cities)
    const baseId = slugify(clean.nombre) || `ciudad_${Date.now()}`
    let id = baseId
    let suffix = 2
    while (cities.some((city) => city.id === id)) id = `${baseId}_${suffix++}`
    const city = {
      id,
      ...clean,
      tieneAeropuerto: Boolean(data.tieneAeropuerto),
      tieneTerminal: Boolean(data.tieneTerminal),
      picoYPlaca: { aplica: false, horario: 'Sin restricción', dias: 'N/A', esquema: 'ninguno', notaLink: '' },
    }
    saveCities([...cities, city])
    recordAudit('crear', city, user)
    return city
  },

  update(id, data, user) {
    const cities = this.list()
    const current = cities.find((city) => city.id === id)
    if (!current) throw new Error('notFound')
    const clean = validate(data, cities, id)
    const updated = { ...current, ...clean, tieneAeropuerto: Boolean(data.tieneAeropuerto), tieneTerminal: Boolean(data.tieneTerminal) }
    saveCities(cities.map((city) => city.id === id ? updated : city))
    recordAudit('editar', updated, user)
    return updated
  },

  remove(id, user) {
    const cities = this.list()
    const city = cities.find((item) => item.id === id)
    if (!city) throw new Error('notFound')
    const associated = countBranches(city)
    if (associated > 0) {
      const error = new Error('hasBranches')
      error.branchCount = associated
      throw error
    }
    saveCities(cities.filter((item) => item.id !== id))
    recordAudit('eliminar', city, user)
  },

  branchCount(cityOrName) {
    const city = typeof cityOrName === 'string'
      ? this.list().find((item) => item.nombre === cityOrName) || { nombre: cityOrName }
      : cityOrName
    return countBranches(city)
  },
}
