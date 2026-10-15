import { api } from './httpClient'

let cache = []

const estadoVisible = (statusCode, signed) => {
  if (statusCode === 'ACTIVE' || statusCode === 'IN_PROGRESS') return 'vigente'
  if (statusCode === 'COMPLETED' || statusCode === 'CLOSED') return 'cerrado'
  return signed ? 'firmado' : 'pendiente'
}

const mapear = (c) => {
  const firmado = Boolean(c.signedAt)
  return {
    id: c.id,
    contratoNumero: c.contractNumber,
    reservaCodigo: c.reservationCode,
    reservaId: c.reservationId,
    clienteNombre: c.customerFullName,
    clienteCorreo: c.customerEmail,
    clienteTelefono: c.customerPhone || '',
    clienteDocumento: c.customerDocumentNumber || '',
    vehiculoId: c.vehicleId,
    vehiculoPlaca: c.vehiclePlate,
    vehiculoNombre: c.vehicleModel,
    vehiculoImagen: c.vehicleImageUrl || '',
    sucursal: c.pickupBranchName,
    ciudad: c.pickupCityName,
    fechaInicio: c.scheduledStartAt,
    fechaFin: c.scheduledEndAt,
    totalCOP: Number(c.finalAmount ?? c.baseAmount) || 0,
    estado: estadoVisible(c.statusCode, firmado),
    fechaFirma: c.signedAt || null,
    firmaUsuarioDataUrl: c.signatureUrl ? 'protected' : null,
    isSigned: firmado,
  }
}

export const contractManagementService = {
  async refresh() {
    const { data } = await api.get('/contracts/admin')
    cache = (Array.isArray(data) ? data : []).map(mapear)
    return this.list()
  },

  list() {
    return cache.map((contract) => ({ ...contract }))
  },

}
