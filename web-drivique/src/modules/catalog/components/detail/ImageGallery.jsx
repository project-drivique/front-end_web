import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';

export default function GaleriaImagenes({ imagenes = [], nombreVehiculo = 'Vehículo', calificacion = 0, compact = false, stretchThumbnails = false, c }) {
  const { t } = useTranslation()
  const [indiceActivo, setIndiceActivo] = useState(0);

  const bg = c?.cardBg || '#ffffff'
  const border = c?.cardBorder || '#e2e8f0'

  if (!imagenes || imagenes.length === 0) {
    return (
      <div style={{
        background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: 16,
        height: compact ? 160 : 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ color: c?.textSecondary || 'var(--texto-second)', fontSize: 14 }}>{t('vehiculo.noImages', 'Sin imágenes')}</p>
      </div>
    );
  }

  const imagenPrincipal = imagenes[indiceActivo];

  const anteriorImagen = (e) => {
    e.stopPropagation()
    setIndiceActivo((prev) => (prev - 1 + imagenes.length) % imagenes.length)
  }

  const siguienteImagen = (e) => {
    e.stopPropagation()
    setIndiceActivo((prev) => (prev + 1) % imagenes.length)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? 8 : 12,
        height: stretchThumbnails ? '100%' : 'auto',
        justifyContent: stretchThumbnails ? 'space-between' : 'flex-start',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* Imagen Principal */}
      <div style={{
        width: '100%',
        aspectRatio: compact ? '1.6 / 1' : '1.7 / 1',
        minHeight: compact ? 160 : 190,
        maxHeight: compact ? 260 : 360,
        borderRadius: 14,
        overflow: 'hidden',
        background: '#e2e8f0',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <img
          key={indiceActivo}
          src={imagenPrincipal}
          alt={nombreVehiculo}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />

        {/* Botones de Navegación < > */}
        {imagenes.length > 1 && (
          <>
            <button
              type="button"
              onClick={anteriorImagen}
              aria-label={t('vehiculo.prevImage', 'Imagen anterior')}
              style={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                transition: 'all 150ms ease',
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
              }}
            >
              <FaChevronLeft size={13} />
            </button>

            <button
              type="button"
              onClick={siguienteImagen}
              aria-label={t('vehiculo.nextImage', 'Imagen siguiente')}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                transition: 'all 150ms ease',
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
              }}
            >
              <FaChevronRight size={13} />
            </button>
          </>
        )}

        {/* Calificación (Top Right) */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(15, 23, 42, 0.75)', color: '#fff',
          padding: '4px 10px', borderRadius: 20,
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 12, fontWeight: 700,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}>
          <FaStar color={calificacion > 0 ? "#f59e0b" : "#e2e8f0"} size={11} />
          {calificacion > 0 ? calificacion.toFixed(1) : t('catalog.gallery.new', 'Nuevo')}
        </div>
      </div>

      {/* Miniaturas (Thumbnails) */}
      {imagenes.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: compact ? 6 : 8,
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 2,
            scrollbarWidth: 'none',
          }}
        >
          {imagenes.map((imgSrc, idx) => (
            <div
              key={idx}
              onClick={() => setIndiceActivo(idx)}
              style={{
                flex: imagenes.length <= 4 ? '1 1 0' : '0 0 62px',
                height: compact ? 50 : 54,
                minWidth: 50,
                borderRadius: 8,
                overflow: 'hidden',
                cursor: 'pointer',
                border: indiceActivo === idx ? '2px solid var(--brand-primary, #2563eb)' : '2px solid transparent',
                transition: 'all 0.2s',
                opacity: indiceActivo === idx ? 1 : 0.65,
                boxSizing: 'border-box',
              }}
            >
              <img src={imgSrc} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
