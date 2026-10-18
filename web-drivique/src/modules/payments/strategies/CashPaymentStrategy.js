import { PaymentStrategy } from './PaymentStrategy';
import i18n from '@/i18n'

/**
 * Estrategia Concreta: CashPaymentStrategy
 * Implementa el flujo de pago presencial en mostrador de la sucursal.
 */
export class CashPaymentStrategy extends PaymentStrategy {
  constructor() {
    super('cash', i18n.t('hc2.pago_en_mostrador_de_sucursal', 'Pago en Mostrador de Sucursal'));
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
      message: i18n.t('hc.instrucciones_de_pago_en_sucursal_regi', 'Instrucciones de pago en sucursal registradas.'),
      reference,
      amountInCents,
      isOffline: true,
    };
  }
}
