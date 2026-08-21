const STORAGE_KEY = 'drivique_mock_users'

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
    let cambio = false
    configurados.filter((usuario) => usuario?.correo && usuario?.contrasena).forEach((usuario) => {
      const existe = usuarios.some((actual) => actual.correo.toLowerCase() === usuario.correo.toLowerCase())
      if (!existe) {
        usuarios.push(usuario)
        cambio = true
      }
    })
    if (cambio) guardarUsuarios(usuarios)
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
