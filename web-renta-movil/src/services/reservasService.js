import reservasMock from '../mocks/reservas.json'

const USAR_MOCK =
  import.meta.env.VITE_USAR_MOCK === 'true' || !import.meta.env.VITE_API_URL

let apiInstance = null

async function getApi() {
  if (!apiInstance) {
    const { api } = await import('./authService')
    apiInstance = api
  }
  return apiInstance
}

export const reservasService = {
  getReservas: async () => {
    if (USAR_MOCK) return reservasMock

    const api = await getApi()
    const { data } = await api.get('/reservas')
    return data
  },

  getReservasPorVehiculo: async (vehiculoId) => {
    if (USAR_MOCK) {
      return reservasMock.filter(r => r.vehiculoId === Number(vehiculoId))
    }

    const api = await getApi()
    const { data } = await api.get('/reservas', { params: { vehiculoId } })
    return data
  },

  getReservaById: async (id) => {
    if (USAR_MOCK) {
      const reserva = reservasMock.find(r => r.id === Number(id))
      if (!reserva) throw new Error('Reserva no encontrada')
      return reserva
    }

    const api = await getApi()
    const { data } = await api.get(`/reservas/${id}`)
    return data
  },

  crearReserva: async (datosReserva) => {
    if (USAR_MOCK) return { id: Date.now(), ...datosReserva }

    const api = await getApi()
    const { data } = await api.post('/reservas', datosReserva)
    return data
  },

  cancelarReserva: async (id) => {
    if (USAR_MOCK) return { id, cancelada: true }

    const api = await getApi()
    const { data } = await api.patch(`/reservas/${id}/cancelar`)
    return data
  },
}
