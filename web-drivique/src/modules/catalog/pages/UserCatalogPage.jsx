import { useEffect, useMemo, useState, useRef, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../../store/authStore'
import { useLanding } from '../../landing/LandingContext'
import { COLOR_MARCA } from '../constants'
import { useCatalogo } from '../hooks/useCatalog'
import { useFavoritos } from '../hooks/useFavorites'
import { FaSearch, FaTimes } from 'react-icons/fa'
import CatalogTopHeader from '../components/CatalogTopHeader'
import SearchHero from '../components/SearchHero'
import CatalogFilters from '../components/CatalogFilters'
import MobileFiltersModal from '../components/MobileFiltersModal'
import MobileSearchModal from '../components/MobileSearchModal'
import VehicleGrid from '../components/VehicleGrid'
import CatalogPagination from '../components/CatalogPagination'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import NoResultsModal from '../components/NoResultsModal'
import './CatalogPage.css'
import './UserCatalogPage.css'

const coloresTema = (esModoOscuro) => ({
  pageBg: esModoOscuro ? '#0f172a' : '#f8fafc',
  navBg: esModoOscuro ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.98)',
  navBorder: esModoOscuro ? '#1e293b' : '#e8eef8',
  navShadow: esModoOscuro ? '0 2px 12px rgba(0,0,0,0.25)' : '0 2px 14px rgba(30,58,138,0.06)',
  navText: esModoOscuro ? '#cbd5e1' : '#475569',
  panelBg: esModoOscuro ? '#111827' : '#ffffff',
  panelBgSoft: esModoOscuro ? '#1e293b' : '#f8fafc',
  panelBorder: esModoOscuro ? '#334155' : '#e5ebf5',
  panelBorderStrong: esModoOscuro ? '#475569' : '#dce5f3',
  panelShadow: esModoOscuro ? '0 6px 24px rgba(0,0,0,0.25)' : '0 4px 18px rgba(30,58,138,0.06)',
  heroCardBg: esModoOscuro ? '#111827' : '#ffffff',
  heroCardBorder: esModoOscuro ? '#334155' : '#dbe5f3',
  heroCardShadow: esModoOscuro ? '0 6px 24px rgba(0,0,0,0.25)' : '0 4px 18px rgba(30,58,138,0.06)',
  textPrimary: esModoOscuro ? '#f8fafc' : '#111a3a',
  textSecondary: esModoOscuro ? '#94a3b8' : '#64748b',
  accentText: esModoOscuro ? '#93c5fd' : COLOR_MARCA,
  accentBgSoft: esModoOscuro ? 'rgba(37,99,235,0.15)' : '#eff6ff',
  accentBorder: esModoOscuro ? '#475569' : '#cfe0fb',
  inputBg: esModoOscuro ? '#0f172a' : '#ffffff',
  inputText: esModoOscuro ? '#e2e8f0' : '#18234a',
  inputBorder: esModoOscuro ? '#334155' : '#d9e3f1',
  dangerBg: esModoOscuro ? 'rgba(239,68,68,0.14)' : '#fef2f2',
  dangerBorder: esModoOscuro ? 'rgba(252,165,165,0.24)' : '#fecaca',
  dangerText: esModoOscuro ? '#fca5a5' : '#dc2626',
  paginationIdleBg: esModoOscuro ? '#1e293b' : '#f3f6fb',
  paginationIdleText: esModoOscuro ? '#cbd5e1' : '#52617e',
  paginationDisabledBg: esModoOscuro ? '#172033' : '#f3f6fb',
  paginationDisabledText: esModoOscuro ? '#64748b' : '#a1aec3',
  accentGradient: `linear-gradient(90deg, ${COLOR_MARCA}, #2563eb)`,
  chipBg: esModoOscuro ? '#1e293b' : '#f1f4f9',
  chipText: esModoOscuro ? '#cbd5e1' : '#24304f',
  chipActiveBg: esModoOscuro ? '#2563eb' : COLOR_MARCA,
  chipActiveText: '#ffffff',
  cardBorder: esModoOscuro ? '#334155' : '#e4eaf3',
  cardBorderHover: esModoOscuro ? '#475569' : '#cbdcf7',
  cardShadow: esModoOscuro ? '0 4px 18px rgba(0,0,0,0.24)' : '0 3px 12px rgba(30,58,138,0.06)',
  cardShadowHover: esModoOscuro ? '0 10px 30px rgba(0,0,0,0.30)' : '0 12px 28px rgba(37,99,235,0.12)',
  imageFallbackBg: esModoOscuro ? '#1e293b' : '#f1f5f9',
  imageFallbackIcon: esModoOscuro ? '#475569' : '#cbd5e1',
  textSoft: esModoOscuro ? '#64748b' : '#94a3b8',
  textMuted: esModoOscuro ? '#64748b' : '#8a98b2',
  favoriteBtnBg: esModoOscuro ? 'rgba(15,23,42,0.86)' : 'rgba(255,255,255,0.92)',
  favoriteBtnShadow: esModoOscuro ? '0 4px 14px rgba(0,0,0,0.32)' : '0 2px 8px rgba(0,0,0,0.10)',
  favoriteOn: '#ef4444',
  favoriteOff: esModoOscuro ? '#94a3b8' : '#94a3b8',
  skeletonTrack: esModoOscuro ? '#334155' : '#e2e8f0',
})

export default function CatalogoUsuarioPage() {
  const { t } = useTranslation()
  const { usuario } = useAuthStore()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'
  const c = coloresTema(esModoOscuro)

  const favoritosKey = useMemo(() => {
    if (!usuario?.id) return 'favoritosVehiculos'
    return `favoritosVehiculos_${usuario.id}`
  }, [usuario?.id])

  const { esFavorito, toggleFavorito } = useFavoritos(favoritosKey)
  const [filtrosMovilAbierto, setFiltrosMovilAbierto] = useState(false)
  const [busquedaMovilAbierta, setBusquedaMovilAbierta] = useState(false)
  const [modalFiltrosCerrado, setModalFiltrosCerrado] = useState(false)

  const {
    cargando,
    error,
    filtros,
    setFiltro,
    busquedaForm,
    setForm,
    resultado,
    sinCoincidenciasFiltros,
    sinDisponibilidadFechas,
    busquedaAplicada,
    totalPaginas,
    vehiculosPagina,
    pagina,
    setPagina,
    errorBusqueda,
    handleBuscar,
    limpiar,
    reintentar,
    soloFavoritos,
    setSoloFavoritos,
    textoLibre,
    setTextoLibre,
    sinCoincidenciasTexto,
  } = useCatalogo({ esFavorito })

  useEffect(() => {
    setPagina(1)
  }, [usuario?.id, setPagina])

  useEffect(() => {
    setPagina(1)
  }, [soloFavoritos, filtros, busquedaForm, setPagina])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModalFiltrosCerrado(false)
  }, [filtros])

  const headerRef = useRef(null)
  const [headerAltura, setHeaderAltura] = useState(64)

  useLayoutEffect(() => {
    const medir = () => {
      if (headerRef.current) setHeaderAltura(headerRef.current.offsetHeight)
    }
    medir()
    const observador = new ResizeObserver(medir)
    if (headerRef.current) observador.observe(headerRef.current)
    window.addEventListener('resize', medir)
    return () => {
      observador.disconnect()
      window.removeEventListener('resize', medir)
    }
  }, [])

  const inputStyle = {
    width: '100%',
    minHeight: '38px',
    padding: '8px 12px',
    borderRadius: '10px',
    border: `1px solid ${c.inputBorder}`,
    fontSize: '13px',
    fontWeight: 500,
    color: c.inputText,
    background: c.inputBg,
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: c.textSecondary,
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  const limpiarTodo = () => {
    setSoloFavoritos(false)
    limpiar()
  }

  const mensajeVacio = soloFavoritos
    ? t('catalogo.favoritesText')
    : t('catalogo.noResultsSubtitle')

  const tituloVacio = soloFavoritos ? t('catalogo.favoritesTitle') : t('catalogo.noResults')

  return (
    <div className="catalogo-page" style={{ minHeight: '100vh', background: c.pageBg, color: c.textPrimary }}>

      <CatalogTopHeader
        c={c}
        headerRef={headerRef}
        innerClassName="catalogo-header-inner"
        mostrarPerfil
        modoRegistrado
      />

      <main className="catalogo-main">

        <div
          className="catalogo-search-sticky"
          style={{ top: `${headerAltura}px`, background: c.pageBg }}
        >

          {/* BUSCADOR DE SELECTS — Ciudad / Sucursal / Fechas / Buscar / Limpiar */}
          <SearchHero
            c={c}
            cargando={cargando}
            resultado={resultado}
            inputStyle={inputStyle}
            labelStyle={labelStyle}
            busquedaForm={busquedaForm}
            setForm={setForm}
            errorBusqueda={errorBusqueda}
            handleBuscar={handleBuscar}
            invitado={false}
            textoLibre={textoLibre}
            setTextoLibre={setTextoLibre}
            mostrarBusquedaLibre={true}
            busquedaAplicada={busquedaAplicada}
            sinCoincidenciasTexto={sinCoincidenciasTexto}
            sinDisponibilidadFechas={sinDisponibilidadFechas}
            onLimpiar={limpiarTodo}
          />
        </div>

        <section className="catalogo-content">
          <div className="catalogo-layout">
            <CatalogFilters
              c={c}
              inputStyle={inputStyle}
              labelStyle={labelStyle}
              filtros={filtros}
              setFiltro={setFiltro}
              busquedaForm={busquedaForm}
              setForm={setForm}
              errorBusqueda={errorBusqueda}
              handleBuscar={handleBuscar}
              limpiar={limpiarTodo}
              invitado={false}
              showHero={false}
              soloFavoritos={soloFavoritos}
              setSoloFavoritos={setSoloFavoritos}
              mostrarFavoritos={true}
            />

            <div className="catalogo-results">

              <div className="catalogo-results-toolbar">
                {!cargando ? (
                  <span className="catalogo-results-count">
                    {resultado.length} {t('catalogo.available')}
                  </span>
                ) : (
                  <span />
                )}

                <div className="catalogo-sort">
                  <span>{t('catalogo.sort')}:</span>
                  <select
                    value={filtros.orden}
                    onChange={e => setFiltro('orden', e.target.value)}
                    style={{
                      ...inputStyle,
                      width: 'auto',
                      minWidth: '190px',
                      minHeight: '36px',
                      padding: '7px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="precio_asc">{t('catalogo.sortPriceAsc')}</option>
                    <option value="precio_desc">{t('catalogo.sortPriceDesc')}</option>
                    <option value="calificacion">{t('catalogo.sortRating')}</option>
                  </select>
                </div>
              </div>

              {cargando && <LoadingState c={c} />}
              {!cargando && error && <ErrorState c={c} error={error} onRetry={reintentar} />}

              {!cargando && !error && resultado.length === 0 && (
                <EmptyState
                  c={c}
                  onLimpiar={limpiarTodo}
                  titulo={tituloVacio}
                  mensaje={mensajeVacio}
                  textoBoton={soloFavoritos ? t('catalogo.viewAll') : t('catalogo.clearFilters')}
                />
              )}

              {!cargando && !error && resultado.length > 0 && (
                <>
                  <VehicleGrid
                    vehiculosPagina={vehiculosPagina}
                    esFavorito={esFavorito}
                    toggleFavorito={toggleFavorito}
                    c={c}
                    invitado={false}
                  />

                  <CatalogPagination
                    pagina={pagina}
                    setPagina={setPagina}
                    totalPaginas={totalPaginas}
                    c={c}
                  />
                </>
              )}

            </div>
          </div>
        </section>
      </main>

      <MobileFiltersModal
        abierto={filtrosMovilAbierto}
        onCerrar={() => setFiltrosMovilAbierto(false)}
        c={c}
        inputStyle={inputStyle}
        labelStyle={labelStyle}
        filtros={filtros}
        setFiltro={setFiltro}
        limpiar={limpiarTodo}
        invitado={false}
        soloFavoritos={soloFavoritos}
        setSoloFavoritos={setSoloFavoritos}
        mostrarFavoritos={Boolean(usuario)}
        resultado={resultado}
        cargando={cargando}
      />

      <MobileSearchModal
        abierto={busquedaMovilAbierta}
        onCerrar={() => setBusquedaMovilAbierta(false)}
        c={c}
        inputStyle={inputStyle}
        labelStyle={labelStyle}
        busquedaForm={busquedaForm}
        setForm={setForm}
        errorBusqueda={errorBusqueda}
        handleBuscar={handleBuscar}
        limpiar={limpiarTodo}
        invitado={false}
      />

      {sinCoincidenciasFiltros && !modalFiltrosCerrado && (
        <NoResultsModal
          c={c}
          titulo={t('catalogo.noAvailabilityFiltersTitle')}
          mensaje={t('catalogo.noAvailabilityFiltersMsg')}
          textoBoton={t('common.close')}
          onCerrar={() => setModalFiltrosCerrado(true)}
        />
      )}
    </div>
  )
}