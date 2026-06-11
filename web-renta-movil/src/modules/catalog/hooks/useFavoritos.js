import { useEffect, useState } from 'react'

const STORAGE_KEY = 'rentaMovil_favoritos'

export function useFavoritos() {
  const [favoritos, setFavoritos] = useState([])

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      if (Array.isArray(data)) setFavoritos(data)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos))
  }, [favoritos])

  const toggleFavorito = (id) => {
    setFavoritos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const esFavorito = (id) => favoritos.includes(id)

  return { favoritos, setFavoritos, toggleFavorito, esFavorito }
}