import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanding } from '../../landing/LandingContext'
import { useBrand } from '../../../contexts/BrandContext'
import { useAuthStore } from '../../../store/authStore'
import { formatCurrency } from '@/utils/currencyUtils'
import { useCatalogo } from '../hooks/useCatalog'
import { useFavoritos } from '../hooks/useFavorites'
import { SUCURSALES } from '../constants'
import { catalogService } from '../../../services/catalogService'
import VehicleGrid from '../components/VehicleGrid'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import CatalogPagination from '../components/CatalogPagination'
import GuestReserveModal from '../components/GuestReserveModal'
import GuestFavoriteModal from '../components/GuestFavoriteModal'
import './CatalogPage.css'
import {
  FaMapMarkerAlt,
  FaClock,
  FaCar,
  FaCheckCircle,
  FaArrowLeft
} from 'react-icons/fa'

const coloresTema = (esModoOscuro) => ({
  pageBg: esModoOscuro ? '#020617' : '#f8fafc',
  panelBg: esModoOscuro ? '#111827' : '#ffffff',
  panelBorder: esModoOscuro ? '#1e293b' : '#e2e8f0',
  panelBorderStrong: esModoOscuro ? '#334155' : '#cbd5e1',
  panelShadow: esModoOscuro ? '0 20px 60px rgba(0,0,0,0.45)' : '0 20px 60px rgba(15,23,42,0.06)',
  textPrimary: esModoOscuro ? '#f8fafc' : '#0f172a',
  textSecondary: esModoOscuro ? '#94a3b8' : '#64748b',
  textMuted: esModoOscuro ? '#64748b' : '#94a3b8',
  accentText: 'var(--brand-text)',
  accentBgSoft: 'var(--brand-soft)',
  accentGradient: 'var(--brand-gradient)',
  itemBg: esModoOscuro ? '#1e293b' : '#f8fafc',
  cardBorder: esModoOscuro ? '#334155' : '#e2e8f0',
  cardBorderHover: 'var(--brand-primary)',
  cardShadow: esModoOscuro ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(15,23,42,0.04)',
  cardShadowHover: esModoOscuro ? '0 12px 28px rgba(0,0,0,0.45)' : '0 12px 28px rgba(15,23,42,0.1)',
  subCardBg: esModoOscuro ? '#0f172a' : '#f8fafc',
  heroCardBg: esModoOscuro ? '#1e293b' : '#ffffff',
  heroCardBorder: esModoOscuro ? '#334155' : '#e2e8f0',
  imageFallbackBg: esModoOscuro ? '#1e293b' : '#f1f5f9',
  paginationDisabledBg: esModoOscuro ? '#1e293b' : '#f1f5f9',
  paginationDisabledText: esModoOscuro ? '#475569' : '#94a3b8',
  paginationIdleBg: esModoOscuro ? '#1e293b' : '#ffffff',
  paginationIdleText: esModoOscuro ? '#cbd5e1' : '#475569',
})

function BrandLogo({ marca }) {
  if (marca === 'Alamo') {
    return (
      <div style={{ background: '#00205b', border: '3px solid #ffcc00', borderRadius: 8, padding: '4px 16px', display: 'inline-flex', alignItems: 'center' }}>
        <span style={{ color: '#ffcc00', fontWeight: 900, fontSize: 20, fontStyle: 'italic', fontFamily: 'sans-serif' }}>Alamo</span>
      </div>
    )
  }
  if (marca === 'TuRoll') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#eab308', fontWeight: 900, fontSize: 24, letterSpacing: '-0.03em', fontFamily: 'sans-serif' }}>TU</span>
        <span style={{ color: '#64748b', fontWeight: 800, fontSize: 24, fontStyle: 'italic', fontFamily: 'sans-serif' }}>Roll</span>
      </div>
    )
  }
  if (marca === 'Enterprise') {
    return (
      <div style={{ background: '#006633', borderRadius: 6, padding: '4px 16px', display: 'inline-flex', alignItems: 'center' }}>
        <span style={{ color: '#ffffff', fontWeight: 900, fontSize: 18, fontStyle: 'italic', letterSpacing: '-0.02em', fontFamily: 'sans-serif' }}>enterprise</span>
      </div>
    )
  }
  if (marca === 'Localiza') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 14, height: 14, borderLeft: '4px solid #eab308', borderBottom: '4px solid #16a34a', transform: 'rotate(-45deg)' }} />
        <span style={{ color: '#15803d', fontWeight: 900, fontSize: 22, letterSpacing: '-0.02em', fontFamily: 'sans-serif' }}>Localiza</span>
      </div>
    )
  }
  if (marca === 'Hertz') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
        <span style={{ color: '#0f172a', fontWeight: 900, fontSize: 26, fontStyle: 'italic', fontFamily: 'sans-serif', letterSpacing: '-0.03em' }}>Hertz</span>
      </div>
    )
  }
  if (marca === 'Budget') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '14px solid #f97316' }} />
        <span style={{ color: 'var(--brand-secondary)', fontWeight: 900, fontSize: 22, letterSpacing: '-0.02em', fontFamily: 'sans-serif' }}>Budget</span>
      </div>
    )
  }
  // El nombre y el logo siguen la marca configurada por el administrador
  return <MarcaPropia marca={marca} />
}

function MarcaPropia({ marca }) {
  const { brand } = useBrand()
  const esPropia = marca === 'Drivique'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 18, color: 'var(--brand-text)' }}>
      {esPropia && brand.logoDataUrl ? <img src={brand.logoDataUrl} alt="" style={{ height: 34, maxWidth: 90, objectFit: 'contain' }} /> : null}
      {esPropia ? brand.name : marca}
    </span>
  )
}

// Las sedes salen de la base de datos (cargadas al iniciar) y la flota y el precio, del catálogo real
function construirSucursales(sucursales, vehiculos) {
  return sucursales
    .filter((sede) => sede.estado !== 'inactiva')
    .map((sede) => {
      const propios = vehiculos.filter((v) => (v.sucursal || v.sucursalInfo?.nombre || '') === sede.nombre)
      const precios = propios.map((v) => Number(v.precio)).filter((precio) => precio > 0)
      const modelos = [...new Set(propios.map((v) => v.nombre).filter(Boolean))].slice(0, 2)
      return {
        id: sede.id,
        alias: sede.nombre,
        nombre: sede.nombre,
        marca: 'Drivique',
        tag: sede.ciudad,
        direccion: sede.direccion,
        horario: sede.horario,
        flota: modelos.join(', '),
        precioCOP: precios.length ? Math.min(...precios) : 0,
        porQue: sede.telefono ? `Tel. ${sede.telefono}` : '',
      }
    })
}


export default function SucursalesPage() {
  const { t, i18n } = useTranslation()
  const { tema, moneda } = useLanding()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const usuario = useAuthStore((state) => state.usuario)
  const esModoOscuro = tema === 'oscuro'
  const c = coloresTema(esModoOscuro)
  const [sucursalActiva, setSucursalActiva] = useState(null)
  const [pagina, setPagina] = useState(1)
  const [reservaModalAbierto, setReservaModalAbierto] = useState(false)
  const [favoritoModalAbierto, setFavoritoModalAbierto] = useState(false)
  const SUCURSALES_POR_PAGINA = 8

  const resultadosRef = useRef(null)
  const { vehiculos, cargando, error, reintentar } = useCatalogo()
  const { esFavorito, toggleFavorito } = useFavoritos()
  // Flota real de cada sede: el catálogo completo del servidor, independiente de la búsqueda
  const [flotaCompleta, setFlotaCompleta] = useState([])
  useEffect(() => {
    catalogService.getVehiculos().then((lista) => setFlotaCompleta(Array.isArray(lista) ? lista : [])).catch(() => {})
  }, [])
  const SUCURSALES_GRID = useMemo(
    () => construirSucursales(SUCURSALES, flotaCompleta.length ? flotaCompleta : vehiculos),
    [flotaCompleta, vehiculos]
  )
  const totalPaginas = Math.ceil(SUCURSALES_GRID.length / SUCURSALES_POR_PAGINA)

  const lang = (i18n.language || 'es').substring(0, 2)

  // Rehydrate selected branch if returning from vehicle details or URL/session
  useEffect(() => {
    const sucursalTarget = searchParams.get('sucursal') || location.state?.sucursal || sessionStorage.getItem('drivique_sucursal_activa')
    if (!sucursalTarget) return

    const found = SUCURSALES_GRID.find(s => 
      s.alias === sucursalTarget || 
      s.id === sucursalTarget || 
      s.nombre === sucursalTarget ||
      s.alias.toLowerCase() === sucursalTarget.toLowerCase() ||
      s.nombre.toLowerCase() === sucursalTarget.toLowerCase()
    )

    if (found) {
      const index = SUCURSALES_GRID.findIndex(s => s.alias === found.alias)
      if (index !== -1) {
        const targetPage = Math.floor(index / SUCURSALES_POR_PAGINA) + 1
        setPagina(targetPage)
      }
      setSucursalActiva(found)
    }
  }, [searchParams, location.state])

  // Scroll to fleet panel whenever a branch is activated or rehydrated
  useEffect(() => {
    if (sucursalActiva && resultadosRef.current) {
      const scrollIt = () => {
        resultadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      const timer = setTimeout(scrollIt, 120)
      return () => clearTimeout(timer)
    }
  }, [sucursalActiva])

  const getNombre = (suc) => {
    if (suc.nombreKeys && suc.nombreKeys[lang]) return suc.nombreKeys[lang]
    return suc.nombre
  }

  const getDireccion = (suc) => {
    if (suc.direccionKeys && suc.direccionKeys[lang]) return suc.direccionKeys[lang]
    return suc.direccion
  }

  const getFlota = (suc) => {
    if (suc.flotaKeys && suc.flotaKeys[lang]) return suc.flotaKeys[lang]
    return suc.flota
  }

  const vehiculosSucursalCache = useMemo(() => {
    const map = {}
    SUCURSALES_GRID.forEach(s => { map[s.alias] = [] })
    vehiculos.forEach(v => {
      const sucNombre = v.sucursal || v.sucursalInfo?.nombre || ''
      if (map[sucNombre]) {
        map[sucNombre].push(v)
      } else {
        const key = Object.keys(map).find(k => 
          k === sucNombre || 
          k.toLowerCase() === sucNombre.toLowerCase() ||
          k.toLowerCase().includes(sucNombre.toLowerCase()) ||
          sucNombre.toLowerCase().includes(k.toLowerCase())
        )
        if (key) map[key].push(v)
      }
    })
    return map
  }, [vehiculos])

  const flotaFiltrada = useMemo(() => {
    if (!sucursalActiva) return []
    if (vehiculosSucursalCache[sucursalActiva.alias]?.length > 0) {
      return vehiculosSucursalCache[sucursalActiva.alias]
    }
    const alias = (sucursalActiva.alias || '').toLowerCase()
    const nombre = (sucursalActiva.nombre || '').toLowerCase()
    return vehiculos.filter(v => {
      const vSucursal = (v.sucursal || '').toLowerCase()
      const vSucursalInfo = (v.sucursalInfo?.nombre || '').toLowerCase()
      return (
        vSucursal === alias ||
        vSucursal === nombre ||
        vSucursalInfo === alias ||
        vSucursalInfo === nombre ||
        (alias && vSucursal.includes(alias)) ||
        (nombre && vSucursal.includes(nombre))
      )
    })
  }, [sucursalActiva, vehiculosSucursalCache, vehiculos])

  const sucursalesPagina = useMemo(() => {
    const inicio = (pagina - 1) * SUCURSALES_POR_PAGINA
    return SUCURSALES_GRID.slice(inicio, inicio + SUCURSALES_POR_PAGINA)
  }, [pagina])

  const getTagTraducido = (tag) => {
    if (tag === 'Aeropuerto') return t('sucursales.tags.airport', 'Aeropuerto')
    if (tag === 'Poblado') return t('sucursales.tags.poblado', 'Poblado')
    if (tag === 'Centro') return t('sucursales.tags.downtown', 'Centro')
    return tag
  }

  const getHorarioTraducido = (horarioStr) => {
    if (!horarioStr) return ''
    return horarioStr
      .replace(/Lun-Dom 24 Horas/g, t('sucursales.schedules.24h', 'Lun-Dom 24 Horas'))
      .replace(/Lun-Sáb/g, t('sucursales.schedules.monSat', 'Lun-Sáb'))
      .replace(/Lun-Vie/g, t('sucursales.schedules.monFri', 'Lun-Vie'))
      .replace(/Lun-Dom/g, t('sucursales.schedules.monSun', 'Lun-Dom'))
  }

  const getPorQueTraducido = (suc) => {
    if (suc.porQueKey) return t(`sucursales.guarantees.${suc.porQueKey}`, suc.porQue)
    return suc.porQue
  }

  const verCarrosSucursal = (suc) => {
    setSucursalActiva(suc)
    sessionStorage.setItem('drivique_sucursal_activa', suc.alias)
    setSearchParams({ sucursal: suc.alias }, { replace: true })
    setTimeout(() => {
      resultadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }

  const volverInicio = () => {
    sessionStorage.removeItem('drivique_sucursal_activa')
    navigate('/inicio')
  }

  return (
    <div className="catalogo-page" style={{ minHeight: '100vh', background: c.pageBg, color: c.textPrimary, position: 'relative', overflowX: 'hidden', zoom: 0.9 }}>
      
      <div className="detalle-contenido-inner" style={{ maxWidth: 1360, margin: '0 auto', padding: '24px 24px 60px' }}>
        
        {/* Action Header Row */}
        <div style={{ marginBottom: 24 }}>
          <button 
            className="catalogo-header-back" 
            onClick={volverInicio}
            style={{
              background: c.panelBg,
              border: `1px solid ${c.cardBorder}`,
              color: c.accentText,
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <FaArrowLeft size={12} /> {t('common.backToHome', 'Volver al inicio')}
          </button>
        </div>

        {/* Main Container Card */}
        <div className="sucursales-main-card" style={{
          background: c.panelBg,
          borderRadius: '28px',
          border: `1px solid ${c.panelBorder}`,
          boxShadow: c.panelShadow,
          padding: '40px 32px 48px',
        }}>
          {/* Clean Minimal Header Section */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 900,
              color: c.textPrimary,
              margin: '0 0 10px',
              letterSpacing: '-0.02em'
            }}>
              {t('sucursales.byAgency', 'Vehículos por Agencia')}
            </h1>

            <p style={{
              fontSize: '15px',
              color: c.textSecondary,
              margin: '0 auto',
              maxWidth: '560px',
              lineHeight: 1.55
            }}>
              {t('sucursales.byAgencySubtitle', 'Selecciona una compañía y mira solo los carros disponibles para esa sucursal.')}
            </p>
          </div>

          {/* Agencies Grid (4 Columns in Desktop) */}
          <div className="sucursales-grid-container" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px'
          }}>
            {sucursalesPagina.map((suc) => {
              const esActivo = sucursalActiva?.alias === suc.alias

              return (
                <div
                  key={suc.alias}
                  style={{
                    background: c.panelBg,
                    borderRadius: '20px',
                    border: `1.5px solid ${esActivo ? c.accentText : c.cardBorder}`,
                    boxShadow: esActivo ? '0 12px 32px rgba(var(--brand-primary-rgb),0.20)' : '0 6px 20px rgba(15,23,42,0.04)',
                    padding: '22px 20px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 220ms ease',
                    cursor: 'default',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)'
                    e.currentTarget.style.boxShadow = '0 14px 32px rgba(var(--brand-primary-rgb),0.15)'
                    e.currentTarget.style.borderColor = c.cardBorderHover
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = esActivo ? '0 12px 32px rgba(var(--brand-primary-rgb),0.20)' : '0 6px 20px rgba(15,23,42,0.04)'
                    e.currentTarget.style.borderColor = esActivo ? c.accentText : c.cardBorder
                  }}
                >
                  <div>
                    {/* Brand Logo Box */}
                    <div style={{
                      height: 72,
                      background: c.accentBgSoft,
                      borderRadius: '14px',
                      border: '1px solid rgba(var(--brand-primary-rgb), 0.22)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                      <BrandLogo marca={suc.marca} />
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: 16.5, fontWeight: 800, color: c.textPrimary, margin: '0 0 10px', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
                      {getNombre(suc)}
                    </h3>

                    {/* Location Tag */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 12px',
                      borderRadius: 20,
                      background: c.accentBgSoft,
                      color: c.accentText,
                      fontSize: 11.5,
                      fontWeight: 700,
                      marginBottom: 12
                    }}>
                      <FaMapMarkerAlt size={11} /> {getTagTraducido(suc.tag)}
                    </div>

                    {/* Address */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 16, minHeight: 40 }}>
                      <p style={{ fontSize: 12.5, color: c.textSecondary, margin: 0, lineHeight: 1.5 }}>
                        {getDireccion(suc)}
                      </p>
                    </div>

                    {/* Info Sub-Card (Horario & Flota) */}
                    <div style={{
                      background: c.subCardBg,
                      borderRadius: '14px',
                      border: `1px solid ${c.panelBorder}`,
                      padding: '12px 14px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 12,
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: c.accentText, marginBottom: 4 }}>
                          <FaClock size={11} /> {t('sucursales.schedule', 'Horario')}
                        </div>
                        <div style={{ fontSize: 11.5, color: c.textPrimary, fontWeight: 600, lineHeight: 1.3 }}>
                          {getHorarioTraducido(suc.horario)}
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: c.accentText, marginBottom: 4 }}>
                          <FaCar size={11} /> {t('sucursales.fleet', 'Flota')}
                        </div>
                        <div style={{ fontSize: 11.5, color: c.textPrimary, fontWeight: 600, lineHeight: 1.3 }}>
                          {getFlota(suc)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Price & Button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 14, borderTop: `1px solid ${c.panelBorder}` }}>
                    <div>
                      <span style={{ fontSize: 10.5, color: c.textSecondary, display: 'block', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {t('sucursales.from', 'Desde')}
                      </span>
                      <span style={{ fontSize: 16, fontWeight: 900, color: c.textPrimary }}>
                        {formatCurrency(suc.precioCOP, moneda)}<span style={{ fontSize: 12, fontWeight: 600, color: c.textSecondary }}>{t('sucursales.perDay', '/día')}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => verCarrosSucursal(suc)}
                      style={{
                        background: 'var(--brand-gradient)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 18px',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(var(--brand-primary-rgb),0.25)',
                        transition: 'all 150ms ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px) scale(1.03)'
                        e.currentTarget.style.boxShadow = '0 6px 18px rgba(var(--brand-primary-rgb),0.35)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)'
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(var(--brand-primary-rgb),0.25)'
                      }}
                    >
                      {t('sucursales.viewCars', 'Ver carros')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Catalog Pagination Component (Anterior / Numbers / Siguiente) */}
          {totalPaginas > 1 && (
            <CatalogPagination
              pagina={pagina}
              setPagina={setPagina}
              totalPaginas={totalPaginas}
              c={c}
            />
          )}

          {/* Selected Agency Vehicle Fleet Panel */}
          {sucursalActiva && (
            <div
              ref={resultadosRef}
              className="sucursales-flota-panel"
              style={{
                marginTop: '40px',
                background: c.panelBg,
                borderRadius: '22px',
                border: `1.5px solid ${c.accentText}`,
                boxShadow: '0 12px 36px rgba(var(--brand-primary-rgb),0.12)',
                padding: '28px',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: c.textPrimary }}>
                    {t('sucursales.availableCars', { name: getNombre(sucursalActiva) })}
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: c.textSecondary }}>
                    {t('sucursales.resultsCount', { count: flotaFiltrada.length })}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: c.accentText, background: c.accentBgSoft, padding: '8px 16px', borderRadius: '12px', fontWeight: 700 }}>
                  <FaCheckCircle color={c.accentText} />
                  <span><strong>{t('sucursales.guarantee', { name: getNombre(sucursalActiva) })}</strong> {getPorQueTraducido(sucursalActiva)}</span>
                </div>
              </div>

              {cargando ? (
                <LoadingState text={t('catalogo.loading', 'Cargando vehículos...')} />
              ) : error ? (
                <ErrorState mensaje={error} onReintentar={reintentar} />
              ) : flotaFiltrada.length > 0 ? (
                <VehicleGrid
                  vehiculosPagina={flotaFiltrada}
                  vehiculos={flotaFiltrada}
                  esFavorito={esFavorito}
                  toggleFavorito={toggleFavorito}
                  c={c}
                  invitado={!usuario}
                  onGuestBlocked={() => setReservaModalAbierto(true)}
                  onGuestFavorito={() => setFavoritoModalAbierto(true)}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 20px', background: c.itemBg, borderRadius: '16px', border: `1px solid ${c.cardBorder}` }}>
                  <FaCar size={36} color={c.accentText} style={{ marginBottom: '12px' }} />
                  <p style={{ margin: '0 0 4px', fontSize: '15px', color: c.textPrimary, fontWeight: 700 }}>{t('sucursales.noVehicles', 'No hay vehículos disponibles en esta sucursal')}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: c.textSecondary }}>{t('sucursales.noVehiclesSubtitle', 'Prueba seleccionando otra sucursal de la lista.')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <GuestReserveModal
        c={c}
        visible={reservaModalAbierto}
        onCerrar={() => setReservaModalAbierto(false)}
      />
      <GuestFavoriteModal
        c={c}
        visible={favoritoModalAbierto}
        onCerrar={() => setFavoritoModalAbierto(false)}
      />
    </div>
  )
}
