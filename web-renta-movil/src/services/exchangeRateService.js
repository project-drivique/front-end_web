// src/services/exchangeRateService.js
//
// Servicio de tasa de cambio USD -> COP en tiempo real.
//
// Antes el proyecto usaba un valor fijo (TASA_USD = 4000) dentro de monedaUtils.js.
// Este módulo reemplaza ese valor fijo por peticiones reales a una API pública de
// tasas de cambio, con caché en localStorage (para poder pintar algo instantáneo
// mientras llega la respuesta de red) y con reintentos entre varios proveedores
// por si alguno falla o no está disponible.

const LOCALSTORAGE_KEY = 'rm_tasa_usd_cop'
const LOCALSTORAGE_TS_KEY = 'rm_tasa_usd_cop_ts'

// Tiempo de vida de la caché antes de pedir una tasa nueva a la API (10 minutos).
const TTL_MS = 10 * 60 * 1000

// Tasa de respaldo, solo se usa si nunca se ha logrado contactar ninguna API
// (por ejemplo, sin conexión a internet la primera vez que se abre la app).
const TASA_RESPALDO = 4000

// Proveedores de tasas de cambio gratuitos, sin necesidad de API key.
// Se intentan en orden hasta que uno responda correctamente.
const PROVEEDORES = [
  {
    nombre: 'open.er-api.com',
    url: 'https://open.er-api.com/v6/latest/USD',
    extraer: (json) => json?.rates?.COP,
  },
  {
    nombre: 'frankfurter.app',
    url: 'https://api.frankfurter.app/latest?from=USD&to=COP',
    extraer: (json) => json?.rates?.COP,
  },
  {
    nombre: 'exchangerate.host',
    url: 'https://api.exchangerate.host/latest?base=USD&symbols=COP',
    extraer: (json) => json?.rates?.COP,
  },
]

function leerCache() {
  try {
    const valor = Number(localStorage.getItem(LOCALSTORAGE_KEY))
    const ts = Number(localStorage.getItem(LOCALSTORAGE_TS_KEY))
    if (valor > 0 && ts > 0) return { valor, ts }
  } catch {
    // localStorage puede no estar disponible (modo privado, SSR, etc.)
  }
  return null
}

function guardarCache(valor) {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, String(valor))
    localStorage.setItem(LOCALSTORAGE_TS_KEY, String(Date.now()))
  } catch {
    // Ignorar si no se puede escribir en localStorage.
  }
}

// Estado en memoria compartido por toda la app (patrón singleton simple).
const cacheInicial = leerCache()
let tasaActual = cacheInicial?.valor || TASA_RESPALDO
let ultimaActualizacion = cacheInicial?.ts || 0
let promesaEnCurso = null
const suscriptores = new Set()

function notificarSuscriptores() {
  suscriptores.forEach((cb) => {
    try { cb(tasaActual) } catch { /* noop */ }
  })
}

async function pedirTasaAProveedores() {
  for (const proveedor of PROVEEDORES) {
    try {
      const controlador = new AbortController()
      const timeoutId = setTimeout(() => controlador.abort(), 6000)
      const respuesta = await fetch(proveedor.url, { signal: controlador.signal })
      clearTimeout(timeoutId)
      if (!respuesta.ok) continue
      const json = await respuesta.json()
      const tasa = Number(proveedor.extraer(json))
      if (tasa > 0) return tasa
    } catch (error) {
      console.warn(`[exchangeRateService] Falló ${proveedor.nombre}:`, error?.message || error)
    }
  }
  return null
}

/**
 * Devuelve la tasa de cambio USD -> COP disponible en este momento sin esperar
 * a la red (para poder formatear precios de forma síncrona en el render).
 * Puede ser un valor cacheado de una consulta anterior o el valor de respaldo.
 */
export function obtenerTasaSincrona() {
  return tasaActual
}

/**
 * Se suscribe a las actualizaciones de la tasa. Devuelve una función para
 * cancelar la suscripción. Se usa para forzar un re-render cuando llega
 * una tasa nueva desde la API.
 */
export function suscribirseATasa(callback) {
  suscriptores.add(callback)
  return () => suscriptores.delete(callback)
}

/**
 * Pide la tasa real de cambio USD -> COP. Si ya se consultó hace menos de
 * TTL_MS, reutiliza el valor en memoria sin volver a llamar a la red.
 */
export async function actualizarTasaUSD({ forzar = false } = {}) {
  const ahora = Date.now()
  if (!forzar && ahora - ultimaActualizacion < TTL_MS) {
    return tasaActual
  }
  // Evita disparar múltiples peticiones en paralelo si varios componentes
  // piden la actualización casi al mismo tiempo.
  if (promesaEnCurso) return promesaEnCurso

  promesaEnCurso = (async () => {
    const tasa = await pedirTasaAProveedores()
    if (tasa) {
      tasaActual = tasa
      ultimaActualizacion = Date.now()
      guardarCache(tasa)
      notificarSuscriptores()
    }
    promesaEnCurso = null
    return tasaActual
  })()

  return promesaEnCurso
}

/**
 * Arranca la actualización periódica de la tasa (llamar una sola vez, por
 * ejemplo desde LandingProvider). Pide la tasa de inmediato y luego cada
 * TTL_MS mientras la pestaña siga abierta.
 */
export function iniciarActualizacionAutomatica() {
  actualizarTasaUSD()
  const intervalId = setInterval(() => actualizarTasaUSD(), TTL_MS)
  return () => clearInterval(intervalId)
}
