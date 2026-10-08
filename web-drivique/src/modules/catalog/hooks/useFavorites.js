import { useEffect, useState } from 'react'
import { api } from '../../../services/httpClient'
import { useAuthStore } from '../../../store/authStore'

export function useFavoritos() {
  const [favoritos, setFavoritos] = useState([])
  const [vehiculosFavoritos, setVehiculosFavoritos] = useState([])
  const [cargado, setCargado] = useState(false)
  const [error, setError] = useState(null)
  const token = useAuthStore(state => state.token)
  const isAuthenticated = !!token

  useEffect(() => {
    let mounted = true

    const fetchFavoritos = async () => {
      if (!isAuthenticated) {
        if (mounted) {
          setFavoritos([])
          setVehiculosFavoritos([])
          setCargado(true)
        }
        return
      }
      try {
        setError(null)
        const { data } = await api.get('/users/me/favorites')
        if (mounted) {
          if (Array.isArray(data)) {
            setFavoritos(data.map(v => String(v.id)))
            setVehiculosFavoritos(data)
          }
        }
      } catch (error) {
        console.error('Error fetching favorites:', error)
        if (mounted) {
          setError(error)
          setFavoritos([])
          setVehiculosFavoritos([])
        }
      } finally {
        if (mounted) setCargado(true)
      }
    }

    fetchFavoritos()

    return () => {
      mounted = false
    }
  }, [isAuthenticated])

  const toggleFavorito = async (id) => {
    if (!isAuthenticated) return

    const normalizedId = String(id)
    const isFav = favoritos.includes(normalizedId)

    // Optimistic update
    setFavoritos(prev => isFav ? prev.filter(x => x !== normalizedId) : [...prev, normalizedId])
    if (isFav) {
      setVehiculosFavoritos(prev => prev.filter(vehicle => String(vehicle.id) !== normalizedId))
    }

    try {
      if (isFav) {
        await api.delete(`/users/me/favorites/${normalizedId}`)
      } else {
        await api.post(`/users/me/favorites/${normalizedId}`)
        const { data } = await api.get('/users/me/favorites')
        const vehicles = Array.isArray(data) ? data : []
        setFavoritos(vehicles.map(vehicle => String(vehicle.id)))
        setVehiculosFavoritos(vehicles)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      const { data } = await api.get('/users/me/favorites')
      const vehicles = Array.isArray(data) ? data : []
      setFavoritos(vehicles.map(vehicle => String(vehicle.id)))
      setVehiculosFavoritos(vehicles)
    }
  }

  const esFavorito = (id) => favoritos.includes(String(id))

  return { favoritos, vehiculosFavoritos, toggleFavorito, esFavorito, cargado, error }
}
