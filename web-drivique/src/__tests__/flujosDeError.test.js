import { Buffer } from 'node:buffer'
import './setupTestEnv.js'
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { api } from '../services/httpClient.js'
import { authService } from '../services/authService.js'
import { reservationsService } from '../services/reservationsService.js'
import { useAuthStore } from '../store/authStore.js'

const crearJwt = (extra = {}) =>
  [
    Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify({ sub: 'u-1', email: 'cliente@example.com', roles: ['CUSTOMER'], exp: Math.floor(Date.now() / 1000) + 3600, ...extra })).toString('base64url'),
    'firma',
  ].join('.')

const responder = (config, status, data) => ({ status, statusText: String(status), headers: {}, config, data })
const fallar = (config, status, data) => {
  const error = new Error(`Request failed with status code ${status}`)
  error.config = config
  error.response = responder(config, status, data)
  error.isAxiosError = true
  return error
}

const iniciarSesion = async (llamadas) => {
  const jwt = crearJwt()
  api.defaults.adapter = async (config) => {
    llamadas.push({ method: config.method, url: config.url, headers: { ...config.headers } })
    if (config.url === '/auth/login') {
      return responder(config, 200, {
        accessToken: jwt,
        refreshToken: 'refresh-1',
        userProfile: { email: 'cliente@example.com', firstName: 'Cliente', lastName: 'Prueba', roles: ['CUSTOMER'], accountStatus: 'ACTIVE' },
      })
    }
    throw new Error(`Sin respuesta preparada para ${config.url}`)
  }
  await authService.login({ correo: 'cliente@example.com', contrasena: 'Clave123!' })
  return jwt
}

describe('Flujos de reserva y pago cuando algo sale mal', () => {
  beforeEach(() => {
    globalThis.sessionStorage.clear()
    globalThis.localStorage.clear()
    useAuthStore.getState().logout()
  })

  it('la solicitud de reserva viaja con una clave de idempotencia', async () => {
    const llamadas = []
    await iniciarSesion(llamadas)
    api.defaults.adapter = async (config) => {
      llamadas.push({ url: config.url, headers: { ...config.headers } })
      return responder(config, 201, { holdId: 'HLD-1', status: 'PENDING_PAYMENT' })
    }
    await reservationsService.crearReserva({ vehicleId: 'v-1' })
    const envio = llamadas.find((l) => l.url === '/reservations/checkout/initiate')
    assert.ok(envio, 'debe llamar a /reservations/checkout/initiate')
    assert.ok(String(envio.headers['Idempotency-Key'] || '').length > 8, 'debe enviar Idempotency-Key')
  })

  it('si el vehículo ya fue reservado (409) el error llega a la pantalla con su código', async () => {
    const llamadas = []
    await iniciarSesion(llamadas)
    api.defaults.adapter = async (config) => {
      throw fallar(config, 409, { title: 'Conflicto', detail: 'El vehículo no se encuentra disponible en esas fechas.' })
    }
    await assert.rejects(
      () => reservationsService.crearReserva({ vehicleId: 'v-ocupado' }),
      (error) => error.response.status === 409 && /no se encuentra disponible/.test(error.response.data.detail)
    )
  })

  it('si Wompi rechaza el pago, la confirmación falla y la reserva no queda confirmada', async () => {
    const llamadas = []
    await iniciarSesion(llamadas)
    api.defaults.adapter = async (config) => {
      llamadas.push({ url: config.url })
      throw fallar(config, 409, { title: 'Pago no aprobado', detail: 'La transacción fue rechazada.' })
    }
    await assert.rejects(
      () => reservationsService.confirmarPago('HLD-1', 'tx-rechazada'),
      (error) => error.response.status === 409
    )
    assert.equal(llamadas.at(-1).url, '/reservations/checkout/confirm/HLD-1')
  })

  it('reportar un pago fallido avisa al servidor para liberar la reserva', async () => {
    const llamadas = []
    await iniciarSesion(llamadas)
    api.defaults.adapter = async (config) => {
      llamadas.push({ method: config.method, url: config.url })
      return responder(config, 200, { status: 'PAYMENT_FAILED' })
    }
    const resultado = await reservationsService.reportarPagoFallido('HLD-1')
    assert.equal(resultado.status, 'PAYMENT_FAILED')
    assert.deepEqual(llamadas.at(-1), { method: 'post', url: '/reservations/checkout/payment-failed/HLD-1' })
  })

  it('si el token de acceso venció, renueva la sesión una vez y repite la petición', async () => {
    const llamadas = []
    const jwtViejo = await iniciarSesion(llamadas)
    const jwtNuevo = crearJwt({ jti: 'nuevo' })
    let intentos = 0
    api.defaults.adapter = async (config) => {
      llamadas.push({ url: config.url, auth: config.headers?.Authorization })
      if (config.url === '/auth/refresh') {
        return responder(config, 200, { accessToken: jwtNuevo, refreshToken: 'refresh-2', userProfile: { email: 'cliente@example.com', roles: ['CUSTOMER'] } })
      }
      intentos += 1
      if (intentos === 1) throw fallar(config, 401, { title: 'No autorizado' })
      return responder(config, 200, { id: 'res-1', status: 'CONFIRMED' })
    }
    const respuesta = await reservationsService.confirmarPago('HLD-2', 'tx-ok')
    assert.equal(respuesta.status, 'CONFIRMED')
    const urls = llamadas.slice(-3).map((l) => l.url)
    assert.deepEqual(urls, ['/reservations/checkout/confirm/HLD-2', '/auth/refresh', '/reservations/checkout/confirm/HLD-2'])
    assert.equal(llamadas.at(-1).auth, `Bearer ${jwtNuevo}`)
    assert.notEqual(jwtViejo, jwtNuevo)
  })

  it('si no hay sesión, un 401 no intenta renovar nada', async () => {
    const llamadas = []
    api.defaults.adapter = async (config) => {
      llamadas.push(config.url)
      throw fallar(config, 401, { title: 'No autorizado' })
    }
    await assert.rejects(() => api.get('/reservations/mine'), (error) => error.response.status === 401)
    assert.deepEqual(llamadas, ['/reservations/mine'])
  })
})
