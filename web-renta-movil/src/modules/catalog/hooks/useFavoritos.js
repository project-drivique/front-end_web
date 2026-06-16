import { useEffect, useMemo, useState } from 'react'

const DEFAULT_STORAGE_KEY = 'rentaMovil_favoritos'

export function useFavoritos(storageKey = DEFAULT_STORAGE_KEY) {
  const key = useMemo(() => storageKey || DEFAULT_STORAGE_KEY, [storageKey])
  const [favoritos, setFavoritos] = useState([])
  const [cargado, setCargado] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const raw = localStorage.getItem(key)
    if (raw) {
      try {
        const data = JSON.parse(raw)
        if (Array.isArray(data)) setFavoritos(data)
      } catch {
        localStorage.removeItem(key)
      }
    }
    setCargado(true)
  }, [key])

  useEffect(() => {
    if (typeof window === 'undefined' || !cargado) return
    localStorage.setItem(key, JSON.stringify(favoritos))
  }, [favoritos, key, cargado])

  const toggleFavorito = (id) => {
    setFavoritos(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const esFavorito = (id) => favoritos.includes(id)

  return { favoritos, setFavoritos, toggleFavorito, esFavorito }
}