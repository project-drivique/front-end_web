import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanding } from '../../../landing/LandingContext';
import { formatCurrency } from '@/utils/monedaUtils';
import { RECARGOS_LOGISTICOS } from '../../constants';


const DocumentUploader = ({ label, helpText, error, file, loading, onUpload, onClear, required = true }) => {
  return (
    <div style={{
      border: `2px dashed ${error ? '#fca5a5' : 'var(--borde)'}`,
      borderRadius: 16,
      padding: '24px 20px',
      textAlign: 'center',
      background: error ? '#fef2f2' : 'var(--bg-item)',
      transition: 'all 200ms ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--texto-primary)' }}>{label}{required ? ' *' : ''}</span>
        <span style={{ fontSize: 11, color: 'var(--texto-second)', maxWidth: '240px', lineHeight: 1.4 }}>{helpText}</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#2563eb', fontWeight: 700 }}>
          <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Subiendo archivo...</span>
        </div>
      ) : file ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          padding: '10px 16px',
          borderRadius: 12,
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <svg width="24" height="24" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file.name}
            </div>
            <div style={{ fontSize: 11, color: '#15803d' }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#dc2626',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      ) : (
        <label style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 24px',
          background: '#fff',
          border: '2px solid var(--borde)',
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 700,
          color: '#1e3a8a',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          transition: 'all 150ms ease'
        }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <span>Subir PDF</span>
          <input
            type="file"
            accept=".pdf"
            onChange={onUpload}
            style={{ display: 'none' }}
          />
        </label>
      )}

      {error && (
        <p style={{ color: '#ef4444', fontSize: 12, margin: '6px 0 0', fontWeight: 600 }}>{error}</p>
      )}
    </div>
  )
}

export default function DatosPersonales({ vehiculo, reserva, seguroIdx, serviciosSeleccionados = [], datosForm, onCambio, onReservar, errores, docsVerificados }) {
  const { t } = useTranslation()
  const { moneda } = useLanding();
  const [verTyC, setVerTyC] = useState(false);

  const [cedulaError, setCedulaError] = useState('');
  const [licenciaError, setLicenciaError] = useState('');
  const [cedulaCargando, setCedulaCargando] = useState(false);
  const [licenciaCargando, setLicenciaCargando] = useState(false);

  const handleUpload = (tipo, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      if (tipo === 'cedula') {
        setCedulaError('El archivo debe ser en formato PDF.');
      } else {
        setLicenciaError('El archivo debe ser en formato PDF.');
      }
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      if (tipo === 'cedula') {
        setCedulaError('El archivo supera el peso máximo de 5MB.');
      } else {
        setLicenciaError('El archivo supera el peso máximo de 5MB.');
      }
      return;
    }

    if (tipo === 'cedula') {
      setCedulaError('');
      setCedulaCargando(true);
      setTimeout(() => {
        onCambio('cedulaPdf', file);
        setCedulaCargando(false);
      }, 800);
    } else {
      setLicenciaError('');
      setLicenciaCargando(true);
      setTimeout(() => {
        onCambio('licenciaPdf', file);
        setLicenciaCargando(false);
      }, 800);
    }
  };


  const tarifas = vehiculo.tarifas || {};
  const kmLimit = tarifas.kmLimitado || { precio: 0, km: 0 };
  const kmIlimit = tarifas.kmIlimitado || { precio: 0 };
  const precio = reserva.tipoKm === 'ilimitado' ? kmIlimit.precio : kmLimit.precio;


  const dias = reserva.fechaInicio && reserva.fechaFin
    ? Math.max(1, Math.ceil((new Date(reserva.fechaFin) - new Date(reserva.fechaInicio)) / 86400000))
    : 1;


  const precioSeg = seguroIdx !== null ? (vehiculo.seguros[seguroIdx]?.precio ?? 0) : 0;
  const precioServicios = (vehiculo.servicios || [])
    .filter(s => serviciosSeleccionados.includes(s.nombre))
    .reduce((suma, s) => suma + s.precio, 0);

  const subtotal = precio * dias;
  const subtotalSeg = precioSeg * dias;
  const subtotalServicios = precioServicios * dias;
  const cargos = Math.round((subtotal + subtotalSeg + subtotalServicios) * 0.10);
  
  const recargoRetiro = RECARGOS_LOGISTICOS[reserva.sucursalRetiro] || 0;
  const recargoDevolucion = RECARGOS_LOGISTICOS[reserva.sucursalDevolucion] || 0;
  const recargoLogistico = recargoRetiro + recargoDevolucion;
  
  const total = subtotal + subtotalSeg + subtotalServicios + cargos + recargoLogistico;


  const inp = (err) => ({
    width: '100%', padding: '14px', borderRadius: 12, boxSizing: 'border-box',
    border: `2px solid ${err ? '#fca5a5' : 'var(--borde)'}`,
    background: err ? '#fef2f2' : 'var(--bg-item)',
    fontSize: 14, color: 'var(--texto-primary)', outline: 'none',
    transition: 'border-color 200ms ease'
  });


  const lbl = { display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--texto-primary)', marginBottom: 6, letterSpacing: '0.04em' };


  return (
    <div>
      <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--texto-primary)', margin: '0 0 6px' }}>{t('vehiculo.personalData')}</h3>
      <p style={{ fontSize: 14, color: 'var(--texto-second)', margin: '0 0 8px' }}>{t('vehiculo.personalDataSubtitle')}</p>
      <p style={{ fontSize: 12, color: '#ef4444', fontStyle: 'italic', margin: '0 0 24px' }}>{t('vehiculo.requiredFields')}</p>


      <div style={{ background: 'var(--bg-tarjeta)', borderRadius: 24, border: '1px solid var(--borde)', padding: '28px', marginBottom: 20, boxShadow: 'var(--sombra-tarjeta)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>
          <div>
            <label style={lbl}>{t('vehiculo.name')} *</label>
            <input value={datosForm.nombre} onChange={e => onCambio('nombre', e.target.value)} placeholder="Ej: Juan Pérez García" style={inp(errores.nombre)} />
            {errores.nombre && <p style={{ color: '#ef4444', fontSize: 11, margin: '6px 0 0', fontWeight: 600 }}>{errores.nombre}</p>}
          </div>
          <div>
            <label style={lbl}>{t('vehiculo.nationality')} *</label>
            <select value={datosForm.nacionalidad} onChange={e => onCambio('nacionalidad', e.target.value)} style={{ ...inp(false), cursor: 'pointer' }}>
              <option value="Colombia">Colombia</option>
              <option value="Estados Unidos">Estados Unidos</option>
              <option value="Alemania">Alemania</option>
              <option value="Francia">Francia</option>
              <option value="España">España</option>
              <option value="Italia">Italia</option>
              <option value="Reino Unido">Reino Unido</option>
              <option value="Canadá">Canadá</option>
              <option value="Brasil">Brasil</option>
              <option value="Argentina">Argentina</option>
              <option value="México">México</option>
              <option value="Venezuela">Venezuela</option>
              <option value="Ecuador">Ecuador</option>
              <option value="Perú">Perú</option>
              <option value="Chile">Chile</option>
              <option value="Australia">Australia</option>
              <option value="Japón">Japón</option>
              <option value="China">China</option>
              <option value="India">India</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label style={lbl}>{t('vehiculo.email')} *</label>
            <input type="email" value={datosForm.correo} onChange={e => onCambio('correo', e.target.value)} placeholder="ejemplo@correo.com" style={inp(errores.correo)} />
            {errores.correo && <p style={{ color: '#ef4444', fontSize: 11, margin: '6px 0 0', fontWeight: 600 }}>{errores.correo}</p>}
          </div>
          <div>
            <label style={lbl}>{t('vehiculo.phoneNumber')} *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ background: 'var(--bg-item)', border: '2px solid var(--borde)', borderRadius: 12, padding: '14px', fontSize: 14, color: 'var(--texto-second)', fontWeight: 800, whiteSpace: 'nowrap' }}>+57</div>
              <input type="tel" value={datosForm.celular} onChange={e => onCambio('celular', e.target.value.replace(/\D/g, ''))} placeholder="3001234567" style={{ ...inp(errores.celular), flex: 1 }} />
            </div>
            {errores.celular && <p style={{ color: '#ef4444', fontSize: 11, margin: '6px 0 0', fontWeight: 600 }}>{errores.celular}</p>}
          </div>
          <div>
            <label style={lbl}>{t('vehiculo.docType')} *</label>
            <select value={datosForm.tipoDoc} onChange={e => onCambio('tipoDoc', e.target.value)} style={{ ...inp(false), cursor: 'pointer' }}>
              <option value="CC">Cédula de Ciudadanía (CC)</option>
              <option value="CE">Cédula de Extranjería (CE)</option>
              <option value="PA">Pasaporte (PA)</option>
            </select>
          </div>
          <div>
            <label style={lbl}>{t('vehiculo.docNumber')} *</label>
            <input value={datosForm.numDoc} onChange={e => onCambio('numDoc', e.target.value)} placeholder="123456789" style={inp(errores.numDoc)} />
            {errores.numDoc && <p style={{ color: '#ef4444', fontSize: 11, margin: '6px 0 0', fontWeight: 600 }}>{errores.numDoc}</p>}
          </div>
        </div>


        <div style={{
          background: reserva.tipoKm === 'limitado' ? '#fef2f2' : '#f0fdf4',
          padding: 16,
          borderRadius: 12,
          border: `1px solid ${reserva.tipoKm === 'limitado' ? '#fecaca' : '#bbf7d0'}`,
          marginTop: 24,
        }}>
          {reserva.tipoKm === 'limitado' && (
            <p style={{ fontSize: 13, color: '#7f1d1d', margin: 0, lineHeight: 1.5 }}>
              <strong>{t('vehiculo.limitedKmPlan')}</strong>{' '}
              {t('vehiculo.daysCount') !== 'días' ? '' : ''}<strong>{kmLimit.km} km</strong> {t('catalogo.day')}.{' '}
              <strong>{t('catalogo.limitedKm')}:</strong>{' '}
              <strong>{formatCurrency(1500, moneda)} / km extra</strong>
            </p>
          )}
          {reserva.tipoKm === 'ilimitado' && (
            <p style={{ fontSize: 13, color: '#166534', margin: 0, lineHeight: 1.5 }}>
              <strong>{t('vehiculo.unlimitedKmPlan')}</strong>{' '}
              {t('vehiculo.unlimitedKmText')}
            </p>
          )}
        </div>
      </div>


      {/* Contenedor de subida de documentos */}
      <div style={{
        background: 'var(--bg-tarjeta)',
        borderRadius: 24,
        border: '1px solid var(--borde)',
        padding: '28px',
        marginBottom: 20,
        boxShadow: 'var(--sombra-tarjeta)'
      }}>
        <h4 style={{ fontSize: 16, fontWeight: 900, color: 'var(--texto-primary)', marginBottom: 6 }}>
          {docsVerificados ? 'Verificación Documental' : 'Verificación Documental Obligatoria'}
        </h4>
        <p style={{ fontSize: 13, color: 'var(--texto-second)', marginBottom: 20 }}>
          {docsVerificados
            ? 'Ya verificamos tus documentos en una reserva anterior. Si quieres, puedes reemplazarlos subiendo nuevos archivos PDF.'
            : 'Sube los siguientes documentos en formato PDF. Estos serán revisados manualmente por el personal de la sucursal para validar y entregar tu vehículo.'}
        </p>

        {docsVerificados && (
          <div style={{
            display: 'flex', gap: 10, background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 12, padding: 14, marginBottom: 20
          }}>
            <svg width="20" height="20" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
            <span style={{ fontSize: 13, color: '#166534', lineHeight: 1.5, fontWeight: 700, textAlign: 'left' }}>
              Documentos ya registrados: Ya has subido tu cédula y licencia de conducción anteriormente. No es obligatorio volver a cargarlos, pero si lo deseas puedes reemplazarlos subiendo nuevos archivos PDF.
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 12 }}>
          <DocumentUploader
            label="Cédula de Ciudadanía"
            helpText="Sube tu documento de identidad en un solo archivo PDF (ambos lados incluidos, máx 5MB)"
            error={errores.cedulaPdf || cedulaError}
            file={datosForm.cedulaPdf}
            loading={cedulaCargando}
            onUpload={(e) => handleUpload('cedula', e)}
            onClear={() => onCambio('cedulaPdf', null)}
            required={!docsVerificados}
          />

          <DocumentUploader
            label="Licencia de Conducción"
            helpText="Sube tu licencia de conducción vigente y legible en formato PDF (máx 5MB)"
            error={errores.licenciaPdf || licenciaError}
            file={datosForm.licenciaPdf}
            loading={licenciaCargando}
            onUpload={(e) => handleUpload('licencia', e)}
            onClear={() => onCambio('licenciaPdf', null)}
            required={!docsVerificados}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 14, marginTop: 16 }}>
          <svg width="20" height="20" fill="none" stroke="#1e3a8a" strokeWidth="2.5" viewBox="0 0 24 24" style={{ shrink: 0, marginTop: 2 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.083.87l-.417.834M12 18.75h.007V19h-.007v-.025zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ fontSize: 12, color: '#1e3a8a', lineHeight: 1.5, fontWeight: 600 }}>
            {t('vehiculo.documentVerificationNote')}
          </span>
        </div>
      </div>


      <div style={{ background: 'var(--bg-tarjeta)', borderRadius: 24, border: '1px solid var(--borde)', padding: '24px', marginBottom: 20, boxShadow: 'var(--sombra-tarjeta)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: errores.terminos ? 8 : 16 }}>
          <input type="checkbox" id="tyc" checked={datosForm.terminos} onChange={e => onCambio('terminos', e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer', marginTop: 2, flexShrink: 0, accentColor: '#1e3a8a' }} />
          <label htmlFor="tyc" style={{ fontSize: 14, color: 'var(--texto-primary)', cursor: 'pointer', lineHeight: 1.5 }}>
            {t('vehiculo.termsConsent')} <span style={{ color: '#1e3a8a', fontWeight: 800 }}>{t('vehiculo.privacyPolicy')}</span> *
          </label>
        </div>
        {errores.terminos && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 12px 28px', fontWeight: 600 }}>{errores.terminos}</p>}


        <button onClick={() => setVerTyC(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: 14, fontWeight: 800, padding: '0 0 0 28px', transition: 'opacity 200ms ease' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          {verTyC ? `▼ ${t('vehiculo.hideTerms')}` : `▶ ${t('vehiculo.readTerms')}`}
        </button>


        {verTyC && (
          <div style={{ marginTop: 16, borderRadius: 16, overflow: 'hidden', border: '1px solid #1e3a8a' }}>
            <div style={{ background: '#1e3a8a', padding: '16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 900, color: '#bfdbfe', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('vehiculo.importantPolicies')}</p>
                <p style={{ fontSize: 13, color: '#ffffff', margin: 0, lineHeight: 1.5 }}>
                  <strong>{t('vehiculo.noRefundPolicy')}</strong>
                </p>
              </div>
            </div>
            <div style={{ background: '#f8fafc', padding: 18 }}>
              <pre style={{ fontSize: 12, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{t('vehiculo.termsFullText')}</pre>
            </div>
          </div>
        )}
      </div>


      <div style={{ background: 'linear-gradient(135deg,#0f1a3d,#1e3a8a)', borderRadius: 24, padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap', boxShadow: '0 12px 32px rgba(30,58,138,0.25)' }}>
        <div>
          <p style={{ fontSize: 13, color: '#bfdbfe', fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('vehiculo.totalToPay')}</p>
          <p style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>{formatCurrency(total, moneda)}</p>
          <p style={{ fontSize: 11, color: '#bfdbfe', margin: '6px 0 0' }}>{t('vehiculo.taxesIncluded')}</p>
        </div>
        <button
          onClick={onReservar}
          style={{ padding: '16px 40px', borderRadius: 16, background: '#fff', color: '#1e3a8a', fontWeight: 900, fontSize: 16, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', whiteSpace: 'nowrap', transition: 'transform 200ms ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {t('vehiculo.confirmReserve')} →
        </button>
      </div>
    </div>
  );
}
