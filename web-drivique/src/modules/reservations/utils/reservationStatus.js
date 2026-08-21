export const ESTADOS_RESERVA = Object.freeze({
  PENDIENTE: 'PENDIENTE',
  PENDIENTE_EFECTIVO: 'PENDIENTE_EFECTIVO',
  PENDIENTE_VALIDACION: 'PENDIENTE_VALIDACION',
  CONFIRMADA: 'CONFIRMADA',
  ACTIVA: 'ACTIVA',
  COMPLETADA: 'COMPLETADA',
  CANCELADA: 'CANCELADA',
  CANCELADA_POR_TIEMPO: 'CANCELADA_POR_TIEMPO',
})

export const ESTADO_VISIBLE_RESERVA = Object.freeze({
  [ESTADOS_RESERVA.PENDIENTE]: 'pendiente',
  [ESTADOS_RESERVA.PENDIENTE_EFECTIVO]: 'pendiente',
  [ESTADOS_RESERVA.PENDIENTE_VALIDACION]: 'pendiente',
  [ESTADOS_RESERVA.CONFIRMADA]: 'confirmada',
  [ESTADOS_RESERVA.ACTIVA]: 'en_curso',
  [ESTADOS_RESERVA.COMPLETADA]: 'finalizada',
  [ESTADOS_RESERVA.CANCELADA]: 'cancelada',
  [ESTADOS_RESERVA.CANCELADA_POR_TIEMPO]: 'cancelada',

  // Alias compatibles con datos existentes y respuestas futuras de API.
  EN_CURSO: 'en_curso',
  FINALIZADA: 'finalizada',
})

export function obtenerEstadoVisible(estado) {
  if (!estado) return null
  const estadoNormalizado = String(estado).trim().toUpperCase()
  return ESTADO_VISIBLE_RESERVA[estadoNormalizado] || estadoNormalizado.toLowerCase()
}
