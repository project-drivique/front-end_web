import accessConfig from '../mocks/adminAccessConfig.json'

const STORAGE_KEY = 'drivique_access_audit'
const MAX_RECORDS = accessConfig.audit?.maxRecords || 500
const AUDIT_EVENT = 'drivique:audit-updated'

const normalizeBranch = (value) => String(value || '').trim().toLowerCase()
const isBranchManager = (user) => ['encargado', 'encargado_sucursal', 'branch_manager'].includes(user?.rol)
const assignedBranch = (user) => user?.sucursalId || user?.sucursal || user?.sucursalAsignada || ''

// Lista inicial de registros de auditoría representativos y realistas
const INITIAL_AUDIT_SEED = [
  {
    id: 'AUD-20260902-8821',
    fecha: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    tipo: 'AUTENTICACION',
    modulo: 'Seguridad / Acceso',
    accion: 'Inicio de sesión exitoso con verificación en dos pasos',
    actor: 'Administrador Drivique',
    correo: 'admin@drivique.com',
    rol: 'administrador',
    sucursal: 'Global / Sistema',
    ip: '190.158.45.12',
    dispositivo: 'Chrome 128 / Windows 11',
    resultado: 'EXITO',
    motivo: 'Autenticación con 2FA completada correctamente',
    detalles: { metodo2FA: 'correo', sesionId: 'SESS-9921' },
  },
  {
    id: 'AUD-20260902-8750',
    fecha: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    tipo: 'GESTION_INCIDENCIAS',
    modulo: 'Incidencias',
    accion: 'Respuesta y actualización de estado en reporte REP-9102 a "En atención"',
    actor: 'Carlos Mendoza',
    correo: 'encargado.bogota@drivique.com',
    rol: 'encargado_sucursal',
    sucursal: 'Bogotá - Calle 100',
    ip: '186.84.112.55',
    dispositivo: 'Firefox 130 / macOS Sonoma',
    resultado: 'EXITO',
    motivo: 'Asignación de unidad técnica para revisión en carretera',
    detalles: { reporteId: 'REP-9102', vehiculo: 'Mazda CX-5 2024', placa: 'KLS-849' },
  },
  {
    id: 'AUD-20260902-8610',
    fecha: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    tipo: 'GESTION_RESERVAS',
    modulo: 'Reservas',
    accion: 'Confirmación y activación de reserva #RES-2026-9102',
    actor: 'Sistema / Pasarela Wompi',
    correo: 'cliente@drivique.com',
    rol: 'usuario',
    sucursal: 'Bogotá - Calle 100',
    ip: '190.27.18.204',
    dispositivo: 'Safari Mobile / iOS 18',
    resultado: 'EXITO',
    motivo: 'Pago aprobado y reserva puesta en estado "En curso"',
    detalles: { referencia: 'RES-2026-9102', total: 348000, metodo: 'tarjeta' },
  },
  {
    id: 'AUD-20260902-8530',
    fecha: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    tipo: 'SEGURIDAD_2FA',
    modulo: 'Seguridad / 2FA',
    accion: 'Intento de acceso con código 2FA incorrecto',
    actor: 'Usuario Desconocido',
    correo: 'invitado_sospechoso@externo.com',
    rol: 'usuario',
    sucursal: 'Global / Sistema',
    ip: '45.134.22.90',
    dispositivo: 'Chrome 126 / Linux x86_64',
    resultado: 'FALLO',
    motivo: 'Código OTP inválido (intento 2 de 3)',
    detalles: { ipSospechosa: true, intentosFallidos: 2 },
  },
  {
    id: 'AUD-20260902-8412',
    fecha: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    tipo: 'CRUD_VEHICULOS',
    modulo: 'Vehículos',
    accion: 'Actualización de tarifa y kilometraje para Toyota Prado TXL',
    actor: 'Laura Gómez',
    correo: 'encargado.medellin@drivique.com',
    rol: 'encargado_sucursal',
    sucursal: 'Medellín - El Poblado',
    ip: '181.129.80.34',
    dispositivo: 'Edge 128 / Windows 11',
    resultado: 'EXITO',
    motivo: 'Ajuste de precio diario y seguro premium',
    detalles: { vehiculoId: 4, modelo: 'Toyota Prado TXL', precioAnterior: 220000, precioNuevo: 240000 },
  },
  {
    id: 'AUD-20260902-8320',
    fecha: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    tipo: 'PROMOCIONES',
    modulo: 'Promociones / Cupones',
    accion: 'Creación de promoción "Descuento 15% Exclusivo Toyota Corolla"',
    actor: 'Administrador Drivique',
    correo: 'admin@drivique.com',
    rol: 'administrador',
    sucursal: 'Global / Sistema',
    ip: '190.158.45.12',
    dispositivo: 'Chrome 128 / Windows 11',
    resultado: 'EXITO',
    motivo: 'Publicación de campaña promocional de fin de mes',
    detalles: { codigo: 'COROLLA15', descuento: 15, tipo: 'porcentaje' },
  },
  {
    id: 'AUD-20260902-8210',
    fecha: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    tipo: 'GESTION_CONTRATOS',
    modulo: 'Contratos',
    accion: 'Firma digital de contrato de arrendamiento #CTR-2026-4401',
    actor: 'Carlos Mendoza',
    correo: 'cliente@drivique.com',
    rol: 'usuario',
    sucursal: 'Bogotá - Calle 100',
    ip: '190.27.18.204',
    dispositivo: 'Safari Mobile / iOS 18',
    resultado: 'EXITO',
    motivo: 'Firma electrónica completada con validación de identidad',
    detalles: { contratoId: 'CTR-2026-4401', reservaId: 'RES-2026-9102' },
  },
  {
    id: 'AUD-20260902-8105',
    fecha: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    tipo: 'REPORTES_EXPORTACION',
    modulo: 'Reportes',
    accion: 'Exportación de reporte consolidado de ingresos en formato Excel',
    actor: 'Administrador Drivique',
    correo: 'admin@drivique.com',
    rol: 'administrador',
    sucursal: 'Global / Sistema',
    ip: '190.158.45.12',
    dispositivo: 'Chrome 128 / Windows 11',
    resultado: 'EXITO',
    motivo: 'Auditoría mensual de cierre financiero',
    detalles: { reporte: 'ingresos_ocupacion', periodo: 'mes_actual', registrosExportados: 48 },
  },
  {
    id: 'AUD-20260902-7990',
    fecha: new Date(Date.now() - 1000 * 60 * 550).toISOString(),
    tipo: 'ROLES_PERMISOS',
    modulo: 'Roles y Permisos',
    accion: 'Modificación de permisos del rol "Encargado de Sucursal"',
    actor: 'Administrador Drivique',
    correo: 'admin@drivique.com',
    rol: 'administrador',
    sucursal: 'Global / Sistema',
    ip: '190.158.45.12',
    dispositivo: 'Chrome 128 / Windows 11',
    resultado: 'EXITO',
    motivo: 'Concesión de permisos de lectura en módulo de reportes y auditoría',
    detalles: { rolId: 'role-branch-manager', modulo: 'reports' },
  },
  {
    id: 'AUD-20260902-7850',
    fecha: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    tipo: 'NAVEGACION',
    modulo: 'Catálogo Público',
    accion: 'Consulta de flota disponible y cálculo de tarifas para categoría SUV',
    actor: 'Visitante Web',
    correo: 'visitante@externo.co',
    rol: 'visitante',
    sucursal: 'Cali - Chipichape',
    ip: '190.84.150.88',
    dispositivo: 'Chrome Mobile / Android 14',
    resultado: 'EXITO',
    motivo: 'Exploración de catálogo sin reserva confirmada',
    detalles: { categoria: 'SUV', ciudad: 'Cali' },
  },
  {
    id: 'AUD-20260902-7720',
    fecha: new Date(Date.now() - 1000 * 60 * 950).toISOString(),
    tipo: 'GESTION_USUARIOS',
    modulo: 'Usuarios',
    accion: 'Registro de nuevo cliente y verificación de correo electrónico',
    actor: 'María Fernanda Ruiz',
    correo: 'maria.ruiz@gmail.com',
    rol: 'usuario',
    sucursal: 'Barranquilla - Prado',
    ip: '186.155.60.10',
    dispositivo: 'Firefox 130 / Windows 10',
    resultado: 'EXITO',
    motivo: 'Alta de cuenta exitosa con validación OTP',
    detalles: { usuarioId: 'USR-8820', cedula: '1030507090' },
  },
  {
    id: 'AUD-20260902-7610',
    fecha: new Date(Date.now() - 1000 * 60 * 1200).toISOString(),
    tipo: 'AUTENTICACION',
    modulo: 'Seguridad / Acceso',
    accion: 'Bloqueo temporal de cuenta por múltiples intentos fallidos',
    actor: 'Usuario no autenticado',
    correo: 'hacker_test@anonym.org',
    rol: 'desconocido',
    sucursal: 'Global / Sistema',
    ip: '198.51.100.44',
    dispositivo: 'Python-requests / 2.31',
    resultado: 'DENEGADO',
    motivo: '3 intentos consecutivos de contraseña errónea. Cuenta bloqueada por 5 min.',
    detalles: { bloqueoMinutos: 5, intentos: 3 },
  },
]

function cleanEmojiAndText(str) {
  if (!str) return ''
  return String(str)
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F0F5}]/gu, '')
    .trim()
}

function normalizeRecord(r) {
  if (!r) return null
  const res = String(r.resultado || 'EXITO').toUpperCase()
  let normalizedResult = 'EXITO'
  if (res.includes('FALL') || res.includes('ERR')) normalizedResult = 'FALLO'
  else if (res.includes('BLOQ') || res.includes('DENEG')) normalizedResult = 'DENEGADO'
  else if (res.includes('ADV') || res.includes('WARN')) normalizedResult = 'ADVERTENCIA'
  else if (res.includes('EXIT') || res.includes('SUCC')) normalizedResult = 'EXITO'

  const tipoNorm = r.tipo
    ? String(r.tipo).toUpperCase()
    : r.modulo
    ? String(r.modulo).toUpperCase().replace(/\s+/g, '_')
    : 'AUTENTICACION'

  let accion = r.accion || ''
  let motivo = r.motivo || ''
  let detalles = r.detalles || null

  // Si accion o motivo viene como JSON stringificado, extraer texto limpio y guardar payload en detalles
  if (typeof accion === 'string' && (accion.startsWith('{') || accion.startsWith('['))) {
    try {
      const parsed = JSON.parse(accion)
      detalles = detalles || parsed
      accion = parsed.accion
        ? `Configuración de ${parsed.modulo || 'sistema'}: ${parsed.accion}`
        : `Actualización de configuración en ${parsed.modulo || 'sistema'}`
    } catch {
      accion = 'Actualización de configuración del sistema'
    }
  }

  if (typeof motivo === 'string' && (motivo.startsWith('{') || motivo.startsWith('['))) {
    try {
      const parsed = JSON.parse(motivo)
      detalles = detalles || parsed
      if (!accion || accion === 'Registro de actividad' || accion.startsWith('{')) {
        accion = parsed.accion
          ? `Configuración de ${parsed.modulo || 'sistema'}: ${parsed.accion}`
          : `Actualización de configuración en ${parsed.modulo || 'sistema'}`
      }
      motivo = 'Cambio de configuración aplicado exitosamente'
    } catch {
      motivo = 'Operación registrada en el sistema'
    }
  }

  if (!accion) {
    accion = motivo || 'Operación registrada en la plataforma'
  }

  return {
    id: r.id || `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    fecha: r.fecha || new Date().toISOString(),
    tipo: cleanEmojiAndText(tipoNorm),
    modulo: cleanEmojiAndText(r.modulo || (tipoNorm ? tipoNorm.replace(/_/g, ' ') : 'Seguridad / Acceso')),
    accion: cleanEmojiAndText(accion),
    actor: cleanEmojiAndText(r.actor || r.nombre || r.correo || 'Usuario del Sistema'),
    correo: String(r.correo || '').trim().toLowerCase() || 'sistema@drivique.com',
    rol: cleanEmojiAndText(r.rol || 'administrador'),
    sucursal: cleanEmojiAndText(r.sucursal || 'Global / Sistema'),
    ip: r.ip || '127.0.0.1',
    dispositivo: r.dispositivo || 'Navegador Web / Plataforma',
    resultado: normalizedResult,
    motivo: cleanEmojiAndText(motivo),
    detalles: detalles,
  }
}

function readRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    let parsed = []
    if (raw) {
      try {
        const temp = JSON.parse(raw)
        if (Array.isArray(temp)) parsed = temp
      } catch {
        parsed = []
      }
    }

    const existingIds = new Set(parsed.map((p) => p.id))
    const missingSeeds = INITIAL_AUDIT_SEED.filter((seed) => !existingIds.has(seed.id))
    const combined = [...parsed, ...missingSeeds]

    const normalizedList = combined.map(normalizeRecord).filter(Boolean)
    normalizedList.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    return normalizedList
  } catch {
    return INITIAL_AUDIT_SEED.map(normalizeRecord)
  }
}

function writeRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_RECORDS)))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUDIT_EVENT, { detail: records }))
    }
  } catch (err) {
    console.error('Error guardando registro de auditoría:', err)
  }
}

export const accessAuditService = {
  eventName: AUDIT_EVENT,

  list() {
    return readRecords()
  },

  listForUser(currentUser) {
    const all = readRecords()
    if (!currentUser || !isBranchManager(currentUser)) return all

    const branchName = assignedBranch(currentUser)
    const userBranch = normalizeBranch(branchName)

    if (!userBranch) {
      return all
    }

    return all.filter((r) => {
      const recBranch = normalizeBranch(r.sucursal)
      return (
        recBranch.includes(userBranch) ||
        userBranch.includes(recBranch)
      )
    })
  },

  getById(id) {
    return readRecords().find((r) => r.id === id) || null
  },

  record({
    tipo = 'ACTIVIDAD_GENERAL',
    modulo = 'Sistema',
    accion = '',
    actor = '',
    correo = '',
    rol = 'desconocido',
    sucursal = 'Global / Sistema',
    ip = null,
    dispositivo = null,
    resultado = 'EXITO',
    motivo = '',
    detalles = null,
  }) {
    const now = new Date()
    const rawRecord = {
      id: `AUD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
      fecha: now.toISOString(),
      tipo: String(tipo).toUpperCase(),
      modulo,
      accion: accion || motivo || 'Registro de actividad',
      actor: actor || correo || 'Usuario del sistema',
      correo: String(correo || '').trim().toLowerCase(),
      rol,
      sucursal: sucursal || 'Global / Sistema',
      ip: ip || (typeof window !== 'undefined' ? window.location.hostname || '127.0.0.1' : '127.0.0.1'),
      dispositivo: dispositivo || (typeof navigator !== 'undefined' ? `${navigator.userAgent.slice(0, 40)}...` : 'Navegador Web'),
      resultado: String(resultado).toUpperCase(),
      motivo,
      detalles,
    }

    const newNormalized = normalizeRecord(rawRecord)
    const currentRecords = readRecords()
    writeRecords([newNormalized, ...currentRecords])
    return newNormalized
  },

  // Alias para mantener compatibilidad con llamadas existentes
  logAccess(data) {
    return this.record(data)
  },

  getStats(currentUser) {
    const records = this.listForUser(currentUser)
    const total = records.length
    const exitosos = records.filter((r) => r.resultado === 'EXITO' || r.resultado === 'EXITOSO').length
    const fallidos = records.filter((r) => r.resultado === 'FALLO' || r.resultado === 'FALLIDO' || r.resultado === 'DENEGADO').length
    const seguridad = records.filter((r) => r.tipo.includes('SEGURIDAD') || r.tipo.includes('2FA') || r.tipo.includes('AUTENTICACION')).length
    const crud = records.filter((r) => r.tipo.startsWith('CRUD') || r.tipo.startsWith('GESTION')).length

    return { total, exitosos, fallidos, seguridad, crud }
  },
}
