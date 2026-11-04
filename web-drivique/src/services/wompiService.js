import config from '../config/datos/config.json' with { type: 'json' };

// Configuración pública de Wompi (sin secretos de integridad en el cliente).
export const wompiConfig = config.wompi;

/**
 * Genera una referencia alfanumérica limpia para reservas/intentos locales.
 */
export const generarReferenciaUnica = () => {
  return 'RES-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9).toUpperCase();
};

/**
 * Calcula el monto en centavos entero exigido por Wompi a partir del total en COP.
 */
export const aCentavos = (totalCop) => Math.round(Number(totalCop) * 100);

/**
 * Solicita al backend la iniciación oficial del pago en Wompi (`POST /v1/payments/wompi/initiate`).
 * El servidor crea la fila PENDING en `billing.payments`, calcula el monto oficial y devuelve
 * la firma de integridad SHA-256 sin exponer `integrityKey` en el cliente.
 *
 * @param {Object} params
 * @param {string} [params.contractId] - UUID del contrato (opcional si se envía reservationReference).
 * @param {string} [params.reservationReference] - ID o código de la reserva (ej. HLD-... o UUID).
 * @param {string} [params.paymentMethodCode] - Código del método de pago (por defecto CREDIT_CARD).
 * @returns {Promise<{paymentId: string, reference: string, amountInCents: number, currency: string, publicKey: string, integritySignature: string}>}
 */
export const iniciarPagoWompi = async ({
  contractId = null,
  reservationReference = null,
  paymentMethodCode = 'CREDIT_CARD',
}) => {
  const { api } = await import('./httpClient.js');
  const payload = {
    paymentMethodCode: paymentMethodCode || 'CREDIT_CARD',
  };
  const isUuid = (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(val || '').trim());
  if (contractId && isUuid(contractId)) {
    payload.contractId = String(contractId).trim();
  }
  if (reservationReference) {
    const cleanRef = String(reservationReference).includes('_')
      ? String(reservationReference).split('_')[0].trim()
      : String(reservationReference).trim();
    payload.reservationReference = cleanRef;
    if (!payload.contractId && isUuid(cleanRef)) {
      payload.contractId = cleanRef;
    }
  }

  // Si contractId no fue provisto (requerido por el backend Spring Boot), se obtiene el contrato asociado
  if (!payload.contractId && payload.reservationReference) {
    try {
      const { contractService } = await import('./contractService.js');
      const contract = await contractService.obtenerPorReserva(payload.reservationReference);
      if (contract?.id && isUuid(contract.id)) {
        payload.contractId = String(contract.id).trim();
      }
    } catch {
      // Si aún no se puede resolver, el backend responderá con el detalle RFC 7807 correspondiente
    }
  }

  const { data } = await api.post('/payments/wompi/initiate', payload);
  return data;
};

/**
 * Construye la URL de Wompi Web Checkout (redirección directa a /p/) solicitando primero
 * los parámetros firmados al backend (`POST /v1/payments/wompi/initiate`).
 *
 * @param {Object} params
 * @param {string} params.reference - Referencia o ID de la reserva.
 * @param {string} [params.contractId] - UUID del contrato si ya se conoce.
 * @param {number} [params.amountInCents] - Monto en centavos (el servidor prevalece con el monto oficial).
 * @param {string} [params.redirectUrl] - URL a la que Wompi redirige tras el pago.
 * @param {string} [params.paymentMethodCode] - Código del método de pago.
 * @returns {Promise<string>} URL completa lista para window.location.href.
 */
export const construirUrlCheckout = async ({
  reference,
  contractId = null,
  amountInCents,
  redirectUrl,
  paymentMethodCode = 'CREDIT_CARD',
}) => {
  const checkout = await iniciarPagoWompi({
    contractId,
    reservationReference: reference,
    paymentMethodCode,
  });

  const resolvedPublicKey = checkout?.publicKey;
  const resolvedCurrency = checkout?.currency || wompiConfig.currency || 'COP';
  const resolvedAmount = checkout?.amountInCents ?? amountInCents;
  const resolvedReference = checkout?.reference || reference;
  const resolvedSignature = checkout?.integritySignature;

  if (!resolvedPublicKey) {
    throw new Error('[Wompi] El servidor no devolvió la llave pública del pago.');
  }
  if (!resolvedSignature) {
    throw new Error('[Wompi] El servidor no devolvió la firma de integridad del pago.');
  }

  const params = new URLSearchParams({
    'public-key': resolvedPublicKey,
    currency: resolvedCurrency,
    'amount-in-cents': String(resolvedAmount),
    reference: resolvedReference,
    'signature:integrity': resolvedSignature,
  });

  const netlifyUrl = import.meta.env?.VITE_NETLIFY_URL || import.meta.env?.VITE_PUBLIC_URL || '';
  let targetRedirect =
    redirectUrl || (typeof window !== 'undefined' ? `${window.location.origin}/respuesta` : '');

  if (netlifyUrl && netlifyUrl.startsWith('https://')) {
    params.set('redirect-url', `${netlifyUrl.replace(/\/$/, '')}/respuesta`);
  } else if (targetRedirect) {
    if (targetRedirect.includes('localhost')) {
      targetRedirect = targetRedirect.replace('localhost', 'localtest.me');
    }
    const isIpHost = /(?:\d{1,3}\.){3}\d{1,3}/.test(targetRedirect);
    if (!isIpHost) {
      params.set('redirect-url', targetRedirect);
    }
  }

  return `https://checkout.wompi.co/p/?${params.toString()}`;
};
