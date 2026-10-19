import { api } from '../../services/httpClient'
import ciudadesMetadata from '../../config/datos/cities.json'

export const COLOR_MARCA = '#2f4ea2'

export const CATEGORIAS = ['Todos', 'Sedan', 'SUV', 'Económico', 'Deportivo']
export const TRANSMISIONES = ['Todas', 'Automática', 'Manual']
export const COMBUSTIBLES = ['Todos', 'Gasolina', 'Diesel', 'Híbrido', 'Eléctrico']

// Se llenan desde la base de datos al iniciar la app (ver cargarUbicaciones).
export const CIUDADES = []
export const SUCURSALES = []

const slug = (v) => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
const hora = (t) => String(t || '').slice(0, 5)

export async function cargarUbicaciones() {
  try {
    const [{ data: ciudades }, { data: sucursales }] = await Promise.all([api.get('/cities'), api.get('/branches')])

    const ciudadesMapeadas = (ciudades || []).map((c) => {
      const extra = ciudadesMetadata.find((m) => m.nombre === c.name) || {}
      return {
        tieneAeropuerto: c.hasAirport,
        tieneTerminal: c.hasTerminal,
        ...extra,
        id: extra.id || slug(c.name),
        nombre: c.name,
        departamento: c.departmentName,
      }
    })
    const sucursalesMapeadas = (sucursales || []).map((b) => ({
      id: b.id,
      cityId: b.cityId,
      nombre: b.name,
      ciudad: b.cityName,
      direccion: b.address,
      telefono: b.phone,
      horario: `${hora(b.openingTime)} - ${hora(b.closingTime)}`,
      autorizadoPagoEfectivo: b.allowsCashPayment,
      estado: b.isActive ? 'activa' : 'inactiva',
    }))

    const ciudadesConSucursal = new Set(sucursalesMapeadas.map((b) => b.ciudad))
    CIUDADES.splice(0, CIUDADES.length, ...ciudadesMapeadas.filter((c) => ciudadesConSucursal.has(c.nombre)))
    SUCURSALES.splice(0, SUCURSALES.length, ...sucursalesMapeadas)

    // Descarta copias antiguas guardadas en el navegador que ya no coinciden con la BD
    const nombresBd = new Set(sucursalesMapeadas.map((b) => b.nombre))
    const guardadas = JSON.parse(localStorage.getItem('drivique_admin_branches') || 'null')
    if (Array.isArray(guardadas) && guardadas.some((b) => !nombresBd.has(b.nombre))) {
      localStorage.removeItem('drivique_admin_branches')
      localStorage.removeItem('drivique_admin_cities')
    }
  } catch (error) {
    console.error('No se pudieron cargar ciudades y sucursales desde el servidor', error)
  }
}

export const RECARGOS_LOGISTICOS = {
  domicilio: 50000,
  aeropuerto: 40000,
  terminal: 25000
}