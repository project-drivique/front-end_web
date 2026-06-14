export default function EstadoCarga({ c }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ width: '40px', height: '40px', border: `3px solid ${c.skeletonTrack}`, borderTopColor: c.accentText, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
      <p style={{ fontSize: '14px', color: c.textSecondary, fontWeight: 600 }}>Cargando vehículos...</p>
    </div>
  )
}