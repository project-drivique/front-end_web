import accessConfig from '../../../mocks/adminAccessConfig.json'

export const ROLES = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  EMPLOYEE: 'EMPLOYEE',
  BRANCH_ADMIN: 'BRANCH_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  // Backwards compatibility aliases
  USER: accessConfig.roles.user,
  ADMIN: accessConfig.roles.admin,
  BRANCH_MANAGER: accessConfig.roles.branchManager,
})

export const ADMIN_ROLES = Object.freeze([
  ROLES.SUPER_ADMIN,
  ROLES.BRANCH_ADMIN,
  ROLES.EMPLOYEE,
  ROLES.ADMIN,
  ROLES.BRANCH_MANAGER,
])

export const PERMISSIONS = Object.freeze({
  ADMIN_PANEL: accessConfig.permissions.adminPanel,
  BRANCH_PANEL: accessConfig.permissions.branchPanel,
})

export function getRoleHome(role) {
  if (!role) return '/home'
  const normalized = String(role).toUpperCase()
  if (normalized === 'SUPER_ADMIN' || normalized === 'ADMIN' || role === 'administrador') {
    return '/admin'
  }
  if (
    normalized === 'BRANCH_ADMIN' ||
    normalized === 'EMPLOYEE' ||
    normalized === 'BRANCH_MANAGER' ||
    role === 'encargado_sucursal' ||
    role === 'encargado'
  ) {
    return '/encargado'
  }
  return accessConfig.destinations[role] || '/home'
}

export function hasValidRoleAccess(user) {
  if (!user) return false
  if (user.activo === false || user.accountStatus === 'BLOCKED' || user.accountStatus === 'INACTIVE') {
    return false
  }
  return true
}

