import { useTranslation } from 'react-i18next'
import { FaTimes, FaCar } from 'react-icons/fa'
import ImageGallery from './ImageGallery'
import VehicleCharacteristics from './VehicleCharacteristics'
import EquipmentSection from './EquipmentSection'
import DescriptionSection from './DescriptionSection'
import BranchInfo from './BranchInfo'
import RentalRequirements from './RentalRequirements'
import ReviewsSection from './ReviewsSection'

export default function VehicleDetailsModal({ vehiculo, visible, onCerrar, c }) {
  const { t } = useTranslation()

  if (!visible || !vehiculo) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.70)',
        backdropFilter: 'blur(8px)',
        padding: 16,
        animation: 'fadeIn 200ms ease',
      }}
      onClick={onCerrar}
    >
      <div
        style={{
          background: c?.cardBg || 'var(--bg-tarjeta)',
          border: `1px solid ${c?.cardBorder || 'var(--borde)'}`,
          borderRadius: 24,
          width: '100%',
          maxWidth: 960,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 70px rgba(15,23,42,0.35)',
          overflow: 'hidden',
          animation: 'slideUp 250ms ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal (Sin botón de volver, solo cerrar) */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${c?.cardBorder || 'var(--borde)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: c?.subCardBg || 'transparent',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: c?.accentBgSoft || 'rgba(var(--brand-secondary-rgb),0.12)',
                color: c?.accentText || 'var(--brand-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              <FaCar />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: c?.textPrimary || 'inherit' }}>
                {vehiculo.nombre}
              </h3>
              <span style={{ fontSize: 12, color: c?.textSecondary || '#64748b', fontWeight: 600 }}>
                {vehiculo.categoria} · {vehiculo.año} · {vehiculo.transmision}
              </span>
            </div>
          </div>

          <button
            onClick={onCerrar}
            style={{
              background: 'transparent',
              border: 'none',
              color: c?.textSecondary || '#64748b',
              fontSize: 18,
              cursor: 'pointer',
              padding: 8,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 150ms ease',
            }}
            aria-label={t('common.close', 'Cerrar')}
          >
            <FaTimes />
          </button>
        </div>

        {/* Cuerpos del Modal Scrollable */}
        <div
          style={{
            padding: 24,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {/* Galería y Descripción */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            <ImageGallery
              imagenes={vehiculo.imagenes || []}
              nombreVehiculo={vehiculo.nombre}
              calificacion={vehiculo.comentarios?.length ? vehiculo.calificacion : 0}
              c={c}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <DescriptionSection descripcion={vehiculo.descripcion} id={vehiculo.id} c={c} />
              <VehicleCharacteristics vehiculo={vehiculo} c={c} />
            </div>
          </div>

          {/* Sucursal y Equipamiento */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            <BranchInfo sucursalInfo={vehiculo.sucursalInfo} c={c} />
            <EquipmentSection
              caracteristicas={vehiculo.caracteristicas}
              equipamiento={vehiculo.equipamientoTecnologico}
              c={c}
            />
          </div>

          {/* Requisitos y Reseñas */}
          <RentalRequirements c={c} />

          {vehiculo.comentarios && vehiculo.comentarios.length > 0 && (
            <div style={{ borderTop: `1px solid ${c?.cardBorder || 'var(--borde)'}`, paddingTop: 20 }}>
              <ReviewsSection comentarios={vehiculo.comentarios} calificacion={vehiculo.calificacion} />
            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: `1px solid ${c?.cardBorder || 'var(--borde)'}`,
            display: 'flex',
            justifyContent: 'flex-end',
            background: c?.subCardBg || 'transparent',
          }}
        >
          <button
            onClick={onCerrar}
            style={{
              padding: '10px 24px',
              borderRadius: 12,
              background: c?.accentBgSoft || 'rgba(var(--brand-secondary-rgb),0.1)',
              color: c?.accentText || 'var(--brand-secondary)',
              border: `1px solid ${c?.subCardBorder || 'var(--borde)'}`,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {t('common.close', 'Cerrar')}
          </button>
        </div>
      </div>
    </div>
  )
}
