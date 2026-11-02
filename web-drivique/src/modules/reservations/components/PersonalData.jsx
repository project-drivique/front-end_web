import { diasDeAlquiler } from '../utils/pricing';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanding } from '../../landing/LandingContext';

import { getNombreTipoDoc } from '@/utils/documentUtils'

import paisesMock from '@/config/datos/nationalities.json';
import SecurityCaptcha from './SecurityCaptcha';
import { captchaTokenStore } from '../../../services/captchaTokenStore';
import VerTyC from './PersonalData/VerTyC'
import ModalCancelar from './PersonalData/ModalCancelar'
import PersonalDataPart5 from './PersonalData/PersonalDataPart5'
import PersonalDataPart4 from './PersonalData/PersonalDataPart4'
import PersonalDataPart3 from './PersonalData/PersonalDataPart3'
import PersonalDataPart2 from './PersonalData/PersonalDataPart2'
import PersonalDataPart from './PersonalData/PersonalDataPart'

const getPrefijoPais = (nacionalidad) => {
  if (!nacionalidad) return '';
  const p = paisesMock.find(item => item.nombre.toLowerCase() === String(nacionalidad).toLowerCase());
  return p?.prefijo || '';
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
  cotizacion,
  procesando = false,
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

  // Estado y referencia para la verificación CAPTCHA anti-bot
  const [captchaVerificado, setCaptchaVerificado] = useState(false);
  const [errorCaptcha, setErrorCaptcha] = useState(false);
  const captchaRef = useRef(null);
  const captchaDesactivado = useRef(false);

  const handleConfirmarConCaptcha = () => {
    // Se exige un token vigente del captcha (no solo la marca visual): el servidor lo valida
    if (!captchaVerificado || (!captchaTokenStore.get() && !captchaDesactivado.current)) {
      setErrorCaptcha(true);
      if (captchaRef.current) {
        captchaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setErrorCaptcha(false);
    if (onReservar) {
      onReservar();
    }
  };

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
        setCedulaError(t('hc2.el_archivo_debe_ser_en_formato_pdf', 'El archivo debe ser en formato PDF.'));
      } else {
        setLicenciaError(t('hc2.el_archivo_debe_ser_en_formato_pdf', 'El archivo debe ser en formato PDF.'));
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
      ];
    }
    return [
      { value: 'PASAPORTE', label: t('vehiculo.docTypes.passport', 'Pasaporte (PAS)') },
      { value: 'CE', label: t('vehiculo.docTypes.ce', 'Cédula de Extranjería (CE)') },
    ];
  }, [datosForm.nacionalidad, t]);

  const handleCambioNacionalidad = (nuevoPais) => {
    onCambio('nacionalidad', nuevoPais);
    if (nuevoPais) {
      const esCol = nuevoPais.toLowerCase() === 'colombia';
      const validos = esCol
        ? ['CC', 'CE', 'PASAPORTE']
        : ['PASAPORTE', 'CE'];
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
  const tarifaDiaria = Number(vehiculo.precio ?? vehiculo.dailyRate ?? vehiculo.tarifaDiaria ?? 0);
  const precio = tarifaDiaria + (reserva.tipoKm === 'ilimitado'
    ? Number(kmIlimit.precio || 0)
    : (reserva.tipoKm === 'limitado' ? Number(kmLimit.precio || 0) : 0));

  const dias = diasDeAlquiler(reserva);

  const precioSeg = seguroIdx !== null ? Number(vehiculo.seguros[seguroIdx]?.precio ?? vehiculo.seguros[seguroIdx]?.dailyRate ?? vehiculo.seguros[seguroIdx]?.price ?? 0) : 0;
  const precioServicios = (vehiculo.servicios || [])
    .filter(s => serviciosSeleccionados.includes(s.nombre))
    .reduce((suma, s) => suma + Number(s?.precio ?? s?.dailyRate ?? s?.price ?? 0), 0);

  const subtotal = precio * dias;
  const subtotalSeg = precioSeg * dias;
  const subtotalServicios = precioServicios * dias;
  // El total (cargo administrativo, IVA y descuento incluidos) lo calcula el servidor
  const total = cotizacion ? Number(cotizacion.estimatedTotal) : subtotal + subtotalSeg + subtotalServicios;

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
      <PersonalDataPart c={c} datosForm={datosForm} docsDisponibles={docsDisponibles} errores={errores} handleCambioNacionalidad={handleCambioNacionalidad} inputStyle={inputStyle} onCambio={onCambio} prefijoActual={prefijoActual} sectionCardStyle={sectionCardStyle} t={t} />

      <PersonalDataPart2 c={c} cedulaCargando={cedulaCargando} cedulaError={cedulaError} datosForm={datosForm} docsVerificados={docsVerificados} errores={errores} handleUpload={handleUpload} licenciaCargando={licenciaCargando} licenciaError={licenciaError} nombreDocSeleccionado={nombreDocSeleccionado} onCambio={onCambio} sectionCardStyle={sectionCardStyle} t={t} />


      <PersonalDataPart3 c={c} datosForm={datosForm} errores={errores} headerStyle={headerStyle} onCambio={onCambio} sectionCardStyle={sectionCardStyle} setVerTyC={setVerTyC} t={t} terminosLeidos={terminosLeidos} />

      {/* ── Aviso informativo de confirmación ── */}
      <PersonalDataPart4 c={c} reserva={reserva} t={t} />

      {/* ── Verificación de Seguridad Anti-Bot (CAPTCHA) ── */}
      <div ref={captchaRef} style={{ marginBottom: 20 }}>
        <SecurityCaptcha
          isVerified={captchaVerificado}
          onVerified={(verified, token) => {
            captchaDesactivado.current = Boolean(verified && !token);
            setCaptchaVerificado(verified);
            if (verified) setErrorCaptcha(false);
          }}
          hasError={errorCaptcha}
          c={c}
        />
      </div>

      {/* ── Tarjeta Total a Pagar y Acciones ── */}
      <PersonalDataPart5 c={c} handleConfirmarConCaptcha={handleConfirmarConCaptcha} moneda={moneda} procesando={procesando} setModalCancelar={setModalCancelar} t={t} total={total} />

      {/* Modal Confirmación Cancelar Reserva */}
      {modalCancelar && (
        <ModalCancelar c={c} navigate={navigate} onCancelar={onCancelar} setModalCancelar={setModalCancelar} t={t} />
      )}

      {verTyC && (
        <VerTyC c={c} handleTermsScroll={handleTermsScroll} hasScrolledToBottom={hasScrolledToBottom} onCambio={onCambio} setTerminosLeidos={setTerminosLeidos} setVerTyC={setVerTyC} t={t} termsScrollRef={termsScrollRef} />
      )}


    </div>
  );
}
