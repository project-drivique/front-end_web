import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaMapMarkerAlt, FaClock, FaDirections } from 'react-icons/fa'
import DetailSection from './DetailSection'
import LocationModal from './LocationModal'

const SCHEDULE_MAP = {
  'Lun a sáb, 7:00 am - 7:00 pm': 'vehiculo.scheduleMonSat',
  'Lun a dom, 6:00 am - 10:00 pm': 'vehiculo.scheduleMonSun',
}

export default function BranchInfo({ sucursalInfo, c }) {
  const { t } = useTranslation()
  const [modalVisible, setModalVisible] = useState(false)

  if (!sucursalInfo) return null

  const bg = c?.cardBg || '#fff'
  const border = c?.cardBorder || '#e2e8f0'
  const titleColor = c?.titleColor || '#1e3a8a'
  const textPrimary = c?.textPrimary || 'var(--texto-primary)'
  const textSecondary = c?.textSecondary || 'var(--texto-second)'

  const { nombre, direccion, horario } = sucursalInfo
  const horarioTraducido = SCHEDULE_MAP[horario] ? t(SCHEDULE_MAP[horario]) : horario

  return (
    <div style={{ background: bg, padding: 20, borderRadius: 16, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0 }}>
        <FaMapMarkerAlt color={c?.accentText || "#2563eb"} size={14} />
        <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>{t('vehiculo.branch', 'Sucursal')}</h3>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 14.5, fontWeight: 700, color: textPrimary, margin: 0 }}>
            {nombre}
          </p>
          {direccion && (
            <p style={{ fontSize: 13, color: textSecondary, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaMapMarkerAlt size={12} color="#94a3b8" /> {direccion}
            </p>
          )}
          {horario && (
            <p style={{ fontSize: 13, color: textSecondary, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaClock size={12} color="#94a3b8" /> {horarioTraducido}
            </p>
          )}
        </div>
      </div>
      
      {direccion && (
        <>
          <button
            onClick={() => setModalVisible(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 13, fontWeight: 700, color: c?.accentText || '#1e3a8a', background: 'transparent',
              border: `1px solid ${c?.accentText || '#1e3a8a'}`, borderRadius: 8, padding: '10px 16px', cursor: 'pointer',
              marginTop: 8, transition: 'all 0.2s', width: '100%'
            }}
          >
            <FaDirections size={14} /> {t('vehiculo.howToGetThere')}
          </button>
          
          <LocationModal 
            visible={modalVisible} 
            onClose={() => setModalVisible(false)} 
            sucursalInfo={sucursalInfo} 
            c={c}
          />
        </>
      )}
    </div>
  )
}