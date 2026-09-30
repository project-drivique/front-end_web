import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  FaClipboardList,
  FaUndo,
  FaIdCard,
  FaExclamationTriangle,
  FaCashRegister,
  FaCar,
} from 'react-icons/fa'

/**
 * Patrón Strategy / Factory: Generadores de notificaciones desacoplados por dominio operativo.
 */
const NotificationFactory = {
  createDeliveryNotifications(deliveries = []) {
    return deliveries.map((item, idx) => {
      const isDone = ['CONFIRMADA', 'COMPLETADA', 'ENTREGADA', 'completada'].includes(
        String(item.estado || '').toUpperCase()
      )
      const resCode = item.codigo || item.id || `RES-${8820 + idx}`
      return {
        id: `deliv-${resCode}`,
        type: 'delivery',
        category: 'operations',
        categoryLabel: 'Entrega Programada',
        icon: FaClipboardList,
        iconColor: '#2563eb',
        iconBg: '#eff6ff',
        accentBorder: '#2563eb',
        badgeBg: 'rgba(37, 99, 235, 0.1)',
        badgeColor: '#1d4ed8',
        codigo: resCode,
        text: `Entrega #${resCode}: ${item.clienteNombre}`,
        detail: `Vehículo ${item.vehiculoNombre} (Placa: ${item.vehiculoPlaca || 'Asignada'}) programado para las ${item.hora}.`,
        time: `Hoy · ${item.hora}`,
        isRead: isDone,
        route: '/encargado/reservations',
        navigationState: {
          search: resCode,
          openCodigo: resCode,
          autoOpen: true,
        },
        actionLabel: 'Gestionar entrega',
      }
    })
  },

  createReturnNotifications(returns = []) {
    return returns.map((item, idx) => {
      const isDone = ['RECIBIDO', 'RECIBIDA', 'COMPLETADA', 'FINALIZADA'].includes(
        String(item.estado || '').toUpperCase()
      )
      const resCode = item.codigo || item.id || `RES-${8790 + idx}`
      return {
        id: `return-${resCode}`,
        type: 'return',
        category: 'operations',
        categoryLabel: 'Devolución de Flota',
        icon: FaUndo,
        iconColor: '#16a34a',
        iconBg: '#f0fdf4',
        accentBorder: '#16a34a',
        badgeBg: 'rgba(22, 163, 74, 0.1)',
        badgeColor: '#15803d',
        codigo: resCode,
        text: `Devolución #${resCode}: ${item.clienteNombre}`,
        detail: `Recepción de ${item.vehiculoNombre} (Placa: ${item.vehiculoPlaca || 'Flota'}) para inspección en bahía.`,
        time: `Hoy · ${item.hora}`,
        isRead: isDone,
        route: '/encargado/reservations',
        navigationState: {
          search: resCode,
          openCodigo: resCode,
          autoOpen: true,
        },
        actionLabel: 'Recibir vehículo',
      }
    })
  },

  createAttentionAlerts(attentionNeeded = {}) {
    const alerts = []

    // 1. Validación de Documentos
    if (attentionNeeded.pendingDocuments > 0) {
      alerts.push({
        id: 'doc-verification-alert',
        type: 'pendingDocument',
        category: 'attention',
        categoryLabel: 'Validación Requerida',
        icon: FaIdCard,
        iconColor: '#d97706',
        iconBg: '#fffbeb',
        accentBorder: '#d97706',
        badgeBg: 'rgba(217, 119, 6, 0.1)',
        badgeColor: '#b45309',
        text: `${attentionNeeded.pendingDocuments} documento(s) por validar en sucursal`,
        detail: 'Cédulas de ciudadanía o licencias de conducción en espera de verificación para entrega.',
        time: 'Prioritario',
        isRead: false,
        route: '/encargado/documents',
        actionLabel: 'Validar documentos',
      })
    }

    // 2. Incidencias Abiertas
    if (attentionNeeded.openIncidents > 0) {
      alerts.push({
        id: 'open-incident-alert',
        type: 'openIncident',
        category: 'attention',
        categoryLabel: 'Incidencia Operativa',
        icon: FaExclamationTriangle,
        iconColor: '#dc2626',
        iconBg: '#fef2f2',
        accentBorder: '#dc2626',
        badgeBg: 'rgba(220, 38, 38, 0.1)',
        badgeColor: '#b91c1c',
        text: `${attentionNeeded.openIncidents} reporte(s) de incidencia o daños activos`,
        detail: 'Registro de novedad mecánica o inspección pendiente de trámite con taller/aseguradora.',
        time: 'Urgente',
        isRead: false,
        route: '/encargado/incidents',
        actionLabel: 'Ver incidencias',
      })
    }

    // 3. Cobros Pendientes en Mostrador
    if (attentionNeeded.pendingPayments > 0) {
      alerts.push({
        id: 'pending-payment-alert',
        type: 'paymentReceived',
        category: 'operations',
        categoryLabel: 'Cobro en Mostrador',
        icon: FaCashRegister,
        iconColor: '#2563eb',
        iconBg: '#eff6ff',
        accentBorder: '#2563eb',
        badgeBg: 'rgba(37, 99, 235, 0.1)',
        badgeColor: '#1d4ed8',
        text: `${attentionNeeded.pendingPayments} cobro(s) de garantía/reserva en taquilla`,
        detail: 'Pendiente recepción y asentamiento de pago presencial en mostrador.',
        time: 'Hoy',
        isRead: false,
        route: '/encargado/cobro-sucursal',
        actionLabel: 'Ir a cobros',
      })
    }

    // 4. Vencimiento de SOAT / Flota
    if (attentionNeeded.expiringVehicleDocs > 0) {
      alerts.push({
        id: 'fleet-expiring-alert',
        type: 'expiringDocument',
        category: 'attention',
        categoryLabel: 'Alerta de Flota',
        icon: FaCar,
        iconColor: '#d97706',
        iconBg: '#fffbeb',
        accentBorder: '#d97706',
        badgeBg: 'rgba(217, 119, 6, 0.1)',
        badgeColor: '#b45309',
        text: 'Documentación vehicular próxima a vencer',
        detail: 'SOAT o póliza de vehículo en flota próximo a fecha de corte (5 días).',
        time: 'Preventivo',
        isRead: true,
        route: '/encargado/vehicles',
        actionLabel: 'Ver flota',
      })
    }

    return alerts
  },
}

/**
 * Custom Hook: useBranchNotifications
 * Patrón State & Controller: Encapsula el estado, cálculo reactivo, filtrado y acciones sobre las notificaciones.
 */
export function useBranchNotifications(user, dashboardData) {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all') // 'all' | 'unread' | 'operations' | 'attention'

  // Sincronización reactiva con datos operativos reales
  useEffect(() => {
    if (!dashboardData) return

    const deliveries = NotificationFactory.createDeliveryNotifications(
      dashboardData.todayDeliveriesList || []
    )
    const returns = NotificationFactory.createReturnNotifications(
      dashboardData.todayReturnsList || []
    )
    const alerts = NotificationFactory.createAttentionAlerts(
      dashboardData.attentionNeeded || {}
    )

    const rawNotifs = [...deliveries, ...returns, ...alerts]

    setNotifications((prev) => {
      const readStateMap = new Map(prev.map((n) => [n.id, n.isRead]))
      return rawNotifs.map((item) => ({
        ...item,
        isRead: readStateMap.has(item.id) ? readStateMap.get(item.id) : item.isRead,
      }))
    })
  }, [dashboardData])

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.isRead)
    }
    if (filter === 'operations') {
      return notifications.filter((n) => n.category === 'operations')
    }
    if (filter === 'attention') {
      return notifications.filter((n) => n.category === 'attention')
    }
    return notifications
  }, [notifications, filter])

  const markAsRead = useCallback((notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }, [])

  return {
    notifications,
    unreadCount,
    filter,
    setFilter,
    filteredNotifications,
    markAsRead,
    markAllAsRead,
  }
}
