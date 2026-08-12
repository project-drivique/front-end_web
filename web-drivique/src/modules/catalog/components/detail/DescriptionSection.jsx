import { useTranslation } from 'react-i18next'
import { FaAlignLeft } from 'react-icons/fa'

export default function DescriptionSection({ descripcion }) {
  const { t } = useTranslation()

  if (!descripcion) return null

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <FaAlignLeft color="#2563eb" size={14} />
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1e3a8a', margin: 0 }}>{t('vehiculo.description', 'Descripción')}</h3>
      </div>
      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
        {descripcion}
      </p>
    </div>
  )
}