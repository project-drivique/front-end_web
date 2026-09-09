import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaTimes, FaCar, FaTag } from 'react-icons/fa'
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
  const esAutenticado = Boolean(token && token !== 'null' && token !== 'undefined' && usuario)
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
      role="dialog"
      aria-modal="true"
      aria-label={t('catalogo.details', 'Detalle del vehículo')}
    >
      <div className="vehicle-details-modal-container">
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
            {/* 3 Equal Width Columns Grid */}
            <div className="vehiculo-detail-grid">
              {/* Col 1: Galería + Sucursal + Pico y Placa */}
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

                <div className="vdm-block-picoplaca">
                  <PicoYPlacaCard c={c} />
                </div>
              </div>

              {/* Col 2: Descripción + Seguros + Equipamiento + Requisitos */}
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

                <div className="vdm-block-requirements">
                  <RentalRequirements c={c} />
                </div>
              </div>

              {/* Col 3: Tarifas + Características + Reservar */}
              <div className="vehiculo-col-right">
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

                <div
                  className="vehiculo-reserve-card vdm-block-reserve"
                  style={{
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: c.cardBg,
                    border: `1px solid ${c.cardBorder}`,
                    padding: 'clamp(12px, 1.5vw, 16px)',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <FaTag color={c?.accentText || "var(--brand-primary, #1e3a8a)"} size={12} />
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: c.titleColor, margin: 0 }}>
                        {t('catalogo.pricePerDay', 'Precio por día')}
                      </h3>
                    </div>
                    {promo && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: c.isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                          color: c.isDark ? '#34d399' : '#047857',
                          border: `1px solid ${c.isDark ? 'rgba(52, 211, 153, 0.3)' : '#a7f3d0'}`,
                          fontSize: 10.5,
                          fontWeight: 800,
                          padding: '1px 7px',
                          borderRadius: 999,
                          letterSpacing: '0.02em',
                        }}
                      >
                        {promo.tipoDescuento === 'porcentaje' ? `-${promo.valorDescuento}%` : `-${formatCurrency(promo.valorDescuento, moneda)}`}
                      </span>
                    )}
                  </div>

                  {/* Caja elegante de desglose de precio con fondo blanco */}
                  <div
                    style={{
                      background: c.isDark ? '#111827' : '#ffffff',
                      border: `1px solid ${c.cardBorder}`,
                      borderRadius: 10,
                      padding: '6px 12px',
                      marginBottom: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    {promo && (vehiculo.precio > precioFinal) ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11.5, color: c.textSecondary, fontWeight: 500 }}>
                            {t('catalogo.before', 'Antes')}
                          </span>
                          <span style={{ fontSize: 11.5, color: c.textSecondary, textDecoration: 'line-through', fontWeight: 600 }}>
                            {formatCurrency(vehiculo.precio, moneda)} <span style={{ fontSize: 10, fontWeight: 500 }}>{t('catalogo.perDay', '/día')}</span>
                          </span>
                        </div>
                        <div style={{ height: 1, background: c.cardBorder, opacity: 0.6 }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: 'var(--brand-text, #1e3a8a)', fontWeight: 700 }}>
                            {t('catalogo.now', 'Ahora')}
                          </span>
                          <span style={{ fontSize: 13.5, color: 'var(--brand-text, #1e3a8a)', fontWeight: 800 }}>
                            {formatCurrency(precioFinal, moneda)}{' '}
                            <span style={{ fontSize: 10.5, fontWeight: 600, color: c.textSecondary }}>{t('catalogo.perDay', '/día')}</span>
                          </span>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: c.textSecondary, fontWeight: 600 }}>
                          {t('catalogo.rate', 'Tarifa base')}
                        </span>
                        <span style={{ fontSize: 13.5, color: 'var(--brand-text, #1e3a8a)', fontWeight: 800 }}>
                          {formatCurrency(precioFinal, moneda)}{' '}
                          <span style={{ fontSize: 10.5, fontWeight: 600, color: c.textSecondary }}>{t('catalogo.perDay', '/día')}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <button className="vehiculo-reserve-btn" onClick={handleReservar} style={{ padding: '8px 12px', fontSize: 12, borderRadius: 10 }}>
                    <FaCar size={12} />
                    <span>{t('catalogo.reserveNow', 'Reservar ahora')}</span>
                  </button>
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
