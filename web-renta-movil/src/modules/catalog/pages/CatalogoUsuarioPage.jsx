import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useLanding } from '../../landing/LandingContext'
import { COLOR_MARCA } from '../constants'
import { useCatalogo } from '../hooks/useCatalogo'
import { useFavoritos } from '../hooks/useFavoritos'
import HeaderCatalogo from '../components/HeaderCatalogo'
import HeroBusqueda from '../components/HeroBusqueda'
import FiltrosCatalogo from '../components/FiltrosCatalogo'
import GridVehiculos from '../components/GridVehiculos'
import PaginacionCatalogo from '../components/PaginacionCatalogo'
import EstadoCarga from '../components/EstadoCarga'
import EstadoError from '../components/EstadoError'
import EstadoVacio from '../components/EstadoVacio'

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
  const { usuario } = useAuthStore()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'
  const c = coloresTema(esModoOscuro)

  const favoritosKey = useMemo(() => {
    if (!usuario?.id) return 'favoritosVehiculos'
    return `favoritosVehiculos_${usuario.id}`
  }, [usuario?.id])

  const { esFavorito, toggleFavorito } = useFavoritos(favoritosKey)

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
    setSoloFavoritos
  } = useCatalogo({ esFavorito })

  useEffect(() => {
    setSoloFavoritos(false)
    setPagina(1)
  }, [usuario?.id, setSoloFavoritos, setPagina])

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
    ? 'No tienes vehículos marcados como favoritos.'
    : 'No encontramos vehículos con los filtros seleccionados.'

  const tituloVacio = soloFavoritos ? 'Sin favoritos' : 'Sin resultados'

  return (
    <div style={{ minHeight: '100vh', background: c.pageBg, display: 'flex', flexDirection: 'column' }}>
      <HeaderCatalogo c={c} usuario={usuario} withLinks />

      <div style={{ paddingTop: '68px', flex: 1 }}>
        <HeroBusqueda
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
        />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '22px 24px 24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <FiltrosCatalogo
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
            mostrarFavoritos={Boolean(usuario?.id)}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: c.textSecondary, fontWeight: 600 }}>Ordenar por:</span>
              <select value={filtros.orden} onChange={e => setFiltro('orden', e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '8px 12px' }}>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
                <option value="calificacion">Mejor calificación</option>
              </select>
            </div>

            {cargando && <EstadoCarga c={c} />}
            {!cargando && error && <EstadoError c={c} error={error} onRetry={reintentar} />}
            {!cargando && !error && resultado.length === 0 && (
              <EstadoVacio c={c} onLimpiar={limpiarTodo} titulo={tituloVacio} mensaje={mensajeVacio} textoBoton={soloFavoritos ? 'Ver todos' : 'Limpiar filtros'} />
            )}

            {!cargando && !error && resultado.length > 0 && (
              <>
                <GridVehiculos
                  vehiculosPagina={vehiculosPagina}
                  esFavorito={esFavorito}
                  toggleFavorito={toggleFavorito}
                  c={c}
                  invitado={false}
                />

                <PaginacionCatalogo
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
  )
}