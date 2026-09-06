import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanding } from '../../landing/LandingContext';
import { formatCurrency } from '@/utils/currencyUtils';
import { getNombreTipoDoc } from '@/utils/documentUtils';
import { RECARGOS_LOGISTICOS } from '../../catalog/constants';
import { FaUser, FaIdCard, FaShieldAlt, FaTicketAlt, FaTrashAlt, FaTimes } from 'react-icons/fa';
import { promotionManagementService } from '../../../services/promotionManagementService';

const formatearFechaExp = (fechaStr) => {
  if (!fechaStr) return '';
  try {
    const parts = fechaStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${day} de ${meses[monthIdx] || parts[1]} de ${year}`;
    }
    const d = new Date(fechaStr + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return fechaStr;
  }
};

const DocumentUploader = ({ label, helpText, error, file, loading, onUpload, onClear, required = true, c }) => {
  const isDark = c?.isDark;
  
  return (
    <div className="doc-uploader-card" style={{
      border: `2px ${file ? 'solid' : 'dashed'} ${error ? '#f87171' : (file ? (c?.accentText || 'var(--brand-primary)') : (c?.cardBorder || '#e2e8f0'))}`,
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
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span className="doc-uploader-label" style={{ fontSize: 14, fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>{label}{required ? ' *' : ''}</span>
        <span className="doc-uploader-help" style={{ fontSize: 11, color: c?.textSecondary || '#64748b', maxWidth: '240px', lineHeight: 1.4 }}>{helpText}</span>
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
          background: isDark ? 'rgba(244,63,94,0.12)' : '#fff1f2',
          border: `1px solid ${isDark ? 'rgba(244,63,94,0.35)' : '#fecdd3'}`,
          padding: '10px 16px',
          borderRadius: 12,
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box'
        }}>
          <svg className="doc-uploader-file-icon" width="24" height="24" fill="none" stroke="#e11d48" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#fda4af' : '#9f1239', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file.name}
            </div>
            <div style={{ fontSize: 11, color: isDark ? '#fb7185' : '#be123c' }}>
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
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      ) : (
        <label className="doc-uploader-btn" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 24px',
          background: isDark ? 'rgba(var(--brand-primary-rgb),0.15)' : 'var(--brand-soft-light)',
          border: `1px solid ${c?.accentText || 'var(--brand-primary)'}`,
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 700,
          color: c?.accentText || 'var(--brand-secondary)',
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
  errores,
  docsVerificados,
  appliedPromotion,
  onApplyPromotion,
  onRemovePromotion,
  c
}) {
  const { t } = useTranslation();
  const { moneda } = useLanding();
  const [verTyC, setVerTyC] = useState(false);
  const [terminosLeidos, setTerminosLeidos] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const termsScrollRef = useRef(null);

  const [modalCupones, setModalCupones] = useState(false);
  const [selectedPromoCondiciones, setSelectedPromoCondiciones] = useState(null);

  const [codigoCupon, setCodigoCupon] = useState('');
  const [promoError, setPromoError] = useState('');

  const [cedulaError, setCedulaError] = useState('');
  const [licenciaError, setLicenciaError] = useState('');
  const [cedulaCargando, setCedulaCargando] = useState(false);
  const [licenciaCargando, setLicenciaCargando] = useState(false);

  const [cuponesDisponibles, setCuponesDisponibles] = useState(() => {
    try {
      return promotionManagementService.listPublished(null) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        setCuponesDisponibles(promotionManagementService.listPublished(null) || []);
      } catch {
        setCuponesDisponibles([]);
      }
    };
    window.addEventListener(promotionManagementService.eventName, handleUpdate);
    return () => window.removeEventListener(promotionManagementService.eventName, handleUpdate);
  }, []);

  const handleTermsScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 25) {
      setHasScrolledToBottom(true);
    }
  };

  useEffect(() => {
    if (verTyC) {
      setTimeout(() => {
        if (termsScrollRef.current) {
          const { scrollHeight, clientHeight } = termsScrollRef.current;
          if (scrollHeight <= clientHeight + 20) {
            setHasScrolledToBottom(true);
          }
        }
      }, 100);
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

  const getErrorMessage = (err) => {
    const code = err?.message;
    if (code === 'notFound' || code === 'expired' || code === 'inactive' || code === 'notStarted') {
      return t('promotions.validation.notFoundOrExpired', 'El código ingresado no existe o ya expiró.');
    }
    if (code === 'minimum') {
      return t('promotions.validation.minimum', 'El monto de la reserva no alcanza el mínimo requerido para este cupón.');
    }
    if (code === 'category' || code === 'vehicleMismatch') {
      return t('promotions.validation.vehicleMismatch', 'Este cupón no aplica para el vehículo seleccionado.');
    }
    if (code === 'audience') {
      return t('promotions.validation.audience', 'Tu usuario no cumple las condiciones para aplicar este cupón.');
    }
    return t('promotions.validation.notFoundOrExpired', 'El código ingresado no existe o ya expiró.');
  };

  const handleAplicarCupon = () => {
    if (!codigoCupon.trim() || !onApplyPromotion) return;
    try {
      onApplyPromotion(codigoCupon.trim().toUpperCase());
      setPromoError('');
    } catch (error) {
      setPromoError(getErrorMessage(error));
    }
  };

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

  const inputStyle = err => ({
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: `1.5px solid ${err ? '#ef4444' : (c?.cardBorder || '#e2e8f0')}`,
    background: err ? (c?.isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2') : (c?.isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
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
        <div style={headerStyle}>
          <FaUser color={c?.accentText || 'var(--brand-secondary)'} size={14} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: c?.accentText || 'var(--brand-secondary)', margin: 0, textTransform: 'none' }}>
            {t('vehiculo.driverData', 'Datos del conductor')}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c?.textSecondary || '#64748b', marginBottom: 6 }}>
              {t('vehiculo.name')} *
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
              {t('vehiculo.nationality')} *
            </label>
            <input
              type="text"
              value={datosForm.nacionalidad}
              onChange={e => onCambio('nacionalidad', e.target.value)}
              placeholder="Ej. Colombiana"
              style={inputStyle(errores.nacionalidad)}
            />
            {errores.nacionalidad && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>{errores.nacionalidad}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c?.textSecondary || '#64748b', marginBottom: 6 }}>
              {t('vehiculo.email')} *
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
              {t('vehiculo.phoneNumber')} *
            </label>
            <input
              type="tel"
              value={datosForm.celular}
              onChange={e => onCambio('celular', e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Ej. 3001234567"
              style={inputStyle(errores.celular)}
            />
            {errores.celular && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>{errores.celular}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c?.textSecondary || '#64748b', marginBottom: 6 }}>
              {t('vehiculo.docType')} *
            </label>
            <select
              value={datosForm.tipoDoc}
              onChange={e => onCambio('tipoDoc', e.target.value)}
              style={inputStyle(errores.tipoDoc)}
            >
              <option value="CC">{getNombreTipoDoc('CC')}</option>
              <option value="CE">{getNombreTipoDoc('CE')}</option>
              <option value="PASAPORTE">{getNombreTipoDoc('PASAPORTE')}</option>
              <option value="PEP">{getNombreTipoDoc('PEP')}</option>
              <option value="PPT">{getNombreTipoDoc('PPT')}</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c?.textSecondary || '#64748b', marginBottom: 6 }}>
              {t('vehiculo.docNumber')} *
            </label>
            <input
              type="text"
              value={datosForm.numDoc}
              onChange={e => onCambio('numDoc', e.target.value)}
              placeholder="Ej. 1020304050"
              style={inputStyle(errores.numDoc)}
            />
            {errores.numDoc && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>{errores.numDoc}</p>}
          </div>
        </div>
      </div>

      <div style={sectionCardStyle}>
        <div style={headerStyle}>
          <FaIdCard color={c?.accentText || 'var(--brand-secondary)'} size={14} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: c?.accentText || 'var(--brand-secondary)', margin: 0, textTransform: 'none' }}>
            {t('vehiculo.mandatoryDocs', 'Documentos obligatorios')}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DocumentUploader
            label={t('vehiculo.nationalId', 'Cédula de Ciudadanía')}
            helpText={t('vehiculo.nationalIdHelpText', 'Sube tu cédula de ciudadanía en un solo archivo PDF (ambos lados incluidos, máx 5MB)')}
            error={errores.cedulaPdf || cedulaError}
            file={datosForm.cedulaPdf}
            loading={cedulaCargando}
            onUpload={(e) => handleUpload('cedula', e)}
            onClear={() => onCambio('cedulaPdf', null)}
            c={c}
          />
          <DocumentUploader
            label={t('vehiculo.driverLicense', 'Licencia de Conducción')}
            helpText={t('vehiculo.driverLicenseHelpText', 'Sube tu licencia de conducción vigente en un archivo PDF (máx 5MB)')}
            error={errores.licenciaPdf || licenciaError}
            file={datosForm.licenciaPdf}
            loading={licenciaCargando}
            onUpload={(e) => handleUpload('licencia', e)}
            onClear={() => onCambio('licenciaPdf', null)}
            c={c}
          />
        </div>
      </div>

      <div style={sectionCardStyle}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: c?.accentText || 'var(--brand-secondary)', margin: '0 0 16px', textTransform: 'none', fontFamily: 'inherit' }}>
          {t('promotions.codeLabelOptional', 'Cupón de descuento (Opcional)')}
        </h3>

        {appliedPromotion ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: c?.isDark ? 'rgba(37, 99, 235, 0.08)' : '#f8faff',
            border: `1.5px solid ${c?.isDark ? 'rgba(59, 130, 246, 0.4)' : '#bfdbfe'}`,
            borderRadius: 14,
            padding: '14px 18px',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: c?.accentText || '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c?.textPrimary || '#0f172a', letterSpacing: '0.04em' }}>
                  {appliedPromotion.codigo}
                </div>
                <div style={{ fontSize: 12, color: c?.textSecondary || '#64748b', fontWeight: 500, marginTop: 2 }}>
                  {appliedPromotion.tipoDescuento === 'porcentaje'
                    ? `${appliedPromotion.valorDescuento}% OFF aplicado`
                    : `$${Number(appliedPromotion.valorDescuento).toLocaleString('es-CO')} OFF aplicado`}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onRemovePromotion}
              title={t('promotions.remove', 'Quitar')}
              style={{
                background: 'transparent',
                border: 'none',
                color: c?.textSecondary || '#94a3b8',
                padding: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s',
                borderRadius: 8
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = c?.textSecondary || '#94a3b8'}
            >
              <FaTrashAlt size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="text"
              value={codigoCupon}
              onChange={e => {
                setCodigoCupon(e.target.value.toUpperCase());
                setPromoError('');
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAplicarCupon();
                }
              }}
              placeholder={t('promotions.codePlaceholder', 'Ingresa un código')}
              style={{
                flex: 1,
                height: 44,
                padding: '0 16px',
                borderRadius: 12,
                border: `1.5px solid ${promoError ? '#ef4444' : (c?.cardBorder || '#e2e8f0')}`,
                background: c?.isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                color: c?.textPrimary || '#0f172a',
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '0.04em',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={handleAplicarCupon}
              disabled={!codigoCupon.trim()}
              style={{
                height: 44,
                padding: '0 26px',
                borderRadius: 12,
                background: codigoCupon.trim() ? 'var(--brand-gradient)' : (c?.isDark ? '#334155' : '#94a3b8'),
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 12.5,
                letterSpacing: '0.05em',
                border: 'none',
                cursor: codigoCupon.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                flexShrink: 0
              }}
            >
              {t('promotions.apply', 'APLICAR')}
            </button>
          </div>
        )}

        {promoError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: c?.isDark ? 'rgba(239, 68, 68, 0.12)' : '#fff1f2',
            border: `1px solid ${c?.isDark ? 'rgba(239, 68, 68, 0.35)' : '#fecdd3'}`,
            borderRadius: 12,
            padding: '10px 14px',
            marginTop: 12,
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
              <div style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#ef4444',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 900,
                flexShrink: 0
              }}>
                !
              </div>
              <span style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: c?.isDark ? '#fca5a5' : '#b91c1c',
                lineHeight: 1.3
              }}>
                {promoError}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPromoError('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: c?.isDark ? '#f87171' : '#e11d48',
                fontSize: 14,
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              ✕
            </button>
          </div>
        )}

        {!appliedPromotion && (
          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <button
              type="button"
              onClick={() => setModalCupones(true)}
              style={{
                background: 'none',
                border: 'none',
                color: c?.accentText || 'var(--brand-secondary)',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'inherit',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {t('promotions.viewAvailableCoupons', 'Ver cupones disponibles')}
            </button>
          </div>
        )}
      </div>

      <div style={sectionCardStyle}>
        <div style={headerStyle}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c?.accentText || 'var(--brand-secondary)'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: c?.accentText || 'var(--brand-secondary)', margin: 0, textTransform: 'none', fontFamily: 'inherit' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label
              htmlFor="tyc"
              onClick={e => {
                if (!terminosLeidos) {
                  e.preventDefault();
                  setVerTyC(true);
                }
              }}
              style={{ fontSize: 13, fontWeight: 600, color: c?.textPrimary || '#0f172a', cursor: 'pointer', lineHeight: 1.4 }}
            >
              {t('vehiculo.termsAgreementText', 'Acepto los términos, condiciones del contrato de alquiler y la política de privacidad')} *
            </label>
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
                fontSize: 14,
                cursor: 'pointer',
                padding: 0,
                textAlign: 'left',
                textDecoration: 'none',
                width: 'fit-content',
                fontFamily: 'inherit'
              }}
            >
              {t('vehiculo.viewTermsAndConditions', 'Ver términos y condiciones')}
            </button>
          </div>
        </div>
        {errores.terminos && <p style={{ color: '#ef4444', fontSize: 12, margin: '8px 0 0 29px', fontWeight: 600 }}>{errores.terminos}</p>}
      </div>

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
            <div style={{ padding: '10px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              ref={termsScrollRef}
              onScroll={handleTermsScroll}
              style={{
                padding: '0 24px 20px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
            >
              {/* Important Policy Box */}
              <div style={{
                background: c?.isDark ? 'rgba(37,99,235,0.1)' : '#f0f4ff',
                border: `1px solid ${c?.isDark ? 'rgba(59,130,246,0.3)' : '#dbeafe'}`,
                padding: '16px',
                borderRadius: 14
              }}>
                <p style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: c?.accentText || '#1d4ed8',
                  margin: '0 0 6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {t('vehiculo.importantPoliciesTitle', 'POLÍTICAS IMPORTANTES DEL CONTRATO')}
                </p>
                <p style={{ fontSize: 12.5, color: c?.textPrimary || '#0f172a', margin: 0, lineHeight: 1.5 }}>
                  <strong>Política de No Reembolso:</strong> Una vez confirmada y pagada la reserva, no se realizan devoluciones de dinero bajo ninguna circunstancia. El cliente podrá reprogramar su fecha de alquiler notificando con al menos 48 horas de anticipación.
                </p>
              </div>

              {/* Title Section */}
              <div>
                <p style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: c?.textSecondary || '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  margin: '0 0 12px'
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

            {/* Footer Buttons */}
            <div style={{
              padding: '14px 24px 20px',
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
                  height: 46,
                  borderRadius: 12,
                  border: `1.5px solid ${c?.cardBorder || '#e2e8f0'}`,
                  background: c?.cardBg || '#ffffff',
                  color: c?.textPrimary || '#0f172a',
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {t('common.close', 'Cerrar')}
              </button>

              <button
                type="button"
                disabled={!hasScrolledToBottom && !terminosLeidos}
                onClick={() => {
                  setTerminosLeidos(true);
                  onCambio('terminos', true);
                  setVerTyC(false);
                }}
                style={{
                  flex: 2,
                  height: 46,
                  borderRadius: 12,
                  border: 'none',
                  background: (hasScrolledToBottom || terminosLeidos)
                    ? 'var(--brand-gradient)'
                    : (c?.isDark ? '#334155' : '#e2e8f0'),
                  color: (hasScrolledToBottom || terminosLeidos)
                    ? '#ffffff'
                    : (c?.isDark ? '#64748b' : '#94a3b8'),
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: (hasScrolledToBottom || terminosLeidos) ? 'pointer' : 'not-allowed',
                  boxShadow: (hasScrolledToBottom || terminosLeidos)
                    ? '0 4px 12px rgba(var(--brand-secondary-rgb), 0.25)'
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

      {/* Modal 1: Cupones Disponibles */}
      {modalCupones && (
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
          onClick={() => setModalCupones(false)}
        >
          <div
            style={{
              background: c?.cardBg || '#ffffff',
              borderRadius: 24,
              maxWidth: 540,
              width: '100%',
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
              border: `1px solid ${c?.cardBorder || '#e2e8f0'}`,
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Top handle pill */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 6 }}>
              <div style={{ width: 44, height: 4.5, borderRadius: 3, background: c?.isDark ? '#475569' : '#cbd5e1' }} />
            </div>

            <div style={{ padding: '8px 24px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: c?.accentText || 'var(--brand-secondary)', textAlign: 'center' }}>
                {t('promotions.availableCouponsTitle', 'Cupones Disponibles')}
              </h3>
              <button
                type="button"
                onClick={() => setModalCupones(false)}
                style={{ position: 'absolute', right: 20, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: c?.textSecondary || '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '0 20px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {cuponesDisponibles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: c?.textSecondary || '#64748b' }}>
                  <FaTicketAlt size={36} style={{ opacity: 0.35, margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                    {t('promotions.emptyTitle', 'No hay cupones activos disponibles en este momento')}
                  </p>
                </div>
              ) : (
                cuponesDisponibles.map(promo => {
                  const promoThumbnails = (promo.imagenes && promo.imagenes.length > 0)
                    ? promo.imagenes.slice(0, 3)
                    : (promo.vehiculoImagen ? [promo.vehiculoImagen] : []);
                  const valorDescFormatted = promo.tipoDescuento === 'porcentaje'
                    ? `${promo.valorDescuento}% OFF`
                    : `$${Number(promo.valorDescuento).toLocaleString('es-CO')} OFF`;

                  return (
                    <div
                      key={promo.id || promo.codigo}
                      style={{
                        display: 'flex',
                        borderRadius: 16,
                        border: `1.5px solid ${c?.cardBorder || '#e2e8f0'}`,
                        background: c?.cardBg || '#ffffff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      {/* Left ticket details */}
                      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <FaTicketAlt size={14} color={c?.accentText || 'var(--brand-secondary)'} />
                          <span style={{ fontSize: 13.5, fontWeight: 800, color: c?.textPrimary || '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {promo.nombre || promo.titulo}
                          </span>
                        </div>

                        {/* Vehicle thumbnails */}
                        {promoThumbnails.length > 0 && (
                          <div style={{ display: 'flex', gap: 6, margin: '6px 0 10px' }}>
                            {promoThumbnails.map((imgUrl, i) => (
                              <img
                                key={i}
                                src={imgUrl}
                                alt="Car preview"
                                style={{
                                  width: 54,
                                  height: 36,
                                  objectFit: 'cover',
                                  borderRadius: 6,
                                  border: `1px solid ${c?.cardBorder || '#e2e8f0'}`,
                                  background: '#f1f5f9'
                                }}
                                onError={e => { e.currentTarget.style.display = 'none'; }}
                              />
                            ))}
                          </div>
                        )}

                        {/* Bottom row: Exp date & Condiciones */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ fontSize: 11, color: c?.textSecondary || '#64748b' }}>
                            Exp: {formatearFechaExp(promo.fechaFin)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedPromoCondiciones(promo)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              color: c?.accentText || 'var(--brand-secondary)',
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            {t('promotions.conditions', 'Condiciones')}
                          </button>
                        </div>
                      </div>

                    {/* Dotted border line with notches */}
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 0,
                      borderLeft: `1.5px dashed ${c?.cardBorder || '#cbd5e1'}`
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: -8,
                        left: -8,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: c?.isDark ? '#0f172a' : '#f1f5f9',
                        border: `1px solid ${c?.cardBorder || '#e2e8f0'}`
                      }} />
                      <div style={{
                        position: 'absolute',
                        bottom: -8,
                        left: -8,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: c?.isDark ? '#0f172a' : '#f1f5f9',
                        border: `1px solid ${c?.cardBorder || '#e2e8f0'}`
                      }} />
                    </div>

                    {/* Right side: Discount & Apply */}
                    <div style={{
                      width: '36%',
                      minWidth: 120,
                      background: c?.isDark ? 'rgba(var(--brand-primary-rgb), 0.08)' : 'rgba(239, 246, 255, 0.45)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '14px 10px',
                      textAlign: 'center'
                    }}>
                      <span style={{ fontSize: 17, fontWeight: 900, color: c?.accentText || 'var(--brand-secondary)', lineHeight: 1.1 }}>
                        {valorDescFormatted}
                      </span>
                      <span style={{ fontSize: 10.5, color: c?.textSecondary || '#64748b', margin: '4px 0 10px', lineHeight: 1.2 }}>
                        {t('promotions.discountOnReservation', 'Descuento en tu reserva')}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setModalCupones(false);
                          if (onApplyPromotion) {
                            try {
                              onApplyPromotion(promo.codigo);
                              setPromoError('');
                            } catch (err) {
                              setPromoError(err.message);
                            }
                          }
                        }}
                        style={{
                          background: 'var(--brand-gradient)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '7px 18px',
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(var(--brand-secondary-rgb), 0.25)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {t('promotions.apply', 'Aplicar')}
                      </button>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Condiciones del Cupón */}
      {selectedPromoCondiciones && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setSelectedPromoCondiciones(null)}
        >
          <div
            style={{
              background: c?.cardBg || '#ffffff',
              borderRadius: 20,
              maxWidth: 440,
              width: '100%',
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
              border: `1px solid ${c?.cardBorder || '#e2e8f0'}`
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${c?.cardBorder || '#e2e8f0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>
                {t('promotions.couponConditionsTitle', 'Condiciones del Cupón')}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPromoCondiciones(null)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: c?.textSecondary || '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: c?.accentText || 'var(--brand-secondary)' }}>
                {selectedPromoCondiciones.nombre || selectedPromoCondiciones.titulo}
              </h4>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: c?.textSecondary || '#64748b', lineHeight: 1.5 }}>
                {selectedPromoCondiciones.condiciones || 'Otorgado a nuestros clientes más fieles por su continuo soporte y confianza en Drivique.'}
              </p>

              <div style={{ height: 1, background: c?.cardBorder || '#e2e8f0', margin: '16px 0' }} />

              <h5 style={{ margin: '0 0 12px', fontSize: 13.5, fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>
                {t('promotions.termsAndConditionsHeader', 'Términos y condiciones:')}
              </h5>

              <ul style={{ margin: 0, paddingLeft: 18, listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: c?.textSecondary || '#64748b', lineHeight: 1.5 }}>
                <li>{t('promotions.termsDigitalPayments', 'Válido para pagos digitales e iniciales.')}</li>
                <li>{t('promotions.termsNonTransferable', 'No transferible a otros usuarios.')}</li>
                <li>{t('promotions.termsOnePerReservation', 'Solo se puede aplicar un cupón por reserva.')}</li>
                <li>
                  {t('promotions.termsValidCategories', 'Categorías válidas:')}{' '}
                  <strong style={{ color: c?.textPrimary || '#0f172a' }}>
                    {(selectedPromoCondiciones.categoriaVehiculo || 'TODOS').toUpperCase()}
                  </strong>
                </li>
                {selectedPromoCondiciones.reservaMinima > 0 ? (
                  <li>
                    {t('promotions.termsMinAmount', 'Requiere un monto mínimo de reserva de')} ${Number(selectedPromoCondiciones.reservaMinima).toLocaleString('es-CO')} COP. {t('promotions.termsNonCumulative', 'No acumulable con otras promociones.')}
                  </li>
                ) : (
                  <li>
                    {t('promotions.termsGeneralConditions', 'Válido para vehículos de la flota. No acumulable con otras promociones.')}
                  </li>
                )}
                <li>
                  {t('promotions.termsExpires', 'Vence:')}{' '}
                  <strong style={{ color: c?.textPrimary || '#0f172a' }}>
                    {formatearFechaExp(selectedPromoCondiciones.fechaFin)}
                  </strong>
                </li>
              </ul>
            </div>

            <div style={{ padding: '16px 24px', borderTop: `1px solid ${c?.cardBorder || '#e2e8f0'}` }}>
              <button
                type="button"
                onClick={() => setSelectedPromoCondiciones(null)}
                style={{
                  width: '100%',
                  background: 'var(--brand-gradient)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 24px',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(var(--brand-secondary-rgb), 0.25)'
                }}
              >
                {t('common.understood', 'Entendido')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="confirmar-reserva-bloque" style={{ 
        background: 'var(--brand-gradient)',
        borderRadius: 16, 
        padding: '24px 32px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: 24, 
        flexWrap: 'wrap', 
        boxShadow: '0 12px 32px rgba(var(--brand-secondary-rgb),0.25)'
      }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--brand-border-light)', fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('vehiculo.totalToPay')}</p>
          <p style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>{formatCurrency(total, moneda)}</p>
          <p style={{ fontSize: 11, color: 'var(--brand-border-light)', margin: '6px 0 0' }}>{t('vehiculo.taxesIncluded')}</p>
        </div>
        <button
          onClick={onReservar}
          style={{ 
            padding: '16px 40px', 
            borderRadius: 12, 
            background: '#ffffff', 
            color: 'var(--brand-text)',
            fontWeight: 900, 
            fontSize: 16, 
            border: 'none', 
            cursor: 'pointer', 
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)', 
            whiteSpace: 'nowrap', 
            transition: 'transform 200ms ease' 
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {t('vehiculo.confirmReserve')} →
        </button>
      </div>
    </div>
  );
}
