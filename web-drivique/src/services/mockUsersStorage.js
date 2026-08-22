const STORAGE_KEY = 'drivique_mock_users'
const SCHEMA_KEY = 'drivique_mock_users_schema'
const CURRENT_SCHEMA = '2'

function leerUsuarios() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function guardarUsuarios(usuarios) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios))
}

export const mockUsersStorage = {
  listar: leerUsuarios,
  buscarPorCorreo(correo) {
    const normalizado = String(correo || '').trim().toLowerCase()
    return leerUsuarios().find((usuario) => usuario.correo.toLowerCase() === normalizado) || null
  },
  registrar(usuario) {
    const usuarios = leerUsuarios()
    usuarios.push(usuario)
    guardarUsuarios(usuarios)
    return usuario
  },
  asegurarConfigurados(configurados = []) {
    const usuarios = leerUsuarios()
    const requiereMigracion = localStorage.getItem(SCHEMA_KEY) !== CURRENT_SCHEMA
    let cambio = false
    configurados.filter((usuario) => usuario?.correo && usuario?.contrasena).forEach((usuario) => {
      const indice = usuarios.findIndex((actual) => actual.correo.toLowerCase() === usuario.correo.toLowerCase())
      if (indice < 0) {
        usuarios.push(usuario)
        cambio = true
        return
      }
      const actual = usuarios[indice]
      if (requiereMigracion) {
        usuarios[indice] = {
          ...actual,
          contrasena: usuario.contrasena,
          rol: usuario.rol,
          activo: usuario.activo,
          permisos: usuario.permisos,
          ...(usuario.sucursalId ? { sucursalId: usuario.sucursalId } : {}),
        }
        cambio = true
        return
      }
      const defaults = Object.fromEntries(
        Object.entries(usuario).filter(([key]) => actual[key] === undefined),
      )
      if (Object.keys(defaults).length) {
        usuarios[indice] = { ...actual, ...defaults }
        cambio = true
      }
    })
    if (cambio) guardarUsuarios(usuarios)
    if (requiereMigracion) localStorage.setItem(SCHEMA_KEY, CURRENT_SCHEMA)
    return requiereMigracion
  },
  actualizarContrasena(correo, contrasena) {
    const normalizado = String(correo || '').trim().toLowerCase()
    const usuarios = leerUsuarios()
    const indice = usuarios.findIndex((usuario) => usuario.correo.toLowerCase() === normalizado)
    if (indice < 0) return false
    usuarios[indice] = { ...usuarios[indice], contrasena }
    guardarUsuarios(usuarios)
    return true
  },
}
