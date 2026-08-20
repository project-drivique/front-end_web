import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const AUTH_KEYS = {
  token: 'renta_token',
  usuario: 'renta_user',
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
    if (token === 'null' || token === 'undefined') return null
    if (!token && !usuario) return null
    return { state: { token: (token === 'null' || token === 'undefined') ? null : token, usuario }, version: 0 }
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

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      usuario: null,
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

      iniciarRecuperacionCorreo: (correo) => {
        set({ recuperacionCorreo: correo })
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