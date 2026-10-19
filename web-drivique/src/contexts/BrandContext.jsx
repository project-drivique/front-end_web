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
    // Con la marca ya aplicada se puede mostrar la página (ver index.html)
    document.documentElement.setAttribute('data-brand-ready', '1')
  }, [brand])

  useEffect(() => {
    const update = (event) => setBrand(event.detail || brandService.getActive())
    window.addEventListener(brandService.eventName, update)
    return () => window.removeEventListener(brandService.eventName, update)
  }, [])

  return <BrandContext.Provider value={{ brand }}>{children}</BrandContext.Provider>
}

export const useBrand = () => useContext(BrandContext) || { brand: null }
