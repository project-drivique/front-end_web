import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useMemo } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useLanding } from '../../landing/LandingContext'
import { promotionManagementService } from '../../../services/promotionManagementService'
import { formatCurrency } from '@/utils/currencyUtils'
import VEHICULOS_MOCK from '@/mocks/vehicles.json'

import ImageGallery from '../components/detail/ImageGallery'
import VehicleCharacteristics from '../components/detail/VehicleCharacteristics'
import EquipmentSection from '../components/detail/EquipmentSection'
import DescriptionSection from '../components/detail/DescriptionSection'
import PricingSection from '../components/detail/PricingSection'
import BranchInfo from '../components/detail/BranchInfo'
import RentalRequirements from '../components/detail/RentalRequirements'
import ReviewsSection from '../components/detail/ReviewsSection'
import GuestReserveModal from '../components/GuestReserveModal'
import MenuConfiguracion from '@/components/MenuConfiguracion'
import { FaCar, FaArrowLeft } from 'react-icons/fa'

import './CatalogPage.css'
import './VehicleDetailsPage.css'

export default function VehicleDetailsPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const usuario = useAuthStore((s) => s.usuario)
  const esAutenticado = Boolean(token && usuario)
  const { tema, moneda } = useLanding()
  const esModoOscuro = tema === 'oscuro'
  const [bannerVisible, setBannerVisible] = useState(false)

  const c = {
    pageBg: esModoOscuro ? '#0f172a' : '#eaeff8',
    cardBg: esModoOscuro ? '#111827' : '#ffffff',
    cardBorder: esModoOscuro ? '#1e293b' : '#e2e8f0',
    subCardBg: esModoOscuro ? '#1e293b' : '#f8fafc',
    subCardBorder: esModoOscuro ? '#334155' : '#e2e8f0',
    textPrimary: esModoOscuro ? '#f8fafc' : '#0f172a',
    textSecondary: esModoOscuro ? '#94a3b8' : '#64748b',
    accentText: 'var(--brand-text)',
    titleColor: 'var(--brand-text)',
    accentBgSoft: 'var(--brand-soft)',
    accentGradient: 'var(--brand-gradient)'
  }

  const vehiculo = VEHICULOS_MOCK.find(v => v.id === Number(id))

  const descuentoParam = searchParams.get('descuento') ? Number(searchParams.get('descuento')) : null
  const promoCode = searchParams.get('promo')
  const promo = useMemo(() => {
    if (!vehiculo) return null
    if (descuentoParam && descuentoParam > 0) {
      return {
        tipoDescuento: 'porcentaje',
        valorDescuento: descuentoParam,
        nombre: `Descuento ${descuentoParam}%`,
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

  if (!vehiculo) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: c.pageBg, color: c.textPrimary }}>
      <p style={{ fontSize: 20, fontWeight: 800, color: c.textPrimary }}>{t('vehiculo.notFound')}</p>
      <Link to={esAutenticado ? '/home' : '/catalogo'} style={{ color: c.accentText, fontWeight: 700, fontSize: 14 }}>← {t('vehiculo.backToCatalog')}</Link>
    </div>
  )

  const handleReservar = () => {
    if (!esAutenticado) {
      setBannerVisible(true)
      return
    }
    const q = promo ? (promo.codigo ? `?promo=${promo.codigo}` : promo.valorDescuento ? `?descuento=${promo.valorDescuento}` : '') : ''
    navigate(`/reservas/${vehiculo.id}${q}`)
  }

  return (
    <div className="catalogo-page vehiculo-detail-page-wrap" style={{ minHeight: '100vh', background: c.pageBg, color: c.textPrimary }}>
      
      {/* Top Bar: Back to Catalog Pill Button + Menu Configuración */}
      <div className="vehiculo-top-bar">
        <button
          type="button"
          className="vehiculo-back-pill-btn"
          onClick={() => navigate(esAutenticado ? '/home' : '/catalogo')}
          style={{
            background: c.cardBg,
            border: `1px solid ${c.cardBorder}`,
            color: c.textPrimary,
          }}
        >
          <FaArrowLeft size={12} />
          <span>{t('catalogo.backToCatalog', 'Volver al catálogo')}</span>
        </button>

        <MenuConfiguracion />
      </div>

      {/* Contenedor Padre Unificado */}
      <div
        className="vehiculo-detail-parent-card"
        style={{
          background: c.cardBg,
          border: `1px solid ${c.cardBorder}`,
        }}
      >
        {/* Título del vehículo */}
        <h1 style={{ fontSize: 28, fontWeight: 900, color: c.textPrimary, margin: '0 0 24px 0', letterSpacing: '-0.02em' }}>
          {vehiculo.nombre}
        </h1>
        
        {/* Top Grid: 3 columns */}
        <div className="vehiculo-detail-grid">
          
          {/* Col 1: Galería + Características */}
          <div className="vehiculo-col-left" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ImageGallery 
              imagenes={vehiculo.imagenes || []} 
              nombreVehiculo={vehiculo.nombre} 
              calificacion={vehiculo.comentarios?.length ? vehiculo.calificacion : 0} 
              c={c}
            />
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <VehicleCharacteristics vehiculo={vehiculo} c={c} />
            </div>
          </div>

          {/* Col 2: Info central + Equipamiento */}
          <div className="vehiculo-col-center" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <DescriptionSection descripcion={vehiculo.descripcion} id={vehiculo.id} c={c} />
            
            <BranchInfo sucursalInfo={vehiculo.sucursalInfo} c={c} />
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <EquipmentSection 
                caracteristicas={vehiculo.caracteristicas} 
                equipamiento={vehiculo.equipamientoTecnologico} 
                c={c}
              />
            </div>
          </div>

          {/* Col 3: Tarifas y Reservar */}
          <div className="vehiculo-col-right" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PricingSection tarifas={vehiculo.tarifas} seguros={vehiculo.seguros} c={c} />

            <RentalRequirements c={c} />

            <div className="vehiculo-reserve-card" style={{ margin: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
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
                    🔥 -{promo.valorDescuento}% {t('promotions.discount', 'Descuento')}
                  </span>
                </div>
              )}
              <div className="vehiculo-price-label" style={{ color: c.textSecondary }}>{t('catalogo.pricePerDay', 'Precio por día ($COP)')}</div>
              <div className="vehiculo-price-value" style={{ color: promo ? '#059669' : c.accentText, display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
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
          </div>

        </div>

        {/* Reseñas integradas */}
        <ReviewsSection comentarios={vehiculo.comentarios} calificacion={vehiculo.calificacion} c={c} embedded />

      </div>

      <GuestReserveModal
        c={c}
        visible={bannerVisible}
        onCerrar={() => setBannerVisible(false)}
      />
    </div>
  )
}
