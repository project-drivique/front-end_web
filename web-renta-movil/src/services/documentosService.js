/**
 * Servicio temporal para simular la persistencia de documentos (cédula y
 * licencia) ya verificados de un usuario, para no volver a pedirlos en
 * reservas futuras. Esto debería migrarse a un backend real (guardando los
 * archivos en storage seguro), pero mientras no exista, se simula con
 * localStorage guardando solo metadata (nombre, tamaño, fecha) asociada al
 * usuario actual.
 */

const STORAGE_KEY = 'drivique_documentos_usuario'

function leerTodos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error('Error leyendo documentos guardados', error)
    return {}
  }
}

function guardarTodos(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function metaDeArchivo(file) {
  if (!file) return null
  return {
    nombre: file.name,
    tamañoKb: Math.round(file.size / 1024),
  }
}

export const documentosService = {
  /**
   * Devuelve true si el usuario ya tiene cédula y licencia registradas.
   */
  tieneDocumentos: (idUsuario) => {
    if (!idUsuario) return false
    const todos = leerTodos()
    const registro = todos[idUsuario]
    return Boolean(registro?.cedula && registro?.licencia)
  },

  obtenerDocumentos: (idUsuario) => {
    if (!idUsuario) return null
    const todos = leerTodos()
    return todos[idUsuario] || null
  },

  /**
   * Guarda/actualiza la metadata de los documentos del usuario. Solo
   * sobreescribe los campos que vengan con archivo nuevo; si el usuario no
   * subió un archivo nuevo (porque ya tenía documentos verificados), se
   * conserva el registro existente para ese documento.
   */
  guardarDocumentos: (idUsuario, { cedulaPdf, licenciaPdf } = {}) => {
    if (!idUsuario) return null
    const todos = leerTodos()
    const actual = todos[idUsuario] || {}

    const registro = {
      cedula: cedulaPdf ? metaDeArchivo(cedulaPdf) : actual.cedula || null,
      licencia: licenciaPdf ? metaDeArchivo(licenciaPdf) : actual.licencia || null,
      actualizadoEn: new Date().toISOString(),
    }

    todos[idUsuario] = registro
    guardarTodos(todos)
    return registro
  },
}
