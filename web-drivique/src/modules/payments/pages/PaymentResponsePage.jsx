import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaReceipt,
  FaPrint,
  FaArrowRight,
  FaBell,
  FaCreditCard,
  FaMobileAlt,
} from 'react-icons/fa';
import { reservationsService } from '@/services/reservationsService';
import logo from '@/assets/logo.png';
import { useBrand } from '@/contexts/BrandContext';
import { useAuthStore } from '../../../store/authStore';

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

  const [estadoProceso, setEstadoProceso] = useState('procesando'); // 'procesando' | 'exito' | 'rechazado' | 'error'
  const [mensajeEstado, setMensajeEstado] = useState('Verificando tu transacción con Wompi...');
  const [transaccion, setTransaccion] = useState(null);
  const [holdId, setHoldId] = useState(null);
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
          const tx = data?.data;
          setTransaccion(tx);
          const status = tx?.status;
          const wompiRef = tx?.reference;
          const rawHold = wompiRef || refQuery || '';
          const extractedHold = rawHold.includes('_') ? rawHold.split('_')[0] : rawHold;
          setHoldId(extractedHold);

          if (status === 'APPROVED') {
            setEstadoProceso('exito');
            setMensajeEstado('¡Pago aprobado exitosamente!');
            if (extractedHold) {
              reservationsService.confirmarPago(extractedHold)
                .catch(err => {
                  console.warn('Confirmación en backend ya ejecutada o registrada:', err);
                });
            }
          } else if (status === 'DECLINED' || status === 'ERROR') {
            setEstadoProceso('rechazado');
            setMensajeEstado('La transacción fue rechazada.');
            if (extractedHold) {
              reservationsService.reportarPagoFallido(extractedHold).catch(() => {});
            }
          } else {
            // PENDING u otro estado
            setEstadoProceso('pendiente');
            setMensajeEstado('La transacción está pendiente de confirmación.');
          }
        })
        .catch(err => {
          console.error('Error al consultar transacción Wompi:', err);
          setEstadoProceso('error');
          setMensajeEstado('No se pudo verificar la transacción con Wompi.');
        });
    } else {
      setEstadoProceso('error');
      setMensajeEstado('No se recibió un identificador de transacción válido.');
    }
  }, [transactionId, searchParams]);

  const formatearMonto = (centavos, moneda = 'COP') => {
    if (!centavos && centavos !== 0) return '$ 0 COP';
    const monto = centavos / 100;
    return `$ ${monto.toLocaleString('es-CO')} ${moneda}`;
  };

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return new Date().toLocaleString('es-CO');
    try {
      return new Date(fechaIso).toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return fechaIso;
    }
  };

  const esExitoso = estadoProceso === 'exito';
  const esRechazado = estadoProceso === 'rechazado';
  const esPendiente = estadoProceso === 'pendiente';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-page, #f8fafc)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 600,
          background: 'var(--bg-card, #ffffff)',
          borderRadius: 16,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          border: '1px solid var(--border-color, #e2e8f0)',
          overflow: 'hidden',
        }}
      >
        {/* Cabecera con logo */}
        <div
          style={{
            padding: '24px 32px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color, #f1f5f9)',
          }}
        >
          <img src={logo} alt="Drivique" style={{ height: 32, objectFit: 'contain' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--texto-muted, #64748b)', fontWeight: 600 }}>
            <FaShieldAlt style={{ color: '#10B981' }} />
            <span>Transacción Segura Wompi</span>
          </div>
        </div>

        {/* Estado en proceso */}
        {estadoProceso === 'procesando' && (
          <div style={{ padding: '64px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
            <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: 44, color: 'var(--brand-primary, #1D4ED8)' }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--texto-primary, #0f172a)', margin: 0 }}>
              {mensajeEstado}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--texto-secondary, #64748b)', margin: 0 }}>
              Por favor no cierres esta ventana mientras sincronizamos el comprobante.
            </p>
          </div>
        )}

        {/* Comprobante de Transacción */}
        {estadoProceso !== 'procesando' && (
          <div style={{ padding: '32px' }}>
            {/* Banner de Estado */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                marginBottom: 28,
              }}
            >
              {esExitoso && (
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10B981',
                    fontSize: 34,
                    marginBottom: 16,
                  }}
                >
                  <FaCheckCircle />
                </div>
              )}
              {esRechazado && (
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EF4444',
                    fontSize: 34,
                    marginBottom: 16,
                  }}
                >
                  <FaTimesCircle />
                </div>
              )}
              {!esExitoso && !esRechazado && (
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F59E0B',
                    fontSize: 34,
                    marginBottom: 16,
                  }}
                >
                  <FaExclamationTriangle />
                </div>
              )}

              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: esExitoso ? '#047857' : (esRechazado ? '#b91c1c' : '#b45309'),
                  margin: '0 0 6px 0',
                }}
              >
                {esExitoso ? '¡Pago Exitoso!' : (esRechazado ? 'Pago Rechazado' : 'Transacción Pendiente')}
              </h1>

              <p style={{ fontSize: 14, color: 'var(--texto-secondary, #64748b)', margin: 0, maxWidth: 440 }}>
                {esExitoso
                  ? 'Tu pago ha sido procesado correctamente y la reserva se encuentra confirmada.'
                  : (esRechazado
                    ? 'La transacción no pudo ser autorizada por la entidad financiera. No se realizó ningún cobro.'
                    : 'La transacción está siendo validada por la entidad.')}
              </p>
            </div>

            {/* Recibo / Voucher Card */}
            <div
              style={{
                background: 'var(--bg-subtle, #f8fafc)',
                borderRadius: 12,
                border: '1px solid var(--border-color, #e2e8f0)',
                padding: '20px 24px',
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 16,
                  borderBottom: '1px dashed var(--border-color, #cbd5e1)',
                  marginBottom: 16,
                }}
              >
                <div>
                  <span style={{ fontSize: 12, color: 'var(--texto-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Monto Total
                  </span>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--texto-primary, #0f172a)', marginTop: 2 }}>
                    {transaccion ? formatearMonto(transaccion.amount_in_cents, transaccion.currency) : '$ 398.000 COP'}
                  </div>
                </div>

                <div
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    background: esExitoso ? 'rgba(16, 185, 129, 0.15)' : (esRechazado ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)'),
                    color: esExitoso ? '#047857' : (esRechazado ? '#b91c1c' : '#b45309'),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />
                  {transaccion?.status || (esExitoso ? 'APROBADO' : 'RECHAZADO')}
                </div>
              </div>

              {/* Fila de Datos del Comprobante */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px', fontSize: 13 }}>
                <div>
                  <span style={{ color: 'var(--texto-muted, #64748b)', display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                    ID Transacción Wompi
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--texto-primary, #0f172a)', wordBreak: 'break-all' }}>
                    {transaccion?.id || transactionId || 'N/A'}
                  </span>
                </div>

                <div>
                  <span style={{ color: 'var(--texto-muted, #64748b)', display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                    Referencia de Pago
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--texto-primary, #0f172a)', wordBreak: 'break-all' }}>
                    {transaccion?.reference || holdId || 'N/A'}
                  </span>
                </div>

                <div>
                  <span style={{ color: 'var(--texto-muted, #64748b)', display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                    Método de Pago
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--texto-primary, #0f172a)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {transaccion?.payment_method_type === 'NEQUI' ? <FaMobileAlt style={{ color: '#E10098' }} /> : <FaCreditCard style={{ color: '#2563EB' }} />}
                    {transaccion?.payment_method_type || 'Wompi Checkout'}
                    {transaccion?.payment_method?.phone_number ? ` (${transaccion.payment_method.phone_number})` : ''}
                  </span>
                </div>

                <div>
                  <span style={{ color: 'var(--texto-muted, #64748b)', display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                    Fecha y Hora
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--texto-primary, #0f172a)' }}>
                    {formatearFecha(transaccion?.created_at || transaccion?.finalized_at)}
                  </span>
                </div>

                {transaccion?.customer_data?.full_name && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--texto-muted, #64748b)', display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                      Pagador
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--texto-primary, #0f172a)' }}>
                      {transaccion.customer_data.full_name} ({transaccion.customer_email || usuario?.email || ''})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Aviso de correo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderRadius: 10,
                background: 'rgba(37, 99, 235, 0.08)',
                color: '#1D4ED8',
                fontSize: 13,
                marginBottom: 24,
              }}
            >
              <FaReceipt style={{ fontSize: 16, flexShrink: 0 }} />
              <span>
                {esExitoso
                  ? 'Hemos enviado una copia oficial de este comprobante y los detalles de tu reserva a tu correo electrónico.'
                  : 'Puedes intentar nuevamente el pago desde tu panel de reservas con otro método.'}
              </span>
            </div>

            {/* Botones de Acción */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {esExitoso ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (holdId) {
                        navigate(`/contrato/${encodeURIComponent(holdId)}`);
                      } else {
                        navigate('/reservas');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      borderRadius: 10,
                      background: 'var(--brand-primary, #1D4ED8)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <span>Continuar a mi Reserva / Contrato</span>
                    <FaArrowRight size={13} />
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => navigate('/notificaciones')}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 10,
                        background: 'transparent',
                        color: 'var(--texto-primary, #0f172a)',
                        border: '1px solid var(--border-color, #cbd5e1)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <FaBell size={13} />
                      <span>Ver Notificaciones</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 10,
                        background: 'transparent',
                        color: 'var(--texto-primary, #0f172a)',
                        border: '1px solid var(--border-color, #cbd5e1)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <FaPrint size={13} />
                      <span>Imprimir Comprobante</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/reservas')}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      borderRadius: 10,
                      background: 'var(--brand-primary, #1D4ED8)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <span>Reintentar Pago en Mis Reservas</span>
                    <FaArrowRight size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/notificaciones')}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 10,
                      background: 'transparent',
                      color: 'var(--texto-primary, #0f172a)',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <FaBell size={13} />
                    <span>Ir a Notificaciones</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          div[style*="max-width: 600px"], div[style*="max-width: 600px"] * {
            visibility: visible;
          }
          div[style*="max-width: 600px"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}

