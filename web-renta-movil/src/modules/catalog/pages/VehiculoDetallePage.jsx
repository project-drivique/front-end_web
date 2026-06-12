import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { catalogoService } from '../../../services/catalogoService'
import { useLanding } from '@/modules/landing/LandingContext'
import Swal from 'sweetalert2'
import logo from '@/assets/logo/logo.png'
import {
  FaCar,
  FaUsers,
  FaSuitcase,
  FaCogs,
  FaGasPump,
  FaBolt,
  FaPalette,
  FaCalendarAlt,
  FaSnowflake,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCommentDots
} from 'react-icons/fa'

const cop = n => `$${Number(n).toLocaleString('es-CO')}`

const COLOR_MARCA = '#1e3a8a'

const coloresDetalle = (esModoOscuro) => ({
  pageBg: esModoOscuro ? '#0f172a' : '#f8fafc',
  navBg: esModoOscuro ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.98)',
  navBorder: esModoOscuro ? '#1e293b' : '#f1f5f9',
  navShadow: esModoOscuro ? '0 1px 8px rgba(0,0,0,0.30)' : '0 1px 8px rgba(0,0,0,0.06)',

  cardBg: esModoOscuro ? '#111827' : '#ffffff',
  cardBorder: esModoOscuro ? '#334155' : '#e2e8f0',
  cardDivider: esModoOscuro ? '#1e293b' : '#f1f5f9',
  cardShadow: esModoOscuro ? '0 6px 24px rgba(0,0,0,0.28)' : '0 2px 12px rgba(0,0,0,0.05)',
  cardShadowStrong: esModoOscuro ? '0 10px 28px rgba(0,0,0,0.32)' : '0 4px 24px rgba(0,0,0,0.07)',

  title: esModoOscuro ? '#f8fafc' : '#0f172a',
  text: esModoOscuro ? '#e2e8f0' : '#334155',
  textSoft: esModoOscuro ? '#cbd5e1' : '#475569',
  textMuted: esModoOscuro ? '#94a3b8' : '#64748b',
  textFaint: esModoOscuro ? '#64748b' : '#94a3b8',

  accent: esModoOscuro ? '#93c5fd' : COLOR_MARCA,
  accentBg: esModoOscuro ? 'rgba(30,58,138,0.22)' : 'rgba(30,58,138,0.07)',
  accentBorder: esModoOscuro ? 'rgba(147,197,253,0.25)' : 'rgba(30,58,138,0.15)',
  accentSoftBg: esModoOscuro ? 'rgba(30,58,138,0.20)' : '#eff6ff',

  imageFallbackBg: esModoOscuro ? 'linear-gradient(135deg,#0f172a,#1e293b)' : 'linear-gradient(135deg,#eff6ff,#dbeafe)',
  imageFallbackStroke: esModoOscuro ? '#93c5fd' : COLOR_MARCA,

  availabilityOkBg: esModoOscuro ? 'rgba(20,83,45,0.24)' : '#ecfdf5',
  availabilityOkText: esModoOscuro ? '#86efac' : '#059669',
  availabilityOffBg: esModoOscuro ? 'rgba(127,29,29,0.22)' : '#fef2f2',
  availabilityOffText: esModoOscuro ? '#fca5a5' : '#dc2626',

  specBg: esModoOscuro ? '#0f172a' : '#f8fafc',
  specBorder: esModoOscuro ? '#1e293b' : '#f1f5f9',
  specIcon: esModoOscuro ? '#cbd5e1' : '#334155',
  specText: esModoOscuro ? '#e2e8f0' : '#334155',

  moneyIcon: esModoOscuro ? '#34d399' : '#059669',
  reviewIcon: esModoOscuro ? '#60a5fa' : '#2563eb',

  sidebarHeaderBg: esModoOscuro ? '#1e3a8a' : '#1e3a8a',
  sidebarHeaderSub: esModoOscuro ? '#bfdbfe' : '#93c5fd',

  reserveDisabledBg: esModoOscuro ? '#334155' : '#e2e8f0',
  reserveDisabledText: esModoOscuro ? '#94a3b8' : '#94a3b8',

  dotActive: esModoOscuro ? '#93c5fd' : COLOR_MARCA,
  dotInactive: esModoOscuro ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.8)',

  star: '#f59e0b',

  spinnerTrack: esModoOscuro ? '#334155' : '#e2e8f0',
  spinnerHead: esModoOscuro ? '#93c5fd' : COLOR_MARCA,
})

export default function VehiculoDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'
  const c = coloresDetalle(esModoOscuro)

  const [fotoActiva, setFotoActiva] = useState(0)
  const [vehiculo, setVehiculo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let activo = true

    const cargar = async () => {
      setCargando(true)
      try {
        const data = await catalogoService.getVehiculoById(id)
        if (activo) {
          setVehiculo(data)
          setError(null)
        }
      } catch {
        if (activo) setError('Vehículo no encontrado')
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargar()
    return () => { activo = false }
  }, [id])

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.pageBg }}>
      <div style={{ width: 40, height: 40, border: `3px solid ${c.spinnerTrack}`, borderTopColor: c.spinnerHead, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (error || !vehiculo) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: c.pageBg, padding: 24 }}>
      <p style={{ fontSize: 20, fontWeight: 800, color: c.title }}>Vehículo no encontrado</p>
      <Link to="/catalogo" style={{ color: c.accent, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>← Volver al catálogo</Link>
    </div>
  )

  const estrellas = Array.from({ length: 5 }, (_, i) => i < Math.round(vehiculo.calificacion))

  const handleReservar = () => {
    if (!usuario) {
      Swal.fire({
        icon: 'warning',
        title: 'Necesitas iniciar sesión',
        text: 'Inicia sesión o regístrate para reservar este vehículo.',
        confirmButtonText: 'Ir a iniciar sesión',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login')
        }
      })
      return
    }
    navigate(`/reservations/${vehiculo.id}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: c.pageBg }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: c.navBg, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${c.navBorder}`, boxShadow: c.navShadow, height: 68 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/"><img src={logo} alt="RentaMovil" style={{ height: 40 }} /></Link>
          <div style={{ flex: 1 }} />
          {usuario
            ? <span style={{ fontSize: 13, color: c.textSoft, fontWeight: 600 }}>Hola, {usuario.nombre?.split(' ')[0]}</span>
            : (
              <div style={{ display: 'flex', gap: 10 }}>
                <Link
                  to="/login"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 9999,
                    border: `2px solid ${c.accentBorder}`,
                    color: c.accent,
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none',
                    background: 'transparent'
                  }}
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 9999,
                    background: COLOR_MARCA,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  Registrarse
                </Link>
              </div>
            )
          }
        </div>
      </nav>

      <div style={{ paddingTop: 68, maxWidth: 1280, margin: '0 auto', padding: '88px 24px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
          <Link
            to="/catalogo"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: c.accent,
              fontWeight: 700,
              background: c.accentBg,
              border: `1px solid ${c.accentBorder}`,
              borderRadius: 9999,
              padding: '7px 15px',
              textDecoration: 'none'
            }}
          >
            ← Volver al catálogo
          </Link>

          <h1 style={{ fontSize: 20, fontWeight: 900, color: c.title, margin: 0 }}>{vehiculo.nombre}</h1>
        </div>

        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ background: c.imageFallbackBg, borderRadius: 20, height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', marginBottom: 20 }}>
              {vehiculo.imagenes?.[fotoActiva]
                ? <img src={vehiculo.imagenes[fotoActiva]} alt={vehiculo.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <svg width="80" height="80" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" style={{ opacity: 0.28, color: c.imageFallbackStroke }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
              }

              <span style={{
                position: 'absolute',
                top: 12,
                left: 12,
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 9999,
                background: vehiculo.disponible ? c.availabilityOkBg : c.availabilityOffBg,
                color: vehiculo.disponible ? c.availabilityOkText : c.availabilityOffText
              }}>
                {vehiculo.disponible ? '● Disponible' : '● No disponible'}
              </span>

              {vehiculo.imagenes?.length > 1 && (
                <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                  {vehiculo.imagenes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFotoActiva(i)}
                      style={{
                        width: i === fotoActiva ? 20 : 8,
                        height: 8,
                        borderRadius: 9999,
                        border: 'none',
                        cursor: 'pointer',
                        background: i === fotoActiva ? c.dotActive : c.dotInactive,
                        padding: 0,
                        transition: 'all 200ms'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: c.cardBg, borderRadius: 20, border: `1px solid ${c.cardBorder}`, padding: '22px 24px', marginBottom: 20, boxShadow: c.cardShadow }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: c.accent, background: c.accentSoftBg, padding: '3px 9px', borderRadius: 6, marginBottom: 8, display: 'inline-block' }}>
                {vehiculo.categoria}
              </span>

              <h2 style={{ fontSize: 22, fontWeight: 900, color: c.title, margin: '6px 0 8px' }}>{vehiculo.nombre}</h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
                {estrellas.map((llena, i) => (
                  <svg key={i} width="14" height="14" fill={llena ? c.star : 'none'} stroke={c.star} strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                ))}
                <span style={{ fontSize: 13, color: c.textMuted, marginLeft: 4, fontWeight: 600 }}>
                  {vehiculo.calificacion} · {vehiculo.comentarios?.length || 0} reseñas
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                {[
                  { i: FaCar, l: `${vehiculo.puertas} puertas` },
                  { i: FaUsers, l: `${vehiculo.pasajeros} pasajeros` },
                  { i: FaSuitcase, l: `${vehiculo.maletero}L maletero` },
                  { i: FaCogs, l: vehiculo.transmision },
                  { i: FaGasPump, l: vehiculo.combustible },
                  { i: FaBolt, l: vehiculo.cilindraje },
                  { i: FaPalette, l: vehiculo.color },
                  { i: FaCalendarAlt, l: `Año ${vehiculo.año}` },
                  { i: FaSnowflake, l: 'Aire acond.' },
                  { i: FaMapMarkerAlt, l: vehiculo.sucursal },
                ].map((item, i) => {
                  const Icono = item.i
                  return (
                    <div key={i} style={{ background: c.specBg, borderRadius: 10, padding: '9px 12px', border: `1px solid ${c.specBorder}`, display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 15, color: c.specIcon, display: 'flex', alignItems: 'center' }}>
                        <Icono />
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: c.specText }}>{item.l}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ background: c.cardBg, borderRadius: 20, border: `1px solid ${c.cardBorder}`, padding: '22px 24px', marginBottom: 20, boxShadow: c.cardShadow }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: c.title, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaMoneyBillWave style={{ color: c.moneyIcon }} />
                Tarifas
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${c.cardDivider}`, gap: 10 }}>
                <span style={{ fontSize: 13, color: c.textSoft }}>Km limitado ({vehiculo.tarifas?.kmLimitado?.km} km/día)</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: c.accent }}>{cop(vehiculo.tarifas?.kmLimitado?.precio)}/día</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', gap: 10 }}>
                <span style={{ fontSize: 13, color: c.textSoft }}>Km ilimitado</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: c.accent }}>{cop(vehiculo.tarifas?.kmIlimitado?.precio)}/día</span>
              </div>
            </div>

            {vehiculo.comentarios?.length > 0 && (
              <div style={{ background: c.cardBg, borderRadius: 20, border: `1px solid ${c.cardBorder}`, padding: '22px 24px', boxShadow: c.cardShadow }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: c.title, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaCommentDots style={{ color: c.reviewIcon }} />
                  Reseñas
                </h3>

                {vehiculo.comentarios.map((item, i) => (
                  <div key={i} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: i < vehiculo.comentarios.length - 1 ? `1px solid ${c.cardDivider}` : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: c.title }}>{item.autor}</span>
                      <span style={{ fontSize: 11, color: c.textFaint }}>{item.fecha}</span>
                    </div>
                    <p style={{ fontSize: 13, color: c.textSoft, margin: 0, lineHeight: 1.5 }}>{item.texto}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ width: 300, flexShrink: 0, position: 'sticky', top: 88, alignSelf: 'flex-start' }}>
            <div style={{ background: c.cardBg, borderRadius: 20, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadowStrong, overflow: 'hidden' }}>
              <div style={{ background: c.sidebarHeaderBg, padding: '18px 22px' }}>
                <p style={{ color: c.sidebarHeaderSub, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 4px' }}>
                  Precio por día
                </p>
                <p style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0 }}>{cop(vehiculo.precio)}</p>
                <p style={{ color: c.sidebarHeaderSub, fontSize: 11, margin: '3px 0 0' }}>+ impuestos y seguros</p>
              </div>

              <div style={{ padding: '20px 22px' }}>
                <button
                  onClick={handleReservar}
                  disabled={!vehiculo.disponible}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 13,
                    fontSize: 15,
                    fontWeight: 800,
                    border: 'none',
                    cursor: vehiculo.disponible ? 'pointer' : 'not-allowed',
                    background: vehiculo.disponible ? 'linear-gradient(90deg,#1e3a8a,#2563eb)' : c.reserveDisabledBg,
                    color: vehiculo.disponible ? '#fff' : c.reserveDisabledText,
                    boxShadow: vehiculo.disponible ? '0 6px 20px rgba(30,58,138,0.28)' : 'none',
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  {vehiculo.disponible ? (
                    <>
                      <FaCar />
                      Reservar ahora
                    </>
                  ) : 'No disponible'}
                </button>

                {!usuario && vehiculo.disponible && (
                  <p style={{ fontSize: 11, color: c.textFaint, textAlign: 'center', margin: 0 }}>
                    Necesitas <Link to="/login" style={{ color: c.accent, fontWeight: 700, textDecoration: 'none' }}>iniciar sesión</Link> para reservar
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}