import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  NOTIFICACIONES_GENERALES_INITIAL,
  CUPONES_INITIAL,
  PROMOS_VEHICULOS_INITIAL,
} from '../data/notifications.dummy'

const STORAGE_KEY_NOTIFS = 'drivique_user_notifications'
const STORAGE_KEY_CUPONES = 'drivique_user_cupones'

function leerStorage(key, inicial) {
  if (typeof window === 'undefined') return inicial
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return inicial
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : inicial
  } catch {
    return inicial
  }
}

function guardarStorage(key, data) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {}
}

export function useNotificationStore() {
  const [notificaciones, setNotificaciones] = useState(() =>
    leerStorage(STORAGE_KEY_NOTIFS, NOTIFICACIONES_GENERALES_INITIAL)
  )
  const [cupones, setCupones] = useState(() =>
    leerStorage(STORAGE_KEY_CUPONES, CUPONES_INITIAL)
  )
  const [promosVehiculos] = useState(PROMOS_VEHICULOS_INITIAL)

  // Guarda en localStorage cuando cambie
  useEffect(() => {
    guardarStorage(STORAGE_KEY_NOTIFS, notificaciones)
  }, [notificaciones])

  useEffect(() => {
    guardarStorage(STORAGE_KEY_CUPONES, cupones)
  }, [cupones])

  // Filtrado en tiempo real de notificaciones generales no expiradas
  const notificacionesVigentes = useMemo(() => {
    const ahora = Date.now()
    return notificaciones.filter((n) => {
      if (!n.expiracionMs) return true
      return n.expiracionMs > ahora
    })
  }, [notificaciones])

  // Cupones vigentes (no expirados)
  const cuponesVigentes = useMemo(() => {
    const ahora = Date.now()
    return cupones.filter((c) => {
      if (!c.expiracionMs) return true
      return c.expiracionMs > ahora
    })
  }, [cupones])

  // Promos de vehículos vigentes
  const promosVigentes = useMemo(() => {
    const ahora = Date.now()
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
