import './setupTestEnv.js'
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { reservationsService } from '../services/reservationsService.js'
import { api } from '../services/httpClient.js'

describe('Flujo de Reserva (Creación de Hold y Confirmación de Pago)', () => {
  beforeEach(() => {
    globalThis.sessionStorage.clear()
  })

  it('crea una reserva temporal (hold) invocando POST /reservations/checkout/initiate con Idempotency-Key', async () => {
    let requestSent = null
    api.defaults.adapter = async (config) => {
      requestSent = config
      return {
        status: 201,
        statusText: 'Created',
        headers: {},
        config,
        data: {
          holdId: 'HLD-2026-0001',
          reservationId: '8a111111-2222-3333-4444-555555555555',
          status: 'PENDING_PAYMENT',
          totalAmount: 450000,
        },
      }
    }

    const payload = {
      vehicleId: '11111111-2222-3333-4444-555555555555',
      pickupBranchId: '22222222-3333-4444-5555-666666666666',
      returnBranchId: '22222222-3333-4444-5555-666666666666',
      pickupAt: '2026-12-01T10:00:00Z',
      returnAt: '2026-12-04T10:00:00Z',
    }

    const created = await reservationsService.crearReserva(payload)

    assert.ok(requestSent)
    assert.equal(requestSent.url, '/reservations/checkout/initiate')
    assert.ok(requestSent.headers['Idempotency-Key'])
    assert.equal(created.holdId, 'HLD-2026-0001')
    assert.equal(created.status, 'PENDING_PAYMENT')
  })

  it('confirma el pago de la reserva invocando POST /reservations/checkout/confirm/:holdId con transactionId', async () => {
    let requestSent = null
    api.defaults.adapter = async (config) => {
      requestSent = config
      return {
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        data: {
          id: '8a111111-2222-3333-4444-555555555555',
          code: 'RES-2026-0001',
          status: 'CONFIRMED',
        },
      }
    }

    const confirmed = await reservationsService.confirmarPago('HLD-2026-0001', '129944-1700000000-99999')

    assert.ok(requestSent)
    assert.equal(requestSent.url, '/reservations/checkout/confirm/HLD-2026-0001')
    assert.equal(requestSent.params.transactionId, '129944-1700000000-99999')
    assert.equal(confirmed.status, 'CONFIRMED')
  })
})

