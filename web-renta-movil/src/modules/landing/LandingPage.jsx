import { Link } from 'react-router-dom'
import logo from "@/assets/logo/logo.png"

const CarIcon = () => (
  <svg style={{width:'28px',height:'28px',color:'#1e3a8a'}} fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
  </svg>
)

const features = [
  {
    titulo: 'Flota premium',
    desc: 'Más de 50 vehículos disponibles: SUVs, sedanes, económicos y deportivos para cada necesidad.',
    icon: <svg style={{width:'24px',height:'24px'}} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
  },
  {
    titulo: 'Pagos 100% seguros',
    desc: 'PSE, Nequi, tarjetas crédito/débito a través de Wompi con cifrado SSL/TLS.',
    icon: <svg style={{width:'24px',height:'24px'}} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
  },
  {
    titulo: 'Contratos digitales',
    desc: 'Firma tu contrato en línea con validez legal. Sin papeleos, sin filas, sin complicaciones.',
    icon: <svg style={{width:'24px',height:'24px'}} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  },
  {
    titulo: 'Múltiples sucursales',
    desc: 'Recoge y devuelve tu vehículo en la sucursal más cercana con disponibilidad en tiempo real.',
    icon: <svg style={{width:'24px',height:'24px'}} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
  },
  {
    titulo: 'App móvil PWA',
    desc: 'Reserva desde tu celular Android. Interfaz adaptada para una experiencia fluida en cualquier dispositivo.',
    icon: <svg style={{width:'24px',height:'24px'}} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-3 3h3" /></svg>,
  },
  {
    titulo: 'Calificaciones reales',
    desc: 'Lee reseñas verificadas de otros conductores y califica tu experiencia al finalizar cada viaje.',
    icon: <svg style={{width:'24px',height:'24px'}} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
  },
]

const pasos = [
  { num: '01', titulo: 'Crea tu cuenta', desc: 'Regístrate en minutos y sube tu licencia de conducir para verificación.' },
  { num: '02', titulo: 'Elige tu vehículo', desc: 'Explora la flota, filtra por categoría, precio y disponibilidad.' },
  { num: '03', titulo: 'Reserva y paga', desc: 'Selecciona fechas, sucursal y método de pago. Recibe tu contrato digital.' },
  { num: '04', titulo: 'Conduce libre', desc: 'Recoge tu vehículo, disfruta el viaje y califica tu experiencia.' },
]

const S = {
  section: (bg) => ({ padding: '80px 0', background: bg }),
  inner:   { maxWidth: '1280px', margin: '0 auto', padding: '0 48px' },
  badge:   {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: '#eff6ff', border: '1px solid #bfdbfe',
    color: '#1e3a8a', fontSize: '12px', fontWeight: 700,
    padding: '6px 16px', borderRadius: '9999px', marginBottom: '24px',
  },
  sectionLabel: {
    color: '#1e3a8a', fontSize: '12px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    display: 'block', marginBottom: '8px',
  },
  sectionTitle: {
    fontSize: '2rem', fontWeight: 900, color: '#0f172a',
    margin: '0 0 12px', lineHeight: 1.2,
  },
  sectionSub: { color: '#64748b', fontSize: '15px', margin: 0 },
}

const linkNavStyle = {
  fontSize: '13px', color: '#475569', fontWeight: 600,
  textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'pointer',
}

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        height: '68px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 48px', height: '100%', display: 'flex', alignItems: 'center', gap: '32px' }}>
          <img src={logo} alt="RentaMovil" style={{ height: '40px', flexShrink: 0 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1, justifyContent: 'center' }}>

            {/* ── Vehículos → /catalogo ── */}
            <Link
              to="/catalogo"
              style={linkNavStyle}
              onMouseEnter={e => e.currentTarget.style.color = '#1e3a8a'}
              onMouseLeave={e => e.currentTarget.style.color = '#475569'}
            >
              Vehículos
            </Link>

            {/* ── Resto del menú (anclas) ── */}
            {[
              { label: 'Sucursales', href: '#sucursales'    },
              { label: 'Servicios',  href: '#como-funciona' },
              { label: 'Tarifas',    href: '#tarifas'       },
              { label: 'Soporte',    href: '#soporte'       },
            ].map(({ label, href }) => (
              <a key={label} href={href} style={linkNavStyle}
                onMouseEnter={e => e.currentTarget.style.color = '#1e3a8a'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
              >{label}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <Link to="/login" style={{
              padding: '8px 20px', borderRadius: '9999px',
              border: '2px solid rgba(30,58,138,0.25)', color: '#1e3a8a',
              fontSize: '13px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,58,138,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >Iniciar sesión</Link>
            <Link to="/registro" style={{
              padding: '8px 20px', borderRadius: '9999px',
              background: '#1e3a8a', color: '#fff',
              fontSize: '13px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(30,58,138,0.25)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#162d6e'}
              onMouseLeave={e => e.currentTarget.style.background = '#1e3a8a'}
            >Registrarse</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative', paddingTop: '68px', minHeight: '100vh',
        background: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 50%,#fff 100%)',
        display: 'flex', alignItems: 'center', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(191,219,254,0.5)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(199,210,254,0.35)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '80px 48px', display: 'flex', alignItems: 'center', gap: '64px', flexWrap: 'wrap' }}>

          <div style={{ flex: '1 1 400px', minWidth: '300px' }}>
            <span style={S.badge}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1e3a8a' }} />
              Disponible en Colombia 🇨🇴
            </span>
            <h1 style={{ fontSize: 'clamp(2.2rem,4vw,3.5rem)', fontWeight: 900, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '20px' }}>
              Alquila fácil,<br />
              <span style={{ background: 'linear-gradient(90deg,#1e3a8a,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                conduce libre
              </span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '17px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '440px' }}>
              La plataforma digital que moderniza el alquiler de vehículos en Colombia.
              Reserva en minutos, paga seguro y maneja sin complicaciones.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '40px' }}>
              <Link to="/registro" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 28px', borderRadius: '9999px',
                background: '#1e3a8a', color: '#fff', fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(30,58,138,0.30)',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#162d6e'}
                onMouseLeave={e => e.currentTarget.style.background = '#1e3a8a'}
              >
                Comenzar ahora
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
              <Link to="/login" style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '14px 28px', borderRadius: '9999px',
                border: '2px solid #cbd5e1', color: '#334155', fontWeight: 600, fontSize: '15px', textDecoration: 'none',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#1e3a8a'; e.currentTarget.style.color = '#1e3a8a' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155' }}
              >Iniciar sesión</Link>
            </div>
            <div style={{ display: 'flex', gap: '40px' }}>
              {[['50+', 'Vehículos'], ['24/7', 'Soporte'], ['100%', 'Digital']].map(([n, l]) => (
                <div key={l}>
                  <p style={{ fontSize: '28px', fontWeight: 900, color: '#1e3a8a', margin: 0 }}>{n}</p>
                  <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, marginTop: '4px' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card */}
          <div style={{ flex: '1 1 340px', maxWidth: '420px' }}>
            <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 20px 60px rgba(30,58,138,0.13)', border: '1px solid #f1f5f9', padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Disponibles ahora</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '9999px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />En línea
                </span>
              </div>
              {[
                { modelo: 'Sedan Económico', nombre: 'Toyota Corolla 2024', precio: '$85k/día' },
                { modelo: 'SUV Premium',     nombre: 'Mazda CX-5 2024',     precio: '$145k/día' },
                { modelo: 'Deportivo',       nombre: 'Mustang GT 2023',      precio: '$220k/día' },
              ].map((car) => (
                <div key={car.nombre} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px', borderRadius: '16px', background: '#f8fafc', marginBottom: '10px', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CarIcon />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{car.modelo}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>{car.nombre}</p>
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 900, color: '#1e3a8a', whiteSpace: 'nowrap' }}>{car.precio}</span>
                </div>
              ))}

              {/* ── Ver toda la flota → /catalogo ── */}
              <Link to="/catalogo" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', marginTop: '16px', padding: '14px', borderRadius: '16px',
                background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', color: '#fff',
                fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(30,58,138,0.25)',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Ver toda la flota
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" style={{ padding: '80px 0', background: '#f8fafc' }}>
        <div style={S.inner}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={S.sectionLabel}>Proceso simple</span>
            <h2 style={S.sectionTitle}>¿Cómo funciona?</h2>
            <p style={S.sectionSub}>En 4 pasos tienes tu vehículo listo para manejar</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '24px' }}>
            {pasos.map((p, i) => (
              <div key={p.num} style={{ position: 'relative', background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                {i < pasos.length - 1 && (
                  <div style={{ display: 'none', position: 'absolute', top: '36px', right: '-12px', zIndex: 1 }}>
                    <svg width="24" height="24" fill="none" stroke="#cbd5e1" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </div>
                )}
                <p style={{ fontSize: '3rem', fontWeight: 900, color: 'rgba(30,58,138,0.15)', margin: '0 0 12px', lineHeight: 1 }}>{p.num}</p>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>{p.titulo}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUÉ ELEGIRNOS ── */}
      <section id="servicios" style={{ padding: '80px 0', background: '#fff' }}>
        <div style={S.inner}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={S.sectionLabel}>Todo incluido</span>
            <h2 style={S.sectionTitle}>Por qué elegirnos</h2>
            <p style={S.sectionSub}>Una plataforma completa diseñada para tu comodidad</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px' }}>
            {features.map((f) => (
              <div key={f.titulo} style={{ padding: '28px', borderRadius: '20px', border: '1px solid #f1f5f9', cursor: 'default', transition: 'all 200ms' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.background = 'rgba(239,246,255,0.5)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '16px' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>{f.titulo}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 48px', background: 'linear-gradient(135deg,#0f1a3d,#1e3a8a,#2563eb)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0 0 16px' }}>
            ¿Listo para manejar sin complicaciones?
          </h2>
          <p style={{ color: '#93c5fd', fontSize: '16px', margin: '0 0 32px' }}>
            Únete a cientos de conductores que ya confían en RentaMovil.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/registro" style={{
              padding: '14px 32px', borderRadius: '9999px', background: '#fff',
              color: '#1e3a8a', fontWeight: 700, fontSize: '14px', textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(0,0,0,0.20)',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >Crear cuenta gratis</Link>
            <Link to="/login" style={{
              padding: '14px 32px', borderRadius: '9999px',
              border: '2px solid rgba(255,255,255,0.4)', color: '#fff',
              fontWeight: 600, fontSize: '14px', textDecoration: 'none',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >Ya tengo cuenta</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '56px 48px 32px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '48px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <div style={{ maxWidth: '280px' }}>
              <img src={logo} alt="RentaMovil" style={{ height: '40px', marginBottom: '16px', filter: 'brightness(0) invert(1)', opacity: 0.85 }} />
              <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#475569', margin: 0 }}>
                Plataforma digital de alquiler de vehículos desarrollada en Colombia. Segura, eficiente y accesible.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
              {[
                { title: 'Plataforma', links: ['Catálogo de vehículos', 'Reservas', 'Pagos en línea', 'Contratos digitales'] },
                { title: 'Soporte',    links: ['Preguntas frecuentes', 'Contacto', 'Quejas y sugerencias', 'WhatsApp 24/7'] },
                { title: 'Legal',      links: ['Términos y condiciones', 'Política de privacidad', 'Ley 1581 de 2012', 'OWASP Top 10'] },
              ].map(col => (
                <div key={col.title}>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: '0 0 16px' }}>{col.title}</p>
                  {col.links.map(l => (
                    <p key={l} style={{ fontSize: '13px', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >{l}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <p style={{ fontSize: '12px', color: '#334155', margin: 0 }}>© 2025 RentaMovil. Todos los derechos reservados. Ficha 3145555 — SENA CIES.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['Facebook', 'Instagram', 'WhatsApp'].map(r => (
                <a key={r} href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', textDecoration: 'none', fontSize: '11px', fontWeight: 700 }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#475569' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#1e293b' }}
                >{r[0]}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}