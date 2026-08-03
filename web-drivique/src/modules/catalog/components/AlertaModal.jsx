import { FaSearch, FaTimes } from 'react-icons/fa'

// Modal centrado genérico — mismo overlay oscuro + tarjeta con ícono en círculo,
// título, mensaje y botón de cierre, para cualquier alerta de "sin resultados"
// (texto libre, fechas sin disponibilidad, filtros del sidebar sin coincidencias).
export default function AlertaModal({ c, titulo, mensaje, textoBoton, onCerrar }) {
  return (
    <div
      onClick={onCerrar}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15,23,42,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '360px',
          background: c.heroCardBg,
          borderRadius: '20px',
          border: '1px solid ' + c.heroCardBorder,
          boxShadow: '0 20px 50px rgba(0,0,0,0.30)',
          padding: '28px 24px 24px',
          textAlign: 'center',
        }}
      >
        <button
          type="button"
          onClick={onCerrar}
          aria-label={textoBoton}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: c.textSecondary,
            padding: '4px',
          }}
        >
          <FaTimes size={15} />
        </button>

        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: c.accentBgSoft,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <FaSearch size={20} color={c.accentText} />
        </div>

        <p style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: c.textPrimary }}>
          {titulo}
        </p>
        <p style={{ margin: '8px 0 22px', fontSize: '13.5px', color: c.textSecondary, lineHeight: '20px' }}>
          {mensaje}
        </p>

        <button
          type="button"
          onClick={onCerrar}
          style={{
            width: '100%',
            height: '46px',
            borderRadius: '12px',
            background: c.accentGradient,
            color: '#fff',
            fontWeight: 800,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(30,58,138,0.25)',
          }}
        >
          {textoBoton}
        </button>
      </div>
    </div>
  )
}