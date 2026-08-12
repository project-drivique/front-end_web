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
import { FaCar, FaArrowLeft } from 'react-icons/fa'

import './CatalogPage.css'
import './VehicleDetailsPage.css'

export default function VehicleDetailsPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const { moneda } = useLanding()
  const [bannerVisible, setBannerVisible] = useState(false)

  const c = {
    heroCardBg: '#ffffff',
    heroCardBorder: '#dbe5f3',
    textPrimary: '#111a3a',
    textSecondary: '#64748b',
    accentText: '#1e3a8a',
    accentBgSoft: '#eff6ff',
    accentGradient: 'linear-gradient(90deg, #1e3a8a, #2563eb)'
  }

  const vehiculo = VEHICULOS_MOCK.find(v => v.id === Number(id))

  if (!vehiculo) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--texto-primary)' }}>{t('vehiculo.notFound')}</p>
      <Link to={usuario ? '/home' : '/catalogo'} style={{ color: '#1e3a8a', fontWeight: 700, fontSize: 14 }}>← {t('vehiculo.backToCatalog')}</Link>
    </div>
  )

  const handleReservar = () => {
    if (!usuario) {
      setBannerVisible(true)
      return
    }
    navigate(`/reservas/${vehiculo.id}`)
  }

  return (
    <div className="catalogo-page" style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--texto-primary)' }}>
      
      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '24px 24px 60px' }}>
        
        {/* Botón flotante fuera del contenedor principal */}
        <div style={{ marginBottom: 24 }}>
          <button 
            className="catalogo-header-back" 
            onClick={() => navigate(usuario ? '/home' : '/catalogo')}
            style={{
              background: '#fff',
              border: '1px solid #dbe5f3',
              color: '#2f4ea2',
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <FaArrowLeft size={12} /> {t('vehiculo.backToCatalog')}
          </button>
        </div>

        <div className="vehiculo-main-container">
          
          {/* Header Layout */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              {vehiculo.nombre}
            </h1>
          </div>
          
          {/* Top Grid: 3 columns */}
          <div className="vehiculo-detail-grid">
            
            {/* Col 1: Galería + Características */}
            <div className="vehiculo-col-left" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ImageGallery 
                imagenes={vehiculo.imagenes} 
                nombreVehiculo={vehiculo.nombre} 
                calificacion={vehiculo.calificacion} 
              />
              
              <div>
                <VehicleCharacteristics vehiculo={vehiculo} />
              </div>
            </div>

            {/* Col 2: Info central + Equipamiento */}
            <div className="vehiculo-col-center" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <DescriptionSection descripcion={vehiculo.descripcion} />
              
              <BranchInfo sucursalInfo={vehiculo.sucursalInfo} />
              
              <EquipmentSection 
                caracteristicas={vehiculo.caracteristicas} 
                equipamiento={vehiculo.equipamientoTecnologico} 
              />
            </div>

            {/* Col 3: Tarifas y Reservar */}
            <div className="vehiculo-col-right" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <PricingSection tarifas={vehiculo.tarifas} seguros={vehiculo.seguros} />

              <RentalRequirements />

              <div className="vehiculo-reserve-card" style={{ margin: 0 }}>
                <div className="vehiculo-price-label">Precio por día (COP)</div>
                <div className="vehiculo-price-value">
                  {formatCurrency(vehiculo.precio, moneda)} <span>/día</span>
                </div>
                <button className="vehiculo-reserve-btn" onClick={handleReservar}>
                  <FaCar /> Reservar ahora
                </button>
              </div>
            </div>

          </div>

          {/* Reseñas (separado por línea) */}
          <div style={{ borderTop: '1px solid var(--borde)', marginTop: 40, paddingTop: 40 }}>
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