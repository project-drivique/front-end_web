import { api } from './httpClient'

const AUDIT_EVENT = 'drivique:audit-updated'

export function cleanBranchText(val) {
  return String(val || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function hasMatchingBranch(branchA, branchB) {
  const a = cleanBranchText(branchA)
  const b = cleanBranchText(branchB)
  if (!a || !b) return false
  if (a === b) return true
  if (a.includes(b) || b.includes(a)) return true

  const STOP_WORDS = new Set(['de', 'la', 'el', 'los', 'las', 'en', 'y', 'del', 'alamo', 'national', 'localiza', 'alquiler', 'drivique'])
  const wordsA = a.split(' ').filter((w) => w.length > 2 && !STOP_WORDS.has(w))
  const wordsB = b.split(' ').filter((w) => w.length > 2 && !STOP_WORDS.has(w))

  const matches = wordsA.filter((w) => wordsB.includes(w))
  if (matches.length >= 2) return true
  if (matches.length === 1 && (wordsA.length === 1 || wordsB.length === 1)) return true

  return false
}

// Dominio que registra el servidor -> tipo de evento que muestra la pantalla
const TIPO_POR_DOMINIO = {
  AUTH: 'AUTENTICACION',
  RESERVATIONS: 'GESTION_RESERVAS',
  BILLING: 'COBRO_SUCURSAL',
  FLEET: 'CRUD_VEHICULOS',
  CONTRACTS: 'GESTION_CONTRATOS',
  SUPPORT: 'GESTION_INCIDENCIAS',
  USERS: 'GESTION_USUARIOS',
  KYC: 'GESTION_USUARIOS',
  IAM: 'ROLES_PERMISOS',
  PROMOTIONS: 'PROMOCIONES',
  REPORTS: 'REPORTES_EXPORTACION',
  LOCATION: 'SISTEMA_CONFIGURACION',
  SYSTEM: 'SISTEMA_CONFIGURACION',
}

const MODULO_POR_DOMINIO = {
  AUTH: 'Seguridad / Acceso',
  RESERVATIONS: 'Reservas',
  BILLING: 'Cobros',
  FLEET: 'Flota',
  CONTRACTS: 'Contratos',
  SUPPORT: 'Incidencias',
  USERS: 'Usuarios',
  KYC: 'Verificación de documentos',
  IAM: 'Roles y permisos',
  PROMOTIONS: 'Promociones',
  REPORTS: 'Reportes',
  LOCATION: 'Ciudades y sucursales',
  SYSTEM: 'Sistema',
}

const ROL_UI = { SUPER_ADMIN: 'administrador', ADMIN: 'administrador', BRANCH_ADMIN: 'encargado_sucursal', CUSTOMER: 'usuario' }

const parseJson = (value) => {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function mapear(log) {
  const dominio = String(log.domainName || 'SYSTEM').toUpperCase()
  return {
    id: log.id,
    fecha: log.createdAt,
    tipo: TIPO_POR_DOMINIO[dominio] || 'SISTEMA_CONFIGURACION',
    modulo: MODULO_POR_DOMINIO[dominio] || dominio,
    accion: log.description || `${log.operation} ${log.entityName}`,
    actor: log.actorFullName || 'Sistema',
    correo: log.actorEmail || '',
    rol: ROL_UI[log.actorRole] || (log.actorEmail ? 'usuario' : 'sistema'),
    sucursal: log.branchName || 'Global / Sistema',
    ip: log.ipAddress || '',
    dispositivo: '',
    resultado: log.result === 'SUCCESS' ? 'EXITO' : 'FALLO',
    motivo: log.description || '',
    detalles: {
      operacion: log.operation,
      entidad: log.entityName,
      entidadId: log.entityId,
      datosAnteriores: parseJson(log.oldData),
      datosNuevos: parseJson(log.newData),
    },
  }
}

// Último resultado del servidor (listForUser es síncrono para la pantalla)
let cache = []

export const accessAuditService = {
  eventName: AUDIT_EVENT,

  /** La auditoría la registra el servidor; el panel solo la consulta. */
  async refresh() {
    const { data } = await api.get('/admin/audit-logs')
    cache = (Array.isArray(data) ? data : []).map(mapear)
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(AUDIT_EVENT))
    return this.listForUser()
  },

  listForUser() {
    return cache.map((record) => ({ ...record }))
  },

  getStats() {
    const records = this.listForUser()
    const total = records.length
    const exitosos = records.filter((r) => r.resultado === 'EXITO').length
    const fallidos = records.filter((r) => r.resultado === 'FALLO').length
    const seguridad = records.filter((r) => r.tipo.includes('SEGURIDAD') || r.tipo.includes('AUTENTICACION')).length
    const crud = records.filter((r) => r.tipo.startsWith('CRUD') || r.tipo.startsWith('GESTION')).length

    return { total, exitosos, fallidos, seguridad, crud }
  },
}
