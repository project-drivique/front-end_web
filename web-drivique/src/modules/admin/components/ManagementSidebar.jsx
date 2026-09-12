import { useState } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
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
        <Link to={isBranchManager ? '/encargado' : '/admin'} className="mobile-brand" style={{ textDecoration: 'none' }}>
          <img 
            src={brandLogo} 
            alt={brandName}
            style={{
              height: 24,
              width: 'auto',
              objectFit: 'contain',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ fontSize: 16, fontWeight: 900, color: 'var(--adm-text)', lineHeight: 1.1 }}>{brandName.toUpperCase()}</strong>
            <small style={{ fontSize: 10, fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{t('admin.management', 'Gestión')}</small>
          </div>
        </Link>
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
          <Link to={isBranchManager ? '/encargado' : '/admin'} className="management-brand__link">
            <img 
              src={brandLogo} 
              alt={brandName} 
              className="management-brand__logo"
              style={{
                filter: brand?.logoDataUrl ? 'none' : 'brightness(0) invert(1)',
              }}
            />
            <div className="management-brand__text">
              <strong className="management-brand__title">{brandName}</strong>
              <small className="management-brand__subtitle">{t('admin.management', 'Gestión')}</small>
            </div>
          </Link>
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
