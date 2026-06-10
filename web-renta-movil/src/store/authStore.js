import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const AUTH_KEYS = {
  token: 'renta_token',
  usuario: 'renta_user',
}

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      sesion2FA: null,
      requiere2FA: false,

      login: (token, usuario) => {
        set({ token, usuario, sesion2FA: null, requiere2FA: false })
      },

      iniciar2FA: (sesionTemporal) => {
        set({ sesion2FA: sesionTemporal, requiere2FA: true })
      },

      cancelar2FA: () => {
        set({ sesion2FA: null, requiere2FA: false })
      },

      logout: () => {
        set({ token: null, usuario: null, sesion2FA: null, requiere2FA: false })
      },
    }),
    {
      name: AUTH_KEYS.token,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        usuario: state.usuario,
      }),
    }
  )
)