import vehiculosMock from '../mocks/vehiculos.json'

const USAR_MOCK = import.meta.env.VITE_USAR_MOCK === 'true' || !import.meta.env.VITE_API_URL

let apiInstance = null

async function getApi() {
  if (!apiInstance) {
    const { api } = await import('./authService')
    apiInstance = api
  }
  return apiInstance
}

function filtrarMock(vehiculos, filtros = {}) {
  let resultado = [...vehiculos]

  if (filtros.categoria && filtros.categoria !== 'Todos') resultado = resultado.filter(v => v.categoria === filtros.categoria)
  if (filtros.transmision && filtros.transmision !== 'Todas') resultado = resultado.filter(v => v.transmision === filtros.transmision)
  if (filtros.combustible && filtros.combustible !== 'Todos') resultado = resultado.filter(v => v.combustible === filtros.combustible)
  if (filtros.precioMin) resultado = resultado.filter(v => v.precio >= Number(filtros.precioMin))
  if (filtros.precioMax) resultado = resultado.filter(v => v.precio <= Number(filtros.precioMax))
  if (filtros.soloDisponibles) resultado = resultado.filter(v => v.disponible)

  if (filtros.orden === 'precio_desc') resultado.sort((a, b) => b.precio - a.precio)
  else if (filtros.orden === 'calificacion') resultado.sort((a, b) => b.calificacion - a.calificacion)
  else resultado.sort((a, b) => a.precio - b.precio)

  return resultado
}

export const catalogoService = {
  getVehiculos: async (filtros = {}) => {
    if (USAR_MOCK) return filtrarMock(vehiculosMock, filtros)
    const api = await getApi()
    const { data } = await api.get('/vehiculos', { params: filtros })
    return data.vehiculos ?? data
  },

  getVehiculoById: async (id) => {
    if (USAR_MOCK) {
      const vehiculo = vehiculosMock.find(v => v.id === Number(id))
      if (!vehiculo) throw new Error('Vehículo no encontrado')
      return vehiculo
    }
    const api = await getApi()
    const { data } = await api.get(`/vehiculos/${id}`)
    return data
  },

  getVehiculosDestacados: async () => {
    if (USAR_MOCK) return vehiculosMock.filter(v => v.destacado)
    const api = await getApi()
    const { data } = await api.get('/vehiculos/destacados')
    return data.vehiculos ?? data
  },

  toggleFavorito: async (vehiculoId) => {
    if (USAR_MOCK) return { vehiculoId, favorito: true }
    const api = await getApi()
    const { data } = await api.post(`/vehiculos/${vehiculoId}/favorito`)
    return data
  },
}