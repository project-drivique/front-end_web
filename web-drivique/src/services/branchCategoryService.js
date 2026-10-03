import initialCategories from '../mocks/categories.json'
import initialBranchCategories from '../mocks/branchCategories.json'
import { branchManagementService } from './branchManagementService'

const STORAGE_KEY_CATEGORIES = 'drivique_global_categories'
const STORAGE_KEY_BRANCH_CATEGORIES = 'drivique_branch_categories'

const normalize = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback))
      return fallback
    }
    const parsed = JSON.parse(raw)
    return parsed !== null && parsed !== undefined ? parsed : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`Error guardando en ${key}:`, e)
  }
}

export const branchCategoryService = {
  /**
   * Obtiene la lista global de categorías definidas por el administrador general.
   */
  listCategories() {
    return readStorage(STORAGE_KEY_CATEGORIES, initialCategories)
  },

  /**
   * Guarda (crea o edita) una categoría global.
   */
  saveCategory(categoryData) {
    const list = this.listCategories()
    const isEditing = Boolean(categoryData.id)
    let updatedList

    if (isEditing) {
      updatedList = list.map((c) =>
        c.id === categoryData.id ? { ...c, ...categoryData } : c
      )
    } else {
      const newId = list.reduce((max, c) => Math.max(max, Number(c.id) || 0), 0) + 1
      const newCategory = {
        ...categoryData,
        id: newId,
        activo: categoryData.activo ?? true,
      }
      updatedList = [...list, newCategory]
    }

    writeStorage(STORAGE_KEY_CATEGORIES, updatedList)
    return updatedList
  },

  /**
   * Elimina una categoría global.
   */
  deleteCategory(categoryId) {
    const list = this.listCategories()
    const target = list.find((c) => c.id === categoryId)
    const updatedList = list.filter((c) => c.id !== categoryId)
    writeStorage(STORAGE_KEY_CATEGORIES, updatedList)

    // Si se elimina la categoría global, también se remueve del mapeo de sucursales
    if (target?.nombre) {
      const branchMap = this.getBranchCategoriesMap()
      let modified = false
      Object.keys(branchMap).forEach((branchKey) => {
        const catList = branchMap[branchKey] || []
        if (catList.some((c) => normalize(c) === normalize(target.nombre))) {
          branchMap[branchKey] = catList.filter((c) => normalize(c) !== normalize(target.nombre))
          modified = true
        }
      })
      if (modified) {
        writeStorage(STORAGE_KEY_BRANCH_CATEGORIES, branchMap)
      }
    }

    return updatedList
  },

  /**
   * Obtiene el mapa completo de sucursales con sus categorías activas.
   */
  getBranchCategoriesMap() {
    return readStorage(STORAGE_KEY_BRANCH_CATEGORIES, initialBranchCategories)
  },

  /**
   * Obtiene las categorías activas para una sucursal específica.
   */
  getBranchCategories(branchName) {
    if (!branchName) return []
    const map = this.getBranchCategoriesMap()
    const key = normalize(branchName)

    // Buscar coincidencia exacta o parcial
    if (Array.isArray(map[key])) return map[key]

    const matchedKey = Object.keys(map).find(
      (k) => k.includes(key) || key.includes(k)
    )
    return matchedKey && Array.isArray(map[matchedKey]) ? map[matchedKey] : []
  },

  /**
   * Verifica si una categoría específica está habilitada para una sucursal.
   */
  isCategoryActiveForBranch(branchName, categoryName) {
    const activeList = this.getBranchCategories(branchName)
    const normalizedCat = normalize(categoryName)
    return activeList.some((c) => normalize(c) === normalizedCat)
  },

  /**
   * Activa o desactiva una categoría para una sucursal dada.
   */
  toggleBranchCategory(branchName, categoryName, enable) {
    if (!branchName || !categoryName) return []
    const map = { ...this.getBranchCategoriesMap() }
    const key = normalize(branchName)
    const currentList = this.getBranchCategories(branchName)
    const normalizedCat = normalize(categoryName)

    let updatedList
    if (enable) {
      if (!currentList.some((c) => normalize(c) === normalizedCat)) {
        updatedList = [...currentList, categoryName]
      } else {
        updatedList = currentList
      }
    } else {
      updatedList = currentList.filter((c) => normalize(c) !== normalizedCat)
    }

    map[key] = updatedList
    writeStorage(STORAGE_KEY_BRANCH_CATEGORIES, map)
    return updatedList
  },

  /**
   * Calcula cuántas sucursales activas tienen habilitada una categoría (ej. 5 de 8).
   */
  getBranchesOfferingCategoryRatio(categoryName) {
    const branches = branchManagementService.list().filter((b) => b.estado !== 'inactiva')
    const totalBranches = branches.length || 1
    let offeringCount = 0

    const normalizedCat = normalize(categoryName)
    branches.forEach((b) => {
      const activeCats = this.getBranchCategories(b.nombre)
      if (activeCats.some((c) => normalize(c) === normalizedCat)) {
        offeringCount += 1
      }
    })

    return {
      count: offeringCount,
      total: totalBranches,
      formatted: `${offeringCount} de ${totalBranches}`,
    }
  },
}
