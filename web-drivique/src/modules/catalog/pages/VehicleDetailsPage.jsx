import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import logo from '@/assets/logo.png'
import VEHICULOS_MOCK from '@/mocks/vehicles.json'
import ImageGallery from '../components/detail/ImageGallery'
import VehicleInfo from '../components/detail/VehicleInfo'
import DescriptionSection from '../components/detail/DescriptionSection'
import VehicleCharacteristics from '../components/detail/VehicleCharacteristics'
import TechEquipment from '../components/detail/TechEquipment'
import RatesSection from '../components/detail/RatesSection'
import InsuranceSection from '../components/detail/InsuranceSection'
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
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: '100%', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to={usuario ? '/home' : '/'}><img src={logo} alt="Drivique" style={{ height: 56 }} /></Link>
        </div>
      </nav>

      <div style={{ paddingTop: 72 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px' }}>

          <button
            onClick={() => navigate(usuario ? '/home' : '/catalogo')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1e3a8a', fontWeight: 700, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 9999, padding: '7px 16px', cursor: 'pointer', marginBottom: 16 }}
          >
            <IcoBack /> {t('vehiculo.backToCatalog')}
          </button>

          <div style={{ background: 'var(--bg-tarjeta)', border: '1px solid var(--borde)', borderRadius: 16, padding: '20px 22px 24px' }}>

            <h1 style={{ fontSize: 19, fontWeight: 800, color: 'var(--texto-primary)', margin: '0 0 12px', textAlign: 'center' }}>
              {t('vehiculo.viewDetails')}
            </h1>
            <div style={{ borderTop: '1px solid var(--borde)', marginBottom: 18 }} />

            <VehicleInfo vehiculo={vehiculo} />

            {/* Fila 1: Galería (2 cols) + Tarifas/Seguro (1 col) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginTop: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <ImageGallery imagenes={vehiculo.imagenes} nombreVehiculo={vehiculo.nombre} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <RatesSection tarifas={vehiculo.tarifas} />
                <InsuranceSection seguros={vehiculo.seguros} />
              </div>
            </div>

            {/* Fila 2: Características (2 cols) + Descripción (1 col) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginTop: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <VehicleCharacteristics vehiculo={vehiculo} caracteristicas={vehiculo.caracteristicas} />
              </div>
              <DescriptionSection descripcion={vehiculo.descripcion} />
            </div>

            {/* Fila 3: Equipamiento tecnológico (2 cols) + Sucursal (1 col) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginTop: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <TechEquipment equipamiento={vehiculo.equipamientoTecnologico} />
              </div>
              <BranchInfo sucursalInfo={vehiculo.sucursalInfo} />
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleReservar}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '13px 40px', borderRadius: 14,
                  background: 'linear-gradient(90deg,#1e3a8a,#2563eb)',
                  color: '#fff', fontWeight: 800, fontSize: 14, border: 'none',
                  cursor: 'pointer', boxShadow: '0 6px 18px rgba(37,99,235,0.25)',
                  width: '100%', justifyContent: 'center',
                }}
              >
                <FaCar /> {t('catalogo.reserveNow')}
              </button>
            </div>

            <div style={{ marginTop: 16 }}>
              <ReviewsSection comentarios={vehiculo.comentarios} calificacion={vehiculo.calificacion} />
            </div>

          </div>

        </div>
      </div>

      <RegistrationBanner
        visible={bannerVisible}
        onCerrar={() => setBannerVisible(false)}
      />
    </div>
  )
}