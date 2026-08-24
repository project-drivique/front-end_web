import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaBars,
  FaBuilding,
  FaCar,
  FaChartPie,
  FaCity,
  FaClipboardList,
  FaExclamationTriangle,
  FaFileContract,
  FaShieldAlt,
  FaSignOutAlt,
  FaTimes,
  FaUsers,
  FaUserShield,
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
  cities: FaCity,
  branches: FaBuilding,
  incidents: FaExclamationTriangle,
  audit: FaShieldAlt,
}

const MODULE_FALLBACK_LABELS = {
  dashboard: 'Inicio',
  vehicles: 'Vehículos',
  users: 'Usuarios',
  roles: 'Roles y Cuentas',
  reservations: 'Reservas',
  contracts: 'Contratos',
  cities: 'Gestión de ciudades',
  branches: 'Sucursales',
  incidents: 'Incidencias',
  audit: 'Auditoría',
}

export default function ManagementSidebar({ branchOnly = false }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const usuario = useAuthStore((state) => state.usuario)
  const logout = useAuthStore((state) => state.logout)
  
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

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
      {/* Cabecera Móvil (solo visible en pantallas pequeñas) */}
      <div className="management-mobile-header">
        <div className="management-mobile-brand">
          <img src={logo} alt="Drivique" />
          <strong>DRIVIQUE</strong>
        </div>
        <button 
          className="management-hamburger" 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Alternar menú"
        >
          {isMobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Overlay para móviles */}
      {isMobileOpen && (
        <div className="management-overlay" onClick={() => setIsMobileOpen(false)}></div>
      )}

      <aside className={`management-sidebar ${isMobileOpen ? 'is-open' : ''}`}>
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
          const fallback = MODULE_FALLBACK_LABELS[key] || key
          const navLabels = {
            dashboard: 'admin.nav.dashboard',
            vehicles: 'admin.nav.vehicles',
            users: 'admin.nav.users',
            roles: 'admin.nav.roles',
            reservations: 'admin.nav.reservations',
            contracts: 'admin.nav.contracts',
            cities: 'admin.nav.cities',
            branches: 'admin.nav.branches',
            incidents: 'admin.nav.incidents',
            audit: 'admin.nav.audit',
          }
          const transKey = navLabels[key] || `admin.nav.${key}`
          const label = t(transKey, fallback)

          return (
            <NavLink
              key={key}
              to={route}
              end={key === 'dashboard'}
              className={({ isActive }) => `management-nav__item ${isActive ? 'is-active' : ''}`}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
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
