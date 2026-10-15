
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

function mapVehicle(vehicle) {
  if (!vehicle || typeof vehicle !== 'object') return vehicle
  const mainImage = vehicle.mainImageUrl || vehicle.imagen || vehicle.foto || ''
  return {
    ...vehicle,
    nombre: vehicle.nombre || [vehicle.brandName, vehicle.model].filter(Boolean).join(' '),
    marca: vehicle.marca || vehicle.brandName,
    modelo: vehicle.modelo || vehicle.model,
    categoria: vehicle.categoria || vehicle.categoryName,
    categoriaId: vehicle.categoriaId || vehicle.categoryId,
    transmision: vehicle.transmision || vehicle.transmissionName || vehicle.transmissionCode,
    combustible: vehicle.combustible || vehicle.fuelTypeName || vehicle.fuelTypeCode,
    sucursal: vehicle.sucursal || vehicle.branchName,
    sucursalId: vehicle.sucursalId || vehicle.branchId,
    ciudad: vehicle.ciudad || vehicle.cityName,
    año: vehicle.año || vehicle.year,
    pasajeros: vehicle.pasajeros || vehicle.passengerCapacity,
    puertas: vehicle.puertas || vehicle.doorsCount,
    kilometraje: vehicle.kilometraje ?? vehicle.mileage,
    precio: Number(vehicle.precio ?? vehicle.dailyRate ?? 0),
    imagen: mainImage,
    imagenes: Array.isArray(vehicle.imagenes)
      ? vehicle.imagenes
      : (mainImage ? [mainImage] : []),
    destacado: vehicle.destacado ?? vehicle.isFeatured ?? false,
    activo: vehicle.activo ?? vehicle.isActive ?? true,
    disponible: vehicle.disponible ?? vehicle.allowsReservation ?? false,
  }
}

export const catalogService = {
  getVehiculos: async (filtros = {}) => {
    // Obtiene la lista de vehículos, ya sea mock o backend real.

    // Si está en modo mock, filtra el JSON localmente y lo devuelve.

    const api = await getApi()
    // Si no usa mock, obtiene la instancia de la API real.

    const { data } = await api.get('/vehicles/search', { params: filtros })
    // Hace una petición GET al endpoint /vehiculos
    // enviando los filtros como query params.

    const vehicles = data.content ?? data.vehiculos ?? data
    return Array.isArray(vehicles) ? vehicles.map(mapVehicle) : []
    // Devuelve data.vehiculos si existe;
    // si no, devuelve data completo.
    // Esto ayuda cuando el backend responde con diferentes formatos.
  },

  getVehiculoById: async (id) => {
    // Obtiene un vehículo específico por su id.


    const api = await getApi()
    // Si usa backend real, obtiene la instancia API.

    const { data } = await api.get(`/vehicles/${id}`)
    // Pide el vehículo por id al backend.

    return mapVehicle(data)
    // Devuelve la respuesta.
  },

  getVehiculosDestacados: async () => {
    // Obtiene solo los vehículos destacados.

    // En mock, filtra los que tengan destacado = true.

    const api = await getApi()
    // Si no usa mock, carga la API real.

    const { data } = await api.get('/vehicles/featured')
    // Hace GET al endpoint de destacados.

    const vehicles = data.content ?? data.vehiculos ?? data
    return Array.isArray(vehicles) ? vehicles.map(mapVehicle) : []
    // Devuelve la lista según el formato de respuesta.
  },

  getCiudades: async () => {
    const api = await getApi()
    const { data } = await api.get('/cities')
    return Array.isArray(data) ? data : []
  },

  getSedes: async (ciudadId) => {
    const api = await getApi()
    const url = ciudadId ? `/cities/${ciudadId}/branches` : '/branches'
    const { data } = await api.get(url)
    return Array.isArray(data) ? data : []
  },

  getCategorias: async () => {
    const api = await getApi()
    const { data } = await api.get('/vehicle-categories')
    return Array.isArray(data) ? data : []
  },

  getCaracteristicas: async (vehiculoId) => {
    const api = await getApi()
    const { data } = await api.get(`/vehicles/${vehiculoId}/features`)
    return Array.isArray(data) ? data : []
  },

  toggleFavorito: async (vehiculoId) => {
    const api = await getApi()
    const { data } = await api.post(`/v1/users/me/favorites/${vehiculoId}`)
    return data
  },
}
