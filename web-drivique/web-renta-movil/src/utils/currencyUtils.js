import { obtenerTasaSincrona } from '../services/exchangeRateService'

/**
 * Formatea un monto (siempre expresado en COP internamente) según la moneda
 * de visualización elegida por el usuario.
 *
 * IMPORTANTE: ya no se usa una tasa fija (antes TASA_USD = 4000). La tasa se
 * obtiene en tiempo real desde exchangeRateService, que consulta APIs públicas
 * de tasas de cambio y mantiene un caché en memoria/localStorage. Si se pasa
 * explícitamente el parámetro `tasaUSD`, se usa ese valor (por ejemplo cuando
 * un componente ya se suscribió a la tasa vía useLanding()); si no se pasa,
 * se toma automáticamente el último valor conocido de forma síncrona.
 */
export const formatCurrency = (amount, moneda, tasaUSD) => {
  const value = Number(amount) || 0
  const tasa = tasaUSD || obtenerTasaSincrona()

  if (moneda === 'USD') {
    return `USD ${(value / tasa).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${value.toLocaleString('es-CO')}`
}

// Se reexporta por si algún componente necesita mostrar la tasa actual
// (ej. "1 USD ≈ 4.123 COP") sin tener que importar el servicio directamente.
export { obtenerTasaSincrona }
