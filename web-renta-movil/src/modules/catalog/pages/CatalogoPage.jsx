import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import logo from '@/assets/logo/logo.png'

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

/* ─────────── DATOS MOCK ─────────── */
const VEHICULOS_MOCK = [
  {
    id: 1, nombre: 'Toyota Corolla 2024', categoria: 'Sedan',
    transmision: 'Automática', combustible: 'Gasolina', precio: 85000,
    calificacion: 4.8, disponible: true, imagen: null,
    puertas: 4, pasajeros: 5, maletero: 470, cilindraje: '1.8L',
    color: 'Blanco Perla', año: 2024, placa: 'ABC-123',
    tarifas: {
      kmLimitado:  { km: 200, precio: 85000,  excedente: 800  },
      kmIlimitado: { precio: 105000 },
    },
    seguros: [
      { nombre: 'Protección obligatoria', precio: 29000 },
      { nombre: 'Protección total',       precio: 67090 },
    ],
    servicios: [
      { nombre: 'GPS',                 precio: 15000 },
      { nombre: 'Silla bebé',          precio: 20000 },
      { nombre: 'Conductor adicional', precio: 30000 },
    ],
    sucursal: 'Centro Neiva',
    imagenes: [null, null, null],
    disponibilidad: { ocupados: ['2026-05-20','2026-05-21','2026-05-22','2026-05-28','2026-05-29'] },
    comentarios: [
      { autor: 'Carlos M.',  calificacion: 5, texto: 'Excelente vehículo, muy cómodo y puntual en la entrega.', fecha: '2026-04-10' },
      { autor: 'Laura P.',   calificacion: 4, texto: 'Buen servicio, el carro en perfectas condiciones.',       fecha: '2026-03-22' },
      { autor: 'Andrés R.',  calificacion: 5, texto: 'Lo recomiendo totalmente, volveré a alquilar.',           fecha: '2026-03-05' },
    ],
  },
  { id: 2, nombre: 'Mazda CX-5 2024',     categoria: 'SUV',       transmision: 'Automática', combustible: 'Gasolina', precio: 145000, calificacion: 4.9, disponible: true,  puertas: 5, pasajeros: 5, maletero: 442, cilindraje: '2.5L',        color: 'Soul Red Crystal', año: 2024, placa: 'DEF-456', tarifas: { kmLimitado: { km: 250, precio: 145000, excedente: 1000 }, kmIlimitado: { precio: 175000 } }, seguros: [{ nombre: 'Protección Obligatoria', precio: 29000 }, { nombre: 'Protección Total', precio: 67000 }], servicios: [{ nombre: 'GPS', precio: 15000 }, { nombre: 'Silla bebé', precio: 20000 }], sucursal: 'Aeropuerto Neiva', imagenes: [null, null, null], disponibilidad: { ocupados: [] }, comentarios: [] },
  { id: 3, nombre: 'Chevrolet Spark 2023', categoria: 'Económico', transmision: 'Manual',     combustible: 'Gasolina', precio: 60000,  calificacion: 4.5, disponible: true,  puertas: 4, pasajeros: 4, maletero: 170, cilindraje: '1.0L',        color: 'Rojo Passion',     año: 2023, placa: 'GHI-789', tarifas: { kmLimitado: { km: 150, precio: 60000,  excedente: 600  }, kmIlimitado: { precio: 75000  } }, seguros: [{ nombre: 'Protección Obligatoria', precio: 29000 }, { nombre: 'Protección Total', precio: 67000 }], servicios: [{ nombre: 'GPS', precio: 15000 }], sucursal: 'Terminal de Transportes', imagenes: ['/ChevroletSpark.webp', null, null], disponibilidad: { ocupados: [] }, comentarios: [] },
  { id: 4, nombre: 'Ford Mustang GT 2023', categoria: 'Deportivo', transmision: 'Automática', combustible: 'Gasolina', precio: 220000, calificacion: 4.7, disponible: false, puertas: 2, pasajeros: 4, maletero: 382, cilindraje: '5.0L V8',     color: 'Race Red',         año: 2023, placa: 'JKL-012', tarifas: { kmLimitado: { km: 300, precio: 220000, excedente: 1500 }, kmIlimitado: { precio: 260000 } }, seguros: [{ nombre: 'Protección Obligatoria', precio: 29000 }, { nombre: 'Protección Total', precio: 67000 }], servicios: [{ nombre: 'GPS', precio: 15000 }], sucursal: 'Centro Neiva',            imagenes: ['/FordMustang.webp', null, null], disponibilidad: { ocupados: [] }, comentarios: [] },
  { id: 5, nombre: 'Toyota Prado 2024',    categoria: 'SUV',       transmision: 'Automática', combustible: 'Diesel',   precio: 180000, calificacion: 4.6, disponible: true,  puertas: 5, pasajeros: 8, maletero: 390, cilindraje: '2.8L Diesel',  color: 'Super White',      año: 2024, placa: 'MNO-345', tarifas: { kmLimitado: { km: 300, precio: 180000, excedente: 1200 }, kmIlimitado: { precio: 215000 } }, seguros: [{ nombre: 'Protección Obligatoria', precio: 29000 }, { nombre: 'Protección Total', precio: 67000 }], servicios: [{ nombre: 'GPS', precio: 15000 }, { nombre: 'Silla bebé', precio: 20000 }, { nombre: 'Conductor adicional', precio: 30000 }], sucursal: 'Norte Neiva', imagenes: [null, null, null], disponibilidad: { ocupados: [] }, comentarios: [] },
  { id: 6, nombre: 'Renault Sandero 2023', categoria: 'Económico', transmision: 'Manual',     combustible: 'Gasolina', precio: 55000,  calificacion: 4.3, disponible: true,  puertas: 5, pasajeros: 5, maletero: 320, cilindraje: '1.6L',        color: 'Gris Highland',    año: 2023, placa: 'PQR-678', tarifas: { kmLimitado: { km: 150, precio: 55000,  excedente: 550  }, kmIlimitado: { precio: 68000  } }, seguros: [{ nombre: 'Protección Obligatoria', precio: 29000 }, { nombre: 'Protección Total', precio: 67000 }], servicios: [{ nombre: 'GPS', precio: 15000 }], sucursal: 'Sur Neiva',               imagenes: ['/RenaultSandero.webp', null, null], disponibilidad: { ocupados: [] }, comentarios: [] },
  { id: 7, nombre: 'Hyundai Tucson 2024',  categoria: 'SUV',       transmision: 'Automática', combustible: 'Híbrido',  precio: 160000, calificacion: 4.8, disponible: true,  puertas: 5, pasajeros: 5, maletero: 513, cilindraje: '1.6L Híbrido', color: 'Phantom Black',    año: 2024, placa: 'STU-901', tarifas: { kmLimitado: { km: 250, precio: 160000, excedente: 1100 }, kmIlimitado: { precio: 192000 } }, seguros: [{ nombre: 'Protección Obligatoria', precio: 29000 }, { nombre: 'Protección Total', precio: 67000 }], servicios: [{ nombre: 'GPS', precio: 15000 }, { nombre: 'Silla bebé', precio: 20000 }], sucursal: 'Aeropuerto Neiva', imagenes: [null, null, null], disponibilidad: { ocupados: [] }, comentarios: [] },
  { id: 8, nombre: 'Kia Cerato 2024',      categoria: 'Sedan',     transmision: 'Automática', combustible: 'Gasolina', precio: 95000,  calificacion: 4.4, disponible: true,  puertas: 4, pasajeros: 5, maletero: 502, cilindraje: '2.0L',        color: 'Snow White Pearl', año: 2024, placa: 'VWX-234', tarifas: { kmLimitado: { km: 200, precio: 95000,  excedente: 900  }, kmIlimitado: { precio: 115000 } }, seguros: [{ nombre: 'Protección Obligatoria', precio: 29000 }, { nombre: 'Protección Total', precio: 67000 }], servicios: [{ nombre: 'GPS', precio: 15000 }, { nombre: 'Conductor adicional', precio: 30000 }], sucursal: 'Centro Neiva', imagenes: [null, null, null], disponibilidad: { ocupados: [] }, comentarios: [] },
]

const CATEGORIAS    = ['Todos', 'Sedan', 'SUV', 'Económico', 'Deportivo']
const TRANSMISIONES = ['Todas', 'Automática', 'Manual']
const COMBUSTIBLES  = ['Todos', 'Gasolina', 'Diesel', 'Híbrido', 'Eléctrico']
const SUCURSALES    = ['Centro Neiva', 'Aeropuerto Neiva', 'Terminal de Transportes', 'Norte Neiva', 'Sur Neiva']
const POR_PAGINA    = 6
const BUSQUEDA_INICIAL = { fechaInicio: '', fechaFin: '', lugarRecogida: '', mismoLugar: true, lugarDevolucion: '' }

/* ─────────── COMPONENTE PRINCIPAL ─────────── */
export default function CatalogoPage() {
  const { usuario } = useAuthStore()

  const [filtros, setFiltros] = useState({
    categoria: 'Todos', precioMin: '', precioMax: '',
    transmision: 'Todas', combustible: 'Todos', orden: 'precio_asc',
  })
  const [busquedaForm,      setBusquedaForm]      = useState(BUSQUEDA_INICIAL)
  const [busquedaAplicada,  setBusquedaAplicada]  = useState(BUSQUEDA_INICIAL)
  const [busquedaRealizada, setBusquedaRealizada] = useState(false)
  const [favoritos,         setFavoritos]         = useState([])
  const [mensajeFavorito,   setMensajeFavorito]   = useState(false)
  const [errorBusqueda,     setErrorBusqueda]     = useState('')
  const [pagina,            setPagina]            = useState(1)

  const setFiltro = (campo, valor) => { setFiltros(prev => ({ ...prev, [campo]: valor })); setPagina(1) }
  const setForm   = (campo, valor) => { setBusquedaForm(prev => ({ ...prev, [campo]: valor })); setErrorBusqueda('') }

  const handleBuscar = () => {
    if (!busquedaForm.lugarRecogida) { setErrorBusqueda('Selecciona un lugar de recogida.'); return }
    if (!busquedaForm.fechaInicio)   { setErrorBusqueda('Selecciona la fecha de recogida.'); return }
    if (!busquedaForm.fechaFin)      { setErrorBusqueda('Selecciona la fecha de devolución.'); return }
    if (busquedaForm.fechaFin <= busquedaForm.fechaInicio) { setErrorBusqueda('La fecha de devolución debe ser posterior a la de recogida.'); return }
    setErrorBusqueda(''); setBusquedaAplicada({ ...busquedaForm }); setBusquedaRealizada(true); setPagina(1)
  }

  const dias = busquedaAplicada.fechaInicio && busquedaAplicada.fechaFin
    ? Math.ceil((new Date(busquedaAplicada.fechaFin) - new Date(busquedaAplicada.fechaInicio)) / 86400000)
    : 0

  const resultado = VEHICULOS_MOCK
    .filter(v => {
      if (filtros.categoria   !== 'Todos' && v.categoria   !== filtros.categoria)   return false
      if (filtros.transmision !== 'Todas' && v.transmision !== filtros.transmision) return false
      if (filtros.combustible !== 'Todos' && v.combustible !== filtros.combustible) return false
      if (filtros.precioMin && v.precio < Number(filtros.precioMin)) return false
      if (filtros.precioMax && v.precio > Number(filtros.precioMax)) return false
      if (busquedaRealizada && !v.disponible) return false
      return true
    })
    .sort((a, b) => {
      if (filtros.orden === 'precio_asc')   return a.precio - b.precio
      if (filtros.orden === 'precio_desc')  return b.precio - a.precio
      if (filtros.orden === 'calificacion') return b.calificacion - a.calificacion
      return 0
    })

  const totalPaginas    = Math.ceil(resultado.length / POR_PAGINA)
  const vehiculosPagina = resultado.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const handleFavorito = (id) => {
    if (!usuario) { setMensajeFavorito(true); setTimeout(() => setMensajeFavorito(false), 3000); return }
    setFavoritos(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const limpiar = () => {
    setFiltros({ categoria: 'Todos', precioMin: '', precioMax: '', transmision: 'Todas', combustible: 'Todos', orden: 'precio_asc' })
    setBusquedaForm(BUSQUEDA_INICIAL); setBusquedaAplicada(BUSQUEDA_INICIAL)
    setBusquedaRealizada(false); setErrorBusqueda(''); setPagina(1)
  }

  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', color: '#334155', background: '#fff', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', height: '68px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/"><img src={logo} alt="RentaMovil" style={{ height: '40px', flexShrink: 0 }} /></Link>
          <div style={{ flex: 1 }} />
          {usuario ? (
            <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>Hola, {usuario.nombre?.split(' ')[0]} 👋</span>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login"    style={{ padding: '8px 20px', borderRadius: '9999px', border: '2px solid rgba(30,58,138,0.25)', color: '#1e3a8a', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Iniciar sesión</Link>
              <Link to="/registro" style={{ padding: '8px 20px', borderRadius: '9999px', background: '#1e3a8a', color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Registrarse</Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── TOAST ── */}
      {mensajeFavorito && (
        <div style={{ position: 'fixed', top: '84px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: '#1e3a8a', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, boxShadow: '0 8px 24px rgba(30,58,138,0.30)' }}>
          🔒 Inicia sesión para guardar favoritos
        </div>
      )}

      <div style={{ paddingTop: '68px', flex: 1 }}>

        {/* ── CABECERA + BÚSQUEDA ── */}
        <div style={{ background: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)', padding: '32px 24px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Flota disponible</span>
                <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, color: '#0f172a', margin: 0 }}>Catálogo de vehículos</h1>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{resultado.length} vehículo{resultado.length !== 1 ? 's' : ''} encontrado{resultado.length !== 1 ? 's' : ''}</span>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#1e3a8a', fontWeight: 700, textDecoration: 'none', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(30,58,138,0.08)', border: '1px solid rgba(30,58,138,0.15)', whiteSpace: 'nowrap' }}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                  Volver al inicio
                </Link>
              </div>
            </div>

            {/* BÚSQUEDA */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dbeafe', boxShadow: '0 4px 24px rgba(30,58,138,0.10)', padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' }}>
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ color: '#1e3a8a' }}><IconoUbicacion /></span>Lugar de recogida</label>
                  <select value={busquedaForm.lugarRecogida} onChange={e => setForm('lugarRecogida', e.target.value)} style={{ ...inputStyle, cursor: 'pointer', borderColor: errorBusqueda && !busquedaForm.lugarRecogida ? '#ef4444' : '#e2e8f0' }}>
                    <option value="">Selecciona punto</option>
                    {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ color: '#1e3a8a' }}><IconoUbicacion /></span>Lugar de devolución</label>
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
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ color: '#1e3a8a' }}><IconoCalendario /></span>Fecha de recogida</label>
                  <input type="date" value={busquedaForm.fechaInicio} onChange={e => setForm('fechaInicio', e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ ...inputStyle, borderColor: errorBusqueda && !busquedaForm.fechaInicio ? '#ef4444' : '#e2e8f0' }} />
                </div>
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ color: '#1e3a8a' }}><IconoCalendario /></span>Fecha de devolución</label>
                  <input type="date" value={busquedaForm.fechaFin} onChange={e => setForm('fechaFin', e.target.value)} min={busquedaForm.fechaInicio || new Date().toISOString().split('T')[0]} style={{ ...inputStyle, borderColor: errorBusqueda && !busquedaForm.fechaFin ? '#ef4444' : '#e2e8f0' }} />
                </div>
                <div>
                  <button onClick={handleBuscar} style={{ width: '100%', padding: '11px 20px', borderRadius: '12px', background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(30,58,138,0.25)' }}>🔍 Buscar</button>
                </div>
              </div>
              {errorBusqueda && (
                <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>⚠️ {errorBusqueda}</span>
                </div>
              )}
              {busquedaRealizada && dias > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: 700, background: '#eff6ff', padding: '3px 10px', borderRadius: '9999px', border: '1px solid #bfdbfe' }}>📅 {dias} día{dias !== 1 ? 's' : ''} de alquiler</span>
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600, background: '#f8fafc', padding: '3px 10px', borderRadius: '9999px', border: '1px solid #e2e8f0' }}>📍 {busquedaAplicada.lugarRecogida} → {busquedaAplicada.mismoLugar ? busquedaAplicada.lugarRecogida : busquedaAplicada.lugarDevolucion || '—'}</span>
                  <button onClick={limpiar} style={{ fontSize: '12px', color: '#dc2626', fontWeight: 700, border: 'none', cursor: 'pointer', padding: '3px 8px', borderRadius: '9999px', background: '#fef2f2' }}>✕ Limpiar búsqueda</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── CUERPO ── */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          {/* FILTROS */}
          <aside style={{ width: '240px', flexShrink: 0, background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', padding: '22px', position: 'sticky', top: '80px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }} className="filtros-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Filtros</h2>
              <button onClick={limpiar} style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Limpiar</button>
            </div>
            <Seccion label="Categoría">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {CATEGORIAS.map(cat => <Chip key={cat} activo={filtros.categoria === cat} onClick={() => setFiltro('categoria', cat)}>{cat}</Chip>)}
              </div>
            </Seccion>
            <Seccion label="Precio por día ($COP)">
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" inputMode="numeric" placeholder="Mín" value={filtros.precioMin} onChange={e => setFiltro('precioMin', e.target.value.replace(/\D/g, ''))} style={{ ...inputStyle, width: '50%' }} />
                <input type="text" inputMode="numeric" placeholder="Máx" value={filtros.precioMax} onChange={e => setFiltro('precioMax', e.target.value.replace(/\D/g, ''))} style={{ ...inputStyle, width: '50%' }} />
              </div>
            </Seccion>
            <Seccion label="Transmisión">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {TRANSMISIONES.map(t => <Chip key={t} activo={filtros.transmision === t} onClick={() => setFiltro('transmision', t)}>{t}</Chip>)}
              </div>
            </Seccion>
            <Seccion label="Combustible" ultimo>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {COMBUSTIBLES.map(c => <Chip key={c} activo={filtros.combustible === c} onClick={() => setFiltro('combustible', c)}>{c}</Chip>)}
              </div>
            </Seccion>
          </aside>

          {/* GRID */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Ordenar por:</span>
                <select value={filtros.orden} onChange={e => setFiltro('orden', e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '8px 12px', cursor: 'pointer' }}>
                  <option value="precio_asc">Precio: menor a mayor</option>
                  <option value="precio_desc">Precio: mayor a menor</option>
                  <option value="calificacion">Mejor calificación</option>
                </select>
              </div>
            </div>

            {resultado.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Sin resultados</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px' }}>No encontramos vehículos con los filtros seleccionados.</p>
                <button onClick={limpiar} style={{ padding: '10px 24px', borderRadius: '9999px', background: '#1e3a8a', color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Limpiar filtros</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px', alignItems: 'start' }}>
                  {vehiculosPagina.map(vehiculo => (
                    <TarjetaVehiculo
                      key={vehiculo.id}
                      vehiculo={vehiculo}
                      esFavorito={favoritos.includes(vehiculo.id)}
                      onFavorito={() => handleFavorito(vehiculo.id)}
                      dias={dias}
                    />
                  ))}
                </div>
                {totalPaginas > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '40px' }}>
                    <button onClick={() => { setPagina(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }} disabled={pagina === 1} style={{ height: '38px', padding: '0 16px', borderRadius: '8px', border: 'none', background: pagina === 1 ? '#f1f5f9' : '#1e3a8a', color: pagina === 1 ? '#94a3b8' : '#fff', fontWeight: 700, fontSize: '13px', cursor: pagina === 1 ? 'default' : 'pointer' }}>← Anterior</button>
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                      <button key={num} onClick={() => { setPagina(num); window.scrollTo({ top: 0, behavior: 'smooth' }) }} style={{ width: '38px', height: '38px', borderRadius: '8px', border: 'none', background: pagina === num ? '#1e3a8a' : '#f1f5f9', color: pagina === num ? '#fff' : '#475569', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>{num}</button>
                    ))}
                    <button onClick={() => { setPagina(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }} disabled={pagina === totalPaginas} style={{ height: '38px', padding: '0 16px', borderRadius: '8px', border: 'none', background: pagina === totalPaginas ? '#f1f5f9' : '#1e3a8a', color: pagina === totalPaginas ? '#94a3b8' : '#fff', fontWeight: 700, fontSize: '13px', cursor: pagina === totalPaginas ? 'default' : 'pointer' }}>Siguiente →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .filtros-panel { display: none !important; } }
      `}</style>
    </div>
  )
}

/* ─────────── HELPERS ─────────── */
function Seccion({ label, children, ultimo }) {
  return (
    <div style={{ marginBottom: ultimo ? 0 : '18px', paddingBottom: ultimo ? 0 : '18px', borderBottom: ultimo ? 'none' : '1px solid #f1f5f9' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      {children}
    </div>
  )
}

function Chip({ activo, onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding: '5px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: activo ? '#1e3a8a' : '#f1f5f9', color: activo ? '#fff' : '#475569', border: 'none', transition: 'all 150ms' }}>
      {children}
    </button>
  )
}

/* ─────────── TARJETA VEHÍCULO ─────────── */
function TarjetaVehiculo({ vehiculo, esFavorito, onFavorito, dias }) {
  const navigate                      = useNavigate()
  const { usuario }                   = useAuthStore()
  const [hover, setHover]             = useState(false)
  const [verDetalles, setVerDetalles] = useState(false)
  const [fotoActiva, setFotoActiva]   = useState(0)

  const estrellas = Array.from({ length: 5 }, (_, i) => i < Math.round(vehiculo.calificacion))

  // ✅ LÍNEA CORREGIDA: redirige a /catalogo/:id en lugar de /reserva
 const handleReservar = () => {
  navigate(`/catalogo/${vehiculo.id}`)
}

  const caracteristicas = [
    { icono: '❄️', label: 'Aire acondicionado'             },
    { icono: '⚡', label: 'Eleva vidrios eléctrico'        },
    { icono: '🔒', label: 'Cierre centralizado'            },
    { icono: '🧳', label: `${vehiculo.maletero}L maletero` },
    { icono: '⚙️', label: vehiculo.transmision             },
    { icono: '⛽', label: vehiculo.combustible             },
    { icono: '👥', label: `${vehiculo.pasajeros} personas` },
  ]

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', borderRadius: '20px',
        border: `1.5px solid ${hover ? '#bfdbfe' : '#f1f5f9'}`,
        boxShadow: hover ? '0 8px 32px rgba(30,58,138,0.12)' : '0 2px 8px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease',
        display: 'flex', flexDirection: 'column',
        alignSelf: 'flex-start',
      }}
    >
      {/* ── FOTO ── */}
      <div style={{ position: 'relative', height: '180px', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {vehiculo.imagenes?.[fotoActiva]
          ? <img src={vehiculo.imagenes[fotoActiva]} alt={vehiculo.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (
            <svg width="40" height="40" fill="none" stroke="#1e3a8a" strokeWidth="1.5" viewBox="0 0 24 24" style={{ opacity: 0.4 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          )
        }
        <span style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '9999px', background: vehiculo.disponible ? '#ecfdf5' : '#fef2f2', color: vehiculo.disponible ? '#059669' : '#dc2626' }}>
          {vehiculo.disponible ? '● Disponible' : '● No disponible'}
        </span>
        <button
          onClick={e => { e.stopPropagation(); onFavorito() }}
          style={{ position: 'absolute', top: '10px', right: '10px', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
        >
          <svg width="20" height="20" fill={esFavorito ? '#ef4444' : 'none'} stroke={esFavorito ? '#ef4444' : '#94a3b8'} strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
        {vehiculo.imagenes?.length > 1 && (
          <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
            {vehiculo.imagenes.map((_, i) => (
              <button key={i} onClick={() => setFotoActiva(i)} style={{ width: i === fotoActiva ? '18px' : '7px', height: '7px', borderRadius: '9999px', border: 'none', cursor: 'pointer', background: i === fotoActiva ? '#1e3a8a' : 'rgba(255,255,255,0.8)', padding: 0, transition: 'all 200ms' }} />
            ))}
          </div>
        )}
      </div>

      {/* ── CONTENEDOR FIJO ── */}
      <div style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>

        {/* ════ VISTA PRINCIPAL ════ */}
        <div style={{
          position: 'absolute', inset: 0, padding: '16px',
          display: 'flex', flexDirection: 'column',
          opacity: verDetalles ? 0 : 1,
          transform: verDetalles ? 'translateX(-24px)' : 'translateX(0)',
          transition: 'opacity 220ms ease, transform 220ms ease',
          pointerEvents: verDetalles ? 'none' : 'all',
        }}>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a8a', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px' }}>{vehiculo.categoria}</span>
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', lineHeight: 1.3 }}>{vehiculo.nombre}</h3>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>⚙️ {vehiculo.transmision}</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>⛽ {vehiculo.combustible}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '10px' }}>
            {estrellas.map((llena, i) => (
              <svg key={i} width="13" height="13" fill={llena ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            ))}
            <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '4px', fontWeight: 600 }}>{vehiculo.calificacion}</span>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '22px', fontWeight: 900, color: '#1e3a8a' }}>${vehiculo.precio.toLocaleString('es-CO')}</span>
            <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px' }}>/día</span>
            {dias > 0 && <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>Total: ${(vehiculo.precio * dias).toLocaleString('es-CO')}</div>}
          </div>
          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={handleReservar}
              disabled={!vehiculo.disponible}
              style={{ width: '100%', padding: '11px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, border: 'none', letterSpacing: '0.04em', textTransform: 'uppercase', cursor: vehiculo.disponible ? 'pointer' : 'not-allowed', background: vehiculo.disponible ? 'linear-gradient(90deg,#1e3a8a,#2563eb)' : '#e2e8f0', color: vehiculo.disponible ? '#fff' : '#94a3b8', boxShadow: vehiculo.disponible ? '0 4px 14px rgba(30,58,138,0.28)' : 'none', marginBottom: '8px' }}
            >
              {vehiculo.disponible ? '🚗 Reservar ahora' : 'No disponible'}
            </button>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setVerDetalles(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#1e3a8a', textDecoration: 'underline', padding: 0 }}>
                Ver detalles
              </button>
            </div>
          </div>
        </div>

        {/* ════ VISTA DETALLES ════ */}
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
            <button onClick={() => setVerDetalles(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#1e3a8a', textDecoration: 'underline', padding: 0 }}>
              Ocultar detalles
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', flexShrink: 0 }}>
            {caracteristicas.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', borderRadius: '8px', padding: '7px 8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>{c.icono}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#334155', lineHeight: 1.3 }}>{c.label}</span>
              </div>
            ))}
          </div>
          <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '8px 10px', border: '1px solid #bbf7d0', flexShrink: 0 }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>💰 Tarifas</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#334155', marginBottom: '3px' }}>
              <span>Km limitado ({vehiculo.tarifas?.kmLimitado?.km} km/día)</span>
              <span style={{ fontWeight: 800 }}>${vehiculo.tarifas?.kmLimitado?.precio?.toLocaleString('es-CO')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#334155' }}>
              <span>Km ilimitado</span>
              <span style={{ fontWeight: 800 }}>${vehiculo.tarifas?.kmIlimitado?.precio?.toLocaleString('es-CO')}</span>
            </div>
          </div>
          <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '8px 10px', border: '1px solid #bfdbfe', flexShrink: 0 }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>🛡️ Seguros</div>
            {vehiculo.seguros?.map((seg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#334155', marginBottom: i < vehiculo.seguros.length - 1 ? '4px' : 0 }}>
                <span style={{ fontWeight: 600 }}>{seg.nombre}</span>
                <span style={{ fontWeight: 800, color: '#1e3a8a', whiteSpace: 'nowrap', marginLeft: '6px' }}>
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