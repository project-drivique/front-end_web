import { useTranslation } from 'react-i18next'

function SpecItem({ icon: Icono, label, value, showIcon = true, c }) {
  const textSecond = c?.textSecondary || 'var(--texto-second)'
  const textPrimary = c?.textPrimary || 'var(--texto-primary)'
  const accent = c?.accentText || '#2563eb'

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: showIcon ? 10 : 0 }}>
      {showIcon && Icono && (
        <span style={{ color: accent, marginTop: 2, flexShrink: 0 }}>
          <Icono size={16} />
        </span>
      )}
      <div>
        <p style={{ fontSize: 12, color: textSecond, margin: '0 0 2px', fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: 14, color: textPrimary, margin: 0, fontWeight: 700 }}>{value}</p>
      </div>
    </div>
  )
}

export default function SpecsGrid({ items, showIcon = true, compact = false, c }) {
  const { t } = useTranslation() // If needed inside

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', rowGap: compact ? 12 : 20, columnGap: 16 }}>
      {items.map((it, i) => <SpecItem key={i} icon={it.Icono} label={it.label} value={it.value} showIcon={showIcon} c={c} />)}
    </div>
  )
}