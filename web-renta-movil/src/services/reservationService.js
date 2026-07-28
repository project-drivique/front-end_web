/**
 * Servicio temporal para simular el almacenamiento de reservas.
 * Esto debería migrarse a un backend.
 */

const STORAGE_KEY = 'drivique_reservas';

// Tiempo que tiene el usuario para acercarse a la sucursal a pagar en
// efectivo antes de que la reserva se cancele automáticamente.
export const HORAS_LIMITE_PAGO_EFECTIVO = 4;

function calcularFechaLimitePago() {
  return new Date(Date.now() + HORAS_LIMITE_PAGO_EFECTIVO * 60 * 60 * 1000).toISOString();
}

/**
 * Recorre las reservas y cancela automáticamente (en la lógica local/mock)
 * aquellas que quedaron en estado PENDIENTE_EFECTIVO cuyo plazo de pago ya
 * venció sin haberse marcado como pagadas.
 */
function vencerReservasEfectivo(reservas) {
  const ahora = Date.now();
  let cambiaron = false;

  const actualizadas = reservas.map((r) => {
    if (r.estado === 'PENDIENTE_EFECTIVO' && r.fechaLimitePago && new Date(r.fechaLimitePago).getTime() < ahora) {
      cambiaron = true;
      return { ...r, estado: 'CANCELADA_POR_TIEMPO' };
    }
    return r;
  });

  return { actualizadas, cambiaron };
}

export const reservationService = {
  getReservas: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const reservas = data ? JSON.parse(data) : [];
      const { actualizadas, cambiaron } = vencerReservasEfectivo(reservas);
      if (cambiaron) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizadas));
      }
      return actualizadas;
    } catch (error) {
      console.error("Error leyendo reservas", error);
      return [];
    }
  },

  /**
   * Guarda una reserva nueva. Si el método de pago es 'efectivo', calcula y
   * asigna automáticamente el plazo límite para pagar en sucursal
   * (fechaLimitePago) y deja el estado en PENDIENTE_EFECTIVO.
   */
  guardarReserva: (reserva) => {
    const reservas = reservationService.getReservas();

    const esEfectivo = reserva.reservaDetalles?.metodoPago === 'efectivo';
    const reservaFinal = esEfectivo
      ? {
          ...reserva,
          estado: 'PENDIENTE_EFECTIVO',
          fechaLimitePago: calcularFechaLimitePago(),
          horasLimitePago: HORAS_LIMITE_PAGO_EFECTIVO,
        }
      : reserva;

    reservas.push(reservaFinal);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
    return reservaFinal;
  },

  obtenerPorReferencia: (referencia) => {
    const reservas = reservationService.getReservas();
    return reservas.find(r => r.referencia === referencia);
  },

  actualizarEstado: (referencia, nuevoEstado, paymentId = null) => {
    const reservas = reservationService.getReservas();
    const index = reservas.findIndex(r => r.referencia === referencia);
    if (index !== -1) {
      reservas[index].estado = nuevoEstado;
      if (paymentId) reservas[index].paymentId = paymentId;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
      return true;
    }
    return false;
  }
};
