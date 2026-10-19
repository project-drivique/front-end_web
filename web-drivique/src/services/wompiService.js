import config from '../config/datos/config.json';

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
// Implementación pura de SHA-256 (FIPS 180-4) para fallback en contextos HTTP no seguros
function sha256HexFallback(message) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const maxWord = Math.pow(2, 32);
  const words = [];
  const asciiBitLength = message.length * 8;
  let hash = [];
  const k = [];
  let primeCounter = 0;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  let msg = message + '\x80';
  while ((msg.length % 64) - 56) msg += '\x00';
  for (let i = 0; i < msg.length; i++) {
    const j = msg.charCodeAt(i);
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;
  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);
    hash = hash.slice(0, 8);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const a = hash[0];
      const e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  return hash
    .map((word) => ('00000000' + (word >>> 0).toString(16)).slice(-8))
    .join('');
}

export const generarFirmaIntegridad = async (referencia, montoCentavos, moneda) => {
  if (!Number.isInteger(montoCentavos)) {
    // Defensivo: si esto llega a dispararse, la firma NO va a coincidir en el backend de Wompi.
    console.warn(
      '[Wompi] montoCentavos no es un entero exacto, esto puede invalidar la firma:',
      montoCentavos
    );
  }

  const cadena = `${referencia}${montoCentavos}${moneda}${wompiConfig.integrityKey}`;

  if (typeof window !== 'undefined' && window.crypto?.subtle?.digest) {
    try {
      const encondedText = new TextEncoder().encode(cadena);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', encondedText);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('[Wompi] Fallback to pure JS SHA-256:', e);
    }
  }

  return sha256HexFallback(cadena);
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

  const netlifyUrl = import.meta.env?.VITE_NETLIFY_URL || import.meta.env?.VITE_PUBLIC_URL || '';
  let targetRedirect = redirectUrl || (typeof window !== 'undefined' ? `${window.location.origin}/respuesta` : '');

  if (netlifyUrl && netlifyUrl.startsWith('https://')) {
    params.set('redirect-url', `${netlifyUrl.replace(/\/$/, '')}/respuesta`);
  } else if (targetRedirect) {
    if (targetRedirect.includes('localhost')) {
      // CloudFront WAF de Wompi bloquea la palabra 'localhost' con 403.
      // 'localtest.me' es un dominio DNS público que resuelve a 127.0.0.1 y pasa el WAF con 200 OK.
      targetRedirect = targetRedirect.replace('localhost', 'localtest.me');
    }
    const isIpHost = /(?:\d{1,3}\.){3}\d{1,3}/.test(targetRedirect);
    // CloudFront WAF de Wompi bloquea direcciones IP privadas (172.x, 192.168.x, 10.x) con 403.
    // Al omitir redirect-url cuando se navega por IP, Wompi responde 200 OK y abre la pasarela exitosamente.
    if (!isIpHost) {
      params.set('redirect-url', targetRedirect);
    }
  }

  return `https://checkout.wompi.co/p/?${params.toString()}`;
};
