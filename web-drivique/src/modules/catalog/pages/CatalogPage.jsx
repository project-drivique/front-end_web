import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { useLanding } from '../../landing/LandingContext'
import { COLOR_MARCA } from '../constants'
import { useCatalogo } from '../hooks/useCatalog'
import logo from '@/assets/logo.png'
import SearchHero from '../components/SearchHero'
import CatalogFilters from '../components/CatalogFilters'
import MobileFiltersModal from '../components/MobileFiltersModal'
import BannerRegistro from '../components/RegistrationBanner'
import ChooseDatesModal from '../components/ChooseDatesModal'
import VehicleGrid from '../components/VehicleGrid'
import CatalogPagination from '../components/CatalogPagination'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import AlertaModal from '../components/AlertaModal'

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
  loginBorder: esModoOscuro ? 'rgba(148,163,184,0.35)' : 'rgba(30,58,138,0.25)',
  loginText: esModoOscuro ? '#e2e8f0' : COLOR_MARCA,
  loginHoverBg: esModoOscuro ? 'rgba(148,163,184,0.08)' : 'rgba(30,58,138,0.05)',
})

export default function CatalogoPage() {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const { usuario } = useAuthStore()
  const esModoOscuro = tema === 'oscuro'
  const c = coloresTema(esModoOscuro)

  const {
    cargando,
    error,
    filtros,
    setFiltro,
    busquedaForm,
    setForm,
    busquedaAplicada,
    textoLibre,
    setTextoLibre,
    resultado,
    sinCoincidenciasTexto,
    sinDisponibilidadFechas,
    sinCoincidenciasFiltros,
    totalPaginas,
    vehiculosPagina,
    pagina,
    setPagina,
    errorBusqueda,
    limpiar,
    reintentar,
  } = useCatalogo()

  const [filtrosMovilAbierto, setFiltrosMovilAbierto] = useState(false)
  // Bottom-sheet de registro: para Reservar y Favoritos (ofrece Registrarme / Iniciar sesión / Continuar como invitado)
  const [bannerRegistroAbierto, setBannerRegistroAbierto] = useState(false)
  // Modal centrado "Elige fechas y lugar": específico para el botón candado del buscador (solo Cancelar / Iniciar sesión)
  const [modalFechasAbierto, setModalFechasAbierto] = useState(false)
  // Modal centrado "Sin disponibilidad" para los filtros del sidebar (Categoría,
  // Ciudad, Sucursal, Precio, Transmisión, Combustible). Mismo componente que
  // usa SearchHero para texto libre y fechas.
  const [modalFiltrosCerrado, setModalFiltrosCerrado] = useState(false)

  // Cada vez que cambia algún filtro del sidebar, el modal vuelve a estar
  // disponible (por si la nueva combinación también queda sin resultados).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModalFiltrosCerrado(false)
  }, [filtros])

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

  // Filtros / favoritos siguen abriendo el bottom-sheet de registro (con 3 opciones)
  const handleBuscarInvitado = () => {
    setBannerRegistroAbierto(true)
  }

  const mostrarModalFiltros = sinCoincidenciasFiltros && !modalFiltrosCerrado

  return (
    <div style={{ minHeight: '100vh', background: c.pageBg, display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: c.navBg,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${c.navBorder}`,
        boxShadow: c.navShadow,
        height: '96px'
      }}>
        <div className="catalogo-header-inner" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to={usuario ? "/home" : "/"}>
            <img src={logo} alt="Drivique" style={{ height: '80px', flexShrink: 0 }} />
          </Link>
          <div style={{ flex: 1 }} />
        </div>
      </nav>

      <div style={{ paddingTop: '96px', flex: 1 }}>
        <SearchHero
          c={c}
          cargando={cargando}
          resultado={resultado}
          inputStyle={inputStyle}
          labelStyle={labelStyle}
          busquedaForm={busquedaForm}
          setForm={setForm}
          busquedaAplicada={busquedaAplicada}
          errorBusqueda={errorBusqueda}
          textoLibre={textoLibre}
          setTextoLibre={setTextoLibre}
          invitado={true}
          onAbrirBusquedaInvitado={() => setModalFechasAbierto(true)}
          sinCoincidenciasTexto={sinCoincidenciasTexto}
          sinDisponibilidadFechas={sinDisponibilidadFechas}
        />

        <div className="catalogo-layout catalogo-contenido-inner" style={{ maxWidth: '1280px', margin: '0 auto', padding: '22px 24px 24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <CatalogFilters
            c={c}
            inputStyle={inputStyle}
            labelStyle={labelStyle}
            filtros={filtros}
            setFiltro={setFiltro}
            limpiar={limpiar}
            invitado={true}
            onBuscarInvitado={handleBuscarInvitado}
            showHero={false}
            mostrarFavoritos={false}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
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

            {/* El grid ya no queda vacío por texto libre, fechas, ni por los
                filtros del sidebar (Categoría/Ciudad/Sucursal/Precio/Transmisión/
                Combustible): esos tres casos se resuelven con el modal centrado
                (AlertaModal). Esta tarjeta grande solo aparece cuando el catálogo
                en sí está vacío (0 vehículos cargados desde el backend). */}
            {!cargando && !error && resultado.length === 0 && (
              <EmptyState c={c} onLimpiar={limpiar} titulo={t('catalogo.noResults')} mensaje={t('catalogo.noResultsSubtitle')} textoBoton={t('catalogo.clearFilters')} />
            )}

            {!cargando && !error && resultado.length > 0 && (
              <>
                <VehicleGrid
                  vehiculosPagina={vehiculosPagina}
                  esFavorito={() => false}
                  toggleFavorito={() => handleBuscarInvitado()}
                  c={c}
                  invitado={true}
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

      <MobileFiltersModal
        abierto={filtrosMovilAbierto}
        onCerrar={() => setFiltrosMovilAbierto(false)}
        c={c}
        inputStyle={inputStyle}
        labelStyle={labelStyle}
        filtros={filtros}
        setFiltro={setFiltro}
        limpiar={limpiar}
        invitado={true}
        onBuscarInvitado={handleBuscarInvitado}
        mostrarFavoritos={false}
        resultado={resultado}
        cargando={cargando}
      />

      <BannerRegistro
        visible={bannerRegistroAbierto}
        onCerrar={() => setBannerRegistroAbierto(false)}
      />

      <ChooseDatesModal
        visible={modalFechasAbierto}
        onCerrar={() => setModalFechasAbierto(false)}
      />

      {mostrarModalFiltros ? (
        <AlertaModal
          c={c}
          titulo={t('catalogo.noAvailabilityFiltersTitle')}
          mensaje={t('catalogo.noAvailabilityFiltersMsg')}
          textoBoton={t('common.close')}
          onCerrar={() => setModalFiltrosCerrado(true)}
        />
      ) : null}
    </div>
  )
}