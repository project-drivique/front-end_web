import { withIdempotency } from './idempotency'
import { api } from './httpClient'
import { SUCURSALES } from '../modules/catalog/constants'
import i18n from '@/i18n'

let cache = []

const ESTADOS = {
  PENDING_SCHEDULE: 'creada',
  PENDING_DOCUMENT_REVIEW: 'creada',
  PENDING_PAYMENT: 'creada',
  CONFIRMED: 'confirmada',
  ACTIVE: 'en_curso',
  IN_PROGRESS: 'en_curso',
  COMPLETED: 'finalizada',
  CANCELLED_BY_USER: 'cancelada',
  CANCELLED_BY_TIMEOUT: 'cancelada',
  REJECTED: 'cancelada',
}

const pad = (n) => String(n).padStart(2, '0')
const fechaLocal = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const horaLocal = (iso) => {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const puntoDe = (r, tipo) => (r.deliveryPoints || []).find((p) => p.pointType === tipo)

function mapear(item) {
  const r = item.reservation
  const esEfectivo = item.paymentMethod === 'CASH'
  const pagoAprobado = item.paymentStatus === 'APPROVED'
  const sucursalEfectivo = SUCURSALES.find((s) => s.id === r.cashPaymentBranchId)?.nombre || item.branchName || ''
  const entrega = puntoDe(r, 'PICKUP')
  const devolucion = puntoDe(r, 'RETURN')
  const esDomicilio = (p) => p?.modality === 'HOME_DELIVERY'

  return {
    id: r.id,
    codigo: r.code,
    clienteNombre: r.customerName,
    clienteCorreo: r.customerEmail,
    clienteTelefono: item.customerPhone || '',
    clienteDocumento: item.customerDocument || '',
    vehiculoId: r.vehicleId,
    vehiculoNombre: r.vehicleModel,
    vehiculoPlaca: r.vehiclePlate,
    vehiculoImagen: item.vehicleImageUrl || '',
    sucursal: item.branchName || '',
    sucursalPagoEfectivo: esEfectivo ? sucursalEfectivo : '',
    fechaInicio: fechaLocal(r.pickupDate),
    fechaFin: fechaLocal(r.returnDate),
    horaInicio: horaLocal(r.pickupDate),
    horaFin: horaLocal(r.returnDate),
    estado: ESTADOS[r.status] || 'creada',
    estadoCodigo: r.status,
    totalCOP: Number(r.totalEstimated) || 0,
    total: Number(r.totalEstimated) || 0,
    contratoFirmado: Boolean(item.contractSigned),
    contratoId: item.contractId,
    pagoEstado: pagoAprobado ? 'aprobado' : 'pendiente',
    estadoPago: pagoAprobado ? 'aprobado' : 'pendiente',
    metodoPago: esEfectivo ? 'efectivo' : 'wompi',
    pasarela: esEfectivo ? 'efectivo' : 'Wompi',
    metodoPagoConfirmado: pagoAprobado && esEfectivo ? 'efectivo' : undefined,
    fechaPagoConfirmado: item.paidAt || undefined,
    codigoPagoEfectivo: r.cashPaymentCode || '',
    cashPaymentExpiresAt: r.cashPaymentExpiresAt,
    sucursalRetiro: esDomicilio(entrega) ? 'domicilio' : (entrega?.branchName || item.branchName || ''),
    sucursalDevolucion: esDomicilio(devolucion) ? 'domicilio' : (devolucion?.branchName || item.branchName || ''),
    domicilioDireccion: entrega?.address || '',
    domicilioDevolucionDireccion: devolucion?.address || '',
    domicilioBarrio: entrega?.neighborhood || '',
    domicilioCiudad: entrega?.cityName || '',
    domicilioReferencias: entrega?.referenceDetails || '',
    fechaCreacion: r.createdAt,
    reservaDetalles: {
      fechaInicio: fechaLocal(r.pickupDate),
      fechaFin: fechaLocal(r.returnDate),
      horaInicio: horaLocal(r.pickupDate),
      horaFin: horaLocal(r.returnDate),
      metodoPago: esEfectivo ? 'efectivo' : 'wompi',
      sucursalPagoEfectivo: esEfectivo ? sucursalEfectivo : '',
      sucursalRetiro: esDomicilio(entrega) ? 'domicilio' : (entrega?.branchName || item.branchName || ''),
      sucursalDevolucion: esDomicilio(devolucion) ? 'domicilio' : (devolucion?.branchName || item.branchName || ''),
    },
    // Puntos de entrega / devolución a domicilio con su conductor y estado de logística
    domicilioPuntos: (r.deliveryPoints || [])
      .filter((p) => p.modality === 'HOME_DELIVERY')
      .map((p) => ({
        tipo: p.pointType,
        id: p.id,
        direccion: p.address || '',
        barrio: p.neighborhood || '',
        ciudad: p.cityName || '',
        referencias: p.referenceDetails || '',
        conductorId: p.driverId || null,
        conductor: p.driverName || '',
        conductorTelefono: p.driverPhone || '',
        estado: p.deliveryStatus,
        deliveryPin: p.deliveryPin || '',
      })),
    // Desglose del valor calculado por el servidor
    detalle: {
      dias: r.rentalDays,
      tarifaDiaria: Number(r.vehicleDailyRate) || 0,
      subtotalVehiculo: Number(r.vehicleSubtotal) || 0,
      seguro: { nombre: r.insuranceCoverageName || '', subtotal: Number(r.breakdown?.insuranceSubtotal) || 0 },
      kilometraje: { nombre: r.mileagePlanName || '', subtotal: Number(r.breakdown?.mileageSubtotal) || 0 },
      servicios: (r.additionalServices || []).map((s) => ({ nombre: s.name, total: Number(s.subtotal) || 0 })),
      cupon: r.promotion?.code || '',
      descuento: Number(r.breakdown?.discount) || 0,
      subtotal: Number(r.breakdown?.subtotal) || 0,
      cargoAdmin: r.breakdown?.adminFee == null ? null : Number(r.breakdown.adminFee),
      tasaCargoAdmin: r.breakdown?.adminFeeRate == null ? null : Number(r.breakdown.adminFeeRate),
      iva: r.breakdown?.vat == null ? null : Number(r.breakdown.vat),
      tasaIva: r.breakdown?.vatRate == null ? null : Number(r.breakdown.vatRate),
      total: Number(r.totalEstimated) || 0,
    },
    serviciosSeleccionados: (r.additionalServices || []).map((s) => s.name),
    historialAcciones: [{ fecha: r.createdAt, accion: i18n.t('hc2.registro_de_reserva', 'Registro de reserva'), usuario: r.customerEmail }],
  }
}

function toError(error) {
  const result = new Error(error?.response?.data?.detail || error?.message || i18n.t('hc2.no_fue_posible_completar_la_operacion', 'No fue posible completar la operación.'))
  result.status = error?.response?.status
  return result
}

export const reservationManagementService = {
  async refresh() {
    const { data } = await api.get('/admin/reservations')
    cache = (Array.isArray(data) ? data : []).map(mapear)
    return this.list()
  },

  list() {
    return cache.map((reserva) => ({ ...reserva }))
  },

  async createManual(form) {
    try {
      await api.post('/admin/reservations/manual', {
        customerEmail: form.clienteCorreo,
        reservation: {
          vehicleId: form.vehiculoId,
          pickupDate: new Date(`${form.fechaInicio}T${form.horaInicio || '08:00'}:00`).toISOString(),
          returnDate: new Date(`${form.fechaFin}T${form.horaFin || '18:00'}:00`).toISOString(),
          cashPaymentBranchId: form.cashPaymentBranchId || null,
          additionalServiceIds: [],
        },
      })
    } catch (error) {
      throw toError(error)
    }
    return this.refresh()
  },

  async updateDates(id, { fechaInicio, horaInicio, fechaFin, horaFin }) {
    try {
      await api.patch(`/reservations/${id}/dates`, {
        pickupDate: new Date(`${fechaInicio}T${horaInicio || '08:00'}:00`).toISOString(),
        returnDate: new Date(`${fechaFin}T${horaFin || '18:00'}:00`).toISOString(),
      })
    } catch (error) {
      throw toError(error)
    }
    return this.refresh()
  },

  async cancel(id, motivo) {
    try {
      await api.patch(`/reservations/${id}/cancel`, { reason: motivo || i18n.t('hc2.cancelada_por_el_encargado', 'Cancelada por el encargado') })
    } catch (error) {
      throw toError(error)
    }
    return this.refresh()
  },

  async confirmCashPayment(idOrCode) {
    const search = String(idOrCode).trim().toLowerCase()
    const reserva = cache.find((r) => String(r.id).toLowerCase() === search || String(r.codigo).toLowerCase() === search)
    if (!reserva?.codigoPagoEfectivo) throw new Error('La reserva no tiene código de pago en efectivo.')
    try {
      // Un cobro en efectivo repetido (doble clic) no debe registrarse dos veces
      await withIdempotency(`cash:${reserva.codigoPagoEfectivo}`, (key) => api.post('/payments/cash/confirm', { cashPaymentCode: reserva.codigoPagoEfectivo }, { headers: { 'Idempotency-Key': key } }))
    } catch (error) {
      throw toError(error)
    }
    return this.refresh()
  },
}
