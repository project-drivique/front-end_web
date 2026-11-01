import './setupTestEnv.js'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { iniciarPagoWompi, construirUrlCheckout, wompiConfig, aCentavos } from '../services/wompiService.js'
import { WompiPaymentStrategy } from '../modules/payments/strategies/WompiPaymentStrategy.js'
import { api } from '../services/httpClient.js'

describe('Flujo de Pago con Wompi firmado en el Servidor (POST /v1/payments/wompi/initiate)', () => {
  it('no expone ninguna llave de integridad (integrityKey) en la configuración del cliente', () => {
    assert.equal(wompiConfig.integrityKey, undefined)
    assert.equal(aCentavos(150000), 15000000)
  })

  it('invoca POST /payments/wompi/initiate con reservationReference limpia y construye la URL oficial con la firma del servidor', async () => {
    let postedBody = null
    let postedUrl = null

    api.defaults.adapter = async (config) => {
      postedUrl = config.url
      postedBody = JSON.parse(config.data)
      return {
        status: 201,
        statusText: 'Created',
        headers: {},
        config,
        data: {
          paymentId: '99999999-1111-2222-3333-444444444444',
          reference: 'PAY-99999999111122223333444444444444',
          amountInCents: 45000000,
          currency: 'COP',
          publicKey: 'pub_test_Xq9JLHZllsreCdWcFQoubBvUZUQ61sFC',
          integritySignature: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
        },
      }
    }

    const checkoutUrl = await construirUrlCheckout({
      reference: 'HLD-2026-0001_1730000000000',
      amountInCents: 45000000,
      redirectUrl: 'https://drivique.tech/respuesta',
    })

    assert.equal(postedUrl, '/payments/wompi/initiate')
    assert.equal(postedBody.reservationReference, 'HLD-2026-0001')
    assert.equal(postedBody.paymentMethodCode, 'CREDIT_CARD')

    const parsed = new URL(checkoutUrl)
    assert.equal(parsed.origin, 'https://checkout.wompi.co')
    assert.equal(parsed.pathname, '/p/')
    assert.equal(parsed.searchParams.get('reference'), 'PAY-99999999111122223333444444444444')
    assert.equal(parsed.searchParams.get('amount-in-cents'), '45000000')
    assert.equal(
      parsed.searchParams.get('signature:integrity'),
      'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90'
    )
    assert.equal(parsed.searchParams.get('redirect-url'), 'https://drivique.tech/respuesta')
  })

  it('ejecuta WompiPaymentStrategy guardando la referencia de reserva en sessionStorage y delegando la firma al backend', async () => {
    api.defaults.adapter = async (config) => ({
      status: 201,
      statusText: 'Created',
      headers: {},
      config,
      data: {
        paymentId: '77777777-1111-2222-3333-444444444444',
        reference: 'PAY-77777777111122223333444444444444',
        amountInCents: 30000000,
        currency: 'COP',
        publicKey: 'pub_test_Xq9JLHZllsreCdWcFQoubBvUZUQ61sFC',
        integritySignature: 'ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00',
      },
    })

    const strategy = new WompiPaymentStrategy()
    const res = await strategy.processPayment({
      reference: 'RES-2026-7788',
      amountInCents: 30000000,
      redirectUrl: 'https://drivique.tech/respuesta',
    })

    assert.equal(res.success, true)
    assert.equal(globalThis.sessionStorage.getItem('current_wompi_reference'), 'RES-2026-7788')
    assert.ok(res.redirectUrl.includes('signature%3Aintegrity=ff00ff00'))
    assert.ok(res.redirectUrl.includes('reference=PAY-77777777111122223333444444444444'))
  })
})

