import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaFileSignature, FaCheckCircle } from 'react-icons/fa';
import logo from '@/assets/logo.png';
import firmaDrivique from '@/assets/firma-drivique.png';
import { useLanding } from '../../landing/LandingContext';
import { formatCurrency } from '@/utils/monedaUtils';
import { contratoService } from '@/services/contratoService';
import SUCURSALES_MOCK from '@/mocks/sucursales.json';
import FirmaCanvas from './FirmaCanvas';

const LOCALES_FECHA = { es: 'es-CO', en: 'en-US', fr: 'fr-FR', pt: 'pt-PT', br: 'pt-BR' };

/** "Toyota Corolla 2024" -> { marca: "Toyota", modelo: "Corolla 2024" } */
function separarMarcaModelo(nombre = '') {
  const partes = nombre.trim().split(' ');
  return { marca: partes[0] || '', modelo: partes.slice(1).join(' ') || '' };
}

function ciudadDeSucursal(nombreSucursal) {
  const encontrada = SUCURSALES_MOCK.find((s) => s.nombre === nombreSucursal);
  return encontrada?.ciudad || '';
}

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

export default function FirmaContrato({ vehiculo, reservaGuardada, onFirmado }) {
  const { t, i18n } = useTranslation();
  const { moneda } = useLanding();
  const canvasRef = useRef(null);
  const [firmaVacia, setFirmaVacia] = useState(true);
  const [errorFirma, setErrorFirma] = useState('');
  const [firmando, setFirmando] = useState(false);

  const { datosForm = {}, reservaDetalles = {}, total = 0, referencia, seguroIdx, serviciosSeleccionados = [] } = reservaGuardada || {};

  const direccionCompleta = reservaDetalles.sucursalRetiro === 'domicilio'
    ? `${reservaDetalles.domicilioDireccion || ''}, ${reservaDetalles.domicilioBarrio || ''}, ${reservaDetalles.domicilioCiudad || ''} (Ref: ${reservaDetalles.domicilioReferencias || ''})`
    : t('contratoFirma.notProvided');

  const codigoContrato = useMemo(() => contratoService.obtenerOCrearCodigo(referencia), [referencia]);
  const localeFecha = LOCALES_FECHA[i18n.language] || 'es-CO';
  const { marca, modelo } = separarMarcaModelo(vehiculo?.nombre);
  const ciudadSucursal = ciudadDeSucursal(
    reservaDetalles.sucursalRetiro === 'domicilio'
      ? vehiculo?.sucursal
      : reservaDetalles.sucursalRetiro
  );
  const fechaGeneracion = new Date().toLocaleDateString(localeFecha, { day: '2-digit', month: 'long', year: 'numeric' });

  const serviciosTexto = useMemo(() => {
    const nombres = (vehiculo?.servicios || [])
      .filter((s) => serviciosSeleccionados.includes(s.nombre))
      .map((s) => s.nombre);
    return nombres.length ? nombres.join(', ') : t('contratoFirma.noneAdded');
  }, [vehiculo, serviciosSeleccionados, t]);

  const metodoPagoTexto = reservaDetalles.metodoPago === 'efectivo'
    ? t('contratoFirma.paymentMethodCash')
    : t('contratoFirma.paymentMethodWompi');

  const formatearFecha = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(localeFecha, { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const handleFirmar = () => {
    if (!canvasRef.current || canvasRef.current.estaVacio()) {
      setErrorFirma(t('contratoFirma.signatureRequired'));
      return;
    }
    setErrorFirma('');
    setFirmando(true);

    const firmaUsuarioDataUrl = canvasRef.current.obtenerDataUrl();
    const ahoraIso = new Date().toISOString();

    // Simula una pequeña latencia de guardado, consistente con el resto del
    // flujo (subida de documentos, etc.), mientras no exista backend real.
    setTimeout(() => {
      const contrato = contratoService.guardarFirma(referencia, {
        codigo: codigoContrato,
        firmaUsuarioDataUrl,
        ciudad: ciudadSucursal,
        fecha: ahoraIso,
      });
      setFirmando(false);
      onFirmado?.(contrato);
    }, 600);
  };

  return (
    <div className="contrato-contenedor-externo" style={{ maxWidth: 980, margin: '0 auto' }}>
      <div style={{
        background: 'var(--bg-tarjeta)', border: '1px solid var(--borde)', borderRadius: 24,
        overflow: 'hidden', boxShadow: 'var(--sombra-tarjeta)',
      }}>
        <div style={{ height: 8, background: 'linear-gradient(90deg,#1e3a8a,#2563eb,#93c5fd)' }} />

        <div className="contrato-contenido" style={{
          display: 'flex', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap',
          padding: '30px 32px 22px', borderBottom: '1px solid var(--borde)',
        }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, border: '1px solid var(--borde)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src={logo} alt="Drivique" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
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
            <span style={{ display: 'inline-block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1e3a8a', background: '#dbeafe', borderRadius: 999, padding: '5px 10px', marginBottom: 10, fontWeight: 700 }}>
              {t('contratoFirma.badgeLabel')}
            </span>
            <p style={{ margin: '6px 0', fontSize: 13, color: 'var(--texto-primary)' }}><strong>{t('contratoFirma.contractCode')}:</strong> {codigoContrato}</p>
            <p style={{ margin: '6px 0', fontSize: 13, color: 'var(--texto-primary)' }}><strong>{t('contratoFirma.status')}:</strong> {t('contratoFirma.statusPending')}</p>
            <p style={{ margin: '6px 0', fontSize: 13, color: 'var(--texto-primary)' }}><strong>{t('contratoFirma.generationDate')}:</strong> {fechaGeneracion}</p>
            <p style={{ margin: '6px 0', fontSize: 13, color: 'var(--texto-primary)' }}><strong>{t('contratoFirma.reservationCode')}:</strong> {referencia}</p>
          </aside>
        </div>

        <div className="contrato-contenido" style={{ padding: '26px 32px 32px' }}>
          <p style={{ fontSize: 15, color: 'var(--texto-primary)', marginBottom: 24, lineHeight: 1.6 }}>
            {t('contratoFirma.intro', {
              nombre: datosForm.nombre,
              tipoDoc: datosForm.tipoDoc,
              numDoc: datosForm.numDoc,
            })}
          </p>

          <section style={{ marginTop: 22 }}>
            <h3 style={{ fontSize: 17, color: 'var(--texto-primary)', marginBottom: 14 }}>{t('contratoFirma.userDataTitle')}</h3>
            <div style={{ background: 'var(--bg-item)', border: '1px solid var(--borde)', borderRadius: 18, padding: 16, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }} className="contrato-grid-2col">
              <Campo label={t('contratoFirma.fullName')} value={datosForm.nombre} />
              <Campo label={t('contratoFirma.document')} value={`${datosForm.tipoDoc || ''} ${datosForm.numDoc || ''}`.trim()} />
              <Campo label={t('contratoFirma.email')} value={datosForm.correo} />
              <Campo label={t('contratoFirma.phone')} value={datosForm.celular} />
              <Campo label={t('contratoFirma.address')} value={direccionCompleta} />
              <Campo label={t('contratoFirma.license')} value={datosForm.licenciaPdf?.name || t('contratoFirma.notProvided')} />
            </div>
          </section>

          <section style={{ marginTop: 26 }}>
            <h3 style={{ fontSize: 17, color: 'var(--texto-primary)', marginBottom: 14 }}>{t('contratoFirma.reservationTitle')}</h3>
            <div style={{ background: 'var(--bg-item)', border: '1px solid var(--borde)', borderRadius: 18, padding: 16, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }} className="contrato-grid-2col">
              <Campo label={t('contratoFirma.vehicle')} value={`${marca} ${modelo}`.trim()} />
              <Campo label={t('contratoFirma.plate')} value={vehiculo?.placa} />
              <Campo label={t('contratoFirma.color')} value={vehiculo?.color} />
              <Campo label={t('contratoFirma.year')} value={vehiculo?.año} />
              <Campo label={t('contratoFirma.branch')} value={reservaDetalles.sucursalRetiro === 'domicilio' ? 'Entrega a Domicilio' : reservaDetalles.sucursalRetiro} />
              <Campo label={t('contratoFirma.branchCity')} value={reservaDetalles.sucursalRetiro === 'domicilio' ? (reservaDetalles.domicilioCiudad || ciudadSucursal) : ciudadSucursal} />
              <Campo label={t('contratoFirma.startDate')} value={formatearFecha(reservaDetalles.fechaInicio)} />
              <Campo label={t('contratoFirma.endDate')} value={formatearFecha(reservaDetalles.fechaFin)} />
              <Campo label={t('contratoFirma.paymentMethod')} value={metodoPagoTexto} />
              <Campo label={t('contratoFirma.totalValue')} value={formatCurrency(total, moneda)} />
              <Campo label={t('contratoFirma.additionalServices')} value={serviciosTexto} />
              <Campo label={t('contratoFirma.protectionPlan')} value={seguroIdx != null ? vehiculo?.seguros?.[seguroIdx]?.nombre : '—'} />
              {reservaDetalles.sucursalRetiro === 'domicilio' && (
                <>
                  <Campo label="Dirección de Entrega" value={reservaDetalles.domicilioDireccion} />
                  <Campo label="Barrio de Entrega" value={reservaDetalles.domicilioBarrio} />
                  <Campo label="Referencias de Entrega" value={reservaDetalles.domicilioReferencias} />
                </>
              )}
              {reservaDetalles.sucursalDevolucion === 'domicilio' && (
                <Campo label="Devolución en Domicilio" value="Sí (Misma dirección de entrega)" />
              )}
            </div>
          </section>

          <section style={{ marginTop: 26 }}>
            <h3 style={{ fontSize: 17, color: 'var(--texto-primary)', marginBottom: 14 }}>{t('contratoFirma.clausesTitle')}</h3>
            <div style={{ background: 'var(--bg-item)', border: '1px solid var(--borde)', borderRadius: 18, padding: 20 }}>
              <p style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--texto-primary)', lineHeight: 1.65 }}>
                <strong>{t('contratoFirma.clause1Title')}</strong>{' '}
                {t('contratoFirma.clause1Text', {
                  marca, modelo, placa: vehiculo?.placa,
                  inicio: formatearFecha(reservaDetalles.fechaInicio),
                  fin: formatearFecha(reservaDetalles.fechaFin),
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
                <FirmaCanvas ref={canvasRef} onCambio={(vacia) => { setFirmaVacia(vacia); if (!vacia) setErrorFirma(''); }} />
                {errorFirma && <p style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, margin: '8px 0 0' }}>{errorFirma}</p>}
                <div style={{ marginTop: 12 }}>
                  <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--texto-primary)' }}><strong>{t('contratoFirma.fullName')}:</strong> {datosForm.nombre}</p>
                  <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--texto-primary)' }}><strong>{t('contratoFirma.document')}:</strong> {`${datosForm.tipoDoc || ''} ${datosForm.numDoc || ''}`.trim()}</p>
                </div>
              </div>

              <div style={{ background: 'var(--bg-item)', border: '1px solid var(--borde)', borderRadius: 20, padding: 18 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 15, color: 'var(--texto-primary)' }}>{t('contratoFirma.platformSignature')}</h4>
                <div style={{
                  height: 160, borderRadius: 14, background: '#fff', border: '2px dashed #93c5fd',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, marginBottom: 12,
                }}>
                  <img src={firmaDrivique} alt="Firma Drivique" style={{ maxHeight: 84, maxWidth: '78%', objectFit: 'contain' }} />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#1e3a8a', fontWeight: 700 }}>
                    <FaCheckCircle color="#1e3a8a" size={14} /> Firmado digitalmente
                  </span>
                </div>
                <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--texto-primary)' }}><strong>{t('contratoFirma.responsible')}:</strong> {t('contratoFirma.platformResponsible')}</p>
                <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--texto-primary)' }}><strong>{t('contratoFirma.role')}:</strong> {t('contratoFirma.platformRole')}</p>
              </div>
            </div>
          </section>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
            <button
              onClick={handleFirmar}
              disabled={firmando}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 36px', borderRadius: 16,
                background: firmando ? '#94a3b8' : 'linear-gradient(90deg,#1e3a8a,#2563eb)',
                color: '#fff', fontWeight: 900, fontSize: 15, border: 'none',
                cursor: firmando ? 'default' : 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.28)',
                transition: 'all 200ms ease',
              }}
            >
              {firmando
                ? <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                : <FaFileSignature size={18} />}
              <span>{firmando ? t('contratoFirma.signing') : t('contratoFirma.signAndContinue')}</span>
            </button>
          </div>

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
