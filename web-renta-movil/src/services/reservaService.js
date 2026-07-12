/**
 * Servicio temporal para simular el almacenamiento de reservas.
 * Esto debería migrarse a un backend.
 */

const STORAGE_KEY = 'drivique_reservas';

export const reservaService = {
  getReservas: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error leyendo reservas", error);
      return [];
    }
  },

  guardarReserva: (reserva) => {
    const reservas = reservaService.getReservas();
    reservas.push(reserva);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
    return reserva;
  },

  obtenerPorReferencia: (referencia) => {
    const reservas = reservaService.getReservas();
    return reservas.find(r => r.referencia === referencia);
  },

  actualizarEstado: (referencia, nuevoEstado, paymentId = null) => {
    const reservas = reservaService.getReservas();
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
