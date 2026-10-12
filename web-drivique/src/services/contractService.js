import { api } from './httpClient'

const normalize = (contract) => contract ? ({
  ...contract,
  codigo: contract.contractNumber,
  referenciaReserva: contract.reservationCode,
  estado: contract.statusCode,
  firmadoEn: contract.signedAt,
  firmaUsuarioDataUrl: contract.signatureUrl ? 'protected' : null,
}) : null

async function getOrGenerate(reservationId) {
  if (!reservationId) return null
  if (!/^[0-9a-f-]{36}$/i.test(String(reservationId))) {
    return normalize((await api.post(`/contracts/generate/reservation-code/${encodeURIComponent(reservationId)}`)).data)
  }
  try {
    return normalize((await api.get(`/contracts/reservation/${reservationId}`)).data)
  } catch (error) {
    if (error?.response?.status !== 404) throw error
    return normalize((await api.post('/contracts/generate', { reservationId })).data)
  }
}

function dataUrlToBlob(dataUrl) {
  const [header, encoded] = dataUrl.split(',')
  const mime = header.match(/data:(.*?);/)?.[1] || 'image/png'
  const bytes = atob(encoded)
  const buffer = new Uint8Array(bytes.length)
  for (let index = 0; index < bytes.length; index += 1) buffer[index] = bytes.charCodeAt(index)
  return new Blob([buffer], { type: mime })
}

export const contractService = {
  obtenerPorReserva: getOrGenerate,
  obtenerOCrearCodigo: async (reservationId) => (await getOrGenerate(reservationId))?.contractNumber || '',
  completarContratoOriginal: async (reservationId) => getOrGenerate(reservationId),
  guardarFirma: async (reservationId, { firmaUsuarioDataUrl, firmaTrazos = '[]', signedCityId, documentVersion = 'v1.0' }) => {
    const contract = await getOrGenerate(reservationId)
    if (!contract) throw new Error('No se pudo generar el contrato para la reserva.')
    const form = new FormData()
    form.append('signature', dataUrlToBlob(firmaUsuarioDataUrl), 'signature.png')
    form.append('signatureStrokeData', firmaTrazos)
    form.append('signedCityId', signedCityId || contract.pickupCityId)
    form.append('consentAccepted', 'true')
    form.append('documentVersion', documentVersion)
    return normalize((await api.post(`/contracts/${contract.id}/sign`, form, { headers: { 'Content-Type': 'multipart/form-data' } })).data)
  },
  descargarPdf: async (contractId) => (await api.get(`/contracts/${contractId}/pdf`, { responseType: 'blob' })).data,
}
