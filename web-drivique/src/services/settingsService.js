import { api } from './httpClient'
import i18n from '@/i18n'

const errorDe = (error) => new Error(error?.response?.data?.detail || i18n.t('hc2.no_fue_posible_completar_la_operacion', 'No fue posible completar la operación.'), { cause: error })

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
