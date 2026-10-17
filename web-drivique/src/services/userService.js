import { api } from './httpClient'
import { useAuthStore } from '../store/authStore'
import paisesMock from '../config/datos/nationalities.json'

const getUsuarioGuardado = () => useAuthStore.getState().usuario

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
let nacionalidadesCache = null

const getNacionalidades = async () => {
  if (!nacionalidadesCache) {
    const { data } = await api.get('/nationalities')
    nacionalidadesCache = Array.isArray(data) ? data : []
  }
  return nacionalidadesCache
}

const nombreDesdeIso = (iso) => paisesMock.find((p) => p.iso === iso)?.nombre || ''

// Nombre visible del país (ej. "Colombia") -> id guardado en el servidor
const nacionalidadIdDesdeNombre = async (nombre) => {
  if (!nombre) return undefined
  if (UUID_RE.test(nombre)) return nombre
  const iso = paisesMock.find((p) => p.nombre.toLowerCase() === String(nombre).toLowerCase())?.iso
  if (!iso) return undefined
  const lista = await getNacionalidades()
  return lista.find((n) => n.isoCode === iso)?.id
}

// Id guardado en el servidor -> nombre visible del país
const nacionalidadNombreDesdeId = async (id) => {
  if (!id) return ''
  const lista = await getNacionalidades()
  const iso = lista.find((n) => n.id === id)?.isoCode
  return nombreDesdeIso(iso)
}

export const userService = {
  nacionalidadNombreDesdeId,

  getProfile: async () => {
    try {
      const { data } = await api.get('/users/me')
      return data
    } catch (err) {
      return getUsuarioGuardado()
    }
  },

  actualizarPerfil: async (datosActualizados) => {
    const payload = {
      firstName: datosActualizados.nombre || datosActualizados.firstName,
      lastName: datosActualizados.apellido || datosActualizados.lastName,
      phone: datosActualizados.telefono || datosActualizados.phone || datosActualizados.celular,
      birthDate: datosActualizados.fechaNacimiento || datosActualizados.birthDate || undefined,
      address: datosActualizados.direccion ?? datosActualizados.address,
      nationalityId: await nacionalidadIdDesdeNombre(datosActualizados.nationalityId || datosActualizados.nacionalidad).catch(() => undefined),
      documentNumber: datosActualizados.documentNumber || datosActualizados.numDoc || datosActualizados.cedula || undefined,
      documentTypeCode: datosActualizados.documentTypeCode || datosActualizados.tipoDoc || datosActualizados.tipoDocumento || undefined,
      documentTypeId: datosActualizados.documentTypeId || undefined,
    }
    const { data } = await api.put('/users/me', payload)
    return data
  },

  getPreferences: async () => {
    try {
      const { data } = await api.get('/user/preferences')
      return data
    } catch (err) {
      if (err.response?.status === 404) {
        const { data } = await api.get('/users/me/preferences')
        return data
      }
      throw err
    }
  },

  updatePreferences: async (preferences) => {
    try {
      const { data } = await api.put('/user/preferences', preferences)
      return data
    } catch (err) {
      if (err.response?.status === 404) {
        const { data } = await api.put('/users/me/preferences', preferences)
        return data
      }
      throw err
    }
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

  uploadTypedDocument: async ({ documentTypeId, documentNumber, branchId, frontFile, backFile }) => {
    const formData = new FormData()
    formData.append('documentTypeId', documentTypeId)
    if (documentNumber) formData.append('documentNumber', documentNumber)
    formData.append('branchId', branchId)
    formData.append('frontFile', frontFile)
    if (backFile) formData.append('backFile', backFile)
    return userService.uploadDocument(formData)
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

