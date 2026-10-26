import { captchaTokenStore } from './captchaTokenStore'
import { withIdempotency } from './idempotency'

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
    const { data } = await api.get(`/vehicles/${vehiculoId}/occupied-dates`)
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
    // El captcha se valida en el servidor: el token es de un solo uso
    const captchaToken = captchaTokenStore.consume()
    const data = await withIdempotency(`initiate:${JSON.stringify(datosReserva)}`, async (key) => {
      const response = await api.post('/reservations/checkout/initiate', datosReserva, {
        headers: { 'Idempotency-Key': key, ...(captchaToken ? { 'X-Captcha-Token': captchaToken } : {}) },
      })
      return response.data
    })
    return data
  },
  
  // Puntos de entrega/devolución (sucursal o domicilio) de la reserva recién creada
  configurarPuntosEntrega: async (reservationId, points) => {
    const api = await getApi()
    const { data } = await api.post(`/reservations/${reservationId}/delivery-points`, { points })
    return data
  },

  confirmarPago: async (holdId, transactionId) => {
    const api = await getApi()
    const params = transactionId ? { transactionId } : {}
    return withIdempotency(`confirm:${holdId}:${transactionId || ''}`, async (key) => {
      const { data } = await api.post(`/reservations/checkout/confirm/${holdId}`, null, { params, headers: { 'Idempotency-Key': key } })
      return data
    })
  },

  reportarPagoFallido: async (holdId) => {
    const api = await getApi()
    return withIdempotency(`payment-failed:${holdId}`, async (key) => {
      const { data } = await api.post(`/reservations/checkout/payment-failed/${holdId}`, null, { headers: { 'Idempotency-Key': key } })
      return data
    })
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

  guardarResenaSucursal: async (id, branchId, resena) => {
    const api = await getApi()
    const { data } = await api.post('/reviews/branches', {
      branchId,
      review: { reservationId: id, rating: resena.estrellas, comment: resena.comentario || '' }
    })
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

