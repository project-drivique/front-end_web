import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanding } from '../../landing/LandingContext'
import { formatCurrency } from '@/utils/currencyUtils'
import {
  FaHeart,
  FaRegHeart,
  FaCogs,
  FaGasPump,
  FaCar,
  FaStar,
  FaMapMarkerAlt,
} from 'react-icons/fa'

function getSafeImages(vehiculo) {
  const imgs = vehiculo.imagenes || vehiculo.fotos || []
  const arrayFiltrado = Array.isArray(imgs) ? imgs.filter(Boolean) : []

  if (arrayFiltrado.length > 1) {
    return arrayFiltrado.slice(0, 3)
  }

  const fotoBase = arrayFiltrado[0] || vehiculo.imagen || vehiculo.foto

  if (fotoBase) {
    return [
      fotoBase,
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    ]
  }

  return ['']
}

const TRANS_KEYS = {
  'Automática': 'catalogo.transAuto',
  'Manual':     'catalogo.transManual',
}
const FUEL_KEYS = {
  'Gasolina':  'catalogo.fuelGas',
  'Diesel':    'catalogo.fuelDiesel',
  'Híbrido':   'catalogo.fuelHybrid',
  'Eléctrico': 'catalogo.fuelElec',
}

function normalizeRating(vehiculo) {
  const r = Number(vehiculo.calificacion ?? vehiculo.rating ?? 0)
  return Number.isFinite(r) ? r : 0
}

export default function TarjetaVehiculo({
  vehiculo,
  esFavorito = false,
  onFavorito = () => {},
  c,
  invitado = false,
  destacado = false,
  onGuestBlocked = () => {},    // dispara GuestReserveModal (Reservar), vive en la página padre
  onGuestFavorito = () => {},   // dispara GuestFavoriteModal (Favoritos), vive en la página padre
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { moneda } = useLanding()
  const [hover, setHover] = useState(false)
  const [fotoActiva, setFotoActiva] = useState(0)

  const imagenes = getSafeImages(vehiculo)
  const rating = normalizeRating(vehiculo)
  const estadoDisponible = vehiculo.disponible !== false
  const disponibleEnFechas = vehiculo.disponibleEnFechas !== false
  const puedeReservar = estadoDisponible && disponibleEnFechas

  let badgeTexto = t('catalogo.available')
  let badgeBg = '#e6f4ea', badgeColor = '#137333', badgeBorder = '#ceead6'
  if (!estadoDisponible) {
    badgeTexto = t('catalogo.unavailable')
    badgeBg = '#fce8e6'; badgeColor = '#c5221f'; badgeBorder = '#fad2cf'
  } else if (!disponibleEnFechas) {
    badgeTexto = t('catalogo.unavailableDates')
    badgeBg = '#fef3c7'; badgeColor = '#92400e'; badgeBorder = '#fde68a'
  }

  const handleVerDetalles = () => {
    navigate(`/catalogo/${vehiculo.id}`)
  }

  const handleReservar = (e) => {
    e.stopPropagation()
    if (!puedeReservar) return
    if (invitado) {
      onGuestBlocked()
      return
    }
    navigate(`/reservas/${vehiculo.id}`)
  }

  const handleFavoritoClick = (e) => {
    e.stopPropagation()
    if (invitado) {
      onGuestFavorito()
      return
    }
    onFavorito()
  }

  const handleDotClick = (e, i) => {
    e.stopPropagation()
    setFotoActiva(i)
  }

  const estrellas = Array.from({ length: 5 }, (_, i) => i < Math.round(rating))
  const imagenActual = imagenes[fotoActiva] || ''

  return (
    <div
      onClick={handleVerDetalles}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: c.panelBg,
        borderRadius: '20px',
        border: `1.5px solid ${hover ? c.cardBorderHover : c.cardBorder}`,
        boxShadow: destacado ? (hover ? '0 16px 40px rgba(37,99,235,0.24)' : '0 10px 26px rgba(37,99,235,0.16)') : (hover ? c.cardShadowHover : c.cardShadow),
        overflow: 'hidden',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease, opacity 200ms ease',
        opacity: puedeReservar ? 1 : 0.72,
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'flex-start',
        width: '100%',
        maxWidth: '350px',
        cursor: 'pointer',
      }}
    >
      <div style={{ position: 'relative', height: '180px', background: c.imageFallbackBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {imagenActual ? (
          <img src={imagenActual} alt={vehiculo.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaCar size={42} color={c.imageFallbackIcon} />
          </div>
        )}

        <span
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            fontSize: '11px',
            fontWeight: 700,
            padding: '5px 12px',
            borderRadius: '9999px',
            background: badgeBg,
            color: badgeColor,
            border: `1px solid ${badgeBorder}`,
          }}
        >
          {badgeTexto}
        </span>

        <button
          type="button"
          onClick={handleFavoritoClick}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
          aria-label={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          {esFavorito ? <FaHeart color="#e11d48" size={18} /> : <FaRegHeart color="#9ca3af" size={18} />}
        </button>

        {imagenes.length > 1 && (
          <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.25)', padding: '4px 8px', borderRadius: '9999px' }}>
            {imagenes.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => handleDotClick(e, i)}
                style={{
                  width: i === fotoActiva ? '16px' : '6px',
                  height: '6px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  background: i === fotoActiva ? '#3b82f6' : '#e5e7eb',
                  padding: 0,
                  transition: 'all 200ms',
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ marginBottom: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', background: '#eff6ff', padding: '4px 10px', borderRadius: '9999px', border: '1px solid #bfdbfe' }}>
            {vehiculo.categoria || 'Económico'}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '9999px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FaMapMarkerAlt /> {vehiculo.sucursal || 'Centro Neiva'}
          </span>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 800, color: c.textPrimary, margin: '0 0 6px', lineHeight: 1.3 }}>
          {vehiculo.nombre}
        </h3>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: c.textSecondary }}>
            <FaCogs style={{ color: c.textMuted }} />
            {TRANS_KEYS[vehiculo.transmision] ? t(TRANS_KEYS[vehiculo.transmision]) : vehiculo.transmision}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: c.textSecondary }}>
            <FaGasPump style={{ color: c.textMuted }} />
            {FUEL_KEYS[vehiculo.combustible] ? t(FUEL_KEYS[vehiculo.combustible]) : vehiculo.combustible}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '10px' }}>
          {estrellas.map((llena, i) => (
            <FaStar key={i} size={13} color={llena ? '#f59e0b' : '#d1d5db'} />
          ))}
          <span style={{ fontSize: '12px', color: c.textSecondary, marginLeft: '4px', fontWeight: 600 }}>{rating.toFixed(1)}</span>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '24px', fontWeight: 900, color: '#1e3a8a' }}>
            {formatCurrency(vehiculo.precio || 60000, moneda)}
          </span>
          <span style={{ fontSize: '12px', color: c.textSoft, marginLeft: '4px' }}>/{t('catalogo.day')}</span>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={handleReservar}
            disabled={!puedeReservar}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 800,
              border: 'none',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: puedeReservar ? 'pointer' : 'not-allowed',
              background: puedeReservar ? c.accentGradient : c.paginationDisabledBg,
              color: '#fff',
              boxShadow: puedeReservar ? '0 4px 14px rgba(37,99,235,0.25)' : 'none',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <FaCar />
            {puedeReservar ? t('catalogo.reserveNow').toUpperCase() : badgeTexto.toUpperCase()}
          </button>

          <div style={{ textAlign: 'center' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#2563eb',
                textDecoration: 'underline',
              }}
            >
              {t('catalogo.details')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}