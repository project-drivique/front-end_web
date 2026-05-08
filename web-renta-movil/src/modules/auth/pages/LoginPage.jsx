import { Link } from 'react-router-dom'
import logo from '../../../assets/logo.png'
import { useLogin } from '../hooks/useLogin'

export default function LoginPage() {
  const {
    correo, contrasena, mostrarPass, cargando,
    intentos, bloqueado, errores, exito,
    setContrasena, setMostrarPass,
    handleCorreoChange, handleSubmit,
    MAX_INTENTOS,
  } = useLogin()

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#e0f2fe] via-[#bae6fd] to-[#e0f2fe]">

      {/* Panel izquierdo solo desktop */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-16 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/30" />
        <div className="absolute -bottom-10 -right-10 w-96 h-96 rounded-full bg-white/20" />
        <img src={logo} alt="RentaMovil" className="w-64 mb-8 drop-shadow-xl" />
        <h2 className="text-[#1e3a8a] text-3xl font-black text-center leading-tight mb-3">
          Bienvenido de vuelta
        </h2>
        <p className="text-[#1e3a8a]/70 text-center text-sm max-w-xs leading-relaxed mb-10">
          Ingresa a tu cuenta y gestiona tus reservas, pagos y contratos desde un solo lugar.
        </p>
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
          {[['', 'Reservas'], ['', 'Pagos'], ['', 'Contratos']].map(([icon, label]) => (
            <div key={label} className="bg-white/40 rounded-xl p-4 text-center border border-white/60">
              <div className="text-2xl mb-1">{icon}</div>
              <p className="text-[#1e3a8a] text-xs font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-8">
            <img src={logo} alt="RentaMovil" className="h-16 mx-auto" />
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h1 className="text-2xl font-black text-slate-800 mb-1">Bienvenido</h1>
            <p className="text-slate-400 text-sm mb-7">Ingresa tus credenciales para continuar</p>

            {exito && (
              <div className="mb-5 p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                ✓ {exito}
              </div>
            )}
            {errores.general && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {errores.general}
              </div>
            )}
            {intentos > 0 && !bloqueado && (
              <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                 Intento {intentos} de {MAX_INTENTOS}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => handleCorreoChange(e.target.value)}
                  disabled={bloqueado || cargando}
                  placeholder="ejemplo@correo.com"
                  autoComplete="email"
                  className={`w-full px-4 py-3 rounded-xl border text-slate-800 text-sm placeholder-slate-300 outline-none transition-all
                    focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]
                    disabled:bg-slate-50 disabled:cursor-not-allowed
                    ${errores.correo ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                />
                {errores.correo && <p className="mt-1.5 text-xs text-red-500">{errores.correo}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={mostrarPass ? 'text' : 'password'}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    disabled={bloqueado || cargando}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className={`w-full px-4 py-3 pr-12 rounded-xl border text-slate-800 text-sm placeholder-slate-300 outline-none transition-all
                      focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]
                      disabled:bg-slate-50 disabled:cursor-not-allowed
                      ${errores.contrasena ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  />
                  <button type="button" onClick={() => setMostrarPass(!mostrarPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {mostrarPass ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errores.contrasena && <p className="mt-1.5 text-xs text-red-500">{errores.contrasena}</p>}
              </div>

              <div className="text-right -mt-1">
            <Link to="/forgot-password" className="text-sm text-[#1e3a8a] font-semibold hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
                </div>

              <button type="submit" disabled={bloqueado || cargando}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white font-black text-sm tracking-wide hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-blue-900/20">
                {cargando ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </span>
                ) : 'INICIAR SESIÓN'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-6">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="text-[#1e3a8a] font-bold hover:underline">
                Regístrate
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}