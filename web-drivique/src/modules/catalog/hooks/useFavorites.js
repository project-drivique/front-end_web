import { useEffect, useState } from 'react'
import { api } from '../../../services/httpClient'
import { useAuthStore } from '../../../store/authStore'

export function useFavoritos() {
  const [favoritos, setFavoritos] = useState([])
  const [cargado, setCargado] = useState(false)
  const token = useAuthStore(state => state.token)
  const isAuthenticated = !!token

  useEffect(() => {
    let mounted = true

    const fetchFavoritos = async () => {
      if (!isAuthenticated) {
        if (mounted) {
          setFavoritos([])
          setCargado(true)
        }
        return
      }
      try {
        const { data } = await api.get('/users/me/favorites')
        if (mounted) {
          // data es una lista de VehicleCardResponseDTO, guardamos solo los IDs
          if (Array.isArray(data)) {
            setFavoritos(data.map(v => v.id))
          }
        }
      } catch (error) {
        console.error('Error fetching favorites:', error)
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

    const isFav = favoritos.includes(id)

    // Optimistic update
    setFavoritos(prev => isFav ? prev.filter(x => x !== id) : [...prev, id])

    try {
      if (isFav) {
        await api.delete(`/users/me/favorites/${id}`)
      } else {
        await api.post(`/users/me/favorites/${id}`)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      // Revertir en caso de error
      setFavoritos(prev => isFav ? [...prev, id] : prev.filter(x => x !== id))
    }
  }

  const esFavorito = (id) => favoritos.includes(id)

  return { favoritos, setFavoritos, toggleFavorito, esFavorito, cargado }
}