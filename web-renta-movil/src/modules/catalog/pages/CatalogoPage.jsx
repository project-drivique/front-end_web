import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import logo from '@/assets/logo/logo.png'

/* ─── íconos inline ─── */
const IconoCorazon = ({ lleno }) => (
  <svg width="20" height="20" fill={lleno ? '#ef4444' : 'none'} stroke={lleno ? '#ef4444' : '#94a3b8'} strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
)

const IconoFiltro = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
  </svg>
)

const IconoCarro = () => (
  <svg width="40" height="40" fill="none" stroke="#1e3a8a" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
  </svg>
)

const IconoEstrella = ({ llena }) => (
  <svg width="14" height="14" fill={llena ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
)

const VEHICULOS_MOCK = [
  { id: 1, nombre: 'Toyota Corolla 2024',  categoria: 'Sedan',     transmision: 'Automática', combustible: 'Gasolina', precio: 85000,  calificacion: 4.8, disponible: true,  imagen: null },
  { id: 2, nombre: 'Mazda CX-5 2024',      categoria: 'SUV',       transmision: 'Automática', combustible: 'Gasolina', precio: 145000, calificacion: 4.9, disponible: true,  imagen: null },
  { id: 3, nombre: 'Chevrolet Spark 2023', categoria: 'Económico', transmision: 'Manual',     combustible: 'Gasolina', precio: 60000,  calificacion: 4.5, disponible: true,  imagen: null },
  { id: 4, nombre: 'Ford Mustang GT 2023', categoria: 'Deportivo', transmision: 'Automática', combustible: 'Gasolina', precio: 220000, calificacion: 4.7, disponible: false, imagen: null },
  { id: 5, nombre: 'Toyota Prado 2024',    categoria: 'SUV',       transmision: 'Automática', combustible: 'Diesel',   precio: 180000, calificacion: 4.6, disponible: true,  imagen: null },
  { id: 6, nombre: 'Renault Sandero 2023', categoria: 'Económico', transmision: 'Manual',     combustible: 'Gasolina', precio: 55000,  calificacion: 4.3, disponible: true,  imagen: null },
  { id: 7, nombre: 'Hyundai Tucson 2024',  categoria: 'SUV',       transmision: 'Automática', combustible: 'Híbrido',  precio: 160000, calificacion: 4.8, disponible: true,  imagen: null },
  { id: 8, nombre: 'Kia Cerato 2024',      categoria: 'Sedan',     transmision: 'Automática', combustible: 'Gasolina', precio: 95000,  calificacion: 4.4, disponible: true,  imagen: null },
]

const CATEGORIAS    = ['Todos', 'Sedan', 'SUV', 'Económico', 'Deportivo']
const TRANSMISIONES = ['Todas', 'Automática', 'Manual']
const COMBUSTIBLES  = ['Todos', 'Gasolina', 'Diesel', 'Híbrido', 'Eléctrico']

export default function CatalogoPage() {
  const { usuario } = useAuthStore()
  const navigate    = useNavigate()

  const [filtros, setFiltros] = useState({
    categoria:   'Todos',
    precioMin:   '',
    precioMax:   '',
    transmision: 'Todas',
    combustible: 'Todos',
    fechaInicio: '',
    fechaFin:    '',
    orden:       'precio_asc',
  })
  const [favoritos,       setFavoritos]       = useState([])
  const [mensajeFavorito, setMensajeFavorito] = useState(false)
  const [panelFiltros,    setPanelFiltros]    = useState(false)

  const set = (campo, valor) => setFiltros(prev => ({ ...prev, [campo]: valor }))

  const resultado = VEHICULOS_MOCK
    .filter(v => {
      if (filtros.categoria !== 'Todos' && v.categoria !== filtros.categoria) return false
      if (filtros.transmision !== 'Todas' && v.transmision !== filtros.transmision) return false
      if (filtros.combustible !== 'Todos' && v.combustible !== filtros.combustible) return false
      if (filtros.precioMin && v.precio < Number(filtros.precioMin)) return false
      if (filtros.precioMax && v.precio > Number(filtros.precioMax)) return false
      return true
    })
    .sort((a, b) => {
      if (filtros.orden === 'precio_asc')   return a.precio - b.precio
      if (filtros.orden === 'precio_desc')  return b.precio - a.precio
      if (filtros.orden === 'calificacion') return b.calificacion - a.calificacion
      return 0
    })

  const handleFavorito = (id) => {
    if (!usuario) {
      setMensajeFavorito(true)
      setTimeout(() => setMensajeFavorito(false), 3000)
      return
    }
    setFavoritos(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const limpiar = () => setFiltros({
    categoria: 'Todos', precioMin: '', precioMax: '',
    transmision: 'Todas', combustible: 'Todos',
    fechaInicio: '', fechaFin: '', orden: 'precio_asc',
  })

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '10px',
    border: '1.5px solid #e2e8f0', fontSize: '13px', color: '#334155',
    background: '#fff', outline: 'none',
  }
  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        height: '68px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/"><img src={logo} alt="RentaMovil" style={{ height: '40px', flexShrink: 0 }} /></Link>
          <div style={{ flex: 1 }} />
          {usuario ? (
            <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
              Hola, {usuario.nombre?.split(' ')[0]} 👋
            </span>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login" style={{ padding: '8px 20px', borderRadius: '9999px', border: '2px solid rgba(30,58,138,0.25)', color: '#1e3a8a', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Iniciar sesión</Link>
              <Link to="/registro" style={{ padding: '8px 20px', borderRadius: '9999px', background: '#1e3a8a', color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Registrarse</Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── TOAST favorito visitante ── */}
      {mensajeFavorito && (
        <div style={{
          position: 'fixed', top: '84px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, background: '#1e3a8a', color: '#fff',
          padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
          boxShadow: '0 8px 24px rgba(30,58,138,0.30)',
        }}>
          🔒 Inicia sesión para guardar favoritos
        </div>
      )}

      <div style={{ paddingTop: '68px', flex: 1 }}>

        {/* ── CABECERA ── */}
        <div style={{ background: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)', padding: '40px 24px 32px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

            {/* ── BREADCRUMB visible ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Link
                to="/"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#1e3a8a', fontWeight: 700, textDecoration: 'none', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(30,58,138,0.08)', border: '1px solid rgba(30,58,138,0.15)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,58,138,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(30,58,138,0.08)'}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Inicio
              </Link>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>/</span>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Catálogo</span>
            </div>

            <span style={{ display: 'inline-block', fontSize: '12px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              Flota disponible
            </span>
            <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
              Catálogo de vehículos
            </h1>
            <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
              {resultado.length} vehículo{resultado.length !== 1 ? 's' : ''} encontrado{resultado.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          {/* ── PANEL FILTROS ── */}
          <aside
            className="filtros-panel"
            style={{
              width: '260px', flexShrink: 0, background: '#fff',
              borderRadius: '20px', border: '1px solid #f1f5f9',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)', padding: '24px',
              position: 'sticky', top: '88px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Filtros</h2>
              <button onClick={limpiar} style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Limpiar
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Categoría</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {CATEGORIAS.map(cat => (
                  <button key={cat} onClick={() => set('categoria', cat)} style={{
                    padding: '5px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    background: filtros.categoria === cat ? '#1e3a8a' : '#f1f5f9',
                    color:      filtros.categoria === cat ? '#fff'    : '#475569',
                    border: 'none',
                  }}>{cat}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Precio por día ($COP)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="number" placeholder="Mín" value={filtros.precioMin}
                  onChange={e => set('precioMin', e.target.value)}
                  style={{ ...inputStyle, width: '50%' }} />
                <input type="number" placeholder="Máx" value={filtros.precioMax}
                  onChange={e => set('precioMax', e.target.value)}
                  style={{ ...inputStyle, width: '50%' }} />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Transmisión</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {TRANSMISIONES.map(t => (
                  <button key={t} onClick={() => set('transmision', t)} style={{
                    padding: '5px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    background: filtros.transmision === t ? '#1e3a8a' : '#f1f5f9',
                    color:      filtros.transmision === t ? '#fff'    : '#475569',
                    border: 'none',
                  }}>{t}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Combustible</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {COMBUSTIBLES.map(c => (
                  <button key={c} onClick={() => set('combustible', c)} style={{
                    padding: '5px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    background: filtros.combustible === c ? '#1e3a8a' : '#f1f5f9',
                    color:      filtros.combustible === c ? '#fff'    : '#475569',
                    border: 'none',
                  }}>{c}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={labelStyle}>Fecha de recogida</label>
              <input type="date" value={filtros.fechaInicio}
                onChange={e => set('fechaInicio', e.target.value)}
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Fecha de devolución</label>
              <input type="date" value={filtros.fechaFin}
                onChange={e => set('fechaFin', e.target.value)}
                style={inputStyle} />
            </div>
          </aside>

          {/* ── CONTENIDO PRINCIPAL ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Ordenar por:</span>
                <select value={filtros.orden} onChange={e => set('orden', e.target.value)}
                  style={{ ...inputStyle, width: 'auto', padding: '8px 12px', cursor: 'pointer' }}>
                  <option value="precio_asc">Precio: menor a mayor</option>
                  <option value="precio_desc">Precio: mayor a menor</option>
                  <option value="calificacion">Mejor calificación</option>
                </select>
              </div>
              <button
                onClick={() => setPanelFiltros(!panelFiltros)}
                className="btn-filtros-mobile"
                style={{
                  display: 'none',
                  alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '10px',
                  background: '#1e3a8a', color: '#fff',
                  border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                }}
              >
                <IconoFiltro /> Filtros
              </button>
            </div>

            {resultado.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#eff6ff', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconoCarro />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Sin resultados</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px' }}>
                  No encontramos vehículos con los filtros seleccionados.
                </p>
                <button onClick={limpiar} style={{
                  padding: '10px 24px', borderRadius: '9999px',
                  background: '#1e3a8a', color: '#fff',
                  border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                }}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                {resultado.map(vehiculo => (
                  <TarjetaVehiculo
                    key={vehiculo.id}
                    vehiculo={vehiculo}
                    esFavorito={favoritos.includes(vehiculo.id)}
                    onFavorito={() => handleFavorito(vehiculo.id)}
                    onDetalle={() => navigate(`/catalogo/${vehiculo.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .filtros-panel { display: none !important; }
          .btn-filtros-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

function TarjetaVehiculo({ vehiculo, esFavorito, onFavorito, onDetalle }) {
  const [hover, setHover] = useState(false)
  const estrellas = Array.from({ length: 5 }, (_, i) => i < Math.round(vehiculo.calificacion))

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', borderRadius: '20px',
        border: `1.5px solid ${hover ? '#bfdbfe' : '#f1f5f9'}`,
        boxShadow: hover ? '0 8px 32px rgba(30,58,138,0.12)' : '0 2px 8px rgba(0,0,0,0.05)',
        overflow: 'hidden', cursor: 'pointer',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 200ms ease',
      }}
    >
      <div style={{ position: 'relative', height: '180px', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {vehiculo.imagen ? (
          <img src={vehiculo.imagen} alt={vehiculo.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ opacity: 0.5 }}><IconoCarro /></div>
        )}
        <span style={{
          position: 'absolute', top: '12px', left: '12px',
          fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '9999px',
          background: vehiculo.disponible ? '#ecfdf5' : '#fef2f2',
          color: vehiculo.disponible ? '#059669' : '#dc2626',
        }}>
          {vehiculo.disponible ? '● Disponible' : '● No disponible'}
        </span>
        <button
          onClick={e => { e.stopPropagation(); onFavorito() }}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          }}
        >
          <IconoCorazon lleno={esFavorito} />
        </button>
      </div>

      <div style={{ padding: '16px' }} onClick={onDetalle}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a8a', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px' }}>
            {vehiculo.categoria}
          </span>
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px', lineHeight: 1.3 }}>
          {vehiculo.nombre}
        </h3>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>⚙️ {vehiculo.transmision}</span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>⛽ {vehiculo.combustible}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px' }}>
          {estrellas.map((llena, i) => <IconoEstrella key={i} llena={llena} />)}
          <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '4px', fontWeight: 600 }}>
            {vehiculo.calificacion}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#1e3a8a' }}>
              ${vehiculo.precio.toLocaleString('es-CO')}
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px' }}>/día</span>
          </div>
          <button style={{
            padding: '8px 16px', borderRadius: '10px',
            background: vehiculo.disponible ? '#1e3a8a' : '#e2e8f0',
            color: vehiculo.disponible ? '#fff' : '#94a3b8',
            border: 'none', fontSize: '12px', fontWeight: 700,
            cursor: vehiculo.disponible ? 'pointer' : 'default',
          }}>
            {vehiculo.disponible ? 'Ver detalle' : 'No disponible'}
          </button>
        </div>
      </div>
    </div>
  )
}