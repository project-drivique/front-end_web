import { createContext, useContext, useEffect, useState } from 'react'
import { brandService } from '../services/brandService'
import { createBrandTokens } from '../utils/brandThemeUtils'
import i18n from '../i18n/index.js'

const BrandContext = createContext(null)

function applyBrand(config) {
  const root = document.documentElement
  const tokens = createBrandTokens(config.colors)
  const properties = {
    '--brand-primary': tokens.primary,
    '--brand-secondary': tokens.secondary,
    '--brand-accent': tokens.accent,
    '--brand-primary-rgb': tokens.primaryRgb,
    '--brand-secondary-rgb': tokens.secondaryRgb,
    '--brand-accent-rgb': tokens.accentRgb,
    '--brand-on-primary': tokens.onPrimary,
    '--brand-on-secondary': tokens.onSecondary,
    '--brand-on-accent': tokens.onAccent,
    '--brand-primary-hover': tokens.primaryHover,
    '--brand-primary-active': tokens.primaryActive,
    '--brand-secondary-hover': tokens.secondaryHover,
    '--brand-text-light': tokens.textLight,
    '--brand-text-dark': tokens.textDark,
    '--brand-border-light': tokens.borderLight,
    '--brand-border-dark': tokens.borderDark,
    '--brand-soft-light': tokens.softLight,
    '--brand-soft-strong-light': tokens.softStrongLight,
    '--brand-soft-dark': tokens.softDark,
    '--brand-soft-strong-dark': tokens.softStrongDark,
  }
  Object.entries(properties).forEach(([key, value]) => root.style.setProperty(key, value))
  root.dataset.brand = config.name
  document.title = `${config.name} — Alquiler de vehículos en Colombia`
  i18n.emit('languageChanged', i18n.language)
}

export function BrandProvider({ children }) {
  const [brand, setBrand] = useState(() => brandService.getActive())

  useEffect(() => {
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
