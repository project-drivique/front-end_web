import { useTranslation } from 'react-i18next'
import { FaBuilding, FaCar, FaClipboardList, FaFileContract, FaShieldAlt, FaSignOutAlt, FaUsers } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { accessAuditService } from '../../../services/accessAuditService'
import accessConfig from '../../../mocks/adminAccessConfig.json'
import { ROLES } from '../../auth/utils/accessControl'

const ADMIN_TOOLS = [
  ['vehicles', FaCar], ['users', FaUsers], ['reservations', FaClipboardList],
  ['contracts', FaFileContract], ['branches', FaBuilding], ['audit', FaShieldAlt],
]

export default function ManagementDashboard({ branchOnly = false }) {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const usuario = useAuthStore((state) => state.usuario)
  const logout = useAuthStore((state) => state.logout)
  const dark = tema === 'oscuro'
  const roleKey = branchOnly ? ROLES.BRANCH_MANAGER : ROLES.ADMIN
  const enabledModules = accessConfig.dashboardModules[roleKey] || []
  const tools = ADMIN_TOOLS.filter(([key]) => enabledModules.includes(key))
  const audits = branchOnly ? [] : accessAuditService.list().slice(0, 6)
  const colors = {
    bg: dark ? '#07111f' : '#f4f7fc', card: dark ? '#111c2e' : '#fff',
    text: dark ? '#f8fafc' : '#0f172a', muted: dark ? '#94a3b8' : '#64748b',
    border: dark ? '#24324a' : '#e2e8f0', soft: dark ? '#172554' : '#eff6ff',
  }

  const closeSession = () => {
    logout()
    localStorage.removeItem('last_path')
    window.location.assign('/login')
  }

  return (
    <main style={{ minHeight: '100vh', background: colors.bg, color: colors.text, padding: 'clamp(20px, 4vw, 48px)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div>
            <p style={{ margin: '0 0 6px', color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, fontSize: 12 }}>
              {branchOnly ? t('admin.branchRole') : t('admin.adminRole')}
            </p>
            <h1 style={{ margin: 0, fontSize: 'clamp(26px, 4vw, 40px)' }}>{branchOnly ? t('admin.branchTitle') : t('admin.title')}</h1>
            <p style={{ color: colors.muted, marginBottom: 0 }}>{t('admin.welcome', { name: usuario?.nombre || usuario?.correo })}</p>
          </div>
          <button type="button" onClick={closeSession} style={{ border: `1px solid ${colors.border}`, background: colors.card, color: colors.text, borderRadius: 12, padding: '11px 16px', display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontWeight: 700 }}>
            <FaSignOutAlt /> {t('admin.logout')}
          </button>
        </header>

        {branchOnly && <section style={{ background: colors.soft, border: '1px solid #bfdbfe', borderRadius: 16, padding: 18, marginBottom: 24 }}>
          <strong>{t('admin.assignedBranch')}:</strong> {usuario?.sucursalId}
        </section>}

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
          {tools.map(([key, Icon]) => <article key={key} style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 18, padding: 22, boxShadow: dark ? 'none' : '0 12px 30px rgba(15,23,42,.06)' }}>
            <div style={{ width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: 12, background: colors.soft, color: '#2563eb', marginBottom: 18 }}><Icon /></div>
            <h2 style={{ fontSize: 17, margin: 0 }}>{t(`admin.${key}`)}</h2>
            <p style={{ color: colors.muted, fontSize: 13, marginBottom: 0 }}>{t('admin.moduleAvailable')}</p>
          </article>)}
        </section>

        {!branchOnly && <section style={{ marginTop: 28, background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 18, padding: 22, overflowX: 'auto' }}>
          <h2 style={{ marginTop: 0 }}>{t('admin.recentAccess')}</h2>
          {audits.length === 0 ? <p style={{ color: colors.muted }}>{t('admin.noAudit')}</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 650 }}>
              <thead><tr>{['date', 'email', 'role', 'result', 'ip'].map((key) => <th key={key} style={{ textAlign: 'left', padding: 10, color: colors.muted, borderBottom: `1px solid ${colors.border}`, fontSize: 12 }}>{t(`admin.auditColumns.${key}`)}</th>)}</tr></thead>
              <tbody>{audits.map((record) => <tr key={record.id}>
                <td style={{ padding: 10 }}>{new Date(record.fecha).toLocaleString()}</td><td style={{ padding: 10 }}>{record.correo}</td><td style={{ padding: 10 }}>{record.rol}</td><td style={{ padding: 10 }}>{record.resultado}</td><td style={{ padding: 10 }}>{record.ip}</td>
              </tr>)}</tbody>
            </table>
          )}
        </section>}
      </div>
    </main>
  )
}
