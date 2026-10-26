import { api } from './httpClient'

// Convierte la reseña del servidor a los campos que usa la pantalla
const mapear = (r) => ({
  id: r.id,
  sucursalId: r.branchId,
  sucursal: r.branchName,
  clienteNombre: r.customerName,
  reservaCodigo: r.reservationCode,
  vehiculo: r.vehicleName || '',
  calificacion: Number(r.rating),
  comentario: r.comment || '',
  fecha: r.createdAt,
  respuestaEncargado: r.managerReply || '',
  fechaRespuesta: r.repliedAt || null,
  estado: r.managerReply ? 'publicada' : 'pendiente_respuesta',
})

/** Reseñas de sucursal: el servidor limita la lista a la sucursal del encargado. */
export const branchReviewManagementService = {
  async list() {
    try {
      const { data } = await api.get('/admin/reviews/branches')
      return (Array.isArray(data) ? data : []).map(mapear)
    } catch (error) {
      console.error('Error fetching branch reviews:', error)
      return []
    }
  },

  async responderResena(id, textoRespuesta) {
    try {
      const { data } = await api.patch(`/admin/reviews/branches/${id}/reply`, { reply: textoRespuesta })
      return mapear(data)
    } catch (error) {
      throw new Error(error?.response?.data?.detail || 'No fue posible publicar la respuesta.', { cause: error })
    }
  },

  async eliminarResena(id) {
    try {
      await api.delete(`/admin/reviews/branches/${id}`)
      return true
    } catch (error) {
      throw new Error(error?.response?.data?.detail || 'No fue posible eliminar la reseña.', { cause: error })
    }
  },
}
