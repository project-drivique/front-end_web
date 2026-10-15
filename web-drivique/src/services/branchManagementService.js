import { api } from './httpClient'
import { SUCURSALES, cargarUbicaciones } from '../modules/catalog/constants'
import { cityManagementService } from './cityManagementService'

const hhmm = (time) => String(time || '').slice(0, 5)

let branches = []
let managers = []

const mapBranch = (b, encargadoId = '') => ({
  id: b.id,
  nombre: b.name,
  ciudad: b.cityName,
  cityId: b.cityId,
  direccion: b.address,
  telefono: b.phone,
  apertura: hhmm(b.openingTime),
  cierre: hhmm(b.closingTime),
  horario: `${hhmm(b.openingTime)} - ${hhmm(b.closingTime)}`,
  autorizadoPagoEfectivo: b.allowsCashPayment,
  estado: b.isActive ? 'activa' : 'inactiva',
  capacidadVehiculos: b.vehicleCapacity,
  vehiculos: b.vehicleCount ?? 0,
  encargadoId,
})

function toError(error) {
  const result = new Error(error?.response?.data?.detail || error?.response?.data?.title || 'No fue posible guardar los cambios.')
  result.status = error?.response?.status
  return result
}

function payload(data) {
  const city = cityManagementService.list().find((c) => c.nombre === data.ciudad)
  if (!String(data.nombre || '').trim() || !city || !String(data.direccion || '').trim()) {
    throw new Error('Completa nombre, ciudad y dirección.')
  }
  if (!data.apertura || !data.cierre || data.cierre <= data.apertura) {
    throw new Error('El horario de cierre debe ser posterior al de apertura.')
  }
  return {
    name: String(data.nombre).trim(),
    address: String(data.direccion).trim(),
    cityId: city.id,
    phone: String(data.telefono || '').trim(),
    openingTime: data.apertura,
    closingTime: data.cierre,
    allowsCashPayment: Boolean(data.autorizadoPagoEfectivo),
    vehicleCapacity: Number(data.capacidadVehiculos) || undefined,
  }
}

async function assignManager(branchId, previousEmail, nextEmail) {
  if (previousEmail === nextEmail) return
  const previous = managers.find((m) => m.correo === previousEmail)
  const next = managers.find((m) => m.correo === nextEmail)
  if (previous) await api.delete(`/branches/${branchId}/staff/${previous.id}`).catch(() => {})
  if (next) {
    await api.post(`/branches/${branchId}/staff/${next.id}`).catch((error) => {
      if (error?.response?.status !== 409) throw error
    })
  }
}

export const branchManagementService = {
  async refresh() {
    await cityManagementService.refresh()
    try {
      const [{ data: list }, { data: managerList }] = await Promise.all([
        api.get('/branches/admin'),
        api.get('/branches/managers'),
      ])
      const staff = await Promise.all(
        list.map((b) => api.get(`/branches/${b.id}/staff`).then((r) => r.data).catch(() => []))
      )
      managers = managerList.map((m) => ({ id: m.userId, correo: m.email, nombre: m.fullName, apellido: '', activo: true }))
      branches = list.map((b, index) => mapBranch(b, staff[index].find((s) => s.roleCodes?.includes('BRANCH_ADMIN'))?.email || ''))
    } catch {
      branches = []
    }
    return this.list()
  },

  list() {
    return (branches.length ? branches : SUCURSALES).map((branch) => ({ ...branch }))
  },

  managers() { return managers },

  getCashAuthorized() {
    return this.list().filter((branch) => branch.autorizadoPagoEfectivo && branch.estado !== 'inactiva')
  },

  associations(branch) { return { vehicles: branch.vehiculos || 0, reservations: 0 } },

  managerName(branch) {
    const manager = managers.find((user) => user.correo === branch.encargadoId)
    return manager ? manager.nombre || manager.correo : ''
  },

  async create(data) {
    const body = payload(data)
    try {
      const { data: created } = await api.post('/branches', body)
      await assignManager(created.id, '', data.encargadoId)
      if (data.estado === 'inactiva') await api.patch(`/branches/${created.id}/toggle-status`)
    } catch (error) {
      throw toError(error)
    }
    await this.refresh()
    await cargarUbicaciones()
  },

  async update(id, data) {
    const current = branches.find((branch) => branch.id === id)
    const body = payload(data)
    try {
      await api.put(`/branches/${id}`, body)
      await assignManager(id, current?.encargadoId || '', data.encargadoId)
      if (current && current.estado !== data.estado) await api.patch(`/branches/${id}/toggle-status`)
    } catch (error) {
      throw toError(error)
    }
    await this.refresh()
    await cargarUbicaciones()
  },

  async remove(id) {
    try {
      await api.delete(`/branches/${id}`)
    } catch (error) {
      throw toError(error)
    }
    await this.refresh()
    await cargarUbicaciones()
  },
}
