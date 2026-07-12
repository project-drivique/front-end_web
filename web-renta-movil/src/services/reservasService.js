import reservasMock from '../mocks/reservas.json'
import { reservaService } from './reservaService'

const USAR_MOCK =
  import.meta.env.VITE_USAR_MOCK === 'true' || !import.meta.env.VITE_API_URL

let apiInstance = null

async function getApi() {
  if (!apiInstance) {
    const { api } = await import('./authService')
    apiInstance = api
  }
  return apiInstance
}

/**
 * Convierte una reserva guardada localmente (creada desde el flujo de
 * reserva, con pago Wompi o en efectivo) al formato que usa el historial de
 * reservas de la app.
 */
function mapearReservaLocal(r) {
  return {
    id: r.referencia,
    vehiculoId: r.vehiculoId,
    fechaInicio: r.reservaDetalles?.fechaInicio,
    fechaFin: r.reservaDetalles?.fechaFin,
    estado: r.estado,
    total: r.total,
    fechaLimitePago: r.fechaLimitePago || null,
    horasLimitePago: r.horasLimitePago || null,
    metodoPago: r.reservaDetalles?.metodoPago || null,
    esLocal: true,
  }
}

export const reservasService = {
  getReservas: async () => {
    if (USAR_MOCK) {
      const locales = reservaService.getReservas().map(mapearReservaLocal)
      // Las reservas reales creadas en esta sesión/navegador van primero.
      return [...locales, ...reservasMock]
    }

    const api = await getApi()
    const { data } = await api.get('/reservas')
    return data
  },

  getReservasPorVehiculo: async (vehiculoId) => {
    if (USAR_MOCK) {
      return reservasMock.filter(r => r.vehiculoId === Number(vehiculoId))
    }

    const api = await getApi()
    const { data } = await api.get('/reservas', { params: { vehiculoId } })
    return data
  },

  getReservaById: async (id) => {
    if (USAR_MOCK) {
      const reserva = reservasMock.find(r => r.id === Number(id))
      if (!reserva) throw new Error('Reserva no encontrada')
      return reserva
    }

    const api = await getApi()
    const { data } = await api.get(`/reservas/${id}`)
    return data
  },

  crearReserva: async (datosReserva) => {
    if (USAR_MOCK) return { id: Date.now(), ...datosReserva }

    const api = await getApi()
    const { data } = await api.post('/reservas', datosReserva)
    return data
  },

  cancelarReserva: async (id) => {
    if (USAR_MOCK) {
      // Las reservas locales tienen como id su referencia (string), a
      // diferencia de las del mock que usan un id numérico.
      if (typeof id === 'string') {
        reservaService.actualizarEstado(id, 'CANCELADA')
      }
      return { id, cancelada: true }
    }

    const api = await getApi()
    const { data } = await api.patch(`/reservas/${id}/cancelar`)
    return data
  },
}
