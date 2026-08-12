import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../../store/authStore'
import { useLanding } from '../../landing/LandingContext'
import { COLOR_MARCA } from '../constants'
import { useCatalogo } from '../hooks/useCatalog'
import { useFavoritos } from '../hooks/useFavorites'
import SearchHero from '../components/SearchHero'
import CatalogFilters from '../components/CatalogFilters'
import MobileFiltersModal from '../components/MobileFiltersModal'
import MobileSearchModal from '../components/MobileSearchModal'
import VehicleGrid from '../components/VehicleGrid'
import CatalogPagination from '../components/CatalogPagination'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import logo from '@/assets/logocatalog.png'
import { FaSearch } from 'react-icons/fa'
import './UserCatalogPage.css'

const coloresTema = (esModoOscuro) => ({
  pageBg: esModoOscuro ? '#0f172a' : '#f8fafc',
  navBg: esModoOscuro ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.98)',
  navBorder: esModoOscuro ? '#1e293b' : '#f1f5f9',
  navShadow: esModoOscuro ? '0 1px 8px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)',
  navText: esModoOscuro ? '#cbd5e1' : '#475569',
  panelBg: esModoOscuro ? '#111827' : '#ffffff',
  panelBgSoft: esModoOscuro ? '#1e293b' : '#f8fafc',
  panelBorder: esModoOscuro ? '#334155' : '#f1f5f9',
  panelBorderStrong: esModoOscuro ? '#475569' : '#e2e8f0',
  panelShadow: esModoOscuro ? '0 8px 24px rgba(0,0,0,0.30)' : '0 2px 12px rgba(0,0,0,0.05)',
  heroBg: esModoOscuro ? 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)' : 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)',
  heroCardBg: esModoOscuro ? '#111827' : '#ffffff',
  heroCardBorder: esModoOscuro ? '#334155' : '#dbeafe',
  heroCardShadow: esModoOscuro ? '0 8px 28px rgba(0,0,0,0.35)' : '0 4px 24px rgba(30,58,138,0.10)',
  textPrimary: esModoOscuro ? '#f8fafc' : '#0f172a',
  textSecondary: esModoOscuro ? '#94a3b8' : '#64748b',
  accentText: esModoOscuro ? '#93c5fd' : COLOR_MARCA,
  accentBgSoft: esModoOscuro ? 'rgba(30,58,138,0.14)' : 'rgba(30,58,138,0.08)',
  accentBorder: esModoOscuro ? 'rgba(147,197,253,0.30)' : '#bfdbfe',
  inputBg: esModoOscuro ? '#0f172a' : '#fff',
  inputText: esModoOscuro ? '#e2e8f0' : '#334155',
  inputBorder: esModoOscuro ? '#334155' : '#e2e8f0',
  dangerBg: esModoOscuro ? 'rgba(239,68,68,0.14)' : '#fef2f2',
  dangerBorder: esModoOscuro ? 'rgba(252,165,165,0.24)' : '#fecaca',
  dangerText: esModoOscuro ? '#fca5a5' : '#dc2626',
  paginationIdleBg: esModoOscuro ? '#1e293b' : '#f1f5f9',
  paginationIdleText: esModoOscuro ? '#cbd5e1' : '#475569',
  paginationDisabledBg: esModoOscuro ? '#0f172a' : '#f1f5f9',
  paginationDisabledText: esModoOscuro ? '#64748b' : '#94a3b8',
  accentGradient: `linear-gradient(90deg,${COLOR_MARCA},#2563eb)`,
  chipBg: esModoOscuro ? '#1e293b' : '#f1f5f9',
  chipText: esModoOscuro ? '#cbd5e1' : '#475569',
  chipActiveBg: esModoOscuro ? '#2563eb' : COLOR_MARCA,
  chipActiveText: '#fff',
  cardBorder: esModoOscuro ? '#334155' : '#f1f5f9',
  cardShadow: esModoOscuro ? '0 4px 18px rgba(0,0,0,0.24)' : '0 2px 8px rgba(0,0,0,0.05)',
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

  const {
    cargando,
    error,
    filtros,
    setFiltro,
    busquedaForm,
    setForm,
    resultado,
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

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '10px',
    border: `1.5px solid ${c.inputBorder}`,
    fontSize: '13px',
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
    letterSpacing: '0.06em',
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
    <div className="catalogo-page" style={{ minHeight: '100vh', width: '100%', background: c.pageBg, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <header
        className="catalogo-header"
        style={{
          background: c.navBg,
          borderBottom: `1px solid ${c.navBorder}`,
          boxShadow: c.navShadow,
        }}
      >
        <div className="user-catalogo-header-inner">
          <div className="catalogo-logo-link">
            <img src={logo} alt="Drivique" className="catalogo-logo" />
            <div className="catalogo-logo-text">
              <span className="catalogo-logo-title" style={{ color: c.accentText }}>Drivique</span>
            </div>
          </div>
        </div>
      </header>

      <div className="user-catalogo-search-row" style={{ background: c.navBg }}>
        <div className="user-catalogo-search-row-inner">
          <div
            className="catalogo-header-search"
            style={{
              background: c.heroCardBg,
              border: `1px solid ${sinCoincidenciasTexto ? c.dangerBorder : c.heroCardBorder}`,
            }}
          >
            <FaSearch size={15} color={c.accentText} style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={textoLibre}
              onChange={e => setTextoLibre(e.target.value)}
              placeholder={t('catalogo.freeSearchPlaceholder')}
              className="catalogo-header-search-input"
              style={{ color: c.inputText }}
            />
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
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
          onAbrirBusqueda={() => setBusquedaMovilAbierta(true)}
          onAbrirFiltros={() => setFiltrosMovilAbierto(true)}
        />

        <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '22px clamp(16px, 3vw, 24px) 24px', boxSizing: 'border-box' }}>
          <div className="catalogo-layout catalogo-contenido-inner" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
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
              mostrarFavoritos={Boolean(usuario)}
            />

            <div style={{ flex: '1 1 600px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                {!cargando ? (
                  <span style={{ fontSize: '13px', color: c.textSecondary, fontWeight: 600 }}>
                    {resultado.length} {t('catalogo.available')}
                  </span>
                ) : <span />}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: c.textSecondary, fontWeight: 600 }}>{t('catalogo.sort')}:</span>
                  <select value={filtros.orden} onChange={e => setFiltro('orden', e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '8px 12px' }}>
                    <option value="precio_asc">{t('catalogo.sortPriceAsc')}</option>
                    <option value="precio_desc">{t('catalogo.sortPriceDesc')}</option>
                    <option value="calificacion">{t('catalogo.sortRating')}</option>
                  </select>
                </div>
              </div>

              {cargando && <LoadingState c={c} />}
              {!cargando && error && <ErrorState c={c} error={error} onRetry={reintentar} />}
              {!cargando && !error && resultado.length === 0 && (
                <EmptyState c={c} onLimpiar={limpiarTodo} titulo={tituloVacio} mensaje={mensajeVacio} textoBoton={soloFavoritos ? t('catalogo.viewAll') : t('catalogo.clearFilters')} />
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
        </div>
      </div>

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
    </div>
  )
}