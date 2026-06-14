import { authService } from './authService'

export const adminService = {
  login: async ({ correo, contrasena }) => {
    if (correo.trim().toLowerCase() !== 'admin@rentamovil.com') {
      const error = new Error('Acceso exclusivo para administradores')
      error.response = { status: 403 }
      throw error
    }

    return authService.login({ correo, contrasena })
  },
}
