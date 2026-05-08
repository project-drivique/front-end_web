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

export const authService = {
  login: async (correo, contrasena) => {
    const { data } = await api.post('/auth/login', { correo, contrasena })
    return data
  },

  registro: async (datosUsuario) => {
    const { data } = await api.post('/auth/registro', datosUsuario)
    return data
  },

  recuperarContrasena: async (correo) => {
    const { data } = await api.post('/auth/recuperar', { correo })
    return data
  },

  nuevaContrasena: async (token, contrasena) => {
    const { data } = await api.post('/auth/nueva-contrasena', { token, contrasena })
    return data
  },
}