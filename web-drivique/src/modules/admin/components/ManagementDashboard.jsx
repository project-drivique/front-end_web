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
          <div>
            <p className="management-eyebrow">
              {branchOnly ? t('admin.branchRole', 'Encargado de Sucursal') : t('admin.adminRole', 'Administrador Principal')}
            </p>
            <h1>{t('admin.dashboardTitle', 'Panel de Control y Gestión')}</h1>
            <p>
              {branchOnly
                ? t('admin.branchScope', { branch: summary.branch, defaultValue: `Vista operativa asignada a la sucursal ${summary.branch}` })
                : t('admin.globalScope', 'Vista global de todas las sucursales y flota de vehículos en Colombia.')}
            </p>
          </div>
          <div className="management-header__actions">
            <MenuConfiguracion />
            <div className="management-user">
              <span>{(usuario?.nombre || usuario?.correo || 'U').charAt(0).toUpperCase()}</span>
              <div>
                <strong>{usuario?.nombre || usuario?.correo}</strong>
                <small>{branchOnly ? t('admin.branchRole', 'Encargado de Sucursal') : t('admin.adminRole', 'Administrador Principal')}</small>
              </div>
            </div>
          </div>
        </header>

        <section className="management-kpis" aria-label={t('admin.businessSummary', 'Resumen del Negocio')}>
          {metrics.map(({ key, value }) => {
            const Icon = KPI_ICONS[key]
            const hints = {
              monthlyRevenue: 'Facturación mensual acumulada',
              rentedVehicles: 'Unidades actualmente en ruta',
              availableVehicles: 'Listos para entrega inmediata',
              todayDeliveries: 'Programadas para la fecha',
            }
            const labels = {
              monthlyRevenue: 'Ingresos Estimados',
              rentedVehicles: 'Vehículos Alquilados',
              availableVehicles: 'Vehículos Disponibles',
              todayDeliveries: 'Entregas de Hoy',
            }
            return (
              <article key={key} className={`management-kpi management-kpi--${key}`}>
                <div className="management-kpi__icon">
                  <Icon />
                </div>
                <div>
                  <p>{t(`admin.metrics.${key}`, labels[key] || key)}</p>
                  <strong>{value}</strong>
                  <small>{t(`admin.metrics.${key}Hint`, hints[key] || '')}</small>
                </div>
              </article>
            )
          })}
        </section>

        <section className="management-overview">
          <div>
            <p className="management-eyebrow">{t('admin.operation', 'Operación del Día')}</p>
            <h2>{t('admin.todayOverview', 'Visión General de la Flota')}</h2>
          </div>
          <div className="management-overview__stats">
            <div>
              <strong>{summary.vehicleCount}</strong>
              <span>{t('admin.totalVehicles', 'Vehículos Totales')}</span>
            </div>
            <div>
              <strong>{summary.reservationCount}</strong>
              <span>{t('admin.totalReservations', 'Reservas Totales')}</span>
            </div>
          </div>
        </section>

        {!branchOnly && (
          <section className="management-audit">
            <div>
              <p className="management-eyebrow">{t('admin.audit', 'Auditoría')}</p>
              <h2>{t('admin.recentAccess', 'Registros Recientes de Auditoría y Acceso')}</h2>
            </div>
            {audits.length === 0 ? (
              <p className="management-empty">{t('admin.noAudit', 'No hay registros de auditoría recientes.')}</p>
            ) : (
              <div className="management-table-wrap">
                <table>
                  <thead>
                    <tr>
                      {['date', 'email', 'role', 'result', 'ip'].map((key) => {
                        const colLabels = { date: 'Fecha y Hora', email: 'Correo Usuario', role: 'Rol', result: 'Resultado', ip: 'Dirección IP' }
                        return <th key={key}>{t(`admin.auditColumns.${key}`, colLabels[key] || key)}</th>
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {audits.map((record) => (
                      <tr key={record.id}>
                        <td>{new Date(record.fecha).toLocaleString(i18n.language)}</td>
                        <td>{record.correo}</td>
                        <td>{record.rol}</td>
                        <td>
                          <span className={`management-result management-result--${record.resultado}`}>
                            {record.resultado}
                          </span>
                        </td>
                        <td>{record.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
