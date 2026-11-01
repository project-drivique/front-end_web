import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const AUTH_KEYS = {
  token: 'renta_token',
  usuario: 'renta_user',
}

// Decodifica el cuerpo de un JWT respetando UTF-8 (acentos en nombres de sucursal, etc.)
const decodeJwtPayload = (payload) => {
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return JSON.parse(new TextDecoder('utf-8').decode(bytes))
}

export const isValidAuthToken = (token) => {
  if (!token || token === 'null' || token === 'undefined') return false
  try {
    const [, payload] = token.split('.')
    if (!payload) return false
    const decoded = decodeJwtPayload(payload)
    return typeof decoded.exp === 'number' && decoded.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

const getSafeSessionStorage = () => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    return window.sessionStorage
  }
  return null
}

// Storage de sesión seguro: almacena el JWT y perfil en sessionStorage (nunca en localStorage)
// para mitigar persistencia indefinida ante XSS.
const authStorage = {
  getItem: () => {
    const storage = getSafeSessionStorage()
    if (!storage) {
      return { state: { token: null, usuario: null, verificacionCorreo: null, recuperacionCorreo: null }, version: 0 }
    }
    const token = storage.getItem(AUTH_KEYS.token)
    let usuario
    try {
      const usuarioRaw = storage.getItem(AUTH_KEYS.usuario)
      usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null
    } catch {
      usuario = null
    }
    const verificationEmail = storage.getItem('renta_verification_email')
    const recoveryEmail = storage.getItem('renta_recovery_email')
    const recoveryCode = storage.getItem('renta_recovery_code')
    if (!isValidAuthToken(token)) {
      return {
        state: {
          token: null,
          usuario: null,
          verificacionCorreo: verificationEmail ? { correo: verificationEmail } : null,
          recuperacionCorreo: recoveryEmail ? { correo: recoveryEmail, codigo: recoveryCode } : null,
        },
        version: 0,
      }
    }

    try {
      const [, payload] = token.split('.')
      if (payload) {
        const decoded = decodeJwtPayload(payload)
        if (decoded && Array.isArray(decoded.roles)) {
          const isBranchAdmin = decoded.roles.includes('BRANCH_ADMIN') || decoded.roles.includes('BRANCH_MANAGER')
          const isSuperAdmin = decoded.roles.includes('SUPER_ADMIN') || decoded.roles.includes('ADMIN')
          if (isBranchAdmin || isSuperAdmin) {
            usuario = {
              ...(usuario || {}),
              roles: decoded.roles,
              rol: isSuperAdmin ? 'administrador' : 'encargado_sucursal',
              sucursalId: decoded.branchId || usuario?.sucursalId || null,
              branchId: decoded.branchId || usuario?.branchId || null,
              sucursalAsignada: decoded.branchName || usuario?.sucursalAsignada || '',
              branchName: decoded.branchName || usuario?.branchName || '',
              correo: decoded.email || usuario?.correo || '',
              nombre: decoded.name || usuario?.nombre || '',
            }
          }
        }
      }
    } catch {
      // ignore token decode error and keep existing usuario
    }

    return {
      state: {
        token,
        usuario,
        verificacionCorreo: verificationEmail ? { correo: verificationEmail } : null,
        recuperacionCorreo: recoveryEmail ? { correo: recoveryEmail, codigo: recoveryCode } : null,
      },
      version: 0,
    }
  },
  setItem: (_name, value) => {
    const storage = getSafeSessionStorage()
    if (!storage) return
    const { token, usuario } = value.state
    if (token) {
      storage.setItem(AUTH_KEYS.token, token)
    } else {
      storage.removeItem(AUTH_KEYS.token)
    }
    if (usuario) {
      storage.setItem(AUTH_KEYS.usuario, JSON.stringify(usuario))
    } else {
      storage.removeItem(AUTH_KEYS.usuario)
    }
    const verificationEmail = value.state.verificacionCorreo?.correo
    const recoveryEmail = value.state.recuperacionCorreo?.correo
    verificationEmail
      ? storage.setItem('renta_verification_email', verificationEmail)
      : storage.removeItem('renta_verification_email')
    recoveryEmail
      ? storage.setItem('renta_recovery_email', recoveryEmail)
      : storage.removeItem('renta_recovery_email')
    if (value.state.recuperacionCorreo?.codigo) {
      storage.setItem('renta_recovery_code', value.state.recuperacionCorreo.codigo)
    }
  },
  removeItem: () => {
    const storage = getSafeSessionStorage()
    if (!storage) return
    storage.removeItem(AUTH_KEYS.token)
    storage.removeItem(AUTH_KEYS.usuario)
    storage.removeItem('renta_verification_email')
    storage.removeItem('renta_recovery_email')
    storage.removeItem('renta_recovery_code')
  },
}

// Lectura síncrona inmediata para evitar parpadeos (FOUC) en el primer render
const getInitialAuthState = () => {
  try {
    const storage = getSafeSessionStorage()
    if (!storage) return { token: null, usuario: null }
    const token = storage.getItem(AUTH_KEYS.token)
    const usuarioRaw = storage.getItem(AUTH_KEYS.usuario)
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null
    const esValido = isValidAuthToken(token)
    if (!esValido) {
      storage.removeItem(AUTH_KEYS.token)
      storage.removeItem(AUTH_KEYS.usuario)
    }
    return {
      token: esValido ? token : null,
      usuario: esValido ? usuario : null,
    }
  } catch {
    return { token: null, usuario: null }
  }
}

const initialStorage = getSafeSessionStorage()
const initialAuth = getInitialAuthState()
initialAuth.verificacionCorreo = initialStorage?.getItem('renta_verification_email')
  ? { correo: initialStorage.getItem('renta_verification_email') }
  : null
initialAuth.recuperacionCorreo = initialStorage?.getItem('renta_recovery_email')
  ? {
      correo: initialStorage.getItem('renta_recovery_email'),
      codigo: initialStorage.getItem('renta_recovery_code'),
    }
  : null

export const useAuthStore = create(
  persist(
    (set) => ({
      token: initialAuth.token,
      usuario: initialAuth.usuario,
      sesion2FA: null,
      requiere2FA: false,
      verificacionCorreo: initialAuth.verificacionCorreo,
      recuperacionCorreo: initialAuth.recuperacionCorreo,

      login: (token, usuario) => {
        set({ token, usuario, sesion2FA: null, requiere2FA: false, verificacionCorreo: null, recuperacionCorreo: null })
      },

      actualizarUsuario: (datosActualizados) => {
        set((state) => ({
          usuario: { ...state.usuario, ...datosActualizados },
        }))
      },

      iniciar2FA: (sesionTemporal) => {
        set({ sesion2FA: sesionTemporal, requiere2FA: true })
      },

      cancelar2FA: () => {
        set({ sesion2FA: null, requiere2FA: false })
      },

      iniciarVerificacionCorreo: (correo, datosAcceso) => {
        set({ verificacionCorreo: { correo, datosAcceso } })
      },

      cancelarVerificacionCorreo: () => {
        set({ verificacionCorreo: null })
      },

      iniciarRecuperacionCorreo: (correo, codigo = null) => {
        set({ recuperacionCorreo: { correo, codigo } })
      },

      cancelarRecuperacionCorreo: () => {
        set({ recuperacionCorreo: null })
      },

      logout: () => {
        set({ token: null, usuario: null, sesion2FA: null, requiere2FA: false, verificacionCorreo: null, recuperacionCorreo: null })
        const storage = getSafeSessionStorage()
        storage?.removeItem(AUTH_KEYS.token)
        storage?.removeItem(AUTH_KEYS.usuario)
        storage?.removeItem('drivique_refresh_token')
      },
    }),
    {
      name: 'renta-auth',
      storage: authStorage,
      partialize: (state) => ({
        token: state.token,
        usuario: state.usuario,
        verificacionCorreo: state.verificacionCorreo ? { correo: state.verificacionCorreo.correo } : null,
        recuperacionCorreo: state.recuperacionCorreo ? { correo: state.recuperacionCorreo.correo, codigo: state.recuperacionCorreo.codigo } : null,
      }),
    }
  )
)
