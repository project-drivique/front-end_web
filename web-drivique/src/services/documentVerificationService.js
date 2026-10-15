import { api } from './httpClient'

const ESTADO_POR_CODIGO = { APPROVED: 'aprobado', REJECTED: 'rechazado' }

const esIdentidad = (doc) => /cedula|identidad|dni|cc|ce|passport|pasaporte/i.test(`${doc.documentType?.code || ''} ${doc.documentType?.name || ''}`)
const esLicencia = (doc) => /licencia|driver/i.test(`${doc.documentType?.code || ''} ${doc.documentType?.name || ''}`)

function estadoExpediente(docs) {
  const estados = docs.map((d) => ESTADO_POR_CODIGO[d.statusCode] || 'pendiente')
  if (estados.includes('rechazado')) return 'rechazado'
  if (estados.every((e) => e === 'aprobado')) return 'aprobado'
  return 'pendiente'
}

// Agrupa los documentos de cada cliente en un solo expediente de validación
function armarExpedientes(documentos) {
  const porUsuario = new Map()
  for (const doc of documentos) {
    const clave = String(doc.userId || doc.id)
    if (!porUsuario.has(clave)) porUsuario.set(clave, [])
    porUsuario.get(clave).push(doc)
  }

  return [...porUsuario.values()].map((docs) => {
    const identidad = docs.find(esIdentidad) || docs[0]
    const licencia = docs.find(esLicencia) || null
    const principal = identidad || docs[0]
    const revisado = docs.find((d) => d.reviewedAt)
    return {
      id: principal.id,
      userId: principal.userId,
      allDocIds: docs.map((d) => d.id),
      identityDocId: identidad?.id,
      licenseDocId: licencia?.id,
      reservaCodigo: docs.find((d) => d.reservationCode)?.reservationCode || '',
      vehiculoNombre: docs.find((d) => d.vehicleName)?.vehicleName || '',
      clienteNombre: principal.userName || '',
      conductorNombre: principal.userName || '',
      documentoIdentidad: identidad?.documentNumber || '',
      tipoDocumento: identidad?.documentType?.name || '',
      numeroLicencia: licencia?.documentNumber || '',
      pdfCedulaUrl: identidad?.frontUrl || '',
      fotoCedulaFrente: identidad?.frontUrl || '',
      pdfLicenciaUrl: licencia?.frontUrl || '',
      fotoLicenciaFrente: licencia?.frontUrl || '',
      frontUrl: principal.frontUrl,
      sucursal: principal.branchName || '',
      branchId: principal.branchId,
      estado: estadoExpediente(docs),
      observaciones: docs.map((d) => d.reviewNotes).find(Boolean) || '',
      verificadoPor: revisado?.reviewedByName || '',
      fechaVerificacion: revisado?.reviewedAt ? new Date(revisado.reviewedAt).toLocaleString('es-CO') : '',
      fechaSubida: principal.createdAt ? new Date(principal.createdAt).toLocaleString('es-CO') : '',
      backend: true,
    }
  })
}

export const documentVerificationService = {
  async listar() {
    const { data } = await api.get('/kyc/documents')
    const documentos = Array.isArray(data) ? data : (data?.documents || [])
    return armarExpedientes(documentos)
  },

  async revisarDocumentoBackend(id, nuevoEstado, observaciones = '') {
    const { data } = await api.patch(`/kyc/documents/${id}/review`, {
      status: nuevoEstado === 'aprobado' ? 'APPROVED' : 'REJECTED',
      reviewNotes: observaciones || null,
    })
    return data
  },
}
