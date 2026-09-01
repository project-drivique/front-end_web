export function IconChip({ icon, label, color = 'var(--brand-primary)' }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 9,
        background: 'var(--bg-tarjeta)',
        border: '1px solid var(--borde)',
        borderRadius: 10,
        padding: '9px 12px',
        minHeight: 38,
      }}
    >
      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color,
      }}>
        {icon}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--texto-primary)', lineHeight: 1.2 }}>{label}</span>
    </div>
  )
}

export default function IconChipGrid({ items }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 8,
    }}>
      {items.map((item, i) => {
        const Icono = item.Icono
        return <IconChip key={i} icon={<Icono size={14} />} label={item.l} color={item.color} />
      })}
    </div>
  )
}