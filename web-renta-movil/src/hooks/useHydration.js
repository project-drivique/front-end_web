import { useEffect, useState } from 'react'
import { getIsRehydrating } from '../store/authStore'

export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(!getIsRehydrating())

  useEffect(() => {
    // Esperar un tick para asegurar que Zustand haya completado la hidratación
    const checkHydration = () => {
      setIsHydrated(!getIsRehydrating())
    }

    // Ejecutar inmediatamente en el siguiente tick
    const timer = setTimeout(checkHydration, 0)
    
    return () => clearTimeout(timer)
  }, [])

  return isHydrated
}
