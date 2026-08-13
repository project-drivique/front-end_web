import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaChevronLeft, FaStar } from 'react-icons/fa';

export default function GaleriaImagenes({ imagenes = [], nombreVehiculo = 'Vehículo', calificacion = 0 }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [indiceActivo, setIndiceActivo] = useState(0);

  if (!imagenes || imagenes.length === 0) {
    return (
      <div style={{
        background: 'var(--bg-item)', border: '1px solid var(--borde)', borderRadius: 14,
        height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ color: 'var(--texto-second)', fontSize: 14 }}>{t('vehiculo.noImages')}</p>
      </div>
    );
  }

  const imagenPrincipal = imagenes[indiceActivo];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Imagen Principal */}
      <div style={{
        width: '100%',
        aspectRatio: '1.55 / 1',
        borderRadius: 12,
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

        {/* Indicador de número (Bottom Right) */}
        <div style={{
          position: 'absolute', bottom: 16, right: 16,
          background: 'rgba(30, 41, 59, 0.7)', color: '#fff',
          padding: '4px 12px', borderRadius: 12,
          fontSize: 12, fontWeight: 700,
          backdropFilter: 'blur(8px)',
        }}>
          {indiceActivo + 1}/{imagenes.length}
        </div>
      </div>

      {/* Miniaturas (Thumbnails) */}
      <div style={{ display: 'flex', gap: 12 }}>
        {[0, 1, 2].map((idx) => {
          const imgSrc = imagenes[idx] || imagenes[0];
          return (
            <div 
              key={idx}
              onClick={() => setIndiceActivo(idx % imagenes.length)}
              style={{
                width: 'calc(33.333% - 8px)', aspectRatio: '1.4 / 1', borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                border: indiceActivo === (idx % imagenes.length) ? '2px solid #2563eb' : '2px solid transparent',
                transition: 'border-color 0.2s', opacity: indiceActivo === (idx % imagenes.length) ? 1 : 0.7
              }}
            >
              <img src={imgSrc} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}