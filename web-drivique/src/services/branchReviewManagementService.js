import { api } from './httpClient'

export const branchReviewManagementService = {
  async list(user = null) {
    try {
      // Usar endpoint de backend en lugar de mock local
      const { data } = await api.get('/admin/reviews/branches')
      return Array.isArray(data) ? data : (data?.reviews || [])
    } catch (error) {
      console.error('Error fetching branch reviews:', error)
      return []
    }
  },

  async responderResena(id, textoRespuesta) {
    try {
      const { data } = await api.patch(`/admin/reviews/branches/${id}/reply`, {
        respuestaEncargado: textoRespuesta
      })
      return data
    } catch (error) {
      console.error('Error replying to branch review:', error)
      throw error
    }
  },

  async eliminarResena(id) {
    try {
      await api.delete(`/admin/reviews/branches/${id}`)
      return true
    } catch (error) {
      console.error('Error deleting branch review:', error)
      throw error
    }
  }
}
