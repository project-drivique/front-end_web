import { useMemo } from 'react'
import { useAuthStore } from '../store/authStore'

/**
 * Custom Hook: useBranchScope (Patrón Custom Hook)
 * Encapsula la lógica del patrón de ámbito de sucursal para determinar los permisos
 * del Encargado de Sucursal (Branch Manager) y restringir los datos al ámbito de su sede.
 */
export function useBranchScope() {
  const user = useAuthStore((state) => state.usuario)

  const isBranchManager = useMemo(() => {
    if (!user) return false
    const rol = String(user.rol || '').toLowerCase()
    return (
      rol === 'encargado' ||
      rol === 'encargado_sucursal' ||
      rol === 'branch_manager'
    )
  }, [user])

  const assignedBranch = useMemo(() => {
    if (!user) return ''
    return user.sucursalId || user.sucursal || user.sucursalAsignada || ''
  }, [user])

  const branchKey = useMemo(() => {
    return String(assignedBranch).trim().toLowerCase()
  }, [assignedBranch])

  /**
   * Aplica el filtro de ámbito de sucursal sobre una lista de datos.
   * @param {Array} items Lista de registros
   * @param {Function} getBranchFromItem Función extractora del identificador/nombre de sucursal
   */
  const filterByBranchScope = (items, getBranchFromItem) => {
    if (!isBranchManager || !branchKey || !Array.isArray(items)) return items
    return items.filter((item) => {
      const itemBranch = getBranchFromItem
        ? getBranchFromItem(item)
        : item.sucursalId || item.sucursal || item.sucursalNombre || ''
      if (!itemBranch) return false
      return String(itemBranch).trim().toLowerCase() === branchKey
    })
  }

  return {
    user,
    isBranchManager,
    assignedBranch,
    branchKey,
    filterByBranchScope,
  }
}
