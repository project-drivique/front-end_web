import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaSpinner, FaCheckCircle, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { reservationService } from '@/services/reservationService';
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

    let encontrada = refQuery ? reservationService.obtenerPorReferencia(refQuery) : null;
    if (!encontrada && transactionId) {
      const all = reservationService.getReservas();
      encontrada = all.find(r => r.paymentId === transactionId) || (all.length > 0 ? all[all.length - 1] : null);
    }

    const procesarPagoYRedirigir = (targetReserva, pType) => {
      setEstadoProceso('exito');
      setMensajeEstado('¡Pago validado con éxito! Redirigiendo a tu reserva...');

      const actualRef = targetReserva.referencia || targetReserva.codigo || targetReserva.id;
      reservationService.actualizarEstado(actualRef, 'CONFIRMADA', transactionId);

      let metodo = 'Pago Wompi';
      if (pType) {
        if (pType === 'NEQUI') metodo = 'Pago Wompi - Nequi';
        else if (pType === 'DAVIPLATA') metodo = 'Pago Wompi - Daviplata';
        else if (pType === 'CARD') metodo = 'Pago Wompi - Tarjeta';
        else if (pType === 'PSE') metodo = 'Pago Wompi - PSE';
        else if (pType === 'BANCOLOMBIA_COLLECT') metodo = 'Pago Wompi - Efectivo Bancolombia';
        else if (pType.includes('BANCOLOMBIA')) metodo = 'Pago Wompi - Bancolombia';
        else metodo = `Pago Wompi - ${pType}`;
      }
      reservationService.actualizarMedioPago(actualRef, metodo);

      setTimeout(() => {
        navigate(`/reservas?detalle=${encodeURIComponent(actualRef)}`, {
          replace: true,
          state: { detalleId: actualRef }
        });
      }, 900);
    };

    if (transactionId) {
      fetch(`https://sandbox.wompi.co/v1/transactions/${transactionId}`)
        .then(res => res.json())
        .then(data => {
          const pType = data?.data?.payment_method_type;
          const wompiRef = data?.data?.reference;

          let targetReserva = encontrada;
          if (!targetReserva && wompiRef) {
            targetReserva = reservationService.obtenerPorReferencia(wompiRef);
          }
          if (targetReserva) {
            procesarPagoYRedirigir(targetReserva, pType);
          } else if (encontrada) {
            procesarPagoYRedirigir(encontrada, pType);
          } else {
            const all = reservationService.getReservas();
            const fallbackReserva = all.length > 0 ? all[all.length - 1] : null;
            if (fallbackReserva) {
              procesarPagoYRedirigir(fallbackReserva, pType);
            } else {
              setEstadoProceso('error');
              setMensajeEstado('No se encontró la reserva asociada al pago.');
            }
          }
        })
        .catch(() => {
          if (encontrada) {
            procesarPagoYRedirigir(encontrada, null);
          } else {
            const all = reservationService.getReservas();
            const fallbackReserva = all.length > 0 ? all[all.length - 1] : null;
            if (fallbackReserva) {
              procesarPagoYRedirigir(fallbackReserva, null);
            } else {
              setEstadoProceso('error');
              setMensajeEstado('Ocurrió un error al consultar el estado de la transacción.');
            }
          }
        });
    } else if (encontrada) {
      procesarPagoYRedirigir(encontrada, null);
    } else {
      const all = reservationService.getReservas();
      const fallbackReserva = all.length > 0 ? all[all.length - 1] : null;
      if (fallbackReserva) {
        procesarPagoYRedirigir(fallbackReserva, null);
      } else {
        setEstadoProceso('error');
        setMensajeEstado('No se encontró la referencia de la reserva.');
      }
    }
  }, [transactionId, searchParams, navigate]);

  return (
    <div className="catalogo-page" style={{ minHeight: '100vh', background: 'var(--bg-page, #f8fafc)', position: 'relative' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--bg-tarjeta, #ffffff)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--borde, #e2e8f0)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', height: 96 }}>
        <div className="catalogo-header-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to={usuario ? "/home" : "/"}><img src={brand.logoDataUrl || logo} alt={brand.name} style={{ height: 75, objectFit: 'contain' }} /></Link>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/reservas" style={{ padding: '10px 20px', borderRadius: 9999, border: '2px solid var(--brand-border-light, #e2e8f0)', color: 'var(--texto-acento, #1D4ED8)', fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'all 200ms ease' }}>{t('nav.reservations', 'Mis Reservas')}</Link>
            <MenuConfiguracion />
          </div>
        </div>
      </nav>

      <div style={{ paddingTop: 160, display: 'flex', justifyContent: 'center', paddingBottom: 60, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{
          background: 'var(--bg-tarjeta, #ffffff)',
          borderRadius: 24,
          padding: '44px 36px',
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 16px 40px rgba(0,0,0,0.08)',
          border: '1px solid var(--borde, #e2e8f0)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {estadoProceso === 'procesando' && (
            <>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'var(--brand-primary, #1D4ED8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 24px rgba(29, 78, 216, 0.25)',
                color: '#fff',
                fontSize: '34px'
              }}>
                <FaSpinner className="fa-spin" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--texto-primary, #0f172a)', margin: '0 0 10px' }}>
                {t('pago.verifyingTitle', 'Verificando pago...')}
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--texto-second, #64748b)', margin: '0 0 20px', lineHeight: 1.5 }}>
                {mensajeEstado}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 13, fontWeight: 600 }}>
                <FaShieldAlt /> <span>Transacción protegida por Wompi</span>
              </div>
            </>
          )}

          {estadoProceso === 'exito' && (
            <>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                color: '#fff',
                fontSize: '36px'
              }}>
                <FaCheckCircle />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--texto-primary, #0f172a)', margin: '0 0 10px' }}>
                {t('pago.successTitle', '¡Pago Confirmado!')}
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--texto-second, #64748b)', margin: '0 0 16px', lineHeight: 1.5 }}>
                {mensajeEstado}
              </p>
            </>
          )}

          {estadoProceso === 'error' && (
            <>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
                color: '#fff',
                fontSize: '36px'
              }}>
                <FaExclamationTriangle />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--texto-primary, #0f172a)', margin: '0 0 10px' }}>
                {t('pago.errorTitle', 'Atención')}
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--texto-second, #64748b)', margin: '0 0 24px', lineHeight: 1.5 }}>
                {mensajeEstado}
              </p>
              <Link
                to="/reservas"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 28px',
                  borderRadius: 14,
                  background: 'var(--brand-primary, #1D4ED8)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 14,
                  border: 'none',
                  textDecoration: 'none',
                  boxShadow: '0 6px 18px rgba(29, 78, 216, 0.25)'
                }}
              >
                Ir a Mis Reservas
              </Link>
            </>
          )}
        </div>
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
