import VEHICULOS_MOCK from '@/mocks/vehicles.json'

/**
 * Resuelve imágenes reales del catálogo filtradas por categoría o vehículo específico.
 */
export function obtenerImagenesPorCategoria(categoria, max = 3) {
  const vehiculosCat = VEHICULOS_MOCK.filter(v => v.categoria?.toLowerCase() === categoria?.toLowerCase())
  const imagenes = []
  vehiculosCat.forEach(v => {
    if (v.imagenes?.[0] && !imagenes.includes(v.imagenes[0])) {
      imagenes.push(v.imagenes[0])
    }
  })
  if (imagenes.length === 0) {
    VEHICULOS_MOCK.forEach(v => {
      if (v.imagenes?.[0] && !imagenes.includes(v.imagenes[0])) {
        imagenes.push(v.imagenes[0])
      }
    })
  }
  return imagenes.slice(0, max)
}

// ─── DUMMY DATA: NOTIFICACIONES GENERALES ─────────────────────────────────────
export const NOTIFICACIONES_GENERALES_INITIAL = [
  {
    id: 'notif-1',
    tipo: 'reserva_confirmada',
    tituloKey: 'notificaciones.items.reservaConfirmadaTitle',
    tituloFallback: 'Reserva confirmada',
    mensajeKey: 'notificaciones.items.reservaConfirmadaMsg',
    mensajeFallback: 'Tu reserva del Toyota Prado ha sido confirmada con éxito. Recuerda que el retiro es en la sucursal Neiva el día acordado.',
    fechaIso: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    leida: false,
    expiracionMs: Date.now() + 86400000 * 5,
  },
  {
    id: 'notif-2',
    tipo: 'pago_validado',
    tituloKey: 'notificaciones.items.pagoValidadoTitle',
    tituloFallback: 'Pago validado',
    mensajeKey: 'notificaciones.items.pagoValidadoMsg',
    mensajeFallback: 'El pago digital a través de Wompi fue validado de forma satisfactoria. Guarda tu compromiso.',
    fechaIso: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    leida: false,
    expiracionMs: Date.now() + 86400000 * 1,
  },
  {
    id: 'notif-3',
    tipo: 'documentos_verificados',
    tituloKey: 'notificaciones.items.docsVerificadosTitle',
    tituloFallback: 'Documentos verificados ✓',
    mensajeKey: 'notificaciones.items.docsVerificadosMsg',
    mensajeFallback: 'Tu licencia de conducción y documento de identidad fueron aprobados por nuestro equipo. Ya puedes continuar con tu reserva.',
    fechaIso: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    leida: false,
  },
  {
    id: 'notif-4',
    tipo: 'soporte_respuesta',
    tituloKey: 'notificaciones.items.soporteRespuestaTitle',
    tituloFallback: 'Soporte respondió tu caso',
    mensajeKey: 'notificaciones.items.soporteRespuestaMsg',
    mensajeFallback: 'El equipo de soporte respondió a su solicitud #4821. Ingresa a la sección de soporte para ver la respuesta.',
    fechaIso: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    leida: true,
  },
  {
    id: 'notif-5',
    tipo: 'alquiler_finalizado',
    tituloKey: 'notificaciones.items.alquilerFinalizadoTitle',
    tituloFallback: 'Alquiler finalizado',
    mensajeKey: 'notificaciones.items.alquilerFinalizadoMsg',
    mensajeFallback: 'Tu alquiler del Ford Explorer finalizó correctamente. Gracias por preferir Drivique.',
    fechaIso: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
    leida: true,
  },
  {
    id: 'notif-6',
    tipo: 'politica_actualizacion',
    tituloKey: 'notificaciones.items.politicaActualizacionTitle',
    tituloFallback: 'Actualización de políticas',
    mensajeKey: 'notificaciones.items.politicaActualizacionMsg',
    mensajeFallback: 'Hemos actualizado nuestros términos y condiciones de protección contra colisiones. Revisa los detalles en tu cuenta.',
    fechaIso: new Date(Date.now() - 3600 * 1000 * 96).toISOString(),
    leida: true,
  },
]

// ─── DUMMY DATA: CUPONES DE RECOMPENSA ───────────────────────────────────────
export const CUPONES_INITIAL = []

// ─── DUMMY DATA: PROMOS DE VEHÍCULOS (DEPRECATED - USAR promotionManagementService) ──
export const PROMOS_VEHICULOS_INITIAL = []

