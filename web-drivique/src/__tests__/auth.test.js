import { Buffer } from 'node:buffer'
import './setupTestEnv.js'
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { authService, api } from '../services/authService.js'
import { useAuthStore, AUTH_KEYS, isValidAuthToken } from '../store/authStore.js'

const createTestJwt = (payloadObj) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url')
  return `${header}.${payload}.test-signature`
}

describe('Flujo de Autenticación y Sesión Segura (Login & sessionStorage)', () => {
  beforeEach(() => {
    globalThis.sessionStorage.clear()
    globalThis.localStorage.clear()
    useAuthStore.getState().logout()
  })

  it('valida correctamente la expiración de un token JWT', () => {
    const validJwt = createTestJwt({
      sub: 'user-1',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
    const expiredJwt = createTestJwt({
      sub: 'user-1',
      exp: Math.floor(Date.now() / 1000) - 60,
    })

    assert.equal(isValidAuthToken(validJwt), true)
    assert.equal(isValidAuthToken(expiredJwt), false)
    assert.equal(isValidAuthToken(null), false)
  })

  it('inicia sesión vía POST /auth/login y almacena el token en sessionStorage (nunca en localStorage)', async () => {
    const validJwt = createTestJwt({
      sub: 'user-101',
      email: 'cliente.prueba@example.com',
      roles: ['CUSTOMER'],
      exp: Math.floor(Date.now() / 1000) + 3600,
    })

    let capturedRequest = null
    api.defaults.adapter = async (config) => {
      capturedRequest = config
      return {
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        data: {
          accessToken: validJwt,
          refreshToken: 'refresh-tok-123',
          userProfile: {
            email: 'cliente.prueba@example.com',
            firstName: 'Laura',
            lastName: 'Pérez',
            phone: '+573001112233',
            roles: ['CUSTOMER'],
            accountStatus: 'ACTIVE',
          },
        },
      }
    }

    const result = await authService.login({
      correo: 'cliente.prueba@example.com',
      contrasena: 'PasswordSegura123!',
    })

    assert.ok(capturedRequest)
    assert.equal(capturedRequest.url, '/auth/login')
    assert.equal(result.correo, 'cliente.prueba@example.com')
    assert.equal(result.rol, 'usuario')
    assert.equal(useAuthStore.getState().token, validJwt)
    assert.equal(globalThis.sessionStorage.getItem(AUTH_KEYS.token), validJwt)
    assert.equal(globalThis.localStorage.getItem(AUTH_KEYS.token), null)
  })
  it('al cerrar sesión avisa al servidor para revocar el refresh token y lo borra del navegador', async () => {
    const llamadas = []
    const fetchOriginal = globalThis.fetch
    globalThis.fetch = async (url, opciones) => {
      llamadas.push({ url: String(url), cuerpo: JSON.parse(opciones.body), metodo: opciones.method })
      return { ok: true, status: 204 }
    }
    try {
      globalThis.sessionStorage.setItem('drivique_refresh_token', 'refresh-tok-123')
      useAuthStore.getState().logout()
      assert.equal(llamadas.length, 1)
      assert.ok(llamadas[0].url.endsWith('/auth/logout'))
      assert.equal(llamadas[0].metodo, 'POST')
      assert.equal(llamadas[0].cuerpo.refreshToken, 'refresh-tok-123')
      assert.equal(globalThis.sessionStorage.getItem('drivique_refresh_token'), null)
      assert.equal(useAuthStore.getState().token, null)
    } finally {
      globalThis.fetch = fetchOriginal
    }
  })

  it('cerrar sesión sin refresh token no llama al servidor', () => {
    let llamadas = 0
    const fetchOriginal = globalThis.fetch
    globalThis.fetch = async () => { llamadas += 1; return { ok: true } }
    try {
      useAuthStore.getState().logout()
      assert.equal(llamadas, 0)
    } finally {
      globalThis.fetch = fetchOriginal
    }
  })
})
