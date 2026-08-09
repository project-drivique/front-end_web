import { useTranslation } from 'react-i18next'
import { FaAlignLeft } from 'react-icons/fa'
import DetailSection from './DetailSection'

export default function DescriptionSection({ descripcion }) {
  const { t } = useTranslation()

  if (!descripcion) return null

  return (
    <DetailSection icon={<FaAlignLeft size={12} />} title={t('vehiculo.description')}>
      <p style={{ fontSize: 14, color: 'var(--texto-primary)', margin: 0, lineHeight: 1.7 }}>
        {descripcion}
      </p>
    </DetailSection>
  )
}