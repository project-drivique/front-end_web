import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegistro } from '../hooks/useRegistro'
import logo from "@/assets/logo/logo.png"

const inputStyle = (hasError) => ({
  width: '100%', padding: '11px 14px', borderRadius: '10px',
  border: hasError ? '1.5px solid #f87171' : '1.5px solid #e2e8f0',
  background: hasError ? '#fef2f2' : '#f8fafc',
  fontSize: '13px', color: '#1e293b', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 150ms',
})
const labelStyle = { fontSize: '13px', fontWeight: 700, color: '#374151' }
const hintStyle  = { fontSize: '11px', color: '#94a3b8', margin: '5px 0 0', lineHeight: 1.4 }
const errorStyle = { color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }
const fieldWrap  = { display: 'flex', flexDirection: 'column', gap: '5px' }

function ModalTerminos({ onCerrar, onAceptar }) {
  const terminos = [
    { num: '1', titulo: 'Objeto del contrato', texto: 'RentaMóvil presta el servicio de arrendamiento de vehículos a personas naturales mayores de 18 años con licencia de conducción vigente. El contrato se formaliza digitalmente al completar la reserva.' },
    { num: '2', titulo: 'Política de no reembolso', texto: 'Una vez confirmada la reserva no se realizan reembolsos bajo ninguna circunstancia. Las cancelaciones generan un cobro del 100 % del valor del arriendo. En casos de fuerza mayor certificados, RentaMóvil podrá ofrecer un crédito a favor a su exclusivo criterio.' },
    { num: '3', titulo: 'Veracidad de la información y exoneración por datos falsos', texto: 'El usuario declara bajo gravedad de juramento que toda la información suministrada es verídica. El suministro de datos falsos, alterados o falsificados constituye una conducta punible conforme al Artículo 286 del Código Penal colombiano (Falsedad en documento privado), con penas de 1 a 6 años de prisión. RentaMóvil queda expresamente exonerada de toda responsabilidad civil, penal y administrativa derivada de información falsa, suplantación de identidad o fraude por parte del usuario, conforme al Artículo 1604 del Código Civil y la Ley 527 de 1999.' },
    { num: '4', titulo: 'Responsabilidad del arrendatario', texto: 'El usuario es el único responsable de la conducción del vehículo, el pago de multas e infracciones de tránsito, los daños no cubiertos por el seguro y cualquier perjuicio causado a terceros durante el período de arriendo.' },
    { num: '5', titulo: 'Tratamiento de datos personales', texto: 'En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, RentaMóvil trata sus datos con fines de prestación del servicio, facturación y comunicaciones. No se transferirán a terceros sin autorización salvo obligación legal. Puede ejercer sus derechos escribiendo a privacidad@rentamovil.com.' },
    { num: '6', titulo: 'Requisitos del conductor', texto: 'El arrendatario debe tener mínimo 18 años, licencia de conducción vigente para la categoría del vehículo y documento de identidad original. RentaMóvil podrá rechazar el arriendo sin reembolso si no se cumplen estos requisitos.' },
    { num: '7', titulo: 'Modificaciones', texto: 'RentaMóvil se reserva el derecho de modificar estos términos con 15 días de anticipación notificados al correo registrado. El uso continuado de la plataforma implica la aceptación de los cambios.' },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '620px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '22px 28px', background: 'linear-gradient(135deg,#0f1a3d,#1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, margin: '0 0 3px' }}>Términos y Condiciones — RentaMóvil</h2>
            <p style={{ color: 'rgba(191,219,254,0.75)', fontSize: '12px', margin: 0 }}>Lea detenidamente antes de aceptar</p>
          </div>
          <button onClick={onCerrar} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: '8px', padding: '6px 10px', fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '28px', flex: 1 }}>
          {terminos.map(({ num, titulo, texto }) => (
            <div key={num} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>{num}. {titulo}</p>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.75, margin: 0 }}>{texto}</p>
            </div>
          ))}
          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
            Al aceptar, declara haber leído y comprendido estos términos en su totalidad. Esta aceptación tiene plena validez legal conforme a la <strong style={{ color: '#64748b' }}>Ley 527 de 1999</strong>.
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

function ChecklistPassword({ password }) {
  if (!password) return null
  const reglas = [
    { id: 'len', label: 'Mínimo 8 caracteres',          ok: password.length >= 8 },
    { id: 'may', label: 'Al menos una mayúscula (A-Z)', ok: /[A-Z]/.test(password) },
    { id: 'min', label: 'Al menos una minúscula (a-z)', ok: /[a-z]/.test(password) },
    { id: 'num', label: 'Al menos un número (0-9)',     ok: /\d/.test(password) },
    { id: 'esp', label: 'Al menos un símbolo (!@#...)', ok: /[^a-zA-Z\d]/.test(password) },
  ]
  const cumplidas = reglas.filter(r => r.ok).length
  const colores = { 0: '#e2e8f0', 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#84cc16', 5: '#22c55e' }
  const textos  = { 1: 'Muy débil', 2: 'Débil', 3: 'Regular', 4: 'Buena', 5: 'Contraseña segura' }
  const color   = colores[cumplidas] || '#e2e8f0'
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

function SecLabel({ text }) {
  return <p style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>{text}</p>
}

function Divider() {
  return <div style={{ borderTop: '1px solid #f1f5f9' }} />
}

function PassInput({ name, value, onChange, onFocus, onBlur, ver, setVer, hasError }) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={ver ? 'text' : 'password'}
        name={name} value={value} onChange={onChange}
        style={{ ...inputStyle(hasError), paddingRight: '44px' }}
        onFocus={onFocus} onBlur={onBlur}
      />
      <button type="button" onClick={() => setVer(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
        {ver
          ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
          : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        }
      </button>
    </div>
  )
}

export default function RegistroPage() {
  const navigate  = useNavigate()
  const exitoRef  = useRef(null)
  const { registrar, cargando, exito } = useRegistro()

  const [form, setForm] = useState({
    nombreCompleto: '', nacionalidad: 'Colombiana', numeroDocumento: '',
    correo: '', confirmarCorreo: '', telefono: '',
    fechaNacimiento: '', password: '', confirmarPassword: '',
    terminosAceptados: false,
  })
  const [errores,      setErrores]      = useState({})
  const [verPassword,  setVerPassword]  = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    if (exito) {
      exitoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const timer = setTimeout(() => navigate('/login'), 2500)
      return () => clearTimeout(timer)
    }
  }, [exito, navigate])

  const setField = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }))
  }

  const handleChange   = (e) => { const { name, value, type, checked } = e.target; setField(name, type === 'checkbox' ? checked : value) }
  const handleNombre   = (e) => setField('nombreCompleto', e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))
  const handleDoc      = (e) => setField('numeroDocumento', e.target.value.replace(/\D/g, ''))
  const handleTelefono = (e) => setField('telefono', e.target.value.replace(/\D/g, ''))

  const focusOn  = (e) => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff' }
  const focusOff = (name) => (e) => {
    e.target.style.borderColor = errores[name] ? '#f87171' : '#e2e8f0'
    e.target.style.background  = errores[name] ? '#fef2f2' : '#f8fafc'
  }

  const validar = () => {
    const err = {}
    if (!form.nombreCompleto.trim()) err.nombreCompleto = 'El nombre es obligatorio'
    else if (form.nombreCompleto.trim().split(/\s+/).length < 2) err.nombreCompleto = 'Ingrese nombre y apellido (mínimo dos palabras)'

    if (!form.nacionalidad) err.nacionalidad = 'Seleccione una nacionalidad'

    if (!form.numeroDocumento.trim()) err.numeroDocumento = 'El número de documento es obligatorio'
    else if (!/^\d{6,12}$/.test(form.numeroDocumento)) err.numeroDocumento = 'Ingrese entre 6 y 12 dígitos sin puntos ni guiones'

    const rxCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.correo.trim()) err.correo = 'El correo electrónico es obligatorio'
    else if (!rxCorreo.test(form.correo)) err.correo = 'Formato de correo electrónico inválido'
    if (!form.confirmarCorreo.trim()) err.confirmarCorreo = 'La confirmación de correo es obligatoria'
    else if (form.correo !== form.confirmarCorreo) err.confirmarCorreo = 'Las direcciones de correo no coinciden'

    if (!form.telefono.trim()) err.telefono = 'El número de teléfono es obligatorio'
    else if (!/^3\d{9}$/.test(form.telefono)) err.telefono = 'Ingrese un número de celular colombiano válido de 10 dígitos'

    if (!form.fechaNacimiento) {
      err.fechaNacimiento = 'La fecha de nacimiento es obligatoria'
    } else {
      const hoy = new Date(), nac = new Date(form.fechaNacimiento)
      const edad = hoy.getFullYear() - nac.getFullYear()
      const cumplio = hoy.getMonth() > nac.getMonth() || (hoy.getMonth() === nac.getMonth() && hoy.getDate() >= nac.getDate())
      if ((cumplio ? edad : edad - 1) < 18) err.fechaNacimiento = 'Debe tener al menos 18 años para registrarse'
    }

    if (!form.password) err.password = 'La contraseña es obligatoria'
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/.test(form.password)) err.password = 'La contraseña no cumple los requisitos de seguridad'

    if (!form.confirmarPassword) err.confirmarPassword = 'La confirmación de contraseña es obligatoria'
    else if (form.password !== form.confirmarPassword) err.confirmarPassword = 'Las contraseñas no coinciden'

    if (!form.terminosAceptados) err.terminosAceptados = 'Debe aceptar los términos y condiciones para continuar'
    return err
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validar()
    if (Object.keys(found).length > 0) { setErrores(found); return }
    setErrores({})
    // eslint-disable-next-line no-unused-vars
    const { confirmarCorreo: _cc, confirmarPassword: _cp, terminosAceptados: _t, ...datos } = form
    await registrar(datos)
  }

  const hoy      = new Date()
  const maxFecha = `${hoy.getFullYear() - 18}-${String(hoy.getMonth() + 1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`
  const gridCols = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'start' }

  return (
    <>
      {modalAbierto && (
        <ModalTerminos
          onCerrar={() => setModalAbierto(false)}
          onAceptar={() => { setField('terminosAceptados', true); setModalAbierto(false) }}
        />
      )}

      <div style={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>

        {/* PANEL IZQUIERDO */}
        <div className="lg-left" style={{ display: 'none', width: '36%', flexDirection: 'column', background: 'linear-gradient(160deg,#060e2e 0%,#0c1f5c 50%,#1e3a8a 100%)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <style>{`@media(min-width:1024px){.lg-left{display:flex !important}}`}</style>
          <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }} />
          <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '340px', height: '340px', borderRadius: '50%', background: 'rgba(99,102,241,0.08)' }} />
          <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', textAlign: 'center', gap: '28px' }}>
            <img src={logo} alt="RentaMóvil" style={{ height: '56px', filter: 'brightness(0) invert(1)' }} />
            <div>
              <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, margin: '0 0 10px' }}>Únete a RentaMóvil</h2>
              <p style={{ color: 'rgba(191,219,254,0.7)', fontSize: '14px', lineHeight: 1.7, maxWidth: '220px', margin: '0 auto' }}>
                Crea tu cuenta en minutos y empieza a reservar el vehículo que necesitas.
              </p>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: '✅', text: 'Registro rápido y seguro' },
                { icon: '💳', text: 'PSE, Nequi y tarjetas' },
                { icon: '📄', text: 'Contratos digitales al instante' },
                { icon: '🎧', text: 'Soporte 24/7' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
                  <p style={{ color: '#fff', fontSize: '13px', fontWeight: 600, margin: 0, textAlign: 'left' }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
          {/* PIE sin ficha SENA */}
          <div style={{ position: 'relative', zIndex: 1, padding: '14px 48px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <p style={{ color: 'rgba(147,197,253,0.35)', fontSize: '11px', margin: 0 }}>RentaMóvil © 2026</p>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div style={{ flex: 1, background: '#f8fafc', overflowY: 'auto', height: '100%' }}>
          <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px 24px' }}>

            <div className="logo-mob" style={{ marginBottom: '24px' }}>
              <style>{`@media(min-width:1024px){.logo-mob{display:none}}`}</style>
              <img src={logo} alt="RentaMóvil" style={{ height: '48px', display: 'block', margin: '0 auto' }} />
            </div>

            <div style={{ width: '100%', maxWidth: '680px', background: '#fff', borderRadius: '24px', boxShadow: '0 4px 32px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9', padding: '40px' }}>

              <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>Crear cuenta</h1>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Complete todos los campos obligatorios marcados con <span style={{ color: '#1e3a8a' }}>*</span>
                </p>
              </div>

              {/* ALERTA ÉXITO — solo se muestra al completar el registro */}
              {exito && (
                <div ref={exitoRef} style={{ marginBottom: '24px', padding: '16px 18px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #86efac', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <svg style={{ width: '20px', height: '20px', color: '#16a34a', flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p style={{ color: '#15803d', fontSize: '14px', fontWeight: 700, margin: '0 0 2px' }}>Registro exitoso</p>
                    <p style={{ color: '#16a34a', fontSize: '13px', margin: 0 }}>Su cuenta ha sido creada correctamente. Será redirigido al inicio de sesión en unos segundos.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* DATOS PERSONALES */}
                <section>
                  <SecLabel text="Datos personales" />
                  <div style={gridCols}>

                    <div style={fieldWrap}>
                      <label style={labelStyle}>Nombre completo <span style={{ color: '#1e3a8a' }}>*</span></label>
                      <input name="nombreCompleto" value={form.nombreCompleto} onChange={handleNombre}
                        placeholder="Ej: Laura Vanessa Pérez"
                        style={inputStyle(!!errores.nombreCompleto)}
                        onFocus={focusOn} onBlur={focusOff('nombreCompleto')} />
                      {errores.nombreCompleto
                        ? <p style={errorStyle}>{errores.nombreCompleto}</p>
                        : <p style={hintStyle}>Ingrese nombre y apellidos conforme a su documento de identidad</p>}
                    </div>

                    <div style={fieldWrap}>
                      <label style={labelStyle}>Nacionalidad <span style={{ color: '#1e3a8a' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <select name="nacionalidad" value={form.nacionalidad} onChange={handleChange}
                          style={{ ...inputStyle(!!errores.nacionalidad), paddingRight: '36px', cursor: 'pointer', appearance: 'none' }}
                          onFocus={focusOn} onBlur={focusOff('nacionalidad')}>
                          <option value="Colombiana">Colombiana</option>
                        </select>
                        <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {errores.nacionalidad
                        ? <p style={errorStyle}>{errores.nacionalidad}</p>
                        : <p style={hintStyle}>País de ciudadanía del solicitante</p>}
                    </div>

                    <div style={fieldWrap}>
                      <label style={labelStyle}>Número de documento <span style={{ color: '#1e3a8a' }}>*</span></label>
                      <input name="numeroDocumento" value={form.numeroDocumento} onChange={handleDoc}
                        inputMode="numeric" maxLength={12} placeholder="Ej: 1075228306"
                        style={inputStyle(!!errores.numeroDocumento)}
                        onFocus={focusOn} onBlur={focusOff('numeroDocumento')} />
                      {errores.numeroDocumento
                        ? <p style={errorStyle}>{errores.numeroDocumento}</p>
                        : <p style={hintStyle}>Cédula de ciudadanía sin puntos ni guiones</p>}
                    </div>

                    <div style={fieldWrap}>
                      <label style={labelStyle}>Fecha de nacimiento <span style={{ color: '#1e3a8a' }}>*</span></label>
                      <input type="date" name="fechaNacimiento" value={form.fechaNacimiento}
                        onChange={handleChange} max={maxFecha}
                        style={inputStyle(!!errores.fechaNacimiento)}
                        onFocus={focusOn} onBlur={focusOff('fechaNacimiento')} />
                      {errores.fechaNacimiento
                        ? <p style={errorStyle}>{errores.fechaNacimiento}</p>
                        : <p style={hintStyle}>Se requiere mayoría de edad para acceder al servicio</p>}
                    </div>

                  </div>
                </section>

                <Divider />

                {/* CONTACTO */}
                <section>
                  <SecLabel text="Información de contacto" />
                  <div style={gridCols}>

                    <div style={fieldWrap}>
                      <label style={labelStyle}>Correo electrónico <span style={{ color: '#1e3a8a' }}>*</span></label>
                      <input type="email" name="correo" value={form.correo} onChange={handleChange}
                        placeholder="ejemplo@correo.com"
                        style={inputStyle(!!errores.correo)}
                        onFocus={focusOn} onBlur={focusOff('correo')} />
                      {errores.correo
                        ? <p style={errorStyle}>{errores.correo}</p>
                        : <p style={hintStyle}>Se enviarán notificaciones y confirmaciones a esta dirección</p>}
                    </div>

                    <div style={fieldWrap}>
                      <label style={labelStyle}>Confirmar correo <span style={{ color: '#1e3a8a' }}>*</span></label>
                      <input type="email" name="confirmarCorreo" value={form.confirmarCorreo} onChange={handleChange}
                        placeholder="ejemplo@correo.com"
                        style={inputStyle(!!errores.confirmarCorreo)}
                        onFocus={focusOn} onBlur={focusOff('confirmarCorreo')} />
                      {errores.confirmarCorreo
                        ? <p style={errorStyle}>{errores.confirmarCorreo}</p>
                        : <p style={hintStyle}>Reingrese su correo electrónico para validar la dirección</p>}
                    </div>

                    <div style={fieldWrap}>
                      <label style={labelStyle}>Teléfono celular <span style={{ color: '#1e3a8a' }}>*</span></label>
                      <input name="telefono" value={form.telefono} onChange={handleTelefono}
                        inputMode="numeric" maxLength={10} placeholder="3XXXXXXXXX"
                        style={inputStyle(!!errores.telefono)}
                        onFocus={focusOn} onBlur={focusOff('telefono')} />
                      {errores.telefono
                        ? <p style={errorStyle}>{errores.telefono}</p>
                        : <p style={hintStyle}>Número de celular de 10 dígitos</p>}
                    </div>

                  </div>
                </section>

                <Divider />

                {/* SEGURIDAD */}
                <section>
                  <SecLabel text="Seguridad" />
                  <div style={gridCols}>

                    <div style={fieldWrap}>
                      <label style={labelStyle}>Contraseña <span style={{ color: '#1e3a8a' }}>*</span></label>
                      <PassInput name="password" value={form.password} onChange={handleChange}
                        onFocus={focusOn} onBlur={focusOff('password')}
                        ver={verPassword} setVer={setVerPassword} hasError={!!errores.password} />
                      {errores.password
                        ? <p style={errorStyle}>{errores.password}</p>
                        : <p style={hintStyle}>La contraseña debe cumplir todos los criterios de seguridad indicados</p>}
                      <ChecklistPassword password={form.password} />
                    </div>

                    <div style={fieldWrap}>
                      <label style={labelStyle}>Confirmar contraseña <span style={{ color: '#1e3a8a' }}>*</span></label>
                      <PassInput name="confirmarPassword" value={form.confirmarPassword} onChange={handleChange}
                        onFocus={focusOn} onBlur={focusOff('confirmarPassword')}
                        ver={verConfirmar} setVer={setVerConfirmar} hasError={!!errores.confirmarPassword} />
                      {errores.confirmarPassword
                        ? <p style={errorStyle}>{errores.confirmarPassword}</p>
                        : <p style={hintStyle}>Reingrese la contraseña para confirmar que coincide</p>}
                    </div>

                  </div>
                </section>

                <Divider />

                {/* TÉRMINOS */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <input type="checkbox" name="terminosAceptados" id="terminos"
                    checked={form.terminosAceptados} onChange={handleChange}
                    style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer', accentColor: '#1e3a8a', flexShrink: 0 }} />
                  <div>
                    <label htmlFor="terminos" style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, cursor: 'pointer' }}>
                      Acepto los{' '}
                      <span onClick={(e) => { e.preventDefault(); setModalAbierto(true) }}
                        style={{ color: '#1e3a8a', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}>
                        términos y condiciones
                      </span>
                      {' '}y el tratamiento de mis datos personales según la{' '}
                      <span style={{ fontWeight: 600 }}>Ley 1581 de 2012</span>.
                    </label>
                    {errores.terminosAceptados && <p style={errorStyle}>{errores.terminosAceptados}</p>}
                  </div>
                </div>

                {/* BOTONES */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px' }}>
                  <button type="submit" disabled={cargando || exito} style={{
                    width: '100%', padding: '14px', borderRadius: '12px',
                    background: exito ? 'linear-gradient(90deg,#15803d,#16a34a)' : 'linear-gradient(90deg,#1e3a8a,#2563eb)',
                    color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none',
                    cursor: (cargando || exito) ? 'not-allowed' : 'pointer',
                    opacity: (cargando || exito) ? 0.75 : 1,
                    boxShadow: '0 4px 16px rgba(30,58,138,0.25)', transition: 'all 300ms',
                  }}>
                    {cargando
                      ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                          <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                          Procesando registro…
                        </span>
                      : exito ? '✓ Registro completado' : 'Crear mi cuenta'
                    }
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', margin: 0 }}>
                    ¿Ya tiene una cuenta?{' '}
                    <Link to="/login" style={{ color: '#1e3a8a', fontWeight: 700, textDecoration: 'none' }}>Inicie sesión aquí</Link>
                  </p>

                  <button type="button" onClick={() => navigate('/')}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}>
                    Volver al inicio
                  </button>
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