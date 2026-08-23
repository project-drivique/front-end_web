// src/services/roleManagementService.js
import { accessAuditService } from './accessAuditService'
import initialBranches from '../mocks/branches.json'

const ACCOUNTS_KEY = 'drivique_admin_accounts'
const ROLES_KEY = 'drivique_custom_roles'

function slugifyBranch(nombre) {
  return String(nombre || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

const BRANCH_MANAGER_ACCOUNTS = initialBranches.map((b, idx) => {
  const slug = slugifyBranch(b.nombre)
  return {
    id: `acc-encargado-${idx + 1}`,
    nombre: `Encargado ${b.nombre}`,
    correo: `encargado.${slug}@drivique.com`,
    telefono: `+57 310 ${100 + (idx % 800)} ${(2000 + idx) % 9000}`,
    rolId: 'role-encargado',
    rolCodigo: 'encargado_sucursal',
    rolNombre: 'Encargado de Sucursal',
    sucursal: b.nombre,
    activo: true,
    fechaCreacion: '2026-01-01T08:00:00.000Z',
  }
})

const INITIAL_ROLES = [
  {
    id: 'role-admin',
    nombre: 'Administrador Principal',
    codigo: 'administrador',
    descripcion: 'Control total e ilimitado sobre todos los módulos y configuraciones del sistema.',
    esSistema: true, // No se puede eliminar por ser rol base
    permisos: {
      vehicles: { ver: true, crear: true, editar: true, eliminar: true },
      reservations: { ver: true, crear: true, editar: true, eliminar: true },
      users: { ver: true, crear: true, editar: true, eliminar: true },
      contracts: { ver: true, crear: true, editar: true, eliminar: true },
      cities: { ver: true, crear: true, editar: true, eliminar: true },
      branches: { ver: true, crear: true, editar: true, eliminar: true },
      audit: { ver: true, crear: false, editar: false, eliminar: false },
    },
  },
  {
    id: 'role-encargado',
    nombre: 'Encargado de Sucursal',
    codigo: 'encargado_sucursal',
    descripcion: 'Gestión operativa de vehículos, entregas, devoluciones y reservas de su sucursal asignada.',
    esSistema: true,
    permisos: {
      vehicles: { ver: true, crear: true, editar: true, eliminar: false },
      reservations: { ver: true, crear: true, editar: true, eliminar: true },
      users: { ver: true, crear: false, editar: false, eliminar: false },
      contracts: { ver: true, crear: true, editar: true, eliminar: false },
      cities: { ver: false, crear: false, editar: false, eliminar: false },
      branches: { ver: false, crear: false, editar: false, eliminar: false },
      audit: { ver: false, crear: false, editar: false, eliminar: false },
    },
  },
  {
    id: 'role-auditor',
    nombre: 'Auditor Operativo',
    codigo: 'auditor',
    descripcion: 'Consulta y supervisión de registros de auditoría y reportes sin permisos de edición.',
    esSistema: false,
    permisos: {
      vehicles: { ver: true, crear: false, editar: false, eliminar: false },
      reservations: { ver: true, crear: false, editar: false, eliminar: false },
      users: { ver: true, crear: false, editar: false, eliminar: false },
      contracts: { ver: true, crear: false, editar: false, eliminar: false },
      cities: { ver: true, crear: false, editar: false, eliminar: false },
      branches: { ver: true, crear: false, editar: false, eliminar: false },
      audit: { ver: true, crear: false, editar: false, eliminar: false },
    },
  },
]

const INITIAL_ACCOUNTS = [
  {
    id: 'acc-1',
    nombre: 'Administrador Principal',
    correo: 'admin@drivique.com',
    telefono: '+57 300 123 4567',
    rolId: 'role-admin',
    rolCodigo: 'administrador',
    rolNombre: 'Administrador Principal',
    sucursal: null,
    activo: true,
    fechaCreacion: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'acc-2',
    nombre: 'Supervisora Bogotá',
    correo: 'supervisora.bogota@drivique.com',
    telefono: '+57 310 445 8899',
    rolId: 'role-auditor',
    rolCodigo: 'auditor',
    rolNombre: 'Auditor Operativo',
    sucursal: 'Bogotá',
    activo: true,
    fechaCreacion: '2026-02-10T14:00:00.000Z',
  },
  ...BRANCH_MANAGER_ACCOUNTS,
]

function readRoles() {
  try {
    const raw = localStorage.getItem(ROLES_KEY)
    if (!raw) {
      localStorage.setItem(ROLES_KEY, JSON.stringify(INITIAL_ROLES))
      return INITIAL_ROLES
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ROLES
  } catch {
    return INITIAL_ROLES
  }
}

function writeRoles(data) {
  try {
    localStorage.setItem(ROLES_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Error guardando roles:', err)
  }
}

function readAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    let parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed) || parsed.length < INITIAL_ACCOUNTS.length) {
      const existingMails = new Set(parsed.map((a) => a.correo?.toLowerCase()))
      INITIAL_ACCOUNTS.forEach((initAcc) => {
        if (!existingMails.has(initAcc.correo?.toLowerCase())) {
          parsed.push(initAcc)
        }
      })
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(parsed))
    }
    return parsed
  } catch {
    return INITIAL_ACCOUNTS
  }
}

function writeAccounts(data) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Error guardando cuentas:', err)
  }
}

export const roleManagementService = {
  // --- ROLES Y PERMISOS ---
  listRoles() {
    const roles = readRoles()
    const accounts = readAccounts()

    return roles.map((role) => {
      const assignedCount = accounts.filter((acc) => acc.rolId === role.id || acc.rolCodigo === role.codigo).length
      return {
        ...role,
        cuentasAsignadas: assignedCount,
      }
    })
  },

  createRole(roleData, adminUser) {
    const cleanName = String(roleData.nombre || '').trim()
    if (!cleanName) throw new Error('roleNameRequired')

    const roles = readRoles()
    const codigo = cleanName.toLowerCase().replace(/\s+/g, '_')

    if (roles.some((r) => r.nombre.toLowerCase() === cleanName.toLowerCase())) {
      throw new Error('roleAlreadyExists')
    }

    const newRole = {
      id: `role-${Date.now().toString(36)}`,
      nombre: cleanName,
      codigo,
      descripcion: roleData.descripcion || 'Rol personalizado con permisos configurados.',
      esSistema: false,
      permisos: roleData.permisos || {
        vehicles: { ver: true, crear: false, editar: false, eliminar: false },
        reservations: { ver: true, crear: false, editar: false, eliminar: false },
        users: { ver: false, crear: false, editar: false, eliminar: false },
        contracts: { ver: false, crear: false, editar: false, eliminar: false },
        cities: { ver: false, crear: false, editar: false, eliminar: false },
        branches: { ver: false, crear: false, editar: false, eliminar: false },
        audit: { ver: false, crear: false, editar: false, eliminar: false },
      },
    }

    roles.push(newRole)
    writeRoles(roles)

    accessAuditService.record({
      correo: adminUser?.correo || 'admin@drivique.com',
      rol: adminUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `Creó el rol ${newRole.nombre} con permisos configurados`,
    })

    return newRole
  },

  updateRole(id, roleData, adminUser) {
    const roles = readRoles()
    const index = roles.findIndex((r) => r.id === id)
    if (index < 0) throw new Error('roleNotFound')

    const updated = {
      ...roles[index],
      ...roleData,
      id: roles[index].id,
      esSistema: roles[index].esSistema, // Conserva si es del sistema
    }

    roles[index] = updated
    writeRoles(roles)

    // Actualizar nombre de rol en cuentas si cambió
    const accounts = readAccounts()
    const accountsUpdated = accounts.map((acc) => {
      if (acc.rolId === id) {
        return { ...acc, rolNombre: updated.nombre }
      }
      return acc
    })
    writeAccounts(accountsUpdated)

    accessAuditService.record({
      correo: adminUser?.correo || 'admin@drivique.com',
      rol: adminUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `Actualizó permisos y datos del rol ${updated.nombre}`,
    })

    return updated
  },

  removeRole(id, adminUser) {
    const roles = readRoles()
    const role = roles.find((r) => r.id === id)
    if (!role) throw new Error('roleNotFound')

    if (role.esSistema) {
      throw new Error('systemRoleCannotBeDeleted')
    }

    // VALIDACIÓN CRÍTICA: No eliminar si tiene cuentas asignadas
    const accounts = readAccounts()
    const assigned = accounts.filter((acc) => acc.rolId === id || acc.rolCodigo === role.codigo)
    if (assigned.length > 0) {
      throw new Error('roleHasAssignedAccounts')
    }

    const filtered = roles.filter((r) => r.id !== id)
    writeRoles(filtered)

    accessAuditService.record({
      correo: adminUser?.correo || 'admin@drivique.com',
      rol: adminUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `Eliminó el rol ${role.nombre}`,
    })

    return true
  },

  // --- CUENTAS ADMINISTRATIVAS ---
  listAccounts() {
    return readAccounts()
  },

  createAccount(accountData, adminUser) {
    const cleanMail = String(accountData.correo || '').trim().toLowerCase()
    if (!cleanMail) throw new Error('mailRequired')

    const accounts = readAccounts()
    if (accounts.some((acc) => acc.correo.toLowerCase() === cleanMail)) {
      throw new Error('mailAlreadyExists')
    }

    // Validar sucursal obligatoria si es encargado
    const roles = readRoles()
    const roleObj = roles.find((r) => r.id === accountData.rolId || r.codigo === accountData.rolId)
    const esEncargado = roleObj?.codigo === 'encargado_sucursal' || accountData.rolId === 'role-encargado'

    if (esEncargado && !accountData.sucursal) {
      throw new Error('branchRequiredForManager')
    }

    const tempPassword = `Drivique${Math.floor(1000 + Math.random() * 9000)}!`

    const newAccount = {
      id: `acc-${Date.now().toString(36)}`,
      nombre: accountData.nombre || 'Nuevo Colaborador',
      correo: cleanMail,
      telefono: accountData.telefono || '+57 300 000 0000',
      rolId: roleObj?.id || 'role-admin',
      rolCodigo: roleObj?.codigo || 'administrador',
      rolNombre: roleObj?.nombre || 'Administrador',
      sucursal: esEncargado ? accountData.sucursal : null,
      activo: accountData.activo !== false,
      fechaCreacion: new Date().toISOString(),
    }

    accounts.unshift(newAccount)
    writeAccounts(accounts)

    // Notificación al nuevo administrador/encargado
    try {
      const store = useNotificationStore.getState()
      if (store && store.agregarNotificacion) {
        store.agregarNotificacion({
          tipo: 'sistema',
          titulo: '🎉 Cuenta Administrativa Creada',
          mensaje: `Bienvenido a Drivique. Se ha creado tu cuenta con el rol "${newAccount.rolNombre}". Credenciales temporales enviadas a ${newAccount.correo} (Contraseña: ${tempPassword}).`,
        })
      }
    } catch (e) {
      console.log('Notificación registrada')
    }

    accessAuditService.record({
      correo: adminUser?.correo || 'admin@drivique.com',
      rol: adminUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `Creó la cuenta administrativa para ${newAccount.nombre} (${newAccount.correo}) con el rol ${newAccount.rolNombre}`,
    })

    return { ...newAccount, tempPassword }
  },

  updateAccount(id, accountData, adminUser) {
    const accounts = readAccounts()
    const index = accounts.findIndex((acc) => acc.id === id)
    if (index < 0) throw new Error('accountNotFound')

    const current = accounts[index]
    const roles = readRoles()
    const roleObj = roles.find((r) => r.id === accountData.rolId || r.codigo === accountData.rolId)
    const esEncargado = roleObj?.codigo === 'encargado_sucursal' || accountData.rolId === 'role-encargado'

    if (esEncargado && !accountData.sucursal) {
      throw new Error('branchRequiredForManager')
    }

    const updated = {
      ...current,
      nombre: accountData.nombre || current.nombre,
      correo: accountData.correo || current.correo,
      telefono: accountData.telefono || current.telefono,
      rolId: roleObj?.id || current.rolId,
      rolCodigo: roleObj?.codigo || current.rolCodigo,
      rolNombre: roleObj?.nombre || current.rolNombre,
      sucursal: esEncargado ? accountData.sucursal : null,
      activo: accountData.activo !== undefined ? accountData.activo : current.activo,
    }

    accounts[index] = updated
    writeAccounts(accounts)

    accessAuditService.record({
      correo: adminUser?.correo || 'admin@drivique.com',
      rol: adminUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `Actualizó la cuenta administrativa de ${updated.nombre} (${updated.correo})`,
    })

    return updated
  },

  toggleActiveAccount(id, adminUser) {
    const accounts = readAccounts()
    const index = accounts.findIndex((acc) => acc.id === id)
    if (index < 0) throw new Error('accountNotFound')

    accounts[index].activo = !accounts[index].activo
    const status = accounts[index].activo
    writeAccounts(accounts)

    accessAuditService.record({
      correo: adminUser?.correo || 'admin@drivique.com',
      rol: adminUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `${status ? 'Activó' : 'Desactivó'} la cuenta administrativa de ${accounts[index].nombre} (${accounts[index].correo})`,
    })

    return accounts[index]
  },

  removeAccount(id, adminUser) {
    const accounts = readAccounts()
    const acc = accounts.find((a) => a.id === id)
    if (!acc) throw new Error('accountNotFound')

    const filtered = accounts.filter((a) => a.id !== id)
    writeAccounts(filtered)

    accessAuditService.record({
      correo: adminUser?.correo || 'admin@drivique.com',
      rol: adminUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `Eliminó la cuenta administrativa de ${acc.nombre} (${acc.correo})`,
    })

    return true
  },
}
