// Mismo criterio que el servidor: días = horas de alquiler redondeadas hacia arriba, mínimo 1.
// El valor de la reserva es días x (tarifa del vehículo + kilometraje + protección + servicios); no hay cargos ni impuestos adicionales.
export function diasDeAlquiler(reserva) {
  if (!reserva?.fechaInicio || !reserva?.fechaFin) return 1
  const inicio = new Date(`${String(reserva.fechaInicio).split('T')[0]}T${reserva.horaInicio || '00:00'}:00`)
  const fin = new Date(`${String(reserva.fechaFin).split('T')[0]}T${reserva.horaFin || '00:00'}:00`)
  const segundos = (fin - inicio) / 1000
  return Number.isFinite(segundos) ? Math.max(1, Math.ceil(segundos / 86400)) : 1
}
