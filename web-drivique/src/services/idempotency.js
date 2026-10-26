// Protocolo Idempotency-Key: cada intención (reservar, confirmar un pago, cobrar en efectivo) usa una clave única.
// Mientras no haya respuesta del servidor (doble clic, reintento por corte de red) se reutiliza la MISMA clave, así el servidor
// devuelve la respuesta guardada en vez de crear otra reserva o cobrar dos veces. Cuando el servidor responde, la clave se libera.
const pending = new Map()

function newKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  // Sin contexto seguro (por ejemplo http en red local) no existe randomUUID
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes)
  else for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function idempotencyKeyFor(intent) {
  if (!pending.has(intent)) pending.set(intent, newKey())
  return pending.get(intent)
}

export function releaseIdempotencyKey(intent) {
  pending.delete(intent)
}

/** Ejecuta la petición con la clave de la intención; la libera cuando el servidor responde (con éxito o con error). */
export async function withIdempotency(intent, request) {
  const key = idempotencyKeyFor(intent)
  try {
    const result = await request(key)
    releaseIdempotencyKey(intent)
    return result
  } catch (error) {
    // Sin respuesta (red caída, timeout) la clave se conserva para que el reintento sea idempotente
    if (error?.response) releaseIdempotencyKey(intent)
    throw error
  }
}
