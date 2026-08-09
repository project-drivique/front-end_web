import { useTranslation } from 'react-i18next'
import { FaMapMarkerAlt, FaClock, FaDirections } from 'react-icons/fa'
import DetailSection from './DetailSection'

export default function BranchInfo({ sucursalInfo }) {
  const { t } = useTranslation()

  if (!sucursalInfo) return null

  const { nombre, direccion, horario } = sucursalInfo
  const mapsUrl = direccion
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`
    : null

  return (
    <DetailSection icon={<FaMapMarkerAlt size={12} />} title={t('vehiculo.branch')}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
        <div>
          <p style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--texto-primary)', margin: '0 0 5px' }}>{nombre}</p>
          {direccion && (
            <p style={{ fontSize: 13, color: 'var(--texto-second)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <FaMapMarkerAlt size={11} /> {direccion}
            </p>
          )}
          {horario && (
            <p style={{ fontSize: 13, color: 'var(--texto-second)', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
              <FaClock size={11} /> {horario}
            </p>
          )}
        </div>
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
              fontSize: 13, fontWeight: 700, color: '#1e3a8a', background: '#eff6ff',
              border: '1px solid #bfdbfe', borderRadius: 9999, padding: '8px 16px', textDecoration: 'none',
            }}
          >
            <FaDirections size={12} /> {t('vehiculo.howToGetThere')}
          </a>
        )}
      </div>
    </DetailSection>
  )
}