import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { showAlert } from '@/utils/swalConfig'
import { useLanding } from '../../landing/LandingContext'
import { formatCurrency } from '@/utils/monedaUtils'
import {
  FaHeart,
  FaRegHeart,
  FaSnowflake,
  FaBolt,
  FaLock,
  FaSuitcase,
  FaCogs,
  FaGasPump,
  FaUsers,
  FaCar,
  FaShieldAlt,
  FaMoneyBillWave,
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

function getCarIcon(item) {
  return item.icono || FaCogs
}

function normalizeCaracteristicas(vehiculo) {
  if (Array.isArray(vehiculo.caracteristicas) && vehiculo.caracteristicas.length > 0) return vehiculo.caracteristicas
  if (Array.isArray(vehiculo.detalles) && vehiculo.detalles.length > 0) return vehiculo.detalles
  return [
    { icono: FaSnowflake, label: 'Aire acondicionado' },
    { icono: FaBolt, label: 'Eleva vidrios eléctrico' },
    { icono: FaLock, label: 'Cierre centralizado' },
    { icono: FaSuitcase, label: `${vehiculo.maletero ?? 0}L maletero` },
    { icono: FaCogs, label: vehiculo.transmision || 'Manual' },
    { icono: FaGasPump, label: vehiculo.combustible || 'Gasolina' },
    { icono: FaUsers, label: `${vehiculo.pasajeros ?? 4} personas` },
  ]
}

function normalizeTarifas(vehiculo) {
  const t = vehiculo.tarifas || {}
  return {
    kmLimitado: {
      km: t.kmLimitado?.km ?? 150,
      precio: t.kmLimitado?.precio ?? 0,
    },
    kmIlimitado: {
      precio: t.kmIlimitado?.precio ?? 0,
    },
  }
}

function normalizeSeguros(vehiculo) {
  if (Array.isArray(vehiculo.seguros) && vehiculo.seguros.length > 0) return vehiculo.seguros
  return []
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
}) {
  const navigate = useNavigate()
  const { moneda } = useLanding()
  const [hover, setHover] = useState(false)
  const [verDetalles, setVerDetalles] = useState(false)
  const [fotoActiva, setFotoActiva] = useState(0)

  const imagenes = getSafeImages(vehiculo)
  const caracteristicas = normalizeCaracteristicas(vehiculo)
  const tarifas = normalizeTarifas(vehiculo)
  const seguros = normalizeSeguros(vehiculo)
  const rating = normalizeRating(vehiculo)
  const estadoDisponible = vehiculo.disponible !== false

  const handleReservar = () => {
    if (invitado) {
      showAlert({
        icon: 'info',
        title: 'Registro Requerido',
        text: 'Para realizar o continuar con una reserva, necesitas tener una cuenta. Regístrate o inicia sesión.',
        confirmButtonText: 'Ir a registro',
        showCancelButton: true,
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/registro')
        }
      })
      return
    }
    navigate(`/catalogo/${vehiculo.id}`)
  }

  const handleFavoritoClick = (e) => {
    e.stopPropagation()
    if (invitado) {
      showAlert({
        icon: 'info',
        title: 'Favoritos solo para usuarios',
        text: 'Inicia sesión o regístrate para guardar vehículos en favoritos.',
        confirmButtonText: 'Ir a iniciar sesión',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login')
        }
      })
      return
    }
    onFavorito()
  }

  const estrellas = Array.from({ length: 5 }, (_, i) => i < Math.round(rating))
  const imagenActual = imagenes[fotoActiva] || ''

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: c.panelBg,
        borderRadius: '20px',
        border: `1.5px solid ${hover ? c.cardBorderHover : c.cardBorder}`,
        boxShadow: destacado ? (hover ? '0 16px 40px rgba(37,99,235,0.24)' : '0 10px 26px rgba(37,99,235,0.16)') : (hover ? c.cardShadowHover : c.cardShadow),
        overflow: 'hidden',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease',
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'flex-start',
        width: '100%',
        maxWidth: '350px',
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
            background: estadoDisponible ? '#e6f4ea' : '#fce8e6',
            color: estadoDisponible ? '#137333' : '#c5221f',
            border: `1px solid ${estadoDisponible ? '#ceead6' : '#fad2cf'}`,
          }}
        >
          {estadoDisponible ? 'Disponible' : 'No disponible'}
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
                onClick={() => setFotoActiva(i)}
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

      <div style={{ position: 'relative', height: '340px', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            opacity: verDetalles ? 0 : 1,
            transform: verDetalles ? 'translateX(-24px)' : 'translateX(0)',
            transition: 'opacity 220ms ease, transform 220ms ease',
            pointerEvents: verDetalles ? 'none' : 'all',
          }}
        >
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
              {vehiculo.transmision}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: c.textSecondary }}>
              <FaGasPump style={{ color: c.textMuted }} />
              {vehiculo.combustible}
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
            <span style={{ fontSize: '12px', color: c.textSoft, marginLeft: '4px' }}>/día</span>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={handleReservar}
              disabled={!estadoDisponible}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 800,
                border: 'none',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: estadoDisponible ? 'pointer' : 'not-allowed',
                background: estadoDisponible ? c.accentGradient : c.paginationDisabledBg,
                color: '#fff',
                boxShadow: estadoDisponible ? '0 4px 14px rgba(37,99,235,0.25)' : 'none',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <FaCar />
              RESERVAR AHORA
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setVerDetalles(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#2563eb',
                  textDecoration: 'underline',
                  marginBottom: '30px',
                  padding: 0,
                }}
              >
                Ver detalles
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            overflowY: 'auto',
            opacity: verDetalles ? 1 : 0,
            transform: verDetalles ? 'translateX(0)' : 'translateX(24px)',
            transition: 'opacity 220ms ease, transform 220ms ease',
            pointerEvents: verDetalles ? 'all' : 'none',
          }}
        >
          <div style={{ textAlign: 'center', flexShrink: 0, marginBottom: '4px' }}>
            <button
              onClick={() => setVerDetalles(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700,
                color: '#2563eb',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Ocultar detalles
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', flexShrink: 0 }}>
            {caracteristicas.map((item, i) => {
              const Icono = getCarIcon(item)
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    padding: '7px 8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <span style={{ fontSize: '14px', flexShrink: 0, color: '#64748b', display: 'flex', alignItems: 'center' }}>
                    <Icono />
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#334155', lineHeight: 1.3 }}>{item.label}</span>
                </div>
              )
            })}
          </div>

          <div style={{ background: '#f4fbf7', borderRadius: '8px', padding: '10px', border: '1px solid #ccf1dc', flexShrink: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#137333', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaMoneyBillWave />
              TARIFAS
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#334155', marginBottom: '4px' }}>
              <span>Km limitado ({tarifas.kmLimitado.km} km/día)</span>
              <span style={{ fontWeight: 800 }}>{formatCurrency(tarifas.kmLimitado.precio || 55000, moneda)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#334155' }}>
              <span>Km ilimitado</span>
              <span style={{ fontWeight: 800 }}>{formatCurrency(tarifas.kmIlimitado.precio || 68000, moneda)}</span>
            </div>
          </div>

          <div style={{ background: '#f0f4ff', borderRadius: '8px', padding: '10px', border: '1px solid #ccd9ff', flexShrink: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaShieldAlt />
              SEGUROS
            </div>
            {seguros.length > 0 ? (
              seguros.map((seg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#334155', marginBottom: i < seguros.length - 1 ? '4px' : 0 }}>
                  <span style={{ fontWeight: 600 }}>{seg.nombre}</span>
                  <span style={{ fontWeight: 800, color: '#1e3a8a' }}>
                    {formatCurrency(seg.precio, moneda)}/día
                  </span>
                </div>
              ))
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#334155', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>Protección Obligatoria</span>
                  <span style={{ fontWeight: 800, color: '#1e3a8a' }}>{formatCurrency(29000, moneda)}/día</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#334155' }}>
                  <span style={{ fontWeight: 600 }}>Protección Total</span>
                  <span style={{ fontWeight: 800, color: '#1e3a8a' }}>{formatCurrency(67000, moneda)}/día</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}