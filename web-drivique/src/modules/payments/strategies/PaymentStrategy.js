/**
 * Interface / Base Definition: PaymentStrategy
 * Patrón Strategy: Define el contrato común que deben cumplir todas las estrategias de pago.
 */
export class PaymentStrategy {
  /**
   * @param {string} id - Identificador único de la estrategia (ej. 'wompi', 'cash', 'pse')
   * @param {string} name - Nombre visible de la estrategia
   */
  constructor(id, name) {
    if (new.target === PaymentStrategy) {
      throw new TypeError('Cannot construct PaymentStrategy instances directly. Must inherit.');
    }
    this.id = id;
    this.name = name;
  }

  /**
   * Procesa la transacción según la estrategia concreta.
   * @param {Object} paymentData
   * @param {string} paymentData.reference - Referencia única de la reserva
   * @param {number} paymentData.amountInCents - Monto en centavos
   * @param {string} [paymentData.redirectUrl] - URL de redirección post-pago
   * @returns {Promise<{ success: boolean, redirectUrl?: string, message?: string }>}
   */
  async processPayment(paymentData) {
    throw new Error(`processPayment() must be implemented by subclass ${this.constructor.name}`);
  }

  /**
   * Devuelve los metadatos o requerimientos de la estrategia
   */
  getInfo() {
    return {
      id: this.id,
      name: this.name,
    };
  }
}
