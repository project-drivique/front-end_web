import { useTranslation } from 'react-i18next'
import { FaCalendarAlt, FaShieldAlt, FaUserEdit, FaCheck } from 'react-icons/fa'

const IcoCheck = () => (
  <FaCheck size={12} />
)

export default function ReservationStepper({ pantalla, esModoOscuro }) {
  const { t } = useTranslation()

  const pasos = [
    {
      label: t('vehiculo.stepDates', 'Fechas y ubicación'),
      sublabel: t('vehiculo.stepDatesSub', 'Completa los detalles de tu reserva'),
      icon: <FaCalendarAlt />,
    },
    {
      label: t('vehiculo.stepProtection', 'Protección y extras'),
      sublabel: t('vehiculo.stepProtectionSub', 'Personaliza tu experiencia'),
      icon: <FaShieldAlt />,
    },
    {
      label: t('vehiculo.personalData', 'Datos personales'),
      sublabel: t('vehiculo.personalDataSub', 'Finaliza tu reserva'),
      icon: <FaUserEdit />,
    },
  ]

  return (
    <div
      style={{
        marginBottom: 32,
        borderBottom: `1px solid ${esModoOscuro ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        display: 'flex',
        gap: 32,
        alignItems: 'stretch',
        position: 'relative',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {pasos.map((paso, i) => {
        const num = i + 1
        const activo = pantalla === num
        const completado = pantalla > num

        return (
          <div
            key={i}
            style={{
              flex: 1,
              minWidth: 200,
              padding: '16px 20px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              cursor: 'default',
              position: 'relative',
              background: 'transparent',
              border: 'none',
              transition: 'all 200ms ease',
              userSelect: 'none',
              outline: 'none',
            }}
          >
            {completado && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: '50%',
                border: `1.5px solid ${esModoOscuro ? '#059669' : '#10b981'}`,
                background: esModoOscuro ? 'rgba(16,185,129,0.15)' : '#ffffff',
                color: '#10b981', flexShrink: 0, fontSize: 13, fontWeight: 800,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}>
                <IcoCheck />
              </span>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{
                fontSize: 14,
                fontWeight: activo ? 800 : completado ? 700 : 600,
                color: activo
                  ? (esModoOscuro ? '#f3f4f6' : '#0f172a')
                  : completado ? (esModoOscuro ? '#e2e8f0' : '#334155')
                    : (esModoOscuro ? '#64748b' : '#64748b'),
                letterSpacing: '-0.01em',
                lineHeight: 1.25,
              }}>
                {paso.label}
              </span>
              <span style={{
                fontSize: 12, fontWeight: 400,
                color: esModoOscuro ? '#94a3b8' : '#64748b',
                marginTop: 4, lineHeight: 1.2,
              }}>
                {paso.sublabel}
              </span>
            </div>

            {activo && (
              <div style={{
                position: 'absolute', bottom: -1, left: 0, right: 0,
                height: 3,
                background: esModoOscuro ? '#3b82f6' : '#1d4ed8',
                boxShadow: esModoOscuro ? '0 0 10px rgba(59,130,246,0.5)' : 'none',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

