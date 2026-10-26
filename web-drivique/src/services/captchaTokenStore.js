// Token de un solo uso que entrega el captcha (Cloudflare Turnstile). El servidor lo valida al crear la reserva.
let token = null
const listeners = new Set()

export const captchaTokenStore = {
  set(value) {
    token = value || null
  },
  get() {
    return token
  },
  // Al usarse (con éxito o con error) el token ya no sirve: se limpia y el widget se reinicia solo
  consume() {
    const value = token
    token = null
    listeners.forEach((listener) => listener())
    return value
  },
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
