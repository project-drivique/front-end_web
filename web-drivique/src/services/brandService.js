import defaultBrand from '../config/datos/brandConfig.json'
import { api } from './httpClient'
import { applyBrand } from '../utils/brandThemeUtils'

const EVENT_NAME = 'drivique:brand-change'
const HEX_COLOR = /^#[0-9a-f]{6}$/i

const clone = (value) => JSON.parse(JSON.stringify(value))

// Marca vigente tal como la entrega el servidor; mientras no responde se usa la marca base de arranque
let active = { ...clone(defaultBrand), faviconUrl: null, theme: 'SYSTEM', hasPrevious: false }

function validate(config) {
  const name = String(config?.name || '').trim()
  const colors = config?.colors || {}
  if (name.length < 2 || name.length > 40) throw new Error('invalidName')
  if (![colors.primary, colors.secondary, colors.accent].every((color) => HEX_COLOR.test(String(color || '')))) {
    throw new Error('invalidColors')
  }
  if (new Set([colors.primary, colors.secondary, colors.accent].map((color) => color.toLowerCase())).size < 3) {
    throw new Error('duplicateColors')
  }
  return {
    name,
    logoDataUrl: String(config?.logoDataUrl || ''),
    colors: {
      primary: colors.primary.toUpperCase(),
      secondary: colors.secondary.toUpperCase(),
      accent: colors.accent.toUpperCase(),
    },
  }
}

const fromApi = (b) => ({
  name: b.companyName,
  logoDataUrl: b.logoUrl || '',
  faviconUrl: b.faviconUrl || null,
  theme: b.defaultTheme,
  hasPrevious: Boolean(b.hasPrevious),
  colors: { primary: b.primaryColor, secondary: b.secondaryColor, accent: b.accentColor },
})

const errorDe = (error) => {
  const detail = error?.response?.data?.detail
  return new Error(error?.response?.status === 409 ? 'noPrevious' : (detail || 'saveFailed'))
}

function adopt(brand) {
  active = brand
  applyBrand(active)
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: clone(active) }))
  return clone(active)
}

export const brandService = {
  /** Marca base de Drivique (solo como arranque si el servidor no responde). */
  defaults() { return clone(defaultBrand) },

  /** Carga la marca vigente desde el servidor. */
  async load() {
    const { data } = await api.get('/brand-configurations/active')
    return adopt(fromApi(data))
  },

  getActive() { return clone(active) },

  hasPrevious() { return active.hasPrevious },

  async save(config) {
    const next = validate(config)
    try {
      const { data } = await api.put('/brand-configurations', {
        companyName: next.name,
        logoUrl: next.logoDataUrl || null,
        faviconUrl: active.faviconUrl,
        primaryColor: next.colors.primary,
        secondaryColor: next.colors.secondary,
        accentColor: next.colors.accent,
        defaultTheme: active.theme,
      })
      return adopt(fromApi(data))
    } catch (error) {
      throw errorDe(error)
    }
  },

  async restorePrevious() {
    try {
      const { data } = await api.post('/brand-configurations/restore-previous')
      return adopt(fromApi(data))
    } catch (error) {
      throw errorDe(error)
    }
  },

  async restoreDefault() {
    try {
      const { data } = await api.post('/brand-configurations/restore-default')
      return adopt(fromApi(data))
    } catch (error) {
      throw errorDe(error)
    }
  },

  eventName: EVENT_NAME,
}

// Aplica la marca base de inmediato para evitar un parpadeo mientras llega la del servidor
try {
  applyBrand(active)
} catch {
  // el tema es solo visual
}
