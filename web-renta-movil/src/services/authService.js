import axios from 'axios'
// Importa Axios, una librería para hacer peticiones HTTP a una API.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
// Define la URL base de la API.
// Primero intenta leer la variable de entorno VITE_API_URL.
// Si no existe, usa la URL local por defecto.

export const api = axios.create({
  baseURL: API_URL,
  // Todas las peticiones hechas con esta instancia usarán esta URL base.

  headers: { 'Content-Type': 'application/json' },
  // Indica que el contenido enviado y recibido será JSON.
})
// Crea una instancia personalizada de Axios para reutilizar configuración.

api.interceptors.request.use((config) => {
  // Interceptor que se ejecuta antes de cada petición.

  const token = localStorage.getItem('renta_token')
  // Lee del localStorage el token guardado por el login.

  if (token) config.headers.Authorization = `Bearer ${token}`
  // Si existe token, lo agrega al header Authorization
  // con el formato Bearer.

  return config
  // Devuelve la configuración modificada para que la petición continúe.
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
// Lista de usuarios simulados.
// Sirve como backend falso para pruebas de login y registro.

const generateMockToken = () => {
  return 'mock_token_' + Math.random().toString(36).substring(2) + Date.now()
}
// Genera un token falso para simular autenticación.
// Usa texto fijo + parte aleatoria + timestamp actual.

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
    // Método asíncrono para registrar usuario.
    // En este mock no crea usuarios nuevos; solo valida contra MOCK_USERS.

    const usuario = MOCK_USERS.find(
      (u) => u.correo === datosUsuario.correo && u.contrasena === datosUsuario.contrasena
    )
    // Busca un usuario que coincida exactamente con correo y contraseña.

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
      // Si lo encuentra, devuelve un objeto similar al login exitoso.
    }

    const error = new Error(
      'No existe una cuenta con estas credenciales. Usa [admin@Drivique.com](mailto:admin@Drivique.com) o [cliente@Drivique.com](mailto:cliente@Drivique.com) con la contraseña correspondiente.'
    )
    // Error personalizado para indicar que solo existen esas cuentas mock.

    error.response = { status: 400 }
    // Simula un error HTTP 400 Bad Request.

    throw error
    // Lanza el error.
  },

  solicitarRecuperacion: async (correo) => {
    // Envía una solicitud al backend para recuperar contraseña.

    const { data } = await api.post('/auth/recuperar', { correo })
    // Hace un POST al endpoint /auth/recuperar.

    return data
    // Devuelve solo la data de la respuesta.
  },

  resetearContrasena: async (token, contrasena) => {
    // Envía al backend el token de recuperación y la nueva contraseña.

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
    // Verifica un código de autenticación de dos factores.

    const { data } = await api.post('/auth/2fa/verificar', { sesionTemporal, codigo })
    return data
  },

  reenviarCodigo2FA: async (sesionTemporal) => {
    // Reenvía el código de verificación 2FA.

    const { data } = await api.post('/auth/2fa/reenviar', { sesionTemporal })
    return data
  },
}