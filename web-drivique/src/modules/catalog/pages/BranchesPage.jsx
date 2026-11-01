import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
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
import BranchAgencyCard, { coloresTemaSucursales, construirSucursales } from '../components/BranchAgencyCard'
import './CatalogPage.css'
import {
  FaCar,
  FaCheckCircle,
  FaArrowLeft
} from 'react-icons/fa'

export default function SucursalesPage() {
  const { t, i18n } = useTranslation()
  const { tema, moneda } = useLanding()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const usuario = useAuthStore((state) => state.usuario)
  const esModoOscuro = tema === 'oscuro'
  const c = coloresTemaSucursales(esModoOscuro)
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
    catalogService.getVehiculos().then((lista) => setFlotaCompleta(Array.isArray(lista) ? lista : [])).catch((err) => { console.warn(err) })
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
  }, [searchParams, location.state, SUCURSALES_GRID])

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
  }, [vehiculos, SUCURSALES_GRID])

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
  }, [pagina, SUCURSALES_GRID])

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
            {sucursalesPagina.map((suc) => (
              <BranchAgencyCard
                key={suc.alias}
                suc={suc}
                esActivo={sucursalActiva?.alias === suc.alias}
                c={c}
                moneda={moneda}
                t={t}
                getNombre={getNombre}
                getTagTraducido={getTagTraducido}
                getDireccion={getDireccion}
                getHorarioTraducido={getHorarioTraducido}
                getFlota={getFlota}
                verCarrosSucursal={verCarrosSucursal}
              />
            ))}
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
