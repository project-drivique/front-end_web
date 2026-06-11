import { Link } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

export default function TarjetaVehiculo({ vehiculo, esFavorito, onFavorito, c, dias = 1, invitado = false }) {
  const imagenSrc = vehiculo.imagen || (vehiculo.imagenes && vehiculo.imagenes[0]) || ''
  return (
    <div style={{
      background: c.panelBg,
      borderRadius: '18px',
      border: `1px solid ${c.cardBorder}`,
      overflow: 'hidden',
      boxShadow: c.cardShadow
    }}>
      <div style={{ position: 'relative' }}>
        <img src={imagenSrc} alt={vehiculo.nombre} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
        <button
          type="button"
          onClick={onFavorito}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            border: 'none',
            background: c.favoriteBtnBg,
            boxShadow: c.favoriteBtnShadow,
            cursor: 'pointer'
          }}
        >
          {esFavorito ? <FaHeart color={c.favoriteOn} /> : <FaRegHeart color={c.favoriteOff} />}
        </button>
      </div>

      <div style={{ padding: '14px' }}>
        <div style={{ fontSize: '12px', color: c.textSecondary, fontWeight: 700 }}>{vehiculo.categoria}</div>
        <h3 style={{ margin: '6px 0', fontSize: '16px', fontWeight: 800, color: c.textPrimary }}>{vehiculo.nombre}</h3>
        <div style={{ fontSize: '12px', color: c.textMuted, marginBottom: '10px' }}>
          {vehiculo.transmision} · {vehiculo.combustible}
        </div>

        <div style={{ fontSize: '18px', fontWeight: 900, color: c.accentText, marginBottom: '14px' }}>
          ${Number(vehiculo.precio).toLocaleString('es-CO')} <span style={{ fontSize: '12px', fontWeight: 600 }}>/día</span>
        </div>

        <button
          type="button"
          onClick={() => invitado ? alert('Debes registrarte para reservar') : null}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            background: c.accentGradient,
            color: '#fff',
            fontWeight: 800,
            cursor: 'pointer',
            marginBottom: '8px'
          }}
        >
          Reservar ahora
        </button>

        <Link to={`/catalogo/${vehiculo.id}`} style={{ display: 'block', textAlign: 'center', fontSize: '13px', color: c.accentText, fontWeight: 700, textDecoration: 'none' }}>
          Ver detalles
        </Link>
      </div>
    </div>
  )
}