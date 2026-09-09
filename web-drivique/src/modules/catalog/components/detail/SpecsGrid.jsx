function SpecItem({ icon: Icono, label, value, showIcon = true, c }) {
  const textSecond = c?.textSecondary || '#64748b'
  const textPrimary = c?.textPrimary || '#0f172a'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: textSecond, margin: 0, fontWeight: 500 }}>
        {showIcon && Icono && <Icono size={13} color="#8a99ad" style={{ flexShrink: 0 }} />}
        <span>{label}</span>
      </p>
      <p style={{ fontSize: 13.5, color: textPrimary, margin: 0, fontWeight: 600 }}>
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
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: compact ? '14px 16px' : '18px 20px',
        width: '100%',
      }}
    >
      {items.map((it, i) => (
        <SpecItem key={i} icon={it.Icono} label={it.label} value={it.value} showIcon={showIcon} c={c} />
      ))}
    </div>
  )
}
