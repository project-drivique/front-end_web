import accessConfig from '../mocks/adminAccessConfig.json'

const STORAGE_KEY = 'drivique_access_audit'
const MAX_RECORDS = accessConfig.audit.maxRecords

function readRecords() {
  try {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(records) ? records : []
  } catch {
    return []
  }
}

export const accessAuditService = {
  list() {
    return readRecords()
  },
  record({ correo, rol = 'desconocido', resultado, motivo = '' }) {
    const now = new Date()
    const record = {
      id: `AUD-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
      fecha: now.toISOString(),
      correo: String(correo || '').trim().toLowerCase(),
      rol,
      resultado,
      motivo,
      ip: window.location.hostname,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...readRecords()].slice(0, MAX_RECORDS)))
    return record
  },
}
