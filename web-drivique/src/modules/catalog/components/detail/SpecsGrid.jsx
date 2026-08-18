function SpecItem({ icon: Icono, label, value, showIcon = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: showIcon ? 10 : 0 }}>
      {showIcon && Icono && (
        <span style={{ color: '#2563eb', marginTop: 2, flexShrink: 0 }}>
          <Icono size={16} />
        </span>
      )}
      <div>
        <p style={{ fontSize: 12, color: 'var(--texto-second)', margin: '0 0 2px', fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: 14, color: 'var(--texto-primary)', margin: 0, fontWeight: 700 }}>{value}</p>
      </div>
    </div>
  )
}

export default function SpecsGrid({ items, showIcon = true }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', rowGap: 20, columnGap: 16 }}>
      {items.map((it, i) => <SpecItem key={i} icon={it.Icono} label={it.label} value={it.value} showIcon={showIcon} />)}
    </div>
  )
}