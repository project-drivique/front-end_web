import { WompiPaymentStrategy } from './WompiPaymentStrategy';
import { CashPaymentStrategy } from './CashPaymentStrategy';

/**
 * Patrón Factory: Crea e instancia la estrategia adecuada según el método de pago seleccionado.
 */
class PaymentProcessorFactory {
  constructor() {
    this.strategies = new Map();
    // Registro inicial de estrategias soportadas
    this.register('wompi', new WompiPaymentStrategy());
    this.register('cash', new CashPaymentStrategy());
    this.register('efectivo', new CashPaymentStrategy());
  }

  /**
   * Registra una nueva estrategia de pago en tiempo de ejecución (Open/Closed Principle)
   * @param {string} key
   * @param {PaymentStrategy} strategyInstance
   */
  register(key, strategyInstance) {
    this.strategies.set(key.toLowerCase(), strategyInstance);
  }

  /**
   * Obtiene la estrategia por identificador
   * @param {string} key
   * @returns {PaymentStrategy}
   */
  getStrategy(key = 'wompi') {
    const normalizedKey = String(key || 'wompi').toLowerCase();
    const strategy = this.strategies.get(normalizedKey);
    if (!strategy) {
      console.warn(`[PaymentProcessorFactory] Estrategia no encontrada para: "${key}". Usando Wompi por defecto.`);
      return this.strategies.get('wompi');
    }
    return strategy;
  }
}

/**
 * Patrón Context / Executor: Ejecuta la estrategia seleccionada de manera agnóstica.
 */
export class PaymentContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async execute(paymentData) {
    if (!this.strategy) {
      throw new Error('[PaymentContext] Ninguna estrategia de pago ha sido configurada.');
    }
    return await this.strategy.processPayment(paymentData);
  }
}

// Instancia singleton de la fábrica
export const paymentFactory = new PaymentProcessorFactory();
