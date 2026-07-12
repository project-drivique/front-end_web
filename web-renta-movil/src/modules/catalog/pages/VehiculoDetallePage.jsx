import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../../store/authStore'
import { showAlert } from '@/utils/swalConfig'
import logo from '@/assets/logo.png'
import { FaMoneyBillWave, FaCreditCard } from 'react-icons/fa'
import VEHICULOS_MOCK from '@/mocks/vehiculos.json'
import { reservaService, HORAS_LIMITE_PAGO_EFECTIVO } from '@/services/reservaService'
import { documentosService } from '@/services/documentosService'
import { generarReferenciaUnica, aCentavos, construirUrlCheckout } from '@/services/wompiService'
import { RECARGOS_LOGISTICOS } from '../constants'

import GaleriaImagenes from '../components/detalle/GaleriaImagenes'
import InfoVehiculo from '../components/detalle/InfoVehiculo'
import PasoFechas from '../components/detalle/PasoFechas'
import PlanesProteccion from '../components/detalle/PlanesProteccion'
import TipoKilometraje from '../components/detalle/TipoKilometraje'
import ServiciosAdicionales from '../components/detalle/ServiciosAdicionales'
import ResumenLateral from '../components/detalle/ResumenLateral'
import DatosPersonales from '../components/detalle/DatosPersonales'

const IcoCheck = ({ color = '#16a34a', sz = 15 }) => (
  <svg width={sz} height={sz} fill="none" stroke={color} strokeWidth="2.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)
const IcoBack = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
)
const IcoArrow = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)

const TOTAL_PASOS = 3

export default function VehiculoDetallePage() {
  const { t } = useTranslation()
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuthStore();

  const vehiculo = VEHICULOS_MOCK.find(v => v.id === Number(id));

  const [pantalla, setPantalla] = useState(1);
  const [seguroIdx, setSeguroIdx] = useState(0);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const toggleServicio = (nombre) => setServiciosSeleccionados(prev =>
    prev.includes(nombre) ? prev.filter(n => n !== nombre) : [...prev, nombre]
  );
  const [reserva, setReserva] = useState({
    fechaInicio: '', fechaFin: '',
    horaInicio: '09:00', horaFin: '09:00',
    sucursalRetiro: vehiculo ? vehiculo.sucursal : '',
    sucursalDevolucion: vehiculo ? vehiculo.sucursal : '',
    tipoKm: 'limitado',
    metodoPago: 'wompi',
  });
  const cambiarReserva = (campo, valor) => {
    setReserva(prev => {
      const act = { ...prev, [campo]: valor };
      if (campo === 'metodoPago' && valor === 'efectivo') {
        act.sucursalRetiro = vehiculo ? vehiculo.sucursal : '';
        act.sucursalDevolucion = vehiculo ? vehiculo.sucursal : '';
      }
      return act;
    });
    setErrorPaso1('');
  }

  const [errorPaso1, setErrorPaso1] = useState('');
  const [datosForm, setDatosForm] = useState({
    nombre: '', correo: '', celular: '',
    nacionalidad: 'Colombia', tipoDoc: 'CC', numDoc: '',
    vuelo: false, numVuelo: '', terminos: false,
    cedulaPdf: null,
    licenciaPdf: null,
  });
  const [errores, setErrores] = useState({});
  const [exito, setExito] = useState(false);
  const [datosPago, setDatosPago] = useState(null); // { referencia, amountInCents }
  const [redirigiendoPago, setRedirigiendoPago] = useState(false);
  const [errorPago, setErrorPago] = useState('');
  const [hoverWompi, setHoverWompi] = useState(false);
  const [hoverEfectivo, setHoverEfectivo] = useState(false);
  const [fechaLimitePago, setFechaLimitePago] = useState(null);
  const prellenado = useRef(false);

  const idUsuarioDocs = usuario?.id || usuario?.correo || null;
  const docsVerificados = documentosService.tieneDocumentos(idUsuarioDocs);

  useEffect(() => {
    if (!usuario || prellenado.current) return
    prellenado.current = true
    const tel = (usuario.telefono || '').replace(/\D/g, '')
    const celular = tel.startsWith('57') && tel.length > 10 ? tel.slice(2) : tel
    setDatosForm(prev => ({
      ...prev,
      nombre: [usuario.nombre, usuario.apellido].filter(Boolean).join(' '),
      correo: usuario.correo || '',
      celular,
      numDoc: usuario.cedula || '',
    }))
  }, [usuario]);

  if (!vehiculo) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--texto-primary)' }}>{t('vehiculo.notFound')}</p>
      <Link to={usuario ? '/home' : '/catalogo'} style={{ color: '#1e3a8a', fontWeight: 700, fontSize: 14 }}>← {t('vehiculo.backToCatalog')}</Link>
    </div>
  );

  const irSiguiente = () => {
    if (pantalla === 1) {
      if (!reserva.sucursalRetiro || !reserva.sucursalDevolucion) {
        setErrorPaso1(t('vehiculo.selectLocation'))
        return
      }
      if (!reserva.fechaInicio || !reserva.fechaFin) {
        setErrorPaso1(t('vehiculo.errors.datesRequired'))
        return
      }
    }
    setErrorPaso1('')
    setPantalla(p => Math.min(TOTAL_PASOS, p + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const irAtras = () => {
    if (pantalla === 1) {
      navigate(usuario ? '/home' : '/catalogo')
      return
    }
    setPantalla(p => p - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const DESTINOS_EDITAR = {
    retiro: { paso: 1, id: 'campo-lugar-retiro' },
    devolucion: { paso: 1, id: 'campo-lugar-devolucion' },
    grupo: { paso: 2, id: 'campo-grupo' },
    servicios: { paso: 2, id: 'campo-servicios' },
  }

  const irAEditar = (destino) => {
    const { paso, id } = DESTINOS_EDITAR[destino]
    const enfocarCampo = () => {
      const el = document.getElementById(id)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (typeof el.focus === 'function') el.focus({ preventScroll: true })
    }

    if (pantalla === paso) {
      enfocarCampo()
    } else {
      setPantalla(paso)
      setTimeout(enfocarCampo, 60)
    }
  }

  const handleReservar = () => {
    if (!usuario) {
      showAlert({
        icon: 'info',
        title: t('catalogo.guestMode'),
        text: t('catalogo.guestModeText'),
        confirmButtonText: t('catalogo.goToRegister'),
        showCancelButton: true,
        cancelButtonText: t('common.cancel'),
      }).then((result) => {
        if (result.isConfirmed) navigate('/registro')
      })
      return;
    }

    const e = {};
    if (!datosForm.nombre.trim()) e.nombre = t('vehiculo.errors.nameRequired');
    if (!datosForm.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosForm.correo)) e.correo = t('vehiculo.errors.emailInvalid');
    if (!datosForm.celular.trim() || datosForm.celular.length < 10) e.celular = t('vehiculo.errors.phoneInvalid');
    if (!datosForm.numDoc.trim()) e.numDoc = t('vehiculo.errors.docRequired');
    if (!docsVerificados && !datosForm.cedulaPdf) e.cedulaPdf = "Debes subir tu cédula en formato PDF.";
    if (!docsVerificados && !datosForm.licenciaPdf) e.licenciaPdf = "Debes subir tu licencia de conducción en formato PDF.";
    if (!datosForm.terminos) e.terminos = t('vehiculo.errors.termsRequired');

    setErrores(e);
    if (Object.keys(e).length > 0) return;

    // Calcular total original en COP (siempre localmente es en pesos antes del render)
    const tarifas = vehiculo.tarifas || {};
    const precioKm = reserva.tipoKm === 'ilimitado' ? (tarifas.kmIlimitado?.precio || 0) : (tarifas.kmLimitado?.precio || 0);
    const dias = (reserva.fechaInicio && reserva.fechaFin) ? Math.max(1, Math.ceil((new Date(reserva.fechaFin) - new Date(reserva.fechaInicio)) / 86400000)) : 1;
    const precioSeguro = seguroIdx !== null ? (vehiculo.seguros[seguroIdx]?.precio ?? 0) : 0;
    const serviciosElegidos = (vehiculo.servicios || []).filter(s => serviciosSeleccionados.includes(s.nombre));
    const precioServicios = serviciosElegidos.reduce((suma, s) => suma + s.precio, 0);

    const subtotal = (precioKm + precioSeguro + precioServicios) * dias;
    const cargosAdmin = Math.round(subtotal * 0.10);
    
    const recargoRetiro = RECARGOS_LOGISTICOS[reserva.sucursalRetiro] || 0;
    const recargoDevolucion = RECARGOS_LOGISTICOS[reserva.sucursalDevolucion] || 0;
    const recargoLogistico = recargoRetiro + recargoDevolucion;
    
    const totalCop = subtotal + cargosAdmin + recargoLogistico;

    // Crear la referencia única para Wompi Checkout
    const referencia = generarReferenciaUnica();

    // Si el usuario subió documentos nuevos (o no tenía aún), los dejamos
    // registrados para no volver a pedírselos en su próxima reserva.
    if (idUsuarioDocs && (datosForm.cedulaPdf || datosForm.licenciaPdf || !docsVerificados)) {
      documentosService.guardarDocumentos(idUsuarioDocs, {
        cedulaPdf: datosForm.cedulaPdf,
        licenciaPdf: datosForm.licenciaPdf,
      });
    }

    // Guardar temporalmente en localStorage (estado simulado). Si el pago es
    // en efectivo, reservaService calcula automáticamente el plazo límite
    // para pagar en sucursal y deja el estado en PENDIENTE_EFECTIVO.
    const reservaGuardada = reservaService.guardarReserva({
      referencia,
      vehiculoId: vehiculo.id,
      vehiculoNombre: vehiculo.nombre,
      estado: 'PENDIENTE',
      fechaReserva: new Date().toISOString(),
      datosForm,
      reservaDetalles: reserva,
      total: totalCop
    });

    if (reservaGuardada.fechaLimitePago) {
      setFechaLimitePago(reservaGuardada.fechaLimitePago);
    }

    // Guardamos la referencia para que RespuestaPagoPage la recupere al volver de Wompi
    sessionStorage.setItem('current_wompi_reference', referencia);

    setDatosPago({ referencia, amountInCents: aCentavos(totalCop) });
    setExito(true);
  };

  const handlePagarConWompi = async () => {
    if (!datosPago) return;
    setErrorPago('');
    setRedirigiendoPago(true);
    try {
      const url = await construirUrlCheckout({
        reference: datosPago.referencia,
        amountInCents: datosPago.amountInCents,
        redirectUrl: `${window.location.origin}/respuesta`,
      });
      window.location.href = url;
    } catch (err) {
      console.error('[Wompi] Error construyendo el checkout:', err);
      setErrorPago('No se pudo iniciar el pago. Intenta de nuevo.');
      setRedirigiendoPago(false);
    }
  };

  // TODO: implementar el flujo real de pago en efectivo (p. ej. generar comprobante /
  // código de pago en punto físico, actualizar estado de la reserva a
  // 'PENDIENTE_EFECTIVO', etc.). Por ahora el botón solo deja el handler listo.
  const handlePagoEfectivo = () => {
    if (!datosPago) return;
    console.log('[Pago en efectivo] Pendiente de implementar. Referencia:', datosPago.referencia);
  };

  if (exito) return (
    <div style={{
      minHeight: '100vh', background: 'var(--hero-fondo)', position: 'relative',
      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ position: 'absolute', top: -80, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'var(--hero-orb1)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 350, height: 350, borderRadius: '50%', background: 'var(--hero-orb2)', pointerEvents: 'none' }} />

      <div style={{
        position: 'relative', textAlign: 'center', maxWidth: 560, width: '100%',
        background: 'var(--bg-tarjeta)', borderRadius: 28, boxShadow: '0 24px 70px rgba(15,23,42,0.16)',
        border: '1px solid var(--borde)', padding: '48px 40px',
      }}>
        <img
          src={logo}
          alt="Drivique – pagos"
          style={{
            width: 116, height: 116, borderRadius: '50%', objectFit: 'contain',
            background: '#fff', padding: 16, margin: '0 auto 28px',
            boxShadow: '0 14px 34px rgba(30,58,138,0.24)', border: '1px solid var(--borde)',
          }}
        />

        <h2 style={{ fontSize: 30, fontWeight: 900, color: 'var(--texto-primary)', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
          Reserva Registrada
        </h2>

        {reserva.metodoPago === 'efectivo' ? (
          <>
            <p style={{ fontSize: 16, color: 'var(--texto-second)', lineHeight: 1.6, margin: '0 0 20px' }}>
              Tu reserva quedó registrada. Para confirmarla, debes acercarte a la sucursal de <strong>{vehiculo.sucursal}</strong> para realizar el pago en efectivo y retirar el vehículo.
            </p>

            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16,
              padding: '16px 20px', marginBottom: 20, textAlign: 'left',
            }}>
              <p style={{ fontSize: 13, fontWeight: 900, color: '#92400e', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Plazo para pagar
              </p>
              <p style={{ fontSize: 14, color: '#92400e', margin: 0, lineHeight: 1.5 }}>
                Tienes <strong>{HORAS_LIMITE_PAGO_EFECTIVO} horas</strong> desde ahora para acercarte a la sucursal y pagar
                {fechaLimitePago && (
                  <> (hasta las <strong>{new Date(fechaLimitePago).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</strong>)</>
                )}. Si no pagas dentro de este plazo, la reserva se cancelará automáticamente.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 32 }}>
              <p style={{ fontSize: 13, color: '#16a34a', fontWeight: 700, margin: 0 }}>
                Recuerda llevar tu cédula y licencia física para la verificación manual.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  showAlert({
                    icon: 'success',
                    title: '¡Reserva Completada!',
                    text: 'Tu reserva presencial ha sido registrada. Te esperamos en la sucursal.',
                    confirmButtonText: 'Aceptar'
                  }).then(() => navigate('/reservas'));
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  padding: '18px 36px', borderRadius: 16,
                  background: 'linear-gradient(90deg,#1e3a8a,#2563eb)',
                  color: '#fff', fontWeight: 900, fontSize: 15, border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(37,99,235,0.28)',
                  transition: 'all 200ms ease',
                }}
              >
                <FaMoneyBillWave size={20} />
                <span>Confirmar y Ver Mis Reservas</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ fontSize: 16, color: 'var(--texto-second)', lineHeight: 1.6, margin: '0 0 20px' }}>
              Tu reserva quedó guardada como pendiente. Para confirmarla, completa el pago digital seguro con Wompi (Pruebas).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 32 }}>
              <p style={{ fontSize: 13, color: '#2563eb', fontWeight: 700, margin: 0 }}>
                Serás redirigido al checkout oficial de Wompi.
              </p>
              <p style={{ fontSize: 13, color: 'var(--texto-second)', fontWeight: 600, margin: 0 }}>
                Recibirás la confirmación de tu reserva cuando el pago sea exitoso.
              </p>
            </div>

            {datosPago && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={handlePagarConWompi}
                  onMouseEnter={() => setHoverWompi(true)}
                  onMouseLeave={() => setHoverWompi(false)}
                  disabled={redirigiendoPago}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                    padding: '18px 40px', borderRadius: 16,
                    background: redirigiendoPago
                      ? '#94a3b8'
                      : hoverWompi
                        ? 'linear-gradient(90deg,#162d6e,#1d4fd8)'
                        : 'linear-gradient(90deg,#1e3a8a,#2563eb)',
                    color: '#fff', fontWeight: 900, fontSize: 15, border: 'none',
                    cursor: redirigiendoPago ? 'default' : 'pointer',
                    boxShadow: hoverWompi && !redirigiendoPago ? '0 16px 34px rgba(37,99,235,0.42)' : '0 8px 24px rgba(37,99,235,0.28)',
                    transform: hoverWompi && !redirigiendoPago ? 'translateY(-2px)' : 'translateY(0)',
                    transition: 'all 200ms ease',
                    width: '100%',
                    maxWidth: 320
                  }}
                >
                  <FaCreditCard size={20} />
                  <span>{redirigiendoPago ? 'Redirigiendo…' : 'Pagar con Wompi'}</span>
                </button>
              </div>
            )}
          </>
        )}

        {errorPago && (
          <p style={{ color: '#dc2626', fontSize: 13, fontWeight: 700, marginTop: 16 }}>{errorPago}</p>
        )}
      </div>
    </div>
  );

  const pasos = [t('vehiculo.stepDates'), t('vehiculo.stepProtection'), t('vehiculo.personalData')]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--bg-tarjeta)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--borde)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', height: 96 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/"><img src={logo} alt="Drivique" style={{ height: 80 }} /></Link>
          <div style={{ flex: 1 }} />
          {!usuario && (
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/login" style={{ padding: '10px 20px', borderRadius: 9999, border: '2px solid #bfdbfe', color: '#1e3a8a', fontSize: 15, fontWeight: 700, textDecoration: 'none', transition: 'all 200ms ease' }}>{t('catalogo.signIn')}</Link>
              <Link to="/registro" style={{ padding: '10px 20px', borderRadius: 9999, background: '#1e3a8a', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', transition: 'all 200ms ease' }}>{t('catalogo.signUp')}</Link>
            </div>
          )}
        </div>
      </nav>

      <div style={{ paddingTop: 96 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <button
              onClick={irAtras}
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#1e3a8a', fontWeight: 700, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 9999, padding: '8px 18px', cursor: 'pointer', transition: 'all 200ms ease' }}
              onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
              onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
            >
              <IcoBack /> {pantalla === 1 ? t('vehiculo.backToCatalog') : t('common.goBack')}
            </button>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--texto-primary)', margin: 0 }}>{t('vehiculo.reserve')} — {vehiculo.nombre}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 36, flexWrap: 'wrap' }}>
            {pasos.map((label, i) => {
              const num = i + 1;
              const activo = pantalla === num;
              const completado = pantalla > num;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 14,
                      background: completado ? '#1e3a8a' : activo ? 'linear-gradient(135deg,#1e3a8a,#2563eb)' : 'var(--bg-item)',
                      color: completado || activo ? '#fff' : 'var(--texto-second)',
                      boxShadow: activo ? '0 8px 24px rgba(37,99,235,0.25)' : 'none',
                      transition: 'all 300ms ease',
                      flexShrink: 0,
                    }}>
                      {completado ? <IcoCheck color="#fff" sz={16} /> : num}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: activo ? 800 : 600, color: activo ? '#1e3a8a' : 'var(--texto-second)', whiteSpace: 'nowrap' }}>{label}</span>
                  </div>
                  {i < pasos.length - 1 && <div style={{ width: 56, height: 3, background: pantalla > num ? '#1e3a8a' : 'var(--borde)', margin: '0 8px', marginBottom: 20, transition: 'background 400ms ease' }} />}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>

              {pantalla === 1 && (
                <>
                  <GaleriaImagenes imagenes={vehiculo.imagenes} nombreVehiculo={vehiculo.nombre} />
                  <InfoVehiculo vehiculo={vehiculo} />
                  <div style={{ marginTop: 32 }}>
                    <PasoFechas vehiculo={vehiculo} reserva={reserva} onCambio={cambiarReserva} />
                  </div>
                </>
              )}

              {pantalla === 2 && (
                <>
                  <div id="campo-grupo">
                    <PlanesProteccion seguroIdx={seguroIdx} onSeleccionar={setSeguroIdx} />
                    <TipoKilometraje vehiculo={vehiculo} tipoKm={reserva.tipoKm} onSeleccionar={val => cambiarReserva('tipoKm', val)} />
                  </div>
                  <div id="campo-servicios" style={{ marginTop: 32 }}>
                    <ServiciosAdicionales
                      servicios={vehiculo.servicios}
                      seleccionados={serviciosSeleccionados}
                      onToggle={toggleServicio}
                    />
                  </div>
                </>
              )}

              {pantalla === 3 && (
                <DatosPersonales
                  vehiculo={vehiculo}
                  reserva={reserva}
                  seguroIdx={seguroIdx}
                  serviciosSeleccionados={serviciosSeleccionados}
                  datosForm={datosForm}
                  onCambio={(k, v) => setDatosForm(p => ({ ...p, [k]: v }))}
                  onReservar={handleReservar}
                  errores={errores}
                  docsVerificados={docsVerificados}
                />
              )}

              {pantalla < 3 && (
                <div style={{ marginTop: 32 }}>
                  {errorPaso1 && (
                    <p style={{ color: '#dc2626', fontSize: 13, fontWeight: 700, marginBottom: 12, textAlign: 'right' }}>{errorPaso1}</p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={irSiguiente}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 40px', borderRadius: 16, background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', color: '#fff', fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.28)', transition: 'transform 200ms ease' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {pantalla === 2 ? t('vehiculo.continueData') : t('common.continue')} <IcoArrow />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <ResumenLateral
              vehiculo={vehiculo}
              reserva={reserva}
              seguroIdx={seguroIdx}
              serviciosSeleccionados={serviciosSeleccionados}
              onEditar={irAEditar}
            />
          </div>

        </div>
      </div>
    </div>
  );
}