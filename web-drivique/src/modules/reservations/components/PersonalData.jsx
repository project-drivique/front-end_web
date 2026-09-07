import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanding } from '../../landing/LandingContext';
import { formatCurrency } from '@/utils/currencyUtils';
import { getNombreTipoDoc, getSiglaDoc } from '@/utils/documentUtils';
import { RECARGOS_LOGISTICOS } from '../../catalog/constants';
import { FaUser, FaIdCard, FaTimes } from 'react-icons/fa';
import paisesMock from '@/mocks/nationalities.json';

const getPrefijoPais = (nacionalidad) => {
  if (!nacionalidad) return '';
  const p = paisesMock.find(item => item.nombre.toLowerCase() === String(nacionalidad).toLowerCase());
  return p?.prefijo || '';
};

const DocumentUploader = ({ label, helpText, error, file, loading, onUpload, onClear, required = true, c }) => {
  const isDark = c?.isDark;
  
  return (
    <div className="doc-uploader-card" style={{
      border: `1.5px dashed ${error ? '#ef4444' : (isDark ? '#60A5FA' : '#93C5FD')}`,
      borderRadius: 16,
      padding: '24px 20px',
      textAlign: 'center',
      background: c?.cardBg || '#ffffff',
      transition: 'all 200ms ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      position: 'relative',
      minWidth: 0,
      maxWidth: '100%',
      height: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span className="doc-uploader-label" style={{ fontSize: 15, fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>{label}{required ? ' *' : ''}</span>
        <span className="doc-uploader-help" style={{ fontSize: 12, color: c?.textSecondary || '#64748b', maxWidth: '420px', lineHeight: 1.45, textAlign: 'center', margin: '0 0 4px' }}>{helpText}</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: c?.accentText || 'var(--brand-primary)', fontWeight: 700 }}>
          <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Subiendo...</span>
        </div>
      ) : file ? (
        <div className="doc-uploader-file" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: isDark ? 'rgba(59, 130, 246, 0.08)' : '#EFF6FF',
          border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.25)' : '#BFDBFE'}`,
          padding: '10px 16px',
          borderRadius: 14,
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box'
        }}>
          {/* Blue checkmark circle */}
          <div style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <div style={{
              fontSize: 13.5,
              fontWeight: 800,
              color: c?.textPrimary || '#0f172a',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {file.name}
            </div>
            <div style={{
              fontSize: 11.5,
              fontWeight: 500,
              color: c?.textSecondary || '#64748b',
              marginTop: 2
            }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          {/* Trash delete button */}
          <button
            type="button"
            onClick={onClear}
            title="Eliminar archivo"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: c?.textSecondary || '#64748b',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              borderRadius: 8,
              transition: 'opacity 0.2s',
              opacity: 0.85
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
          </button>
        </div>
      ) : (
        <label className="doc-uploader-btn" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 24px',
          background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
          border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.15)' : (c?.cardBorder || '#e2e8f0')}`,
          borderRadius: 14,
          fontSize: 13.5,
          fontWeight: 700,
          color: c?.accentText || 'var(--brand-secondary)',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          transition: 'all 150ms ease'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c?.accentText || 'var(--brand-secondary)'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            <polyline points="9 15 12 12 15 15" />
            <line x1="12" y1="12" x2="12" y2="19" />
          </svg>
          <span>Subir PDF (máx 5MB)</span>
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
  );
};

export default function DatosPersonales({
  vehiculo,
  reserva,
  seguroIdx,
  serviciosSeleccionados = [],
  datosForm,
  onCambio,
  onReservar,
  onCancelar,
  errores,
  docsVerificados,
  appliedPromotion,
  onApplyPromotion,
  onRemovePromotion,
  c
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { moneda } = useLanding();
  const [verTyC, setVerTyC] = useState(false);
  const [terminosLeidos, setTerminosLeidos] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const termsScrollRef = useRef(null);

  const [modalCancelar, setModalCancelar] = useState(false);
  const [cedulaError, setCedulaError] = useState('');
  const [licenciaError, setLicenciaError] = useState('');
  const [cedulaCargando, setCedulaCargando] = useState(false);
  const [licenciaCargando, setLicenciaCargando] = useState(false);

  const handleTermsScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight > clientHeight && scrollTop + clientHeight >= scrollHeight - 25) {
      setHasScrolledToBottom(true);
    }
  };

  useEffect(() => {
    if (verTyC) {
      setHasScrolledToBottom(false);
    }
  }, [verTyC]);

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
        setCedulaError(t('vehiculo.fileSizeExceeded', 'El archivo supera el peso máximo de 5MB.'));
      } else {
        setLicenciaError(t('vehiculo.fileSizeExceeded', 'El archivo supera el peso máximo de 5MB.'));
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


  const prefijoActual = useMemo(() => {
    return getPrefijoPais(datosForm.nacionalidad);
  }, [datosForm.nacionalidad]);

  const docsDisponibles = useMemo(() => {
    if (!datosForm.nacionalidad) return [];
    if (datosForm.nacionalidad.toLowerCase() === 'colombia') {
      return [
        { value: 'CC', label: t('vehiculo.docTypes.cc', 'Cédula de Ciudadanía (CC)') },
        { value: 'CE', label: t('vehiculo.docTypes.ce', 'Cédula de Extranjería (CE)') },
        { value: 'PASAPORTE', label: t('vehiculo.docTypes.passport', 'Pasaporte (PAS)') },
        { value: 'PPT', label: t('vehiculo.docTypes.ppt', 'Permiso por Protección Temporal (PPT)') },
        { value: 'PEP', label: t('vehiculo.docTypes.pep', 'Permiso Especial de Permanencia (PEP)') },
      ];
    }
    return [
      { value: 'PASAPORTE', label: t('vehiculo.docTypes.passport', 'Pasaporte (PAS)') },
      { value: 'DNI', label: t('vehiculo.docTypes.dni', 'Documento Nacional de Identidad (DNI)') },
      { value: 'CE', label: t('vehiculo.docTypes.ce', 'Cédula de Extranjería (CE)') },
    ];
  }, [datosForm.nacionalidad, t]);

  const handleCambioNacionalidad = (nuevoPais) => {
    onCambio('nacionalidad', nuevoPais);
    if (nuevoPais) {
      const esCol = nuevoPais.toLowerCase() === 'colombia';
      const validos = esCol
        ? ['CC', 'CE', 'PASAPORTE', 'PPT', 'PEP']
        : ['PASAPORTE', 'DNI', 'CE'];
      if (!validos.includes(datosForm.tipoDoc)) {
        onCambio('tipoDoc', '');
      }
    } else {
      onCambio('tipoDoc', '');
    }
  };

  const nombreDocSeleccionado = useMemo(() => {
    if (!datosForm.tipoDoc) return t('vehiculo.identityDocument', 'Documento de Identidad');
    const encontrado = docsDisponibles.find(d => d.value === datosForm.tipoDoc);
    return encontrado?.label || getNombreTipoDoc(datosForm.tipoDoc) || t('vehiculo.identityDocument', 'Documento de Identidad');
  }, [datosForm.tipoDoc, docsDisponibles, t]);

  const tarifas = vehiculo.tarifas || {};
  const kmLimit = tarifas.kmLimitado || { precio: 0, km: 0 };
  const kmIlimit = tarifas.kmIlimitado || { precio: 0 };
  const precio = reserva.tipoKm === 'ilimitado'
    ? kmIlimit.precio
    : (reserva.tipoKm === 'limitado' ? kmLimit.precio : (vehiculo.precio || kmLimit.precio || 0));

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

  const subtotalPreIva = subtotal + subtotalSeg + subtotalServicios + cargos + recargoLogistico;
  const iva = Math.round(subtotalPreIva * 0.19);
  const totalSinDesc = subtotalPreIva + iva;
  const discount = appliedPromotion
    ? Math.min(totalSinDesc, appliedPromotion.tipoDescuento === 'porcentaje' ? Math.round(totalSinDesc * appliedPromotion.valorDescuento / 100) : appliedPromotion.valorDescuento)
    : 0;
  const total = totalSinDesc - discount;

  const inputStyle = () => ({
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: `1.5px solid ${c?.cardBorder || '#e2e8f0'}`,
    background: c?.isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    color: c?.textPrimary || 'inherit',
    fontSize: 14,
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 200ms ease'
  });

  const sectionCardStyle = {
    background: c?.cardBg || '#ffffff',
    borderRadius: 16,
    padding: '24px',
    border: `1px solid ${c?.cardBorder || '#e2e8f0'}`,
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    margin: '0 0 16px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={sectionCardStyle}>
        <div style={{ margin: '0 0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <FaUser color={c?.accentText || 'var(--brand-secondary)'} size={15} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: c?.accentText || 'var(--brand-secondary)', margin: 0, textTransform: 'none' }}>
              {t('vehiculo.personalData', 'Datos personales')}
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: c?.textSecondary || '#64748b', lineHeight: 1.4 }}>
            {t('vehiculo.personalDataSubtitle', 'Completa tus datos de contacto para la reserva y el contrato digital')}
          </p>
          <div style={{ height: 1, background: c?.cardBorder || '#e2e8f0', margin: '14px 0 0' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c?.textSecondary || '#64748b', marginBottom: 6 }}>
              {t('vehiculo.name', 'Nombre completo')} *
            </label>
            <input
              type="text"
              value={datosForm.nombre}
              onChange={e => onCambio('nombre', e.target.value)}
              placeholder="Ej. Juan Pérez"
              style={inputStyle(errores.nombre)}
            />
            {errores.nombre && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>{errores.nombre}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c?.textSecondary || '#64748b', marginBottom: 6 }}>
              {t('vehiculo.nationality', 'Nacionalidad')} *
            </label>
            <select
              value={datosForm.nacionalidad || ''}
              onChange={e => handleCambioNacionalidad(e.target.value)}
              style={inputStyle(errores.nacionalidad)}
            >
              <option value="">{t('common.select', 'Seleccionar')}</option>
              {[...paisesMock].filter(p => p.nombre !== 'Otro').map(p => (
                <option key={p.nombre} value={p.nombre}>
                  {p.nombre}
                </option>
              ))}
              <option value="Otro">{t('common.other', 'Otro')}</option>
            </select>
            {errores.nacionalidad && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>{errores.nacionalidad}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c?.textSecondary || '#64748b', marginBottom: 6 }}>
              {t('vehiculo.email', 'Correo electrónico')} *
            </label>
            <input
              type="email"
              value={datosForm.correo}
              onChange={e => onCambio('correo', e.target.value)}
              placeholder="Ej. juan@correo.com"
              style={inputStyle(errores.correo)}
            />
            {errores.correo && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>{errores.correo}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c?.textSecondary || '#64748b', marginBottom: 6 }}>
              {t('vehiculo.phoneNumber', 'Teléfono celular')} *
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {prefijoActual ? (
                <div style={{
                  height: 46,
                  minWidth: 64,
                  padding: '0 10px',
                  borderRadius: 12,
                  border: `1.5px solid ${c?.cardBorder || '#e2e8f0'}`,
                  background: c?.isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                  color: c?.textSecondary || '#64748b',
                  fontSize: 13.5,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  userSelect: 'none'
                }}>
                  {prefijoActual}
                </div>
              ) : null}
              <input
                type="tel"
                disabled={!datosForm.nacionalidad}
                value={datosForm.celular}
                onChange={e => onCambio('celular', e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder={!datosForm.nacionalidad ? t('vehiculo.selectNationalityFirst', 'Primero selecciona tu nacionalidad') : 'Ej. 3144214909'}
                style={{
                  ...inputStyle(errores.celular),
                  flex: 1,
                  opacity: !datosForm.nacionalidad ? 0.6 : 1,
                  cursor: !datosForm.nacionalidad ? 'not-allowed' : 'text'
                }}
              />
            </div>
            {errores.celular && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>{errores.celular}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c?.textSecondary || '#64748b', marginBottom: 6 }}>
              {t('vehiculo.docType', 'Tipo de documento')} *
            </label>
            <select
              disabled={!datosForm.nacionalidad}
              value={datosForm.tipoDoc || ''}
              onChange={e => onCambio('tipoDoc', e.target.value)}
              style={{
                ...inputStyle(errores.tipoDoc),
                opacity: !datosForm.nacionalidad ? 0.6 : 1,
                cursor: !datosForm.nacionalidad ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="">{t('common.select', 'Seleccionar')}</option>
              {docsDisponibles.map(doc => (
                <option key={doc.value} value={doc.value}>
                  {doc.label}
                </option>
              ))}
            </select>
            {errores.tipoDoc && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>{errores.tipoDoc}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c?.textSecondary || '#64748b', marginBottom: 6 }}>
              {t('vehiculo.docNumber', 'Número de documento')} *
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {datosForm.tipoDoc && getSiglaDoc(datosForm.tipoDoc) ? (
                <div style={{
                  height: 46,
                  minWidth: 54,
                  padding: '0 10px',
                  borderRadius: 12,
                  border: `1.5px solid ${c?.cardBorder || '#e2e8f0'}`,
                  background: c?.isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                  color: c?.textSecondary || '#64748b',
                  fontSize: 13.5,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  userSelect: 'none'
                }}>
                  {getSiglaDoc(datosForm.tipoDoc)}
                </div>
              ) : null}
              <input
                type="text"
                disabled={!datosForm.tipoDoc}
                value={datosForm.numDoc}
                onChange={e => onCambio('numDoc', e.target.value)}
                placeholder={!datosForm.tipoDoc ? t('vehiculo.selectDocTypeFirst', 'Primero selecciona el tipo de documento') : 'Ej. 1075228306'}
                style={{
                  ...inputStyle(errores.numDoc),
                  flex: 1,
                  opacity: !datosForm.tipoDoc ? 0.6 : 1,
                  cursor: !datosForm.tipoDoc ? 'not-allowed' : 'text'
                }}
              />
            </div>
            {errores.numDoc && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>{errores.numDoc}</p>}
          </div>
        </div>
      </div>

      <div style={sectionCardStyle}>
        <div style={{ margin: '0 0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <FaIdCard color={c?.accentText || 'var(--brand-secondary)'} size={15} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: c?.accentText || 'var(--brand-secondary)', margin: 0, textTransform: 'none' }}>
              {t('vehiculo.mandatoryDocsVerification', 'Verificación Documental Obligatoria')}
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: c?.textSecondary || '#64748b', lineHeight: 1.4 }}>
            {t('vehiculo.mandatoryDocsSub', 'Sube los documentos requeridos para verificar tu identidad y habilitar la reserva del vehículo.')}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentUploader
              label={nombreDocSeleccionado}
              helpText={
                datosForm.tipoDoc === 'PASAPORTE'
                  ? t('vehiculo.passportHelpText', 'Sube tu pasaporte vigente en formato PDF (página de datos y foto, máx 5MB)')
                  : (datosForm.tipoDoc
                      ? t('vehiculo.docHelpTextDynamic', 'Sube tu {{doc}} en un solo archivo PDF (ambos lados incluidos si aplica, máx 5MB)', { doc: nombreDocSeleccionado })
                      : t('vehiculo.nationalIdHelpText', 'Sube tu Cédula de Ciudadanía (CC) en un solo archivo PDF (ambos lados incluidos si aplica, máx 5MB)')
                    )
              }
              error={errores.cedulaPdf || cedulaError}
              file={datosForm.cedulaPdf}
              loading={cedulaCargando}
              onUpload={(e) => handleUpload('cedula', e)}
              onClear={() => onCambio('cedulaPdf', null)}
              c={c}
            />
            <DocumentUploader
              label={t('vehiculo.driverLicense', 'Licencia de Conducción')}
              helpText={t('vehiculo.driverLicenseHelpText', 'Sube tu licencia de conducción vigente y legible en formato PDF (máx 5MB)')}
              error={errores.licenciaPdf || licenciaError}
              file={datosForm.licenciaPdf}
              loading={licenciaCargando}
              onUpload={(e) => handleUpload('licencia', e)}
              onClear={() => onCambio('licenciaPdf', null)}
              c={c}
            />
          </div>

          {/* Privacy & Legal Notice Banner */}
          <div style={{
            background: c?.isDark ? 'rgba(59, 130, 246, 0.08)' : '#EFF6FF',
            border: `1px solid ${c?.isDark ? 'rgba(59, 130, 246, 0.25)' : '#BFDBFE'}`,
            borderRadius: 14,
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: `1.8px solid ${c?.accentText || 'var(--brand-secondary)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: c?.accentText || 'var(--brand-secondary)'
              }} />
            </div>
            <p style={{
              margin: 0,
              fontSize: 12.5,
              fontWeight: 700,
              color: c?.accentText || 'var(--brand-secondary)',
              lineHeight: 1.45
            }}>
              {t('vehiculo.docsSecurityNotice', 'Tus documentos se usan exclusivamente para la elaboración del contrato digital de alquiler y la verificación de identidad.')}
            </p>
          </div>
        </div>
      </div>


      <div style={sectionCardStyle}>
        <div style={headerStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c?.accentText || 'var(--brand-secondary)'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: c?.accentText || 'var(--brand-secondary)', margin: 0, textTransform: 'none' }}>
            {t('vehiculo.policiesAndSecurity', 'Políticas y seguridad')}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <input
            type="checkbox"
            id="tyc"
            checked={Boolean(datosForm.terminos)}
            onChange={e => {
              if (!terminosLeidos) {
                e.preventDefault();
                setVerTyC(true);
                return;
              }
              onCambio('terminos', e.target.checked);
            }}
            onClick={e => {
              if (!terminosLeidos) {
                e.preventDefault();
                setVerTyC(true);
              }
            }}
            style={{
              width: 17,
              height: 17,
              cursor: 'pointer',
              marginTop: 2,
              flexShrink: 0,
              accentColor: c?.accentText || 'var(--brand-secondary)',
              borderRadius: 4
            }}
          />
          <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 400, color: c?.textPrimary || '#0f172a', lineHeight: 1.45 }}>
            <label
              htmlFor="tyc"
              onClick={e => {
                if (!terminosLeidos) {
                  e.preventDefault();
                  setVerTyC(true);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              {t('vehiculo.termsAgreementText', 'Acepto los términos, condiciones del contrato de alquiler y la política de privacidad')} *
            </label>{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setVerTyC(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: c?.accentText || 'var(--brand-secondary)',
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'none',
                fontFamily: 'inherit',
                display: 'inline',
                verticalAlign: 'baseline',
                marginLeft: 6
              }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              {t('vehiculo.viewTermsAndConditions', 'Ver términos y condiciones')}
            </button>
          </div>
        </div>
        {errores.terminos && <p style={{ color: '#ef4444', fontSize: 12, margin: '8px 0 0 29px', fontWeight: 600 }}>{errores.terminos}</p>}
      </div>

      {/* ── Aviso informativo de confirmación ── */}
      <div style={{
        background: c?.isDark ? 'rgba(59, 130, 246, 0.08)' : '#EFF6FF',
        border: `1px solid ${c?.isDark ? 'rgba(59, 130, 246, 0.25)' : '#BFDBFE'}`,
        borderRadius: 16,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14
      }}>
        <div style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: `1.5px solid ${c?.accentText || 'var(--brand-secondary)'}`,
          color: c?.accentText || 'var(--brand-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 800,
          flexShrink: 0,
          marginTop: 1
        }}>
          i
        </div>
        <p style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.5,
          color: c?.accentText || 'var(--brand-secondary)',
          fontWeight: 700
        }}>
          {t('vehiculo.confirmNoticeText', 'Al confirmar la reserva, quedará guardada automáticamente en tu cuenta. Tendrás un plazo de 72 horas para completar el pago antes de su cancelación automática.')}
        </p>
      </div>

      {/* ── Tarjeta Total a Pagar y Acciones ── */}
      <div style={{
        background: 'var(--brand-gradient)',
        borderRadius: 24,
        padding: '24px 28px',
        boxShadow: 'var(--brand-shadow)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
        color: '#ffffff'
      }}>
        {/* Left Column: Total to pay info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          textAlign: 'left',
          flex: '1 1 240px'
        }}>
          <span style={{
            fontSize: 12,
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.9)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: '0 0 4px'
          }}>
            {t('vehiculo.totalToPay', 'TOTAL A PAGAR')}
          </span>

          <span style={{
            fontSize: 32,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            margin: '0 0 4px',
            letterSpacing: '-0.02em'
          }}>
            {formatCurrency(total, moneda)}
          </span>

          <span style={{
            fontSize: 11.5,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.85)'
          }}>
            *Incluye impuestos y cargos administrativos
          </span>
        </div>

        {/* Right Column: Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          flex: '0 0 auto',
          width: '100%',
          maxWidth: 220
        }}>
          <button
            type="button"
            onClick={onReservar}
            style={{
              width: '100%',
              height: 44,
              background: '#ffffff',
              color: c?.accentText || 'var(--brand-secondary)',
              border: 'none',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 16px',
              boxSizing: 'border-box'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {t('vehiculo.confirmReserve', 'Confirmar reserva')}
          </button>

          <button
            type="button"
            onClick={() => setModalCancelar(true)}
            style={{
              width: '100%',
              height: 44,
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 16px',
              boxSizing: 'border-box'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          >
            {t('vehiculo.cancelReserve', 'Cancelar reserva')}
          </button>
        </div>
      </div>

      {/* Modal Confirmación Cancelar Reserva */}
      {modalCancelar && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setModalCancelar(false)}
        >
          <div
            style={{
              background: c?.cardBg || '#ffffff',
              borderRadius: 20,
              maxWidth: 360,
              width: '100%',
              padding: '28px 24px 22px',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              border: `1px solid ${c?.isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Warning Icon Badge */}
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: c?.isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={c?.isDark ? '#60A5FA' : '#1D4ED8'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2.4" />
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="3" />
              </svg>
            </div>

            {/* Title */}
            <h3 style={{
              margin: '0 0 8px',
              fontSize: 17,
              fontWeight: 800,
              color: c?.textPrimary || '#0f172a',
              letterSpacing: '-0.01em'
            }}>
              {t('vehiculo.cancelModalTitle', '¿Cancelar proceso de reserva?')}
            </h3>

            {/* Description */}
            <p style={{
              margin: '0 0 22px',
              fontSize: 12.5,
              color: c?.textSecondary || '#64748b',
              lineHeight: 1.45,
              maxWidth: 290
            }}>
              {t('vehiculo.cancelModalDesc', 'Se descartarán los datos ingresados en este proceso y regresarás al catálogo de vehículos.')}
            </p>

            {/* Buttons Row */}
            <div style={{
              display: 'flex',
              gap: 10,
              width: '100%'
            }}>
              <button
                type="button"
                onClick={() => setModalCancelar(false)}
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 10,
                  border: `2px solid ${c?.isDark ? '#60A5FA' : '#1D4ED8'}`,
                  background: 'transparent',
                  color: c?.isDark ? '#93C5FD' : '#1D4ED8',
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={e => e.currentTarget.style.background = c?.isDark ? 'rgba(96, 165, 250, 0.1)' : '#EFF6FF'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {t('vehiculo.cancelModalNo', 'No, continuar')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalCancelar(false);
                  if (onCancelar) {
                    onCancelar();
                  } else {
                    navigate('/catalogo');
                  }
                }}
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 10,
                  border: 'none',
                  background: c?.isDark ? '#2563EB' : '#1D4ED8',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1E40AF'}
                onMouseLeave={e => e.currentTarget.style.background = c?.isDark ? '#2563EB' : '#1D4ED8'}
              >
                {t('vehiculo.cancelModalYes', 'Sí, cancelar reserva')}
              </button>
            </div>
          </div>
        </div>
      )}

      {verTyC && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setVerTyC(false)}
        >
          <div
            style={{
              background: c?.cardBg || '#ffffff',
              borderRadius: 24,
              maxWidth: 540,
              width: '100%',
              maxHeight: '88vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
              border: `1px solid ${c?.cardBorder || '#e2e8f0'}`
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Top pill handle */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <div style={{ width: 44, height: 4.5, borderRadius: 3, background: c?.isDark ? '#475569' : '#cbd5e1' }} />
            </div>

            {/* Header */}
            <div style={{
              padding: '12px 24px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `1px solid ${c?.cardBorder || '#e2e8f0'}`
            }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>
                {t('vehiculo.termsModalTitle', 'Términos y condiciones de alquiler')}
              </h3>
              <button
                type="button"
                onClick={() => setVerTyC(false)}
                style={{
                  background: c?.isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                  border: 'none',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: c?.textSecondary || '#64748b',
                  fontSize: 15,
                  fontWeight: 700
                }}
              >
                ✕
              </button>
            </div>

            {/* Scrollable Terms Content */}
            <div
              style={{
                padding: '16px 20px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minHeight: 0
              }}
            >
              {/* Unified Terms Card with Visible Scrollbar */}
              <div
                ref={termsScrollRef}
                onScroll={handleTermsScroll}
                className="terms-modal-scroll"
                style={{
                  borderRadius: 16,
                  border: `1.5px solid ${c?.cardBorder || '#e2e8f0'}`,
                  background: c?.cardBg || '#ffffff',
                  maxHeight: '380px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Important Policy Top Banner */}
                <div style={{
                  background: c?.isDark ? 'rgba(59, 130, 246, 0.08)' : '#EFF6FF',
                  borderBottom: `1px solid ${c?.isDark ? 'rgba(59, 130, 246, 0.25)' : '#BFDBFE'}`,
                  padding: '16px 20px',
                  flexShrink: 0
                }}>
                  <p style={{
                    fontSize: 11.5,
                    fontWeight: 800,
                    color: c?.accentText || 'var(--brand-secondary)',
                    margin: '0 0 6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {t('vehiculo.importantPoliciesTitle', 'POLÍTICAS IMPORTANTES DEL CONTRATO')}
                  </p>
                  <p style={{ fontSize: 12.5, color: c?.textPrimary || '#0f172a', margin: 0, lineHeight: 1.55 }}>
                    <strong style={{ color: c?.textPrimary || '#0f172a' }}>Política de No Reembolso:</strong> Una vez confirmada y pagada la reserva, no se realizan devoluciones de dinero bajo ninguna circunstancia. El cliente podrá reprogramar su fecha de alquiler notificando con al menos 48 horas de anticipación.
                  </p>
                </div>

                {/* Clauses Section */}
                <div style={{ padding: '20px' }}>
                  <p style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: c?.textSecondary || '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    margin: '0 0 16px'
                  }}>
                    {t('vehiculo.termsSectionTitle', 'TÉRMINOS Y CONDICIONES DE ALQUILER DRIVIQUE')}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 12.5, color: c?.textSecondary || '#64748b', lineHeight: 1.6 }}>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: c?.textPrimary || '#0f172a' }}>1. OBJETO DEL CONTRATO:</strong> El arrendador entrega al arrendatario el vehículo descrito en las condiciones óptimas de funcionamiento para su uso personal o comercial autorizado.
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: c?.textPrimary || '#0f172a' }}>2. USO DEL VEHÍCULO:</strong> Queda estrictamente prohibido utilizar el vehículo para fines ilícitos, subarrendar, transporte de carga pesada no autorizada o conducir bajo los efectos del alcohol o sustancias psicoactivas. El vehículo debe ser usado únicamente dentro del territorio colombiano.
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: c?.textPrimary || '#0f172a' }}>3. DOCUMENTACIÓN OBLIGATORIA:</strong> El conductor debe presentar documento de identidad original válido y licencia de conducción vigente al momento de la entrega del vehículo.
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: c?.textPrimary || '#0f172a' }}>4. POLÍTICA DE CANCELACIÓN Y NO REEMBOLSO:</strong> No se realizarán devoluciones de dinero. Las cancelaciones se gestionan mediante saldo a favor para futuras reservas.
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: c?.textPrimary || '#0f172a' }}>5. DURACIÓN Y MODIFICACIONES:</strong> La duración de la renta será la acordada en la reserva. Cualquier cambio en fechas, horas o sucursal de entrega/devolución debe ser coordinado con antelación y puede generar ajustes en la tarifa.
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: c?.textPrimary || '#0f172a' }}>6. KILOMETRAJE Y EXCEDENTES:</strong> En plan Limitado se incluye un cupo de km por día; el kilómetro adicional excedente tendrá un valor de $1.500 COP/km calculado al devolver el auto. En plan Ilimitado no aplica cobro por distancia recorrida.
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: c?.textPrimary || '#0f172a' }}>7. PAGOS Y TARIFAS:</strong> El valor pactado incluye la renta diaria del vehículo, coberturas de protección seleccionadas, cargos administrativos e impuestos de ley.
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: c?.textPrimary || '#0f172a' }}>8. DAÑOS Y RESPONSABILIDAD:</strong> El arrendatario es responsable del cuidado del vehículo durante el periodo contratado. En caso de siniestro o eventualidad, se deberá notificar de forma inmediata a Drivique y a las autoridades competentes.
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: c?.textPrimary || '#0f172a' }}>9. LEGISLACIÓN APLICABLE:</strong> El presente contrato de alquiler se rige en su totalidad por las leyes de la República de Colombia.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div style={{
              padding: '16px 24px 20px',
              borderTop: `1px solid ${c?.cardBorder || '#e2e8f0'}`,
              display: 'flex',
              gap: 12,
              alignItems: 'center'
            }}>
              <button
                type="button"
                onClick={() => setVerTyC(false)}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  border: `1.5px solid ${c?.cardBorder || '#e2e8f0'}`,
                  background: c?.cardBg || '#ffffff',
                  color: c?.textPrimary || '#0f172a',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {t('common.close', 'Cerrar')}
              </button>

              <button
                type="button"
                disabled={!hasScrolledToBottom}
                onClick={() => {
                  setTerminosLeidos(true);
                  onCambio('terminos', true);
                  setVerTyC(false);
                }}
                style={{
                  flex: 1.5,
                  height: 48,
                  borderRadius: 12,
                  border: 'none',
                  background: hasScrolledToBottom
                    ? 'var(--brand-gradient, #1d4ed8)'
                    : (c?.isDark ? '#334155' : '#e2e8f0'),
                  color: hasScrolledToBottom
                    ? '#ffffff'
                    : (c?.isDark ? '#64748b' : '#94a3b8'),
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: hasScrolledToBottom ? 'pointer' : 'not-allowed',
                  boxShadow: hasScrolledToBottom
                    ? '0 4px 14px rgba(29, 78, 216, 0.25)'
                    : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {t('common.understood', 'Entendido')}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
