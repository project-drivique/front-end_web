import { useTranslation } from 'react-i18next'

export default function DescriptionSection({ descripcion }) {
  const { t } = useTranslation()

  if (!descripcion) return null

  return (
    <div style={{ background: 'var(--bg-tarjeta)', border: '1px solid var(--borde)', borderRadius: 14, padding: '18px 20px' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--texto-second)', margin: '0 0 10px' }}>
        {t('vehiculo.description')}
      </p>
      <p style={{ fontSize: 14, color: 'var(--texto-primary)', margin: 0, lineHeight: 1.7 }}>
        {descripcion}
      </p>
    </div>
  )
}