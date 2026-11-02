export default function PersonalDataPart4({ c, reserva, t }) {
  return (
    <div style={{
          background: c?.isDark ? 'rgba(var(--brand-primary-rgb), 0.08)' : 'var(--brand-soft)',
          border: `1px solid ${c?.isDark ? 'rgba(var(--brand-primary-rgb), 0.25)' : 'var(--brand-border)'}`,
          borderRadius: 16,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14
        }}>
          <div style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: `1.5px solid ${c?.accentText || 'var(--brand-secondary)'}`,
            color: c?.accentText || 'var(--brand-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 800,
            flexShrink: 0,
            marginTop: 1
          }}>
            i
          </div>
          <p style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.5,
            color: c?.accentText || 'var(--brand-secondary)',
            fontWeight: 500
          }}>
            {(() => {
              let limit = 8;
              if (reserva?.fechaInicio && reserva?.horaInicio) {
                const pickupMs = new Date(`${reserva.fechaInicio}T${reserva.horaInicio}:00`).getTime();
                // eslint-disable-next-line react-hooks/purity
                limit = Math.floor(Math.min(8, Math.max(2, (pickupMs - Date.now()) / (1000 * 60 * 60))));
              }
              return t('vehiculo.confirmNoticeText', {
                horas: limit,
                defaultValue: 'Al confirmar la reserva, quedará guardada automáticamente en tu cuenta. Tendrás un plazo de {{horas}} horas para completar el pago antes de su cancelación automática.'
              });
            })()}
          </p>
        </div>
  )
}
