import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaTimes, FaCar } from 'react-icons/fa'
import { useAuthStore } from '../../../store/authStore'
import { useLanding } from '../../landing/LandingContext'
import { promotionManagementService } from '../../../services/promotionManagementService'
import { formatCurrency } from '@/utils/currencyUtils'
import { vehicleManagementService } from '../../../services/vehicleManagementService'
import VEHICULOS_MOCK from '@/mocks/vehicles.json'

import ImageGallery from './detail/ImageGallery'
import VehicleCharacteristics from './detail/VehicleCharacteristics'
import EquipmentSection from './detail/EquipmentSection'
import DescriptionSection from './detail/DescriptionSection'
import PricingSection from './detail/PricingSection'
import BranchInfo from './detail/BranchInfo'
import RentalRequirements from './detail/RentalRequirements'
import PicoYPlacaCard from './detail/PicoYPlacaCard'
import ReviewsSection from './detail/ReviewsSection'
import GuestReserveModal from './GuestReserveModal'

import './VehicleDetailsModal.css'
import '../pages/CatalogPage.css'
import '../pages/VehicleDetailsPage.css'

export default function VehicleDetailsModal({
  isOpen,
  onClose,
  vehiculoId,
  vehiculo: vehiculoProp,
  descuentoParam,
  promoCode,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const usuario = useAuthStore((s) => s.usuario)
  const esAutenticado = Boolean(token && usuario)
  const { tema, moneda } = useLanding()
  const esModoOscuro = tema === 'oscuro'

  const [bannerVisible, setBannerVisible] = useState(false)

  // Manejo de tecla ESC para cerrar el modal
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const targetId = vehiculoId || vehiculoProp?.id

  const baseVehiculo = useMemo(() => {
    if (vehiculoProp) return vehiculoProp
    if (!targetId) return null
    return vehicleManagementService.getById(targetId) || VEHICULOS_MOCK.find((v) => Number(v.id) === Number(targetId))
  }, [targetId, vehiculoProp])

  const vehiculo = useMemo(() => {
    if (!baseVehiculo) return null
    return {
      ...baseVehiculo,
      caracteristicas: baseVehiculo.caracteristicas || [],
      equipamientoTecnologico: baseVehiculo.equipamientoTecnologico || [],
      seguros: baseVehiculo.seguros || [{ nombre: 'Protección Básica Estándar', precio: 0, descripcion: 'Cobertura estándar' }],
      servicios: baseVehiculo.servicios || [],
      imagenes: baseVehiculo.imagenes || (baseVehiculo.imagen ? [baseVehiculo.imagen] : []),
      sucursalInfo: baseVehiculo.sucursalInfo || {
        nombre: baseVehiculo.sucursal || 'Alquiler Neiva - Centro',
        direccion: 'Calle 9 # 8-25, Centro',
        horario: 'Lun a dom, 6:00 am - 10:00 pm',
      },
    }
  }, [baseVehiculo])

  const promo = useMemo(() => {
    if (!vehiculo) return null
    const descNum = descuentoParam ? Number(descuentoParam) : null
    if (descNum && descNum > 0) {
      return {
        tipoDescuento: 'porcentaje',
        valorDescuento: descNum,
        nombre: `Descuento ${descNum}%`,
      }
    }
    if (promoCode) {
      const found = promotionManagementService.list().find(
        (p) => p.codigo === promoCode.toUpperCase() && p.activa
      )
      if (found) return found
    }
    return promotionManagementService.getPromotionForVehicle(vehiculo, usuario)
  }, [vehiculo, descuentoParam, promoCode, usuario])

  const precioFinal = promo
    ? promo.tipoDescuento === 'porcentaje'
      ? Math.round(vehiculo.precio * (1 - promo.valorDescuento / 100))
      : Math.max(0, vehiculo.precio - promo.valorDescuento)
    : vehiculo?.precio || 0

  if (!isOpen || !vehiculo) return null

  const c = {
    isDark: esModoOscuro,
    pageBg: esModoOscuro ? '#0f172a' : '#eaeff8',
    cardBg: esModoOscuro ? '#111827' : '#ffffff',
    cardBorder: esModoOscuro ? '#1e293b' : '#e2e8f0',
    subCardBg: esModoOscuro ? '#1e293b' : '#ffffff',
    subCardBorder: esModoOscuro ? '#334155' : '#e2e8f0',
    textPrimary: esModoOscuro ? '#f8fafc' : '#0f172a',
    textSecondary: esModoOscuro ? '#94a3b8' : '#64748b',
    accentText: 'var(--brand-text)',
    titleColor: esModoOscuro ? '#f8fafc' : 'var(--brand-text)',
    accentBgSoft: 'var(--brand-soft)',
    accentGradient: 'var(--brand-gradient)',
  }

  const handleReservar = () => {
    if (!esAutenticado) {
      setBannerVisible(true)
      return
    }
    sessionStorage.removeItem(`drivique_reservation_state_${vehiculo.id}`)
    const q = promo ? (promo.codigo ? `?promo=${promo.codigo}` : promo.valorDescuento ? `?descuento=${promo.valorDescuento}` : '') : ''
    onClose?.()
    navigate(`/reservas/${vehiculo.id}${q}`)
  }

  return (
    <div
      className="vehicle-details-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        className="vehicle-details-modal-container"
        style={{
          background: c.cardBg,
          color: c.textPrimary,
          borderColor: c.cardBorder,
        }}
      >
        {/* Mobile Pull Handle */}
        <div className="vdm-mobile-handle" />

        {/* Modal Header */}
        <div
          className="vehicle-details-modal-header"
          style={{
            background: c.cardBg,
            borderColor: c.cardBorder,
          }}
        >
          <div className="vehicle-details-modal-header-title">
            <h2 style={{ color: c.textPrimary, margin: 0 }}>
              {vehiculo.nombre}
            </h2>
          </div>
          <button
            type="button"
            className="vehicle-details-modal-close-btn"
            onClick={onClose}
            aria-label={t('common.close', 'Cerrar')}
            title={t('common.closeEsc', 'Cerrar (Esc)')}
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="vehicle-details-modal-body vehiculo-detail-page-wrap">
          <div
            className="vehiculo-detail-parent-card"
            style={{
              background: c.cardBg,
              border: `1px solid ${c.cardBorder}`,
              padding: '16px',
            }}
          >
            {/* Top Grid: 3 columns */}
            <div className="vehiculo-detail-grid">
              {/* Col 1: Galería + Sucursal + Requisitos */}
              <div className="vehiculo-col-left">
                <div className="vdm-block-gallery">
                  <ImageGallery
                    imagenes={vehiculo.imagenes || []}
                    nombreVehiculo={vehiculo.nombre}
                    calificacion={vehiculo.comentarios?.length ? vehiculo.calificacion : 0}
                    c={c}
                  />
                </div>

                <div className="vdm-block-branch">
                  <BranchInfo sucursalInfo={vehiculo.sucursalInfo} c={c} />
                </div>

                <div className="vdm-block-requirements">
                  <RentalRequirements c={c} />
                </div>
              </div>

              {/* Col 2: Descripción + Seguros + Equipamiento */}
              <div className="vehiculo-col-center">
                <div className="vdm-block-description">
                  <DescriptionSection descripcion={vehiculo.descripcion} id={vehiculo.id} c={c} />
                </div>

                <div className="vdm-block-insurance">
                  <PricingSection
                    tarifas={vehiculo.tarifas}
                    seguros={vehiculo.seguros}
                    showTarifas={false}
                    showSeguros={true}
                    c={c}
                  />
                </div>

                <div className="vdm-block-equipment">
                  <EquipmentSection
                    caracteristicas={vehiculo.caracteristicas}
                    equipamiento={vehiculo.equipamientoTecnologico}
                    showTech={false}
                    showGeneral={true}
                    c={c}
                  />
                </div>

                <div className="vdm-block-picoplaca">
                  <PicoYPlacaCard c={c} />
                </div>
              </div>

              {/* Col 3: Reservar + Tarifas + Características */}
              <div className="vehiculo-col-right">
                <div
                  className="vehiculo-reserve-card vdm-block-reserve"
                  style={{
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: c.cardBg,
                    border: `1px solid ${c.cardBorder}`,
                  }}
                >
                  {promo && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--brand-soft)',
                        border: '1px solid var(--brand-border, rgba(var(--brand-primary-rgb), 0.2))',
                        padding: '5px 12px',
                        borderRadius: 8,
                        marginBottom: 10,
                        alignSelf: 'flex-start',
                      }}
                    >
                      <span style={{ fontSize: 11.5, fontWeight: 900, color: 'var(--brand-text, var(--brand-primary))' }}>
                        🔥 {promo.tipoDescuento === 'porcentaje' ? `-${promo.valorDescuento}%` : `-${formatCurrency(promo.valorDescuento, moneda)}`} {t('promotions.discount', 'Descuento')}
                      </span>
                    </div>
                  )}
                  <div className="vehiculo-price-label" style={{ color: c.textSecondary }}>
                    {t('catalogo.pricePerDay', 'Precio por día')}
                  </div>
                  <div
                    className="vehiculo-price-value"
                    style={{
                      color: promo ? '#059669' : c.accentText,
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    {promo && (
                      <span style={{ fontSize: 14, textDecoration: 'line-through', color: c.textSecondary, fontWeight: 600 }}>
                        {formatCurrency(vehiculo.precio, moneda)}
                      </span>
                    )}
                    <span>{formatCurrency(precioFinal, moneda)}</span>
                    <span style={{ color: c.textSecondary, fontSize: 12 }}>{t('catalogo.perDay', '/día')}</span>
                  </div>
                  <button className="vehiculo-reserve-btn" onClick={handleReservar}>
                    <FaCar /> {t('catalogo.reserveNow', 'Reservar ahora')}
                  </button>
                </div>

                <div className="vdm-block-rates">
                  <PricingSection
                    tarifas={vehiculo.tarifas}
                    seguros={vehiculo.seguros}
                    showTarifas={true}
                    showSeguros={false}
                    c={c}
                  />
                </div>

                <div className="vdm-block-specs">
                  <VehicleCharacteristics vehiculo={vehiculo} c={c} />
                </div>
              </div>
            </div>

            {/* Reseñas integradas */}
            <ReviewsSection comentarios={vehiculo.comentarios} calificacion={vehiculo.calificacion} c={c} embedded />
          </div>
        </div>
      </div>

      <GuestReserveModal c={c} visible={bannerVisible} onCerrar={() => setBannerVisible(false)} />
    </div>
  )
}
