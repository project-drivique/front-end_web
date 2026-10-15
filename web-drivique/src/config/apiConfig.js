// URL del backend, leída del entorno de compilación. No existe modo de datos de ejemplo.
export const configuredApiUrl = (import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '') || (import.meta.env.DEV ? 'http://localhost:8080/api/v1' : ''))
export const apiConfigurada = Boolean(configuredApiUrl)
