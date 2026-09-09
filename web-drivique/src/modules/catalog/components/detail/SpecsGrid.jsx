function SpecItem({ icon: Icono, label, value, showIcon = true, c }) {
  const textSecond = c?.textSecondary || '#64748b'
  const textPrimary = c?.textPrimary || '#0f172a'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: textSecond, margin: 0, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {showIcon && Icono && <Icono size={12} color="#94a3b8" style={{ flexShrink: 0 }} />}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      </p>
      <p style={{ fontSize: 13, color: textPrimary, margin: 0, fontWeight: 600, wordBreak: 'break-word' }}>
        {value}
      </p>
    </div>
  )
}

export default function SpecsGrid({ items, showIcon = true, compact = false, c }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
        gap: compact ? '10px 12px' : '14px 16px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {items.map((it, i) => (
        <SpecItem key={i} icon={it.Icono} label={it.label} value={it.value} showIcon={showIcon} c={c} />
      ))}
    </div>
  )
}
