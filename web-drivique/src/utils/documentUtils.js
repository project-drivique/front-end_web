export const TIPOS_DOCUMENTO = [
  { value: 'CC', sigla: 'CC', label: 'Cédula de Ciudadanía', labelConSigla: 'Cédula de Ciudadanía (CC)' },
  { value: 'CE', sigla: 'CE', label: 'Cédula de Extranjería', labelConSigla: 'Cédula de Extranjería (CE)' },
  { value: 'PASAPORTE', sigla: 'PAS', label: 'Pasaporte', labelConSigla: 'Pasaporte (PAS)' },
  { value: 'DNI', sigla: 'DNI', label: 'Documento Nacional de Identidad', labelConSigla: 'Documento Nacional de Identidad (DNI)' },
  { value: 'PPT', sigla: 'PPT', label: 'Permiso por Protección Temporal', labelConSigla: 'Permiso por Protección Temporal (PPT)' },
  { value: 'PEP', sigla: 'PEP', label: 'Permiso Especial de Permanencia', labelConSigla: 'Permiso Especial de Permanencia (PEP)' },
]

export function getNombreTipoDoc(tipo) {
  if (!tipo) return ''
  const t = String(tipo).trim().toUpperCase()
  if (t === 'CC') return 'Cédula de Ciudadanía'
  if (t === 'TI') return 'Tarjeta de Identidad'
  if (t === 'CE') return 'Cédula de Extranjería'
  if (t === 'PAS' || t === 'PA' || t === 'PASAPORTE' || t === 'PASSPORT') return 'Pasaporte'
  if (t === 'DNI') return 'Documento Nacional de Identidad (DNI)'
  if (t === 'PPT') return 'Permiso por Protección Temporal (PPT)'
  if (t === 'PEP') return 'Permiso Especial de Permanencia (PEP)'
  if (t === 'DRIVER_LICENSE' || t === 'DRIVER LICENSE' || t === 'LICENCIA' || t === 'LICENCIA_CONDUCCION') return 'Licencia de Conducción'

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
