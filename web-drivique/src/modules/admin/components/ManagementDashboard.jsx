import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaBuilding, FaCar, FaChartPie, FaCheckCircle, FaCity, FaClipboardList, FaDollarSign, FaFileContract, FaShieldAlt, FaSignOutAlt, FaUsers } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { accessAuditService } from '../../../services/accessAuditService'
import { adminDashboardService } from '../../../services/adminDashboardService'
import { formatCurrency } from '../../../utils/currencyUtils'
import accessConfig from '../../../mocks/adminAccessConfig.json'
import { ROLES } from '../../auth/utils/accessControl'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import logo from '../../../assets/logocatalog.png'
import './ManagementDashboard.css'

import ManagementSidebar from './ManagementSidebar'

const MODULE_ICONS = { dashboard: FaChartPie, vehicles: FaCar, users: FaUsers, reservations: FaClipboardList, contracts: FaFileContract, cities: FaCity, branches: FaBuilding, audit: FaShieldAlt }
const KPI_ICONS = { monthlyRevenue: FaDollarSign, rentedVehicles: FaCar, availableVehicles: FaCheckCircle, todayDeliveries: FaClipboardList }

export default function ManagementDashboard({ branchOnly = false }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { tema, moneda, tasaUSD } = useLanding()
  const usuario = useAuthStore((state) => state.usuario)
  const logout = useAuthStore((state) => state.logout)
  const [summary] = useState(() => adminDashboardService.getSummary(usuario))
  const roleKey = branchOnly ? ROLES.BRANCH_MANAGER : ROLES.ADMIN
  const navigation = accessConfig.dashboardNavigation[roleKey] || []
  const audits = branchOnly ? [] : accessAuditService.list().slice(0, 5)
  const metrics = [
    { key: 'monthlyRevenue', value: formatCurrency(summary.monthlyRevenue, moneda, tasaUSD) },
    { key: 'rentedVehicles', value: summary.rentedVehicles },
    { key: 'availableVehicles', value: summary.availableVehicles },
    { key: 'todayDeliveries', value: summary.todayDeliveries },
  ]

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={branchOnly} />

      <main className="management-main">
        <header className="management-header">
          <div><p className="management-eyebrow">{branchOnly ? t('admin.branchRole') : t('admin.adminRole')}</p><h1>{t('admin.dashboardTitle')}</h1><p>{branchOnly ? t('admin.branchScope', { branch: summary.branch }) : t('admin.globalScope')}</p></div>
          <div className="management-header__actions"><MenuConfiguracion /><div className="management-user"><span>{(usuario?.nombre || usuario?.correo || 'U').charAt(0).toUpperCase()}</span><div><strong>{usuario?.nombre || usuario?.correo}</strong><small>{branchOnly ? t('admin.branchRole') : t('admin.adminRole')}</small></div></div></div>
        </header>

        <section className="management-kpis" aria-label={t('admin.businessSummary')}>
          {metrics.map(({ key, value }) => {
            const Icon = KPI_ICONS[key]
            return <article key={key} className={`management-kpi management-kpi--${key}`}><div className="management-kpi__icon"><Icon /></div><div><p>{t(`admin.metrics.${key}`)}</p><strong>{value}</strong><small>{t(`admin.metrics.${key}Hint`)}</small></div></article>
          })}
        </section>

        <section className="management-overview"><div><p className="management-eyebrow">{t('admin.operation')}</p><h2>{t('admin.todayOverview')}</h2></div><div className="management-overview__stats"><div><strong>{summary.vehicleCount}</strong><span>{t('admin.totalVehicles')}</span></div><div><strong>{summary.reservationCount}</strong><span>{t('admin.totalReservations')}</span></div></div></section>

        {!branchOnly && <section className="management-audit"><div><p className="management-eyebrow">{t('admin.audit')}</p><h2>{t('admin.recentAccess')}</h2></div>{audits.length === 0 ? <p className="management-empty">{t('admin.noAudit')}</p> : <div className="management-table-wrap"><table><thead><tr>{['date', 'email', 'role', 'result', 'ip'].map((key) => <th key={key}>{t(`admin.auditColumns.${key}`)}</th>)}</tr></thead><tbody>{audits.map((record) => <tr key={record.id}><td>{new Date(record.fecha).toLocaleString(i18n.language)}</td><td>{record.correo}</td><td>{record.rol}</td><td><span className={`management-result management-result--${record.resultado}`}>{record.resultado}</span></td><td>{record.ip}</td></tr>)}</tbody></table></div>}</section>}
      </main>
    </div>
  )
}
