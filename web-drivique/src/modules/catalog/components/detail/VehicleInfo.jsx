export default function VehicleInfo({ vehiculo }) {
  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <span style={{
          display: 'inline-block', fontSize: 11, fontWeight: 700, color: 'var(--brand-text)',
          background: 'var(--brand-soft)', padding: '4px 10px', borderRadius: 6, marginBottom: 12,
        }}>
          {vehiculo.categoria}
        </span>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--texto-primary)', margin: 0, lineHeight: 1.2 }}>
          {vehiculo.nombre}
        </h1>
      </div>
    </div>
  );
}
