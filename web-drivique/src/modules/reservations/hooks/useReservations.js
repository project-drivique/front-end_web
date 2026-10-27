import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { reservationsService } from '../../../services/reservationsService'
import { catalogService } from '../../../services/catalogService'
import { obtenerEstadoVisible } from '../utils/reservationStatus'

const pad = (n) => String(n).padStart(2, '0')
const CON_ZONA = /(Z|[+-]\d{2}:?\d{2})$/i

// El servidor entrega los instantes en UTC (…Z). Se pasan a la hora local de la persona para mostrar la fecha y la hora
// que eligió: leer el texto sin convertir mostraba la hora UTC (cinco horas más tarde en Colombia).
const aHoraLocal = (valor) => {
  if (!valor || typeof valor !== 'string' || !valor.includes('T') || !CON_ZONA.test(valor)) return valor
  const d = new Date(valor)
  if (Number.isNaN(d.getTime())) return valor
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
}

const estadoReserva = (r) => {
  const raw = r.status || r.estado || r.rawEstado
  if (raw) {
    const visible = obtenerEstadoVisible(raw)
    if (visible) return visible
  }
  const ahora = new Date()
  const hoy = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}`
  const inicio = (aHoraLocal(r.pickupDate) || r.fechaInicio || r.reservaDetalles?.fechaInicio || '').slice(0, 10)
  const fin = (aHoraLocal(r.returnDate) || r.fechaFin || r.reservaDetalles?.fechaFin || '').slice(0, 10)
  if (fin && fin < hoy) return 'finalizada'
  if (inicio && fin && inicio <= hoy && hoy <= fin) return 'en_curso'
  return 'confirmada'
}

// Dónde se entrega y dónde se recibe el vehículo, tal como los guardó el servidor (sucursal o domicilio)
function lugaresDesdeServidor(puntos) {
  const lista = Array.isArray(puntos) ? puntos : []
  const lugares = {}
  const direccionDe = (p) => [p.address, p.cityName].filter(Boolean).join(', ')
  const retiro = lista.find((p) => String(p.pointType).toUpperCase() === 'PICKUP')
  const devolucion = lista.find((p) => String(p.pointType).toUpperCase() === 'RETURN')
  if (retiro?.modality === 'HOME_DELIVERY') {
    lugares.sucursalRetiro = 'domicilio'
    lugares.domicilioDireccion = direccionDe(retiro)
    lugares.domicilioBarrio = retiro.neighborhood || ''
    lugares.domicilioReferencias = retiro.referenceDetails || ''
  } else if (retiro?.branchName) {
    lugares.sucursalRetiro = retiro.branchName
  }
  if (devolucion?.modality === 'HOME_DELIVERY') {
    lugares.sucursalDevolucion = 'domicilio'
    lugares.domicilioDevolucionDireccion = direccionDe(devolucion)
    lugares.domicilioDevolucionBarrio = devolucion.neighborhood || ''
  } else if (devolucion?.branchName) {
    lugares.sucursalDevolucion = devolucion.branchName
  }
  return lugares
}

export function useHistorialReservas() {
  const { t } = useTranslation()
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargarReservas = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true)
    setError(null)
    try {
      const data = await reservationsService.getReservas()
      const conVehiculo = await Promise.all(
        (data || []).map(async (r) => {
          const vehiculoId = r.vehicleId || r.vehiculoId
          const vehiculoCatalog = vehiculoId ? await catalogService.getVehiculoById(vehiculoId).catch(() => null) : null
          const fechaInicio = aHoraLocal(r.pickupDate) || r.fechaInicio || r.reservaDetalles?.fechaInicio
          const fechaFin = aHoraLocal(r.returnDate) || r.fechaFin || r.reservaDetalles?.fechaFin
          const rawStatus = r.status || r.estado
          const estadoFinal = estadoReserva({ ...r, estado: rawStatus, fechaInicio, fechaFin })
          const totalVal = r.totalEstimated != null ? Number(r.totalEstimated) : (r.total != null ? Number(r.total) : (r.totalCOP != null ? Number(r.totalCOP) : 0))
          const refCode = r.code || r.codigo || r.referencia || r.id

          let eligibility = null
          if (estadoFinal === 'finalizada') {
             eligibility = await reservationsService.checkReviewEligibility(r.id)
          }

          const rawPlate = r.vehiclePlate || r.plate || r.placa || vehiculoCatalog?.placa || vehiculoCatalog?.plate || r.vehiculo?.placa || r.reservaDetalles?.placa || ''
          const vehiculoFinal = (vehiculoCatalog || r.vehiculo || r.vehicleModel) ? {
            ...(vehiculoCatalog || r.vehiculo || {}),
            id: vehiculoId || vehiculoCatalog?.id || r.vehiculo?.id,
            nombre: vehiculoCatalog?.nombre || r.vehiculo?.nombre || r.vehicleModel || '',
            marca: vehiculoCatalog?.marca || r.vehiculo?.marca || r.vehicleModel || '',
            placa: rawPlate,
            sucursal: vehiculoCatalog?.sucursal || r.sucursal || r.vehiculo?.sucursal || '',
          } : null

          const rawCreatedAt = r.createdAt || r.created_at || r.fechaCreacion || null

          return {
            ...r,
            ...lugaresDesdeServidor(r.deliveryPoints),
            id: r.id,
            createdAt: rawCreatedAt,
            codigo: refCode,
            referencia: refCode,
            total: totalVal,
            totalCOP: totalVal,
            totalEstimated: totalVal,
            fechaInicio,
            fechaFin,
            horaInicio: fechaInicio && fechaInicio.includes('T') ? fechaInicio.split('T')[1].slice(0, 5) : (r.horaInicio || '08:00'),
            horaFin: fechaFin && fechaFin.includes('T') ? fechaFin.split('T')[1].slice(0, 5) : (r.horaFin || '18:00'),
            vehiculo: vehiculoFinal,
            estadoRaw: rawStatus || null,
            status: rawStatus,
            estado: estadoFinal,
            eligibility
          }
        })
      )
      setReservas(conVehiculo
        .sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.fechaInicio ? new Date(a.fechaInicio).getTime() : 0)
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.fechaInicio ? new Date(b.fechaInicio).getTime() : 0)
          return timeB - timeA
        }))
    } catch (err) {
      console.error('[useHistorialReservas] Error:', err)
      setError(t('reservas.error', 'No se pudieron cargar las reservas'))
    } finally {
      if (!silencioso) setCargando(false)
    }
  }, [t])

  useEffect(() => {
    cargarReservas()
  }, [cargarReservas])

  // Polling automático cada 4 segundos cuando hay reservas pendientes de validación de documentos o de pago
  useEffect(() => {
    const tienePendientes = reservas.some(r => {
      const st = String(r.status || r.estado || r.estadoRaw || '').toUpperCase()
      return st.includes('PENDING') || st.includes('PENDIENTE')
    })
    if (!tienePendientes) return

    const interval = setInterval(() => {
      cargarReservas(true)
    }, 4000)

    return () => clearInterval(interval)
  }, [reservas, cargarReservas])

  const cancelarReserva = async (id) => {
    await reservationsService.cancelarReserva(id)
    setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: 'cancelada' } : r))
  }

  const guardarValoracion = async (id, valoracion) => {
    const guardada = await reservationsService.guardarValoracion(id, valoracion)
    setReservas(prev => prev.map(r => r.id === id
      ? { ...r, valoracion: guardada, eligibility: { ...(r.eligibility || {}), canReviewVehicle: false, vehicleReview: { rating: valoracion.estrellas, comment: valoracion.comentario || '' } } }
      : r))
    return guardada
  }

  const guardarResenaSucursal = async (id, branchId, resena) => {
    const guardada = await reservationsService.guardarResenaSucursal(id, branchId, resena)
    setReservas(prev => prev.map(r => r.id === id
      ? { ...r, eligibility: { ...(r.eligibility || {}), canReviewBranch: false, branchReview: { rating: resena.estrellas, comment: resena.comentario || '' } } }
      : r))
    return guardada
  }

  return { reservas, cargando, error, recargar: cargarReservas, cancelarReserva, guardarValoracion, guardarResenaSucursal }
}
