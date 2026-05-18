// src/modules/auth/pages/RegistroPage.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegistro } from '../hooks/useRegistro'
import { useRegistroSocial } from '../hooks/useRegistroSocial'
import logo from '@/assets/logo/logo.png'

/* ── Estilos base ── */
const inputStyle = (hasError) => ({
  width: '100%', padding: '11px 14px', borderRadius: '10px',
  border: `1.5px solid ${hasError ? '#f87171' : '#e2e8f0'}`,
  background: hasError ? '#fef2f2' : '#f8fafc',
  fontSize: '13px', color: '#1e293b', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 150ms',
})
const labelStyle = { fontSize: '13px', fontWeight: 700, color: '#374151' }
const errorStyle = { color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }
const fieldWrap  = { display: 'flex', flexDirection: 'column', gap: '5px' }

/* ── Modal Términos y Condiciones ── */
function ModalTerminos({ onCerrar, onAceptar }) {
  const clausulas = [
    { num: '1', titulo: 'Objeto', texto: 'RentaMóvil presta el servicio de arrendamiento de vehículos a personas naturales mayores de 18 años con licencia de conducción vigente. La relación contractual se perfecciona mediante la aceptación electrónica de estos términos, conforme al artículo 14 de la Ley 527 de 1999 (comercio electrónico).' },
    { num: '2', titulo: 'Tratamiento de datos personales — Ley 1581 de 2012', texto: 'En cumplimiento de la Ley Estatutaria 1581 de 2012 y el Decreto Reglamentario 1377 de 2013, RentaMóvil, identificada con NIT 900.XXX.XXX-X, actúa como Responsable del Tratamiento de sus datos personales. Los datos recolectados (correo electrónico) se utilizarán exclusivamente para: (i) prestación del servicio de arrendamiento, (ii) envío de confirmaciones y notificaciones, (iii) cumplimiento de obligaciones legales. No se transferirán a terceros sin su autorización previa, salvo mandato judicial o legal. Puede ejercer sus derechos de acceso, corrección, supresión y revocación escribiendo a privacidad@rentamovil.com.' },
    { num: '3', titulo: 'Veracidad de la información y responsabilidad del usuario', texto: 'El usuario declara bajo juramento que la información suministrada es verídica y actual. El suministro de datos falsos constituye una conducta punible conforme al artículo 286 del Código Penal colombiano (falsedad en documento privado, pena de 1 a 6 años de prisión). RentaMóvil queda exonerada de toda responsabilidad civil y penal derivada de información falsa o suplantación de identidad, al tenor del artículo 1604 del Código Civil.' },
    { num: '4', titulo: 'Seguridad de la cuenta', texto: 'El usuario es el único responsable de la custodia de sus credenciales de acceso (correo y contraseña). Cualquier actividad realizada con dichas credenciales se presumirá efectuada por el titular de la cuenta. En caso de compromiso de seguridad, el usuario deberá notificarlo de inmediato a soporte@rentamovil.com.' },
    { num: '5', titulo: 'Validez de la aceptación electrónica', texto: 'La marcación del casillero "Acepto los términos y condiciones" constituye una firma electrónica válida con plena eficacia jurídica, de conformidad con los artículos 7 y 14 de la Ley 527 de 1999. Esta aceptación queda registrada con fecha, hora y dirección IP para efectos probatorios.' },
    { num: '6', titulo: 'Modificaciones', texto: 'RentaMóvil podrá modificar estos términos notificando al correo registrado con al menos 15 días de antelación. El uso continuado de la plataforma tras dicho plazo implica la aceptación de los cambios.' },
    { num: '7', titulo: 'Ley aplicable y jurisdicción', texto: 'El presente acuerdo se rige por las leyes de la República de Colombia. Cualquier controversia será resuelta ante los jueces competentes de la ciudad de Bogotá D.C., con renuncia expresa a cualquier otro fuero.' },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '620px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '22px 28px', background: 'linear-gradient(135deg,#0f1a3d,#1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, margin: '0 0 3px' }}>Términos y Condiciones — RentaMóvil</h2>
            <p style={{ color: 'rgba(191,219,254,0.75)', fontSize: '12px', margin: 0 }}>Lea detenidamente antes de aceptar · Ley 1581/2012 · Ley 527/1999</p>
          </div>
          <button onClick={onCerrar} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: '8px', padding: '6px 10px', fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '28px', flex: 1 }}>
          {clausulas.map(({ num, titulo, texto }) => (
            <div key={num} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>{num}. {titulo}</p>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.75, margin: 0 }}>{texto}</p>
            </div>
          ))}
          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
            Al aceptar, declara haber leído y comprendido estos términos en su totalidad. Esta aceptación tiene plena validez legal conforme a la <strong style={{ color: '#64748b' }}>Ley 527 de 1999</strong> y la <strong style={{ color: '#64748b' }}>Ley 1581 de 2012</strong>.
          </p>
        </div>
        <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end', background: '#fafafa' }}>
          <button onClick={onCerrar} style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Cerrar</button>
          <button onClick={onAceptar} style={{ padding: '10px 24px', borderRadius: '10px', background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', color: '#fff', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(30,58,138,0.25)' }}>Acepto los términos</button>
        </div>
      </div>
    </div>
  )
}

/* ── Indicador de fortaleza de contraseña ── */
function ChecklistPassword({ password }) {
  if (!password) return null
  const reglas = [
    { id: 'len', label: 'Mínimo 8 caracteres',          ok: password.length >= 8 },
    { id: 'may', label: 'Al menos una mayúscula (A-Z)', ok: /[A-Z]/.test(password) },
    { id: 'min', label: 'Al menos una minúscula (a-z)', ok: /[a-z]/.test(password) },
    { id: 'num', label: 'Al menos un número (0-9)',     ok: /\d/.test(password) },
    { id: 'esp', label: 'Al menos un símbolo (!@#…)',   ok: /[^a-zA-Z\d]/.test(password) },
  ]
  const cumplidas = reglas.filter(r => r.ok).length
  const colores = ['#e2e8f0', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']
  const textos  = ['', 'Muy débil', 'Débil', 'Regular', 'Buena', 'Segura']
  const color   = colores[cumplidas]
  return (
    <div style={{ marginTop: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ height: '4px', flex: 1, borderRadius: '9999px', background: i <= cumplidas ? color : '#e2e8f0', transition: 'all 300ms' }} />
        ))}
      </div>
      {cumplidas > 0 && <p style={{ fontSize: '11px', fontWeight: 700, color, margin: '0 0 8px' }}>{textos[cumplidas]}</p>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {reglas.map(r => (
          <li key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px' }}>
            <span style={{ width: '15px', height: '15px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: r.ok ? '#dcfce7' : '#f1f5f9', fontSize: '9px', fontWeight: 700, color: r.ok ? '#16a34a' : '#94a3b8' }}>{r.ok ? '✓' : '·'}</span>
            <span style={{ color: r.ok ? '#15803d' : '#64748b', fontWeight: r.ok ? 600 : 400 }}>{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── Input de contraseña con ojo ── */
function PassInput({ id, value, onChange, ver, setVer, hasError, placeholder }) {
  return (
    <div style={{ position: 'relative' }}>
      <input id={id} type={ver ? 'text' : 'password'} value={value} onChange={onChange}
        placeholder={placeholder || ''} style={{ ...inputStyle(hasError), paddingRight: '44px' }} />
      <button type="button" onClick={() => setVer(v => !v)}
        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
        {ver
          ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
          : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        }
      </button>
    </div>
  )
}

/* ── Spinner ── */
function SpinnerBtn() {
  return <span style={{ width: '16px', height: '16px', border: '2px solid #e2e8f0', borderTopColor: '#64748b', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
}

/* ── Botones sociales en fila ── */
function BotonesSocial({ onGoogle, onFacebook, cargandoGoogle, cargandoFacebook, deshabilitado }) {
  const baseBtn = {
    flex: 1, padding: '11px 8px', borderRadius: '12px',
    border: '1.5px solid #e2e8f0', background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    fontWeight: 600, fontSize: '13px', cursor: 'pointer',
    transition: 'all 150ms', color: '#1e293b',
  }
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button type="button" onClick={onGoogle}
        disabled={deshabilitado || cargandoGoogle || cargandoFacebook}
        style={{ ...baseBtn, opacity: (deshabilitado || cargandoGoogle || cargandoFacebook) ? 0.6 : 1 }}
        onMouseEnter={e => { if (!deshabilitado) { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc' }}}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff' }}>
        {cargandoGoogle ? <SpinnerBtn /> : (
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.09-6.09C34.46 3.09 29.53 1 24 1 14.82 1 7.07 6.48 3.64 14.18l7.09 5.51C12.4 13.67 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.15 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h12.44c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.59C43.16 37.13 46.15 31.29 46.15 24.5z"/>
            <path fill="#FBBC05" d="M10.73 28.31A14.6 14.6 0 019.5 24c0-1.49.26-2.93.73-4.31L3.14 14.18A22.94 22.94 0 001 24c0 3.57.85 6.95 2.36 9.95l7.37-5.64z"/>
            <path fill="#34A853" d="M24 47c5.53 0 10.17-1.83 13.56-4.97l-7.19-5.59c-1.84 1.24-4.2 1.97-6.37 1.97-6.26 0-11.6-4.17-13.27-9.78l-7.37 5.64C7.07 41.52 14.82 47 24 47z"/>
          </svg>
        )}
        {cargandoGoogle ? 'Conectando…' : 'Google'}
      </button>
      <button type="button" onClick={onFacebook}
        disabled={deshabilitado || cargandoGoogle || cargandoFacebook}
        style={{ ...baseBtn, opacity: (deshabilitado || cargandoGoogle || cargandoFacebook) ? 0.6 : 1 }}
        onMouseEnter={e => { if (!deshabilitado) { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc' }}}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff' }}>
        {cargandoFacebook ? <SpinnerBtn /> : (
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#1877F2" d="M48 24C48 10.745 37.255 0 24 0S0 10.745 0 24c0 11.979 8.776 21.908 20.25 23.708V30.938h-6.094V24h6.094v-5.288c0-6.014 3.583-9.337 9.065-9.337 2.625 0 5.372.469 5.372.469v5.906h-3.026c-2.981 0-3.911 1.85-3.911 3.75V24h6.656l-1.064 6.938H27.75v16.77C39.224 45.908 48 35.979 48 24z"/>
            <path fill="#fff" d="M33.342 30.938 34.406 24H27.75v-4.5c0-1.899.93-3.75 3.911-3.75h3.026V9.844s-2.747-.469-5.372-.469c-5.482 0-9.065 3.323-9.065 9.337V24h-6.094v6.938h6.094v16.77a24.18 24.18 0 007.5 0V30.938h5.592z"/>
          </svg>
        )}
        {cargandoFacebook ? 'Conectando…' : 'Facebook'}
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════ */
export default function RegistroPage() {
  const navigate = useNavigate()
  const exitoRef = useRef(null)
  const { registrar, cargando, exito, error } = useRegistro()

  const [correo,       setCorreo]       = useState('')
  const [password,     setPassword]     = useState('')
  const [confirmar,    setConfirmar]    = useState('')
  const [terminos,     setTerminos]     = useState(false)
  const [verPass,      setVerPass]      = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [errores,      setErrores]      = useState({})

  const {
    cargandoGoogle, cargandoFacebook, errorSocial,
    proveedorExito, iniciarGoogle, iniciarFacebook,
  } = useRegistroSocial({
    onExito: () => {
      exitoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => navigate('/home'), 2000)
    },
  })

  const exitoFinal = exito || !!proveedorExito

  useEffect(() => {
    if (exito) {
      exitoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const t = setTimeout(() => navigate('/login'), 3000)
      return () => clearTimeout(t)
    }
  }, [exito, navigate])

  const validar = () => {
    const e = {}
    const rxCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!correo.trim())              e.correo = 'El correo electrónico es obligatorio'
    else if (!rxCorreo.test(correo)) e.correo = 'Formato de correo inválido'
    if (!password)                   e.password = 'La contraseña es obligatoria'
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/.test(password))
                                     e.password = 'La contraseña no cumple los requisitos de seguridad'
    if (!confirmar)                  e.confirmar = 'Confirme su contraseña'
    else if (password !== confirmar) e.confirmar = 'Las contraseñas no coinciden'
    if (!terminos)                   e.terminos = 'Debe aceptar los términos y condiciones para continuar'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validar()
    if (Object.keys(found).length > 0) { setErrores(found); return }
    setErrores({})
    await registrar({ correo, contrasena: password })
  }

  return (
    <>
      {modalAbierto && (
        <ModalTerminos
          onCerrar={() => setModalAbierto(false)}
          onAceptar={() => { setTerminos(true); setModalAbierto(false); setErrores(prev => ({ ...prev, terminos: '' })) }}
        />
      )}

      <div style={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>

        {/* ── PANEL IZQUIERDO — 42% ── */}
        <div className="lg-left" style={{ display: 'none', width: '42%', flexDirection: 'column', background: 'linear-gradient(160deg,#060e2e 0%,#0c1f5c 50%,#1e3a8a 100%)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <style>{`@media(min-width:1024px){.lg-left{display:flex !important}}`}</style>
          <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }} />
          <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '340px', height: '340px', borderRadius: '50%', background: 'rgba(99,102,241,0.08)' }} />
          <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 36px', textAlign: 'center', gap: '24px' }}>
            <img src={logo} alt="RentaMóvil" style={{ height: '52px', filter: 'brightness(0) invert(1)' }} />
            <div>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 900, margin: '0 0 8px' }}>Únete a RentaMóvil</h2>
              <p style={{ color: 'rgba(191,219,254,0.7)', fontSize: '13px', lineHeight: 1.6, maxWidth: '240px', margin: '0 auto' }}>
                Crea tu cuenta en minutos y empieza a reservar el vehículo que necesitas.
              </p>
            </div>
            <span></span>
            {/* ── Tarjetas compactas ── */}
            <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { icon: '✅', text: 'Registro rápido y seguro' },
                { icon: '💳', text: 'PSE, Nequi y tarjetas' },
                { icon: '📄', text: 'Contratos digitales al instante' },
                { icon: '🎧', text: 'Soporte 24/7' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
                  <p style={{ color: '#fff', fontSize: '13px', fontWeight: 600, margin: 0, textAlign: 'left' }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 1, padding: '12px 36px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <p style={{ color: 'rgba(147,197,253,0.35)', fontSize: '11px', margin: 0 }}>RentaMóvil © 2026</p>
          </div>
        </div>

        {/* ── PANEL DERECHO ── */}
        <div style={{ flex: 1, background: '#f8fafc', overflowY: 'auto', height: '100%' }}>
          <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>

            {/* Logo mobile */}
            <div className="logo-mob" style={{ marginBottom: '20px' }}>
              <style>{`@media(min-width:1024px){.logo-mob{display:none}}`}</style>
              <img src={logo} alt="RentaMóvil" style={{ height: '44px', display: 'block', margin: '0 auto' }} />
            </div>

            {/* ── VOLVER — alineado con la card, encima de ella ── */}
            <div style={{ width: '100%', maxWidth: '460px', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '13px', fontWeight: 500, padding: 0 }}
                onMouseEnter={e => { e.currentTarget.style.color = '#1e3a8a' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#64748b' }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Volver al inicio
              </button>
            </div>

            {/* ── CARD ── */}
            <div style={{ width: '100%', maxWidth: '460px', background: '#fff', borderRadius: '24px', boxShadow: '0 4px 32px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9', padding: '36px' }}>

              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>Crear cuenta</h1>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Complete los campos para registrarse</p>
              </div>

              {/* ── ALERTA ÉXITO ── */}
              {exitoFinal && (
                <div ref={exitoRef} style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #86efac', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <svg style={{ width: '20px', height: '20px', color: '#16a34a', flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p style={{ color: '#15803d', fontSize: '14px', fontWeight: 700, margin: '0 0 2px' }}>¡Registro exitoso!</p>
                    <p style={{ color: '#16a34a', fontSize: '13px', margin: 0 }}>
                      {proveedorExito
                        ? `Cuenta vinculada con ${proveedorExito === 'google' ? 'Google' : 'Facebook'} correctamente. Será redirigido en unos segundos.`
                        : 'Su cuenta fue creada correctamente. Será redirigido al inicio de sesión en unos segundos.'
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* ── ALERTA ERROR ── */}
              {(error || errorSocial) && !exitoFinal && (
                <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fca5a5', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <svg style={{ width: '20px', height: '20px', color: '#dc2626', flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p style={{ color: '#b91c1c', fontSize: '14px', fontWeight: 700, margin: '0 0 2px' }}>Registro fallido</p>
                    <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{error || errorSocial}</p>
                  </div>
                </div>
              )}

              {/* ── FORMULARIO ── */}
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div style={fieldWrap}>
                  <label htmlFor="correo" style={labelStyle}>Correo electrónico <span style={{ color: '#1e3a8a' }}>*</span></label>
                  <input id="correo" type="email" value={correo}
                    onChange={e => { setCorreo(e.target.value); setErrores(p => ({ ...p, correo: '' })) }}
                    placeholder="ejemplo@correo.com" style={inputStyle(!!errores.correo)} />
                  {errores.correo && <p style={errorStyle}>{errores.correo}</p>}
                </div>

                <div style={fieldWrap}>
                  <label htmlFor="password" style={labelStyle}>Contraseña <span style={{ color: '#1e3a8a' }}>*</span></label>
                  <PassInput id="password" value={password}
                    onChange={e => { setPassword(e.target.value); setErrores(p => ({ ...p, password: '' })) }}
                    ver={verPass} setVer={setVerPass} hasError={!!errores.password} placeholder="Mínimo 8 caracteres" />
                  {errores.password && <p style={errorStyle}>{errores.password}</p>}
                  <ChecklistPassword password={password} />
                </div>

                <div style={fieldWrap}>
                  <label htmlFor="confirmar" style={labelStyle}>Confirmar contraseña <span style={{ color: '#1e3a8a' }}>*</span></label>
                  <PassInput id="confirmar" value={confirmar}
                    onChange={e => { setConfirmar(e.target.value); setErrores(p => ({ ...p, confirmar: '' })) }}
                    ver={verConfirmar} setVer={setVerConfirmar} hasError={!!errores.confirmar} placeholder="Repita su contraseña" />
                  {errores.confirmar && <p style={errorStyle}>{errores.confirmar}</p>}
                </div>

                {/* Términos — checkbox alineado */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <input type="checkbox" id="terminos" checked={terminos}
                    onChange={e => { setTerminos(e.target.checked); setErrores(p => ({ ...p, terminos: '' })) }}
                    style={{ width: '15px', height: '15px', marginTop: '3px', cursor: 'pointer', accentColor: '#1e3a8a', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <label htmlFor="terminos" style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, cursor: 'pointer', display: 'block' }}>
                      Acepto los{' '}
                      <span onClick={e => { e.preventDefault(); setModalAbierto(true) }}
                        style={{ color: '#1e3a8a', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}>
                        términos y condiciones
                      </span>
                      {' '}y el tratamiento de mis datos personales según la{' '}
                      <span style={{ fontWeight: 600 }}>Ley 1581 de 2012</span>.
                    </label>
                    {errores.terminos && <p style={errorStyle}>{errores.terminos}</p>}
                  </div>
                </div>

                {/* Botón crear cuenta */}
                <button type="submit" disabled={cargando || exitoFinal}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px',
                    background: exitoFinal ? 'linear-gradient(90deg,#15803d,#16a34a)' : 'linear-gradient(90deg,#1e3a8a,#2563eb)',
                    color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none',
                    cursor: (cargando || exitoFinal) ? 'not-allowed' : 'pointer',
                    opacity: (cargando || exitoFinal) ? 0.8 : 1,
                    boxShadow: '0 4px 16px rgba(30,58,138,0.25)', transition: 'all 300ms',
                  }}>
                  {cargando
                    ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                        Procesando…
                      </span>
                    : exitoFinal ? '✓ Registro completado' : 'Crear mi cuenta'
                  }
                </button>

                {/* Botones sociales */}
                <BotonesSocial
                  onGoogle={iniciarGoogle} onFacebook={iniciarFacebook}
                  cargandoGoogle={cargandoGoogle} cargandoFacebook={cargandoFacebook}
                  deshabilitado={exitoFinal}
                />

                {/* Divisor + login */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', margin: 0 }}>
                    ¿Ya tiene una cuenta?{' '}
                    <Link to="/login" style={{ color: '#1e3a8a', fontWeight: 700, textDecoration: 'none' }}>Inicie sesión aquí</Link>
                  </p>
                </div>

              </form>
            </div>
          </div>
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}