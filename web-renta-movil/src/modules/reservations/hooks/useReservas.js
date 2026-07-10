import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { reservasService } from '../../../services/reservasService'
import { catalogoService } from '../../../services/catalogoService'

const estadoReserva = (fechaInicio, fechaFin) => {
  const hoy = new Date().toISOString().split('T')[0]
  if (fechaFin < hoy) return 'completada'
  if (fechaInicio <= hoy && hoy <= fechaFin) return 'activa'
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
      const data = await reservasService.getReservas()
      const conVehiculo = await Promise.all(
        data.map(async (r) => {
          const vehiculo = await catalogoService.getVehiculoById(r.vehiculoId).catch(() => null)
          return { ...r, vehiculo, estado: estadoReserva(r.fechaInicio, r.fechaFin) }
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
    await reservasService.cancelarReserva(id)
    setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: 'cancelada' } : r))
  }

  return { reservas, cargando, error, recargar: cargarReservas, cancelarReserva }
}
