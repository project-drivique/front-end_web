import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('renta_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const MOCK_USERS = [
  {
    correo: 'admin@Drivique.com',
    contrasena: 'Admin123*',
    nombre: 'Administrador',
    apellido: 'Drivique',
    rol: 'administrador',
    telefono: '+573001234567',
    cedula: '1234567890',
    fechaNacimiento: '1990-05-15',
  },
  {
    correo: 'cliente@Drivique.com',
    contrasena: 'Cliente123*',
    nombre: 'Juan',
    apellido: 'Pérez',
    rol: 'usuario',
    telefono: '+573109876543',
    cedula: '9876543210',
    fechaNacimiento: '1995-03-20',
  },
]

const generateMockToken = () => {
  return 'mock_token_' + Math.random().toString(36).substring(2) + Date.now()
}

export const authService = {
  login: async ({ correo, contrasena }) => {
    const usuario = MOCK_USERS.find(
      (u) => u.correo.toLowerCase() === correo.toLowerCase() && u.contrasena === contrasena
    )

    if (usuario) {
      return {
        token: generateMockToken(),
        correo: usuario.correo,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        telefono: usuario.telefono,
        cedula: usuario.cedula,
        fechaNacimiento: usuario.fechaNacimiento,
        requiere2FA: false,
      }
    }

    const error = new Error('Credenciales incorrectas')
    error.response = { status: 401 }
    throw error
  },

  registro: async (datosUsuario) => {
    const usuario = MOCK_USERS.find(
      (u) => u.correo === datosUsuario.correo && u.contrasena === datosUsuario.contrasena
    )

    if (usuario) {
      return {
        token: generateMockToken(),
        correo: usuario.correo,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        telefono: usuario.telefono,
        cedula: usuario.cedula,
        fechaNacimiento: usuario.fechaNacimiento,
      }
    }

    const error = new Error('No existe una cuenta con estas credenciales. Usa admin@Drivique.com o cliente@Drivique.com con la contraseña correspondiente.')
    error.response = { status: 400 }
    throw error
  },

  solicitarRecuperacion: async (correo) => {
    const { data } = await api.post('/auth/recuperar', { correo })
    return data
  },

  resetearContrasena: async (token, contrasena) => {
    const { data } = await api.post('/auth/nueva-contrasena', { token, contrasena })
    return data
  },

  loginGoogle: async (accessToken) => {
    const { data } = await api.post('/auth/google', { accessToken })
    return data
  },

  loginFacebook: async (accessToken) => {
    const { data } = await api.post('/auth/facebook', { accessToken })
    return data
  },

  verificar2FA: async (sesionTemporal, codigo) => {
    const { data } = await api.post('/auth/2fa/verificar', { sesionTemporal, codigo })
    return data
  },

  reenviarCodigo2FA: async (sesionTemporal) => {
    const { data } = await api.post('/auth/2fa/reenviar', { sesionTemporal })
    return data
  },
}

