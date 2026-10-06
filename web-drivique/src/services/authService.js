import { api, setSessionTokens } from './httpClient'
export { api } from './httpClient'

export const DURACION_CODIGO_VERIFICACION_MS = 15 * 60 * 1000

const FRONTEND_ROLE_BY_BACKEND_ROLE = Object.freeze({
  SUPER_ADMIN: 'administrador',
  CUSTOMER: 'usuario',
  ADMIN: 'administrador',
  BRANCH_ADMIN: 'encargado_sucursal',
  BRANCH_MANAGER: 'encargado_sucursal',
})

const normalizarRol = (roles = []) => FRONTEND_ROLE_BY_BACKEND_ROLE[roles[0]] || 'usuario'

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
      rol: normalizarRol(profile.roles),
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

  async eliminarCuenta(contrasena) {
    await api.delete('/users/me', { data: { password: contrasena } })
  },

  async enviarCodigoVerificacion(correo) {
    const { data } = await api.post('/auth/resend-verification', { email: correo })
    return data
  },

  async verificarCodigoRegistro(correo, codigo) {
    const { data } = await api.post('/auth/verify-email', { email: correo, code: codigo })
    return data
  },

  socialLogin: async (payload) => {
    const reqBody = typeof payload === 'string' ? { idToken: payload, provider: 'GOOGLE' } : payload
    const endpoint = reqBody.provider === 'FACEBOOK' ? '/auth/facebook' : (reqBody.provider === 'GOOGLE' ? '/auth/google' : '/auth/social/login')
    const { data } = await api.post(endpoint, reqBody)
    if (data?.accessToken) {
      setSessionTokens(data)
    }
    const profile = data.userProfile || data.profile || data.user || {}
    const formattedUser = {
      id: profile.id,
      nombre: profile.firstName || profile.nombre || 'Usuario',
      apellido: profile.lastName || profile.apellido || '',
      correo: profile.email || profile.correo || '',
      telefono: profile.phone || profile.telefono || '',
      rol: normalizarRol(profile.roles),
      activo: profile.accountStatus === 'ACTIVE' || profile.activo === true,
      permisos: profile.permissions || [],
      emailVerificado: true,
    }
    return {
      token: data.accessToken,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      usuario: formattedUser,
      ...data,
    }
  },

  loginGoogle: async (param) => {
    const payload = typeof param === 'string'
      ? { idToken: param, provider: 'GOOGLE' }
      : { provider: 'GOOGLE', ...param }
    return authService.socialLogin(payload)
  },

  loginFacebook: async (param) => {
    const payload = typeof param === 'string'
      ? { accessToken: param, provider: 'FACEBOOK' }
      : { provider: 'FACEBOOK', ...param }
    return authService.socialLogin(payload)
  },

  linkSocialAccount: async (payload) => {
    const { data } = await api.post('/auth/social/link', payload)
    return data
  },

  getLinkedSocialAccounts: async () => {
    const { data } = await api.get('/auth/social/accounts')
    return data
  },

  unlinkSocialAccount: async (provider) => {
    const { data } = await api.delete(`/auth/social/${provider}`)
    return data
  },
}
