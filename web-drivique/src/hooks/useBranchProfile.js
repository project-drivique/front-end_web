import { useState, useEffect, useCallback } from 'react'
import { getPlaceSchedule, formatSchedule } from '../utils/branchSchedules'

const MOCK_BRANCH_PROFILES = [
  {
    id: 'branch-bogota-aeropuerto',
    nombre: 'Alamo Bogotá - Aeropuerto',
    ciudad: 'Bogotá',
    branchType: 'AIRPORT_TERMINAL',
    estado: 'activa',
    direccion: 'Av. El Dorado # 103-09, Fontibón',
    telefono: '+57 601 742 8900',
    indicacionesRecogida: 'Frente a la salida 3 del aeropuerto - hall de entregas.',
    latitud: '4.7016',
    longitud: '-74.1469',
    encargado: 'Andrés Felipe Castro',
    vehiculosCount: 5,
    categorias: ['Sedan', 'SUV', 'Económico'],
  },
  {
    id: 'branch-neiva-centro',
    nombre: 'Alquiler Neiva - Centro',
    ciudad: 'Neiva',
    branchType: 'STANDARD',
    estado: 'activa',
    direccion: 'Calle 9 # 8-25, Centro',
    telefono: '+57 608 871 4500',
    indicacionesRecogida: 'Mostrador principal frente a la plaza de armas.',
    latitud: '2.9273',
    longitud: '-75.2819',
    encargado: 'Carolina Mendez',
    vehiculosCount: 3,
    categorias: ['Sedan', 'Económico'],
  },
]

const STORAGE_KEY = 'drivique_branch_profiles'

function readStoredProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_BRANCH_PROFILES))
      return MOCK_BRANCH_PROFILES
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_BRANCH_PROFILES
  } catch {
    return MOCK_BRANCH_PROFILES
  }
}

function writeStoredProfiles(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Error guardando perfiles de sucursal:', e)
  }
}

export function useBranchProfile(user, devBranchId = null) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDevBranchId, setSelectedDevBranchId] = useState(devBranchId)

  // Encontrar la sucursal activa según el usuario o selector de prueba en dev
  const activeBranchId = selectedDevBranchId || user?.sucursalId || user?.sucursal || 'branch-bogota-aeropuerto'

  const fetchProfile = useCallback(() => {
    setLoading(true)
    const all = readStoredProfiles()

    const found =
      all.find((b) => b.id === activeBranchId) ||
      all.find(
        (b) =>
          b.nombre.toLowerCase().includes(String(activeBranchId).toLowerCase()) ||
          String(activeBranchId).toLowerCase().includes(b.nombre.toLowerCase())
      ) ||
      all[0]

    // Formatear horarios calculados
    const branchScheduleObj = getPlaceSchedule({ kind: 'branch', branchType: found.branchType })
    const homeScheduleObj = getPlaceSchedule({ kind: 'home_delivery' })

    const enriched = {
      ...found,
      horarios: {
        branchSchedule: branchScheduleObj,
        homeSchedule: homeScheduleObj,
        branchFormatted: formatSchedule(branchScheduleObj, 'es-CO'),
        homeFormatted: formatSchedule(homeScheduleObj, 'es-CO'),
      },
    }

    setProfile(enriched)
    setLoading(false)
  }, [activeBranchId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const saveBranchProfile = useCallback(
    (formData) => {
      setSaving(true)
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const all = readStoredProfiles()
            const index = all.findIndex((b) => b.id === (profile?.id || activeBranchId))

            const updated = {
              ...(profile || all[0]),
              direccion: formData.direccion,
              telefono: formData.telefono,
              indicacionesRecogida: formData.indicacionesRecogida,
              latitud: formData.latitud,
              longitud: formData.longitud,
            }

            if (index !== -1) {
              all[index] = updated
            } else {
              all.push(updated)
            }

            writeStoredProfiles(all)

            const branchScheduleObj = getPlaceSchedule({ kind: 'branch', branchType: updated.branchType })
            const homeScheduleObj = getPlaceSchedule({ kind: 'home_delivery' })

            const enriched = {
              ...updated,
              horarios: {
                branchSchedule: branchScheduleObj,
                homeSchedule: homeScheduleObj,
                branchFormatted: formatSchedule(branchScheduleObj, 'es-CO'),
                homeFormatted: formatSchedule(homeScheduleObj, 'es-CO'),
              },
            }

            setProfile(enriched)
            setSaving(false)
            resolve(enriched)
          } catch (err) {
            setSaving(false)
            reject(err)
          }
        }, 600)
      })
    },
    [profile, activeBranchId]
  )

  return {
    profile,
    loading,
    saving,
    allDevBranches: MOCK_BRANCH_PROFILES,
    selectedDevBranchId,
    setSelectedDevBranchId,
    saveBranchProfile,
    refetch: fetchProfile,
  }
}
