import { api } from './authService'

const MOCK_PASSWORDS = {
  'admin@drivique.com': 'Admin123*',
  'cliente@drivique.com': 'Cliente123*',
}

const MOCK_EMAILS = Object.keys(MOCK_PASSWORDS)

const getUsuarioGuardado = () => {
  try {
    const raw = localStorage.getItem('renta_token')
    return raw ? JSON.parse(raw)?.state?.usuario : null
  } catch {
    return null
  }
}

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
      const ocupado = MOCK_EMAILS.find(
        (e) => e === correoNorm && e !== usuario?.correo?.toLowerCase()
      )
      if (ocupado) {
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
      const guardadas = JSON.parse(localStorage.getItem('renta_passwords') || '{}')
      const passwordCorrecta = guardadas[correo] ?? MOCK_PASSWORDS[correo]
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
      const guardadas = JSON.parse(localStorage.getItem('renta_passwords') || '{}')
      const passwordCorrecta = guardadas[correo] ?? MOCK_PASSWORDS[correo]
      if (!passwordCorrecta || contrasenaActual !== passwordCorrecta) {
        const error = new Error('Contraseña actual incorrecta')
        error.response = { status: 401, data: { mensaje: 'Contraseña actual incorrecta' } }
        throw error
      }
      const nuevas = { ...guardadas, [correo]: contrasenaNueva }
      localStorage.setItem('renta_passwords', JSON.stringify(nuevas))
      return { mensaje: 'Contraseña actualizada correctamente' }
    }
  },
}
