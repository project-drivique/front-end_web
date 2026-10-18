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
// Estados en los que ya no hay nada que gestionar: no se avisa de entregas/devoluciones ya resueltas
const ENTREGA_LISTA = new Set(['CONFIRMADA', 'CONFIRMED'])
// Sólo se espera recibir un vehículo que ya salió (reserva en curso); una reserva pendiente o sin entregar no tiene devolución por recibir
const DEVOLUCION_PENDIENTE = new Set(['EN_CURSO', 'ACTIVE', 'IN_PROGRESS'])

const NotificationFactory = {
  createDeliveryNotifications(deliveries = [], t) {
    return deliveries.filter((item) => {
      const estado = String(item.estado || '').toUpperCase()
      // Sólo hay entrega por gestionar cuando la reserva está confirmada (pagada y firmada); pendientes de pago/firma/horario no
      return estado.includes('DOCUMENT') || estado.includes('SCHEDULE') || ENTREGA_LISTA.has(estado)
    }).map((item, idx) => {
      const isDocReview = String(item.estado || '').toUpperCase().includes('DOCUMENT')
      const isPendingSchedule = String(item.estado || '').toUpperCase().includes('SCHEDULE')
      const isDone = ['CONFIRMADA', 'COMPLETADA', 'ENTREGADA', 'completada'].includes(
        String(item.estado || '').toUpperCase()
      )
      const resCode = item.codigo || item.id || `RES-${8820 + idx}`

      if (isDocReview || isPendingSchedule) {
        return {
          id: `deliv-${resCode}`,
          type: 'pendingDocument',
          category: 'attention',
          categoryLabel: isDocReview ? t('notifications.docReview', 'Revisión de Documentos') : t('notifications.pendingSchedule', 'Reserva Registrada'),
          icon: FaIdCard,
          iconColor: '#d97706',
          iconBg: '#fffbeb',
          accentBorder: '#d97706',
          badgeBg: 'rgba(217, 119, 6, 0.1)',
          badgeColor: '#b45309',
          codigo: resCode,
          text: t('hc3.notif_new_reservation', { defaultValue: 'Nueva Reserva #{{codigo}}: {{cliente}}', codigo: resCode, cliente: item.clienteNombre }),
          detail: t('hc5.notif_vehicle_detail', { defaultValue: 'Vehículo {{vehiculo}} ({{etiqueta}}: {{placa}}). Requiere validación de documentos por el encargado.', vehiculo: item.vehiculoNombre, etiqueta: t('notifications.plate', 'Placa'), placa: item.vehiculoPlaca || t('hc5.assigned_f', 'Asignada') }),
          time: `${t('notifications.today', 'Hoy')} · ${item.hora || 'Prioritario'}`,
          isRead: false,
          route: '/encargado/documents',
          navigationState: {
            search: resCode,
            openCodigo: resCode,
            autoOpen: true,
          },
          actionLabel: t('notifications.validateDocs', 'Validar documentos'),
        }
      }

      return {
        id: `deliv-${resCode}`,
        type: 'delivery',
        category: 'operations',
        categoryLabel: t('notifications.scheduledDelivery', 'Entrega Programada'),
        icon: FaClipboardList,
        iconColor: 'var(--brand-primary)',
        iconBg: 'var(--brand-soft)',
        accentBorder: 'var(--brand-primary)',
        badgeBg: 'rgba(var(--brand-primary-rgb), 0.1)',
        badgeColor: 'var(--brand-primary-hover)',
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
          tab: 'datos_pago',
        },
        actionLabel: t('notifications.manageDelivery', 'Gestionar entrega'),
      }
    })
  },

  createReturnNotifications(returns = [], t) {
    return returns.filter((item) => DEVOLUCION_PENDIENTE.has(String(item.estado || '').toUpperCase())).map((item, idx) => {
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
          tab: 'datos_pago',
        },
        actionLabel: t('notifications.receiveVehicle', 'Recibir vehículo'),
      }
    })
  },

  createAttentionAlerts(attentionNeeded = {}, t) {
    const alerts = []

    // 1. Expedientes individuales de documentos si existen
    if (Array.isArray(attentionNeeded.pendingDocsList) && attentionNeeded.pendingDocsList.length > 0) {
      attentionNeeded.pendingDocsList.forEach((docItem) => {
        const code = docItem.reservaCodigo || docItem.id
        alerts.push({
          id: `doc-alert-${code}-${docItem.id}`,
          type: 'pendingDocument',
          category: 'attention',
          categoryLabel: t('notifications.validationRequired', 'Validación Requerida'),
          icon: FaIdCard,
          iconColor: '#d97706',
          iconBg: '#fffbeb',
          accentBorder: '#d97706',
          badgeBg: 'rgba(217, 119, 6, 0.1)',
          badgeColor: '#b45309',
          codigo: code,
          text: `Validar Documentos: ${docItem.clienteNombre} (${code})`,
          detail: t('hc3.notif_docs_waiting', { defaultValue: 'Vehículo: {{vehiculo}}. Cédula y Licencia en espera de verificación para entrega.', vehiculo: docItem.vehiculoNombre }),
          time: t('notifications.priority', 'Prioritario'),
          isRead: false,
          route: '/encargado/documents',
          navigationState: {
            search: code,
          },
          actionLabel: t('notifications.validateDocs', 'Validar documentos'),
        })
      })
    } else if (attentionNeeded.pendingDocuments > 0) {
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

    // 1b. Reservas pendientes (registradas fuera de horario, sin pago o sin revisión): aviso para el encargado
    if (Array.isArray(attentionNeeded.pendingReservationsList)) {
      attentionNeeded.pendingReservationsList.forEach((r) => {
        alerts.push({
          id: `pending-res-${r.id}`,
          type: 'pendingDocument',
          category: 'attention',
          categoryLabel: t('hc6.pending_reservation', 'Reserva pendiente'),
          icon: FaClipboardList,
          iconColor: '#d97706',
          iconBg: '#fffbeb',
          accentBorder: '#d97706',
          badgeBg: 'rgba(217, 119, 6, 0.1)',
          badgeColor: '#b45309',
          codigo: r.codigo,
          text: t('hc3.notif_new_reservation', { defaultValue: 'Nueva Reserva #{{codigo}}: {{cliente}}', codigo: r.codigo, cliente: r.clienteNombre }),
          detail: `${r.vehiculoNombre || ''}${r.vehiculoPlaca ? ` (${r.vehiculoPlaca})` : ''} · ${r.fecha || ''} ${r.hora || ''}`.trim(),
          time: t('hc6.pending_reservation', 'Reserva pendiente'),
          isRead: false,
          route: '/encargado/reservations',
          navigationState: { search: r.codigo, openCodigo: r.codigo, autoOpen: true },
          actionLabel: t('hc6.view_reservation', 'Ver reserva'),
        })
      })
    }

    // 1c. Entregas/devoluciones a domicilio sin conductor asignado
    if (Array.isArray(attentionNeeded.pendingHomeDeliveries)) {
      attentionNeeded.pendingHomeDeliveries.forEach((d) => {
        const esDevolucion = d.tipo === 'RETURN'
        alerts.push({
          id: `home-${d.id}`,
          type: 'pendingDocument',
          category: 'attention',
          categoryLabel: esDevolucion ? t('hc6.home_return', 'Devolución a domicilio') : t('hc6.home_delivery', 'Entrega a domicilio'),
          icon: FaCar,
          iconColor: '#d97706',
          iconBg: '#fffbeb',
          accentBorder: '#d97706',
          badgeBg: 'rgba(217, 119, 6, 0.1)',
          badgeColor: '#b45309',
          codigo: d.codigo,
          text: `${esDevolucion ? t('hc6.home_return', 'Devolución a domicilio') : t('hc6.home_delivery', 'Entrega a domicilio')} #${d.codigo}: ${d.clienteNombre}`,
          detail: `${[d.direccion, d.barrio, d.ciudad].filter(Boolean).join(', ')} · ${d.fecha || ''} ${d.hora || ''}`.trim(),
          time: t('hc6.assign_driver', 'Asignar conductor'),
          isRead: false,
          route: '/encargado/deliveries',
          navigationState: { search: d.codigo },
          actionLabel: t('hc6.assign_driver', 'Asignar conductor'),
        })
      })
    }

    // 2. Incidencias Abiertas: una notificación por cada incidencia (datos reales del servidor)
    if (Array.isArray(attentionNeeded.openIncidentsList) && attentionNeeded.openIncidentsList.length > 0) {
      attentionNeeded.openIncidentsList.forEach((inc) => {
        const urgente = inc.prioridad === 'urgente' || inc.prioridad === 'alta'
        const fecha = inc.fechaIso ? new Date(inc.fechaIso) : null
        const hora = fecha && !Number.isNaN(fecha.getTime())
          ? fecha.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
          : t('notifications.urgent', 'Urgente')
        alerts.push({
          id: `incident-${inc.id}`,
          type: 'openIncident',
          category: 'attention',
          categoryLabel: t('notifications.operativeIncident', 'Incidencia Operativa'),
          icon: FaExclamationTriangle,
          iconColor: '#dc2626',
          iconBg: '#fef2f2',
          accentBorder: '#dc2626',
          badgeBg: 'rgba(220, 38, 38, 0.1)',
          badgeColor: '#b91c1c',
          codigo: inc.codigo,
          text: `${t('notifications.newIncident', 'Nueva incidencia')} ${inc.codigo}${urgente ? ` (${t('notifications.urgent', 'Urgente')})` : ''}`,
          detail: [inc.tipo || inc.titulo, [inc.vehiculo, inc.placa].filter(Boolean).join(' · '), inc.reservaCodigo ? `${t('notifications.reservation', 'Reserva')} ${inc.reservaCodigo}` : ''].filter(Boolean).join(' — '),
          time: hora,
          isRead: false,
          route: '/encargado/incidents',
          navigationState: { search: inc.codigo },
          actionLabel: t('notifications.viewIncidents', 'Ver incidencias'),
        })
      })
    } else if (attentionNeeded.openIncidents > 0) {
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

    // 2b. Incidencias atendidas en los últimos 3 días: se conservan como aviso informativo (ya leído)
    if (Array.isArray(attentionNeeded.recentClosedIncidents)) {
      attentionNeeded.recentClosedIncidents.forEach((inc) => {
        alerts.push({
          id: `incident-closed-${inc.id}`,
          type: 'closedIncident',
          category: 'attention',
          categoryLabel: t('notifications.operativeIncident', 'Incidencia Operativa'),
          icon: FaExclamationTriangle,
          iconColor: '#16a34a',
          iconBg: '#f0fdf4',
          accentBorder: '#16a34a',
          badgeBg: 'rgba(22, 163, 74, 0.1)',
          badgeColor: '#15803d',
          codigo: inc.codigo,
          text: `${t('hc6.incident_resolved', 'Incidencia atendida')} ${inc.codigo}`,
          detail: [inc.tipo || inc.titulo, [inc.vehiculo, inc.placa].filter(Boolean).join(' · '), inc.reservaCodigo ? `${t('notifications.reservation', 'Reserva')} ${inc.reservaCodigo}` : ''].filter(Boolean).join(' — '),
          time: inc.fechaIso ? new Date(inc.fechaIso).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '',
          isRead: true,
          route: '/encargado/incidents',
          navigationState: { search: inc.codigo },
          actionLabel: t('notifications.viewIncidents', 'Ver incidencias'),
        })
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
        iconColor: 'var(--brand-primary)',
        iconBg: 'var(--brand-soft)',
        accentBorder: 'var(--brand-primary)',
        badgeBg: 'rgba(var(--brand-primary-rgb), 0.1)',
        badgeColor: 'var(--brand-primary-hover)',
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
  const claveLeidas = `drivique:notif-leidas:${user?.correo || user?.email || 'anon'}`
  const leerLeidas = () => { try { return new Set(JSON.parse(localStorage.getItem(claveLeidas) || '[]')) } catch { return new Set() } }
  const guardarLeidas = (ids) => { try { localStorage.setItem(claveLeidas, JSON.stringify([...ids].slice(-300))) } catch { /* sin almacenamiento */ } }
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

    // Las incidencias abiertas van primero: son lo más urgente
    const incidents = alerts.filter((a) => a.type === 'openIncident')
    const rawNotifs = [...incidents, ...deliveries, ...returns, ...alerts.filter((a) => a.type !== 'openIncident')]

    setNotifications((prev) => {
      const readStateMap = new Map(prev.map((n) => [n.id, n.isRead]))
      const leidas = leerLeidas()
      return rawNotifs.map((item) => ({
        ...item,
        isRead: item.isRead || leidas.has(item.id) || (readStateMap.has(item.id) ? readStateMap.get(item.id) : false),
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
    const l = leerLeidas(); l.add(notifId); guardarLeidas(l)
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const l = leerLeidas(); prev.forEach((n) => l.add(n.id)); guardarLeidas(l)
      return prev.map((n) => ({ ...n, isRead: true }))
    })
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
