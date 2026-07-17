import { useState, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { formatCurrency } from '@/utils/monedaUtils'
import { useCatalogo } from '../hooks/useCatalogo'
import logo from '@/assets/logo.png'
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
    alias: 'Alamo Bogotá - Aeropuerto',
    nombreCompleto: 'Alamo Rent A Car - Bogotá Aeropuerto El Dorado',
    ubicacion: 'Aeropuerto Internacional El Dorado, Terminal 1, Piso 1, Bogotá',
    telefono: '01 8000 520 001 / +57 324 603 5901',
    horarios: 'Lun-Dom 24 Horas',
    flota: 'Toyota Corolla, etc.',
    puntuacion: '4.8/5 (Líder Bogotá)',
    precioBase: 85000,
    preTextoPrecio: 'Desde ',
    porQue: 'Ubicación conveniente en el aeropuerto internacional de Bogotá con servicio 24/7.',
    logoUrl: 'https://images.seeklogo.com/logo-png/0/1/alamo-logo-png_seeklogo-5860.png'
  },
  {
    alias: 'Alamo Medellín Poblado',
    nombreCompleto: 'Alamo Rent A Car - Medellín El Poblado',
    ubicacion: 'Calle 10 # 43C-28, El Poblado, Medellín',
    telefono: '+57 317 365 9708',
    horarios: 'Lun-Sáb 7:00 - 22:00; Dom 8:00 - 20:00',
    flota: 'Mazda CX-5, etc.',
    puntuacion: '4.9/5 (Excelente)',
    precioBase: 145000,
    preTextoPrecio: 'Desde ',
    porQue: 'Servicio premium en la zona más exclusiva y de fácil acceso en Medellín.',
    logoUrl: 'https://images.seeklogo.com/logo-png/0/1/alamo-logo-png_seeklogo-5860.png'
  },
  {
    alias: 'National Downtown Barranquilla',
    nombreCompleto: 'National Car Rental - Barranquilla Prado',
    ubicacion: 'Carrera 53 # 74-86, Barrio Prado, Barranquilla',
    telefono: '+57 310 474 8745',
    horarios: 'Lun-Vie 8:00-18:00; Sáb 8:00-14:00',
    flota: 'Chevrolet Spark, etc.',
    puntuacion: '4.5/5 (Confiable)',
    precioBase: 60000,
    preTextoPrecio: 'Desde ',
    porQue: 'Excelente flota económica y atención rápida en el sector tradicional de Barranquilla.',
    logoUrl: 'https://tse2.mm.bing.net/th/id/OIP.QA95ECBXmhUyak_VTBWQfAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
  },
  {
    alias: 'Alamo Cartagena - Aeropuerto',
    nombreCompleto: 'Alamo Rent A Car - Aeropuerto Rafael Núñez',
    ubicacion: 'Aeropuerto Internacional Rafael Núñez, Local 01-08, Cartagena',
    telefono: '+57 322 629 5394',
    horarios: 'Lun-Dom 7:00-22:00',
    flota: 'Ford Mustang GT, etc.',
    puntuacion: '4.7/5 (Popular)',
    precioBase: 220000,
    preTextoPrecio: 'Desde ',
    porQue: 'Recogida rápida al bajar del avión en el principal destino turístico de Colombia.',
    logoUrl: 'https://images.seeklogo.com/logo-png/0/1/alamo-logo-png_seeklogo-5860.png'
  },
  {
    alias: 'Alamo Cali - Aeropuerto',
    nombreCompleto: 'Alamo Rent A Car - Aeropuerto Alfonso Bonilla Aragón',
    ubicacion: 'Aeropuerto Alfonso Bonilla Aragón, Piso 1, Palmira (Cali)',
    telefono: '+57 317 389 2518',
    horarios: 'Lun-Dom 6:00-23:00',
    flota: 'Toyota Prado, etc.',
    puntuacion: '4.6/5 (Servicio Rápido)',
    precioBase: 180000,
    preTextoPrecio: 'Desde ',
    porQue: 'Servicio eficiente y entrega directa en el aeropuerto internacional del Valle del Cauca.',
    logoUrl: 'https://images.seeklogo.com/logo-png/0/1/alamo-logo-png_seeklogo-5860.png'
  },
  {
    alias: 'Alquiler Neiva - Centro',
    nombreCompleto: 'Drivique Alquiler de Vehículos - Neiva Centro',
    ubicacion: 'Carrera 5 # 10-42, Neiva, Huila',
    telefono: '+57 300 123 4567',
    horarios: 'Lun-Sáb 8:00-18:00',
    flota: 'Renault Sandero, etc.',
    puntuacion: '4.4/5 (Económico)',
    precioBase: 55000,
    preTextoPrecio: 'Desde ',
    porQue: 'Las tarifas más bajas de la región del Huila con atención personalizada y directa.',
    logoUrl: 'https://veraabogados.com/wp-content/uploads/2023/05/logo-localiza-2022.jpg'
  },
  {
    alias: 'Alamo Bucaramanga - Aeropuerto',
    nombreCompleto: 'Alamo Rent A Car - Aeropuerto Palonegro',
    ubicacion: 'Aeropuerto Internacional Palonegro, Bucaramanga',
    telefono: '+57 315 999 8888',
    horarios: 'Lun-Dom 8:00-21:00',
    flota: 'Hyundai Tucson, etc.',
    puntuacion: '4.8/5 (Excelente)',
    precioBase: 160000,
    preTextoPrecio: 'Desde ',
    porQue: 'Perfecto para ejecutivos y turistas que visitan Santander y su área metropolitana.',
    logoUrl: 'https://images.seeklogo.com/logo-png/0/1/alamo-logo-png_seeklogo-5860.png'
  },
  {
    alias: 'Alamo Pereira - Aeropuerto',
    nombreCompleto: 'Alamo Rent A Car - Aeropuerto Matecaña',
    ubicacion: 'Aeropuerto Internacional Matecaña, Local 57, Pereira',
    telefono: '+57 316 777 5555',
    horarios: 'Lun-Dom 7:00-22:00',
    flota: 'Kia Cerato, etc.',
    puntuacion: '4.7/5 (Muy Recomendado)',
    precioBase: 95000,
    preTextoPrecio: 'Desde ',
    porQue: 'Ubicación clave en el Eje Cafetero, ideal para recorrer Risaralda, Quindío y Caldas.',
    logoUrl: 'https://images.seeklogo.com/logo-png/0/1/alamo-logo-png_seeklogo-5860.png'
  },
  {
    alias: 'Localiza Cúcuta Aeropuerto Camilo Daza',
    nombreCompleto: 'Localiza Rent A Car - Aeropuerto Camilo Daza',
    ubicacion: 'Aeropuerto Camilo Daza, Cúcuta, Norte de Santander',
    telefono: '+57 320 111 2222',
    horarios: 'Lun-Dom 8:00-20:00',
    flota: 'Nissan Qashqai, etc.',
    puntuacion: '4.5/5 (Servicio Local)',
    precioBase: 140000,
    preTextoPrecio: 'Desde ',
    porQue: 'Facilidad de alquiler y excelente estado de vehículos para transitar en la región fronteriza.',
    logoUrl: 'https://veraabogados.com/wp-content/uploads/2023/05/logo-localiza-2022.jpg'
  }
]

export default function SucursalesPage() {
  const { t } = useTranslation()
  const { tema, moneda } = useLanding()
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const esModoOscuro = tema === 'oscuro'
  const c = coloresTema(esModoOscuro)
  const [sucursalActiva, setSucursalActiva] = useState(null)
  const resultadosRef = useRef(null)
  const { vehiculos, cargando, error, reintentar } = useCatalogo()

  const handleBuscarInvitado = () => {
    showAlert({
      icon: 'info',
      title: t('catalogo.registrationRequired'),
      text: t('catalogo.registrationRequiredText'),
      confirmButtonText: t('catalogo.goToRegister'),
      showCancelButton: true,
      cancelButtonText: t('common.cancel')
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
    <div style={{ minHeight: '100vh', background: 'var(--hero-fondo)', position: 'relative', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <div style={{ position: 'absolute', top: -80, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'var(--hero-orb1)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 350, height: 350, borderRadius: '50%', background: 'var(--hero-orb2)', pointerEvents: 'none', zIndex: 0 }} />

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
        background: c.navBg, backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${c.navBorder}`, boxShadow: c.navShadow,
        height: '96px'
      }}>
        <div className="catalogo-header-inner" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to={usuario ? "/home" : "/"}>
            <img src={logo} alt="Drivique" style={{ height: '80px', flexShrink: 0 }} />
          </Link>
          <div style={{ flex: 1 }} />
          {!usuario && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login" style={{ padding: '8px 20px', borderRadius: '9999px', border: `2px solid ${c.loginBorder}`, color: c.loginText, fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                {t('catalogo.signIn')}
              </Link>
              <Link to="/registro" style={{ padding: '8px 20px', borderRadius: '9999px', background: COLOR_MARCA, color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                {t('catalogo.signUp')}
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div style={{ paddingTop: '96px', flex: 1, position: 'relative', zIndex: 1 }}>
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
              ← {t('common.backToHome')}
            </Link>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '9999px', background: c.accentBgSoft, color: c.accentText, fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>
              {t('sucursales.officialNetwork')}
            </span>
            <h1 style={{ fontSize: 'clamp(1.7rem, 5vw, 2.5rem)', fontWeight: 900, color: c.textPrimary, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              {t('sucursales.byAgency')}
            </h1>
            <p style={{ fontSize: '16px', color: c.textSecondary, margin: 0 }}>
              {t('sucursales.byAgencySubtitle')}
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
                      padding: '0'
                    }}
                  >
                    <img
                      src={suc.logoUrl}
                      alt={suc.alias}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
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
                      <div style={{ color: c.textSecondary }}>{t('sucursales.schedule')}</div>
                      <div style={{ fontWeight: 700, color: c.textPrimary }}>{suc.horarios.split(';')[0]}</div>
                    </div>
                    <div style={{ background: c.itemBg, borderRadius: '12px', padding: '10px', textAlign: 'left' }}>
                      <div style={{ color: c.textSecondary }}>{t('sucursales.fleet')}</div>
                      <div style={{ fontWeight: 700, color: c.textPrimary }}>{suc.flota}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '12px', color: c.textSecondary }}>{t('sucursales.from')}</div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: COLOR_MARCA }}>
                        {suc.precioBase ? `${formatCurrency(suc.precioBase, moneda)}/${t('common.day')}` : suc.precio}
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
                      {t('sucursales.viewCars')}
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
                    {t('sucursales.availableCars', { name: sucursalActiva.alias })}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: c.textSecondary }}>
                    {t('sucursales.resultsCount', { count: flotaFiltrada.length })}
                  </p>
                </div>

                <div style={{ background: c.accentBgSoft, padding: '10px 16px', borderRadius: '12px', maxWidth: '500px' }}>
                  <p style={{ display: 'flex', gap: '8px', fontSize: '12px', color: c.textPrimary, margin: 0, lineHeight: 1.4 }}>
                    <FaCheckCircle color={COLOR_ICONO_GRIS} size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>{t('sucursales.guarantee', { name: sucursalActiva.alias })}</strong> {sucursalActiva.porQue}</span>
                  </p>
                </div>
              </div>

              {cargando && <EstadoCarga c={c} />}
              {!cargando && error && <EstadoError c={c} error={error} onRetry={reintentar} />}

              {!cargando && !error && flotaFiltrada.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', border: `1px dashed ${c.panelBorder}`, borderRadius: '16px' }}>
                  <FaCar size={40} color={c.textSecondary} style={{ marginBottom: '16px', opacity: 0.4 }} />
                  <p style={{ margin: '0 0 4px', fontSize: '15px', color: c.textPrimary, fontWeight: 700 }}>{t('sucursales.noVehicles')}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: c.textSecondary }}>{t('sucursales.noVehiclesSubtitle')}</p>
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