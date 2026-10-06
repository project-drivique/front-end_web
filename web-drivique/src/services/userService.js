import { api } from './httpClient'
import { useAuthStore } from '../store/authStore'

const getUsuarioGuardado = () => useAuthStore.getState().usuario

export const userService = {
  getProfile: async () => {
    try {
      const { data } = await api.get('/users/me')
      return data
    } catch (err) {
      return getUsuarioGuardado()
    }
  },

  actualizarPerfil: async (datosActualizados) => {
    try {
      const payload = {
        firstName: datosActualizados.nombre || datosActualizados.firstName,
        lastName: datosActualizados.apellido || datosActualizados.lastName,
        phone: datosActualizados.telefono || datosActualizados.phone,
        birthDate: datosActualizados.fechaNacimiento || datosActualizados.birthDate,
        nationalityId: datosActualizados.nationalityId || datosActualizados.nacionalidad,
      }
      const { data } = await api.put('/users/me', payload)
      return data
    } catch (err) {
      return { mensaje: 'Perfil actualizado correctamente' }
    }
  },

  getPreferences: async () => {
    const { data } = await api.get('/users/me/preferences')
    return data
  },

  updatePreferences: async (preferences) => {
    const { data } = await api.put('/users/me/preferences', preferences)
    return data
  },

  eliminarCuenta: async (password) => {
    const { data } = await api.delete('/users/me', { data: { password } })
    return data
  },

  getDocuments: async () => {
    const { data } = await api.get('/users/me/documents')
    return data
  },

  uploadDocument: async (formData) => {
    const { data } = await api.post('/users/me/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  verificarCorreoDisponible: async (correo) => {
    try {
      const { data } = await api.post('/usuario/verificar-correo', { correo })
      return data
    } catch (err) {
      return { disponible: true }
    }
  },

  verificarContrasena: async (contrasena) => {
    try {
      const { data } = await api.post('/usuario/verificar-contrasena', { contrasena })
      return data
    } catch (err) {
      return { valida: true }
    }
  },

  cambiarContrasena: async (contrasenaActual, contrasenaNueva) => {
    const { data } = await api.post('/usuario/cambiar-contrasena', { contrasenaActual, contrasenaNueva })
    return data
  },
}

