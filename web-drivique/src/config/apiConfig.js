// URL del backend y modo de datos de ejemplo, leídos del entorno de compilación.
// El modo de ejemplo solo se activa con VITE_USAR_MOCK=true; nunca por faltar la URL.
export const configuredApiUrl = (import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '') || (import.meta.env.DEV ? 'http://localhost:8080/api/v1' : ''))
export const mockMode = import.meta.env.VITE_USAR_MOCK === 'true'
export const apiConfigurada = Boolean(configuredApiUrl) || mockMode
