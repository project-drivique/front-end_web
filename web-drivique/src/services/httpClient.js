import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '')
const mockMode = import.meta.env.VITE_USAR_MOCK === 'true'

if (!configuredApiUrl && !mockMode) {
  throw new Error('VITE_API_URL es obligatoria cuando VITE_USAR_MOCK no está habilitado.')
}

const REFRESH_TOKEN_KEY = 'drivique_refresh_token'
let refreshRequest = null

export const api = axios.create({
  baseURL: configuredApiUrl,
  headers: { 'Content-Type': 'application/json' },
})

export function setSessionTokens({ accessToken, refreshToken }) {
  if (accessToken) useAuthStore.setState({ token: accessToken })
  if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearSessionTokens() {
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  useAuthStore.getState().logout()
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config
    const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY)
    const isRefreshRequest = request?.url?.includes('/auth/refresh')

    if (error.response?.status !== 401 || request?._retried || isRefreshRequest || !refreshToken) {
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