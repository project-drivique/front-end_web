import { useAuthStore } from '../store/authStore'

let apiInstance = null

async function getApi() {
  if (!apiInstance) {
    const { api } = await import('./httpClient') // use httpClient directly or authService? It was authService, but authService exports api? Wait, authService.js exports `api`? Let's use httpClient.
    apiInstance = api
  }
  return apiInstance
}

export const reservationsService = {
  getReservas: async () => {
    const api = await getApi()
    const { data } = await api.get('/reservations/me')
    return data
  },

  getReservasPorVehiculo: async (vehiculoId) => {
    const api = await getApi()
    const { data } = await api.get('/reservations', { params: { vehicleId: vehiculoId } })
    return data
  },

  getReservaById: async (id) => {
    const api = await getApi()
    const { data } = await api.get(`/reservations/${id}`)
    return data
  },

  crearReserva: async (datosReserva) => {
    const api = await getApi()
    // Initiate checkout (creates a hold)
    const { data } = await api.post('/reservations/checkout/initiate', datosReserva)
    return data
  },
  
  confirmarPago: async (holdId) => {
    const api = await getApi()
    const { data } = await api.post(`/reservations/checkout/confirm/${holdId}`)
    return data
  },

  cancelarReserva: async (id) => {
    const api = await getApi()
    const { data } = await api.patch(`/reservations/${id}/cancel`)
    return data
  },

  guardarValoracion: async (id, valoracion) => {
    const api = await getApi()
    const payload = {
      reservationId: id,
      rating: valoracion.estrellas,
      comment: valoracion.comentario || ''
    }
    const { data } = await api.post(`/reviews/vehicles`, payload)
    return data
  },

  checkReviewEligibility: async (id) => {
    try {
      const api = await getApi()
      const { data } = await api.get(`/reservations/${id}/review-eligibility`)
      return data
    } catch {
      return { canReviewVehicle: false, canReviewBranch: false }
    }
  }
}

