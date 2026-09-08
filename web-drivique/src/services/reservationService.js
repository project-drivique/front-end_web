/**
 * Servicio temporal para simular el almacenamiento de reservas.
 * Esto debería migrarse a un backend.
 */

const STORAGE_KEY = 'drivique_reservas';

// Tiempo que tiene el usuario para acercarse a la sucursal a pagar en
// efectivo antes de que la reserva se cancele automáticamente (72 horas).
export const HORAS_LIMITE_PAGO_EFECTIVO = 72;

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

const hoyMs = Date.now()
const fechaInicioAyer = new Date(hoyMs - 86400000).toISOString().slice(0, 10)
const fechaFinEnTresDias = new Date(hoyMs + 86400000 * 3).toISOString().slice(0, 10)

const INITIAL_RESERVATIONS_SEED = [];

export const reservationService = {
  getReservas: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      let reservas = data ? JSON.parse(data) : [];
      if (!Array.isArray(reservas) || reservas.length === 0) {
        reservas = INITIAL_RESERVATIONS_SEED;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
      } else {
        // Limpiar reservas residuales y semillas anteriores
        const legacySeedIds = new Set(['RES-2026-9102', 'RES-1788806368641-R95O5FB', 'RES-1788806368641-R9505FB']);
        reservas = reservas.filter(r => !legacySeedIds.has(r.referencia) && !legacySeedIds.has(r.id) && !legacySeedIds.has(r.codigo));
      }
      const { actualizadas, cambiaron } = vencerReservasEfectivo(reservas);
      if (cambiaron || (data && JSON.parse(data).length !== reservas.length)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizadas));
      }
      return actualizadas;
    } catch (error) {
      console.error("Error leyendo reservas", error);
      return INITIAL_RESERVATIONS_SEED;
    }
  },

  /**
   * Guarda una reserva nueva. Si el método de pago es 'efectivo', calcula y
   * asigna automáticamente el plazo límite para pagar en sucursal
   * (fechaLimitePago) y deja el estado en PENDIENTE_EFECTIVO.
   */
  guardarReserva: (reserva) => {
    const reservas = reservationService.getReservas();
    const ahoraIso = new Date().toISOString();

    const esEfectivo = reserva.reservaDetalles?.metodoPago === 'efectivo';
    const reservaFinal = {
      ...reserva,
      fechaCreacion: reserva.fechaCreacion || reserva.fechaReserva || ahoraIso,
      fechaReserva: reserva.fechaReserva || reserva.fechaCreacion || ahoraIso,
      ...(esEfectivo
        ? {
            estado: 'PENDIENTE_EFECTIVO',
            fechaLimitePago: calcularFechaLimitePago(),
            horasLimitePago: HORAS_LIMITE_PAGO_EFECTIVO,
          }
        : {})
    };

    reservas.push(reservaFinal);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
    return reservaFinal;
  },

  obtenerPorReferencia: (referencia) => {
    if (!referencia) return null;
    const refStr = String(referencia).trim();
    const refClean = refStr.includes('_') ? refStr.split('_')[0] : refStr;
    const refUpper = refClean.toUpperCase();
    const refNoZeros = refUpper.replace(/0/g, 'O');
    const reservas = reservationService.getReservas();
    return reservas.find(r => {
      const cRef = String(r.referencia || '').trim().toUpperCase();
      const cCod = String(r.codigo || '').trim().toUpperCase();
      const cId = String(r.id || '').trim().toUpperCase();
      return (
        cRef === refUpper ||
        cCod === refUpper ||
        cId === refUpper ||
        cRef.replace(/0/g, 'O') === refNoZeros ||
        cCod.replace(/0/g, 'O') === refNoZeros ||
        cId.replace(/0/g, 'O') === refNoZeros
      );
    });
  },

  actualizarEstado: (referencia, nuevoEstado, paymentId = null) => {
    const reservas = reservationService.getReservas();
    const refStr = String(referencia || '').trim();
    const refClean = refStr.includes('_') ? refStr.split('_')[0] : refStr;
    const index = reservas.findIndex(r => 
      r.referencia === refClean || r.codigo === refClean || r.id === refClean ||
      r.referencia === refStr || r.codigo === refStr || r.id === refStr
    );
    if (index !== -1) {
      reservas[index].estado = nuevoEstado;
      if (nuevoEstado === 'CONFIRMADA' || nuevoEstado === 'confirmada') {
        reservas[index].pagoEstado = 'aprobado';
        reservas[index].metodoPagoConfirmado = 'efectivo';
        if (!reservas[index].fechaPagoConfirmado) {
          reservas[index].fechaPagoConfirmado = new Date().toISOString();
        }
      }
      if (paymentId) reservas[index].paymentId = paymentId;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
      return true;
    }
    return false;
  },

  actualizarMedioPago: (referencia, medioPago) => {
    const reservas = reservationService.getReservas();
    const refStr = String(referencia || '').trim();
    const refClean = refStr.includes('_') ? refStr.split('_')[0] : refStr;
    const index = reservas.findIndex(r => 
      r.referencia === refClean || r.codigo === refClean || r.id === refClean ||
      r.referencia === refStr || r.codigo === refStr || r.id === refStr
    );
    if (index !== -1) {
      reservas[index].medioPago = medioPago;
      if (reservas[index].reservaDetalles) {
        reservas[index].reservaDetalles.medioPago = medioPago;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
      return true;
    }
    return false;
  }
};
