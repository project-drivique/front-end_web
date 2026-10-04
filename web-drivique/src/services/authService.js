import { api, setSessionTokens } from './httpClient'
export { api } from './httpClient'

export const DURACION_CODIGO_VERIFICACION_MS = 15 * 60 * 1000

export const authService = {
  async login({ correo, contrasena }) {
    const { data } = await api.post('/auth/login', { email: correo, password: contrasena, deviceInfo: navigator.userAgent })
    setSessionTokens(data)
    const profile = data.userProfile || {}
    return {
      token: data.accessToken,
      correo: profile.email,
      nombre: profile.firstName,
      apellido: profile.lastName,
      telefono: profile.phone,
      rol: profile.roles?.[0] || 'CUSTOMER',
      roles: profile.roles || [],
      activo: profile.accountStatus === 'ACTIVE',
    }
  },

  async registro(datos) {
    const { data } = await api.post('/auth/register', {
      firstName: datos.nombre || datos.nombres || 'Usuario',
      lastName: datos.apellido || datos.apellidos || 'Drivique',
      email: datos.correo,
      password: datos.contrasena,
    })
    return data
  },

  async solicitarRecuperacion(correo) {
    const { data } = await api.post('/auth/forgot-password', { email: correo })
    return data
  },

  async verificarCodigoRecuperacion(correo, codigo) {
    const { data } = await api.post('/auth/validate-reset-code', { email: correo, code: codigo })
    return data
  },

  async resetearContrasena(correo, codigo, contrasena) {
    const { data } = await api.post('/auth/reset-password', { email: correo, code: codigo, newPassword: contrasena })
    return data
  },

  async enviarCodigoVerificacion(correo) {
    const { data } = await api.post('/auth/resend-verification', { email: correo })
    return data
  },

  async verificarCodigoRegistro(correo, codigo) {
    const { data } = await api.post('/auth/verify-email', { email: correo, code: codigo })
    return data
  },

  async loginGoogle(accessToken) {
    const { data } = await api.post('/auth/google', { accessToken })
    return data
  },

  async loginFacebook(accessToken) {
    const { data } = await api.post('/auth/facebook', { accessToken })
    return data
  },
}