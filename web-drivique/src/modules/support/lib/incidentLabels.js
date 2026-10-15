export const CATEGORIES = [
  { id: 'RESERVATION', label: 'Reserva', hint: 'Problemas con una reserva, fechas o entrega' },
  { id: 'VEHICLE', label: 'Vehículo', hint: 'Falla, daño o accidente con el vehículo' },
  { id: 'PAYMENT', label: 'Pago', hint: 'Cobros, comprobantes o pagos rechazados' },
  { id: 'OTHER', label: 'Otra', hint: 'Cualquier otra consulta' },
]

export const STATUS = {
  OPEN: { label: 'Abierta', bg: '#e0f2fe', color: '#0369a1' },
  IN_REVIEW: { label: 'En revisión', bg: '#fef3c7', color: '#b45309' },
  RESOLVED: { label: 'Resuelta', bg: '#dcfce7', color: '#15803d' },
  CLOSED: { label: 'Cerrada', bg: '#e2e8f0', color: '#475569' },
}

export const PRIORITY = {
  LOW: { label: 'Baja', bg: '#e2e8f0', color: '#475569' },
  MEDIUM: { label: 'Media', bg: '#fef3c7', color: '#b45309' },
  HIGH: { label: 'Alta', bg: '#fee2e2', color: '#b91c1c' },
  CRITICAL: { label: 'Crítica', bg: '#7f1d1d', color: '#ffffff' },
}

export const TRANSITION_LABEL = {
  customer: { 'RESOLVED>CLOSED': 'Confirmar solución', 'RESOLVED>IN_REVIEW': 'Reabrir', 'OPEN>CLOSED': 'Cancelar incidencia' },
  staff: {
    'OPEN>IN_REVIEW': 'Tomar y poner en revisión',
    'IN_REVIEW>RESOLVED': 'Marcar como resuelta',
    'RESOLVED>IN_REVIEW': 'Reabrir',
    'OPEN>CLOSED': 'Cerrar',
    'IN_REVIEW>CLOSED': 'Cerrar',
    'RESOLVED>CLOSED': 'Cerrar',
  },
}

export const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label || id

export const formatDateTime = (iso) => (iso
  ? new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '')

export const formatSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`)

export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
export const MAX_FILE_BYTES = 5 * 1024 * 1024
export const MAX_FILES = 5

export function validateFiles(current, incoming) {
  const all = [...current, ...incoming]
  if (all.length > MAX_FILES) return { error: `Máximo ${MAX_FILES} archivos por envío.` }
  const invalid = incoming.find((f) => !ALLOWED_FILE_TYPES.includes(f.type) || f.size > MAX_FILE_BYTES)
  if (invalid) return { error: `"${invalid.name}" no es válido. Solo JPG, PNG o PDF de máximo 5 MB.` }
  return { files: all }
}
