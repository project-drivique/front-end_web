import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  NOTIFICACIONES_GENERALES_INITIAL,
  PROMOS_VEHICULOS_INITIAL,
} from '../data/notifications.dummy'
import { useAuthStore } from '../../../store/authStore'
import { promotionManagementService } from '../../../services/promotionManagementService'

const STORAGE_KEY_NOTIFS = 'drivique_user_notifications'
const STORAGE_KEY_CUPONES = 'drivique_user_cupones'
const SESSION_TIME = Date.now()

function esNotificacionValida(n) {
  if (!n || typeof n !== 'object') return false
  const tieneTitulo = Boolean(n.titulo || n.tituloKey || n.tituloFallback || n.title)
  const tieneMensaje = Boolean(n.mensaje || n.mensajeKey || n.mensajeFallback || n.message)
  return tieneTitulo || tieneMensaje
}

function leerStorage(key, inicial) {
  if (typeof window === 'undefined') return inicial
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return inicial
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return inicial
    if (key === STORAGE_KEY_NOTIFS) {
      const filtradas = parsed.filter(esNotificacionValida)
      return filtradas.length > 0 ? filtradas : inicial
    }
    return parsed
  } catch {
    return inicial
  }
}

function guardarStorage(key, data) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    return
  }
}

export function useNotificationStore() {
  const usuario = useAuthStore((state) => state.usuario)
  const [notificaciones, setNotificaciones] = useState(() =>
    leerStorage(STORAGE_KEY_NOTIFS, NOTIFICACIONES_GENERALES_INITIAL)
  )
  const [cupones, setCupones] = useState(() => promotionManagementService.listPublished(usuario))
  const [promosVehiculos] = useState(PROMOS_VEHICULOS_INITIAL)

  // Guarda en localStorage cuando cambie
  useEffect(() => {
    guardarStorage(STORAGE_KEY_NOTIFS, notificaciones)
  }, [notificaciones])

  useEffect(() => {
    guardarStorage(STORAGE_KEY_CUPONES, cupones)
  }, [cupones])

  useEffect(() => {
    const refresh = () => setCupones(promotionManagementService.listPublished(usuario))
    window.addEventListener(promotionManagementService.eventName, refresh)
    return () => window.removeEventListener(promotionManagementService.eventName, refresh)
  }, [usuario])

  // Filtrado en tiempo real de notificaciones generales no expiradas y válidas
  const notificacionesVigentes = useMemo(() => {
    const ahora = SESSION_TIME
    return notificaciones.filter((n) => {
      if (!esNotificacionValida(n)) return false
      if (!n.expiracionMs) return true
      return n.expiracionMs > ahora
    })
  }, [notificaciones])

  // Cupones vigentes (no expirados)
  const cuponesVigentes = useMemo(() => {
    const ahora = SESSION_TIME
    return cupones.filter((c) => {
      if (!c.expiracionMs) return true
      return c.expiracionMs > ahora
    })
  }, [cupones])

  // Promos de vehículos vigentes
  const promosVigentes = useMemo(() => {
    const ahora = SESSION_TIME
    return promosVehiculos.filter((p) => {
      if (!p.expiracionMs) return true
      return p.expiracionMs > ahora
    })
  }, [promosVehiculos])

  // Conteo de no leídas en tiempo real
  const conteoNoLeidas = useMemo(() => {
    const noLeidasGenerales = notificacionesVigentes.filter((n) => !n.leida).length
    return noLeidasGenerales
  }, [notificacionesVigentes])

  // Marcar una como leída
  const marcarLeida = useCallback((id) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    )
  }, [])

  // Marcar todas las generales como leídas
  const marcarTodasLeidas = useCallback(() => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
  }, [])

  // Aplicar cupón
  const aplicarCupon = useCallback((codigo) => {
    setCupones((prev) =>
      prev.map((c) => (c.codigo === codigo ? { ...c, aplicado: true } : c))
    )
  }, [])

  return {
    notificaciones: notificacionesVigentes,
    cupones: cuponesVigentes,
    promosVehiculos: promosVigentes,
    conteoNoLeidas,
    marcarLeida,
    marcarTodasLeidas,
    aplicarCupon,
  }
}
