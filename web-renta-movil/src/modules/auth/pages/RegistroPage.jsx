import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegistro } from '../hooks/useRegistro'
import logo from "@/assets/logo/logo.png"

/* ─────────────────────────────────────────
   MODAL TÉRMINOS Y CONDICIONES
───────────────────────────────────────── */
function ModalTerminos({ onCerrar, onAceptar }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px',
        width: '100%', maxWidth: '660px', maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }}>
        {/* Cabecera */}
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px',
          background: 'linear-gradient(135deg,#0f1a3d,#1e3a8a)',
        }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 900, margin: '0 0 4px' }}>
              📋 Términos y Condiciones — RentaMóvil
            </h2>
            <p style={{ color: 'rgba(191,219,254,0.8)', fontSize: '12px', margin: 0 }}>
              Léelos con atención antes de aceptar
            </p>
          </div>
          <button onClick={onCerrar} style={{
            background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer',
            color: '#fff', borderRadius: '8px', padding: '6px 10px', fontSize: '18px', lineHeight: 1,
          }}>✕</button>
        </div>

        {/* Cuerpo scrollable */}
        <div style={{ overflowY: 'auto', padding: '24px 28px', flex: 1 }}>

          {/* DISCLAIMER */}
          <div style={{
            background: '#fffbeb', border: '1.5px solid #fcd34d',
            borderRadius: '12px', padding: '14px 16px', marginBottom: '24px',
          }}>
            <p style={{ fontSize: '13px', fontWeight: 800, color: '#92400e', margin: '0 0 6px' }}>
              ⚠️ DISCLAIMER — Falsificación de datos
            </p>
            <p style={{ fontSize: '12px', color: '#78350f', lineHeight: 1.7, margin: 0 }}>
              RentaMóvil advierte expresamente que el suministro de información falsa, alterada o
              falsificada al momento del registro constituye una conducta punible en Colombia conforme
              al <strong>Artículo 286 del Código Penal (Falsedad en documento privado)</strong> y puede
              acarrear penas de <strong>1 a 6 años de prisión</strong>. Al registrarse, el usuario
              declara bajo la gravedad de juramento que todos los datos son verídicos.
              <br /><br />
              <strong>RentaMóvil no se hace responsable</strong> por los actos, daños, perjuicios
              o consecuencias legales derivados de la información falsa proporcionada por el usuario.
              La empresa se reserva el derecho de interponer las acciones civiles y penales
              correspondientes.
            </p>
          </div>

          {[
            {
              num: '1', titulo: 'Objeto del contrato',
              texto: 'RentaMóvil presta el servicio de arrendamiento de vehículos a personas naturales mayores de 18 años con licencia de conducción vigente. El contrato de arriendo se formaliza digitalmente al completar la reserva y no tiene validez sin la aceptación expresa de estos términos.',
            },
            {
              num: '2', titulo: 'Política de NO reembolso',
              texto: 'RentaMóvil no realiza reembolsos bajo ninguna circunstancia una vez confirmada la reserva. Las cancelaciones generan un cobro del 100% del valor del arriendo. En casos de fuerza mayor debidamente certificados, se podrá ofrecer un crédito a favor para uso futuro, a criterio exclusivo de RentaMóvil, sin que esto constituya obligación de devolución de dinero.',
            },
            {
              num: '3', titulo: 'Exoneración de responsabilidad por datos falsos',
              texto: 'RentaMóvil queda expresamente exonerada de toda responsabilidad civil, penal y administrativa derivada del uso de la plataforma por parte de usuarios que hayan suministrado datos falsos, suplantado identidades o actuado de manera fraudulenta. Esta exoneración aplica conforme al Artículo 1604 del Código Civil colombiano y la Ley 527 de 1999 sobre comercio electrónico.',
            },
            {
              num: '4', titulo: 'Responsabilidad del arrendatario',
              texto: 'El usuario es el único responsable de la conducción del vehículo arrendado, el pago de multas, infracciones de tránsito, daños al vehículo no cubiertos por el seguro, y cualquier perjuicio causado a terceros durante el período de arriendo. RentaMóvil no asume responsabilidad alguna por accidentes, pérdidas o daños ocurridos durante el uso del vehículo.',
            },
            {
              num: '5', titulo: 'Tratamiento de datos personales',
              texto: 'En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, RentaMóvil recolecta y trata sus datos personales con fines de: prestación del servicio, facturación, comunicaciones comerciales y cumplimiento de obligaciones legales. Los datos no serán transferidos a terceros sin autorización previa, salvo obligación legal. El titular puede ejercer sus derechos de acceso, corrección, supresión y portabilidad escribiendo a privacidad@rentamovil.com.',
            },
            {
              num: '6', titulo: 'Requisitos del conductor',
              texto: 'El arrendatario debe tener mínimo 18 años cumplidos, licencia de conducción válida y vigente para la categoría del vehículo solicitado, y documento de identidad original. RentaMóvil podrá verificar estos documentos antes de la entrega del vehículo y rechazar el arriendo si no se cumplen los requisitos, sin lugar a reembolso.',
            },
            {
              num: '7', titulo: 'Modificaciones a los términos',
              texto: 'RentaMóvil se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones serán notificadas al correo registrado con 15 días de anticipación. El uso continuado de la plataforma después de dicho plazo implica la aceptación de los nuevos términos.',
            },
          ].map(({ num, titulo, texto }) => (
            <div key={num} style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                {num}. {titulo}
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.7, margin: 0 }}>{texto}</p>
            </div>
          ))}

          <div style={{
            background: '#f0fdf4', border: '1.5px solid #86efac',
            borderRadius: '12px', padding: '14px 16px', marginTop: '8px',
          }}>
            <p style={{ fontSize: '12px', color: '#166534', lineHeight: 1.7, margin: 0 }}>
              <strong>✅ Al hacer clic en "Acepto los términos"</strong>, usted declara haber leído,
              comprendido y aceptado en su totalidad los presentes Términos y Condiciones,
              el Disclaimer sobre falsificación de datos, y la Política de Privacidad de RentaMóvil.
              Esta aceptación tiene plena validez legal conforme a la Ley 527 de 1999.
            </p>
          </div>
        </div>

        {/* Pie del modal */}
        <div style={{
          padding: '16px 28px', borderTop: '1px solid #f1f5f9',
          display: 'flex', gap: '12px', justifyContent: 'flex-end',
          background: '#fafafa',
        }}>
          <button onClick={onCerrar} style={{
            padding: '10px 20px', borderRadius: '10px',
            border: '1.5px solid #e2e8f0', background: '#fff',
            color: '#64748b', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
          }}>
            Cerrar
          </button>
          <button onClick={onAceptar} style={{
            padding: '10px 24px', borderRadius: '10px',
            background: 'linear-gradient(90deg,#1e3a8a,#2563eb)',
            color: '#fff', fontWeight: 700, fontSize: '13px',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(30,58,138,0.25)',
          }}>
            ✅ Acepto los términos
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   CAMPO GENÉRICO
───────────────────────────────────────── */
function Campo({
  label, name, type = 'text', required, value, onChange, error,
  verPassword, verConfirmar, setVerPassword, setVerConfirmar,
  hint,           // texto de ayuda debajo del label
  children,       // para pasar un <select> o <input date> custom
}) {
  const esPass = name === 'password' || name === 'confirmarPassword'
  const inputType =
    name === 'password'          ? (verPassword ? 'text' : 'password') :
    name === 'confirmarPassword' ? (verConfirmar ? 'text' : 'password') : type

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {/* Label */}
      <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
        {label}{required && <span style={{ color: '#1e3a8a', marginLeft: '2px' }}>*</span>}
      </label>

      {/* Hint opcional */}
      {hint && (
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 2px', lineHeight: 1.4 }}>{hint}</p>
      )}

      {/* Slot custom o input genérico */}
      {children ? (
        <div>{children}</div>
      ) : (
        <div style={{ position: 'relative' }}>
          <input
            type={inputType}
            name={name}
            value={value}
            onChange={onChange}
            style={{
              width: '100%',
              padding: esPass ? '11px 44px 11px 14px' : '11px 14px',
              borderRadius: '10px',
              border: error ? '1.5px solid #f87171' : '1.5px solid #e2e8f0',
              background: error ? '#fef2f2' : '#fff',
              fontSize: '13px', color: '#1e293b',
              outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = '#1e3a8a'}
            onBlur={e => e.target.style.borderColor = error ? '#f87171' : '#e2e8f0'}
          />
          {esPass && (
            <button type="button"
              onClick={() => name === 'password' ? setVerPassword(v => !v) : setVerConfirmar(v => !v)}
              style={{
                position: 'absolute', right: '12px', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#94a3b8', padding: 0, display: 'flex',
              }}>
              {(name === 'password' ? verPassword : verConfirmar)
                ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              }
            </button>
          )}
        </div>
      )}

      {error && <p style={{ color: '#ef4444', fontSize: '12px', margin: 0 }}>{error}</p>}
    </div>
  )
}

/* ─────────────────────────────────────────
   CHECKLIST DE CONTRASEÑA
───────────────────────────────────────── */
function ChecklistPassword({ password }) {
  if (!password) return null

  const reglas = [
    { id: 'len',  label: 'Mínimo 8 caracteres',          ok: password.length >= 8 },
    { id: 'may',  label: 'Al menos una mayúscula (A-Z)', ok: /[A-Z]/.test(password) },
    { id: 'min',  label: 'Al menos una minúscula (a-z)', ok: /[a-z]/.test(password) },
    { id: 'num',  label: 'Al menos un número (0-9)',     ok: /\d/.test(password) },
    { id: 'esp',  label: 'Al menos un símbolo (!@#...)', ok: /[^a-zA-Z\d]/.test(password) },
  ]

  const cumplidas = reglas.filter(r => r.ok).length
  const colores   = { 0: '#e2e8f0', 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#84cc16', 5: '#22c55e' }
  const textos    = { 1: 'Muy débil', 2: 'Débil', 3: 'Regular', 4: 'Buena', 5: '✅ Contraseña segura' }
  const color     = colores[cumplidas] || '#e2e8f0'

  return (
    <div style={{
      marginTop: '10px', background: '#f8fafc',
      border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px',
    }}>
      {/* Barra de progreso */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            height: '5px', flex: 1, borderRadius: '9999px',
            background: i <= cumplidas ? color : '#e2e8f0',
            transition: 'all 300ms',
          }} />
        ))}
      </div>
      {cumplidas > 0 && (
        <p style={{ fontSize: '11px', fontWeight: 700, color, margin: '0 0 8px' }}>
          {textos[cumplidas]}
        </p>
      )}
      {/* Checklist */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {reglas.map(r => (
          <li key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px' }}>
            <span style={{
              width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: r.ok ? '#dcfce7' : '#f1f5f9',
              fontSize: '10px', fontWeight: 700,
              color: r.ok ? '#16a34a' : '#94a3b8',
              transition: 'all 200ms',
            }}>
              {r.ok ? '✓' : '·'}
            </span>
            <span style={{ color: r.ok ? '#15803d' : '#64748b', fontWeight: r.ok ? 600 : 400 }}>
              {r.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─────────────────────────────────────────
   PÁGINA PRINCIPAL
───────────────────────────────────────── */
export default function RegistroPage() {
  const navigate = useNavigate()
  const { registrar, cargando, error, exito } = useRegistro()

  const [form, setForm] = useState({
    nombreCompleto: '', nacionalidad: '', numeroDocumento: '',
    correo: '', confirmarCorreo: '', telefono: '',
    fechaNacimiento: '', password: '', confirmarPassword: '',
    terminosAceptados: false,
  })
  const [errores,      setErrores]      = useState({})
  const [verPassword,  setVerPassword]  = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => { if (exito) navigate('/login') }, [exito, navigate])

  /* ── Cambios en el formulario ── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }))
  }

  /* ── Sólo dígitos en documento ── */
  const handleDocumento = (e) => {
    const val = e.target.value.replace(/\D/g, '')           // elimina todo lo que no sea dígito
    setForm(prev => ({ ...prev, numeroDocumento: val }))
    if (errores.numeroDocumento) setErrores(prev => ({ ...prev, numeroDocumento: '' }))
  }

  /* ── Sólo letras y espacios en nombre ── */
  const handleNombre = (e) => {
    const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
    setForm(prev => ({ ...prev, nombreCompleto: val }))
    if (errores.nombreCompleto) setErrores(prev => ({ ...prev, nombreCompleto: '' }))
  }

  /* ── Validaciones ── */
  const validar = () => {
    const err = {}

    if (!form.nombreCompleto.trim()) {
      err.nombreCompleto = 'El nombre es obligatorio'
    } else if (/\d/.test(form.nombreCompleto)) {
      err.nombreCompleto = 'El nombre no puede contener números'
    } else if (form.nombreCompleto.trim().split(/\s+/).length < 2) {
      err.nombreCompleto = 'Ingresa tu nombre completo (mínimo dos palabras)'
    }

    if (!form.nacionalidad) err.nacionalidad = 'Selecciona una nacionalidad'

    if (!form.numeroDocumento.trim()) {
      err.numeroDocumento = 'El número de documento es obligatorio'
    } else if (!/^\d{6,12}$/.test(form.numeroDocumento)) {
      err.numeroDocumento = 'Solo números, entre 6 y 12 dígitos'
    }

    const rxCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.correo.trim())              err.correo = 'El correo es obligatorio'
    else if (!rxCorreo.test(form.correo)) err.correo = 'Formato de correo inválido'

    if (!form.confirmarCorreo.trim())              err.confirmarCorreo = 'Confirma tu correo'
    else if (form.correo !== form.confirmarCorreo) err.confirmarCorreo = 'Los correos no coinciden'

    const rxTel = /^(\+57|57)?[3][0-9]{9}$/
    if (!form.telefono.trim())                                err.telefono = 'El teléfono es obligatorio'
    else if (!rxTel.test(form.telefono.replace(/\s/g, ''))) err.telefono = 'Número colombiano inválido (+57 3XX XXX XXXX)'

    if (!form.fechaNacimiento) {
      err.fechaNacimiento = 'La fecha de nacimiento es obligatoria'
    } else {
      const hoy = new Date()
      const nac = new Date(form.fechaNacimiento)
      const edad = hoy.getFullYear() - nac.getFullYear()
      const cumplio = hoy.getMonth() > nac.getMonth() ||
        (hoy.getMonth() === nac.getMonth() && hoy.getDate() >= nac.getDate())
      if ((cumplio ? edad : edad - 1) < 18) err.fechaNacimiento = 'Debes tener al menos 18 años'
    }

    const rxPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/
    if (!form.password)                   err.password = 'La contraseña es obligatoria'
    else if (!rxPass.test(form.password)) err.password = 'La contraseña no cumple los requisitos de seguridad'

    if (!form.confirmarPassword)                       err.confirmarPassword = 'Confirma tu contraseña'
    else if (form.password !== form.confirmarPassword) err.confirmarPassword = 'Las contraseñas no coinciden'

    if (!form.terminosAceptados) err.terminosAceptados = 'Debes aceptar los términos y condiciones para continuar'

    return err
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const encontrados = validar()
    if (Object.keys(encontrados).length > 0) { setErrores(encontrados); return }
    setErrores({})
    // eslint-disable-next-line no-unused-vars
    const { confirmarCorreo: _cc, confirmarPassword: _cp, terminosAceptados: _t, ...datos } = form
    await registrar(datos)
  }

  /* ── Estilos reutilizables ── */
  const inputBase = (hasError) => ({
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: hasError ? '1.5px solid #f87171' : '1.5px solid #e2e8f0',
    background: hasError ? '#fef2f2' : '#fff',
    fontSize: '13px', color: '#1e293b',
    outline: 'none', boxSizing: 'border-box',
    appearance: 'none',
  })

  const secLabel = (txt) => (
    <p style={{
      fontSize: '11px', fontWeight: 700, color: '#1e3a8a',
      textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px',
    }}>{txt}</p>
  )

  const divider = <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

  /* fecha máxima: hoy menos 18 años */
  const hoy = new Date()
  const maxFecha = `${hoy.getFullYear() - 18}-${String(hoy.getMonth() + 1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`

  return (
    <>
      {/* Modal términos */}
      {modalAbierto && (
        <ModalTerminos
          onCerrar={() => setModalAbierto(false)}
          onAceptar={() => {
            setForm(prev => ({ ...prev, terminosAceptados: true }))
            setErrores(prev => ({ ...prev, terminosAceptados: '' }))
            setModalAbierto(false)
          }}
        />
      )}

      <div style={{ minHeight: '100vh', display: 'flex' }}>

        {/* ── Panel izquierdo ── */}
        <div style={{ display: 'none', width: '36%', flexDirection: 'column', background: 'linear-gradient(160deg,#060e2e 0%,#0c1f5c 50%,#1e3a8a 100%)', position: 'relative', overflow: 'hidden' }} className="lg-left">
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

          <div style={{ position: 'relative', zIndex: 1, padding: '14px 48px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <p style={{ color: 'rgba(147,197,253,0.35)', fontSize: '11px', margin: 0 }}>RentaMóvil © 2026 · Ficha 3145555 — SENA CIES</p>
          </div>
        </div>

        {/* ── Panel derecho (formulario) ── */}
        <div style={{ flex: 1, background: '#f8fafc', overflowY: 'auto' }}>
          <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px 24px' }}>

            <div style={{ marginBottom: '24px' }} className="logo-mob">
              <style>{`@media(min-width:1024px){.logo-mob{display:none}}`}</style>
              <img src={logo} alt="RentaMóvil" style={{ height: '48px', display: 'block', margin: '0 auto' }} />
            </div>

            <div style={{ width: '100%', maxWidth: '680px', background: '#fff', borderRadius: '24px', boxShadow: '0 4px 32px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9', padding: '40px' }}>

              <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>Crear cuenta</h1>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Completa todos los campos marcados con <span style={{ color: '#1e3a8a' }}>*</span>
                </p>
              </div>

              {error && (
                <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', gap: '10px' }}>
                  <svg style={{ width: '18px', height: '18px', color: '#dc2626', flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* ── DATOS PERSONALES ── */}
                <div>
                  {secLabel('Datos personales')}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' }}>

                    {/* Nombre — sólo letras */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                        Nombre completo <span style={{ color: '#1e3a8a' }}>*</span>
                      </label>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 2px' }}>
                        Ingresa tu nombre y apellidos tal como aparecen en tu documento
                      </p>
                      <input
                        name="nombreCompleto"
                        value={form.nombreCompleto}
                        onChange={handleNombre}
                        placeholder="Ej: Laura Vanessa Pérez"
                        style={inputBase(!!errores.nombreCompleto)}
                        onFocus={e => e.target.style.borderColor = '#1e3a8a'}
                        onBlur={e => e.target.style.borderColor = errores.nombreCompleto ? '#f87171' : '#e2e8f0'}
                      />
                      {errores.nombreCompleto && <p style={{ color: '#ef4444', fontSize: '12px', margin: 0 }}>{errores.nombreCompleto}</p>}
                    </div>

                    {/* Nacionalidad — select */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                        Nacionalidad <span style={{ color: '#1e3a8a' }}>*</span>
                      </label>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 2px' }}>
                        Selecciona el país del que eres ciudadano
                      </p>
                      <div style={{ position: 'relative' }}>
                        <select
                          name="nacionalidad"
                          value={form.nacionalidad}
                          onChange={handleChange}
                          style={{
                            ...inputBase(!!errores.nacionalidad),
                            paddingRight: '36px',
                            cursor: 'pointer',
                          }}
                          onFocus={e => e.target.style.borderColor = '#1e3a8a'}
                          onBlur={e => e.target.style.borderColor = errores.nacionalidad ? '#f87171' : '#e2e8f0'}
                        >
                          <option value="">Selecciona</option>
                          <option value="Colombiana">🇨🇴 Colombiana</option>
                          <option value="Venezolana">🇻🇪 Venezolana</option>
                          <option value="Ecuatoriana">🇪🇨 Ecuatoriana</option>
                          <option value="Peruana">🇵🇪 Peruana</option>
                        </select>
                        <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {errores.nacionalidad && <p style={{ color: '#ef4444', fontSize: '12px', margin: 0 }}>{errores.nacionalidad}</p>}
                    </div>

                    {/* Número de documento — sólo dígitos */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                        Número de documento <span style={{ color: '#1e3a8a' }}>*</span>
                      </label>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 2px' }}>
                        Solo números, sin puntos ni guiones (cédula de ciudadanía o extranjería)
                      </p>
                      <input
                        name="numeroDocumento"
                        value={form.numeroDocumento}
                        onChange={handleDocumento}
                        inputMode="numeric"
                        placeholder="Ej: 1075123456"
                        maxLength={12}
                        style={inputBase(!!errores.numeroDocumento)}
                        onFocus={e => e.target.style.borderColor = '#1e3a8a'}
                        onBlur={e => e.target.style.borderColor = errores.numeroDocumento ? '#f87171' : '#e2e8f0'}
                      />
                      {errores.numeroDocumento && <p style={{ color: '#ef4444', fontSize: '12px', margin: 0 }}>{errores.numeroDocumento}</p>}
                    </div>

                    {/* Fecha de nacimiento — calendario nativo */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                        Fecha de nacimiento <span style={{ color: '#1e3a8a' }}>*</span>
                      </label>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 2px' }}>
                        Debes tener al menos 18 años para registrarte
                      </p>
                      <input
                        type="date"
                        name="fechaNacimiento"
                        value={form.fechaNacimiento}
                        onChange={handleChange}
                        max={maxFecha}
                        style={inputBase(!!errores.fechaNacimiento)}
                        onFocus={e => e.target.style.borderColor = '#1e3a8a'}
                        onBlur={e => e.target.style.borderColor = errores.fechaNacimiento ? '#f87171' : '#e2e8f0'}
                      />
                      {errores.fechaNacimiento && <p style={{ color: '#ef4444', fontSize: '12px', margin: 0 }}>{errores.fechaNacimiento}</p>}
                    </div>

                  </div>
                </div>

                {divider}

                {/* ── CONTACTO ── */}
                <div>
                  {secLabel('Información de contacto')}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' }}>

                    <Campo name="correo" label="Correo electrónico" type="email" required
                      hint="Usaremos este correo para confirmaciones y notificaciones"
                      value={form.correo} onChange={handleChange} error={errores.correo}
                    />
                    <Campo name="confirmarCorreo" label="Confirmar correo" type="email" required
                      hint="Escribe el mismo correo para verificar que no hay errores"
                      value={form.confirmarCorreo} onChange={handleChange} error={errores.confirmarCorreo}
                    />

                    {/* Teléfono */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                        Teléfono celular <span style={{ color: '#1e3a8a' }}>*</span>
                      </label>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 2px' }}>
                        Número colombiano de 10 dígitos, puedes incluir +57
                      </p>
                      <input
                        name="telefono"
                        value={form.telefono}
                        onChange={handleChange}
                        inputMode="tel"
                        placeholder="+57 300 000 0000"
                        style={inputBase(!!errores.telefono)}
                        onFocus={e => e.target.style.borderColor = '#1e3a8a'}
                        onBlur={e => e.target.style.borderColor = errores.telefono ? '#f87171' : '#e2e8f0'}
                      />
                      {errores.telefono && <p style={{ color: '#ef4444', fontSize: '12px', margin: 0 }}>{errores.telefono}</p>}
                    </div>

                  </div>
                </div>

                {divider}

                {/* ── SEGURIDAD ── */}
                <div>
                  {secLabel('Seguridad')}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' }}>

                    {/* Contraseña + checklist */}
                    <div>
                      <Campo name="password" label="Contraseña" required
                        hint="Usa mayúsculas, números y símbolos para que sea segura"
                        value={form.password} onChange={handleChange} error={errores.password}
                        verPassword={verPassword} verConfirmar={verConfirmar}
                        setVerPassword={setVerPassword} setVerConfirmar={setVerConfirmar}
                      />
                      <ChecklistPassword password={form.password} />
                    </div>

                    <Campo name="confirmarPassword" label="Confirmar contraseña" required
                      hint="Repite exactamente la misma contraseña que escribiste"
                      value={form.confirmarPassword} onChange={handleChange} error={errores.confirmarPassword}
                      verPassword={verPassword} verConfirmar={verConfirmar}
                      setVerPassword={setVerPassword} setVerConfirmar={setVerConfirmar}
                    />

                  </div>
                </div>

                {divider}

                {/* ── TÉRMINOS ── */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <input type="checkbox" name="terminosAceptados" id="terminos"
                      checked={form.terminosAceptados} onChange={handleChange}
                      style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer', accentColor: '#1e3a8a', flexShrink: 0 }}
                    />
                    <label htmlFor="terminos" style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                      Acepto los{' '}
                      <span
                        onClick={(e) => { e.preventDefault(); setModalAbierto(true) }}
                        style={{ color: '#1e3a8a', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        términos y condiciones
                      </span>
                      {' '}y el tratamiento de mis datos personales según la{' '}
                      <span style={{ fontWeight: 600 }}>Ley 1581 de 2012</span>.
                      {form.terminosAceptados && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px', fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>
            
                        </span>
                      )}
                    </label>
                  </div>
                  {errores.terminosAceptados && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', paddingLeft: '28px' }}>
                      {errores.terminosAceptados}
                    </p>
                  )}
                </div>

                {/* ── BOTONES ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px' }}>
                  <button type="submit" disabled={cargando}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '12px',
                      background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', color: '#fff',
                      fontWeight: 700, fontSize: '14px', border: 'none',
                      cursor: cargando ? 'not-allowed' : 'pointer',
                      opacity: cargando ? 0.6 : 1,
                      boxShadow: '0 4px 16px rgba(30,58,138,0.25)',
                    }}>
                    {cargando
                      ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                          <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                          Creando cuenta...
                        </span>
                      : 'Crear mi cuenta'
                    }
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', margin: 0 }}>
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" style={{ color: '#1e3a8a', fontWeight: 700, textDecoration: 'none' }}>Inicia sesión aquí</Link>
                  </p>

                  <button type="button" onClick={() => navigate('/')}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
                  >
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