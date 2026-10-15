import { api } from './httpClient'

// Último resultado del servidor (list() es síncrono para la pantalla)
let cache = []

const ESTADO_UI = { AVAILABLE: 'disponible', ON_ROUTE: 'en_servicio', INACTIVE: 'inactivo' }
const ESTADO_API = { disponible: 'AVAILABLE', en_servicio: 'ON_ROUTE', inactivo: 'INACTIVE' }

const errorDe = (error) => new Error(error?.response?.data?.detail || error?.message || 'No fue posible completar la operación')

function mapear(d) {
  return {
    id: d.id,
    sucursalId: d.branchId,
    sucursal: d.branchName,
    nombre: d.fullName,
    email: d.email || '',
    tipoDoc: d.documentType,
    numDoc: d.documentNumber,
    licencia: d.licenseNumber || '',
    categoriaLic: d.licenseCategory || '',
    vencimientoLic: d.licenseExpiresOn || '',
    telefono: d.phone || '',
    vehiculo: d.vehicleDescription || '',
    estado: ESTADO_UI[d.status] || 'disponible',
  }
}

function cuerpo(data) {
  return {
    fullName: String(data.nombre || '').trim(),
    email: String(data.email || '').trim() || null,
    phone: String(data.telefono || '').trim() || null,
    documentType: data.tipoDoc || 'CC',
    documentNumber: String(data.numDoc || '').trim(),
    licenseNumber: String(data.licencia || '').trim() || null,
    licenseCategory: String(data.categoriaLic || '').trim() || null,
    licenseExpiresOn: data.vencimientoLic || null,
    vehicleDescription: String(data.vehiculo || '').trim() || null,
    status: ESTADO_API[data.estado] || 'AVAILABLE',
  }
}

/** Conductores de domicilio y entregas a domicilio; el servidor limita todo a la sucursal del encargado. */
export const deliveryService = {
  async refresh() {
    const { data } = await api.get('/admin/delivery-drivers')
    cache = (Array.isArray(data) ? data : []).map(mapear)
    return this.list()
  },

  list() {
    return cache.map((d) => ({ ...d }))
  },

  async create(data) {
    try {
      await api.post('/admin/delivery-drivers', cuerpo(data))
      return await this.refresh()
    } catch (error) {
      throw errorDe(error)
    }
  },

  async update(id, data) {
    try {
      await api.put(`/admin/delivery-drivers/${id}`, cuerpo(data))
      return await this.refresh()
    } catch (error) {
      throw errorDe(error)
    }
  },

  async remove(id) {
    try {
      await api.delete(`/admin/delivery-drivers/${id}`)
      return await this.refresh()
    } catch (error) {
      throw errorDe(error)
    }
  },

  /** pointType: 'PICKUP' (entrega) o 'RETURN' (devolución). */
  async assign(reservationId, pointType, driverId) {
    try {
      await api.post(`/admin/deliveries/${reservationId}/${pointType}/assign`, { driverId })
      await this.refresh()
    } catch (error) {
      throw errorDe(error)
    }
  },

  async complete(reservationId, pointType, pin) {
    try {
      await api.post(`/admin/deliveries/${reservationId}/${pointType}/complete`, { pin })
      await this.refresh()
    } catch (error) {
      throw errorDe(error)
    }
  },
}
