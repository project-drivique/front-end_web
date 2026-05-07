import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'

const features = [
  {
    titulo: 'Flota premium',
    desc: 'Más de 500 vehículos disponibles: SUVs, sedanes, económicos y deportivos para cada necesidad.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    titulo: 'Pagos 100% seguros',
    desc: 'PSE, Nequi, tarjetas crédito/débito a través de Wompi con cifrado SSL/TLS y estándar PCI DSS.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    titulo: 'Contratos digitales',
    desc: 'Genera y descarga tu contrato en PDF al instante. Sin papeleos, sin filas, con validez legal.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    titulo: 'Múltiples sucursales',
    desc: 'Recoge y devuelve tu vehículo en la sucursal más cercana con disponibilidad en tiempo real.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    titulo: 'App móvil Android',
    desc: 'Reserva desde tu celular Android 13 y 14. Aplicación nativa optimizada para la mejor experiencia.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-3 3h3" />
      </svg>
    ),
  },
  {
    titulo: 'Calificaciones reales',
    desc: 'Lee reseñas verificadas de otros conductores y califica tu experiencia al finalizar cada viaje.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
]

const pasos = [
  { num: '01', titulo: 'Crea tu cuenta',    desc: 'Regístrate en minutos y sube tu licencia de conducir para verificación rápida.' },
  { num: '02', titulo: 'Elige tu vehículo', desc: 'Explora la flota, filtra por categoría, precio y disponibilidad en tiempo real.' },
  { num: '03', titulo: 'Reserva y paga',    desc: 'Selecciona fechas, sucursal y método de pago. Recibe tu contrato digital.' },
  { num: '04', titulo: 'Conduce libre',     desc: 'Recoge tu vehículo, disfruta el viaje y califica tu experiencia.' },
]

const vehiculosHero = [
  { icono: '🚗', modelo: 'Económico', nombre: 'Renault Sandero 2023', precio: '$75k/día',  disponible: true  },
  { icono: '🚙', modelo: 'SUV',       nombre: 'Toyota Prado TX 2023', precio: '$180k/día', disponible: true  },
  { icono: '🏎️', modelo: 'Premium',   nombre: 'Ford Explorer 2024',   precio: '$210k/día', disponible: false },
]

const badgeClases = {
  Económico: 'bg-emerald-100 text-emerald-700',
  SUV:       'bg-blue-100 text-blue-700',
  Premium:   'bg-amber-100 text-amber-700',
}

const navLinks = [
  { label: 'Vehículos',     href: '#catalogo'      },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Servicios',     href: '#servicios'     },
  { label: 'Soporte',       href: '#footer'        },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between gap-8">

          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img src={logo} alt="RentaMóvil" className="h-10 w-auto" />
            <span className="text-xl font-black text-[#1e3a8a] hidden sm:block">
              Renta<span className="text-[#3b82f6]">Móvil</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10 flex-1 justify-center">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-base text-slate-600 font-semibold hover:text-[#1e3a8a] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/"
              className="px-6 py-2.5 rounded-lg text-[#1e3a8a] border border-[#1e3a8a]/30 text-base font-semibold hover:bg-[#1e3a8a]/5 transition-all hidden sm:block"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/"
              className="px-6 py-2.5 rounded-lg bg-[#1e3a8a] text-white text-base font-bold hover:bg-[#162d6e] transition-all shadow-sm"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-[#eff6ff] via-[#dbeafe] to-white pt-24 min-h-screen flex items-center overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-100/60 -translate-y-1/4 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-100/40 translate-y-1/4 -translate-x-1/4 pointer-events-none" />

        <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24 flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

          <div className="flex-1 text-left">
            <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-[#1e3a8a] text-sm font-bold px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Disponible en Colombia · 8 sucursales activas
            </span>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-tight mb-8">
              Alquila fácil,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6]">
                conduce libre
              </span>
            </h1>

            <p className="text-slate-600 text-lg lg:text-xl leading-relaxed mb-12 max-w-2xl font-medium">
              La plataforma digital que moderniza el alquiler de vehículos en Colombia.
              Reserva en minutos, paga seguro y maneja sin complicaciones.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-[#1e3a8a] text-white font-bold text-lg hover:bg-[#162d6e] transition-all shadow-lg shadow-blue-900/20 active:scale-95"
              >
                Comenzar ahora
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                to="/"
                className="inline-flex items-center px-10 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-lg hover:border-[#1e3a8a] hover:text-[#1e3a8a] transition-all"
              >
                Iniciar sesión
              </Link>
            </div>

            <div className="flex items-center gap-12 pt-10 border-t border-slate-200/80">
              {[['500+', 'Vehículos'], ['12K+', 'Clientes'], ['8', 'Sucursales'], ['24/7', 'Soporte']].map((item) => (
                <div key={item[1]}>
                  <p className="text-3xl font-black text-[#1e3a8a] leading-none">{item[0]}</p>
                  <p className="text-sm text-slate-500 font-semibold mt-2">{item[1]}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-6 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">Paga con:</span>
              {['Wompi', 'PSE', 'Nequi', 'Visa', 'Mastercard'].map((m) => (
                <span key={m} className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-600 shadow-sm">
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 flex justify-center lg:justify-end w-full">
            <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 p-7 w-full max-w-md border border-slate-100">

              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Disponibles ahora</p>
                  <p className="text-sm font-bold text-[#1e3a8a] mt-0.5">Elige y reserva al instante</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  En línea
                </span>
              </div>

              <div className="space-y-3 mb-5">
                {vehiculosHero.map((car) => (
                  <div
                    key={car.nombre}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-transparent hover:border-blue-200 transition-all group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#dbeafe] to-[#eff6ff] flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {car.icono}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full ' + badgeClases[car.modelo]}>
                          {car.modelo}
                        </span>
                        {!car.disponible && (
                          <span className="text-[10px] font-semibold text-slate-400">No disponible</span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-800 truncate">{car.nombre}</p>
                    </div>
                    <p className="text-base font-black text-[#1e3a8a] whitespace-nowrap flex-shrink-0">
                      {car.precio}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                to="/"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#1e3a8a] text-white text-sm font-bold hover:bg-[#162d6e] transition-all active:scale-95 shadow-lg shadow-blue-900/20"
              >
                Ver toda la flota
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>

              <p className="text-center text-xs text-slate-400 mt-3">
                ¿Sin cuenta?{' '}
                <Link to="/" className="text-[#1e3a8a] font-semibold hover:underline">
                  Explora sin registrarte
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-28 px-8 lg:px-12 bg-slate-50">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#1e3a8a] text-sm font-bold uppercase tracking-widest">Proceso simple</span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mt-3 mb-4">¿Cómo funciona?</h2>
            <p className="text-slate-600 text-lg max-w-lg mx-auto">En 4 pasos tienes tu vehículo listo para manejar</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pasos.map((p, i) => (
              <div
                key={p.num}
                className="relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
              >
                {i < pasos.length - 1 && (
                  <div className="hidden lg:flex absolute top-8 -right-3 z-10 w-6 h-6 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-white text-sm font-black">{p.num}</span>
                </div>
                <h3 className="text-slate-800 font-bold text-base mb-2">{p.titulo}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUÉ ELEGIRNOS */}
      <section id="servicios" className="py-28 px-8 lg:px-12 bg-white">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#1e3a8a] text-sm font-bold uppercase tracking-widest">Todo incluido</span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mt-3 mb-4">Por qué elegirnos</h2>
            <p className="text-slate-600 text-lg max-w-xl mx-auto">Una plataforma completa diseñada para tu comodidad</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.titulo}
                className="group p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-200">
                  {f.icon}
                </div>
                <h3 className="text-slate-800 font-bold text-base mb-2">{f.titulo}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 px-8 lg:px-12 bg-gradient-to-br from-[#0f1a3d] via-[#1e3a8a] to-[#2563eb] relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
            ¿Listo para manejar<br className="hidden sm:block" /> sin complicaciones?
          </h2>
          <p className="text-blue-200 text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Únete a miles de conductores que ya confían en RentaMóvil.
            Crea tu cuenta gratis en menos de 2 minutos.
          </p>

          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            <span className="text-blue-300 text-xs font-medium">Paga con:</span>
            {['Wompi', 'PSE', 'Nequi', 'Visa', 'Mastercard'].map((m) => (
              <span key={m} className="px-2.5 py-1 rounded-md bg-white/10 border border-white/20 text-xs font-semibold text-white">
                {m}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/"
              className="px-10 py-4 rounded-xl bg-white text-[#1e3a8a] font-black text-lg hover:scale-105 transition-transform shadow-xl active:scale-95"
            >
              Crear cuenta gratis →
            </Link>
            <Link
              to="/"
              className="px-10 py-4 rounded-xl border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition-all"
            >
              Ya tengo cuenta
            </Link>
          </div>

          <p className="text-blue-300/60 text-xs mt-6">
            ✅ Sin tarjeta requerida · ✅ Cancela cuando quieras · ✅ Soporte 24/7
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="footer" className="bg-slate-900 text-slate-400 py-20 px-8 lg:px-12">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-12 mb-10">

            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <img src={logo} alt="RentaMóvil" className="h-9 w-auto brightness-0 invert opacity-80" />
                <span className="text-white font-black text-lg">
                  Renta<span className="text-blue-400">Móvil</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">
                Plataforma digital de alquiler de vehículos. Segura, eficiente y accesible para todos en Colombia.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <p className="text-white font-bold mb-4 text-sm">Plataforma</p>
                {['Catálogo de vehículos', 'Reservas en línea', 'Pagos con Wompi', 'Contratos digitales'].map((l) => (
                  <p key={l} className="mt-2.5 text-xs hover:text-white cursor-pointer transition-colors">{l}</p>
                ))}
              </div>
              <div>
                <p className="text-white font-bold mb-4 text-sm">Soporte</p>
                {['Preguntas frecuentes', 'Contacto', 'Quejas y sugerencias', 'WhatsApp 24/7'].map((l) => (
                  <p key={l} className="mt-2.5 text-xs hover:text-white cursor-pointer transition-colors">{l}</p>
                ))}
              </div>
              <div>
                <p className="text-white font-bold mb-4 text-sm">Legal</p>
                {['Términos y condiciones', 'Política de privacidad', 'Ley 1581 de 2012', 'OWASP Top 10'].map((l) => (
                  <p key={l} className="mt-2.5 text-xs hover:text-white cursor-pointer transition-colors">{l}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">© 2026 RentaMóvil. Todos los derechos reservados. Ficha 3145555 — SENA CIES.</p>
            <div className="flex gap-3">
              {[
                { label: 'Facebook',  body: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg> },
                { label: 'Instagram', body: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg> },
                { label: 'WhatsApp',  body: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.886l6.204-1.448A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.659-.5-5.187-1.373l-.371-.221-3.845.897.943-3.741-.242-.386A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg> },
              ].map((r) => (
                <a key={r.label} href="#" aria-label={r.label}
                  className="w-9 h-9 rounded-full border border-slate-700 flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-500 transition-all">
                  {r.body}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

