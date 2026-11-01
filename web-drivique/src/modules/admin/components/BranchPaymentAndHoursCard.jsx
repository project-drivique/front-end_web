import { useTranslation } from 'react-i18next'
import { FaCreditCard, FaHourglassHalf, FaInfoCircle, FaMoneyBillWave } from 'react-icons/fa'

const renderSafeFormattedText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return rawText
  const parts = rawText.split(/(<strong>.*?<\/strong>)/gi)
  return parts.map((part, idx) => {
    const match = part.match(/^<strong>(.*?)<\/strong>$/i)
    if (match) {
      return <strong key={idx}>{match[1].replace(/<[^>]*>/g, '')}</strong>
    }
    return part.replace(/<[^>]*>/g, '')
  })
}

export default function BranchPaymentAndHoursCard({ branchName }) {
  const { t } = useTranslation()

  return (
    <article className="branch-profile-card branch-profile-card--full" style={{ marginTop: 24 }}>
      <div className="branch-profile-card-header">
        <div className="branch-profile-card-title-wrap">
          <span className="branch-profile-card-title">
            <FaCreditCard className="branch-profile-card-icon" aria-hidden="true" />
            {t('branchProfile.paymentAndHours.title', 'Puntos de Entrega y Horarios según el Medio de Pago')}
          </span>
          <span className="branch-profile-card-desc">
            {t(
              'branchProfile.paymentAndHours.desc',
              'La sucursal administra múltiples puntos de recogida y devolución según el medio de pago y el lugar de retiro seleccionado por el usuario.'
            )}
          </span>
        </div>
      </div>

      <div className="branch-profile-card-body">
        <div className="branch-profile-info-banner">
          <FaInfoCircle className="branch-profile-info-icon" aria-hidden="true" />
          <p className="branch-profile-info-text">
            {renderSafeFormattedText(
              t(
                'branchProfile.paymentAndHours.info',
                '<strong>Puntos y horarios de la sucursal:</strong> La disponibilidad del punto de recogida y devolución depende directamente del <strong>medio de pago</strong> y del <strong>lugar de retiro seleccionado</strong> al reservar.'
              )
            )}
          </p>
        </div>

        <div className="branch-payment-explanatory-grid">
          <div className="branch-payment-explanatory-card">
            <div className="branch-payment-explanatory-header">
              <div className="branch-payment-method-icon-box">
                <FaCreditCard aria-hidden="true" />
              </div>
              <div>
                <h4 className="branch-payment-explanatory-title">
                  {t('branchProfile.paymentAndHours.onlinePayment', 'Pago Virtual con Wompi (En línea)')}
                </h4>
                <span className="branch-payment-explanatory-badge">
                  {t('branchProfile.paymentAndHours.onlineBadge', 'Múltiples Puntos Habilitados')}
                </span>
              </div>
            </div>

            <div className="branch-payment-explanatory-body">
              <p>
                {t(
                  'branchProfile.paymentAndHours.onlineDesc',
                  'Al pagar en línea por adelantado, la sucursal habilita todos sus puntos de entrega y recogida coordinados:'
                )}
              </p>
              <ul className="branch-payment-explanatory-list">
                <li>
                  <strong>{renderSafeFormattedText(t('branchProfile.paymentAndHours.airportTitle', 'Aeropuerto:'))}</strong>{' '}
                  <span>
                    {renderSafeFormattedText(
                      t(
                        'branchProfile.paymentAndHours.airportDesc',
                        '<strong>24 Horas</strong> (Operación continua 24/7 para recepción de vuelos y viajeros).'
                      )
                    )}
                  </span>
                </li>
                <li>
                  <strong>
                    {renderSafeFormattedText(t('branchProfile.paymentAndHours.terminalTitle', 'Terminal de Transporte:'))}
                  </strong>{' '}
                  <span>
                    {renderSafeFormattedText(
                      t(
                        'branchProfile.paymentAndHours.terminalDesc',
                        '<strong>24 Horas</strong> (Operación continua 24/7 para llegadas de transporte terrestre).'
                      )
                    )}
                  </span>
                </li>
                <li>
                  <strong>
                    {renderSafeFormattedText(t('branchProfile.paymentAndHours.deliveryTitle', 'Entrega a Domicilio:'))}
                  </strong>{' '}
                  <span>
                    {renderSafeFormattedText(
                      t(
                        'branchProfile.paymentAndHours.deliveryDesc',
                        '<strong>07:00 AM – 07:00 PM</strong> (Lunes a Sábado), servicio puerta a puerta en la ciudad.'
                      )
                    )}
                  </span>
                </li>
                <li>
                  <strong>
                    {t('branchProfile.paymentAndHours.branchTitle', 'Instalaciones de la Sucursal')} ({branchName}):
                  </strong>{' '}
                  <span>
                    {renderSafeFormattedText(
                      t(
                        'branchProfile.paymentAndHours.branchDesc',
                        '<strong>08:00 AM – 06:00 PM</strong> (Horario regular de atención de la sucursal).'
                      )
                    )}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="branch-payment-explanatory-card branch-payment-explanatory-card--cash">
            <div className="branch-payment-explanatory-header">
              <div className="branch-payment-method-icon-box" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }}>
                <FaMoneyBillWave aria-hidden="true" />
              </div>
              <div>
                <h4 className="branch-payment-explanatory-title">
                  {t('branchProfile.paymentAndHours.cashPayment', 'Pago en Efectivo (Taquilla de Sucursal)')}
                </h4>
                <span className="branch-payment-explanatory-badge branch-payment-explanatory-badge--cash">
                  {t('branchProfile.paymentAndHours.cashBadge', 'Presencial en Sucursal')}
                </span>
              </div>
            </div>

            <div className="branch-payment-explanatory-body">
              <p>
                {renderSafeFormattedText(
                  t(
                    'branchProfile.paymentAndHours.cashDesc',
                    'Cuando el cliente elige pagar en efectivo, la entrega queda <strong>estrictamente condicionada a la atención presencial en la sucursal asignada donde se encuentra el vehículo ({branchName})</strong>:',
                    { branchName }
                  )
                )}
              </p>
              <ul className="branch-payment-explanatory-list">
                <li>
                  <strong>
                    {renderSafeFormattedText(
                      t('branchProfile.paymentAndHours.cashHoursTitle', 'Horario de caja y mostrador:')
                    )}
                  </strong>{' '}
                  <span>
                    {renderSafeFormattedText(
                      t(
                        'branchProfile.paymentAndHours.cashHoursDesc',
                        '<strong>08:00 AM – 06:00 PM</strong>. El cliente debe acudir a la sucursal dentro de esta jornada para el pago presencial, arqueo de dinero en caja y firma del contrato.'
                      )
                    )}
                  </span>
                </li>
                <li>
                  <strong>
                    {renderSafeFormattedText(
                      t('branchProfile.paymentAndHours.cashNoDeliveryTitle', 'Sin entregas fuera de turno:')
                    )}
                  </strong>{' '}
                  <span>
                    {renderSafeFormattedText(
                      t(
                        'branchProfile.paymentAndHours.cashNoDeliveryDesc',
                        'No se realizan entregas en efectivo fuera del horario de taquilla de la sucursal.'
                      )
                    )}
                  </span>
                </li>
                <li>
                  <strong>
                    {renderSafeFormattedText(t('branchProfile.paymentAndHours.cashLocationTitle', 'Ubicación única:'))}
                  </strong>{' '}
                  <span>
                    {renderSafeFormattedText(
                      t(
                        'branchProfile.paymentAndHours.cashLocationDesc',
                        'El cobro en efectivo solo se recibe en la sucursal física donde está inventariado el vehículo.'
                      )
                    )}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="branch-payment-deadline-section" style={{ marginTop: 14 }}>
          <div className="branch-payment-deadline-header">
            <div className="branch-payment-deadline-icon-wrap">
              <FaHourglassHalf className="branch-payment-deadline-icon" aria-hidden="true" />
            </div>
            <span className="branch-payment-deadline-title">
              {t('branchProfile.paymentDeadline.title', 'Plazo de pago, cómputo de 24 horas y tiempo límite de reserva')}
            </span>
          </div>

          <div className="branch-payment-deadline-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
            <p className="branch-payment-deadline-text">
              {'⬢ '}
              <strong>{renderSafeFormattedText(t('branchProfile.paymentDeadline.rule1Title', 'Cálculo del plazo límite de pago:'))}</strong>{' '}
              {renderSafeFormattedText(
                t(
                  'branchProfile.paymentDeadline.rule1Desc',
                  'Si la reserva se realiza con anticipación suficiente, el cliente cuenta con hasta <strong>72 horas</strong> para completar el pago (virtual con Wompi o presencial en efectivo en sucursal). Si la reserva es para el mismo día o con menor antelación, el sistema <strong>calcula dinámicamente las horas disponibles según la hora exacta de retiro seleccionada</strong> antes del viaje.'
                )
              )}
            </p>
            <p className="branch-payment-deadline-text">
              {'⬢ '}
              <strong>{renderSafeFormattedText(t('branchProfile.paymentDeadline.rule2Title', 'Cómputo de 24 horas por día de alquiler:'))}</strong>{' '}
              {renderSafeFormattedText(
                t(
                  'branchProfile.paymentDeadline.rule2Desc',
                  'Cada día de reserva cuenta con una duración exacta de <strong>24 horas</strong>, y el ciclo de alquiler comienza a regir a partir de la <strong>hora exacta de retiro que el cliente selecciona</strong> en el calendario.'
                )
              )}
            </p>
            <p className="branch-payment-deadline-text">
              {'⬢ '}
              <strong>{renderSafeFormattedText(t('branchProfile.paymentDeadline.rule3Title', 'Cancelación y liberación automática:'))}</strong>{' '}
              {renderSafeFormattedText(
                t(
                  'branchProfile.paymentDeadline.rule3Desc',
                  'En caso de que no se registre el pago dentro del tiempo límite calculado por el sistema, la reserva se cancela automáticamente y el vehículo queda liberado de inmediato en el catálogo para otros usuarios.'
                )
              )}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}

