// src/services/roleManagementService.js
import { api } from './httpClient'
import { branchManagementService } from './branchManagementService'
import { userManagementService } from './userManagementService'

// Roles del sistema: no se eliminan y su código no cambia
const ROLES_SISTEMA = new Set(['SUPER_ADMIN', 'BRANCH_ADMIN', 'CUSTOMER'])

// Último resultado del servidor (los métodos de lectura son síncronos para la pantalla)
let rolesCache = []
let permisosCache = []
let cuentasCache = []

const errorDe = (error) => new Error(error?.response?.data?.detail || error?.message || 'No fue posible completar la operación')

function mapearRol(role, cuentas) {
  return {
    id: role.id,
    nombre: role.name,
    codigo: role.code,
    descripcion: role.description || '',
    esSistema: ROLES_SISTEMA.has(role.code),
    activo: Boolean(role.active),
    // permisos reales del rol, por código: { FLEET_MANAGE: true, ... }
    permisos: Object.fromEntries((role.permissions || []).map((p) => [p.code, true])),
    cuentasAsignadas: cuentas.filter((c) => c.rolCodigo === role.code).length,
  }
}

function mapearCuenta(user, roles) {
  const rol = roles.find((r) => r.codigo === user.rolCodigo)
  return {
    id: user.id,
    nombre: user.nombre,
    correo: user.correo,
    telefono: user.telefono,
    cedula: user.cedula,
    rolId: rol?.id || '',
    rolCodigo: user.rolCodigo,
    rolNombre: rol?.nombre || user.rolCodigo,
    sucursal: user.sucursal || '',
    activo: user.activo,
    fechaCreacion: user.fechaRegistro,
  }
}

const codigosDe = (permisos) => Object.entries(permisos || {}).filter(([, activo]) => activo).map(([codigo]) => codigo)

export const roleManagementService = {
  async refresh() {
    const [{ data: roles }, { data: permisos }, usuarios] = await Promise.all([
      api.get('/roles'),
      api.get('/permissions'),
      userManagementService.refresh(),
    ])
    permisosCache = (Array.isArray(permisos) ? permisos : []).map((p) => ({ codigo: p.code, nombre: p.name, descripcion: p.description || '' }))
    const cuentas = usuarios.filter((u) => u.rolCodigo !== 'CUSTOMER')
    const rolesBase = (Array.isArray(roles) ? roles : []).map((r) => mapearRol(r, cuentas))
    rolesCache = rolesBase
    cuentasCache = cuentas.map((u) => mapearCuenta(u, rolesBase))
    return this.listRoles()
  },

  // --- Roles y permisos ---
  listPermissions() { return permisosCache.map((p) => ({ ...p })) },
  listRoles() { return rolesCache.filter((r) => r.codigo !== 'CUSTOMER' && r.codigo !== 'EMPLOYEE').map((r) => ({ ...r })) },

  async createRole(roleData) {
    try {
      await api.post('/roles', { name: String(roleData.nombre || '').trim(), description: String(roleData.descripcion || '').trim(), permissionCodes: codigosDe(roleData.permisos) })
      await this.refresh()
    } catch (error) {
      throw errorDe(error)
    }
  },

  async updateRole(id, roleData) {
    try {
      await api.put(`/roles/${id}`, { name: String(roleData.nombre || '').trim(), description: String(roleData.descripcion || '').trim(), permissionCodes: codigosDe(roleData.permisos) })
      await this.refresh()
    } catch (error) {
      throw errorDe(error)
    }
  },

  async removeRole(id) {
    try {
      await api.delete(`/roles/${id}`)
      await this.refresh()
    } catch (error) {
      throw errorDe(error)
    }
  },

  // --- Cuentas administrativas (usuarios con rol operativo o administrador) ---
  listAccounts() { return cuentasCache.map((c) => ({ ...c })) },

  cuerpoCuenta(data, actual) {
    const rol = rolesCache.find((r) => r.id === data.rolId)
    const sucursal = rol?.codigo === 'BRANCH_ADMIN'
      ? branchManagementService.list().find((b) => b.nombre === data.sucursal)
      : null
    return {
      fullName: String(data.nombre || '').trim(),
      email: String(data.correo || '').trim().toLowerCase(),
      phone: String(data.telefono || '').trim() || null,
      documentNumber: actual?.cedula || null,
      roleCode: rol?.codigo,
      branchId: sucursal?.id || null,
    }
  },

  async createAccount(accountData) {
    try {
      await api.post('/admin/users', this.cuerpoCuenta(accountData, null))
      await this.refresh()
    } catch (error) {
      throw errorDe(error)
    }
  },

  async updateAccount(id, accountData) {
    try {
      await api.put(`/admin/users/${id}`, this.cuerpoCuenta(accountData, cuentasCache.find((c) => c.id === id)))
      await this.refresh()
    } catch (error) {
      throw errorDe(error)
    }
  },

  async toggleActiveAccount(id) {
    try {
      await api.patch(`/admin/users/${id}/status`)
      await this.refresh()
    } catch (error) {
      throw errorDe(error)
    }
  },

  async removeAccount(id) {
    try {
      await api.delete(`/admin/users/${id}`)
      await this.refresh()
    } catch (error) {
      throw errorDe(error)
    }
  },
}
