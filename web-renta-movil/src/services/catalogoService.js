import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const catalogoService = {
  getVehiculos: async (filtros = {}) => {
    const { data } = await api.get('/vehiculos', { params: filtros })
    return data
  },

  toggleFavorito: async (vehiculoId) => {
    const { data } = await api.post(`/vehiculos/${vehiculoId}/favorito`)
    return data
  },
}