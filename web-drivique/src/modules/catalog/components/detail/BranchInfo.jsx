import { useTranslation } from 'react-i18next'
import { FaMapMarkerAlt } from 'react-icons/fa'

export default function BranchInfo({ sucursalInfo }) {
  const { t } = useTranslation()

  if (!sucursalInfo) return null

  const { nombre, direccion, horario } = sucursalInfo
  const mapsUrl = direccion
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`
    : null

  return (
    <div style={{ background: 'var(--bg-tarjeta)', border: '1px solid var(--borde)', borderRadius: 14, padding: '18px 20px', height: '100%' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--texto-second)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <FaMapMarkerAlt size={15} /> {t('vehiculo.branch')}
      </p>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--texto-primary)', margin: '0 0 4px' }}>{nombre}</p>
      {direccion && <p style={{ fontSize: 13, color: 'var(--texto-second)', margin: 0 }}>{direccion}</p>}
      {horario && <p style={{ fontSize: 13, color: 'var(--texto-second)', margin: '4px 0 0' }}>{horario}</p>}
      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block', marginTop: 12, fontSize: 13, fontWeight: 700, color: '#1e3a8a', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 9999, padding: '8px 16px', textDecoration: 'none' }}
        >
          {t('vehiculo.howToGetThere')}
        </a>
      )}
    </div>
  )
}