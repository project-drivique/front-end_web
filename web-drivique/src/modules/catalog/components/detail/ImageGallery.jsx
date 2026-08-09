import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function GaleriaImagenes({ imagenes = [], nombreVehiculo = 'Vehículo' }) {
  const { t } = useTranslation()
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

  const total = imagenes.length;
  const irAnterior = () => setIndiceActivo(i => (i - 1 + total) % total);
  const irSiguiente = () => setIndiceActivo(i => (i + 1) % total);
  const imagenPrincipal = imagenes[indiceActivo];

  return (
    <div style={{
      width: '100%',
      aspectRatio: '4 / 3',
      maxHeight: 300,
      borderRadius: 14,
      overflow: 'hidden',
      background: '#e2e8f0',
      border: '1px solid var(--borde)',
      position: 'relative',
    }}>
      <img
        key={indiceActivo}
        src={imagenPrincipal}
        alt={nombreVehiculo}
        loading="eager"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
      />

      {total > 1 && (
        <>
          <button
            onClick={irAnterior}
            aria-label="Anterior"
            style={{
              position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)',
              width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'rgba(15,23,42,0.55)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <FaChevronLeft size={12} />
          </button>
          <button
            onClick={irSiguiente}
            aria-label="Siguiente"
            style={{
              position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)',
              width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'rgba(15,23,42,0.55)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <FaChevronRight size={12} />
          </button>
        </>
      )}
    </div>
  );
}