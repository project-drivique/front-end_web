import { api } from './httpClient'

const errorDe = (error) => new Error(error?.response?.data?.detail || 'No fue posible completar la operación.', { cause: error })

// Parámetros globales de seguridad (solo administrador global)
export const settingsService = {
  async list() {
    try {
      return (await api.get('/admin/settings')).data
    } catch (error) {
      throw errorDe(error)
    }
  },

  async update(key, value, reason) {
    try {
      return (await api.put(`/admin/settings/${key}`, { value: String(value), reason: reason || null })).data
    } catch (error) {
      throw errorDe(error)
    }
  },

  async revert(key) {
    try {
      return (await api.post(`/admin/settings/${key}/revert`)).data
    } catch (error) {
      throw errorDe(error)
    }
  },
}
