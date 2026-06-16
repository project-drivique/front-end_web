import { useState, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanding } from '../../landing/LandingContext'
import { formatCurrency } from '@/utils/monedaUtils'
import { useCatalogo } from '../hooks/useCatalogo'
import logo from '@/assets/logo/logo.png'
import GridVehiculos from '../components/GridVehiculos'
import EstadoCarga from '../components/EstadoCarga'
import EstadoError from '../components/EstadoError'
import { showAlert } from '@/utils/swalConfig'
import {
  FaMapMarkerAlt,
  FaClock,
  FaCar,
  FaStar,
  FaMoneyBillWave,
  FaCheckCircle
} from 'react-icons/fa'

const COLOR_MARCA = '#1e3a8a'
const COLOR_ICONO_GRIS = '#475569'
const COLOR_DORADO = '#ffd700'
const COLOR_BOTON_AZUL = 'linear-gradient(90deg, #1e3a8a, #2563eb)'

const coloresTema = (esModoOscuro) => ({
  pageBg: esModoOscuro ? '#020617' : '#f8fafc',
  navBg: esModoOscuro ? 'rgba(2,6,23,0.95)' : 'rgba(255,255,255,0.98)',
  navBorder: esModoOscuro ? '#1e293b' : '#f1f5f9',
  navShadow: esModoOscuro ? '0 1px 8px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)',
  navText: esModoOscuro ? '#cbd5e1' : '#475569',
  heroBg: esModoOscuro ? '#020617' : '#f8fafc',
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
  cardBorder: esModoOscuro ? '#334155' : '#f1f5f9',
  cardBorderHover: esModoOscuro ? '#475569' : '#dbeafe',
  cardShadow: esModoOscuro ? '0 4px 18px rgba(0,0,0,0.24)' : '0 2px 8px rgba(0,0,0,0.05)',
  cardShadowHover: esModoOscuro ? '0 8px 32px rgba(0,0,0,0.35)' : '0 8px 24px rgba(37,99,235,0.12)',
  imageFallbackBg: esModoOscuro ? '#1e293b' : '#f1f5f9',
  imageFallbackIcon: esModoOscuro ? '#334155' : '#cbd5e1',
  textSoft: esModoOscuro ? '#64748b' : '#94a3b8',
  textMuted: esModoOscuro ? '#475569' : '#cbd5e1',
  paginationDisabledBg: esModoOscuro ? '#0f172a' : '#f1f5f9',
  accentGradient: 'linear-gradient(90deg, #1e3a8a, #2563eb)',
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
    precioBase: 166569,
    preTextoPrecio: 'Desde ',
    porQue: 'Empresa líder en Colombia, con más de 15 años de experiencia y la flota más grande del país.',
    logoUrl: 'https://veraabogados.com/wp-content/uploads/2023/05/logo-localiza-2022.jpg',
  },
  {
    alias: 'Tu Roll (El Poblado)',
    nombreCompleto: 'Tu Roll Rent a Car - Medellín El Poblado',
    ubicacion: 'Calle 9 # 43A-31, Multicentro Aliadas L10A',
    telefono: '+57 317 365 9708',
    horarios: 'Abierto 24/7',
    flota: '14 tipos (Económico, Sedán, Lujo, Camionetas)',
    puntuacion: '9.1/10 (Mejor Rating Nacional)',
    precioBase: 116673,
    preTextoPrecio: 'Desde ',
    porQue: 'Destacado por su insuperable servicio al cliente, disponibilidad 24/7 y precios altamente competitivos.',
    logoUrl: 'https://tse2.mm.bing.net/th/id/OIP.QA95ECBXmhUyak_VTBWQfAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
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
    logoUrl: 'https://www.telefono-gratuito.es/wp-content/uploads/2017/03/Telefono-de-Europcar.jpg',
  },
  {
    alias: 'Enterprise (El Dorado)',
    nombreCompleto: 'Enterprise Rent-A-Car - Bogotá',
    ubicacion: 'Ac. 26 # 106-39, Local 110, Aeropuerto',
    telefono: '(601) 508 7098 / +57 317 389 2518',
    horarios: 'Lun-Vie 5:00-23:00; Sáb-Dom-Fest 6:00-18:00',
    flota: '34 tipos de vehículos',
    puntuacion: 'Servicio Top Tier Internacional',
    precio: 'Competitivo',
    porQue: 'Mayor cobertura en terminales aéreas, servicio premium avalado por su sede central en EE.UU.',
    logoUrl: 'https://th.bing.com/th/id/OIP.bR65CPuhaiKEMCLFjOkg2QHaD-?w=325&h=180&c=7&r=0&o=7&dpr=1.1&pid=1.7&rm=3',
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
    logoUrl: 'https://th.bing.com/th/id/OIP.Z4pncc04pPRh_Eq5TRO_SAAAAA?w=238&h=180&c=7&r=0&o=7&dpr=1.1&pid=1.7&rm=3',
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
    logoUrl: 'https://images.seeklogo.com/logo-png/0/1/alamo-logo-png_seeklogo-5860.png',
  }
]

export default function SucursalesPage() {
  const { tema, moneda } = useLanding()
  const navigate = useNavigate()
  const esModoOscuro = tema === 'oscuro'
  const c = coloresTema(esModoOscuro)
  const [sucursalActiva, setSucursalActiva] = useState(null)
  const resultadosRef = useRef(null)
  const { vehiculos, cargando, error, reintentar } = useCatalogo()

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
    SUCURSALES_DATA.forEach(s => { map[s.alias] = [] })
    vehiculos.forEach(v => {
      if (map[v.sucursal]) map[v.sucursal].push(v)
    })
    return map
  }, [vehiculos])

  const flotaFiltrada = useMemo(() => {
    if (!sucursalActiva) return []
    return vehiculosSucursalCache[sucursalActiva.alias] || []
  }, [sucursalActiva, vehiculosSucursalCache])

  const verCarrosSucursal = (suc) => {
    setSucursalActiva(suc)
    setTimeout(() => {
      resultadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }

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
            <Link to="/login" style={{ padding: '8px 20px', borderRadius: '9999px', border: `2px solid ${c.loginBorder}`, color: c.loginText, fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
              Iniciar sesión
            </Link>
            <Link to="/registro" style={{ padding: '8px 20px', borderRadius: '9999px', background: COLOR_MARCA, color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ paddingTop: '68px', flex: 1 }}>
        <div style={{ padding: '40px 24px 20px', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '18px', left: '24px' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: c.accentText,
                fontWeight: 700,
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '9999px',
                background: c.accentBgSoft,
                border: `1px solid ${c.panelBorder}`,
                whiteSpace: 'nowrap'
              }}
            >
              ← Volver al inicio
            </Link>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '9999px', background: c.accentBgSoft, color: c.accentText, fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>
              Red Oficial de Agencias
            </span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: c.textPrimary, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              Vehículos por Agencia
            </h1>
            <p style={{ fontSize: '16px', color: c.textSecondary, margin: 0 }}>
              Selecciona una compañía y mira solo los carros disponibles para esa sucursal.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '30px auto 0', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {SUCURSALES_DATA.map((suc) => {
              const esActivo = sucursalActiva?.alias === suc.alias

              return (
                <div
                  key={suc.alias}
                  style={{
                    background: c.panelBg,
                    borderRadius: '22px',
                    border: `1px solid ${esActivo ? COLOR_MARCA : c.panelBorder}`,
                    boxShadow: esActivo ? '0 12px 30px rgba(37,99,235,0.15)' : '0 6px 18px rgba(15,23,42,0.06)',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 14px 34px rgba(15,23,42,0.10)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = esActivo
                      ? '0 12px 30px rgba(37,99,235,0.15)'
                      : '0 6px 18px rgba(15,23,42,0.06)'
                  }}
                >
                  <div
                    style={{
                      height: '210px',
                      borderRadius: '18px',
                      background: `linear-gradient(180deg, ${c.accentBgSoft}, transparent)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      border: `1px solid ${c.panelBorder}`,
                      padding: '10px'
                    }}
                  >
                    <img
                      src={suc.logoUrl}
                      alt={suc.alias}
                      style={{
                        width: '92%',
                        height: '92%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: c.textPrimary }}>
                      {suc.alias}
                    </h2>
                    <p style={{ margin: 0, fontSize: '13px', color: c.textSecondary, lineHeight: 1.4 }}>
                      {suc.ubicacion}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                    <div style={{ background: c.itemBg, borderRadius: '12px', padding: '10px', textAlign: 'left' }}>
                      <div style={{ color: c.textSecondary }}>Horario</div>
                      <div style={{ fontWeight: 700, color: c.textPrimary }}>{suc.horarios.split(';')[0]}</div>
                    </div>
                    <div style={{ background: c.itemBg, borderRadius: '12px', padding: '10px', textAlign: 'left' }}>
                      <div style={{ color: c.textSecondary }}>Flota</div>
                      <div style={{ fontWeight: 700, color: c.textPrimary }}>{suc.flota}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '12px', color: c.textSecondary }}>Desde</div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: COLOR_MARCA }}>
                        {suc.precioBase ? `${suc.preTextoPrecio || ''}${formatCurrency(suc.precioBase, moneda)}/día` : suc.precio}
                      </div>
                    </div>

                    <button
                      onClick={() => verCarrosSucursal(suc)}
                      style={{
                        background: COLOR_BOTON_AZUL,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '9999px',
                        padding: '10px 16px',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Ver carros
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {sucursalActiva && (
          <div ref={resultadosRef} style={{ maxWidth: '1280px', margin: '40px auto 80px', padding: '0 24px', animation: 'fadeInTab 350ms ease-in-out' }}>
            <div style={{
              background: c.panelBg,
              borderRadius: '24px',
              padding: '32px',
              border: `1px solid ${c.panelBorder}`,
              boxShadow: c.panelShadow
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${c.panelBorder}`,
                paddingBottom: '20px',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: c.textPrimary, margin: '0 0 4px' }}>
                    Autos disponibles en <span style={{ color: COLOR_MARCA }}>{sucursalActiva.alias}</span>
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: c.textSecondary }}>
                    Mostrando {flotaFiltrada.length} resultados listos para reservar
                  </p>
                </div>

                <div style={{ background: c.accentBgSoft, padding: '10px 16px', borderRadius: '12px', maxWidth: '500px' }}>
                  <p style={{ display: 'flex', gap: '8px', fontSize: '12px', color: c.textPrimary, margin: 0, lineHeight: 1.4 }}>
                    <FaCheckCircle color={COLOR_ICONO_GRIS} size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Garantía {sucursalActiva.alias}:</strong> {sucursalActiva.porQue}</span>
                  </p>
                </div>
              </div>

              {cargando && <EstadoCarga c={c} />}
              {!cargando && error && <EstadoError c={c} error={error} onRetry={reintentar} />}

              {!cargando && !error && flotaFiltrada.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', border: `1px dashed ${c.panelBorder}`, borderRadius: '16px' }}>
                  <FaCar size={40} color={c.textSecondary} style={{ marginBottom: '16px', opacity: 0.4 }} />
                  <p style={{ margin: '0 0 4px', fontSize: '15px', color: c.textPrimary, fontWeight: 700 }}>Sin vehículos asignados</p>
                  <p style={{ margin: 0, fontSize: '13px', color: c.textSecondary }}>Estamos actualizando el inventario en tiempo real para esta sucursal.</p>
                </div>
              )}

              {!cargando && !error && flotaFiltrada.length > 0 && (
                <GridVehiculos
                  vehiculosPagina={flotaFiltrada}
                  esFavorito={() => false}
                  toggleFavorito={handleBuscarInvitado}
                  c={c}
                  invitado={true}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInTab {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}