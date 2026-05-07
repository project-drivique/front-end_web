import axios from 'axios'

/**
 * Patrón Facade — capa de servicios.
 * Toda comunicación con el backend de auth va acá.
 * Los componentes NUNCA llaman a axios directamente.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor: adjunta el token JWT a cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authService = {
  /**
   * RF2 — Inicio de sesión de usuario
   * @param {string} correo
   * @param {string} contrasena
   * @returns {{ token, usuario }}
   */
  login: async (correo, contrasena) => {
    const { data } = await api.post('/auth/login', { correo, contrasena })
    return data
  },

  /**
   * RF1 — Registro de usuario
   * @param {object} datosUsuario
   */
  registro: async (datosUsuario) => {
    const { data } = await api.post('/auth/registro', datosUsuario)
    return data
  },

  /**
   * Recuperación de contraseña (RF2.11)
   * @param {string} correo
   */
  recuperarContrasena: async (correo) => {
    const { data } = await api.post('/auth/recuperar', { correo })
    return data
  },
}