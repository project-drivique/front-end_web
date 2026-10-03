import { useState, useMemo, useCallback } from 'react'

/**
 * Custom Hook: useManagementTable (Patrón Custom Hook)
 * Encapsula la gestión de estado de filtrado (búsqueda, estado, sucursal, pestañas) y
 * la computación memoizada de registros filtrados para vistas de administración.
 *
 * @param {Array} initialItems Lista inicial de registros
 * @param {Object} options Opciones de filtrado (customFilterFn, defaultState, defaultBranch, defaultTab)
 */
export function useManagementTable(initialItems = [], options = {}) {
  const {
    customFilterFn = null,
    defaultState = 'all',
    defaultBranch = 'all',
    defaultTab = 'all',
  } = options

  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState(defaultState)
  const [branchFilter, setBranchFilter] = useState(defaultBranch)
  const [activeTab, setActiveTab] = useState(defaultTab)

  const resetFilters = useCallback(() => {
    setSearch('')
    setStateFilter(defaultState)
    setBranchFilter(defaultBranch)
    setActiveTab(defaultTab)
  }, [defaultState, defaultBranch, defaultTab])

  const filtrados = useMemo(() => {
    if (!Array.isArray(items)) return []

    return items.filter((item) => {
      // 1. Filtro por Búsqueda (Search Query)
      const query = search.trim().toLowerCase()
      if (query) {
        if (customFilterFn) {
          if (!customFilterFn(item, query)) return false
        } else {
          const serialized = JSON.stringify(item).toLowerCase()
          if (!serialized.includes(query)) return false
        }
      }

      // 2. Filtro por Estado
      if (stateFilter !== 'all' && item.estado) {
        if (String(item.estado).toLowerCase() !== String(stateFilter).toLowerCase()) {
          return false
        }
      }

      // 3. Filtro por Sucursal
      if (branchFilter !== 'all') {
        const itemBranch = item.sucursalId || item.sucursal || item.sucursalNombre || ''
        if (String(itemBranch).toLowerCase() !== String(branchFilter).toLowerCase()) {
          return false
        }
      }

      // 4. Filtro por Pestaña
      if (activeTab !== 'all') {
        if (item.origen && String(item.origen).toLowerCase() !== String(activeTab).toLowerCase()) {
          if (activeTab === 'clientes' && item.origen !== 'cliente') return false
          if (activeTab === 'admin' && item.origen !== 'administrador') return false
        }
      }

      return true
    })
  }, [items, search, stateFilter, branchFilter, activeTab, customFilterFn])

  return {
    items,
    setItems,
    search,
    setSearch,
    stateFilter,
    setStateFilter,
    branchFilter,
    setBranchFilter,
    activeTab,
    setActiveTab,
    filtrados,
    resetFilters,
  }
}
