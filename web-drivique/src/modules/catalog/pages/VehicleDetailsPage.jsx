import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useLanding } from '../../landing/LandingContext'
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
    navigate(`/reservas/${vehiculo.id}`)
  }

  return (
    <div className="catalogo-page" style={{ minHeight: '100vh', background: c.pageBg, color: c.textPrimary }}>
      
      <div className="detalle-contenido-inner" style={{ maxWidth: 1360, margin: '0 auto', padding: '24px 24px 60px' }}>
        
        {/* Top bar fuera del contenedor principal */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            className="catalogo-header-back" 
            onClick={() => navigate(esAutenticado ? '/home' : '/catalogo')}
            style={{
              background: c.cardBg,
              border: `1px solid ${c.cardBorder}`,
              color: c.accentText,
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <FaArrowLeft size={12} /> {t('vehiculo.backToCatalog')}
          </button>

          <MenuConfiguracion />
        </div>

        <div className="vehiculo-main-container" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, boxShadow: esModoOscuro ? '0 4px 24px rgba(0,0,0,0.40)' : '0 4px 24px rgba(var(--brand-secondary-rgb),0.07)' }}>
          
          {/* Header Layout */}
          <div style={{ marginBottom: 24 }}>
            <h1 className="detalle-titulo" style={{ fontSize: 26, fontWeight: 800, color: c.textPrimary, margin: 0, letterSpacing: '-0.02em' }}>
              {vehiculo.nombre}
            </h1>
          </div>
          
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
                <div className="vehiculo-price-label" style={{ color: c.textSecondary }}>{t('catalogo.pricePerDay', 'Precio por día ($COP)')}</div>
                <div className="vehiculo-price-value" style={{ color: c.accentText }}>
                  {formatCurrency(vehiculo.precio, moneda)} <span style={{ color: c.textSecondary }}>{t('catalogo.perDay', '/día')}</span>
                </div>
                <button className="vehiculo-reserve-btn" onClick={handleReservar}>
                  <FaCar /> {t('catalogo.reserveNow', 'Reservar ahora')}
                </button>
              </div>
            </div>

          </div>

          {/* Reseñas (separado por línea) */}
          <div className="detalle-resenas-wrapper" style={{ borderTop: '1px solid var(--borde)', marginTop: 40, paddingTop: 40 }}>
            <ReviewsSection comentarios={vehiculo.comentarios} calificacion={vehiculo.calificacion} />
          </div>

        </div>

      </div>

      <GuestReserveModal
        c={c}
        visible={bannerVisible}
        onCerrar={() => setBannerVisible(false)}
      />
    </div>
  )
}
