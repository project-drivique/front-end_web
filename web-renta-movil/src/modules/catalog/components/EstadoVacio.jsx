export default function EstadoVacio({ c, onLimpiar }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px', background: c.panelBg, borderRadius: '20px', border: `1px solid ${c.panelBorder}` }}>
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: c.textPrimary, margin: '0 0 8px' }}>Sin resultados</h3>
      <p style={{ fontSize: '14px', color: c.textSecondary, margin: '0 0 20px' }}>No encontramos vehículos con los filtros seleccionados.</p>
      <button type="button" onClick={onLimpiar} style={{ padding: '10px 24px', borderRadius: '9999px', background: c.accentText, color: '#fff', border: 'none', fontWeight: 700 }}>
        Limpiar filtros
      </button>
    </div>
  )
}