import { api } from './authService'
import { useAuthStore } from '../store/authStore'
import { mockUsersStorage } from './mockUsersStorage'

const getUsuarioGuardado = () => useAuthStore.getState().usuario

export const userService = {
  actualizarPerfil: async (datosActualizados) => {
    try {
      const { data } = await api.post('/usuario/perfil', datosActualizados)
      return data
    } catch {
      return { mensaje: 'Perfil actualizado correctamente' }
    }
  },

  verificarCorreoDisponible: async (correo) => {
    try {
      const { data } = await api.post('/usuario/verificar-correo', { correo })
      return data
    } catch (err) {
      if (err?.response?.status === 409) throw err
      const usuario = getUsuarioGuardado()
      const correoNorm = correo.toLowerCase()
      const ocupado = mockUsersStorage.buscarPorCorreo(correoNorm)
      if (ocupado && ocupado.correo.toLowerCase() !== usuario?.correo?.toLowerCase()) {
        const conflict = new Error('Correo ya registrado')
        conflict.response = { status: 409, data: { mensaje: 'Este correo ya está registrado' } }
        throw conflict
      }
      return { disponible: true }
    }
  },

  verificarContrasena: async (contrasena) => {
    try {
      const { data } = await api.post('/usuario/verificar-contrasena', { contrasena })
      return data
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 400) throw err
      const usuario = getUsuarioGuardado()
      const correo = usuario?.correo?.toLowerCase()
      const passwordCorrecta = mockUsersStorage.buscarPorCorreo(correo)?.contrasena
      if (passwordCorrecta && contrasena === passwordCorrecta) {
        return { valida: true }
      }
      const error = new Error('Contraseña incorrecta')
      error.response = { status: 401, data: { mensaje: 'Contraseña incorrecta' } }
      throw error
    }
  },

  cambiarContrasena: async (contrasenaActual, contrasenaNueva) => {
    try {
      const { data } = await api.post('/usuario/cambiar-contrasena', { contrasenaActual, contrasenaNueva })
      return data
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 400) throw err
      const usuario = getUsuarioGuardado()
      const correo = usuario?.correo?.toLowerCase()
      const passwordCorrecta = mockUsersStorage.buscarPorCorreo(correo)?.contrasena
      if (!passwordCorrecta || contrasenaActual !== passwordCorrecta) {
        const error = new Error('Contraseña actual incorrecta')
        error.response = { status: 401, data: { mensaje: 'Contraseña actual incorrecta' } }
        throw error
      }
      mockUsersStorage.actualizarContrasena(correo, contrasenaNueva)
      return { mensaje: 'Contraseña actualizada correctamente' }
    }
  },
}
