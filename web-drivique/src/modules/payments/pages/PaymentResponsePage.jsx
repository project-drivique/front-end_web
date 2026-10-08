import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaSpinner, FaCheckCircle, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { reservationsService } from '@/services/reservationsService';
import logo from '@/assets/logo.png';
import { useBrand } from '@/contexts/BrandContext';
import { useAuthStore } from '../../../store/authStore';
import MenuConfiguracion from '@/components/MenuConfiguracion';

export default function RespuestaPagoPage() {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localtest.me' || window.location.hostname === 'lvh.me')) {
    const targetUrl = window.location.href.replace(window.location.hostname, 'localhost');
    window.location.replace(targetUrl);
    return null;
  }

  const { brand } = useBrand();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { usuario } = useAuthStore();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('id'); // Wompi retorna ?id=XXX
  const [estadoProceso, setEstadoProceso] = useState('procesando'); // 'procesando', 'exito', 'error'
  const [mensajeEstado, setMensajeEstado] = useState('Confirmando tu transacción con Wompi...');
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

          if (status === 'APPROVED') {
            const holdId = wompiRef || refQuery;
            if (holdId) {
              reservationsService.confirmarPago(holdId)
                .then(() => {
                  navigate(`/contrato/${encodeURIComponent(holdId)}`, { replace: true });
                })
                .catch(err => {
                  console.error('Error confirming payment:', err);
                  navigate('/reservas', { replace: true });
                });
            } else {
              navigate('/reservas', { replace: true });
            }
          } else {
            // Redirección inmediata a Mis Reservas sin pantallas intermedias si el pago no fue aprobado o fue cancelado
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-page, #f8fafc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: 36, color: 'var(--brand-primary, #1D4ED8)' }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--texto-primary, #0f172a)' }}>
          {t('pago.verifyingTitle', 'Procesando...')}
        </span>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
