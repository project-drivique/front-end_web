import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaHeart,
  FaRegHeart,
  FaMoneyBillWave,
  FaShieldAlt,
  FaSnowflake,
  FaWindowRestore,
  FaLock,
  FaCarSide,
  FaCog,
  FaGasPump,
  FaUsers,
  FaWrench,
} from 'react-icons/fa'

const iconMap = {
  aire_acondicionado: FaSnowflake,
  eleva_vidrios: FaWindowRestore,
  cierre_centralizado: FaLock,
  maletero: FaCarSide,
  transmision: FaCog,
  combustible: FaGasPump,
  personas: FaUsers,
}

const getItemIcon = (item) => {
  if (item.icono) return item.icono
  if (item.tipo && iconMap[item.tipo]) return iconMap[item.tipo]
  return FaWrench
}

export default function TarjetaVehiculo({ vehiculo, esFavorito, onFavorito, c, invitado = false }) {
  const [verDetalles, setVerDetalles] = useState(false)
  const navigate = useNavigate()

  const imagenSrc = vehiculo.imagen || vehiculo.imagenes?.[0] || ''
  const caracteristicas = vehiculo.caracteristicas || vehiculo.detalles || []
  const tarifas = vehiculo.tarifas || null
  const seguros = vehiculo.seguros || []

  const handleReservar = () => {
    navigate(`/catalogo/${vehiculo.id}`)
  }

  return (
    <div
      style={{
        background: c.panelBg,
        borderRadius: '18px',
        border: `1px solid ${c.cardBorder}`,
        overflow: 'hidden',
        boxShadow: c.cardShadow,
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={imagenSrc}
          alt={vehiculo.nombre}
          style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
        />

        <button
          type="button"
          onClick={onFavorito}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            border: 'none',
            background: c.favoriteBtnBg,
            boxShadow: c.favoriteBtnShadow,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            lineHeight: 0,
          }}
        >
          {esFavorito ? <FaHeart color={c.favoriteOn} size={15} /> : <FaRegHeart color={c.favoriteOff} size={15} />}
        </button>
      </div>

      <div style={{ padding: '14px' }}>
        <div style={{ fontSize: '12px', color: c.textSecondary, fontWeight: 700 }}>
          {vehiculo.categoria}
        </div>

        <h3 style={{ margin: '6px 0', fontSize: '16px', fontWeight: 800, color: c.textPrimary }}>
          {vehiculo.nombre}
        </h3>

        <div style={{ fontSize: '12px', color: c.textMuted, marginBottom: '10px' }}>
          {vehiculo.transmision} · {vehiculo.combustible}
        </div>

        <div style={{ fontSize: '18px', fontWeight: 900, color: c.accentText, marginBottom: '14px' }}>
          ${Number(vehiculo.precio).toLocaleString('es-CO')} <span style={{ fontSize: '12px', fontWeight: 600 }}>/día</span>
        </div>

        <button
          type="button"
          onClick={handleReservar}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            background: c.accentGradient,
            color: '#fff',
            fontWeight: 800,
            cursor: 'pointer',
            marginBottom: '8px',
          }}
        >
          Reservar ahora
        </button>

        <button
          type="button"
          onClick={() => setVerDetalles(v => !v)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: c.accentText,
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            textAlign: 'center',
            padding: '4px 0 0',
          }}
        >
          {verDetalles ? 'Ocultar detalles' : 'Ver detalles'}
        </button>

        {verDetalles && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px', marginBottom: '10px' }}>
              {caracteristicas.map((item, i) => {
                const Icono = getItemIcon(item)
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: c.panelBgSoft,
                      borderRadius: '8px',
                      padding: '7px 8px',
                      border: `1px solid ${c.panelBorder}`,
                    }}
                  >
                    <span style={{ fontSize: '14px', flexShrink: 0, color: c.textMuted, display: 'flex', alignItems: 'center' }}>
                      <Icono />
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: c.textMuted, lineHeight: 1.3 }}>
                      {item.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {tarifas && (
              <div
                style={{
                  background: c.tariffBg,
                  borderRadius: '8px',
                  padding: '8px 10px',
                  border: `1px solid ${c.tariffBorder}`,
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: c.successText,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <FaMoneyBillWave />
                  Tarifas
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: c.textMuted, marginBottom: '3px', gap: '8px' }}>
                  <span>Km limitado ({tarifas.kmLimitado?.km ?? 150} km/día)</span>
                  <span style={{ fontWeight: 800 }}>
                    ${Number(tarifas.kmLimitado?.precio ?? tarifas.kmLimitado ?? 0).toLocaleString('es-CO')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: c.textMuted, gap: '8px' }}>
                  <span>Km ilimitado</span>
                  <span style={{ fontWeight: 800 }}>
                    ${Number(tarifas.kmIlimitado?.precio ?? tarifas.kmIlimitado ?? 0).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            )}

            {seguros.length > 0 && (
              <div
                style={{
                  background: c.insuranceBg,
                  borderRadius: '8px',
                  padding: '8px 10px',
                  border: `1px solid ${c.insuranceBorder}`,
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: c.accentText,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <FaShieldAlt />
                  Seguros
                </div>

                {seguros.map((seg, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px',
                      color: c.textMuted,
                      marginBottom: i < seguros.length - 1 ? '4px' : 0,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{seg.nombre}</span>
                    <span style={{ fontWeight: 800, color: c.accentText, whiteSpace: 'nowrap', marginLeft: '6px' }}>
                      COP {Number(seg.precio).toLocaleString('es-CO', { minimumFractionDigits: 2 })}/día
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}