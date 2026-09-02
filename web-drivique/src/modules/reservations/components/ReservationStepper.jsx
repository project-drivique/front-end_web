import { useTranslation } from 'react-i18next'
import { FaCheck, FaCalendarAlt, FaShieldAlt, FaUserEdit } from 'react-icons/fa'
import './ReservationStepper.css'

export default function ReservationStepper({ pantalla, esModoOscuro }) {
  const { t } = useTranslation()

  const pasos = [
    {
      num: 1,
      label: t('vehiculo.stepDates', 'Fechas y ubicación'),
      sublabel: t('vehiculo.stepDatesSub', 'Detalles de tu reserva'),
      icon: <FaCalendarAlt size={12} />,
    },
    {
      num: 2,
      label: t('vehiculo.stepProtection', 'Protección y extras'),
      sublabel: t('vehiculo.stepProtectionSub', 'Personaliza tu experiencia'),
      icon: <FaShieldAlt size={12} />,
    },
    {
      num: 3,
      label: t('vehiculo.personalData', 'Datos personales'),
      sublabel: t('vehiculo.personalDataSub', 'Finaliza tu reserva'),
      icon: <FaUserEdit size={12} />,
    },
  ]

  return (
    <div className={`res-stepper-container ${esModoOscuro ? 'res-stepper-container--dark' : ''}`}>
      <div className="res-stepper-grid">
        {pasos.map((paso) => {
          const activo = pantalla === paso.num
          const completado = pantalla > paso.num
          const pendiente = pantalla < paso.num

          let itemClass = 'res-stepper-item'
          if (activo) itemClass += ' res-stepper-item--active'
          if (completado) itemClass += ' res-stepper-item--completed'
          if (pendiente) itemClass += ' res-stepper-item--pending'

          let badgeClass = 'res-stepper-badge'
          if (completado) badgeClass += ' res-stepper-badge--completed'
          else if (activo) badgeClass += ' res-stepper-badge--active'
          else badgeClass += ' res-stepper-badge--pending'

          return (
            <div key={paso.num} className={itemClass}>
              <div className={badgeClass}>
                {completado ? <FaCheck size={10} /> : paso.num}
              </div>

              <div className="res-stepper-text">
                <span className="res-stepper-title">{paso.label}</span>
                <span className="res-stepper-sub">{paso.sublabel}</span>
              </div>

              {activo && <div className="res-stepper-bar-active" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
