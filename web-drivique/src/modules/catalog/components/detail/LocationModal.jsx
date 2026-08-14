import { FaTimes, FaMapMarkerAlt, FaClock, FaDirections } from 'react-icons/fa'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

const SCHEDULE_MAP = {
  'Lun a sáb, 7:00 am - 7:00 pm': 'vehiculo.scheduleMonSat',
  'Lun a dom, 6:00 am - 10:00 pm': 'vehiculo.scheduleMonSun',
  'Todos los días, 6:00 am - 10:00 pm': 'vehiculo.scheduleMonSun',
}

export default function LocationModal({ visible, onClose, sucursalInfo, c }) {
  const { t } = useTranslation()
  if (!visible || !sucursalInfo) return null

  const { nombre, direccion, horario } = sucursalInfo
  const horarioTraducido = SCHEDULE_MAP[horario] ? t(SCHEDULE_MAP[horario]) : horario

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Use Google Maps embed URL
  const mapEmbedUrl = direccion
    ? `https://maps.google.com/maps?q=${encodeURIComponent(direccion)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : ''

  const cardBg = c?.cardBg || 'var(--bg-tarjeta)'
  const footerBg = c?.subCardBg || 'var(--bg-item)'
  const borderColor = c?.cardBorder || 'var(--borde)'
  const titleColor = c?.titleColor || 'var(--texto-acento)'
  const textPrimary = c?.textPrimary || 'var(--texto-primary)'
  const textSecondary = c?.textSecondary || 'var(--texto-second)'

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
          background: cardBg,
          width: '100%',
          maxWidth: '600px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          border: `1px solid ${borderColor}`,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${borderColor}` }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: titleColor, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaDirections /> {t('vehiculo.howToGetThere', 'Cómo llegar')}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: '50%', padding: 0
            }}
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: '0 0 8px' }}>
              {nombre}
            </p>
            {horario && (
              <p style={{ fontSize: 14, color: textSecondary, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaClock size={14} color="#94a3b8" /> {horarioTraducido}
              </p>
            )}
          </div>


          {mapEmbedUrl && (
            <div style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', background: footerBg }}>
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

        {/* Footer */}
        <div style={{ padding: '16px 24px', background: footerBg, borderTop: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(90deg, #1e3a8a, #2563eb)', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer'
            }}
          >
            {t('common.close', 'Cerrar')}
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
