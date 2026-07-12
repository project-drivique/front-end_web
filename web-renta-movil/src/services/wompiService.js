import config from '../mocks/config.json';

// Configuración de Sandbox (pub_test_/test_integrity_). Se reexporta para
// evitar que otros módulos dupliquen el import del JSON.
export const wompiConfig = config.wompi;

/**
 * TODO: MIGRAR A BACKEND
 * La firma de integridad NUNCA debe generarse en frontend ni filtrar el integrityKey en producción.
 * Esto es exclusivamente para propósitos de demostración en entorno Sandbox. En producción, este
 * cálculo debe vivir en un endpoint propio que devuelva únicamente el hash, nunca el integrityKey.
 *
 * FORMATO VERIFICADO CONTRA EL EJEMPLO OFICIAL DE WOMPI (docs.wompi.co, "Generate an integrity
 * signature"). El ejemplo oficial (con secreto de PRODUCCIÓN, solo ilustrativo) es:
 *
 *   referencia = "sk8-438k4-xmxm392-sn2m2"
 *   amount_in_cents = 490000
 *   currency = "COP"
 *   secret = "prod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6"
 *   cadena = "sk8-438k4-xmxm392-sn2m2490000COPprod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6"
 *   SHA256(cadena) hex = "37c8407747e595535433ef8f6a811d853cd943046624a0ec04662b17bbf33bf5"
 *
 * Es decir, el orden es SIEMPRE: referencia + monto_en_centavos + moneda + secreto de integridad
 * (sin separadores entre los valores). Nuestra concatenación de abajo respeta ese orden exacto.
 *
 * IMPORTANTE sobre el monto: `montoCentavos` debe ser el mismo valor entero (sin puntos, comas,
 * ni decimales) que luego se envía en el atributo `data-amount-in-cents` del widget. Si uno de los
 * dos lugares usa un número formateado (ej. "150.000") y el otro un entero plano (150000), la firma
 * no va a coincidir con lo que Wompi recalcula del lado del servidor y la transacción será
 * rechazada. Por eso `aCentavos()` siempre devuelve un entero limpio y ese mismo valor se reutiliza
 * tal cual (sin volver a formatear) tanto para firmar como para el atributo del widget.
 */
export const generarFirmaIntegridad = async (referencia, montoCentavos, moneda) => {
  if (!Number.isInteger(montoCentavos)) {
    // Defensivo: si esto llega a dispararse, la firma NO va a coincidir en el backend de Wompi.
    console.warn(
      '[Wompi] montoCentavos no es un entero exacto, esto puede invalidar la firma:',
      montoCentavos
    );
  }

  const cadena = `${referencia}${montoCentavos}${moneda}${wompiConfig.integrityKey}`;
  const encondedText = new TextEncoder().encode(cadena);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encondedText);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Wompi acepta referencias alfanuméricas que pueden incluir guiones (-) o guiones bajos (_).
 * Generamos con ese set de caracteres para evitar cualquier símbolo problemático (espacios,
 * acentos, "+", "/", etc.) que pudiera romper la URL o la validación de Wompi.
 */
export const generarReferenciaUnica = () => {
  return 'RES-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9).toUpperCase();
};

/**
 * Calcula el monto en centavos que exige Wompi (entero, sin decimales) a partir
 * del total en pesos calculado por la UI. Este es el ÚNICO lugar donde se hace la
 * conversión; el valor resultante se reutiliza igual tanto para firmar como para
 * el atributo data-amount-in-cents, para que nunca puedan desincronizarse.
 */
export const aCentavos = (totalCop) => Math.round(Number(totalCop) * 100);

/**
 * Construye la URL de Wompi Web Checkout (redirección directa a /p/) con todos los
 * parámetros requeridos por Wompi, incluida la firma de integridad ya calculada.
 *
 * NOTA HISTÓRICA: previamente se descartó esta ruta asumiendo que el 403 de CloudFront
 * provenía de invocar /p/ manualmente. Se confirmó que NO es así: /p/ responde 200 al
 * navegar directamente con una URL bien formada (public-key, currency, amount-in-cents,
 * reference y signature:integrity correctos). El 403 solo ocurría en el flujo mode=widget
 * (widget.js insertado dinámicamente), que ya no se usa. Por eso esta función vuelve a
 * ser la integración oficial del proyecto.
 *
 * @param {Object} params
 * @param {string} params.reference - Referencia única de la transacción (ej. RES-...).
 * @param {number} params.amountInCents - Monto entero en centavos (ver aCentavos()).
 * @param {string} [params.redirectUrl] - URL a la que Wompi redirige tras el pago.
 * @returns {Promise<string>} URL completa lista para window.location.href.
 */
export const construirUrlCheckout = async ({ reference, amountInCents, redirectUrl }) => {
  const currency = wompiConfig.currency;
  const firma = await generarFirmaIntegridad(reference, amountInCents, currency);

  const params = new URLSearchParams({
    'public-key': wompiConfig.publicKey,
    currency,
    'amount-in-cents': String(amountInCents),
    reference,
    'signature:integrity': firma,
  });

  if (redirectUrl) {
    params.set('redirect-url', redirectUrl);
  }

  return `https://checkout.wompi.co/p/?${params.toString()}`;
};
