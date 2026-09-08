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

const INITIAL_RESERVATIONS_SEED = [
  {
    referencia: 'RES-2026-9102',
    vehiculoId: 2,
    total: 348000,
    estado: 'ACTIVA',
    fechaLimitePago: null,
    horasLimitePago: null,
    reservaDetalles: {
      fechaInicio: fechaInicioAyer,
      fechaFin: fechaFinEnTresDias,
      horaInicio: '09:00',
      horaFin: '18:00',
      sucursalRetiro: 'Bogotá - Calle 100',
      sucursalDevolucion: 'Bogotá - Calle 100',
      metodoPago: 'tarjeta',
    },
    datosForm: {
      nombres: 'Carlos',
      apellidos: 'Mendoza',
      correo: 'cliente@drivique.com',
      telefono: '+57 314 478 9702',
      numDoc: '1020304050',
    },
  },
  {
    referencia: 'RES-1788806368641-R95O5FB',
    codigo: 'RES-1788806368641-R95O5FB',
    id: 'RES-1788806368641-R95O5FB',
    vehiculoId: 2,
    vehiculoNombre: 'Mazda CX-5 2024',
    vehiculoPlaca: 'KLS-849',
    total: 406314,
    totalCOP: 406314,
    estado: 'CONFIRMADA',
    pagoEstado: 'aprobado',
    metodoPagoConfirmado: 'efectivo',
    fechaPagoConfirmado: new Date().toISOString(),
    fechaCreacion: new Date().toISOString(),
    cajeroConfirmacion: 'Encargado Alamo Medellín Poblado',
    observacionesCaja: 'Cobro en efectivo recibido y validado en caja de sucursal',
    sucursal: 'Alamo Medellín Poblado',
    sucursalPagoEfectivo: 'Alamo Medellín Poblado',
    fechaLimitePago: null,
    horasLimitePago: null,
    reservaDetalles: {
      fechaInicio: new Date().toISOString().slice(0, 10),
      fechaFin: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      horaInicio: '14:00',
      horaFin: '18:00',
      sucursalRetiro: 'Alamo Medellín Poblado',
      sucursalDevolucion: 'Alamo Medellín Poblado',
      sucursalPagoEfectivo: 'Alamo Medellín Poblado',
      metodoPago: 'efectivo',
    },
    datosForm: {
      nombres: 'Mateo',
      apellidos: 'Gómez Restrepo',
      correo: 'mateo.gomez@drivique.com',
      telefono: '+57 300 456 7890',
      numDoc: '1035987654',
    },
  },
]

export const reservationService = {
  getReservas: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      let reservas = data ? JSON.parse(data) : [];
      if (!Array.isArray(reservas) || reservas.length === 0) {
        reservas = INITIAL_RESERVATIONS_SEED;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
      } else {
        // Garantizar que las semillas de sucursales existan en el almacenamiento
        let agregados = false;
        INITIAL_RESERVATIONS_SEED.forEach((seed) => {
          const existe = reservas.some(
            (r) =>
              String(r.referencia || r.codigo || r.id || '').toUpperCase() === String(seed.referencia).toUpperCase() ||
              String(r.referencia || r.codigo || r.id || '').replace(/0/g, 'O').toUpperCase() === String(seed.referencia).replace(/0/g, 'O').toUpperCase()
          );
          if (!existe) {
            reservas.push(seed);
            agregados = true;
          }
        });
        if (agregados) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
        }
      }
      const { actualizadas, cambiaron } = vencerReservasEfectivo(reservas);
      if (cambiaron) {
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
    if (!referencia) return null;
    const refUpper = String(referencia).trim().toUpperCase();
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
    const index = reservas.findIndex(r => r.referencia === referencia || r.codigo === referencia || r.id === referencia);
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
    const index = reservas.findIndex(r => r.referencia === referencia || r.codigo === referencia || r.id === referencia);
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
