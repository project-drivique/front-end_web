import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaSpinner } from 'react-icons/fa';
import { reservationsService } from '@/services/reservationsService';

export default function RespuestaPagoPage() {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localtest.me' || window.location.hostname === 'lvh.me')) {
    const targetUrl = window.location.href.replace(window.location.hostname, 'localhost');
    window.location.replace(targetUrl);
    return null;
  }

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('id');
  const procesadoRef = useRef(false);

  useEffect(() => {
    if (procesadoRef.current) return;
    procesadoRef.current = true;

    const refStored = sessionStorage.getItem('current_wompi_reference');
    const attemptStored = sessionStorage.getItem('current_wompi_attempt_ref');
    const refParam = searchParams.get('ref') || searchParams.get('reference');
    const refQuery = refStored || attemptStored || refParam;

    if (transactionId) {
      fetch(`https://sandbox.wompi.co/v1/transactions/${transactionId}`)
        .then(res => res.json())
        .then(data => {
          const status = data?.data?.status;
          const wompiRef = data?.data?.reference;
          const rawHold = wompiRef || refQuery || '';
          const holdId = rawHold.includes('_') ? rawHold.split('_')[0] : rawHold;

          if (status === 'APPROVED') {
            if (holdId) {
              reservationsService.confirmarPago(holdId)
                .then(() => {
                  navigate(`/contrato/${encodeURIComponent(holdId)}`, { replace: true });
                })
                .catch(err => {
                  console.error('Error confirming payment:', err);
                  navigate(`/contrato/${encodeURIComponent(holdId)}`, { replace: true });
                });
            } else {
              navigate('/reservas', { replace: true });
            }
          } else {
            if (holdId) {
              reservationsService.reportarPagoFallido(holdId).catch(() => {});
            }
            navigate('/reservas', { replace: true });
          }
        })
        .catch(() => {
          navigate('/reservas', { replace: true });
        });
    } else {
      navigate('/reservas', { replace: true });
    }
  }, [transactionId, searchParams, navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-page, #f8fafc)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <FaSpinner
        style={{
          animation: 'spin 1s linear infinite',
          fontSize: 40,
          color: 'var(--brand-primary, #1D4ED8)',
        }}
      />
      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--texto-primary, #0f172a)' }}>
        {t('pago.verifyingTitle', 'Procesando tu pago...')}
      </span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

