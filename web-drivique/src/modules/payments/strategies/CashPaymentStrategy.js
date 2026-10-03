import { PaymentStrategy } from './PaymentStrategy';

/**
 * Estrategia Concreta: CashPaymentStrategy
 * Implementa el flujo de pago presencial en mostrador de la sucursal.
 */
export class CashPaymentStrategy extends PaymentStrategy {
  constructor() {
    super('cash', 'Pago en Mostrador de Sucursal');
  }

  /**
   * Procesa la solicitud de pago en efectivo / taquilla sin redirección externa.
   */
  async processPayment({ reference, amountInCents }) {
    if (!reference) {
      throw new Error('[CashPaymentStrategy] Referencia de reserva requerida.');
    }

    return {
      success: true,
      message: 'Instrucciones de pago en sucursal registradas.',
      reference,
      amountInCents,
      isOffline: true,
    };
  }
}
