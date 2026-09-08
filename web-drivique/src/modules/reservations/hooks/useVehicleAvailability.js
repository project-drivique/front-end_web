import { useEffect, useState, useCallback, useMemo } from 'react'
import { eachDayOfInterval, format, parseISO } from 'date-fns'
import { reservationsService } from '../../../services/reservationsService'

export function useDisponibilidadVehiculo(vehiculoId) {
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!vehiculoId) return

    let activo = true
    setCargando(true)
    setError(null)

    reservationsService.getReservasPorVehiculo(vehiculoId)
      .then(data => { if (activo) setReservas(data) })
      .catch(() => { if (activo) setError('No se pudo cargar la disponibilidad') })
      .finally(() => { if (activo) setCargando(false) })

    return () => { activo = false }
  }, [vehiculoId])

  const diasOcupados = useMemo(() => {
    const set = new Set()
    if (!Array.isArray(reservas)) return set
    reservas.forEach(r => {
      try {
        const fInicio = r?.reservaDetalles?.fechaInicio || r?.fechaInicio
        const fFin = r?.reservaDetalles?.fechaFin || r?.fechaFin
        if (!fInicio || !fFin) return
        const dStart = parseISO(fInicio)
        const dEnd = parseISO(fFin)
        if (isNaN(dStart.getTime()) || isNaN(dEnd.getTime()) || dStart > dEnd) return
        const dias = eachDayOfInterval({ start: dStart, end: dEnd })
        dias.forEach(dia => set.add(format(dia, 'yyyy-MM-dd')))
      } catch (err) {
        console.warn('Error calculando dias ocupados de reserva', err)
      }
    })
    return set
  }, [reservas])

  const estaOcupado = useCallback(
    (fecha) => {
      try {
        if (!fecha) return false
        return diasOcupados.has(typeof fecha === 'string' ? fecha : format(fecha, 'yyyy-MM-dd'))
      } catch {
        return false
      }
    },
    [diasOcupados]
  )

  return { diasOcupados, estaOcupado, cargando, error }
}
