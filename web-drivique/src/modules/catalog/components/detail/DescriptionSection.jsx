import { useTranslation } from 'react-i18next'
import { FaAlignLeft } from 'react-icons/fa'

export default function DescriptionSection({ descripcion, id, c }) {
  const { t } = useTranslation()

  if (!descripcion) return null
  const textoDescripcion = id ? t(`vehiculo.descriptions.${id}`, { defaultValue: descripcion }) : descripcion

  const bg = c?.cardBg || '#fff'
  const border = c?.cardBorder || '#e2e8f0'
  const titleColor = c?.titleColor || 'var(--brand-secondary)'
  const textColor = c?.textSecondary || '#64748b'

  return (
    <div style={{ background: bg, padding: 20, borderRadius: 16, border: `1px solid ${border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <FaAlignLeft color={c?.accentText || 'var(--brand-primary)'} size={14} />
        <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>{t('vehiculo.description', 'Descripción')}</h3>
      </div>
      <p style={{ fontSize: 13, color: textColor, lineHeight: 1.6, margin: 0 }}>
        {textoDescripcion}
      </p>
    </div>
  )
}