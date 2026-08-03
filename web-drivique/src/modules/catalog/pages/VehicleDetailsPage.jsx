
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useLanding } from '../../landing/LandingContext'
import { formatCurrency } from '@/utils/currencyUtils'
import logo from '@/assets/logo.png'
import VEHICULOS_MOCK from '@/mocks/vehicles.json'
import ImageGallery from '../components/detail/ImageGallery'
import VehicleInfo from '../components/detail/VehicleInfo'
import RegistrationBanner from '../components/RegistrationBanner'
import { FaShieldAlt, FaWifi, FaRoad, FaCar } from 'react-icons/fa'

const IcoBack = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
)

// RF12.7 — Página de solo información del vehículo (sin flujo de reserva).
export default function VehicleDetailsPage() {
  const { t } = useTranslation()
  const { moneda } = useLanding()
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

  const tarifas = vehiculo.tarifas || {}
  const kmLimit = tarifas.kmLimitado || { precio: 0, km: 150, excedente: 550 }
  const kmIlimit = tarifas.kmIlimitado || { precio: 0 }
  const seguros = Array.isArray(vehiculo.seguros) && vehiculo.seguros.length > 0
    ? vehiculo.seguros
    : [
        { nombre: t('catalogo.basicProtection'), precio: 29000 },
        { nombre: t('catalogo.fullProtection'), precio: 67000 },
      ]
  const servicios = vehiculo.servicios || []

  // "Reservar ahora" desde esta página informativa: usuario autenticado
  // pasa al flujo real de reserva (módulo reservations); visitante recibe
  // el modal de acceso.
  const handleReservar = () => {
    if (!usuario) {
      setBannerVisible(true)
      return
    }
    navigate(`/reservas/${vehiculo.id}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--bg-tarjeta)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--borde)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', height: 96 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to={usuario ? '/home' : '/'}><img src={logo} alt="Drivique" style={{ height: 80 }} /></Link>
        </div>
      </nav>

      <div style={{ paddingTop: 96 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <button
              onClick={() => navigate(usuario ? '/home' : '/catalogo')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#1e3a8a', fontWeight: 700, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 9999, padding: '8px 18px', cursor: 'pointer' }}
            >
              <IcoBack /> {t('vehiculo.backToCatalog')}
            </button>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--texto-primary)', margin: 0 }}>{vehiculo.nombre}</h1>
          </div>

          <ImageGallery imagenes={vehiculo.imagenes} nombreVehiculo={vehiculo.nombre} />
          <VehicleInfo vehiculo={vehiculo} />

          {/* Seguros — solo informativo, sin selección */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--texto-primary)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaShieldAlt color="#1e3a8a" /> {t('catalogo.insurance')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              {seguros.map((seg, i) => (
                <div key={i} style={{ border: '1px solid var(--borde)', borderRadius: 16, padding: '16px 18px', background: 'var(--bg-tarjeta)' }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--texto-primary)', margin: '0 0 6px' }}>{seg.nombre}</p>
                  <p style={{ fontSize: 16, fontWeight: 900, color: '#1e3a8a', margin: 0 }}>
                    {formatCurrency(seg.precio, moneda)} <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--texto-second)' }}>/{t('catalogo.day')}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tarifas de kilometraje — solo informativo */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--texto-primary)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaRoad color="#1e3a8a" /> {t('vehiculo.kmTypeTitle')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div style={{ border: '1px solid var(--borde)', borderRadius: 16, padding: '16px 18px', background: 'var(--bg-tarjeta)' }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--texto-primary)', margin: '0 0 6px' }}>{t('catalogo.limitedKm')} ({kmLimit.km} km/{t('catalogo.day')})</p>
                <p style={{ fontSize: 16, fontWeight: 900, color: '#1e3a8a', margin: 0 }}>
                  {formatCurrency(kmLimit.precio, moneda)} <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--texto-second)' }}>/{t('catalogo.day')}</span>
                </p>
              </div>
              <div style={{ border: '1px solid var(--borde)', borderRadius: 16, padding: '16px 18px', background: 'var(--bg-tarjeta)' }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--texto-primary)', margin: '0 0 6px' }}>{t('catalogo.unlimitedKm')}</p>
                <p style={{ fontSize: 16, fontWeight: 900, color: '#1e3a8a', margin: 0 }}>
                  {formatCurrency(kmIlimit.precio, moneda)} <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--texto-second)' }}>/{t('catalogo.day')}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Servicios adicionales — solo informativo */}
          {servicios.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--texto-primary)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaWifi color="#1e3a8a" /> {t('vehiculo.extraServices')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                {servicios.map((serv, i) => (
                  <div key={i} style={{ border: '1px solid var(--borde)', borderRadius: 16, padding: '16px 18px', background: 'var(--bg-tarjeta)' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--texto-primary)', margin: '0 0 6px' }}>{serv.nombre}</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#059669', margin: 0 }}>
                      +{formatCurrency(serv.precio, moneda)} /{t('catalogo.day')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA final: pasa al flujo real de reserva */}
          <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleReservar}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '16px 48px', borderRadius: 16,
                background: 'linear-gradient(90deg,#1e3a8a,#2563eb)',
                color: '#fff', fontWeight: 900, fontSize: 15, border: 'none',
                cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.28)',
              }}
            >
              <FaCar /> {t('catalogo.reserveNow')}
            </button>
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
