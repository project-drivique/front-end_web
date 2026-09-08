import accessConfig from '../../../mocks/adminAccessConfig.json'

export const ROLES = Object.freeze({
  USER: accessConfig.roles.user,
  ADMIN: accessConfig.roles.admin,
  BRANCH_MANAGER: accessConfig.roles.branchManager,
})

export const ADMIN_ROLES = Object.freeze([ROLES.ADMIN, ROLES.BRANCH_MANAGER])

export const PERMISSIONS = Object.freeze({
  ADMIN_PANEL: accessConfig.permissions.adminPanel,
  BRANCH_PANEL: accessConfig.permissions.branchPanel,
})

export function getRoleHome(role) {
  return accessConfig.destinations[role] || accessConfig.destinations[ROLES.USER]
}

export function hasValidRoleAccess(user) {
  if (!user || user.activo === false) return false
  const permissions = Array.isArray(user.permisos) ? user.permisos : []
  if (user.rol === ROLES.ADMIN || user.rol === 'administrador' || user.rol === 'admin') {
    return permissions.length === 0 || permissions.includes(PERMISSIONS.ADMIN_PANEL)
  }
  if (user.rol === ROLES.BRANCH_MANAGER || user.rol === 'encargado' || user.rol === 'encargado_sucursal' || user.rol === 'branch_manager') {
    return Boolean(user.sucursalId || user.sucursal || user.sucursalAsignada)
  }
  return true
}
