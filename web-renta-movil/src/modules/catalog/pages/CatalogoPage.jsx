import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { catalogoService } from '../../../services/catalogoService'
import { useLanding } from '../../landing/LandingContext'
import logo from '@/assets/logo/logo.png'
import {
  FaSearch,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTimes,
  FaSnowflake,
  FaBolt,
  FaLock,
  FaSuitcase,
  FaCogs,
  FaGasPump,
  FaUsers,
  FaCar,
  FaShieldAlt,
  FaMoneyBillWave
} from 'react-icons/fa'

const COLOR_MARCA = '#1e3a8a'
const COLOR_MARCA_HOVER = '#162d6e'

const coloresTema = (esModoOscuro) => ({
  pageBg: esModoOscuro ? '#0f172a' : '#f8fafc',
  pageText: esModoOscuro ? '#e2e8f0' : '#0f172a',

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
  textMuted: esModoOscuro ? '#cbd5e1' : '#475569',
  textSoft: esModoOscuro ? '#64748b' : '#94a3b8',

  accentText: esModoOscuro ? '#93c5fd' : COLOR_MARCA,
  accentBg: esModoOscuro ? 'rgba(30,58,138,0.22)' : '#eff6ff',
  accentBgSoft: esModoOscuro ? 'rgba(30,58,138,0.14)' : 'rgba(30,58,138,0.08)',
  accentBorder: esModoOscuro ? 'rgba(147,197,253,0.30)' : '#bfdbfe',
  accentGradient: 'linear-gradient(90deg,#1e3a8a,#2563eb)',

  inputBg: esModoOscuro ? '#0f172a' : '#fff',
  inputText: esModoOscuro ? '#e2e8f0' : '#334155',
  inputBorder: esModoOscuro ? '#334155' : '#e2e8f0',
  inputPlaceholder: esModoOscuro ? '#64748b' : '#94a3b8',

  successBg: esModoOscuro ? 'rgba(16,185,129,0.14)' : '#ecfdf5',
  successBorder: esModoOscuro ? 'rgba(110,231,183,0.22)' : '#bbf7d0',
  successText: esModoOscuro ? '#6ee7b7' : '#059669',

  dangerBg: esModoOscuro ? 'rgba(239,68,68,0.14)' : '#fef2f2',
  dangerBorder: esModoOscuro ? 'rgba(252,165,165,0.24)' : '#fecaca',
  dangerText: esModoOscuro ? '#fca5a5' : '#dc2626',

  warningBg: esModoOscuro ? 'rgba(245,158,11,0.14)' : '#fffbeb',
  warningText: esModoOscuro ? '#fcd34d' : '#b45309',

  availableBg: esModoOscuro ? 'rgba(16,185,129,0.14)' : '#ecfdf5',
  availableText: esModoOscuro ? '#6ee7b7' : '#059669',
  unavailableBg: esModoOscuro ? 'rgba(239,68,68,0.14)' : '#fef2f2',
  unavailableText: esModoOscuro ? '#fca5a5' : '#dc2626',

  skeletonTrack: esModoOscuro ? '#334155' : '#e2e8f0',

  chipBg: esModoOscuro ? '#1e293b' : '#f1f5f9',
  chipText: esModoOscuro ? '#cbd5e1' : '#475569',
  chipActiveBg: esModoOscuro ? '#2563eb' : COLOR_MARCA,
  chipActiveText: '#fff',

  cardBorder: esModoOscuro ? '#334155' : '#f1f5f9',
  cardBorderHover: esModoOscuro ? 'rgba(147,197,253,0.28)' : '#bfdbfe',
  cardShadow: esModoOscuro ? '0 4px 18px rgba(0,0,0,0.24)' : '0 2px 8px rgba(0,0,0,0.05)',
  cardShadowHover: esModoOscuro ? '0 12px 32px rgba(0,0,0,0.38)' : '0 8px 32px rgba(30,58,138,0.12)',
  imageFallbackBg: esModoOscuro ? 'linear-gradient(135deg,#1e293b,#0f172a)' : 'linear-gradient(135deg,#eff6ff,#dbeafe)',
  imageFallbackIcon: esModoOscuro ? '#93c5fd' : COLOR_MARCA,

  tariffBg: esModoOscuro ? 'rgba(16,185,129,0.10)' : '#f0fdf4',
  tariffBorder: esModoOscuro ? 'rgba(110,231,183,0.18)' : '#bbf7d0',
  insuranceBg: esModoOscuro ? 'rgba(30,58,138,0.18)' : '#eff6ff',
  insuranceBorder: esModoOscuro ? 'rgba(147,197,253,0.22)' : '#bfdbfe',

  dotActive: esModoOscuro ? '#93c5fd' : COLOR_MARCA,
  dotInactive: esModoOscuro ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.8)',

  favoriteBtnBg: esModoOscuro ? 'rgba(15,23,42,0.86)' : 'rgba(255,255,255,0.92)',
  favoriteBtnShadow: esModoOscuro ? '0 4px 14px rgba(0,0,0,0.32)' : '0 2px 8px rgba(0,0,0,0.10)',
  favoriteOn: '#ef4444',
  favoriteOff: esModoOscuro ? '#94a3b8' : '#94a3b8',

  paginationIdleBg: esModoOscuro ? '#1e293b' : '#f1f5f9',
  paginationIdleText: esModoOscuro ? '#cbd5e1' : '#475569',
  paginationDisabledBg: esModoOscuro ? '#0f172a' : '#f1f5f9',
  paginationDisabledText: esModoOscuro ? '#64748b' : '#94a3b8',

  loginBorder: esModoOscuro ? 'rgba(148,163,184,0.35)' : 'rgba(30,58,138,0.25)',
  loginText: esModoOscuro ? '#e2e8f0' : COLOR_MARCA,
  loginHoverBg: esModoOscuro ? 'rgba(148,163,184,0.08)' : 'rgba(30,58,138,0.05)',
})

/* ─────────── ÍCONOS ─────────── */
const IconoUbicacion = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
)

const IconoCalendario = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
)

const IconoAutoPlaceholder = ({ color = 'currentColor' }) => (
  <svg width="40" height="40" fill="none" stroke={color} strokeWidth="1.5" viewBox="0 0 24 24" style={{ opacity: 0.5 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
  </svg>
)

/* ─────────── CONSTANTES UI ─────────── */
const CATEGORIAS = ['Todos', 'Sedan', 'SUV', 'Económico', 'Deportivo']
const TRANSMISIONES = ['Todas', 'Automática', 'Manual']
const COMBUSTIBLES = ['Todos', 'Gasolina', 'Diesel', 'Híbrido', 'Eléctrico']
const SUCURSALES = ['Centro Neiva', 'Aeropuerto Neiva', 'Terminal de Transportes', 'Norte Neiva', 'Sur Neiva']
const POR_PAGINA = 6
const BUSQUEDA_INICIAL = { fechaInicio: '', fechaFin: '', lugarRecogida: '', mismoLugar: true, lugarDevolucion: '' }

/* ─────────── COMPONENTE PRINCIPAL ─────────── */
export default function CatalogoPage() {
  const { usuario } = useAuthStore()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'
  const c = coloresTema(esModoOscuro)

  const [todosVehiculos, setTodosVehiculos] = useState([])
  const [cargandoVehiculos, setCargandoVehiculos] = useState(true)
  const [errorVehiculos, setErrorVehiculos] = useState(null)

  useEffect(() => {
    catalogoService.getVehiculos()
      .then(data => setTodosVehiculos(data))
      .catch(() => setErrorVehiculos('No se pudo cargar el catálogo. Intenta de nuevo.'))
      .finally(() => setCargandoVehiculos(false))
  }, [])

  const [filtros, setFiltros] = useState({
    categoria: 'Todos', precioMin: '', precioMax: '',
    transmision: 'Todas', combustible: 'Todos', orden: 'precio_asc',
  })
  const [busquedaForm, setBusquedaForm] = useState(BUSQUEDA_INICIAL)
  const [busquedaAplicada, setBusquedaAplicada] = useState(BUSQUEDA_INICIAL)
  const [busquedaRealizada, setBusquedaRealizada] = useState(false)
  const [favoritos, setFavoritos] = useState([])
  const [errorBusqueda, setErrorBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)

  const setFiltro = (campo, valor) => { setFiltros(prev => ({ ...prev, [campo]: valor })); setPagina(1) }
  const setForm = (campo, valor) => { setBusquedaForm(prev => ({ ...prev, [campo]: valor })); setErrorBusqueda('') }

  const handleBuscar = () => {
    if (!busquedaForm.lugarRecogida) { setErrorBusqueda('Selecciona un lugar de recogida.'); return }
    if (!busquedaForm.fechaInicio) { setErrorBusqueda('Selecciona la fecha de recogida.'); return }
    if (!busquedaForm.fechaFin) { setErrorBusqueda('Selecciona la fecha de devolución.'); return }
    if (busquedaForm.fechaFin <= busquedaForm.fechaInicio) { setErrorBusqueda('La fecha de devolución debe ser posterior a la de recogida.'); return }
    setErrorBusqueda('')
    setBusquedaAplicada({ ...busquedaForm })
    setBusquedaRealizada(true)
    setPagina(1)
  }

  const dias = busquedaAplicada.fechaInicio && busquedaAplicada.fechaFin
    ? Math.ceil((new Date(busquedaAplicada.fechaFin) - new Date(busquedaAplicada.fechaInicio)) / 86400000)
    : 0

  const resultado = todosVehiculos
    .filter(v => {
      if (filtros.categoria !== 'Todos' && v.categoria !== filtros.categoria) return false
      if (filtros.transmision !== 'Todas' && v.transmision !== filtros.transmision) return false
      if (filtros.combustible !== 'Todos' && v.combustible !== filtros.combustible) return false
      if (filtros.precioMin && v.precio < Number(filtros.precioMin)) return false
      if (filtros.precioMax && v.precio > Number(filtros.precioMax)) return false
      if (busquedaRealizada && !v.disponible) return false
      return true
    })
    .sort((a, b) => {
      if (filtros.orden === 'precio_asc') return a.precio - b.precio
      if (filtros.orden === 'precio_desc') return b.precio - a.precio
      if (filtros.orden === 'calificacion') return b.calificacion - a.calificacion
      return 0
    })

  const totalPaginas = Math.ceil(resultado.length / POR_PAGINA)
  const vehiculosPagina = resultado.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const handleFavorito = (id) => {
    setFavoritos(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const limpiar = () => {
    setFiltros({ categoria: 'Todos', precioMin: '', precioMax: '', transmision: 'Todas', combustible: 'Todos', orden: 'precio_asc' })
    setBusquedaForm(BUSQUEDA_INICIAL)
    setBusquedaAplicada(BUSQUEDA_INICIAL)
    setBusquedaRealizada(false)
    setErrorBusqueda('')
    setPagina(1)
  }

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
    colorScheme: esModoOscuro ? 'dark' : 'light',
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
        <div style={{ background: c.heroBg, padding: '32px 24px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, color: c.accentText, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                  Flota disponible
                </span>
                <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, color: c.textPrimary, margin: 0 }}>Catálogo de vehículos</h1>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {!cargandoVehiculos && (
                  <span style={{ fontSize: '13px', color: c.textSecondary, fontWeight: 600 }}>
                    {resultado.length} vehículo{resultado.length !== 1 ? 's' : ''} encontrado{resultado.length !== 1 ? 's' : ''}
                  </span>
                )}

                <Link
                  to="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    color: c.accentText,
                    fontWeight: 700,
                    textDecoration: 'none',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    background: c.accentBgSoft,
                    border: `1px solid ${c.accentBorder}`,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Volver al inicio
                </Link>
              </div>
            </div>

            <div style={{ background: c.heroCardBg, borderRadius: '16px', border: `1px solid ${c.heroCardBorder}`, boxShadow: c.heroCardShadow, padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' }}>
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: c.accentText }}><IconoUbicacion /></span>
                    Lugar de recogida
                  </label>
                  <select
                    value={busquedaForm.lugarRecogida}
                    onChange={e => setForm('lugarRecogida', e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer', borderColor: errorBusqueda && !busquedaForm.lugarRecogida ? c.dangerText : c.inputBorder }}
                  >
                    <option value="">Selecciona punto</option>
                    {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: c.accentText }}><IconoUbicacion /></span>
                    Lugar de devolución
                  </label>
                  <select
                    value={busquedaForm.mismoLugar ? '__mismo__' : busquedaForm.lugarDevolucion}
                    onChange={e => {
                      if (e.target.value === '__mismo__') { setForm('mismoLugar', true); setForm('lugarDevolucion', '') }
                      else { setForm('mismoLugar', false); setForm('lugarDevolucion', e.target.value) }
                    }}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="__mismo__">Selecciona punto</option>
                    {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: c.accentText }}><IconoCalendario /></span>
                    Fecha de recogida
                  </label>
                  <input
                    type="date"
                    value={busquedaForm.fechaInicio}
                    onChange={e => setForm('fechaInicio', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ ...inputStyle, borderColor: errorBusqueda && !busquedaForm.fechaInicio ? c.dangerText : c.inputBorder }}
                  />
                </div>

                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: c.accentText }}><IconoCalendario /></span>
                    Fecha de devolución
                  </label>
                  <input
                    type="date"
                    value={busquedaForm.fechaFin}
                    onChange={e => setForm('fechaFin', e.target.value)}
                    min={busquedaForm.fechaInicio || new Date().toISOString().split('T')[0]}
                    style={{ ...inputStyle, borderColor: errorBusqueda && !busquedaForm.fechaFin ? c.dangerText : c.inputBorder }}
                  />
                </div>

                <div>
                  <button
                    onClick={handleBuscar}
                    style={{
                      width: '100%',
                      padding: '11px 20px',
                      borderRadius: '12px',
                      background: c.accentGradient,
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(30,58,138,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaSearch />
                    Buscar
                  </button>
                </div>
              </div>

              {errorBusqueda && (
                <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '10px', background: c.dangerBg, border: `1px solid ${c.dangerBorder}` }}>
                  <span style={{ fontSize: '13px', color: c.dangerText, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaExclamationTriangle />
                    {errorBusqueda}
                  </span>
                </div>
              )}

              {busquedaRealizada && dias > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: c.accentText, fontWeight: 700, background: c.accentBg, padding: '3px 10px', borderRadius: '9999px', border: `1px solid ${c.accentBorder}`, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <FaCalendarAlt />
                    {dias} día{dias !== 1 ? 's' : ''} de alquiler
                  </span>

                  <span style={{ fontSize: '12px', color: c.textMuted, fontWeight: 600, background: c.panelBgSoft, padding: '3px 10px', borderRadius: '9999px', border: `1px solid ${c.panelBorderStrong}`, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <FaMapMarkerAlt />
                    {busquedaAplicada.lugarRecogida} → {busquedaAplicada.mismoLugar ? busquedaAplicada.lugarRecogida : busquedaAplicada.lugarDevolucion || '—'}
                  </span>

                  <button onClick={limpiar} style={{ fontSize: '12px', color: c.dangerText, fontWeight: 700, border: 'none', cursor: 'pointer', padding: '3px 8px', borderRadius: '9999px', background: c.dangerBg, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <FaTimes />
                    Limpiar búsqueda
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <aside
            style={{
              width: '240px',
              flexShrink: 0,
              background: c.panelBg,
              borderRadius: '20px',
              border: `1px solid ${c.panelBorder}`,
              boxShadow: c.panelShadow,
              padding: '22px',
              position: 'sticky',
              top: '80px',
              maxHeight: 'calc(100vh - 100px)',
              overflowY: 'auto'
            }}
            className="filtros-panel"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: c.textPrimary, margin: 0 }}>Filtros</h2>
              <button onClick={limpiar} style={{ fontSize: '12px', color: c.accentText, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Limpiar
              </button>
            </div>

            <Seccion label="Categoría" ultimo={false} c={c}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {CATEGORIAS.map(cat => <Chip key={cat} activo={filtros.categoria === cat} onClick={() => setFiltro('categoria', cat)} c={c}>{cat}</Chip>)}
              </div>
            </Seccion>

            <Seccion label="Precio por día ($COP)" ultimo={false} c={c}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" inputMode="numeric" placeholder="Mín" value={filtros.precioMin} onChange={e => setFiltro('precioMin', e.target.value.replace(/\D/g, ''))} style={{ ...inputStyle, width: '50%' }} />
                <input type="text" inputMode="numeric" placeholder="Máx" value={filtros.precioMax} onChange={e => setFiltro('precioMax', e.target.value.replace(/\D/g, ''))} style={{ ...inputStyle, width: '50%' }} />
              </div>
            </Seccion>

            <Seccion label="Transmisión" ultimo={false} c={c}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {TRANSMISIONES.map(t => <Chip key={t} activo={filtros.transmision === t} onClick={() => setFiltro('transmision', t)} c={c}>{t}</Chip>)}
              </div>
            </Seccion>

            <Seccion label="Combustible" ultimo c={c}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {COMBUSTIBLES.map(item => <Chip key={item} activo={filtros.combustible === item} onClick={() => setFiltro('combustible', item)} c={c}>{item}</Chip>)}
              </div>
            </Seccion>
          </aside>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: c.textSecondary, fontWeight: 600 }}>Ordenar por:</span>
                <select value={filtros.orden} onChange={e => setFiltro('orden', e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '8px 12px', cursor: 'pointer' }}>
                  <option value="precio_asc">Precio: menor a mayor</option>
                  <option value="precio_desc">Precio: mayor a menor</option>
                  <option value="calificacion">Mejor calificación</option>
                </select>
              </div>
            </div>

            {cargandoVehiculos && (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <div style={{ width: '40px', height: '40px', border: `3px solid ${c.skeletonTrack}`, borderTopColor: c.accentText, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ fontSize: '14px', color: c.textSecondary, fontWeight: 600 }}>Cargando vehículos...</p>
              </div>
            )}

            {!cargandoVehiculos && errorVehiculos && (
              <div style={{ textAlign: 'center', padding: '80px 24px', background: c.panelBg, borderRadius: '20px', border: `1px solid ${c.dangerBorder}` }}>
                <p style={{ fontSize: '16px', color: c.dangerText, fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaExclamationTriangle />
                  {errorVehiculos}
                </p>
                <button
                  onClick={() => {
                    setCargandoVehiculos(true)
                    setErrorVehiculos(null)
                    catalogoService.getVehiculos()
                      .then(data => setTodosVehiculos(data))
                      .catch(() => setErrorVehiculos('No se pudo cargar el catálogo. Intenta de nuevo.'))
                      .finally(() => setCargandoVehiculos(false))
                  }}
                  style={{ padding: '10px 24px', borderRadius: '9999px', background: COLOR_MARCA, color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Reintentar
                </button>
              </div>
            )}

            {!cargandoVehiculos && !errorVehiculos && resultado.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 24px', background: c.panelBg, borderRadius: '20px', border: `1px solid ${c.panelBorder}` }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: c.textPrimary, margin: '0 0 8px' }}>Sin resultados</h3>
                <p style={{ fontSize: '14px', color: c.textSecondary, margin: '0 0 20px' }}>No encontramos vehículos con los filtros seleccionados.</p>
                <button onClick={limpiar} style={{ padding: '10px 24px', borderRadius: '9999px', background: COLOR_MARCA, color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                  Limpiar filtros
                </button>
              </div>
            )}

            {!cargandoVehiculos && !errorVehiculos && resultado.length > 0 && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px', alignItems: 'start' }}>
                  {vehiculosPagina.map(vehiculo => (
                    <TarjetaVehiculo
                      key={vehiculo.id}
                      vehiculo={vehiculo}
                      esFavorito={favoritos.includes(vehiculo.id)}
                      onFavorito={() => handleFavorito(vehiculo.id)}
                      dias={dias}
                      c={c}
                      invitado={!usuario}
                    />
                  ))}
                </div>

                {totalPaginas > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '40px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => { setPagina(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      disabled={pagina === 1}
                      style={{
                        height: '38px',
                        padding: '0 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: pagina === 1 ? c.paginationDisabledBg : COLOR_MARCA,
                        color: pagina === 1 ? c.paginationDisabledText : '#fff',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: pagina === 1 ? 'default' : 'pointer'
                      }}
                    >
                      ← Anterior
                    </button>

                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                      <button
                        key={num}
                        onClick={() => { setPagina(num); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          border: 'none',
                          background: pagina === num ? COLOR_MARCA : c.paginationIdleBg,
                          color: pagina === num ? '#fff' : c.paginationIdleText,
                          fontWeight: 700,
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      onClick={() => { setPagina(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      disabled={pagina === totalPaginas}
                      style={{
                        height: '38px',
                        padding: '0 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: pagina === totalPaginas ? c.paginationDisabledBg : COLOR_MARCA,
                        color: pagina === totalPaginas ? c.paginationDisabledText : '#fff',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: pagina === totalPaginas ? 'default' : 'pointer'
                      }}
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .filtros-panel { display: none !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

/* ─────────── HELPERS ─────────── */
function Seccion({ label, children, ultimo, c }) {
  return (
    <div style={{ marginBottom: ultimo ? 0 : '18px', paddingBottom: ultimo ? 0 : '18px', borderBottom: ultimo ? 'none' : `1px solid ${c.panelBorder}` }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: c.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Chip({ activo, onClick, children, c }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        background: activo ? c.chipActiveBg : c.chipBg,
        color: activo ? c.chipActiveText : c.chipText,
        border: 'none',
        transition: 'all 150ms'
      }}
    >
      {children}
    </button>
  )
}

/* ─────────── TARJETA VEHÍCULO ─────────── */
function TarjetaVehiculo({ vehiculo, esFavorito, onFavorito, dias, c }) {
  const navigate = useNavigate()
  const [hover, setHover] = useState(false)
  const [verDetalles, setVerDetalles] = useState(false)
  const [fotoActiva, setFotoActiva] = useState(0)

  const estrellas = Array.from({ length: 5 }, (_, i) => i < Math.round(vehiculo.calificacion))
  const handleReservar = () => navigate(`/catalogo/${vehiculo.id}`)

  const caracteristicas = [
    { icono: FaSnowflake, label: 'Aire acondicionado' },
    { icono: FaBolt, label: 'Eleva vidrios eléctrico' },
    { icono: FaLock, label: 'Cierre centralizado' },
    { icono: FaSuitcase, label: `${vehiculo.maletero}L maletero` },
    { icono: FaCogs, label: vehiculo.transmision },
    { icono: FaGasPump, label: vehiculo.combustible },
    { icono: FaUsers, label: `${vehiculo.pasajeros} personas` },
  ]

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: c.panelBg,
        borderRadius: '20px',
        border: `1.5px solid ${hover ? c.cardBorderHover : c.cardBorder}`,
        boxShadow: hover ? c.cardShadowHover : c.cardShadow,
        overflow: 'hidden',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease',
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'flex-start',
      }}
    >
      <div style={{ position: 'relative', height: '180px', background: c.imageFallbackBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {vehiculo.imagenes?.[fotoActiva]
          ? <img src={vehiculo.imagenes[fotoActiva]} alt={vehiculo.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <IconoAutoPlaceholder color={c.imageFallbackIcon} />
        }

        <span style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          fontSize: '11px',
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: '9999px',
          background: vehiculo.disponible ? c.availableBg : c.unavailableBg,
          color: vehiculo.disponible ? c.availableText : c.unavailableText
        }}>
          {vehiculo.disponible ? '● Disponible' : '● No disponible'}
        </span>

        <button
          onClick={e => { e.stopPropagation(); onFavorito() }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: c.favoriteBtnBg,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: c.favoriteBtnShadow
          }}
        >
          <svg width="20" height="20" fill={esFavorito ? c.favoriteOn : 'none'} stroke={esFavorito ? c.favoriteOn : c.favoriteOff} strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {vehiculo.imagenes?.length > 1 && (
          <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
            {vehiculo.imagenes.map((_, i) => (
              <button
                key={i}
                onClick={() => setFotoActiva(i)}
                style={{
                  width: i === fotoActiva ? '18px' : '7px',
                  height: '7px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  background: i === fotoActiva ? c.dotActive : c.dotInactive,
                  padding: 0,
                  transition: 'all 200ms'
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, padding: '16px',
          display: 'flex', flexDirection: 'column',
          opacity: verDetalles ? 0 : 1,
          transform: verDetalles ? 'translateX(-24px)' : 'translateX(0)',
          transition: 'opacity 220ms ease, transform 220ms ease',
          pointerEvents: verDetalles ? 'none' : 'all',
        }}>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: c.accentText, background: c.accentBg, padding: '3px 8px', borderRadius: '6px' }}>
              {vehiculo.categoria}
            </span>
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: 800, color: c.textPrimary, margin: '0 0 6px', lineHeight: 1.3 }}>{vehiculo.nombre}</h3>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: c.textSecondary }}>
              <FaCogs style={{ color: c.textMuted }} />
              {vehiculo.transmision}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: c.textSecondary }}>
              <FaGasPump style={{ color: c.textMuted }} />
              {vehiculo.combustible}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '10px' }}>
            {estrellas.map((llena, i) => (
              <svg key={i} width="13" height="13" fill={llena ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            ))}
            <span style={{ fontSize: '12px', color: c.textSecondary, marginLeft: '4px', fontWeight: 600 }}>{vehiculo.calificacion}</span>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '22px', fontWeight: 900, color: c.accentText }}>${vehiculo.precio.toLocaleString('es-CO')}</span>
            <span style={{ fontSize: '12px', color: c.textSoft, marginLeft: '4px' }}>/día</span>
            {dias > 0 && <div style={{ fontSize: '11px', color: c.successText, fontWeight: 700, marginTop: '2px' }}>Total: ${(vehiculo.precio * dias).toLocaleString('es-CO')}</div>}
          </div>

          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={handleReservar}
              disabled={!vehiculo.disponible}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 800,
                border: 'none',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: vehiculo.disponible ? 'pointer' : 'not-allowed',
                background: vehiculo.disponible ? c.accentGradient : c.paginationDisabledBg,
                color: vehiculo.disponible ? '#fff' : c.paginationDisabledText,
                boxShadow: vehiculo.disponible ? '0 4px 14px rgba(30,58,138,0.28)' : 'none',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {vehiculo.disponible ? (
                <>
                  <FaCar />
                  Reservar ahora
                </>
              ) : 'No disponible'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setVerDetalles(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: c.accentText, textDecoration: 'underline', padding: 0 }}>
                Ver detalles
              </button>
            </div>
          </div>
        </div>

        <div style={{
          position: 'absolute', inset: 0, padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: '7px',
          overflowY: 'auto',
          opacity: verDetalles ? 1 : 0,
          transform: verDetalles ? 'translateX(0)' : 'translateX(24px)',
          transition: 'opacity 220ms ease, transform 220ms ease',
          pointerEvents: verDetalles ? 'all' : 'none',
        }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <button onClick={() => setVerDetalles(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: c.accentText, textDecoration: 'underline', padding: 0 }}>
              Ocultar detalles
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', flexShrink: 0 }}>
            {caracteristicas.map((item, i) => {
              const Icono = item.icono
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: c.panelBgSoft, borderRadius: '8px', padding: '7px 8px', border: `1px solid ${c.panelBorder}` }}>
                  <span style={{ fontSize: '14px', flexShrink: 0, color: c.textMuted, display: 'flex', alignItems: 'center' }}>
                    <Icono />
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: c.textMuted, lineHeight: 1.3 }}>{item.label}</span>
                </div>
              )
            })}
          </div>

          <div style={{ background: c.tariffBg, borderRadius: '8px', padding: '8px 10px', border: `1px solid ${c.tariffBorder}`, flexShrink: 0 }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: c.successText, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaMoneyBillWave />
              Tarifas
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: c.textMuted, marginBottom: '3px', gap: '8px' }}>
              <span>Km limitado ({vehiculo.tarifas?.kmLimitado?.km} km/día)</span>
              <span style={{ fontWeight: 800 }}>${vehiculo.tarifas?.kmLimitado?.precio?.toLocaleString('es-CO')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: c.textMuted, gap: '8px' }}>
              <span>Km ilimitado</span>
              <span style={{ fontWeight: 800 }}>${vehiculo.tarifas?.kmIlimitado?.precio?.toLocaleString('es-CO')}</span>
            </div>
          </div>

          <div style={{ background: c.insuranceBg, borderRadius: '8px', padding: '8px 10px', border: `1px solid ${c.insuranceBorder}`, flexShrink: 0 }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: c.accentText, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaShieldAlt />
              Seguros
            </div>
            {vehiculo.seguros?.map((seg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: c.textMuted, marginBottom: i < vehiculo.seguros.length - 1 ? '4px' : 0 }}>
                <span style={{ fontWeight: 600 }}>{seg.nombre}</span>
                <span style={{ fontWeight: 800, color: c.accentText, whiteSpace: 'nowrap', marginLeft: '6px' }}>
                  COP {seg.precio.toLocaleString('es-CO', { minimumFractionDigits: 2 })}/día
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}