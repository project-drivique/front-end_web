import { useEffect, useMemo, useState } from 'react'

const DEFAULT_STORAGE_KEY = 'rentaMovil_favoritos'

export function useFavoritos(storageKey = DEFAULT_STORAGE_KEY) {
  const key = useMemo(() => storageKey || DEFAULT_STORAGE_KEY, [storageKey])
  const [favoritos, setFavoritos] = useState([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const raw = localStorage.getItem(key)
    if (!raw) return

    try {
      const data = JSON.parse(raw)
      if (Array.isArray(data)) setFavoritos(data)
    } catch {
      localStorage.removeItem(key)
    }
  }, [key])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, JSON.stringify(favoritos))
  }, [favoritos, key])

  const toggleFavorito = (id) => {
    setFavoritos(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const esFavorito = (id) => favoritos.includes(id)

  return { favoritos, setFavoritos, toggleFavorito, esFavorito }
}