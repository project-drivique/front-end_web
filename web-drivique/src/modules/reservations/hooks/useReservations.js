import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { reservationsService } from '../../../services/reservationsService'
import { catalogService } from '../../../services/catalogService'
import { obtenerEstadoVisible } from '../utils/reservationStatus'

const estadoReserva = (r) => {
  if (r.estado) {
    return obtenerEstadoVisible(r.estado)
  }
  const hoy = new Date().toISOString().split('T')[0]
  const inicio = r.fechaInicio || r.reservaDetalles?.fechaInicio
  const fin = r.fechaFin || r.reservaDetalles?.fechaFin
  if (fin < hoy) return 'finalizada'
  if (inicio <= hoy && hoy <= fin) return 'en_curso'
  return 'confirmada'
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
      const valoraciones = reservationsService.getValoracionesLocales()
      setReservas(conVehiculo
        .map(r => ({ ...r, valoracion: valoraciones[r.id] || r.valoracion || null }))
        .sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio)))
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

  const guardarValoracion = async (id, valoracion) => {
    const guardada = await reservationsService.guardarValoracion(id, valoracion)
    setReservas(prev => prev.map(r => r.id === id ? { ...r, valoracion: guardada } : r))
    return guardada
  }

  return { reservas, cargando, error, recargar: cargarReservas, cancelarReserva, guardarValoracion }
}
