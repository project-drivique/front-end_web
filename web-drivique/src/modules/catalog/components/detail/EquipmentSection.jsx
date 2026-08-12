import * as FaIcons from 'react-icons/fa'
import { FaMobileAlt, FaMapMarkerAlt } from 'react-icons/fa'

export default function EquipmentSection({ caracteristicas = [], equipamiento = [] }) {
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Equipamiento Tecnológico */}
      {equipamiento.length > 0 && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FaMobileAlt color="#2563eb" size={14} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1e3a8a', margin: 0 }}>Equipamiento tecnológico</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {equipamiento.map((item, i) => {
              const TechIcon = FaIcons[item.icono] || FaIcons.FaCheckCircle
              return (
                <span key={i} style={{ 
                  background: '#fff', border: '1px solid #e2e8f0', 
                  borderRadius: 20, padding: '6px 14px', fontSize: 12, color: '#475569', fontWeight: 500,
                  display: 'inline-flex', alignItems: 'center', gap: 6
                }}>
                  <TechIcon color="#2563eb" size={12} />
                  {item.nombre}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Equipamiento General (Características) */}
      {caracteristicas.length > 0 && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FaMapMarkerAlt color="#2563eb" size={14} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1e3a8a', margin: 0 }}>Equipamiento</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {caracteristicas.map((item, i) => {
              const Icono = FaIcons[item.icono] || FaIcons.FaCheckCircle
              return (
                <div key={i} style={{ 
                  background: '#fff', borderRadius: 8, padding: '10px 14px', border: '1px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569', fontWeight: 500
                }}>
                  <Icono color="#94a3b8" size={14} />
                  {item.nombre}
                </div>
              )
            })}
          </div>
        </div>
      )}
      
    </div>
  )
}