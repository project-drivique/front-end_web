import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { catalogoService } from '../../../services/catalogoService'
import logo from '@/assets/logo/logo.png'

const cop = n => `$${Number(n).toLocaleString('es-CO')}`

export default function VehiculoDetallePage() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { usuario } = useAuthStore()
  const [fotoActiva,  setFotoActiva]  = useState(0)
  const [vehiculo,    setVehiculo]    = useState(null)
  const [cargando,    setCargando]    = useState(true)
  const [error,       setError]       = useState(null)

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#1e3a8a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (error || !vehiculo) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <p style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Vehículo no encontrado</p>
      <Link to="/catalogo" style={{ color: '#1e3a8a', fontWeight: 700, fontSize: 14 }}>← Volver al catálogo</Link>
    </div>
  )

  const estrellas = Array.from({ length: 5 }, (_, i) => i < Math.round(vehiculo.calificacion))

  const handleReservar = () => {
    if (!usuario) { navigate('/login'); return }
    navigate(`/reservations/${vehiculo.id}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', height: 68 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/"><img src={logo} alt="RentaMovil" style={{ height: 40 }} /></Link>
          <div style={{ flex: 1 }} />
          {usuario
            ? <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Hola, {usuario.nombre?.split(' ')[0]} 👋</span>
            : (
              <div style={{ display: 'flex', gap: 10 }}>
                <Link to="/login"    style={{ padding: '8px 18px', borderRadius: 9999, border: '2px solid rgba(30,58,138,0.25)', color: '#1e3a8a', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Iniciar sesión</Link>
                <Link to="/registro" style={{ padding: '8px 18px', borderRadius: 9999, background: '#1e3a8a', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Registrarse</Link>
              </div>
            )
          }
        </div>
      </nav>

      <div style={{ paddingTop: 68, maxWidth: 1280, margin: '0 auto', padding: '88px 24px 40px' }}>

        {/* ── BREADCRUMB ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <Link to="/catalogo" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#1e3a8a', fontWeight: 700, background: 'rgba(30,58,138,0.07)', border: '1px solid rgba(30,58,138,0.15)', borderRadius: 9999, padding: '7px 15px', textDecoration: 'none' }}>
            ← Volver al catálogo
          </Link>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>{vehiculo.nombre}</h1>
        </div>

        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── COLUMNA IZQUIERDA ── */}
          <div style={{ flex: 1, minWidth: 300 }}>

            {/* Imagen */}
            <div style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderRadius: 20, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', marginBottom: 20 }}>
              {vehiculo.imagenes?.[fotoActiva]
                ? <img src={vehiculo.imagenes[fotoActiva]} alt={vehiculo.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <svg width="80" height="80" fill="none" stroke="#1e3a8a" strokeWidth="1.2" viewBox="0 0 24 24" style={{ opacity: 0.25 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
              }
              <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 9999, background: vehiculo.disponible ? '#ecfdf5' : '#fef2f2', color: vehiculo.disponible ? '#059669' : '#dc2626' }}>
                {vehiculo.disponible ? '● Disponible' : '● No disponible'}
              </span>
              {vehiculo.imagenes?.length > 1 && (
                <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                  {vehiculo.imagenes.map((_, i) => (
                    <button key={i} onClick={() => setFotoActiva(i)} style={{ width: i === fotoActiva ? 20 : 8, height: 8, borderRadius: 9999, border: 'none', cursor: 'pointer', background: i === fotoActiva ? '#1e3a8a' : 'rgba(255,255,255,0.8)', padding: 0, transition: 'all 200ms' }} />
                  ))}
                </div>
              )}
            </div>

            {/* Info básica */}
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '22px 24px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1e3a8a', background: '#eff6ff', padding: '3px 9px', borderRadius: 6, marginBottom: 8, display: 'inline-block' }}>{vehiculo.categoria}</span>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '6px 0 8px' }}>{vehiculo.nombre}</h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                {estrellas.map((llena, i) => (
                  <svg key={i} width="14" height="14" fill={llena ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                ))}
                <span style={{ fontSize: 13, color: '#64748b', marginLeft: 4, fontWeight: 600 }}>{vehiculo.calificacion} · {vehiculo.comentarios?.length || 0} reseñas</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                {[
                  { i: '🚪', l: `${vehiculo.puertas} puertas` },
                  { i: '👥', l: `${vehiculo.pasajeros} pasajeros` },
                  { i: '🧳', l: `${vehiculo.maletero}L maletero` },
                  { i: '⚙️', l: vehiculo.transmision },
                  { i: '⛽', l: vehiculo.combustible },
                  { i: '⚡', l: vehiculo.cilindraje },
                  { i: '🎨', l: vehiculo.color },
                  { i: '📅', l: `Año ${vehiculo.año}` },
                  { i: '❄️', l: 'Aire acond.' },
                  { i: '📍', l: vehiculo.sucursal },
                ].map((c, i) => (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: 10, padding: '9px 12px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 15 }}>{c.i}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{c.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tarifas */}
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '22px 24px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>💰 Tarifas</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#475569' }}>Km limitado ({vehiculo.tarifas?.kmLimitado?.km} km/día)</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#1e3a8a' }}>{cop(vehiculo.tarifas?.kmLimitado?.precio)}/día</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                <span style={{ fontSize: 13, color: '#475569' }}>Km ilimitado</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#1e3a8a' }}>{cop(vehiculo.tarifas?.kmIlimitado?.precio)}/día</span>
              </div>
            </div>

            {/* Comentarios */}
            {vehiculo.comentarios?.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '22px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>💬 Reseñas</h3>
                {vehiculo.comentarios.map((c, i) => (
                  <div key={i} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: i < vehiculo.comentarios.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{c.autor}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{c.fecha}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.5 }}>{c.texto}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── COLUMNA DERECHA — PRECIO + BOTÓN ── */}
          <div style={{ width: 300, flexShrink: 0, position: 'sticky', top: 88, alignSelf: 'flex-start' }}>
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
              <div style={{ background: '#1e3a8a', padding: '18px 22px' }}>
                <p style={{ color: '#93c5fd', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 4px' }}>Precio por día</p>
                <p style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0 }}>{cop(vehiculo.precio)}</p>
                <p style={{ color: '#93c5fd', fontSize: 11, margin: '3px 0 0' }}>+ impuestos y seguros</p>
              </div>
              <div style={{ padding: '20px 22px' }}>
                <button
                  onClick={handleReservar}
                  disabled={!vehiculo.disponible}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 13,
                    fontSize: 15, fontWeight: 800, border: 'none',
                    cursor: vehiculo.disponible ? 'pointer' : 'not-allowed',
                    background: vehiculo.disponible ? 'linear-gradient(90deg,#1e3a8a,#2563eb)' : '#e2e8f0',
                    color: vehiculo.disponible ? '#fff' : '#94a3b8',
                    boxShadow: vehiculo.disponible ? '0 6px 20px rgba(30,58,138,0.28)' : 'none',
                    marginBottom: 12,
                  }}
                >
                  {vehiculo.disponible ? '🚗 Reservar ahora' : 'No disponible'}
                </button>
                {!usuario && vehiculo.disponible && (
                  <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', margin: 0 }}>
                    Necesitas <Link to="/login" style={{ color: '#1e3a8a', fontWeight: 700 }}>iniciar sesión</Link> para reservar
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