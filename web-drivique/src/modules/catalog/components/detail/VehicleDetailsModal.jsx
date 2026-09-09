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
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: 'clamp(8px, 2vw, 20px)',
        animation: 'fadeIn 200ms ease',
        boxSizing: 'border-box',
      }}
      onClick={onCerrar}
    >
      <div
        style={{
          background: c?.cardBg || 'var(--bg-tarjeta, #ffffff)',
          border: `1px solid ${c?.cardBorder || 'var(--borde, #e2e8f0)'}`,
          borderRadius: 'clamp(18px, 2.5vw, 24px)',
          width: '100%',
          maxWidth: 960,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 70px rgba(15,23,42,0.35)',
          overflow: 'hidden',
          animation: 'slideUp 250ms ease',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div
          style={{
            padding: 'clamp(12px, 2vw, 18px) clamp(14px, 2.5vw, 24px)',
            borderBottom: `1px solid ${c?.cardBorder || 'var(--borde, #e2e8f0)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: c?.subCardBg || 'transparent',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: c?.accentBgSoft || 'rgba(var(--brand-secondary-rgb),0.12)',
                color: c?.accentText || 'var(--brand-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              <FaCar />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: 'clamp(15px, 2.2vw, 18px)', fontWeight: 800, color: c?.textPrimary || 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {vehiculo.nombre}
              </h3>
              <span style={{ fontSize: 12, color: c?.textSecondary || '#64748b', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                {vehiculo.categoria} · {vehiculo.año} · {vehiculo.transmision}
              </span>
            </div>
          </div>

          <button
            onClick={onCerrar}
            style={{
              background: 'rgba(241, 245, 249, 0.8)',
              border: `1px solid ${c?.cardBorder || '#cbd5e1'}`,
              color: c?.textSecondary || '#64748b',
              fontSize: 16,
              cursor: 'pointer',
              width: 34,
              height: 34,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 150ms ease',
              flexShrink: 0,
            }}
            aria-label={t('common.close', 'Cerrar')}
          >
            <FaTimes />
          </button>
        </div>

        {/* Cuerpos del Modal Scrollable */}
        <div
          style={{
            padding: 'clamp(12px, 2.5vw, 24px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(14px, 2vw, 20px)',
            WebkitOverflowScrolling: 'touch',
            boxSizing: 'border-box',
          }}
        >
          {/* Galería y Descripción */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(12px, 2vw, 20px)' }}>
            <ImageGallery
              imagenes={vehiculo.imagenes || []}
              nombreVehiculo={vehiculo.nombre}
              calificacion={vehiculo.comentarios?.length ? vehiculo.calificacion : 0}
              c={c}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <DescriptionSection descripcion={vehiculo.descripcion} id={vehiculo.id} c={c} />
              <VehicleCharacteristics vehiculo={vehiculo} c={c} />
            </div>
          </div>

          {/* Sucursal y Equipamiento */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(12px, 2vw, 20px)' }}>
            <BranchInfo sucursalInfo={vehiculo.sucursalInfo} c={c} />
            <EquipmentSection
              caracteristicas={vehiculo.caracteristicas}
              equipamiento={vehiculo.equipamientoTecnologico}
              c={c}
            />
          </div>

          {/* Requisitos */}
          <RentalRequirements c={c} />

          {/* Reseñas */}
          {vehiculo.comentarios && vehiculo.comentarios.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <ReviewsSection comentarios={vehiculo.comentarios} calificacion={vehiculo.calificacion} c={c} />
            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div
          style={{
            padding: 'clamp(10px, 1.5vw, 14px) clamp(14px, 2.5vw, 24px)',
            borderTop: `1px solid ${c?.cardBorder || 'var(--borde)'}`,
            display: 'flex',
            justifyContent: 'flex-end',
            background: c?.subCardBg || 'transparent',
            flexShrink: 0,
          }}
        >
          <button
            onClick={onCerrar}
            style={{
              padding: '8px 22px',
              borderRadius: 12,
              background: c?.accentBgSoft || 'rgba(var(--brand-secondary-rgb),0.1)',
              color: c?.accentText || 'var(--brand-secondary)',
              border: `1px solid ${c?.subCardBorder || 'var(--borde)'}`,
              fontWeight: 700,
              fontSize: 13,
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
