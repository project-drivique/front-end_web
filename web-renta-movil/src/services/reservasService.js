import { api } from './authService'

export const reservasService = {
  getReservas: async () => {
    const { data } = await api.get('/reservas')
    return data
  },

  getReservaById: async (id) => {
    const { data } = await api.get(`/reservas/${id}`)
    return data
  },

  crearReserva: async (datosReserva) => {
    const { data } = await api.post('/reservas', datosReserva)
    return data
  },

  cancelarReserva: async (id) => {
    const { data } = await api.patch(`/reservas/${id}/cancelar`)
    return data
  },
}