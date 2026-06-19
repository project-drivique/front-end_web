import { api } from './authService'

const MOCK_PASSWORDS = {
  'admin@rentamovil.com': 'Admin123*',
  'cliente@rentamovil.com': 'Cliente123*',
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
      const passwordCorrecta = MOCK_PASSWORDS[usuario?.correo?.toLowerCase()]
      if (passwordCorrecta && contrasena === passwordCorrecta) {
        return { valida: true }
      }
      const error = new Error('Contraseña incorrecta')
      error.response = { status: 401, data: { mensaje: 'Contraseña incorrecta' } }
      throw error
    }
  },
}
