import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function GaleriaImagenes({ imagenes = [], nombreVehiculo = 'Vehículo' }) {
  const { t } = useTranslation()
  const [imagenPrincipal, setImagenPrincipal] = useState(imagenes[0]);

  if (!imagenes || imagenes.length === 0) {
    return (
      <div style={{ background: 'var(--bg-tarjeta)', borderRadius: 20, overflow: 'hidden', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
      <div style={{
        width: '100%',
        height: 380,
        borderRadius: 20,
        overflow: 'hidden',
        background: '#e2e8f0',
        position: 'relative',
        boxShadow: 'var(--sombra-tarjeta)'
      }}>
        <img
          src={imagenPrincipal}
          alt={nombreVehiculo}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 300ms ease' }}
        />
        <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 9999, background: '#ecfdf5', color: '#059669', border: '1px solid #bbf7d0' }}>
          ● {t('vehiculo.inGallery')}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {tresImagenes.map((img, index) => {
          const isSelected = imagenPrincipal === img;
          return (
            <div
              key={index}
              onClick={() => setImagenPrincipal(img)}
              style={{
                height: 100,
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'pointer',
                border: isSelected ? '3px solid #1e3a8a' : '3px solid transparent',
                opacity: isSelected ? 1 : 0.6,
                transition: 'all 200ms ease',
                background: '#f1f5f9'
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
