import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { reservationsService } from '../../../services/reservationsService'
import { catalogService } from '../../../services/catalogService'

const estadoReserva = (r) => {
  if (r.estado) {
    const est = r.estado.toLowerCase()
    if (est.includes('cancel')) return 'cancelada'
    if (est.includes('completa')) return 'completada'
    if (est.includes('pendiente') || est.includes('validacion')) return 'pendiente'
    if (est.includes('activ')) return 'activa'
    return est
  }
  const hoy = new Date().toISOString().split('T')[0]
  const inicio = r.fechaInicio || r.reservaDetalles?.fechaInicio
  const fin = r.fechaFin || r.reservaDetalles?.fechaFin
  if (fin < hoy) return 'completada'
  if (inicio <= hoy && hoy <= fin) return 'activa'
  return 'pendiente'
}

export function useHistorialReservas() {
  const { t } = useTranslation()
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargarReservas = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await reservationsService.getReservas()
      const conVehiculo = await Promise.all(
        data.map(async (r) => {
          const vehiculo = await catalogService.getVehiculoById(r.vehiculoId).catch(() => null)
          const fechaInicio = r.fechaInicio || r.reservaDetalles?.fechaInicio
          const fechaFin = r.fechaFin || r.reservaDetalles?.fechaFin
          return {
            ...r,
            fechaInicio,
            fechaFin,
            vehiculo,
            estadoRaw: r.estado || null,
            estado: estadoReserva(r)
          }
        })
      )
      setReservas(conVehiculo)
    } catch {
      setError(t('reservas.error'))
    } finally {
      setCargando(false)
    }
  }, [t])

  useEffect(() => {
    cargarReservas()
  }, [cargarReservas])

  const cancelarReserva = async (id) => {
    await reservationsService.cancelarReserva(id)
    setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: 'cancelada' } : r))
  }

  return { reservas, cargando, error, recargar: cargarReservas, cancelarReserva }
}
