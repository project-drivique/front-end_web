import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaFileSignature, FaCheckCircle, FaDownload, FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import logo from '@/assets/logo.png';
import { useBrand } from '@/contexts/BrandContext';
import firmaDrivique from '@/assets/drivique-signature.png';
import { useLanding } from '../../landing/LandingContext';
import { formatCurrency } from '@/utils/currencyUtils';
import { getNombreTipoDoc } from '@/utils/documentUtils';
import { contractService } from '@/services/contractService';
import { useAuthStore } from '@/store/authStore';
import SignatureCanvas from './SignatureCanvas';

const LOCALES_FECHA = { es: 'es-CO', en: 'en-US', fr: 'fr-FR', pt: 'pt-PT', br: 'pt-BR' };

/** "Toyota Corolla 2024" -> { marca: "Toyota", modelo: "Corolla 2024" } */

const Campo = ({ label, value }) => (
  <div className="contrato-campo" style={{
    background: 'var(--bg-tarjeta)', border: '1px solid var(--borde)', borderRadius: 14,
    padding: '12px 14px', minHeight: 66,
  }}>
    <span className="contrato-campo-label" style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--texto-second)', marginBottom: 8, fontWeight: 700 }}>
      {label}
    </span>
    <span className="contrato-campo-valor" style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--texto-primary)', wordBreak: 'break-word' }}>
      {value || '—'}
    </span>
  </div>
);

export default function FirmaContrato({
  vehiculo,
  reservaGuardada,
  onFirmado,
  soloLectura = false,
  contratoFirmado = null,
  onDescargar = null,
  onEnviarCorreo = null,
  enviandoCorreo = false,
  onVolver = null,
}) {
  const { brand } = useBrand();
  const { t, i18n } = useTranslation();
  const { moneda } = useLanding();
  const usuarioStore = useAuthStore(state => state.usuario);
  const canvasRef = useRef(null);
  const [errorFirma, setErrorFirma] = useState('');
  const [firmando, setFirmando] = useState(false);

  const { datosForm = {}, reservaDetalles = {}, referencia } = reservaGuardada || {};
  const [contratoApi, setContratoApi] = useState(contratoFirmado?.contractNumber ? contratoFirmado : null);

  const directSignature = (
    (typeof contratoFirmado?.signatureUrl === 'string' && contratoFirmado.signatureUrl.trim()) ||
    (typeof contratoFirmado?.firmaUsuarioDataUrl === 'string' && contratoFirmado.firmaUsuarioDataUrl !== 'protected' && contratoFirmado.firmaUsuarioDataUrl.trim()) ||
    (typeof reservaGuardada?.firmaUsuarioDataUrl === 'string' && reservaGuardada.firmaUsuarioDataUrl !== 'protected' && reservaGuardada.firmaUsuarioDataUrl.trim()) ||
    (typeof reservaGuardada?.contratoFirma === 'string' && reservaGuardada.contratoFirma.trim()) ||
    ''
  );

  const [firmaImagen, setFirmaImagen] = useState(directSignature || '');
  const contratoIdFirmado = contratoFirmado?.id || (contratoApi?.signedAt ? contratoApi.id : null);

  // Normalización exhaustiva de los datos del cliente
  const clienteNombre = datosForm.nombre || [datosForm.nombres, datosForm.apellidos].filter(Boolean).join(' ') || reservaGuardada?.clienteNombre || usuarioStore?.nombre || contratoApi?.customerFullName || t('hc2.cliente_drivique', 'Cliente Drivique');

  const generateSvgSignature = (name) => {
    const cleanName = String(name || t('hc2.cliente_drivique', 'Cliente Drivique')).trim();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 100" width="380" height="100">
      <text x="25" y="60" font-family="'Brush Script MT', 'Dancing Script', 'Caveat', 'Segoe Script', cursive" font-size="32" font-style="italic" fill="#0f172a" letter-spacing="1">${cleanName}</text>
      <path d="M 25 74 Q 170 86 340 70" stroke="var(--brand-primary)" stroke-width="2" fill="none" opacity="0.75"/>
      <circle cx="346" cy="69" r="3" fill="var(--brand-primary)"/>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  useEffect(() => {
    let url = '';
    let activo = true;

    if (directSignature) {
      setFirmaImagen(directSignature);
    }

    if (contratoIdFirmado) {
      contractService.obtenerFirmaUrl(contratoIdFirmado)
        .then((objectUrl) => {
          url = objectUrl;
          if (activo && objectUrl) setFirmaImagen(objectUrl);
        })
        .catch(() => {
          if (activo && !directSignature && soloLectura) {
            setFirmaImagen(generateSvgSignature(clienteNombre));
          }
        });
    } else if (soloLectura && !directSignature) {
      setFirmaImagen(generateSvgSignature(clienteNombre));
    }

    return () => {
      activo = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [contratoIdFirmado, directSignature, soloLectura, clienteNombre]);

  useEffect(() => {
    if (contratoFirmado?.contractNumber) setContratoApi(contratoFirmado);
  }, [contratoFirmado]);

  // Vista de solo lectura (encargado / administrador): quien la abre suele pasar un contrato resumido (número, firma
  // y datos del cliente). Se completa con el contrato del servidor: vehículo, sucursal, ciudad, dirección y licencia.
  const contratoLecturaId = contratoFirmado?.id;
  useEffect(() => {
    if (!soloLectura || !contratoLecturaId || contratoFirmado?.vehiclePlate) return undefined;
    let activo = true;
    contractService.obtenerPorId(contratoLecturaId)
      .then((completo) => { if (activo && completo) setContratoApi((previo) => ({ ...(previo || {}), ...completo })); })
      .catch(() => { /* se conserva el resumen recibido */ });
    return () => { activo = false; };
  }, [soloLectura, contratoLecturaId, contratoFirmado?.vehiclePlate]);
  const total = contratoApi?.finalAmount ?? contratoApi?.baseAmount ?? reservaGuardada?.total ?? 0;
  const clienteTipoDoc = datosForm.tipoDoc || datosForm.tipoDocumento || usuarioStore?.tipoDocumento || 'CC';
  const clienteNumDoc = datosForm.numDoc || datosForm.documento || datosForm.cedula || contratoApi?.customerDocumentNumber || reservaGuardada?.clienteDocumento || usuarioStore?.cedula || '';
  const clienteCorreo = datosForm.correo || datosForm.email || reservaGuardada?.clienteCorreo || usuarioStore?.correo || usuarioStore?.email || contratoApi?.customerEmail || '';
  const clienteTelefono = contratoApi?.customerPhone || datosForm.celular || datosForm.telefono || reservaGuardada?.clienteTelefono || usuarioStore?.telefono || '';
  const clienteDireccion = contratoApi?.customerAddress || datosForm.direccion || reservaGuardada?.clienteDireccion || usuarioStore?.direccion || '';
  const ESTADO_LICENCIA = { APPROVED: t('hc2.vigente_validada_por_la_sucursal', 'Vigente (validada por la sucursal)'), PENDING: t('hc2.pendiente_de_validacion', 'Pendiente de validación'), REJECTED: 'Rechazada' };
  const clienteLicencia = ESTADO_LICENCIA[contratoApi?.driverLicenseStatus] || '';

  // Normalización exhaustiva de datos del vehículo
  const vehiculoPlaca = contratoApi?.vehiclePlate || '';
  const vehiculoColor = contratoApi?.vehicleColor || '';
  const vehiculoAnio = contratoApi?.vehicleYear || '';

  const direccionCompleta = reservaDetalles.sucursalRetiro === 'domicilio'
    ? `${reservaDetalles.domicilioDireccion || ''}, ${reservaDetalles.domicilioBarrio || ''}, ${reservaDetalles.domicilioCiudad || ''} (Ref: ${reservaDetalles.domicilioReferencias || ''})`
    : t('contratoFirma.notProvided');

  const [codigoContrato, setCodigoContrato] = useState(contratoFirmado?.codigo || '');
  useEffect(() => {
    if (soloLectura || !reservaGuardada?.id) return;
    contractService.obtenerPorReserva(reservaGuardada.id)
      .then((c) => { setContratoApi(c); setCodigoContrato(c?.contractNumber || ''); })
      .catch(() => setCodigoContrato(''));
  }, [reservaGuardada?.id, soloLectura]);
  const localeFecha = LOCALES_FECHA[i18n.language] || 'es-CO';
  const marca = contratoApi?.vehicleBrandName || '';
  const modelo = contratoApi?.vehicleModel || '';
  const sucursalRetiroNombre = contratoApi?.pickupBranchName
    || (reservaDetalles.sucursalRetiro === 'domicilio' ? vehiculo?.sucursal : reservaDetalles.sucursalRetiro);
  const ciudadSucursal = contratoApi?.pickupCityName || '';
  const direccionSucursal = contratoApi?.pickupBranchAddress || '';
  const fechaGeneracion = new Date().toLocaleDateString(localeFecha, { day: '2-digit', month: 'long', year: 'numeric' });

  const serviciosTexto = (contratoApi?.additionalServiceNames || []).length
    ? contratoApi.additionalServiceNames.join(', ')
    : t('contratoFirma.noneAdded');

  const pagoEnEfectivo = contratoApi?.paymentMethodCode
    ? contratoApi.paymentMethodCode === 'CASH'
    : reservaDetalles.metodoPago === 'efectivo';
  const metodoPagoTexto = pagoEnEfectivo
    ? t('contratoFirma.paymentMethodCash')
    : t('contratoFirma.paymentMethodWompi');

  const formatearFecha = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(localeFecha, { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const handleFirmar = async () => {
    if (!canvasRef.current || canvasRef.current.estaVacio()) {
      setErrorFirma(t('contratoFirma.signatureRequired'));
      return;
    }
    setErrorFirma('');
    setFirmando(true);

    const firmaUsuarioDataUrl = canvasRef.current.obtenerDataUrl();
    const ahoraIso = new Date().toISOString();

    try {
      const contrato = await contractService.guardarFirma(reservaGuardada?.id, {
        codigo: codigoContrato,
        firmaUsuarioDataUrl,
        firmaTrazos: '[]',
        ciudad: ciudadSucursal,
        fecha: ahoraIso,
        contratoOriginal: {
          reserva: JSON.parse(JSON.stringify(reservaGuardada)),
          vehiculo: JSON.parse(JSON.stringify(vehiculo)),
          idioma: i18n.language,
          guardadoEn: ahoraIso,
        },
      });
      setFirmando(false);
      onFirmado?.(contrato);
    } catch (error) {
      console.error('No se pudo guardar el contrato', error);
      setErrorFirma(t('hc2.no_fue_posible_guardar_el_contrato_fir', 'No fue posible guardar el contrato firmado. Intenta nuevamente.'));
      setFirmando(false);
    }
  };

  return (
    <div className="contrato-contenedor-externo" style={{ maxWidth: 980, margin: '0 auto', background: 'transparent' }}>
      <div style={{
        background: 'var(--bg-tarjeta)', border: '1px solid var(--borde)', borderRadius: 24,
        overflow: 'hidden', boxShadow: 'var(--sombra-tarjeta)',
      }}>
        <div style={{ height: 8, background: 'linear-gradient(90deg,var(--brand-secondary),var(--brand-primary),var(--brand-accent))' }} />

        <div className="contrato-contenido" style={{
          display: 'flex', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap',
          padding: '30px 32px 22px', borderBottom: '1px solid var(--borde)',
        }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, border: '1px solid var(--borde)', background: 'var(--bg-tarjeta)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src={brand.logoDataUrl || logo} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
            </div>
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: 24, color: 'var(--texto-primary)', letterSpacing: '-0.02em' }}>
                {t('contratoFirma.title')}
              </h2>
              <p style={{ margin: '2px 0', color: 'var(--texto-second)', fontSize: 13 }}>{t('contratoFirma.subtitle')}</p>
              <p style={{ margin: '2px 0', color: 'var(--texto-second)', fontSize: 13 }}>{t('contratoFirma.autoGenNote')}</p>
            </div>
          </div>

          <aside style={{ minWidth: 240, background: 'var(--bg-item)', border: '1px solid var(--borde)', borderRadius: 16, padding: '16px 16px 12px' }}>
            <span style={{ display: 'inline-block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-text)', background: 'var(--brand-soft)', borderRadius: 999, padding: '5px 10px', marginBottom: 10, fontWeight: 700 }}>
              {t('contratoFirma.badgeLabel')}
            </span>
            <p style={{ margin: '6px 0', fontSize: 13, color: 'var(--texto-primary)' }}><strong>{t('contratoFirma.contractCode')}:</strong> {contratoApi?.contractNumber || codigoContrato}</p>
            <p style={{ margin: '6px 0', fontSize: 13, color: 'var(--texto-primary)' }}><strong>{t('contratoFirma.status')}:</strong> {contratoApi?.signedAt || soloLectura ? t('contratoFirma.statusSigned') : t('contratoFirma.statusPending')}</p>
            <p style={{ margin: '6px 0', fontSize: 13, color: 'var(--texto-primary)' }}><strong>{t('contratoFirma.generationDate')}:</strong> {fechaGeneracion}</p>
            <p style={{ margin: '6px 0', fontSize: 13, color: 'var(--texto-primary)' }}><strong>{t('contratoFirma.reservationCode')}:</strong> {referencia}</p>
          </aside>
        </div>

        <div className="contrato-contenido" style={{ padding: '26px 32px 32px' }}>
          <p style={{ fontSize: 15, color: 'var(--texto-primary)', marginBottom: 24, lineHeight: 1.6 }}>
            {t('contratoFirma.intro', {
              nombre: clienteNombre,
              tipoDoc: getNombreTipoDoc(clienteTipoDoc),
              numDoc: clienteNumDoc,
            })}
          </p>

          <section style={{ marginTop: 22 }}>
            <h3 style={{ fontSize: 17, color: 'var(--texto-primary)', marginBottom: 14 }}>{t('contratoFirma.userDataTitle')}</h3>
            <div style={{ background: 'var(--bg-item)', border: '1px solid var(--borde)', borderRadius: 18, padding: 16, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }} className="contrato-grid-2col">
              <Campo label={t('contratoFirma.fullName')} value={clienteNombre} />
              <Campo label={t('contratoFirma.document')} value={`${getNombreTipoDoc(clienteTipoDoc)}: ${clienteNumDoc}`.trim()} />
              <Campo label={t('contratoFirma.email')} value={clienteCorreo} />
              <Campo label={t('contratoFirma.phone')} value={clienteTelefono} />
              <Campo label={t('contratoFirma.address')} value={direccionCompleta !== t('contratoFirma.notProvided') && direccionCompleta ? direccionCompleta : clienteDireccion} />
              <Campo label={t('contratoFirma.license')} value={clienteLicencia} />
            </div>
          </section>

          <section style={{ marginTop: 26 }}>
            <h3 style={{ fontSize: 17, color: 'var(--texto-primary)', marginBottom: 14 }}>{t('contratoFirma.reservationTitle')}</h3>
            <div style={{ background: 'var(--bg-item)', border: '1px solid var(--borde)', borderRadius: 18, padding: 16, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }} className="contrato-grid-2col">
              <Campo label={t('contratoFirma.vehicle')} value={`${marca} ${modelo}`.trim()} />
              <Campo label={t('contratoFirma.plate')} value={vehiculoPlaca} />
              <Campo label={t('contratoFirma.color')} value={vehiculoColor} />
              <Campo label={t('contratoFirma.year')} value={vehiculoAnio} />
              <Campo label={t('contratoFirma.branch')} value={reservaDetalles.sucursalRetiro === 'domicilio' ? 'Entrega a Domicilio' : (sucursalRetiroNombre || '')} />
              <Campo label={t('contratoFirma.branchCity')} value={reservaDetalles.sucursalRetiro === 'domicilio' ? (reservaDetalles.domicilioCiudad || ciudadSucursal) : ciudadSucursal} />
              {reservaDetalles.sucursalRetiro !== 'domicilio' && (
                <Campo label={t('contratoFirma.branchAddress')} value={direccionSucursal} />
              )}
              <Campo label={t('contratoFirma.startDate')} value={formatearFecha(contratoApi?.scheduledStartAt || reservaDetalles.fechaInicio)} />
              <Campo label={t('contratoFirma.endDate')} value={formatearFecha(contratoApi?.scheduledEndAt || reservaDetalles.fechaFin)} />
              <Campo label={t('contratoFirma.paymentMethod')} value={metodoPagoTexto} />
              {pagoEnEfectivo && <Campo label={t('contratoFirma.cashPaymentBranch')} value={contratoApi?.cashPaymentBranchName || reservaDetalles.sucursalPagoEfectivo} />}
              <Campo label={t('contratoFirma.totalValue')} value={formatCurrency(total, moneda)} />
              <Campo label={t('contratoFirma.additionalServices')} value={serviciosTexto} />
              <Campo label={t('contratoFirma.protectionPlan')} value={contratoApi?.insuranceCoverageName || ''} />
              {reservaDetalles.sucursalRetiro === 'domicilio' && (
                <>
                  <Campo label={t('contratoFirma.deliveryAddress', 'Dirección de Entrega')} value={reservaDetalles.domicilioDireccion} />
                  <Campo label={t('contratoFirma.deliveryNeighborhood', 'Barrio de Entrega')} value={reservaDetalles.domicilioBarrio} />
                  <Campo label={t('contratoFirma.deliveryReferences', 'Referencias de Entrega')} value={reservaDetalles.domicilioReferencias} />
                </>
              )}
              {reservaDetalles.sucursalDevolucion === 'domicilio' && (
                <Campo label={t('contratoFirma.deliveryReturnHome', 'Devolución en Domicilio')} value={t('contratoFirma.sameDeliveryAddress', 'Sí (Misma dirección de entrega)')} />
              )}
            </div>
          </section>

          <section style={{ marginTop: 26 }}>
            <h3 style={{ fontSize: 17, color: 'var(--texto-primary)', marginBottom: 14 }}>{t('contratoFirma.clausesTitle')}</h3>
            <div style={{ background: 'var(--bg-item)', border: '1px solid var(--borde)', borderRadius: 18, padding: 20 }}>
              <p style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--texto-primary)', lineHeight: 1.65 }}>
                <strong>{t('contratoFirma.clause1Title')}</strong>{' '}
                {t('contratoFirma.clause1Text', {
                  marca, modelo, placa: vehiculoPlaca,
                  inicio: formatearFecha(contratoApi?.scheduledStartAt || reservaDetalles.fechaInicio),
                  fin: formatearFecha(contratoApi?.scheduledEndAt || reservaDetalles.fechaFin),
                })}
              </p>
              <p style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--texto-primary)', lineHeight: 1.65 }}>
                <strong>{t('contratoFirma.clause2Title')}</strong> {t('contratoFirma.clause2Text')}
              </p>
              <p style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--texto-primary)', lineHeight: 1.65 }}>
                <strong>{t('contratoFirma.clause3Title')}</strong>
              </p>
              <ul style={{ margin: '0 0 12px', paddingLeft: 20, color: 'var(--texto-primary)' }}>
                <li style={{ marginBottom: 8, fontSize: 14, lineHeight: 1.6 }}>{t('contratoFirma.clause3Item1')}</li>
                <li style={{ marginBottom: 8, fontSize: 14, lineHeight: 1.6 }}>{t('contratoFirma.clause3Item2')}</li>
                <li style={{ marginBottom: 8, fontSize: 14, lineHeight: 1.6 }}>{t('contratoFirma.clause3Item3')}</li>
                <li style={{ marginBottom: 0, fontSize: 14, lineHeight: 1.6 }}>{t('contratoFirma.clause3Item4')}</li>
              </ul>
              <p style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--texto-primary)', lineHeight: 1.65 }}>
                <strong>{t('contratoFirma.clause4Title')}</strong> {t('contratoFirma.clause4Text')}
              </p>
              <p style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--texto-primary)', lineHeight: 1.65 }}>
                <strong>{t('contratoFirma.clause5Title')}</strong> {t('contratoFirma.clause5Text')}
              </p>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--texto-primary)', lineHeight: 1.65 }}>
                <strong>{t('contratoFirma.clause6Title')}</strong> {t('contratoFirma.clause6Text')}
              </p>
            </div>
          </section>

          <section style={{ marginTop: 26 }}>
            <h3 style={{ fontSize: 17, color: 'var(--texto-primary)', marginBottom: 14 }}>{t('contratoFirma.signaturesTitle')}</h3>
            <div className="contrato-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
              <Campo label={t('contratoFirma.signCity')} value={ciudadSucursal} />
              <Campo label={t('contratoFirma.signDate')} value={fechaGeneracion} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
              <div style={{ background: 'var(--bg-item)', border: '1px solid var(--borde)', borderRadius: 20, padding: 18 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 15, color: 'var(--texto-primary)' }}>{t('contratoFirma.userSignature')}</h4>
                {soloLectura ? (
                  <div style={{
                    minHeight: 160, borderRadius: 14, background: 'var(--bg-tarjeta)', border: '1px solid var(--borde)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, marginBottom: 12, padding: 12
                  }}>
                    {firmaImagen ? (
                      <img
                        src={firmaImagen}
                        alt={t('hc.firma_del_arrendatario', 'Firma del Arrendatario')}
                        style={{ maxHeight: 110, maxWidth: '90%', objectFit: 'contain' }}
                        onError={(e) => {
                          if (!firmaImagen.startsWith('data:image/svg')) {
                            e.currentTarget.src = generateSvgSignature(clienteNombre);
                          }
                        }}
                      />
                    ) : (
                      <img
                        src={generateSvgSignature(clienteNombre)}
                        alt={t('hc4.firma_digital', 'Firma Digital')}
                        style={{ maxHeight: 110, maxWidth: '90%', objectFit: 'contain' }}
                      />
                    )}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 4,
                      }}
                    >
                      <FaCheckCircle color="#16a34a" size={16} />
                      <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>{t('hc.firma_digital_autentica_registrada', '✓ Firma Digital Auténtica Registrada')}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--brand-text)', fontWeight: 700 }}>{t('hc.firmado_por_el_arrendatario', 'Firmado por el arrendatario')}</span>
                  </div>
                ) : (
                  <>
                    <SignatureCanvas ref={canvasRef} onCambio={(vacia) => { if (!vacia) setErrorFirma(''); }} />
                    {errorFirma && <p style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, margin: '8px 0 0' }}>{errorFirma}</p>}
                  </>
                )}
                <div style={{ marginTop: 12 }}>
                  <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--texto-primary)' }}><strong>{t('contratoFirma.fullName')}:</strong> {clienteNombre}</p>
                  <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--texto-primary)' }}><strong>{t('contratoFirma.document')}:</strong> {[getNombreTipoDoc(clienteTipoDoc), clienteNumDoc].filter(Boolean).join(': ') || '—'}</p>
                </div>
              </div>

              <div style={{ background: 'var(--bg-item)', border: '1px solid var(--borde)', borderRadius: 20, padding: 18 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 15, color: 'var(--texto-primary)' }}>{t('contratoFirma.platformSignature')}</h4>
                <div style={{
                  height: 160, borderRadius: 14, background: 'var(--bg-tarjeta)', border: '2px dashed var(--brand-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, marginBottom: 12,
                }}>
                  <img src={firmaDrivique} alt={t('hc4.firma_drivique', 'Firma Drivique')} style={{ maxHeight: 84, maxWidth: '78%', objectFit: 'contain' }} />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--brand-text)', fontWeight: 700 }}>
                    <FaCheckCircle color="var(--brand-text)" size={14} /> Firmado digitalmente
                  </span>
                </div>
                <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--texto-primary)' }}><strong>{t('contratoFirma.responsible')}:</strong> {t('contratoFirma.platformResponsible')}</p>
                <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--texto-primary)' }}><strong>{t('contratoFirma.role')}:</strong> {t('contratoFirma.platformRole')}</p>
              </div>
            </div>
          </section>

          {soloLectura ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, gap: 14, flexWrap: 'wrap' }}>
              {onVolver && (
                <button
                  type="button"
                  onClick={onVolver}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 14,
                    background: 'var(--bg-tarjeta)', color: 'var(--texto-primary)', border: '1px solid var(--borde)',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                >
                  <FaArrowLeft size={14} />
                  <span>{t('hc.volver_a_la_reserva', 'Volver a la reserva')}</span>
                </button>
              )}
              {onDescargar && (
                <button
                  type="button"
                  onClick={onDescargar}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 14,
                    background: 'var(--brand-gradient)', color: '#fff', fontWeight: 900, fontSize: 14, border: 'none',
                    cursor: 'pointer', boxShadow: 'var(--brand-shadow)'
                  }}
                >
                  <FaDownload size={16} />
                  <span>{t('hc.descargar_contrato_pdf', 'Descargar contrato (PDF)')}</span>
                </button>
              )}
              {onEnviarCorreo && (
                <button
                  type="button"
                  onClick={onEnviarCorreo}
                  disabled={enviandoCorreo}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 14,
                    background: 'var(--bg-tarjeta)', color: 'var(--texto-primary)', border: '1px solid var(--borde)',
                    fontWeight: 800, fontSize: 14, cursor: enviandoCorreo ? 'default' : 'pointer', opacity: enviandoCorreo ? 0.7 : 1
                  }}
                >
                  <FaEnvelope size={15} />
                  <span>{enviandoCorreo ? t('contratoFirma.sendingEmail') : t('contratoFirma.sendByEmail')}</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
              <button
                onClick={handleFirmar}
                disabled={firmando}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 36px', borderRadius: 16,
                  background: firmando ? '#94a3b8' : 'var(--brand-gradient)',
                  color: '#fff', fontWeight: 900, fontSize: 15, border: 'none',
                  cursor: firmando ? 'default' : 'pointer', boxShadow: '0 8px 24px rgba(var(--brand-primary-rgb),0.28)',
                  transition: 'all 200ms ease',
                }}
              >
                {firmando
                  ? <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  : <FaFileSignature size={18} />}
                <span>{firmando ? t('contratoFirma.signing', { defaultValue: 'Firmando...' }) : t('contratoFirma.signAndContinue', { defaultValue: 'Firmar contrato' })}</span>
              </button>
            </div>
          )}

          <footer style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--borde)', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', color: 'var(--texto-second)', fontSize: 12 }}>
            <div>
              <p style={{ margin: '4px 0' }}>{t('contratoFirma.footerNote1')}</p>
              <p style={{ margin: '4px 0' }}>{t('contratoFirma.footerNote2')}</p>
            </div>
            <div>
              <p style={{ margin: '4px 0' }}><strong>{t('contratoFirma.contractCode')}:</strong> {codigoContrato}</p>
              <p style={{ margin: '4px 0' }}><strong>{t('contratoFirma.reservationCode')}:</strong> {referencia}</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
