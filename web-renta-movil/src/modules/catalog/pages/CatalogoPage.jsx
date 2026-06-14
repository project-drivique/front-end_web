import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { useLanding } from '../../landing/LandingContext'
import { COLOR_MARCA } from '../constants'
import { useCatalogo } from '../hooks/useCatalogo'
import logo from '@/assets/logo/logo.png'
import HeroBusqueda from '../components/HeroBusqueda'
import FiltrosCatalogo from '../components/FiltrosCatalogo'
import GridVehiculos from '../components/GridVehiculos'
import PaginacionCatalogo from '../components/PaginacionCatalogo'
import EstadoCarga from '../components/EstadoCarga'
import EstadoError from '../components/EstadoError'
import EstadoVacio from '../components/EstadoVacio'
import { showAlert } from '@/utils/swalConfig'

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
  const { tema } = useLanding()
  const navigate = useNavigate()
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
    busquedaRealizada,
    dias,
    resultado,
    totalPaginas,
    vehiculosPagina,
    pagina,
    setPagina,
    errorBusqueda,
    limpiar,
    reintentar,
  } = useCatalogo()

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

  const handleBuscarInvitado = () => {
    showAlert({
      icon: 'info',
      title: 'Modo Invitado',
      text: 'Para buscar y reservar vehículos con fechas específicas, necesitas tener una cuenta.',
      confirmButtonText: 'Ir a registro',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) navigate('/registro')
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: c.pageBg, display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: c.navBg,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${c.navBorder}`,
        boxShadow: c.navShadow,
        height: '68px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/"><img src={logo} alt="RentaMovil" style={{ height: '40px', flexShrink: 0 }} /></Link>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/login"
              style={{
                padding: '8px 20px',
                borderRadius: '9999px',
                border: `2px solid ${c.loginBorder}`,
                color: c.loginText,
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
                background: 'transparent',
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
        <HeroBusqueda
          c={c}
          cargando={cargando}
          resultado={resultado}
          inputStyle={inputStyle}
          labelStyle={labelStyle}
          busquedaForm={busquedaForm}
          setForm={setForm}
          errorBusqueda={errorBusqueda}
          busquedaRealizada={busquedaRealizada}
          busquedaAplicada={busquedaAplicada}
          dias={dias}
          limpiar={limpiar}
          invitado={true}
          onBuscarInvitado={handleBuscarInvitado}
        />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '22px 24px 24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <FiltrosCatalogo
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
              <EstadoVacio c={c} onLimpiar={limpiar} titulo="Sin resultados" mensaje="No encontramos vehículos con los filtros seleccionados." textoBoton="Limpiar filtros" />
            )}

            {!cargando && !error && resultado.length > 0 && (
              <>
                <GridVehiculos
                  vehiculosPagina={vehiculosPagina}
                  esFavorito={() => false}
                  toggleFavorito={() => handleBuscarInvitado()}
                  c={c}
                  invitado={true}
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