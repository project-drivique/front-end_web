import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import logo from '@/assets/logo.png'
import VEHICULOS_MOCK from '@/mocks/vehicles.json'
import ImageGallery from '../components/detail/ImageGallery'
import VehicleInfo from '../components/detail/VehicleInfo'
import VehicleCharacteristics from '../components/detail/VehicleCharacteristics'
import EquipmentSection from '../components/detail/EquipmentSection'
import DescriptionSection from '../components/detail/DescriptionSection'
import PricingSection from '../components/detail/PricingSection'
import BranchInfo from '../components/detail/BranchInfo'
import ReviewsSection from '../components/detail/ReviewsSection'
import RegistrationBanner from '../components/RegistrationBanner'
import { FaCar } from 'react-icons/fa'

const IcoBack = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
)

export default function VehicleDetailsPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const [bannerVisible, setBannerVisible] = useState(false)

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
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--bg-tarjeta)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--borde)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', height: 72 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to={usuario ? '/home' : '/'}><img src={logo} alt="Drivique" style={{ height: 56 }} /></Link>
        </div>
      </nav>

      <div style={{ paddingTop: 72 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 24px 60px' }}>

          <button
            onClick={() => navigate(usuario ? '/home' : '/catalogo')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1e3a8a', fontWeight: 700, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 9999, padding: '7px 16px', cursor: 'pointer', marginBottom: 18 }}
          >
            <IcoBack /> {t('vehiculo.backToCatalog')}
          </button>

          <div style={{
            background: 'var(--bg-tarjeta)',
            borderRadius: 20,
            border: '1px solid rgba(37,99,235,0.12)',
            boxShadow: '0 4px 24px rgba(30,58,138,0.07)',
            padding: '26px 28px 30px',
          }}>

            <VehicleInfo vehiculo={vehiculo} />

            {/* Foto + tarifas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: 24, marginTop: 20 }} className="detalle-top-grid">
              <ImageGallery imagenes={vehiculo.imagenes} nombreVehiculo={vehiculo.nombre} />
              <PricingSection tarifas={vehiculo.tarifas} seguros={vehiculo.seguros} />
            </div>

            {/* Especificaciones — 2 columnas, sin bordes */}
            <VehicleCharacteristics vehiculo={vehiculo} />

            {/* Equipamiento y confort — chips */}
            <EquipmentSection caracteristicas={vehiculo.caracteristicas} equipamiento={vehiculo.equipamientoTecnologico} />

            {/* Descripción + ubicación lado a lado */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="detalle-desc-ubi-grid">
              <DescriptionSection descripcion={vehiculo.descripcion} />
              <BranchInfo sucursalInfo={vehiculo.sucursalInfo} />
            </div>

            <div style={{ marginTop: 22, paddingTop: 22, borderTop: '1px solid var(--borde)', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleReservar}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
                  padding: '13px 36px', borderRadius: 14,
                  background: 'linear-gradient(90deg,#1e3a8a,#2563eb)',
                  color: '#fff', fontWeight: 800, fontSize: 15, border: 'none',
                  cursor: 'pointer', boxShadow: '0 8px 20px rgba(37,99,235,0.28)',
                  width: 'auto', minWidth: 220,
                }}
              >
                <FaCar /> {t('catalogo.reserveNow')}
              </button>
            </div>

            <ReviewsSection comentarios={vehiculo.comentarios} calificacion={vehiculo.calificacion} />

          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .detalle-top-grid,
          .detalle-desc-ubi-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <RegistrationBanner
        visible={bannerVisible}
        onCerrar={() => setBannerVisible(false)}
      />
    </div>
  )
}