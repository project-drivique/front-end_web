import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  const catLabels = {
    'Todos': t('catalogo.allCategories'),
    'Sedan': 'Sedan',
    'SUV': 'SUV',
    'Económico': t('catalogo.catEco'),
    'Deportivo': t('catalogo.catSport'),
  }

  const transLabels = {
    'Todas': t('catalogo.transAll'),
    'Automática': t('catalogo.transAuto'),
    'Manual': t('catalogo.transManual'),
  }

  const fuelLabels = {
    'Todos': t('catalogo.fuelAll'),
    'Gasolina': t('catalogo.fuelGas'),
    'Diesel': t('catalogo.fuelDiesel'),
    'Híbrido': t('catalogo.fuelHybrid'),
    'Eléctrico': t('catalogo.fuelElec'),
  }

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
                {t('catalogo.pickupPlace')}
              </label>
              <select value={lugarRecogida} onChange={e => setForm('lugarRecogida', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">{t('catalogo.selectPoint')}</option>
                {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: c.accentText }}><FaMapMarkerAlt /></span>
                {t('catalogo.returnPlace')}
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
                <option value="__mismo__">{t('catalogo.selectPoint')}</option>
                {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: c.accentText }}><FaCalendarAlt /></span>
                {t('vehiculo.pickupDate')}
              </label>
              <input type="date" value={fechaInicio} onChange={e => setForm('fechaInicio', e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: c.accentText }}><FaCalendarAlt /></span>
                {t('vehiculo.returnDate')}
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
                {t('catalogo.searchBtn')}
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
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: c.textPrimary, margin: 0 }}>{t('catalogo.filters')}</h2>
          <button
            type="button"
            onClick={limpiar}
            style={{ fontSize: '12px', color: c.accentText, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {t('catalogo.clearFilters')}
          </button>
        </div>

        {mostrarFavoritos && (
          <Seccion label={t('catalogo.favorites')} ultimo={false} c={c}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <Chip activo={soloFavoritos} onClick={() => setSoloFavoritos(!soloFavoritos)} c={c}>
                ⭐ {t('catalogo.myFavorites')}
              </Chip>
            </div>
          </Seccion>
        )}

        <Seccion label={t('catalogo.category')} ultimo={false} c={c}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {CATEGORIAS.map(cat => (
              <Chip key={cat} activo={categoria === cat} onClick={() => setFiltro('categoria', cat)} c={c}>
                {catLabels[cat] ?? cat}
              </Chip>
            ))}
          </div>
        </Seccion>

        <Seccion label={t('catalogo.branch')} ultimo={false} c={c}>
          <select value={sucursal} onChange={e => setFiltro('sucursal', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="Todas">{t('catalogo.allBranches')}</option>
            {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Seccion>

        <Seccion label={t('catalogo.pricePerDay')} ultimo={false} c={c}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" inputMode="numeric" placeholder={t('catalogo.min')} value={precioMin} onChange={e => setFiltro('precioMin', e.target.value.replace(/\D/g, ''))} style={{ ...inputStyle, width: '50%' }} />
            <input type="text" inputMode="numeric" placeholder={t('catalogo.max')} value={precioMax} onChange={e => setFiltro('precioMax', e.target.value.replace(/\D/g, ''))} style={{ ...inputStyle, width: '50%' }} />
          </div>
        </Seccion>

        <Seccion label={t('catalogo.transmission')} ultimo={false} c={c}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {TRANSMISIONES.map(tr => (
              <Chip key={tr} activo={transmision === tr} onClick={() => setFiltro('transmision', tr)} c={c}>
                {transLabels[tr] ?? tr}
              </Chip>
            ))}
          </div>
        </Seccion>

        <Seccion label={t('catalogo.fuel')} ultimo c={c}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {COMBUSTIBLES.map(item => (
              <Chip key={item} activo={combustible === item} onClick={() => setFiltro('combustible', item)} c={c}>
                {fuelLabels[item] ?? item}
              </Chip>
            ))}
          </div>
        </Seccion>
      </aside>
    </>
  )
}
