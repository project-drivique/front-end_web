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
  FaPalette,
  FaFileAlt,
  FaCashRegister,
} from 'react-icons/fa'
import { useAuthStore } from '../../../store/authStore'
import accessConfig from '../../../mocks/adminAccessConfig.json'
import { ROLES } from '../../auth/utils/accessControl'
import logo from '../../../assets/logocatalog.png'
import { useBrand } from '../../../contexts/BrandContext'
import './ManagementDashboard.css'

const MODULE_ICONS = {
  dashboard: FaChartPie,
  vehicles: FaCar,
  users: FaUsers,
  roles: FaUserShield,
  reservations: FaClipboardList,
  cashCollection: FaCashRegister,
  contracts: FaFileContract,
  incidents: FaExclamationTriangle,
  cities: FaCity,
  branches: FaBuilding,
  promotions: FaTags,
  brand: FaPalette,
  reports: FaFileAlt,
  audit: FaShieldAlt,
}

const NAV_LABELS = {
  dashboard: 'Panel de Control',
  vehicles: 'Flota y Vehículos',
  users: 'Usuarios',
  roles: 'Roles y Permisos',
  reservations: 'Reservas',
  cashCollection: 'Cobro en Sucursal',
  contracts: 'Contratos',
  incidents: 'Incidencias',
  cities: 'Ciudades',
  branches: 'Sucursales',
  promotions: 'Promociones',
  brand: 'Marca',
  reports: 'Reportes',
  audit: 'Auditoría',
}

export default function ManagementSidebar({ branchOnly = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const usuario = useAuthStore((state) => state.usuario)
  const { brand } = useBrand()
  const logout = useAuthStore((state) => state.logout)

  const isBranchManager = branchOnly || usuario?.rol === ROLES.BRANCH_MANAGER || usuario?.rol === 'encargado' || usuario?.rol === 'encargado_sucursal'
  const roleKey = isBranchManager ? ROLES.BRANCH_MANAGER : ROLES.ADMIN
  const navigation = accessConfig.dashboardNavigation[roleKey] || []

  const closeSession = () => {
    logout()
    localStorage.removeItem('last_path')
    navigate('/login', { replace: true })
  }

  const brandName = brand?.name || 'Drivique'
  const brandLogo = brand?.logoDataUrl || logo

  return (
    <>
      <div className="management-mobile-topbar">
        <div className="mobile-brand">
          <img src={brandLogo} alt={brandName} />
          <strong>{brandName.toUpperCase()}</strong>
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
            <img src={brandLogo} alt={brandName} />
          </span>
        <div>
          <strong>{brandName}</strong>
          <small>{t('admin.management', 'Gestión')}</small>
        </div>
      </div>

      <nav className="management-nav" aria-label={t('admin.navigation', 'Navegación')}>
        {navigation.map(({ key, route }) => {
          const Icon = MODULE_ICONS[key] || FaChartPie
          const labelFallback = NAV_LABELS[key] || key
          return (
            <NavLink
              key={key}
              to={route}
              end={key === 'dashboard'}
              className={({ isActive }) => `management-nav__item ${isActive ? 'is-active' : ''}`}
            >
              <Icon aria-hidden="true" />
              <span>{t(`admin.nav.${key}`, labelFallback)}</span>
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
