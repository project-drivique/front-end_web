import { api } from './httpClient'

/**
 * Normaliza una notificación del backend para asegurar consistencia
 * con el diseño y renderizado en Frontend Web.
 */
export function normalizarNotificacion(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id || raw.notificationId || raw.uuid || String(Math.random())
  const titulo = raw.subject || raw.title || raw.titulo || raw.tituloKey || 'Notificación Drivique'
  const mensaje = raw.message || raw.mensaje || raw.content || raw.body || ''
  const tipo = (raw.eventType || raw.tipo || raw.type || 'GENERAL').toLowerCase()
  const criticidad = (raw.criticality || raw.criticidad || raw.priority || 'MEDIUM').toUpperCase()
  const leida = typeof raw.isRead === 'boolean'
    ? raw.isRead
    : (typeof raw.read === 'boolean' ? raw.read : Boolean(raw.leida))
  
  let metadata = raw.metadata || {}
  if (typeof metadata === 'string') {
    try {
      metadata = JSON.parse(metadata)
    } catch {
      metadata = { raw: metadata }
    }
  }

  const fechaIso = raw.createdAt || raw.created_at || raw.fechaIso || raw.timestamp || new Date().toISOString()
  const leidaEn = raw.readAt || raw.read_at || null

  return {
    id,
    titulo,
    mensaje,
    tipo,
    criticidad,
    leida,
    metadata,
    fechaIso,
    leidaEn,
    expiracionMs: raw.expiracionMs || null,
  }
}

export const notificationService = {
  /**
   * Listar notificaciones del usuario autenticado.
   * @param {Object} [params] - Filtros opcionales { isRead?: boolean }
   * @returns {Promise<Array>} Lista de notificaciones normalizadas
   */
  async listNotifications(params = {}) {
    const queryParams = new URLSearchParams()
    if (typeof params.isRead === 'boolean') {
      queryParams.append('isRead', String(params.isRead))
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
    const { data } = await api.get(`/notifications${query}`)
    const lista = Array.isArray(data)
      ? data
      : (Array.isArray(data?.content) ? data.content : (Array.isArray(data?.notifications) ? data.notifications : []))
    const normalizadas = lista.map(normalizarNotificacion).filter(Boolean)

    const deduplicadas = []
    const clavesVistas = new Set()
    for (const notif of normalizadas) {
      const ref = notif.metadata?.reservationId || notif.metadata?.bookingCode || notif.referenceId || ''
      const clave = `${(notif.titulo || '').trim().toLowerCase()}|${(notif.mensaje || '').trim().toLowerCase()}|${ref}`
      if (!clavesVistas.has(clave)) {
        clavesVistas.add(clave)
        deduplicadas.push(notif)
      }
    }
    return deduplicadas
  },

  /**
   * Obtener contador de notificaciones no leídas.
   * @returns {Promise<number>} Cantidad de no leídas
   */
  async getUnreadCount() {
    const { data } = await api.get('/notifications/unread-count')
    if (data && typeof data.unreadCount === 'number') {
      return data.unreadCount
    }
    if (typeof data === 'number') {
      return data
    }
    return 0
  },

  /**
   * Obtener detalle completo de una notificación.
   * @param {string|number} id
   * @returns {Promise<Object>} Notificación detallada
   */
  async getNotificationDetail(id) {
    const { data } = await api.get(`/notifications/${id}`)
    return normalizarNotificacion(data) || data
  },

  /**
   * Marcar notificación específica como leída.
   * @param {string|number} id
   */
  async markAsRead(id) {
    const { data } = await api.patch(`/notifications/${id}/read`)
    return data
  },

  /**
   * Marcar todas las notificaciones del usuario como leídas.
   */
  async markAllAsRead() {
    const { data } = await api.patch('/notifications/read-all')
    return data
  },
}
