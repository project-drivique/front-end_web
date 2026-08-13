import { Link, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaUserCircle } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import logo from '@/assets/logocatalog.png'
import { showAlert } from '@/utils/swalConfig'
import './CatalogTopHeader.css'

export default function CatalogTopHeader({
  c,
  innerClassName = 'catalogo-header-inner',
  headerRef,
  mostrarVolverInicio = false,
  mostrarPerfil = false,
  modoRegistrado = false,
  children,
}) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useTranslation();

  const menuOptions = [
    { name: t('catalog.menu.catalog', 'Catálogo'), path: '/home' },
    { name: t('catalog.menu.reservations', 'Mis reservas'), path: '/reservas' },
    { name: t('catalog.menu.favorites', 'Mis favoritos'), path: '/favoritos' },
    { name: t('catalog.menu.notifications', 'Notificaciones'), path: '/notificaciones' },
    { name: t('catalog.menu.support', 'Soporte'), path: '/soporte' }
  ];

  return (
    <header
      ref={headerRef}
      className="catalogo-header"
      style={{
        background: c.navBg,
        borderBottom: `1px solid ${c.navBorder}`,
        boxShadow: c.navShadow,
      }}
    >
      <div className={innerClassName}>
        <div className="catalogo-logo-link">
          <img src={logo} alt="Drivique" className="catalogo-logo" />
          <div className="catalogo-logo-text">
            <span className="catalogo-logo-title" style={{ color: c.accentText }}>Drivique</span>
          </div>
        </div>

        {modoRegistrado && (
          <nav className="catalogo-header-nav" style={{ display: 'flex', gap: '32px', alignItems: 'center', marginLeft: 'auto', marginRight: '32px' }}>
            {menuOptions.map((option) => {
              const isActive = currentPath === option.path;
              
              return (
                <Link
                  key={option.name}
                  to={option.path}
                  style={{
                    color: isActive ? '#2563eb' : 'var(--texto-nav)',
                    fontWeight: 600,
                    fontSize: 13,
                    textDecoration: 'none',
                    position: 'relative',
                    paddingBottom: '8px',
                    whiteSpace: 'nowrap',
                    transition: 'color 150ms',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.color = '#2563eb';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.color = 'var(--texto-nav)';
                  }}
                >
                  {option.name}
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '3px',
                      background: '#2563eb',
                      borderRadius: '3px'
                    }} />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {children}

        {mostrarVolverInicio && (
          <Link
            to="/"
            className="catalogo-header-back"
            style={{
              border: `1px solid ${c.heroCardBorder}`,
              background: c.heroCardBg,
              color: c.accentText,
            }}
          >
            <FaArrowLeft size={12} />
            Volver al inicio
          </Link>
        )}

        {mostrarPerfil && (
          <Link
            to="/perfil"
            aria-label="Perfil"
            className="catalogo-header-profile"
            style={{ color: c.accentText }}
          >
            <FaUserCircle size={30} />
          </Link>
        )}
      </div>
    </header>
  )
}