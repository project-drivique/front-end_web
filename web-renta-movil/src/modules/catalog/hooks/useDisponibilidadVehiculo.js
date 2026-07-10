import { useEffect, useState, useCallback, useMemo } from 'react'
import { eachDayOfInterval, format, parseISO } from 'date-fns'
import { reservasService } from '../../../services/reservasService'

export function useDisponibilidadVehiculo(vehiculoId) {
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!vehiculoId) return

    let activo = true
    setCargando(true)
    setError(null)

    reservasService.getReservasPorVehiculo(vehiculoId)
      .then(data => { if (activo) setReservas(data) })
      .catch(() => { if (activo) setError('No se pudo cargar la disponibilidad') })
      .finally(() => { if (activo) setCargando(false) })

    return () => { activo = false }
  }, [vehiculoId])

  const diasOcupados = useMemo(() => {
    const set = new Set()
    reservas.forEach(r => {
      const dias = eachDayOfInterval({ start: parseISO(r.fechaInicio), end: parseISO(r.fechaFin) })
      dias.forEach(dia => set.add(format(dia, 'yyyy-MM-dd')))
    })
    return set
  }, [reservas])

  const estaOcupado = useCallback(
    (fecha) => diasOcupados.has(typeof fecha === 'string' ? fecha : format(fecha, 'yyyy-MM-dd')),
    [diasOcupados]
  )

  return { diasOcupados, estaOcupado, cargando, error }
}
