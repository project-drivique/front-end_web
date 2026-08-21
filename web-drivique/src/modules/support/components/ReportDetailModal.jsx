import { FaTimes, FaShieldAlt } from 'react-icons/fa'

export default function ReportDetailModal({ reporte, onClose }) {
  if (!reporte) return null

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'resuelto':
        return { text: 'Resuelto', bg: '#dcfce7', color: '#15803d', dot: '#16a34a' }
      case 'en_atencion':
        return { text: 'En atención', bg: '#f3e8ff', color: '#7e22ce', dot: '#9333ea' }
      case 'en_revision':
        return { text: 'En revisión', bg: '#fef3c7', color: '#b45309', dot: '#d97706' }
      case 'recibido':
      default:
        return { text: 'Recibido', bg: '#dbeafe', color: '#1e40af', dot: '#2563eb' }
    }
  }

  const badge = getEstadoBadge(reporte.estado)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(480px, 100%)',
          background: 'var(--bg-tarjeta, #ffffff)',
          borderRadius: 24,
          padding: '28px 24px 24px',
          boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
          border: '1px solid var(--borde, #e2e8f0)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado del modal */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--texto-primary, #0f172a)', margin: '0 0 6px' }}>
              Detalle de Reporte {reporte.codigo}
            </h3>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#2563eb' }}>
              {reporte.tipoIncidenciaNombre}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-item, #f1f5f9)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--texto-second, #64748b)',
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Badge de estado */}
        <div style={{ marginBottom: 20 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: badge.bg,
              color: badge.color,
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: badge.dot }} />
            {badge.text}
          </span>
        </div>

        {/* Detalles del informe */}
        <div
          style={{
            background: 'var(--bg-item, #f8fafc)',
            padding: 16,
            borderRadius: 16,
            border: '1px solid var(--borde, #e2e8f0)',
            marginBottom: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--texto-second, #94a3b8)', display: 'block' }}>
              Vehículo / Reserva:
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--texto-primary, #0f172a)' }}>
              {reporte.vehiculo} {reporte.placa && `(Placa: ${reporte.placa})`}
            </span>
          </div>

          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--texto-second, #94a3b8)', display: 'block' }}>
              Descripción:
            </span>
            <p style={{ fontSize: 13, color: 'var(--texto-primary, #334155)', margin: 0, lineHeight: 1.5 }}>
              {reporte.descripcion}
            </p>
          </div>

          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--texto-second, #94a3b8)', display: 'block' }}>
              Contacto registrado:
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--texto-primary, #0f172a)' }}>
              {reporte.contactoNombre} {reporte.contactoTelefono && `・ ${reporte.contactoTelefono}`}
            </span>
          </div>

          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--texto-second, #94a3b8)', display: 'block' }}>
              Tiempo estimado de atención:
            </span>
            <span style={{ fontSize: 14, fontWeight: 900, color: '#d97706' }}>
              {reporte.tiempoEstimado}
            </span>
          </div>
        </div>

        {/* Historial de atención del Administrador */}
        <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--texto-primary, #0f172a)', margin: '0 0 14px' }}>
          Historial de atención del Administrador:
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24, paddingLeft: 8 }}>
          {reporte.historial?.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative' }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: item.color || '#2563eb',
                  marginTop: 3,
                  flexShrink: 0,
                  boxShadow: `0 0 8px ${item.color || '#2563eb'}`,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: 13, fontWeight: 800, color: 'var(--texto-primary, #0f172a)' }}>
                    {item.titulo}
                  </strong>
                  <span style={{ fontSize: 11, color: 'var(--texto-second, #94a3b8)' }}>{item.hora}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--texto-second, #64748b)', margin: '2px 0 0 0' }}>
                  {item.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Nota del Administrador */}
        <div
          style={{
            background: 'var(--bg-item, #f1f5f9)',
            border: '1px solid var(--borde, #e2e8f0)',
            borderRadius: 14,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <FaShieldAlt style={{ fontSize: 20, color: '#2563eb', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--texto-second, #475569)', lineHeight: 1.4 }}>
            El estado de este informe es validado y actualizado directamente por el equipo administrador en la central de soporte.
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px 20px',
            borderRadius: 14,
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
