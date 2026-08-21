import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';

export default function GaleriaImagenes({ imagenes = [], nombreVehiculo = 'Vehículo', calificacion = 0, compact = false, stretchThumbnails = false }) {
  const { t } = useTranslation()
  const [indiceActivo, setIndiceActivo] = useState(0);

  if (!imagenes || imagenes.length === 0) {
    return (
      <div style={{
        background: 'var(--bg-item)', border: '1px solid var(--borde)', borderRadius: 14,
        height: compact ? 180 : 240, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ color: 'var(--texto-second)', fontSize: 14 }}>{t('vehiculo.noImages', 'Sin imágenes')}</p>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 10 : 16, height: stretchThumbnails ? '100%' : 'auto', justifyContent: stretchThumbnails ? 'space-between' : 'flex-start' }}>
      {/* Imagen Principal */}
      <div style={{
        width: '100%',
        aspectRatio: compact ? '1.6 / 1' : '1.7 / 1',
        maxHeight: compact ? 290 : 380,
        borderRadius: 16,
        overflow: 'hidden',
        background: '#e2e8f0',
        position: 'relative',
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
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.65)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                transition: 'all 150ms ease',
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.88)'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.65)'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
              }}
            >
              <FaChevronLeft size={14} />
            </button>

            <button
              type="button"
              onClick={siguienteImagen}
              aria-label={t('vehiculo.nextImage', 'Imagen siguiente')}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.65)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                transition: 'all 150ms ease',
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.88)'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.65)'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
              }}
            >
              <FaChevronRight size={14} />
            </button>
          </>
        )}

        {/* Calificación (Top Right) */}
        <div style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(30, 41, 59, 0.7)', color: '#fff',
          padding: '6px 12px', borderRadius: 20,
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 700,
          backdropFilter: 'blur(8px)',
        }}>
          <FaStar color={calificacion > 0 ? "#f59e0b" : "#e2e8f0"} size={12} />
          {calificacion > 0 ? calificacion.toFixed(1) : t('catalog.gallery.new', 'Nuevo')}
        </div>


      </div>

      {/* Miniaturas (Thumbnails) */}
      <div style={{ display: 'flex', gap: compact ? 8 : 12, maxWidth: compact ? 360 : 'none' }}>
        {imagenes.map((imgSrc, idx) => (
          <div
            key={idx}
            onClick={() => setIndiceActivo(idx)}
            style={{
              flex: 1, height: compact ? 80 : 64, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
              border: indiceActivo === idx ? '2px solid #2563eb' : '2px solid transparent',
              transition: 'border-color 0.2s', opacity: indiceActivo === idx ? 1 : 0.7
            }}
          >
            <img src={imgSrc} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
