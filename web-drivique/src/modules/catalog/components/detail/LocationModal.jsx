import { FaTimes, FaMapMarkerAlt, FaClock, FaDirections } from 'react-icons/fa'
import { createPortal } from 'react-dom'

export default function LocationModal({ visible, onClose, sucursalInfo }) {
  if (!visible || !sucursalInfo) return null

  const { nombre, direccion, horario } = sucursalInfo

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Use Google Maps embed URL
  const mapEmbedUrl = direccion
    ? `https://maps.google.com/maps?q=${encodeURIComponent(direccion)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : ''

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          background: '#fff',
          width: '100%',
          maxWidth: '600px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaDirections /> Cómo llegar
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: '50%', padding: 0
            }}
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--texto-primary)', margin: '0 0 8px' }}>
              {nombre}
            </p>
            {horario && (
              <p style={{ fontSize: 14, color: 'var(--texto-second)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaClock size={14} color="#94a3b8" /> {horario}
              </p>
            )}
          </div>

          {mapEmbedUrl && (
            <div style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', background: '#e2e8f0' }}>
              <iframe
                title="Mapa de la sucursal"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={mapEmbedUrl}
              />
            </div>
          )}
        </div>

        {/* Footer (Optional) */}
        <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  )
}
