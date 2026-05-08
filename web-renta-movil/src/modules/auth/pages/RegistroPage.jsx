import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegistro } from '../hooks/useRegistro'
import logo from '../../../assets/logo.png'

/* ── Componente Campo — definido FUERA para evitar re-renders ── */
const Campo = ({
  label, name, type = 'text', placeholder, required,
  value, onChange, error,
  verPassword, verConfirmar, setVerPassword, setVerConfirmar,
}) => {
  const inputType =
    name === 'password'          ? (verPassword  ? 'text' : 'password') :
    name === 'confirmarPassword' ? (verConfirmar ? 'text' : 'password') :
    type

  const esPass = name === 'password' || name === 'confirmarPassword'

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
        {label} {required && <span className="text-[#1e3a8a]">*</span>}
      </label>
      <div className="relative">
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 bg-slate-50 outline-none transition-all
            focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]
            ${error ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
        />
        {esPass && (
          <button
            type="button"
            onClick={() => name === 'password' ? setVerPassword(v => !v) : setVerConfirmar(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {(name === 'password' ? verPassword : verConfirmar) ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}

/* ── Barra de seguridad — definida FUERA ───────────────────── */
const BarraSeguridad = ({ password }) => {
  if (!password) return null
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z\d]/.test(password),
  ]
  const cumplidos = checks.filter(Boolean).length
  const colores   = ['#ef4444', '#ef4444', '#f97316', '#eab308', '#22c55e']
  const textos    = ['', 'Muy débil', 'Débil', 'Regular', 'Buena', 'Segura']

  return (
    <div className="mt-1">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= cumplidos ? colores[cumplidos - 1] : '#e2e8f0' }} />
        ))}
      </div>
      {cumplidos > 0 && (
        <p className="text-[11px] mt-1" style={{ color: colores[cumplidos - 1] }}>
          {textos[cumplidos]}
        </p>
      )}
    </div>
  )
}

/* ── Componente principal ──────────────────────────────────── */
export default function RegistroPage() {
  const navigate = useNavigate()
  const { registrar, cargando, error, exito } = useRegistro()

  const [form, setForm] = useState({
    nombreCompleto:    '',
    nacionalidad:      '',
    numeroDocumento:   '',
    correo:            '',
    confirmarCorreo:   '',
    telefono:          '',
    fechaNacimiento:   '',
    password:          '',
    confirmarPassword: '',
    terminosAceptados: false,
  })

  const [errores,      setErrores]      = useState({})
  const [verPassword,  setVerPassword]  = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)

  // RF1.12 — redirigir tras registro exitoso
  useEffect(() => {
    if (exito) navigate('/login')
  }, [exito, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    // Limpiar error del campo al escribir
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }))
  }

  /* ── Validaciones frontend ─────────────────────────────── */
  const validar = () => {
    const err = {}

    // RF1.1 — campos requeridos
    if (!form.nombreCompleto.trim())  err.nombreCompleto  = 'El nombre completo es obligatorio'
    if (!form.nacionalidad.trim())    err.nacionalidad    = 'La nacionalidad es obligatoria'
    if (!form.numeroDocumento.trim()) err.numeroDocumento = 'El número de documento es obligatorio'

    // RF1.2 — formato de correo
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.correo.trim()) {
      err.correo = 'El correo es obligatorio'
    } else if (!regexCorreo.test(form.correo)) {
      err.correo = 'El correo no tiene un formato válido'
    }

    // RF1.3 — confirmar correo
    if (!form.confirmarCorreo.trim()) {
      err.confirmarCorreo = 'Debes confirmar el correo'
    } else if (form.correo !== form.confirmarCorreo) {
      err.confirmarCorreo = 'Los correos no coinciden'
    }

    // RF1.13 — validar número de celular
    const regexTel = /^(\+57|57)?[3][0-9]{9}$/
    if (!form.telefono.trim()) {
      err.telefono = 'El teléfono es obligatorio'
    } else if (!regexTel.test(form.telefono.replace(/\s/g, ''))) {
      err.telefono = 'Ingresa un número celular colombiano válido'
    }

    // RF1.7 — edad mínima 18 años
    if (!form.fechaNacimiento) {
      err.fechaNacimiento = 'La fecha de nacimiento es obligatoria'
    } else {
      const hoy = new Date()
      const nac = new Date(form.fechaNacimiento)
      const edad = hoy.getFullYear() - nac.getFullYear()
      const cumplioAnio =
        hoy.getMonth() > nac.getMonth() ||
        (hoy.getMonth() === nac.getMonth() && hoy.getDate() >= nac.getDate())
      if ((cumplioAnio ? edad : edad - 1) < 18)
        err.fechaNacimiento = 'Debes tener al menos 18 años para registrarte'
    }

    // RF1.4 — contraseña segura
    const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/
    if (!form.password) {
      err.password = 'La contraseña es obligatoria'
    } else if (!regexPass.test(form.password)) {
      err.password = 'Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo'
    }

    // RF1.5 — confirmar contraseña
    if (!form.confirmarPassword) {
      err.confirmarPassword = 'Debes confirmar la contraseña'
    } else if (form.password !== form.confirmarPassword) {
      err.confirmarPassword = 'Las contraseñas no coinciden'
    }

    // RF1.6 — términos y condiciones
    if (!form.terminosAceptados)
      err.terminosAceptados = 'Debes aceptar los términos y condiciones'

    return err
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const encontrados = validar()
    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados)
      return
    }
    setErrores({})
    // RF1.10 — la encriptación la hace el backend
    // RF1.11 — la auditoría la registra el backend
    const { confirmarCorreo: _cc, confirmarPassword: _cp, terminosAceptados: _t, ...datos } = form
    await registrar(datos)
  }

  const cp = (name) => ({
    name,
    value:         form[name],
    error:         errores[name],
    onChange:      handleChange,
    verPassword,
    verConfirmar,
    setVerPassword,
    setVerConfirmar,
  })

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">

      {/* ── CONTENIDO PRINCIPAL ──────────────────────────── */}
      <div className="flex-1 flex items-start gap-12 px-[4%] py-10 w-full box-border">

        {/* Panel izquierdo — logo */}
        <div className="hidden lg:flex flex-col items-start pt-4 w-64 flex-shrink-0">
          <img src={logo} alt="RentaMóvil" className="w-56 mb-4" />
          <p className="text-sm text-[#1e3a8a] font-semibold leading-relaxed">
            Crea tu cuenta y empieza a reservar vehículos en minutos.
          </p>
          <div className="mt-8 space-y-3">
            {[
              '✅ Registro rápido y seguro',
              '✅ Pago con PSE, Nequi y tarjetas',
              '✅ Contratos digitales al instante',
              '✅ Soporte 24/7',
            ].map(item => (
              <p key={item} className="text-xs text-slate-600">{item}</p>
            ))}
          </div>
        </div>

        {/* Tarjeta del formulario */}
        <div className="flex-1 bg-white rounded-xl shadow-md p-8 lg:p-10">

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-800">Registro de Usuario</h2>
            <div className="w-14 h-0.5 bg-[#1e3a8a] rounded-full mt-2 mb-1" />
            <p className="text-sm text-slate-500">Completa todos los campos para crear tu cuenta</p>
          </div>

          {/* RF1.9 — mensajes de error global */}
          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2.5">
              <span className="text-red-500 text-lg flex-shrink-0">⚠️</span>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* RF1.9 — mensaje de éxito / RF1.14 — correo de confirmación */}
          {exito && (
            <div className="mb-5 p-3.5 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2.5">
              <span className="text-green-500 text-lg flex-shrink-0">✅</span>
              <p className="text-green-700 text-sm font-medium">
                ¡Cuenta creada! Revisa tu correo para confirmar tu registro.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            {/* Fila 1 — Nombre + Correo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo {...cp('nombreCompleto')} label="Nombre completo" placeholder="Ej: Laura Vanessa Pérez" required />
              <Campo {...cp('correo')} label="Correo electrónico" type="email" placeholder="correo@ejemplo.com" required />
            </div>

            {/* Fila 2 — Confirmar correo + Nacionalidad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo {...cp('confirmarCorreo')} label="Confirmar correo" type="email" placeholder="Repite tu correo" required />
              <Campo {...cp('nacionalidad')} label="Nacionalidad" placeholder="Ej: Colombiana" required />
            </div>

            {/* Fila 3 — Documento + Teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo {...cp('numeroDocumento')} label="Número de documento" placeholder="Ej: 1075123456" required />
              <Campo {...cp('telefono')} label="Teléfono celular" placeholder="+57 300 000 0000" required />
            </div>

            {/* Fila 4 — Fecha de nacimiento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo {...cp('fechaNacimiento')} label="Fecha de nacimiento (mín. 18 años)" type="date" required />
              <div />
            </div>

            {/* Fila 5 — Contraseña + Confirmar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Campo {...cp('password')} label="Contraseña" placeholder="Mínimo 8 caracteres" required />
                <BarraSeguridad password={form.password} />
              </div>
              <Campo {...cp('confirmarPassword')} label="Confirmar contraseña" placeholder="Repite tu contraseña" required />
            </div>

            {/* RF1.6 — Términos y condiciones */}
            <div className="flex flex-col gap-1">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  name="terminosAceptados"
                  id="terminos"
                  checked={form.terminosAceptados}
                  onChange={handleChange}
                  className="w-4 h-4 mt-0.5 cursor-pointer accent-[#1e3a8a]"
                />
                <label htmlFor="terminos" className="text-sm text-slate-600 cursor-pointer leading-relaxed">
                  Acepto los{' '}
                  <span className="text-[#1e3a8a] font-semibold underline cursor-pointer">
                    términos y condiciones
                  </span>
                  {' '}y el tratamiento de mis datos personales según la Ley 1581 de 2012.
                </label>
              </div>
              {errores.terminosAceptados && (
                <p className="text-[11px] text-red-500">{errores.terminosAceptados}</p>
              )}
            </div>

            {/* Botón principal */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3.5 rounded-lg bg-[#1e3a8a] text-white font-black text-sm tracking-wide hover:bg-[#162d6e] disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 mt-2"
            >
              {cargando ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando cuenta...
                </span>
              ) : 'CREAR MI CUENTA'}
            </button>

            {/* Links */}
            <p className="text-center text-sm text-slate-500">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-[#1e3a8a] font-bold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-2.5 rounded-lg border-2 border-[#1e3a8a]/30 text-[#1e3a8a] font-semibold text-sm hover:bg-[#1e3a8a]/5 transition-all"
            >
              Entrar como invitado
            </button>

          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#e8eef8] px-[4%] py-3 text-xs text-slate-500">
        ● RentaMóvil Location © 2026 · Ficha 3145555 — SENA CIES
      </div>

    </div>
  )
}