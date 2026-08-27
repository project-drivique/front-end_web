import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaBuilding,
  FaCar,
  FaChartPie,
  FaCity,
  FaClipboardList,
  FaFileContract,
  FaShieldAlt,
  FaSignOutAlt,
  FaUsers,
  FaUserShield,
  FaExclamationTriangle,
  FaBars,
  FaTimes,
  FaTags,
} from 'react-icons/fa'
import { useAuthStore } from '../../../store/authStore'
import accessConfig from '../../../mocks/adminAccessConfig.json'
import { ROLES } from '../../auth/utils/accessControl'
import logo from '../../../assets/logocatalog.png'
import './ManagementDashboard.css'

const MODULE_ICONS = {
  dashboard: FaChartPie,
  vehicles: FaCar,
  users: FaUsers,
  roles: FaUserShield,
  reservations: FaClipboardList,
  contracts: FaFileContract,
  incidents: FaExclamationTriangle,
  cities: FaCity,
  branches: FaBuilding,
  promotions: FaTags,
  audit: FaShieldAlt,
}

export default function ManagementSidebar({ branchOnly = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const usuario = useAuthStore((state) => state.usuario)
  const logout = useAuthStore((state) => state.logout)

  const isBranchManager = branchOnly || usuario?.rol === ROLES.BRANCH_MANAGER || usuario?.rol === 'encargado' || usuario?.rol === 'encargado_sucursal'
  const roleKey = isBranchManager ? ROLES.BRANCH_MANAGER : ROLES.ADMIN
  const navigation = accessConfig.dashboardNavigation[roleKey] || []

  const closeSession = () => {
    logout()
    localStorage.removeItem('last_path')
    navigate('/login', { replace: true })
  }

  return (
    <>
      <div className="management-mobile-topbar">
        <div className="mobile-brand">
          <img src={logo} alt="Drivique Logo" />
          <strong>DRIVIQUE</strong>
        </div>
        <button 
          className="management-mobile-btn" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {isOpen && (
        <div 
          className="management-sidebar-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`management-sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="management-brand">
          <span className="management-brand__mark">
            <img src={logo} alt="Drivique" />
          </span>
        <div>
          <strong>Drivique</strong>
          <small>{t('admin.management', 'Gestión')}</small>
        </div>
      </div>

      <nav className="management-nav" aria-label={t('admin.navigation', 'Navegación')}>
        {navigation.map(({ key, route }) => {
          const Icon = MODULE_ICONS[key] || FaChartPie
          return (
            <NavLink
              key={key}
              to={route}
              end={key === 'dashboard'}
              className={({ isActive }) => `management-nav__item ${isActive ? 'is-active' : ''}`}
            >
              <Icon aria-hidden="true" />
              <span>{t(key === 'cities' ? 'admin.cities.title' : key === 'contracts' ? 'admin.nav.contracts' : key === 'incidents' ? 'admin.incidents.title' : key === 'promotions' ? 'admin.promotions.title' : `admin.${key}`, key === 'incidents' ? 'Incidencias' : undefined)}</span>
            </NavLink>
          )
        })}
      </nav>

      <button type="button" className="management-logout" onClick={closeSession}>
        <FaSignOutAlt /> {t('admin.logout', 'Cerrar sesión')}
      </button>
    </aside>
    </>
  )
}
