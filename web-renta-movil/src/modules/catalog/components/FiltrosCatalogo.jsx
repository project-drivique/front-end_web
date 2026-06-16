import { FaSearch, FaExclamationTriangle, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa'
import { CATEGORIAS, TRANSMISIONES, COMBUSTIBLES, SUCURSALES } from '../constants'

function Seccion({ label, children, ultimo, c }) {
  return (
    <div
      style={{
        marginBottom: ultimo ? 0 : '18px',
        paddingBottom: ultimo ? 0 : '18px',
        borderBottom: ultimo ? 'none' : `1px solid ${c.panelBorder}`,
      }}
    >
      <label
        style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: 700,
          color: c.textSecondary,
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function Chip({ activo, onClick, children, c }) {
  return (
    <button
      type="button"
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
      }}
    >
      {children}
    </button>
  )
}

export default function FiltrosCatalogo({
  c,
  inputStyle,
  labelStyle,
  filtros = {},
  setFiltro = () => {},
  busquedaForm = {},
  setForm = () => {},
  errorBusqueda = '',
  handleBuscar = () => {},
  limpiar = () => {},
  busquedaRealizada = false,
  dias = 0,
  busquedaAplicada = {},
  invitado = false,
  onBuscarInvitado = () => {},
  showHero = true,
  soloFavoritos = false,
  setSoloFavoritos = () => {},
  mostrarFavoritos = false,
}) {
  const {
    categoria = 'Todos',
    precioMin = '',
    precioMax = '',
    transmision = 'Todas',
    combustible = 'Todos',
    sucursal = 'Todas',
  } = filtros

  const {
    lugarRecogida = '',
    lugarDevolucion = '',
    fechaInicio = '',
    fechaFin = '',
    mismoLugar = true,
  } = busquedaForm

  return (
    <>
      {showHero && (
        <div
          style={{
            background: c.heroCardBg,
            borderRadius: '16px',
            border: `1px solid ${c.heroCardBorder}`,
            boxShadow: c.heroCardShadow,
            padding: '20px 24px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: c.accentText }}><FaMapMarkerAlt /></span>
                Lugar de recogida
              </label>
              <select value={lugarRecogida} onChange={e => setForm('lugarRecogida', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Selecciona punto</option>
                {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: c.accentText }}><FaMapMarkerAlt /></span>
                Lugar de devolución
              </label>
              <select
                value={mismoLugar ? '__mismo__' : lugarDevolucion}
                onChange={e => {
                  if (e.target.value === '__mismo__') {
                    setForm('mismoLugar', true)
                    setForm('lugarDevolucion', '')
                  } else {
                    setForm('mismoLugar', false)
                    setForm('lugarDevolucion', e.target.value)
                  }
                }}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="__mismo__">Selecciona punto</option>
                {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: c.accentText }}><FaCalendarAlt /></span>
                Fecha de recogida
              </label>
              <input type="date" value={fechaInicio} onChange={e => setForm('fechaInicio', e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: c.accentText }}><FaCalendarAlt /></span>
                Fecha de devolución
              </label>
              <input type="date" value={fechaFin} onChange={e => setForm('fechaFin', e.target.value)} style={inputStyle} />
            </div>

            <div>
              <button
                type="button"
                onClick={invitado ? onBuscarInvitado : handleBuscar}
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
                  gap: '8px',
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
        </div>
      )}

      <aside
        className="filtros-panel"
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
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: c.textPrimary, margin: 0 }}>Filtros</h2>
          <button
            type="button"
            onClick={limpiar}
            style={{ fontSize: '12px', color: c.accentText, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Limpiar
          </button>
        </div>

        {mostrarFavoritos && (
          <div style={{ background: c.accentBgSoft, padding: '16px', borderRadius: '12px', border: `1px solid ${c.accentBorder}`, marginBottom: '16px' }}>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: c.accentText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              Filtros por favoritos
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button"
                onClick={() => setSoloFavoritos(false)} 
                style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', background: !soloFavoritos ? c.chipActiveBg : c.chipBg, color: !soloFavoritos ? c.chipActiveText : c.chipText, transition: 'all 200ms' }}
              >
                Todos
              </button>
              <button 
                type="button"
                onClick={() => setSoloFavoritos(true)} 
                style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', background: soloFavoritos ? '#ef4444' : c.chipBg, color: soloFavoritos ? '#fff' : c.chipText, transition: 'all 200ms', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                ⭐ Favoritos
              </button>
            </div>
          </div>
        )}

        <Seccion label="Categoría" ultimo={false} c={c}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {CATEGORIAS.map(cat => (
              <Chip key={cat} activo={categoria === cat} onClick={() => setFiltro('categoria', cat)} c={c}>
                {cat}
              </Chip>
            ))}
          </div>
        </Seccion>

        <Seccion label="Sucursal" ultimo={false} c={c}>
          <select value={sucursal} onChange={e => setFiltro('sucursal', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="Todas">Todas las sucursales</option>
            {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Seccion>

        <Seccion label="Precio por día ($COP)" ultimo={false} c={c}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" inputMode="numeric" placeholder="Min" value={precioMin} onChange={e => setFiltro('precioMin', e.target.value.replace(/\D/g, ''))} style={{ ...inputStyle, width: '50%' }} />
            <input type="text" inputMode="numeric" placeholder="Máx" value={precioMax} onChange={e => setFiltro('precioMax', e.target.value.replace(/\D/g, ''))} style={{ ...inputStyle, width: '50%' }} />
          </div>
        </Seccion>

        <Seccion label="Transmisión" ultimo={false} c={c}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {TRANSMISIONES.map(t => (
              <Chip key={t} activo={transmision === t} onClick={() => setFiltro('transmision', t)} c={c}>
                {t}
              </Chip>
            ))}
          </div>
        </Seccion>

        <Seccion label="Combustible" ultimo c={c}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {COMBUSTIBLES.map(item => (
              <Chip key={item} activo={combustible === item} onClick={() => setFiltro('combustible', item)} c={c}>
                {item}
              </Chip>
            ))}
          </div>
        </Seccion>
      </aside>
    </>
  )
}