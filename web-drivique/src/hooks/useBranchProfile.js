import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/httpClient'
import { getPlaceSchedule, formatSchedule } from '../utils/branchSchedules'
import i18n from '@/i18n'

const esAeropuerto = (p) => {
  const abre = String(p.openingTime || '').slice(0, 5)
  const cierra = String(p.closingTime || '').slice(0, 5)
  return (abre === '00:00' && (cierra === '23:59' || cierra === '24:00')) || /aeropuerto|airport/i.test(p.name || '')
}

// Convierte la ficha que entrega el servidor al formato que usa la pantalla
function mapear(p) {
  const branchSchedule = getPlaceSchedule({ kind: 'branch', openingTime: p.openingTime, closingTime: p.closingTime })
  const homeSchedule = getPlaceSchedule({ kind: 'home_delivery' })
  return {
    id: p.id,
    nombre: p.name,
    ciudad: p.cityName,
    branchType: esAeropuerto(p) ? 'AIRPORT_TERMINAL' : 'STANDARD',
    estado: p.active ? 'activa' : 'inactiva',
    direccion: p.address || '',
    telefono: p.phone || '',
    indicacionesRecogida: p.pickupInstructions || '',
    latitud: p.latitude ?? '',
    longitud: p.longitude ?? '',
    encargado: p.managerName || '',
    vehiculosCount: p.vehicleCount,
    capacidadVehiculos: p.vehicleCapacity,
    pagoEfectivo: p.allowsCashPayment,
    categorias: p.categories || [],
    horarios: {
      branchSchedule,
      homeSchedule,
      branchFormatted: formatSchedule(branchSchedule, 'es-CO'),
      homeFormatted: formatSchedule(homeSchedule, 'es-CO'),
    },
  }
}

const errorDe = (error) => new Error(error?.response?.data?.detail || error?.message || i18n.t('hc2.no_fue_posible_guardar_el_perfil', 'No fue posible guardar el perfil'))

/** Perfil de la sucursal asignada al encargado, tomado y guardado en el servidor. */
export function useBranchProfile(user, branchId = null) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const params = branchId ? { branchId } : undefined

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/branch-profile', { params })
      setProfile(mapear(data))
    } catch (error) {
      console.error('No se pudo cargar el perfil de la sucursal:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, user?.correo])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const saveBranchProfile = useCallback(async (formData) => {
    setSaving(true)
    try {
      const { data } = await api.put('/branch-profile', {
        address: formData.direccion,
        phone: formData.telefono,
        pickupInstructions: formData.indicacionesRecogida || null,
        latitude: formData.latitud === '' || formData.latitud == null ? null : Number(formData.latitud),
        longitude: formData.longitud === '' || formData.longitud == null ? null : Number(formData.longitud),
      }, { params })
      const actualizado = mapear(data)
      setProfile(actualizado)
      return actualizado
    } catch (error) {
      throw errorDe(error)
    } finally {
      setSaving(false)
    }
  }, [params])

  return { profile, loading, saving, saveBranchProfile, refetch: fetchProfile }
}
