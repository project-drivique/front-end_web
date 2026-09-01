import defaultBrand from '../mocks/brandConfig.json'
import { accessAuditService } from './accessAuditService'

const ACTIVE_KEY = 'drivique_brand_active'
const PREVIOUS_KEY = 'drivique_brand_previous'
const EVENT_NAME = 'drivique:brand-change'
const HEX_COLOR = /^#[0-9a-f]{6}$/i

const clone = (value) => JSON.parse(JSON.stringify(value))

function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null')
    return value && typeof value === 'object' ? value : clone(fallback)
  } catch {
    return clone(fallback)
  }
}

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

function announce(config) {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: clone(config) }))
}

function auditSnapshot(config) {
  return {
    name: config?.name || '',
    colors: clone(config?.colors || {}),
    logoConfigured: Boolean(config?.logoDataUrl),
    logoSize: String(config?.logoDataUrl || '').length,
  }
}

function audit(user, action, before, after) {
  accessAuditService.record({
    correo: user?.correo || '',
    rol: user?.rol || 'administrador',
    resultado: 'EXITO',
    // No duplicar el logo base64 en auditoría: agotaría localStorage con pocos cambios.
    motivo: JSON.stringify({
      modulo: 'marca',
      accion: action,
      anterior: auditSnapshot(before),
      nueva: auditSnapshot(after),
    }),
  })
}

export const brandService = {
  defaults() { return clone(defaultBrand) },
  getActive() { return validate(read(ACTIVE_KEY, defaultBrand)) },
  getPrevious() {
    const previous = read(PREVIOUS_KEY, null)
    return previous ? validate(previous) : null
  },
  save(config, user) {
    const before = this.getActive()
    const next = validate(config)
    localStorage.setItem(PREVIOUS_KEY, JSON.stringify(before))
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(next))
    audit(user, 'aplicar', before, next)
    announce(next)
    return next
  },
  restorePrevious(user) {
    const current = this.getActive()
    const previous = this.getPrevious()
    if (!previous) throw new Error('noPrevious')
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(previous))
    localStorage.setItem(PREVIOUS_KEY, JSON.stringify(current))
    audit(user, 'restaurar_anterior', current, previous)
    announce(previous)
    return previous
  },
  restoreDefault(user) {
    const current = this.getActive()
    const defaults = validate(defaultBrand)
    localStorage.setItem(PREVIOUS_KEY, JSON.stringify(current))
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(defaults))
    audit(user, 'restaurar_original', current, defaults)
    announce(defaults)
    return defaults
  },
  eventName: EVENT_NAME,
  activeKey: ACTIVE_KEY,
}
