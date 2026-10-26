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

// La web usa 'PASAPORTE'; el servidor guarda el código PASSPORT
const codigoTipoDocumento = (tipo) => {
  if (!tipo) return undefined
  const up = String(tipo).trim().toUpperCase()
  return up === 'PASAPORTE' ? 'PASSPORT' : up
}

export const userService = {
  nacionalidadNombreDesdeId,

  getProfile: async () => {
    try {
      const { data } = await api.get('/users/me')
      return data
    } catch {
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
      documentTypeCode: codigoTipoDocumento(datosActualizados.documentTypeCode || datosActualizados.tipoDoc || datosActualizados.tipoDocumento),
      documentTypeId: datosActualizados.documentTypeId || undefined,
    }
    const { data } = await api.put('/users/me', payload)
    return data
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

  uploadTypedDocument: async ({ documentTypeId, documentNumber, branchId, frontFile, backFile }) => {
    const formData = new FormData()
    formData.append('documentTypeId', documentTypeId)
    if (documentNumber) formData.append('documentNumber', documentNumber)
    formData.append('branchId', branchId)
    formData.append('frontFile', frontFile)
    if (backFile) formData.append('backFile', backFile)
    return userService.uploadDocument(formData)
  },

  // El correo de la cuenta no se puede cambiar desde el perfil (el servidor lo mantiene bloqueado)
  verificarCorreoDisponible: async () => ({ disponible: true }),

  // Confirma la contraseña actual con el servidor; si es incorrecta lanza el error (antes se ignoraba y siempre pasaba)
  verificarContrasena: async (contrasena) => {
    await api.post('/auth/verify-password', { password: contrasena })
    return { valida: true }
  },

  cambiarContrasena: async (contrasenaActual, contrasenaNueva) => {
    const { data } = await api.post('/auth/change-password', { currentPassword: contrasenaActual, newPassword: contrasenaNueva })
    return data
  },
}

