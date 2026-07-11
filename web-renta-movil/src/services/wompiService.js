import config from '../mocks/config.json';

// Configuración de Sandbox (pub_test_/test_integrity_). Se reexporta para que
// los componentes (ej. WompiCheckoutButton) no dupliquen el import del JSON.
export const wompiConfig = config.wompi;

/**
 * TODO: MIGRAR A BACKEND
 * La firma de integridad NUNCA debe generarse en frontend ni filtrar el integrityKey en producción.
 * Esto es exclusivamente para propósitos de demostración en entorno Sandbox. En producción, este
 * cálculo debe vivir en un endpoint propio que devuelva únicamente el hash, nunca el integrityKey.
 * Formato exigido por Wompi: SHA-256("<referencia><monto-en-centavos><moneda><integritySecret>") en hex.
 */
export const generarFirmaIntegridad = async (referencia, montoCentavos, moneda) => {
  const cadena = `${referencia}${montoCentavos}${moneda}${wompiConfig.integrityKey}`;
  const encondedText = new TextEncoder().encode(cadena);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encondedText);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const generarReferenciaUnica = () => {
  return 'RES-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9).toUpperCase();
};

/**
 * Calcula el monto en centavos que exige Wompi (entero, sin decimales) a partir
 * del total en pesos calculado por la UI.
 */
export const aCentavos = (totalCop) => Math.round(Number(totalCop) * 100);

// NOTA IMPORTANTE:
// La función anterior `iniciarCheckoutWompi` (basada en window.location.href / form GET
// hacia https://checkout.wompi.co/p/) fue ELIMINADA. Esa ruta de navegación manual es la
// que disparaba el 403 de CloudFront: el endpoint /p/ espera ser invocado por el propio
// script oficial de Wompi (widget.js), no por una navegación GET construida a mano.
// La integración correcta vive ahora en:
//   src/modules/payments/components/WompiCheckoutButton.jsx
// que monta el <script src="https://checkout.wompi.co/widget.js" data-render="button" ...>
// dentro de un <form>, tal como lo documenta Wompi oficialmente.