import i18n from '@/i18n'

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
