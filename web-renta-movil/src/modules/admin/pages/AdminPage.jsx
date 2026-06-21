import { useTranslation } from 'react-i18next'

export default function AdminPage() {
  const { t } = useTranslation()
  return (
    <div>
      <h1>{t('admin.title')}</h1>
    </div>
  )
}