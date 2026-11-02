import { Buffer } from 'node:buffer'
import './setupTestEnv.js'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { authService, api } from '../services/authService.js'
import { reservationsService } from '../services/reservationsService.js'
import { construirUrlCheckout } from '../services/wompiService.js'

describe('Integración End-to-End Cliente Web: Login -> Reserva -> Iniciación Wompi -> Confirmación', () => {
  it('completa la secuencia de extremo a extremo enviando el token Bearer y vinculando la reserva al pago', async () => {
    const calls = []
    const validJwt = [
      Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
      Buffer.from(
        JSON.stringify({
          sub: 'usr-e2e',
          email: 'e2e@example.com',
          roles: ['CUSTOMER'],
          exp: Math.floor(Date.now() / 1000) + 3600,
        })
      ).toString('base64url'),
      'sig',
    ].join('.')

    api.defaults.adapter = async (config) => {
      calls.push({ method: config.method, url: config.url, auth: config.headers?.Authorization })
      if (config.url === '/auth/login') {
        return {
          status: 200,
          config,
          data: {
            accessToken: validJwt,
            refreshToken: 'ref-e2e',
            userProfile: { email: 'e2e@example.com', firstName: 'Cliente', lastName: 'E2E', roles: ['CUSTOMER'], accountStatus: 'ACTIVE' },
          },
        }
      }
      if (config.url === '/reservations/checkout/initiate') {
        return {
          status: 201,
          config,
          data: { holdId: 'HLD-E2E-99', status: 'PENDING_PAYMENT', totalAmount: 220000 },
        }
      }
      if (config.url === '/payments/wompi/initiate') {
        return {
          status: 201,
          config,
          data: {
            paymentId: 'pay-e2e-99',
            reference: 'PAY-E2E99',
            amountInCents: 22000000,
            currency: 'COP',
            publicKey: 'pub_test_123',
            integritySignature: 'sig-server-sha256',
          },
        }
      }
      if (config.url === '/reservations/checkout/confirm/HLD-E2E-99') {
        return {
          status: 200,
          config,
          data: { id: 'res-e2e-99', code: 'RES-E2E-99', status: 'CONFIRMED' },
        }
      }
      throw new Error(`Unexpected endpoint: ${config.url}`)
    }

    await authService.login({ correo: 'e2e@example.com', contrasena: 'Pass123!' })
    const hold = await reservationsService.crearReserva({ vehicleId: 'v-1' })
    const checkoutUrl = await construirUrlCheckout({
      reference: hold.holdId,
      amountInCents: 22000000,
      redirectUrl: 'https://drivique.tech/respuesta',
    })
    const confirmed = await reservationsService.confirmarPago(hold.holdId, 'tx-wompi-99')

    assert.equal(calls.length, 4)
    assert.equal(calls[1].auth, `Bearer ${validJwt}`)
    assert.equal(calls[2].url, '/payments/wompi/initiate')
    assert.ok(checkoutUrl.includes('signature%3Aintegrity=sig-server-sha256'))
    assert.equal(confirmed.status, 'CONFIRMED')
  })
})

