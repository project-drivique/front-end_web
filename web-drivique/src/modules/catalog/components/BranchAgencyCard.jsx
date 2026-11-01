import i18nGlobal from '@/i18n'
import { useBrand } from '../../../contexts/BrandContext'
import { formatCurrency } from '@/utils/currencyUtils'
import { FaMapMarkerAlt, FaClock, FaCar } from 'react-icons/fa'

export const coloresTemaSucursales = (esModoOscuro) => ({
  pageBg: esModoOscuro ? '#020617' : '#f8fafc',
  panelBg: esModoOscuro ? '#111827' : '#ffffff',
  panelBorder: esModoOscuro ? '#1e293b' : '#e2e8f0',
  panelBorderStrong: esModoOscuro ? '#334155' : '#cbd5e1',
  panelShadow: esModoOscuro ? '0 20px 60px rgba(0,0,0,0.45)' : '0 20px 60px rgba(15,23,42,0.06)',
  textPrimary: esModoOscuro ? '#f8fafc' : '#0f172a',
  textSecondary: esModoOscuro ? '#94a3b8' : '#64748b',
  textMuted: esModoOscuro ? '#64748b' : '#94a3b8',
  accentText: 'var(--brand-text)',
  accentBgSoft: 'var(--brand-soft)',
  accentGradient: 'var(--brand-gradient)',
  itemBg: esModoOscuro ? '#1e293b' : '#f8fafc',
  cardBorder: esModoOscuro ? '#334155' : '#e2e8f0',
  cardBorderHover: 'var(--brand-primary)',
  cardShadow: esModoOscuro ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(15,23,42,0.04)',
  cardShadowHover: esModoOscuro ? '0 12px 28px rgba(0,0,0,0.45)' : '0 12px 28px rgba(15,23,42,0.1)',
  subCardBg: esModoOscuro ? '#0f172a' : '#f8fafc',
  heroCardBg: esModoOscuro ? '#1e293b' : '#ffffff',
  heroCardBorder: esModoOscuro ? '#334155' : '#e2e8f0',
  imageFallbackBg: esModoOscuro ? '#1e293b' : '#f1f5f9',
  paginationDisabledBg: esModoOscuro ? '#1e293b' : '#f1f5f9',
  paginationDisabledText: esModoOscuro ? '#475569' : '#94a3b8',
  paginationIdleBg: esModoOscuro ? '#1e293b' : '#ffffff',
  paginationIdleText: esModoOscuro ? '#cbd5e1' : '#475569',
})

export function construirSucursales(sucursales, vehiculos) {
  return sucursales
    .filter((sede) => sede.estado !== 'inactiva')
    .map((sede) => {
      const propios = vehiculos.filter((v) => (v.sucursal || v.sucursalInfo?.nombre || '') === sede.nombre)
      const precios = propios.map((v) => Number(v.precio)).filter((precio) => precio > 0)
      const modelos = [...new Set(propios.map((v) => v.nombre).filter(Boolean))].slice(0, 2)
      return {
        id: sede.id,
        alias: sede.nombre,
        nombre: sede.nombre,
        marca: 'Drivique',
        tag: sede.ciudad,
        direccion: sede.direccion,
        horario: sede.horario,
        flota: modelos.join(', '),
        precioCOP: precios.length ? Math.min(...precios) : 0,
        porQue: sede.telefono ? i18nGlobal.t('hc3.phone_short', { defaultValue: 'Tel. {{telefono}}', telefono: sede.telefono }) : '',
      }
    })
}

function MarcaPropia({ marca }) {
  const { brand } = useBrand()
  const esPropia = marca === 'Drivique'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 18, color: 'var(--brand-text)' }}>
      {esPropia && brand.logoDataUrl ? <img src={brand.logoDataUrl} alt="" style={{ height: 34, maxWidth: 90, objectFit: 'contain' }} /> : null}
      {esPropia ? brand.name : marca}
    </span>
  )
}

export function BrandLogo({ marca }) {
  if (marca === 'Alamo') {
    return (
      <div style={{ background: '#00205b', border: '3px solid #ffcc00', borderRadius: 8, padding: '4px 16px', display: 'inline-flex', alignItems: 'center' }}>
        <span style={{ color: '#ffcc00', fontWeight: 900, fontSize: 20, fontStyle: 'italic', fontFamily: 'sans-serif' }}>Alamo</span>
      </div>
    )
  }
  if (marca === 'TuRoll') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#eab308', fontWeight: 900, fontSize: 24, letterSpacing: '-0.03em', fontFamily: 'sans-serif' }}>TU</span>
        <span style={{ color: '#64748b', fontWeight: 800, fontSize: 24, fontStyle: 'italic', fontFamily: 'sans-serif' }}>Roll</span>
      </div>
    )
  }
  if (marca === 'Enterprise') {
    return (
      <div style={{ background: '#006633', borderRadius: 6, padding: '4px 16px', display: 'inline-flex', alignItems: 'center' }}>
        <span style={{ color: '#ffffff', fontWeight: 900, fontSize: 18, fontStyle: 'italic', letterSpacing: '-0.02em', fontFamily: 'sans-serif' }}>enterprise</span>
      </div>
    )
  }
  if (marca === 'Localiza') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 14, height: 14, borderLeft: '4px solid #eab308', borderBottom: '4px solid #16a34a', transform: 'rotate(-45deg)' }} />
        <span style={{ color: '#15803d', fontWeight: 900, fontSize: 22, letterSpacing: '-0.02em', fontFamily: 'sans-serif' }}>Localiza</span>
      </div>
    )
  }
  if (marca === 'Hertz') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
        <span style={{ color: '#0f172a', fontWeight: 900, fontSize: 26, fontStyle: 'italic', fontFamily: 'sans-serif', letterSpacing: '-0.03em' }}>Hertz</span>
      </div>
    )
  }
  if (marca === 'Budget') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '14px solid #f97316' }} />
        <span style={{ color: 'var(--brand-secondary)', fontWeight: 900, fontSize: 22, letterSpacing: '-0.02em', fontFamily: 'sans-serif' }}>Budget</span>
      </div>
    )
  }
  return <MarcaPropia marca={marca} />
}

export default function BranchAgencyCard({
  suc,
  esActivo,
  c,
  moneda,
  t,
  getNombre,
  getTagTraducido,
  getDireccion,
  getHorarioTraducido,
  getFlota,
  verCarrosSucursal,
}) {
  return (
    <div
      style={{
        background: c.panelBg,
        borderRadius: '20px',
        border: `1.5px solid ${esActivo ? c.accentText : c.cardBorder}`,
        boxShadow: esActivo ? '0 12px 32px rgba(var(--brand-primary-rgb),0.20)' : '0 6px 20px rgba(15,23,42,0.04)',
        padding: '22px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        transition: 'all 220ms ease',
        cursor: 'default',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)'
        e.currentTarget.style.boxShadow = '0 14px 32px rgba(var(--brand-primary-rgb),0.15)'
        e.currentTarget.style.borderColor = c.cardBorderHover
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = esActivo ? '0 12px 32px rgba(var(--brand-primary-rgb),0.20)' : '0 6px 20px rgba(15,23,42,0.04)'
        e.currentTarget.style.borderColor = esActivo ? c.accentText : c.cardBorder
      }}
    >
      <div>
        <div style={{
          height: 72,
          background: c.accentBgSoft,
          borderRadius: '14px',
          border: '1px solid rgba(var(--brand-primary-rgb), 0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
        }}>
          <BrandLogo marca={suc.marca} />
        </div>

        <h3 style={{ fontSize: 16.5, fontWeight: 800, color: c.textPrimary, margin: '0 0 10px', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
          {getNombre(suc)}
        </h3>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          borderRadius: 20,
          background: c.accentBgSoft,
          color: c.accentText,
          fontSize: 11.5,
          fontWeight: 700,
          marginBottom: 12,
        }}>
          <FaMapMarkerAlt size={11} /> {getTagTraducido(suc.tag)}
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 16, minHeight: 40 }}>
          <p style={{ fontSize: 12.5, color: c.textSecondary, margin: 0, lineHeight: 1.5 }}>
            {getDireccion(suc)}
          </p>
        </div>

        <div style={{
          background: c.subCardBg,
          borderRadius: '14px',
          border: `1px solid ${c.panelBorder}`,
          padding: '12px 14px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: c.accentText, marginBottom: 4 }}>
              <FaClock size={11} /> {t('sucursales.schedule', 'Horario')}
            </div>
            <div style={{ fontSize: 11.5, color: c.textPrimary, fontWeight: 600, lineHeight: 1.3 }}>
              {getHorarioTraducido(suc.horario)}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: c.accentText, marginBottom: 4 }}>
              <FaCar size={11} /> {t('sucursales.fleet', 'Flota')}
            </div>
            <div style={{ fontSize: 11.5, color: c.textPrimary, fontWeight: 600, lineHeight: 1.3 }}>
              {getFlota(suc)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 14, borderTop: `1px solid ${c.panelBorder}` }}>
        <div>
          <span style={{ fontSize: 10.5, color: c.textSecondary, display: 'block', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t('sucursales.from', 'Desde')}
          </span>
          <span style={{ fontSize: 16, fontWeight: 900, color: c.textPrimary }}>
            {formatCurrency(suc.precioCOP, moneda)}<span style={{ fontSize: 12, fontWeight: 600, color: c.textSecondary }}>{t('sucursales.perDay', '/día')}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => verCarrosSucursal(suc)}
          style={{
            background: 'var(--brand-gradient)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(var(--brand-primary-rgb),0.25)',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px) scale(1.03)'
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(var(--brand-primary-rgb),0.35)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(var(--brand-primary-rgb),0.25)'
          }}
        >
          {t('sucursales.viewCars', 'Ver carros')}
        </button>
      </div>
    </div>
  )
}
