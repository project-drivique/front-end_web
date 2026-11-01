import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { iniciarPagoWompi } from '@/services/wompiService';

/**
 * Botón oficial de Checkout Web de Wompi respaldado por firma de integridad en el servidor
 * (`POST /v1/payments/wompi/initiate`).
 */
export default function WompiCheckoutButton({
    publicKey,
    currency,
    amountInCents,
    reference,
    contractId = null,
    redirectUrl,
}) {
    const formRef = useRef(null);
    const [checkoutData, setCheckoutData] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        let active = true;
        iniciarPagoWompi({
            contractId,
            reservationReference: reference,
        })
            .then((data) => {
                if (active) setCheckoutData(data);
            })
            .catch((err) => {
                console.error('[WompiCheckoutButton] Error iniciando pago en el servidor:', err);
            });
        return () => {
            active = false;
        };
    }, [reference, contractId]);

    useEffect(() => {
        if (!checkoutData?.integritySignature || !formRef.current) return;

        formRef.current.innerHTML = '';
        const script = document.createElement('script');
        script.src = 'https://checkout.wompi.co/widget.js';
        script.setAttribute('data-render', 'button');
        script.setAttribute('data-public-key', checkoutData.publicKey || publicKey);
        script.setAttribute('data-currency', checkoutData.currency || currency || 'COP');
        script.setAttribute('data-amount-in-cents', String(checkoutData.amountInCents ?? amountInCents));
        script.setAttribute('data-reference', checkoutData.reference || reference);
        script.setAttribute('data-signature:integrity', checkoutData.integritySignature);
        if (redirectUrl) {
            script.setAttribute('data-redirect-url', redirectUrl);
        }

        formRef.current.appendChild(script);
    }, [checkoutData, publicKey, currency, amountInCents, reference, redirectUrl]);

    return (
        <div>
            {!checkoutData && <p>{t('pagos.preparingPayment', 'Preparando pago…')}</p>}
            <form ref={formRef} />
        </div>
    );
}
