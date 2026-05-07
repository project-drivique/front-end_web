import { create } from 'zustand'

/**
 * Patrón Observer — Zustand.
 * Almacena la sesión del usuario autenticado.
 * Compatible con la app web (localStorage) y
 * preparado para compartir lógica con la app móvil (Expo SecureStore).
 */
export const useAuthStore = create((set) => ({
  token:   localStorage.getItem('token')   || null,
  usuario: JSON.parse(localStorage.getItem('usuario') || 'null'),

  // Llamado tras login exitoso
  login: (token, usuario) => {
    localStorage.setItem('token',   token)
    localStorage.setItem('usuario', JSON.stringify(usuario))
    set({ token, usuario })
  },

  // Llamado al cerrar sesión
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    set({ token: null, usuario: null })
  },
}))