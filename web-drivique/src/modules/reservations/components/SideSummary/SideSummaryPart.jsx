export default function SideSummaryPart({ c, editHabilitado, fmt, onEditar, reserva, t, translateLocation }) {
  return (
    <div style={{ padding: '20px', borderBottom: `1px solid ${c?.cardBorder || 'var(--borde)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontSize: 11, fontWeight: 800, color: c?.accentText || 'var(--brand-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                {t('vehiculo.datesAndLocations', 'Fechas y Lugares')}
              </h4>
              {editHabilitado && (
                <button onClick={() => onEditar('retiro')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: c?.accentText || 'var(--brand-primary)', fontWeight: 700, padding: 0 }}>
                  {t('vehiculo.edit', 'Editar')}
                </button>
              )}
            </div>
  
            {/* Entrega */}
            <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px dashed ${c?.cardBorder || 'var(--borde)'}` }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: c?.textSecondary || '#64748b', textTransform: 'uppercase', margin: '0 0 8px' }}>{t('vehiculo.pickupLocation', 'Entrega')}</p>
              <div style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: c?.textPrimary || '#0f172a', margin: '0 0 2px' }}>
                  {reserva.fechaInicio ? `${fmt(reserva.fechaInicio)}` : t('vehiculo.dateNotSelected', 'Fecha no seleccionada')}
                </p>
                <p style={{ fontSize: 11, color: c?.textSecondary || '#64748b', margin: 0 }}>
                  {reserva.horaInicio || '--:--'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: c?.textPrimary || '#0f172a', margin: '0' }}>
                  {translateLocation(reserva.sucursalRetiro)}
                </p>
                {reserva.sucursalRetiro === 'domicilio' && (reserva.domicilioDireccion || reserva.domicilioBarrio) && (
                  <p style={{ fontSize: 11, color: c?.accentText || 'var(--brand-primary)', fontWeight: 700, margin: '4px 0 0', wordBreak: 'break-word', lineHeight: 1.3 }}>
                    📍 {[reserva.domicilioDireccion, reserva.domicilioBarrio, reserva.domicilioCiudad].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
  
            {/* Devolución */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, color: c?.textSecondary || '#64748b', textTransform: 'uppercase', margin: '0 0 8px' }}>{t('vehiculo.returnLocation', 'Devolución')}</p>
              <div style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: c?.textPrimary || '#0f172a', margin: '0 0 2px' }}>
                  {reserva.fechaFin ? `${fmt(reserva.fechaFin)}` : t('vehiculo.dateNotSelected', 'Fecha no seleccionada')}
                </p>
                <p style={{ fontSize: 11, color: c?.textSecondary || '#64748b', margin: 0 }}>
                  {reserva.horaFin || '--:--'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: c?.textPrimary || '#0f172a', margin: '0' }}>
                  {translateLocation(reserva.sucursalDevolucion)}
                </p>
                {reserva.sucursalDevolucion === 'domicilio' && (reserva.domicilioDireccion || reserva.domicilioBarrio) && (
                  <p style={{ fontSize: 11, color: c?.accentText || 'var(--brand-primary)', fontWeight: 700, margin: '4px 0 0', wordBreak: 'break-word', lineHeight: 1.3 }}>
                    📍 {[reserva.domicilioDireccion, reserva.domicilioBarrio, reserva.domicilioCiudad].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
  )
}
