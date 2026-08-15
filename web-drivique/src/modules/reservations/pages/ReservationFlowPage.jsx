import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../../store/authStore'
import { showAlert } from '@/utils/swalConfig'
import logo from '@/assets/logo.png'
import { FaMoneyBillWave, FaCreditCard, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaTimes } from 'react-icons/fa'
import VEHICULOS_MOCK from '@/mocks/vehicles.json'
import { reservationService, HORAS_LIMITE_PAGO_EFECTIVO } from '@/services/reservationService'
import { documentsService } from '@/services/documentsService'
import { generarReferenciaUnica, aCentavos, construirUrlCheckout } from '@/services/wompiService'
import { RECARGOS_LOGISTICOS, SUCURSALES, CIUDADES } from '../../catalog/constants'
import ReservationCalendar from '../components/ReservationCalendar'
import { formatCurrency } from '@/utils/currencyUtils'
import { useLanding } from '../../landing/LandingContext'

import ImageGallery from '../../catalog/components/detail/ImageGallery'
import VehicleInfo from '../../catalog/components/detail/VehicleInfo'
import DateStep from '../components/DateStep'
import ProtectionPlans from '../components/ProtectionPlans'
import MileageType from '../components/MileageType'
import AdditionalServices from '../components/AdditionalServices'
import SideSummary from '../components/SideSummary'
import PersonalData from '../components/PersonalData'
import ContractSignature from '../../contracts/components/ContractSignature'

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

const HORAS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0')
  return [`${h}:00`, `${h}:30`]
}).flat()

export default function VehiculoDetallePage() {
  const { t } = useTranslation()
  const { moneda } = useLanding()
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, actualizarUsuario } = useAuthStore();

  const vehiculo = VEHICULOS_MOCK.find(v => v.id === Number(id));

  const [pantalla, setPantalla] = useState(1);
  const [seguroIdx, setSeguroIdx] = useState(null);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const toggleServicio = (nombre) => setServiciosSeleccionados(prev =>
    prev.includes(nombre) ? prev.filter(n => n !== nombre) : [...prev, nombre]
  );
  const [reserva, setReserva] = useState({
    fechaInicio: '', fechaFin: '',
    horaInicio: '', horaFin: '',
    sucursalRetiro: '',
    sucursalDevolucion: '',
    tipoKm: '',
    metodoPago: '',
    domicilioCiudad: '',
    domicilioBarrio: '',
    domicilioDireccion: '',
    domicilioReferencias: '',
  });

  const carBranch = vehiculo?.sucursal;
  const branchObj = SUCURSALES.find(s => s.nombre === carBranch);
  const cityObj = branchObj ? CIUDADES.find(c => c.nombre === branchObj.ciudad) : null;

  const opcionesEntrega = vehiculo ? [
    { value: carBranch, label: t('vehiculo.pickupAtBranch', { sucursal: carBranch }) }
  ] : [];

  if (vehiculo && reserva?.metodoPago !== 'efectivo') {
    opcionesEntrega.push({ value: 'domicilio', label: t('vehiculo.deliveryHome') });
    if (cityObj?.tieneAeropuerto) {
      opcionesEntrega.push({ value: 'aeropuerto', label: t('vehiculo.deliveryAirport') });
    }
    if (cityObj?.tieneTerminal) {
      opcionesEntrega.push({ value: 'terminal', label: t('vehiculo.deliveryTerminal') });
    }
  }

  const opcionesDevolucion = vehiculo ? [
    { value: carBranch, label: t('vehiculo.returnAtBranch', { sucursal: carBranch }) }
  ] : [];

  if (vehiculo && reserva?.metodoPago !== 'efectivo') {
    opcionesDevolucion.push({ value: 'domicilio', label: t('vehiculo.returnHome') });
    if (cityObj?.tieneAeropuerto) {
      opcionesDevolucion.push({ value: 'aeropuerto', label: t('vehiculo.returnAirport') });
    }
    if (cityObj?.tieneTerminal) {
      opcionesDevolucion.push({ value: 'terminal', label: t('vehiculo.returnTerminal') });
    }
  }

  // Modal de Edición
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalEditarSeccion, setModalEditarSeccion] = useState(null); // 'retiro', 'devolucion', 'grupo', 'servicios'
  const [localReserva, setLocalReserva] = useState({});
  const [localSeguroIdx, setLocalSeguroIdx] = useState(null);
  const [localServiciosSeleccionados, setLocalServiciosSeleccionados] = useState([]);
  const [modalError, setModalError] = useState('');

  const abrirModalEditar = (seccion) => {
    setLocalReserva({ ...reserva });
    setLocalSeguroIdx(seguroIdx);
    setLocalServiciosSeleccionados([...serviciosSeleccionados]);
    setModalError('');
    setModalEditarSeccion(seccion);
    setModalEditarOpen(true);
  };
  const cambiarReserva = (campo, valor) => {
    setReserva(prev => {
      const act = { ...prev, [campo]: valor };
      if (campo === 'metodoPago' && valor === 'efectivo') {
        act.sucursalRetiro = vehiculo ? vehiculo.sucursal : '';
        act.sucursalDevolucion = vehiculo ? vehiculo.sucursal : '';
        act.domicilioCiudad = '';
        act.domicilioBarrio = '';
        act.domicilioDireccion = '';
        act.domicilioReferencias = '';
      }
      if (act.sucursalRetiro === 'domicilio') {
        const branchObj = SUCURSALES.find(s => s.nombre === vehiculo?.sucursal);
        act.domicilioCiudad = branchObj?.ciudad || '';
      }
      return act;
    });
    setErrorPaso1('');

    if (campo === 'metodoPago' && valor === 'efectivo' && vehiculo) {
      const sucursal = SUCURSALES.find(s => s.nombre === vehiculo.sucursal);
      if (sucursal) {
        showAlert({
          icon: 'info',
          title: t('vehiculo.cashBranchTitle'),
          html: `
            <div style="text-align:left; font-size:14px; line-height:1.6;">
              <p style="margin:0 0 10px;">${t('vehiculo.cashBranchIntro')}</p>
              <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:14px 16px; text-align:left;">
                <p style="margin:0 0 4px; font-weight:800; color:#1e3a8a;">${sucursal.nombre}</p>
                <p style="margin:0 0 4px; color:#334155;"><strong>${t('vehiculo.cashBranchCity')}:</strong> ${sucursal.ciudad}</p>
                <p style="margin:0; color:#334155;"><strong>${t('vehiculo.cashBranchAddress')}:</strong> ${sucursal.direccion || t('vehiculo.cashBranchNoAddress')}</p>
              </div>
              
            </div>
          `,
          confirmButtonText: t('common.close'),
          width: 480,
        });
      }
    }
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
  const [reservaCreada, setReservaCreada] = useState(null); // reserva guardada, usada por FirmaContrato
  const [contratoFirmado, setContratoFirmado] = useState(false); // solo aplica al flujo de pago en efectivo
  const [datosPago, setDatosPago] = useState(null); // { referencia, amountInCents }
  const [redirigiendoPago, setRedirigiendoPago] = useState(false);
  const [errorPago, setErrorPago] = useState('');
  const [hoverWompi, setHoverWompi] = useState(false);
  const [hoverEfectivo, setHoverEfectivo] = useState(false);
  const [fechaLimitePago, setFechaLimitePago] = useState(null);
  const prellenado = useRef(false);
  const [resumenMovilAbierto, setResumenMovilAbierto] = useState(false);
  const resumenMovilRef = useRef(null);

  const idUsuarioDocs = usuario?.id || usuario?.correo || null;
  const docsVerificados = documentsService.tieneDocumentos(idUsuarioDocs);

  useEffect(() => {
    if (!usuario || prellenado.current) return
    prellenado.current = true
    const tel = (usuario.telefono || '').replace(/\D/g, '')
    const celular = tel.startsWith('57') && tel.length > 10 ? tel.slice(2) : tel
    const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ')
    setDatosForm(prev => ({
      ...prev,
      nombre: nombreCompleto || prev.nombre,
      correo: usuario.correo || prev.correo,
      celular: celular || prev.celular,
      numDoc: usuario.cedula || prev.numDoc,
      nacionalidad: usuario.nacionalidad || prev.nacionalidad || 'Colombia',
      tipoDoc: usuario.tipoDocumento || prev.tipoDoc || 'CC',
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
      if (!reserva.metodoPago) {
        setErrorPaso1("Debes seleccionar un método de pago.");
        return;
      }
      if (!reserva.sucursalRetiro || !reserva.sucursalDevolucion) {
        setErrorPaso1(t('vehiculo.selectLocation'))
        return
      }
      if (!reserva.fechaInicio || !reserva.fechaFin) {
        setErrorPaso1(t('vehiculo.errors.datesRequired'))
        return
      }
      if (!reserva.horaInicio || !reserva.horaFin) {
        setErrorPaso1("Debes seleccionar la hora de recogida y devolución.");
        return;
      }
      if (reserva.sucursalRetiro === 'domicilio') {
        if (
          !reserva.domicilioBarrio?.trim() ||
          !reserva.domicilioDireccion?.trim() ||
          !reserva.domicilioReferencias?.trim()
        ) {
          setErrorPaso1(t('vehiculo.errors.domicilioRequired'))
          return
        }
      }
    } else if (pantalla === 2) {
      if (seguroIdx === null) {
        setErrorPaso1("Debes seleccionar un plan de protección.");
        return;
      }
      if (!reserva.tipoKm) {
        setErrorPaso1("Debes seleccionar el tipo de kilometraje.");
        return;
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
    const precioKm = reserva.tipoKm === 'ilimitado' ? (tarifas.kmIlimitado?.precio || 0) : (reserva.tipoKm === 'limitado' ? (tarifas.kmLimitado?.precio || 0) : 0);
    const dias = (reserva.fechaInicio && reserva.fechaFin) ? Math.max(1, Math.ceil((new Date(reserva.fechaFin) - new Date(reserva.fechaInicio)) / 86400000)) : 1;
    const precioSeguro = seguroIdx !== null ? (vehiculo.seguros[seguroIdx]?.precio ?? 0) : 0;
    const serviciosElegidos = (vehiculo.servicios || []).filter(s => serviciosSeleccionados.includes(s.nombre));
    const precioServicios = serviciosElegidos.reduce((suma, s) => suma + s.precio, 0);

    const subtotal = (precioKm + precioSeguro + precioServicios) * dias;
    const cargosAdmin = Math.round(subtotal * 0.10);
    
    const recargoRetiro = RECARGOS_LOGISTICOS[reserva.sucursalRetiro] || 0;
    const recargoDevolucion = RECARGOS_LOGISTICOS[reserva.sucursalDevolucion] || 0;
    const recargoLogistico = recargoRetiro + recargoDevolucion;
    
    const subtotalPreIva = subtotal + cargosAdmin + recargoLogistico;
    const ivaCop = Math.round(subtotalPreIva * 0.19);
    const totalCop = subtotalPreIva + ivaCop;

    // Crear la referencia única para Wompi Checkout
    const referencia = generarReferenciaUnica();

    // Si el usuario tenía su perfil incompleto o actualizó sus datos en la reserva,
    // sincronizamos automáticamente su perfil global para que quede completado.
    if (usuario && actualizarUsuario) {
      const partesNombre = (datosForm.nombre || '').trim().split(' ');
      const primerNombre = partesNombre.length > 1 ? partesNombre.slice(0, -1).join(' ') : partesNombre[0] || '';
      const primerApellido = partesNombre.length > 1 ? partesNombre[partesNombre.length - 1] : '';

      actualizarUsuario({
        nombre: usuario.nombre || primerNombre || datosForm.nombre,
        apellido: usuario.apellido || primerApellido || '',
        cedula: usuario.cedula || datosForm.numDoc,
        telefono: usuario.telefono || datosForm.celular,
        nacionalidad: usuario.nacionalidad || datosForm.nacionalidad,
        tipoDocumento: usuario.tipoDocumento || datosForm.tipoDoc,
      });
    }

    // Si el usuario subió documentos nuevos (o no tenía aún), los dejamos
    // registrados para no volver a pedírselos en su próxima reserva.
    if (idUsuarioDocs && (datosForm.cedulaPdf || datosForm.licenciaPdf || !docsVerificados)) {
      documentsService.guardarDocumentos(idUsuarioDocs, {
        cedulaPdf: datosForm.cedulaPdf,
        licenciaPdf: datosForm.licenciaPdf,
      });
    }

    // Guardar temporalmente en localStorage (estado simulado). Si el pago es
    // en efectivo, reservaService calcula automáticamente el plazo límite
    // para pagar en sucursal y deja el estado en PENDIENTE_EFECTIVO.
    const reservaGuardada = reservationService.guardarReserva({
      referencia,
      vehiculoId: vehiculo.id,
      vehiculoNombre: vehiculo.nombre,
      estado: 'PENDIENTE',
      fechaReserva: new Date().toISOString(),
      datosForm,
      reservaDetalles: reserva,
      total: totalCop,
      // Se guardan también el plan de protección y los servicios elegidos para
      // que el contrato (aquí o al volver de Wompi) pueda mostrarlos aunque
      // esos datos no vivan en reservaDetalles.
      seguroIdx,
      serviciosSeleccionados,
    });

    if (reservaGuardada.fechaLimitePago) {
      setFechaLimitePago(reservaGuardada.fechaLimitePago);
    }

    // Guardamos la referencia para que RespuestaPagoPage la recupere al volver de Wompi
    sessionStorage.setItem('current_wompi_reference', referencia);

    setReservaCreada(reservaGuardada);
    setDatosPago({ referencia, amountInCents: aCentavos(totalCop) });

    // Regla del flujo: si el pago es en efectivo, el contrato se firma justo
    // después de los datos personales (aquí mismo). Si es Wompi, el contrato
    // se firma más adelante, tras la confirmación del pago (RespuestaPagoPage).
    if (reserva.metodoPago === 'efectivo') {
      setContratoFirmado(false);
    } else {
      setExito(true);
    }
  };

  const handleContratoFirmado = () => {
    setContratoFirmado(true);
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

  if (reservaCreada && reserva.metodoPago === 'efectivo' && !contratoFirmado) return (
    <div className="catalogo-page" style={{ minHeight: '100vh', background: 'var(--hero-fondo)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -80, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'var(--hero-orb1)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 350, height: 350, borderRadius: '50%', background: 'var(--hero-orb2)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', paddingTop: 48, paddingBottom: 48, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 28px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--texto-primary)', margin: '0 0 8px' }}>
            {t('contratoFirma.pageTitleCash')}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--texto-second)', margin: 0 }}>{t('contratoFirma.pageSubtitle')}</p>
        </div>
        <ContractSignature vehiculo={vehiculo} reservaGuardada={reservaCreada} onFirmado={handleContratoFirmado} />
      </div>
    </div>
  );

  if (exito) return (
    <div className="catalogo-page" style={{
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
              <p style={{ fontSize: 13, color: '#2563eb', fontWeight: 700, margin: 0 }}>
                El contrato firmado te llegó a tu correo. Muéstralo en la sucursal para realizar el pago.
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

  // Mismo cálculo que ResumenLateral/DatosPersonales, para poder mostrar
  // el total también en la barra de "Confirmar reserva" que se ve en
  // móvil/tablet debajo del resumen.
  const tarifasTotal = vehiculo.tarifas || {};
  const kmLimitTotal = tarifasTotal.kmLimitado || { precio: 0, km: 0 };
  const kmIlimitTotal = tarifasTotal.kmIlimitado || { precio: 0 };
  const precioTotal = reserva.tipoKm === 'ilimitado' ? kmIlimitTotal.precio : (reserva.tipoKm === 'limitado' ? kmLimitTotal.precio : 0);
  const diasTotal = reserva.fechaInicio && reserva.fechaFin
    ? Math.max(1, Math.ceil((new Date(reserva.fechaFin) - new Date(reserva.fechaInicio)) / 86400000))
    : 1;
  const precioSeguroTotal = seguroIdx !== null ? (vehiculo.seguros[seguroIdx]?.precio ?? 0) : 0;
  const precioServiciosTotal = (vehiculo.servicios || [])
    .filter(s => serviciosSeleccionados.includes(s.nombre))
    .reduce((suma, s) => suma + s.precio, 0);
  const subtotalDiarioTotal = precioTotal * diasTotal;
  const subtotalSeguroTotal = precioSeguroTotal * diasTotal;
  const subtotalServiciosTotal = precioServiciosTotal * diasTotal;
  const cargosAdminTotal = Math.round((subtotalDiarioTotal + subtotalSeguroTotal + subtotalServiciosTotal) * 0.10);
  const recargoLogisticoTotal = (RECARGOS_LOGISTICOS[reserva.sucursalRetiro] || 0) + (RECARGOS_LOGISTICOS[reserva.sucursalDevolucion] || 0);
  const subtotalPreIvaTotal = subtotalDiarioTotal + subtotalSeguroTotal + subtotalServiciosTotal + cargosAdminTotal + recargoLogisticoTotal;
  const ivaTotal = Math.round(subtotalPreIvaTotal * 0.19);
  const totalReserva = subtotalPreIvaTotal + ivaTotal;

  return (
    <div className="catalogo-page" style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <div style={{ paddingTop: 0 }}>
        <div className="detalle-contenido-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

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

          <div className="detalle-layout" style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
            <div className="detalle-columna-principal" style={{ flex: 1, minWidth: 0 }}>

              {pantalla === 1 && (
                <>
                  <ImageGallery imagenes={vehiculo.imagenes} nombreVehiculo={vehiculo.nombre} />
                  <VehicleInfo vehiculo={vehiculo} />
                  <div style={{ marginTop: 32 }}>
                    <DateStep vehiculo={vehiculo} reserva={reserva} onCambio={cambiarReserva} />
                  </div>
                </>
              )}

              {pantalla === 2 && (
                <>
                  <div id="campo-grupo">
                    <ProtectionPlans seguroIdx={seguroIdx} onSeleccionar={setSeguroIdx} />
                    <div style={{ marginTop: 40 }}>
                      <MileageType vehiculo={vehiculo} tipoKm={reserva.tipoKm} onSeleccionar={val => cambiarReserva('tipoKm', val)} />
                    </div>
                  </div>
                  <div id="campo-servicios" style={{ marginTop: 32 }}>
                    <AdditionalServices
                      servicios={vehiculo.servicios}
                      seleccionados={serviciosSeleccionados}
                      onToggle={toggleServicio}
                    />
                  </div>
                </>
              )}

              {pantalla === 3 && (
                <PersonalData
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
                <div className="detalle-continuar-desktop" style={{ marginTop: 32 }}>
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

            {/* Botón "Resumen de reserva" visible solo en tablet/celular
                (vía CSS). Despliega/oculta el ResumenLateral colapsable en
                los 3 pasos del flujo. En PC el resumen se ve fijo al lado. */}
            <button
              type="button"
              onClick={() => setResumenMovilAbierto(prev => !prev)}
              className="detalle-resumen-toggle"
              style={{
                display: 'none',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                marginTop: 24,
                padding: '15px 20px',
                borderRadius: 16,
                background: 'var(--bg-tarjeta)',
                border: '1px solid var(--borde)',
                boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 800, color: 'var(--texto-primary)' }}>
                <svg width="18" height="18" fill="none" stroke="#1e3a8a" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {t('vehiculo.reserveSummary')}
              </span>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: '50%', background: '#eff6ff', color: '#1e3a8a',
                transform: resumenMovilAbierto ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 250ms ease',
              }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>

            <div
              ref={resumenMovilRef}
              className={`detalle-resumen-wrapper${resumenMovilAbierto ? ' abierto' : ''}`}
              style={{ display: 'contents' }}
            >
              <SideSummary
                vehiculo={vehiculo}
                reserva={reserva}
                seguroIdx={seguroIdx}
                serviciosSeleccionados={serviciosSeleccionados}
                onEditar={abrirModalEditar}
              />
            </div>

            {/* En tablet/celular el layout se apila en columna: este botón
                (idéntico al de arriba) se muestra debajo del resumen de la
                reserva en vez de arriba, vía CSS (ver responsive.css). */}
            {pantalla < 3 && (
              <div className="detalle-continuar-movil" style={{ display: 'none', width: '100%', marginTop: 24 }}>
                {errorPaso1 && (
                  <p style={{ color: '#dc2626', fontSize: 13, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>{errorPaso1}</p>
                )}
                <button
                  onClick={irSiguiente}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 40px', borderRadius: 16, background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', color: '#fff', fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.28)' }}
                >
                  {pantalla === 2 ? t('vehiculo.continueData') : t('common.continue')} <IcoArrow />
                </button>
              </div>
            )}

            {/* Igual que arriba: en móvil/tablet el botón "Confirmar reserva"
                (con el total) se muestra debajo del resumen, no encima. */}
            {pantalla === 3 && (
              <div
                className="confirmar-reserva-movil"
                style={{
                  display: 'none',
                  width: '100%',
                  marginTop: 24,
                  background: 'linear-gradient(135deg,#0f1a3d,#1e3a8a)',
                  borderRadius: 24,
                  padding: '22px 24px',
                  boxShadow: '0 12px 32px rgba(30,58,138,0.25)',
                }}
              >
                <p style={{ fontSize: 12, color: '#bfdbfe', fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('vehiculo.totalToPay')}</p>
                <p style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 0 16px' }}>{formatCurrency(totalReserva, moneda)}</p>
                <button
                  onClick={handleReservar}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '15px 24px', borderRadius: 16, background: 'var(--bg-tarjeta)', color: '#1e3a8a', fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}
                >
                  {t('vehiculo.confirmReserve')} →
                </button>
              </div>
            )}
          </div>

          {/* Modal de Edición In-Place */}
          {modalEditarOpen && (
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(8px)',
              padding: 16,
            }}>
              <div style={{
                background: 'var(--bg-tarjeta)',
                borderRadius: 28,
                border: '1px solid var(--borde)',
                width: '100%',
                maxWidth: modalEditarSeccion === 'grupo' || modalEditarSeccion === 'servicios' ? 840 : 560,
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 24px 70px rgba(15,23,42,0.25)',
                overflow: 'hidden'
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '24px 28px',
                  borderBottom: '1px solid var(--borde)',
                  background: 'linear-gradient(135deg, #1e3a8a, #2563eb)'
                }}>
                  <h3 style={{ fontSize: 19, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
                    {modalEditarSeccion === 'retiro' && "Editar Retiro"}
                    {modalEditarSeccion === 'devolucion' && "Editar Devolución"}
                    {modalEditarSeccion === 'grupo' && "Tu Protección y Extras"}
                    {modalEditarSeccion === 'servicios' && "Editar Servicios Adicionales"}
                  </h3>
                  <button
                    onClick={() => setModalEditarOpen(false)}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                {/* Body */}
                <div style={{ padding: '28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {modalError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 16, padding: '14px 18px', color: '#b91c1c', fontSize: 13, fontWeight: 800 }}>
                      {modalError}
                    </div>
                  )}

                  {/* Retiro / Devolucion Form */}
                  {(modalEditarSeccion === 'retiro' || modalEditarSeccion === 'devolucion') && (() => {
                    const opcionesEntregaModal = vehiculo ? [
                      { value: vehiculo.sucursal, label: t('vehiculo.pickupAtBranch', { sucursal: vehiculo.sucursal }) }
                    ] : [];

                    const cityObj = SUCURSALES.find(s => s.nombre === vehiculo?.sucursal);

                    if (vehiculo && localReserva.metodoPago !== 'efectivo') {
                      opcionesEntregaModal.push({ value: 'domicilio', label: t('vehiculo.deliveryHome') });
                      if (cityObj?.tieneAeropuerto) {
                        opcionesEntregaModal.push({ value: 'aeropuerto', label: t('vehiculo.deliveryAirport') });
                      }
                      if (cityObj?.tieneTerminal) {
                        opcionesEntregaModal.push({ value: 'terminal', label: t('vehiculo.deliveryTerminal') });
                      }
                    }

                    const opcionesDevolucionModal = vehiculo ? [
                      { value: vehiculo.sucursal, label: t('vehiculo.returnAtBranch', { sucursal: vehiculo.sucursal }) }
                    ] : [];

                    if (vehiculo && localReserva.metodoPago !== 'efectivo') {
                      opcionesDevolucionModal.push({ value: 'domicilio', label: t('vehiculo.returnHome') });
                      if (cityObj?.tieneAeropuerto) {
                        opcionesDevolucionModal.push({ value: 'aeropuerto', label: t('vehiculo.returnAirport') });
                      }
                      if (cityObj?.tieneTerminal) {
                        opcionesDevolucionModal.push({ value: 'terminal', label: t('vehiculo.returnTerminal') });
                      }
                    }

                    return (
                      <>
                        {/* Selector de Método de Pago inside Modal */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--texto-second)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Método de Pago
                          </label>
                          <div style={{ border: '1px solid var(--borde)', borderRadius: 16, padding: '12px 16px', background: 'var(--bg-item)' }}>
                            <select
                              className="w-full bg-transparent text-sm font-extrabold text-[var(--texto-primary)] outline-none cursor-pointer"
                              value={localReserva.metodoPago}
                              onChange={e => {
                                const val = e.target.value;
                                setLocalReserva(prev => {
                                  const act = { ...prev, metodoPago: val };
                                  if (val === 'efectivo') {
                                    act.sucursalRetiro = vehiculo ? vehiculo.sucursal : '';
                                    act.sucursalDevolucion = vehiculo ? vehiculo.sucursal : '';
                                    act.domicilioBarrio = '';
                                    act.domicilioDireccion = '';
                                    act.domicilioReferencias = '';
                                    act.domicilioCiudad = '';
                                  }
                                  return act;
                                });
                              }}
                            >
                              <option value="wompi">Pago digital (Wompi)</option>
                              <option value="efectivo">Pago en efectivo en sucursal</option>
                            </select>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          {modalEditarSeccion === 'retiro' ? (
                            <>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--texto-second)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  {t('vehiculo.pickupLocationLabel')}
                                </label>
                                <div style={{ border: '1px solid var(--borde)', borderRadius: 16, padding: '12px 16px', background: 'var(--bg-item)' }}>
                                  <select
                                    className="w-full bg-transparent text-sm font-extrabold text-[var(--texto-primary)] outline-none cursor-pointer"
                                    value={localReserva.sucursalRetiro}
                                    onChange={e => {
                                      const val = e.target.value;
                                      setLocalReserva(prev => {
                                        const act = { ...prev, sucursalRetiro: val };
                                        if (val === 'domicilio') {
                                          const branchObj = SUCURSALES.find(s => s.nombre === vehiculo?.sucursal);
                                          act.domicilioCiudad = branchObj?.ciudad || '';
                                        }
                                        return act;
                                      });
                                    }}
                                  >
                                    <option value="">Selecciona sucursal</option>
                                    {opcionesEntregaModal.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                  </select>
                                </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--texto-second)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  Hora
                                </label>
                                <div style={{ border: '1px solid var(--borde)', borderRadius: 16, padding: '12px 16px', background: 'var(--bg-item)' }}>
                                  <select
                                    className="w-full bg-transparent text-sm font-extrabold text-[var(--texto-primary)] outline-none cursor-pointer"
                                    value={localReserva.horaInicio}
                                    onChange={e => setLocalReserva(prev => ({ ...prev, horaInicio: e.target.value }))}
                                  >
                                    <option value="">Selecciona hora</option>
                                    {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                                  </select>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--texto-second)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  {t('vehiculo.returnLocationLabel')}
                                </label>
                                <div style={{ border: '1px solid var(--borde)', borderRadius: 16, padding: '12px 16px', background: 'var(--bg-item)' }}>
                                  <select
                                    className="w-full bg-transparent text-sm font-extrabold text-[var(--texto-primary)] outline-none cursor-pointer"
                                    value={localReserva.sucursalDevolucion}
                                    onChange={e => {
                                      const val = e.target.value;
                                      setLocalReserva(prev => {
                                        const act = { ...prev, sucursalDevolucion: val };
                                        if (val === 'domicilio') {
                                          const branchObj = SUCURSALES.find(s => s.nombre === vehiculo?.sucursal);
                                          act.domicilioCiudad = branchObj?.ciudad || '';
                                        }
                                        return act;
                                      });
                                    }}
                                  >
                                    <option value="">Selecciona sucursal</option>
                                    {opcionesDevolucionModal.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                  </select>
                                </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--texto-second)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  Hora
                                </label>
                                <div style={{ border: '1px solid var(--borde)', borderRadius: 16, padding: '12px 16px', background: 'var(--bg-item)' }}>
                                  <select
                                    className="w-full bg-transparent text-sm font-extrabold text-[var(--texto-primary)] outline-none cursor-pointer"
                                    value={localReserva.horaFin}
                                    onChange={e => setLocalReserva(prev => ({ ...prev, horaFin: e.target.value }))}
                                  >
                                    <option value="">Selecciona hora</option>
                                    {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                                  </select>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Domicilio Form inside Modal */}
                        {((modalEditarSeccion === 'retiro' && localReserva.sucursalRetiro === 'domicilio') || 
                          (modalEditarSeccion === 'devolucion' && localReserva.sucursalDevolucion === 'domicilio')) && (
                          <div style={{ background: 'var(--bg-item)', border: '1px solid var(--borde)', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Dirección de Domicilio
                            </span>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--texto-second)' }}>Ciudad</label>
                                <input
                                  type="text"
                                  disabled
                                  value={localReserva.domicilioCiudad || ''}
                                  style={{ border: '1px solid var(--borde)', borderRadius: 12, padding: '10px 14px', background: '#e2e8f0', fontSize: 13, color: 'var(--texto-second)', fontWeight: 600 }}
                                />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--texto-second)' }}>Barrio *</label>
                                <input
                                  type="text"
                                  value={localReserva.domicilioBarrio || ''}
                                  onChange={e => setLocalReserva(prev => ({ ...prev, domicilioBarrio: e.target.value }))}
                                  style={{ border: '1px solid var(--borde)', borderRadius: 12, padding: '10px 14px', background: 'var(--bg-item)', fontSize: 13, color: 'var(--texto-primary)', fontWeight: 600 }}
                                />
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--texto-second)' }}>Dirección *</label>
                              <input
                                type="text"
                                value={localReserva.domicilioDireccion || ''}
                                onChange={e => setLocalReserva(prev => ({ ...prev, domicilioDireccion: e.target.value }))}
                                style={{ border: '1px solid var(--borde)', borderRadius: 12, padding: '10px 14px', background: 'var(--bg-item)', fontSize: 13, color: 'var(--texto-primary)', fontWeight: 600 }}
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--texto-second)' }}>Referencias *</label>
                              <textarea
                                rows="2"
                                value={localReserva.domicilioReferencias || ''}
                                onChange={e => setLocalReserva(prev => ({ ...prev, domicilioReferencias: e.target.value }))}
                                style={{ border: '1px solid var(--borde)', borderRadius: 12, padding: '10px 14px', background: 'var(--bg-item)', fontSize: 13, color: 'var(--texto-primary)', resize: 'none', fontWeight: 600 }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Calendario inside Modal */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--texto-second)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Fechas de Reserva
                          </label>
                          <div style={{ border: '1px solid var(--borde)', borderRadius: 20, padding: 16 }}>
                            <ReservationCalendar
                              vehiculoId={vehiculo.id}
                              fechaInicio={localReserva.fechaInicio}
                              fechaFin={localReserva.fechaFin}
                              onCambiarFechas={({ fechaInicio, fechaFin }) => {
                                setLocalReserva(prev => ({ ...prev, fechaInicio, fechaFin }));
                              }}
                            />
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {/* Grupo Edit Form */}
                  {modalEditarSeccion === 'grupo' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <ProtectionPlans seguroIdx={localSeguroIdx} onSeleccionar={setLocalSeguroIdx} />
                      <div style={{ borderTop: '1px solid var(--borde)', paddingTop: 20 }}>
                        <MileageType
                          vehiculo={vehiculo}
                          tipoKm={localReserva.tipoKm}
                          onSeleccionar={val => setLocalReserva(prev => ({ ...prev, tipoKm: val }))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Servicios Edit Form */}
                  {modalEditarSeccion === 'servicios' && (
                    <div>
                      <AdditionalServices
                        servicios={vehiculo.servicios}
                        seleccionados={localServiciosSeleccionados}
                        onToggle={nombre => setLocalServiciosSeleccionados(prev =>
                          prev.includes(nombre) ? prev.filter(n => n !== nombre) : [...prev, nombre]
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{
                  padding: '18px 28px',
                  borderTop: '1px solid var(--borde)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 12,
                  background: '#fafafa'
                }}>
                  <button
                    onClick={() => setModalEditarOpen(false)}
                    style={{
                      padding: '12px 24px',
                      borderRadius: 14,
                      border: '1px solid var(--borde)',
                      background: 'var(--bg-tarjeta)',
                      color: 'var(--texto-primary)',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      // Validation
                      if (modalEditarSeccion === 'retiro') {
                        if (!localReserva.sucursalRetiro) {
                          setModalError("Debes seleccionar el lugar de retiro.");
                          return;
                        }
                        if (!localReserva.fechaInicio) {
                          setModalError("Debes seleccionar la fecha de inicio.");
                          return;
                        }
                        if (!localReserva.horaInicio) {
                          setModalError("Debes seleccionar la hora de retiro.");
                          return;
                        }
                        if (localReserva.sucursalRetiro === 'domicilio') {
                          if (!localReserva.domicilioBarrio?.trim() || !localReserva.domicilioDireccion?.trim() || !localReserva.domicilioReferencias?.trim()) {
                            setModalError("Debes completar todos los datos del domicilio.");
                            return;
                          }
                        }
                      }

                      if (modalEditarSeccion === 'devolucion') {
                        if (!localReserva.sucursalDevolucion) {
                          setModalError("Debes seleccionar el lugar de devolución.");
                          return;
                        }
                        if (!localReserva.fechaFin) {
                          setModalError("Debes seleccionar la fecha de devolución.");
                          return;
                        }
                        if (!localReserva.horaFin) {
                          setModalError("Debes seleccionar la hora de devolución.");
                          return;
                        }
                        if (localReserva.sucursalDevolucion === 'domicilio') {
                          if (!localReserva.domicilioBarrio?.trim() || !localReserva.domicilioDireccion?.trim() || !localReserva.domicilioReferencias?.trim()) {
                            setModalError("Debes completar todos los datos del domicilio.");
                            return;
                          }
                        }
                      }

                      if (modalEditarSeccion === 'grupo') {
                        if (localSeguroIdx === null) {
                          setModalError("Debes seleccionar un plan de protección.");
                          return;
                        }
                        if (!localReserva.tipoKm) {
                          setModalError("Debes seleccionar el tipo de kilometraje.");
                          return;
                        }
                      }

                      // Commit changes
                      setReserva({ ...localReserva });
                      setSeguroIdx(localSeguroIdx);
                      setServiciosSeleccionados([...localServiciosSeleccionados]);
                      setModalError('');
                      setModalEditarOpen(false);
                      setModalEditarSeccion(null);

                      if (localReserva.metodoPago === 'efectivo' && vehiculo) {
                        const sucursal = SUCURSALES.find(s => s.nombre === vehiculo.sucursal);
                        if (sucursal) {
                          showAlert({
                            icon: 'info',
                            title: t('vehiculo.cashBranchTitle'),
                            html: `
                              <div style="text-align:left; font-size:14px; line-height:1.6;">
                                <p style="margin:0 0 10px;">${t('vehiculo.cashBranchIntro')}</p>
                                <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:14px 16px; text-align:left;">
                                  <p style="margin:0 0 4px; font-weight:800; color:#1e3a8a;">${sucursal.nombre}</p>
                                  <p style="margin:0 0 4px; color:#334155;"><strong>${t('vehiculo.cashBranchCity')}:</strong> ${sucursal.ciudad}</p>
                                  <p style="margin:0; color:#334155;"><strong>${t('vehiculo.cashBranchAddress')}:</strong> ${sucursal.direccion || t('vehiculo.cashBranchNoAddress')}</p>
                                </div>
                                
                              </div>
                            `,
                            confirmButtonText: t('common.close'),
                            width: 480,
                          });
                        }
                      }
                    }}
                    style={{
                      padding: '12px 24px',
                      borderRadius: 14,
                      background: 'linear-gradient(90deg,#1e3a8a,#2563eb)',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: 14,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 8px 20px rgba(37,99,235,0.22)'
                    }}
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}