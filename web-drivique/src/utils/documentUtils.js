import i18n from '@/i18n'
import { configuredApiUrl } from '@/config/apiConfig'

const nombre = (clave, defecto) => i18n.t(`docNames.${clave}`, defecto)

// Los textos se resuelven al leerlos para que sigan el idioma activo
const tipo = (value, sigla, clave, defecto) => ({
  value,
  sigla,
  get label() { return nombre(clave, defecto) },
  get labelConSigla() { return `${nombre(clave, defecto)} (${sigla})` },
})

export const TIPOS_DOCUMENTO = [
  tipo('CC', 'CC', 'CC', 'Cédula de Ciudadanía'),
  tipo('CE', 'CE', 'CE', 'Cédula de Extranjería'),
  tipo('PASAPORTE', 'PAS', 'PAS', 'Pasaporte'),
]

export function getNombreTipoDoc(tipo) {
  if (!tipo) return ''
  const t = String(tipo).trim().toUpperCase()
  if (t === 'CC') return nombre('CC', 'Cédula de Ciudadanía')
  if (t === 'TI') return nombre('TI', 'Tarjeta de Identidad')
  if (t === 'CE') return nombre('CE', 'Cédula de Extranjería')
  if (t === 'PAS' || t === 'PA' || t === 'PASAPORTE' || t === 'PASSPORT') return nombre('PAS', 'Pasaporte')
  if (t === 'NIT') return 'NIT'
  if (t === 'DRIVER_LICENSE' || t === 'DRIVER LICENSE' || t === 'LICENCIA' || t === 'LICENCIA_CONDUCCION') return nombre('LIC', 'Licencia de Conducción')
  const encontrado = TIPOS_DOCUMENTO.find(item => item.value === t || item.sigla === t)
  if (encontrado) return encontrado.label
  return tipo
}

export function getSiglaDoc(tipo) {
  if (!tipo) return ''
  const t = String(tipo).trim().toUpperCase()
  if (t === 'PA' || t === 'PASAPORTE' || t === 'PASSPORT') return 'PAS'
  if (t === 'DRIVER_LICENSE' || t === 'DRIVER LICENSE' || t === 'LICENCIA') return 'LIC'
  const encontrado = TIPOS_DOCUMENTO.find(item => item.value === t || item.sigla === t)
  return encontrado?.sigla || t
}

/**
 * Resuelve de forma segura y robusta la URL pública o del backend para un documento o PDF
 * evitando caídas al index.html en Single Page Applications.
 */
export function resolveDocumentUrl(url) {
  if (!url || typeof url !== 'string') return ''
  if (url.includes('dummy.pdf')) return ''
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return url
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  let cleanUrl = url.trim()
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl
  }

  // Si viene como /uploads/...
  if (cleanUrl.startsWith('/uploads/')) {
    const apiBase = configuredApiUrl ? configuredApiUrl.replace(/\/v1\/?$/, '') : '/api'
    return `${apiBase}${cleanUrl}`
  }

  // Si ya viene como /api/uploads/...
  if (cleanUrl.startsWith('/api/uploads/')) {
    const hostBase = configuredApiUrl ? configuredApiUrl.replace(/\/api(\/v1)?\/?$/, '') : ''
    return `${hostBase}${cleanUrl}`
  }

  return cleanUrl
}
