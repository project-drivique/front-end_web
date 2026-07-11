import { useEffect, useRef, useState } from 'react';
import { generarFirmaIntegridad } from '@/services/wompiService';

/**
 * Botón oficial de Checkout Web de Wompi.
 *
 * Implementa el patrón documentado por Wompi: un <script src="https://checkout.wompi.co/widget.js">
 * con atributos data-* dentro de un <form>. El propio script reemplaza ese <form> por un botón
 * de pago; al hacer clic, Wompi abre su checkout en un overlay (sin navegar el sitio a otra URL),
 * por lo que el 403 de CloudFront que ocurría con la navegación manual (window.location.href /
 * form GET a checkout.wompi.co/p/) deja de aplicar.
 *
 * Al completar (o cancelar) el pago, Wompi redirige el navegador a `redirectUrl` agregando
 * `?id=<transactionId>`, que es justo lo que ya espera RespuestaPagoPage.
 *
 * Props:
 *  - publicKey, currency: credenciales/moneda de Wompi (Sandbox: pub_test_..., "COP").
 *  - amountInCents: monto a cobrar, en centavos (entero).
 *  - reference: referencia única de la transacción (generarReferenciaUnica()).
 *  - redirectUrl: URL de retorno tras el pago (ej. `${origin}/respuesta`).
 *  - onError: callback opcional si falla el cálculo de la firma de integridad.
 */
export default function WompiCheckoutButton({
    publicKey,
    currency,
    amountInCents,
    reference,
    redirectUrl,
    onError,
    className,
    style,
}) {
    const formRef = useRef(null);
    const [firma, setFirma] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [errorFirma, setErrorFirma] = useState(false);

    // 1) Genera la firma de integridad (TODO: mover a backend, ver wompiService.js)
    useEffect(() => {
        let cancelado = false;
        setCargando(true);
        setErrorFirma(false);

        generarFirmaIntegridad(reference, amountInCents, currency)
            .then((hash) => {
                if (!cancelado) {
                    setFirma(hash);
                    setCargando(false);
                }
            })
            .catch((err) => {
                if (!cancelado) {
                    setCargando(false);
                    setErrorFirma(true);
                    onError?.(err);
                }
            });

        return () => { cancelado = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reference, amountInCents, currency]);

    // 2) Monta el script oficial de Wompi dentro del <form>, una vez que hay firma.
    useEffect(() => {
        if (!firma || !formRef.current) return;

        // Limpia montajes previos (evita botones duplicados si cambian las props)
        formRef.current.innerHTML = '';

        const script = document.createElement('script');
        script.src = 'https://checkout.wompi.co/widget.js';
        script.setAttribute('data-render', 'button');
        script.setAttribute('data-public-key', publicKey);
        script.setAttribute('data-currency', currency);
        script.setAttribute('data-amount-in-cents', String(amountInCents));
        script.setAttribute('data-reference', reference);
        script.setAttribute('data-signature:integrity', firma);
        if (redirectUrl) {
            script.setAttribute('data-redirect-url', redirectUrl);
        }
        // customer-data:* deliberadamente NO se envía en esta fase (Wompi lo solicita
        // de forma segura dentro de su propio checkout).

        formRef.current.appendChild(script);

        return () => {
            if (formRef.current) formRef.current.innerHTML = '';
        };
    }, [firma, publicKey, currency, amountInCents, reference, redirectUrl]);

    return (
        <div className={className} style={style}>
            {cargando && (
                <p style={{ fontSize: 14, color: 'var(--texto-second)', textAlign: 'center' }}>
                    Preparando pago seguro con Wompi…
                </p>
            )}
            {errorFirma && (
                <p style={{ fontSize: 14, color: '#b91c1c', textAlign: 'center' }}>
                    No se pudo preparar el pago. Por favor recarga la página e intenta de nuevo.
                </p>
            )}
            {/* Wompi reemplaza este <form> por su botón de pago oficial */}
            <form ref={formRef} />
        </div>
    );
}
