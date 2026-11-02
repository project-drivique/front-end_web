import { FaMoneyBillWave, FaPlus } from 'react-icons/fa'

export default function ManagementDashboardPart2({ cashRoute, navigate, reservationsRoute }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate(cashRoute)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                background: 'var(--brand-primary, #2563eb)',
                border: 'none',
                borderRadius: 10,
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(var(--brand-primary-rgb), 0.25)',
                transition: 'background 0.2s ease',
              }}
            >
              <FaMoneyBillWave /> Gestión de Pagos
            </button>
  
            <button
              type="button"
              onClick={() => navigate(reservationsRoute)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                background: 'var(--brand-primary)',
                border: 'none',
                borderRadius: 10,
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)',
              }}
            >
              <FaPlus /> Crear Reserva Manual
            </button>
  
          </div>
  )
}
