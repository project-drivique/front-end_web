import { useTranslation } from 'react-i18next'

function SpecItem({ icon: Icono, label, value, showIcon = true, c }) {
  const textSecond = c?.textSecondary || 'var(--texto-second)'
  const textPrimary = c?.textPrimary || 'var(--texto-primary)'
  const accent = c?.accentText || '#2563eb'

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: textSecond, margin: '0 0 2px', fontWeight: 500 }}>
        {showIcon && Icono && <Icono size={12} color="#94a3b8" />}
        {label}
      </p>
      <p style={{ fontSize: 14, color: textPrimary, margin: 0, fontWeight: 700 }}>{value}</p>
    </div>
  )
}

export default function SpecsGrid({ items, showIcon = true, compact = false, c }) {
  const { t } = useTranslation() // If needed inside

  return (
    <div 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: compact ? 16 : 24, 
        rowGap: compact ? 24 : 32,
        flex: 1,
        alignContent: 'space-between'
      }}
    >
      {items.map((it, i) => <SpecItem key={i} icon={it.Icono} label={it.label} value={it.value} showIcon={showIcon} c={c} />)}
    </div>
  )
}