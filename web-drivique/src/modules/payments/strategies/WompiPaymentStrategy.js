import { PaymentStrategy } from './PaymentStrategy';
import { construirUrlCheckout } from '@/services/wompiService';

/**
 * Estrategia Concreta: WompiPaymentStrategy
 * Implementa el procesamiento de pago a través de la pasarela Wompi Web Checkout.
 */
export class WompiPaymentStrategy extends PaymentStrategy {
  constructor() {
    super('wompi', 'Wompi Web Checkout');
  }

  /**
   * Genera el intento de pago con firma de integridad y obtiene la URL de redirección.
   */
  async processPayment({ reference, amountInCents, redirectUrl }) {
    if (!reference || !amountInCents) {
      throw new Error('[WompiPaymentStrategy] Referencia y monto son requeridos.');
    }

    const baseRef = reference;
    const attemptRef = `${baseRef}_${Date.now()}`;

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('current_wompi_reference', baseRef);
      sessionStorage.setItem('current_wompi_attempt_ref', attemptRef);
    }

    const targetRedirect =
      redirectUrl || (typeof window !== 'undefined' ? `${window.location.origin}/respuesta` : '');

    const url = await construirUrlCheckout({
      reference: attemptRef,
      amountInCents,
      redirectUrl: targetRedirect,
    });

    return {
      success: true,
      redirectUrl: url,
      reference: attemptRef,
    };
  }
}
