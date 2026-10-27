import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import i18n from '../i18n'

import { configuredApiUrl } from '../config/apiConfig'

const REFRESH_TOKEN_KEY = 'drivique_refresh_token'
let refreshRequest = null

export const api = axios.create({
  baseURL: configuredApiUrl,
  headers: { 'Content-Type': 'application/json' },
})

export function setSessionTokens({ accessToken, refreshToken, userProfile }) {
  if (accessToken) useAuthStore.setState({ token: accessToken })
  if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  if (userProfile) useAuthStore.getState().actualizarUsuario(userProfile)
}

export function clearSessionTokens() {
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  useAuthStore.getState().logout()
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  // El servidor escribe los correos en el idioma que la persona está usando en la web
  const language = i18n.resolvedLanguage || i18n.language
  if (language) config.headers['X-App-Language'] = language
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config
    const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY)
    const isRefreshRequest = request?.url?.includes('/auth/refresh')

    // Solo se renueva la sesión si la petición iba con sesión: un visitante (sin token) no debe quedar logueado
    const teniaSesion = Boolean(request?.headers?.Authorization)
    if (error.response?.status !== 401 || request?._retried || isRefreshRequest || !refreshToken || !teniaSesion) {
      return Promise.reject(error)
    }

    request._retried = true
    try {
      refreshRequest ??= api.post('/auth/refresh', { refreshToken })
      const { data } = await refreshRequest
      setSessionTokens(data)
      request.headers.Authorization = `Bearer ${data.accessToken}`
      return api(request)
    } catch (refreshError) {
      clearSessionTokens()
      return Promise.reject(refreshError)
    } finally {
      refreshRequest = null
    }
  },
)