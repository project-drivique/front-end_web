import { FaTimes, FaClock, FaDirections, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa'
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

  // Google Maps search query and embed URL
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion || nombre)}`
  const mapEmbedUrl = direccion
    ? `https://maps.google.com/maps?q=${encodeURIComponent(direccion)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : ''

  const cardBg = c?.cardBg || 'var(--bg-tarjeta, #ffffff)'
  const footerBg = c?.subCardBg || 'var(--bg-item, #ffffff)'
  const borderColor = c?.cardBorder || 'var(--borde, #e2e8f0)'
  const titleColor = c?.accentText || c?.titleColor || 'var(--brand-secondary, #1e3a8a)'
  const textPrimary = c?.textPrimary || 'var(--texto-primary, #0f172a)'
  const textSecondary = c?.textSecondary || 'var(--texto-second, #64748b)'

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(8px, 2vw, 20px)',
        boxSizing: 'border-box',
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          background: cardBg,
          width: '100%',
          maxWidth: '520px',
          maxHeight: '92vh',
          borderRadius: '18px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          border: `1px solid ${borderColor}`,
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 22px)', borderBottom: `1px solid ${borderColor}` }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(15px, 2.2vw, 17px)', fontWeight: 800, color: titleColor, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaDirections size={17} /> {t('vehiculo.howToGetThere', 'Cómo llegar')}
          </h2>
          <button
            onClick={onClose}
            aria-label={t('common.close', 'Cerrar')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: '50%', padding: 0
            }}
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 'clamp(12px, 2vw, 18px) clamp(14px, 2.5vw, 22px)', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 14.5, fontWeight: 700, color: textPrimary, margin: '0 0 6px' }}>
              {nombre}
            </p>
            {direccion && (
              <p style={{ fontSize: 13, color: textSecondary, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaMapMarkerAlt size={13} color="#94a3b8" />
                <span>{direccion}</span>
              </p>
            )}
            {horario && (
              <p style={{ fontSize: 13, color: textSecondary, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaClock size={13} color="#94a3b8" />
                <span>{horarioTraducido}</span>
              </p>
            )}
          </div>

          {mapEmbedUrl && (
            <div style={{ position: 'relative', width: '100%', height: 'clamp(200px, 32vh, 280px)', borderRadius: '14px', overflow: 'hidden', border: `1px solid ${borderColor}`, background: '#f8fafc' }}>
              {/* Floating button on top of map */}
              <a
                href={mapSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  zIndex: 10,
                  background: '#ffffff',
                  color: 'var(--brand-secondary, #2563eb)',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '6px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <span>{t('vehiculo.openInMaps', 'Abrir en Maps')}</span>
                <FaExternalLinkAlt size={10} />
              </a>

              <iframe
                title={t('vehiculo.branchMap', 'Mapa de la sucursal')}
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
        <div style={{ padding: 'clamp(10px, 1.5vw, 14px) clamp(14px, 2.5vw, 22px)', borderTop: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'var(--brand-gradient, #2563eb)',
              color: 'var(--brand-on-primary, #ffffff)',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 22px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
