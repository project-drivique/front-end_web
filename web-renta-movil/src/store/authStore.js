import { create } from 'zustand'

export const AUTH_KEYS = {
  token:   'renta_token',
  usuario: 'renta_user',
}

export const useAuthStore = create((set) => ({
  token:          localStorage.getItem(AUTH_KEYS.token) || null,
  usuario:        JSON.parse(localStorage.getItem(AUTH_KEYS.usuario) || 'null'),
  sesion2FA:      null, // token temporal mientras se verifica el 2FA
  requiere2FA:    false,

  login: (token, usuario) => {
    localStorage.setItem(AUTH_KEYS.token,   token)
    localStorage.setItem(AUTH_KEYS.usuario, JSON.stringify(usuario))
    set({ token, usuario, sesion2FA: null, requiere2FA: false })
  },

  // Se llama cuando el backend responde que necesita 2FA
  iniciar2FA: (sesionTemporal) => {
    set({ sesion2FA: sesionTemporal, requiere2FA: true })
  },

  // Limpia el estado 2FA sin hacer login (cancelación o error)
  cancelar2FA: () => {
    set({ sesion2FA: null, requiere2FA: false })
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEYS.token)
    localStorage.removeItem(AUTH_KEYS.usuario)
    set({ token: null, usuario: null, sesion2FA: null, requiere2FA: false })
  },
}))