import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generarFirmaIntegridad } from '@/services/wompiService';

/**
 * Botón oficial de Checkout Web de Wompi — VERSIÓN MÍNIMA.
 *
 * Réplica lo más literal posible del ejemplo oficial de Wompi:
 *
 *   <form>
 *     <script src="https://checkout.wompi.co/widget.js"
 *             data-render="button"
 *             data-public-key="pub_test_..."
 *             data-currency="COP"
 *             data-amount-in-cents="4950000"
 *             data-reference="4XMPGKWWPKWQ"
 *             data-signature:integrity="37c840..."
 *             data-redirect-url="https://.../respuesta">
 *     </script>
 *   </form>
 *
 * SOLO usa los 7 atributos documentados. Sin data-render extra, sin
 * customer-data, sin shipping-address, sin taxes, sin expiration-time.
 * Sin state machine, sin timeout de seguridad, sin retry, sin validaciones
 * adicionales: eso se retira temporalmente a propósito para descartar que
 * cualquier lógica extra del lado React esté afectando la request. La única
 * parte no-literal es la generación async de la firma (inevitable en un
 * componente), que se resuelve antes de insertar el <script>.
 */
export default function WompiCheckoutButton({
    publicKey,
    currency,
    amountInCents,
    reference,
    redirectUrl,
}) {
    const formRef = useRef(null);
    const [firma, setFirma] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        generarFirmaIntegridad(reference, amountInCents, currency).then(setFirma);
    }, [reference, amountInCents, currency]);

    useEffect(() => {
        if (!firma || !formRef.current) return;

        const script = document.createElement('script');
        script.src = 'https://checkout.wompi.co/widget.js';
        script.setAttribute('data-render', 'button');
        script.setAttribute('data-public-key', publicKey);
        script.setAttribute('data-currency', currency);
        script.setAttribute('data-amount-in-cents', String(amountInCents));
        script.setAttribute('data-reference', reference);
        script.setAttribute('data-signature:integrity', firma);
        script.setAttribute('data-redirect-url', redirectUrl);

        formRef.current.appendChild(script);
    }, [firma, publicKey, currency, amountInCents, reference, redirectUrl]);

    return (
        <div>
            {!firma && <p>{t('pagos.preparingPayment', 'Preparando pago…')}</p>}
            <form ref={formRef} />
        </div>
    );
}
