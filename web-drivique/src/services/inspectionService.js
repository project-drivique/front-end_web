import { api } from './httpClient'
export const inspectionService = {
  checklist: async () => (await api.get('/inspection-checklist')).data,
  register: async (contractId, request, photos = []) => {
    const form = new FormData()
    form.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }))
    photos.forEach((photo) => form.append('evidencePhotos', photo))
    return (await api.post(`/contracts/${contractId}/inspections`, form, { headers: { 'Content-Type': 'multipart/form-data' } })).data
  },
  list: async (contractId) => (await api.get(`/contracts/${contractId}/inspections`)).data,
}
