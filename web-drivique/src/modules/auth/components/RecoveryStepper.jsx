
const IconoCheck = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" style={{ marginTop: '1px' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)

export default function RecoveryStepper({ currentStep }) {
  // Nombres de los pasos hardcodeados o traducidos
  const pasos = [
    { id: 1, label: 'Correo' },
    { id: 2, label: 'Verificación' },
    { id: 3, label: 'Nueva contraseña' },
    { id: 4, label: 'Confirmación' },
  ]

  return (
    <div style={{ width: '100%', marginBottom: '40px' }}>
      
      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        
        {/* Línea de fondo */}
        <div style={{ position: 'absolute', top: '14px', left: '10%', right: '10%', height: '2px', background: '#e2e8f0', zIndex: 0 }} />

        {pasos.map((paso, index) => {
          const completado = currentStep > paso.id
          const activo = currentStep === paso.id
          return (
            <div key={paso.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, flex: 1 }}>
              
              {/* Línea activa (verde) conectando con el anterior */}
              {index > 0 && completado && (
                 <div style={{ position: 'absolute', top: '14px', right: '50%', width: '100%', height: '2px', background: 'var(--brand-secondary)', zIndex: -1 }} />
              )}
              {index > 0 && activo && (
                 <div style={{ position: 'absolute', top: '14px', right: '50%', width: '100%', height: '2px', background: 'var(--brand-secondary)', zIndex: -1 }} />
              )}

              {/* Círculo */}
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: completado ? 'var(--brand-secondary)' : (activo ? 'linear-gradient(90deg, var(--brand-secondary), var(--brand-primary))' : '#fff'),
                color: (completado || activo) ? '#fff' : '#cbd5e1',
                border: (completado || activo) ? 'none' : '2px solid #cbd5e1',
                fontSize: '13px', fontWeight: 800, marginBottom: '8px',
                boxShadow: '0 0 0 5px #f8fafc'
              }}>
                {completado ? <IconoCheck /> : paso.id}
              </div>

              {/* Texto */}
              <span style={{
                fontSize: '11px', fontWeight: activo ? 800 : (completado ? 600 : 500),
                color: activo ? 'var(--brand-primary)' : (completado ? '#64748b' : '#94a3b8')
              }}>
                {paso.label}
              </span>
            </div>
          )
        })}

      </div>
    </div>
  )
}
