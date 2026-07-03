import { useEffect, useState } from 'react'
import { getIsRehydrating } from '../store/authStore'

// Hook personalizado que indica si el store persistido ya terminó de rehidratarse.
export function useHydration() {
  // Estado local que guarda si ya se cargó el estado persistido.
  // Se inicia con el valor contrario de getIsRehydrating():
  // - true  => todavía se está rehidratando
  // - false => ya terminó
  const [isHydrated, setIsHydrated] = useState(!getIsRehydrating())

  useEffect(() => {
    // Función que revisa nuevamente el estado de rehidratación.
    const checkHydration = () => {
      setIsHydrated(!getIsRehydrating())
    }

    // Espera un tick para asegurar que Zustand termine de cargar el estado persistido.
    const timer = setTimeout(checkHydration, 0)

    // Limpia el timeout si el componente se desmonta antes de ejecutarse.
    return () => clearTimeout(timer)
  }, [])

  // Devuelve true cuando el store ya está listo para usarse.
  return isHydrated
}