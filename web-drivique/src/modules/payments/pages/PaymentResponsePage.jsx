import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { reservationService } from '@/services/reservationService';
import { formatCurrency } from '@/utils/currencyUtils';
import { showAlert } from '@/utils/swalConfig';
import { useLanding } from '../../landing/LandingContext';
import logo from '@/assets/logo.png';
import VEHICULOS_MOCK from '@/mocks/vehicles.json';
import ContractSignature from '../../contracts/components/ContractSignature';
import { useAuthStore } from '../../../store/authStore';

export default function RespuestaPagoPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { usuario } = useAuthStore();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('id'); // Wompi retorna ?id=XXX
  const [reserva, setReserva] = useState(null);
  const [contratoFirmado, setContratoFirmado] = useState(false);
  const { moneda } = useLanding();

  useEffect(() => {
    // Para simplificar la demo recuperamos la referencia de sessionStorage
    const ref = sessionStorage.getItem('current_wompi_reference');
    if (ref) {
      const encontrada = reservationService.obtenerPorReferencia(ref);
      if (encontrada) {
        // Marcamos como pendiente de validación, simulando que un backend deberia verificar el webhook o API
        reservationService.actualizarEstado(ref, 'PENDIENTE_VALIDACION', transactionId);
        setReserva({ ...encontrada, estado: 'PENDIENTE_VALIDACION', paymentId: transactionId });
      }
    }
  }, [transactionId]);

  const vehiculoReserva = reserva ? VEHICULOS_MOCK.find(v => v.id === reserva.vehiculoId) : null;

  // Regla del flujo: si el pago es por Wompi, el contrato se muestra solo
  // después de la confirmación (simulada) del pago, justo aquí.
  if (reserva && vehiculoReserva && !contratoFirmado) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--hero-fondo)', position: 'relative', overflow: 'hidden' }}>
        <div className="sucursales-orb" style={{ position: 'absolute', top: -80, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'var(--hero-orb1)', pointerEvents: 'none' }} />
        <div className="sucursales-orb" style={{ position: 'absolute', bottom: -60, left: -60, width: 350, height: 350, borderRadius: '50%', background: 'var(--hero-orb2)', pointerEvents: 'none' }} />
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--bg-tarjeta)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--borde)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', height: 96 }}>
          <div className="catalogo-header-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link to={usuario ? "/home" : "/"}><img src={logo} alt="Drivique" style={{ height: 80 }} /></Link>
          </div>
        </nav>
        <div style={{ position: 'relative', paddingTop: 128, paddingBottom: 48, paddingLeft: 24, paddingRight: 24 }}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 28px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--texto-primary)', margin: '0 0 8px' }}>
              {t('contratoFirma.pageTitleWompi')}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--texto-second)', margin: 0 }}>{t('contratoFirma.pageSubtitle')}</p>
          </div>
          <ContractSignature
            vehiculo={vehiculoReserva}
            reservaGuardada={reserva}
            onFirmado={() => {
              setContratoFirmado(true);
              showAlert({
                icon: 'success',
                title: 'Reserva Exitosa',
                text: 'Tu pago fue registrado correctamente y tu reserva ha quedado confirmada.',
                confirmButtonText: 'Aceptar',
              }).then(() => navigate('/reservas'));
            }}
          />
        </div>
      </div>
    );
  }

  if (contratoFirmado) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--bg-tarjeta)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--borde)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', height: 96 }}>
        <div className="catalogo-header-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to={usuario ? "/home" : "/"}><img src={logo} alt="Drivique" style={{ height: 80 }} /></Link>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/home" style={{ padding: '10px 20px', borderRadius: 9999, border: '2px solid #bfdbfe', color: '#1e3a8a', fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'all 200ms ease' }}>Ir al Inicio</Link>
          </div>
        </div>
      </nav>

      <div style={{ paddingTop: 140, display: 'flex', justifyContent: 'center', paddingBottom: 40, paddingLeft: 24, paddingRight: 24 }}>
        <div className="respuesta-pago-card" style={{ background: 'var(--bg-tarjeta)', borderRadius: 24, padding: 40, width: '100%', maxWidth: 500, boxShadow: '0 12px 36px rgba(0,0,0,0.06)', border: '1px solid var(--borde)', textAlign: 'center' }}>
          
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 12px 32px rgba(30,58,138,0.28)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--texto-primary)', margin: '0 0 12px' }}>Pago en Proceso</h2>
          <p style={{ fontSize: 15, color: 'var(--texto-second)', marginBottom: 24 }}>
            Tu pago a través de Wompi se ha registrado. El estado de la reserva ahora es <strong style={{ color: '#059669' }}>PENDIENTE DE VALIDACIÓN</strong>. 
            <em> (Esto es una simulación de Sandbox)</em>
          </p>

          {reserva ? (
            <div style={{ background: '#f8fafc', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0', textAlign: 'left', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--texto-second)', fontWeight: 600 }}>Vehículo</span>
                <span style={{ fontSize: 13, color: 'var(--texto-primary)', fontWeight: 800 }}>{reserva.vehiculoNombre}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--texto-second)', fontWeight: 600 }}>Referencia Interna</span>
                <span style={{ fontSize: 13, color: 'var(--texto-primary)', fontWeight: 800 }}>{reserva.referencia}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--texto-second)', fontWeight: 600 }}>ID de Transacción Wompi</span>
                <span style={{ fontSize: 13, color: '#3b82f6', fontWeight: 800 }}>{transactionId || 'N/A'}</span>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', margin: '16px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--texto-primary)', fontWeight: 800 }}>Monto a Pagar</span>
                <span style={{ fontSize: 18, color: '#1e3a8a', fontWeight: 900 }}>{formatCurrency(reserva.total, moneda)}</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--texto-second)', marginTop: 8, textAlign: 'center' }}>
                * El monto real enviado a Wompi fue en COP ({reserva.total} COP). Si ves otra moneda, es una conversión visual de la UI.
              </p>
            </div>
          ) : (
            <div style={{ padding: 20, background: '#fee2e2', color: '#b91c1c', borderRadius: 12, marginBottom: 24, fontSize: 14 }}>
              No se encontró la información local de la reserva.
            </div>
          )}

          <Link to="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 16, background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', color: '#fff', fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer', textDecoration: 'none', boxShadow: '0 8px 24px rgba(37,99,235,0.28)' }}>
            Volver a Mi Cuenta
          </Link>

        </div>
      </div>
    </div>
  );
}
