import { api } from './httpClient'
import { branchManagementService } from './branchManagementService'
import i18n from '@/i18n'

let categorias = []
let porSucursal = {}

const normalize = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

const mapCategoria = (c) => ({
  id: c.id,
  nombre: c.name,
  descripcion: '',
  tarifaBaseSugerida: Number(c.baseDailyRate),
  depositoGarantiaSugerido: Number(c.securityDeposit),
  activo: c.isActive,
})

function toError(error) {
  return new Error(error?.response?.data?.detail || error?.message || i18n.t('hc2.no_fue_posible_completar_la_operacion', 'No fue posible completar la operación.'))
}

const sucursalPorNombre = (nombre) => branchManagementService.list().find((b) => normalize(b.nombre) === normalize(nombre))
const categoriaPorNombre = (nombre) => categorias.find((c) => normalize(c.nombre) === normalize(nombre))

export const branchCategoryService = {
  async refresh() {
    const [{ data: lista }, { data: mapa }] = await Promise.all([api.get('/vehicle-categories'), api.get('/branch-categories')])
    categorias = lista.map(mapCategoria)
    porSucursal = mapa || {}
    return this.listCategories()
  },

  listCategories() {
    return categorias.map((c) => ({ ...c }))
  },

  async saveCategory(data) {
    const body = {
      name: String(data.nombre || '').trim(),
      baseDailyRate: Number(data.tarifaBaseSugerida) || 0,
      securityDeposit: Number(data.depositoGarantiaSugerido) || 0,
    }
    try {
      if (data.id) await api.put(`/vehicle-categories/${data.id}`, body)
      else await api.post('/vehicle-categories', body)
    } catch (error) {
      throw toError(error)
    }
    return this.refresh()
  },

  async deleteCategory(categoryId) {
    try {
      await api.patch(`/vehicle-categories/${categoryId}/toggle-status`)
    } catch (error) {
      throw toError(error)
    }
    return this.refresh()
  },

  getBranchCategoriesMap() {
    const resultado = {}
    branchManagementService.list().forEach((branch) => {
      resultado[normalize(branch.nombre)] = this.getBranchCategories(branch.nombre)
    })
    return resultado
  },

  getBranchCategories(branchName) {
    const sucursal = sucursalPorNombre(branchName)
    if (!sucursal) return []
    const ids = new Set(porSucursal[sucursal.id] || [])
    return categorias.filter((c) => c.activo && ids.has(c.id)).map((c) => c.nombre)
  },

  isCategoryActiveForBranch(branchName, categoryName) {
    return this.getBranchCategories(branchName).some((c) => normalize(c) === normalize(categoryName))
  },

  async toggleBranchCategory(branchName, categoryName, enable) {
    const sucursal = sucursalPorNombre(branchName)
    const categoria = categoriaPorNombre(categoryName)
    if (!sucursal || !categoria) throw new Error('Sucursal o categoría no encontrada.')
    try {
      if (enable) await api.put(`/branch-categories/${sucursal.id}/${categoria.id}`)
      else await api.delete(`/branch-categories/${sucursal.id}/${categoria.id}`)
    } catch (error) {
      throw toError(error)
    }
    await this.refresh()
    return this.getBranchCategories(branchName)
  },

  getBranchesOfferingCategoryRatio(categoryName) {
    const sucursales = branchManagementService.list().filter((b) => b.estado !== 'inactiva')
    const total = sucursales.length || 1
    const count = sucursales.filter((b) => this.isCategoryActiveForBranch(b.nombre, categoryName)).length
    return { count, total, formatted: `${count} de ${total}` }
  },
}
