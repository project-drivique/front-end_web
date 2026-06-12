import { Link } from 'react-router-dom'
import logo from '@/assets/logo/logo.png'

function inicial(nombre = '') {
  const texto = nombre.trim()
  if (!texto) return 'U'
  return texto.split(' ')[0]?.[0]?.toUpperCase() ?? 'U'
}

export default function HeaderCatalogo({ c, usuario, withLinks = false }) {
  const nombre = usuario?.nombre || usuario?.correo || ''
  const letra = inicial(nombre)

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      height: '68px',
      background: c.navBg,
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${c.navBorder}`,
      boxShadow: c.navShadow
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: '18px' }}>
        <Link to="/"><img src={logo} alt="RentaMovil" style={{ height: '40px' }} /></Link>

        {withLinks && (
          <>
            <Link to="/sucursales" style={{ fontSize: '13px', color: c.navText, textDecoration: 'none', fontWeight: 600 }}>Sucursales</Link>
            <Link to="/reservas" style={{ fontSize: '13px', color: c.navText, textDecoration: 'none', fontWeight: 600 }}>Mis reservas</Link>
          </>
        )}

        <div style={{ flex: 1 }} />

        {usuario && (
          <span style={{ fontSize: '13px', color: c.navText, fontWeight: 600 }}>
            Hola, {nombre}
          </span>
        )}

        {withLinks ? (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: c.accentText,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '14px'
          }}>
            {letra}
          </div>
        ) : (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: c.accentText,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '14px'
          }}>
            {letra}
          </div>
        )}
      </div>
    </nav>
  )
}