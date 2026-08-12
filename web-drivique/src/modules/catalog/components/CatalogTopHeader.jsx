import { Link } from 'react-router-dom'
import { FaArrowLeft, FaUserCircle } from 'react-icons/fa'
import logo from '@/assets/logocatalog.png'
import './CatalogTopHeader.css'

export default function CatalogTopHeader({
  c,
  innerClassName = 'catalogo-header-inner',
  headerRef,
  mostrarVolverInicio = false,
  mostrarPerfil = false,
  children,
}) {
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