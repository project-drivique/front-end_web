import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react'
import { brandService } from '../services/brandService'
import { applyBrand } from '../utils/brandThemeUtils'

const BrandContext = createContext(null)

export { applyBrand }

export function BrandProvider({ children }) {
  const [brand, setBrand] = useState(() => {
    const initial = brandService.getActive()
    applyBrand(initial)
    return initial
  })

  useLayoutEffect(() => {
    applyBrand(brand)
  }, [brand])

  useEffect(() => {
    const update = (event) => setBrand(event.detail || brandService.getActive())
    const syncBrowserTab = (event) => {
      if (event.key === brandService.activeKey) setBrand(brandService.getActive())
    }
    window.addEventListener(brandService.eventName, update)
    window.addEventListener('storage', syncBrowserTab)
    return () => {
      window.removeEventListener(brandService.eventName, update)
      window.removeEventListener('storage', syncBrowserTab)
    }
  }, [])

  return <BrandContext.Provider value={{ brand }}>{children}</BrandContext.Provider>
}

export const useBrand = () => useContext(BrandContext)
