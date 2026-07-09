import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'

// Hook personalizado que indica si el store de auth ya terminó de
// rehidratarse desde localStorage. Se apoya en la API nativa de
// persist de Zustand (hasHydrated / onFinishHydration) en vez de un
// flag manual, para reflejar con exactitud cuándo el storage terminó
// de leerse.
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(() => useAuthStore.persist.hasHydrated())

  useEffect(() => {
    if (isHydrated) return
    const unsub = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true))
    return unsub
  }, [isHydrated])

  return isHydrated
}
