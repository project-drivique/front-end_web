import { create } from 'zustand'
import { notificationService } from '../../../services/notificationService'
import { useAuthStore } from '../../../store/authStore'
import { promotionManagementService } from '../../../services/promotionManagementService'

let publicacionSolicitada = false

export const useNotificationStore = create((set, get) => ({
  notificaciones: [],
  conteoNoLeidas: 0,
  cargando: false,
  error: null,
  filtroLectura: 'todas', // 'todas' | 'no_leidas' | 'leidas'
  cupones: [],
  promosVehiculos: [],

  setFiltroLectura: (filtro) => set({ filtroLectura: filtro }),

  /**
   * Carga la lista completa de notificaciones reales del backend.
   */
  cargarNotificaciones: async (silent = false) => {
    const token = useAuthStore.getState().token
    if (!token) {
      set({ notificaciones: [], conteoNoLeidas: 0, cargando: false })
      return
    }

    if (!silent) set({ cargando: true, error: null })
    try {
      const [lista, unreadCount] = await Promise.all([
        notificationService.listNotifications(),
        notificationService.getUnreadCount().catch(() => null),
      ])

      const noLeidasCalculadas = lista.filter((n) => !n.leida).length
      const conteoFinal = typeof unreadCount === 'number'
        ? (unreadCount === 0 || noLeidasCalculadas === 0 ? 0 : Math.min(unreadCount, noLeidasCalculadas))
        : noLeidasCalculadas

      set({
        notificaciones: lista,
        conteoNoLeidas: conteoFinal,
        cargando: false,
        error: null,
      })
    } catch (err) {
      console.warn('Error cargando notificaciones del backend:', err)
      set({
        cargando: false,
        error: err?.response?.data?.detail || err?.response?.data?.message || 'Error al sincronizar notificaciones',
      })
    }
  },

  /**
   * Consulta únicamente el contador de no leídas para optimizar llamadas.
   */
  cargarConteoNoLeidas: async () => {
    const token = useAuthStore.getState().token
    if (!token) {
      set({ conteoNoLeidas: 0 })
      return
    }

    try {
      const count = await notificationService.getUnreadCount()
      set({ conteoNoLeidas: typeof count === 'number' ? count : 0 })
    } catch (err) {
      // Si falla endpoint específico, mantener o calcular sobre las que ya estén
      const fallbackCount = get().notificaciones.filter((n) => !n.leida).length
      set({ conteoNoLeidas: fallbackCount })
    }
  },

  /**
   * Marca una notificación como leída en backend y actualiza el estado local de inmediato.
   */
  marcarLeida: async (id) => {
    const notificacionesActuales = get().notificaciones
    const target = notificacionesActuales.find((n) => n.id === id)
    if (!target || target.leida) return

    // Optimista local
    const actualizadas = notificacionesActuales.map((n) =>
      n.id === id ? { ...n, leida: true, leidaEn: new Date().toISOString() } : n
    )
    const nuevoConteo = Math.max(0, actualizadas.filter((n) => !n.leida).length)
    set({ notificaciones: actualizadas, conteoNoLeidas: nuevoConteo })

    try {
      await notificationService.markAsRead(id)
    } catch (err) {
      console.error('Error al marcar notificación como leída en backend:', err)
      // Opcional: revertir si es error crítico
    }
  },

  /**
   * Marca todas las notificaciones como leídas en backend.
   */
  marcarTodasLeidas: async () => {
    const notificacionesActuales = get().notificaciones
    const actualizadas = notificacionesActuales.map((n) => ({
      ...n,
      leida: true,
      leidaEn: n.leidaEn || new Date().toISOString(),
    }))
    set({ notificaciones: actualizadas, conteoNoLeidas: 0 })

    try {
      await notificationService.markAllAsRead()
    } catch (err) {
      console.error('Error al marcar todas las notificaciones como leídas en backend:', err)
    }
  },

  /**
   * Carga promociones y cupones vigentes (sin datos dummy).
   */
  refrescarPromociones: () => {
    const usuario = useAuthStore.getState().usuario
    // El evento de publicación vuelve a llamar a esta función cuando llegan los datos del servidor
    if (!publicacionSolicitada) {
      publicacionSolicitada = true
      promotionManagementService.refresh().catch(() => {}).finally(() => { publicacionSolicitada = false })
    }
    try {
      const cupones = promotionManagementService.listPublishedCoupons(usuario) || []
      const promos = promotionManagementService.listFeaturedVehiclePromotions(usuario) || []
      set({ cupones, promosVehiculos: promos })
    } catch {
      set({ cupones: [], promosVehiculos: [] })
    }
  },

  /**
   * Aplicar cupón promocional.
   */
  aplicarCupon: (codigo) => {
    set((state) => ({
      cupones: state.cupones.map((c) =>
        c.codigo === codigo ? { ...c, aplicado: true } : c
      ),
    }))
  },
}))

// Auto-inicializar escucha de eventos de promociones
if (typeof window !== 'undefined') {
  window.addEventListener(promotionManagementService.eventName, () => {
    useNotificationStore.getState().refrescarPromociones()
  })
}
