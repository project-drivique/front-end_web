import { useState, useEffect } from 'react'
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
  FaSlidersH,
  FaStar,
  FaIdCard,
} from 'react-icons/fa'
import { useAuthStore } from '../../../store/authStore'
import accessConfig from '../../../mocks/adminAccessConfig.json'
import { ROLES } from '../../auth/utils/accessControl'
import logo from '../../../assets/logo.png'
import { useBrand } from '../../../contexts/BrandContext'
import './ManagementDashboard.css'

const MODULE_ICONS = {
  dashboard: FaChartPie,
  controlPanel: FaSlidersH,
  vehicles: FaCar,
  users: FaUsers,
  roles: FaUserShield,
  reservations: FaClipboardList,
  cashCollection: FaCashRegister,
  contracts: FaFileContract,
  incidents: FaExclamationTriangle,
  documents: FaIdCard,
  reviews: FaStar,
  cities: FaCity,
  branches: FaBuilding,
  promotions: FaTags,
  brand: FaPalette,
  reports: FaFileAlt,
  audit: FaShieldAlt,
}

const NAV_LABELS = {
  dashboard: 'Dashboard',
  vehicles: 'Gestión de Flotas',
  users: 'Usuarios',
  roles: 'Roles y Permisos',
  reservations: 'Reservas',
  cashCollection: 'Pagos',
  contracts: 'Contratos',
  incidents: 'Incidencias',
  documents: 'Validación de Documentos',
  reviews: 'Reseñas y Calificaciones',
  cities: 'Ciudades',
  branches: 'Sucursales',
  promotions: 'Promociones',
  brand: 'Marca',
  reports: 'Reportes',
  audit: 'Auditoría',
}

export default function ManagementSidebar({ branchOnly = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('drivique_sidebar_collapsed') === 'true'
  })
  const { t } = useTranslation()
  const navigate = useNavigate()
  const usuario = useAuthStore((state) => state.usuario)
  const { brand } = useBrand()
  const logout = useAuthStore((state) => state.logout)

  const isBranchManager = branchOnly || usuario?.rol === ROLES.BRANCH_MANAGER || usuario?.rol === 'encargado' || usuario?.rol === 'encargado_sucursal'
  const roleKey = isBranchManager ? ROLES.BRANCH_MANAGER : ROLES.ADMIN
  const navigation = accessConfig.dashboardNavigation[roleKey] || []

  // Sincronizar clase en el shell principal cuando cambia el estado de colapso
  useEffect(() => {
    const shell = document.querySelector('.management-shell')
    if (shell) {
      if (isCollapsed) {
        shell.classList.add('has-collapsed-sidebar')
      } else {
        shell.classList.remove('has-collapsed-sidebar')
      }
    }
  }, [isCollapsed])

  const toggleCollapse = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    localStorage.setItem('drivique_sidebar_collapsed', String(next))
    const shell = document.querySelector('.management-shell')
    if (shell) {
      if (next) {
        shell.classList.add('has-collapsed-sidebar')
      } else {
        shell.classList.remove('has-collapsed-sidebar')
      }
    }
  }

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
              height: 26,
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

      <aside className={`management-sidebar ${isOpen ? 'is-open' : ''} ${isCollapsed ? 'is-collapsed' : ''}`}>
        <div className="management-brand">
          <Link to={isBranchManager ? '/encargado' : '/admin'} className="management-brand__link" title={brandName}>
            <img 
              src={brandLogo} 
              alt={brandName} 
              className="management-brand__logo"
              style={{
                height: 32,
                maxHeight: 32,
                width: 'auto',
                objectFit: 'contain',
                filter: brand?.logoDataUrl ? 'none' : 'brightness(0) invert(1)',
              }}
            />
            {!isCollapsed && (
              <div className="management-brand__text">
                <strong className="management-brand__title">{brandName}</strong>
                <small className="management-brand__subtitle">{t('admin.management', 'Gestión')}</small>
              </div>
            )}
          </Link>

          <button
            type="button"
            className="management-collapse-btn"
            onClick={toggleCollapse}
            title={isCollapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
            aria-label={isCollapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
          >
            <FaBars />
          </button>
        </div>

      <nav className="management-nav" aria-label={t('admin.navigation', 'Navegación')}>
        {navigation.map(({ key, route, section }, index) => {
          const Icon = MODULE_ICONS[key] || FaChartPie
          const labelFallback = NAV_LABELS[key] || key
          const showSectionHeader = section && (index === 0 || navigation[index - 1]?.section !== section)
          return (
            <div key={key} className="management-nav__group">
              {showSectionHeader && (
                <div className="management-nav__section-title">
                  {section}
                </div>
              )}
              <NavLink
                to={route}
                end={key === 'dashboard'}
                title={t(`admin.nav.${key}`, labelFallback)}
                className={({ isActive }) => `management-nav__item ${isActive ? 'is-active' : ''}`}
              >
                <Icon aria-hidden="true" />
                <span>{t(`admin.nav.${key}`, labelFallback)}</span>
              </NavLink>
            </div>
          )
        })}
      </nav>

      <button type="button" className="management-logout" onClick={closeSession} title={t('admin.logout', 'Cerrar sesión')}>
        <FaSignOutAlt /> <span>{t('admin.logout', 'Cerrar sesión')}</span>
      </button>
    </aside>
    </>
  )
}
