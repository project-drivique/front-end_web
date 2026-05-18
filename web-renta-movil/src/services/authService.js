import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('renta_token')
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

  solicitarRecuperacion: async (correo) => {
    const { data } = await api.post('/auth/recuperar', { correo })
    return data
  },

  resetearContrasena: async (token, contrasena) => {
    const { data } = await api.post('/auth/nueva-contrasena', { token, contrasena })
    return data
  },

  loginGoogle: async (accessToken) => {
    const { data } = await api.post('/auth/google', { accessToken })
    return data
  },

  loginFacebook: async (accessToken) => {
    const { data } = await api.post('/auth/facebook', { accessToken })
    return data
  },

  verificar2FA: async (sesionTemporal, codigo) => {
    const { data } = await api.post('/auth/2fa/verificar', { sesionTemporal, codigo })
    return data
  },

  reenviarCodigo2FA: async (sesionTemporal) => {
    const { data } = await api.post('/auth/2fa/reenviar', { sesionTemporal })
    return data
  },
}