/**
 * Servicio temporal para simular el almacenamiento de reservas.
 * Esto debería migrarse a un backend.
 */

const STORAGE_KEY = 'drivique_reservas';

// Tiempo que tiene el usuario para acercarse a la sucursal a pagar en
// efectivo antes de que la reserva se cancele automáticamente (72 horas).
export const HORAS_LIMITE_PAGO_EFECTIVO = 72;

function calcularFechaLimitePago(fechaInicio, horaInicio) {
  if (!fechaInicio || !horaInicio) {
    return {
      horasLimite: HORAS_LIMITE_PAGO_EFECTIVO,
      fechaLimite: new Date(Date.now() + HORAS_LIMITE_PAGO_EFECTIVO * 60 * 60 * 1000).toISOString()
    };
  }

  const pickupMs = new Date(`${fechaInicio}T${horaInicio}:00`).getTime();
  const nowMs = Date.now();
  
  const horasRestantes = Math.max(0, (pickupMs - nowMs) / (1000 * 60 * 60));
  const horasLimite = Math.floor(Math.min(HORAS_LIMITE_PAGO_EFECTIVO, Math.max(2, horasRestantes)));
  const fechaLimite = new Date(nowMs + (horasLimite * 60 * 60 * 1000)).toISOString();
  
  return { horasLimite, fechaLimite };
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

const SEED_RES_8821 = {
  id: 'RES-8821',
  referencia: 'RES-8821',
  codigo: 'RES-8821',
  estado: 'confirmada',
  pagoEstado: 'aprobado',
  metodoPago: 'wompi',
  vehiculoId: '5',
  vehiculoNombre: 'Toyota Corolla 2024',
  vehiculoPlaca: 'ABC-123',
  sucursalRetiro: 'Alamo Bogotá - Aeropuerto',
  sucursalDevolucion: 'Alamo Bogotá - Aeropuerto',
  sucursal: 'Alamo Bogotá - Aeropuerto',
  fechaInicio: '2026-09-25T08:30:00Z',
  fechaFin: '2026-09-28T18:00:00Z',
  horaInicio: '08:30',
  horaFin: '18:00',
  total: 420000,
  totalCOP: 420000,
  datosForm: {
    nombres: 'Carlos',
    apellidos: 'Restrepo',
    nombre: 'Carlos Restrepo',
    correo: 'carlos.restrepo@email.com',
    celular: '+57 310 456 7890',
    numDoc: '1020304050'
  }
}

const SEED_RES_8824 = {
  id: 'RES-8824',
  referencia: 'RES-8824',
  codigo: 'RES-8824',
  estado: 'creada',
  pagoEstado: 'pendiente',
  metodoPago: 'efectivo',
  pasarela: 'efectivo',
  reservaDetalles: {
    metodoPago: 'efectivo',
    sucursalPagoEfectivo: 'Alamo Bogotá - Aeropuerto',
    sucursalRetiro: 'Alamo Bogotá - Aeropuerto',
  },
  vehiculoId: '3',
  vehiculoNombre: 'Mazda CX-5 2024',
  vehiculoPlaca: 'KLS-849',
  sucursalRetiro: 'Alamo Bogotá - Aeropuerto',
  sucursalDevolucion: 'Alamo Bogotá - Aeropuerto',
  sucursal: 'Alamo Bogotá - Aeropuerto',
  sucursalPagoEfectivo: 'Alamo Bogotá - Aeropuerto',
  fechaInicio: '2026-09-25T10:15:00Z',
  fechaFin: '2026-09-29T17:00:00Z',
  horaInicio: '10:15',
  horaFin: '17:00',
  total: 360000,
  totalCOP: 360000,
  datosForm: {
    nombres: 'Camila',
    apellidos: 'Montoya',
    nombre: 'Camila Montoya',
    correo: 'camila.montoya@email.com',
    celular: '+57 315 890 1234',
    numDoc: '1030405060'
  }
}

const SEED_RES_8830 = {
  id: 'RES-8830',
  referencia: 'RES-8830',
  codigo: 'RES-8830',
  estado: 'confirmada',
  pagoEstado: 'aprobado',
  metodoPago: 'wompi',
  vehiculoId: '4',
  vehiculoNombre: 'Chevrolet Tracker 2024',
  vehiculoPlaca: 'MXP-492',
  sucursalRetiro: 'Alamo Bogotá - Aeropuerto',
  sucursalDevolucion: 'Alamo Bogotá - Aeropuerto',
  sucursal: 'Alamo Bogotá - Aeropuerto',
  fechaInicio: '2026-09-25T14:00:00Z',
  fechaFin: '2026-09-30T10:00:00Z',
  horaInicio: '14:00',
  horaFin: '10:00',
  total: 380000,
  totalCOP: 380000,
  datosForm: {
    nombres: 'Alejandro',
    apellidos: 'Morales',
    nombre: 'Alejandro Morales',
    correo: 'alejandro.morales@email.com',
    celular: '+57 300 567 8901',
    numDoc: '1040506070'
  }
}

const SEED_RES_8799 = {
  id: 'RES-8799',
  referencia: 'RES-8799',
  codigo: 'RES-8799',
  estado: 'en_curso',
  pagoEstado: 'aprobado',
  metodoPago: 'wompi',
  vehiculoId: '2',
  vehiculoNombre: 'Nissan Kicks 2024',
  vehiculoPlaca: 'ZTR-771',
  sucursalRetiro: 'Alamo Bogotá - Aeropuerto',
  sucursalDevolucion: 'Alamo Bogotá - Aeropuerto',
  sucursal: 'Alamo Bogotá - Aeropuerto',
  fechaInicio: '2026-09-22T11:00:00Z',
  fechaFin: '2026-09-25T11:00:00Z',
  horaInicio: '11:00',
  horaFin: '11:00',
  total: 310000,
  totalCOP: 310000,
  datosForm: {
    nombres: 'Juan Manuel',
    apellidos: 'Gómez',
    nombre: 'Juan Manuel Gómez',
    correo: 'juan.gomez@email.com',
    celular: '+57 312 345 6789',
    numDoc: '1050607080'
  }
}

const SEED_RES_8802 = {
  id: 'RES-8802',
  referencia: 'RES-8802',
  codigo: 'RES-8802',
  estado: 'en_curso',
  pagoEstado: 'aprobado',
  metodoPago: 'wompi',
  vehiculoId: '1',
  vehiculoNombre: 'Kia Cerato 2024',
  vehiculoPlaca: 'BOG-992',
  sucursalRetiro: 'Alamo Bogotá - Aeropuerto',
  sucursalDevolucion: 'Alamo Bogotá - Aeropuerto',
  sucursal: 'Alamo Bogotá - Aeropuerto',
  fechaInicio: '2026-09-21T16:30:00Z',
  fechaFin: '2026-09-25T16:30:00Z',
  horaInicio: '16:30',
  horaFin: '16:30',
  total: 290000,
  totalCOP: 290000,
  datosForm: {
    nombres: 'Laura Sofía',
    apellidos: 'Silva',
    nombre: 'Laura Sofía Silva',
    correo: 'laura.silva@email.com',
    celular: '+57 318 901 2345',
    numDoc: '1060708090'
  }
}

const DEMO_RESERVA_FINALIZADA = {
  id: 'RES-2026-DEMO',
  referencia: 'RES-2026-DEMO',
  codigo: 'RES-2026-DEMO',
  estado: 'finalizada',
  pagoEstado: 'aprobado',
  metodoPago: 'wompi',
  vehiculoId: 1,
  vehiculoNombre: 'Kia Cerato 2024',
  sucursalRetiro: 'Alamo Bogotá - Aeropuerto',
  sucursalDevolucion: 'Alamo Bogotá - Aeropuerto',
  fechaInicio: '2026-09-15T07:30:00Z',
  fechaFin: '2026-09-18T19:00:00Z',
  horaInicio: '07:30',
  horaFin: '19:00',
  total: 420000,
  totalCOP: 420000,
  datosForm: {
    nombres: 'Cliente',
    apellidos: 'Drivique',
    nombre: 'Cliente Drivique',
    correo: 'cliente@drivique.com',
    celular: '+57 300 123 4567',
    numDoc: '1020304050'
  }
}

const DEMO_RESERVA_EFECTIVO = {
  id: 'RES-2026-EFECTIVO',
  referencia: 'RES-2026-EFECTIVO',
  codigo: 'RES-2026-EFECTIVO',
  estado: 'pendiente',
  pagoEstado: 'pendiente',
  metodoPago: 'efectivo',
  vehiculoId: 2,
  vehiculoNombre: 'Renault Sandero 2024',
  sucursalRetiro: 'Alamo Bogotá - Aeropuerto',
  sucursalDevolucion: 'Alamo Bogotá - Aeropuerto',
  fechaInicio: '2026-10-15T08:00:00Z',
  fechaFin: '2026-10-18T18:00:00Z',
  horaInicio: '08:00',
  horaFin: '18:00',
  fechaCreacion: new Date().toISOString(),
  fechaLimitePago: new Date(Date.now() + 72 * 3600000).toISOString(),
  total: 250000,
  totalCOP: 250000,
  datosForm: {
    nombres: 'Prueba',
    apellidos: 'Efectivo',
    nombre: 'Prueba Efectivo',
    correo: 'efectivo@drivique.com',
    celular: '+57 311 222 3344',
    numDoc: '1122334455'
  }
}




const INITIAL_RESERVATIONS_SEED = [
  
  SEED_RES_8821,
  SEED_RES_8824,
  SEED_RES_8830,
  SEED_RES_8799,
  SEED_RES_8802
];

export const reservationService = {
  getReservas: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      let reservas = data ? JSON.parse(data) : [];
      // Force exactly 5 reservations if we have more
      if (reservas.length > 5) {
        reservas = INITIAL_RESERVATIONS_SEED;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
      }
      if (!Array.isArray(reservas) || reservas.length === 0) {
        reservas = INITIAL_RESERVATIONS_SEED;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
      } else {
        // Asegurar que las reservas clave estén presentes
        const seedKeys = [
          { key: 'RES-8821', obj: SEED_RES_8821 },
          { key: 'RES-8824', obj: SEED_RES_8824 },
          { key: 'RES-8830', obj: SEED_RES_8830 },
          { key: 'RES-8799', obj: SEED_RES_8799 },
          { key: 'RES-8802', obj: SEED_RES_8802 },
        ];
        seedKeys.forEach(({ key, obj }) => {
          if (!reservas.some(r => r.id === key || r.codigo === key)) {
            reservas.push(obj);
          }
        });
      }
      
      // Limpiar reservas residuales anteriores
      const legacySeedIds = new Set(['RES-2026-9102', 'RES-1788806368641-R95O5FB', 'RES-1788806368641-R9505FB']);
      reservas = reservas.filter(r => !legacySeedIds.has(r.referencia) && !legacySeedIds.has(r.id) && !legacySeedIds.has(r.codigo));
      
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
    let pagoProps = {};
    if (esEfectivo) {
       const limite = calcularFechaLimitePago(reserva.fechaInicio, reserva.horaInicio);
       pagoProps = {
         estado: 'PENDIENTE_EFECTIVO',
         fechaLimitePago: limite.fechaLimite,
         horasLimitePago: limite.horasLimite
       };
    }

    const reservaFinal = {
      ...reserva,
      fechaCreacion: reserva.fechaCreacion || reserva.fechaReserva || ahoraIso,
      fechaReserva: reserva.fechaReserva || reserva.fechaCreacion || ahoraIso,
      ...pagoProps
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
        if (!reservas[index].metodoPagoConfirmado) {
          reservas[index].metodoPagoConfirmado = reservas[index].metodoPago === 'efectivo' ? 'efectivo' : 'wompi';
        }
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
      reservas[index].metodoPagoConfirmado = medioPago?.toLowerCase().includes('efectivo') && !medioPago?.toLowerCase().includes('wompi') ? 'efectivo' : 'wompi';
      if (reservas[index].reservaDetalles) {
        reservas[index].reservaDetalles.medioPago = medioPago;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
      return true;
    }
    return false;
  }
};
