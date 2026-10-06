import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const AUTH_KEYS = {
  token: 'renta_token',
  usuario: 'renta_user',
}

export const isValidAuthToken = (token) => {
  if (!token || token === 'null' || token === 'undefined') return false
  try {
    const [, payload] = token.split('.')
    if (!payload) return false
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const decoded = JSON.parse(atob(padded))
    return typeof decoded.exp === 'number' && decoded.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

// Storage personalizado: en vez de envolver { token, usuario } en un solo
// blob JSON bajo una key, guarda cada campo en su propia key real de
// localStorage. renta_token queda como el JWT plano (sin comillas ni JSON
// envolvente) y renta_user como el JSON del objeto usuario.
const authStorage = {
  getItem: () => {
    const token = localStorage.getItem(AUTH_KEYS.token)
    let usuario
    try {
      const usuarioRaw = localStorage.getItem(AUTH_KEYS.usuario)
      usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null
    } catch {
      usuario = null
    }
    if (!isValidAuthToken(token)) return null
    return { state: { token, usuario }, version: 0 }
  },
  setItem: (_name, value) => {
    const { token, usuario } = value.state
    if (token) {
      localStorage.setItem(AUTH_KEYS.token, token)
    } else {
      localStorage.removeItem(AUTH_KEYS.token)
    }
    if (usuario) {
      localStorage.setItem(AUTH_KEYS.usuario, JSON.stringify(usuario))
    } else {
      localStorage.removeItem(AUTH_KEYS.usuario)
    }
  },
  removeItem: () => {
    localStorage.removeItem(AUTH_KEYS.token)
    localStorage.removeItem(AUTH_KEYS.usuario)
  },
}

// Lectura síncrona inmediata para evitar parpadeos (FOUC) en el primer render
const getInitialAuthState = () => {
  try {
    const token = localStorage.getItem(AUTH_KEYS.token)
    const usuarioRaw = localStorage.getItem(AUTH_KEYS.usuario)
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null
    const esValido = isValidAuthToken(token)
    if (!esValido) {
      localStorage.removeItem(AUTH_KEYS.token)
      localStorage.removeItem(AUTH_KEYS.usuario)
    }
    return {
      token: esValido ? token : null,
      usuario: esValido ? usuario : null,
    }
  } catch {
    return { token: null, usuario: null }
  }
}

const initialAuth = getInitialAuthState()

export const useAuthStore = create(
  persist(
    (set) => ({
      token: initialAuth.token,
      usuario: initialAuth.usuario,
      sesion2FA: null,
      requiere2FA: false,
      verificacionCorreo: null,
      recuperacionCorreo: null,

      login: (token, usuario) => {
        set({ token, usuario, sesion2FA: null, requiere2FA: false, verificacionCorreo: null, recuperacionCorreo: null })
      },

      actualizarUsuario: (datosActualizados) => {
        set((state) => ({
          usuario: { ...state.usuario, ...datosActualizados },
        }))
      },

      iniciar2FA: (sesionTemporal) => {
        set({ sesion2FA: sesionTemporal, requiere2FA: true })
      },

      cancelar2FA: () => {
        set({ sesion2FA: null, requiere2FA: false })
      },

      iniciarVerificacionCorreo: (correo, datosAcceso) => {
        set({ verificacionCorreo: { correo, datosAcceso } })
      },

      cancelarVerificacionCorreo: () => {
        set({ verificacionCorreo: null })
      },

      iniciarRecuperacionCorreo: (correo, codigo = null) => {
        set({ recuperacionCorreo: { correo, codigo } })
      },

      cancelarRecuperacionCorreo: () => {
        set({ recuperacionCorreo: null })
      },

      logout: () => {
        set({ token: null, usuario: null, sesion2FA: null, requiere2FA: false, verificacionCorreo: null, recuperacionCorreo: null })
        localStorage.removeItem(AUTH_KEYS.token)
        localStorage.removeItem(AUTH_KEYS.usuario)
      },
    }),
    {
      name: 'renta-auth',
      storage: authStorage,
      partialize: (state) => ({
        token: state.token,
        usuario: state.usuario,
      }),
    }
  )
)
