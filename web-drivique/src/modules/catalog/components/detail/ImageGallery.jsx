import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function GaleriaImagenes({ imagenes = [], nombreVehiculo = 'Vehículo' }) {
  const { t } = useTranslation()
  const [imagenPrincipal, setImagenPrincipal] = useState(imagenes[0]);

  if (!imagenes || imagenes.length === 0) {
    return (
      <div style={{ background: 'var(--bg-tarjeta)', border: '1px solid var(--borde)', borderRadius: 16, overflow: 'hidden', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--texto-second)' }}>{t('vehiculo.noImages')}</p>
      </div>
    );
  }

  const imgsMostrar = [...imagenes];
  while (imgsMostrar.length < 3) {
    imgsMostrar.push(imagenes[0]);
  }
  const tresImagenes = imgsMostrar.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="detalle-galeria-principal" style={{
        width: '100%',
        height: 220,
        borderRadius: 14,
        overflow: 'hidden',
        background: '#e2e8f0',
        border: '1px solid var(--borde)',
        position: 'relative',
      }}>
        <img
          src={imagenPrincipal}
          alt={nombreVehiculo}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 300ms ease' }}
        />
        <span style={{ position: 'absolute', top: 10, left: 10, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 9999, background: '#ecfdf5', color: '#059669', border: '1px solid #bbf7d0' }}>
          ● {t('vehiculo.inGallery')}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {tresImagenes.map((img, index) => {
          const isSelected = imagenPrincipal === img;
          return (
            <div
              key={index}
              onClick={() => setImagenPrincipal(img)}
              style={{
                height: 56,
                borderRadius: 8,
                overflow: 'hidden',
                cursor: 'pointer',
                border: isSelected ? '2px solid #1e3a8a' : '1px solid var(--borde)',
                opacity: isSelected ? 1 : 0.65,
                transition: 'all 200ms ease',
                background: 'var(--bg-item)'
              }}
            >
              <img
                src={img}
                alt={`${nombreVehiculo} vista ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}