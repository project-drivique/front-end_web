import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegistro } from '../hooks/useRegistro'
import logo from "@/assets/logo/logo.png"

function Campo({ label, name, type = 'text', placeholder, required, value, onChange, error,
  verPassword, verConfirmar, setVerPassword, setVerConfirmar }) {
  const inputType =
    name === 'password'          ? (verPassword ? 'text' : 'password') :
    name === 'confirmarPassword' ? (verConfirmar ? 'text' : 'password') : type
  const esPass = name === 'password' || name === 'confirmarPassword'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
        {label}{required && <span style={{ color: '#1e3a8a', marginLeft: '2px' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={inputType} name={name} value={value} onChange={onChange} placeholder={placeholder}
          style={{
            width: '100%', padding: esPass ? '11px 44px 11px 14px' : '11px 14px',
            borderRadius: '10px', border: error ? '1.5px solid #f87171' : '1.5px solid #e2e8f0',
            background: error ? '#fef2f2' : '#fff', fontSize: '13px', color: '#1e293b',
            outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = '#1e3a8a'}
          onBlur={e => e.target.style.borderColor = error ? '#f87171' : '#e2e8f0'}
        />
        {esPass && (
          <button type="button"
            onClick={() => name === 'password' ? setVerPassword(v => !v) : setVerConfirmar(v => !v)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
            {(name === 'password' ? verPassword : verConfirmar)
              ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
              : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            }
          </button>
        )}
      </div>
      {error && <p style={{ color: '#ef4444', fontSize: '12px', margin: 0 }}>{error}</p>}
    </div>
  )
}

function BarraSeguridad({ password }) {
  if (!password) return null
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password), /[^a-zA-Z\d]/.test(password)]
  const n = checks.filter(Boolean).length
  const colores = ['#ef4444', '#ef4444', '#f97316', '#eab308', '#22c55e']
  const textos  = ['', 'Muy débil', 'Débil', 'Regular', 'Buena', 'Segura']
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ height: '5px', flex: 1, borderRadius: '9999px', background: i <= n ? colores[n-1] : '#e2e8f0', transition: 'all 300ms' }} />
        ))}
      </div>
      {n > 0 && <p style={{ fontSize: '11px', marginTop: '4px', fontWeight: 600, color: colores[n-1] }}>{textos[n]}</p>}
    </div>
  )
}

export default function RegistroPage() {
  const navigate = useNavigate()
  const { registrar, cargando, error, exito } = useRegistro()

  const [form, setForm] = useState({
    nombreCompleto: '', nacionalidad: '', numeroDocumento: '',
    correo: '', confirmarCorreo: '', telefono: '',
    fechaNacimiento: '', password: '', confirmarPassword: '',
    terminosAceptados: false,
  })
  const [errores, setErrores] = useState({})
  const [verPassword, setVerPassword] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)

  useEffect(() => { if (exito) navigate('/login') }, [exito, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }))
  }

  const validar = () => {
    const err = {}
    if (!form.nombreCompleto.trim())  err.nombreCompleto  = 'El nombre es obligatorio'
    if (!form.nacionalidad.trim())    err.nacionalidad    = 'La nacionalidad es obligatoria'
    if (!form.numeroDocumento.trim()) err.numeroDocumento = 'El documento es obligatorio'
    const rxCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.correo.trim())              err.correo = 'El correo es obligatorio'
    else if (!rxCorreo.test(form.correo)) err.correo = 'Formato de correo inválido'
    if (!form.confirmarCorreo.trim())               err.confirmarCorreo = 'Confirma tu correo'
    else if (form.correo !== form.confirmarCorreo)  err.confirmarCorreo = 'Los correos no coinciden'
    const rxTel = /^(\+57|57)?[3][0-9]{9}$/
    if (!form.telefono.trim())                                 err.telefono = 'El teléfono es obligatorio'
    else if (!rxTel.test(form.telefono.replace(/\s/g, '')))   err.telefono = 'Número colombiano inválido'
    if (!form.fechaNacimiento) {
      err.fechaNacimiento = 'La fecha de nacimiento es obligatoria'
    } else {
      const hoy = new Date(), nac = new Date(form.fechaNacimiento)
      const edad = hoy.getFullYear() - nac.getFullYear()
      const cumplio = hoy.getMonth() > nac.getMonth() || (hoy.getMonth() === nac.getMonth() && hoy.getDate() >= nac.getDate())
      if ((cumplio ? edad : edad - 1) < 18) err.fechaNacimiento = 'Debes tener al menos 18 años'
    }
    const rxPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/
    if (!form.password)                    err.password = 'La contraseña es obligatoria'
    else if (!rxPass.test(form.password))  err.password = 'Mínimo 8 caracteres, mayúscula, número y símbolo'
    if (!form.confirmarPassword)                        err.confirmarPassword = 'Confirma tu contraseña'
    else if (form.password !== form.confirmarPassword)  err.confirmarPassword = 'Las contraseñas no coinciden'
    if (!form.terminosAceptados) err.terminosAceptados = 'Debes aceptar los términos'
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

  const cp = (name) => ({ name, value: form[name], error: errores[name], onChange: handleChange, verPassword, verConfirmar, setVerPassword, setVerConfirmar })

  const secLabel = (txt) => (
    <p style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>{txt}</p>
  )
  const divider = <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

  return (
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

              {/* Datos personales */}
              <div>
                {secLabel('Datos personales')}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' }}>
                  <Campo {...cp('nombreCompleto')}  label="Nombre completo"      placeholder="Ej: Laura Vanessa Pérez" required />
                  <Campo {...cp('nacionalidad')}    label="Nacionalidad"          placeholder="Ej: Colombiana"          required />
                  <Campo {...cp('numeroDocumento')} label="Número de documento"   placeholder="Ej: 1075123456"          required />
                  <Campo {...cp('fechaNacimiento')} label="Fecha de nacimiento"   type="date"                           required />
                </div>
              </div>

              {divider}

              {/* Contacto */}
              <div>
                {secLabel('Información de contacto')}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' }}>
                  <Campo {...cp('correo')}         label="Correo electrónico" type="email" placeholder="correo@ejemplo.com"  required />
                  <Campo {...cp('confirmarCorreo')}label="Confirmar correo"   type="email" placeholder="Repite tu correo"    required />
                  <Campo {...cp('telefono')}        label="Teléfono celular"               placeholder="+57 300 000 0000"     required />
                </div>
              </div>

              {divider}

              {/* Seguridad */}
              <div>
                {secLabel('Seguridad')}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' }}>
                  <div>
                    <Campo {...cp('password')}         label="Contraseña"          placeholder="Mínimo 8 caracteres" required />
                    <BarraSeguridad password={form.password} />
                  </div>
                  <Campo {...cp('confirmarPassword')} label="Confirmar contraseña" placeholder="Repite tu contraseña" required />
                </div>
              </div>

              {divider}

              {/* Términos */}
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <input type="checkbox" name="terminosAceptados" id="terminos"
                    checked={form.terminosAceptados} onChange={handleChange}
                    style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer', accentColor: '#1e3a8a', flexShrink: 0 }}
                  />
                  <label htmlFor="terminos" style={{ fontSize: '13px', color: '#475569', cursor: 'pointer', lineHeight: 1.6 }}>
                    Acepto los{' '}
                    <span style={{ color: '#1e3a8a', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>términos y condiciones</span>
                    {' '}y el tratamiento de mis datos personales según la Ley 1581 de 2012.
                  </label>
                </div>
                {errores.terminosAceptados && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', paddingLeft: '28px' }}>{errores.terminosAceptados}</p>}
              </div>

              {/* Botones */}
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}