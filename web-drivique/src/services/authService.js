import axios from 'axios'
// Importa Axios, una librería para hacer peticiones HTTP a una API.
import { useAuthStore } from '../store/authStore'
// Store de Zustand: fuente de verdad del token en memoria.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
// Define la URL base de la API.
// Primero intenta leer la variable de entorno VITE_API_URL.
// Si no existe, usa la URL local por defecto.

const USAR_MOCK =
  import.meta.env.VITE_USAR_MOCK === 'true' || !import.meta.env.VITE_API_URL
// Mismo patrón que catalogoService.js / reservasService.js:
// usa mock si VITE_USAR_MOCK es 'true' o si no hay VITE_API_URL configurada.

export const api = axios.create({
  baseURL: API_URL,
  // Todas las peticiones hechas con esta instancia usarán esta URL base.

  headers: { 'Content-Type': 'application/json' },
  // Indica que el contenido enviado y recibido será JSON.
})
// Crea una instancia personalizada de Axios para reutilizar configuración.

api.interceptors.request.use((config) => {
  // Interceptor que se ejecuta antes de cada petición.

  const token = useAuthStore.getState().token
  // Lee el token directo del store (ya rehidratado, siempre el JWT plano).

  if (token) config.headers.Authorization = `Bearer ${token}`
  // Si existe token, lo agrega al header Authorization
  // con el formato Bearer.

  return config
  // Devuelve la configuración modificada para que la petición continúe.
})

import mockUsersData from '../mocks/usersMock.json'

const MOCK_USERS = [...mockUsersData]
// Lista de usuarios simulados cargados desde src/mocks/usersMock.json.

const generateMockToken = () => {
  return 'mock_token_' + Math.random().toString(36).substring(2) + Date.now()
}
// Genera un token falso para simular autenticación.
// Usa texto fijo + parte aleatoria + timestamp actual.

export const DURACION_CODIGO_VERIFICACION_MS = 5 * 60 * 1000
// Cuánto dura vigente un código de verificación de correo (5 minutos).
// Se exporta para que el hook de verificación use el mismo valor
// en su cuenta regresiva local, sin duplicar el número mágico.

const CODIGOS_VERIFICACION_MOCK = new Map()
// Guarda en memoria { correo -> { codigo, expiraEn } } mientras se usa el mock.
// Al no existir backend, este Map hace las veces de "base de datos" temporal.

const CODIGOS_RECUPERACION_MOCK = new Map()
// Similar para la recuperación de contraseña.

const generarCodigoMock = () => Math.floor(100000 + Math.random() * 900000).toString()
// Genera un código numérico de 6 dígitos.

export const authService = {
  login: async ({ correo, contrasena }) => {
    // Método asíncrono para iniciar sesión.

    const usuario = MOCK_USERS.find(
      (u) => u.correo.toLowerCase() === correo.toLowerCase() && u.contrasena === contrasena
    )
    // Busca un usuario que coincida con correo y contraseña.
    // El correo se compara en minúsculas para evitar problemas por mayúsculas/minúsculas.

    if (usuario) {
      return {
        token: generateMockToken(),
        // Devuelve un token falso si el usuario existe.

        correo: usuario.correo,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        telefono: usuario.telefono,
        cedula: usuario.cedula,
        fechaNacimiento: usuario.fechaNacimiento,
        emailVerificado: usuario.emailVerificado ?? false,
        requiere2FA: false,
        // Devuelve los datos del usuario y una bandera que indica que no requiere 2FA.
      }
    }

    const error = new Error('Credenciales incorrectas')
    // Crea un error si no encuentra coincidencia.

    error.response = { status: 401 }
    // Simula un error HTTP 401 Unauthorized.

    throw error
    // Lanza el error para que lo maneje la interfaz.
  },

  registro: async (datosUsuario) => {
    const index = MOCK_USERS.findIndex(
      (u) => u.correo.toLowerCase() === datosUsuario.correo.toLowerCase()
    )

    if (index !== -1) {
      const error = new Error('El correo electrónico ya está registrado')
      error.response = { status: 400 }
      throw error
    }

    const usuario = {
      correo: datosUsuario.correo,
      contrasena: datosUsuario.contrasena,
      nombre: '',
      apellido: '',
      nacionalidad: '',
      tipoDocumento: '',
      rol: 'usuario',
      telefono: '',
      cedula: '',
      fechaNacimiento: '',
      emailVerificado: true,
    }
    MOCK_USERS.push(usuario)

    return {
      token: generateMockToken(),
      correo: usuario.correo,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      nacionalidad: usuario.nacionalidad,
      tipoDocumento: usuario.tipoDocumento,
      rol: usuario.rol,
      telefono: usuario.telefono,
      cedula: usuario.cedula,
      fechaNacimiento: usuario.fechaNacimiento,
      emailVerificado: usuario.emailVerificado ?? true,
    }
  },

  solicitarRecuperacion: async (correo) => {
    if (USAR_MOCK) {
      const usuario = MOCK_USERS.find(u => u.correo.toLowerCase() === correo.toLowerCase())
      if (!usuario) {
        const error = new Error('Este correo no está registrado en la plataforma.')
        error.response = { status: 404, data: { mensaje: error.message } }
        throw error
      }
      const codigo = generarCodigoMock()
      CODIGOS_RECUPERACION_MOCK.set(correo, {
        codigo,
        expiraEn: Date.now() + DURACION_CODIGO_VERIFICACION_MS,
      })
      console.info(`[MOCK] Código de recuperación para ${correo}: ${codigo}`)
      return { enviado: true }
    }

    const { data } = await api.post('/auth/recuperar', { correo })
    return data
  },

  verificarCodigoRecuperacion: async (correo, codigo) => {
    if (USAR_MOCK) {
      const registro = CODIGOS_RECUPERACION_MOCK.get(correo)

      if (!registro) {
        const error = new Error('No hay un código pendiente para este correo. Solicita uno nuevo.')
        error.response = { status: 400, data: { mensaje: error.message } }
        throw error
      }

      if (Date.now() > registro.expiraEn) {
        CODIGOS_RECUPERACION_MOCK.delete(correo)
        const error = new Error('El código ha expirado. Solicita uno nuevo.')
        error.response = { status: 410, data: { mensaje: error.message } }
        throw error
      }

      if (registro.codigo !== codigo) {
        const error = new Error('Código incorrecto. Verifica e intenta de nuevo.')
        error.response = { status: 400, data: { mensaje: error.message } }
        throw error
      }

      CODIGOS_RECUPERACION_MOCK.delete(correo)
      const tokenRecuperacion = 'mock_recover_token_' + Math.random().toString(36).substring(2)
      return { verificado: true, token: tokenRecuperacion }
    }

    const { data } = await api.post('/auth/recuperar/verificar-codigo', { correo, codigo })
    return data
  },

  resetearContrasena: async (token, contrasena) => {
    if (USAR_MOCK) {
      if (!token || !token.startsWith('mock_recover_token_')) {
        const error = new Error('El enlace de recuperación es inválido o ha expirado.')
        error.response = { status: 400, data: { mensaje: error.message } }
        throw error
      }
      return { exito: true }
    }

    const { data } = await api.post('/auth/nueva-contrasena', { token, contrasena })
    return data
  },

  loginGoogle: async (accessToken) => {
    // Inicia sesión con Google enviando el accessToken.

    const { data } = await api.post('/auth/google', { accessToken })
    return data
  },

  loginFacebook: async (accessToken) => {
    // Inicia sesión con Facebook enviando el accessToken.

    const { data } = await api.post('/auth/facebook', { accessToken })
    return data
  },

  verificar2FA: async (sesionTemporal, codigo) => {
    if (USAR_MOCK) {
      const userMail = typeof sesionTemporal === 'string' ? sesionTemporal : (sesionTemporal?.correo || 'cliente@Drivique.com')
      const usuario = MOCK_USERS.find(u => u.correo.toLowerCase() === userMail.toLowerCase()) || MOCK_USERS[1]
      return {
        token: generateMockToken(),
        usuario
      }
    }

    const { data } = await api.post('/auth/2fa/verificar', { sesionTemporal, codigo })
    return data
  },

  reenviarCodigo2FA: async (sesionTemporal) => {
    if (USAR_MOCK) {
      return { enviado: true }
    }

    const { data } = await api.post('/auth/2fa/reenviar', { sesionTemporal })
    return data
  },

  enviarCodigoVerificacion: async (correo) => {
    // Envía (o reenvía) el código de verificación de correo tras el registro.

    if (USAR_MOCK) {
      const codigo = generarCodigoMock()
      CODIGOS_VERIFICACION_MOCK.set(correo, {
        codigo,
        expiraEn: Date.now() + DURACION_CODIGO_VERIFICACION_MS,
      })
      console.info(`[MOCK] Código de verificación para ${correo}: ${codigo}`)
      return { enviado: true }
    }

    const { data } = await api.post('/auth/registro/enviar-codigo', { correo })
    return data
  },

  verificarCodigoRegistro: async (correo, codigo) => {
    // Valida el código de verificación de correo ingresado por el usuario.

    if (USAR_MOCK) {
      const registro = CODIGOS_VERIFICACION_MOCK.get(correo)

      if (!registro) {
        const error = new Error('No hay un código pendiente para este correo. Solicita uno nuevo.')
        error.response = { status: 400, data: { mensaje: error.message } }
        throw error
      }

      if (Date.now() > registro.expiraEn) {
        CODIGOS_VERIFICACION_MOCK.delete(correo)
        const error = new Error('El código ha expirado. Solicita uno nuevo.')
        error.response = { status: 410, data: { mensaje: error.message } }
        throw error
      }

      if (registro.codigo !== codigo) {
        const error = new Error('Código incorrecto. Verifica e intenta de nuevo.')
        error.response = { status: 400, data: { mensaje: error.message } }
        throw error
      }

      CODIGOS_VERIFICACION_MOCK.delete(correo)
      return { verificado: true }
    }

    const { data } = await api.post('/auth/registro/verificar-codigo', { correo, codigo })
    return data
  },
}