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

// ─── MOCK LOGIN CREDENTIALS (Temporal) ─────────────────────────────────────────
const MOCK_CREDENTIALS = {
  correo: 'admin@rentamovil.com',
  contrasena: 'Admin123*',
}

const generateMockToken = () => {
  return 'mock_token_' + Math.random().toString(36).substring(2) + Date.now()
}

// ─────────────────────────────────────────────────────────────────────────────────
export const authService = {
  login: async ({ correo, contrasena }) => {
    // Validar credenciales contra el mock
    if (correo === MOCK_CREDENTIALS.correo && contrasena === MOCK_CREDENTIALS.contrasena) {
      return {
        token: generateMockToken(),
        nombre: 'Administrador',
        rol: 'administrador',
        requiere2FA: false,
      }
    }

    // Si no coinciden, lanzar error
    const error = new Error('Credenciales incorrectas')
    error.response = { status: 401 }
    throw error
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