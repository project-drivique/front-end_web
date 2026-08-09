import { useTranslation } from 'react-i18next'
import { FaSearch, FaExclamationTriangle, FaCalendarAlt, FaMapMarkerAlt, FaStar } from 'react-icons/fa'
import { CATEGORIAS, TRANSMISIONES, COMBUSTIBLES, SUCURSALES, CIUDADES } from '../constants'
import DateRangeCalendar from './DateRangeCalendar'

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
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        whiteSpace: 'nowrap',
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
  invitado = false,
  onBuscarInvitado = () => {},
  showHero = true,
  soloFavoritos = false,
  setSoloFavoritos = () => {},
  mostrarFavoritos = false,
  enModal = false,
  soloBusqueda = false,
}) {
  const { t } = useTranslation()

  const catLabels = {
    'Todos': t('catalogo.allShort'),
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
    ciudad: ciudadBusqueda = '',
    sucursal: sucursalBusqueda = '',
    fechaInicio = '',
    fechaFin = '',
  } = busquedaForm

  const fmtFecha = (iso) => {
    if (!iso) return null
    const [, m, d] = iso.split('-')
    return `${d}/${m}`
  }

  return (
    <>
      {showHero && (
        <div
          style={enModal ? {
            background: 'transparent',
            padding: 0,
          } : {
            background: c.heroCardBg,
            borderRadius: '16px',
            border: `1px solid ${c.heroCardBorder}`,
            boxShadow: c.heroCardShadow,
            padding: '20px 24px',
          }}
        >
          {enModal ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ ...labelStyle, display: 'block' }}>Ciudad</label>
                  <select
                    value={ciudadBusqueda}
                    onChange={e => { setForm('ciudad', e.target.value); setForm('sucursal', '') }}
                    style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}
                  >
                    <option value="">Selecciona Ciudad</option>
                    {CIUDADES.map(ciud => (
                      <option key={ciud.id} value={ciud.nombre}>{ciud.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ ...labelStyle, display: 'block' }}>Sucursal</label>
                  <select
                    value={sucursalBusqueda}
                    onChange={e => setForm('sucursal', e.target.value)}
                    disabled={!ciudadBusqueda}
                    style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}
                  >
                    <option value="">Selecciona Sucursal</option>
                    {SUCURSALES
                      .filter(s => s.ciudad === ciudadBusqueda)
                      .map(s => <option key={s.nombre} value={s.nombre}>{s.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ ...labelStyle, display: 'block' }}>{t('vehiculo.pickupDate')}</label>
                  <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: '7px', cursor: 'default' }}>
                    <span style={{ color: c.accentText, flexShrink: 0 }}><FaCalendarAlt size={12} /></span>
                    <span style={{ color: fechaInicio ? c.textPrimary : c.textSecondary, fontWeight: fechaInicio ? 700 : 500 }}>
                      {fmtFecha(fechaInicio) || '—'}
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ ...labelStyle, display: 'block' }}>{t('vehiculo.returnDate')}</label>
                  <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: '7px', cursor: 'default' }}>
                    <span style={{ color: c.accentText, flexShrink: 0 }}><FaCalendarAlt size={12} /></span>
                    <span style={{ color: fechaFin ? c.textPrimary : c.textSecondary, fontWeight: fechaFin ? 700 : 500 }}>
                      {fmtFecha(fechaFin) || '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: '14px', background: c.panelBgSoft, border: `1px solid ${c.panelBorder}`, marginBottom: '14px' }}>
                <DateRangeCalendar fechaInicio={fechaInicio} fechaFin={fechaFin} onCambiar={setForm} />
              </div>

              <button
                type="button"
                onClick={invitado ? onBuscarInvitado : handleBuscar}
                style={{
                  width: '100%',
                  padding: '13px 20px',
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
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' }}>
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: c.accentText }}><FaMapMarkerAlt /></span>
                  Ciudad
                </label>
                <select
                  value={ciudadBusqueda}
                  onChange={e => { setForm('ciudad', e.target.value); setForm('sucursal', '') }}
                  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}
                >
                  <option value="">Selecciona Ciudad</option>
                  {CIUDADES.map(ciud => (
                    <option key={ciud.id} value={ciud.nombre}>{ciud.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: c.accentText }}><FaMapMarkerAlt /></span>
                  Sucursal
                </label>
                <select
                  value={sucursalBusqueda}
                  onChange={e => setForm('sucursal', e.target.value)}
                  disabled={!ciudadBusqueda}
                  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}
                >
                  <option value="">Selecciona Sucursal</option>
                  {SUCURSALES
                    .filter(s => s.ciudad === ciudadBusqueda)
                    .map(s => <option key={s.nombre} value={s.nombre}>{s.nombre}</option>)}
                </select>
              </div>

              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: c.accentText }}><FaCalendarAlt /></span>
                  {t('vehiculo.pickupDate')}
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={e => setForm('fechaInicio', e.target.value)}
                  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: c.accentText }}><FaCalendarAlt /></span>
                  {t('vehiculo.returnDate')}
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={e => setForm('fechaFin', e.target.value)}
                  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                />
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
          )}

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

      {!soloBusqueda && (
      <aside
        className={enModal ? 'filtros-panel-modal' : 'filtros-panel'}
        style={enModal ? {
          width: '100%',
          background: 'transparent',
          borderRadius: 0,
          border: 'none',
          boxShadow: 'none',
          padding: 0,
         position: 'relative',
        } : {                              // 👈 ESTA es la rama que se usa en desktop
          width: '280px',
          flexShrink: 0,
          background: c.panelBg,
          borderRadius: '20px',
          border: `1px solid ${c.panelBorder}`,
          boxShadow: c.panelShadow,
          padding: '22px',
          boxSizing: 'border-box',
          position: 'relative',           // 👈 CAMBIA ESTA LÍNEA
        }}
      >
        <div
          style={{
            display: enModal ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '18px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: c.textPrimary,
              margin: 0,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {t('catalogo.filters')}
          </h2>
          <button
  type="button"
  onClick={limpiar}
  style={{
    fontSize: '12px',
    color: c.accentText,
    fontWeight: 700,
    background: c.accentBgSoft,
    border: `1px solid ${c.accentBorder}`,
    borderRadius: '8px',
    cursor: 'pointer',
    padding: '6px 12px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  }}
>
  {t('catalogo.clear')}
</button>
        </div>

        {mostrarFavoritos && (
          <Seccion label={t('catalogo.favorites')} ultimo={false} c={c}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <Chip activo={soloFavoritos} onClick={() => setSoloFavoritos(!soloFavoritos)} c={c}>
                <FaStar size={11} />
                {t('catalogo.myFavorites')}
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

        <Seccion label="Ciudad" ultimo={false} c={c}>
          <select
            value={filtros.ciudad || 'Todas'}
            onChange={e => {
              setFiltro('ciudad', e.target.value)
              setFiltro('sucursal', 'Todas')
            }}
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}
          >
            <option value="Todas">Todas las ciudades</option>
            {CIUDADES.map(ciud => (
              <option key={ciud.id} value={ciud.nombre}>
                {ciud.nombre}
              </option>
            ))}
          </select>
        </Seccion>

        <Seccion label={t('catalogo.branch')} ultimo={false} c={c}>
          <select
            value={sucursal}
            onChange={e => setFiltro('sucursal', e.target.value)}
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}
          >
            <option value="Todas">{t('catalogo.allBranches')}</option>
            {SUCURSALES
              .filter(s => filtros.ciudad === 'Todas' || s.ciudad === filtros.ciudad)
              .map(s => <option key={s.nombre} value={s.nombre}>{s.nombre}</option>)}
          </select>
        </Seccion>

        <Seccion label={t('catalogo.pricePerDay')} ultimo={false} c={c}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              inputMode="numeric"
              placeholder={t('catalogo.min')}
              value={precioMin}
              onChange={e => setFiltro('precioMin', e.target.value.replace(/\D/g, ''))}
              style={{ ...inputStyle, width: '50%', boxSizing: 'border-box' }}
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder={t('catalogo.max')}
              value={precioMax}
              onChange={e => setFiltro('precioMax', e.target.value.replace(/\D/g, ''))}
              style={{ ...inputStyle, width: '50%', boxSizing: 'border-box' }}
            />
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
      )}
    </>
  )
}