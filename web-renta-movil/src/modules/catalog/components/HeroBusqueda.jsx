export default function HeroBusqueda({
  c,
  cargando,
  resultado = [],
  inputStyle,
  labelStyle,
  busquedaForm = {},
  setForm = () => {},
  errorBusqueda = '',
  handleBuscar = () => {},
  onBuscarInvitado = () => {},
  invitado = false,
}) {
  const buscar = invitado ? onBuscarInvitado : handleBuscar

  return (
    <div style={{ background: c.heroBg, padding: '28px 24px 22px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, color: c.accentText, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
              Flota disponible
            </span>
            <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, color: c.textPrimary, margin: 0 }}>
              Catálogo de vehículos
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!cargando && (
              <span style={{ fontSize: '13px', color: c.textSecondary, fontWeight: 600 }}>
                {resultado.length} vehículo{resultado.length !== 1 ? 's' : ''} encontrado{resultado.length !== 1 ? 's' : ''}
              </span>
            )}

            <a
              href="/"
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
              ← Volver al inicio
            </a>
          </div>
        </div>

        <div style={{ background: c.heroCardBg, borderRadius: '16px', border: `1px solid ${c.heroCardBorder}`, boxShadow: c.heroCardShadow, padding: '16px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '14px', alignItems: 'end' }}>
            <div>
              <label style={{ ...labelStyle, display: 'block' }}>Lugar de recogida</label>
              <select value={busquedaForm.lugarRecogida || ''} onChange={e => setForm('lugarRecogida', e.target.value)} style={inputStyle}>
                <option value="">Selecciona punto</option>
                {['Centro', 'Norte', 'Sur', 'Occidente'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'block' }}>Lugar de devolución</label>
              <select
                value={busquedaForm.mismoLugar ? '__mismo__' : (busquedaForm.lugarDevolucion || '')}
                onChange={e => {
                  if (e.target.value === '__mismo__') {
                    setForm('mismoLugar', true)
                    setForm('lugarDevolucion', '')
                  } else {
                    setForm('mismoLugar', false)
                    setForm('lugarDevolucion', e.target.value)
                  }
                }}
                style={inputStyle}
              >
                <option value="__mismo__">Selecciona punto</option>
                {['Centro', 'Norte', 'Sur', 'Occidente'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'block' }}>Fecha de recogida</label>
              <input type="date" value={busquedaForm.fechaInicio || ''} onChange={e => setForm('fechaInicio', e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'block' }}>Fecha de devolución</label>
              <input type="date" value={busquedaForm.fechaFin || ''} onChange={e => setForm('fechaFin', e.target.value)} style={inputStyle} />
            </div>

            <div>
              <button
                type="button"
                onClick={buscar}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  background: c.accentGradient,
                  color: '#fff',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(30,58,138,0.25)'
                }}
              >
                Buscar
              </button>
            </div>
          </div>

          {errorBusqueda && (
            <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '10px', background: c.dangerBg, border: `1px solid ${c.dangerBorder}` }}>
              <span style={{ fontSize: '13px', color: c.dangerText, fontWeight: 600 }}>
                {errorBusqueda}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}