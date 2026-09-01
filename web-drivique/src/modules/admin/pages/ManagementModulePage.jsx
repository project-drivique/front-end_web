import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaArrowLeft } from 'react-icons/fa'
import { useAuthStore } from '../../../store/authStore'
import { useLanding } from '../../landing/LandingContext'
import { getRoleHome } from '../../auth/utils/accessControl'
import accessConfig from '../../../mocks/adminAccessConfig.json'

export default function ManagementModulePage() {
  const { moduleKey } = useParams()
  const { t } = useTranslation()
  const { tema } = useLanding()
  const role = useAuthStore((state) => state.usuario?.rol)
  const dark = tema === 'oscuro'
  const allowedModules = accessConfig.dashboardModules[role] || []
  if (!allowedModules.includes(moduleKey)) return <Navigate to={getRoleHome(role)} replace />
  return <main style={{ minHeight: '100vh', background: dark ? '#07111f' : '#f4f7fb', color: dark ? '#f8fafc' : '#0f172a', padding: 'clamp(24px,5vw,64px)' }}>
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <Link to={getRoleHome(role)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--brand-text)', textDecoration: 'none', fontWeight: 800 }}><FaArrowLeft /> {t('admin.backToDashboard')}</Link>
      <section style={{ marginTop: 28, padding: 'clamp(24px,4vw,48px)', borderRadius: 20, border: `1px solid ${dark ? '#26354d' : '#e2e8f0'}`, background: dark ? '#111c2e' : '#fff' }}>
        <p style={{ color: 'var(--brand-text)', textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 900, fontSize: 12 }}>{t('admin.management')}</p>
        <h1 style={{ margin: '6px 0 12px' }}>{t(`admin.${moduleKey}`)}</h1>
        <p style={{ color: dark ? '#94a3b8' : '#64748b' }}>{t('admin.modulePending')}</p>
      </section>
    </div>
  </main>
}
