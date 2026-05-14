import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import logo from '@/assets/logo/logo.png'

/* ─── MOCK de vehículos ─── */
const VEHICULOS_MOCK = [
  {
    id: 1, nombre: 'Toyota Corolla 2024', categoria: 'Sedan',
    transmision: 'Automática', combustible: 'Gasolina', precio: 85000,
    calificacion: 4.8, disponible: true, imagen: null,
    puertas: 4, pasajeros: 5, maletero: 470, cilindraje: '1.8L',
    color: 'Blanco Perla', año: 2024, placa: 'ABC-123',
    tarifas: {
      kmLimitado: { km: 200, precio: 85000, excedente: 800 },
      kmIlimitado: { precio: 105000 },
    },
    seguros: [
      { nombre: 'Básico',    cobertura: 'Responsabilidad civil',          precio: 0     },
      { nombre: 'Estándar',  cobertura: 'Todo riesgo con deducible',      precio: 25000 },
      { nombre: 'Premium',   cobertura: 'Todo riesgo sin deducible',      precio: 45000 },
    ],
    servicios: [
      { nombre: 'GPS',                  precio: 15000 },
      { nombre: 'Silla bebé',           precio: 20000 },
      { nombre: 'Conductor adicional',  precio: 30000 },
    ],
    sucursal: 'Centro Neiva',
    imagenes: [null, null, null],
    disponibilidad: { ocupados: ['2026-05-20','2026-05-21','2026-05-22','2026-05-28','2026-05-29'] },
    comentarios: [
      { autor: 'Carlos M.',  calificacion: 5, texto: 'Excelente vehículo, muy cómodo y puntual en la entrega.', fecha: '2026-04-10' },
      { autor: 'Laura P.',   calificacion: 4, texto: 'Buen servicio, el carro en perfectas condiciones.',       fecha: '2026-03-22' },
      { autor: 'Andrés R.',  calificacion: 5, texto: 'Lo recomiendo totalmente, volveré a alquilar.',           fecha: '2026-03-05' },
    ],
  },
  { id: 2, nombre: 'Mazda CX-5 2024',       categoria: 'SUV',       transmision: 'Automática', combustible: 'Gasolina', precio: 145000, calificacion: 4.9, disponible: true,  imagen: null, puertas: 5, pasajeros: 5, maletero: 442, cilindraje: '2.5L',        color: 'Soul Red Crystal',     año: 2024, placa: 'DEF-456', tarifas: { kmLimitado: { km: 250, precio: 145000, excedente: 1000 }, kmIlimitado: { precio: 175000 } }, seguros: [{ nombre: 'Básico', cobertura: 'Responsabilidad civil', precio: 0 }, { nombre: 'Premium', cobertura: 'Todo riesgo sin deducible', precio: 55000 }], servicios: [{ nombre: 'GPS', precio: 15000 }, { nombre: 'Silla bebé', precio: 20000 }], sucursal: 'Aeropuerto Neiva',        imagenes: [null,null,null], disponibilidad: { ocupados: ['2026-05-15','2026-05-16'] },               comentarios: [{ autor: 'María F.',    calificacion: 5, texto: 'Increíble SUV, perfecto para carretera.',                    fecha: '2026-04-18' }] },
  { id: 3, nombre: 'Chevrolet Spark 2023',   categoria: 'Económico', transmision: 'Manual',     combustible: 'Gasolina', precio: 60000,  calificacion: 4.5, disponible: true,  imagen: null, puertas: 4, pasajeros: 4, maletero: 170, cilindraje: '1.0L',        color: 'Rojo Passion',         año: 2023, placa: 'GHI-789', tarifas: { kmLimitado: { km: 150, precio: 60000,  excedente: 600  }, kmIlimitado: { precio: 75000  } }, seguros: [{ nombre: 'Básico', cobertura: 'Responsabilidad civil', precio: 0 }, { nombre: 'Estándar', cobertura: 'Todo riesgo con deducible', precio: 18000 }], servicios: [{ nombre: 'GPS', precio: 15000 }], sucursal: 'Terminal de Transportes', imagenes: [null,null,null], disponibilidad: { ocupados: [] },                                       comentarios: [{ autor: 'Jorge L.',    calificacion: 4, texto: 'Económico y fácil de conducir en ciudad.',                  fecha: '2026-04-01' }] },
  { id: 4, nombre: 'Ford Mustang GT 2023',   categoria: 'Deportivo', transmision: 'Automática', combustible: 'Gasolina', precio: 220000, calificacion: 4.7, disponible: false, imagen: null, puertas: 2, pasajeros: 4, maletero: 382, cilindraje: '5.0L V8',     color: 'Race Red',             año: 2023, placa: 'JKL-012', tarifas: { kmLimitado: { km: 300, precio: 220000, excedente: 1500 }, kmIlimitado: { precio: 260000 } }, seguros: [{ nombre: 'Premium', cobertura: 'Todo riesgo sin deducible', precio: 70000 }],                                                                                    servicios: [{ nombre: 'GPS', precio: 15000 }, { nombre: 'Conductor adicional', precio: 30000 }], sucursal: 'Centro Neiva',            imagenes: [null,null,null], disponibilidad: { ocupados: [] },                                       comentarios: [] },
  { id: 5, nombre: 'Toyota Prado 2024',      categoria: 'SUV',       transmision: 'Automática', combustible: 'Diesel',   precio: 180000, calificacion: 4.6, disponible: true,  imagen: null, puertas: 5, pasajeros: 8, maletero: 390, cilindraje: '2.8L Diesel',  color: 'Super White',          año: 2024, placa: 'MNO-345', tarifas: { kmLimitado: { km: 300, precio: 180000, excedente: 1200 }, kmIlimitado: { precio: 215000 } }, seguros: [{ nombre: 'Básico', cobertura: 'Responsabilidad civil', precio: 0 }, { nombre: 'Premium', cobertura: 'Todo riesgo sin deducible', precio: 60000 }],  servicios: [{ nombre: 'GPS', precio: 15000 }, { nombre: 'Silla bebé', precio: 20000 }, { nombre: 'Conductor adicional', precio: 30000 }], sucursal: 'Norte Neiva', imagenes: [null,null,null], disponibilidad: { ocupados: ['2026-05-25','2026-05-26','2026-05-27'] },  comentarios: [{ autor: 'Sandra V.',   calificacion: 5, texto: 'Perfecto para viajes largos con familia.',                  fecha: '2026-04-20' }] },
  { id: 6, nombre: 'Renault Sandero 2023',   categoria: 'Económico', transmision: 'Manual',     combustible: 'Gasolina', precio: 55000,  calificacion: 4.3, disponible: true,  imagen: null, puertas: 5, pasajeros: 5, maletero: 320, cilindraje: '1.6L',        color: 'Gris Highland',        año: 2023, placa: 'PQR-678', tarifas: { kmLimitado: { km: 150, precio: 55000,  excedente: 550  }, kmIlimitado: { precio: 68000  } }, seguros: [{ nombre: 'Básico', cobertura: 'Responsabilidad civil', precio: 0 }],                                                                                        servicios: [{ nombre: 'GPS', precio: 15000 }], sucursal: 'Sur Neiva',               imagenes: [null,null,null], disponibilidad: { ocupados: [] },                                       comentarios: [] },
  { id: 7, nombre: 'Hyundai Tucson 2024',    categoria: 'SUV',       transmision: 'Automática', combustible: 'Híbrido',  precio: 160000, calificacion: 4.8, disponible: true,  imagen: null, puertas: 5, pasajeros: 5, maletero: 513, cilindraje: '1.6L Híbrido', color: 'Phantom Black',        año: 2024, placa: 'STU-901', tarifas: { kmLimitado: { km: 250, precio: 160000, excedente: 1100 }, kmIlimitado: { precio: 192000 } }, seguros: [{ nombre: 'Básico', cobertura: 'Responsabilidad civil', precio: 0 }, { nombre: 'Estándar', cobertura: 'Todo riesgo con deducible', precio: 40000 }, { nombre: 'Premium', cobertura: 'Todo riesgo sin deducible', precio: 60000 }], servicios: [{ nombre: 'GPS', precio: 15000 }, { nombre: 'Silla bebé', precio: 20000 }], sucursal: 'Aeropuerto Neiva', imagenes: [null,null,null], disponibilidad: { ocupados: ['2026-05-30','2026-05-31'] },            comentarios: [{ autor: 'Valentina C.',calificacion: 5, texto: 'El híbrido es increíble, muy eficiente en combustible.',   fecha: '2026-05-01' }] },
  { id: 8, nombre: 'Kia Cerato 2024',        categoria: 'Sedan',     transmision: 'Automática', combustible: 'Gasolina', precio: 95000,  calificacion: 4.4, disponible: true,  imagen: null, puertas: 4, pasajeros: 5, maletero: 502, cilindraje: '2.0L',        color: 'Snow White Pearl',     año: 2024, placa: 'VWX-234', tarifas: { kmLimitado: { km: 200, precio: 95000,  excedente: 900  }, kmIlimitado: { precio: 115000 } }, seguros: [{ nombre: 'Básico', cobertura: 'Responsabilidad civil', precio: 0 }, { nombre: 'Estándar', cobertura: 'Todo riesgo con deducible', precio: 28000 }],  servicios: [{ nombre: 'GPS', precio: 15000 }, { nombre: 'Conductor adicional', precio: 30000 }], sucursal: 'Centro Neiva',    imagenes: [null,null,null], disponibilidad: { ocupados: [] },                                       comentarios: [{ autor: 'Ricardo T.',  calificacion: 4, texto: 'Buen espacio interior, cómodo para la ciudad.',            fecha: '2026-04-15' }] },
]

/* ─── ÍCONOS ─── */
const IconoCarro = () => (
  <svg width="48" height="48" fill="none" stroke="#1e3a8a" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
  </svg>
)

const IconoEstrella = ({ llena }) => (
  <svg width="16" height="16" fill={llena ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
)

/* ─── HELPERS CALENDARIO ─── */
function generarCalendario(año, mes, ocupados) {
  const primerDia  = new Date(año, mes, 1).getDay()
  const diasEnMes  = new Date(año, mes + 1, 0).getDate()
  const hoy        = new Date()
  const celdas     = []
  for (let i = 0; i < primerDia; i++) celdas.push(null)
  for (let d = 1; d <= diasEnMes; d++) {
    const fechaStr = `${año}-${String(mes + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const fecha    = new Date(año, mes, d)
    const esPasado = fecha < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
    celdas.push({ dia: d, fechaStr, ocupado: ocupados.includes(fechaStr), pasado: esPasado })
  }
  return celdas
}

const MESES      = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_SEM   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

/* ─── BOTÓN RESERVAR — declarado FUERA del componente principal ─── */
function BtnReservar({ onReservar, disponible }) {
  return (
    <button
      onClick={onReservar}
      disabled={!disponible}
      style={{
        padding: '14px 32px', borderRadius: '14px', fontSize: '15px', fontWeight: 800,
        border: 'none', cursor: disponible ? 'pointer' : 'not-allowed',
        background: disponible ? 'linear-gradient(90deg,#1e3a8a,#2563eb)' : '#e2e8f0',
        color: disponible ? '#fff' : '#94a3b8',
        boxShadow: disponible ? '0 4px 18px rgba(30,58,138,0.30)' : 'none',
        transition: 'all 200ms',
        minWidth: '200px',
      }}
    >
      {disponible ? '🚗 Reservar ahora' : 'No disponible'}
    </button>
  )
}

/* ─── COMPONENTE PRINCIPAL ─── */
export default function VehiculoDetallePage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { usuario }  = useAuthStore()

  const vehiculo = VEHICULOS_MOCK.find(v => v.id === Number(id))

  const [fotoActiva,    setFotoActiva]    = useState(0)
  const [fotoAmpliada,  setFotoAmpliada]  = useState(false)
  const [tipoKm,        setTipoKm]        = useState('limitado')
  const [seguroSel,     setSeguroSel]     = useState(0)
  const [serviciosSel,  setServiciosSel]  = useState([])
  const hoy = new Date()
  const [calMes,  setCalMes]  = useState(hoy.getMonth())
  const [calAño,  setCalAño]  = useState(hoy.getFullYear())

  if (!vehiculo) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <h2 style={{ color: '#0f172a', fontSize: '20px', fontWeight: 800 }}>Vehículo no encontrado</h2>
        <button
          onClick={() => navigate('/catalogo')}
          style={{ padding: '10px 24px', borderRadius: '12px', background: '#1e3a8a', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
        >
          Volver al catálogo
        </button>
      </div>
    )
  }

  const tarifaBase       = tipoKm === 'limitado' ? vehiculo.tarifas.kmLimitado.precio : vehiculo.tarifas.kmIlimitado.precio
  const precioSeguro     = vehiculo.seguros[seguroSel]?.precio || 0
  const precioServicios  = serviciosSel.reduce((acc, i) => acc + (vehiculo.servicios[i]?.precio || 0), 0)
  const totalDia         = tarifaBase + precioSeguro + precioServicios

  const celdas = generarCalendario(calAño, calMes, vehiculo.disponibilidad.ocupados)

  const toggleServicio = (i) =>
    setServiciosSel(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])

  const handleReservar = () => {
    if (!usuario) {
      navigate('/login', { state: { from: `/catalogo/${vehiculo.id}`, mensaje: 'Inicia sesión para reservar este vehículo.' } })
      return
    }
    navigate('/reserva', { state: { vehiculoId: vehiculo.id } })
  }

  /* ── Estilos reutilizables ── */
  const card = {
    background: '#fff', borderRadius: '20px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    padding: '24px', marginBottom: '24px',
  }
  const secTitulo = { fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px' }
  const chipStyle = (activo) => ({
    padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
    cursor: 'pointer', border: `2px solid ${activo ? '#1e3a8a' : '#e2e8f0'}`,
    background: activo ? '#eff6ff' : '#fff', color: activo ? '#1e3a8a' : '#64748b',
    transition: 'all 150ms',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        height: '68px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/"><img src={logo} alt="RentaMovil" style={{ height: '40px', flexShrink: 0 }} /></Link>
          <div style={{ flex: 1 }} />
          {usuario ? (
            <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>Hola, {usuario.nombre?.split(' ')[0]} 👋</span>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login"    style={{ padding: '8px 20px', borderRadius: '9999px', border: '2px solid rgba(30,58,138,0.25)', color: '#1e3a8a', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Iniciar sesión</Link>
              <Link to="/registro" style={{ padding: '8px 20px', borderRadius: '9999px', background: '#1e3a8a', color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Registrarse</Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── MODAL FOTO AMPLIADA ── */}
      {fotoAmpliada && (
        <div
          onClick={() => setFotoAmpliada(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ width: '90vw', maxWidth: '800px', aspectRatio: '16/9', background: 'linear-gradient(135deg,#1e3a8a22,#2563eb22)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ opacity: 0.4 }}><IconoCarro /></div>
          </div>
          <button
            onClick={() => setFotoAmpliada(false)}
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer', borderRadius: '50%', width: '44px', height: '44px' }}
          >✕</button>
        </div>
      )}

      <div style={{ paddingTop: '68px', flex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: '#64748b' }}>
            <Link to="/catalogo" style={{ color: '#1e3a8a', fontWeight: 700, textDecoration: 'none' }}>← Volver al catálogo</Link>
            <span>/</span>
            <span>{vehiculo.nombre}</span>
          </div>

          {/* ── ENCABEZADO + BOTÓN RESERVAR SUPERIOR ── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, color: '#1e3a8a', background: '#eff6ff', padding: '4px 12px', borderRadius: '9999px', marginBottom: '8px' }}>{vehiculo.categoria}</span>
              <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>{vehiculo.nombre}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {Array.from({ length: 5 }, (_, i) => i < Math.round(vehiculo.calificacion)).map((llena, i) =>
                    <IconoEstrella key={i} llena={llena} />
                  )}
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginLeft: '4px' }}>
                    {vehiculo.calificacion} ({vehiculo.comentarios.length} reseñas)
                  </span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', background: vehiculo.disponible ? '#ecfdf5' : '#fef2f2', color: vehiculo.disponible ? '#059669' : '#dc2626' }}>
                  {vehiculo.disponible ? '● Disponible' : '● No disponible'}
                </span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>📍 {vehiculo.sucursal}</span>
              </div>
            </div>
            {/* BOTÓN SUPERIOR */}
            <BtnReservar onReservar={handleReservar} disponible={vehiculo.disponible} />
          </div>

          {/* ── GALERÍA ── */}
          <div style={card}>
            <h2 style={secTitulo}>📸 Galería de fotos</h2>
            <div
              onClick={() => setFotoAmpliada(true)}
              style={{ width: '100%', aspectRatio: '16/9', maxHeight: '420px', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-in', overflow: 'hidden', marginBottom: '12px', position: 'relative' }}
            >
              {vehiculo.imagenes[fotoActiva]
                ? <img src={vehiculo.imagenes[fotoActiva]} alt={vehiculo.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ opacity: 0.4 }}><IconoCarro /></div>
              }
              <span style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '9999px' }}>
                🔍 Click para ampliar
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {vehiculo.imagenes.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setFotoActiva(i)}
                  style={{ width: '90px', height: '64px', borderRadius: '10px', background: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `2.5px solid ${fotoActiva === i ? '#1e3a8a' : 'transparent'}`, flexShrink: 0, overflow: 'hidden' }}
                >
                  {img
                    ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ opacity: 0.3, transform: 'scale(0.5)' }}><IconoCarro /></div>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* ── LAYOUT DOS COLUMNAS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }} className="detalle-grid">

            {/* ── COLUMNA IZQUIERDA ── */}
            <div>

              {/* Características técnicas */}
              <div style={card}>
                <h2 style={secTitulo}>⚙️ Características técnicas</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: '12px' }}>
                  {[
                    { icon: '🚪', label: 'Puertas',      val: vehiculo.puertas      },
                    { icon: '👥', label: 'Pasajeros',     val: vehiculo.pasajeros    },
                    { icon: '🧳', label: 'Maletero',      val: `${vehiculo.maletero}L` },
                    { icon: '🔧', label: 'Cilindraje',    val: vehiculo.cilindraje   },
                    { icon: '⚙️', label: 'Transmisión',   val: vehiculo.transmision  },
                    { icon: '⛽', label: 'Combustible',   val: vehiculo.combustible  },
                    { icon: '🎨', label: 'Color',         val: vehiculo.color        },
                    { icon: '📅', label: 'Año',           val: vehiculo.año          },
                    { icon: '🔖', label: 'Placa',         val: vehiculo.placa        },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{item.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tarifas */}
              <div style={card}>
                <h2 style={secTitulo}>💰 Tarifas</h2>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <button style={chipStyle(tipoKm === 'limitado')}   onClick={() => setTipoKm('limitado')}>
                    Km limitado ({vehiculo.tarifas.kmLimitado.km} km/día)
                  </button>
                  <button style={chipStyle(tipoKm === 'ilimitado')}  onClick={() => setTipoKm('ilimitado')}>
                    Km ilimitado
                  </button>
                </div>
                {tipoKm === 'limitado' ? (
                  <div style={{ background: '#eff6ff', borderRadius: '14px', padding: '16px', border: '1px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#1e3a8a', fontWeight: 700 }}>Tarifa diaria</span>
                      <span style={{ fontSize: '22px', fontWeight: 900, color: '#1e3a8a' }}>${vehiculo.tarifas.kmLimitado.precio.toLocaleString('es-CO')}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Incluye {vehiculo.tarifas.kmLimitado.km} km/día · Excedente: ${vehiculo.tarifas.kmLimitado.excedente.toLocaleString('es-CO')}/km
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#f0fdf4', borderRadius: '14px', padding: '16px', border: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#059669', fontWeight: 700 }}>Tarifa diaria</span>
                      <span style={{ fontSize: '22px', fontWeight: 900, color: '#059669' }}>${vehiculo.tarifas.kmIlimitado.precio.toLocaleString('es-CO')}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Sin límite de kilómetros por día</div>
                  </div>
                )}
              </div>

              {/* Seguros */}
              <div style={card}>
                <h2 style={secTitulo}>🛡️ Seguros disponibles</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {vehiculo.seguros.map((seg, i) => (
                    <div
                      key={i}
                      onClick={() => setSeguroSel(i)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '14px', border: `2px solid ${seguroSel === i ? '#1e3a8a' : '#e2e8f0'}`, background: seguroSel === i ? '#eff6ff' : '#fff', cursor: 'pointer', transition: 'all 150ms' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${seguroSel === i ? '#1e3a8a' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {seguroSel === i && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1e3a8a' }} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{seg.nombre}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{seg.cobertura}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: seg.precio === 0 ? '#059669' : '#1e3a8a', whiteSpace: 'nowrap' }}>
                        {seg.precio === 0 ? 'Incluido' : `+$${seg.precio.toLocaleString('es-CO')}/día`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Servicios adicionales */}
              {vehiculo.servicios.length > 0 && (
                <div style={card}>
                  <h2 style={secTitulo}>➕ Servicios adicionales</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {vehiculo.servicios.map((srv, i) => (
                      <div
                        key={i}
                        onClick={() => toggleServicio(i)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '14px', border: `2px solid ${serviciosSel.includes(i) ? '#1e3a8a' : '#e2e8f0'}`, background: serviciosSel.includes(i) ? '#eff6ff' : '#fff', cursor: 'pointer', transition: 'all 150ms' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${serviciosSel.includes(i) ? '#1e3a8a' : '#cbd5e1'}`, background: serviciosSel.includes(i) ? '#1e3a8a' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {serviciosSel.includes(i) && (
                              <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{srv.nombre}</span>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#1e3a8a', whiteSpace: 'nowrap' }}>
                          +${srv.precio.toLocaleString('es-CO')}/día
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendario de disponibilidad */}
              <div style={card}>
                <h2 style={secTitulo}>📅 Disponibilidad</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <button
                    onClick={() => { if (calMes === 0) { setCalMes(11); setCalAño(y => y - 1) } else setCalMes(m => m - 1) }}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#1e3a8a', fontSize: '18px' }}
                  >‹</button>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{MESES[calMes]} {calAño}</span>
                  <button
                    onClick={() => { if (calMes === 11) { setCalMes(0); setCalAño(y => y + 1) } else setCalMes(m => m + 1) }}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#1e3a8a', fontSize: '18px' }}
                  >›</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '8px' }}>
                  {DIAS_SEM.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#94a3b8', padding: '4px 0' }}>{d}</div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
                  {celdas.map((celda, i) => (
                    <div key={i} style={{
                      aspectRatio: '1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 600,
                      background: !celda ? 'transparent' : celda.ocupado ? '#fee2e2' : celda.pasado ? '#f8fafc' : '#f0fdf4',
                      color:      !celda ? 'transparent' : celda.ocupado ? '#dc2626' : celda.pasado ? '#cbd5e1' : '#059669',
                      textDecoration: celda?.pasado ? 'line-through' : 'none',
                    }}>
                      {celda?.dia || ''}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#f0fdf4', border: '1px solid #bbf7d0' }} />
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Disponible</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#fee2e2', border: '1px solid #fecaca' }} />
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Ocupado</span>
                  </div>
                </div>
              </div>

              {/* Calificaciones y comentarios */}
              {vehiculo.comentarios.length > 0 && (
                <div style={card}>
                  <h2 style={secTitulo}>⭐ Calificaciones y comentarios</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '16px', background: '#eff6ff', borderRadius: '14px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '36px', fontWeight: 900, color: '#1e3a8a', lineHeight: 1 }}>{vehiculo.calificacion}</div>
                      <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginTop: '4px' }}>
                        {Array.from({ length: 5 }, (_, i) => i < Math.round(vehiculo.calificacion)).map((llena, i) =>
                          <IconoEstrella key={i} llena={llena} />
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{vehiculo.comentarios.length} reseñas</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {vehiculo.comentarios.map((c, i) => (
                      <div key={i} style={{ padding: '16px', borderRadius: '14px', border: '1px solid #f1f5f9', background: '#fafafa' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 800 }}>
                              {c.autor.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{c.autor}</div>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {Array.from({ length: 5 }, (_, j) => j < c.calificacion).map((llena, j) =>
                                  <IconoEstrella key={j} llena={llena} />
                                )}
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{c.fecha}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.6 }}>{c.texto}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── COLUMNA DERECHA — resumen sticky ── */}
            <div style={{ position: 'sticky', top: '84px' }}>
              <div style={{ ...card, marginBottom: 0, border: '2px solid #bfdbfe' }}>
                <h2 style={{ ...secTitulo, marginBottom: '16px' }}>💳 Resumen de precio</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                    <span>Tarifa ({tipoKm === 'limitado' ? 'km limitado' : 'km ilimitado'})</span>
                    <span style={{ fontWeight: 700 }}>${tarifaBase.toLocaleString('es-CO')}/día</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                    <span>Seguro {vehiculo.seguros[seguroSel]?.nombre}</span>
                    <span style={{ fontWeight: 700 }}>
                      {precioSeguro === 0 ? 'Incluido' : `+$${precioSeguro.toLocaleString('es-CO')}/día`}
                    </span>
                  </div>
                  {serviciosSel.map(i => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                      <span>{vehiculo.servicios[i]?.nombre}</span>
                      <span style={{ fontWeight: 700 }}>+${vehiculo.servicios[i]?.precio.toLocaleString('es-CO')}/día</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1.5px solid #e2e8f0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Total/día</span>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#1e3a8a' }}>${totalDia.toLocaleString('es-CO')}</span>
                  </div>
                </div>
                {/* BOTÓN DERECHA */}
                <BtnReservar onReservar={handleReservar} disponible={vehiculo.disponible} />
                {!usuario && vehiculo.disponible && (
                  <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', margin: '10px 0 0', lineHeight: 1.5 }}>
                    Se te pedirá iniciar sesión para continuar
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── BOTÓN RESERVAR INFERIOR ── */}
          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
            <BtnReservar onReservar={handleReservar} disponible={vehiculo.disponible} />
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .detalle-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}