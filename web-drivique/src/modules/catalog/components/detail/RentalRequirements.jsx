import { FaIdCard, FaCreditCard, FaUserAlt, FaClipboardCheck } from 'react-icons/fa'

export default function RentalRequirements() {
  const requisitos = [
    { icono: FaUserAlt, titulo: 'Edad mínima', desc: 'Debes tener al menos 21 años para rentar.' },
    { icono: FaIdCard, titulo: 'Identificación', desc: 'Cédula de ciudadanía para nacionales o pasaporte vigente para extranjeros.' }
  ]

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <FaClipboardCheck color="#2563eb" size={14} />
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1e3a8a', margin: 0 }}>Requisitos para rentar</h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {requisitos.map((req, i) => (
          <div key={i} style={{ display: 'flex', gap: 12 }}>
            <div style={{ marginTop: 2 }}>
              <req.icono color="#94a3b8" size={14} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 2 }}>
                {req.titulo}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                {req.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
