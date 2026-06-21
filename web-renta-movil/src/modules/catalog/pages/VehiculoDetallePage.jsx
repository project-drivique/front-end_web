import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../../store/authStore'
import logo from '@/assets/logo.png'
import VEHICULOS_MOCK from '@/mocks/vehiculos.json'

import GaleriaImagenes from '../components/detalle/GaleriaImagenes'
import InfoVehiculo from '../components/detalle/InfoVehiculo'
import PlanesProteccion from '../components/detalle/PlanesProteccion'
import ResumenLateral from '../components/detalle/ResumenLateral'
import DatosPersonales from '../components/detalle/DatosPersonales'
import ModalEditarReserva from '../components/detalle/ModalEditarReserva'

const IcoCheck = ({ color = '#16a34a', sz = 15 }) => (
  <svg width={sz} height={sz} fill="none" stroke={color} strokeWidth="2.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
  </svg>
)
const IcoBack = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
  </svg>
)
const IcoArrow = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
  </svg>
)

export default function VehiculoDetallePage() {
  const { t } = useTranslation()
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { usuario }  = useAuthStore();

  const vehiculo = VEHICULOS_MOCK.find(v => v.id === Number(id));

  const [pantalla,    setPantalla]   = useState(1);
  const [seguroIdx,   setSeguroIdx]  = useState(0);
  const [reserva,     setReserva]    = useState({
       fechaInicio: '', fechaFin: '',
    horaInicio: '09:00', horaFin: '09:00',
    sucursalRetiro: 'Centro',
    sucursalDevolucion: 'Centro',
    tipoKm: 'limitado',
  });
  const [modalEditar, setModalEditar] = useState(null);
  const [datosForm,   setDatosForm]   = useState({
    nombre: '', correo: '', celular: '',
    nacionalidad: 'Colombia', tipoDoc: 'CC', numDoc: '',
    vuelo: false, numVuelo: '', terminos: false,
  });
  const [errores,  setErrores]  = useState({});
  const [exito,    setExito]    = useState(false);
  const prellenado = useRef(false);

  useEffect(() => {
    if (!usuario || prellenado.current) return
    prellenado.current = true
    const tel = (usuario.telefono || '').replace(/\D/g, '')
    const celular = tel.startsWith('57') && tel.length > 10 ? tel.slice(2) : tel
    setDatosForm(prev => ({
      ...prev,
      nombre:  [usuario.nombre, usuario.apellido].filter(Boolean).join(' '),
      correo:  usuario.correo  || '',
      celular,
      numDoc:  usuario.cedula  || '',
    }))
  }, [usuario]);

  if (!vehiculo) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--texto-primary)' }}>{t('vehiculo.notFound')}</p>
      <Link to="/catalogo" style={{ color: '#1e3a8a', fontWeight: 700, fontSize: 14 }}>← {t('vehiculo.backToCatalog')}</Link>
    </div>
  );

  const handleReservar = () => {
    const e = {};
    if (!datosForm.nombre.trim())                                                     e.nombre   = t('vehiculo.errors.nameRequired');
    if (!datosForm.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosForm.correo)) e.correo   = t('vehiculo.errors.emailInvalid');
    if (!datosForm.celular.trim() || datosForm.celular.length < 10)                   e.celular  = t('vehiculo.errors.phoneInvalid');
    if (!datosForm.numDoc.trim())                                                     e.numDoc   = t('vehiculo.errors.docRequired');
    if (!datosForm.terminos)                                                          e.terminos = t('vehiculo.errors.termsRequired');

    setErrores(e);
    if (Object.keys(e).length > 0) return;

    setExito(true);
    setTimeout(() => navigate('/catalogo'), 3500);
  };

  if (exito) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 12px 32px rgba(30,58,138,0.28)' }}>
          <IcoCheck color="#fff" sz={36} />
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--texto-primary)', margin: '0 0 12px' }}>{t('vehiculo.successTitle')}</h2>
        <p style={{ fontSize: 16, color: 'var(--texto-second)', margin: '0 0 8px' }}>{t('vehiculo.successVehicle', { nombre: vehiculo.nombre })}</p>
        <p style={{ fontSize: 14, color: 'var(--texto-second)' }}>{t('vehiculo.successRedirecting')}</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--bg-tarjeta)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--borde)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', height: 72 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/"><img src={logo} alt="Drivique" style={{ height: 42 }} /></Link>
          <div style={{ flex: 1 }} />
          {!usuario && (
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/login"    style={{ padding: '10px 20px', borderRadius: 9999, border: '2px solid #bfdbfe', color: '#1e3a8a', fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'all 200ms ease' }}>{t('catalogo.signIn')}</Link>
              <Link to="/registro" style={{ padding: '10px 20px', borderRadius: 9999, background: '#1e3a8a', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'all 200ms ease' }}>{t('catalogo.signUp')}</Link>
            </div>
          )}
        </div>
      </nav>

      <div style={{ paddingTop: 72 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <button
              onClick={() => pantalla === 1 ? navigate('/catalogo') : setPantalla(1)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#1e3a8a', fontWeight: 700, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 9999, padding: '8px 18px', cursor: 'pointer', transition: 'all 200ms ease' }}
              onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
              onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
            >
              <IcoBack /> {pantalla === 1 ? t('vehiculo.backToCatalog') : t('vehiculo.backToProtection')}
            </button>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--texto-primary)', margin: 0 }}>{t('vehiculo.reserve')} — {vehiculo.nombre}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 36 }}>
            {[t('vehiculo.stepProtection'), t('vehiculo.personalData')].map((label, i) => {
              const num = i + 1;
              const activo      = pantalla === num;
              const completado  = pantalla > num;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 15,
                      background: completado ? '#1e3a8a' : activo ? 'linear-gradient(135deg,#1e3a8a,#2563eb)' : 'var(--bg-item)',
                      color: completado || activo ? '#fff' : 'var(--texto-second)',
                      boxShadow: activo ? '0 8px 24px rgba(37,99,235,0.25)' : 'none',
                      transition: 'all 300ms ease'
                    }}>
                      {completado ? <IcoCheck color="#fff" sz={18} /> : num}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: activo ? 800 : 600, color: activo ? '#1e3a8a' : 'var(--texto-second)', whiteSpace: 'nowrap' }}>{label}</span>
                  </div>
                  {i < 1 && <div style={{ width: 100, height: 3, background: pantalla > 1 ? '#1e3a8a' : 'var(--borde)', margin: '0 12px', marginBottom: 20, transition: 'background 400ms ease' }} />}
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
                  <PlanesProteccion seguroIdx={seguroIdx} onSeleccionar={setSeguroIdx} />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
                    <button
                      onClick={() => { setPantalla(2); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 40px', borderRadius: 16, background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', color: '#fff', fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.28)', transition: 'transform 200ms ease' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {t('vehiculo.continueData')} <IcoArrow />
                    </button>
                  </div>
                </>
              )}

              {pantalla === 2 && (
                <DatosPersonales
                  vehiculo={vehiculo}
                  reserva={reserva}
                  seguroIdx={seguroIdx}
                  datosForm={datosForm}
                  onCambio={(k, v) => setDatosForm(p => ({ ...p, [k]: v }))}
                  onReservar={handleReservar}
                  errores={errores}
                />
              )}

            </div>

            <ResumenLateral
              vehiculo={vehiculo}
              reserva={reserva}
              seguroIdx={seguroIdx}
              onEditar={tipo => setModalEditar(tipo)}
            />
          </div>

        </div>
      </div>

      {modalEditar && (
        <ModalEditarReserva
          tipo={modalEditar}
          reserva={reserva}
          vehiculo={vehiculo}
          onGuardar={nuevoEstado => setReserva(nuevoEstado)}
          onCerrar={() => setModalEditar(null)}
        />
      )}
    </div>
  );
}
