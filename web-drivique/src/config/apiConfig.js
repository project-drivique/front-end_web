// URL del backend, leída del entorno de compilación. No existe modo de datos de ejemplo.
const viteEnv = import.meta?.env || {}
const nodeEnv = typeof globalThis !== 'undefined' && globalThis.process?.env ? globalThis.process.env : {}
const rawApiUrl = viteEnv.VITE_API_URL || nodeEnv.VITE_API_URL || ''

export const configuredApiUrl =
  rawApiUrl.trim().replace(/\/$/, '') || (viteEnv.DEV ? 'http://localhost:8080/api/v1' : '')
export const apiConfigurada = Boolean(configuredApiUrl)
