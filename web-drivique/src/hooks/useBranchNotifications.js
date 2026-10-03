import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
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
  createDeliveryNotifications(deliveries = [], t) {
    return deliveries.map((item, idx) => {
      const isDone = ['CONFIRMADA', 'COMPLETADA', 'ENTREGADA', 'completada'].includes(
        String(item.estado || '').toUpperCase()
      )
      const resCode = item.codigo || item.id || `RES-${8820 + idx}`
      return {
        id: `deliv-${resCode}`,
        type: 'delivery',
        category: 'operations',
        categoryLabel: t('notifications.scheduledDelivery', 'Entrega Programada'),
        icon: FaClipboardList,
        iconColor: '#2563eb',
        iconBg: '#eff6ff',
        accentBorder: '#2563eb',
        badgeBg: 'rgba(37, 99, 235, 0.1)',
        badgeColor: '#1d4ed8',
        codigo: resCode,
        text: `${t('notifications.delivery', 'Entrega')} #${resCode}: ${item.clienteNombre}`,
        detail: `${t('notifications.vehicle', 'Vehículo')} ${item.vehiculoNombre} (${t('notifications.plate', 'Placa')}: ${item.vehiculoPlaca || t('notifications.assigned', 'Asignada')}) ${t('notifications.scheduledFor', 'programado para las')} ${item.hora}.`,
        time: `${t('notifications.today', 'Hoy')} · ${item.hora}`,
        isRead: isDone,
        route: '/encargado/reservations',
        navigationState: {
          search: resCode,
          openCodigo: resCode,
          autoOpen: true,
        },
        actionLabel: t('notifications.manageDelivery', 'Gestionar entrega'),
      }
    })
  },

  createReturnNotifications(returns = [], t) {
    return returns.map((item, idx) => {
      const isDone = ['RECIBIDO', 'RECIBIDA', 'COMPLETADA', 'FINALIZADA'].includes(
        String(item.estado || '').toUpperCase()
      )
      const resCode = item.codigo || item.id || `RES-${8790 + idx}`
      return {
        id: `return-${resCode}`,
        type: 'return',
        category: 'operations',
        categoryLabel: t('notifications.fleetReturn', 'Devolución de Flota'),
        icon: FaUndo,
        iconColor: '#16a34a',
        iconBg: '#f0fdf4',
        accentBorder: '#16a34a',
        badgeBg: 'rgba(22, 163, 74, 0.1)',
        badgeColor: '#15803d',
        codigo: resCode,
        text: `${t('notifications.return', 'Devolución')} #${resCode}: ${item.clienteNombre}`,
        detail: `${t('notifications.receptionOf', 'Recepción de')} ${item.vehiculoNombre} (${t('notifications.plate', 'Placa')}: ${item.vehiculoPlaca || t('notifications.fleet', 'Flota')}) ${t('notifications.forInspection', 'para inspección en bahía.')}`,
        time: `${t('notifications.today', 'Hoy')} · ${item.hora}`,
        isRead: isDone,
        route: '/encargado/reservations',
        navigationState: {
          search: resCode,
          openCodigo: resCode,
          autoOpen: true,
        },
        actionLabel: t('notifications.receiveVehicle', 'Recibir vehículo'),
      }
    })
  },

  createAttentionAlerts(attentionNeeded = {}, t) {
    const alerts = []

    // 1. Validación de Documentos
    if (attentionNeeded.pendingDocuments > 0) {
      alerts.push({
        id: 'doc-verification-alert',
        type: 'pendingDocument',
        category: 'attention',
        categoryLabel: t('notifications.validationRequired', 'Validación Requerida'),
        icon: FaIdCard,
        iconColor: '#d97706',
        iconBg: '#fffbeb',
        accentBorder: '#d97706',
        badgeBg: 'rgba(217, 119, 6, 0.1)',
        badgeColor: '#b45309',
        text: `${attentionNeeded.pendingDocuments} ${t('notifications.docsToValidate', 'documento(s) por validar en sucursal')}`,
        detail: t('notifications.docsDetail', 'Cédulas de ciudadanía o licencias de conducción en espera de verificación para entrega.'),
        time: t('notifications.priority', 'Prioritario'),
        isRead: false,
        route: '/encargado/documents',
        actionLabel: t('notifications.validateDocs', 'Validar documentos'),
      })
    }

    // 2. Incidencias Abiertas
    if (attentionNeeded.openIncidents > 0) {
      alerts.push({
        id: 'open-incident-alert',
        type: 'openIncident',
        category: 'attention',
        categoryLabel: t('notifications.operativeIncident', 'Incidencia Operativa'),
        icon: FaExclamationTriangle,
        iconColor: '#dc2626',
        iconBg: '#fef2f2',
        accentBorder: '#dc2626',
        badgeBg: 'rgba(220, 38, 38, 0.1)',
        badgeColor: '#b91c1c',
        text: `${attentionNeeded.openIncidents} ${t('notifications.incidentsActive', 'reporte(s) de incidencia o daños activos')}`,
        detail: t('notifications.incidentsDetail', 'Registro de novedad mecánica o inspección pendiente de trámite con taller/aseguradora.'),
        time: t('notifications.urgent', 'Urgente'),
        isRead: false,
        route: '/encargado/incidents',
        actionLabel: t('notifications.viewIncidents', 'Ver incidencias'),
      })
    }

    // 3. Cobros Pendientes en Mostrador
    if (attentionNeeded.pendingPayments > 0) {
      alerts.push({
        id: 'pending-payment-alert',
        type: 'paymentReceived',
        category: 'operations',
        categoryLabel: t('notifications.deskCharge', 'Cobro en Mostrador'),
        icon: FaCashRegister,
        iconColor: '#2563eb',
        iconBg: '#eff6ff',
        accentBorder: '#2563eb',
        badgeBg: 'rgba(37, 99, 235, 0.1)',
        badgeColor: '#1d4ed8',
        text: `${attentionNeeded.pendingPayments} ${t('notifications.chargesPending', 'cobro(s) de garantía/reserva en taquilla')}`,
        detail: t('notifications.chargesDetail', 'Pendiente recepción y asentamiento de pago presencial en mostrador.'),
        time: t('notifications.today', 'Hoy'),
        isRead: false,
        route: '/encargado/cobro-sucursal',
        actionLabel: t('notifications.goToCharges', 'Ir a cobros'),
      })
    }

    // 4. Vencimiento de SOAT / Flota
    if (attentionNeeded.expiringVehicleDocs > 0) {
      alerts.push({
        id: 'fleet-expiring-alert',
        type: 'expiringDocument',
        category: 'attention',
        categoryLabel: t('notifications.fleetAlert', 'Alerta de Flota'),
        icon: FaCar,
        iconColor: '#d97706',
        iconBg: '#fffbeb',
        accentBorder: '#d97706',
        badgeBg: 'rgba(217, 119, 6, 0.1)',
        badgeColor: '#b45309',
        text: t('notifications.docsExpiring', 'Documentación vehicular próxima a vencer'),
        detail: t('notifications.docsExpiringDetail', 'SOAT o póliza de vehículo en flota próximo a fecha de corte (5 días).'),
        time: t('notifications.preventive', 'Preventivo'),
        isRead: true,
        route: '/encargado/vehicles',
        actionLabel: t('notifications.viewFleet', 'Ver flota'),
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
  const { t, i18n } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all') // 'all' | 'unread' | 'operations' | 'attention'

  // Sincronización reactiva con datos operativos reales
  useEffect(() => {
    if (!dashboardData) return

    const deliveries = NotificationFactory.createDeliveryNotifications(
      dashboardData.todayDeliveriesList || [],
      t
    )
    const returns = NotificationFactory.createReturnNotifications(
      dashboardData.todayReturnsList || [],
      t
    )
    const alerts = NotificationFactory.createAttentionAlerts(
      dashboardData.attentionNeeded || {},
      t
    )

    const rawNotifs = [...deliveries, ...returns, ...alerts]

    setNotifications((prev) => {
      const readStateMap = new Map(prev.map((n) => [n.id, n.isRead]))
      return rawNotifs.map((item) => ({
        ...item,
        isRead: readStateMap.has(item.id) ? readStateMap.get(item.id) : item.isRead,
      }))
    })
  }, [dashboardData, t, i18n.language])

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
