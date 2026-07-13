/**
 * Servicio temporal para simular la generación y firma del contrato de
 * reserva y alquiler. Igual que reservaService/documentosService, esto
 * debería migrarse a un backend real, pero mientras no exista, se simula
 * con localStorage guardando el contrato (código, firma en base64, ciudad,
 * fecha) asociado a la referencia de la reserva.
 */

const STORAGE_KEY = 'drivique_contratos';

function leerTodos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error leyendo contratos guardados', error);
    return {};
  }
}

function guardarTodos(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Genera un código de contrato legible y único, siguiendo el mismo patrón
 * que generarReferenciaUnica() de wompiService (prefijo + timestamp + azar).
 */
function generarCodigoContrato() {
  return 'CTR-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
}

export const contratoService = {
  /**
   * Devuelve el contrato ya firmado para una reserva (por su referencia),
   * o null si esa reserva todavía no tiene contrato firmado.
   */
  obtenerPorReserva: (referenciaReserva) => {
    if (!referenciaReserva) return null;
    const todos = leerTodos();
    return todos[referenciaReserva] || null;
  },

  /**
   * Crea (si no existe) el código de contrato para una reserva, sin
   * marcarlo todavía como firmado. Útil para mostrar el código en pantalla
   * antes de que el usuario firme.
   */
  obtenerOCrearCodigo: (referenciaReserva) => {
    if (!referenciaReserva) return generarCodigoContrato();
    const todos = leerTodos();
    if (todos[referenciaReserva]?.codigo) return todos[referenciaReserva].codigo;
    return generarCodigoContrato();
  },

  /**
   * Guarda la firma del usuario y deja el contrato en estado FIRMADO,
   * asociado a la referencia de la reserva.
   */
  guardarFirma: (referenciaReserva, { codigo, firmaUsuarioDataUrl, ciudad, fecha }) => {
    if (!referenciaReserva) return null;
    const todos = leerTodos();

    const contrato = {
      codigo: codigo || generarCodigoContrato(),
      referenciaReserva,
      firmaUsuarioDataUrl,
      ciudad: ciudad || '',
      fecha: fecha || new Date().toISOString(),
      estado: 'FIRMADO',
      firmadoEn: new Date().toISOString(),
    };

    todos[referenciaReserva] = contrato;
    guardarTodos(todos);
    return contrato;
  },
};
