// src/services/userManagementService.js
import { api } from './httpClient'
import { branchManagementService } from './branchManagementService'
import { documentVerificationService } from './documentVerificationService'
import i18n from '@/i18n'

// Último resultado del servidor (list() es síncrono para los componentes)
let cache = []

const ROL_UI = { CUSTOMER: 'cliente', BRANCH_ADMIN: 'encargado', SUPER_ADMIN: 'administrador' }

const errorDe = (error) => {
  const detail = error?.response?.data?.detail
  return new Error(detail || error?.message || i18n.t('hc2.no_fue_posible_completar_la_operacion_279', 'No fue posible completar la operación'))
}

function mapear(u, expediente) {
  return {
    id: u.id,
    nombre: u.fullName,
    correo: u.email,
    telefono: u.phone || '',
    cedula: u.documentNumber || '',
    rol: ROL_UI[u.roleCode] || 'cliente',
    rolCodigo: u.roleCode,
    activo: Boolean(u.active),
    estadoCuenta: u.accountStatus,
    sucursal: u.branchName || '',
    sucursalId: u.branchId || null,
    reservasActivas: Number(u.activeReservations || 0),
    fechaRegistro: u.createdAt,
    documentosEstado: expediente?.estado || null,
    documentoCedula: expediente?.fotoCedulaFrente || null,
    documentoLicencia: expediente?.fotoLicenciaFrente || null,
    observacionDocumentos: expediente?.observaciones || '',
    documentIds: expediente ? [expediente.identityDocId, expediente.licenseDocId].filter(Boolean) : [],
  }
}

// Código de rol que espera el servidor
function codigoDeRol(rolUi) {
  if (rolUi === 'administrador') return 'SUPER_ADMIN'
  if (rolUi === 'encargado') return 'BRANCH_ADMIN'
  return 'CUSTOMER'
}

function cuerpo(data, actual) {
  const rolCodigo = codigoDeRol(data.rol, actual)
  const sucursal = rolCodigo === 'BRANCH_ADMIN'
    ? branchManagementService.list().find((b) => b.nombre === data.sucursal)
    : null
  return {
    fullName: String(data.nombre || '').trim(),
    email: String(data.correo || '').trim().toLowerCase(),
    phone: String(data.telefono || '').trim() || null,
    documentNumber: String(data.cedula || '').trim() || null,
    roleCode: rolCodigo,
    branchId: sucursal?.id || null,
  }
}

export const userManagementService = {
  async refresh() {
    const [{ data: usuarios }, expedientes] = await Promise.all([
      api.get('/admin/users'),
      documentVerificationService.listar().catch(() => []),
    ])
    const porUsuario = new Map(expedientes.map((e) => [String(e.userId), e]))
    cache = (Array.isArray(usuarios) ? usuarios : []).map((u) => mapear(u, porUsuario.get(String(u.id))))
    return this.list()
  },

  list() {
    return cache.map((u) => ({ ...u }))
  },

  getById(id) {
    return this.list().find((u) => u.id === id) || null
  },

  async create(userData) {
    try {
      await api.post('/admin/users', cuerpo(userData, null))
      await this.refresh()
    } catch (error) {
      throw errorDe(error)
    }
  },

  async update(id, userData) {
    try {
      await api.put(`/admin/users/${id}`, cuerpo(userData, this.getById(id)))
      await this.refresh()
    } catch (error) {
      throw errorDe(error)
    }
  },

  async toggleActive(id) {
    try {
      await api.patch(`/admin/users/${id}/status`)
      await this.refresh()
    } catch (error) {
      throw errorDe(error)
    }
  },

  async verifyDocuments(id, { documentosEstado, observacionDocumentos }) {
    const user = this.getById(id)
    if (!user?.documentIds?.length) throw new Error('El usuario no tiene documentos cargados')
    try {
      for (const docId of user.documentIds) {
        await documentVerificationService.revisarDocumentoBackend(docId, documentosEstado, observacionDocumentos)
      }
      await this.refresh()
    } catch (error) {
      throw errorDe(error)
    }
  },

  async remove(id) {
    try {
      await api.delete(`/admin/users/${id}`)
      await this.refresh()
    } catch (error) {
      throw errorDe(error)
    }
  },
}
