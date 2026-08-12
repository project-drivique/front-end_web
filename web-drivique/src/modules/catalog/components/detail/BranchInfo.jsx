import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaMapMarkerAlt, FaClock, FaDirections } from 'react-icons/fa'
import DetailSection from './DetailSection'
import LocationModal from './LocationModal'

export default function BranchInfo({ sucursalInfo }) {
  const { t } = useTranslation()
  const [modalVisible, setModalVisible] = useState(false)

  if (!sucursalInfo) return null

  const { nombre, direccion, horario } = sucursalInfo
  // We no longer need mapsUrl here, the modal handles it.

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0 }}>
        <FaMapMarkerAlt color="#2563eb" size={14} />
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1e3a8a', margin: 0 }}>{t('vehiculo.branch', 'Sucursal')}</h3>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--texto-primary)', margin: 0 }}>
            {nombre}
          </p>
          {direccion && (
            <p style={{ fontSize: 13, color: 'var(--texto-second)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaMapMarkerAlt size={12} color="#94a3b8" /> {direccion}
            </p>
          )}
          {horario && (
            <p style={{ fontSize: 13, color: 'var(--texto-second)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaClock size={12} color="#94a3b8" /> {horario}
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
              fontSize: 13, fontWeight: 700, color: '#1e3a8a', background: 'transparent',
              border: '1px solid #1e3a8a', borderRadius: 8, padding: '10px 16px', cursor: 'pointer',
              marginTop: 8, transition: 'all 0.2s', width: '100%'
            }}
          >
            <FaDirections size={14} /> {t('vehiculo.howToGetThere')}
          </button>
          
          <LocationModal 
            visible={modalVisible} 
            onClose={() => setModalVisible(false)} 
            sucursalInfo={sucursalInfo} 
          />
        </>
      )}
    </div>
  )
}