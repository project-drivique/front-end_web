export const TIPOS_DOCUMENTO = [
  { value: 'CC', sigla: 'CC', label: 'Cédula de Ciudadanía', labelConSigla: 'Cédula de Ciudadanía (CC)' },
  { value: 'TI', sigla: 'TI', label: 'Tarjeta de Identidad', labelConSigla: 'Tarjeta de Identidad (TI)' },
  { value: 'CE', sigla: 'CE', label: 'Cédula de Extranjería', labelConSigla: 'Cédula de Extranjería (CE)' },
  { value: 'PAS', sigla: 'PAS', label: 'Pasaporte', labelConSigla: 'Pasaporte (PAS)' },
]

export function getNombreTipoDoc(tipo) {
  if (!tipo) return ''
  const t = String(tipo).trim().toUpperCase()
  if (t === 'CC') return 'Cédula de Ciudadanía'
  if (t === 'TI') return 'Tarjeta de Identidad'
  if (t === 'CE') return 'Cédula de Extranjería'
  if (t === 'PAS' || t === 'PA') return 'Pasaporte'

  const encontrado = TIPOS_DOCUMENTO.find(item => item.value === t || item.sigla === t)
  if (encontrado) return encontrado.label
  return tipo
}

export function getSiglaDoc(tipo) {
  if (!tipo) return ''
  const t = String(tipo).trim().toUpperCase()
  if (t === 'PA') return 'PAS'
  const encontrado = TIPOS_DOCUMENTO.find(item => item.value === t || item.sigla === t)
  return encontrado?.sigla || t
}
