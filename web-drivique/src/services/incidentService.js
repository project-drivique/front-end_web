import { api } from './httpClient'

function toError(error) {
  const result = new Error(error?.response?.data?.detail || error?.message || 'No fue posible completar la operación.')
  result.status = error?.response?.status
  return result
}

async function call(request) {
  try {
    return (await request()).data
  } catch (error) {
    throw toError(error)
  }
}

function formWith(entries, files) {
  const form = new FormData()
  entries.forEach(([key, value]) => form.append(key, value))
  ;(files || []).forEach((file) => form.append('files', file))
  return form
}

export const incidentService = {
  mine: () => call(() => api.get('/incidents/me')),

  forStaff: (filters = {}) => call(() => api.get('/incidents', { params: filters })),

  detail: (id) => call(() => api.get(`/incidents/${id}`)),

  create: (payload) => call(() => api.post('/incidents', payload)),

  uploadAttachments: (id, files) => call(() => api.post(`/incidents/${id}/attachments`, formWith([], files))),

  respond: (id, message, files) => call(() => api.post(`/incidents/${id}/responses`, formWith([['message', message]], files))),

  changeStatus: (id, status, note) => call(() => api.patch(`/incidents/${id}/status`, { status, note: note || null })),

  remove: (id) => call(() => api.delete(`/incidents/${id}`)),

  assign: (id, assigneeUserId) => call(() => api.patch(`/incidents/${id}/assign`, assigneeUserId ? { assigneeUserId } : {})),

  // Los adjuntos son privados: se descargan con la sesión y se muestran desde un blob local.
  attachmentUrl: async (incidentId, attachmentId) => {
    const blob = await call(() => api.get(`/incidents/${incidentId}/attachments/${attachmentId}`, { responseType: 'blob' }))
    return URL.createObjectURL(blob)
  },
}
