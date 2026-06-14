import { FaExclamationTriangle } from 'react-icons/fa'

export default function EstadoError({ c, error, onRetry }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px', background: c.panelBg, borderRadius: '20px', border: `1px solid ${c.dangerBorder}` }}>
      <p style={{ fontSize: '16px', color: c.dangerText, fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <FaExclamationTriangle />
        {error}
      </p>
      <button type="button" onClick={onRetry} style={{ padding: '10px 24px', borderRadius: '9999px', background: c.accentText, color: '#fff', border: 'none', fontWeight: 700 }}>
        Reintentar
      </button>
    </div>
  )
}