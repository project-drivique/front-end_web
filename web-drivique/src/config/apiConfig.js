// URL del backend, leída del entorno de compilación o del host oficial en producción (Hostinger).
const rawApiUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof globalThis !== 'undefined' && globalThis.process?.env && globalThis.process.env.VITE_API_URL) ||
  'https://drivique.tech/api/v1'

export const configuredApiUrl = rawApiUrl.trim().replace(/\/$/, '')
export const apiConfigurada = Boolean(configuredApiUrl)
