import { vehicleManagementService } from './vehicleManagementService'
// Importa el archivo JSON con los vehículos de prueba (mock).

const USAR_MOCK =
  import.meta.env.VITE_USAR_MOCK === 'true' || !import.meta.env.VITE_API_URL
// Define si se usarán datos mock o API real.
// Usa mock cuando:
// 1. VITE_USAR_MOCK sea exactamente 'true', o
// 2. no exista VITE_API_URL.
// Esto es útil para desarrollo local o cuando el backend aún no está listo.

let apiInstance = null
// Variable para guardar la instancia de la API una sola vez.
// Empieza en null porque todavía no se ha cargado.

async function getApi() {
  // Función que carga dinámicamente la API real solo cuando se necesita.

  if (!apiInstance) {
    // Si la API todavía no se ha cargado...

    const { api } = await import('./authService')
    // Hace un import dinámico del archivo authService
    // y extrae la instancia llamada api.
    // Esto evita cargarla si estás trabajando solo con mocks.

    apiInstance = api
    // Guarda la instancia para reutilizarla después.
  }

  return apiInstance
  // Devuelve la instancia ya cargada.
}

function filtrarMock(vehiculos, filtros = {}) {
  // Función para aplicar filtros localmente al catálogo mock.

  let resultado = [...vehiculos]
  // Crea una copia del array original para no modificarlo directamente.

  if (filtros.categoria && filtros.categoria !== 'Todos') {
    resultado = resultado.filter(v => v.categoria === filtros.categoria)
  }
  // Si viene categoría y no es "Todos", filtra por categoría exacta.

  if (filtros.transmision && filtros.transmision !== 'Todas') {
    resultado = resultado.filter(v => v.transmision === filtros.transmision)
  }
  // Si viene transmisión y no es "Todas", filtra por transmisión exacta.

  if (filtros.combustible && filtros.combustible !== 'Todos') {
    resultado = resultado.filter(v => v.combustible === filtros.combustible)
  }
  // Si viene combustible y no es "Todos", filtra por combustible exacto.

  if (filtros.precioMin) {
    resultado = resultado.filter(v => v.precio >= Number(filtros.precioMin))
  }
  // Si existe precio mínimo, conserva solo los vehículos
  // cuyo precio sea mayor o igual.

  if (filtros.precioMax) {
    resultado = resultado.filter(v => v.precio <= Number(filtros.precioMax))
  }
  // Si existe precio máximo, conserva solo los vehículos
  // cuyo precio sea menor o igual.

  if (filtros.soloDisponibles) {
    resultado = resultado.filter(v => v.disponible)
  }
  // Si el usuario pidió solo disponibles, elimina los no disponibles.

  if (filtros.orden === 'precio_desc') {
    resultado.sort((a, b) => b.precio - a.precio)
  } else if (filtros.orden === 'calificacion') {
    resultado.sort((a, b) => b.calificacion - a.calificacion)
  } else {
    resultado.sort((a, b) => a.precio - b.precio)
  }
  // Ordena el resultado:
  // - precio_desc: mayor a menor precio
  // - calificacion: mayor a menor rating
  // - por defecto: menor a mayor precio

  return resultado
  // Devuelve la lista final filtrada y ordenada.
}

export const catalogService = {
  getVehiculos: async (filtros = {}) => {
    // Obtiene la lista de vehículos, ya sea mock o backend real.

    if (USAR_MOCK) return filtrarMock(vehicleManagementService.list(), filtros)
    // Si está en modo mock, filtra el JSON localmente y lo devuelve.

    const api = await getApi()
    // Si no usa mock, obtiene la instancia de la API real.

    const { data } = await api.get('/vehiculos', { params: filtros })
    // Hace una petición GET al endpoint /vehiculos
    // enviando los filtros como query params.

    return data.vehiculos ?? data
    // Devuelve data.vehiculos si existe;
    // si no, devuelve data completo.
    // Esto ayuda cuando el backend responde con diferentes formatos.
  },

  getVehiculoById: async (id) => {
    // Obtiene un vehículo específico por su id.

    if (USAR_MOCK) {
      const vehiculo = vehicleManagementService.getById(id)
      // Busca en el JSON mock el vehículo cuyo id coincida.
      // Convierte id a número por si llega como string desde la URL.

      if (!vehiculo) throw new Error('Vehículo no encontrado')
      // Si no existe, lanza error.

      return vehiculo
      // Si existe, lo devuelve.
    }

    const api = await getApi()
    // Si usa backend real, obtiene la instancia API.

    const { data } = await api.get(`/vehiculos/${id}`)
    // Pide el vehículo por id al backend.

    return data
    // Devuelve la respuesta.
  },

  getVehiculosDestacados: async () => {
    // Obtiene solo los vehículos destacados.

    if (USAR_MOCK) return vehicleManagementService.list().filter(v => v.destacado)
    // En mock, filtra los que tengan destacado = true.

    const api = await getApi()
    // Si no usa mock, carga la API real.

    const { data } = await api.get('/vehiculos/destacados')
    // Hace GET al endpoint de destacados.

    return data.vehiculos ?? data
    // Devuelve la lista según el formato de respuesta.
  },

  toggleFavorito: async (vehiculoId) => {
    // Marca o desmarca un vehículo como favorito.

    if (USAR_MOCK) return { vehiculoId, favorito: true }
    // En mock, solo simula una respuesta positiva.
    // Ojo: aquí siempre devuelve favorito: true, no alterna realmente.

    const api = await getApi()
    // Si usa backend real, obtiene la API.

    const { data } = await api.post(`/vehiculos/${vehiculoId}/favorito`)
    // Hace POST para marcar/desmarcar favorito en el backend.

    return data
    // Devuelve la respuesta del backend.
  },
}
