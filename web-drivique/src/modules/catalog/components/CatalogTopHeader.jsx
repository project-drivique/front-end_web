import { Link, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import logo from '@/assets/logocatalog.png'
import { useBrand } from '@/contexts/BrandContext'
import MenuConfiguracion from '@/components/MenuConfiguracion'
import { useAuthStore } from '@/store/authStore'
import './CatalogTopHeader.css'

function iniciales(nombre = '', apellido = '', correo = '') {
  const n = (nombre || '').trim()[0] ?? ''
  const a = (apellido || '').trim()[0] ?? ''
  if (n || a) return (n + a).toUpperCase()
  if (correo) return (correo || '').trim()[0].toUpperCase()
  return 'U'
}

import { useNotificationStore } from '@/modules/notifications/store/useNotificationStore'

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { usuario } = useAuthStore();
  const { conteoNoLeidas } = useNotificationStore();
  const { brand } = useBrand();

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
        <Link to={modoRegistrado ? '/home' : '/catalogo'} className="catalogo-logo-link">
          <img src={brand.logoDataUrl || logo} alt={brand.name} className="catalogo-logo" />
          <span className="catalogo-logo-title" style={{ color: 'var(--brand-secondary)' }}>{brand.name}</span>
        </Link>

        {modoRegistrado && (
          <nav className="catalogo-header-nav" style={{ display: 'flex', gap: '32px', alignItems: 'center', marginLeft: 'auto', marginRight: '32px' }}>
            {menuOptions.map((option) => {
              const isActive = currentPath === option.path;
              const esNotif = option.path === '/notificaciones';
              
              return (
                <Link
                  key={option.name}
                  to={option.path}
                  style={{
                    color: isActive ? 'var(--brand-primary)' : 'var(--texto-nav)',
                    fontWeight: 600,
                    fontSize: 13,
                    textDecoration: 'none',
                    position: 'relative',
                    paddingBottom: '8px',
                    whiteSpace: 'nowrap',
                    transition: 'color 150ms',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.color = 'var(--brand-primary)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.color = 'var(--texto-nav)';
                  }}
                >
                  {option.name}
                  {esNotif && conteoNoLeidas > 0 && (
                    <span
                      style={{
                        background: '#ef4444',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        lineHeight: 1.2,
                        minWidth: '16px',
                        textAlign: 'center',
                      }}
                    >
                      {conteoNoLeidas}
                    </span>
                  )}
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '3px',
                      background: 'var(--brand-primary)',
                      borderRadius: '3px'
                    }} />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {children}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto', flexShrink: 0, position: 'relative', zIndex: 10 }}>
          <MenuConfiguracion />

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
              <span className="back-text-desktop">{t('catalogo.backToHome', 'Volver al inicio')}</span>
            </Link>
          )}

          {modoRegistrado && (
            <button
              className="catalogo-mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              style={{ color: c.accentText }}
              aria-label="Abrir menú"
            >
              <FaBars size={22} />
            </button>
          )}

          {mostrarPerfil && (
            <Link
              to="/perfil"
              aria-label="Perfil"
              className="catalogo-header-profile"
              style={{ color: c.accentText, display: 'flex', alignItems: 'center' }}
            >
              {usuario ? (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--brand-primary)',
                  color: 'var(--brand-on-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: `2px solid ${c.navBorder}`
                }}>
                  {iniciales(usuario.nombre, usuario.apellido, usuario.correo)}
                </div>
              ) : (
                <FaUserCircle size={30} />
              )}
            </Link>
          )}
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {modoRegistrado && isMobileMenuOpen && (
        <div className="catalogo-mobile-menu-overlay" style={{ background: c.navBg }}>
          <div className="catalogo-mobile-menu-header" style={{ borderBottom: `1px solid ${c.navBorder}` }}>
            <span className="catalogo-mobile-menu-title" style={{ color: c.textPrimary }}>Menú</span>
            <button
              className="catalogo-mobile-menu-close"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ color: c.textPrimary }}
              aria-label="Cerrar menú"
            >
              <FaTimes size={24} />
            </button>
          </div>
          <nav className="catalogo-mobile-menu-links">
            {menuOptions.map((option) => {
              const isActive = currentPath === option.path;
              return (
                <Link
                  key={option.name}
                  to={option.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    color: isActive ? 'var(--brand-text)' : c.textPrimary,
                    fontWeight: isActive ? 700 : 500,
                    borderBottom: `1px solid ${c.navBorder}`
                  }}
                  className="catalogo-mobile-link"
                >
                  {option.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
