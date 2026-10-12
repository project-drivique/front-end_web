import VEHICULOS_MOCK from '@/mocks/vehicles.json'

/**
 * Resuelve imágenes reales del catálogo filtradas por categoría o vehículo específico.
 */
export function obtenerImagenesPorCategoria(categoria, max = 3) {
  const vehiculosCat = VEHICULOS_MOCK.filter(v => v.categoria?.toLowerCase() === categoria?.toLowerCase())
  const imagenes = []
  vehiculosCat.forEach(v => {
    if (v.imagenes?.[0] && !imagenes.includes(v.imagenes[0])) {
      imagenes.push(v.imagenes[0])
    }
  })
  if (imagenes.length === 0) {
    VEHICULOS_MOCK.forEach(v => {
      if (v.imagenes?.[0] && !imagenes.includes(v.imagenes[0])) {
        imagenes.push(v.imagenes[0])
      }
    })
  }
  return imagenes.slice(0, max)
}

// ─── HU-INT-17: Se eliminan notificaciones dummy. Se conecta la API real del backend. ──
export const NOTIFICACIONES_GENERALES_INITIAL = []

// ─── DUMMY DATA: CUPONES DE RECOMPENSA ───────────────────────────────────────
export const CUPONES_INITIAL = []

// ─── DUMMY DATA: PROMOS DE VEHÍCULOS (DEPRECATED - USAR promotionManagementService) ──
export const PROMOS_VEHICULOS_INITIAL = []

