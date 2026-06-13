import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanding } from '../../landing/LandingContext'
import { useCatalogo } from '../hooks/useCatalogo'
import logo from '@/assets/logo/logo.png'
import GridVehiculos from '../components/GridVehiculos'
import EstadoCarga from '../components/EstadoCarga'
import EstadoError from '../components/EstadoError'
import { showAlert } from '@/utils/swalConfig'
import { FaMapMarkerAlt, FaClock, FaPhoneAlt, FaCar, FaStar, FaMoneyBillWave, FaCheckCircle, FaAngleDown } from 'react-icons/fa'

const COLOR_MARCA = '#1e3a8a'
const coloresTema = (esModoOscuro) => ({
  pageBg: esModoOscuro ? '#020617' : '#f8fafc',
  navBg: esModoOscuro ? 'rgba(2,6,23,0.95)' : 'rgba(255,255,255,0.98)',
  navBorder: esModoOscuro ? '#1e293b' : '#f1f5f9',
  navShadow: esModoOscuro ? '0 1px 8px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)',
  navText: esModoOscuro ? '#cbd5e1' : '#475569',
  heroBg: esModoOscuro ? 'linear-gradient(135deg,#020617 0%,#0f172a 100%)' : 'linear-gradient(135deg,#e0e7ff 0%,#eff6ff 100%)',
  panelBg: esModoOscuro ? '#0f172a' : '#ffffff',
  panelBorder: esModoOscuro ? '#1e293b' : '#e2e8f0',
  panelShadow: esModoOscuro ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(148,163,184,0.15)',
  textPrimary: esModoOscuro ? '#f8fafc' : '#0f172a',
  textSecondary: esModoOscuro ? '#94a3b8' : '#64748b',
  accentText: esModoOscuro ? '#60a5fa' : '#2563eb',
  accentBgSoft: esModoOscuro ? 'rgba(37,99,235,0.15)' : 'rgba(37,99,235,0.08)',
  loginBorder: esModoOscuro ? 'rgba(148,163,184,0.35)' : 'rgba(30,58,138,0.25)',
  loginText: esModoOscuro ? '#e2e8f0' : COLOR_MARCA,
  loginHoverBg: esModoOscuro ? 'rgba(148,163,184,0.08)' : 'rgba(30,58,138,0.05)',
  badgeBg: esModoOscuro ? '#1e293b' : '#f1f5f9',
  itemBg: esModoOscuro ? '#1e293b' : '#f8fafc',
})

const SUCURSALES_DATA = [
  {
    alias: 'Localiza (El Dorado)',
    nombreCompleto: 'Localiza Rent A Car - Bogotá El Dorado',
    ubicacion: 'AV Calle 26 # 96J-66 Local 1, Aeropuerto El Dorado',
    telefono: '01 8000 520 001 / +57 324 603 5901 (WP)',
    horarios: 'Lun-Vie 7:00-22:00; Sáb-Dom-Fest 8:00-20:00',
    flota: '6.000+ vehículos (Renault, Chevrolet, Nissan)',
    puntuacion: '5/5 (Líder Nacional)',
    precio: '$166.569/día',
    porQue: 'Empresa líder en Colombia, con más de 15 años de experiencia y la flota más grande del país.',
    logoUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80',
  },
  {
    alias: 'Tu Roll (El Poblado)',
    nombreCompleto: 'Tu Roll Rent a Car - Medellín El Poblado',
    ubicacion: 'Calle 9 # 43A-31, Multicentro Aliadas L10A',
    telefono: '+57 317 365 9708',
    horarios: 'Abierto 24/7',
    flota: '14 tipos (Económico, Sedán, Lujo, Camionetas)',
    puntuacion: '9.1/10 (Mejor Rating Nacional)',
    precio: 'Desde $116.673/día',
    porQue: 'Destacado por su insuperable servicio al cliente, disponibilidad 24/7 y precios altamente competitivos.',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=400&q=80',
  },
  {
    alias: 'Europcar (El Dorado)',
    nombreCompleto: 'Europcar Colombia - Aeropuerto El Dorado',
    ubicacion: 'AV Calle 26 # 96J-66 Local 1',
    telefono: '+57 322 629 5394 / +57 310 474 8745',
    horarios: 'Lun-Vie 7:00-21:00; Sáb-Dom-Fest 9:00-18:00',
    flota: '16 tipos de vehículos premium renovados',
    puntuacion: '4.6% más económico que el promedio',
    precio: 'Consulte nuestras tarifas premium',
    porQue: 'Estándar internacional con vehículos premium y una flota constantemente renovada para máxima seguridad.',
    logoUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=80',
  },
  {
    alias: 'Enterprise (El Dorado)',
    nombreCompleto: 'Enterprise Rent-A-Car - Bogotá',
    ubicacion: 'Ac. 26 # 106-39, Local 110, Aeropuerto',
    telefono: '(601) 508 7098 / +57 317 389 2518',
    horarios: 'Lun-Vie 5:00-23:00; Sáb-Dom-Fest 6:00-18:00',
    flota: '34 tipos de vehículos',
    puntuacion: 'Servicio Top Tier Internacional',
    precio: 'Competititvo',
    porQue: 'Mayor cobertura en terminales aéreas, servicio premium avalado por su sede central en EE.UU.',
    logoUrl: 'https://images.unsplash.com/photo-1503376713192-33433e144138?auto=format&fit=crop&w=400&q=80',
  },
  {
    alias: 'Sixt (JMC)',
    nombreCompleto: 'Sixt Rent a Car - Aeropuerto JMC Rionegro',
    ubicacion: 'Car Rental Center, Rionegro, Antioquia',
    telefono: 'Asistencia Nacional 24/7',
    horarios: 'Lun-Vie 7:00-22:00; Sáb-Dom-Fest 8:00-15:30',
    flota: 'Vehículos Premium y últimos modelos',
    puntuacion: '68.7% en Búsquedas (La más popular)',
    precio: '5.9% más barata que el Top',
    porQue: 'La agencia internacional más popular en búsquedas, integrando precios increíbles con vehículos de máximo lujo y asistencia vital 24/7.',
    logoUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
  },
  {
    alias: 'Alamo (El Dorado)',
    nombreCompleto: 'Alamo Rent A Car - Bogotá',
    ubicacion: 'Aeropuerto El Dorado y 15 oficinas nacionales',
    telefono: '+57 300 000 0000',
    horarios: 'Consultar según locación',
    flota: '34 tipos de vehículos sumamente variados',
    puntuacion: '67.2% en Búsquedas (2ª más popular)',
    precio: '14.2% más barata',
    porQue: 'Especialistas en tarifas bajas mantenidas y una inmensa gama de familias de vehículos para todo presupuesto.',
    logoUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=400&q=80',
  }
]

export default function SucursalesPage() {
  const { tema } = useLanding()
  const navigate = useNavigate()
  const esModoOscuro = tema === 'oscuro'
  const c = coloresTema(esModoOscuro)

  const [sucursalAbierta, setSucursalAbierta] = useState(null)
  
  const {
    vehiculos,
    cargando,
    error,
    reintentar,
  } = useCatalogo()

  const handleBuscarInvitado = () => {
    showAlert({
      icon: 'info',
      title: 'Registro Requerido',
      text: 'Para consultar o reservar vehículos de esta sucursal es necesario acceder a tu cuenta.',
      confirmButtonText: 'Ir a registro',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) navigate('/registro')
    })
  }

  const vehiculosSucursalCache = useMemo(() => {
    const map = {}
    SUCURSALES_DATA.forEach(s => map[s.alias] = [])
    vehiculos.forEach(v => {
      if (map[v.sucursal]) map[v.sucursal].push(v)
    })
    return map
  }, [vehiculos])

  return (
    <div style={{ minHeight: '100vh', background: c.pageBg, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
        background: c.navBg, backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${c.navBorder}`, boxShadow: c.navShadow,
        height: '68px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/"><img src={logo} alt="RentaMovil" style={{ height: '40px', flexShrink: 0 }} /></Link>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/login"
              style={{
                padding: '8px 20px', borderRadius: '9999px',
                border: `2px solid ${c.loginBorder}`, color: c.loginText,
                fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                background: 'transparent', transition: 'background 200ms'
              }}
              onMouseEnter={e => e.currentTarget.style.background = c.loginHoverBg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Iniciar sesión
            </Link>
            <Link to="/registro" style={{ padding: '8px 20px', borderRadius: '9999px', background: COLOR_MARCA, color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ paddingTop: '68px', flex: 1 }}>
        <div style={{ background: c.heroBg, padding: '80px 24px', textAlign: 'center', position: 'relative', borderBottom: `1px solid ${c.navBorder}` }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '9999px', background: c.accentBgSoft, color: c.accentText, fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px' }}>
              Red Oficial de Agencias
            </span>
            <h1 style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 900, color: c.textPrimary, margin: '0 0 20px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Las Mejores Compañías <br/>a tu Disposición
            </h1>
            <p style={{ fontSize: '18px', color: c.textSecondary, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
              Descubre nuestras alianzas insignia alrededor de Colombia. Empresas con alto reconocimiento operando la mejor y más segura flota del país.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '-40px auto 80px', padding: '0 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {SUCURSALES_DATA.map((suc, i) => {
              const abierto = sucursalAbierta === suc.alias
              const flotaLocal = vehiculosSucursalCache[suc.alias] || []
              return (
                <div 
                  key={suc.alias}
                  style={{
                    background: c.panelBg,
                    borderRadius: '24px',
                    border: `1px solid ${abierto ? c.accentText : c.panelBorder}`,
                    boxShadow: abierto ? '0 20px 50px rgba(37,99,235,0.15)' : c.panelShadow,
                    overflow: 'hidden',
                    transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: abierto ? 'scale(1.01)' : 'scale(1)'
                  }}
                >
                  <div 
                    onClick={() => setSucursalAbierta(abierto ? null : suc.alias)}
                    style={{ 
                      padding: '32px', 
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '24px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, border: `1px solid ${c.panelBorder}` }}>
                        <img src={suc.logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h2 style={{ fontSize: '24px', fontWeight: 900, color: c.textPrimary, margin: 0, letterSpacing: '-0.01em' }}>
                            {suc.nombreCompleto}
                          </h2>
                          {suc.puntuacion.includes('Líder') || suc.puntuacion.includes('Rating') ? (
                            <span style={{ fontSize: '11px', background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>TOP</span>
                          ) : null}
                        </div>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: c.textSecondary, margin: 0 }}>
                          <FaMapMarkerAlt color={c.accentText} /> {suc.ubicacion}
                        </p>
                      </div>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', background: c.badgeBg, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.textSecondary,
                        transition: 'transform 300ms', transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}>
                        <FaAngleDown size={20} />
                      </div>
                    </div>

                    <div style={{ 
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px',
                      paddingTop: '20px', borderTop: `1px solid ${c.panelBorder}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: c.textSecondary }}>
                        <FaClock size={16} color={c.accentText} />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{suc.horarios}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: c.textSecondary }}>
                        <FaPhoneAlt size={16} color={c.accentText} />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{suc.telefono}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: c.textSecondary }}>
                        <FaCar size={16} color={c.accentText} />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{suc.flota}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: c.textSecondary }}>
                        <FaStar size={16} color="#f59e0b" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: c.textPrimary }}>{suc.puntuacion}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: c.textSecondary }}>
                        <FaMoneyBillWave size={16} color="#10b981" />
                        <span style={{ fontSize: '13px', fontWeight: 800, color: c.textPrimary }}>{suc.precio}</span>
                      </div>
                    </div>

                    <div style={{ background: c.accentBgSoft, padding: '16px', borderRadius: '12px', border: `1px solid ${c.accentBorder}` }}>
                      <p style={{ display: 'flex', gap: '8px', fontSize: '13px', color: c.textPrimary, margin: 0, lineHeight: 1.5 }}>
                        <FaCheckCircle color={c.accentText} size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span><strong>Por qué es la mejor:</strong> {suc.porQue}</span>
                      </p>
                    </div>
                  </div>

                  <div style={{ 
                    maxHeight: abierto ? '2000px' : '0', 
                    opacity: abierto ? 1 : 0, 
                    overflow: 'hidden', 
                    transition: 'max-height 500ms ease, opacity 300ms ease',
                    background: c.itemBg,
                    borderTop: abierto ? `1px solid ${c.panelBorder}` : 'none'
                  }}>
                    <div style={{ padding: '32px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 900, color: c.textPrimary, margin: '0 0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        Vehículos Asignados
                        <span style={{ fontSize: '13px', fontWeight: 700, padding: '4px 12px', background: c.badgeBg, borderRadius: '9999px', color: c.textSecondary }}>
                         {flotaLocal.length} un.
                        </span>
                      </h3>

                      {cargando && <EstadoCarga c={c} />}
                      {!cargando && error && <EstadoError c={c} error={error} onRetry={reintentar} />}
                      
                      {!cargando && !error && flotaLocal.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', background: c.panelBg, borderRadius: '16px', border: `1px dashed ${c.panelBorder}` }}>
                          <FaCar size={32} color={c.textSecondary} style={{ marginBottom: '16px', opacity: 0.5 }} />
                          <p style={{ margin: 0, fontSize: '14px', color: c.textSecondary, fontWeight: 500 }}>Estamos gestionando la nueva flota internacional de {suc.alias}</p>
                        </div>
                      )}

                      {!cargando && !error && flotaLocal.length > 0 && (
                        <div style={{ padding: '4px' }}>
                          <GridVehiculos
                            vehiculosPagina={flotaLocal}
                            esFavorito={() => false}
                            toggleFavorito={handleBuscarInvitado}
                            c={c}
                            invitado={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
