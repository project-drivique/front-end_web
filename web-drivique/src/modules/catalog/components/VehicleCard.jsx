import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanding } from '../../landing/LandingContext'
import { formatCurrency } from '@/utils/currencyUtils'

import { FaHeart, FaRegHeart, FaCogs, FaGasPump, FaCar, FaStar, FaMapMarkerAlt, FaChevronRight, FaChevronLeft } from 'react-icons/fa'

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
  'Manual': 'catalogo.transManual',
}

const FUEL_KEYS = {
  Gasolina: 'catalogo.fuelGas',
  Diesel: 'catalogo.fuelDiesel',
  Híbrido: 'catalogo.fuelHybrid',
  Eléctrico: 'catalogo.fuelElec',
}

const CAT_KEYS = {
  'Económico': 'catalogo.catEco',
  'Deportivo': 'catalogo.catSport',
  'Sedan': 'catalogo.catSedan',
  'SUV': 'catalogo.catSuv',
}

function normalizeRating(vehiculo) {
  if (!vehiculo.comentarios || vehiculo.comentarios.length === 0) return 0;
  const r = Number(vehiculo.calificacion ?? vehiculo.rating ?? 0)
  return Number.isFinite(r) ? r : 0
}

export default function TarjetaVehiculo({
  vehiculo,
  esFavorito = false,
  onFavorito = () => {},
  c,
  invitado = false,
  onGuestBlocked = () => {},
  onGuestFavorito = () => {},
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { moneda } = useLanding()

  const [hover, setHover] = useState(false)
  const [fotoActiva, setFotoActiva] = useState(0)

  const imagenes = getSafeImages(vehiculo)
  const rating = normalizeRating(vehiculo)
  const totalImagenes = imagenes.length

  const estadoDisponible = vehiculo.disponible !== false
  const disponibleEnFechas = vehiculo.disponibleEnFechas !== false
  const puedeReservar = estadoDisponible && disponibleEnFechas

  let badgeTexto = t('catalogo.available')
  let badgeBg = '#e8f7ee'
  let badgeColor = '#16834a'
  let badgeBorder = '#ccefdc'

  if (!estadoDisponible) {
    badgeTexto = t('catalogo.unavailable')
    badgeBg = '#fce8e6'
    badgeColor = '#c5221f'
    badgeBorder = '#fad2cf'
  } else if (!disponibleEnFechas) {
    badgeTexto = t('catalogo.unavailableDates')
    badgeBg = '#fef3c7'
    badgeColor = '#92400e'
    badgeBorder = '#fde68a'
  }

  const handleVerDetalles = () => {
    navigate(`/catalogo/${vehiculo.id}`)
  }

  const handleReservar = e => {
    e.stopPropagation()
    if (!puedeReservar) return
    if (invitado) {
      onGuestBlocked()
      return
    }
    navigate(`/reservas/${vehiculo.id}`)
  }

  const handleFavoritoClick = e => {
    e.stopPropagation()
    if (invitado) {
      onGuestFavorito()
      return
    }
    onFavorito()
  }

  // FUNCIÓN: retrocede a la imagen anterior (con wrap-around: de la primera pasa a la última)
  const irImagenAnterior = (e) => {
    e.stopPropagation()
    setFotoActiva(i => (i - 1 + totalImagenes) % totalImagenes)
  }

  // FUNCIÓN: avanza a la siguiente imagen (con wrap-around: de la última vuelve a la primera)
  const irImagenSiguiente = (e) => {
    e.stopPropagation()
    setFotoActiva(i => (i + 1) % totalImagenes)
  }

  const estrellas = Array.from({ length: 5 }, (_, i) => i < Math.round(rating))
  const imagenActual = imagenes[fotoActiva] || ''

  // ESTILO reutilizable para los botones flecha (< >) sobre la imagen
  const botonFlechaStyle = (lado) => ({
    position: 'absolute',
    top: '50%',
    [lado]: '6px',
    transform: 'translateY(-50%)',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    background: 'rgba(15,23,42,0.5)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    zIndex: 2,
  })

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: c.panelBg,
        borderRadius: '14px',
        border: `1px solid ${hover ? c.cardBorderHover : c.cardBorder}`,
        boxShadow: hover ? c.cardShadowHover : c.cardShadow,
        overflow: 'hidden',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 180ms ease',
        opacity: puedeReservar ? 1 : 0.72,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minWidth: 0,
        height: '100%',
      }}
    >

      {/* IMAGEN: altura reducida para que la tarjeta sea más compacta */}
      {/* IMAGEN: un poco más alta para que no se vea amontonada al ser tarjetas más angostas */}
      <div style={{ position: 'relative', height: '150px', background: c.imageFallbackBg, overflow: 'hidden', flexShrink: 0 }}>
        {imagenActual ? (
          <img
            src={imagenActual}
            alt={vehiculo.nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaCar size={30} color={c.imageFallbackIcon} />
          </div>
        )}

        <span
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            fontSize: '9px',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '999px',
            background: badgeBg,
            color: badgeColor,
            border: `1px solid ${badgeBorder}`,
          }}
        >
          <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: badgeColor, marginRight: '4px' }} />
          {badgeTexto}
        </span>

        <button
          type="button"
          onClick={handleFavoritoClick}
          style={{
            position: 'absolute',
            top: '7px',
            right: '7px',
            width: '27px',
            height: '27px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.96)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(0,0,0,0.13)',
            zIndex: 2,
          }}
          aria-label={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          {esFavorito ? <FaHeart color="#2563eb" size={13} /> : <FaRegHeart color="#94a3b8" size={13} />}
        </button>

        {/* NAVEGACIÓN DE IMÁGENES: flechas < > en vez de puntos, solo si hay más de 1 foto */}
        {totalImagenes > 1 && (
          <>
            <button
              type="button"
              onClick={irImagenAnterior}
              aria-label="Imagen anterior"
              style={botonFlechaStyle('left')}
            >
              <FaChevronLeft size={10} />
            </button>
            <button
              type="button"
              onClick={irImagenSiguiente}
              aria-label="Imagen siguiente"
              style={botonFlechaStyle('right')}
            >
              <FaChevronRight size={10} />
            </button>
          </>
        )}
      </div>

      {/* CONTENIDO */}
      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '7px', flexWrap: 'nowrap', minWidth: 0 }}>
          <span
            style={{
              fontSize: '9px',
              fontWeight: 700,
              color: '#1e40af',
              background: '#eff6ff',
              padding: '3px 7px',
              borderRadius: '999px',
              border: '1px solid #cfe0ff',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {CAT_KEYS[vehiculo.categoria] ? t(CAT_KEYS[vehiculo.categoria]) : (vehiculo.categoria || 'Económico')}
          </span>

          <span
            style={{
              fontSize: '9px',
              fontWeight: 700,
              color: '#059669',
              background: '#ecfdf5',
              padding: '3px 7px',
              borderRadius: '999px',
              border: '1px solid #c8efd9',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              minWidth: 0,
              maxWidth: '100%',
              flexShrink: 1,
              overflow: 'hidden',
            }}
          >
            <FaMapMarkerAlt size={8} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {vehiculo.sucursal || 'Centro Neiva'}
            </span>
          </span>
        </div>

        <h3
          style={{
            fontSize: '13.5px',
            fontWeight: 800,
            color: c.textPrimary,
            margin: '0 0 6px',
            lineHeight: 1.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {vehiculo.nombre}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: c.textSecondary, fontWeight: 600 }}>
            <FaCogs color={c.textMuted} size={11} />
            {TRANS_KEYS[vehiculo.transmision] ? t(TRANS_KEYS[vehiculo.transmision]) : vehiculo.transmision}
          </span>

          <span style={{ color: c.cardBorderHover, fontSize: '11px' }}>|</span>

          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: c.textSecondary, fontWeight: 600 }}>
            <FaGasPump color={c.textMuted} size={11} />
            {FUEL_KEYS[vehiculo.combustible] ? t(FUEL_KEYS[vehiculo.combustible]) : vehiculo.combustible}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '7px' }}>
          {estrellas.map((llena, i) => (
            <FaStar key={i} size={10} color={llena ? '#f59e0b' : '#d8dee8'} />
          ))}
          <span style={{ fontSize: '10px', color: c.textSecondary, marginLeft: '4px', fontWeight: 700 }}>
            {rating > 0 ? rating.toFixed(1) : t('catalog.card.noReviews', 'Sin reseñas')}
          </span>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontSize: '18px', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.03em' }}>
            {formatCurrency(vehiculo.precio || 60000, moneda)}
          </span>
          <span style={{ fontSize: '10px', color: c.textSecondary, marginLeft: '3px' }}>
            /{t('catalogo.day')}
          </span>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={handleReservar}
            disabled={!puedeReservar}
            style={{
              width: '100%',
              height: '36px',
              borderRadius: '9px',
              fontSize: '10px',
              fontWeight: 800,
              border: 'none',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              cursor: puedeReservar ? 'pointer' : 'not-allowed',
              background: puedeReservar ? c.accentGradient : c.paginationDisabledBg,
              color: '#ffffff',
              boxShadow: puedeReservar ? '0 5px 14px rgba(37,99,235,0.22)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <FaCar size={11} />
            {puedeReservar ? t('catalogo.reserveNow').toUpperCase() : badgeTexto.toUpperCase()}
          </button>

          <div
            onClick={handleVerDetalles}
            role="button"
            tabIndex={0}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              {t('catalogo.details', 'Ver detalles')}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}