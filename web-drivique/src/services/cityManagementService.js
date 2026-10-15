import { api } from './httpClient'
import { CIUDADES, cargarUbicaciones } from '../modules/catalog/constants'
import ciudadesMetadata from '../mocks/cities.json'

const normalize = (value) => String(value || '').trim().toLocaleLowerCase('es')

let cities = []
let departments = []
let branchCountByCity = {}

const mapCity = (c) => ({
  id: c.id,
  nombre: c.name,
  departamento: c.departmentName,
  departmentId: c.departmentId,
  tieneAeropuerto: c.hasAirport,
  tieneTerminal: c.hasTerminal,
  picoYPlaca: ciudadesMetadata.find((m) => m.nombre === c.name)?.picoYPlaca,
})

function toError(error, code) {
  const result = new Error(code)
  result.serverMessage = error?.response?.data?.detail
  return result
}

function cityPayload(data) {
  const department = departments.find((d) => normalize(d.name) === normalize(data.departamento))
  if (!String(data.nombre || '').trim() || !department) throw new Error('required')
  return {
    departmentId: department.id,
    name: String(data.nombre).trim(),
    hasAirport: Boolean(data.tieneAeropuerto),
    hasTerminal: Boolean(data.tieneTerminal),
  }
}

export const cityManagementService = {
  async refresh() {
    const [{ data: cityList }, { data: departmentList }, { data: branchList }] = await Promise.all([
      api.get('/cities'),
      api.get('/departments'),
      api.get('/branches').catch(() => ({ data: [] })),
    ])
    cities = cityList.map(mapCity)
    departments = departmentList
    branchCountByCity = {}
    branchList.forEach((b) => { branchCountByCity[b.cityId] = (branchCountByCity[b.cityId] || 0) + 1 })
    return this.list()
  },

  list() {
    return (cities.length ? cities : CIUDADES).map((city) => ({ ...city }))
  },

  departments() {
    return departments.map((d) => ({ id: d.id, nombre: d.name }))
  },

  async create(data) {
    const body = cityPayload(data)
    try {
      await api.post('/cities', body)
    } catch (error) {
      throw toError(error, 'duplicate')
    }
    await this.refresh()
    await cargarUbicaciones()
  },

  async update(id, data) {
    const body = cityPayload(data)
    try {
      await api.put(`/cities/${id}`, body)
    } catch (error) {
      throw toError(error, 'duplicate')
    }
    await this.refresh()
    await cargarUbicaciones()
  },

  async remove(id) {
    try {
      await api.delete(`/cities/${id}`)
    } catch (error) {
      const result = toError(error, error?.response?.status === 409 ? 'hasBranches' : 'serverError')
      result.branchCount = branchCountByCity[id] || 0
      throw result
    }
    await this.refresh()
    await cargarUbicaciones()
  },

  branchCount(cityOrName) {
    const city = typeof cityOrName === 'string'
      ? this.list().find((item) => item.nombre === cityOrName)
      : cityOrName
    return city ? (branchCountByCity[city.id] || 0) : 0
  },
}
